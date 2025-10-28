// Local interactions for navigation, contact form and smooth scrolling
    (function () {
      const year = document.getElementById('year');
      if (year) {
        year.textContent = new Date().getFullYear();
      }


      // Contact form submission
      const contactForm = document.getElementById('contactForm');
      const contactStatus = document.getElementById('contactStatus');
      if (contactForm && contactStatus) {
        contactForm.addEventListener('submit', (event) => {
          event.preventDefault();

          const formData = new FormData(contactForm);
          const name = (formData.get('name') || '').toString().trim();
          const email = (formData.get('email') || '').toString().trim();
          const message = (formData.get('message') || '').toString().trim();
          const submitButton = contactForm.querySelector('button[type="submit"]');

          if (!name || !email || !message) {
            contactStatus.textContent = 'Fyll i alla fält.';
            return;
          }

          if (submitButton) {
            submitButton.disabled = true;
          }

          contactStatus.textContent = 'Skickar...';

          fetch(contactForm.action, {
            method: 'POST',
            headers: { Accept: 'application/json' },
            body: formData,
          })
            .then(async (response) => {
              if (response.ok) {
                contactStatus.textContent = 'Tack! Ditt meddelande skickades.';
                contactForm.reset();
                return;
              }

              const data = await response.json().catch(() => ({ errors: [] }));
              const errorMessage = data.errors?.[0]?.message || 'Kunde inte skicka meddelandet.';
              contactStatus.textContent = errorMessage;
            })
            .catch(() => {
              contactStatus.textContent = 'Något gick fel. Försök igen senare.';
            })
            .finally(() => {
              if (submitButton) {
                submitButton.disabled = false;
              }
            });
        });
      }


      // Mobile menu toggle
      const menuToggle = document.querySelector('.menu-toggle');
      const navMenu = document.getElementById('navMenu');
      if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
          const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
          menuToggle.setAttribute('aria-expanded', String(!expanded));
          navMenu.style.display = expanded ? 'none' : 'flex';
        });
      }

      window.addEventListener('load', () => {
        document.querySelectorAll('.tile').forEach((tile, index) => {
          tile.animate(
            [
              { opacity: 0, transform: 'translateY(12px)' },
              { opacity: 1, transform: 'translateY(0)' },
            ],
            { duration: 600, delay: index * 120, fill: 'forwards' }
          );
        });
      });

    })();
