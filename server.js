const express = require('express');
const app = express();
const session = require('express-session');
app.use(express.json());
app.use(express.static('public'));
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const adminRoutes = require('./routes/admin');
const threadRoutes = require('./routes/threads');
require('dotenv').config();
const PORT = 3000;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(express.urlencoded({ extended: true }));

app.use('/', authRoutes);
app.use('/', projectRoutes);
app.use('/', adminRoutes);
app.use('/', threadRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});