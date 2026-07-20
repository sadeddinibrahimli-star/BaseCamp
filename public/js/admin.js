fetch('/api/users')
    .then(res => res.json())
    .then(users => {
        const container = document.getElementById('user-list');

        users.forEach(user => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <p>${user.name} — ${user.email} — ${user.is_admin ? 'Admin' : 'User'}</p>
                <form action="/user/${user.id}/set-admin" method="POST">
                    <button type="submit">Make Admin</button>
                </form>
                <form action="/user/${user.id}/remove-admin" method="POST">
                    <button type="submit">Remove Admin</button>
                </form>
            `;
            container.appendChild(div);
        });
    });