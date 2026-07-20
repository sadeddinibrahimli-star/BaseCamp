const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');
const authController = require('../controllers/authController');

router.get('/', authController.showSignIn);
router.get('/sign-up', authController.showSignUp);
router.post('/sign-in', authController.signIn);
router.post('/sign-up', authController.signUp);
router.get('/profile', requireLogin, authController.showProfile);
router.post('/delete-account', authController.deleteAccount);
router.post('/logout-account', authController.logout);
router.get('/api/me', requireLogin, authController.getMe);
router.get('/home', requireLogin, authController.showHome);

module.exports = router;