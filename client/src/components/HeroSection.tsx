import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import MatrixRain from "./MatrixRain";

// New Slides Data with generated assets
const slides = [
  {
    image: "/assets/hero_web_dev_cartoon-640.webp",
    title: "Web Development",
    headline: "Crafting Digital",
    highlight: "Experiences",
    description:
      "Robust, scalable, and responsive web solutions that drive growth and engagement.",
    gradient: "from-blue-600/20 to-cyan-500/20",
    textGradient: "from-blue-400 to-cyan-400",
    accent: "text-cyan-400",
    bgGlow: "bg-blue-500/30",
    shadowColor: "#06b6d4",
  },
  {
    image: "/assets/hero_mobile_dev_cartoon-640.webp",
    title: "Mobile Apps",
    headline: "Building Smart",
    highlight: "Mobile Apps",
    description:
      "Seamless, intuitive, and engaging mobile applications tailored for iOS and Android.",
    gradient: "from-purple-600/20 to-pink-500/20",
    textGradient: "from-purple-400 to-pink-400",
    accent: "text-purple-400",
    bgGlow: "bg-purple-500/30",
    shadowColor: "#a855f7",
  },
  {
    image: "/assets/hero_creative_dev_cartoon-640.webp",
    title: "Creative Design",
    headline: "Designing Visual",
    highlight: "Masterpieces",
    description:
      "Minimalist solutions and stunning visuals that tell your brand's unique story.",
    gradient: "from-orange-500/20 to-amber-500/20",
    textGradient: "from-orange-400 to-amber-400",
    accent: "text-orange-400",
    bgGlow: "bg-orange-500/30",
    shadowColor: "#f97316",
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
    <section className="relative w-full min-h-screen lg:h-screen overflow-hidden bg-transparent pt-20 lg:pt-0">
      {/* MatrixRain is now global in Home.tsx */}
      {/* Overlay to ensuring text readability */}
      <div className="container mx-auto h-full px-6 relative z-10">
        <div className="grid lg:grid-cols-2 h-full gap-8">
          {/* LEFT: Static Text Content */}
          <div className="flex flex-col justify-center z-20 order-2 lg:order-1 relative min-h-[300px] lg:min-h-[400px]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <span className="inline-block px-4 py-1.5 rounded-full glass border border-primary/20 text-primary text-sm font-medium mb-6 backdrop-blur-md">
                  Welcome to CodePlay Studios
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                  {slides[selectedIndex].headline} <br />
                  <span
                    className={`text-transparent bg-clip-text bg-gradient-to-r ${slides[selectedIndex].textGradient}`}
                  >
                    {slides[selectedIndex].highlight}
                  </span>
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground mb-10 font-light max-w-lg leading-relaxed">
                  {slides[selectedIndex].description}
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    size="lg"
                    className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground border-none h-14 px-8 text-lg shadow-lg shadow-primary/20"
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
            </AnimatePresence>
          </div>

          {/* RIGHT: Image Slider */}
          <div className="relative h-[350px] sm:h-[450px] lg:h-full flex items-center justify-center order-1 lg:order-2 overflow-hidden mt-10 lg:mt-0">
            {/* Slider container */}
            <div className="w-full h-full absolute inset-0" ref={emblaRef}>
              <div className="flex h-full">
                {slides.map((slide, index) => (
                  <div
                    className="relative flex-[0_0_100%] h-full flex items-center justify-center"
                    key={index}
                  >
                    {/* Dynamic Background Ambient Glow */}
                    <div
                      className="absolute w-64 h-64 lg:w-80 lg:h-80 rounded-full blur-3xl pointer-events-none transition-opacity duration-700"
                      style={{
                        backgroundColor: slide.shadowColor,
                        opacity: selectedIndex === index ? 0.25 : 0,
                      }}
                    />

                    {/* Character Image */}
                    <div className="relative z-10 w-full h-full flex items-center justify-center p-8">
                      <motion.img
                        initial={false}
                        animate={{
                          scale: selectedIndex === index ? 1 : 0.85,
                          opacity: selectedIndex === index ? 1 : 0,
                          y: selectedIndex === index ? 0 : 20,
                        }}
                        transition={{ duration: 0.8 }}
                        src={slide.image}
                        alt={`CodePlay Studios ${slide.title} - ${slide.headline} ${slide.highlight}`}
                        width={800}
                        height={800}
                        fetchPriority={index === 0 ? "high" : "auto"}
                        loading={index === 0 ? "eager" : "lazy"}
                        className="max-h-[92%] lg:max-h-[85%] max-w-[92%] w-auto h-auto object-contain select-none pointer-events-none"
                        style={{
                          filter: `drop-shadow(0 0 45px ${slide.shadowColor}70) drop-shadow(0 20px 35px rgba(0,0,0,0.5))`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Slider Navigation (Optional corner controls) */}
            <div className="absolute bottom-4 lg:bottom-12 right-0 flex gap-2 z-30">
              <Button
                size="icon"
                variant="outline"
                onClick={scrollPrev}
                aria-label="Previous slide"
                className="rounded-full h-10 w-10 border-white/10 bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                onClick={scrollNext}
                aria-label="Next slide"
                className="rounded-full h-10 w-10 border-white/10 bg-black/20 text-white hover:bg-black/40 backdrop-blur-sm"
              >
                <ChevronRight className="h-5 w-5" aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
