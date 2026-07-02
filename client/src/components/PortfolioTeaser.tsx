import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Link } from "wouter";
import { CASE_STUDIES } from "@/data/caseStudies";

export default function PortfolioTeaser() {
  // We'll show the first 2 projects as "featured"
  const featuredProjects = CASE_STUDIES.slice(0, 2);

  return (
    <section className="py-24 bg-transparent">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex items-center gap-2 text-primary uppercase font-mono text-sm tracking-[0.2em] mb-4"
            >
              <Star className="w-4 h-4 fill-primary" />
              Featured Shipments
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold tracking-tight"
            >
              Industrial Grade <br />
              <span className="text-muted-foreground">Software Deployments</span>
            </motion.h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              asChild
              variant="link"
              className="text-primary hover:text-primary/80 p-0 text-xl font-bold group h-auto"
            >
              <Link href="/case-studies">
                Explore Full Portfolio
                <ArrowRight className="ml-2 w-6 h-6 transition-transform group-hover:translate-x-2" />
              </Link>
            </Button>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {featuredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative h-[500px] rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl"
            >
              <Link href={`/case-studies/${project.slug}`}>
                <div className="absolute inset-0 cursor-pointer">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 p-12 flex flex-col justify-end">
                    <div className="space-y-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <div className="px-4 py-1 rounded-full bg-primary/20 border border-primary/30 w-fit text-xs font-mono text-primary uppercase">
                        {project.category}
                      </div>
                      <h3 className="text-4xl font-bold text-white tracking-tight">{project.title}</h3>
                      <p className="text-white/60 text-lg line-clamp-2 max-w-sm">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
