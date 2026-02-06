import { Brain, TrendingUp, Zap, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import aiVisualization from "@assets/generated_images/ai_prediction_bot_visualization_1769626261437.png";

export default function AISection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  const features = [
    {
      icon: TrendingUp,
      title: "Predictive Analytics",
      description:
        "Forecast sales trends and market opportunities with machine learning models",
      color: "primary",
    },
    {
      icon: Zap,
      title: "Automated Decision Making",
      description:
        "Intelligent bots that analyze data and provide actionable recommendations",
      color: "accent",
    },
    {
      icon: BarChart3,
      title: "Performance Insights",
      description:
        "Real-time dashboards that transform complex data into clear insights",
      color: "chart-3",
    },
  ];

  return (
    <section
      className="py-24 px-6 relative overflow-hidden bg-black/40"
      ref={ref}
    >
      <div className="absolute inset-0 opacity-10">
        {/* Grid lines removed as per user request */}
      </div>

      <div className="container mx-auto max-w-6xl relative">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Brain className="h-4 w-4 text-accent" />
              </motion.div>
              <span className="text-sm font-medium text-accent">
                AI Innovation
              </span>
            </motion.div>

            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Empowering Businesses with AI Insights & Prediction Bots
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our AI systems forecast trends, analyze performance, and automate
              decisions. From sales predictions to smart analytics, we give you
              the power to stay ahead.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    className="flex items-start gap-4"
                    initial={{ opacity: 0, x: -30 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <motion.div
                      className={`h-10 w-10 rounded-md bg-${feature.color}/10 flex items-center justify-center flex-shrink-0`}
                      whileHover={{ rotate: 360, scale: 1.1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Icon className={`h-5 w-5 text-${feature.color}`} />
                    </motion.div>
                    <div>
                      <h3 className="font-bold mb-1">{feature.title}</h3>
                      <p className="text-muted-foreground text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <motion.div
              className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg blur-xl"
              animate={{
                opacity: [0.3, 0.5, 0.3],
                scale: [1, 1.05, 1],
              }}
              transition={{ duration: 4, repeat: Infinity }}
            />
            <motion.img
              src={aiVisualization}
              alt="CodePlay Studios AI Analytics Visualization - Predictive insights and data processing"
              className="relative rounded-lg shadow-2xl"
              data-testid="img-ai-visualization"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
              style={{
                filter: "drop-shadow(0 0 40px #06b6d480)",
                maskImage:
                  "radial-gradient(circle at center, black 60%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(circle at center, black 60%, transparent 100%)",
              }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
