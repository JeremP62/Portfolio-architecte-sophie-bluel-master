

// Sélection des éléments
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('errorMessage');

// Soumission du formulaire
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    try {
        const response = await fetch('http://localhost:5678/api/users/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            errorMessage.textContent = 'Identifiants incorrects';
            return;
        }

        const data = await response.json();
        localStorage.setItem('token', data.token); // Sauvegarde le token
        window.location.href = 'index.html';       // Redirection vers l'accueil

    } catch (err) {
        errorMessage.textContent = 'Erreur réseau';
        console.error(err);
    }
});
