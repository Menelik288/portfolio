# 3D Portfolio Build Prompt

Use these skills for this project: `react-three-fiber`, `threejs-webgl`, `gsap-scrolltrigger`, `motion-framer`, and `modern-web-design` (all installed in `~/.claude/skills`). Load them before writing any 3D or animation code.

---

## Goal

Build a professional, futuristic 3D portfolio website. The first impression is a full-screen 3D hero scene with a cyborg robot head that follows the visitor's cursor. The rest of the site is a clean, performant portfolio with scroll-driven animations.

## Stack

- Vite + React + TypeScript
- React Three Fiber (`@react-three/fiber`) and `@react-three/drei`
- `@react-three/postprocessing` for bloom and subtle glow
- GSAP + ScrollTrigger for scroll animations
- Framer Motion for UI transitions and micro-interactions
- Tailwind CSS (or CSS modules) for layout and styling
- Deploy target: Vercel or Netlify

## 1. Hero section (the signature piece)

**Robot head**
- A futuristic cyborg endoskeleton head in the style of classic sci-fi robots: brushed gunmetal or chrome metal, exposed mechanical joints, a glowing red optical sensor for the eye, and subtle panel seams.
- This should be an original design inspired by the genre, not a replica of a specific copyrighted character.
- Load the model as a `.glb` file with `useGLTF`. Keep the head as its own node group so rotation can be applied to it.
- Head tracking: track the pointer position in normalized device coordinates. Each frame, use `useFrame` to lerp the head's `rotation.y` and `rotation.x` toward the cursor, with clamped limits (for example ±35° yaw and ±20° pitch) so it never spins unnaturally. Add a slight delay or damping so the motion feels mechanical and deliberate. Also rotate the eye/sensor to look at the cursor.
- On mobile, replace cursor tracking with device orientation or a slow idle sweep.
- Idle behavior: when the cursor is still for a few seconds, the head performs a slow scan (left, right, back to center).
- Lighting: a cool rim light and a red point light tied to the eye glow. Add a reflective environment map (`Environment` from drei) for metal realism.
- Post-processing: bloom on the eye and emissive highlights only. Keep total draw calls and polygon count reasonable (target 60 fps on a mid-range laptop).
- Background: dark gradient with a faint particle field or grid floor that reacts to scroll.

**Hero text overlay**
- Name, one-line role (for example "Full-stack engineer & 3D interaction designer"), and two CTA buttons (View Work, Contact).
- Entrance animation: text reveals with a staggered GSAP timeline when the page loads.
- Scroll indicator at the bottom.

**Performance and fallbacks**
- Lazy-load the 3D canvas, show a static poster image while it loads.
- Detect WebGL support and fall back to a 2D image if unavailable.
- Respect `prefers-reduced-motion` by disabling idle scanning and heavy particle effects.

## 2. Portfolio modules

Build each as its own component so content is data-driven (edit a JSON or TS file to change content).

1. **Navigation**: fixed top bar, transparent over the hero, solid on scroll. Mobile hamburger menu with a Framer Motion slide-in.
2. **About**: short bio, photo or 3D avatar, key stats (years of experience, projects shipped, clients), and a skills grid with animated progress or chips.
3. **Services / Expertise**: 3–4 cards (for example 3D web experiences, product configurators, motion design, front-end engineering). Cards tilt on hover using a subtle 3D transform.
4. **Featured projects**: a pinned horizontal scroll section driven by ScrollTrigger. Each project card has a thumbnail, title, tags, and a case-study link. Clicking opens a modal with a gallery, the problem, the solution, the stack, and results.
5. **Project case study pages**: optional routed pages with hero image, sections (challenge, process, outcome), and next/previous navigation.
6. **3D showcase**: an interactive product or model viewer (orbit controls, lighting presets) for at least one featured 3D piece.
7. **Experience timeline**: vertical timeline that draws a line as the user scrolls, with each role fading in.
8. **Testimonials**: slider or stacked cards with quotes, names, roles, and company logos.
9. **Blog / writing** (optional): latest 3 posts from a markdown folder or CMS.
10. **Contact**: form with name, email, message, validation, and a success state. Include email, LinkedIn, GitHub, and location. Add a "Download résumé" button.
11. **Footer**: links, social icons, copyright, and a back-to-top button.
12. **Global extras**: custom cursor (desktop only), page transitions between routes (Barba or Framer Motion `AnimatePresence`), a dark/light theme toggle, SEO meta tags and Open Graph images, a 404 page, and analytics hook (placeholder).

## 3. Motion and interaction rules

- Every section animates once on enter (ScrollTrigger with `once: true` unless noted).
- Use consistent easing and durations (for example 0.6–0.9s, `power3.out`).
- Animate only `transform` and `opacity` for smooth 60 fps performance.
- Hover states on all interactive elements.
- Keep motion subtle outside the hero. The robot is the showpiece.

## 4. Design system

- Color tokens: background near-black (#0A0A0C), surface (#14151A), primary accent electric cyan (#00E5FF), secondary accent warning red (#FF2A2A) used sparingly for the robot's eye and CTAs. Text off-white (#E6E8EE) and muted gray (#8A8F9C).
- Typography: a geometric display font for headings (for example Space Grotesk or Orbitron used sparingly), and a readable sans for body (for example Inter). Fluid type scale.
- Spacing on an 8px grid. Max content width 1200px.
- Accessibility: WCAG AA contrast, visible focus rings, semantic HTML, alt text, keyboard navigation for all modules, skip-to-content link.
- Responsive breakpoints: mobile first (375px), tablet (768px), desktop (1280px+). No horizontal scroll on mobile.

## 5. Assets and mockups: ask me to provide these

Do NOT invent these. Stop and ask me for each one before building that part. Use clearly marked placeholders in the meantime.

**Required from me**
1. **Robot 3D model** (`.glb` or `.gltf` with separate head node). If I don't have one, I'll need to choose between downloading a free model from Sketchfab or Poly Haven (I'll approve the license first), or having a placeholder built from primitives.
2. **Headshot or avatar** photo for the About section.
3. **Project list**: titles, descriptions, tags, thumbnail images, live links, and case-study content for each project.
4. **3D project assets** (any models or videos to showcase in the 3D viewer).
5. **Résumé PDF**.
6. **Experience and education** details.
7. **Testimonials** (quotes, names, roles, company logos).
8. **Brand**: logo, preferred name or handle, and any brand colors or fonts that override the defaults above.
9. **Contact details** and social links.
10. **Blog posts** (if the blog module is included).

**Design mockups I should provide (optional but recommended)**
- Figma or image mockups for the hero, project grid, and case study page. If none, the agent will design from this brief and show me a screenshot for approval before building the full site.

**Components the agent should design or source (tell me if you want me to download any)**
- Custom cursor, hover-tilt cards, pinned horizontal scroll, and project modal: the agent designs these.
- Icons: Lucide or Phosphor (open license, will be installed via npm).
- Fonts: Google Fonts (Space Grotesk, Inter, Orbitron), loaded from the official source.
- Environment HDRI for reflections: Poly Haven (CC0). Needs your approval before download.
- Any extra 3D props or background models: ask me first.

## 6. Deliverables and process

1. Scaffold the project and install dependencies.
2. Build the hero with a placeholder robot first, confirm the head-tracking works, then swap in the real model.
3. Build the portfolio modules in the order listed above.
4. Make it responsive and accessible; run a Lighthouse check (target 90+ performance on desktop, with the 3D scene lazy-loaded).
5. Write a README covering setup, how to edit content, and how to swap the robot model.
6. Show me screenshots of the hero and each module at desktop and mobile widths before calling it done.

Start by asking me for the items in section 5, then scaffold the project while I gather them.
