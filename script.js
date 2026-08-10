// ========================
// MOBILE NAV TOGGLE
// ========================
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  // Close mobile nav when clicking a link
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ========================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ========================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      const offset = 80; // navbar height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ========================
// ACTIVE NAV LINK ON SCROLL
// ========================
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

function highlightNav() {
  const scrollPos = window.scrollY + 150;
  sections.forEach(section => {
    const top = section.offsetTop;
    const height = section.offsetHeight;
    const id = section.getAttribute('id');
    if (scrollPos >= top && scrollPos < top + height) {
      navItems.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
      });
    }
  });
}

window.addEventListener('scroll', highlightNav, { passive: true });

// ========================
// BACK TO TOP BUTTON
// ========================
const backToTop = document.querySelector('.back-to-top');
if (backToTop) {
  window.addEventListener('scroll', () => {
    backToTop.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
}

// ========================
// SCROLL-TRIGGERED REVEAL ANIMATIONS
// ========================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target); // only animate once
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .project-card, .pricing-card, .service-item, .process-step, .testimonial, .about-stats').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

// ========================
// TYPEWRITER EFFECT
// ========================
const typewriterEl = document.getElementById('typewriter');
if (typewriterEl) {
  const words = ['Web Designer', 'Frontend Developer', 'Brand Builder'];
  let wordIndex = 0;
  let charIndex = 0;
  let currentWord = '';
  let isDeleting = false;

  function type() {
    const fullWord = words[wordIndex];
    if (!isDeleting) {
      currentWord = fullWord.substring(0, charIndex + 1);
      charIndex++;
      typewriterEl.textContent = currentWord;
      if (charIndex === fullWord.length) {
        isDeleting = true;
        setTimeout(type, 2000);
        return;
      }
    } else {
      currentWord = fullWord.substring(0, charIndex - 1);
      charIndex--;
      typewriterEl.textContent = currentWord;
      if (charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % words.length;
      }
    }
    setTimeout(type, isDeleting ? 40 : 120);
  }
  type();
}

// ========================
// GSAP PARALLAX (Home only)
// ========================
if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  
  gsap.to('.hero-bg', {
    y: 100,
    ease: 'none',
    scrollTrigger: {
      trigger: '.hero',
      start: 'top top',
      end: 'bottom top',
      scrub: true,
    },
  });
}

// ========================
// CONTACT PARTICLES
// ========================
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  let animationId;
  
  function resizeCanvas() {
    const parent = canvas.parentElement;
    if (!parent) return;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class Particle {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.4 + 0.2;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
        this.reset();
      }
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${this.opacity})`;
      ctx.fill();
    }
  }
  
  for (let i = 0; i < 60; i++) {
    particles.push(new Particle());
  }
  
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    animationId = requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ========================
// CONTACT FORM
// ========================
const contactForm = document.getElementById('contact-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Reset status
    formStatus.className = 'form-status';
    formStatus.textContent = '';
    
    // Loading state
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    
    const formData = new FormData(contactForm);
    const data = {
      name: formData.get('name').trim(),
      email: formData.get('email').trim(),
      phone: formData.get('phone').trim(),
      message: formData.get('message').trim(),
      timestamp: new Date().toISOString(),
    };
    
    // Client-side validation
    if (!data.name || !data.email || !data.message) {
      showFormError('Please fill in all required fields.');
      return;
    }
    
    // Save to localStorage (backup)
    try {
      const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      messages.push(data);
      localStorage.setItem('contactMessages', JSON.stringify(messages));
    } catch (err) {
      // localStorage might be full or disabled
    }
    
    // Send to API
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showFormSuccess('Message sent! I\'ll get back to you within 24 hours.');
        contactForm.reset();
      } else {
        showFormError(result.error || 'Something went wrong. Please try WhatsApp instead.');
      }
    } catch (err) {
      showFormError('Email service is down. Your message is saved — I\'ll check it soon.');
    }
  });
}

function showFormSuccess(msg) {
  formStatus.textContent = msg;
  formStatus.className = 'form-status success';
  submitBtn.disabled = false;
  submitBtn.classList.remove('loading');
}

function showFormError(msg) {
  formStatus.textContent = msg;
  formStatus.className = 'form-status error';
  submitBtn.disabled = false;
  submitBtn.classList.remove('loading');
}

// ========================
// ADMIN PANEL
// ========================
const adminLoginDiv = document.getElementById('admin-login');
const adminDashboardDiv = document.getElementById('admin-dashboard');
const passwordInput = document.getElementById('admin-password');
const loginBtn = document.getElementById('admin-login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('admin-logout');
const messagesContainer = document.getElementById('messages-container');

function adminCheck() {
  const loggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';
  if (loggedIn) {
    adminLoginDiv.style.display = 'none';
    adminDashboardDiv.style.display = 'block';
    renderMessages();
  } else {
    adminLoginDiv.style.display = 'block';
    adminDashboardDiv.style.display = 'none';
  }
}

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    if (passwordInput.value === 'negusx2026') {
      sessionStorage.setItem('adminLoggedIn', 'true');
      adminCheck();
    } else {
      loginError.textContent = 'Incorrect password';
    }
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    adminCheck();
  });
}

function renderMessages() {
  const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
  if (messages.length === 0) {
    messagesContainer.innerHTML = '<p style="text-align:center;opacity:0.7;">No messages yet.</p>';
    return;
  }
  
  let html = '';
  messages.forEach((msg, index) => {
    const date = new Date(msg.timestamp).toLocaleString();
    html += `
      <div class="message-item">
        <p><strong>${escapeHtml(msg.name)}</strong> (${escapeHtml(msg.email)})</p>
        <p>📞 ${escapeHtml(msg.phone) || 'N/A'}</p>
        <p>💬 ${escapeHtml(msg.message)}</p>
        <p><small>${date}</small></p>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;
  });
  messagesContainer.innerHTML = html;
  
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.getAttribute('data-index');
      const msgs = JSON.parse(localStorage.getItem('contactMessages') || '[]');
      msgs.splice(idx, 1);
      localStorage.setItem('contactMessages', JSON.stringify(msgs));
      renderMessages();
    });
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Check admin on load if hash is admin
if (window.location.hash === '#admin') {
  adminCheck();
}
