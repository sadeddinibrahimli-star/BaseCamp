const prisma = require('../prisma/client');
function requireLogin(req, res, next) {
    if (!req.session.email) {
        return res.redirect('/');
    }
    next();
}

async function requireAdmin(req, res, next) {
    if (!req.session.email) {
        return res.redirect('/home');
    }

    const user = await prisma.user.findUnique({
        where: { email: req.session.email },
        select: { is_admin: true }
    });

    if (!user || !user.is_admin) {
        return res.redirect('/home');
    }

    next();
}

module.exports = { requireLogin, requireAdmin };