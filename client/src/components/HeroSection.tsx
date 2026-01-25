import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

// Final Premium Set: High-Resolution 3D Minimalist Renders with even better Slide 1
const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=3870&auto=format&fit=crop", // Ultra-Premium Gold & Glass Abstract
    title: "Crafting Digital Serenity",
    subtitle: "Minimalist solutions for complex problems.",
    align: "left",
  },
  {
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=3864&auto=format&fit=crop", // Sharp 3D Abstract Glass
    title: "Crystal Clarity",
    subtitle: "Transparent processes, solid results.",
    align: "right",
  },
  {
    image:
      "https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=3874&auto=format&fit=crop", // Sharp 3D Minimalist Architecture
    title: "Structured Serenity",
    subtitle: "Building spaces that breathe.",
    align: "left",
  },
  {
    image:
      "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?q=80&w=3870&auto=format&fit=crop", // Sharp 3D Liquid Flow
    title: "Fluid Dynamics",
    subtitle: "Adapting to change with effortless grace.",
    align: "right",
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
      <div className="absolute inset-0" ref={emblaRef}>
        <div className="flex h-full">
          {slides.map((slide, index) => (
            <div
              className="relative flex-[0_0_100%] h-full min-w-0"
              key={index}
            >
              {/* Background Image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              />
              {/* Overlay - NO BLUR */}
              <div className="absolute inset-0 bg-black/40 dark:bg-black/60" />

              {/* Content */}
              <div className="relative z-10 container mx-auto h-full flex items-center px-6">
                {/* Alignment Logic */}
                <div
                  className={`w-full max-w-4xl px-4 
                    ${slide.align === "center" ? "mx-auto text-center" : ""}
                    ${slide.align === "right" ? "ml-auto text-right" : ""}
                 `}
                >
                  <AnimatePresence mode="wait">
                    {selectedIndex === index && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      >
                        <span className="inline-block px-4 py-1.5 rounded-full glass border border-white/20 text-white text-sm font-medium mb-6 backdrop-blur-md">
                          Welcome to CodePlay Studios
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                          {slide.title}
                        </h1>
                        <p
                          className={`text-xl md:text-2xl text-gray-200 mb-10 font-light max-w-2xl drop-shadow-md
                                     ${slide.align === "center" ? "mx-auto" : ""}
                                     ${slide.align === "right" ? "ml-auto" : ""}
                                `}
                        >
                          {slide.subtitle}
                        </p>
                        <div
                          className={`flex gap-4 
                                    ${slide.align === "center" ? "justify-center" : ""}
                                    ${slide.align === "right" ? "justify-end" : ""}
                                `}
                        >
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
                            className="rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white h-14 px-8 text-lg backdrop-blur-sm"
                          >
                            View Portfolio
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="absolute bottom-10 left-0 right-0 z-20 container mx-auto px-6 flex justify-between items-end pointer-events-none">
        {/* Indicators */}
        <div className="flex gap-3 pointer-events-auto">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => emblaApi && emblaApi.scrollTo(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${selectedIndex === i ? "w-8 bg-primary" : "w-2 bg-white/40 hover:bg-white/60"}`}
            />
          ))}
        </div>

        {/* Arrows */}
        <div className="flex gap-2 pointer-events-auto">
          <Button
            size="icon"
            variant="outline"
            onClick={scrollPrev}
            className="rounded-full h-12 w-12 border-white/20 bg-black/20 text-white hover:bg-black/40 hover:scale-110 transition-all backdrop-blur-sm"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            size="icon"
            variant="outline"
            onClick={scrollNext}
            className="rounded-full h-12 w-12 border-white/20 bg-black/20 text-white hover:bg-black/40 hover:scale-110 transition-all backdrop-blur-sm"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </section>
  );
}
