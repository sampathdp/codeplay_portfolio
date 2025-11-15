import { SiGithub, SiLinkedin, SiFacebook, SiInstagram } from 'react-icons/si';

const socialLinks = [
  { icon: SiGithub, href: '#', label: 'GitHub' },
  { icon: SiLinkedin, href: '#', label: 'LinkedIn' },
  { icon: SiFacebook, href: '#', label: 'Facebook' },
  { icon: SiInstagram, href: '#', label: 'Instagram' },
];

export default function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-border bg-card/50">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-bold mb-2">CodePlay Studios</h3>
            <p className="text-muted-foreground">Coding Your Vision</p>
            <p className="text-sm text-muted-foreground mt-1">Smart Software. Real Solutions.</p>
          </div>

          <div className="flex gap-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="h-10 w-10 rounded-md bg-secondary flex items-center justify-center hover-elevate transition-all duration-300 group"
                  data-testid={`link-social-${social.label.toLowerCase()}`}
                >
                  <Icon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </a>
              );
            })}
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} CodePlay Studios — Coding Your Vision. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
