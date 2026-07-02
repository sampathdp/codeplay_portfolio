import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";
import { Badge } from "./ui/badge";

interface CaseStudyCardProps {
  title: string;
  tag: string;
  tagColor: string;
  description: string;
  metric: string;
  metricLabel: string;
  slug: string;
  gradient: string;
  index: number;
  images?: string[];
}

export default function CaseStudyCard({
  title,
  tag,
  tagColor,
  description,
  metric,
  metricLabel,
  slug,
  gradient,
  index,
  images,
}: CaseStudyCardProps) {
  const image = images?.[0];
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
      viewport={{ once: true }}
      className="group"
    >
      <Link href={`/case-studies/${slug}`} className="block h-full cursor-pointer">
        <div className="relative h-full glass rounded-3xl overflow-hidden border border-white/10 p-1 transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-[0_0_30px_rgba(0,212,255,0.15)]">
          {/* Visual Area */}
          <div className={`aspect-video rounded-2xl bg-gradient-to-br ${gradient} p-8 flex flex-col justify-end relative overflow-hidden`}>
            {image && (
              <>
                <img
                  src={image}
                  alt={title}
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />
              </>
            )}
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-3xl transition-all duration-700 group-hover:bg-primary/20" />
            
            <div className="relative z-10">
              <Badge className={`mb-3 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-md`}>
                {tag}
              </Badge>
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-white">{metric}</p>
                  <p className="text-xs uppercase tracking-wider text-white/70 font-medium">{metricLabel}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white transform transition-transform duration-500 group-hover:rotate-45 group-hover:bg-primary">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            <h3 className="text-xl font-bold mb-3 transition-colors group-hover:text-primary">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
