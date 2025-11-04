// Contact Form Handler - Submits to CRM Dashboard
(function() {
    'use strict';

    // Wait for DOM to be ready
    document.addEventListener('DOMContentLoaded', function() {
        const form = document.querySelector('.contact-form');
        const submitButton = form?.querySelector('input[type="submit"]');
        const successMessage = document.querySelector('.success-message');
        const errorMessage = document.querySelector('.error-message');

        if (!form) {
            console.warn('Contact form not found');
            return;
        }

        // Handle form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();

            // Get form data
            const formData = new FormData(form);
            const data = {
                name: formData.get('Name'),
                email: formData.get('Email-address'),
                phone: formData.get('Phone-number'),
                service: formData.get('Services'),
                message: formData.get('Message'),
                termsAccepted: formData.get('Checkbox') === 'on'
            };

            // Validate data
            if (!data.name || !data.email || !data.phone || !data.service || !data.message) {
                showError('Please fill in all required fields');
                return;
            }

            // Validate terms acceptance
            if (!data.termsAccepted) {
                showError('You must accept the Terms & Conditions');
                return;
            }

            // Disable submit button
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.value = 'Submitting...';
            }

            try {
                // Submit to API
                const response = await fetch('/api/contact/submit', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (response.ok && result.success) {
                    // Show success message
                    showSuccess();
                    form.reset();
                    
                    // Track conversion (optional)
                    if (window.gtag) {
                        window.gtag('event', 'form_submit', {
                            'event_category': 'Contact',
                            'event_label': 'Contact Form Submission'
                        });
                    }
                } else {
                    showError(result.error || 'Failed to submit form. Please try again.');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                showError('Network error. Please check your connection and try again.');
            } finally {
                // Re-enable submit button
                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.value = 'Submit';
                }
            }
        });

        // Show success message
        function showSuccess() {
            if (successMessage) {
                successMessage.style.display = 'block';
                errorMessage.style.display = 'none';
                
                // Hide after 5 seconds
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 5000);

                // Scroll to success message
                successMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }

        // Show error message
        function showError(message) {
            if (errorMessage) {
                const errorText = errorMessage.querySelector('.error-text');
                if (errorText) {
                    errorText.textContent = message;
                }
                errorMessage.style.display = 'block';
                successMessage.style.display = 'none';

                // Hide after 5 seconds
                setTimeout(() => {
                    errorMessage.style.display = 'none';
                }, 5000);

                // Scroll to error message
                errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
})();
