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
import asilAuto1 from "@/assets/screenshots/asil-auto-parts_1.webp";
import asilAuto2 from "@/assets/screenshots/asil-auto-parts_2.webp";
import asilAuto3 from "@/assets/screenshots/asil-auto-parts_3.webp";
import glamoria1 from "@/assets/screenshots/glamorias-gems_1.webp";
import glamoria2 from "@/assets/screenshots/glamorias-gems_2.webp";
import glamoria3 from "@/assets/screenshots/glamorias-gems_3.webp";
import anarga1 from "@/assets/screenshots/anarga-ayurveda_1.webp";
import anarga2 from "@/assets/screenshots/anarga-ayurveda_2.webp";
import anarga3 from "@/assets/screenshots/anarga-ayurveda_3.webp";
import charithra1 from "@/assets/screenshots/charithra-weddings_1.webp";
import charithra2 from "@/assets/screenshots/charithra-weddings_2.webp";
import charithra3 from "@/assets/screenshots/charithra-weddings_3.webp";
import goSafe1 from "@/assets/screenshots/go-safe-home-drivers_1.webp";
import goSafe2 from "@/assets/screenshots/go-safe-home-drivers_2.webp";
import goSafe3 from "@/assets/screenshots/go-safe-home-drivers_3.webp";
import lankaNiki1 from "@/assets/screenshots/lanka-niki-tours_1.webp";
import lankaNiki2 from "@/assets/screenshots/lanka-niki-tours_2.webp";
import lankaNiki3 from "@/assets/screenshots/lanka-niki-tours_3.webp";
import nutCorner1 from "@/assets/screenshots/premium-nut-corner_1.webp";
import nutCorner2 from "@/assets/screenshots/premium-nut-corner_2.webp";
import nutCorner3 from "@/assets/screenshots/premium-nut-corner_3.webp";
import darshana1 from "@/assets/screenshots/darshana-travels_1.webp";
import darshana2 from "@/assets/screenshots/darshana-travels_2.webp";
import darshana3 from "@/assets/screenshots/darshana-travels_3.webp";
import crosa1 from "@/assets/screenshots/crosa-wellness_1.webp";
import crosa2 from "@/assets/screenshots/crosa-wellness_2.webp";
import crosa3 from "@/assets/screenshots/crosa-wellness_3.webp";
import eminence1 from "@/assets/screenshots/eminence-ceylon-exports_1.webp";
import eminence2 from "@/assets/screenshots/eminence-ceylon-exports_2.webp";
import eminence3 from "@/assets/screenshots/eminence-ceylon-exports_3.webp";
import dsMaths1 from "@/assets/screenshots/dsmaths-kingdom_1.webp";
import dsMaths2 from "@/assets/screenshots/dsmaths-kingdom_2.webp";
import mctronic1 from "@/assets/screenshots/mctronic-service_1.webp";
import mctronic2 from "@/assets/screenshots/mctronic-service_2.webp";
import mctronic3 from "@/assets/screenshots/mctronic-service_3.webp";

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
  hidden?: boolean;
  images?: string[];
}

const ALL_CASE_STUDIES: CaseStudy[] = [
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
    id: "26",
    slug: "asil-auto-parts",
    title: "ASIL Auto Parts Hub",
    tag: "Web",
    tagColor: "orange",
    description: "An online auto parts store in Dubai selling genuine, OEM and aftermarket car parts across the UAE.",
    challenge: "Customers needed a trusted way to find the right part for their vehicle and order without visiting a shop.",
    solution: "We built a bilingual (English/Arabic) storefront with a year/make/model part finder, OEM and genuine part catalog, WhatsApp fitment checks by VIN or part photo, and clear delivery and returns policies.",
    results: "A live store serving UAE customers with simple, confident ordering.",
    metric: "UAE-Wide",
    metricLabel: "Next-Day Delivery",
    metric2: "15-Day",
    metric2Label: "Return Window",
    metric3: "WhatsApp",
    metric3Label: "Fitment Support",
    techStack: ["React", "Tailwind CSS", "E-commerce", "WhatsApp"],
    gradient: "from-orange-900 to-red-950",
    featured: false,
    liveUrl: "https://www.asilautoparts.ae/",
    images: [asilAuto1, asilAuto2, asilAuto3]
  },
  {
    id: "27",
    slug: "glamorias-gems",
    title: "Glamoria's Gems",
    tag: "Web",
    tagColor: "amber",
    description: "A luxury jewellery website for a fine jewellery house with boutiques in Sri Lanka and Dubai.",
    challenge: "A high-end jeweller needed an online presence that matched the quality of its handcrafted pieces.",
    solution: "We designed an elegant storefront with high jewellery and category browsing, curated looks, LKR/AED/EUR regional pricing, a client-care flow, and trust signals like ethically sourced diamonds and a lifetime warranty.",
    results: "A live, premium storefront that reflects the brand across both markets.",
    metric: "2",
    metricLabel: "Boutiques (LK & UAE)",
    metric2: "Lifetime",
    metric2Label: "Warranty & Aftercare",
    metric3: "Live",
    metric3Label: "In Production",
    techStack: ["React", "Tailwind CSS", "E-commerce"],
    gradient: "from-amber-900 to-yellow-950",
    featured: false,
    liveUrl: "https://glamoriasgems.com/",
    images: [glamoria1, glamoria2, glamoria3]
  },
  {
    id: "28",
    slug: "anarga-ayurveda",
    title: "Anarga: Ayurvedic Sanctuary",
    tag: "Web",
    tagColor: "emerald",
    description: "A calm, brand-led website for Anarga, a ladies-only Ayurvedic massage sanctuary in Normandale, Lower Hutt, New Zealand.",
    challenge: "The sanctuary needed a website that conveyed tranquility and authenticity from the first scroll.",
    solution: "We built a serene, immersive site with a forest-backed hero, ritual-led storytelling, a massage menu, and ambient calm audio, all aimed at making women feel at ease before they arrive.",
    results: "A live site giving Anarga a credible digital presence.",
    metric: "Live",
    metricLabel: "In Production",
    metric2: "100%",
    metric2Label: "Responsive",
    metric3: "Fast",
    metric3Label: "Load Performance",
    techStack: ["React", "Tailwind CSS", "SEO"],
    gradient: "from-emerald-900 to-green-950",
    featured: false,
    liveUrl: "https://anarga.co.nz",
    images: [anarga1, anarga2, anarga3]
  },
  {
    id: "31",
    slug: "eminence-ceylon-exports",
    title: "Eminence Ceylon Exports",
    tag: "Web",
    tagColor: "teal",
    description: "A B2B export website for a Sri Lankan Ceylon cinnamon exporter supplying international markets.",
    challenge: "The exporter needed to present grades, packaging and quality credentials clearly to overseas buyers and capture quotation requests.",
    solution: "We built a product-led site covering C5, C4 and H grade quills, cut sticks, packaging options, key export markets (USA, Europe, Middle East), quality standards (SLS 81 / ISO 6539) and a quotation request form.",
    results: "A live B2B site supporting international buyer enquiries.",
    metric: "C5 / C4",
    metricLabel: "Export Grades",
    metric2: "SLS 81",
    metric2Label: "Quality Standard",
    metric3: "Global",
    metric3Label: "Export Markets",
    techStack: ["React", "Tailwind CSS", "SEO"],
    gradient: "from-teal-900 to-green-950",
    featured: false,
    liveUrl: "https://eminenceceylonexports.com/",
    images: [eminence1, eminence2, eminence3]
  },
  {
    id: "32",
    slug: "crosa-wellness",
    title: "CROSA: Pain Management & Wellness Clinic",
    tag: "Web",
    tagColor: "blue",
    description: "A modern website for CROSA, a pain management, rehabilitation, fitness and therapeutic massage centre in Colombo.",
    challenge: "The clinic needed a site that felt clinical and trustworthy while making it easy to enquire about specific conditions and treatments.",
    solution: "We built a cinematic, calm site with condition-by-condition pages (back, neck, shoulder, knee pain, sports injuries, post-injury rehab), a diabetes and cholesterol management package, reviews, FAQ and one-tap WhatsApp consultation.",
    results: "A live site that turns visitors into consultation enquiries.",
    metric: "Open 24/7",
    metricLabel: "Consultations",
    metric2: "6+",
    metric2Label: "Conditions Treated",
    metric3: "WhatsApp",
    metric3Label: "Booking",
    techStack: ["React", "Tailwind CSS", "SEO", "WhatsApp"],
    gradient: "from-blue-900 to-slate-950",
    featured: false,
    liveUrl: "https://crosaclinic.com/",
    images: [crosa1, crosa2, crosa3]
  },
  {
    id: "33",
    slug: "charithra-weddings",
    title: "Charithra: Wedding Coordination",
    tag: "Web",
    tagColor: "rose",
    description: "A website for Charithra, the wedding day coordination arm of CCCEvents in Sri Lanka.",
    challenge: "Couples needed to understand quickly how day-of coordination works and trust the team behind it.",
    solution: "We built a regal, story-led site with packages, gallery, reviews and FAQ, presenting the on-site team, vendor sync, minute-by-minute run sheets and Poruwa ritual management, with WhatsApp booking.",
    results: "A live site that explains the offering and drives enquiries.",
    metric: "500+",
    metricLabel: "Celebrations Coordinated",
    metric2: "10+ Yrs",
    metric2Label: "Experience",
    metric3: "WhatsApp",
    metric3Label: "Booking",
    techStack: ["React", "Tailwind CSS", "SEO"],
    gradient: "from-rose-900 to-pink-950",
    featured: false,
    liveUrl: "https://charithra.lk/",
    images: [charithra1, charithra2, charithra3]
  },
  {
    id: "34",
    slug: "go-safe-home-drivers",
    title: "Go Safe Home Drivers",
    tag: "Web",
    tagColor: "indigo",
    description: "A booking-focused site for a designated driver service that takes customers home safely in their own vehicle.",
    challenge: "The service needed a fast way for customers to trust and book at any hour.",
    solution: "We built a mobile-first site with 24/7 phone and WhatsApp booking and clear pages for night, VIP and corporate driving.",
    results: "A live site making booking one tap away.",
    metric: "24/7",
    metricLabel: "Booking",
    metric2: "Islandwide",
    metric2Label: "Coverage",
    metric3: "Live",
    metric3Label: "In Production",
    techStack: ["React", "Tailwind CSS", "WhatsApp", "Vercel"],
    gradient: "from-indigo-900 to-slate-950",
    featured: false,
    liveUrl: "https://drink-drive-taxi.vercel.app/",
    images: [goSafe1, goSafe2, goSafe3]
  },
  {
    id: "35",
    slug: "lanka-niki-tours",
    title: "Lanka Niki Tours",
    tag: "Web",
    tagColor: "green",
    description: "A travel website for private custom tours and wildlife safaris across Sri Lanka.",
    challenge: "The tour company needed to showcase itineraries and make enquiring effortless.",
    solution: "We built an immersive site with destination guides (Yala, Sigiriya, Ella, Galle, Mirissa), multi-day tours like the 8-day Wild Sri Lanka Safari, a TripAdvisor presence, and direct WhatsApp planning.",
    results: "A live site presenting tours and capturing enquiries.",
    metric: "Private",
    metricLabel: "Tours",
    metric2: "24/7",
    metric2Label: "WhatsApp Contact",
    metric3: "Live",
    metric3Label: "In Production",
    techStack: ["React", "Tailwind CSS", "Framer Motion", "Vercel"],
    gradient: "from-green-900 to-emerald-950",
    featured: false,
    hidden: true,
    liveUrl: "https://lanka-niki-tour.vercel.app/",
    images: [lankaNiki1, lankaNiki2, lankaNiki3]
  },
  {
    id: "36",
    slug: "premium-nut-corner",
    title: "Premium Nut Corner",
    tag: "Web",
    tagColor: "yellow",
    description: "An online storefront for premium nut, seed and dried-fruit mixes with WhatsApp ordering.",
    challenge: "A food brand needed a simple way to present its mixes and take orders without a heavy checkout.",
    solution: "We built a clean product site with Classic, Premium and Signature mixes in multiple sizes and WhatsApp ordering.",
    results: "A live store with frictionless ordering.",
    metric: "3",
    metricLabel: "Signature Mixes",
    metric2: "3 Sizes",
    metric2Label: "200g / 500g / 1kg",
    metric3: "WhatsApp",
    metric3Label: "Ordering",
    techStack: ["React", "Tailwind CSS", "WhatsApp", "Vercel"],
    gradient: "from-yellow-900 to-amber-950",
    featured: false,
    hidden: true,
    liveUrl: "https://premium-nut-corner.vercel.app/",
    images: [nutCorner1, nutCorner2, nutCorner3]
  },
  {
    id: "37",
    slug: "darshana-travels",
    title: "Darshana Travels: Bus Booking",
    tag: "Web",
    tagColor: "sky",
    description: "An online intercity bus ticket booking site for Sri Lanka, running on the SalonFlow cloud platform.",
    challenge: "Passengers needed to book bus seats online without creating accounts or calling counters.",
    solution: "We delivered route and date search, a live seat map, guest card checkout with no account needed, and instant SMS e-tickets, backed by FAQs and support details.",
    results: "A live booking experience for passengers.",
    metric: "Live",
    metricLabel: "Seat Map",
    metric2: "SMS",
    metric2Label: "Instant E-Tickets",
    metric3: "No Signup",
    metric3Label: "Checkout",
    techStack: ["React", "Node.js", "Payments", "SMS"],
    gradient: "from-sky-900 to-blue-950",
    featured: false,
    liveUrl: "https://darshana-travels.salonflow.cloud/",
    images: [darshana1, darshana2, darshana3]
  },
  {
    id: "38",
    slug: "dsmaths-kingdom",
    title: "DS Maths Kingdom: Student Portal",
    tag: "Admin",
    tagColor: "violet",
    description: "A student portal for DS Maths Kingdom, a mathematics tuition institute, with registration, login, announcements and class schedules.",
    challenge: "The institute needed one place for students to register, log in, follow announcements and check class schedules.",
    solution: "We built a mobile-friendly portal with a photo-led landing, student registration and login, class announcements (including Sinhala content) and live class schedules.",
    results: "A live portal students use to stay connected with their classes.",
    metric: "Portal",
    metricLabel: "Student Access",
    metric2: "Live",
    metric2Label: "Announcements",
    metric3: "Schedules",
    metric3Label: "Class Timetables",
    techStack: ["React", "Node.js", "PostgreSQL"],
    gradient: "from-violet-900 to-indigo-950",
    featured: false,
    liveUrl: "http://dsmathskingdom.lk/",
    images: [dsMaths1, dsMaths2]
  },
  {
    id: "39",
    slug: "mctronic-service",
    title: "mctronic: Electronic & Appliance Repair",
    tag: "Web",
    tagColor: "red",
    description: "A website for mctronic, a repair workshop for electronic and household appliances, with repair status checking and easy enquiries.",
    challenge: "The workshop needed a trustworthy web presence that makes booking a repair and following its progress simple.",
    solution: "We built a clear service site covering TV and display, JBL and party box, sound system and other repairs, a four-step repair process, repair status checking and call or WhatsApp booking.",
    results: "A live site that turns visitors into repair bookings.",
    metric: "4-Step",
    metricLabel: "Repair Process",
    metric2: "Status",
    metric2Label: "Online Repair Check",
    metric3: "WhatsApp",
    metric3Label: "Booking",
    techStack: ["React", "Tailwind CSS", "WhatsApp"],
    gradient: "from-red-900 to-rose-950",
    featured: false,
    liveUrl: "https://mctronicservice.com/",
    images: [mctronic1, mctronic2, mctronic3]
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

// Entries with `hidden: true` are kept here but not shown on the site.
export const CASE_STUDIES: CaseStudy[] = ALL_CASE_STUDIES.filter((c) => !c.hidden);
