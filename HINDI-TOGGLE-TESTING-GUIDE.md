# Hindi Language Toggle - Testing Guide
## PASADA Interior Design

---

## ✅ What Has Been Implemented

### 1. **Files Updated**
- ✅ **40 instances** of RO → HI across all HTML files
- ✅ **CSS & JS** integrated into 10 HTML files
- ✅ **50 data-translate attributes** added to navigation elements

### 2. **System Components**
- ✅ `hindi-font-support.css` - Noto Sans Devanagari font
- ✅ `hindi-translations.js` - Complete translation system
- ✅ Event listeners on language toggle links
- ✅ Visual notification system
- ✅ LocalStorage persistence

---

## 🧪 How to Test

### Step 1: Open Browser Console
1. Press **F12** to open Developer Tools
2. Go to the **Console** tab
3. Keep it open to see debug logs

### Step 2: Load the Homepage
```
http://localhost:3000/en/homepage (or your local server)
```

### Step 3: Watch Console Logs
You should see:
```
[PASADA LANGUAGE] Initializing language system...
[PASADA LANGUAGE] Found 4 language toggle links
[PASADA LANGUAGE] System initialized. Current language: en
```

### Step 4: Click "Hi" Toggle
When you click the "Hi" link, you should see:

1. **Console Logs:**
```
[CLICK] Link 1: Hi -> Language: hi
[PASADA LANGUAGE SWITCH] Selected: hi | Timestamp: 2025-11-05T...
[TRANSLATION] Applied X translations for language: hi
```

2. **Visual Changes:**
   - ✅ Notification appears in top-right: "Language changed to Hindi (हिंदी)"
   - ✅ "Hi" link gets underline (active state)
   - ✅ "En" link loses underline
   - ✅ Navigation text changes to Hindi:
     - Home → होम
     - About us → हमारे बारे में
     - Services → सेवाएँ
     - projects → परियोजनाएं
     - Get In Touch → संपर्क करें

3. **HTML Changes:**
   - `<html lang="hi">` attribute added
   - `<body class="lang-hi">` class added

### Step 5: Test Persistence
1. Click "Hi" to switch to Hindi
2. Refresh the page (F5)
3. Language should remain Hindi (saved in localStorage)

### Step 6: Switch Back to English
1. Click "En" toggle
2. Same notification appears: "Language changed to English"
3. Navigation text returns to English

---

## 🔍 Troubleshooting

### Issue: No Console Logs
**Cause:** JavaScript not loading

**Fix:**
```html
<!-- Check if this is present before </body> -->
<script src="/pasada.design/js/hindi-translations.js"></script>
```

### Issue: Click Does Nothing
**Cause:** Event listeners not attached

**Debug:**
```javascript
// Run in console
document.querySelectorAll('.language-wrapper a').length
// Should return 4 (2 mobile + 2 desktop)
```

### Issue: Text Not Changing
**Cause:** Missing data-translate attributes

**Fix:** Check if navigation has:
```html
<a data-translate="navHome">Home</a>
<a data-translate="navAbout">About us</a>
```

### Issue: Font Not Loading
**Cause:** CSS not included

**Fix:**
```html
<!-- Check if this is in <head> -->
<link href="/pasada.design/css/hindi-font-support.css" rel="stylesheet" />
```

### Issue: Notification Not Showing
**Cause:** Z-index conflict

**Debug:**
```javascript
// Check if element exists
document.getElementById('pasada-lang-notification')
```

---

## 🎯 Expected Behavior Summary

| Action | Expected Result |
|--------|----------------|
| **Page Load** | English by default, console logs appear |
| **Click "Hi"** | Notification shows, text changes to Hindi, underline moves |
| **Click "En"** | Notification shows, text changes to English, underline moves |
| **Refresh Page** | Language persists (stays in last selected language) |
| **Console** | Clear logs for every action with timestamps |
| **LocalStorage** | `pasada_language` key stores 'en' or 'hi' |

---

## 🧩 Manual Console Testing

### Check Current Language
```javascript
localStorage.getItem('pasada_language')
```

### Force Switch to Hindi
```javascript
setLanguage('hi')
```

### Force Switch to English
```javascript
setLanguage('en')
```

### View All Translations
```javascript
console.table(translations.hi)
console.table(translations.en)
```

### Check Event Listeners
```javascript
document.querySelectorAll('.language-wrapper a').forEach((link, i) => {
  console.log(`Link ${i}:`, link.textContent.trim(), link.className);
});
```

---

## 📱 Mobile Testing

### Mobile Menu
1. Resize browser to mobile width (< 767px)
2. Open hamburger menu
3. Language toggle should be visible at top
4. Click "Hi" or "En" should work same as desktop

---

## ✅ Verification Checklist

- [ ] Console shows initialization logs
- [ ] Console shows 4 language links found
- [ ] Clicking "Hi" triggers console log
- [ ] Notification appears in top-right corner
- [ ] Navigation text changes to Hindi
- [ ] "Hi" link gets underline
- [ ] HTML lang attribute changes to "hi"
- [ ] Body gets "lang-hi" class
- [ ] Page refresh maintains Hindi selection
- [ ] Clicking "En" switches back to English
- [ ] LocalStorage has "pasada_language" key
- [ ] No JavaScript errors in console
- [ ] Mobile menu language toggle works
- [ ] Font changes to Noto Sans Devanagari for Hindi

---

## 🚀 Production Deployment Checklist

Before deploying:

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices
- [ ] Test language persistence across multiple pages
- [ ] Verify no console errors
- [ ] Check font loading performance
- [ ] Validate HTML (W3C Validator)
- [ ] Run Lighthouse audit
- [ ] Test with slow network connection
- [ ] Verify accessibility (screen readers)
- [ ] Test with JavaScript disabled (graceful degradation)

---

## 📊 Performance Metrics

### Expected Load Times
- **Google Fonts (Noto Sans Devanagari):** < 200ms
- **Translation JS:** < 50ms
- **Language Switch:** < 100ms

### LocalStorage Size
- **Key:** `pasada_language`
- **Value:** 2 bytes ("en" or "hi")

---

## 🎨 Visual Indicators

### Active Language Styling
```css
.language-wrapper a.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: currentColor;
}
```

### Notification Styling
- Position: Fixed top-right
- Background: Dark gradient (#1d1d1d → #2a2a2a)
- Animation: Slide in from right
- Duration: 2 seconds visible
- Font: Noto Sans Devanagari

---

## 📞 Support & Debugging

If the toggle still doesn't respond:

1. **Clear browser cache:** Ctrl+Shift+Delete
2. **Hard refresh:** Ctrl+Shift+R
3. **Check file paths:** All paths start with `/pasada.design/`
4. **Verify file encoding:** UTF-8
5. **Check console errors:** Fix any JavaScript errors first

**Quick Diagnostic:**
```javascript
// Run this in console
console.log('JS Loaded:', typeof setLanguage !== 'undefined');
console.log('Links Found:', document.querySelectorAll('.language-wrapper a').length);
console.log('Current Lang:', localStorage.getItem('pasada_language'));
```

---

**Status: ✅ Ready for Testing**  
**Last Updated:** November 5, 2025  
**Version:** 1.0.0
