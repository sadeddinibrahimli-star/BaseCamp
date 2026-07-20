const id = window.location.pathname.split('/').pop();
let currentUserEmail = null;
let ownerEmail = null;
function loadMembers() {
    fetch(`/api/project/${id}/members`)
        .then(res => res.json())
        .then(members => {
            const container = document.getElementById('member-list');
            container.innerHTML = '';

            if (members.length === 0) {
                container.innerHTML = '<p>No members yet.</p>';
                return;
            }
            members.forEach(member => {
                const div = document.createElement('div');
                const isYou = member.email === currentUserEmail;
                const isOwner = currentUserEmail === ownerEmail;

                div.innerHTML = `
                    <span>${member.name} — ${member.email}${isYou ? ' (You)' : ''}</span>
                    ${isOwner ? `<button type="button" class="btn-danger remove-member-btn" data-email="${member.email}">Remove</button>` : ''}
                `;
                container.appendChild(div);
            });
            document.querySelectorAll('.remove-member-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    const email = btn.dataset.email;
                    await fetch(`/project/${id}/remove-member`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email })
                    });
                    loadMembers();
                });
            });
        });
}
Promise.all([
    fetch('/api/me').then(res => res.json()),
    fetch(`/api/project/${id}`).then(res => res.json())
]).then(([me, project]) => {
    currentUserEmail = me.email;
    ownerEmail = project.owner_email;

    document.getElementById('name').value = project.name;
    document.getElementById('description').value = project.description;
    document.getElementById('editForm').action = `/project/${id}/edit`;
    document.getElementById('deleteForm').action = `/project/${id}/delete`;
    document.getElementById('leaveForm').action = `/project/${id}/leave`;

    const isYou = project.owner_email === currentUserEmail;
    document.getElementById('owner-label').textContent =
        `Owner: ${project.owner_email}${isYou ? ' (You)' : ''}`;

    if (isYou) {
    document.getElementById('deleteForm').style.display = 'inline';
    document.getElementById('newThreadForm').style.display = 'block'; // ← add this
} else {
    document.getElementById('leaveForm').style.display = 'inline';
}

    loadMembers();
    loadAttachments(); 
    loadThreads(); 
});
document.getElementById('addMemberForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('memberEmail').value;

    const response = await fetch(`/project/${id}/add-member`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    });

    const messageEl = document.getElementById('member-error');

    if (!response.ok) {
        const text = await response.text();
        messageEl.style.color = 'red';
        messageEl.textContent = text;
        return;
    }

    document.getElementById('memberEmail').value = '';
    messageEl.style.color = 'green';
    messageEl.textContent = 'Member added!';
    loadMembers();
});
document.getElementById('attachmentForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const fileInput = document.getElementById('attachmentFile');
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);

    const response = await fetch(`/project/${id}/attachment`, {
        method: 'POST',
        body: formData
    });

    const messageEl = document.getElementById('attachment-error');

    if (!response.ok) {
        const text = await response.text();
        messageEl.style.color = 'red';
        messageEl.textContent = text;
        return;
    }

    fileInput.value = '';
    messageEl.style.color = 'green';
    messageEl.textContent = 'File uploaded!';
    loadAttachments();
});

function loadAttachments() {
    fetch(`/api/project/${id}/attachments`)
        .then(res => res.json())
        .then(attachments => {
            const container = document.getElementById('attachment-list');
            container.innerHTML = '';

            if (attachments.length === 0) {
                container.innerHTML = '<p>No attachments yet.</p>';
                return;
            }

            attachments.forEach(att => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <a href="/uploads/${att.filename}" target="_blank">${att.filename} (${att.format})</a>
                    <button type="button" class="btn-danger delete-attachment-btn" data-id="${att.id}">Delete</button>
                `;
                container.appendChild(div);
            });

            document.querySelectorAll('.delete-attachment-btn').forEach(btn => {
                btn.addEventListener('click', async () => {
                    await fetch(`/attachment/${btn.dataset.id}/delete`, { method: 'POST' });
                    loadAttachments();
                });
            });
        });
}
function loadThreads() {
    fetch(`/api/project/${id}/threads`)
        .then(res => res.json())
        .then(threads => {
            const container = document.getElementById('thread-list');
            container.innerHTML = '';

            if (threads.length === 0) {
                container.innerHTML = '<p>No threads yet.</p>';
                return;
            }

            threads.forEach(thread => {
                const div = document.createElement('div');
                div.innerHTML = `<a href="/thread/${thread.id}" class="btn btn-secondary">${thread.title}</a>`;
                container.appendChild(div);
            });
        });
}

document.getElementById('newThreadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('threadTitle').value;

    const response = await fetch(`/project/${id}/thread`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });

    const messageEl = document.getElementById('thread-error');

    if (!response.ok) {
        const text = await response.text();
        messageEl.style.color = 'red';
        messageEl.textContent = text;
        return;
    }

    document.getElementById('threadTitle').value = '';
    messageEl.style.color = 'green';
    messageEl.textContent = 'Thread created!';
    loadThreads();
});