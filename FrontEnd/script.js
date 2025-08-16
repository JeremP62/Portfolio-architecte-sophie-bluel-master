
console.log("Avant fetch");

fetch("http://localhost:5678/api/works") //utiliser la fonction fetch pour envoyer une requête http get à l'url (requête asynchrone: elle ne bloque pas l’exécution du reste du code.)
  .then(response => { 
    console.log("Réponse reçue :", response); //fetch recoit une réponse, bloc .then() est éxécuté. response est un objet de type response qui contient des infos
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`); //verifie si response.ok est false
    }
    return response.json(); //transforme la réponse JSON en objet JS (?)
  })

  .then(data => {
    console.log("Données reçues :", data); //contient le résultat de response.json. donc les données (le tableau de projet donc 11 éléments ?)
    const gallery = document.querySelector('.gallery'); //je sélectionne l'élément HTML avec la classe .gallery

    // Vider la galerie pour supprimer tout contenu statique précédent
    gallery.innerHTML = ''; //vide le contenu HTML de la galerie (nettoyer toute ancienne donnée avant d'ajouter les nouvelles dynamiquement)

    // Ajouter dynamiquement chaque projet dans la galerie
    data.forEach(projet => { // parcourt chaque projet dans le tableau data (titre,image etc)
      const figure = document.createElement('figure'); // crée un élément <figure> qui va contenir l'image et sa légende
      const img = document.createElement('img'); //crée un élément <img>
      img.src = projet.imageUrl;//src est défini avec projet.imageURL (lien vers l'image)
      img.alt = projet.title; //alt est défini avec projet.title (texte)
      const caption = document.createElement('figcaption');//crée un <figcaption> avec le titre du projet comme texte (légende descriptive)
      caption.textContent = projet.title;

      figure.appendChild(img);//Ajoute l’image et la légende dans la balise <figure>.
      figure.appendChild(caption);
      gallery.appendChild(figure);//Ajoute la balise <figure> complète dans la galerie HTML. À la fin de la boucle, tous les projets sont affichés dans la page.
    });
  })
  .catch(error => {
    console.error("Erreur lors du fetch :", error);// Si une erreur est levée (ex: erreur réseau, ou throw plus haut), elle est attrapée ici.La console affiche un message d’erreur détaillé.
  });


  //filtertest

  let projets = [];


  
// Fonction d'affichage des projets
function afficherProjets(liste) {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = ''; // Nettoyage avant ajout

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

// Fonction pour afficher les boutons de filtre
function afficherCategoriesDepuisProjets(projets) {
  const categoriesContainer = document.querySelector('.categories');
  categoriesContainer.innerHTML = '';

  // On utilise un Set pour extraire les catégories uniques
  const categoriesSet = new Set();
  projets.forEach(p => categoriesSet.add(p.category.name));

  // On transforme le Set en tableau et on le trie 
  const categories = Array.from(categoriesSet);

  // Bouton "Tous"
  const boutonTous = document.createElement('button');
  boutonTous.textContent = 'Tous';
  boutonTous.classList.add('active');
  categoriesContainer.appendChild(boutonTous);

  // Boutons des autres catégories
  categories.forEach(cat => {
    const bouton = document.createElement('button');
    bouton.textContent = cat;
    categoriesContainer.appendChild(bouton);
  });

  // Écoute des clics sur les boutons
  categoriesContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      // Gestion du style actif
      document.querySelectorAll('.categories button').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      const categorieChoisie = e.target.textContent;
      if (categorieChoisie === 'Tous') {
        afficherProjets(projets);
      } else {
        const filtres = projets.filter(p => p.category.name === categorieChoisie);
        afficherProjets(filtres);
      }
    }
  });
}

// FETCH des projets et initialisation
fetch("http://localhost:5678/api/works")
  .then(res => res.json())
  .then(data => {
    projets = data;
    afficherProjets(projets);
    afficherCategoriesDepuisProjets(projets);
  })
  .catch(err => console.error("Erreur lors du fetch :", err));

 


function afficherCategoriesDepuisProjets(projets) {
  const categoriesContainer = document.querySelector('.categories');
  categoriesContainer.innerHTML = ''; // On vide le conteneur avant d'ajouter les boutons

  // On récupère les catégories uniques
  const categoriesSet = new Set(projets.map(p => p.category.name));
  const categories = Array.from(categoriesSet);

  // Bouton "Tous"
  const boutonTous = document.createElement('button');
  boutonTous.textContent = 'Tous';
  boutonTous.classList.add('active');
  boutonTous.style.width = '100px';
  boutonTous.style.whiteSpace = 'nowrap'; // texte sur une seule ligne
  categoriesContainer.appendChild(boutonTous);

  // Boutons des autres catégories
  categories.forEach((cat, index) => {
    const bouton = document.createElement('button');
    bouton.textContent = cat;
    bouton.style.whiteSpace = 'nowrap';

    // Largeur spécifique
    if (cat === "Objets") {
      bouton.style.width = '100px';
    } else if (index === categories.length - 1) { // dernier bouton
      bouton.style.width = '198px';
    } else {
      bouton.style.width = '130px';
    }

    categoriesContainer.appendChild(bouton);
  });

  // Gestion du clic sur les boutons
  categoriesContainer.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
      // Retirer la classe active de tous les boutons
      categoriesContainer.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');

      // Filtrage des projets
      const categorieChoisie = e.target.textContent;
      const projetsFiltres = (categorieChoisie === 'Tous')
        ? projets
        : projets.filter(p => p.category.name === categorieChoisie);

      // Affichage des projets filtrés
      afficherProjets(projetsFiltres);
    }
  });
}






















