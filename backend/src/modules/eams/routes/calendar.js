const express = require('express');
const router = express.Router();
const calendarController = require('../../../controllers/calendarController');
const { auth } = require('../../../middleware/auth');

// All routes require authentication
router.use(auth);

// Get calendar events
router.get('/', calendarController.getCalendarEvents);

// Get calendar events by date range
router.get('/range', calendarController.getEventsByDateRange);

// Get calendar events by type
router.get('/type/:type', calendarController.getEventsByType);

// Get calendar events by facility
router.get('/facility/:facilityId', calendarController.getEventsByFacility);

// Get upcoming events
router.get('/upcoming', calendarController.getUpcomingEvents);

module.exports = router;
