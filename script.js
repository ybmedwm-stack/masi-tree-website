// ==========================================================================
// MASI TREE LLC — Interactive Behaviors
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navBackdrop = document.getElementById('nav-backdrop');

  const setMenu = (open) => {
    navToggle.classList.toggle('active', open);
    navMenu.classList.toggle('active', open);
    if (navBackdrop) navBackdrop.classList.toggle('active', open);
    navToggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
    if (open) {
      const first = navMenu.querySelector('a');
      if (first) first.focus();
    }
  };

  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      setMenu(!navMenu.classList.contains('active'));
    });

    // Close menu on link click
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenu(false));
    });

    if (navBackdrop) {
      navBackdrop.addEventListener('click', () => setMenu(false));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        setMenu(false);
        navToggle.focus();
      }
    });
  }

  // Header scroll effect
  const header = document.getElementById('header');

  window.addEventListener('scroll', () => {
    header.classList.toggle('header--scrolled', window.scrollY > 50);
  }, { passive: true });

  // Hero video: keep the poster image visible until the video is actually playing
  const heroVideo = document.querySelector('.hero__bg-video');
  if (heroVideo) {
    heroVideo.addEventListener('playing', () => {
      heroVideo.classList.add('is-playing');
    });
    heroVideo.addEventListener('error', () => {
      heroVideo.classList.remove('is-playing');
    });
  }

  // Scroll-triggered animations
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
      '.service-card, .feature, .review, .trust__fact, .about__content, .about__image-wrap, .contact__info, .contact__form-wrap, .gallery__item'
    ).forEach((el) => {
      el.classList.add('fade-target');
      observer.observe(el);
    });
  }

  // Contact form — posts to Formspree, reports real success or failure
  const form = document.getElementById('contact-form');
  if (form) {
    const status = document.getElementById('form-status');
    const btn = form.querySelector('button[type="submit"]');
    const idleText = btn.textContent;

    const showStatus = (kind, html) => {
      status.className = `form__status form__status--${kind}`;
      status.innerHTML = html;
      status.hidden = false;
    };

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Mark missing/invalid fields and say so in the status region (native bubbles vanish too fast)
      const invalid = [...form.querySelectorAll('.form__input')].filter(el => !el.checkValidity());
      form.querySelectorAll('.form__input').forEach(el => el.removeAttribute('aria-invalid'));
      if (invalid.length) {
        invalid.forEach(el => el.setAttribute('aria-invalid', 'true'));
        const labels = invalid.map(el => form.querySelector(`label[for="${el.id}"]`).firstChild.textContent.trim().toLowerCase());
        showStatus('error',
          `<strong>Please add your ${labels.join(' and ')}.</strong> ` +
          'Eric needs a number to call you back.');
        invalid[0].focus();
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Sending…';
      status.hidden = true;

      try {
        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        form.reset();
        form.hidden = true;
        showStatus('success',
          '<strong>Got it. Eric will be in touch.</strong> ' +
          'Need someone sooner? Call <a href="tel:2077527791">(207) 752-7791</a>.');
        status.focus();
      } catch (err) {
        showStatus('error',
          '<strong>That didn’t go through.</strong> Your message is still here — try again, ' +
          'or call <a href="tel:2077527791">(207) 752-7791</a> and we’ll take it over the phone.');
        status.focus();
      } finally {
        btn.disabled = false;
        btn.textContent = idleText;
      }
    });
  }
});
