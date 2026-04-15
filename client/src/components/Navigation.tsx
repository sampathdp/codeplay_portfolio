import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Menu, X, Instagram, Twitter, Linkedin, Github } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import CurrencySwitcher from "./CurrencySwitcher";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const links = [
    { href: "/", label: "Home" },
    { href: "/case-studies", label: "Projects" },
    { href: "/#about", label: "About" },
    { href: "/#services", label: "Services" },
    { href: "/#contact", label: "Contact" },
  ];

  const socialLinks = [
    { icon: <Twitter className="w-5 h-5" />, href: "#" },
    { icon: <Instagram className="w-5 h-5" />, href: "#" },
    { icon: <Linkedin className="w-5 h-5" />, href: "#" },
    { icon: <Github className="w-5 h-5" />, href: "#" },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 flex justify-center items-center pointer-events-none
          ${isScrolled ? "pt-4" : "pt-0"}`}
      >
        <div
          className={`container mx-auto px-8 h-full flex items-center justify-between transition-all duration-700 pointer-events-auto
            ${
              isScrolled
                ? "h-16 max-w-5xl glass rounded-full border border-white/10 shadow-2xl"
                : "h-20 max-w-[95%] bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 mt-4 shadow-sm"
            }
          `}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <img
              src="/assets/logo_trans.png"
              alt="CodePlay Studios"
              className="h-12 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
            />
            <div className="hidden sm:flex items-center gap-1.5 font-['Outfit']">
              <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent group-hover:bg-gradient-to-l transition-all duration-500">
                CodePlay Studios
              </span>
            </div>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            <div
              className={`flex items-center transition-all duration-500 rounded-full px-2 py-1 ${!isScrolled ? "bg-white/5" : ""}`}
            >
              {links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className={`px-6 py-2 text-base font-semibold transition-colors relative group
                        ${isScrolled ? "text-foreground/80 hover:text-primary" : "text-white/90 hover:text-white"}
                    `}
                >
                  {link.label}
                  <span className="absolute bottom-0 left-6 right-6 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform origin-center" />
                </a>
              ))}
            </div>

            <div className="h-6 w-[1px] bg-white/10 mx-6" />
            <CurrencySwitcher />
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              className="w-12 h-12 rounded-full flex items-center justify-center bg-white/10 backdrop-blur hover:bg-white/20 transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Full-Screen Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-background/95 backdrop-blur-2xl md:hidden overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="h-24 px-6 flex items-center justify-between border-b border-border/50">
              <Link
                href="/"
                className="flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <img
                  src="/assets/logo_trans.png"
                  alt="CodePlay Studios"
                  className="h-12 w-auto object-contain"
                />
                <div className="flex items-center font-['Outfit']">
                  <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-white via-primary to-purple-400 bg-clip-text text-transparent">
                    CodePlay Studios
                  </span>
                </div>
              </Link>
              <div className="flex items-center gap-4">
                <CurrencySwitcher />
                <button
                  className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Links Section */}
            <div className="flex-1 flex flex-col justify-center px-10">
              <div className="space-y-8">
                {links.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                  >
                    <a
                      href={link.href}
                      className="text-5xl font-bold hover:text-primary transition-colors inline-block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {link.label}
                    </a>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="p-10 border-t border-border/50 bg-secondary/30">
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-6">
                Socials
              </p>
              <div className="flex gap-6">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={i}
                    href={social.href}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className="w-12 h-12 rounded-full bg-background flex items-center justify-center text-foreground/70 hover:bg-primary hover:text-white transition-all shadow-sm"
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
