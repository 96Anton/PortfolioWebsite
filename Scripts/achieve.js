
(function () {
      const STORAGE_KEY = 'achievement-progress';
      const endpointPath = '/api/achievements';
      const isFileProtocol = window.location.protocol === 'file:';

      const resolvedEndpoint = (function () {
        if (isFileProtocol) {
          return endpointPath;
        }
        try {
          return new URL(endpointPath, window.location.origin).toString();
        } catch (error) {
          console.warn('Could not resolve achievement endpoint, using relative path.', error);
          return endpointPath;
        }
      })();

      const sanitizeProgress = (data) => {
        const clicks = Number.isFinite(data && data.clicks) ? data.clicks : 0;
        const unlocked = Array.isArray(data && data.unlocked) ? data.unlocked : [];
        return { clicks, unlocked };
      };

      const readLocal = () => {
        try {
          const raw = window.localStorage.getItem(STORAGE_KEY);
          if (!raw) {
            return { clicks: 0, unlocked: [] };
          }
          return sanitizeProgress(JSON.parse(raw));
        } catch (error) {
          console.warn('Could not read achievement progress from localStorage.', error);
          return { clicks: 0, unlocked: [] };
        }
      };

      const loadProgress = async () => {
        if (!isFileProtocol) {
          try {
            const response = await fetch(resolvedEndpoint, {
              cache: 'no-store',
              credentials: 'same-origin',
              headers: { Accept: 'application/json' },
            });
            if (!response.ok) {
              throw new Error('Server responded with ' + response.status);
            }
            const data = await response.json();
            return { data: sanitizeProgress(data), mode: 'server' };
          } catch (error) {
            console.warn('Falling back to local achievements.', error);
          }
        }
        return { data: readLocal(), mode: 'local' };
      };

      const formatNumber = (value) => {
        try {
          return Number(value || 0).toLocaleString('sv-SE');
        } catch (error) {
          return String(value || 0);
        }
      };

      const updateUI = ({ data, mode }) => {
        const items = document.querySelectorAll('[data-achievement-key]');
        if (!items.length) {
          return;
        }

        const total = items.length;
        const unlockedKeys = new Set(data.unlocked || []);
        let unlockedCount = 0;

        items.forEach((item) => {
          const key = item.getAttribute('data-achievement-key');
          const status = item.querySelector('[data-status-for]');
          const unlocked = key && unlockedKeys.has(key);
          item.setAttribute('data-state', unlocked ? 'unlocked' : 'locked');
          if (status) {
            status.setAttribute('data-state', unlocked ? 'unlocked' : 'locked');
            const statusText = status.querySelector('[data-status-text]');
            if (statusText) {
              statusText.textContent = unlocked ? 'Upplåst' : 'Låst';
            }
          }
          if (unlocked) {
            unlockedCount += 1;
          }
        });

        const summaryUnlocked = document.querySelector('[data-summary="unlocked"]');
        if (summaryUnlocked) {
          summaryUnlocked.textContent = unlockedCount;
        }

        const summaryTotal = document.querySelector('[data-summary="total"]');
        if (summaryTotal) {
          summaryTotal.textContent = total;
        }

        const summaryClicks = document.querySelector('[data-summary="clicks"]');
        if (summaryClicks) {
          summaryClicks.textContent = formatNumber(data.clicks);
        }

        const summaryPercentage = document.querySelector('[data-summary="percentage"]');
        if (summaryPercentage) {
          const percentage = total > 0 ? Math.round((unlockedCount / total) * 100) : 0;
          summaryPercentage.textContent = percentage + '%';
        }

        const summaryMode = document.querySelector('[data-summary="mode"]');
        if (summaryMode) {
          summaryMode.textContent = mode === 'server' ? 'Synkad' : 'Lokal lagring';
        }

        const emptyMessage = document.querySelector('[data-achievement-empty]');
        if (emptyMessage) {
          emptyMessage.hidden = unlockedCount > 0;
        }
      };

      document.addEventListener('achievement:progress', (event) => {
        const detail = event.detail || {};
        const data = detail.progress ? sanitizeProgress(detail.progress) : readLocal();
        const mode = detail.mode || 'local';
        updateUI({ data, mode });
      });

      loadProgress()
        .then((result) => {
          updateUI(result);
        })
        .catch((error) => {
          console.error('Failed to render achievement list.', error);
          updateUI({ data: readLocal(), mode: 'local' });
        });
    })();
