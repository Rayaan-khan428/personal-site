document.addEventListener('DOMContentLoaded', function() {
    loadAboutMe();
    loadProjects();
    loadPhotos();
});

function loadAboutMe() {
    fetch('content/about.md')
        .then(response => response.text())
        .then(text => {
            const aboutSection = document.getElementById('about');
            const [_, frontmatter, markdown] = text.split('---\n');
            const photoMatch = frontmatter.match(/photo: "(.*)"/);
            const titleMatch = frontmatter.match(/title: "(.*)"/);

            let html = `<h2>${titleMatch ? titleMatch[1] : 'About Me'}</h2>`;
            if (photoMatch) {
                html += `<img src="${photoMatch[1]}" alt="A photo of Rayaan Khan" class="about-me-photo">`;
            }
            html += marked.parse(markdown);
            aboutSection.innerHTML = html;
        });
}

function loadProjects() {
    fetch('content/projects.json')
        .then(response => response.json())
        .then(data => {
            const projectList = document.getElementById('project-list');
            projectList.innerHTML = data.projects.map(project => `
                <li>
                    <a href="${project.url}" class="project-link" target="_blank"><strong>${project.title}</strong></a>
                    <div>${marked.parse(project.description)}</div>
                </li>
            `).join('');
        });
}

function loadPhotos() {
    fetch('content/photos.json')
        .then(response => response.json())
        .then(data => {
            const photoGallery = document.querySelector('.photo-gallery');
            photoGallery.innerHTML = data.photos.map(photo => `
                <img src="${photo.image}" alt="${photo.alt}">
            `).join('');
        });
}
