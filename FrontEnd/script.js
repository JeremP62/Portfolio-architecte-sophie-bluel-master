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



// --------------------
// MODALE GALERIE PHOTO
// --------------------
const modalGallery = document.getElementById('modalGallery');
const closeGallery = document.querySelector('.close-gallery');
if (btnModifier) {
    btnModifier.addEventListener('click', () => {
        modalGallery.style.display = 'flex'; // ouvre la modale
        afficherGalerieModale(); // charge les photos
    });
}


if (closeGallery) {
    closeGallery.addEventListener('click', () => {
        modalGallery.style.display = 'none'; // ferme au clic sur la croix
    });
}

// Fermer si clic en dehors de la modale
window.addEventListener('click', (e) => {
    if (e.target === modalGallery) {
        modalGallery.style.display = 'none';
    }
});

async function afficherGalerieModale() {
    const galleryContainer = document.querySelector('#modalGallery .gallery-modal');

    if (!galleryContainer) return;
    galleryContainer.innerHTML = '';

    try {
        const response = await fetch("http://localhost:5678/api/works");
        if (!response.ok) throw new Error("Erreur API");
        const photos = await response.json();

        photos.forEach(photo => {
            const figure = document.createElement('figure');

            const img = document.createElement('img');
            img.src = photo.imageUrl;
            img.alt = photo.title;

            const deleteBtn = document.createElement('i');
deleteBtn.classList.add('fa-regular', 'fa-trash-can', 'delete-icon');

            // Suppression au clic
            deleteBtn.addEventListener('click', async () => {
                const token = localStorage.getItem('token');
                if (!token) {
                    alert("Non autorisé");
                    return;
                }

                try {
                    const res = await fetch(`http://localhost:5678/api/works/${photo.id}`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': `Bearer ${token}`
                        }
                    });

                    if (res.ok) {
                        figure.remove(); // supprimer l’élément du DOM
                    } else {
                        alert("Erreur lors de la suppression");
                    }
                } catch (err) {
                    console.error("Erreur suppression:", err);
                }
            });

            figure.appendChild(img);
            figure.appendChild(deleteBtn);
            galleryContainer.appendChild(figure);
        });


const addButton = document.querySelector('.btn-add-photo');



    } catch (err) {
        console.error("Erreur galerie modale:", err);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    if (modalGallery) modalGallery.style.display = 'none';
});


// --- AJOUT PHOTO ---

const modalAddPhoto   = document.getElementById('modalAddPhoto');
const closeAddPhoto   = document.querySelector('.close-add-photo');
const openAddPhotoBtn = document.querySelector('.btn-add-photo'); // <- bouton EXISTANT dans le DOM

// Cacher la modale d’ajout au chargement (filet de sécurité)
document.addEventListener('DOMContentLoaded', () => {
  if (modalAddPhoto) modalAddPhoto.style.display = 'none';
});

// Ouvrir la modale d’ajout au clic sur le bouton "Ajouter une photo"
if (openAddPhotoBtn) {
  openAddPhotoBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (modalAddPhoto) {
      modalAddPhoto.style.display = 'flex';
      chargerCategories(); // charge les options du <select>
    }
  });
}

// Fermer via la croix
if (closeAddPhoto) {
  closeAddPhoto.addEventListener('click', () => {
    modalAddPhoto.style.display = 'none';
    const f = document.getElementById('formAddPhoto');
    if (f) f.reset();
  });
}

// Fermer si clic sur l’overlay
window.addEventListener('click', (e) => {
  if (e.target === modalAddPhoto) {
    modalAddPhoto.style.display = 'none';
    const f = document.getElementById('formAddPhoto');
    if (f) f.reset();
  }
});

// Charger les catégories
async function chargerCategories() {
  const select = document.getElementById('photoCategory');
  if (!select) return;
  select.innerHTML = ''; // reset

  try {
    const response = await fetch("http://localhost:5678/api/categories");
    if (!response.ok) throw new Error('Erreur API catégories');
    const categories = await response.json();

    categories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat.id;     // adapte si l’API attend "category" ou "categoryId"
      option.textContent = cat.name;
      select.appendChild(option);
    });
  } catch (err) {
    console.error("Erreur récupération catégories :", err);
  }
}

// Submit ajout photo
document.getElementById('formAddPhoto').addEventListener('submit', async (e) => {
  e.preventDefault();

  const file     = document.getElementById('photoFile').files[0];
  const title    = document.getElementById('photoTitle').value.trim();
  const category = document.getElementById('photoCategory').value;

  if (!file || !title || !category) {
    alert('Veuillez sélectionner une image, un titre et une catégorie.');
    return;
  }

  const token = localStorage.getItem('token');
  if (!token) return alert("Non autorisé");

  const formData = new FormData();
  formData.append('image', file);
  formData.append('title', title);
  formData.append('category', category); // adapte si ton backend attend un autre nom

  try {
    const res = await fetch("http://localhost:5678/api/works", {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` },
      body: formData
    });

    if (res.ok) {
      // succès : fermer + reset + recharger la galerie
      modalAddPhoto.style.display = 'none';
      e.target.reset();
      // recharge la galerie photo (modale ou page, selon ton besoin)
      if (typeof afficherGalerieModale === 'function') {
        afficherGalerieModale();
      }
    } else {
      alert("Erreur lors de l'ajout");
    }
  } catch (err) {
    console.error(err);
  }
});






// Références
const formAddPhoto   = document.getElementById('formAddPhoto');
const validateBtn    = formAddPhoto.querySelector('.btn-validate');
const photoFile      = document.getElementById('photoFile');
const photoTitle     = document.getElementById('photoTitle');
const photoCategory  = document.getElementById('photoCategory');

// Vérif de validité
function isFormValid() {
  const hasFile = photoFile.files && photoFile.files[0];
  const titleOk = photoTitle.value.trim() !== '';
  const catOk   = photoCategory.value !== '' && photoCategory.value !== null;
  return hasFile && titleOk && catOk;
}

// Met à jour l'état visuel + disabled
function updateValidateState() {
  if (isFormValid()) {
    validateBtn.disabled = false;
    validateBtn.classList.add('active');   // devient vert
  } else {
    validateBtn.disabled = true;
    validateBtn.classList.remove('active'); // redevient gris
  }
}

// Listeners (important: 'change' pour le file)
photoFile.addEventListener('change', updateValidateState);
photoTitle.addEventListener('input', updateValidateState);
photoCategory.addEventListener('change', updateValidateState);

// Au chargement de la modale (ou au DOMReady), on part désactivé
document.addEventListener('DOMContentLoaded', updateValidateState);

// (Optionnel) quand tu ouvres la modale, appelle aussi :
/*
openAddPhotoBtn.addEventListener('click', () => {
  modalAddPhoto.style.display = 'flex';
  chargerCategories().then(updateValidateState);
});
*/

// Bloque la soumission si invalide (sécurité)
formAddPhoto.addEventListener('submit', (e) => {
  if (!isFormValid()) {
    e.preventDefault();
    return; // éventuellement un message
  }
  // sinon, laisser ton code d'upload exécuter…
});

const photoUploadDiv = document.querySelector('.photo-upload');

photoFile.addEventListener('change', () => {
  const file = photoFile.files[0];
  if (!file) return;

  // (optionnel) vérifs rapides
  if (!['image/jpeg','image/png'].includes(file.type)) {
    alert('Format autorisé : JPG ou PNG');
    photoFile.value = '';
    updateValidateState();
    return;
  }
  if (file.size > 4 * 1024 * 1024) { // 4 Mo
    alert('Taille max : 4 Mo');
    photoFile.value = '';
    updateValidateState();
    return;
  }

  // Affiche la preview dans .photo-upload
  const reader = new FileReader();
  reader.onload = (e) => {
    photoUploadDiv.innerHTML = ''; // retire le label + texte
    const img = document.createElement('img');
    img.className = 'preview';
    img.src = e.target.result;
    img.alt = 'Aperçu';
    photoUploadDiv.appendChild(img);
    updateValidateState(); // met à jour l’état du bouton Valider
  };
  reader.readAsDataURL(file);
});




