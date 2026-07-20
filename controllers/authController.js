const path = require('path');
const prisma = require('../prisma/client');
const bcrypt = require('bcrypt');

exports.showSignIn = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/sign-in.html'));
};

exports.showSignUp = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/sign-up.html'));
};

exports.signIn = async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return res.status(401).json({ error: 'No account with that email.' });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
        return res.status(401).json({ error: 'Wrong password.' });
    }

    req.session.email = user.email;
    req.session.isAdmin = !!user.is_admin;
    res.json({ success: true });
};

exports.signUp = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.create({
            data: { name: username, email, password: hashedPassword }
        });
        res.json({ success: true });
    } catch (err) {
        res.status(400).json({ error: 'That email is already registered.' });
    }
};

exports.showProfile = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/profile.html'));
};

exports.deleteAccount = async (req, res) => {
    const email = req.session.email;
    if (!email) {
        return res.status(401).send('You must be logged in.');
    }
    await prisma.user.delete({ where: { email } });
    req.session.destroy(() => res.redirect('/'));
};

exports.logout = (req, res) => {
    const email = req.session.email;
    if (!email) {
        return res.status(401).send('You must be logged in.');
    }
    req.session.destroy(() => res.redirect('/'));
};

exports.getMe = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { email: req.session.email },
        select: { name: true, email: true, is_admin: true }
    });
    res.json(user);
};

exports.showHome = (req, res) => {
    res.sendFile(path.join(__dirname, '../public/home.html'));
};