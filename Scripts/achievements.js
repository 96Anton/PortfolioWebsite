(() => {
  // Grundkontroller som vi återanvänder för att slippa upprepa kod
  const isSecureNavigator = typeof navigator !== 'undefined';
  const scheduleMicrotask = typeof queueMicrotask === 'function'
    ? queueMicrotask
    : (cb) => Promise.resolve().then(cb);

  // Hanterar all laddning och spårning av uppladdningsdata
  function createProgressStore() {
    const endpointPath = '/api/achievements';
    const localKey = 'achievement-progress';
    const supportsBeacon = isSecureNavigator && typeof navigator.sendBeacon === 'function';
    const isFileProtocol = window.location.protocol === 'file:';
    const resolvedEndpoint = (() => {
      if (isFileProtocol) return endpointPath;
      try {
        return new URL(endpointPath, window.location.origin).toString();
      } catch (error) {
        console.warn('Could not resolve achievement endpoint, using relative path.', error);
        return endpointPath;
      }
    })();

    let mode = isFileProtocol ? 'local' : 'server';
    let pendingSave = Promise.resolve();

    // Läser lokal lagring om servern ej kan nås
    const readLocal = () => {
      try {
        const raw = window.localStorage.getItem(localKey);
        if (!raw) return { clicks: 0, unlocked: [] };
        const parsed = JSON.parse(raw);
        const clicks = Number.isFinite(parsed?.clicks) ? parsed.clicks : 0;
        const unlocked = Array.isArray(parsed?.unlocked) ? parsed.unlocked : [];
        return { clicks, unlocked };
      } catch (error) {
        console.warn('Could not read achievement progress from localStorage.', error);
        return { clicks: 0, unlocked: [] };
      }
    };

    // Skriver till lokal lagring som fallback eller offline-stöd
    const writeLocal = (progress) => {
      try {
        window.localStorage.setItem(localKey, JSON.stringify(progress));
      } catch (error) {
        console.warn('Could not persist achievement progress to localStorage.', error);
      }
    };

    // örsöker läsa från servern men faller tillbaka lokalt vid fel
    const load = async () => {
      if (mode === 'server') {
        try {
          const response = await fetch(resolvedEndpoint, {
            cache: 'no-store',
            credentials: 'same-origin',
            headers: {
              Accept: 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error(`Server responded with ${response.status}`);
          }
          const data = await response.json();
          const clicks = Number.isFinite(data?.clicks) ? data.clicks : 0;
          const unlocked = Array.isArray(data?.unlocked) ? data.unlocked : [];
          return { clicks, unlocked };
        } catch (error) {
          console.warn('Falling back to localStorage for achievements.', error);
          mode = 'local';
        }
      }
      return readLocal();
    };

    // Sparar progression och seriekopplar spårningar för att undvika race conditions
    const save = (progress) => {
      pendingSave = pendingSave.finally(async () => {
        if (mode === 'server') {
          try {
            const response = await fetch(resolvedEndpoint, {
              method: 'POST',
              credentials: 'same-origin',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(progress),
            });
            if (!response.ok) {
              throw new Error(`Server responded with ${response.status}`);
            }
            return;
          } catch (error) {
            console.warn('Server save failed, switching to localStorage.', error);
            mode = 'local';
          }
        }
        writeLocal(progress);
      });
      return pendingSave;
    };

    // Sista chansen att skriva data när sidan stängs
    const flush = (progress) => {
      if (mode === 'server' && supportsBeacon) {
        try {
          const blob = new Blob([JSON.stringify(progress)], { type: 'application/json' });
          navigator.sendBeacon(resolvedEndpoint, blob);
          return;
        } catch (error) {
          console.warn('Beacon failed, writing local copy.', error);
        }
      }
      writeLocal(progress);
    };

    return { load, save, flush };
  }

  // Styr upp hela achievement-logiken i gränssnittet
  async function achievementToggle() {
    const list = document.getElementById('achievements-list');
    if (!list) return;

    const items = Array.from(list.querySelectorAll('.achievement'));
    if (!items.length) return;

    // hämtar sparad progression så vi kan visa rätt status
    const store = createProgressStore();
    const progress = await store.load();

    // Skapar eller hittar behållaren för toast-meddelanden
    const getToastHost = () => {
      let host = document.getElementById('achievement-toast-root');
      if (!host) {
        host = document.createElement('div');
        host.id = 'achievement-toast-root';
        document.body.appendChild(host);
      }
      return host;
    };

    const toastHost = getToastHost();

    let clicks = Number.isFinite(progress.clicks) ? progress.clicks : 0;
    const unlocked = new Set(Array.isArray(progress.unlocked) ? progress.unlocked : []);

    // Bygger nytt payload-objekt och schemalägger sparning för effektivitet
    const toPayload = () => ({ clicks, unlocked: Array.from(unlocked) });
    let persistQueued = false;
    const persist = () => {
      if (persistQueued) return;
      persistQueued = true;
      scheduleMicrotask(() => {
        persistQueued = false;
        store.save(toPayload());
      });
    };

    // säkerställer att vi flushar datan om fliken stängs
    window.addEventListener('beforeunload', () => {
      store.flush(toPayload());
    });

    // Genererar stabila nycklar för att veta vilka achievements som är upplåsta
    const getKeyForItem = (item, trigger, index) => {
      const { dataset } = item;
      if (dataset.achievementId) return dataset.achievementId;
      if (dataset.triggerSubmit) return `submit-${dataset.triggerSubmit}`;
      if (dataset.triggerSelector) return `selector-${dataset.triggerSelector}`;
      if (!Number.isNaN(trigger)) return `trigger-${trigger}`;
      if (dataset.triggerClick) return `click-${dataset.triggerClick}`;
      return `index-${index}`;
    };

    // Visar ett nytt achievement-toast och sparar statusen
    const showAchievement = (item, key) => {
      if (toastHost.querySelector(`[data-toast-key="${key}"]`)) return;

      const toast = item.cloneNode(true);
      toast.dataset.toastKey = key;
      toast.classList.add('show-achievement');
      toast.style.display = 'flex';

      unlocked.add(key);
      persist();

      toastHost.appendChild(toast);

      const duration = Number.parseInt(item.dataset.duration || '10000', 10);
      if (duration > 0) {
        setTimeout(() => {
          toast.classList.remove('show-achievement');
          toast.remove();
        }, duration);
      }
    };

    // Förbereder klick-baserade achievements för snabb avstämning
    const clickAchievements = items.reduce((acc, item, index) => {
      const trigger = Number.parseInt(item.dataset.triggerClick || '', 10);
      if (Number.isNaN(trigger)) return acc;
      acc.push({ item, trigger, key: getKeyForItem(item, trigger, index) });
      return acc;
    }, []);

    // Kollar om nuvarande klick-nivå uppfyller några krav
    const maybeUnlockAchievements = () => {
      clickAchievements.forEach(({ item, key, trigger }) => {
        if (unlocked.has(key) || clicks < trigger) return;
        showAchievement(item, key);
      });
    };

    maybeUnlockAchievements();

    // räknar klick och provar upplåsa achievement efter varje klick-event
    document.addEventListener('click', () => {
      clicks += 1;
      persist();
      maybeUnlockAchievements();
    });

    // Rensar och trimmar selektorer för att undvika felaktiga matcher
    const sanitizeSelector = (selector) => {
      if (typeof selector !== 'string') return '';
      return selector.trim();
    };

    // Samlar ihop selector-baserade achievements som reagerar på DOM-traversering
    const selectorAchievements = items.reduce((acc, item, index) => {
      const selector = sanitizeSelector(item.dataset.triggerSelector);
      if (!selector) return acc;
      acc.push({ item, selector, key: getKeyForItem(item, Number.NaN, index) });
      return acc;
    }, []);

    // försöker matcha selektor mot element vi klickar eller ändrar
    const tryUnlockSelector = (startElement) => {
      if (!(startElement instanceof Element)) return;

      selectorAchievements.forEach(({ item, selector, key }) => {
        if (unlocked.has(key)) return;
        const target = startElement.closest(selector);
        if (!target) return;
        showAchievement(item, key);
      });
    };

    // Event-handler som triggar selektor-kollen vid klick och formulärändringar
    const handleSelectorInteraction = (event) => {
      const element = event.target instanceof Element ? event.target : null;
      tryUnlockSelector(element);
    };

    if (selectorAchievements.length) {
      document.addEventListener('click', handleSelectorInteraction);
      document.addEventListener('change', handleSelectorInteraction, true);
    }

    // Samlar ihop submit-baserade achievements för formulärkontroller
    const submitAchievements = items.reduce((acc, item, index) => {
      const selector = sanitizeSelector(item.dataset.triggerSubmit);
      if (!selector) return acc;
      acc.push({ item, selector, key: getKeyForItem(item, Number.NaN, index) });
      return acc;
    }, []);

    // Hanterar formulärsubmit som kan ropa ut ett achievement
    const handleFormSubmit = (event) => {
      if (!(event.target instanceof Element)) return;
      submitAchievements.forEach(({ item, selector, key }) => {
        if (unlocked.has(key)) return;
        const target = event.target.closest(selector);
        if (!target) return;
        showAchievement(item, key);
      });
    };

    if (submitAchievements.length) {
      document.addEventListener('submit', handleFormSubmit, true);
    }
  }

  // Startar upp togglern och loggar eventuella fel i konsolen
  achievementToggle().catch((error) => {
    console.error('Failed to initialise achievements.', error);
  });
})();
