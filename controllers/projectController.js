const path = require('path');
const fs = require('fs');
const prisma = require('../prisma/client');

// --- Project CRUD ---

exports.showProjectsPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/project.html'));
};

exports.showNewProjectPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/project-new.html'));
};

exports.createProject = async (req, res) => {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).send('Project name cannot be empty.');
    }

    await prisma.project.create({
        data: {
            name: name.trim(),
            description: description ? description.trim() : '',
            owner_email: req.session.email
        }
    });
    res.redirect('/projects');
};

exports.getProject = async (req, res) => {
    const project = await prisma.project.findFirst({
        where: {
            id: Number(req.params.id),
            OR: [
                { owner_email: req.session.email },
                { members: { some: { user_email: req.session.email } } }
            ]
        }
    });
    if (!project) return res.status(404).send('Project not found.');
    res.json(project);
};

exports.showProjectPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/project-show.html'));
};

exports.editProject = async (req, res) => {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).send('Project name cannot be empty.');
    }

    const project = await prisma.project.findFirst({
        where: { id: Number(req.params.id), owner_email: req.session.email }
    });

    if (!project) {
        return res.status(403).send('Only the project owner can edit this project.');
    }

    await prisma.project.update({
        where: { id: project.id },
        data: { name: name.trim(), description: description ? description.trim() : '' }
    });
    res.redirect('/projects');
};

exports.deleteProject = async (req, res) => {
    const project = await prisma.project.findFirst({
        where: { id: Number(req.params.id), owner_email: req.session.email }
    });

    if (!project) {
        return res.status(403).send('Only the project owner can delete this project.');
    }
    const threads = await prisma.thread.findMany({ where: { project_id: project.id } });
    for (const thread of threads) {
        await prisma.message.deleteMany({ where: { thread_id: thread.id } });
    }
    await prisma.thread.deleteMany({ where: { project_id: project.id } });

    await prisma.projectMember.deleteMany({ where: { project_id: project.id } });
    await prisma.attachment.deleteMany({ where: { project_id: project.id } });

    await prisma.project.delete({ where: { id: project.id } });

    res.redirect('/projects');
};

exports.getMyProjects = async (req, res) => {
    const projects = await prisma.project.findMany({
        where: {
            OR: [
                { owner_email: req.session.email },
                { members: { some: { user_email: req.session.email } } }
            ]
        }
    });
    res.json(projects);
};

// --- Members ---

exports.addMember = async (req, res) => {
    const projectId = Number(req.params.id);
    const { email } = req.body;

    const project = await prisma.project.findFirst({
        where: { id: projectId, owner_email: req.session.email }
    });

    if (!project) {
        return res.status(403).send('Only the project owner can add members.');
    }

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
        return res.status(400).send('No user exists with that email.');
    }

    try {
        await prisma.projectMember.create({
            data: { project_id: projectId, user_email: email }
        });
    } catch (err) {
        return res.status(400).send('That user is already a member.');
    }

    res.json({ success: true });
};

exports.getMembers = async (req, res) => {
    const projectId = Number(req.params.id);

    const members = await prisma.projectMember.findMany({
        where: { project_id: projectId }
    });

    const membersWithNames = await Promise.all(
        members.map(async (member) => {
            const user = await prisma.user.findUnique({
                where: { email: member.user_email },
                select: { name: true }
            });
            return {
                email: member.user_email,
                name: user ? user.name : '(unknown user)'
            };
        })
    );

    res.json(membersWithNames);
};

exports.removeMember = async (req, res) => {
    const projectId = Number(req.params.id);
    const { email } = req.body;

    const project = await prisma.project.findFirst({
        where: { id: projectId, owner_email: req.session.email }
    });

    if (!project) {
        return res.status(403).send('Only the project owner can remove members.');
    }

    await prisma.projectMember.deleteMany({
        where: { project_id: projectId, user_email: email }
    });

    res.json({ success: true });
};

exports.leaveProject = async (req, res) => {
    const projectId = Number(req.params.id);

    await prisma.projectMember.deleteMany({
        where: { project_id: projectId, user_email: req.session.email }
    });

    res.redirect('/projects');
};

// --- Attachments ---

exports.uploadAttachment = async (req, res) => {
    const projectId = Number(req.params.id);

    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { owner_email: req.session.email },
                { members: { some: { user_email: req.session.email } } }
            ]
        }
    });

    if (!project) {
        return res.status(403).send('You do not have access to this project.');
    }

    const format = req.file.originalname.split('.').pop();

    await prisma.attachment.create({
        data: {
            filename: req.file.filename,
            format,
            project_id: projectId,
            uploaded_by: req.session.email
        }
    });

    res.json({ success: true });
};

exports.getAttachments = async (req, res) => {
    const attachments = await prisma.attachment.findMany({
        where: { project_id: Number(req.params.id) }
    });
    res.json(attachments);
};

exports.deleteAttachment = async (req, res) => {
    const attachment = await prisma.attachment.findUnique({
        where: { id: Number(req.params.id) }
    });

    if (!attachment) return res.status(404).send('Not found.');

    const project = await prisma.project.findUnique({ where: { id: attachment.project_id } });
    if (attachment.uploaded_by !== req.session.email && project.owner_email !== req.session.email) {
        return res.status(403).send('You cannot delete this attachment.');
    }

    const filePath = path.join(__dirname, '../public/uploads', attachment.filename);
    fs.unlink(filePath, (err) => {
        if (err) console.error('Failed to delete file from disk:', err.message);
    });

    await prisma.attachment.delete({ where: { id: attachment.id } });

    res.json({ success: true });
};