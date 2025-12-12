    // Mobile flip card interaction
    document.addEventListener('DOMContentLoaded', function() {
      const flipCards = document.querySelectorAll('.flip-card');
      
      flipCards.forEach(card => {
        card.addEventListener('click', function() {
          // Only toggle on mobile (768px and below)
          if (window.innerWidth <= 768) {
            this.classList.toggle('flipped');
          }
        });
      });
    });

    // Confetti effect for fancy button
    document.addEventListener('DOMContentLoaded', function() {
      const fancyBtn = document.querySelector('.fancy-btn');
      const colors = ['#ff6ec4', '#7873f5', '#4ade80', '#facc15', '#f97316'];
      
      if (fancyBtn) {
        fancyBtn.addEventListener('click', function(e) {
          e.preventDefault();

          
          // Get click position instead of button center
          const clickX = e.clientX;
          const clickY = e.clientY;
          
          // Create 50 confetti particles
          for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-particle';
            confetti.style.left = clickX + 'px';
            confetti.style.top = clickY + 'px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // Random direction in full 360 degrees
            const angle = Math.random() * Math.PI * 2;
            const distance = 20 + Math.random() * 20; // 20-40px range
            const spreadX = Math.cos(angle) * distance;
            const spreadY = Math.sin(angle) * distance;
            
            confetti.style.setProperty('--x', spreadX + 'px');
            confetti.style.setProperty('--y', spreadY + 'px');
            
            // Slightly randomized duration
            const duration = 0.4 + Math.random() * 0.2;
            confetti.style.animation = `confettiFall ${duration}s ease-out forwards`;
            confetti.style.animationDelay = Math.random() * 0.1 + 's';
            
            document.body.appendChild(confetti);
            
            // Remove particle after animation
            setTimeout(() => confetti.remove(), (duration + 0.1) * 1000 + 100);
          }
        });
      }
    });

    // Glassmorphism card stack navigation
    document.addEventListener('DOMContentLoaded', function() {
      const cards = document.querySelectorAll('.glass-card');
      const prevBtn = document.getElementById('glass-prev');
      const nextBtn = document.getElementById('glass-next');
      let currentIndex = 0;

      function updateCards() {
        cards.forEach((card, index) => {
          card.classList.remove('active', 'next', 'prev');
          
          if (index === currentIndex) {
            card.classList.add('active');
          } else if (index === (currentIndex + 1) % cards.length) {
            card.classList.add('next');
          } else if (index === (currentIndex - 1 + cards.length) % cards.length) {
            card.classList.add('prev');
          }
        });
      }

      function showNext() {
        currentIndex = (currentIndex + 1) % cards.length;
        updateCards();
      }

      function showPrev() {
        currentIndex = (currentIndex - 1 + cards.length) % cards.length;
        updateCards();
      }

      if (nextBtn) {
        nextBtn.addEventListener('click', showNext);
      }

      if (prevBtn) {
        prevBtn.addEventListener('click', showPrev);
      }

      // Click on cards to bring them to front
      cards.forEach((card, index) => {
        card.addEventListener('click', function() {
          if (!this.classList.contains('active')) {
            currentIndex = index;
            updateCards();
          }
        });
      });
    });

    // Stairway navigation links
    document.addEventListener('DOMContentLoaded', function() {
    function sparanWrap(element) {
      const originalText = element.textContent;
      element.setAttribute('aria-label', originalText);
      
      // Split text into individual characters
      const letters = originalText.split('');

      const wrappedLetters = letters
        .map((letter, index) => {
          // Handle spaces properly
          const char = letter === ' ' ? ' ' : letter;
          return `<span class="letter" style="transition-delay: ${index * 0.03}s;">
            <span class="top" style="transition-delay: ${index * 0.03}s;">${char}</span>
            <span class="bottom" style="transition-delay: ${index * 0.03}s;">${char}</span>
          </span>`;
        })
        .join('');
      
      element.innerHTML = wrappedLetters;
    }

    const els = document.querySelectorAll('.stairway-list a');
    els.forEach((el) => {
      sparanWrap(el);
    });
  });
