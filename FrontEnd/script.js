// --------------------
// VARIABLES GLOBALES
// --------------------
let projets = [];

const loginButton = document.getElementById('loginButton');
const btnModifier = document.getElementById('modifierButton');
const editBar = document.getElementById('editBar');

// --------------------
// LOGIN / LOGOUT & UI
// --------------------
function updateLoginButton() {
    const token = localStorage.getItem('token');

    // Login / Logout
    if (loginButton) loginButton.textContent = token ? 'Logout' : 'Login';

    // Bouton modifier
    if (btnModifier) btnModifier.style.display = token ? 'inline-block' : 'none';

    // Filtre par catégories
    const categoriesContainer = document.querySelector('.categories');
    if (categoriesContainer) categoriesContainer.style.display = token ? 'none' : 'flex';

    // Barre édition
    if (editBar) editBar.style.display = token ? 'flex' : 'none';
}

// Initialisation
updateLoginButton();

// Gestion clic Login / Logout
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
// FETCH & AFFICHAGE DES PROJETS
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
    if (!gallery) return;
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

// --------------------
// FILTRE PAR CATÉGORIES
// --------------------
function afficherCategoriesDepuisProjets(projets) {
    const categoriesContainer = document.querySelector('.categories');
    if (!categoriesContainer) return;
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
// INITIALISATION
// --------------------
fetchProjets();
