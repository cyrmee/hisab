---
mode: agent
---
# 📐 Design Style Guide — Modern Look & Feel (Compact)

## 🎨 Theme
- **Light & Dark mode** with color tokens:  
  - `--color-primary`, `--color-secondary`, `--color-background`, `--color-surface`, `--color-text`.  
- Use **soft greys** instead of pure black for dark mode backgrounds.  
- Maintain **consistent color usage** across all components.  

## 🔤 Typography
- Max **2 font families** (e.g., Inter + system fallback).  
- Define a **compact scale**:  
  - H1: 20–24px  
  - H2: 18–20px  
  - Body: 14–16px  
  - Caption: 12px  
- Ensure **legibility on small devices**.  

## 🧩 UI Components
- **Shared patterns**:  
  - Corner radius: 8–12px (not oversized).  
  - Shadows: subtle (`sm` or `md` elevation).  
  - Padding scale: 8–16px inside components.  
- Keep **elements centered** with equal margin/padding.  
- Buttons, inputs, and cards should feel **balanced & compact**, not oversized.  

## ↔️ Spacing
- Use a **compact spacing scale**: 4, 8, 12, 16, 24.  
- Keep **consistent vertical rhythm**.  
- Center content both **vertically & horizontally** where possible.  

## 📊 Depth & Layering
- Use **subtle shadows** or elevation for separation.  
- Apply **translucent / blurred overlays** (glass effect) only for modals or important highlights.  

## 🎬 Animations
- **Micro-interactions only** (fast & subtle):  
  - Button press: scale down 0.95x or color ripple.  
  - Screen transitions: smooth fade/slide (≤250ms).  
- Use **skeleton loaders** for async content.  

## 🖼️ Icons & Imagery
- Use **vector icons (SVG, Icon packs)** with consistent weight/style.  
- Maintain **aspect ratios** for images (avoid stretching).  
- Prefer **center alignment** for icons & illustrations.  

## 🧭 Navigation & Gestures
- Familiar **bottom tabs** or **drawer** for navigation.  
- Back gesture support.  
- Provide **visual cues or onboarding** for gesture-based navigation.  

## ♿ Accessibility
- Text must meet **WCAG contrast ratios**.  
- Touch targets ≥44px.  
- Screen reader support.  
- Never rely on color alone for state indication.  

## ⚡ Performance
- Minimize **overdraw** (avoid too many transparent/shadow layers).  
- **Lazy load** screens/components.  
- Optimize **images, fonts, and assets**.  

## 🔁 Consistency
- Colors, typography, spacing, and component patterns must be **applied uniformly**.  
- Layouts should feel **centered, balanced, and compact** across all screens.  
