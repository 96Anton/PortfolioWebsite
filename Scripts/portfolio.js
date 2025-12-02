// Lokala interaktioner för navigation, kontaktformulär och smooth scrolling
(function () {
  // Cachea dokumentobjekt för att slippa slå upp det flera gånger
  const doc = document;
  const root = doc.documentElement;

  // Uppdatera årtal i sidfoten automatiskt
  const year = doc.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Kontaktformulär med statusmeddelanden och säker fetch-postning
  const contactForm = doc.getElementById('contactForm');
  const contactStatus = doc.getElementById('contactStatus');
  if (contactForm && contactStatus) {
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const message = (formData.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        contactStatus.textContent = 'Fyll i alla fält.';
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
      }

      contactStatus.textContent = 'Skickar...';

      const actionUrl = (() => {
        try {
          return new URL(contactForm.getAttribute('action') || contactForm.action || './', window.location.href).toString();
        } catch (error) {
          console.warn('Ogiltig action-url för formuläret, använder fallback.', error);
          return contactForm.action || window.location.href;
        }
      })();

      try {
        const response = await fetch(actionUrl, {
          method: 'POST',
          body: formData,
          credentials: 'same-origin',
          redirect: 'follow',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'fetch',
          },
        });

        if (response.ok) {
          contactStatus.textContent = 'Tack! Ditt meddelande skickades.';
          contactForm.reset();
          return;
        }

        const data = await response.json().catch(() => null);
        const errorMessage = data?.errors?.[0]?.message || 'Kunde inte skicka meddelandet.';
        contactStatus.textContent = errorMessage;
      } catch (error) {
        console.warn('Formulärpostningen misslyckades.', error);
        contactStatus.textContent = 'Något gick fel. Försök igen senare.';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  }

  // Temahantering via checkbox och lagrad preferens
  const themeToggle = doc.getElementById('checkbox');
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
    setThemeAttribute(root, normalizedTheme);
    setThemeAttribute(doc.body, normalizedTheme);
    if (root) {
      root.style.colorScheme = normalizedTheme;
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
    doc.dispatchEvent(new CustomEvent('portfolio:theme-change', { detail: { theme } }));
  };

  const storedTheme = readStoredTheme();
  const initialTheme = storedTheme || 'dark';

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', () => applyTheme(initialTheme), { once: true });
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

  // Lyssna på systemets färgtema om användaren inte valt eget
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

  // Hemligt hover-äggelement som ligger kvar i hovrat läge
  const stickyHoverTargets = doc.querySelectorAll('.secret-circle, .secret-circle-container');
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

  // Mobile-nav: öppna/stäng meny med aria-attribut och klickdetektering
  const menuToggle = doc.querySelector('.menu-toggle');
  const navMenu = doc.getElementById('navMenu');

  if (menuToggle && navMenu) {
    const closeMenu = () => {
      if (!navMenu.classList.contains('show-mobile')) {
        return;
      }
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
// Lokala interaktioner för navigation, kontaktformulär och smooth scrolling
(function () {
  // Cachea dokumentobjekt för att slippa slå upp det flera gånger
  const doc = document;
  const root = doc.documentElement;

  // Uppdatera årtal i sidfoten automatiskt
  const year = doc.getElementById('year');
  if (year) {
    year.textContent = new Date().getFullYear();
  }

  // Kontaktformulär med statusmeddelanden och säker fetch-postning
  const contactForm = doc.getElementById('contactForm');
  const contactStatus = doc.getElementById('contactStatus');
  if (contactForm && contactStatus) {
    const submitButton = contactForm.querySelector('button[type="submit"]');

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const message = (formData.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        contactStatus.textContent = 'Fyll i alla fält.';
        return;
      }

      if (submitButton) {
        submitButton.disabled = true;
      }

      contactStatus.textContent = 'Skickar...';

      const actionUrl = (() => {
        try {
          return new URL(contactForm.getAttribute('action') || contactForm.action || './', window.location.href).toString();
        } catch (error) {
          console.warn('Ogiltig action-url för formuläret, använder fallback.', error);
          return contactForm.action || window.location.href;
        }
      })();

      try {
        const response = await fetch(actionUrl, {
          method: 'POST',
          body: formData,
          credentials: 'same-origin',
          redirect: 'follow',
          headers: {
            Accept: 'application/json',
            'X-Requested-With': 'fetch',
          },
        });

        if (response.ok) {
          contactStatus.textContent = 'Tack! Ditt meddelande skickades.';
          contactForm.reset();
          return;
        }

        const data = await response.json().catch(() => null);
        const errorMessage = data?.errors?.[0]?.message || 'Kunde inte skicka meddelandet.';
        contactStatus.textContent = errorMessage;
      } catch (error) {
        console.warn('Formulärpostningen misslyckades.', error);
        contactStatus.textContent = 'Något gick fel. Försök igen senare.';
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
        }
      }
    });
  }

  // Temahantering via checkbox och lagrad preferens
  const themeToggle = doc.getElementById('checkbox');
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
    setThemeAttribute(root, normalizedTheme);
    setThemeAttribute(doc.body, normalizedTheme);
    if (root) {
      root.style.colorScheme = normalizedTheme;
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
    doc.dispatchEvent(new CustomEvent('portfolio:theme-change', { detail: { theme } }));
  };

  const storedTheme = readStoredTheme();
  const initialTheme = storedTheme || 'dark';

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', () => applyTheme(initialTheme), { once: true });
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

  // Lyssna på systemets färgtema om användaren inte valt eget
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

  // Hemligt hover-äggelement som ligger kvar i hovrat läge
  const stickyHoverTargets = doc.querySelectorAll('.secret-circle, .secret-circle-container');
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

  // Mobile-nav: öppna/stäng meny med aria-attribut och klickdetektering
  const menuToggle = doc.querySelector('.menu-toggle');
  const navMenu = doc.getElementById('navMenu');

  if (menuToggle && navMenu) {
    const closeMenu = () => {
      if (!navMenu.classList.contains('show-mobile')) {
        return;
      }
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

    doc.addEventListener('click', (event) => {
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

