const threadId = window.location.pathname.split('/').pop();
let currentUserEmail = null;

function loadThread() {
    Promise.all([
        fetch('/api/me').then(res => res.json()),
        fetch(`/api/thread/${threadId}`).then(res => res.json())
    ]).then(([me, data]) => {
        currentUserEmail = me.email;
        document.getElementById('thread-title').textContent = data.thread.title;
        document.getElementById('editThreadTitle').value = data.thread.title;

        if (data.isOwner) {
            document.getElementById('editThreadForm').style.display = 'block';
        }

        const container = document.getElementById('message-list');
        container.innerHTML = '';

        if (data.messages.length === 0) {
            container.innerHTML = '<p>No messages yet.</p>';
            return;
        }

        data.messages.forEach(msg => {
            const div = document.createElement('div');
            const isYou = msg.author === currentUserEmail;
            div.innerHTML = `
                <p><strong>${msg.author}${isYou ? ' (You)' : ''}:</strong>
                    <span class="message-content">${msg.content}</span>
                </p>
                ${isYou ? `
                    <button type="button" class="btn-secondary edit-message-btn" data-id="${msg.id}">Edit</button>
                    <button type="button" class="btn-danger delete-message-btn" data-id="${msg.id}">Delete</button>
                ` : ''}
            `;
            container.appendChild(div);
        });

        document.querySelectorAll('.delete-message-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                await fetch(`/message/${btn.dataset.id}/delete`, { method: 'POST' });
                loadThread();
            });
        });

        document.querySelectorAll('.edit-message-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const messageId = btn.dataset.id;
                const currentContent = btn.parentElement.querySelector('.message-content').textContent;
                const newContent = prompt('Edit your message:', currentContent);

                if (newContent === null || !newContent.trim()) return; // cancelled or empty

                await fetch(`/message/${messageId}/edit`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ content: newContent })
                });
                loadThread();
            });
        });
    });
}

loadThread();
setInterval(loadThread, 3000);

document.getElementById('editThreadForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('editThreadTitle').value;

    const response = await fetch(`/thread/${threadId}/edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    });

    const messageEl = document.getElementById('thread-edit-error');

    if (!response.ok) {
        const text = await response.text();
        messageEl.style.color = 'red';
        messageEl.textContent = text;
        return;
    }

    messageEl.style.color = 'green';
    messageEl.textContent = 'Title updated!';
    loadThread();
});

document.getElementById('messageForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const content = document.getElementById('content').value;

    const response = await fetch(`/thread/${threadId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content })
    });

    const messageEl = document.getElementById('message-error');

    if (!response.ok) {
        const text = await response.text();
        messageEl.style.color = 'red';
        messageEl.textContent = text;
        return;
    }

    document.getElementById('content').value = '';
    messageEl.textContent = '';
    loadThread();
});