const express = require('express');
const router = express.Router();
const { requireLogin, requireAdmin } = require('../middleware/auth');
const adminController = require('../controllers/adminController');

router.get('/admin', requireLogin, requireAdmin, adminController.showAdminPage);
router.get('/api/users', requireLogin, requireAdmin, adminController.getAllUsers);
router.post('/user/:id/set-admin', requireLogin, requireAdmin, adminController.setAdmin);
router.post('/user/:id/remove-admin', requireLogin, requireAdmin, adminController.removeAdmin);

module.exports = router;