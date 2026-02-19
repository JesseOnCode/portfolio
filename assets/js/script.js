let menuIcon = document.querySelector('#menu-icon');
let navbar = document.querySelector('.navbar');

menuIcon.onclick = () => {
    menuIcon.classList.toggle('bx-x');
    navbar.classList.toggle('active');
};

// Web3Forms lomakkeen käsittely
const contactForm = document.getElementById('contact-form-element');
const formMessage = document.getElementById('form-message');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(contactForm);
        const submitButton = contactForm.querySelector('button[type="submit"]');
        
        // Muuta napin tekstiä
        submitButton.textContent = 'Lähetetään...';
        submitButton.disabled = true;
        
        try {
            const response = await fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Onnistui!
                formMessage.innerHTML = '✓ Kiitos viestistäsi! Otan yhteyttä sinuun pian.';
                formMessage.className = 'success';
                formMessage.style.display = 'block';
                
                // Tyhjennä lomake
                contactForm.reset();
                
                // Piilota viesti 5 sekunnin kuluttua
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
                
            } else {
                // Virhe
                formMessage.innerHTML = '✗ Jokin meni pieleen. Yritä uudelleen.';
                formMessage.className = 'error';
                formMessage.style.display = 'block';
            }
            
        } catch (error) {
            // Verkkovirhe
            formMessage.innerHTML = '✗ Yhteysongelma. Tarkista verkko ja yritä uudelleen.';
            formMessage.className = 'error';
            formMessage.style.display = 'block';
        }
        
        // Palauta nappi
        submitButton.textContent = 'Lähetä viesti';
        submitButton.disabled = false;
    });
}

// Typed.js initialisointi
document.addEventListener('DOMContentLoaded', function() {
    const typedElement = document.getElementById('typed');
    
    if (typedElement) {
        new Typed('#typed', {
            strings: [
                "opiskelija",
                "tulevaisuuden osaaja",
                "jatkuva oppija"
            ],
            typeSpeed: 100,
            backSpeed: 100,
            backDelay: 1000,
            loop: true
        });
    }
});