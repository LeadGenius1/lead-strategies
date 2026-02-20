/**
 * POST /api/websites/generate
 * AI Website Builder: uses inline templates (serverless-safe), calls Anthropic
 * to generate compelling marketing copy, replaces {{placeholders}}, saves to AiBuilderSite
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getSession } from '@/lib/auth-session';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'development-secret-change-in-production';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514';

// ============================================
// INLINE TEMPLATES (serverless-safe, no filesystem)
// ============================================

const INLINE_TEMPLATES = {
  'aether': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{business_name}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');
    :root {
      --accent: {{accent_color}};
      --aether-bg: #0f0f23;
      --aether-primary: #6366f1;
      --aether-secondary: #a855f7;
    }
    body { font-family: 'Inter', sans-serif; }
    .font-display { font-family: 'Space Grotesk', sans-serif; }
    @keyframes float {
      0%, 100% { transform: translateY(0px); }
      50% { transform: translateY(-20px); }
    }
    @keyframes twinkle {
      0%, 100% { opacity: 0.2; }
      50% { opacity: 1; }
    }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .animate-float-delay { animation: float 8s ease-in-out 2s infinite; }
    .star {
      position: absolute;
      width: 2px;
      height: 2px;
      background: white;
      border-radius: 50%;
    }
  </style>
</head>
<body class="bg-[#0f0f23] text-white antialiased">

  <!-- ============================================ -->
  <!-- STARS BACKGROUND -->
  <!-- ============================================ -->
  <div class="fixed inset-0 overflow-hidden pointer-events-none" id="stars-container"></div>

  <!-- Gradient orbs -->
  <div class="fixed inset-0 overflow-hidden pointer-events-none">
    <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-float"></div>
    <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-float-delay"></div>
    <div class="absolute top-3/4 left-2/3 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl animate-float"></div>
  </div>

  <!-- ============================================ -->
  <!-- NAVIGATION -->
  <!-- ============================================ -->
  <nav class="relative z-50 border-b border-white/5">
    <div class="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
      <a href="#" class="font-display text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        {{business_name}}
      </a>
      <div class="hidden md:flex items-center gap-8">
        <a href="#services" class="text-sm text-slate-300 hover:text-white transition-colors">Services</a>
        <a href="#about" class="text-sm text-slate-300 hover:text-white transition-colors">About</a>
        <a href="#contact" class="text-sm text-slate-300 hover:text-white transition-colors">Contact</a>
        <a href="{{cta_destination}}" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40">
          {{cta_primary}}
        </a>
      </div>
    </div>
  </nav>

  <!-- ============================================ -->
  <!-- HERO SECTION -->
  <!-- ============================================ -->
  <section class="relative z-10 max-w-7xl mx-auto px-6 py-24 lg:py-36 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
      <span class="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
      <span class="text-sm text-indigo-300">{{tagline}}</span>
    </div>
    <h1 class="font-display text-5xl md:text-7xl lg:text-8xl font-bold mb-6 leading-tight">
      <span class="bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
        {{hero_title_line1}}
      </span>
      <br>
      <span class="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
        {{hero_title_line2}}
      </span>
    </h1>
    <p class="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed">
      {{hero_description}}
    </p>
    <div class="flex flex-wrap justify-center gap-4">
      <a href="{{cta_destination}}" class="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1">
        {{cta_primary}}
      </a>
      <a href="#about" class="px-8 py-4 border border-slate-600 hover:border-indigo-500 text-slate-300 hover:text-white rounded-xl transition-all duration-300">
        {{cta_secondary}}
      </a>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SERVICES SECTION -->
  <!-- ============================================ -->
  <section id="services" class="relative z-10 max-w-7xl mx-auto px-6 py-20">
    <div class="text-center mb-16">
      <p class="text-sm font-medium text-indigo-400 uppercase tracking-widest mb-3">What We Do</p>
      <h2 class="font-display text-3xl md:text-5xl font-bold">Our Services</h2>
    </div>
    <div class="grid md:grid-cols-3 gap-8">
      <!-- Service 1 -->
      <div class="p-8 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 group">
        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <i data-lucide="cpu" class="w-7 h-7 text-white"></i>
        </div>
        <h3 class="font-display text-xl font-semibold text-white mb-3">{{service1_title}}</h3>
        <p class="text-slate-400 leading-relaxed">{{service1_description}}</p>
      </div>
      <!-- Service 2 -->
      <div class="p-8 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 group">
        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <i data-lucide="zap" class="w-7 h-7 text-white"></i>
        </div>
        <h3 class="font-display text-xl font-semibold text-white mb-3">{{service2_title}}</h3>
        <p class="text-slate-400 leading-relaxed">{{service2_description}}</p>
      </div>
      <!-- Service 3 -->
      <div class="p-8 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 group">
        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <i data-lucide="rocket" class="w-7 h-7 text-white"></i>
        </div>
        <h3 class="font-display text-xl font-semibold text-white mb-3">{{service3_title}}</h3>
        <p class="text-slate-400 leading-relaxed">{{service3_description}}</p>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- STATS BAR -->
  <!-- ============================================ -->
  <section class="relative z-10 border-y border-white/5 py-12">
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div>
        <p class="font-display text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">{{stat1_value}}</p>
        <p class="text-sm text-slate-400 mt-1">Years Experience</p>
      </div>
      <div>
        <p class="font-display text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{{stat2_value}}</p>
        <p class="text-sm text-slate-400 mt-1">Clients Served</p>
      </div>
      <div>
        <p class="font-display text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">99%</p>
        <p class="text-sm text-slate-400 mt-1">Satisfaction Rate</p>
      </div>
      <div>
        <p class="font-display text-4xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">24/7</p>
        <p class="text-sm text-slate-400 mt-1">Support Available</p>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- ABOUT SECTION -->
  <!-- ============================================ -->
  <section id="about" class="relative z-10 max-w-7xl mx-auto px-6 py-24">
    <div class="grid md:grid-cols-2 gap-16 items-center">
      <div>
        <p class="text-sm font-medium text-indigo-400 uppercase tracking-widest mb-3">About Us</p>
        <h2 class="font-display text-3xl md:text-5xl font-bold mb-6">{{about_headline}}</h2>
        <p class="text-slate-300 leading-relaxed text-lg">{{about_description}}</p>
      </div>
      <div class="relative">
        <div class="rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20 p-12 backdrop-blur">
          <div class="space-y-6">
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                <i data-lucide="check-circle" class="w-5 h-5 text-indigo-400"></i>
              </div>
              <span class="text-slate-200">Industry-Leading Solutions</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                <i data-lucide="check-circle" class="w-5 h-5 text-purple-400"></i>
              </div>
              <span class="text-slate-200">Dedicated Expert Team</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <i data-lucide="check-circle" class="w-5 h-5 text-blue-400"></i>
              </div>
              <span class="text-slate-200">Proven Track Record</span>
            </div>
            <div class="flex items-center gap-4">
              <div class="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center">
                <i data-lucide="check-circle" class="w-5 h-5 text-pink-400"></i>
              </div>
              <span class="text-slate-200">Results-Driven Approach</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- CTA SECTION -->
  <!-- ============================================ -->
  <section class="relative z-10 py-24">
    <div class="max-w-4xl mx-auto px-6 text-center">
      <div class="rounded-3xl bg-gradient-to-br from-indigo-600/20 via-purple-600/20 to-pink-600/20 border border-indigo-500/20 backdrop-blur p-16">
        <h2 class="font-display text-3xl md:text-5xl font-bold mb-6">Ready to Get Started?</h2>
        <p class="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
          Take the first step toward transforming your business. Let's build something extraordinary together.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="{{cta_destination}}" class="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:-translate-y-1">
            {{cta_primary}}
          </a>
          <a href="mailto:{{contact_email}}" class="px-10 py-4 border border-slate-600 hover:border-indigo-500 text-slate-300 hover:text-white rounded-xl transition-all duration-300">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- CONTACT SECTION -->
  <!-- ============================================ -->
  <section id="contact" class="relative z-10 max-w-7xl mx-auto px-6 py-24">
    <div class="text-center mb-16">
      <p class="text-sm font-medium text-indigo-400 uppercase tracking-widest mb-3">Get In Touch</p>
      <h2 class="font-display text-3xl md:text-5xl font-bold">Contact Us</h2>
    </div>
    <div class="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
      <div class="p-8 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 text-center">
        <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mx-auto mb-4">
          <i data-lucide="mail" class="w-6 h-6 text-indigo-400"></i>
        </div>
        <p class="text-sm text-slate-400 mb-1">Email</p>
        <a href="mailto:{{contact_email}}" class="text-white hover:text-indigo-400 transition-colors">{{contact_email}}</a>
      </div>
      <div class="p-8 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 text-center">
        <div class="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
          <i data-lucide="phone" class="w-6 h-6 text-purple-400"></i>
        </div>
        <p class="text-sm text-slate-400 mb-1">Phone</p>
        <a href="tel:{{contact_phone}}" class="text-white hover:text-purple-400 transition-colors">{{contact_phone}}</a>
      </div>
      <div class="p-8 rounded-2xl bg-slate-800/50 backdrop-blur border border-slate-700/50 text-center">
        <div class="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
          <i data-lucide="map-pin" class="w-6 h-6 text-blue-400"></i>
        </div>
        <p class="text-sm text-slate-400 mb-1">Location</p>
        <p class="text-white">{{contact_address}}</p>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- FOOTER -->
  <!-- ============================================ -->
  <footer class="relative z-10 border-t border-white/5 py-12">
    <div class="max-w-7xl mx-auto px-6">
      <div class="flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <a href="#" class="font-display text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            {{business_name}}
          </a>
          <p class="text-sm text-slate-500 mt-1">{{tagline}}</p>
        </div>
        <div class="flex items-center gap-6">
          <a href="{{social_link1}}" target="_blank" class="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center hover:border-indigo-500/50 transition-colors">
            <i data-lucide="linkedin" class="w-4 h-4 text-slate-400"></i>
          </a>
          <a href="{{social_link2}}" target="_blank" class="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center hover:border-indigo-500/50 transition-colors">
            <i data-lucide="facebook" class="w-4 h-4 text-slate-400"></i>
          </a>
          <a href="{{social_link3}}" target="_blank" class="w-10 h-10 rounded-lg bg-slate-800/50 border border-slate-700/50 flex items-center justify-center hover:border-indigo-500/50 transition-colors">
            <i data-lucide="instagram" class="w-4 h-4 text-slate-400"></i>
          </a>
        </div>
      </div>
      <div class="mt-8 pt-8 border-t border-white/5 text-center">
        <p class="text-sm text-slate-500">&copy; {{current_year}} {{business_name}}. All rights reserved.</p>
      </div>
    </div>
  </footer>

  <!-- ============================================ -->
  <!-- SCRIPTS -->
  <!-- ============================================ -->
  <script>
    // Initialize Lucide icons
    lucide.createIcons();

    // Generate animated stars
    (function() {
      const container = document.getElementById('stars-container');
      const count = 80;
      for (let i = 0; i < count; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.animationName = 'twinkle';
        star.style.animationDuration = (2 + Math.random() * 4) + 's';
        star.style.animationDelay = Math.random() * 4 + 's';
        star.style.animationIterationCount = 'infinite';
        container.appendChild(star);
      }
    })();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  </script>
</body>
</html>
`,

  'uslu': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{business_name}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent: {{accent_color}};
      --bronze: #C5A065;
      --bronze-light: #D4B896;
      --dark: #0D0D0D;
      --dark-secondary: #1A1A1A;
    }
    body { font-family: 'Inter', sans-serif; }
    .font-serif { font-family: 'Cormorant Garamond', serif; }
    @keyframes marquee {
      0% { transform: translateX(0); }
      100% { transform: translateX(-50%); }
    }
    .animate-marquee { animation: marquee 25s linear infinite; }
    @keyframes fade-up {
      from { opacity: 0; transform: translateY(30px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-up { animation: fade-up 0.8s ease-out forwards; }
    .fade-up-delay-1 { animation-delay: 0.2s; opacity: 0; }
    .fade-up-delay-2 { animation-delay: 0.4s; opacity: 0; }
    .fade-up-delay-3 { animation-delay: 0.6s; opacity: 0; }
  </style>
</head>
<body class="bg-[#0D0D0D] text-white antialiased">

  <!-- ============================================ -->
  <!-- NAVIGATION -->
  <!-- ============================================ -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-[#0D0D0D]/80 backdrop-blur-md border-b border-white/5">
    <div class="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
      <a href="#" class="font-serif text-2xl font-medium tracking-tight">{{business_name}}</a>
      <div class="hidden md:flex items-center gap-10">
        <a href="#services" class="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-[#C5A065] transition-colors">Services</a>
        <a href="#about" class="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-[#C5A065] transition-colors">About</a>
        <a href="#contact" class="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-[#C5A065] transition-colors">Contact</a>
        <a href="{{cta_destination}}" class="text-xs tracking-[0.2em] uppercase border-b border-[#C5A065] pb-1 text-[#C5A065] hover:text-white hover:border-white transition-colors">
          {{cta_primary}}
        </a>
      </div>
    </div>
  </nav>

  <!-- ============================================ -->
  <!-- HERO SECTION -->
  <!-- ============================================ -->
  <section class="relative min-h-screen flex items-center pt-20">
    <!-- Background gradient overlay -->
    <div class="absolute inset-0 bg-gradient-to-br from-[#0D0D0D] via-[#0D0D0D] to-[#1A1A1A]"></div>
    <!-- Decorative bronze line -->
    <div class="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C5A065]/30 to-transparent"></div>

    <div class="relative z-10 max-w-7xl mx-auto px-6 w-full">
      <p class="text-sm tracking-[0.3em] text-[#C5A065] uppercase mb-8 fade-up">{{tagline}}</p>
      <h1 class="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-[1.05] mb-8 fade-up fade-up-delay-1">
        {{hero_title_line1}}<br>
        <span class="text-[#C5A065]">{{hero_title_line2}}</span>
      </h1>
      <p class="text-lg text-gray-400 max-w-2xl mb-12 leading-relaxed fade-up fade-up-delay-2">
        {{hero_description}}
      </p>
      <div class="flex flex-wrap gap-6 fade-up fade-up-delay-3">
        <a href="{{cta_destination}}" class="inline-flex items-center gap-3 text-sm tracking-[0.15em] uppercase border-b-2 border-[#C5A065] pb-2 text-white hover:text-[#C5A065] transition-colors">
          {{cta_primary}}
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
        <a href="#about" class="inline-flex items-center gap-3 text-sm tracking-[0.15em] uppercase border-b border-gray-600 pb-2 text-gray-400 hover:text-white hover:border-white transition-colors">
          {{cta_secondary}}
        </a>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- MARQUEE STRIP -->
  <!-- ============================================ -->
  <div class="border-y border-[#333] py-5 overflow-hidden">
    <div class="flex animate-marquee whitespace-nowrap">
      <span class="font-serif text-3xl text-[#C5A065] mx-8">{{service1_title}}</span>
      <span class="font-serif text-3xl text-white/20 mx-8">&bull;</span>
      <span class="font-serif text-3xl text-white/80 mx-8">{{service2_title}}</span>
      <span class="font-serif text-3xl text-white/20 mx-8">&bull;</span>
      <span class="font-serif text-3xl text-[#C5A065] mx-8">{{service3_title}}</span>
      <span class="font-serif text-3xl text-white/20 mx-8">&bull;</span>
      <span class="font-serif text-3xl text-white/80 mx-8">{{business_name}}</span>
      <span class="font-serif text-3xl text-white/20 mx-8">&bull;</span>
      <!-- Duplicate for seamless loop -->
      <span class="font-serif text-3xl text-[#C5A065] mx-8">{{service1_title}}</span>
      <span class="font-serif text-3xl text-white/20 mx-8">&bull;</span>
      <span class="font-serif text-3xl text-white/80 mx-8">{{service2_title}}</span>
      <span class="font-serif text-3xl text-white/20 mx-8">&bull;</span>
      <span class="font-serif text-3xl text-[#C5A065] mx-8">{{service3_title}}</span>
      <span class="font-serif text-3xl text-white/20 mx-8">&bull;</span>
      <span class="font-serif text-3xl text-white/80 mx-8">{{business_name}}</span>
      <span class="font-serif text-3xl text-white/20 mx-8">&bull;</span>
    </div>
  </div>

  <!-- ============================================ -->
  <!-- SERVICES SECTION -->
  <!-- ============================================ -->
  <section id="services" class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16">
        <p class="text-sm tracking-[0.3em] text-[#C5A065] uppercase mb-4">What We Offer</p>
        <h2 class="font-serif text-4xl md:text-5xl font-medium">Our Services</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-px bg-[#333]">
        <!-- Service 1 -->
        <div class="bg-[#0D0D0D] p-12 group hover:bg-[#1A1A1A] transition-colors duration-500">
          <span class="text-[#C5A065] text-6xl font-serif">01</span>
          <h3 class="font-serif text-2xl mt-6 mb-4">{{service1_title}}</h3>
          <p class="text-gray-400 text-sm leading-relaxed">{{service1_description}}</p>
          <div class="mt-8 w-8 h-px bg-[#C5A065] group-hover:w-16 transition-all duration-500"></div>
        </div>
        <!-- Service 2 -->
        <div class="bg-[#0D0D0D] p-12 group hover:bg-[#1A1A1A] transition-colors duration-500">
          <span class="text-[#C5A065] text-6xl font-serif">02</span>
          <h3 class="font-serif text-2xl mt-6 mb-4">{{service2_title}}</h3>
          <p class="text-gray-400 text-sm leading-relaxed">{{service2_description}}</p>
          <div class="mt-8 w-8 h-px bg-[#C5A065] group-hover:w-16 transition-all duration-500"></div>
        </div>
        <!-- Service 3 -->
        <div class="bg-[#0D0D0D] p-12 group hover:bg-[#1A1A1A] transition-colors duration-500">
          <span class="text-[#C5A065] text-6xl font-serif">03</span>
          <h3 class="font-serif text-2xl mt-6 mb-4">{{service3_title}}</h3>
          <p class="text-gray-400 text-sm leading-relaxed">{{service3_description}}</p>
          <div class="mt-8 w-8 h-px bg-[#C5A065] group-hover:w-16 transition-all duration-500"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- STATS SECTION -->
  <!-- ============================================ -->
  <section class="py-16 border-y border-[#333]">
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div class="text-center">
        <p class="font-serif text-5xl text-[#C5A065]">{{stat1_value}}</p>
        <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mt-3">Years Experience</p>
      </div>
      <div class="text-center">
        <p class="font-serif text-5xl text-white">{{stat2_value}}</p>
        <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mt-3">Clients Served</p>
      </div>
      <div class="text-center">
        <p class="font-serif text-5xl text-[#C5A065]">100%</p>
        <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mt-3">Dedication</p>
      </div>
      <div class="text-center">
        <p class="font-serif text-5xl text-white">24/7</p>
        <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mt-3">Availability</p>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- ABOUT SECTION -->
  <!-- ============================================ -->
  <section id="about" class="py-24 px-6">
    <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
      <div>
        <p class="text-sm tracking-[0.3em] text-[#C5A065] uppercase mb-4">Our Story</p>
        <h2 class="font-serif text-4xl md:text-5xl font-medium mb-8 leading-tight">{{about_headline}}</h2>
        <p class="text-gray-400 leading-relaxed text-lg">{{about_description}}</p>
        <div class="mt-10">
          <a href="{{cta_destination}}" class="inline-flex items-center gap-3 text-sm tracking-[0.15em] uppercase border-b-2 border-[#C5A065] pb-2 text-white hover:text-[#C5A065] transition-colors">
            Learn More
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
        </div>
      </div>
      <div class="relative">
        <div class="aspect-[4/5] bg-[#1A1A1A] rounded-sm overflow-hidden border border-[#333]">
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center p-12">
              <div class="w-20 h-20 mx-auto mb-8 border-2 border-[#C5A065] rounded-full flex items-center justify-center">
                <i data-lucide="award" class="w-8 h-8 text-[#C5A065]"></i>
              </div>
              <p class="font-serif text-3xl text-white mb-4">Excellence</p>
              <p class="text-gray-500 text-sm leading-relaxed">Committed to delivering the highest standard of quality in everything we do.</p>
            </div>
          </div>
        </div>
        <!-- Decorative corner lines -->
        <div class="absolute -top-3 -left-3 w-12 h-12 border-t-2 border-l-2 border-[#C5A065]"></div>
        <div class="absolute -bottom-3 -right-3 w-12 h-12 border-b-2 border-r-2 border-[#C5A065]"></div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- CTA SECTION -->
  <!-- ============================================ -->
  <section class="py-24 px-6 bg-[#1A1A1A]">
    <div class="max-w-4xl mx-auto text-center">
      <p class="text-sm tracking-[0.3em] text-[#C5A065] uppercase mb-6">Begin Your Journey</p>
      <h2 class="font-serif text-4xl md:text-6xl font-medium mb-8">Ready to Elevate<br>Your Vision?</h2>
      <p class="text-gray-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
        Let us help you create something truly exceptional. Reach out today to start a conversation.
      </p>
      <div class="flex flex-wrap justify-center gap-6">
        <a href="{{cta_destination}}" class="px-12 py-4 bg-[#C5A065] text-[#0D0D0D] font-medium tracking-wider uppercase text-sm hover:bg-[#D4B896] transition-colors">
          {{cta_primary}}
        </a>
        <a href="mailto:{{contact_email}}" class="px-12 py-4 border-2 border-[#C5A065] text-[#C5A065] tracking-wider uppercase text-sm hover:bg-[#C5A065] hover:text-[#0D0D0D] transition-all">
          Contact Us
        </a>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- CONTACT SECTION -->
  <!-- ============================================ -->
  <section id="contact" class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16">
        <p class="text-sm tracking-[0.3em] text-[#C5A065] uppercase mb-4">Get In Touch</p>
        <h2 class="font-serif text-4xl md:text-5xl font-medium">Contact</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-px bg-[#333]">
        <div class="bg-[#0D0D0D] p-12 group hover:bg-[#1A1A1A] transition-colors">
          <i data-lucide="mail" class="w-6 h-6 text-[#C5A065] mb-6"></i>
          <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">Email</p>
          <a href="mailto:{{contact_email}}" class="font-serif text-xl text-white hover:text-[#C5A065] transition-colors">{{contact_email}}</a>
        </div>
        <div class="bg-[#0D0D0D] p-12 group hover:bg-[#1A1A1A] transition-colors">
          <i data-lucide="phone" class="w-6 h-6 text-[#C5A065] mb-6"></i>
          <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">Phone</p>
          <a href="tel:{{contact_phone}}" class="font-serif text-xl text-white hover:text-[#C5A065] transition-colors">{{contact_phone}}</a>
        </div>
        <div class="bg-[#0D0D0D] p-12 group hover:bg-[#1A1A1A] transition-colors">
          <i data-lucide="map-pin" class="w-6 h-6 text-[#C5A065] mb-6"></i>
          <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mb-2">Location</p>
          <p class="font-serif text-xl text-white">{{contact_address}}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- FOOTER -->
  <!-- ============================================ -->
  <footer class="border-t border-[#333] py-12 px-6">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div>
        <a href="#" class="font-serif text-xl font-medium">{{business_name}}</a>
        <p class="text-xs text-gray-500 mt-1 tracking-widest uppercase">{{tagline}}</p>
      </div>
      <div class="flex items-center gap-6">
        <a href="{{social_link1}}" target="_blank" class="w-10 h-10 border border-[#333] flex items-center justify-center hover:border-[#C5A065] transition-colors">
          <i data-lucide="linkedin" class="w-4 h-4 text-gray-400"></i>
        </a>
        <a href="{{social_link2}}" target="_blank" class="w-10 h-10 border border-[#333] flex items-center justify-center hover:border-[#C5A065] transition-colors">
          <i data-lucide="facebook" class="w-4 h-4 text-gray-400"></i>
        </a>
        <a href="{{social_link3}}" target="_blank" class="w-10 h-10 border border-[#333] flex items-center justify-center hover:border-[#C5A065] transition-colors">
          <i data-lucide="instagram" class="w-4 h-4 text-gray-400"></i>
        </a>
      </div>
    </div>
    <div class="max-w-7xl mx-auto mt-10 pt-8 border-t border-[#333] text-center">
      <p class="text-xs text-gray-600 tracking-widest">&copy; {{current_year}} {{business_name}}. All rights reserved.</p>
    </div>
  </footer>

  <!-- ============================================ -->
  <!-- SCRIPTS -->
  <!-- ============================================ -->
  <script>
    // Initialize Lucide icons
    lucide.createIcons();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  </script>
</body>
</html>
`,

  'vitalis': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{business_name}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js"></script>
  <link href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,500;6..72,600&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent: {{accent_color}};
      --bone: #F3F1EB;
      --forest: #1A2E22;
      --sage: #4A6741;
      --terracotta: #C17B5D;
    }
    body { font-family: 'Inter', sans-serif; }
    .font-serif { font-family: 'Newsreader', serif; }
  </style>
</head>
<body class="bg-[#F3F1EB] text-[#1A2E22] antialiased">

  <!-- ============================================ -->
  <!-- NAVIGATION -->
  <!-- ============================================ -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-[#F3F1EB]/80 backdrop-blur-md border-b border-[#1A2E22]/5">
    <div class="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
      <a href="#" class="font-serif text-2xl font-medium">{{business_name}}</a>
      <div class="hidden md:flex items-center gap-10">
        <a href="#services" class="text-sm text-[#1A2E22]/60 hover:text-[#4A6741] transition-colors">Services</a>
        <a href="#about" class="text-sm text-[#1A2E22]/60 hover:text-[#4A6741] transition-colors">About</a>
        <a href="#contact" class="text-sm text-[#1A2E22]/60 hover:text-[#4A6741] transition-colors">Contact</a>
        <a href="{{cta_destination}}" class="px-5 py-2.5 bg-[#1A2E22] text-[#F3F1EB] text-sm rounded-full hover:bg-[#4A6741] transition-colors">
          {{cta_primary}}
        </a>
      </div>
    </div>
  </nav>

  <!-- ============================================ -->
  <!-- HERO SECTION -->
  <!-- ============================================ -->
  <section class="min-h-screen flex items-center px-6 pt-20">
    <div class="max-w-6xl mx-auto w-full">
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-8">
          <div class="w-3 h-3 rounded-full bg-[#4A6741] animate-pulse"></div>
          <span class="text-sm text-[#1A2E22]/60 tracking-wide">{{tagline}}</span>
        </div>
        <h1 class="font-serif text-5xl md:text-7xl lg:text-8xl leading-[1.05] mb-8">
          <span class="reveal-word">{{hero_title_line1}}</span><br>
          <span class="reveal-word text-[#4A6741]">{{hero_title_line2}}</span>
        </h1>
        <p class="text-lg text-[#1A2E22]/60 max-w-xl leading-relaxed reveal-word">
          {{hero_description}}
        </p>
      </div>
      <div class="flex flex-wrap gap-4 mt-12 reveal-word">
        <a href="{{cta_destination}}" class="px-8 py-4 bg-[#1A2E22] text-[#F3F1EB] rounded-full hover:bg-[#4A6741] transition-colors text-sm font-medium">
          {{cta_primary}}
        </a>
        <a href="#about" class="px-8 py-4 border border-[#1A2E22]/20 text-[#1A2E22] rounded-full hover:border-[#4A6741] hover:text-[#4A6741] transition-colors text-sm font-medium">
          {{cta_secondary}}
        </a>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- TRUST INDICATORS -->
  <!-- ============================================ -->
  <section class="py-8 border-y border-[#1A2E22]/10">
    <div class="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-12">
      <div class="flex items-center gap-3">
        <div class="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
        <span class="text-sm">Trusted by {{stat2_value}} clients</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="font-serif text-2xl text-[#4A6741]">{{stat1_value}}</span>
        <span class="text-sm">Years of Experience</span>
      </div>
      <div class="flex items-center gap-3">
        <i data-lucide="shield-check" class="w-5 h-5 text-[#4A6741]"></i>
        <span class="text-sm">Certified Professionals</span>
      </div>
      <div class="flex items-center gap-3">
        <i data-lucide="heart" class="w-5 h-5 text-[#C17B5D]"></i>
        <span class="text-sm">100% Satisfaction</span>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SERVICES BENTO GRID -->
  <!-- ============================================ -->
  <section id="services" class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16">
        <p class="text-sm font-medium text-[#4A6741] uppercase tracking-widest mb-3">What We Offer</p>
        <h2 class="font-serif text-4xl md:text-5xl">Our Services</h2>
      </div>
      <div class="grid grid-cols-12 gap-4">
        <!-- Service 1 — large card -->
        <div class="col-span-12 md:col-span-8 rounded-3xl bg-[#1A2E22] p-10 md:p-14 flex flex-col justify-between min-h-[360px] scroll-reveal">
          <div>
            <span class="text-[#4A6741] text-sm uppercase tracking-widest">01</span>
          </div>
          <div>
            <h3 class="font-serif text-3xl md:text-4xl text-white mb-4">{{service1_title}}</h3>
            <p class="text-white/60 max-w-lg leading-relaxed">{{service1_description}}</p>
          </div>
        </div>
        <!-- Service 2 — tall card -->
        <div class="col-span-12 md:col-span-4 rounded-3xl bg-[#4A6741] p-10 flex flex-col justify-between min-h-[360px] scroll-reveal">
          <div>
            <span class="text-white/40 text-sm uppercase tracking-widest">02</span>
          </div>
          <div>
            <h3 class="font-serif text-2xl text-white mb-4">{{service2_title}}</h3>
            <p class="text-white/60 leading-relaxed">{{service2_description}}</p>
          </div>
        </div>
        <!-- Service 3 — wide card -->
        <div class="col-span-12 rounded-3xl border border-[#1A2E22]/10 p-10 md:p-14 flex flex-col md:flex-row md:items-center md:justify-between gap-8 min-h-[200px] scroll-reveal">
          <div>
            <span class="text-[#C17B5D] text-sm uppercase tracking-widest">03</span>
            <h3 class="font-serif text-2xl md:text-3xl mt-3">{{service3_title}}</h3>
          </div>
          <p class="text-[#1A2E22]/60 max-w-md leading-relaxed">{{service3_description}}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- ABOUT SECTION -->
  <!-- ============================================ -->
  <section id="about" class="py-24 px-6">
    <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
      <div class="scroll-reveal">
        <p class="text-sm font-medium text-[#4A6741] uppercase tracking-widest mb-3">Our Story</p>
        <h2 class="font-serif text-4xl md:text-5xl mb-8 leading-tight">{{about_headline}}</h2>
        <p class="text-[#1A2E22]/60 leading-relaxed text-lg mb-8">{{about_description}}</p>
        <a href="{{cta_destination}}" class="inline-flex items-center gap-2 text-sm font-medium text-[#4A6741] hover:text-[#1A2E22] transition-colors">
          Learn more about us
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </a>
      </div>
      <div class="scroll-reveal">
        <div class="rounded-3xl bg-[#1A2E22] p-10 md:p-14">
          <div class="space-y-8">
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-[#4A6741]/30 flex items-center justify-center flex-shrink-0 mt-1">
                <i data-lucide="leaf" class="w-5 h-5 text-[#4A6741]"></i>
              </div>
              <div>
                <h4 class="text-white font-medium mb-1">Natural Approach</h4>
                <p class="text-white/50 text-sm leading-relaxed">We believe in sustainable, organic methods that deliver lasting results.</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-[#C17B5D]/30 flex items-center justify-center flex-shrink-0 mt-1">
                <i data-lucide="users" class="w-5 h-5 text-[#C17B5D]"></i>
              </div>
              <div>
                <h4 class="text-white font-medium mb-1">Community Focused</h4>
                <p class="text-white/50 text-sm leading-relaxed">Building meaningful connections with every client we serve.</p>
              </div>
            </div>
            <div class="flex items-start gap-4">
              <div class="w-10 h-10 rounded-full bg-[#4A6741]/30 flex items-center justify-center flex-shrink-0 mt-1">
                <i data-lucide="sparkles" class="w-5 h-5 text-[#4A6741]"></i>
              </div>
              <div>
                <h4 class="text-white font-medium mb-1">Quality First</h4>
                <p class="text-white/50 text-sm leading-relaxed">Every detail matters — from the first interaction to the final outcome.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- CTA SECTION -->
  <!-- ============================================ -->
  <section class="py-24 px-6">
    <div class="max-w-4xl mx-auto text-center scroll-reveal">
      <div class="rounded-3xl bg-[#1A2E22] p-14 md:p-20">
        <p class="text-sm text-[#4A6741] uppercase tracking-widest mb-6">Take The Next Step</p>
        <h2 class="font-serif text-3xl md:text-5xl text-white mb-6 leading-tight">Ready to Start<br>Your Journey?</h2>
        <p class="text-white/50 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
          We'd love to hear from you. Let's work together to achieve something beautiful.
        </p>
        <div class="flex flex-wrap justify-center gap-4">
          <a href="{{cta_destination}}" class="px-8 py-4 bg-[#F3F1EB] text-[#1A2E22] rounded-full hover:bg-white transition-colors text-sm font-medium">
            {{cta_primary}}
          </a>
          <a href="mailto:{{contact_email}}" class="px-8 py-4 border border-white/20 text-white rounded-full hover:bg-white/10 transition-colors text-sm font-medium">
            {{cta_secondary}}
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- CONTACT SECTION -->
  <!-- ============================================ -->
  <section id="contact" class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16">
        <p class="text-sm font-medium text-[#4A6741] uppercase tracking-widest mb-3">Reach Out</p>
        <h2 class="font-serif text-4xl md:text-5xl">Get In Touch</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-6">
        <div class="p-10 rounded-3xl border border-[#1A2E22]/10 hover:border-[#4A6741]/30 transition-colors scroll-reveal">
          <div class="w-12 h-12 rounded-full bg-[#4A6741]/10 flex items-center justify-center mb-6">
            <i data-lucide="mail" class="w-5 h-5 text-[#4A6741]"></i>
          </div>
          <p class="text-sm text-[#1A2E22]/40 mb-2">Email</p>
          <a href="mailto:{{contact_email}}" class="font-serif text-xl hover:text-[#4A6741] transition-colors">{{contact_email}}</a>
        </div>
        <div class="p-10 rounded-3xl border border-[#1A2E22]/10 hover:border-[#4A6741]/30 transition-colors scroll-reveal">
          <div class="w-12 h-12 rounded-full bg-[#C17B5D]/10 flex items-center justify-center mb-6">
            <i data-lucide="phone" class="w-5 h-5 text-[#C17B5D]"></i>
          </div>
          <p class="text-sm text-[#1A2E22]/40 mb-2">Phone</p>
          <a href="tel:{{contact_phone}}" class="font-serif text-xl hover:text-[#C17B5D] transition-colors">{{contact_phone}}</a>
        </div>
        <div class="p-10 rounded-3xl border border-[#1A2E22]/10 hover:border-[#4A6741]/30 transition-colors scroll-reveal">
          <div class="w-12 h-12 rounded-full bg-[#4A6741]/10 flex items-center justify-center mb-6">
            <i data-lucide="map-pin" class="w-5 h-5 text-[#4A6741]"></i>
          </div>
          <p class="text-sm text-[#1A2E22]/40 mb-2">Location</p>
          <p class="font-serif text-xl">{{contact_address}}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- FOOTER -->
  <!-- ============================================ -->
  <footer class="border-t border-[#1A2E22]/10 py-12 px-6">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div>
        <a href="#" class="font-serif text-xl font-medium">{{business_name}}</a>
        <p class="text-sm text-[#1A2E22]/40 mt-1">{{tagline}}</p>
      </div>
      <div class="flex items-center gap-4">
        <a href="{{social_link1}}" target="_blank" class="w-10 h-10 rounded-full border border-[#1A2E22]/10 flex items-center justify-center hover:border-[#4A6741] transition-colors">
          <i data-lucide="linkedin" class="w-4 h-4 text-[#1A2E22]/40"></i>
        </a>
        <a href="{{social_link2}}" target="_blank" class="w-10 h-10 rounded-full border border-[#1A2E22]/10 flex items-center justify-center hover:border-[#4A6741] transition-colors">
          <i data-lucide="facebook" class="w-4 h-4 text-[#1A2E22]/40"></i>
        </a>
        <a href="{{social_link3}}" target="_blank" class="w-10 h-10 rounded-full border border-[#1A2E22]/10 flex items-center justify-center hover:border-[#4A6741] transition-colors">
          <i data-lucide="instagram" class="w-4 h-4 text-[#1A2E22]/40"></i>
        </a>
      </div>
    </div>
    <div class="max-w-7xl mx-auto mt-10 pt-8 border-t border-[#1A2E22]/10 text-center">
      <p class="text-sm text-[#1A2E22]/30">&copy; {{current_year}} {{business_name}}. All rights reserved.</p>
    </div>
  </footer>

  <!-- ============================================ -->
  <!-- SCRIPTS -->
  <!-- ============================================ -->
  <script>
    // Initialize Lucide icons
    lucide.createIcons();

    // GSAP scroll animations
    gsap.registerPlugin(ScrollTrigger);

    // Hero word reveal
    gsap.from('.reveal-word', {
      opacity: 0,
      y: 50,
      duration: 0.8,
      stagger: 0.15,
      ease: 'power3.out'
    });

    // Scroll-triggered reveals
    gsap.utils.toArray('.scroll-reveal').forEach(el => {
      gsap.from(el, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  </script>
</body>
</html>
`,

  'sourcing-sense': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{business_name}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent: {{accent_color}};
      --gold: #d4af37;
      --charcoal: #1a1a1a;
      --marble: #f5f5f5;
    }
    body { font-family: 'Inter', sans-serif; }
    .font-display { font-family: 'Cinzel', serif; }
    @keyframes spin-slow {
      from { transform: translate(-50%, -50%) rotate(0deg); }
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }
    .animate-spin-slow { animation: spin-slow 60s linear infinite; }
    .animate-spin-slow-reverse { animation: spin-slow 90s linear infinite reverse; }
  </style>
</head>
<body class="bg-[#1a1a1a] text-white antialiased">

  <!-- ============================================ -->
  <!-- NAVIGATION -->
  <!-- ============================================ -->
  <nav class="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a]/80 backdrop-blur-md border-b border-white/5">
    <div class="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">
      <a href="#" class="font-display text-lg tracking-wider">{{business_name}}</a>
      <div class="hidden md:flex items-center gap-10">
        <a href="#services" class="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-[#d4af37] transition-colors">Services</a>
        <a href="#process" class="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-[#d4af37] transition-colors">Process</a>
        <a href="#about" class="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-[#d4af37] transition-colors">About</a>
        <a href="#contact" class="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-[#d4af37] transition-colors">Contact</a>
        <a href="{{cta_destination}}" class="px-6 py-2.5 border-2 border-[#d4af37] text-[#d4af37] font-display tracking-wider uppercase text-xs hover:bg-[#d4af37] hover:text-black transition-all">
          {{cta_primary}}
        </a>
      </div>
    </div>
  </nav>

  <!-- ============================================ -->
  <!-- HERO SECTION -->
  <!-- ============================================ -->
  <section class="relative min-h-screen flex items-center overflow-hidden pt-20">
    <!-- Background circles -->
    <div class="absolute inset-0">
      <div class="absolute top-1/2 left-1/2 w-[500px] h-[500px] border border-[#d4af37]/15 rounded-full animate-spin-slow"></div>
      <div class="absolute top-1/2 left-1/2 w-[700px] h-[700px] border border-[#d4af37]/10 rounded-full animate-spin-slow-reverse"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] border border-[#d4af37]/5 rounded-full"></div>
    </div>
    <!-- Radial gradient -->
    <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(212,175,55,0.05)_0%,_transparent_70%)]"></div>

    <div class="relative z-10 max-w-5xl mx-auto px-6 text-center">
      <p class="text-sm tracking-[0.4em] text-[#d4af37] uppercase mb-8">{{tagline}}</p>
      <h1 class="font-display text-4xl md:text-6xl lg:text-7xl leading-tight mb-8">
        {{hero_title_line1}}<br>
        <span class="text-[#d4af37]">{{hero_title_line2}}</span>
      </h1>
      <p class="text-lg text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
        {{hero_description}}
      </p>
      <div class="flex flex-wrap justify-center gap-6">
        <a href="{{cta_destination}}" class="px-10 py-4 border-2 border-[#d4af37] text-[#d4af37] font-display tracking-wider uppercase text-sm hover:bg-[#d4af37] hover:text-black transition-all">
          {{cta_primary}}
        </a>
        <a href="#about" class="px-10 py-4 border border-gray-700 text-gray-400 font-display tracking-wider uppercase text-sm hover:border-white hover:text-white transition-all">
          {{cta_secondary}}
        </a>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- STATS SECTION -->
  <!-- ============================================ -->
  <section class="py-16 border-y border-gray-800">
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
      <div>
        <p class="font-display text-4xl text-[#d4af37]">{{stat1_value}}</p>
        <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mt-3">Years Experience</p>
      </div>
      <div>
        <p class="font-display text-4xl text-white">{{stat2_value}}</p>
        <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mt-3">Clients Served</p>
      </div>
      <div>
        <p class="font-display text-4xl text-[#d4af37]">100%</p>
        <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mt-3">Commitment</p>
      </div>
      <div>
        <p class="font-display text-4xl text-white">24/7</p>
        <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mt-3">Support</p>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SERVICES SECTION -->
  <!-- ============================================ -->
  <section id="services" class="py-24 px-6">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-sm tracking-[0.4em] text-[#d4af37] uppercase mb-4">Our Expertise</p>
        <h2 class="font-display text-3xl md:text-5xl">Services</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <!-- Service 1 -->
        <div class="border border-gray-800 p-10 hover:border-[#d4af37]/50 transition-colors group">
          <div class="w-12 h-12 border border-[#d4af37]/30 flex items-center justify-center mb-8 group-hover:border-[#d4af37] transition-colors">
            <i data-lucide="briefcase" class="w-5 h-5 text-[#d4af37]"></i>
          </div>
          <h3 class="font-display text-xl mb-4">{{service1_title}}</h3>
          <p class="text-gray-400 text-sm leading-relaxed mb-6">{{service1_description}}</p>
          <div class="w-8 h-px bg-[#d4af37]/30 group-hover:w-full group-hover:bg-[#d4af37] transition-all duration-700"></div>
        </div>
        <!-- Service 2 -->
        <div class="border border-gray-800 p-10 hover:border-[#d4af37]/50 transition-colors group">
          <div class="w-12 h-12 border border-[#d4af37]/30 flex items-center justify-center mb-8 group-hover:border-[#d4af37] transition-colors">
            <i data-lucide="target" class="w-5 h-5 text-[#d4af37]"></i>
          </div>
          <h3 class="font-display text-xl mb-4">{{service2_title}}</h3>
          <p class="text-gray-400 text-sm leading-relaxed mb-6">{{service2_description}}</p>
          <div class="w-8 h-px bg-[#d4af37]/30 group-hover:w-full group-hover:bg-[#d4af37] transition-all duration-700"></div>
        </div>
        <!-- Service 3 -->
        <div class="border border-gray-800 p-10 hover:border-[#d4af37]/50 transition-colors group">
          <div class="w-12 h-12 border border-[#d4af37]/30 flex items-center justify-center mb-8 group-hover:border-[#d4af37] transition-colors">
            <i data-lucide="line-chart" class="w-5 h-5 text-[#d4af37]"></i>
          </div>
          <h3 class="font-display text-xl mb-4">{{service3_title}}</h3>
          <p class="text-gray-400 text-sm leading-relaxed mb-6">{{service3_description}}</p>
          <div class="w-8 h-px bg-[#d4af37]/30 group-hover:w-full group-hover:bg-[#d4af37] transition-all duration-700"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- PROCESS TIMELINE -->
  <!-- ============================================ -->
  <section id="process" class="py-24 px-6 bg-gradient-to-b from-transparent to-black/30">
    <div class="max-w-4xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-sm tracking-[0.4em] text-[#d4af37] uppercase mb-4">How We Work</p>
        <h2 class="font-display text-3xl md:text-5xl">Our Process</h2>
      </div>
      <div class="relative">
        <!-- Center line -->
        <div class="absolute left-1/2 top-0 bottom-0 w-px bg-[#d4af37]/20"></div>
        <div class="space-y-16">
          <!-- Step 1 — left -->
          <div class="flex items-center gap-8">
            <div class="w-1/2 text-right">
              <p class="text-[#d4af37] text-xs tracking-widest uppercase mb-2">Step One</p>
              <h3 class="font-display text-xl">Discovery</h3>
              <p class="text-sm text-gray-400 mt-2 leading-relaxed">We learn about your goals, challenges, and vision to craft a tailored strategy.</p>
            </div>
            <div class="w-4 h-4 rounded-full bg-[#d4af37] relative z-10 flex-shrink-0"></div>
            <div class="w-1/2"></div>
          </div>
          <!-- Step 2 — right -->
          <div class="flex items-center gap-8">
            <div class="w-1/2"></div>
            <div class="w-4 h-4 rounded-full bg-[#d4af37] relative z-10 flex-shrink-0"></div>
            <div class="w-1/2">
              <p class="text-[#d4af37] text-xs tracking-widest uppercase mb-2">Step Two</p>
              <h3 class="font-display text-xl">Strategy</h3>
              <p class="text-sm text-gray-400 mt-2 leading-relaxed">We develop a comprehensive plan with clear milestones and measurable outcomes.</p>
            </div>
          </div>
          <!-- Step 3 — left -->
          <div class="flex items-center gap-8">
            <div class="w-1/2 text-right">
              <p class="text-[#d4af37] text-xs tracking-widest uppercase mb-2">Step Three</p>
              <h3 class="font-display text-xl">Execution</h3>
              <p class="text-sm text-gray-400 mt-2 leading-relaxed">Our team implements the strategy with precision, keeping you informed every step.</p>
            </div>
            <div class="w-4 h-4 rounded-full bg-[#d4af37] relative z-10 flex-shrink-0"></div>
            <div class="w-1/2"></div>
          </div>
          <!-- Step 4 — right -->
          <div class="flex items-center gap-8">
            <div class="w-1/2"></div>
            <div class="w-4 h-4 rounded-full bg-[#d4af37] relative z-10 flex-shrink-0"></div>
            <div class="w-1/2">
              <p class="text-[#d4af37] text-xs tracking-widest uppercase mb-2">Step Four</p>
              <h3 class="font-display text-xl">Results</h3>
              <p class="text-sm text-gray-400 mt-2 leading-relaxed">We measure, refine, and optimize to ensure exceptional and lasting results.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- ABOUT SECTION -->
  <!-- ============================================ -->
  <section id="about" class="py-24 px-6">
    <div class="max-w-6xl mx-auto grid md:grid-cols-2 gap-20 items-center">
      <div>
        <p class="text-sm tracking-[0.4em] text-[#d4af37] uppercase mb-4">Who We Are</p>
        <h2 class="font-display text-3xl md:text-5xl mb-8 leading-tight">{{about_headline}}</h2>
        <p class="text-gray-400 leading-relaxed text-lg">{{about_description}}</p>
        <div class="mt-10">
          <a href="{{cta_destination}}" class="inline-flex items-center gap-3 text-sm tracking-[0.15em] uppercase text-[#d4af37] hover:text-white transition-colors">
            Discover More
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
            </svg>
          </a>
        </div>
      </div>
      <div>
        <div class="border border-gray-800 p-12">
          <div class="space-y-8">
            <div class="flex items-start gap-5">
              <div class="w-10 h-10 border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0">
                <i data-lucide="shield" class="w-5 h-5 text-[#d4af37]"></i>
              </div>
              <div>
                <h4 class="font-display text-base mb-2">Trusted Authority</h4>
                <p class="text-gray-500 text-sm leading-relaxed">Recognized expertise backed by years of proven results.</p>
              </div>
            </div>
            <div class="flex items-start gap-5">
              <div class="w-10 h-10 border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0">
                <i data-lucide="scale" class="w-5 h-5 text-[#d4af37]"></i>
              </div>
              <div>
                <h4 class="font-display text-base mb-2">Principled Approach</h4>
                <p class="text-gray-500 text-sm leading-relaxed">Integrity and transparency in every engagement.</p>
              </div>
            </div>
            <div class="flex items-start gap-5">
              <div class="w-10 h-10 border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0">
                <i data-lucide="trophy" class="w-5 h-5 text-[#d4af37]"></i>
              </div>
              <div>
                <h4 class="font-display text-base mb-2">Proven Results</h4>
                <p class="text-gray-500 text-sm leading-relaxed">A track record of delivering measurable success for our clients.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- CTA SECTION -->
  <!-- ============================================ -->
  <section class="py-24 px-6">
    <div class="max-w-4xl mx-auto text-center">
      <div class="border border-gray-800 p-14 md:p-20 relative">
        <!-- Gold corner accents -->
        <div class="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-[#d4af37]"></div>
        <div class="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-[#d4af37]"></div>
        <p class="text-sm tracking-[0.4em] text-[#d4af37] uppercase mb-6">Next Steps</p>
        <h2 class="font-display text-3xl md:text-5xl mb-8">Ready to Begin?</h2>
        <p class="text-gray-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
          Let us put our expertise to work for you. Schedule a consultation today.
        </p>
        <div class="flex flex-wrap justify-center gap-6">
          <a href="{{cta_destination}}" class="px-12 py-4 bg-[#d4af37] text-black font-display tracking-wider uppercase text-sm hover:bg-[#e5c34a] transition-colors">
            {{cta_primary}}
          </a>
          <a href="mailto:{{contact_email}}" class="px-12 py-4 border-2 border-[#d4af37] text-[#d4af37] font-display tracking-wider uppercase text-sm hover:bg-[#d4af37] hover:text-black transition-all">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- CONTACT SECTION -->
  <!-- ============================================ -->
  <section id="contact" class="py-24 px-6">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-16">
        <p class="text-sm tracking-[0.4em] text-[#d4af37] uppercase mb-4">Reach Out</p>
        <h2 class="font-display text-3xl md:text-5xl">Contact Us</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-8">
        <div class="border border-gray-800 p-10 text-center hover:border-[#d4af37]/50 transition-colors">
          <i data-lucide="mail" class="w-6 h-6 text-[#d4af37] mx-auto mb-6"></i>
          <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">Email</p>
          <a href="mailto:{{contact_email}}" class="font-display text-base text-white hover:text-[#d4af37] transition-colors">{{contact_email}}</a>
        </div>
        <div class="border border-gray-800 p-10 text-center hover:border-[#d4af37]/50 transition-colors">
          <i data-lucide="phone" class="w-6 h-6 text-[#d4af37] mx-auto mb-6"></i>
          <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">Phone</p>
          <a href="tel:{{contact_phone}}" class="font-display text-base text-white hover:text-[#d4af37] transition-colors">{{contact_phone}}</a>
        </div>
        <div class="border border-gray-800 p-10 text-center hover:border-[#d4af37]/50 transition-colors">
          <i data-lucide="map-pin" class="w-6 h-6 text-[#d4af37] mx-auto mb-6"></i>
          <p class="text-xs tracking-[0.2em] uppercase text-gray-500 mb-3">Location</p>
          <p class="font-display text-base">{{contact_address}}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- FOOTER -->
  <!-- ============================================ -->
  <footer class="border-t border-gray-800 py-12 px-6">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div>
        <a href="#" class="font-display text-base tracking-wider">{{business_name}}</a>
        <p class="text-xs text-gray-600 mt-1 tracking-widest uppercase">{{tagline}}</p>
      </div>
      <div class="flex items-center gap-4">
        <a href="{{social_link1}}" target="_blank" class="w-10 h-10 border border-gray-800 flex items-center justify-center hover:border-[#d4af37] transition-colors">
          <i data-lucide="linkedin" class="w-4 h-4 text-gray-500"></i>
        </a>
        <a href="{{social_link2}}" target="_blank" class="w-10 h-10 border border-gray-800 flex items-center justify-center hover:border-[#d4af37] transition-colors">
          <i data-lucide="facebook" class="w-4 h-4 text-gray-500"></i>
        </a>
        <a href="{{social_link3}}" target="_blank" class="w-10 h-10 border border-gray-800 flex items-center justify-center hover:border-[#d4af37] transition-colors">
          <i data-lucide="instagram" class="w-4 h-4 text-gray-500"></i>
        </a>
      </div>
    </div>
    <div class="max-w-7xl mx-auto mt-10 pt-8 border-t border-gray-800 text-center">
      <p class="text-xs text-gray-600 tracking-widest">&copy; {{current_year}} {{business_name}}. All rights reserved.</p>
    </div>
  </footer>

  <!-- ============================================ -->
  <!-- SCRIPTS -->
  <!-- ============================================ -->
  <script>
    // Initialize Lucide icons
    lucide.createIcons();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  </script>
</body>
</html>
`,

  'svrn': `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{business_name}}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://unpkg.com/lucide@latest"></script>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --accent: {{accent_color}};
    }
    body { font-family: 'Inter', sans-serif; }
    .mix-blend-nav { mix-blend-mode: difference; }
    @keyframes fade-in {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .fade-in { animation: fade-in 1s ease-out forwards; }
    .fade-in-delay-1 { animation-delay: 0.3s; opacity: 0; }
    .fade-in-delay-2 { animation-delay: 0.6s; opacity: 0; }
    .fade-in-delay-3 { animation-delay: 0.9s; opacity: 0; }
  </style>
</head>
<body class="bg-[#0A0A0A] text-white antialiased">

  <!-- ============================================ -->
  <!-- NAVIGATION (mix-blend-mode: difference) -->
  <!-- ============================================ -->
  <nav class="fixed top-0 left-0 right-0 z-50 mix-blend-nav">
    <div class="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
      <a href="#" class="text-xl font-medium tracking-tight">{{business_name}}</a>
      <div class="hidden md:flex items-center gap-8">
        <a href="#services" class="text-sm hover:opacity-60 transition-opacity">Services</a>
        <a href="#about" class="text-sm hover:opacity-60 transition-opacity">About</a>
        <a href="#contact" class="text-sm hover:opacity-60 transition-opacity">Contact</a>
        <a href="{{cta_destination}}" class="text-sm font-medium">{{cta_primary}} &rarr;</a>
      </div>
    </div>
  </nav>

  <!-- ============================================ -->
  <!-- HERO SECTION (full-bleed) -->
  <!-- ============================================ -->
  <section class="relative h-screen bg-[#0A0A0A]">
    <!-- Abstract gradient background -->
    <div class="absolute inset-0">
      <div class="absolute inset-0 bg-gradient-to-br from-neutral-900 via-[#0A0A0A] to-neutral-800"></div>
      <div class="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#0A0A0A] to-transparent"></div>
    </div>
    <div class="relative z-10 h-full flex items-end pb-24 px-6">
      <div class="max-w-7xl mx-auto w-full">
        <p class="text-sm text-white/50 tracking-wide mb-4 fade-in">{{tagline}}</p>
        <h1 class="text-5xl md:text-7xl lg:text-8xl font-light tracking-tight mb-6 fade-in fade-in-delay-1">
          {{hero_title_line1}}<br>
          {{hero_title_line2}}
        </h1>
        <p class="text-lg text-white/60 max-w-xl mb-8 leading-relaxed fade-in fade-in-delay-2">
          {{hero_description}}
        </p>
        <div class="flex flex-wrap gap-4 fade-in fade-in-delay-3">
          <a href="{{cta_destination}}" class="px-8 py-4 bg-white text-black font-medium hover:bg-white/90 transition-colors">
            {{cta_primary}}
          </a>
          <a href="#about" class="px-8 py-4 border border-white/20 text-white hover:bg-white/5 transition-colors">
            {{cta_secondary}}
          </a>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- SERVICES SECTION -->
  <!-- ============================================ -->
  <section id="services" class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
        <div>
          <p class="text-sm text-white/40 mb-3">Services</p>
          <h2 class="text-3xl md:text-4xl font-light tracking-tight">What we do</h2>
        </div>
        <a href="{{cta_destination}}" class="text-sm text-white/60 hover:text-white transition-colors">
          View all services &rarr;
        </a>
      </div>
      <div class="grid md:grid-cols-3 gap-px bg-white/5">
        <!-- Service 1 -->
        <div class="bg-[#0A0A0A] p-10 md:p-12 group hover:bg-[#111] transition-colors">
          <p class="text-sm text-white/30 mb-8">01</p>
          <h3 class="text-xl font-medium mb-4">{{service1_title}}</h3>
          <p class="text-sm text-white/50 leading-relaxed mb-8">{{service1_description}}</p>
          <div class="w-8 h-px bg-white/20 group-hover:w-16 group-hover:bg-white transition-all duration-500"></div>
        </div>
        <!-- Service 2 -->
        <div class="bg-[#0A0A0A] p-10 md:p-12 group hover:bg-[#111] transition-colors">
          <p class="text-sm text-white/30 mb-8">02</p>
          <h3 class="text-xl font-medium mb-4">{{service2_title}}</h3>
          <p class="text-sm text-white/50 leading-relaxed mb-8">{{service2_description}}</p>
          <div class="w-8 h-px bg-white/20 group-hover:w-16 group-hover:bg-white transition-all duration-500"></div>
        </div>
        <!-- Service 3 -->
        <div class="bg-[#0A0A0A] p-10 md:p-12 group hover:bg-[#111] transition-colors">
          <p class="text-sm text-white/30 mb-8">03</p>
          <h3 class="text-xl font-medium mb-4">{{service3_title}}</h3>
          <p class="text-sm text-white/50 leading-relaxed mb-8">{{service3_description}}</p>
          <div class="w-8 h-px bg-white/20 group-hover:w-16 group-hover:bg-white transition-all duration-500"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- STATS SECTION -->
  <!-- ============================================ -->
  <section class="py-16 border-y border-white/5">
    <div class="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
      <div>
        <p class="text-4xl font-light">{{stat1_value}}</p>
        <p class="text-sm text-white/40 mt-2">Years Experience</p>
      </div>
      <div>
        <p class="text-4xl font-light">{{stat2_value}}</p>
        <p class="text-sm text-white/40 mt-2">Clients Served</p>
      </div>
      <div>
        <p class="text-4xl font-light">100%</p>
        <p class="text-sm text-white/40 mt-2">Satisfaction</p>
      </div>
      <div>
        <p class="text-4xl font-light">24/7</p>
        <p class="text-sm text-white/40 mt-2">Support</p>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- ABOUT SECTION -->
  <!-- ============================================ -->
  <section id="about" class="py-24 px-6">
    <div class="max-w-7xl mx-auto grid md:grid-cols-2 gap-20 items-center">
      <div>
        <p class="text-sm text-white/40 mb-4">About</p>
        <h2 class="text-3xl md:text-5xl font-light tracking-tight mb-8 leading-tight">{{about_headline}}</h2>
        <p class="text-white/50 leading-relaxed text-lg">{{about_description}}</p>
      </div>
      <div class="bg-[#111] p-12">
        <div class="space-y-8">
          <div class="flex items-start gap-5">
            <div class="w-px h-12 bg-white/20 flex-shrink-0 mt-1"></div>
            <div>
              <h4 class="font-medium mb-1">Precision</h4>
              <p class="text-sm text-white/40 leading-relaxed">Meticulous attention to every detail of your project.</p>
            </div>
          </div>
          <div class="flex items-start gap-5">
            <div class="w-px h-12 bg-white/20 flex-shrink-0 mt-1"></div>
            <div>
              <h4 class="font-medium mb-1">Simplicity</h4>
              <p class="text-sm text-white/40 leading-relaxed">Clean, focused solutions that speak for themselves.</p>
            </div>
          </div>
          <div class="flex items-start gap-5">
            <div class="w-px h-12 bg-white/20 flex-shrink-0 mt-1"></div>
            <div>
              <h4 class="font-medium mb-1">Excellence</h4>
              <p class="text-sm text-white/40 leading-relaxed">An unwavering commitment to the highest standards.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- CTA SECTION -->
  <!-- ============================================ -->
  <section class="py-24 px-6 bg-[#111]">
    <div class="max-w-3xl mx-auto text-center">
      <h2 class="text-3xl md:text-5xl font-light mb-8 tracking-tight">Let's work together</h2>
      <p class="text-white/50 text-lg mb-12 leading-relaxed">
        We'd love to hear about your next project. Get in touch and let's create something exceptional.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="{{cta_destination}}" class="px-10 py-4 bg-white text-black font-medium hover:bg-white/90 transition-colors">
          {{cta_primary}}
        </a>
        <a href="mailto:{{contact_email}}" class="px-10 py-4 border border-white/20 text-white hover:bg-white/5 transition-colors">
          {{cta_secondary}}
        </a>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- CONTACT SECTION -->
  <!-- ============================================ -->
  <section id="contact" class="py-24 px-6">
    <div class="max-w-7xl mx-auto">
      <div class="mb-16">
        <p class="text-sm text-white/40 mb-3">Contact</p>
        <h2 class="text-3xl md:text-4xl font-light tracking-tight">Get in touch</h2>
      </div>
      <div class="grid md:grid-cols-3 gap-px bg-white/5">
        <div class="bg-[#0A0A0A] p-10 md:p-12 hover:bg-[#111] transition-colors">
          <i data-lucide="mail" class="w-5 h-5 text-white/40 mb-6"></i>
          <p class="text-sm text-white/30 mb-2">Email</p>
          <a href="mailto:{{contact_email}}" class="text-white hover:text-white/70 transition-colors">{{contact_email}}</a>
        </div>
        <div class="bg-[#0A0A0A] p-10 md:p-12 hover:bg-[#111] transition-colors">
          <i data-lucide="phone" class="w-5 h-5 text-white/40 mb-6"></i>
          <p class="text-sm text-white/30 mb-2">Phone</p>
          <a href="tel:{{contact_phone}}" class="text-white hover:text-white/70 transition-colors">{{contact_phone}}</a>
        </div>
        <div class="bg-[#0A0A0A] p-10 md:p-12 hover:bg-[#111] transition-colors">
          <i data-lucide="map-pin" class="w-5 h-5 text-white/40 mb-6"></i>
          <p class="text-sm text-white/30 mb-2">Location</p>
          <p class="text-white">{{contact_address}}</p>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================ -->
  <!-- FOOTER -->
  <!-- ============================================ -->
  <footer class="border-t border-white/5 py-12 px-6">
    <div class="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div>
        <a href="#" class="text-base font-medium tracking-tight">{{business_name}}</a>
        <p class="text-xs text-white/30 mt-1">{{tagline}}</p>
      </div>
      <div class="flex items-center gap-6">
        <a href="{{social_link1}}" target="_blank" class="text-white/30 hover:text-white transition-colors">
          <i data-lucide="linkedin" class="w-4 h-4"></i>
        </a>
        <a href="{{social_link2}}" target="_blank" class="text-white/30 hover:text-white transition-colors">
          <i data-lucide="facebook" class="w-4 h-4"></i>
        </a>
        <a href="{{social_link3}}" target="_blank" class="text-white/30 hover:text-white transition-colors">
          <i data-lucide="instagram" class="w-4 h-4"></i>
        </a>
      </div>
    </div>
    <div class="max-w-7xl mx-auto mt-10 pt-8 border-t border-white/5 text-center">
      <p class="text-xs text-white/20">&copy; {{current_year}} {{business_name}}. All rights reserved.</p>
    </div>
  </footer>

  <!-- ============================================ -->
  <!-- SCRIPTS -->
  <!-- ============================================ -->
  <script>
    // Initialize Lucide icons
    lucide.createIcons();

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });
  </script>
</body>
</html>
`,

};


// ============================================
// SLUG MAPPING & TEMPLATE SELECTION
// ============================================

const TEMPLATE_SLUG_MAP = {
  // Primary slugs
  'aether': 'aether',
  'uslu': 'uslu',
  'vitalis': 'vitalis',
  'sourcing-sense': 'sourcing-sense',
  'svrn': 'svrn',
  // Short ID aliases
  '1a': 'aether',
  '2b': 'uslu',
  '3c': 'vitalis',
  '4d': 'sourcing-sense',
  '5e': 'svrn',
  // Legacy slugs → redirect to new templates
  'executive-dark': 'aether',
  'warm-professional': 'vitalis',
  'tech-premium': 'aether',
  'minimal-portfolio': 'svrn',
  'ai-agency': 'aether',
};

// Template selection based on business type
const BUSINESS_TYPE_TEMPLATES = {
  'ai': 'aether',
  'tech': 'aether',
  'saas': 'aether',
  'software': 'aether',
  'real-estate': 'uslu',
  'architecture': 'uslu',
  'luxury': 'uslu',
  'food': 'vitalis',
  'health': 'vitalis',
  'wellness': 'vitalis',
  'nutrition': 'vitalis',
  'lifestyle': 'vitalis',
  'fitness': 'vitalis',
  'consulting': 'sourcing-sense',
  'b2b': 'sourcing-sense',
  'professional-services': 'sourcing-sense',
  'finance': 'sourcing-sense',
  'legal': 'sourcing-sense',
  'marketplace': 'svrn',
  'ecommerce': 'svrn',
  'fashion': 'svrn',
  'agency': 'aether',
  'marketing': 'aether',
};

function selectTemplate(businessType) {
  if (!businessType) return 'aether';
  const key = businessType.toLowerCase().replace(/\s+/g, '-');
  return BUSINESS_TYPE_TEMPLATES[key] || 'aether';
}

async function getUserId(request) {
  // 1. Try Authorization header
  const authHeader = request.headers.get('authorization');
  let token = authHeader?.replace('Bearer ', '');
  if (!token) {
    const cookieStore = await cookies();
    token = cookieStore.get('token')?.value || cookieStore.get('admin_token')?.value;
  }
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const id = decoded.id || decoded.userId || decoded.sub;
      if (id) return id;
    } catch {
      // JWT invalid/expired - fall through to NextAuth
    }
  }
  // 2. Fallback: NextAuth session (OAuth logins)
  const session = await getSession();
  return session?.user?.id || null;
}



// ============================================
// AI CONTENT GENERATION (Anthropic API)
// ============================================

const COPYWRITER_SYSTEM_PROMPT = `You are a world-class conversion-focused copywriter for website landing pages. Your job is to take basic business information and transform it into compelling, benefit-focused marketing copy that SELLS.

CRITICAL RULES:
- NEVER repeat the user's input verbatim. Rewrite EVERYTHING into polished marketing copy.
- Write headlines that communicate a clear BENEFIT or TRANSFORMATION, not just the business name.
- Focus on OUTCOMES: what the customer GETS, not what the business DOES.
- CTAs should create urgency — "Start Your Free Trial", "Book a Strategy Call", "Get Your Quote".
- About sections should tell a STORY and build TRUST — not just repeat the description.
- You MUST generate ALL 3 services even if the user only described 1. Infer logical services from the business type and description.
- Service descriptions should lead with the PROBLEM SOLVED and the RESULT DELIVERED.
- Keep copy concise — headlines under 8 words, descriptions under 40 words.
- Match tone to business type (tech = bold/innovative, luxury = refined/exclusive, wellness = warm/caring, consulting = authoritative/trustworthy).

You MUST respond with ONLY a valid JSON object. No markdown, no code fences, no extra text.`;

function buildUserPrompt(formData) {
  const biz = formData.business_name || 'My Business';
  const type = formData.businessType || 'general';
  const desc = formData.about_story || formData.description || '';
  const svc1 = formData.service1_name || '';
  const svc1d = formData.service1_description || '';

  return `Generate COMPLETE website marketing copy for this business. Transform all input into compelling copy. DO NOT leave any field empty. If only 1 service is provided, INVENT 2 more that are logical for this business type.

BUSINESS INFO:
- Name: ${biz}
- Type/Industry: ${type}
- Their tagline: ${formData.tagline || 'none — create one'}
- Their description: ${desc || 'none — infer from name and type'}
- Service 1: ${svc1 || 'none'} — ${svc1d || 'none'}
- Service 2: ${formData.service2_name || 'not provided — invent one'} — ${formData.service2_description || ''}
- Service 3: ${formData.service3_name || 'not provided — invent one'} — ${formData.service3_description || ''}
- Years in business: ${formData.years_experience || 'not specified'}
- Clients served: ${formData.clients_served || 'not specified'}

Generate a JSON object with ALL of these keys (every field MUST have a value):
{
  "hero_title_line1": "A powerful 3-5 word headline about the TRANSFORMATION (NOT the business name)",
  "hero_title_line2": "A benefit-focused second line, 3-5 words",
  "tagline": "A compelling one-line value proposition (max 10 words)",
  "hero_description": "2-3 sentences that hook the reader. Focus on what they GAIN. Max 50 words.",
  "service1_title": "Benefit-focused service name (3-5 words, rewritten from input)",
  "service1_description": "Problem solved → outcome delivered. Max 30 words.",
  "service2_title": "Second service name (3-5 words — MUST be filled even if not in input)",
  "service2_description": "Problem solved → outcome delivered. Max 30 words.",
  "service3_title": "Third service name (3-5 words — MUST be filled even if not in input)",
  "service3_description": "Problem solved → outcome delivered. Max 30 words.",
  "about_headline": "Engaging about headline (4-7 words, NOT just 'About Us')",
  "about_description": "Trust-building paragraph — tell a STORY about why this business exists and what makes them different. Max 60 words. MUST differ from hero_description.",
  "cta_primary": "Action-oriented primary button (2-4 words, e.g. 'Start Free Trial')",
  "cta_secondary": "Softer secondary button (2-4 words, e.g. 'See How It Works')",
  "stat1_label": "What the first stat measures (e.g. 'Years Experience')",
  "stat2_label": "What the second stat measures (e.g. 'Clients Served')"
}`;
}

async function generateAIContent(formData) {
  if (!ANTHROPIC_API_KEY) {
    console.warn('[websites/generate] ANTHROPIC_API_KEY not set — using smart fallback');
    return null;
  }

  try {
    console.log('[websites/generate] Calling Anthropic API...');
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: COPYWRITER_SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: buildUserPrompt(formData) }
        ],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('[websites/generate] Anthropic API error:', response.status, errText);
      return null;
    }

    const data = await response.json();
    const text = data.content?.[0]?.text;
    if (!text) {
      console.error('[websites/generate] Empty Anthropic response');
      return null;
    }

    // Parse JSON — strip markdown fences if present
    const cleaned = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const parsed = JSON.parse(cleaned);
    console.log('[websites/generate] ✅ AI content generated:', Object.keys(parsed).join(', '));
    return parsed;
  } catch (error) {
    console.error('[websites/generate] AI generation failed:', error.message);
    return null;
  }
}

// ============================================
// SMART FALLBACK (when AI is unavailable)
// ============================================

function generateSmartFallback(formData) {
  const biz = formData.business_name || 'Our Company';
  const type = (formData.businessType || '').toLowerCase();
  const desc = formData.about_story || formData.description || '';
  const svc1 = formData.service1_name || '';

  // Generate a headline that's NOT just the business name
  let heroLine1 = 'Elevate Your Business';
  let heroLine2 = 'To The Next Level';
  let ctaPrimary = 'Get Started Today';
  let ctaSecondary = 'Learn More';

  if (type.includes('tech') || type.includes('ai') || type.includes('saas') || type.includes('software')) {
    heroLine1 = 'Innovation That Drives';
    heroLine2 = 'Real Results';
    ctaPrimary = 'Start Free Trial';
    ctaSecondary = 'See How It Works';
  } else if (type.includes('real') || type.includes('architect') || type.includes('luxury')) {
    heroLine1 = 'Exceptional Quality';
    heroLine2 = 'Unmatched Excellence';
    ctaPrimary = 'Schedule Consultation';
    ctaSecondary = 'View Portfolio';
  } else if (type.includes('health') || type.includes('well') || type.includes('food') || type.includes('fit')) {
    heroLine1 = 'Transform Your Life';
    heroLine2 = 'Starting Today';
    ctaPrimary = 'Begin Your Journey';
    ctaSecondary = 'Explore Programs';
  } else if (type.includes('consult') || type.includes('b2b') || type.includes('finance') || type.includes('legal')) {
    heroLine1 = 'Strategic Solutions';
    heroLine2 = 'That Deliver Results';
    ctaPrimary = 'Book a Strategy Call';
    ctaSecondary = 'See Case Studies';
  } else if (type.includes('market') || type.includes('ecom') || type.includes('fashion')) {
    heroLine1 = 'Discover Something';
    heroLine2 = 'Extraordinary';
    ctaPrimary = 'Shop Now';
    ctaSecondary = 'Browse Collection';
  }

  // Build tagline from input or generate
  const tagline = formData.tagline || `${biz} — ${heroLine1} ${heroLine2}`;

  // Hero description — rewrite, don't repeat
  let heroDesc = desc
    ? `Discover how ${biz} is helping businesses achieve their goals. ${desc.split('.')[0]}.`
    : `${biz} delivers proven solutions that transform the way you work. Experience the difference that expertise and dedication make.`;
  if (heroDesc.length > 200) heroDesc = heroDesc.substring(0, 197) + '...';

  // Generate services — always fill all 3
  const service1Title = svc1 || 'Strategic Solutions';
  const service1Desc = formData.service1_description || `Tailored strategies designed to help your business grow and succeed in today's competitive landscape.`;
  const service2Title = formData.service2_name || 'Dedicated Support';
  const service2Desc = formData.service2_description || `Our expert team is committed to providing personalized guidance every step of the way.`;
  const service3Title = formData.service3_name || 'Proven Results';
  const service3Desc = formData.service3_description || `Data-driven approaches that consistently deliver measurable outcomes for our clients.`;

  // About — different from hero
  const aboutHeadline = formData.about_headline || `Why ${biz}?`;
  const aboutDesc = desc
    ? `At ${biz}, we believe in delivering excellence. ${desc.split('.').slice(0, 2).join('.')}. That commitment drives everything we do.`
    : `Founded with a passion for excellence, ${biz} has built a reputation for delivering outstanding results. We combine deep expertise with a client-first approach to help you achieve your goals.`;

  console.log('[websites/generate] Using smart fallback content (no AI API key)');

  return {
    hero_title_line1: heroLine1,
    hero_title_line2: heroLine2,
    tagline,
    hero_description: heroDesc,
    service1_title: service1Title,
    service1_description: service1Desc,
    service2_title: service2Title,
    service2_description: service2Desc,
    service3_title: service3Title,
    service3_description: service3Desc,
    about_headline: aboutHeadline,
    about_description: aboutDesc,
    cta_primary: ctaPrimary,
    cta_secondary: ctaSecondary,
  };
}

// ============================================
// PLACEHOLDER REPLACEMENT
// ============================================

function buildPlaceholders(formData, aiContent) {
  // Use AI content if available, otherwise smart fallback (never empty strings)
  const content = aiContent || generateSmartFallback(formData);

  return {
    // Literal fields — always from user input
    business_name: formData.business_name || 'My Business',
    accent_color: formData.accent_color || '#6366f1',
    email: formData.email || '',
    contact_email: formData.email || 'hello@example.com',
    contact_phone: formData.phone || '',
    contact_address: formData.address || '',
    stat1_value: formData.years_experience || '5+',
    stat2_value: formData.clients_served || '100+',
    cta_destination: formData.cta_destination || '#contact',
    social_link1: formData.linkedin || '#',
    social_link2: formData.facebook || '#',
    social_link3: formData.instagram || '#',
    current_year: String(new Date().getFullYear()),

    // Content fields — AI-generated or smart fallback (never empty)
    tagline: content.tagline,
    hero_title_line1: content.hero_title_line1,
    hero_title_line2: content.hero_title_line2,
    hero_description: content.hero_description,
    service1_title: content.service1_title,
    service1_description: content.service1_description,
    service2_title: content.service2_title,
    service2_description: content.service2_description,
    service3_title: content.service3_title,
    service3_description: content.service3_description,
    about_headline: content.about_headline,
    about_description: content.about_description,
    about_story: content.about_description,
    cta_primary: content.cta_primary,
    cta_secondary: content.cta_secondary,
  };
}

function replacePlaceholders(html, placeholders) {
  let out = html;
  for (const [key, value] of Object.entries(placeholders)) {
    out = out.replace(new RegExp(`{{${key}}}`, 'g'), String(value ?? ''));
  }
  return out;
}



// ============================================
// TEMPLATE LOADING (inline, serverless-safe)
// ============================================

async function loadTemplate(slug) {
  const canonicalSlug = TEMPLATE_SLUG_MAP[slug] || slug;
  const html = INLINE_TEMPLATES[canonicalSlug] || INLINE_TEMPLATES.aether;
  const finalSlug = INLINE_TEMPLATES[canonicalSlug] ? canonicalSlug : 'aether';

  console.log('[loadTemplate] slug="' + slug + '" => canonical="' + finalSlug + '" (' + html.length + ' chars)');

  const name = finalSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  const t = await prisma.websiteTemplate.upsert({
    where: { slug: finalSlug },
    update: { html, updatedAt: new Date() },
    create: { name, slug: finalSlug, html, css: '' },
  });

  console.log('[loadTemplate] DB upserted: id=' + t.id + ', slug=' + t.slug);
  return t;
}

// ============================================
// POST HANDLER
// ============================================

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { formData, purchaseId } = body;
    // Support explicit templateId or auto-select from businessType
    const templateId = body.templateId || selectTemplate(formData?.businessType);

    console.log(`[websites/generate] ▶ Request: templateId="${body.templateId}" businessType="${formData?.businessType}" → resolved="${templateId}"`);

    if (!formData || typeof formData !== 'object') {
      return NextResponse.json(
        { error: 'formData is required' },
        { status: 400 }
      );
    }

    // --- Website limit check: 1 free, then $19.99 each ---
    const existingWebsites = await prisma.website.count({ where: { userId } });
    const hasFreeWebsite = await prisma.website.findFirst({
      where: { userId, isFreeWebsite: true },
    });

    if (hasFreeWebsite && !purchaseId) {
      return NextResponse.json(
        {
          error: 'payment_required',
          message: 'Additional websites are $19.99 each (includes hosting)',
          existingCount: existingWebsites,
          price: 19.99,
          currency: 'usd',
        },
        { status: 402 }
      );
    }

    // 1. Load template HTML (inline, serverless-safe)
    const template = await loadTemplate(templateId);
    if (!template) {
      return NextResponse.json(
        { error: `Template not found: ${templateId}` },
        { status: 404 }
      );
    }

    // 2. Generate AI content (falls back to raw input if API unavailable)
    const aiContent = await generateAIContent(formData);

    // 3. Build placeholders and replace in template
    const placeholders = buildPlaceholders(formData, aiContent);
    const html = replacePlaceholders(template.html, placeholders);
    const css = template.css || '';

    // 4. Generate unique subdomain
    const name = formData.business_name || 'My Website';
    const subdomainBase = name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 30);
    let subdomain = subdomainBase;
    let n = 1;
    while (true) {
      const exists = await prisma.aiBuilderSite.findUnique({ where: { subdomain } });
      if (!exists) break;
      subdomain = `${subdomainBase}-${n}`;
      n++;
    }

    // 5. Save to database
    const site = await prisma.aiBuilderSite.create({
      data: {
        userId,
        templateId: template.id,
        name,
        html,
        css,
        formData,
        status: 'draft',
        subdomain,
      },
    });

    // 6. Save Website record for billing tracking
    const isFree = existingWebsites === 0;
    const savedWebsite = await prisma.website.create({
      data: {
        userId,
        name,
        slug: subdomain,
        template: templateId,
        content: formData,
        htmlContent: html,
        status: 'draft',
        isFreeWebsite: isFree,
        purchaseId: purchaseId || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        html,
        css,
        websiteId: site.id,
        name: site.name,
        subdomain: site.subdomain,
        templateUsed: templateId,
        aiGenerated: !!aiContent,
      },
      billing: {
        isFree,
        totalWebsites: existingWebsites + 1,
        nextWebsitePrice: 19.99,
      },
    });
  } catch (error) {
    console.error('[api/websites/generate] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate website', details: error?.message },
      { status: 500 }
    );
  }
}

