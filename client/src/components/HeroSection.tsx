import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// New Slides Data with generated assets
const slides = [
  {
    image: "/assets/hero_web_dev_cartoon.png",
    title: "Web Development", // For alt text
    gradient: "from-blue-600/20 to-cyan-500/20",
    accent: "text-cyan-400",
    bgGlow: "bg-blue-500/30"
  },
  {
    image: "/assets/hero_mobile_dev_cartoon.png",
    title: "Mobile Apps",
    gradient: "from-purple-600/20 to-pink-500/20",
    accent: "text-purple-400",
    bgGlow: "bg-purple-500/30"
  },
  {
    image: "/assets/hero_creative_dev_cartoon.png",
    title: "Creative Design",
    gradient: "from-orange-500/20 to-amber-500/20",
    accent: "text-orange-400",
    bgGlow: "bg-orange-500/30"
  },
];

export default function HeroSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5000 }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    emblaApi.on("select", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi],
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi],
  );

  return (
    <section className="relative w-full h-screen overflow-hidden bg-background">
      <div className="container mx-auto h-full px-6">
        <div className="grid lg:grid-cols-2 h-full gap-8">

          {/* LEFT: Static Text Content */}
          <div className="flex flex-col justify-center z-20 order-2 lg:order-1 relative">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <span className="inline-block px-4 py-1.5 rounded-full glass border border-primary/20 text-primary text-sm font-medium mb-6 backdrop-blur-md">
                Welcome to CodePlay Studios
              </span>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                Crafting Digital <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                  Serenity
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-10 font-light max-w-lg leading-relaxed">
                Minimalist solutions for complex problems. We build transparent processes and solid results that breathe life into your ideas.
              </p>
              <div className="flex gap-4">
                <Button
                  size="lg"
                  className="rounded-full bg-primary hover:bg-primary/90 text-white border-none h-14 px-8 text-lg shadow-lg shadow-primary/20"
                >
                  Start Project
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full border-white/10 text-white hover:bg-white/5 h-14 px-8 text-lg backdrop-blur-sm"
                >
                  View Portfolio
                </Button>
              </div>
            </motion.div>
          </div>

          {/* RIGHT: Image Slider */}
          <div className="relative h-full flex items-center justify-center order-1 lg:order-2 overflow-hidden">
            {/* Slider container */}
            <div className="w-full h-full absolute inset-0" ref={emblaRef}>
              <div className="flex h-full">
                {slides.map((slide, index) => (
                  <div className="relative flex-[0_0_100%] h-full flex items-center justify-center" key={index}>
                    {/* Dynamic Background Blob/Glow */}
                    <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[100px] ${slide.bgGlow} transition-colors duration-1000`} />

                    {/* Slide Gradient Background (Subtle) */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-20`} />

                    {/* Character Image */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                      <motion.img
                        key={selectedIndex}
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{
                          scale: selectedIndex === index ? 1 : 0.8,
                          opacity: selectedIndex === index ? 1 : 0,
                          y: selectedIndex === index ? 0 : 20
                        }}
                        transition={{ duration: 0.8 }}
                        src={slide.image}
                        alt={slide.title}
                        className="max-h-[80%] max-w-full object-contain drop-shadow-2xl"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Navigation (Optional corner controls) */}
            <div className="absolute bottom-12 right-0 flex gap-2 z-30">
              <Button
                size="icon"
                variant="outline"
                onClick={scrollPrev}
                className="rounded-full h-10 w-10 border-white/10 bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={scrollNext}
                className="rounded-full h-10 w-10 border-white/10 bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
