// ============================================================================
// Hindi Language Translation System
// ============================================================================
// Description: Modular, audit-ready language switcher for PASADA Interior Design
// Author: Arjun @ Phoenix
// Date: 2025-11-05
// Version: 1.0.0
// ============================================================================

/**
 * Translation Dictionary
 * Structure: { language_code: { element_id: "translated_text" } }
 */
const translations = {
  en: {
    // Navigation
    navHome: "Home",
    navAbout: "About us",
    navServices: "Services",
    navProjects: "projects",
    navContact: "Get in Touch",
    
    // Hero Section
    heroTitle: "tailored furniture & interior design services",
    heroSubtitle: "Transform your home or office with our custom tailored furniture & interior design services.",
    
    // Projects Section
    projectsHeading: "Our Projects",
    projectsSubheading: "Explore our portfolio of stunning interior designs",
    
    // Footer
    footerQuickLinks: "Quick Links",
    footerServices: "Services",
    footerContact: "Contact Us",
    footerEmail: "Email",
    footerPhone: "Phone",
    footerLocation: "Location",
    footerCopyright: "© 2024. PASADA Groups",
    footerAttribution: "Website By ARJUN @ Phoenix",
    
    // Common
    readMore: "Read More",
    viewProject: "View Project",
    getInTouch: "Get in Touch",
    learnMore: "Learn More"
  },
  
  hi: {
    // Navigation (Hindi - Devanagari)
    navHome: "होम",
    navAbout: "हमारे बारे में",
    navServices: "सेवाएँ",
    navProjects: "परियोजनाएं",
    navContact: "संपर्क करें",
    
    // Hero Section
    heroTitle: "अनुकूलित फर्नीचर और आंतरिक डिज़ाइन सेवाएँ",
    heroSubtitle: "हमारी अनुकूलित फर्नीचर और आंतरिक डिज़ाइन सेवाओं के साथ अपने घर या कार्यालय को बदलें।",
    
    // Projects Section
    projectsHeading: "हमारी परियोजनाएं",
    projectsSubheading: "आंतरिक डिज़ाइनों के हमारे शानदार पोर्टफोलियो का अन्वेषण करें",
    
    // Footer
    footerQuickLinks: "त्वरित लिंक",
    footerServices: "सेवाएँ",
    footerContact: "संपर्क करें",
    footerEmail: "ईमेल",
    footerPhone: "फ़ोन",
    footerLocation: "स्थान",
    footerCopyright: "© 2024. PASADA Groups",
    footerAttribution: "Website By ARJUN @ Phoenix",
    
    // Common
    readMore: "और पढ़ें",
    viewProject: "परियोजना देखें",
    getInTouch: "संपर्क करें",
    learnMore: "अधिक जानें"
  }
};

/**
 * Current Language State
 * Stored in localStorage for persistence across page loads
 */
let currentLanguage = localStorage.getItem('pasada_language') || 'en';

/**
 * Set Language Function
 * @param {string} lang - Language code ('en' or 'hi')
 */
function setLanguage(lang) {
  // Audit log
  console.log(`[PASADA LANGUAGE SWITCH] Selected: ${lang} | Timestamp: ${new Date().toISOString()}`);
  
  // Validate language code
  if (!translations[lang]) {
    console.error(`[ERROR] Invalid language code: ${lang}`);
    return;
  }
  
  // Update current language
  currentLanguage = lang;
  
  // Save to localStorage for persistence
  localStorage.setItem('pasada_language', lang);
  
  // Update HTML lang attribute for proper font rendering
  document.documentElement.setAttribute('lang', lang);
  
  // Add/remove language class on body
  document.body.classList.remove('lang-en', 'lang-hi');
  document.body.classList.add(`lang-${lang}`);
  
  // Apply translations to all elements with data-translate attribute
  applyTranslations(lang);
  
  // Update language toggle active state
  updateLanguageToggle(lang);
  
  // Show visual feedback
  showLanguageChangeNotification(lang);
  
  // Dispatch custom event for other components to listen
  window.dispatchEvent(new CustomEvent('languageChanged', { detail: { language: lang } }));
}

/**
 * Apply Translations to DOM Elements
 * @param {string} lang - Language code
 */
function applyTranslations(lang) {
  const langData = translations[lang];
  
  // Get all elements with data-translate attribute
  const translatableElements = document.querySelectorAll('[data-translate]');
  
  translatableElements.forEach(element => {
    const key = element.getAttribute('data-translate');
    
    if (langData[key]) {
      // Check if element is input/textarea (use placeholder)
      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        element.placeholder = langData[key];
      } else {
        element.textContent = langData[key];
      }
    }
  });
  
  console.log(`[TRANSLATION] Applied ${translatableElements.length} translations for language: ${lang}`);
}

/**
 * Update Language Toggle Active State
 * @param {string} lang - Language code
 */
function updateLanguageToggle(lang) {
  // Remove active class from all language links
  document.querySelectorAll('.language-wrapper a').forEach(link => {
    link.classList.remove('active', 'w--current');
  });
  
  // Add active class to selected language
  const selector = lang === 'en' ? '.text-colour-xx' : '.language-hi';
  const activeLinks = document.querySelectorAll(selector);
  
  activeLinks.forEach(link => {
    link.classList.add('active', 'w--current');
  });
}

/**
 * Show Language Change Notification
 * @param {string} lang - Language code
 */
function showLanguageChangeNotification(lang) {
  const languageName = lang === 'hi' ? 'Hindi (हिंदी)' : 'English';
  
  // Create notification element
  let notification = document.getElementById('pasada-lang-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'pasada-lang-notification';
    notification.style.cssText = `
      position: fixed;
      top: 80px;
      right: 20px;
      background: linear-gradient(135deg, #1d1d1d 0%, #2a2a2a 100%);
      color: #fff8f1;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
      z-index: 10000;
      font-family: 'Noto Sans Devanagari', 'Satoshi', sans-serif;
      font-size: 14px;
      font-weight: 500;
      opacity: 0;
      transform: translateX(100%);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid rgba(255, 248, 241, 0.1);
    `;
    document.body.appendChild(notification);
  }
  
  notification.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
      </svg>
      <span>Language changed to ${languageName}</span>
    </div>
  `;
  
  // Show notification
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(0)';
  }, 10);
  
  // Hide notification after 2 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
  }, 2000);
}

/**
 * Initialize Language System
 * Called on page load
 */
function initLanguageSystem() {
  console.log('[PASADA LANGUAGE] Initializing language system...');
  
  // Apply saved language or default to English
  applyTranslations(currentLanguage);
  updateLanguageToggle(currentLanguage);
  
  // Add click event listeners to ALL language toggle buttons (both mobile and desktop)
  const languageLinks = document.querySelectorAll('.language-wrapper a');
  
  console.log(`[PASADA LANGUAGE] Found ${languageLinks.length} language toggle links`);
  
  languageLinks.forEach((link, index) => {
    link.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default link behavior
      e.stopPropagation(); // Stop event bubbling
      
      // Determine language from class or text content
      const isHindi = link.classList.contains('language-hi') || link.textContent.trim() === 'Hi';
      const selectedLang = isHindi ? 'hi' : 'en';
      
      console.log(`[CLICK] Link ${index}: ${link.textContent.trim()} -> Language: ${selectedLang}`);
      
      setLanguage(selectedLang);
    });
  });
  
  console.log(`[PASADA LANGUAGE] System initialized. Current language: ${currentLanguage}`);
}

/**
 * Auto-initialize on DOM ready
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLanguageSystem);
} else {
  // DOM already loaded
  initLanguageSystem();
}

/**
 * Export for module usage (if needed)
 */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { setLanguage, translations, currentLanguage };
}
