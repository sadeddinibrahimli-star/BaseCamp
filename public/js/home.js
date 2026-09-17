fetch('/api/me')
    .then(res => res.json())
    .then(user => {
        if (user.is_admin) {
            document.getElementById('admin-link').style.display = 'inline';
        }
    });