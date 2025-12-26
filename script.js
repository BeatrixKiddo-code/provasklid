// ========================================
// Pro Váš Klid - JavaScript
// ========================================

(function() {
    'use strict';

    // ========================================
    // Email Protection - Anti-spam
    // ========================================
    
    function initEmailProtection() {
        const emailLinks = document.querySelectorAll('.email-link');
        
        emailLinks.forEach(link => {
            const user = link.getAttribute('data-user');
            const domain = link.getAttribute('data-domain');
            
            if (user && domain) {
                const email = user + '@' + domain;
                const emailText = link.querySelector('.email-text');
                
                if (emailText) {
                    emailText.textContent = email;
                }
                
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    window.location.href = 'mailto:' + email;
                });
            }
        });
        
        // Anti-spam timestamp pro formulář
        const timestampField = document.getElementById('formTimestamp');
        if (timestampField) {
            timestampField.value = Date.now();
        }
    }

    // ========================================
    // Mobile Navigation Toggle
    // ========================================
    
    function initMobileNav() {
        const navToggle = document.getElementById('navToggle');
        const nav = document.getElementById('mainNav');
        const navLinks = document.querySelectorAll('.nav-link');
        const body = document.body;

        if (!navToggle || !nav) return;

        function toggleNav() {
            const isOpen = nav.classList.contains('active');
            
            navToggle.classList.toggle('active');
            nav.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', !isOpen);
            
            // Prevent body scroll when menu is open
            if (!isOpen) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        }

        function closeNav() {
            navToggle.classList.remove('active');
            nav.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            body.style.overflow = '';
        }

        navToggle.addEventListener('click', toggleNav);

        // Close menu when clicking nav links
        navLinks.forEach(link => {
            link.addEventListener('click', closeNav);
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && nav.classList.contains('active')) {
                closeNav();
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (nav.classList.contains('active') && 
                !nav.contains(e.target) && 
                !navToggle.contains(e.target)) {
                closeNav();
            }
        });

        // Handle resize - close menu if viewport becomes larger
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                if (window.innerWidth > 768 && nav.classList.contains('active')) {
                    closeNav();
                }
            }, 100);
        });
    }

    // ========================================
    // Smooth Scrolling
    // ========================================
    
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                e.preventDefault();
                const target = document.querySelector(href);

                if (target) {
                    const headerOffset = 80;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    // ========================================
    // Header Scroll Effect
    // ========================================
    
    function initHeaderScroll() {
        const header = document.querySelector('.header');
        if (!header) return;

        let ticking = false;

        function updateHeader() {
            if (window.pageYOffset > 100) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
            ticking = false;
        }

        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(updateHeader);
                ticking = true;
            }
        });
    }

    // ========================================
    // FAQ Accordion
    // ========================================
    
    function initFaqAccordion() {
        const faqQuestions = document.querySelectorAll('.faq-question');

        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const faqItem = this.closest('.faq-item');
                const isActive = faqItem.classList.contains('active');
                const wasHidden = faqItem.classList.contains('hidden');

                // Close all other items
                document.querySelectorAll('.faq-item').forEach(item => {
                    if (item !== faqItem) {
                        item.classList.remove('active');
                        const btn = item.querySelector('.faq-question');
                        if (btn) btn.setAttribute('aria-expanded', 'false');
                    }
                });

                // Toggle current item
                if (!isActive) {
                    faqItem.classList.add('active');
                    this.setAttribute('aria-expanded', 'true');
                } else {
                    faqItem.classList.remove('active');
                    this.setAttribute('aria-expanded', 'false');
                }
            });
        });

        // Show more FAQ button
        const showMoreBtn = document.getElementById('faq-show-more-btn');
        if (showMoreBtn) {
            showMoreBtn.addEventListener('click', function() {
                const hiddenItems = document.querySelectorAll('.faq-item.hidden');
                
                hiddenItems.forEach(item => {
                    item.classList.remove('hidden');
                });

                this.classList.add('hidden');
            });
        }
    }

    // ========================================
    // Contact Form with Validation
    // ========================================
    
    function initContactForm() {
        const contactForm = document.getElementById('contactForm');
        const formSuccess = document.getElementById('formSuccess');

        if (!contactForm) return;

        const submitButton = contactForm.querySelector('.submit-button');

        const validationRules = {
            name: {
                required: true,
                minLength: 2,
                message: 'Prosím, vyplňte vaše jméno (min. 2 znaky)'
            },
            email: {
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: 'Prosím, zadejte platnou e-mailovou adresu'
            },
            phone: {
                required: true,
                pattern: /^(\+420)?[ ]?[0-9]{3}[ ]?[0-9]{3}[ ]?[0-9]{3}$/,
                message: 'Prosím, zadejte platné telefonní číslo'
            },
            message: {
                required: true,
                minLength: 10,
                message: 'Prosím, napište zprávu (min. 10 znaků)'
            }
        };

        function validateField(field) {
            const fieldName = field.name;
            const fieldValue = field.value.trim();
            const rules = validationRules[fieldName];
            const formGroup = field.closest('.form-group');
            const errorMessage = formGroup?.querySelector('.error-message');

            if (!formGroup || !errorMessage) return true;

            formGroup.classList.remove('error');
            errorMessage.textContent = '';

            if (!rules) return true;

            if (rules.required && !fieldValue) {
                formGroup.classList.add('error');
                errorMessage.textContent = rules.message;
                return false;
            }

            if (rules.minLength && fieldValue.length < rules.minLength) {
                formGroup.classList.add('error');
                errorMessage.textContent = rules.message;
                return false;
            }

            if (rules.pattern && !rules.pattern.test(fieldValue)) {
                formGroup.classList.add('error');
                errorMessage.textContent = rules.message;
                return false;
            }

            return true;
        }

        // Real-time validation
        const formFields = contactForm.querySelectorAll('input:not([name="_gotcha"]):not([name="_timestamp"]), textarea');
        formFields.forEach(field => {
            field.addEventListener('blur', () => validateField(field));

            field.addEventListener('input', () => {
                const formGroup = field.closest('.form-group');
                if (formGroup?.classList.contains('error')) {
                    validateField(field);
                }
            });
        });

        // Form submission
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Anti-spam: Check timestamp (must be at least 3 seconds)
            const timestamp = document.getElementById('formTimestamp');
            if (timestamp && timestamp.value) {
                const timeDiff = Date.now() - parseInt(timestamp.value);
                if (timeDiff < 3000) {
                    console.warn('Form submitted too quickly - possible bot');
                    return;
                }
            }

            let isValid = true;
            formFields.forEach(field => {
                if (!validateField(field)) {
                    isValid = false;
                }
            });

            if (!isValid) {
                const firstError = contactForm.querySelector('.form-group.error');
                if (firstError) {
                    firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            submitButton.disabled = true;
            submitButton.classList.add('loading');

            try {
                const formData = new FormData(contactForm);

                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formSuccess.classList.add('show');
                    contactForm.reset();
                    
                    // Reset timestamp
                    if (timestamp) {
                        timestamp.value = Date.now();
                    }

                    setTimeout(() => {
                        formSuccess.classList.remove('show');
                    }, 8000);

                    formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                } else {
                    throw new Error('Formspree error');
                }

            } catch (error) {
                alert('Omlouváme se, došlo k chybě při odesílání formuláře. Zkuste to prosím znovu nebo nás kontaktujte telefonicky na +420 736 231 196.');
                console.error('Form submission error:', error);
            } finally {
                submitButton.disabled = false;
                submitButton.classList.remove('loading');
            }
        });
    }

    // ========================================
    // Scroll Animations
    // ========================================
    
    function initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.service-card, .faq-item:not(.hidden), .reference-card');
        
        animatedElements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(element);
        });
    }

    // ========================================
    // Active Nav Link on Scroll
    // ========================================
    
    function initActiveNavOnScroll() {
        const sections = document.querySelectorAll('section[id]');
        const navLinks = document.querySelectorAll('.nav-link');

        function updateActiveLink() {
            const scrollPos = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    navLinks.forEach(link => {
                        link.classList.remove('active');
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.classList.add('active');
                        }
                    });
                }
            });
        }

        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    updateActiveLink();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    // ========================================
    // Initialize All
    // ========================================
    
    function init() {
        initEmailProtection();
        initMobileNav();
        initSmoothScroll();
        initHeaderScroll();
        initFaqAccordion();
        initContactForm();
        initScrollAnimations();
        initActiveNavOnScroll();
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Console branding
    console.log('%cPro Váš Klid', 'font-size: 20px; color: #3d557e; font-weight: bold;');
    console.log('%cVy nemusíte – my zařídíme.', 'font-size: 14px; color: #5A6A7A; font-style: italic;');

})();
