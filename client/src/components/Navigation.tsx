import { useState, useEffect } from 'react';
import { motion, useScroll, useMotionValue, useSpring } from 'framer-motion';
import { Menu, X, Moon, Sun } from 'lucide-react';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Services', href: '#services' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const { scrollY } = useScroll();
  
  // Track scroll position for background opacity
  const bgOpacity = useMotionValue(0);
  const bgOpacitySpring = useSpring(bgOpacity, { stiffness: 100, damping: 30 });

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    setTheme(initialTheme);
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      bgOpacity.set(scrolled ? 0.95 : 0);

      const sections = navItems.map(item => item.href.substring(1));
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 150 && rect.bottom >= 150;
        }
        return false;
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const scrollToSection = (href: string) => {
    const element = document.getElementById(href.substring(1));
    element?.scrollIntoView({ behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.nav
      className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md transition-colors duration-300 ${
        isScrolled 
          ? 'bg-background/95 border-b border-border/50 shadow-sm' 
          : 'bg-gradient-to-b from-black/50 to-transparent'
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <motion.div
            className="flex items-center cursor-pointer"
            onClick={scrollToTop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            data-testid="logo-link"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-sm">CP</span>
              </div>
              <span className={`text-lg font-bold hidden sm:inline ${isScrolled ? '' : 'text-white'}`}>CodePlay Studios</span>
            </div>
          </motion.div>

          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <motion.button
                  key={index}
                  onClick={() => scrollToSection(item.href)}
                  className="relative text-sm font-medium transition-colors group"
                  data-testid={`nav-${item.label.toLowerCase()}`}
                  whileHover={{ y: -2 }}
                >
                  <span
                    className={`transition-colors ${
                      isActive 
                        ? 'text-primary' 
                        : isScrolled 
                          ? 'text-foreground hover:text-primary' 
                          : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </span>
                  <motion.div
                    className="absolute -bottom-1 left-0 h-0.5 bg-gradient-to-r from-primary to-accent"
                    initial={{ width: 0 }}
                    animate={{ width: isActive ? '100%' : 0 }}
                    whileHover={{ width: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.button>
              );
            })}
            
            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-colors ${
                isScrolled 
                  ? 'glass border-border hover:border-primary/50' 
                  : 'bg-white/10 border-white/20 hover:bg-white/20'
              }`}
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              data-testid="button-theme-toggle"
            >
              {theme === 'light' ? (
                <Moon className={`h-4 w-4 ${isScrolled ? '' : 'text-white'}`} />
              ) : (
                <Sun className={`h-4 w-4 ${isScrolled ? '' : 'text-white'}`} />
              )}
            </motion.button>
          </div>

          {/* Mobile menu button and theme toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <motion.button
              onClick={toggleTheme}
              className={`p-2 rounded-full border transition-colors ${
                isScrolled 
                  ? 'glass border-border' 
                  : 'bg-white/10 border-white/20'
              }`}
              whileTap={{ scale: 0.9 }}
              data-testid="button-theme-toggle-mobile"
            >
              {theme === 'light' ? (
                <Moon className={`h-5 w-5 ${isScrolled ? '' : 'text-white'}`} />
              ) : (
                <Sun className={`h-5 w-5 ${isScrolled ? '' : 'text-white'}`} />
              )}
            </motion.button>
            <motion.button
              className={`p-2 ${isScrolled ? '' : 'text-white'}`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileTap={{ scale: 0.9 }}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </motion.button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.div
          className="md:hidden bg-background/95 backdrop-blur-lg border-t border-border"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="container mx-auto px-6 py-4 space-y-4">
            {navItems.map((item, index) => {
              const isActive = activeSection === item.href.substring(1);
              return (
                <motion.button
                  key={index}
                  onClick={() => scrollToSection(item.href)}
                  className={`block w-full text-left py-2 transition-colors ${
                    isActive ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                  data-testid={`nav-mobile-${item.label.toLowerCase()}`}
                  whileTap={{ scale: 0.98 }}
                >
                  {item.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
