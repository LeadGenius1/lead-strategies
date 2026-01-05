# Troubleshooting Guide - Homepage Display Issues

## Issue: Only Pricing Page Shows Up

### Possible Causes & Solutions

#### 1. **Browser Cache Issue**
- **Solution**: Clear browser cache and hard refresh
  - Chrome/Edge: `Ctrl + Shift + Delete` or `Ctrl + F5`
  - Firefox: `Ctrl + Shift + Delete` or `Ctrl + F5`
  - Safari: `Cmd + Option + E` then `Cmd + R`

#### 2. **Deployment/Routing Issue**
- **Check**: Verify the homepage route (`/`) is correctly configured
- **Solution**: 
  - Ensure `app/page.js` is the root page
  - Check Vercel/deployment platform routing settings
  - Verify no redirects are configured

#### 3. **CSS/Display Issue**
- **Check**: Open browser DevTools (F12) and inspect elements
- **Look for**: 
  - Sections with `display: none` or `visibility: hidden`
  - Sections with `height: 0` or `opacity: 0`
  - Z-index conflicts

#### 4. **JavaScript Error**
- **Check**: Open browser console (F12 → Console tab)
- **Look for**: Red error messages
- **Solution**: Fix any JavaScript errors preventing rendering

#### 5. **Next.js Build Issue**
- **Solution**: Rebuild the application
  ```bash
  cd frontend
  npm run build
  npm run start
  ```

### Verification Steps

1. **Check All Sections Exist**:
   - Hero Section (top of page)
   - Platforms Section (`#platforms`)
   - Features Section (`#features`)
   - Pricing/CTA Section (`#pricing`)
   - Footer

2. **Test Direct Navigation**:
   - Visit: `https://leadsite.ai/`
   - Visit: `https://leadsite.ai/#platforms`
   - Visit: `https://leadsite.ai/#features`
   - Visit: `https://leadsite.ai/#pricing`

3. **Check Network Tab**:
   - Open DevTools → Network tab
   - Reload page
   - Verify all resources load (no 404 errors)

4. **Check Console**:
   - Open DevTools → Console tab
   - Look for warnings about missing sections
   - The code now logs warnings if sections are missing

### Quick Fixes Applied

✅ Added `useEffect` to scroll to top on page load
✅ Added section visibility verification
✅ Added `min-h-screen` and `w-full` classes for proper layout
✅ Added console warnings for missing sections

### If Issue Persists

1. **Check Deployment Logs**:
   - Vercel Dashboard → Deployments → View Logs
   - Look for build errors or warnings

2. **Verify File Structure**:
   ```
   frontend/
   ├── app/
   │   ├── page.js          ← Homepage (should exist)
   │   ├── layout.js
   │   ├── login/
   │   └── dashboard/
   ```

3. **Test Locally**:
   ```bash
   cd frontend
   npm run dev
   # Visit http://localhost:3000
   # Verify all sections show
   ```

4. **Check Environment Variables**:
   - Ensure `NEXT_PUBLIC_API_URL` is set correctly
   - Check for any environment-specific redirects

### Contact Support

If none of these solutions work, provide:
- Browser console errors (screenshot)
- Network tab errors (screenshot)
- Deployment logs
- What you see when visiting `leadsite.ai`


