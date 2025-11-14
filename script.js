// ===== Mobile Navigation Toggle =====
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav-link');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        nav.classList.toggle('active');
        document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
    });
}

navLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (navToggle) {
            navToggle.classList.remove('active');
            nav.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
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

// ===== Header Scroll Effect =====
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// ===== FAQ Accordion =====
const faqQuestions = document.querySelectorAll('.faq-question');

faqQuestions.forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.closest('.faq-item');
        const isActive = faqItem.classList.contains('active');
        
        // Zavřít všechny ostatní FAQ
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Otevřít aktuální, pokud nebyl aktivní
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// ===== Formspree Contact Form =====
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
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
    service: {
        required: true,
        message: 'Prosím, vyberte službu'
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
const formFields = contactForm.querySelectorAll('input:not([name="_gotcha"]), select, textarea');
formFields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    
    field.addEventListener('input', () => {
        const formGroup = field.closest('.form-group');
        if (formGroup?.classList.contains('error')) {
            validateField(field);
        }
    });
});

// Form submission with Formspree
contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Validate all fields
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
    
    // Show loading state
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
            // Success!
            formSuccess.classList.add('show');
            contactForm.reset();
            
            // Hide success after 8 seconds
            setTimeout(() => {
                formSuccess.classList.remove('show');
            }, 8000);
            
            // Scroll to success message
            formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        } else {
            throw new Error('Formspree error');
        }
        
    } catch (error) {
        alert('Omlouváme se, došlo k chybě při odesílání formuláře. Zkuste to prosím znovu nebo nás kontaktujte telefonicky na +420 000 000 000.');
        console.error('Form submission error:', error);
    } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
    }
});

// ===== Scroll Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card, .process-step, .faq-item').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(30px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(element);
});
// ===== Console Info =====
console.log('%cPro Váš Klid', 'font-size: 20px; color: #5E5B3D; font-weight: bold;');
console.log('%cVy nemusíte – já zařídím.', 'font-size: 14px; color: #686551; font-style: italic;');
