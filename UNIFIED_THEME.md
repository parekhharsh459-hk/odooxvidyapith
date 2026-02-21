# FleetFlow - Unified Color Theme

## Overview
All dashboards now use a consistent color theme matching the Fleet Manager dashboard design for a cohesive user experience across all roles.

## Color Palette

### Primary Colors
- **Sidebar Background**: `#0F172A` (Dark Navy)
- **Sidebar Border**: `#1E293B` (Slate 800)
- **Logo Gradient**: `linear-gradient(135deg, #374151, #1F2937)`
- **Text Primary**: `#FFFFFF` (White)
- **Text Secondary**: `#94A3B8` (Slate 400)

### Accent Colors by Role
- **Fleet Manager**: Indigo (`#6366F1`, `#818CF8`)
- **Dispatcher**: Indigo (`#6366F1`, `#818CF8`)
- **Safety Officer**: Orange (`#EA580C`, `#F97316`)
- **Financial Analyst**: Indigo (`#6366F1`, `#818CF8`)

### Interactive States
- **Hover Background**: `rgba(255,255,255,0.04)`
- **Active Background**: Indigo/Orange (role-specific)
- **Active Text**: `#A5B4FC` (Indigo 300) or `#FED7AA` (Orange 200)
- **Active Border**: `3px solid` (role accent color)

## Component Styling

### Sidebar
```css
Background: #0F172A
Border: 1px solid #1E293B
Width: 288px (w-72)
Padding Top: 32px (pt-8)
```

### Logo Section
```jsx
<div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg" 
     style={{ background: 'linear-gradient(135deg,#374151,#1F2937)' }}>
    FF
</div>
<span className="text-white font-bold text-lg" 
     style={{ fontFamily: 'Rajdhani,sans-serif', letterSpacing: '0.04em' }}>
    FleetFlow
</span>
```

### Navigation Items
**Inactive State:**
```css
Background: transparent
Color: #94A3B8
Border-left: 3px solid transparent
```

**Hover State:**
```css
Background: rgba(255,255,255,0.04)
Color: #FFFFFF
```

**Active State (Indigo):**
```css
Background: rgba(99,102,241,0.15)
Color: #A5B4FC
Border-left: 3px solid #818CF8
```

**Active State (Orange - Safety Officer):**
```css
Background: rgba(234,88,12,0.15)
Color: #FED7AA
Border-left: 3px solid #F97316
```

### Logout Button
```jsx
<button className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-slate-400 hover:bg-slate-800 hover:text-white transition-all duration-300 font-bold text-sm">
    <IconLogout />
    LOGOUT
</button>
```

## Typography

### Font Families
- **Logo/Headers**: `Rajdhani, sans-serif`
- **Body Text**: `DM Sans, sans-serif` or system default
- **Monospace**: `ui-monospace, monospace`

### Font Weights
- **Logo**: 700 (Bold)
- **Navigation**: 600 (Semibold)
- **Headers**: 800-900 (Black)
- **Body**: 400-500 (Normal-Medium)

## Dashboard-Specific Implementations

### Fleet Manager Dashboard
- **Accent**: Indigo
- **Active Nav**: `rgba(99,102,241,0.15)` background with `#818CF8` border
- **Sidebar**: Collapsible (64px collapsed, 220px expanded)
- **Top Nav**: Fixed with user info and logout

### Dispatcher Dashboard
- **Accent**: Indigo
- **Active Nav**: `rgba(99,102,241,0.15)` background with `#818CF8` border
- **Sidebar**: Fixed 288px
- **Features**: Trip management, vehicle/driver availability

### Safety Officer Dashboard
- **Accent**: Orange
- **Active Nav**: `rgba(99,102,241,0.15)` background with `#818CF8` border
- **Sidebar**: Fixed 288px
- **Features**: Compliance monitoring, safety scores

### Financial Analyst Dashboard
- **Accent**: Indigo
- **Active Nav**: `rgba(99,102,241,0.15)` background with `#818CF8` border
- **Sidebar**: Fixed 288px
- **Features**: Financial analytics, ROI reports

## Consistency Checklist

✅ All dashboards use `#0F172A` sidebar background
✅ All dashboards use `#1E293B` border color
✅ All logos use the same gradient (`#374151` to `#1F2937`)
✅ All dashboards have "FleetFlow" branding with consistent styling (mixed case)
✅ All dashboards have logout buttons (sidebar footer or top nav)
✅ All navigation items use consistent hover/active states (subtle indigo background)
✅ All dashboards use the same font families (Rajdhani for logo)
✅ All dashboards have smooth transitions (150-300ms duration)
✅ Logo text format matches Fleet Manager exactly: "FleetFlow" in text-lg

## Benefits of Unified Theme

1. **Brand Consistency**: Users recognize FleetFlow across all dashboards
2. **Professional Appearance**: Enterprise-grade design language
3. **Better UX**: Familiar navigation patterns reduce cognitive load
4. **Maintainability**: Easier to update styles across the application
5. **Accessibility**: Consistent contrast ratios and interactive states

## Future Enhancements

- [ ] Add theme configuration file for easy customization
- [ ] Implement dark/light mode toggle
- [ ] Add role-specific accent color customization
- [ ] Create shared component library for common UI elements
- [ ] Add animation presets for consistent motion design

---

**Last Updated**: February 21, 2026
**Version**: 1.0.0
