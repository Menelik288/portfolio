/**
 * ALL SITE CONTENT LIVES HERE.
 * Anything marked `placeholder: true` (or containing "PLACEHOLDER") is dummy
 * content waiting for the real thing. Set `site.showPlaceholderTags = false`
 * to hide the red "placeholder" tags once everything is filled in.
 */

export const site = {
  name: 'Menelik Alemayehu',
  initials: 'MA',
  role: 'Full-stack developer',
  tagline: 'Software engineer building practical, scalable, user-focused software — from the database to the last pixel.',
  description:
    'Portfolio of Menelik Alemayehu, a software engineer and full-stack developer building web and mobile products with React, React Native, Node.js and PostgreSQL.',
  /** Placeholder tags and placeholder entries show while developing (npm run dev) and are left out of the published build. */
  showPlaceholderTags: import.meta.env.DEV,
  /** Path to a .glb robot with nodes named "Head" and "Eye". null = built-in primitive head. */
  robotModelUrl: null as string | null,
  /** POST endpoint for the contact form (Formspree, Netlify Forms, your API…). null = the form opens the visitor's email app with the message filled in. */
  contactEndpoint: null as string | null,
  /** Put the file in /public and set e.g. '/resume.pdf'. null = button hidden behind a placeholder. */
  resumeUrl: null as string | null,
  contact: {
    placeholder: false,
    email: 'menelikalemayehu28@gmail.com',
    /** e.g. 'Addis Ababa, Ethiopia'. null = not shown. */
    location: null as string | null,
    github: 'https://github.com/Menelik288',
    linkedin: 'https://linkedin.com/in/menelik-alemayehu-61727b371',
    instagram: 'https://instagram.com/bi9ears' as string | null,
  },
}

export const nav = [
  { label: 'About', hash: 'about' },
  { label: 'Services', hash: 'services' },
  { label: 'Work', hash: 'work' },
  { label: 'Experience', hash: 'experience' },
  { label: 'Stack', hash: 'stack' },
  { label: 'Contact', hash: 'contact' },
]

export const about = {
  /** Put a photo in /public and set e.g. '/headshot.jpg'. */
  photo: '/profile.jpeg' as string | null,
  bio: [
    'I’m a software engineer and full-stack developer who likes building practical, scalable and user-focused software.',
    'I enjoy working across the whole development lifecycle — designing interfaces, architecting back ends, modelling databases, building APIs, deploying, and improving what’s shipped.',
    'I’m especially interested in where full-stack development, systems programming and AI-powered development meet. My approach: build, learn, break, understand, improve.',
  ],
  stats: [
    {
      value: 10,
      suffix: 'K+',
      label: 'Users & Visitors Reached',
      detail: 'High-traffic consumer & web platforms built and deployed',
      category: 'Impact',
      icon: 'users' as const,
    },
    {
      value: 5,
      suffix: '+',
      label: 'Production Systems Shipped',
      detail: 'Enterprise ERPs, NGO platforms & mobile applications',
      category: 'Delivery',
      icon: 'layers' as const,
    },
    {
      value: 100,
      suffix: '%',
      label: 'Full-Lifecycle Ownership',
      detail: 'From schema design & REST APIs to responsive UI & deployment',
      category: 'Engineering',
      icon: 'code' as const,
    },
  ],
  exploring: ['Agentic AI', 'Machine learning', 'Local LLMs', 'System design', 'Enterprise applications', 'Open source'],
}

export type ServiceIcon = 'layout' | 'server' | 'box' | 'sparkles'
export const services: { icon: ServiceIcon; title: string; text: string }[] = [
  {
    icon: 'layout',
    title: 'Web applications',
    text: 'Responsive front ends in React, Next.js and Tailwind CSS, from dashboards to consumer products.',
  },
  {
    icon: 'box',
    title: 'Mobile apps',
    text: 'Cross-platform iOS and Android apps with React Native and Expo, sharing a back end with the web.',
  },
  {
    icon: 'server',
    title: 'Back ends & databases',
    text: 'REST APIs with Node.js and Express, JWT authentication, and relational schemas in PostgreSQL and Supabase.',
  },
  {
    icon: 'sparkles',
    title: 'Business systems',
    text: 'ERP and management platforms: inventory, HR, roles and permissions, reporting dashboards and workflows.',
  },
]

export type Project = {
  slug: string
  placeholder?: boolean
  title: string
  summary: string
  tags: string[]
  /** Image path in /public, or null for a generated placeholder tile. */
  thumbnail: string | null
  gallery: string[]
  hue: number
  liveUrl: string | null
  repoUrl: string | null
  problem: string
  solution: string
  stack: string[]
  results: string[]
  caseStudy: { challenge: string; process: string; outcome: string }
}

const allProjects: Project[] = [
  {
    slug: 'notflix',
    title: 'NOTFLIX',
    summary:
      'A full movie, TV and anime platform on web and mobile, with accounts, watchlists and continue-watching progress.',
    tags: ['Web', 'Mobile', 'Full-stack'],
    thumbnail: '/projects/notflix-1.jpg',
    gallery: ['/projects/notflix-1.jpg', '/projects/notflix-2.jpg', '/projects/notflix-3.jpg'],
    hue: 0,
    liveUrl: 'https://www.notflix.pro.et/#/',
    repoUrl: 'https://github.com/Menelik288/NOTFLIX-web',
    problem:
      'Build a streaming-style browsing experience that feels premium on both web and phones, backed by live catalogue data and real user accounts.',
    solution:
      'A React and Vite web app with an Express proxy server that caches TMDB and AniList data, plus a React Native and Expo mobile app. Supabase handles authentication, profiles, watchlists and viewing progress across both.',
    stack: ['React 19', 'Vite', 'Tailwind CSS', 'Express.js', 'Supabase (PostgreSQL)', 'React Native', 'Expo', 'TMDB API', 'AniList GraphQL', 'Hls.js'],
    results: [
      '10K+ visitors to the web platform within 3 months',
      'Live on a custom domain, with a companion iOS and Android app',
      'English and Amharic localisation',
    ],
    caseStudy: {
      challenge:
        'Deliver a catalogue of movies, TV shows and anime with search, user profiles, a watchlist and resume-where-you-left-off — on the web and as a native-feeling mobile app — without exposing API keys or hammering third-party APIs.',
      process:
        'The web client is React 19 with Vite and Tailwind CSS. An Express.js proxy sits between the client and the data providers, adding in-memory caching and rate limiting. TMDB supplies movies and TV, the AniList GraphQL API supplies anime metadata, and a dedicated anime hub adds season and episode selectors. Supabase provides sign-up and login, profiles, the watchlist and continue-watching tracking. The mobile app, built with React Native and Expo, reuses the same Supabase back end and adds auto-scrolling rails, advanced filters, skeleton loading and screen-rotation handling for playback.',
      outcome:
        'The web platform reached more than 10,000 visitors in its first three months and runs on its own domain. Web and mobile share one account system, so a watchlist built on one shows up on the other.',
    },
  },
  {
    slug: 'medallion-theater',
    title: 'Medallion Theater',
    summary:
      'A ticket reservation and management system for a theatre’s will-call desk, with a real-time seat map that prevents double booking.',
    tags: ['Web', 'Management system', 'Dashboard'],
    thumbnail: '/projects/medallion-1.jpg',
    gallery: ['/projects/medallion-1.jpg', '/projects/medallion-2.jpg', '/projects/medallion-3.jpg'],
    hue: 265,
    liveUrl: 'https://medallion-theater.vercel.app',
    repoUrl: 'https://github.com/Menelik288/Medallion-Theater',
    problem:
      'Clerks and managers need to handle patrons, productions, performances, reservations and cancellations without ever selling the same seat twice.',
    solution:
      'A role-based React app on Supabase with a live seat map, ticket generation and printing, automated confirmation emails, and a manager dashboard with sales and operations charts.',
    stack: ['React 19', 'Vite', 'Tailwind CSS', 'React Router', 'Supabase (PostgreSQL)', 'Zustand', 'Recharts', 'jsPDF', 'EmailJS'],
    results: [
      'Separate clerk and manager roles with their own workflows',
      'Real-time seat map that blocks double booking',
      'PDF and print-ready tickets, plus email confirmations',
    ],
    caseStudy: {
      challenge:
        'Will-call operations involve several clerks reserving seats at the same time. The system has to keep the seat map consistent, cover the full lifecycle from reservation to cancellation, and give managers reporting on top.',
      process:
        'Built with React 19, Vite and Tailwind CSS, with React Router for navigation and Zustand for state. Supabase provides authentication, authorisation and the PostgreSQL database. Tickets are generated as PDFs with jsPDF and html2canvas and can be printed directly; EmailJS sends confirmation emails. The manager dashboard uses Recharts for sales and operations analytics.',
      outcome:
        'A deployed system with demo clerk and manager accounts, covering patrons, productions, performances, seat reservations, cancellations and reports in one interface.',
    },
  },
  {
    slug: 'omnitools',
    title: 'OmniTools',
    summary:
      'An all-in-one utilities web app — unit converter, QR studio, scientific calculator, timer, text tools and device-sensor tools — that works fully offline.',
    tags: ['Web app', 'Offline-first', 'Vanilla JS'],
    thumbnail: '/projects/omnitools-1.jpg',
    gallery: ['/projects/omnitools-1.jpg', '/projects/omnitools-2.jpg', '/projects/omnitools-3.jpg'],
    hue: 180,
    liveUrl: 'https://calculator-menelik.vercel.app',
    repoUrl: 'https://github.com/Menelik288/tools-app',
    problem:
      'Everyday tools — converters, calculators, QR codes, timers — are scattered across separate apps and sites, many of which need a connection or send data elsewhere.',
    solution:
      'One fast, responsive web app that runs every tool on the device, with a glass-style interface, GSAP-driven motion and sound feedback, and no external runtime dependencies.',
    stack: ['JavaScript', 'HTML5', 'CSS3', 'GSAP', 'Web APIs (sensors, audio, camera)'],
    results: [
      'Ten tools in a single app, including compass, bubble level and speed test',
      '100% on-device processing; works offline',
      'Responsive from phone to desktop',
    ],
    caseStudy: {
      challenge:
        'Combine calculation, conversion, text analysis, QR and hardware-sensor tools into one app that stays quick, works without a network and keeps user data on the device.',
      process:
        'Written in plain JavaScript, HTML and CSS rather than a framework, with libraries bundled locally so nothing is fetched at runtime. The unit converter covers six domains with high-precision bidirectional conversion; the QR studio both generates and scans codes; sensor tools use the device compass, accelerometer and flashlight where available. GSAP powers the interface motion.',
      outcome:
        'A deployed utility app that brings ten tools together and keeps working offline.',
    },
  },
  {
    slug: 'process-synchronization-simulator',
    title: 'Process Synchronization Simulator',
    summary:
      'An interactive visual simulator for operating-system synchronisation: Dijkstra’s binary semaphore and Peterson’s algorithm.',
    tags: ['Education', 'Operating systems', 'React'],
    thumbnail: '/projects/sync-1.jpg',
    gallery: ['/projects/sync-1.jpg', '/projects/sync-2.jpg', '/projects/sync-3.jpg'],
    hue: 215,
    liveUrl: 'https://synchronization-six.vercel.app',
    repoUrl: 'https://github.com/Menelik288/Semaphores-and-Peterson-s-Algorithm',
    problem:
      'Race conditions, critical sections and blocking are hard to picture from static text and pseudocode alone.',
    solution:
      'A step-by-step simulator that shows process states, shared memory, the waiting queue and the matching line of pseudocode as each algorithm runs.',
    stack: ['React 19', 'Vite', 'JavaScript', 'Web Audio API'],
    results: [
      'Simulates wait/signal semaphore operations and Peterson’s flag and turn variables',
      'One-click simultaneous-entry test to show mutual exclusion holding',
      'Auto-play at 0.5× to 4× speed, an event log, and a presentation mode for lectures',
    ],
    caseStudy: {
      challenge:
        'Make two fundamental solutions to the critical-section problem tangible for students and teachers, including what happens when two processes arrive at exactly the same moment.',
      process:
        'Built in React 19 with Vite. The semaphore simulator models atomic wait and signal operations and a live waiting queue; the Peterson simulator shows the flag array and turn variable as they change. A pseudocode tracer highlights the active line for either process, an audit log records every state change, and the Web Audio API adds optional sound cues.',
      outcome:
        'A live teaching tool that runs in the browser, with a high-contrast presentation mode for classroom projectors.',
    },
  },
  {
    slug: 'parkaddis',
    placeholder: true,
    title: 'ParkAddis',
    summary: 'A parking app with a companion manager app, built with React Native and Expo.',
    tags: ['Mobile', 'React Native', 'TypeScript'],
    thumbnail: null,
    gallery: [],
    hue: 145,
    liveUrl: null,
    repoUrl: 'https://github.com/Menelik288/Parkaddis-mobile',
    problem: 'PLACEHOLDER — the repositories have no description yet. What problem does ParkAddis solve, and for whom?',
    solution: 'PLACEHOLDER — what do the driver app and the manager app each do?',
    stack: ['React Native', 'Expo', 'TypeScript', 'NativeWind'],
    results: ['PLACEHOLDER — status, users or outcomes'],
    caseStudy: {
      challenge: 'PLACEHOLDER — context and goals of ParkAddis.',
      process: 'PLACEHOLDER — how you built it.',
      outcome: 'PLACEHOLDER — where it stands today.',
    },
  },
]

/** Entries still marked `placeholder` are only shown in development. */
export const projects = allProjects.filter((p) => import.meta.env.DEV || !p.placeholder)

const allExperience: { period: string; role: string; org: string; text: string; placeholder?: boolean }[] = [
  {
    period: 'Now',
    role: 'Brooke Ethiopia — management system & website',
    org: 'International NGO · in development',
    text: 'Building a management platform and public website: role-based access, management dashboards, data management and administrative workflows. React, Next.js, Node.js, Express, TypeScript, PostgreSQL and Supabase.',
  },
  {
    period: 'Now',
    role: 'HKC ERP System',
    org: 'Enterprise resource planning platform · in development',
    text: 'Building an ERP that centralises inventory and warehouse management, employee and HR management, reporting dashboards, and business workflows. React, Node.js, Express, TypeScript, PostgreSQL, JWT and Supabase.',
  },
  {
    placeholder: true,
    period: 'PLACEHOLDER dates',
    role: 'Software Engineering student',
    org: 'PLACEHOLDER — university name',
    text: 'PLACEHOLDER — year of study, focus areas or notable coursework.',
  },
]

export const experience = allExperience.filter((e) => import.meta.env.DEV || !e.placeholder)

export const techStack = [
  { group: 'Languages', items: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'SQL', 'Unix / Shell'] },
  { group: 'Front end', items: ['React', 'Next.js', 'React Native', 'Expo', 'Tailwind CSS', 'Vite', 'React Router', 'React Query', 'HTML5', 'CSS3 / Sass'] },
  { group: 'Back end', items: ['Node.js', 'Express.js', '.NET', 'REST APIs', 'JWT authentication', 'Authorization & roles'] },
  { group: 'Databases', items: ['PostgreSQL', 'MongoDB', 'MySQL', 'Supabase', 'Relational database design'] },
  { group: 'Tools & platforms', items: ['Git', 'GitHub', 'Linux', 'Bash', 'Vercel', 'VS Code', 'Figma'] },
]

/** Empty = the testimonials section is hidden. Add real quotes only. */
export const testimonials: { quote: string; name: string; role: string; company: string; logo: string | null; placeholder?: boolean }[] = []
