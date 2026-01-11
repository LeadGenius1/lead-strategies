# 🤖 AGENT 3: LEADSITE.IO FRONTEND DEVELOPER

**Mission:** Complete LeadSite.IO website builder (80% ALREADY DONE!)

**Duration:** 1-2 days  
**Priority:** MEDIUM  
**Status:** ⏳ START IMMEDIATELY

**GOOD NEWS:** The builder is 80% complete! Core functionality exists.

---

## ✅ WHAT'S ALREADY DONE (80%)

- ✅ React DnD (@dnd-kit) installed and working
- ✅ Builder page structure complete
- ✅ Drag-drop canvas functional
- ✅ 3 section components built (Hero, Features, CTA)
- ✅ Section library/palette exists
- ✅ Real-time preview working
- ✅ Save/publish functionality implemented
- ✅ AI prompt-based generation

**Files:**
- `app/dashboard/websites/[id]/builder/page.tsx` ✅
- `components/website-builder/DragDropBuilder.tsx` ✅
- `components/sections/Hero.tsx` ✅
- `components/sections/Features.tsx` ✅
- `components/sections/CTA.tsx` ✅
- `lib/website-builder/types.ts` ✅
- `lib/website-builder/sections.ts` ✅

---

## 📋 YOUR TASKS (1-2 Days)

### Day 1: Complete Missing Section Components
- [ ] Build Testimonials.tsx section component
- [ ] Build Contact.tsx section component
- [ ] Build Pricing.tsx section component
- [ ] Build FAQ.tsx section component

### Day 2: Testing & Polish
- [ ] Test all sections in builder
- [ ] Mobile responsiveness verification
- [ ] Cross-browser testing
- [ ] Bug fixes and polish
- [ ] Create 3-5 complete template examples

---

## 💻 DAY 1 COMMANDS

```powershell
# Navigate to project
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website"

# ========================================
# 1. INSTALL DEPENDENCIES
# ========================================

# Install React DnD and supporting libraries
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
npm install react-hook-form
npm install @headlessui/react

# ========================================
# 2. CREATE FILE STRUCTURE
# ========================================

# Create builder directories
New-Item -Path "app\dashboard\websites\[id]\builder" -ItemType Directory -Force
New-Item -Path "app\dashboard\websites\[id]\builder\components" -ItemType Directory -Force
New-Item -Path "app\dashboard\websites\[id]\builder\components\sections" -ItemType Directory -Force
New-Item -Path "app\dashboard\websites\[id]\builder\lib" -ItemType Directory -Force

# Create files (will be populated with code)
New-Item -Path "app\dashboard\websites\[id]\builder\page.tsx" -ItemType File
New-Item -Path "app\dashboard\websites\[id]\builder\components\DragDropCanvas.tsx" -ItemType File
New-Item -Path "app\dashboard\websites\[id]\builder\components\SectionLibrary.tsx" -ItemType File
New-Item -Path "app\dashboard\websites\[id]\builder\components\PreviewPane.tsx" -ItemType File
New-Item -Path "app\dashboard\websites\[id]\builder\lib\templates.ts" -ItemType File
New-Item -Path "app\dashboard\websites\[id]\builder\lib\builderUtils.ts" -ItemType File

# Create section component files
New-Item -Path "app\dashboard\websites\[id]\builder\components\sections\HeroSection.tsx" -ItemType File
New-Item -Path "app\dashboard\websites\[id]\builder\components\sections\FeaturesSection.tsx" -ItemType File
New-Item -Path "app\dashboard\websites\[id]\builder\components\sections\CTASection.tsx" -ItemType File
New-Item -Path "app\dashboard\websites\[id]\builder\components\sections\TestimonialsSection.tsx" -ItemType File
New-Item -Path "app\dashboard\websites\[id]\builder\components\sections\ContactSection.tsx" -ItemType File
New-Item -Path "app\dashboard\websites\[id]\builder\components\sections\FooterSection.tsx" -ItemType File
```

---

## 📝 CODE TEMPLATES TO IMPLEMENT

### 1. Main Builder Page (`page.tsx`)

Create a page with:
- Left sidebar: Section library
- Center: Drag-drop canvas
- Right sidebar: Properties panel
- Top toolbar: Save, Preview, Publish buttons

**Key features:**
- DnD context from @dnd-kit/core
- State management for page sections
- Real-time preview updates
- Save/publish API integration

### 2. DragDropCanvas Component

**Functionality:**
- Sortable list of sections
- Drop zones between sections
- Section reordering
- Delete section capability

**Tech:**
- `@dnd-kit/sortable`
- `SortableContext`
- `useSortable` hook

### 3. Section Library Component

**Display:**
- Grid of available sections
- Drag handles on each section
- Preview thumbnails
- Category filtering

**Sections to include:**
- Hero Section (headline + CTA)
- Features Section (3-column grid)
- CTA Section (call to action)
- Testimonials Section (customer quotes)
- Contact Section (contact form)
- Footer Section (links + copyright)

### 4. Section Components

Each section needs:
- **View mode:** Render with actual content
- **Edit mode:** Inline editing or modal
- **Props interface:** Define editable properties
- **Default content:** Placeholder text/images

**Example Hero Section props:**
```typescript
interface HeroSectionProps {
  headline: string;
  subheadline: string;
  ctaText: string;
  ctaLink: string;
  backgroundImage?: string;
  backgroundColor?: string;
}
```

### 5. Templates Library (`templates.ts`)

Create 5 templates:

1. **Business Template:**
   - Hero + Features + Testimonials + Contact + Footer

2. **SaaS Template:**
   - Hero + Features + Pricing + CTA + Footer

3. **Portfolio Template:**
   - Hero + Gallery + About + Contact + Footer

4. **Landing Page Template:**
   - Hero + Benefits + Social Proof + CTA + Footer

5. **E-commerce Template:**
   - Hero + Products + Features + CTA + Footer

**Template format:**
```typescript
export const templates = [
  {
    id: 'business',
    name: 'Business',
    thumbnail: '/templates/business.png',
    sections: [
      { type: 'hero', props: {...} },
      { type: 'features', props: {...} },
      // ...
    ]
  },
  // ...
]
```

---

## 🎨 UI/UX REQUIREMENTS

### Design System:
- Use existing Tailwind CSS classes
- Match LeadSite.AI branding
- Professional, clean design
- Mobile-first approach

### User Experience:
- Drag section from library → canvas
- Click section to edit
- Live preview of changes
- Undo/redo capability (bonus)
- Autosave drafts

### Performance:
- Lazy load section components
- Debounce autosave
- Optimize re-renders
- Fast preview updates

---

## ✅ YOUR DELIVERABLES

### Day 1 Deliverables:
- [ ] Dependencies installed
- [ ] File structure created
- [ ] 6 section components built
- [ ] Basic styling applied

### Day 2 Deliverables:
- [ ] Drag-drop canvas functional
- [ ] Can add sections to canvas
- [ ] Can reorder sections
- [ ] Can remove sections

### Day 3 Deliverables:
- [ ] 5 templates created
- [ ] Template selection works
- [ ] Section editing modal
- [ ] Property changes reflect in preview

### Day 4 Deliverables:
- [ ] Save draft API integration
- [ ] Publish API integration
- [ ] Live URL generation
- [ ] Version history (basic)

### Day 5 Deliverables:
- [ ] Mobile responsive
- [ ] Cross-browser tested
- [ ] No console errors
- [ ] Ready for production

---

## 🎯 SUCCESS CRITERIA

### Functional Requirements:
- [ ] Can drag sections from library to canvas
- [ ] Can reorder sections on canvas
- [ ] Can edit section content
- [ ] Changes update in real-time
- [ ] Can save draft
- [ ] Can publish website
- [ ] Published site has unique URL
- [ ] Can apply templates

### Technical Requirements:
- [ ] TypeScript with proper types
- [ ] No ESLint errors
- [ ] No console errors
- [ ] Mobile responsive
- [ ] < 3 second load time
- [ ] Accessible (WCAG AA)

### User Experience:
- [ ] Intuitive drag-drop
- [ ] Clear visual feedback
- [ ] Helpful error messages
- [ ] Professional design
- [ ] Smooth animations

---

## ⚠️ POTENTIAL BLOCKERS

**If you encounter these issues:**

1. **DnD not working:**
   - Verify @dnd-kit/core installed correctly
   - Check DndContext wraps components
   - Ensure unique IDs for draggable items
   - Check console for errors

2. **API integration fails:**
   - Verify API endpoints exist: `/api/v1/websites/:id/save`
   - Check authentication token in requests
   - Verify request body format matches backend
   - Test endpoints with Postman first

3. **Performance issues:**
   - Implement React.memo on section components
   - Use useMemo for expensive calculations
   - Debounce autosave (500ms)
   - Lazy load section library

4. **Styling conflicts:**
   - Use Tailwind's @layer directive
   - Scope builder styles to builder page
   - Avoid global CSS changes
   - Test in isolated environment

---

## 📚 REFERENCE DOCUMENTATION

**React DnD Kit:**
- Docs: https://docs.dndkit.com/
- Examples: https://master--5fc05e08a4a65d0021ae0bf2.chromatic.com/

**Tailwind CSS:**
- Docs: https://tailwindcss.com/docs
- Builder examples: Look at Webflow, Wix editor UIs

**Next.js App Router:**
- Dynamic routes: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
- API routes: https://nextjs.org/docs/app/building-your-application/routing/route-handlers

---

## 📊 DAILY PROGRESS TRACKING

### Day 1 (Today):
- [ ] Morning: Setup + Hero section
- [ ] Afternoon: Features + CTA sections
- [ ] Evening: Testimonials + Contact + Footer sections

### Day 2:
- [ ] Morning: DragDropCanvas component
- [ ] Afternoon: SectionLibrary component
- [ ] Evening: Integration + testing

### Day 3:
- [ ] Morning: Create 5 templates
- [ ] Afternoon: Template selection UI
- [ ] Evening: Section editing modal

### Day 4:
- [ ] Morning: Save draft functionality
- [ ] Afternoon: Publish functionality
- [ ] Evening: Testing + bug fixes

### Day 5:
- [ ] Morning: Mobile responsiveness
- [ ] Afternoon: Cross-browser testing
- [ ] Evening: Final polish + handoff

---

## 🚀 START NOW!

**Your first command:**

```powershell
cd "c:\Users\ailea\Downloads\PROJECT 1\files\ai-lead-strategies-website"
Write-Host "AGENT 3 STARTING LEADSITE.IO BUILDER..." -ForegroundColor Magenta
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**Report status twice daily (morning & evening) to project lead.**

**Expected completion:** 5 days from now.

---

## 💡 PRO TIPS

1. **Start simple:** Get basic drag-drop working first, then add features
2. **Test frequently:** Test after each component
3. **Use existing patterns:** Look at existing dashboard pages for patterns
4. **Ask for help:** Don't spend > 1 hour stuck on one issue
5. **Document as you go:** Add comments to complex code
