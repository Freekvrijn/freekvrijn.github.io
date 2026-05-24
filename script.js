/*
  script.js — Freek van Rijn
  ---------------------------------------------------------------
  1. Footer year.
  2. Cursor-following spotlight (desktop only).
  3. Reveal on scroll for [data-reveal] (first reveal only).
  4. Sidebar nav: highlight the link for the section currently in view.
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

  /* 2. Spotlight — soft radial glow that trails the pointer */
  const spotlight = document.querySelector(".spotlight");
  if (spotlight && !isTouch && !prefersReducedMotion) {
    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let currentX = targetX;
    let currentY = targetY;

    document.addEventListener("pointermove", (e) => {
      targetX = e.clientX;
      targetY = e.clientY;
      spotlight.classList.add("is-on");
    });
    document.addEventListener("pointerleave", () => {
      spotlight.classList.remove("is-on");
    });

    const tick = () => {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      spotlight.style.setProperty("--mx", currentX + "px");
      spotlight.style.setProperty("--my", currentY + "px");
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* 3. Reveal on scroll */
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
      { rootMargin: "0px 0px -10% 0px", threshold: 0.05 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* 4. Active-section indicator in sidebar nav
     Whichever section is most prominently in view gets its nav link
     highlighted. Uses IntersectionObserver with a tall middle band. */
  const sections = Array.from(document.querySelectorAll("section[id]"));
  const navLinks = new Map();
  document.querySelectorAll("[data-nav]").forEach((a) => {
    const id = a.getAttribute("href").slice(1);
    navLinks.set(id, a);
  });

  if (sections.length && navLinks.size && "IntersectionObserver" in window) {
    const setActive = (id) => {
      navLinks.forEach((link, key) => {
        link.classList.toggle("is-active", key === id);
      });
    };

    // Track visibility of each section; pick the one with the largest
    // intersection ratio that's currently in view.
    const visibility = new Map();
    const navIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          visibility.set(entry.target.id, entry.intersectionRatio);
        });
        let bestId = null;
        let bestRatio = 0;
        visibility.forEach((ratio, id) => {
          if (ratio > bestRatio) { bestRatio = ratio; bestId = id; }
        });
        if (bestId) setActive(bestId);
      },
      {
        // Tall band around the vertical centre so the active link only
        // changes when a new section is clearly the one being read.
        rootMargin: "-30% 0px -55% 0px",
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );
    sections.forEach((s) => navIO.observe(s));
  }
})();
