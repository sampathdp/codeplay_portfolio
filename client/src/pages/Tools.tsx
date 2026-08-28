import { motion } from "framer-motion";
import { Link } from "wouter";
import { ImagePlus, RefreshCw, Eraser, Clapperboard, ArrowRight, Sparkles, FileText, type LucideIcon } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import MatrixRain from "@/components/MatrixRain";

interface ToolEntry {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  color: string;
  bg: string;
  border: string;
}

interface ToolCategory {
  title: string;
  tools: ToolEntry[];
}

const categories: ToolCategory[] = [
  {
    title: "Images",
    tools: [
      {
        icon: ImagePlus,
        title: "Image Editor",
        description:
          "Background removal, edge cleanup, sharpening, and watermark/spot removal for sprites and images — all in the browser.",
        href: "/tools/image-editor",
        color: "text-sky-400",
        bg: "bg-sky-400/10",
        border: "border-sky-400/20",
      },
      {
        icon: RefreshCw,
        title: "Format Converter",
        description:
          "Convert images between JPEG, PNG, and WebP, one at a time or in batches. Runs fully in your browser — nothing is uploaded.",
        href: "/tools/image-converter",
        color: "text-violet-400",
        bg: "bg-violet-400/10",
        border: "border-violet-400/20",
      },
      {
        icon: Eraser,
        title: "Image Watermark Remover",
        description:
          "Mark the Gemini icon or any watermark on an image and remove it with lossless, content-aware repair — full original resolution, no quality loss.",
        href: "/tools/image-watermark",
        color: "text-rose-400",
        bg: "bg-rose-400/10",
        border: "border-rose-400/20",
      },
    ],
  },
  {
    title: "Videos",
    tools: [
      {
        icon: Clapperboard,
        title: "Video Watermark Remover",
        description:
          "Mark the Gemini icon or any other watermark on a preview frame, then remove it or replace it with your own logo across the whole clip.",
        href: "/tools/video-watermark",
        color: "text-amber-400",
        bg: "bg-amber-400/10",
        border: "border-amber-400/20",
      },
    ],
  },
  {
    title: "Documents",
    tools: [
      {
        icon: FileText,
        title: "Image to PDF Template Editor",
        description:
          "Upload a certificate, form, or document image, patch/edit its text and logos, set where page 1 ends, and export a print-ready 2-page A4 PDF.",
        href: "/tools/pdf-template",
        color: "text-emerald-400",
        bg: "bg-emerald-400/10",
        border: "border-emerald-400/20",
      },
    ],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

function ToolGrid({ tools }: { tools: ToolEntry[] }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
      {tools.map((tool, index) => {
        const CardInner = (
          <>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 bg-black/40 text-white shadow-lg group-hover:scale-110 transition-transform duration-300">
              <tool.icon className={`h-7 w-7 ${tool.color}`} />
            </div>
            <h3 className="text-xl font-bold mb-4">{tool.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{tool.description}</p>
            <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <ArrowRight className={`h-6 w-6 ${tool.color} -rotate-45 group-hover:rotate-0 transition-transform duration-300`} />
            </div>
          </>
        );

        const className = `group relative p-8 rounded-3xl border transition-all duration-300 ${tool.bg} ${tool.border} hover:border-opacity-50 hover:bg-opacity-20`;

        return tool.href ? (
          <motion.div key={index} variants={itemVariants} whileHover={{ y: -5, transition: { duration: 0.2 } }}>
            <Link href={tool.href} className={`block ${className}`}>
              {CardInner}
            </Link>
          </motion.div>
        ) : (
          <motion.div key={index} variants={itemVariants} className={`${className} opacity-60 cursor-not-allowed`}>
            {CardInner}
            <span className="absolute bottom-8 right-8 text-xs uppercase tracking-widest text-muted-foreground font-mono">
              Coming soon
            </span>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Tools() {
  return (
    <div className="min-h-screen text-foreground selection:bg-primary/30">
      <SEO
        title="Free Tools"
        description="Free browser-based tools from CodePlay Studios — image background removal, video watermark removal, and more utilities we build for our own workflow."
        keywords="free tools, image editor, background removal, video watermark remover, remove gemini watermark, online tools, CodePlay Studios"
      />
      <Navigation />

      <main className="pt-24 pb-16 relative z-10">
        <div className="fixed inset-0 z-0 h-full w-full bg-background">
          <MatrixRain />
          <div className="absolute inset-0 bg-background/80 z-0 pointer-events-none" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
            <motion.div variants={itemVariants} className="max-w-4xl mx-auto text-center space-y-8 pt-12">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles className="h-4 w-4 text-sky-400" />
                <span className="text-sm font-medium text-sky-300">Free, no sign-up required</span>
              </motion.div>

              <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                Tools
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
                Small, useful utilities we build for our own production workflow and share with everyone.
              </p>
            </motion.div>

            {categories.map((category) => (
              <motion.div key={category.title} variants={itemVariants} className="space-y-8">
                <h2 className="text-2xl font-bold text-white max-w-7xl mx-auto px-2">{category.title}</h2>
                <ToolGrid tools={category.tools} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
