const path = require('path');
const prisma = require('../prisma/client');

async function hasProjectAccess(projectId, email) {
    const project = await prisma.project.findFirst({
        where: {
            id: projectId,
            OR: [
                { owner_email: email },
                { members: { some: { user_email: email } } }
            ]
        }
    });
    return project;
}

// --- Threads ---

exports.createThread = async (req, res) => {
    const projectId = Number(req.params.id);
    const { title } = req.body;

    const project = await prisma.project.findFirst({
        where: { id: projectId, owner_email: req.session.email }
    });

    if (!project) {
        return res.status(403).send('Only the project owner can create a thread.');
    }

    if (!title || !title.trim()) {
        return res.status(400).send('Thread title cannot be empty.');
    }

    await prisma.thread.create({
        data: { title: title.trim(), project_id: projectId, created_by: req.session.email }
    });

    res.json({ success: true });
};

exports.getThreads = async (req, res) => {
    const project = await hasProjectAccess(Number(req.params.id), req.session.email);
    if (!project) return res.status(403).send('No access to this project.');

    const threads = await prisma.thread.findMany({
        where: { project_id: Number(req.params.id) }
    });
    res.json(threads);
};

exports.editThread = async (req, res) => {
    const thread = await prisma.thread.findUnique({ where: { id: Number(req.params.id) } });
    if (!thread) return res.status(404).send('Thread not found.');

    const project = await prisma.project.findUnique({ where: { id: thread.project_id } });
    if (project.owner_email !== req.session.email) {
        return res.status(403).send('Only the project owner can edit threads.');
    }

    const { title } = req.body;
    if (!title || !title.trim()) {
        return res.status(400).send('Thread title cannot be empty.');
    }

    await prisma.thread.update({
        where: { id: thread.id },
        data: { title: title.trim() }
    });

    res.json({ success: true });
};

exports.deleteThread = async (req, res) => {
    const thread = await prisma.thread.findUnique({ where: { id: Number(req.params.id) } });
    if (!thread) return res.status(404).send('Thread not found.');

    const project = await prisma.project.findUnique({ where: { id: thread.project_id } });
    if (project.owner_email !== req.session.email) {
        return res.status(403).send('Only the project owner can delete threads.');
    }

    await prisma.message.deleteMany({ where: { thread_id: thread.id } });
    await prisma.thread.delete({ where: { id: thread.id } });

    res.json({ success: true });
};

exports.showThreadPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/thread-show.html'));
};

exports.getThread = async (req, res) => {
    const thread = await prisma.thread.findUnique({ where: { id: Number(req.params.id) } });
    if (!thread) return res.status(404).send('Thread not found.');

    const project = await hasProjectAccess(thread.project_id, req.session.email);
    if (!project) return res.status(403).send('No access to this thread.');

    const messages = await prisma.message.findMany({ where: { thread_id: thread.id } });

    res.json({ thread, messages, isOwner: project.owner_email === req.session.email });
};

// --- Messages ---

exports.createMessage = async (req, res) => {
    const thread = await prisma.thread.findUnique({ where: { id: Number(req.params.id) } });
    if (!thread) return res.status(404).send('Thread not found.');

    const project = await hasProjectAccess(thread.project_id, req.session.email);
    if (!project) return res.status(403).send('No access to this thread.');

    const { content } = req.body;
    if (!content || !content.trim()) {
        return res.status(400).send('Message cannot be empty.');
    }

    await prisma.message.create({
        data: { content: content.trim(), thread_id: thread.id, author: req.session.email }
    });

    res.json({ success: true });
};

exports.editMessage = async (req, res) => {
    const message = await prisma.message.findUnique({ where: { id: Number(req.params.id) } });
    if (!message) return res.status(404).send('Message not found.');

    if (message.author !== req.session.email) {
        return res.status(403).send('You can only edit your own messages.');
    }

    const { content } = req.body;
    if (!content || !content.trim()) {
        return res.status(400).send('Message cannot be empty.');
    }

    await prisma.message.update({
        where: { id: message.id },
        data: { content: content.trim() }
    });

    res.json({ success: true });
};

exports.deleteMessage = async (req, res) => {
    const message = await prisma.message.findUnique({ where: { id: Number(req.params.id) } });
    if (!message) return res.status(404).send('Message not found.');

    if (message.author !== req.session.email) {
        return res.status(403).send('You can only delete your own messages.');
    }

    await prisma.message.delete({ where: { id: message.id } });
    res.json({ success: true });
};