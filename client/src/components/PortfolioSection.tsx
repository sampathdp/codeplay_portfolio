import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowUpRight,
  Github,
  ExternalLink,
  X,
  CheckCircle2,
  Server,
  Database,
  Smartphone,
} from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";

interface Project {
  title: string;
  subtitle: string;
  description: string;
  longDescription?: string;
  features?: string[];
  techStack?: string[];
  gradient: string;
  tags: string[];
  category: string;
  image?: string;
}

interface ProjectCardProps {
  project: Project;
  index: number;
  onClick: (project: Project) => void;
}

const ProjectCard = ({ project, index, onClick }: ProjectCardProps) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    onClick={() => onClick(project)}
    className="group relative rounded-3xl overflow-hidden bg-background border border-border/50 hover:border-primary/50 transition-colors duration-500 cursor-pointer"
  >
    {/* Image Placeholder with Gradient */}
    <div
      className={`h-64 w-full bg-gradient-to-br ${project.gradient} relative overflow-hidden group-hover:scale-105 transition-transform duration-700`}
    >
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

      {/* Optional: Actual Project Image Overlay */}
      {project.image && (
        <img
          src={project.image}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay group-hover:opacity-70 transition-opacity"
        />
      )}

      {/* Overlay Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg h-10 w-10"
          onClick={(e) => {
            e.stopPropagation();
          }} // Prevent card click
        >
          <Github className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          className="rounded-full shadow-lg h-10 w-10"
          onClick={(e) => {
            e.stopPropagation();
          }}
        >
          <ExternalLink className="w-5 h-5" />
        </Button>
      </div>
    </div>

    <div className="p-8">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs font-bold text-primary tracking-wider uppercase mb-2 block">
            {project.subtitle}
          </span>
          <h3 className="text-2xl font-bold group-hover:text-primary transition-colors">
            {project.title}
          </h3>
        </div>
        <ArrowUpRight className="w-6 h-6 text-muted-foreground group-hover:text-primary group-hover:rotate-45 transition-all" />
      </div>

      <p className="text-muted-foreground mb-6 line-clamp-2">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-2">
        {project.tags.map((tag, i) => (
          <span
            key={i}
            className="px-3 py-1 rounded-full bg-secondary/50 text-xs font-medium text-secondary-foreground border border-transparent group-hover:border-primary/20 transition-colors"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  </motion.div>
);

export default function PortfolioSection() {
  const [activeTab, setActiveTab] = useState("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const categories = ["All", "Web App", "Mobile", "Enterprise"];

  const projects: Project[] = [
    {
      title: "Service Center System",
      subtitle: "Management Solution",
      description:
        "Complete automotive service center management with QR tracking, service reporting, sales, and customer relationship management.",
      longDescription:
        "A cutting-edge, enterprise-grade solution designed to revolutionize automotive service center operations. This system integrates every aspect of the service lifecycle, from initial appointment scheduling to final vehicle delivery, powered by QR code technology for instant vehicle identification and tracking.",
      features: [
        "QR Code Vehicle Tracking: Instant access to service history scanning a QR code.",
        "Comprehensive Service Reports: Detailed digital reports with images and diagnostics.",
        "Integrated CRM: Customer profiles, communication logs, and loyalty management.",
        "Inventory & Sales Management: Real-time parts tracking and billing integration.",
        "Tech Dashboard: Tablet-optimized interface for mechanics.",
        "Automated Notifications: SMS/Email updates for customers on service status.",
      ],
      techStack: ["PHP", "Ajax", "MySQL", "jQuery", "Bootstrap"],
      image: "/assets/service_center_system_ui.png",
      gradient: "from-blue-600 to-indigo-400",
      tags: ["PHP", "QR Management", "CRM", "Sales"],
      category: "Enterprise",
    },
    {
      title: "Fuddy Mobile App",
      subtitle: "Food Discovery Platform",
      description:
        "Mobile application for finding nearby restaurants, sharing reviews, and tracking favorite food spots with real-time distance calculation.",
      longDescription:
        "Fuddy is a comprehensive social food discovery platform that connects foodies with the best local dining experiences. It combines powerful geolocation services to find nearby restaurants, an engaging social feed for sharing food reviews, and smart features like favorite place tracking and real-time delivery distance calculation.",
      features: [
        "Restaurant Finder: Interactive map showing nearby dining options.",
        "Social Reviews: Share photos and invalid ratings with the community.",
        "Favorites List: Save and organize your go-to restaurants.",
        "Real-time Distance: Accurate distance and delivery time calculation using Google Maps API.",
        "Smart Search: Filter by cuisine, rating, and distance.",
        "User Profiles: Track your foodie level and review history.",
      ],
      techStack: [
        "Flutter",
        "Firebase",
        "Google Maps API",
        "Google Places API",
      ],
      image: "/assets/fuddy_mobile_app_ui.png",
      gradient: "from-orange-500 to-red-400",
      tags: ["Flutter", "Google Maps", "Social", "Food"],
      category: "Mobile",
    },
    {
      title: "Noir Mode",
      subtitle: "Luxury Fashion E-commerce",
      description:
        "Premium high-fashion clothing brand website with a cinematic shopping experience, immersive visuals, and exclusive collection drops.",
      longDescription:
        "Noir Mode is an ultra-modern luxury fashion e-commerce platform that redefines online shopping. Inspired by high-end fashion editorials, it features full-screen cinematic visuals, sophisticated typography, and 3D product interactions. The platform offers a seamless and exclusive shopping experience with features like limited-edition drops, virtual try-ons, and personalized style curation.",
      features: [
        "Cinematic UI/UX: Immersive full-screen visuals and smooth transitions.",
        "3D Product View: Interactive 360-degree product exploration.",
        "Exclusive Drops: Countdown-timer based limited edition releases.",
        "Virtual Stylist: AI-powered outfit recommendations.",
        "Global Shipping: Integrated logistics for worldwide delivery.",
        "VIP Membership: Tiered loyalty program with early access perks.",
      ],
      techStack: [
        "Next.js",
        "Three.js",
        "Shopify Headless",
        "GraphQL",
        "Tailwind CSS",
      ],
      image: "/assets/noir_mode_ecommerce_ui.png",
      gradient: "from-zinc-900 to-stone-800",
      tags: ["Next.js", "Three.js", "Shopify", "Fashion"],
      category: "Web App",
    },
    {
      title: "NexGen Institute",
      subtitle: "Education Management System",
      description:
        "Comprehensive institute management platform with student portals, online classes, material sharing, and automated fee payments.",
      longDescription:
        "NexGen Institute is an all-in-one educational management solution designed to streamline the operations of modern learning institutions. It bridges the gap between administration, teachers, students, and parents. The platform facilitates seamless online learning with live classes, secure material distribution, and a robust payment gateway for fee collection.",
      features: [
        "Student Management: specialized profiles, attendance tracking, and performance analytics.",
        "Online Live Classes: Built-in virtual classroom with video conferencing and whiteboards.",
        "Material Sharing: Secure digital library for lecture notes, assignments, and resources.",
        "Online Payments: Integrated gateway for tuition fee collection and automated invoicing.",
        "Parent Portal: Real-time updates on student progress and institute announcements.",
        "Exam Module: Online quizzes, grading systems, and report card generation.",
      ],
      techStack: ["React", "Node.js", "MongoDB", "Express", "Stripe", "WebRTC"],
      image: "/assets/nexgen_institute_ui_v2.png",
      gradient: "from-cyan-500 to-blue-600",
      tags: ["React", "Node.js", "WebRTC", "EdTech"],
      category: "Enterprise",
    },
    {
      title: "Nova ERP",
      subtitle: "Intelligent Resource Planning",
      description:
        "Next-gen ERP system with AI-driven predictive analytics and automated decision support.",
      longDescription:
        "Nova ERP is a self-learning enterprise resource planning platform. Beyond standard modules, it utilizes advanced machine learning to predict inventory shortages, optimize supply chains, and suggest financial strategies. The AI assistant pro-actively identifies anomalies and opportunities, transforming reactive management into proactive strategy.",
      features: [
        "AI Predictions: Forecasting sales, stock levels, and cash flow trends.",
        "Smart Suggestions: Actionable insights for cost reduction and efficiency.",
        "Automated Workflows: Self-correcting processes based on real-time data.",
        "Holistic Dashboard: Unified view of Finance, HR, Supply Chain, and CRM.",
        "Anomaly Detection: Real-time alerts for irregular patterns or fraud.",
        "Voice Assistant: Natural language interface for querying data.",
      ],
      techStack: ["Python", "React", "TensorFlow", "FastAPI", "PostgreSQL"],
      image: "/assets/ai_erp_system_ui.png",
      gradient: "from-violet-600 to-indigo-400",
      tags: ["Python", "AI/ML", "ERP", "Enterprise"],
      category: "Enterprise",
    },
    {
      title: "Mini Crik",
      subtitle: "Casual 2D Game",
      description:
        "Fun and addictive 2D cricket game with vibrant graphics, multiple levels, and leaderboards.",
      longDescription:
        "Mini Crik is a hyper-casual mobile cricket game designed for quick fun. It features an intuitive 'tap-to-hit' mechanic, colorful cartoon-style graphics, and a progression system with unlocking stadiums and gear. Challenge friends on the global leaderboard and unlock achievements as you become the ultimate cricket champion.",
      features: [
        "Intuitive Gameplay: Simple one-touch controls for accessible fun.",
        "Multiple Modes: Quick Match, World Tour, and Challenge Mode.",
        "Unlockables: Earn coins to unlock new bats, balls, and stadiums.",
        "Global Leaderboards: Compete with players worldwide for the high score.",
        "Daily Rewards: Daily login bonuses and challenges.",
        "Offline Play: Enjoy the game anywhere, even without internet.",
      ],
      techStack: ["Unity", "C#", "Firebase", "AdMob"],
      image: "/assets/mini_crik_game_ui.png",
      gradient: "from-amber-400 to-orange-500",
      tags: ["Unity", "Game Dev", "C#", "Mobile"],
      category: "Mobile",
    },
  ];

  const filteredProjects =
    activeTab === "All"
      ? projects
      : projects.filter((p) => p.category === activeTab);

  return (
    <section id="portfolio" className="py-32 bg-black/40">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary font-medium tracking-wide uppercase text-sm"
          >
            Selected Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mt-4 mb-6"
          >
            Our{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Portfolio
            </span>
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-2 mt-8"
          >
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === cat
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            ))}
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              onClick={setSelectedProject}
            />
          ))}
        </div>

        <div className="text-center mt-16">
          <Button
            variant="outline"
            size="lg"
            className="rounded-full px-8 border-2"
          >
            View All Case Studies
          </Button>
        </div>
      </div>

      {/* Project Details Modal */}
      <Dialog
        open={!!selectedProject}
        onOpenChange={(open) => !open && setSelectedProject(null)}
      >
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background/95 backdrop-blur-xl border-white/10">
          {selectedProject && (
            <div className="flex flex-col md:flex-row h-[80vh] md:h-auto overflow-y-auto md:overflow-hidden">
              {/* Left/Top: Visual */}
              <div
                className={`w-full md:w-2/5 bg-gradient-to-br ${selectedProject.gradient} relative p-6 flex flex-col justify-end overflow-hidden`}
              >
                {/* Background Image */}
                {selectedProject.image ? (
                  <>
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  </>
                ) : (
                  <div className="absolute inset-0 bg-black/10" />
                )}

                {/* Decorative Patterns or Image */}
                <div className="relative z-10 mt-auto">
                  <Badge className="bg-white/20 hover:bg-white/30 text-white border-none mb-4 backdrop-blur-md">
                    {selectedProject.category}
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    {selectedProject.title}
                  </h2>
                  <p className="text-white/80 font-medium">
                    {selectedProject.subtitle}
                  </p>
                </div>
              </div>

              {/* Right/Bottom: Details */}
              <div className="w-full md:w-3/5 p-8 flex flex-col gap-6">
                <div>
                  <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
                    <span className="w-1 h-6 bg-primary rounded-full" />
                    Project Overview
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {selectedProject.longDescription ||
                      selectedProject.description}
                  </p>
                </div>

                {selectedProject.features && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-foreground">
                      Key Features
                    </h3>
                    <ul className="grid gap-2">
                      {selectedProject.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedProject.techStack && (
                  <div>
                    <h3 className="text-lg font-bold mb-3 text-foreground">
                      Technology Stack
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.techStack.map((tech) => (
                        <Badge
                          key={tech}
                          variant="secondary"
                          className="px-3 py-1"
                        >
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-auto pt-6 flex gap-4">
                  <Button className="w-full gap-2">
                    Launch Project <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
