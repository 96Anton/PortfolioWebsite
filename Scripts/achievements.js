(() => {
  function createProgressStore() {
    const endpoint = '/api/achievements';
    const localKey = 'achievement-progress';
    const supportsBeacon = typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function';
    let mode = window.location.protocol === 'file:' ? 'local' : 'server';
    let pendingSave = Promise.resolve();

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

    const writeLocal = (progress) => {
      try {
        window.localStorage.setItem(localKey, JSON.stringify(progress));
      } catch (error) {
        console.warn('Could not persist achievement progress to localStorage.', error);
      }
    };

    const load = async () => {
      if (mode === 'server') {
        try {
          const response = await fetch(endpoint, { cache: 'no-store' });
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

    const save = (progress) => {
      pendingSave = pendingSave.catch(() => undefined).then(async () => {
        if (mode === 'server') {
          try {
            const response = await fetch(endpoint, {
              method: 'POST',
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

    const flush = (progress) => {
      if (mode === 'server' && supportsBeacon) {
        try {
          const blob = new Blob([JSON.stringify(progress)], { type: 'application/json' });
          navigator.sendBeacon(endpoint, blob);
          return;
        } catch (error) {
          console.warn('Beacon failed, writing local copy.', error);
        }
      }
      writeLocal(progress);
    };

    return { load, save, flush };
  }

  async function achievementToggle() {
    const list = document.getElementById('achievements-list');
    if (!list) return;

    const items = Array.from(list.querySelectorAll('.achievement'));
    if (!items.length) return;

    const store = createProgressStore();
    const progress = await store.load();

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

    const persist = () => {
      const payload = { clicks, unlocked: Array.from(unlocked) };
      store.save(payload);
    };

    window.addEventListener('beforeunload', () => {
      const payload = { clicks, unlocked: Array.from(unlocked) };
      store.flush(payload);
    });

    const getKeyForItem = (item, trigger) => {
      if (item.dataset.achievementId) return item.dataset.achievementId;
      if (item.dataset.triggerSubmit) return `submit-${item.dataset.triggerSubmit}`;
      if (item.dataset.triggerSelector) return `selector-${item.dataset.triggerSelector}`;
      if (!Number.isNaN(trigger)) return `trigger-${trigger}`;
      if (item.dataset.triggerClick) return `click-${item.dataset.triggerClick}`;
      return `index-${items.indexOf(item)}`;
    };

    const showAchievement = (item, key) => {
      if (toastHost.querySelector(`[data-toast-key="${key}"]`)) {
        return;
      }

      const toast = item.cloneNode(true);
      toast.dataset.toastKey = key;
      toast.classList.add('show-achievement');
      toast.style.display = 'flex';

      unlocked.add(key);
      persist();

      toastHost.appendChild(toast);

      const duration = parseInt(item.dataset.duration || '10000', 10);
      if (duration > 0) {
        setTimeout(() => {
          toast.classList.remove('show-achievement');
          toast.remove();
        }, duration);
      }
    };

    const maybeUnlockAchievements = () => {
      items.forEach((item) => {
        const trigger = parseInt(item.dataset.triggerClick || '', 10);
        if (Number.isNaN(trigger)) return;

        const key = getKeyForItem(item, trigger);
        if (unlocked.has(key)) return;

        if (clicks >= trigger) {
          showAchievement(item, key);
        }
      });
    };

    maybeUnlockAchievements();

    document.addEventListener('click', () => {
      clicks += 1;
      persist();
      maybeUnlockAchievements();
    });

    const selectorAchievements = items
      .map((item) => {
        const selector = item.dataset.triggerSelector;
        if (!selector) return null;

        return {
          item,
          selector,
          key: getKeyForItem(item, Number.NaN),
        };
      })
      .filter(Boolean);

    const tryUnlockSelector = (startElement) => {
      if (!(startElement instanceof Element)) return;

      selectorAchievements.forEach(({ item, selector, key }) => {
        if (unlocked.has(key)) return;

        const target = startElement.closest(selector);
        if (!target) return;

        showAchievement(item, key);
      });
    };

    const handleSelectorInteraction = (event) => {
      const element = event.target instanceof Element ? event.target : null;
      tryUnlockSelector(element);
    };

    if (selectorAchievements.length) {
      document.addEventListener('click', handleSelectorInteraction);
      document.addEventListener('change', handleSelectorInteraction, true);
    }

    const submitAchievements = items
      .map((item) => {
        const selector = item.dataset.triggerSubmit;
        if (!selector) return null;

        return {
          item,
          selector,
          key: getKeyForItem(item, Number.NaN),
        };
      })
      .filter(Boolean);

    const handleFormSubmit = (event) => {
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

  achievementToggle().catch((error) => {
    console.error('Failed to initialise achievements.', error);
  });
})();
