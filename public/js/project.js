fetch('/api/projects')
    .then(res => res.json())
    .then(projects => {
        const container = document.getElementById('project-list');

        projects.forEach(project => {
            const div = document.createElement('div');
            div.className = 'card';
            div.innerHTML = `
                <h3>${project.name}</h3>
                <p>Description: ${project.description}</p>

                <form action="/project/${project.id}/delete" method="POST" style="display: inline;">
                    <button type="submit" class="btn-danger">Delete</button>
                </form>
                <a href="/project/${project.id}" class="btn btn-secondary">View</a>
            `;
            container.appendChild(div);
        });
    });