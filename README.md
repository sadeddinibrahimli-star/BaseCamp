# Welcome to My Basecamp 1
***

## Task
Basecamp is a well-known web-based project management tool. This project recreates the foundational first layer of it: a system where users can create accounts, log in, manage their own projects, collaborate with other users on shared projects, and where certain users can be granted administrator privileges to manage the rest of the user base.

The core challenge was building a complete, secure authentication and authorization system from scratch — handling user sessions, protecting routes so only logged-in (or logged-in-and-admin) users can reach them, safely storing passwords, correctly modeling relationships between users and projects (ownership vs. membership), and giving each user visibility only into data they're actually allowed to see, all backed by a real, relational database.

## Description
The application is built with Node.js and Express on the backend, SQLite as the database (accessed through the Prisma ORM), and plain HTML/CSS/JavaScript on the frontend.

Key features implemented:
- **User Registration** — users can create an account, view their own profile, and delete their account.
- **Sessions** — users can sign in and sign out; login state is tracked server-side with `express-session`.
- **Role Permissions** — users can be granted or have revoked an admin role. Admins have access to a dedicated panel listing every user, with the ability to promote or demote any account. Admin status is checked fresh against the database on every request, so a change in permissions takes effect immediately without requiring the affected user to log out and back in.
- **Projects** — logged-in users can create, view, edit, and delete their own projects.
- **Project Membership** — a project owner can add other registered users to their project, and remove them again. Any user added to a project can view it and see the full member list, but only the owner can edit, delete, or manage membership of the project. A member who no longer wants access can leave the project themselves.

Passwords are hashed with bcrypt before being stored — plain-text passwords are never saved to the database. Every protected route is guarded by middleware (`requireLogin`, `requireAdmin`) that checks the user's session (and, for admin status, the database) before allowing access. Every project-related database query is scoped to either the project's owner or its members, so users can only see and manage data they actually have a relationship to.

Data access goes through Prisma ORM **v6**, using a schema (`prisma/schema.prisma`) that defines three related models: `User`, `Project`, and `ProjectMember` — the last of which forms a many-to-many relationship between users and projects, so a project can have multiple members and a user can belong to multiple projects.

> **Note:** this project depends specifically on Prisma **6.x**. Prisma 7 introduced breaking changes to how the database connection is configured (it now requires a driver adapter instead of a plain connection URL in the schema file), so installing the latest Prisma version instead of v6 will cause setup to fail.
So first use:
```
npm install prisma@6 @prisma/client@6
```
## Installation
1. Make sure you have [Node.js](https://nodejs.org/) version 18 or newer installed. This project will not run correctly on older versions (e.g. Node 16), since some dependencies require native compilation that fails on outdated Node versions.
2. Clone or download this project and open it in a code editor such as VS Code, then open its integrated terminal (rather than an online/cloud terminal that may have an outdated Node version pre-installed).
3. From the project root, install dependencies:
```
npm install
```
This installs Prisma 6.x, as pinned in `package.json` — do not run `npm install prisma@latest`, as that will install the incompatible Prisma 7.
4. Create a `.env` file in the project root (this file is not included in the repository, since `.env` files are excluded via `.gitignore`) containing:
```
echo DATABASE_URL="file:./user-data.db" > .env
DATABASE_URL="file:./user-data.db"
SESSION_SECRET=your-own-random-string-here
```
5. Generate the Prisma client and sync the database schema:
```
npx prisma generate
npx prisma db push
```

## Usage
Start the server from the project root:
```
node server.js
```
You should see:
```
Server is running on http://localhost:3000
```
Then open `http://localhost:3000` in your browser. From there you can:
- Sign up for a new account
- Log in
- Create, view, edit, and delete your own projects from the Projects page
- Add or remove members on a project you own; leave a project you were added to
- View and manage your account on the Profile page
- (Admins only) Visit `/admin` to view all users and manage admin roles

To promote your first user to admin (there is no in-app way to create the very first admin, since normally an existing admin promotes new ones), run this once from the project root, using an email you've already signed up with:
```
node -e "require('./prisma/client').user.update({ where: { email: 'your@mail' }, data: { is_admin: 1 } }).then(() => process.exit())"
```

A `user-data.db` SQLite file will be created automatically the first time `npx prisma db push` is run.

### The Core Team
-- Sadaddin Ibrahimli

<span><i>Made at <a href='https://qwasar.io'>Qwasar SV -- Software Engineering School</a></i></span>
<span><img alt='Qwasar SV -- Software Engineering School's Logo' src='https://storage.googleapis.com/qwasar-public/qwasar-logo_50x50.png' width='20px' /></span>
