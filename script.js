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
            const resumeMatch = frontmatter.match(/resumeUrl: "(.*)"/);
            const githubMatch = frontmatter.match(/githubUrl: "(.*)"/);

            let html = `<h2>${titleMatch ? titleMatch[1] : 'About Me'}</h2>`;
            if (photoMatch) {
                html += `<img src="${photoMatch[1]}" alt="A photo of Rayaan Khan" class="about-me-photo">`;
            }
            html += marked.parse(markdown);

            // Add social links if they exist
            if (resumeMatch || githubMatch) {
                html += '<div class="social-links">';
                if (resumeMatch) {
                    html += `
                        <a href="${resumeMatch[1]}" target="_blank" rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <line x1="10" y1="9" x2="8" y2="9"></line>
                            </svg>
                            Resume
                        </a>`;
                }
                if (githubMatch) {
                    html += `
                        <a href="${githubMatch[1]}" target="_blank" rel="noopener noreferrer">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                            </svg>
                            GitHub
                        </a>`;
                }
                html += '</div>';
            }

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
