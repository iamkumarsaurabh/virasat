/**
 * VIRASAT — menu.js
 * Interactive menu category filter with smooth transitions.
 * Runs on menu.html — handles tab filtering without page reload.
 */

'use strict';

document.addEventListener('DOMContentLoaded', function () {

  const tabs       = document.querySelectorAll('.filter-tab');
  const sections   = document.querySelectorAll('.category-section');
  const menuGrid   = document.getElementById('menu-grid');

  if (!tabs.length || !sections.length) return;


  /* ── Category Filter Logic ───────────────────────────────────────────────── */
  const filterMenu = (category) => {
    // Fade out the grid
    if (menuGrid) {
      menuGrid.style.opacity = '0';
      menuGrid.style.transform = 'translateY(8px)';
      menuGrid.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
    }

    setTimeout(() => {
      sections.forEach((section) => {
        const sectionCat = section.dataset.categoryGroup;
        if (category === 'all' || sectionCat === category) {
          section.classList.remove('hidden-section');
          section.style.display = '';
        } else {
          section.classList.add('hidden-section');
          section.style.display = 'none';
        }
      });

      // Fade back in
      if (menuGrid) {
        menuGrid.style.opacity = '1';
        menuGrid.style.transform = 'translateY(0)';
      }

      // Important: Refresh GSAP ScrollTrigger since display:none changes element heights
      if (typeof ScrollTrigger !== 'undefined') {
        ScrollTrigger.refresh();
      }
    }, 250);
  };


  /* ── Tab Click Handlers ──────────────────────────────────────────────────── */
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      // Update active state
      tabs.forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.dataset.category;
      filterMenu(category);

      // Update URL hash without scrolling
      history.replaceState(null, '', category !== 'all' ? `#${category}` : ' ');
    });
  });


  /* ── Check URL hash on load (deep-link to category) ──────────────────────── */
  const hash = window.location.hash.replace('#', '');
  const validCats = ['starters', 'mains', 'biryanis', 'desserts', 'thalis'];
  if (hash && validCats.includes(hash)) {
    const matchingTab = document.querySelector(`[data-category="${hash}"]`);
    if (matchingTab) {
      matchingTab.click();
      // Scroll to filter bar
      setTimeout(() => {
        const filterBar = document.querySelector('.filter-bar');
        if (filterBar) filterBar.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 400);
    }
  }


  /* ── Hover image zoom is handled via CSS (dish-card-img group-hover) ─────── */

});
