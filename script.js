/*
  script.js — Freek van Rijn
  ---------------------------------------------------------------
  1. Footer year.
  2. Topbar border on scroll.
  3. Hero name slow line-reveal.
  4. IntersectionObserver fade-up for [data-reveal] (first reveal only).
  5. Cursor-follower glow (desktop only).
  6. Scroll-progress bar (top-of-page).
  7. Hero parallax (name drifts slowly upward as you scroll).
  8. Project-card 3D tilt (desktop, on pointer move).
*/

(() => {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  const isTouch =
    window.matchMedia("(hover: none)").matches || "ontouchstart" in window;

  /* 1. Footer year */
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* 2. Topbar border on scroll */
  const topbar = document.querySelector(".topbar");
  const onScrollTopbar = () => {
    if (topbar) topbar.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  /* 3. Hero reveal */
  const heroName = document.querySelector(".hero__name");
  if (heroName) {
    if (prefersReducedMotion) {
      heroName.classList.add("is-revealed");
    } else {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => heroName.classList.add("is-revealed"));
      });
    }
  }

  /* 4. Reveal on scroll */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          const delay = parseInt(el.dataset.revealDelay || "0", 10);
          if (delay > 0) {
            window.setTimeout(() => el.classList.add("is-in"), delay);
          } else {
            el.classList.add("is-in");
          }
          io.unobserve(el);
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* 5. Cursor-follower glow */
  const glow = document.querySelector(".cursor-glow");
  if (glow && !isTouch && !prefersReducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    document.addEventListener("pointermove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      glow.classList.add("is-on");
    });
    document.addEventListener("pointerleave", () => {
      glow.classList.remove("is-on");
    });

    const tick = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;
      glow.style.setProperty("--mx", currentX + "px");
      glow.style.setProperty("--my", currentY + "px");
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* 6. + 7. Scroll progress bar + hero parallax
     One rAF-driven loop, kicked by scroll events, so we don't double-up. */
  const progressBar = document.querySelector(".scroll-progress");
  let scrollTicking = false;

  const onScroll = () => {
    if (scrollTicking) return;
    scrollTicking = true;
    requestAnimationFrame(() => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const ratio = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

      if (progressBar) {
        progressBar.style.transform = `scaleX(${ratio})`;
      }

      // Hero name parallax — only while hero is roughly in view.
      if (heroName && !prefersReducedMotion) {
        const offset = Math.min(window.scrollY, window.innerHeight) * 0.18;
        heroName.style.setProperty("--py", `-${offset}px`);
      }

      onScrollTopbar();
      scrollTicking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // initialise

  /* 8. Project-card 3D tilt
     Pointer x/y inside the card is mapped to small rotation angles.
     Reset on leave. Desktop only. */
  if (!isTouch && !prefersReducedMotion) {
    const cards = document.querySelectorAll(".project");
    cards.forEach((card) => {
      const max = 6; // degrees
      card.addEventListener("pointermove", (e) => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;  // 0..1
        const py = (e.clientY - rect.top) / rect.height;  // 0..1
        const rx = (0.5 - py) * max * 2;   // rotateX
        const ry = (px - 0.5) * max * 2;   // rotateY
        card.style.setProperty("--tx", ry + "deg");
        card.style.setProperty("--ty", rx + "deg");
      });
      card.addEventListener("pointerleave", () => {
        card.style.setProperty("--tx", "0deg");
        card.style.setProperty("--ty", "0deg");
      });
    });
  }

})();
