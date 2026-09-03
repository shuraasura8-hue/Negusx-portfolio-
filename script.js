
// script.js
document.addEventListener('DOMContentLoaded', () => {
  
  // Mobile nav toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const isOpen = navMenu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
    
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
  
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        const offset = 70;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });
  
  // Active nav link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navItems = document.querySelectorAll('.nav-links a');
  
  function highlightNav() {
    const scrollPos = window.scrollY + 100;
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
  
  // Back to top
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('visible', window.scrollY > 500);
    }, { passive: true });
  }
  
  // Scroll reveal with Intersection Observer
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  
  document.querySelectorAll('.reveal, .project, .service-card, .pricing-card, .process-step').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
  
  // Process line animation
  const processLineFill = document.querySelector('.process-line-fill');
  if (processLineFill) {
    const lineObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          processLineFill.classList.add('active');
          lineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    
    lineObserver.observe(document.querySelector('.process-wrapper'));
  }
  
  // Contact form
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('submit-btn');
  
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      formStatus.className = 'form-status';
      formStatus.textContent = '';
      
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      
      const formData = new FormData(contactForm);
      const data = {
        name: formData.get('name').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        message: formData.get('message').trim(),
      };
      
      if (!data.name || !data.email || !data.message) {
        showError('Please fill in all required fields.');
        return;
      }
      
      try {
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
        
        const result = await response.json();
        
        if (response.ok) {
          showSuccess('Message sent! I\'ll get back to you within 24 hours.');
          contactForm.reset();
        } else {
          showError(result.error || 'Something went wrong. Please try WhatsApp.');
        }
      } catch (err) {
        showError('Email service is down. Please reach out on WhatsApp.');
      }
    });
  }
  
  function showSuccess(msg) {
    formStatus.textContent = msg;
    formStatus.className = 'form-status success';
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }
  
  function showError(msg) {
    formStatus.textContent = msg;
    formStatus.className = 'form-status error';
    submitBtn.disabled = false;
    submitBtn.classList.remove('loading');
  }
  
});
