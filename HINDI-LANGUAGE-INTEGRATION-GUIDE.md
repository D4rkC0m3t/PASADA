# Hindi Language Integration Guide
## PASADA Interior Design Website

---

## ✅ Completed Steps

### 1. **Language Toggle Updated (RO → HI)**
- ✅ Changed CSS class from `language-ro` to `language-hi`
- ✅ Changed link text from "Ro" to "Hi"
- ✅ Updated across all 10 HTML files
- ✅ **Total Replacements:** 40 instances

**Files Modified:**
- `public/pasada.design/en/homepage.html`
- `public/pasada.design/en/about.html`
- `public/pasada.design/en/projects.html`
- `public/pasada.design/en/contant-us.html`
- `public/pasada.design/works/classic-white-kitchen.html`
- `public/pasada.design/works/modern-kitchen.html`
- `public/pasada.design/works/elegant-cashmere-kitchen.html`
- `public/pasada.design/works/minimalist-kitchen.html`
- `public/pasada.design/works/minimalist-kitchen-2.html`
- `public/pasada.design/works/minimalist-kitchen-3.html`

---

## 📦 New Files Created

### 1. **Hindi Translation System**
**File:** `public/pasada.design/js/hindi-translations.js`

**Features:**
- ✅ Modular translation dictionary (English ↔ Hindi)
- ✅ LocalStorage persistence for language preference
- ✅ Audit logging for language switches
- ✅ Custom event dispatching (`languageChanged`)
- ✅ Automatic initialization on page load
- ✅ Data attribute-based translation (`data-translate`)

**Key Functions:**
```javascript
setLanguage('hi')          // Switch to Hindi
setLanguage('en')          // Switch to English
applyTranslations(lang)    // Apply translations to DOM
```

### 2. **Hindi Font Support**
**File:** `public/pasada.design/css/hindi-font-support.css`

**Features:**
- ✅ Noto Sans Devanagari font import from Google Fonts
- ✅ Language-specific font stacks
- ✅ Devanagari script optimization
- ✅ Responsive font sizing
- ✅ Print styles for Hindi
- ✅ Fallback fonts for compatibility

---

## 🔧 Integration Steps

### Step 1: Add CSS to HTML `<head>`

Add this **before** the closing `</head>` tag in all HTML files:

```html
<!-- Hindi Font Support -->
<link href="/pasada.design/css/hindi-font-support.css" rel="stylesheet" type="text/css" />
```

**Recommended Position:**
```html
<head>
    <!-- Existing Webflow CSS -->
    <link href="https://cdn.prod.website-files.com/..." rel="stylesheet" />
    
    <!-- ADD THIS LINE -->
    <link href="/pasada.design/css/hindi-font-support.css" rel="stylesheet" type="text/css" />
</head>
```

### Step 2: Add JavaScript Before Closing `</body>`

Add this **before** the closing `</body>` tag in all HTML files:

```html
<!-- Hindi Translation System -->
<script src="/pasada.design/js/hindi-translations.js"></script>
```

**Recommended Position:**
```html
<body>
    <!-- Page content -->
    
    <!-- Existing Webflow scripts -->
    <script src="https://cdn.jsdelivr.net/.../webflow.js"></script>
    
    <!-- ADD THIS LINE -->
    <script src="/pasada.design/js/hindi-translations.js"></script>
</body>
```

### Step 3: Add `data-translate` Attributes to Elements

To make text translatable, add `data-translate` attribute to elements:

**Example - Navigation:**
```html
<!-- Before -->
<a href="/en/homepage" class="navbar1_link">Home</a>

<!-- After -->
<a href="/en/homepage" class="navbar1_link" data-translate="navHome">Home</a>
```

**Example - Headings:**
```html
<!-- Before -->
<h1 class="heading-style-h2">Our Projects</h1>

<!-- After -->
<h1 class="heading-style-h2" data-translate="projectsHeading">Our Projects</h1>
```

**Example - Buttons:**
```html
<!-- Before -->
<a href="/en/contant-us" class="button">Get in Touch</a>

<!-- After -->
<a href="/en/contant-us" class="button" data-translate="navContact">Get in Touch</a>
```

---

## 📋 Translation Keys Available

### Navigation Keys
- `navHome` - Home / होम
- `navAbout` - About us / हमारे बारे में
- `navServices` - Services / सेवाएँ
- `navProjects` - projects / परियोजनाएं
- `navContact` - Get in Touch / संपर्क करें

### Hero Section Keys
- `heroTitle` - Hero title text
- `heroSubtitle` - Hero subtitle text

### Projects Section Keys
- `projectsHeading` - Our Projects / हमारी परियोजनाएं
- `projectsSubheading` - Subheading text

### Footer Keys
- `footerQuickLinks` - Quick Links / त्वरित लिंक
- `footerServices` - Services / सेवाएँ
- `footerContact` - Contact Us / संपर्क करें
- `footerEmail` - Email / ईमेल
- `footerPhone` - Phone / फ़ोन
- `footerLocation` - Location / स्थान
- `footerCopyright` - Copyright text
- `footerAttribution` - Attribution text

### Common Keys
- `readMore` - Read More / और पढ़ें
- `viewProject` - View Project / परियोजना देखें
- `getInTouch` - Get in Touch / संपर्क करें
- `learnMore` - Learn More / अधिक जानें

---

## 🧪 Testing Checklist

### Visual Testing
- [ ] Language toggle shows "En" and "Hi" correctly
- [ ] Clicking "Hi" switches navigation to Hindi
- [ ] Clicking "En" switches back to English
- [ ] Active language has underline indicator
- [ ] Font renders correctly for Hindi text
- [ ] No layout breaks with Hindi text

### Functional Testing
- [ ] Language preference persists on page reload
- [ ] Language selection works across all pages
- [ ] Console logs show language switch events
- [ ] No JavaScript errors in browser console
- [ ] Mobile menu language toggle works

### Cross-Browser Testing
- [ ] Chrome - Hindi font displays correctly
- [ ] Firefox - Language toggle works
- [ ] Safari - Devanagari script renders properly
- [ ] Edge - All translations apply

### Performance Testing
- [ ] Page load time not significantly impacted
- [ ] Font loads quickly (Google Fonts CDN)
- [ ] LocalStorage saves language preference
- [ ] No memory leaks on language switch

---

## 🎨 Customization

### Adding New Translations

Edit `hindi-translations.js` and add new keys:

```javascript
const translations = {
  en: {
    customKey: "Your English Text"
  },
  hi: {
    customKey: "आपका हिंदी पाठ"
  }
};
```

Then use in HTML:
```html
<p data-translate="customKey">Your English Text</p>
```

### Changing Default Language

In `hindi-translations.js`, modify line 146:

```javascript
// Default to Hindi instead of English
let currentLanguage = localStorage.getItem('pasada_language') || 'hi';
```

### Custom Font Weights

In `hindi-font-support.css`, adjust font weights:

```css
/* Modify the import to include different weights */
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@100;200;300;400;500;600;700;800;900&display=swap');
```

---

## 📊 Audit Trail

### Change Log
- **2025-11-05** - Initial Hindi language implementation
  - Replaced RO with HI in language toggle (40 instances)
  - Created translation system with 24 translation keys
  - Integrated Noto Sans Devanagari font
  - Added localStorage persistence
  - Implemented audit logging

### Files Created
1. `replace-ro-with-hi.ps1` - PowerShell automation script
2. `hindi-translations.js` - Translation system
3. `hindi-font-support.css` - Font configuration
4. `HINDI-LANGUAGE-INTEGRATION-GUIDE.md` - This documentation

### Modified Files (HTML)
- 10 files updated with language-hi class
- 10 files updated with "Hi" link text

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Integrate CSS and JS into all HTML files
- [ ] Add `data-translate` attributes to key elements
- [ ] Test language toggle on all pages
- [ ] Verify font loading on slow connections
- [ ] Check mobile responsiveness
- [ ] Test with screen readers for accessibility
- [ ] Validate HTML with W3C validator
- [ ] Run Lighthouse performance audit
- [ ] Test on multiple devices and browsers
- [ ] Document any custom translations added
- [ ] Update sitemap if creating /hi/ directory
- [ ] Configure server for language-specific URLs (optional)

---

## 🔮 Future Enhancements

### Phase 2: Full Hindi Content
- Create `/hi/` directory structure
- Translate all page content to Hindi
- Implement route-based language switching
- Add `hreflang` tags for SEO

### Phase 3: Advanced Features
- Automatic language detection based on browser settings
- Translation caching for performance
- Admin panel for managing translations
- Multi-language sitemap generation
- Language-specific meta tags

### Phase 4: CRM Integration
- Store user language preference in database
- Sync translations with Supabase
- Real-time translation updates
- Analytics for language usage

---

## 📞 Support

**Developer:** Arjun @ Phoenix  
**Project:** PASADA Interior Design  
**Date:** November 5, 2025  
**Version:** 1.0.0

For questions or issues, refer to the audit logs in browser console:
```javascript
// Check current language
console.log('[PASADA LANGUAGE] Current:', localStorage.getItem('pasada_language'));

// View all translations
console.log(translations);
```

---

## ✅ Quick Start Summary

1. **Run the replacement script** (Already done ✓)
   ```powershell
   .\replace-ro-with-hi.ps1
   ```

2. **Add CSS to all HTML files**
   ```html
   <link href="/pasada.design/css/hindi-font-support.css" rel="stylesheet" />
   ```

3. **Add JavaScript to all HTML files**
   ```html
   <script src="/pasada.design/js/hindi-translations.js"></script>
   ```

4. **Add data-translate attributes**
   ```html
   <a data-translate="navHome">Home</a>
   ```

5. **Test and deploy!**

---

**Status: ✅ Ready for Integration**
