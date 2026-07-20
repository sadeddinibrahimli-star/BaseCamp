const express = require('express');
const path = require('path');
const router = express.Router();
const multer = require('multer');
const { requireLogin } = require('../middleware/auth');
const projectController = require('../controllers/projectController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueName + extension);
    }
});
const upload = multer({ storage });

// Project CRUD
router.get('/projects', requireLogin, projectController.showProjectsPage);
router.get('/project-new', requireLogin, projectController.showNewProjectPage);
router.post('/project-new', requireLogin, projectController.createProject);
router.get('/api/projects', requireLogin, projectController.getMyProjects);
router.get('/api/project/:id', requireLogin, projectController.getProject);
router.get('/project/:id', requireLogin, projectController.showProjectPage);
router.post('/project/:id/edit', requireLogin, projectController.editProject);
router.post('/project/:id/delete', requireLogin, projectController.deleteProject);

// Members
router.post('/project/:id/add-member', requireLogin, projectController.addMember);
router.get('/api/project/:id/members', requireLogin, projectController.getMembers);
router.post('/project/:id/remove-member', requireLogin, projectController.removeMember);
router.post('/project/:id/leave', requireLogin, projectController.leaveProject);

// Attachments
router.post('/project/:id/attachment', requireLogin, upload.single('file'), projectController.uploadAttachment);
router.get('/api/project/:id/attachments', requireLogin, projectController.getAttachments);
router.post('/attachment/:id/delete', requireLogin, projectController.deleteAttachment);

module.exports = router;