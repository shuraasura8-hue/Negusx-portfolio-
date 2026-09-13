/* =========================================================
   NegusX Portfolio — script.js
   Vanilla JS. No dependencies.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- 1. Scroll reveals (Intersection Observer) ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target); // reveal once, then stop watching
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    // Fallback: just show everything
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  /* ---------- 2. Mobile navigation ---------- */
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");

  function openMenu() {
    navLinks.classList.add("open");
    navToggle.classList.add("active");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Close menu");
    document.body.classList.add("nav-open");
  }

  function closeMenu() {
    navLinks.classList.remove("open");
    navToggle.classList.remove("active");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
    document.body.classList.remove("nav-open");
  }

  function toggleMenu() {
    if (navLinks.classList.contains("open")) {
      closeMenu();
    } else {
      openMenu();
    }
  }

  navToggle.addEventListener("click", toggleMenu);

  // Close menu when a link is tapped
  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navLinks.classList.contains("open")) {
      closeMenu();
      navToggle.focus();
    }
  });

  // Close if viewport resized to desktop
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && navLinks.classList.contains("open")) {
      closeMenu();
    }
  });

  /* ---------- 3. Back-to-top button (appears after 500px) ---------- */
  const backToTop = document.getElementById("back-to-top");

  function handleBackToTop() {
    if (window.scrollY > 500) {
      backToTop.classList.add("visible");
    } else {
      backToTop.classList.remove("visible");
    }
  }

  backToTop.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* ---------- 4. Process line — grows/fades on scroll ---------- */
  const processSteps = document.getElementById("process-steps");
  const processLineFill = document.getElementById("process-line-fill");

  function updateProcessLine() {
    if (!processSteps || !processLineFill) return;

    const rect = processSteps.getBoundingClientRect();
    const viewportHeight = window.innerHeight;

    // Line starts filling when the section enters the lower 80% of the
    // viewport and completes as it reaches the upper 30%.
    const start = viewportHeight * 0.85;
    const end = viewportHeight * 0.3;
    const total = rect.height + (start - end);

    let progress = (start - rect.top) / total;
    progress = Math.min(Math.max(progress, 0), 1);

    processLineFill.style.height = progress * 100 + "%";
  }

  /* ---------- Shared scroll handler (rAF-throttled) ---------- */
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleBackToTop();
        updateProcessLine();
        ticking = false;
      });
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll(); // set initial state on load

  /* ---------- 5. Contact form → POST /api/send-email ---------- */
  const form = document.getElementById("contact-form");
  const submitBtn = document.getElementById("submit-btn");
  const formStatus = document.getElementById("form-status");

  function setStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = "form-status " + type;
  }

  function setLoading(isLoading) {
    submitBtn.classList.toggle("loading", isLoading);
    submitBtn.disabled = isLoading;
  }

  function validateForm(data) {
    if (!data.name || !data.name.trim()) return "Please enter your name.";
    if (!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
      return "Please enter a valid email address.";
    if (!data.message || !data.message.trim())
      return "Please tell me a little about your project.";
    return null;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("", "");

    const data = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      message: form.message.value.trim(),
    };

    const error = validateForm(data);
    if (error) {
      setStatus(error, "error");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Request failed: " + response.status);

      setStatus("Message sent. I'll get back to you within 24 hours.", "success");
      form.reset();
    } catch (err) {
      setStatus(
        "Something went wrong sending your message. Please try WhatsApp or email instead.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  });
})();
