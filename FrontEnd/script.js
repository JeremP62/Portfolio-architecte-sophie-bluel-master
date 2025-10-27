document.addEventListener("DOMContentLoaded", () => {
  
  /*------------------------------------------------------------VARIABLES-------------------------------------------------------------------------------------*/
  
  let projets = [];

  const loginButton = document.getElementById("loginButton");
  const btnModifier = document.getElementById("modifierButton");
  const editBar = document.getElementById("editBar");

  const categoriesContainer = document.querySelector(".categories");
  const galleryEl = document.querySelector(".gallery");

  /*----------------------- Modal galerie------------------------*/
  const modalGallery = document.getElementById("modalGallery");
  const closeGallery = document.querySelector(".close-gallery");

  /*-----------------------modal ajout photo------------------------*/
  const modalAddPhoto = document.getElementById("modalAddPhoto");
  const closeAddPhoto = document.querySelector(".close-add-photo");
  const openAddPhotoBtn = document.querySelector(".btn-add-photo");

  /*-----------------------form ajout photo------------------------*/
  const formAddPhoto = document.getElementById("formAddPhoto");
  const photoFile = document.getElementById("photoFile");
  const photoTitle = document.getElementById("photoTitle");
  const photoCategory = document.getElementById("photoCategory");
  const validateBtn = formAddPhoto
    ? formAddPhoto.querySelector(".btn-validate")
    : null;

  /*--------------------------------------------------------------- zone d’upload----------------------------------------------------------------------------*/
  const photoUploadDiv = document.querySelector(".photo-upload");
  const photoLabel = photoUploadDiv
    ? photoUploadDiv.querySelector(".photo-label")
    : null;
  const photoHint = photoUploadDiv ? photoUploadDiv.querySelector("p") : null;
  let previewImg = photoUploadDiv
    ? photoUploadDiv.querySelector("img.preview")
    : null;

  if (photoUploadDiv && !previewImg) {
    previewImg = document.createElement("img");
    previewImg.className = "preview";
    previewImg.style.display = "none";
    photoUploadDiv.appendChild(previewImg);
  }

 
  /*------------------------------------------------LOGIN / LOGOUT et UI-------------------------------------------------------------------------------------*/
  
  function updateLoginButton() {
    const token = localStorage.getItem("token");
    if (loginButton) loginButton.textContent = token ? "Logout" : "Login";
    if (btnModifier)
      btnModifier.style.display = token ? "inline-block" : "none";
    if (categoriesContainer)
      categoriesContainer.style.display = token ? "none" : "flex";
    if (editBar) editBar.style.display = token ? "flex" : "none";
  }

  updateLoginButton();

  if (loginButton) {
    loginButton.style.cursor = "pointer";
    loginButton.addEventListener("click", () => {
      const token = localStorage.getItem("token");
      if (token) {
        localStorage.removeItem("token");
        updateLoginButton();
        window.location.reload();
      } else {
        window.location.href = "login.html";
      }
    });
  }

  /*-----------------------------------------------------------------------FETCH & AFFICHAGE DES PROJETS----------------------------------------------------------*/
  
  async function fetchProjets() {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      projets = await response.json();
      afficherProjets(projets);
      afficherCategoriesDepuisProjets(projets);
    } catch (err) {
      console.error("Erreur lors du fetch :", err);
    }
  }

  function afficherProjets(liste) {
    console.log(liste);
    if (!galleryEl) return;
    galleryEl.innerHTML = "";
    
    liste.forEach((projet) => {
      const figure = document.createElement("figure");
      const img = document.createElement("img");
      const caption = document.createElement("figcaption");

      img.src = projet.imageUrl;
      img.alt = projet.title;
      caption.textContent = projet.title;

      figure.appendChild(img);
      figure.appendChild(caption);
      galleryEl.appendChild(figure);
    });
  }

  function afficherCategoriesDepuisProjets(projets) {
    if (!categoriesContainer) return;
    categoriesContainer.innerHTML = "";

    const categoriesSet = new Set(projets.map((p) => p.category.name));
    const categories = Array.from(categoriesSet);

    const boutonTous = document.createElement("button");
    boutonTous.textContent = "Tous";
    boutonTous.classList.add("active");
    categoriesContainer.appendChild(boutonTous);

    categories.forEach((cat) => {
      const bouton = document.createElement("button");
      bouton.textContent = cat;
      categoriesContainer.appendChild(bouton);
    });

    categoriesContainer.addEventListener("click", (e) => {
      if (e.target.tagName === "BUTTON") {
        categoriesContainer
          .querySelectorAll("button")
          .forEach((btn) => btn.classList.remove("active"));
        e.target.classList.add("active");

        const categorieChoisie = e.target.textContent;
        const projetsFiltres =
          categorieChoisie === "Tous"
            ? projets
            : projets.filter((p) => p.category.name === categorieChoisie);

        afficherProjets(projetsFiltres);
      }
    });
  }
  fetchProjets();


/*----------------------------------------------------------------------------------MODALE GALERIE PHOTO-----------------------------------------------------*/

  if (modalGallery) modalGallery.style.display = "none";

  if (btnModifier && modalGallery) {
    btnModifier.addEventListener("click", () => {
      modalGallery.style.display = "flex";
      afficherGalerieModale();
    });
  }

  if (closeGallery && modalGallery) {
    closeGallery.addEventListener("click", () => {
      modalGallery.style.display = "none";
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modalGallery) {
      modalGallery.style.display = "none";
    }
  });

  async function afficherGalerieModale() {
    const grid = document.querySelector("#modalGallery .gallery-modal");
    if (!grid) return;
    grid.innerHTML = "";

    try {
      const response = await fetch("http://localhost:5678/api/works");
      if (!response.ok) throw new Error("Erreur API");
      const photos = await response.json();

      photos.forEach((photo) => {
        const figure = document.createElement("figure");
        const img = document.createElement("img");
        const trash = document.createElement("i");

        img.src = photo.imageUrl;
        img.alt = photo.title;
        trash.classList.add("fa-regular", "fa-trash-can", "delete-icon"); /* icone  */

        trash.addEventListener("click", async () => {
          const token = localStorage.getItem("token");
          if (!token) {
            alert("Non autorisé");
            return;
          }
          try {
            const res = await fetch(
              `http://localhost:5678/api/works/${photo.id}`,
              {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (res.ok) {
              figure.remove();
              fetchProjets();
            } else {
              alert("Erreur lors de la suppression");
            }
          } catch (err) {
            console.error("Erreur suppression:", err);
          }
        });

        figure.appendChild(img);
        figure.appendChild(trash);
        grid.appendChild(figure);
      });
    } catch (err) {
      console.error("Erreur galerie modale:", err);
    }
  }

  
  /*----------------------------------------------------------------MODALE AJOUT PHOTO------------------------------------------------------------------------*/
 
  if (modalAddPhoto) modalAddPhoto.style.display = "none";

  if (openAddPhotoBtn && modalAddPhoto) {
    openAddPhotoBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      modalAddPhoto.style.display = "flex";
      await chargerCategories();
      updateValidateState();
    });
  }

  if (closeAddPhoto && modalAddPhoto) {
    closeAddPhoto.addEventListener("click", () => {
      modalAddPhoto.style.display = "none";
      resetAddPhotoUI();
    });
  }

  window.addEventListener("click", (e) => {
    if (e.target === modalAddPhoto) {
      modalAddPhoto.style.display = "none";
      resetAddPhotoUI();
    }
  });

  async function chargerCategories() {
    if (!photoCategory) return;
    photoCategory.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    photoCategory.appendChild(defaultOption);

    try {
      const response = await fetch("http://localhost:5678/api/categories");
      if (!response.ok) throw new Error("Erreur API catégories");
      const categories = await response.json();
      categories.forEach((cat) => {
        const option = document.createElement("option");
        option.value = cat.id;
        option.textContent = cat.name;
        photoCategory.appendChild(option);
      });
    } catch (err) {
      console.error("Erreur récupération catégories :", err);
    }
  }

  /*-------------------------------------------------Validation + Preview + Submit --------------------------------------------------*/
  function isFormValid() {
    const hasFile = photoFile && photoFile.files && photoFile.files[0];
    const titleOk = photoTitle && photoTitle.value.trim() !== "";
    const catOk =
      photoCategory &&
      photoCategory.value !== "" &&
      photoCategory.value !== null;
    return hasFile && titleOk && catOk;
  }

  function updateValidateState() {
    if (!validateBtn) return;
    if (isFormValid()) {
      validateBtn.disabled = false;
      validateBtn.classList.add("active");
    } else {
      validateBtn.disabled = true;
      validateBtn.classList.remove("active");
    }
  }

  if (photoFile) {
    photoFile.addEventListener("change", () => {
      const file = photoFile.files[0];
      if (!file) {
        photoUploadDiv.classList.remove("has-image");
        updateValidateState();
        return;
      }

      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Formats autorisés : JPG ou PNG");
        photoFile.value = "";
        photoUploadDiv.classList.remove("has-image");
        updateValidateState();
        return;
      }
      if (file.size > 4 * 1024 * 1024) {
        alert("Taille max : 4 Mo");
        photoFile.value = "";
        photoUploadDiv.classList.remove("has-image");
        updateValidateState();
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (previewImg) {
          previewImg.src = e.target.result;
          previewImg.style.display = "block";
        }
        photoUploadDiv.classList.add("has-image"); /*masque l’icône et le texte*/
        updateValidateState();
      };

      reader.readAsDataURL(file);
    });
  }

  if (photoTitle) photoTitle.addEventListener("input", updateValidateState);
  if (photoCategory)
    photoCategory.addEventListener("change", updateValidateState);

  updateValidateState();

  if (formAddPhoto) {
    formAddPhoto.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!isFormValid()) return;

      const file = photoFile.files[0];
      const title = photoTitle.value.trim();
      const category = photoCategory.value;

      const token = localStorage.getItem("token");
      if (!token) {
        alert("Non autorisé");
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title);
      formData.append("category", category);

      try {
        const res = await fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        if (res.ok) {
          modalAddPhoto.style.display = "none";
          resetAddPhotoUI();
          afficherGalerieModale();
          fetchProjets();
        } else {
          alert("Erreur lors de l'ajout");
        }
      } catch (err) {
        console.error(err);
      }
    });
  }

  function resetAddPhotoUI() {
    if (previewImg) {
      previewImg.src = "";
      previewImg.style.display = "none";
    }
    if (formAddPhoto) formAddPhoto.reset();
    photoUploadDiv.classList.remove("has-image"); /*remet l’état initial*/
    updateValidateState();
  }

  
  /*--------------------------------------------------------------------FLÈCHE RETOUR-------------------------------------------------------------------*/
  
  const backArrow = document.querySelector("#modalAddPhoto .back-arrow");
  if (backArrow) {
    backArrow.addEventListener("click", (e) => {
      e.preventDefault();
      modalAddPhoto.style.display = "none";
      resetAddPhotoUI();
      modalGallery.style.display = "flex";
      afficherGalerieModale();
    });
  }
});
