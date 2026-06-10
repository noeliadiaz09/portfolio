(() => {
  'use strict';

  /* --- Navbar scroll --- */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  /* --- Hamburger --- */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.querySelector('.nav-links');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', open);
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  /* --- Typing effect --- */
  const phrases = [
    'Desarrolladora Web',
    'Técnica DAW',
    'PHP & Laravel',
    'JavaScript Dev',
    'Apasionada del código',
  ];

  let phraseIndex = 0;
  let charIndex   = 0;
  let isDeleting  = false;
  const typingEl  = document.getElementById('typing');

  function type() {
    const current = phrases[phraseIndex];
    typingEl.textContent = isDeleting
      ? current.substring(0, charIndex - 1)
      : current.substring(0, charIndex + 1);

    isDeleting ? charIndex-- : charIndex++;

    let delay = isDeleting ? 60 : 100;
    if (!isDeleting && charIndex === current.length) {
      delay = 2000; isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      delay = 400;
    }
    setTimeout(type, delay);
  }
  type();

  /* --- Scroll reveal --- */
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 80);
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  /* --- Particles --- */
  const canvas = document.getElementById('particles-canvas');
  const ctx    = canvas.getContext('2d');
  const ACCENT = '0, 245, 212';

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas, { passive: true });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x       = Math.random() * canvas.width;
      this.y       = Math.random() * canvas.height;
      this.size    = Math.random() * 1.5 + 0.5;
      this.speedX  = (Math.random() - 0.5) * 0.3;
      this.speedY  = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.1;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width)  this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height)  this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${ACCENT}, ${this.opacity})`;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: 60 }, () => new Particle());

  function drawLines() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx   = particles[i].x - particles[j].x;
        const dy   = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(${ACCENT}, ${0.06 * (1 - dist / 120)})`;
          ctx.lineWidth   = 0.5;
          ctx.stroke();
        }
      }
    }
  }

  (function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animateParticles);
  })();

  /* --- Contact form --- */
  const EJ_PK  = 'AWNziD6SGFUKNcfeJ';
  const EJ_SVC = 'service_8rwv30a';
  const EJ_TPL = 'template_3qw537l';

  emailjs.init({ publicKey: EJ_PK });

  const form      = document.getElementById('contactForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  const ORIGINAL_TEXT = submitBtn.textContent;

  let lastSubmit  = 0;
  const COOLDOWN  = 60000;

  function sanitize(str) {
    return str.trim().replace(/[<>"'`]/g, '').substring(0, 500);
  }

  function setBtn(text, color, disabled) {
    submitBtn.textContent = text;
    submitBtn.style.background = color;
    submitBtn.disabled = disabled;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (form._hp && form._hp.value) return;

    const now = Date.now();
    if (now - lastSubmit < COOLDOWN) {
      setBtn('Espera un momento antes de volver a enviar.', '#febc2e', true);
      setTimeout(() => setBtn(ORIGINAL_TEXT, '', false), 4000);
      return;
    }

    const nombre  = sanitize(form.nombre.value);
    const email   = sanitize(form.email.value);
    const mensaje = sanitize(form.mensaje.value);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!nombre || !emailRegex.test(email) || !mensaje) {
      setBtn('Revisa los campos e inténtalo de nuevo.', '#febc2e', false);
      setTimeout(() => setBtn(ORIGINAL_TEXT, '', false), 4000);
      return;
    }

    const recaptchaToken = grecaptcha.getResponse();
    if (!recaptchaToken) {
      setBtn('Confirma que no eres un robot.', '#febc2e', false);
      setTimeout(() => setBtn(ORIGINAL_TEXT, '', false), 4000);
      return;
    }

    setBtn('Enviando...', '', true);

    try {
      await emailjs.send(EJ_SVC, EJ_TPL, {
        from_name:  nombre,
        from_email: email,
        message:    mensaje,
        to_name:    'Noelia',
        reply_to:   email,
      });
      lastSubmit = Date.now();
      setBtn('¡Mensaje enviado! ✓', '#28c840', true);
      form.reset();
      grecaptcha.reset();
      setTimeout(() => setBtn(ORIGINAL_TEXT, '', false), 4000);
    } catch {
      setBtn('No se pudo enviar. Inténtalo de nuevo.', '#ff5f57', false);
      setTimeout(() => setBtn(ORIGINAL_TEXT, '', false), 5000);
    }
  });

  /* --- Active nav on scroll --- */
  const sections   = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navAnchors.forEach(a => a.classList.remove('active'));
          const active = document.querySelector(`.nav-links a[href="#${entry.target.id}"]`);
          if (active) active.classList.add('active');
        }
      });
    },
    { threshold: 0.4 }
  );
  sections.forEach(s => sectionObserver.observe(s));

})();
