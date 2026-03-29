const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../../../middleware/auth');
const checklistController = require('../../../controllers/checklistController');

// ============================================================================
// CHECKLIST SETTINGS ROUTES
// These routes require Admin or Manager roles
// ============================================================================

// Checklist Templates
router.get('/templates', auth, authorize('Admin', 'Manager'), checklistController.getAllChecklistTemplates);
router.get('/templates/:id', auth, authorize('Admin', 'Manager'), checklistController.getChecklistTemplateById);
router.post('/templates', auth, authorize('Admin', 'Manager'), checklistController.createChecklistTemplate);
router.put('/templates/:id', auth, authorize('Admin', 'Manager'), checklistController.updateChecklistTemplate);
router.delete('/templates/:id', auth, authorize('Admin', 'Manager'), checklistController.deleteChecklistTemplate);

// Checklist Items
router.post('/templates/:id/items', auth, authorize('Admin', 'Manager'), checklistController.addChecklistItem);
router.put('/items/:itemId', auth, authorize('Admin', 'Manager'), checklistController.updateChecklistItem);
router.delete('/items/:itemId', auth, authorize('Admin', 'Manager'), checklistController.deleteChecklistItem);
router.put('/templates/:id/items/reorder', auth, authorize('Admin', 'Manager'), checklistController.reorderChecklistItems);

// Assignment Rules
router.get('/assignment-rules', auth, authorize('Admin', 'Manager'), checklistController.getAllAssignmentRules);
router.post('/assignment-rules', auth, authorize('Admin', 'Manager'), checklistController.createAssignmentRule);
router.delete('/assignment-rules/:id', auth, authorize('Admin', 'Manager'), checklistController.deleteAssignmentRule);
router.get('/assignment-rules/preview', auth, authorize('Admin', 'Manager'), checklistController.previewApplicableChecklists);

// ============================================================================
// WORK ORDER CHECKLIST ROUTES (Integration with Maintenance)
// These routes require authentication and appropriate roles
// ============================================================================

// Generate checklists for a maintenance record
router.post('/work-orders/:id/checklists/generate', auth, authorize('Admin', 'Manager', 'Technical Responsible'), checklistController.generateWorkOrderChecklists);

// Get all checklists for a maintenance record
router.get('/work-orders/:id/checklists', auth, checklistController.getWorkOrderChecklists);

// Get checklist summary for a maintenance record
router.get('/work-orders/:id/checklists/summary', auth, checklistController.getWorkOrderChecklistSummary);

// Save checklist responses
router.post('/work-orders/:id/checklists/:checklistId/responses', auth, checklistController.saveChecklistResponses);

// Update checklist status
router.put('/work-orders/:id/checklists/:checklistId/status', auth, checklistController.updateChecklistStatus);

module.exports = router;
