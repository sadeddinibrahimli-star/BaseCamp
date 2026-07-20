const express = require('express');
const router = express.Router();
const { requireLogin } = require('../middleware/auth');
const threadController = require('../controllers/threadController');

// Threads
router.post('/project/:id/thread', requireLogin, threadController.createThread);
router.get('/api/project/:id/threads', requireLogin, threadController.getThreads);
router.post('/thread/:id/edit', requireLogin, threadController.editThread);
router.post('/thread/:id/delete', requireLogin, threadController.deleteThread);
router.get('/thread/:id', requireLogin, threadController.showThreadPage);
router.get('/api/thread/:id', requireLogin, threadController.getThread);

// Messages
router.post('/thread/:id/message', requireLogin, threadController.createMessage);
router.post('/message/:id/edit', requireLogin, threadController.editMessage);
router.post('/message/:id/delete', requireLogin, threadController.deleteMessage);

module.exports = router;