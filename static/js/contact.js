/**
 * VIRASAT — contact.js
 * Handles contact form AJAX submission with client-side validation
 * and toast feedback.
 */

'use strict';

document.addEventListener('DOMContentLoaded', function () {

  const form      = document.getElementById('contact-form');
  if (!form) return;

  const submitBtn = document.getElementById('contact-submit');
  const btnText   = document.getElementById('contact-btn-text');
  const spinner   = document.getElementById('contact-spinner');


  /* ── Helpers ─────────────────────────────────────────────────────────────── */
  const showError = (field, msg) => {
    const errEl = document.getElementById(`con-err-${field}`);
    const input = form.querySelector(`[name="${field}"]`);
    if (errEl) errEl.textContent = msg;
    if (input) input.classList.toggle('border-red-500', !!msg);
  };

  const clearErrors = () => {
    form.querySelectorAll('.form-error').forEach(el => el.textContent = '');
    form.querySelectorAll('.form-input').forEach(el => el.classList.remove('border-red-500'));
  };

  const validate = (data) => {
    const errors = {};
    if (!data.name || data.name.length < 2)               errors.name    = 'Your name is required (min 2 chars).';
    if (!data.email || !data.email.includes('@'))         errors.email   = 'Please enter a valid email address.';
    if (!data.subject || data.subject.length < 3)         errors.subject = 'Please provide a subject (min 3 chars).';
    if (!data.message || data.message.length < 10)        errors.message = 'Message must be at least 10 characters.';
    if (data.message && data.message.length > 2000)       errors.message = 'Message must not exceed 2000 characters.';
    return errors;
  };

  // Character counter for message
  const messageInput = form.querySelector('[name="message"]');
  if (messageInput) {
    const hint = messageInput.nextElementSibling?.nextElementSibling;
    messageInput.addEventListener('input', () => {
      const len = messageInput.value.length;
      if (hint) hint.textContent = `${len} / 2000 characters`;
      if (len > 1800) hint && (hint.style.color = '#f87171');
      else hint && (hint.style.color = '');
    });
  }


  /* ── Loading State ───────────────────────────────────────────────────────── */
  const setLoading = (loading) => {
    submitBtn.disabled = loading;
    if (btnText) btnText.textContent = loading ? 'Sending…' : 'Send Message';
    if (spinner) spinner.classList.toggle('hidden', !loading);
  };


  /* ── Form Submission ─────────────────────────────────────────────────────── */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const data = {
      name:    form.querySelector('[name="name"]')?.value.trim()    || '',
      email:   form.querySelector('[name="email"]')?.value.trim()   || '',
      subject: form.querySelector('[name="subject"]')?.value.trim() || '',
      message: form.querySelector('[name="message"]')?.value.trim() || '',
      website_url: form.querySelector('[name="website_url"]')?.value || '',
      js_timestamp: form.querySelector('[name="js_timestamp"]')?.value || '',
    };

    const clientErrors = validate(data);
    if (Object.keys(clientErrors).length > 0) {
      Object.entries(clientErrors).forEach(([field, msg]) => showError(field, msg));
      window.Virasat && window.Virasat.showToast('error', 'Incomplete Form', 'Please correct the highlighted fields.');
      return;
    }

    setLoading(true);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        window.Virasat && window.Virasat.showToast('success', 'Message Sent!', result.message, 7000);
        form.reset();
      } else {
        if (result.errors) {
          Object.entries(result.errors).forEach(([field, msg]) => showError(field, msg));
        }
        window.Virasat && window.Virasat.showToast('error', 'Submission Failed', result.message || 'Please review and try again.');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      window.Virasat && window.Virasat.showToast('error', 'Network Error', 'Unable to send. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  });

  // Clear field error on input
  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => {
      const name = input.getAttribute('name');
      if (name) showError(name, '');
    });
  });

});
