document.addEventListener('DOMContentLoaded', function() {
    loadAboutMe();
    loadProjects();
    loadPhotos();
    initializeTheme();
});

function initializeTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    }

    updateToggleIcon(savedTheme);

    themeToggle.addEventListener('click', () => {
        let currentTheme = document.body.getAttribute('data-theme');
        let newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateToggleIcon(newTheme);
    });
}

function updateToggleIcon(theme) {
    const sunIcon = document.querySelector('#theme-toggle .sun');
    const moonIcon = document.querySelector('#theme-toggle .moon');
    if (theme === 'light') {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
    } else {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
    }
}

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
            const publicProjectList = document.getElementById('public-project-list');
            const personalProjectList = document.getElementById('personal-project-list');

            const publicProjects = data.projects.filter(p => p.category === 'Public');
            const personalProjects = data.projects.filter(p => p.category === 'Personal' || !p.category);

            const createProjectHTML = project => `
                <li class="project-item">
                    ${project.image ? `<img src="${project.image}" alt="${project.title}" class="project-image">` : ''}
                    <div class="project-details">
                        <h3><a href="${project.url}" target="_blank">${project.title}</a></h3>
                        <div>${marked.parse(project.description)}</div>
                    </div>
                </li>
            `;

            publicProjectList.innerHTML = publicProjects.map(createProjectHTML).join('');
            personalProjectList.innerHTML = personalProjects.map(createProjectHTML).join('');
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
