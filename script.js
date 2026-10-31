/* Bildad portfolio interactions — plain JavaScript, no framework required. */
(() => {
  'use strict';

  // Change this to your real email before publishing the portfolio.
  const CONTACT_EMAIL = 'YOUR_EMAIL@example.com';
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const toast = $('#toast');
  let toastTimer;

  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2600);
  }

  async function copyText(value, successMessage) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(value);
      } else {
        const field = document.createElement('textarea');
        field.value = value;
        field.style.position = 'fixed';
        field.style.opacity = '0';
        document.body.appendChild(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('Copy command unavailable');
      }
      showToast(successMessage);
    } catch (error) {
      showToast('Copy was blocked by the browser. Please copy it manually.');
    }
  }

  // Mobile navigation opens/closes and closes after a destination is chosen.
  const menuToggle = $('#menu-toggle');
  const siteNav = $('#site-nav');
  function closeMenu() {
    if (!menuToggle || !siteNav) return;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation');
    siteNav.classList.remove('open');
    document.body.classList.remove('menu-open');
  }
  menuToggle?.addEventListener('click', () => {
    const opening = menuToggle.getAttribute('aria-expanded') !== 'true';
    menuToggle.setAttribute('aria-expanded', String(opening));
    menuToggle.setAttribute('aria-label', opening ? 'Close navigation' : 'Open navigation');
    siteNav?.classList.toggle('open', opening);
    document.body.classList.toggle('menu-open', opening);
  });
  $$('#site-nav a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 650) closeMenu(); });

  // Smoothly highlight the navigation item for the section in view.
  const navLinks = $$('.site-nav a[href^="#"]');
  const observedSections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
      });
    }, { rootMargin: '-30% 0px -60% 0px', threshold: 0 });
    observedSections.forEach(section => sectionObserver.observe(section));
  }

  // Reveal content as it enters the viewport; keep it visible for reduced-motion users.
  const revealItems = $$('.section-heading, .about-card, .principle, .skill-card, .project-card, .timeline-item, .contact-form');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    revealItems.forEach(item => item.classList.add('reveal'));
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach(item => revealObserver.observe(item));
  }

  // Project filter buttons.
  const filterButtons = $$('.filter-button');
  const projectCards = $$('.project-card');
  filterButtons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter || 'all';
    filterButtons.forEach(item => {
      const selected = item === button;
      item.classList.toggle('active', selected);
      item.setAttribute('aria-pressed', String(selected));
    });
    projectCards.forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
    });
  }));
  filterButtons.forEach(button => button.setAttribute('aria-pressed', String(button.classList.contains('active'))));

  // Copy helpers.
  $('#copy-command')?.addEventListener('click', () => copyText('npm run learn', 'Command copied: npm run learn'));
  $('#copy-email')?.addEventListener('click', () => {
    if (CONTACT_EMAIL.includes('YOUR_EMAIL')) {
      showToast('Set your real email in script.js first.');
      return;
    }
    copyText(CONTACT_EMAIL, 'Email address copied.');
  });
  const emailText = $('#email-text');
  if (emailText && !CONTACT_EMAIL.includes('YOUR_EMAIL')) emailText.textContent = CONTACT_EMAIL;

  // Contact form validates in the browser, then prepares a message in the visitor's email app.
  const contactForm = $('#contact-form');
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    if (!contactForm.reportValidity()) return;
    if (CONTACT_EMAIL.includes('YOUR_EMAIL')) {
      $('#form-status').textContent = 'Before using this form, replace YOUR_EMAIL@example.com in script.js with your real email address.';
      showToast('Add your real email address in script.js first.');
      return;
    }
    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const senderEmail = String(data.get('email') || '').trim();
    const topic = String(data.get('topic') || 'General hello');
    const message = String(data.get('message') || '').trim();
    const subject = `${topic} — portfolio message from ${name}`;
    const body = `Hi Bildad,\n\n${message}\n\nFrom: ${name}\nReply to: ${senderEmail}`;
    const mailto = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    $('#form-status').textContent = 'Opening your email app with the message prepared…';
    window.location.href = mailto;
  });

  // Dynamic footer year.
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
