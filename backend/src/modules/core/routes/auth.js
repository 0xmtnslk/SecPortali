const express = require('express');
const router = express.Router();
const authController = require('../../../controllers/authController');
const { auth } = require('../../../middleware/auth');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.get('/me', auth, authController.getCurrentUser);
router.put('/me', auth, auth, authController.updateCurrentUser);
router.put('/me/password', auth, auth, authController.changePassword);

// Debug logging
router.use((req, res, next) => {
  console.log(`Auth route accessed: ${req.method} ${req.originalUrl}`);
  next();
});

module.exports = router;
