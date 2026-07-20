fetch('/api/me')
    .then(res => res.json())
    .then(user => {
        document.getElementById('name').textContent = user.name;
        document.getElementById('email').textContent = user.email;
    });