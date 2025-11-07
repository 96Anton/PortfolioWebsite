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


      const themeToggle = document.getElementById('checkbox');
      const themeStorageKey = 'portfolio-theme';
      const prefersLight = typeof window.matchMedia === 'function' ? window.matchMedia('(prefers-color-scheme: light)') : null;

      const setThemeAttribute = (target, theme) => {
        if (!target) {
          return;
        }
        target.dataset.theme = theme;
        target.setAttribute('data-theme', theme);
      };

      const applyTheme = (theme) => {
        const normalizedTheme = theme === 'light' ? 'light' : 'dark';
        setThemeAttribute(document.documentElement, normalizedTheme);
        setThemeAttribute(document.body, normalizedTheme);
        if (document.documentElement) {
          document.documentElement.style.colorScheme = normalizedTheme;
        }
        if (themeToggle instanceof HTMLInputElement) {
          themeToggle.checked = normalizedTheme === 'light';
        }
      };

      const readStoredTheme = () => {
        try {
          const stored = window.localStorage.getItem(themeStorageKey);
          if (stored === 'light' || stored === 'dark') {
            return stored;
          }
        } catch (error) {
          console.warn('Could not read stored theme preference.', error);
        }
        return null;
      };

      const writeStoredTheme = (theme) => {
        try {
          window.localStorage.setItem(themeStorageKey, theme);
        } catch (error) {
          console.warn('Could not persist theme preference.', error);
        }
      };

      const broadcastThemeChange = (theme) => {
        document.dispatchEvent(new CustomEvent('portfolio:theme-change', { detail: { theme } }));
      };

  const storedTheme = readStoredTheme();
  const initialTheme = storedTheme || 'dark';

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => applyTheme(initialTheme), { once: true });
      } else {
        applyTheme(initialTheme);
      }

      if (themeToggle instanceof HTMLInputElement) {
        themeToggle.addEventListener('change', (event) => {
          const input = event.target;
          if (!(input instanceof HTMLInputElement)) {
            return;
          }

          const theme = input.checked ? 'light' : 'dark';
          applyTheme(theme);
          writeStoredTheme(theme);
          broadcastThemeChange(theme);
        });
      }

      if (prefersLight) {
        const handleMediaChange = (event) => {
          if (readStoredTheme()) {
            return;
          }

          const theme = event.matches ? 'light' : 'dark';
          applyTheme(theme);
          broadcastThemeChange(theme);
        };

        if (typeof prefersLight.addEventListener === 'function') {
          prefersLight.addEventListener('change', handleMediaChange);
        } else if (typeof prefersLight.addListener === 'function') {
          prefersLight.addListener(handleMediaChange);
        }
      }

      const stickyHoverTargets = document.querySelectorAll('.secret-circle, .secret-circle-container');
      if (stickyHoverTargets.length) {
        const activateStickyHover = (element) => {
          if (!element.classList.contains('secret-circle') && !element.classList.contains('secret-circle-container')) {
            return;
          }

          element.classList.add('is-hovered');
          const container = element.classList.contains('secret-circle-container')
            ? element
            : element.closest('.secret-circle-container');
          if (container) {
            container.classList.add('is-hovered');
            const circle = container.querySelector('.secret-circle');
            if (circle) {
              circle.classList.add('is-hovered');
            }
          }
        };

        stickyHoverTargets.forEach((target) => {
          target.addEventListener('mouseenter', () => activateStickyHover(target));
          target.addEventListener('focus', () => activateStickyHover(target));
        });
      }


      // PortfolioWebsite/Scripts/portfolio.js
      const menuToggle = document.querySelector('.menu-toggle');
      const navMenu = document.getElementById('navMenu');

      if (menuToggle && navMenu) {
        const closeMenu = () => {
          menuToggle.setAttribute('aria-expanded', 'false');
          navMenu.classList.remove('show-mobile');
        };

        const toggleMenu = (event) => {
          event.stopPropagation();
          const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
          const nextExpanded = !expanded;
          menuToggle.setAttribute('aria-expanded', String(nextExpanded));
          navMenu.classList.toggle('show-mobile', nextExpanded);
        };

        menuToggle.addEventListener('click', toggleMenu);

        navMenu.addEventListener('click', (event) => {
          const target = event.target instanceof HTMLElement ? event.target.closest('a') : null;
          if (target) {
            closeMenu();
          }
        });

        document.addEventListener('click', (event) => {
          if (!navMenu.classList.contains('show-mobile')) {
            return;
          }
          const eventTarget = event.target;
          if (!(eventTarget instanceof Node)) {
            return;
          }
          const clickInsideMenu = navMenu.contains(eventTarget);
          const clickToggle = menuToggle.contains(eventTarget);
          if (!clickInsideMenu && !clickToggle) {
            closeMenu();
          }
        });

        window.addEventListener('resize', () => {
          if (window.innerWidth > 880) {
            closeMenu();
          }
        });
      }
    })();

