import serviceCenter1 from "@/assets/screenshots/service-center_1.webp";
import zemila1 from "@/assets/screenshots/zemila_1.webp";
import zemila2 from "@/assets/screenshots/zemila_2.webp";
import zemila3 from "@/assets/screenshots/zemila_3.webp";
import cradleCoastPhysio1 from "@/assets/screenshots/cradle-coast-physio_1.webp";
import cradleCoastPhysio2 from "@/assets/screenshots/cradle-coast-physio_2.webp";
import cradleCoastPhysio3 from "@/assets/screenshots/cradle-coast-physio_3.webp";
import spaceDriftVr1 from "@/assets/screenshots/space-drift-vr_1.webp";
import spaceDriftVr2 from "@/assets/screenshots/space-drift-vr_2.webp";
import calvoro1 from "@/assets/screenshots/calvoro_1.webp";
import calvoro2 from "@/assets/screenshots/calvoro_2.webp";
import calvoro3 from "@/assets/screenshots/calvoro_3.webp";
import salonflow1 from "@/assets/screenshots/salonflow_1.webp";
import salonflow2 from "@/assets/screenshots/salonflow_2.webp";
import salonflow3 from "@/assets/screenshots/salonflow_3.webp";
import codeplayStudiosImg from "@/assets/screenshots/codeplay-studios.webp";
import venturelinkImg from "@/assets/screenshots/venturelink.webp";
import venturelinkImg2 from "@/assets/screenshots/venturelink_2.webp";
import xcelerusImg from "@/assets/screenshots/xcelerus.webp";
import calveraImg from "@/assets/screenshots/calvera.webp";
import calveraImg2 from "@/assets/screenshots/calvera_2.webp";
import sahanaImg from "@/assets/screenshots/sahana-investment.webp";
import anuraTailorImg from "@/assets/screenshots/anura-tailor.webp";
import swarnaImg from "@/assets/screenshots/swarna-communication.webp";
import hewundeImg from "@/assets/screenshots/hewunde-catering.webp";
import ryeTeaFactory1 from "@/assets/screenshots/rye-tea-factory_1.webp";
import ryeTeaFactory2 from "@/assets/screenshots/rye-tea-factory_2.webp";

export interface CaseStudy {
  id: string;
  slug: string;
  title: string;
  tag: "AI" | "Web" | "Mobile" | "Unity" | "MVP" | "Admin";
  tagColor: string;
  description: string;
  challenge: string;
  solution: string;
  results: string;
  metric: string;
  metricLabel: string;
  metric2: string;
  metric2Label: string;
  metric3: string;
  metric3Label: string;
  techStack: string[];
  gradient: string;
  featured: boolean;
  liveUrl?: string;
  images?: string[];
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    id: "12",
    slug: "zemilam-holdings",
    title: "Zemilam Holdings: Tools & Safety Gear",
    tag: "Web",
    tagColor: "red",
    description: "An e-commerce platform for Zemilam Holdings, an authorized distributor of WORKPRO® tools and Safegear safety equipment across Sri Lanka.",
    challenge: "The client needed a professional storefront that established credibility as an authorized partner for global tool and safety-equipment brands.",
    solution: "We built a clean, product-focused storefront highlighting brand partnerships, product categories, and a streamlined quote-request flow.",
    results: "A live platform giving Zemilam Holdings a credible digital presence to support nationwide distribution and B2B inquiries.",
    metric: "10,000+",
    metricLabel: "Product SKUs",
    metric2: "Live",
    metric2Label: "In Production",
    metric3: "100%",
    metric3Label: "Mobile Optimized",
    techStack: ["React", "Tailwind CSS", "Node.js", "E-commerce"],
    gradient: "from-red-900 to-rose-950",
    featured: true,
    liveUrl: "https://zemilam.lk/",
    images: [zemila1, zemila2, zemila3]
  },
  {
    id: "13",
    slug: "cradle-coast-physio",
    title: "Cradle Coast Physio",
    tag: "Web",
    tagColor: "emerald",
    description: "A clean, trust-building website for a physiotherapy clinic in Tasmania, built to make finding services and booking simple.",
    challenge: "A local physiotherapy practice needed a professional web presence that clearly communicated their services and made it easy for patients to get in touch.",
    solution: "We designed a clean, accessible site structured around services, credibility, and easy contact — built to load fast and read well on any device.",
    results: "A live, production website that gives the clinic a credible digital front door for prospective patients.",
    metric: "750+",
    metricLabel: "Patients Helped",
    metric2: "18+",
    metric2Label: "Years Experience",
    metric3: "98%",
    metric3Label: "Satisfaction Rate",
    techStack: ["React", "Tailwind CSS", "SEO"],
    gradient: "from-emerald-900 to-teal-950",
    featured: true,
    liveUrl: "https://cradlecoastphysio.com/",
    images: [cradleCoastPhysio1, cradleCoastPhysio2, cradleCoastPhysio3]
  },
  {
    id: "14",
    slug: "space-drift-vr",
    title: "Space Drift VR",
    tag: "Web",
    tagColor: "indigo",
    description: "A cinematic marketing site for Space Drift, a next-generation VR space-exploration game, built to convert visitors into players.",
    challenge: "The client needed a web presence as immersive and futuristic as the game itself, to drive downloads and plays.",
    solution: "We crafted a bold, cinematic site with sci-fi visual language and smooth motion to capture the feeling of the game online.",
    results: "A live site that sets the tone for the brand and drives visitors toward playing the game.",
    metric: "Live",
    metricLabel: "In Production",
    metric2: "Cinematic",
    metric2Label: "Visual Design",
    metric3: "Fast",
    metric3Label: "Load Performance",
    techStack: ["React", "Framer Motion", "Tailwind CSS"],
    gradient: "from-indigo-900 to-purple-950",
    featured: false,
    liveUrl: "https://spacedriftvr.com/",
    images: [spaceDriftVr1, spaceDriftVr2]
  },
  {
    id: "15",
    slug: "codeplay-studios",
    title: "CodePlay Studios",
    tag: "Web",
    tagColor: "cyan",
    description: "Our own agency platform — a fast, modern showcase of who we are and the work we ship for clients.",
    challenge: "As an agency, our own site needed to be the sharpest example of our engineering and design capabilities.",
    solution: "We built our marketing platform in-house with the same standards we hold client work to: fast, animated, and easy to evolve.",
    results: "A live, continuously evolving platform that represents the studio's capabilities to every prospective client.",
    metric: "Live",
    metricLabel: "In Production",
    metric2: "In-House",
    metric2Label: "Built & Maintained",
    metric3: "100%",
    metric3Label: "Responsive",
    techStack: ["React", "TypeScript", "Tailwind CSS", "Framer Motion"],
    gradient: "from-cyan-900 to-blue-950",
    featured: true,
    liveUrl: "https://codeplaystudios.com/",
    images: [codeplayStudiosImg]
  },
  {
    id: "16",
    slug: "venturelink",
    title: "VentureLink: Strategic Consulting Platform",
    tag: "MVP",
    tagColor: "violet",
    description: "A strategic consulting and business platform empowering enterprises through talent development and global business connectivity.",
    challenge: "The client needed a polished platform to present strategic consulting services and training programs to enterprise prospects.",
    solution: "We built a data-rich, enterprise-grade platform with a modern dashboard-style presentation of growth metrics and services.",
    results: "A live platform the client uses to engage enterprise prospects and showcase their track record.",
    metric: "2,500+",
    metricLabel: "Professionals Trained",
    metric2: "50+",
    metric2Label: "Corporate Partners",
    metric3: "Live",
    metric3Label: "In Production",
    techStack: ["React", "Node.js", "Tailwind CSS"],
    gradient: "from-violet-900 to-purple-950",
    featured: false,
    liveUrl: "https://venturelink.codeplaystudios.com/",
    images: [venturelinkImg, venturelinkImg2]
  },
  {
    id: "17",
    slug: "xcelerus",
    title: "Xcelerus",
    tag: "MVP",
    tagColor: "amber",
    description: "A business growth platform combining talent solutions with technology, helping enterprises accelerate digital transformation.",
    challenge: "The client wanted a credible, conversion-focused platform to present a talent-and-technology growth offering to enterprise clients.",
    solution: "We built a focused platform communicating the value proposition clearly and driving consultation bookings.",
    results: "A live platform the client uses to engage prospective clients and validate demand.",
    metric: "150+",
    metricLabel: "Enterprise Clients",
    metric2: "4.9/5",
    metric2Label: "Client Rating",
    metric3: "24/7",
    metric3Label: "Expert Support",
    techStack: ["React", "Tailwind CSS", "Node.js"],
    gradient: "from-amber-900 to-orange-950",
    featured: false,
    liveUrl: "https://xcelerus.codeplaystudios.com/",
    images: [xcelerusImg]
  },
  {
    id: "18",
    slug: "calvera-travels",
    title: "Calvera: Sri Lanka Tours & Travel",
    tag: "Web",
    tagColor: "orange",
    description: "A travel platform showcasing curated Sri Lanka tours and custom travel packages for international visitors.",
    challenge: "The client needed a visually rich site that could sell the experience of Sri Lanka, not just list itineraries.",
    solution: "We built an image-forward, story-driven site structured around destinations and custom package inquiries.",
    results: "A live platform helping the client showcase tours and convert visitor interest into booking inquiries.",
    metric: "500+",
    metricLabel: "Happy Travelers",
    metric2: "50+",
    metric2Label: "Tour Packages",
    metric3: "10+",
    metric3Label: "Years Experience",
    techStack: ["React", "Tailwind CSS", "Node.js"],
    gradient: "from-orange-900 to-amber-950",
    featured: false,
    liveUrl: "https://calvera.codeplaystudios.com/",
    images: [calveraImg, calveraImg2]
  },
  {
    id: "19",
    slug: "calvoro-ecommerce",
    title: "Calvoro: Athletic Wear E-Commerce",
    tag: "Web",
    tagColor: "fuchsia",
    description: "A premium athletic wear storefront blending bold typography with a performance-driven shopping experience.",
    challenge: "The client needed a storefront that felt premium and athletic while staying easy to browse across devices.",
    solution: "We built a custom e-commerce experience emphasizing bold visuals, fast product discovery, and a streamlined checkout.",
    results: "A live storefront giving the brand a professional online sales channel.",
    metric: "Live",
    metricLabel: "In Production",
    metric2: "100%",
    metric2Label: "Mobile Optimized",
    metric3: "Custom",
    metric3Label: "Storefront Build",
    techStack: ["React", "Tailwind CSS", "E-commerce"],
    gradient: "from-fuchsia-900 to-pink-950",
    featured: false,
    liveUrl: "https://calvoro.codeplaystudios.com/",
    images: [calvoro1, calvoro2, calvoro3]
  },
  {
    id: "20",
    slug: "salonflow",
    title: "SalonFlow: Salon Management SaaS",
    tag: "Admin",
    tagColor: "blue",
    description: "An all-in-one SaaS workspace for Sri Lankan salon brands, covering scheduling, LankaQR invoicing, POS checkout, and client loyalty.",
    challenge: "Salon owners were juggling separate tools for bookings, billing, and client records, with no local payment-rail support.",
    solution: "We built a unified admin dashboard and client booking portal with native LankaQR invoicing, POS checkout, and real-time appointment tracking.",
    results: "A live SaaS product now running 100+ active salons, with tiered pricing from starter to enterprise plans.",
    metric: "100+",
    metricLabel: "Active Salons",
    metric2: "LankaQR",
    metric2Label: "Native Payments",
    metric3: "3",
    metric3Label: "Pricing Tiers",
    techStack: ["React", "Node.js", "LankaQR API", "Tailwind CSS"],
    gradient: "from-blue-900 to-indigo-950",
    featured: true,
    liveUrl: "https://salonflow.cloud/",
    images: [salonflow1, salonflow2, salonflow3]
  },
  {
    id: "21",
    slug: "sahana-investment",
    title: "Sahana Investment: Microfinance Management System",
    tag: "Admin",
    tagColor: "blue",
    description: "A daily-collection and loan management system for a microfinance lender, tracking active loans, overdue accounts, and grower loans in real time.",
    challenge: "The lender was tracking loan collections and overdue accounts manually, making it hard to spot risk and hit daily collection targets.",
    solution: "We built a dashboard-driven system with real-time collection tracking, loan status breakdowns, and 7-day trend reporting.",
    results: "The team now tracks 100+ active loans and daily collection targets from a single live dashboard.",
    metric: "101",
    metricLabel: "Active Loans",
    metric2: "90",
    metric2Label: "Overdue Tracked",
    metric3: "361%",
    metric3Label: "Target Achievement",
    techStack: ["React", "Node.js", "Chart.js", "PostgreSQL"],
    gradient: "from-blue-800 to-indigo-900",
    featured: false,
    images: [sahanaImg]
  },
  {
    id: "22",
    slug: "anura-boss-tailor",
    title: "Anura Boss Tailor: Rental Management System",
    tag: "Admin",
    tagColor: "violet",
    description: "An outfit rental management system for a tailoring business, handling bookings, inventory, and order creation with keyboard-driven speed.",
    challenge: "The tailor shop needed a faster way to create rental orders and track outfit inventory without manual paperwork or double-bookings.",
    solution: "We built a rental order workflow with fast customer and item search, a live order summary, and full keyboard-shortcut support for high-speed counter use.",
    results: "Staff can now build a complete rental order — customer, items, payment — in seconds instead of minutes.",
    metric: "F-Key",
    metricLabel: "Keyboard-Driven Workflow",
    metric2: "Live",
    metric2Label: "In Production",
    metric3: "Real-time",
    metric3Label: "Inventory Sync",
    techStack: ["React", "Node.js", "PostgreSQL"],
    gradient: "from-violet-800 to-purple-900",
    featured: false,
    images: [anuraTailorImg]
  },
  {
    id: "23",
    slug: "swarna-communication",
    title: "Swarna Communication: Retail POS System",
    tag: "Admin",
    tagColor: "indigo",
    description: "A point-of-sale system for a mobile reload, printing, and communication shop, unifying reloads, print jobs, and expense tracking.",
    challenge: "The shop needed one system to handle mobile reloads, printing jobs, and daily expenses instead of juggling separate registers.",
    solution: "We built a unified POS covering reload transactions across all major providers, print-job billing, and expense tracking in one dashboard.",
    results: "The owner now tracks daily revenue, reloads, and printouts from a single live dashboard.",
    metric: "Multi-Service",
    metricLabel: "Reload + Print + Repair",
    metric2: "Live",
    metric2Label: "In Production",
    metric3: "Unified",
    metric3Label: "POS Billing",
    techStack: ["React", "Node.js", "PostgreSQL"],
    gradient: "from-indigo-900 to-blue-950",
    featured: false,
    images: [swarnaImg]
  },
  {
    id: "24",
    slug: "rye-tea-factory",
    title: "Rye Tea Factory: Tea Collection Management",
    tag: "Admin",
    tagColor: "emerald",
    description: "A tea-leaf collection and grower management system tracking daily intake, grower earnings, and leaf-grade pricing.",
    challenge: "The factory needed to track daily leaf collection, grower payouts, and route-based pricing without manual ledgers.",
    solution: "We built a collection-intake system with per-grade pricing, automated earnings calculation, and grower payout tracking.",
    results: "The factory now tracks over 8,500kg of tea collected and Rs. 1.98M in grower earnings through one live system.",
    metric: "8,530kg",
    metricLabel: "Tea Collected",
    metric2: "Rs. 1.98M",
    metric2Label: "Grower Earnings Tracked",
    metric3: "Live",
    metric3Label: "In Production",
    techStack: ["React", "Node.js", "PostgreSQL"],
    gradient: "from-slate-900 to-emerald-950",
    featured: false,
    images: [ryeTeaFactory1, ryeTeaFactory2]
  },
  {
    id: "25",
    slug: "hewunde-caterers",
    title: "Hewunde Caterers: Catering & Event Rental System",
    tag: "Admin",
    tagColor: "fuchsia",
    description: "A booking and rental management system for a catering and cake/event supplies business, tracking reservations and equipment holds.",
    challenge: "The business needed to track upcoming rentals, item holds, and bookings without conflicting reservations.",
    solution: "We built a calendar-driven booking system tracking reservations, pending confirmations, and item availability in real time.",
    results: "The team now manages all reservations and rental holds from a single live booking calendar.",
    metric: "Live",
    metricLabel: "In Production",
    metric2: "Calendar",
    metric2Label: "Booking Management",
    metric3: "Real-time",
    metric3Label: "Reservation Tracking",
    techStack: ["React", "Node.js", "PostgreSQL"],
    gradient: "from-fuchsia-900 to-purple-950",
    featured: false,
    images: [hewundeImg]
  },
  {
    id: "6",
    slug: "service-center-system",
    title: "Vehicle Service Center System",
    tag: "Admin",
    tagColor: "blue",
    description: "A vehicle service center management system covering service jobs, QR-based bookings, inventory, and billing.",
    challenge: "The service center needed to replace manual tracking of vehicle jobs, invoices, and inventory with a single connected system.",
    solution: "We built a centralized dashboard covering service jobs, QR-code appointment booking, inventory, invoicing, and sales analytics.",
    results: "The center now runs service tracking, billing, and appointment booking from one live system.",
    metric: "QR-Based",
    metricLabel: "Appointment Booking",
    metric2: "Live",
    metric2Label: "In Production",
    metric3: "Unified",
    metric3Label: "Service & Billing",
    techStack: ["React", "Node.js", "PostgreSQL"],
    gradient: "from-blue-600 to-indigo-400",
    featured: false,
    images: [serviceCenter1]
  },
  {
    id: "7",
    slug: "fuddy-food-app",
    title: "Fuddy Food Discovery",
    tag: "Mobile",
    tagColor: "orange",
    description: "Mobile platform for restaurant discovery and social reviews.",
    challenge: "Foodies lacked a dedicated platform to discover local spots based on real-time community feedback and distance.",
    solution: "Developed a cross-platform Flutter app with Google Maps integration and a robust social engine for reviews.",
    results: "Achieved 10k downloads in the first month with high user engagement on social feeds.",
    metric: "10K",
    metricLabel: "Initial Downloads",
    metric2: "4.5",
    metric2Label: "Avg Rating",
    metric3: "Real-time",
    metric3Label: "Distance Tracking",
    techStack: ["Flutter", "Firebase", "Google Maps API"],
    gradient: "from-orange-500 to-red-400",
    featured: false
  },
  {
    id: "11",
    slug: "mini-crik-game",
    title: "Mini Crik Game",
    tag: "Unity",
    tagColor: "amber",
    description: "Casual 2D cricket game with vibrant graphics and global leaderboards.",
    challenge: "The goal was to create a hyper-addictive mobile game that remains lightweight but offers deep global competition.",
    solution: "Localized mobile-first physics in Unity with a back-end leaderboard system for competitive play.",
    results: "Reached Top 10 trending in casual sports games during the first week of launch.",
    metric: "Top 10",
    metricLabel: "Trending Status",
    metric2: "500k+",
    metric2Label: "Matches Played",
    metric3: "2D",
    metric3Label: "Optimized Graphics",
    techStack: ["Unity", "C#", "Firebase"],
    gradient: "from-amber-400 to-orange-500",
    featured: false
  }
];
