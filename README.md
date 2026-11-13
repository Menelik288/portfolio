# Menelik Alemayehu — 3D portfolio

Vite + React + TypeScript, React Three Fiber (hero robot), GSAP ScrollTrigger (scroll animation), Framer Motion (UI transitions), Tailwind CSS v4.

## Setup

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build into dist/
npm run preview  # serve the production build
```

Deploy `dist/` to Vercel or Netlify. SPA fallbacks are included (`vercel.json`, `public/_redirects`).

## Editing content

Everything on the page is driven by **`src/data/content.ts`** — name, role, bio, stats, skills, services, projects (card, modal and case-study page all read the same entry), experience, testimonials and contact links.

- Anything marked `placeholder: true` or containing `PLACEHOLDER` is dummy content. Red dashed "placeholder" tags show where it is while you run `npm run dev`. The published build hides the tags and leaves out any project or experience entry still marked `placeholder: true`.
- **Images**: put files in `public/` and reference them by path, e.g. `about.photo = '/headshot.jpg'`, `thumbnail: '/projects/foo.jpg'`, `gallery: ['/projects/foo-1.jpg', …]`.
- **Résumé**: add `public/resume.pdf` and set `site.resumeUrl = '/resume.pdf'`.
- **Contact form**: set `site.contactEndpoint` to a URL that accepts a JSON `POST` of `{ name, email, message }` (Formspree, your own API…). While it is `null` the form opens the visitor's email app with the message filled in.
- **Tech stack**: the `techStack` groups in `content.ts` drive the Tech stack section.
- **Testimonials**: the section is hidden while the `testimonials` array is empty; add real quotes to show it.
- **Design tokens** (colours, fonts) are at the top of `src/index.css`, including the light-theme overrides.
- **SEO**: default title/description/Open Graph tags are in `index.html`. Replace `public/og-image.svg` with a 1200×630 PNG and use an absolute URL once you have a domain.
- **Analytics**: `src/lib/analytics.ts` is a placeholder `track()` hook called on page views and form submits.

## Swapping the robot model

The hero currently renders a placeholder head built from primitives (`src/three/RobotHead.tsx`).

1. Export your model as `.glb` with the rotating part in a node named **`Head`** and the optic in a node named **`Eye`** (both optional; without `Head` the whole scene rotates). The model should face +Z and be roughly 2 units tall.
2. Put it in `public/models/robot.glb`.
3. Set `site.robotModelUrl = '/models/robot.glb'` in `src/data/content.ts`.

Tracking limits (±35° yaw, ±20° pitch), damping and the idle scan are constants at the top of `RobotHead.tsx`. For the eye to bloom, give its material an emissive colour brighter than 1 with `toneMapped = false`. Position/scale of the robot in the hero is set in `Rig` in `src/three/HeroScene.tsx`.

## Structure

```
src/
  data/content.ts      all site content
  components/          one file per section (Nav, Hero, About, Services, Projects, Timeline, Testimonials, TechStack, Contact, Footer)
  pages/               Home, CaseStudy (/work/:slug), NotFound
  three/               HeroScene, RobotHead (lazy-loaded)
  lib/                 scroll-reveal hook, theme, SEO, analytics
```

## Behaviour notes

- The 3D bundle is lazy-loaded; a static poster (`public/hero-poster.svg`) shows while it loads and is the permanent fallback when WebGL is unavailable.
- The hero stops rendering when scrolled out of view.
- `prefers-reduced-motion` disables the idle scan, particles, scroll reveals, the pinned horizontal scroll (it becomes a normal swipeable row) and the cursor ring.
- On touch devices the head follows device tilt where the browser provides it, otherwise it runs the idle sweep.
