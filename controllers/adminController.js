const path = require('path');
const prisma = require('../prisma/client');

exports.showAdminPage = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/admin.html'));
};

exports.getAllUsers = async (req, res) => {
    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, is_admin: true }
    });
    res.json(users);
};

exports.setAdmin = async (req, res) => {
    await prisma.user.update({
        where: { id: Number(req.params.id) },
        data: { is_admin: 1 }
    });
    res.redirect('/admin');
};

exports.removeAdmin = async (req, res) => {
    const demotedUser = await prisma.user.update({
        where: { id: Number(req.params.id) },
        data: { is_admin: 0 }
    });

    if (demotedUser.email === req.session.email) {
        req.session.isAdmin = false;
        return res.redirect('/home');
    }
    res.redirect('/admin');
};