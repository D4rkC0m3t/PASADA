# PASADA Website Routes - Test Guide

## ✅ Correct URLs to Test (After starting dev server)

### Main Website Pages:
1. Homepage: `http://localhost:3000/en`
2. About: `http://localhost:3000/en/about`
3. Projects: `http://localhost:3000/en/projects`
4. Contact: `http://localhost:3000/en/contant-us`

### Work Detail Pages:
1. Classic White Kitchen: `http://localhost:3000/works/classic-white-kitchen`
2. Elegant Cashmere Kitchen: `http://localhost:3000/works/elegant-cashmere-kitchen`
3. Modern Kitchen: `http://localhost:3000/works/modern-kitchen`
4. Minimalist Kitchen: `http://localhost:3000/works/minimalist-kitchen`
5. Minimalist Kitchen 2: `http://localhost:3000/works/minimalist-kitchen-2`
6. Minimalist Kitchen 3: `http://localhost:3000/works/minimalist-kitchen-3`

### CRM Pages:
1. CRM Landing: `http://localhost:3000/`
2. Admin Dashboard: `http://localhost:3000/admin/dashboard`
3. Client Dashboard: `http://localhost:3000/client/dashboard`

## How Routing Works:

1. **Server-Side Redirects (Fast)**:
   - `/en/about` → automatically redirected to `/pasada.design/en/about.html`
   - This happens in `next.config.js`

2. **Static File Serving**:
   - `/pasada.design/en/about.html` → serves `public/pasada.design/en/about.html`

3. **Client Component Fallback**:
   - If redirect doesn't work, React page component handles the redirect

## File Locations:
```
public/
├── pasada.design/
│   ├── en/
│   │   ├── homepage.html
│   │   ├── about.html
│   │   ├── projects.html
│   │   └── contant-us.html
│   └── works/
│       ├── classic-white-kitchen.html
│       ├── elegant-cashmere-kitchen.html
│       ├── modern-kitchen.html
│       ├── minimalist-kitchen.html
│       ├── minimalist-kitchen-2.html
│       └── minimalist-kitchen-3.html
```

## Testing Steps:

1. Start dev server: `npm run dev`
2. Open browser to `http://localhost:3000/en`
3. Click navigation links in the website
4. All pages should load correctly

## If You See 404 Errors:

### Common Issues:
1. **Wrong URL Format**: Don't use `/pasada.design/` in your browser URL
   - ❌ Wrong: `http://localhost:3000/about/pasada.design/en/about.html`
   - ✅ Correct: `http://localhost:3000/en/about`

2. **Dev Server Not Restarted**: After config changes, restart with:
   ```
   npm run dev
   ```

3. **Cache Issues**: Clear browser cache (Ctrl+Shift+R or Ctrl+Shift+Delete)

4. **Port Conflict**: If port 3000 is busy, server might start on different port (check terminal)
