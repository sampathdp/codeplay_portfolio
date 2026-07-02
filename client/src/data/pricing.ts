import { 
  Globe, 
  Smartphone, 
  Brain, 
  Rocket, 
  Gamepad2, 
  LayoutDashboard 
} from "lucide-react";

export interface PricingTier {
  service: string;
  iconName: "Globe" | "Smartphone" | "Brain" | "Rocket" | "Gamepad2" | "LayoutDashboard" | string;
  startingFrom: number; // base USD price for generic display
  startingFromLKR?: number; // nice rounded LKR price for local display
  currency: string;
  timeline: string;
  includes: string[];
  accentColor: string;
  href: string;
  featured: boolean;
  description?: string;
}

// Current generic tiers for the Home page
export const PRICING_TIERS: PricingTier[] = [
  {
    service: "Web Development",
    iconName: "Globe",
    startingFrom: 100,
    startingFromLKR: 30000,
    currency: "USD",
    timeline: "3–6 weeks",
    includes: ["Custom React/Next.js design", "Responsive & SEO optimized", "CMS & API integration"],
    accentColor: "cyan",
    href: "/web-development",
    featured: false
  },
  {
    service: "Mobile App",
    iconName: "Smartphone",
    startingFrom: 400,
    startingFromLKR: 120000,
    currency: "USD",
    timeline: "6–12 weeks",
    includes: ["iOS & Android (Flutter)", "Custom API backend", "App Store submission assistance"],
    accentColor: "blue",
    href: "/mobile-development",
    featured: true
  },
  {
    service: "AI Integration",
    iconName: "Brain",
    startingFrom: 166,
    startingFromLKR: 50000,
    currency: "USD",
    timeline: "4–8 weeks",
    includes: ["Custom Model Fine-tuning", "Large Language Model API", "Intelligent Automation Agents"],
    accentColor: "purple",
    href: "/ai-development",
    featured: false
  },
  {
    service: "Unity / Game Dev",
    iconName: "Gamepad2",
    startingFrom: 100,
    startingFromLKR: 30000,
    currency: "USD",
    timeline: "8–16 weeks",
    includes: ["2D/3D Scene development", "Custom physics & animations", "Multi-platform export"],
    accentColor: "orange",
    href: "/unity-game-development",
    featured: false
  },
  {
    service: "ERP & Management Systems",
    iconName: "Layers",
    startingFrom: 100,
    startingFromLKR: 30000,
    currency: "USD",
    timeline: "4–8 weeks",
    includes: [
      "Custom ERP & CRM Development",
      "Payroll & HR Management Systems",
      "Inventory & Resource Planning",
      "Financial Reporting Dashboards"
    ],
    accentColor: "amber",
    href: "/erp-systems",
    featured: false
  }
];

// High-detail web tiers matching user's image
export const WEB_DETAILED_TIERS: PricingTier[] = [
  {
    service: "Starter",
    description: "Simplest Package to Get You Started",
    iconName: "Rocket",
    startingFrom: 100,
    startingFromLKR: 30000,
    currency: "Rs.",
    timeline: "1 week",
    accentColor: "green",
    href: "/#contact",
    featured: false,
    includes: [
      "3–5 Main Pages",
      "1 Proposal",
      "Simple Control Panel to Update the Website",
      "Set Up Hosting and Domain Name",
      "Create Emails",
      "Contact Form + Location Map",
      "Language Translator (Google or Bing)"
    ]
  },
  {
    service: "Business",
    description: "The Most Popular Package We Offer",
    iconName: "Globe",
    startingFrom: 150,
    startingFromLKR: 45000,
    currency: "Rs.",
    timeline: "2 weeks",
    accentColor: "cyan",
    href: "/#contact",
    featured: true,
    includes: [
      "7 Main Web Pages",
      "1 Proposal Design Concept",
      "Mobile Responsive Design",
      "Unique Content Development",
      "Basic Search Engine Optimisation",
      "Simple Control Panel to Update the Website",
      "Unlimited Bandwidth",
      "3 Email Accounts",
      "Contact Form + Location Map",
      "Language Translator (Google or Bing)",
      "Free One Month Maintenance"
    ]
  },
  {
    service: "Medium Company",
    description: "The Most Popular for Medium Companies",
    iconName: "Smartphone",
    startingFrom: 200,
    startingFromLKR: 60000,
    currency: "Rs.",
    timeline: "3 weeks",
    accentColor: "blue",
    href: "/#contact",
    featured: false,
    includes: [
      "10 Main Web Pages",
      "2 Proposal Design Concepts",
      "Mobile Responsive Design",
      "Payment Gateway",
      "Unique Content Development",
      "Advanced Search Engine Optimisation",
      "Advanced Control Panel to Update the Website",
      "Free .com Domain",
      "5 Email Accounts",
      "Contact Form + Location Map",
      "Language Translator (Google, Bing or Manual)"
    ]
  },
  {
    service: "Enterprise",
    description: "The Most Advanced & Complete Package",
    iconName: "LayoutDashboard",
    startingFrom: 250,
    startingFromLKR: 80000,
    currency: "Rs.",
    timeline: "4 weeks",
    accentColor: "purple",
    href: "/#contact",
    featured: false,
    includes: [
      "12–15 Main Web Pages",
      "2 Proposal Design Concepts",
      "Mobile Responsive Design",
      "User and Member Registration",
      "Shopping Cart & Payment Gateway",
      "Unique Content Development",
      "Advanced Search Engine Optimisation",
      "Advanced Control Panel to Update the Website",
      "Free .com Domain",
      "Free Unlimited Hosting Space",
      "Unlimited Bandwidth",
      "10 Email Accounts",
      "Contact Form + Location Map",
      "Language Translator (Google, Bing or Manual)"
    ]
  }
];
