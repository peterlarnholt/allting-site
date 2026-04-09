/* ============================================
   Allting — Main JavaScript
   Premium animated graphics & interactions
   ============================================ */

(function () {
  'use strict';

  // --- Navigation: scroll background ---
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // --- Mobile menu toggle ---
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    links.classList.toggle('open');
    document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu when a link is clicked
  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      links.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // --- Scroll-triggered fade-in animations ---
  const fadeEls = document.querySelectorAll('.fade-in');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeEls.forEach(el => observer.observe(el));
  } else {
    // Fallback: show everything
    fadeEls.forEach(el => el.classList.add('visible'));
  }

  // --- Active nav link highlighting ---
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');

  const highlightNav = () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 120;
      if (window.scrollY >= top) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.style.color = '';
      if (link.getAttribute('href') === '#' + current) {
        link.style.color = '#FFFFFF';
      }
    });
  };

  window.addEventListener('scroll', highlightNav, { passive: true });

  // ============================================
  // 1. Animated Hero Background — Particle Network
  // ============================================
  const canvas = document.getElementById('heroCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animFrameId;
    let width, height;

    function isMobile() {
      return window.innerWidth < 768;
    }

    function resize() {
      const hero = document.getElementById('hero');
      width = canvas.width = hero.offsetWidth;
      height = canvas.height = hero.offsetHeight;
    }

    function createParticles() {
      const count = isMobile() ? 30 : 70;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          r: Math.random() * 2.5 + 1,
          opacity: Math.random() * 0.5 + 0.2,
        });
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, width, height);

      const connectionDist = isMobile() ? 100 : 150;

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            const alpha = (1 - dist / connectionDist) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = 'rgba(255, 255, 255, ' + alpha + ')';
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, ' + p.opacity + ')';
        ctx.fill();

        // Subtle glow on larger particles
        if (p.r > 2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r + 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(59, 130, 246, ' + (p.opacity * 0.15) + ')';
          ctx.fill();
        }

        // Move
        p.x += p.vx;
        p.y += p.vy;

        // Bounce off edges
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Keep in bounds
        p.x = Math.max(0, Math.min(width, p.x));
        p.y = Math.max(0, Math.min(height, p.y));
      }

      animFrameId = requestAnimationFrame(drawParticles);
    }

    function initCanvas() {
      resize();
      createParticles();
      drawParticles();
    }

    // Only animate when hero is visible
    let canvasRunning = false;
    const heroSection = document.getElementById('hero');

    if ('IntersectionObserver' in window) {
      const canvasObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !canvasRunning) {
            canvasRunning = true;
            drawParticles();
          } else if (!entry.isIntersecting && canvasRunning) {
            canvasRunning = false;
            cancelAnimationFrame(animFrameId);
          }
        });
      }, { threshold: 0 });
      canvasObserver.observe(heroSection);
    }

    window.addEventListener('resize', () => {
      resize();
      createParticles();
    });

    initCanvas();
  }

  // ============================================
  // 2. Animated Stat Counters
  // ============================================
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const prefix = el.dataset.prefix || '';
    const suffix = el.dataset.suffix || '';
    const useSeparator = el.dataset.separator === ',';
    const decimals = parseInt(el.dataset.decimals) || 0;
    const duration = 2000;
    const startTime = performance.now();

    // Don't animate zero
    if (target === 0) {
      el.textContent = prefix + '0' + suffix;
      return;
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      let current = target * easedProgress;

      let formatted;
      if (decimals > 0) {
        formatted = current.toFixed(decimals);
      } else {
        formatted = Math.round(current).toString();
      }

      if (useSeparator) {
        formatted = parseInt(formatted).toLocaleString('en-US');
      }

      el.textContent = prefix + formatted + suffix;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  const counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );
    counters.forEach(c => counterObserver.observe(c));
  }

  // ============================================
  // 3. Flywheel Circular Animation
  // ============================================
  const flywheelEl = document.getElementById('flywheelCircular');
  if (flywheelEl) {
    const dots = flywheelEl.querySelectorAll('.flywheel-dot');
    const svg = flywheelEl.querySelector('.flywheel-ring-svg');
    const cx = 150, cy = 150, r = 130;
    let flywheelAngle = 0;
    let flywheelRunning = false;
    let flywheelFrame;

    function updateFlywheelDots() {
      dots.forEach((dot, i) => {
        const offset = i * 0.15;
        const angle = flywheelAngle - offset;
        const x = cx + r * Math.cos(angle);
        const y = cy + r * Math.sin(angle);
        dot.setAttribute('cx', x);
        dot.setAttribute('cy', y);
      });

      flywheelAngle += 0.012;
      if (flywheelRunning) {
        flywheelFrame = requestAnimationFrame(updateFlywheelDots);
      }
    }

    if ('IntersectionObserver' in window) {
      const flywheelObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !flywheelRunning) {
            flywheelRunning = true;
            updateFlywheelDots();
          } else if (!entry.isIntersecting && flywheelRunning) {
            flywheelRunning = false;
            cancelAnimationFrame(flywheelFrame);
          }
        });
      }, { threshold: 0.1 });
      flywheelObserver.observe(flywheelEl);
    }
  }

})();
