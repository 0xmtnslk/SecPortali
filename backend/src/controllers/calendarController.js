const { query } = require('../config/database');

/**
 * Generates automated events for assets based on their maintenance periods and periodic control dates.
 */
const generateAutomatedEvents = (assets, startDate, endDate, existingRecords) => {
  const automatedEvents = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  assets.forEach(asset => {
    // --- 1. Periodic Controls ---
    if (asset.last_periodic_control_date || asset.periodic_control_period) {
      const lastDate = asset.last_periodic_control_date ? new Date(asset.last_periodic_control_date) : new Date(asset.created_at);
      let nextControl = new Date(lastDate);
      
      // Default to 1 year if period is not specified or recognized
      nextControl.setFullYear(nextControl.getFullYear() + 1);

      if (nextControl >= start && nextControl <= end) {
        // Check if a record already exists for this periodic control
        const isPlanned = existingRecords.some(r => 
          r.asset_id === asset.id && 
          r.type === 'periodic_check' && 
          r.start_date === nextControl.toISOString().split('T')[0]
        );

        automatedEvents.push({
          id: `auto-pc-${asset.id}`,
          asset_id: asset.id,
          start_date: nextControl.toISOString().split('T')[0],
          end_date: nextControl.toISOString().split('T')[0],
          type: 'periodic_check',
          status: isPlanned ? 'planned' : 'pending',
          priority: 'high',
          asset_name: asset.name,
          asset_code: asset.asset_code,
          facility_name: asset.facility_name,
          title: `P. Kontrol: ${asset.name}`,
          is_automated: true,
          is_planned: isPlanned
        });
      }
    }

    // --- 2. Maintenance Planning Suggestion ---
    // If asset has a period but NO active maintenance plan, suggest an event
    const hasPlan = asset.has_plan;
    const period = asset.maintenance_period;

    if (!hasPlan && period) {
      // Logic to suggest a date. For now, let's suggest the middle of the month or distributed.
      // We'll generate a "Planning Needed" event if no record exists in the range.
      const hasRecordInRange = existingRecords.some(r => r.asset_id === asset.id && r.type === 'maintenance');
      
      if (!hasRecordInRange) {
        // Just as a placeholder for the first month in range to show "Needs Planning"
        const suggestedDate = new Date(Math.max(start.getTime(), new Date().getTime()));
        suggestedDate.setDate(15); // Middle of month

        if (suggestedDate >= start && suggestedDate <= end) {
          automatedEvents.push({
            id: `need-plan-${asset.id}`,
            asset_id: asset.id,
            start_date: suggestedDate.toISOString().split('T')[0],
            end_date: suggestedDate.toISOString().split('T')[0],
            type: 'maintenance',
            status: 'unplanned',
            priority: 'medium',
            asset_name: asset.name,
            asset_code: asset.asset_code,
            facility_name: asset.facility_name,
            title: `Plan Bekliyor: ${asset.name}`,
            description: `Periyot: ${period}`,
            is_automated: true,
            is_planned: false
          });
        }
      }
    }
  });

  return automatedEvents;
};

const getCalendarEvents = async (req, res) => {
  try {
    const { start_date, end_date, facility_id } = req.query;
    if (!start_date || !end_date) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    const params = [start_date, end_date];
    let facilityFilter = '';
    if (facility_id) {
      facilityFilter = `AND f.id = $3`;
      params.push(facility_id);
    }

    // 1. Fetch Existing Records (Maintenance & Faults)
    const recordsQuery = `
      SELECT * FROM (
        SELECT 
          mr.id,
          mr.asset_id,
          mr.scheduled_date as start_date,
          mr.scheduled_date as end_date,
          'maintenance' as type,
          mr.status,
          mr.priority,
          a.name as asset_name,
          a.asset_code,
          f.name as facility_name,
          'Bakım: ' || a.name as title,
          false as is_automated,
          true as is_planned
        FROM eams_maintenance_records mr
        JOIN eams_assets a ON mr.asset_id = a.id
        JOIN core_facilities f ON a.facility_id = f.id
        WHERE f.is_active = true AND mr.scheduled_date BETWEEN $1 AND $2 ${facilityFilter.replace('f.id', 'f.id')}
        
        UNION ALL
        
        SELECT 
          fr.id,
          fr.asset_id,
          fr.created_at::date as start_date,
          COALESCE(fr.resolution_date::date, (fr.created_at + INTERVAL '7 days')::date) as end_date,
          'fault_request' as type,
          fr.status,
          fr.priority,
          a.name as asset_name,
          a.asset_code,
          f.name as facility_name,
          'Arıza: ' || fr.title as title,
          false as is_automated,
          true as is_planned
        FROM eams_fault_requests fr
        LEFT JOIN eams_assets a ON fr.asset_id = a.id
        JOIN core_facilities f ON fr.facility_id = f.id
        WHERE f.is_active = true AND fr.created_at BETWEEN $1 AND $2 ${facilityFilter.replace('f.id', 'f.id')}
          AND fr.status NOT IN ('cancelled')
      ) as combined
      ORDER BY start_date ASC
    `;

    const recordsResult = await query(recordsQuery, params);

    // 2. Fetch Assets for Automated Generation
    const assetsQuery = `
      SELECT 
        a.id, a.name, a.asset_code, a.last_periodic_control_date, a.periodic_control_period, 
        a.maintenance_period, a.created_at,
        f.name as facility_name,
        EXISTS(SELECT 1 FROM eams_maintenance_plans mp WHERE mp.asset_id = a.id AND mp.is_active = true) as has_plan
      FROM eams_assets a
      JOIN core_facilities f ON a.facility_id = f.id
      WHERE a.is_active = true AND f.is_active = true ${facilityFilter}
    `;
    
    const assetsResult = await query(assetsQuery, facility_id ? [facility_id] : []);
    
    // 3. Generate Automated Events
    const automatedEvents = generateAutomatedEvents(assetsResult.rows, start_date, end_date, recordsResult.rows);

    // 4. Combine and Return
    const allEvents = [...recordsResult.rows, ...automatedEvents];
    
    res.json(allEvents);
  } catch (error) {
    console.error('Get calendar events error:', error);
    res.status(500).json({ error: 'Failed to get calendar events' });
  }
};

const getEventsByDateRange = getCalendarEvents; // Alias for consistency

const getUpcomingEvents = async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const start_date = new Date().toISOString().split('T')[0];
    const end_date = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    req.query.start_date = start_date;
    req.query.end_date = end_date;
    
    return getCalendarEvents(req, res);
  } catch (error) {
    console.error('Get upcoming events error:', error);
    res.status(500).json({ error: 'Failed to get upcoming events' });
  }
};

const getEventsByType = async (req, res) => {
  req.query.type = req.params.type;
  return getCalendarEvents(req, res);
};

const getEventsByFacility = async (req, res) => {
  req.query.facility_id = req.params.facilityId;
  return getCalendarEvents(req, res);
};

module.exports = {
  getCalendarEvents,
  getEventsByDateRange,
  getUpcomingEvents,
  getEventsByType,
  getEventsByFacility
};

