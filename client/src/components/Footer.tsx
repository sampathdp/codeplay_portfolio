import { SiGithub, SiLinkedin, SiFacebook, SiInstagram } from 'react-icons/si';
import { motion } from 'framer-motion';

const socialLinks = [
  { icon: SiGithub, href: '#', label: 'GitHub' },
  { icon: SiLinkedin, href: '#', label: 'LinkedIn' },
  { icon: SiFacebook, href: '#', label: 'Facebook' },
  { icon: SiInstagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border bg-card/50 relative overflow-hidden">
      <motion.div
        className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <motion.div
            className="text-center md:text-left"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-2xl font-bold mb-2">CodePlay Studios</h3>
            <p className="text-muted-foreground">Coding Your Vision</p>
            <p className="text-sm text-muted-foreground mt-1">Smart Software. Real Solutions.</p>
          </motion.div>

          <motion.div
            className="flex gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <motion.a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center hover-elevate transition-all duration-300 group"
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                  whileHover={{
                    scale: 1.1,
                    rotate: 360,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <Icon className="h-5 w-5" />
                </motion.a>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p>© {new Date().getFullYear()} CodePlay Studios — Coding Your Vision. All rights reserved.</p>
        </motion.div>
      </div>
    </footer>
  );
}
