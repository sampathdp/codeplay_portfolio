import { motion } from "framer-motion";
import { ArrowUpRight, Github, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { useState } from "react";

const ProjectCard = ({ project, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="group relative rounded-3xl overflow-hidden bg-background border border-border/50 hover:border-primary/50 transition-colors duration-500"
  >
    {/* Image Placeholder with Gradient */}
    <div
      className={`h-64 w-full bg-gradient-to-br ${project.gradient} relative overflow-hidden group-hover:scale-105 transition-transform duration-700`}
    >
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

      {/* Overlay Buttons */}
      <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
        <Button
          size="icon"
          variant="secondary"
          className="rounded-full shadow-lg h-10 w-10"
        >
          <Github className="w-5 h-5" />
        </Button>
        <Button size="icon" className="rounded-full shadow-lg h-10 w-10">
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
  const categories = ["All", "Web App", "Mobile", "Enterprise"];

  const projects = [
    {
      title: "FinTech Dashboard",
      subtitle: "Financial Analytics",
      description:
        "A comprehensive dashboard for tracking real-time market data, portfolio performance, and predictive analytics.",
      gradient: "from-blue-600 to-indigo-400",
      tags: ["React", "D3.js", "Node.js"],
      category: "Web App",
    },
    {
      title: "HealthCore App",
      subtitle: "Telemedicine Platform",
      description:
        "Secure patient-doctor video consultation app with integrated prescription management and health tracking.",
      gradient: "from-emerald-500 to-teal-300",
      tags: ["Flutter", "WebRTC", "Firebase"],
      category: "Mobile",
    },
    {
      title: "E-Commerce Pro",
      subtitle: "Retail Solution",
      description:
        "Scalable headless e-commerce solution with AI-driven product recommendations and inventory management.",
      gradient: "from-purple-500 to-pink-400",
      tags: ["Next.js", "Stripe", "Sanity"],
      category: "Web App",
    },
    {
      title: "EduLearn System",
      subtitle: "LMS Platform",
      description:
        "Enterprise learning management system helping universities manage curriculum and student progress.",
      gradient: "from-orange-500 to-amber-300",
      tags: ["Vue.js", "Python", "PostgreSQL"],
      category: "Enterprise",
    },
    {
      title: "TravelGo",
      subtitle: "Booking Engine",
      description:
        "Flight and hotel booking aggregator with interactive maps and smart itinerary planning.",
      gradient: "from-sky-500 to-cyan-300",
      tags: ["React", "Google Maps", "Express"],
      category: "Web App",
    },
    {
      title: "SmartHome Hub",
      subtitle: "IoT Controller",
      description:
        "Centralized control interface for modern smart homes, integrating various IoT protocols.",
      gradient: "from-slate-600 to-zinc-400",
      tags: ["React Native", "MQTT", "Node-RED"],
      category: "Mobile",
    },
  ];

  const filteredProjects =
    activeTab === "All"
      ? projects
      : projects.filter((p) => p.category === activeTab);

  return (
    <section id="portfolio" className="py-32 bg-background">
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
            <ProjectCard key={project.title} project={project} index={index} />
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
    </section>
  );
}
