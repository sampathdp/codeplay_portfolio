import { motion } from "framer-motion";
import { ShieldCheck, Zap, Heart, LayoutGrid } from "lucide-react";

const FeatureBox = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    viewport={{ once: true }}
    className="p-8 rounded-3xl bg-card border border-border/50 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20 transition-all duration-500"
  >
    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
      <Icon className="h-6 w-6 text-primary" />
    </div>
    <h3 className="text-xl font-bold mb-4">{title}</h3>
    <p className="text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

export default function WhyChooseSection() {
  return (
    <section className="py-32 bg-muted/30 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20 max-w-2xl mx-auto">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            Why Global Brands <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              Trust Us
            </span>
          </motion.h2>
          <p className="text-muted-foreground text-lg">
            We don't just write code; we engineer success. Here is what sets us
            apart from the competition.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FeatureBox
            index={0}
            icon={ShieldCheck}
            title="Security First"
            description="Enterprise-grade security baked into every layer of your application from day one."
          />
          <FeatureBox
            index={1}
            icon={Zap}
            title="Blazing Fast"
            description="Performance is not an afterthought. We optimize for speed and efficiency at every step."
          />
          <FeatureBox
            index={2}
            icon={LayoutGrid}
            title="Scalable Core"
            description="Architectures designed to grow with you, handling millions of users without breaking a sweat."
          />
          <FeatureBox
            index={3}
            icon={Heart}
            title="User Loved"
            description="We craft intuitive experiences that users love, driving higher engagement and retention."
          />
        </div>
      </div>
    </section>
  );
}
