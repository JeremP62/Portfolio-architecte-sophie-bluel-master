/*-----------------------------------------------------------Sélection des éléments--------------------------------------------------------------*/
const loginForm = document.getElementById("loginForm");
const errorMessage = document.getElementById("errorMessage");

/*-----------------------------------------------------------Soumission du formulaire-------------------------------------------------------------*/
loginForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  /*------------------------------------------Requête API-----------------------------------------------------------*/
  fetch("http://localhost:5678/api/users/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => {
      if (!response.ok) {
        errorMessage.textContent = "Identifiants incorrects";
        return null;
      }
      return response.json();
    })
    .then((data) => {
      if (!data) return; /*si la réponse est nulle (erreur login)*/
      localStorage.setItem("token", data.token); /*on garde le token*/
      window.location.href = "index.html"; /*on redirige vers la page d'accueil*/
    })
    .catch(() => {
      errorMessage.textContent = "Erreur de connexion au serveur";
    });
});
