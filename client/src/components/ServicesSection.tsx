import { motion } from "framer-motion";
import {
  Monitor,
  Smartphone,
  Brain,
  Globe,
  String,
  Layout,
  ArrowRight,
  Code2,
  Rocket,
} from "lucide-react";
import { Button } from "./ui/button";

const ServiceCard = ({ service, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    viewport={{ once: true }}
    className="group relative p-8 rounded-3xl bg-secondary/30 border border-white/10 dark:border-white/5 overflow-hidden hover:bg-secondary/50 transition-colors duration-500"
  >
    <div
      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${service.gradient} opacity-10 blur-3xl group-hover:opacity-20 transition-opacity duration-500`}
    />

    <div className="relative z-10">
      <div
        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient} p-3 mb-6 text-white shadow-lg`}
      >
        {service.icon}
      </div>

      <h3 className="text-2xl font-semibold mb-3 tracking-tight">
        {service.title}
      </h3>
      <p className="text-muted-foreground leading-relaxed mb-6">
        {service.description}
      </p>

      <ul className="space-y-2 mb-8">
        {service.features.map((feature, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-foreground/80"
          >
            <div
              className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.gradient}`}
            />
            {feature}
          </li>
        ))}
      </ul>

      <Button
        variant="ghost"
        className="group/btn pl-0 hover:pl-2 transition-all"
      >
        Learn more <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </div>
  </motion.div>
);

export default function ServicesSection() {
  const services = [
    {
      icon: <Monitor className="w-full h-full" />,
      title: "Web Engineering",
      description:
        "We build pixel-perfect, performant web applications that scale with your business needs.",
      gradient: "from-blue-500 to-cyan-400",
      features: [
        "Next.js & React",
        "Progressive Web Apps",
        "Performance Optimization",
      ],
    },
    {
      icon: <Smartphone className="w-full h-full" />,
      title: "Mobile Development",
      description:
        "Native-quality cross-platform mobile apps that deliver seamless experiences on iOS and Android.",
      gradient: "from-violet-500 to-purple-400",
      features: [
        "React Native / Flutter",
        "Offline-first Architecture",
        "App Store Optimization",
      ],
    },
    {
      icon: <Brain className="w-full h-full" />,
      title: "AI & Automation",
      description:
        "Leverage the power of Artificial Intelligence to automate workflows and gain data insights.",
      gradient: "from-emerald-500 to-teal-400",
      features: [
        "Predictive Analytics",
        "Chatbots & LLMs",
        "Process Automation",
      ],
    },
    {
      icon: <Layout className="w-full h-full" />,
      title: "Product Design",
      description:
        "User-centric UI/UX design that transforms complex problems into intuitive solutions.",
      gradient: "from-orange-500 to-amber-400",
      features: ["Design Systems", "User Research", "Interactive Prototyping"],
    },
    {
      icon: <Globe className="w-full h-full" />,
      title: "Digital Marketing",
      description:
        "Data-driven strategies to increase your online visibility and drive conversion.",
      gradient: "from-pink-500 to-rose-400",
      features: ["SEO & SEM", "Content Strategy", "Growth Hacking"],
    },
    {
      icon: <Rocket className="w-full h-full" />,
      title: "MVP Development",
      description:
        "Rapid prototyping and development to get your startup idea to market fast.",
      gradient: "from-indigo-500 to-blue-400",
      features: [
        "Rapid Prototyping",
        "Scalable Foundation",
        "Go-to-Market Support",
      ],
    },
  ];

  return (
    <section id="services" className="py-32 bg-background relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-20 gap-8">
          <div className="max-w-2xl">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-primary font-medium tracking-wide uppercase text-sm"
            >
              Our Expertise
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold mt-4 tracking-tight"
            >
              Holistic Digital{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Solutions
              </span>
            </motion.h2>
          </div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <p className="text-muted-foreground text-lg max-w-md">
              We combine creative design with technical engineering to build
              products that stand out.
            </p>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
