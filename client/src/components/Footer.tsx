import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight, 
  Instagram, 
  Twitter, 
  Linkedin, 
  Github,
  Rocket
} from 'lucide-react';
import { Link } from 'wouter';
import { TOOLS_HREF } from '@/lib/toolsLink';

const socialLinks = [
  { icon: Github, href: '#', label: 'GitHub' },
  { icon: Linkedin, href: '#', label: 'LinkedIn' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="pt-24 pb-12 px-6 border-t border-white/5 bg-black/40 relative overflow-hidden backdrop-blur-xl">
      {/* Scanning Scanner Effect */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="container mx-auto max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 mb-20">
          
          {/* Column 1: Brand & Bio */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-3 group">
                <img src="/assets/logo_trans-128.webp" alt="CodePlay Studios" width={40} height={40} className="h-10 w-10 object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                <span className="text-xl font-bold tracking-tighter uppercase font-['Outfit']">CodePlay Studios</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
              We engine industrial-grade digital ecosystems with a focus on 
              precision, clarity, and "Calm Computing."
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  whileHover={{ y: -3 }}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group"
                >
                  <social.icon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" aria-hidden="true" />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Column 2: Systems */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Software Systems</h3>
            <ul className="space-y-4">
              {[
                { label: "Web Apps", href: "/web-development" },
                { label: "Mobile Apps", href: "/mobile-development" },
                { label: "ERP Suites", href: "/erp-systems" },
                { label: "Unity Game Dev", href: "/unity-game-development" },
                { label: "AI Integration", href: "/ai-development" }
              ].map((link, i) => (
                <li key={i}>
                  <Link href={link.href} className="text-muted-foreground hover:text-white transition-colors text-sm flex items-center group">
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Agency */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Agency</h3>
            <ul className="space-y-4">
              {[
                { label: "Our Story", href: "/about" },
                { label: "Industrial Portfolio", href: "/case-studies" },
                { label: "Insights", href: "/insights" },
                { label: "Editorial Policy", href: "/insights/editorial-policy" },
                { label: "Free Tools", href: TOOLS_HREF },
                { label: "Discovery", href: "/contact" },
                { label: "Privacy Policy", href: "#" }
              ].map((link, i) => (
                <li key={i}>
                  {link.href.startsWith("http") ? (
                    <a href={link.href} className="text-muted-foreground hover:text-white transition-colors text-sm flex items-center group">
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary" />
                      {link.label}
                    </a>
                  ) : (
                    <Link href={link.href} className="text-muted-foreground hover:text-white transition-colors text-sm flex items-center group">
                      <ArrowRight className="w-3 h-3 mr-2 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-primary" />
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-primary">Quick Contact</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors">
                  <MapPin className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-xs uppercase font-mono text-gray-400 mb-1">Operational Center</p>
                  <p className="text-sm font-medium">Panadura, Sri Lanka</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors">
                  <Phone className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-xs uppercase font-mono text-gray-400 mb-1">Inquiry Line</p>
                  <p className="text-sm font-medium">+94 75 445 3334</p>
                </div>
              </div>
              <div className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:border-primary/50 transition-colors">
                  <Mail className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
                </div>
                <div>
                  <p className="text-xs uppercase font-mono text-gray-400 mb-1">Direct Email</p>
                  <p className="text-sm font-medium">info@codeplaystudios.com</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6 text-xs font-mono text-gray-400">
            <p>© {new Date().getFullYear()} CodePlay Studios</p>
            <div className="hidden md:block w-px h-3 bg-white/10" />
            <p>All Rights Reserved</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Rocket className="w-4 h-4 text-primary animate-pulse" />
            <p className="font-mono text-[10px] tracking-[0.4em] uppercase">Smart Software. Real Solutions.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
