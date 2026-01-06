'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Film, Crown, Gem } from 'lucide-react'
import WebGLBackground from '../components/WebGLBackground'
import GridCanvas from '../components/GridCanvas'

export default function HomePage() {
  const [selectedSeats, setSelectedSeats] = useState([])
  const heroSectionRef = useRef(null)
  const heroBgRef = useRef(null)
  const filmContainerRef = useRef(null)

  const seatPrice = 25.0

  // Hero Parallax Effect
  useEffect(() => {
    const heroSection = heroSectionRef.current
    const heroBg = heroBgRef.current
    if (!heroSection || !heroBg) return

    const handleMouseMove = (e) => {
      const { offsetWidth: width, offsetHeight: height } = heroSection
      const { clientX: x, clientY: y } = e
      const xMove = (x / width) * -30 + 15
      const yMove = (y / height) * -20 + 10
      heroBg.style.transform = `scale(1.1) translate(${xMove}px, ${yMove}px)`
    }

    const handleMouseLeave = () => {
      heroBg.style.transform = `scale(1.1) translate(0px, 0px)`
    }

    heroSection.addEventListener('mousemove', handleMouseMove)
    heroSection.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      heroSection.removeEventListener('mousemove', handleMouseMove)
      heroSection.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  // Film Slider
  const scrollSlider = (direction) => {
    if (!filmContainerRef.current) return
    const scrollAmount = 400
    filmContainerRef.current.scrollBy({
      left: direction * scrollAmount,
      behavior: 'smooth',
    })
  }

  // Seating Logic
  const toggleSeat = (seatId) => {
    setSelectedSeats((prev) => {
      if (prev.includes(seatId)) {
        return prev.filter((id) => id !== seatId)
      } else {
        return [...prev, seatId]
      }
    })
  }

  const totalPrice = selectedSeats.length * seatPrice

  // Generate seat map
  const rows = ['A', 'B', 'C', 'D', 'E', 'F']
  const seatsPerRow = [8, 10, 10, 12, 12, 14]

  return (
    <div className="min-h-screen relative">
      <WebGLBackground />
      <div className="fixed inset-0 pointer-events-none bg-vignette z-0"></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-6 transition-all duration-300 border-b border-white/5 bg-void/70 backdrop-blur-md">
        <div className="max-w-screen-2xl mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="font-serif text-lg font-bold tracking-widest text-gold-100 hover:text-gold-500 transition-colors uppercase z-50"
          >
            VideoSite.IO
          </Link>

          <div className="hidden md:flex items-center gap-10">
            <a
              href="#videos"
              className="text-xs uppercase tracking-widest text-beige-200/70 hover:text-gold-300 transition-colors"
            >
              Videos
            </a>
            <a
              href="#experience"
              className="text-xs uppercase tracking-widest text-beige-200/70 hover:text-gold-300 transition-colors"
            >
              Experience
            </a>
            <a
              href="#membership"
              className="text-xs uppercase tracking-widest text-beige-200/70 hover:text-gold-300 transition-colors"
            >
              Membership
            </a>
          </div>

          <Link
            href="/signup"
            className="relative group px-6 py-2 overflow-hidden border border-gold-500/30 hover:border-gold-500 transition-all duration-500"
          >
            <div className="absolute inset-0 w-0 bg-gold-500/10 transition-all duration-[250ms] ease-out group-hover:w-full"></div>
            <span className="relative text-[10px] font-semibold uppercase tracking-widest text-gold-300 group-hover:text-gold-100 flex items-center gap-2">
              Get Started
            </span>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header
        ref={heroSectionRef}
        id="hero"
        className="relative w-full h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden group"
      >
        <div
          ref={heroBgRef}
          className="hero-bg-container absolute inset-[-5%] w-[110%] h-[110%] bg-cover bg-center opacity-40 z-0 grayscale mix-blend-screen"
          style={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1517604931442-71053e683597?q=80&w=2070&auto=format&fit=crop)',
            transform: 'scale(1.1) translate(0px, 0px)',
          }}
        ></div>
        <GridCanvas />

        <div className="relative z-10 space-y-8 max-w-5xl pointer-events-none">
          <div className="overflow-hidden">
            <p className="text-gold-500 text-[10px] font-semibold tracking-[0.3em] uppercase opacity-0 translate-y-full animate-[textReveal_1.5s_ease-out_0.5s_forwards]">
              Video-First Lead Generation
            </p>
          </div>

          <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl font-medium tracking-tighter text-beige-100 opacity-0 scale-95 animate-[heroTitle_2s_ease-out_1s_forwards] leading-none">
            CINEMATIC <span className="italic font-light text-gold-300">GROWTH</span>
          </h1>

          <div className="max-w-lg mx-auto pt-4 opacity-0 animate-[fadeIn_1s_ease-out_1.5s_forwards] pointer-events-auto">
            <p className="text-beige-200/60 text-sm font-light leading-relaxed">
              Create video campaigns that convert. Upload, edit, and track video performance with AI-powered insights.
            </p>
            <div className="mt-8 flex justify-center gap-6">
              <Link
                href="/signup"
                className="text-[10px] uppercase hover:bg-gold-500 hover:text-void hover:border-gold-500 transition-all duration-300 tracking-widest border-white/20 border pt-3 pr-8 pb-3 pl-8"
              >
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Now Showing / Videos Section */}
      <section id="videos" className="z-10 bg-stone-950 border-white/5 border-t py-24 relative backdrop-blur-sm">
        <div className="px-6 md:px-12 mb-12 flex justify-between items-end max-w-screen-2xl mx-auto">
          <div>
            <h2 className="font-serif text-3xl md:text-4xl text-beige-100 mb-2 tracking-tight">
              Video Campaigns
            </h2>
            <p className="text-beige-200/40 text-[10px] tracking-widest uppercase">
              Create engaging video content that converts
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => scrollSlider(-1)}
              className="p-4 border border-white/10 hover:border-gold-500 hover:text-gold-500 transition-all active:scale-95 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => scrollSlider(1)}
              className="p-4 border border-white/10 hover:border-gold-500 hover:text-gold-500 transition-all active:scale-95 group"
            >
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* Video Strip */}
        <div
          ref={filmContainerRef}
          id="film-scroll-container"
          className="flex overflow-x-auto gap-8 px-6 md:px-12 pb-12 snap-x snap-mandatory no-scrollbar scroll-smooth"
        >
          {[
            { title: 'Product Demo', tag: 'Demo', img: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1925&auto=format&fit=crop' },
            { title: 'Testimonial', tag: 'Social Proof', img: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop' },
            { title: 'Tutorial', tag: 'Education', img: 'https://images.unsplash.com/photo-1533488765986-dfa2a9939acd?q=80&w=1974&auto=format&fit=crop' },
            { title: 'Announcement', tag: 'News', img: 'https://images.unsplash.com/photo-1517604931442-71053e683597?q=80&w=2070&auto=format&fit=crop' },
          ].map((video, idx) => (
            <div key={idx} className="min-w-[300px] md:min-w-[400px] snap-center group cursor-pointer relative">
              <div className="aspect-[2/3] relative overflow-hidden bg-charcoal mb-6">
                <img
                  src={video.img}
                  className="object-cover w-full h-full grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-in-out opacity-70 group-hover:opacity-100"
                  alt={video.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-void to-transparent opacity-80"></div>
                <div className="absolute bottom-6 left-6">
                  <span className="text-[10px] bg-gold-500 text-void px-2 py-1 font-bold tracking-widest uppercase mb-2 inline-block">
                    {video.tag}
                  </span>
                  <h3 className="font-serif text-2xl text-beige-100 mt-2">{video.title}</h3>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Experience / Interactive Section */}
      <section className="z-10 bg-stone-950 px-6 py-32 relative" id="experience">
        <div className="max-w-screen-xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl text-beige-100 mb-4 tracking-tight">
              Video <span className="text-gold-500 italic">Analytics</span>
            </h2>
            <p className="text-beige-200/50 text-xs font-light">
              Track watch time, engagement, and conversions in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Watch Time', value: '2.4M', desc: 'Total minutes watched' },
              { label: 'Engagement Rate', value: '68%', desc: 'Average completion' },
              { label: 'Conversions', value: '1.2K', desc: 'Leads generated' },
            ].map((stat, idx) => (
              <div key={idx} className="bg-void border border-white/5 p-8 text-center">
                <div className="text-4xl font-serif text-gold-500 mb-2">{stat.value}</div>
                <div className="text-sm text-beige-200/60 mb-1">{stat.label}</div>
                <div className="text-xs text-beige-200/40">{stat.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Membership Section */}
      <section id="membership" className="bg-stone-950 z-10 border-white/5 border-t px-6 py-32 relative">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="font-serif text-4xl md:text-5xl mb-4 tracking-tight">
            Choose Your <span className="text-gold-500">Tier</span>
          </h2>
          <p className="text-beige-200/50 font-light">Unlock video features as you grow.</p>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
          {/* Tier 1 */}
          <div className="membership-card group relative p-1 bg-gradient-to-b from-white/10 to-transparent border border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-void/90 m-[1px]"></div>
            <div className="relative p-8 h-full flex flex-col items-center text-center z-10">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6 text-white/40 group-hover:text-gold-500 group-hover:border-gold-500/50 transition-colors">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                Starter
              </span>
              <h3 className="font-serif text-3xl mb-6 text-beige-100">
                $99<span className="text-sm font-sans text-white/30 font-light">/mo</span>
              </h3>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>
              <ul className="text-xs text-beige-200/60 space-y-4 mb-8 font-light flex-grow">
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  10 Video Uploads/Month
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  Basic Analytics
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  Video Landing Pages
                </li>
              </ul>
              <Link
                href="/signup"
                className="w-full py-3 border border-white/10 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Select Plan
              </Link>
            </div>
          </div>

          {/* Tier 2 (Featured) */}
          <div className="membership-card group relative p-1 bg-gradient-to-b from-gold-500/50 to-transparent border border-gold-500/20 overflow-hidden shadow-2xl shadow-gold-900/10 md:-mt-8 md:mb-8">
            <div className="absolute inset-0 bg-void/90 m-[1px]"></div>
            <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-gold-400 to-transparent shadow-[0_0_15px_rgba(212,175,55,0.5)]"></div>
            <div className="relative p-10 h-full flex flex-col items-center text-center z-10">
              <div className="w-12 h-12 rounded-full border border-gold-500/30 flex items-center justify-center mb-6 text-gold-500 bg-gold-500/5">
                <Crown className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-400 mb-2">
                Professional
              </span>
              <h3 className="font-serif text-4xl mb-6 text-gold-100">
                $229<span className="text-sm font-sans text-gold-500/50 font-light">/mo</span>
              </h3>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-gold-500/30 to-transparent mb-6"></div>
              <ul className="text-xs text-beige-200/80 space-y-4 mb-8 font-light flex-grow">
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  Unlimited Video Uploads
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  Advanced Analytics
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  AI Video Generation
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  Interactive Video Funnels
                </li>
              </ul>
              <Link
                href="/signup"
                className="w-full py-3 bg-gold-500 text-void font-bold text-[10px] uppercase tracking-widest hover:bg-gold-300 transition-all"
              >
                Select Plan
              </Link>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="membership-card group relative p-1 bg-gradient-to-b from-white/10 to-transparent border border-white/5 overflow-hidden">
            <div className="absolute inset-0 bg-void/90 m-[1px]"></div>
            <div className="relative p-8 h-full flex flex-col items-center text-center z-10">
              <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center mb-6 text-white/40 group-hover:text-gold-500 group-hover:border-gold-500/50 transition-colors">
                <Gem className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-2">
                Enterprise
              </span>
              <h3 className="font-serif text-3xl mb-6 text-beige-100">
                $449<span className="text-sm font-sans text-white/30 font-light">/mo</span>
              </h3>
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>
              <ul className="text-xs text-beige-200/60 space-y-4 mb-8 font-light flex-grow">
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  Everything in Professional
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  White-Label Options
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  API Access
                </li>
                <li className="flex items-center gap-3">
                  <Check className="w-3 h-3 text-gold-500" />
                  Dedicated Support
                </li>
              </ul>
              <Link
                href="/signup"
                className="w-full py-3 border border-white/10 text-[10px] uppercase tracking-widest hover:bg-white hover:text-black transition-all"
              >
                Select Plan
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black py-20 px-6">
        <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-12">
          <div className="text-center md:text-left">
            <h4 className="font-serif text-2xl text-gold-100 tracking-widest uppercase mb-4">
              VideoSite.IO
            </h4>
            <p className="text-white/30 text-xs max-w-xs leading-relaxed font-light">
              Video-first lead generation platform with AI-powered insights and interactive funnels.
            </p>
          </div>

          <div className="flex gap-16">
            <div className="flex flex-col gap-4 text-center md:text-left">
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest">
                Product
              </span>
              <Link href="/dashboard" className="text-xs text-white/50 hover:text-white transition-colors font-light">
                Dashboard
              </Link>
              <Link href="/dashboard/videos" className="text-xs text-white/50 hover:text-white transition-colors font-light">
                Videos
              </Link>
              <Link href="/dashboard/analytics" className="text-xs text-white/50 hover:text-white transition-colors font-light">
                Analytics
              </Link>
            </div>
            <div className="flex flex-col gap-4 text-center md:text-left">
              <span className="text-[10px] font-bold text-gold-500 uppercase tracking-widest">
                Company
              </span>
              <Link href="/about" className="text-xs text-white/50 hover:text-white transition-colors font-light">
                About
              </Link>
              <Link href="/pricing" className="text-xs text-white/50 hover:text-white transition-colors font-light">
                Pricing
              </Link>
              <Link href="/contact" className="text-xs text-white/50 hover:text-white transition-colors font-light">
                Contact
              </Link>
            </div>
          </div>
        </div>
        <div className="max-w-screen-2xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-white/20 uppercase tracking-widest">
            © 2025 VideoSite.IO. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-[10px] text-white/20 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">
              Privacy
            </Link>
            <Link href="/terms" className="text-[10px] text-white/20 uppercase tracking-widest hover:text-white cursor-pointer transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes textReveal {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes heroTitle {
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}

