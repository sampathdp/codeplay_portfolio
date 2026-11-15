import { motion } from "framer-motion";
import {
  Brush,
  CalendarHeart,
  CloudOff,
  Flame,
  Palette,
  ShieldCheck,
  Sparkles,
  Wallpaper,
} from "lucide-react";
import { SiGoogleplay } from "react-icons/si";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import {
  COLORBLOOM_IMAGES,
  COLORBLOOM_PLAY_URL,
  COLORBLOOM_PRIVACY,
  COLORBLOOM_SCREENS,
} from "@/data/colorBloom";

const PAGE_URL = "https://codeplaystudios.com/colorbloom";

const FEATURES = [
  {
    icon: Palette,
    title: "Curated Designs",
    text: "Mandalas, sacred geometry, geometric and floral art, plus a fresh design of the day.",
  },
  {
    icon: Sparkles,
    title: "Symmetry Studio",
    text: "Draw live, mirrored mandalas with 8x, 12x or 16x symmetry and a full spectrum color wheel.",
  },
  {
    icon: Brush,
    title: "Mandala Studio",
    text: "Design your own mandalas from scratch, then color them your way.",
  },
  {
    icon: Wallpaper,
    title: "Timelapse & HD Wallpapers",
    text: "Replay how your artwork came together and export it as a wallpaper or PNG.",
  },
  {
    icon: Flame,
    title: "Streaks & Calendar",
    text: "Build a calm daily habit with streaks, a coloring calendar and your personal gallery.",
  },
  {
    icon: CloudOff,
    title: "Offline First",
    text: "Color anywhere, no internet needed. Progress syncs when you are back online.",
  },
  {
    icon: ShieldCheck,
    title: "No Ads, No Tracking",
    text: "No ad networks, no email sign-up. Start coloring with an optional anonymous profile.",
  },
  {
    icon: CalendarHeart,
    title: "Made for Mindfulness",
    text: "Gentle sounds and haptics turn a few minutes of coloring into a moment to unwind.",
  },
];

function PlayButton({ className = "" }: { className?: string }) {
  return (
    <a
      href={COLORBLOOM_PLAY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 to-violet-500 px-6 py-4 font-semibold text-white shadow-xl shadow-pink-500/25 transition hover:brightness-110 ${className}`}
    >
      <SiGoogleplay className="h-6 w-6" />
      <span className="text-left leading-tight">
        <span className="block text-xs font-normal opacity-80">Get it on</span>
        <span className="block text-lg">Google Play</span>
      </span>
    </a>
  );
}

export default function ColorBloom() {
  return (
    <div className="min-h-screen bg-[#0d0b24] text-white overflow-x-hidden relative selection:bg-pink-500/30">
      <SEO
        title="ColorBloom: Mindful Coloring & Art App | CodePlay Studios"
        description="ColorBloom by CodePlay Studio is a mindful coloring app for Android. Color mandalas, create symmetry art, export HD wallpapers. Offline, no ads."
        keywords="ColorBloom, coloring app, mandala coloring, adult coloring app, mindfulness app, symmetry drawing, Android coloring, CodePlay Studio"
        ogImage={`https://codeplaystudios.com${COLORBLOOM_IMAGES.og}`}
        ogImageAlt="ColorBloom — Mindful Coloring & Art"
        ogImageWidth={1200}
        ogImageHeight={670}
        canonical={PAGE_URL}
        breadcrumbs={[
          { name: "Home", item: "https://codeplaystudios.com" },
          { name: "ColorBloom", item: PAGE_URL },
        ]}
        schemas={[
          {
            "@context": "https://schema.org",
            "@type": "MobileApplication",
            name: "ColorBloom",
            operatingSystem: "Android",
            applicationCategory: "LifestyleApplication",
            url: PAGE_URL,
            downloadUrl: COLORBLOOM_PLAY_URL,
            installUrl: COLORBLOOM_PLAY_URL,
            image: `https://codeplaystudios.com${COLORBLOOM_IMAGES.icon}`,
            screenshot: COLORBLOOM_SCREENS.map(
              (s) => `https://codeplaystudios.com${s.src}`,
            ),
            description:
              "A mindful coloring and art app with curated mandalas, a symmetry drawing studio, timelapse replays and HD wallpaper export.",
            author: {
              "@type": "Organization",
              name: "CodePlay Studios",
              url: "https://codeplaystudios.com",
            },
          },
        ]}
      />

      {/* soft glow background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute -left-40 top-20 h-[32rem] w-[32rem] rounded-full bg-pink-500/20 blur-[120px]" />
        <div className="absolute -right-40 top-1/3 h-[36rem] w-[36rem] rounded-full bg-violet-600/20 blur-[140px]" />
        <div className="absolute bottom-0 left-1/3 h-[28rem] w-[28rem] rounded-full bg-sky-500/10 blur-[120px]" />
      </div>

      <div className="relative z-10">
        <Navigation />

        <main className="pt-32 md:pt-40 pb-24">
          {/* Hero */}
          <section className="container mx-auto px-6">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-center gap-4"
                >
                  <img
                    src={COLORBLOOM_IMAGES.icon}
                    alt="ColorBloom app icon"
                    width={72}
                    height={72}
                    className="h-16 w-16 rounded-2xl shadow-lg shadow-pink-500/20 md:h-[72px] md:w-[72px]"
                  />
                  <span className="rounded-full border border-pink-400/30 bg-pink-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-pink-300">
                    New on Google Play
                  </span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6 text-5xl font-bold leading-tight md:text-7xl"
                >
                  Color
                  <span className="bg-gradient-to-r from-pink-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
                    Bloom
                  </span>
                  <span className="mt-3 block text-2xl font-medium text-white/80 md:text-3xl">
                    Mindful Coloring &amp; Art
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-10 max-w-xl text-lg text-white/70 md:text-xl"
                >
                  Slow down and let color do the rest. ColorBloom brings
                  beautiful mandalas, a live symmetry studio and daily art
                  challenges to your phone. Offline, ad free and built by
                  CodePlay Studio.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-wrap items-center gap-4"
                >
                  <PlayButton />
                  <a
                    href="#screens"
                    className="rounded-2xl border border-white/15 px-6 py-4 font-semibold text-white/85 transition hover:bg-white/5"
                  >
                    See the app
                  </a>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="relative mx-auto flex w-full max-w-md justify-center lg:max-w-none"
              >
                <img
                  src={COLORBLOOM_SCREENS[0].src}
                  alt="ColorBloom home screen with curated designs"
                  width={540}
                  height={968}
                  className="relative z-10 w-56 rotate-[-6deg] rounded-[2rem] shadow-2xl shadow-black/50 sm:w-64"
                />
                <img
                  src={COLORBLOOM_SCREENS[2].src}
                  alt="ColorBloom Symmetry Studio"
                  width={540}
                  height={968}
                  className="-ml-16 mt-12 w-56 rotate-[6deg] rounded-[2rem] shadow-2xl shadow-black/50 sm:w-64"
                />
              </motion.div>
            </div>
          </section>

          {/* Features */}
          <section className="container mx-auto mt-28 px-6">
            <div className="mb-12 max-w-2xl">
              <span className="mb-3 block text-sm font-medium uppercase tracking-widest text-pink-300">
                Features
              </span>
              <h2 className="text-3xl font-bold md:text-5xl">
                Everything you need to unwind
              </h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 4) * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-gradient-to-br from-pink-500/25 to-violet-500/25 p-3">
                    <f.icon className="h-6 w-6 text-pink-200" />
                  </div>
                  <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-white/65">{f.text}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Screenshots */}
          <section id="screens" className="mt-28 scroll-mt-28">
            <div className="container mx-auto mb-10 px-6">
              <span className="mb-3 block text-sm font-medium uppercase tracking-widest text-pink-300">
                Inside the app
              </span>
              <h2 className="text-3xl font-bold md:text-5xl">Take a look</h2>
            </div>
            <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6 md:container md:mx-auto">
              {COLORBLOOM_SCREENS.map((s) => (
                <figure key={s.src} className="w-56 shrink-0 snap-start sm:w-64">
                  <img
                    src={s.src}
                    alt={`ColorBloom — ${s.title}`}
                    width={540}
                    height={968}
                    loading="lazy"
                    className="w-full rounded-3xl border border-white/10 shadow-xl shadow-black/40"
                  />
                  <figcaption className="mt-4">
                    <span className="block font-semibold">{s.title}</span>
                    <span className="text-sm text-white/60">{s.caption}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="container mx-auto mt-24 px-6">
            <div className="relative overflow-hidden rounded-3xl border border-white/10">
              <img
                src={COLORBLOOM_IMAGES.feature}
                alt=""
                width={1024}
                height={572}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover opacity-40"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b24] via-[#0d0b24]/80 to-transparent" />
              <div className="relative max-w-xl p-8 md:p-14">
                <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                  Start your first bloom today
                </h2>
                <p className="mb-8 text-white/70">
                  Download ColorBloom on Google Play and find a calmer few
                  minutes in your day.
                </p>
                <PlayButton />
                <p className="mt-6 text-sm text-white/50">
                  Read the{" "}
                  <a href={COLORBLOOM_PRIVACY} className="underline hover:text-white">
                    ColorBloom privacy policy
                  </a>
                  .
                </p>
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
