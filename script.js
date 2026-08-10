// ========================
// SPA ROUTING & UTILITIES
// ========================
const pages = {
  home: document.getElementById('home'),
  about: document.getElementById('about'),
  services: document.getElementById('services'),
  contact: document.getElementById('contact'),
  admin: document.getElementById('admin'),
};

let currentPage = 'home';

function navigateTo(pageId) {
  if (!pages[pageId]) return;
  // Hide all
  Object.values(pages).forEach(p => p.classList.remove('active'));
  // Show target
  pages[pageId].classList.add('active');
  currentPage = pageId;
  window.scrollTo(0, 0);
  
  // Update nav active class
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${pageId}`);
  });
  
  // Refresh GSAP ScrollTrigger after layout
  setTimeout(() => {
    ScrollTrigger.refresh();
  }, 200);
}

// Hash listener
window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1) || 'home';
  navigateTo(hash);
  if (hash === 'admin') adminCheck();
});

// Initial load
window.addEventListener('load', () => {
  const hash = window.location.hash.slice(1) || 'home';
  navigateTo(hash);
  if (hash === 'admin') adminCheck();
});

// ========================
// TYPEWRITER EFFECT (Home)
// ========================
const typewriterEl = document.getElementById('typewriter');
if (typewriterEl) {
  const words = ['Crafting Digital Royalty', 'Premium Web Experiences', 'Where Luxury Meets Code'];
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
        setTimeout(type, 1500);
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
    setTimeout(type, isDeleting ? 50 : 100);
  }
  type();
}

// ========================
// GSAP ANIMATIONS
// ========================
gsap.registerPlugin(ScrollTrigger);

// Home parallax
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

// About text reveal (split into words)
function setupAboutReveal() {
  const aboutDiv = document.getElementById('about-reveal');
  if (!aboutDiv) return;
  const originalText = aboutDiv.textContent.trim();
  aboutDiv.innerHTML = ''; // clear
  const words = originalText.split(' ');
  words.forEach(word => {
    const span = document.createElement('span');
    span.textContent = word + ' ';
    span.style.display = 'inline-block';
    span.style.opacity = '0';
    span.style.transform = 'translateY(30px)';
    aboutDiv.appendChild(span);
  });
  
  gsap.to('#about-reveal span', {
    opacity: 1,
    y: 0,
    duration: 0.6,
    stagger: 0.05,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 70%',
      toggleActions: 'play none none none',
    },
  });
}
setupAboutReveal();

// Services cards stagger (pricing + service items)
gsap.utils.toArray('.pricing-card, .service-item').forEach((el, i) => {
  gsap.from(el, {
    opacity: 0,
    y: 80,
    rotationX: -10,
    duration: 0.8,
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      toggleActions: 'play none none none',
    },
    delay: i * 0.1,
  });
});

// ========================
// CONTACT PARTICLES
// ========================
const canvas = document.getElementById('particles-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = canvas.parentElement.offsetHeight;
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
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.opacity = Math.random() * 0.5 + 0.3;
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
  
  for (let i = 0; i < 100; i++) {
    particles.push(new Particle());
  }
  
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  animateParticles();
}

// ========================
// CONTACT FORM
// ========================
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(contactForm);
  const data = {
    name: formData.get('name').trim(),
    email: formData.get('email').trim(),
    phone: formData.get('phone').trim(),
    message: formData.get('message').trim(),
    timestamp: new Date().toISOString(),
  };
  
  // Basic XSS sanitisation (strip HTML tags)
  const sanitize = (str) => String(str).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  data.name = sanitize(data.name);
  data.email = sanitize(data.email);
  data.phone = sanitize(data.phone);
  data.message = sanitize(data.message);
  
  // Save to localStorage
  const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
  messages.push(data);
  localStorage.setItem('contactMessages', JSON.stringify(messages));
  
  // Send email via serverless function
  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await response.json();
    if (response.ok) {
      alert('Message sent successfully!');
    } else {
      alert('Message stored locally, but email sending failed. I’ll still get back to you.');
    }
  } catch (err) {
    alert('Message stored locally. Email service temporarily unavailable.');
  }
  
  contactForm.reset();
});

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

loginBtn.addEventListener('click', () => {
  if (passwordInput.value === 'negusx2026') {
    sessionStorage.setItem('adminLoggedIn', 'true');
    adminCheck();
  } else {
    loginError.textContent = 'Incorrect password';
  }
});

logoutBtn.addEventListener('click', () => {
  sessionStorage.removeItem('adminLoggedIn');
  adminCheck();
});

function renderMessages() {
  const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
  if (messages.length === 0) {
    messagesContainer.innerHTML = '<p>No messages yet.</p>';
    return;
  }
  let html = '';
  messages.forEach((msg, index) => {
    // Sanitise for display using DOMPurify
    const safeName = DOMPurify.sanitize(msg.name);
    const safeEmail = DOMPurify.sanitize(msg.email);
    const safePhone = DOMPurify.sanitize(msg.phone);
    const safeMsg = DOMPurify.sanitize(msg.message);
    const date = new Date(msg.timestamp).toLocaleString();
    html += `
      <div class="message-item">
        <p><strong>${safeName}</strong> (${safeEmail})</p>
        <p>📞 ${safePhone}</p>
        <p>💬 ${safeMsg}</p>
        <p><small>${date}</small></p>
        <button class="delete-btn" data-index="${index}">Delete</button>
      </div>
    `;
  });
  messagesContainer.innerHTML = html;
  
  // Delete handlers
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
