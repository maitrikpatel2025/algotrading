import React from 'react';
import { TrendingUp, Github, Twitter } from 'lucide-react';

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto border-t border-border bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
      <div className="container py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Forex Dash</span>
            </div>
            <p className="text-sm text-slate-400 max-w-xs">
              Professional forex trading dashboard with real-time data and technical analysis.
            </p>
          </div>
          
          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <a href="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                Home
              </a>
              <a href="/dashboard" className="text-sm text-slate-400 hover:text-white transition-colors">
                Dashboard
              </a>
            </nav>
          </div>
          
          {/* Connect */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white">Connect</h4>
            <div className="flex gap-4">
              <a 
                href="#" 
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                aria-label="GitHub"
              >
                <Github className="h-4 w-4" />
              </a>
              <a 
                href="#" 
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white transition-all"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              © {currentYear} Forex Dash. Made with care.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
              </span>
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
