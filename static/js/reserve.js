/**
 * VIRASAT — reserve.js
 * Handles:
 *   - Diwali countdown timer (hero + mini sidebar)
 *   - Reservation form AJAX submission with validation
 *   - Toast feedback (delegates to window.Virasat.showToast)
 */

'use strict';

/* ════════════════════════════════════════════════════════════════════════════
   COUNTDOWN TIMER — Diwali 2026: 8 November 2026, midnight IST (UTC+5:30)
   ════════════════════════════════════════════════════════════════════════════ */

// ISO 8601 datetime in IST: midnight Nov 8 = UTC Nov 7 18:30:00Z
const DIWALI_DATE = new Date('2026-11-08T00:00:00+05:30');

function padTwo(n) { return String(n).padStart(2, '0'); }

function updateCountdown() {
  const now  = new Date();
  const diff = DIWALI_DATE - now;

  if (diff <= 0) {
    // Event has arrived — show celebratory text
    ['cd-days','cd-hours','cd-mins','cd-secs'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    ['mini-days','mini-hours','mini-mins'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.textContent = '00';
    });
    return; // stop ticking
  }

  const days  = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins  = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs  = Math.floor((diff % (1000 * 60)) / 1000);

  // Hero countdown
  const cdDays  = document.getElementById('cd-days');
  const cdHours = document.getElementById('cd-hours');
  const cdMins  = document.getElementById('cd-mins');
  const cdSecs  = document.getElementById('cd-secs');
  if (cdDays)  cdDays.textContent  = padTwo(days);
  if (cdHours) cdHours.textContent = padTwo(hours);
  if (cdMins)  cdMins.textContent  = padTwo(mins);
  if (cdSecs)  cdSecs.textContent  = padTwo(secs);

  // Mini sidebar countdown (reserve page)
  const miniDays  = document.getElementById('mini-days');
  const miniHours = document.getElementById('mini-hours');
  const miniMins  = document.getElementById('mini-mins');
  if (miniDays)  miniDays.textContent  = padTwo(days);
  if (miniHours) miniHours.textContent = padTwo(hours);
  if (miniMins)  miniMins.textContent  = padTwo(mins);
}

// Start the clock
updateCountdown();
setInterval(updateCountdown, 1000);


/* ════════════════════════════════════════════════════════════════════════════
   RESERVATION FORM
   ════════════════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', function () {

  const form       = document.getElementById('reservation-form');
  if (!form) return;

  const submitBtn  = document.getElementById('reserve-submit');
  const btnText    = document.getElementById('reserve-btn-text');
  const spinner    = document.getElementById('reserve-spinner');

  // Set minimum date to today
  const dateInput = document.getElementById('res-date');
  if (dateInput) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);
    // Default to today
    dateInput.value = today;
  }

  // Helper: show / clear field error
  const showError = (field, msg) => {
    const errEl = document.getElementById(`err-${field}`);
    const input = form.querySelector(`[name="${field}"]`);
    if (errEl) errEl.textContent = msg;
    if (input) input.classList.toggle('border-red-500', !!msg);
    if (input) input.classList.toggle('border-gold', !msg);
  };

  const clearErrors = () => {
    form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    form.querySelectorAll('.form-input').forEach(el => {
      el.classList.remove('border-red-500');
    });
  };

  // Client-side validation (mirrors backend for instant feedback)
  const validate = (data) => {
    const errors = {};
    if (!data.name || data.name.length < 2)          errors.name      = 'Full name is required (min 2 chars).';
    if (!data.email || !data.email.includes('@'))    errors.email     = 'Please enter a valid email address.';
    if (!data.phone || data.phone.replace(/[\s\-]/g,'').length < 10) errors.phone = 'Enter a valid phone number.';
    if (!data.date)                                  errors.date      = 'Please select a date.';
    if (!data.time_slot)                             errors.time_slot = 'Please select a time slot.';
    const guests = parseInt(data.guests, 10);
    if (!guests || guests < 1 || guests > 20)        errors.guests    = 'Guests must be between 1 and 20.';
    return errors;
  };

  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    if (btnText) btnText.textContent = loading ? 'Confirming Reservation…' : 'Confirm Royal Reservation';
    if (spinner) spinner.classList.toggle('hidden', !loading);
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const data = {
      name:             form.querySelector('[name="name"]')?.value.trim() || '',
      email:            form.querySelector('[name="email"]')?.value.trim() || '',
      phone:            form.querySelector('[name="phone"]')?.value.trim() || '',
      date:             form.querySelector('[name="date"]')?.value || '',
      time_slot:        form.querySelector('[name="time_slot"]')?.value || '',
      guests:           form.querySelector('[name="guests"]')?.value || '',
      special_requests: form.querySelector('[name="special_requests"]')?.value.trim() || '',
      website_url:      form.querySelector('[name="website_url"]')?.value || '',
      js_timestamp:     form.querySelector('[name="js_timestamp"]')?.value || '',
    };

    // Client-side quick validation
    const clientErrors = validate(data);
    if (Object.keys(clientErrors).length > 0) {
      Object.entries(clientErrors).forEach(([field, msg]) => showError(field, msg));
      window.Virasat && window.Virasat.showToast('error', 'Incomplete Form', 'Please correct the highlighted fields.');
      return;
    }

    setLoading(true);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
      const response = await fetch('/api/reserve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        window.Virasat && window.Virasat.showToast('success', 'Reservation Confirmed!', result.message, 8000);
        form.reset();
        // Restore min date after reset
        if (dateInput) {
          const today = new Date().toISOString().split('T')[0];
          dateInput.setAttribute('min', today);
          dateInput.value = today;
        }
      } else {
        // Server-side validation errors
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, msg]) => showError(field, msg));
        }
        window.Virasat && window.Virasat.showToast('error', 'Reservation Failed', result.message || 'Please review the form and try again.');
      }
    } catch (err) {
      console.error('Reservation error:', err);
      window.Virasat && window.Virasat.showToast('error', 'Network Error', 'Unable to reach the server. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  });

  // Live error clearing on field interaction
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => {
      const name = input.getAttribute('name');
      if (name) showError(name, '');
    });
  });

});
