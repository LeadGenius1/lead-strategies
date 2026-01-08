'use client'

import { useEffect } from 'react'
import Script from 'next/script'

export default function HomePage() {
  useEffect(() => {
    // Generate animated stars
    function createStars() {
      const starsContainer = document.getElementById('stars')
      if (!starsContainer) return
      
      const starCount = 100
      for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div')
        star.className = 'star'
        star.style.width = Math.random() * 3 + 'px'
        star.style.height = star.style.width
        star.style.left = Math.random() * 100 + '%'
        star.style.top = Math.random() * 100 + '%'
        star.style.animationDelay = Math.random() * 3 + 's'
        starsContainer.appendChild(star)
      }
    }

    createStars()
  }, [])

  useEffect(() => {
    // Initialize AOS after script loads
    const initAOS = () => {
      if (typeof window !== 'undefined' && window.AOS) {
        window.AOS.init({
          duration: 1000,
          once: true,
          offset: 100
        })
      } else {
        setTimeout(initAOS, 100)
      }
    }
    initAOS()
  }, [])

  useEffect(() => {
    // Initialize Typed.js after script loads
    const initTyped = () => {
      if (typeof window !== 'undefined' && window.Typed) {
        const typedElement = document.getElementById('typed-text')
        if (typedElement && !typedElement.dataset.initialized) {
          typedElement.dataset.initialized = 'true'
          new window.Typed('#typed-text', {
            strings: [
              'Unify LinkedIn, Instagram, Facebook, and 19+ more channels',
              'Automate responses with AI-powered intelligence',
              'Boost engagement across every platform simultaneously'
            ],
            typeSpeed: 50,
            backSpeed: 30,
            backDelay: 2000,
            loop: true
          })
        }
      } else {
        setTimeout(initTyped, 100)
      }
    }
    initTyped()
  }, [])

  const handleContactSubmit = (e) => {
    e.preventDefault()
    // Placeholder - can integrate with EmailJS later
    alert('Message sent! We\'ll get back to you within 24 hours.')
    e.target.reset()
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white overflow-x-hidden min-h-screen">
      <Script src="https://code.iconify.design/2/2.2.1/iconify.min.js" strategy="afterInteractive" />
      <Script src="https://unpkg.com/aos@2.3.1/dist/aos.js" strategy="afterInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/typed.js@2.0.12" strategy="afterInteractive" />
      
      {/* Animated Stars Background */}
      <div className="stars" id="stars"></div>
      
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-body font-bold">CC</span>
              </div>
              <span className="text-title font-bold hidden sm:inline">Client Contact AI</span>
            </div>
            
            <div className="hidden md:flex space-x-6 lg:space-x-8">
              <a href="#features" className="text-body text-gray-300 hover:text-white transition">Features</a>
              <a href="#platforms" className="text-body text-gray-300 hover:text-white transition">Platforms</a>
              <a href="#pricing" className="text-body text-gray-300 hover:text-white transition">Pricing</a>
              <a href="#contact" className="text-body text-gray-300 hover:text-white transition">Contact</a>
            </div>
            
            <a href="/signup" className="btn-primary bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg text-body font-semibold">
              Start Free Trial
            </a>
          </div>
        </div>
      </nav>
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto text-center relative z-10">
          <div data-aos="fade-up" data-aos-duration="1000">
            <h1 className="text-hero mb-4 sm:mb-6">
              Manage <span className="gradient-text">22+ Channels</span><br />From One Dashboard
            </h1>
            <p className="text-headline text-gray-300 max-w-3xl mx-auto mb-8 sm:mb-10 px-4">
              <span id="typed-text"></span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a href="/signup" className="btn-primary bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-title font-semibold w-full sm:w-auto">
                Get Started Free
              </a>
              <button className="glass text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-title font-semibold hover:bg-white/10 transition w-full sm:w-auto">
                Watch Demo
              </button>
            </div>
          </div>
          
          {/* Platform Icons Grid */}
          <div className="mt-12 sm:mt-16 grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-11 gap-4 sm:gap-6 max-w-6xl mx-auto" data-aos="fade-up" data-aos-delay="200">
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="iconify text-2xl sm:text-3xl text-blue-400" data-icon="mdi:linkedin"></span>
            </div>
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="iconify text-2xl sm:text-3xl text-pink-400" data-icon="mdi:instagram"></span>
            </div>
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="iconify text-2xl sm:text-3xl text-blue-500" data-icon="mdi:facebook"></span>
            </div>
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="iconify text-2xl sm:text-3xl text-sky-400" data-icon="mdi:twitter"></span>
            </div>
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="iconify text-2xl sm:text-3xl text-white" data-icon="ic:baseline-tiktok"></span>
            </div>
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="iconify text-2xl sm:text-3xl text-red-500" data-icon="mdi:youtube"></span>
            </div>
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="iconify text-2xl sm:text-3xl text-gray-300" data-icon="mdi:email"></span>
            </div>
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="iconify text-2xl sm:text-3xl text-green-400" data-icon="mdi:message-text"></span>
            </div>
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="iconify text-2xl sm:text-3xl text-green-500" data-icon="mdi:whatsapp"></span>
            </div>
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="iconify text-2xl sm:text-3xl text-blue-400" data-icon="mdi:telegram"></span>
            </div>
            <div className="glass-strong p-3 sm:p-4 rounded-xl hover:scale-110 transition-transform">
              <span className="text-body sm:text-title font-bold text-purple-400">+12</span>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16" data-aos="fade-up">
            <h2 className="text-display mb-4">Powerful Features</h2>
            <p className="text-headline text-gray-400 max-w-2xl mx-auto">Everything you need to manage multi-channel outreach</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="glass p-6 sm:p-8 rounded-2xl hover:bg-white/10 transition" data-aos="fade-up" data-aos-delay="0">
              <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <span className="iconify text-2xl text-white" data-icon="mdi:inbox-multiple"></span>
              </div>
              <h3 className="text-title mb-3">Unified Inbox</h3>
              <p className="text-body text-gray-400">Manage all messages from 22+ platforms in one beautiful interface</p>
            </div>
            
            <div className="glass p-6 sm:p-8 rounded-2xl hover:bg-white/10 transition" data-aos="fade-up" data-aos-delay="100">
              <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <span className="iconify text-2xl text-white" data-icon="mdi:robot"></span>
              </div>
              <h3 className="text-title mb-3">AI-Powered Content</h3>
              <p className="text-body text-gray-400">Generate personalized messages with advanced AI across all channels</p>
            </div>
            
            <div className="glass p-6 sm:p-8 rounded-2xl hover:bg-white/10 transition" data-aos="fade-up" data-aos-delay="200">
              <div className="w-12 h-12 bg-pink-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <span className="iconify text-2xl text-white" data-icon="mdi:chart-line"></span>
              </div>
              <h3 className="text-title mb-3">Real-Time Analytics</h3>
              <p className="text-body text-gray-400">Track engagement, response rates, and ROI across all platforms</p>
            </div>
            
            <div className="glass p-6 sm:p-8 rounded-2xl hover:bg-white/10 transition" data-aos="fade-up" data-aos-delay="300">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <span className="iconify text-2xl text-white" data-icon="mdi:calendar-clock"></span>
              </div>
              <h3 className="text-title mb-3">Smart Scheduling</h3>
              <p className="text-body text-gray-400">AI-optimized posting times for maximum engagement on each platform</p>
            </div>
            
            <div className="glass p-6 sm:p-8 rounded-2xl hover:bg-white/10 transition" data-aos="fade-up" data-aos-delay="400">
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <span className="iconify text-2xl text-white" data-icon="mdi:account-multiple"></span>
              </div>
              <h3 className="text-title mb-3">Team Collaboration</h3>
              <p className="text-body text-gray-400">Assign conversations, leave notes, and work together seamlessly</p>
            </div>
            
            <div className="glass p-6 sm:p-8 rounded-2xl hover:bg-white/10 transition" data-aos="fade-up" data-aos-delay="500">
              <div className="w-12 h-12 bg-yellow-600 rounded-xl flex items-center justify-center mb-4 sm:mb-6">
                <span className="iconify text-2xl text-white" data-icon="mdi:target"></span>
              </div>
              <h3 className="text-title mb-3">Lead Generation</h3>
              <p className="text-body text-gray-400">Find and engage qualified prospects automatically with AI</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Platforms Section */}
      <section id="platforms" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16" data-aos="fade-up">
            <h2 className="text-display mb-4">Supported Platforms</h2>
            <p className="text-headline text-gray-400 max-w-2xl mx-auto">Connect with your audience everywhere they are</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {['LinkedIn', 'Instagram', 'Facebook', 'Twitter/X', 'TikTok', 'YouTube', 'Email', 'SMS', 'WhatsApp', 'Telegram', 'Discord', 'Reddit'].map((platform, idx) => (
              <div key={idx} className="glass-strong p-4 sm:p-6 rounded-xl text-center hover:scale-105 transition" data-aos="fade-up">
                <span className={`iconify text-4xl sm:text-5xl mb-2 sm:mb-3 ${
                  platform === 'LinkedIn' ? 'text-blue-400' :
                  platform === 'Instagram' ? 'text-pink-400' :
                  platform === 'Facebook' ? 'text-blue-500' :
                  platform === 'Twitter/X' ? 'text-sky-400' :
                  platform === 'TikTok' ? 'text-white' :
                  platform === 'YouTube' ? 'text-red-500' :
                  platform === 'Email' ? 'text-gray-300' :
                  platform === 'SMS' ? 'text-green-400' :
                  platform === 'WhatsApp' ? 'text-green-500' :
                  platform === 'Telegram' ? 'text-blue-400' :
                  platform === 'Discord' ? 'text-purple-400' :
                  'text-orange-500'
                }`} data-icon={
                  platform === 'LinkedIn' ? 'mdi:linkedin' :
                  platform === 'Instagram' ? 'mdi:instagram' :
                  platform === 'Facebook' ? 'mdi:facebook' :
                  platform === 'Twitter/X' ? 'mdi:twitter' :
                  platform === 'TikTok' ? 'ic:baseline-tiktok' :
                  platform === 'YouTube' ? 'mdi:youtube' :
                  platform === 'Email' ? 'mdi:email' :
                  platform === 'SMS' ? 'mdi:message-text' :
                  platform === 'WhatsApp' ? 'mdi:whatsapp' :
                  platform === 'Telegram' ? 'mdi:telegram' :
                  platform === 'Discord' ? 'mdi:discord' :
                  'mdi:reddit'
                }></span>
                <p className="text-body font-medium">{platform}</p>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-8 sm:mt-10" data-aos="fade-up">
            <p className="text-title text-gray-400">+ 10 more platforms including Slack, Pinterest, Snapchat, and more</p>
          </div>
        </div>
      </section>
      
      {/* Pricing Section */}
      <section id="pricing" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-12 sm:mb-16" data-aos="fade-up">
            <h2 className="text-display mb-4">Simple, Transparent Pricing</h2>
            <p className="text-headline text-gray-400">One plan with everything included</p>
          </div>
          
          <div className="glass-strong p-8 sm:p-12 rounded-3xl max-w-md mx-auto" data-aos="fade-up" data-aos-delay="200">
            <div className="text-center mb-6 sm:mb-8">
              <h3 className="text-title text-gray-400 mb-3">Client Contact AI</h3>
              <div className="flex items-baseline justify-center gap-2">
                <span className="text-display font-bold">$249</span>
                <span className="text-body text-gray-400">/month</span>
              </div>
            </div>
            
            <ul className="space-y-3 sm:space-y-4 mb-8 sm:mb-10">
              {['22+ platform integrations', 'Unlimited messages', 'AI content generation', 'Advanced analytics', 'Team collaboration tools', 'Priority support'].map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="iconify text-lg sm:text-xl text-green-400 mt-0.5" data-icon="mdi:check-circle"></span>
                  <span className="text-body text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
            
            <a href="/signup" className="btn-primary w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 sm:py-4 rounded-lg text-title font-semibold block text-center">
              Start Free Trial
            </a>
            
            <p className="text-small text-gray-400 text-center mt-4">14-day free trial • No credit card required</p>
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16" data-aos="fade-up">
            <h2 className="text-display mb-4">What Our Customers Say</h2>
            <p className="text-headline text-gray-400 max-w-2xl mx-auto">Join thousands of businesses succeeding with Client Contact AI</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              { name: 'Sarah Johnson', role: 'Marketing Director', text: '"Client Contact AI has transformed how we manage customer communication. We\'ve seen a 300% increase in engagement!"' },
              { name: 'Michael Chen', role: 'CEO, Tech Startup', text: '"The unified inbox is a game changer. We respond 5x faster across all platforms now."' },
              { name: 'Emily Rodriguez', role: 'Social Media Manager', text: '"The AI-powered content generation saves us 10+ hours per week. Absolutely worth it!"' }
            ].map((testimonial, idx) => (
              <div key={idx} className="glass p-6 sm:p-8 rounded-2xl" data-aos="fade-up" data-aos-delay={idx * 100}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="iconify text-xl text-yellow-400" data-icon="mdi:star"></span>
                  ))}
                </div>
                <p className="text-body text-gray-300 mb-6">{testimonial.text}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full"></div>
                  <div>
                    <p className="text-body font-semibold">{testimonial.name}</p>
                    <p className="text-small text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 sm:p-12 lg:p-16 text-center" data-aos="fade-up">
            <h2 className="text-display mb-4 sm:mb-6">Ready to Transform Your Outreach?</h2>
            <p className="text-headline text-white/90 mb-8 sm:mb-10 max-w-2xl mx-auto">Join thousands of businesses using Client Contact AI to connect with customers across all channels</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/signup" className="bg-white text-purple-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-title font-semibold hover:bg-gray-100 transition w-full sm:w-auto inline-block text-center">
                Start Free Trial
              </a>
              <button className="bg-white/10 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg text-title font-semibold hover:bg-white/20 transition backdrop-blur-sm w-full sm:w-auto">
                Schedule Demo
              </button>
            </div>
            <p className="text-small text-white/80 mt-6">14-day free trial • No credit card required • Cancel anytime</p>
          </div>
        </div>
      </section>
      
      {/* Contact Form Section */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="container mx-auto max-w-2xl">
          <div className="text-center mb-12 sm:mb-16" data-aos="fade-up">
            <h2 className="text-display mb-4">Get In Touch</h2>
            <p className="text-headline text-gray-400">Have questions? We&apos;d love to hear from you</p>
          </div>
          
          <form onSubmit={handleContactSubmit} className="glass-strong p-6 sm:p-8 lg:p-10 rounded-2xl" data-aos="fade-up" data-aos-delay="200">
            <div className="mb-6">
              <label className="block text-body text-gray-300 mb-2">Name</label>
              <input type="text" name="name" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-body text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition" />
            </div>
            <div className="mb-6">
              <label className="block text-body text-gray-300 mb-2">Email</label>
              <input type="email" name="email" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-body text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition" />
            </div>
            <div className="mb-6">
              <label className="block text-body text-gray-300 mb-2">Message</label>
              <textarea name="message" rows="4" required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-body text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition resize-none"></textarea>
            </div>
            <button type="submit" className="btn-primary w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 sm:py-4 rounded-lg text-title font-semibold">
              Send Message
            </button>
          </form>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-black/30 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8 relative z-10 border-t border-white/10">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-body font-bold">CC</span>
                </div>
                <span className="text-title font-bold">Client Contact AI</span>
              </div>
              <p className="text-body text-gray-400">Multi-channel outreach platform powered by AI</p>
            </div>
            
            <div>
              <h4 className="text-title font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#features" className="text-body text-gray-400 hover:text-white transition">Features</a></li>
                <li><a href="#platforms" className="text-body text-gray-400 hover:text-white transition">Platforms</a></li>
                <li><a href="#pricing" className="text-body text-gray-400 hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-title font-semibold mb-4">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-body text-gray-400 hover:text-white transition">About</a></li>
                <li><a href="#" className="text-body text-gray-400 hover:text-white transition">Blog</a></li>
                <li><a href="#contact" className="text-body text-gray-400 hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-title font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-body text-gray-400 hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="text-body text-gray-400 hover:text-white transition">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-body text-gray-400">© 2024 AI Lead Strategies LLC. All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="iconify text-xl" data-icon="mdi:twitter"></span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="iconify text-xl" data-icon="mdi:linkedin"></span>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <span className="iconify text-xl" data-icon="mdi:facebook"></span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

