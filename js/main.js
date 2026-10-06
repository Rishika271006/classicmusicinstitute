/**
 * Classic Music Institute - Interactive Script
 * Domain: classicinstitute.com
 * Address: SCO 64-65, 2nd Floor, Sector 34-A, Chandigarh
 * Phone: +91 98052 60021
 */

document.addEventListener('DOMContentLoaded', function () {
  // --- Sticky Header Effect ---
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', function () {
    if (window.scrollY > 40) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  });

  // --- Mobile Navigation Menu Toggle ---
  const mobileToggleBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (mobileToggleBtn && navLinks) {
    mobileToggleBtn.addEventListener('click', function () {
      navLinks.classList.toggle('mobile-active');
      const isExpanded = navLinks.classList.contains('mobile-active');
      mobileToggleBtn.setAttribute('aria-expanded', isExpanded);
    });
  }

  // Mobile Dropdown Accordion Toggle
  const dropdownTriggers = document.querySelectorAll('.nav-item.has-dropdown > .nav-link');
  dropdownTriggers.forEach(trigger => {
    trigger.addEventListener('click', function (e) {
      if (window.innerWidth <= 768) {
        e.preventDefault();
        const parent = this.closest('.nav-item');
        parent.classList.toggle('dropdown-open');
      }
    });
  });

  // --- FAQ Accordion ---
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', function () {
      const parentItem = this.closest('.faq-item');
      const isActive = parentItem.classList.contains('active');

      // Close all other FAQ items
      document.querySelectorAll('.faq-item').forEach(item => {
        item.classList.remove('active');
      });

      if (!isActive) {
        parentItem.classList.add('active');
      }
    });
  });

  // --- Book a Free Trial Modal Functionality ---
  const modalOverlay = document.getElementById('trialModal');
  const modalCloseBtn = document.querySelector('.modal-close-btn');
  const openModalBtns = document.querySelectorAll('.open-trial-modal');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      const courseAttr = this.getAttribute('data-course');
      if (modalOverlay) {
        modalOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        if (courseAttr) {
          const courseSelect = document.getElementById('modalCourseSelect');
          if (courseSelect) {
            courseSelect.value = courseAttr;
          }
        }
      }
    });
  });

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // Escape key closes modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modalOverlay?.classList.contains('active')) {
      closeModal();
    }
  });

  // --- Trial Form Submission Handler ---
  const trialForms = document.querySelectorAll('.trial-booking-form');
  trialForms.forEach(form => {
    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = this.querySelector('[name="full_name"]')?.value || 'Music Lover';
      const phone = this.querySelector('[name="phone_number"]')?.value || '';
      const email = this.querySelector('[name="email_address"]')?.value || '';
      const course = this.querySelector('[name="course_interest"]')?.value || 'Selected Course';
      const location = this.querySelector('[name="mode_preference"]')?.value || 'Chandigarh Campus (SCO 64-65, Sector 34-A)';

      // Visual feedback
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Reserving Your Seat...</span>';
      submitBtn.disabled = true;

      // Save to Supabase Cloud Database if configured
      if (window.ClassicSupabase) {
        await window.ClassicSupabase.saveAuditionBooking({
          name, phone, email, course, location
        });
      }

      setTimeout(() => {
        alert(`Thank you, ${name}! Your free 1-on-1 audition & assessment for ${course} has been registered.\n\nOur Senior Academic Advisor from Chandigarh Campus (SCO 64-65, Sector 34-A) will call you at ${phone} within 2 business hours.`);
        this.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        closeModal();
      }, 700);
    });
  });

  // --- Contact Form Submission Handler ---
  const contactForm = document.getElementById('instituteContactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const name = this.querySelector('[name="full_name"]')?.value || '';
      const phone = this.querySelector('[name="phone_number"]')?.value || '';
      const email = this.querySelector('[name="email_address"]')?.value || '';
      const subject = this.querySelector('[name="inquiry_subject"]')?.value || 'General Inquiry';
      const message = this.querySelector('[name="message_content"]')?.value || '';

      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<span>Sending Message...</span>';
      submitBtn.disabled = true;

      // Save to Supabase Cloud Database if configured
      if (window.ClassicSupabase) {
        await window.ClassicSupabase.saveContactInquiry({
          name, phone, email, subject, message
        });
      }

      setTimeout(() => {
        alert("Thank you for contacting Classic Music Institute! Your message has been received by our Admissions & Student Support Desk. We will get back to you shortly.");
        this.reset();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }, 600);
    });
  }

  // --- Pricing Frequency Toggle & Dynamic Packages Handler ---
  const toggleButtons = document.querySelectorAll('.pricing-toggle-btn');
  const pricingContainer = document.getElementById('pricingCardsContainer');
  let currentBillingMode = 'monthly';

  function renderClassesPricing() {
    if (window.PackagesManager && pricingContainer) {
      window.PackagesManager.renderOnPublicPage('pricingCardsContainer', currentBillingMode);
    } else {
      // Fallback for static cards
      const priceElements = document.querySelectorAll('[data-price-monthly]');
      priceElements.forEach(el => {
        const monthlyVal = el.getAttribute('data-price-monthly');
        const quarterlyVal = el.getAttribute('data-price-quarterly');
        const annualVal = el.getAttribute('data-price-annual');
        const periodEl = el.closest('.price-box')?.querySelector('.price-period');

        if (currentBillingMode === 'quarterly') {
          el.textContent = quarterlyVal;
          if (periodEl) periodEl.textContent = '/ 3 Months (10% Off)';
        } else if (currentBillingMode === 'annual') {
          el.textContent = annualVal;
          if (periodEl) periodEl.textContent = '/ Year (20% Off)';
        } else {
          el.textContent = monthlyVal;
          if (periodEl) periodEl.textContent = '/ Month';
        }
      });
    }
  }

  // Initial render on page load if container exists
  if (pricingContainer && window.PackagesManager) {
    renderClassesPricing();
  }

  toggleButtons.forEach(btn => {
    btn.addEventListener('click', function () {
      toggleButtons.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentBillingMode = this.getAttribute('data-mode') || 'monthly';
      renderClassesPricing();
    });
  });

  // Re-render when packages data changes in localStorage or another tab
  window.addEventListener('packagesUpdated', () => {
    if (pricingContainer && window.PackagesManager) {
      renderClassesPricing();
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'classic_institute_packages_v1' && pricingContainer && window.PackagesManager) {
      renderClassesPricing();
    }
  });
});


