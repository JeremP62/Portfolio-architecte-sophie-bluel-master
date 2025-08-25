// --------------------
// VARIABLES GLOBALES
// --------------------
let projets = [];

const loginButton = document.getElementById('loginButton');
const modalMedia = document.getElementById('modalMedia');
const btnModifier = document.getElementById('modifierButton');
const closeMedia = document.querySelector('.close-media');
const ajouterPhotoBtn = document.getElementById('ajouterPhotoBtn');
const vueGalerie = document.querySelector('.vue-galerie');
const vueAjout = document.querySelector('.vue-ajout');
const retourGalerie = document.getElementById('retourGalerie');

// --------------------
// FONCTIONS FETCH & AFFICHAGE
// --------------------
async function fetchProjets() {
    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        projets = await response.json();
        afficherProjets(projets);
        afficherCategoriesDepuisProjets(projets);
    } catch (err) {
        console.error("Erreur lors du fetch :", err);
    }
}

function afficherProjets(liste) {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    liste.forEach(projet => {
        const figure = document.createElement('figure');
        const img = document.createElement('img');
        img.src = projet.imageUrl;
        img.alt = projet.title;

        const caption = document.createElement('figcaption');
        caption.textContent = projet.title;

        figure.appendChild(img);
        figure.appendChild(caption);
        gallery.appendChild(figure);
    });
}

function afficherCategoriesDepuisProjets(projets) {
    const categoriesContainer = document.querySelector('.categories');
    categoriesContainer.innerHTML = '';

    const categoriesSet = new Set(projets.map(p => p.category.name));
    const categories = Array.from(categoriesSet);

    // Bouton "Tous"
    const boutonTous = document.createElement('button');
    boutonTous.textContent = 'Tous';
    boutonTous.classList.add('active');
    categoriesContainer.appendChild(boutonTous);

    categories.forEach(cat => {
        const bouton = document.createElement('button');
        bouton.textContent = cat;
        categoriesContainer.appendChild(bouton);
    });

    categoriesContainer.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            categoriesContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');

            const categorieChoisie = e.target.textContent;
            const projetsFiltres = (categorieChoisie === 'Tous')
                ? projets
                : projets.filter(p => p.category.name === categorieChoisie);

            afficherProjets(projetsFiltres);
        }
    });
}

// --------------------
// MODALE MEDIA
// --------------------
if (btnModifier) {
    btnModifier.addEventListener('click', () => {
        modalMedia.style.display = 'flex';
    });
}

if (closeMedia) {
    closeMedia.addEventListener('click', () => {
        modalMedia.style.display = 'none';
        vueAjout.style.display = 'none';
        vueGalerie.style.display = 'block';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === modalMedia) {
        modalMedia.style.display = 'none';
        vueAjout.style.display = 'none';
        vueGalerie.style.display = 'block';
    }
});

if (ajouterPhotoBtn) {
    ajouterPhotoBtn.addEventListener('click', () => {
        vueGalerie.style.display = 'none';
        vueAjout.style.display = 'block';
    });
}

if (retourGalerie) {
    retourGalerie.addEventListener('click', () => {
        vueAjout.style.display = 'none';
        vueGalerie.style.display = 'block';
    });
}

// --------------------
// LOGIN / LOGOUT
// --------------------
function updateLoginButton() {
    const token = localStorage.getItem('token');
    if (loginButton) loginButton.textContent = token ? 'Logout' : 'Login';
}

updateLoginButton();

if (loginButton) {
    loginButton.style.cursor = 'pointer';
    loginButton.addEventListener('click', () => {
        const token = localStorage.getItem('token');
        if (token) {
            // Déconnexion
            localStorage.removeItem('token');
            updateLoginButton();
            window.location.reload();
        } else {
            // Redirection vers login.html
            window.location.href = 'login.html';
        }
    });
}

// --------------------
// INITIALISATION
// --------------------
fetchProjets();
