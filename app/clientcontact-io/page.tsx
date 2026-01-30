'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function ClientContactIOPage() {
  useEffect(() => {
    // Animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    // Counter animation
    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startCounters(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.counter-trigger').forEach((el) => {
      counterObserver.observe(el);
    });

    function startCounters(container: Element) {
      container.querySelectorAll('[data-target]').forEach((counter) => {
        const target = parseFloat(counter.getAttribute('data-target') || '0');
        const suffix = counter.getAttribute('data-suffix') || '';
        const prefix = counter.getAttribute('data-prefix') || '';
        let start = 0;
        const duration = 1500;
        const startTime = performance.now();

        function update(t: number) {
          const p = Math.min((t - startTime) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 4);
          counter.innerHTML = prefix + (target * ease).toFixed(target % 1 === 0 ? 0 : 1) + suffix;
          if (p < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
      });
    }

    return () => {
      observer.disconnect();
      counterObserver.disconnect();
    };
  }, []);

  const channels = [
    { name: 'Gmail', icon: '📧' },
    { name: 'Outlook', icon: '📧' },
    { name: 'SMS (Twilio)', icon: '💬' },
    { name: 'WhatsApp', icon: '💚' },
    { name: 'LinkedIn', icon: '💼' },
    { name: 'Facebook Messenger', icon: '💙' },
    { name: 'Instagram DMs', icon: '📷' },
    { name: 'Twitter DMs', icon: '🐦' },
    { name: 'TikTok Messages', icon: '🎵' },
    { name: 'YouTube Comments', icon: '📺' },
    { name: 'Slack', icon: '💬' },
    { name: 'Microsoft Teams', icon: '👥' },
    { name: 'Intercom', icon: '💬' },
    { name: 'Drift', icon: '💬' },
    { name: 'Live Chat', icon: '💬' },
    { name: 'Website Forms', icon: '📝' },
    { name: 'Phone (VoIP)', icon: '📞' },
    { name: 'Telegram', icon: '✈️' },
    { name: 'WeChat', icon: '💬' },
    { name: 'Discord', icon: '🎮' },
    { name: 'Reddit Messages', icon: '🔴' },
    { name: 'Google Business', icon: '🔍' },
    { name: 'Apple Business Chat', icon: '🍎' }
  ];

  return (
    <div className="relative overflow-x-hidden">
      {/* Grid Background */}
      <div className="grid-overlay">
        <div className="grid-inner">
          <div className="grid-line-v"></div>
          <div className="grid-line-v hidden md:block"></div>
          <div className="grid-line-v hidden lg:block"></div>
          <div className="grid-line-v"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4 [animation:animationIn_0.8s_ease-out_0.1s_both] animate-on-scroll">
        <div className="border-subtle flex bg-black/90 w-full max-w-4xl border pt-2 pr-2 pb-2 pl-2 shadow-2xl backdrop-blur-xl gap-x-1 gap-y-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-5 py-2 text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            AI LEAD
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            <Link href="/leadsite-ai" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              LeadSite.AI
            </Link>
            <Link href="/leadsite-io" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              LeadSite.IO
            </Link>
          </div>

          <div className="px-6 text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            AI LEAD
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Link href="/clientcontact-io" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-white font-geist">
              ClientContact
            </Link>
            <Link href="/videosite-io" className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist">
              VideoSite
            </Link>
          </div>

          <Link href="/signup" className="group relative bg-white text-black px-6 py-2 text-xs font-semibold tracking-widest uppercase transition-transform overflow-hidden">
            <span className="relative z-10 font-geist">Start Free Trial</span>
            <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left bg-neutral-200"></div>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden z-10">
        <div className="container mx-auto px-4 relative max-w-7xl">
          <div className="flex flex-col text-center mb-24 relative space-y-0 items-center justify-center">
            <div className="flex flex-col z-10 w-full items-center justify-center">
              <h1 className="uppercase leading-[0.85] flex flex-wrap justify-center gap-x-4 md:text-9xl md:gap-x-8 text-6xl font-semibold text-white tracking-tighter mt-8 mb-0">
                <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light">
                  ONE INBOX FOR
                </span>
                <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk">
                  22+ CHANNELS
                </span>
              </h1>
            </div>

            <h2 className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-lg text-neutral-400 tracking-tight font-space-grotesk md:text-3xl mt-8 mb-6">
              Unified communication hub. AI responds automatically. Never miss a lead.
            </h2>

            {/* Animated Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto counter-trigger [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll mt-12">
              <div className="bg-[#050505] border border-subtle p-6">
                <div className="text-3xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="22" data-suffix="+">22+</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Channels</h3>
              </div>
              <div className="bg-[#050505] border border-subtle p-6">
                <div className="text-3xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="2" data-prefix="< " data-suffix=" Min">2 Min</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Response Time</h3>
              </div>
              <div className="bg-[#050505] border border-subtle p-6">
                <div className="text-3xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="94" data-suffix="%">94%</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">Customer Satisfaction</h3>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col md:flex-row gap-4 mt-12 [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll">
              <Link href="/signup" className="bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist">
                Start Free Trial
              </Link>
              <Link href="#channels" className="bg-transparent border border-subtle text-white px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist">
                See All Channels
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Channel Grid */}
      <section id="channels" className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              All Your <span className="text-gradient">Channels</span>
            </h2>
            <p className="text-neutral-400 font-geist">22+ platforms unified in one inbox</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {channels.map((channel, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all flex flex-col items-center justify-center text-center [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.02 * index}s` }}
              >
                <div className="text-3xl mb-2">{channel.icon}</div>
                <div className="text-xs text-neutral-400 font-geist uppercase tracking-wider">{channel.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Powerful <span className="text-gradient">Features</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Unified Inbox',
                desc: 'All channels in single view, AI prioritizes urgent messages',
                icon: '📥'
              },
              {
                title: 'AI Auto-Responder',
                desc: 'Claude answers common questions 24/7, books meetings',
                icon: '🤖'
              },
              {
                title: 'Smart Routing',
                desc: 'Routes conversations to right team member based on topic',
                icon: '🎯'
              },
              {
                title: 'Sentiment Analysis',
                desc: 'Detects frustrated customers, escalates to manager',
                icon: '😊'
              },
              {
                title: 'Canned Responses',
                desc: 'Save templates, AI suggests best response per context',
                icon: '📝'
              },
              {
                title: 'Team Collaboration',
                desc: 'Internal notes, @mentions, private threads',
                icon: '👥'
              },
              {
                title: 'Performance Analytics',
                desc: 'Response times, resolution rates, CSAT scores',
                icon: '📊'
              },
              {
                title: 'Mobile App',
                desc: 'iOS + Android, push notifications, respond on-the-go',
                icon: '📱'
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.05 * index}s` }}
              >
                <div className="text-3xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-space-grotesk text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-neutral-400 font-geist leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              How It <span className="text-gradient">Works</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { step: '01', title: 'Connect Channels', desc: 'OAuth login, 5-minute setup per platform' },
              { step: '02', title: 'AI Learns Your Brand', desc: 'Train on your FAQ, tone, policies' },
              { step: '03', title: 'Messages Flow In', desc: 'Unified inbox shows all conversations' },
              { step: '04', title: 'AI Responds or Routes', desc: 'Handles 70% automatically, routes complex to humans' }
            ].map((item, index) => (
              <div
                key={index}
                className="relative [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent z-0" style={{ width: 'calc(100% - 2rem)' }}></div>
                )}
                <div className="relative z-10 bg-[#050505] border border-purple-500/20 p-8">
                  <div className="text-purple-400 text-sm font-geist mb-4">{item.step}</div>
                  <h3 className="text-xl font-space-grotesk text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-neutral-400 font-geist">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Auto-Responder Showcase */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              AI Auto-Responder <span className="text-gradient">Showcase</span>
            </h2>
          </div>

          <div className="bg-[#050505] border border-purple-500/20 p-8 md:p-12 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">👤</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-neutral-500 font-geist mb-1">Customer</div>
                  <div className="bg-neutral-900 border border-subtle p-4 rounded-lg">
                    <p className="text-white font-geist">What are your business hours?</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-purple-400 font-geist mb-1">AI Assistant</div>
                  <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                    <p className="text-white font-geist">We're open Monday-Friday 9am-6pm EST. I can also schedule a callback if you prefer!</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">👤</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-neutral-500 font-geist mb-1">Customer</div>
                  <div className="bg-neutral-900 border border-subtle p-4 rounded-lg">
                    <p className="text-white font-geist">Can I get a demo?</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg">🤖</span>
                </div>
                <div className="flex-1">
                  <div className="text-xs text-purple-400 font-geist mb-1">AI Assistant</div>
                  <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-lg">
                    <p className="text-white font-geist">Absolutely! I have openings tomorrow at 2pm or Thursday at 10am. Which works better?</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-subtle flex flex-wrap gap-4 justify-center">
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs uppercase tracking-wider font-geist">AI Context Aware</span>
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs uppercase tracking-wider font-geist">Human-Like Tone</span>
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs uppercase tracking-wider font-geist">Books Meetings</span>
              <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs uppercase tracking-wider font-geist">Escalates When Needed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Response Time Comparison */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Response Time <span className="text-gradient">Comparison</span>
            </h2>
          </div>

          <div className="bg-[#050505] border border-subtle p-8 md:p-12 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            <div className="space-y-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-400 font-geist">Before ClientContact</span>
                  <span className="text-red-400 font-space-grotesk text-xl">4.2 hours</span>
                </div>
                <div className="h-8 bg-red-500/20 border border-red-500/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-red-500/30" style={{ width: '100%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-neutral-400 font-geist">After ClientContact</span>
                  <span className="text-green-400 font-space-grotesk text-xl">1.8 minutes</span>
                </div>
                <div className="h-8 bg-green-500/20 border border-green-500/30 relative overflow-hidden">
                  <div className="absolute inset-0 bg-green-500/30" style={{ width: '5%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Simple <span className="text-gradient">Pricing</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Starter */}
            <div className="bg-[#050505] border border-subtle p-8 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Starter</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $149<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  3 team seats
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  10 channels
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  1,000 conversations/month
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Basic AI responses
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Email support
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-white text-black px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                Start Trial
              </Link>
            </div>

            {/* Professional */}
            <div className="bg-gradient-to-br from-purple-950/20 to-[#050505] border border-purple-500/30 p-8 relative overflow-hidden [animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
              <div className="absolute top-4 right-4 px-2 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-wider font-geist">
                Popular
              </div>
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Professional</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $499<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  10 team seats
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  All 22 channels
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  10,000 conversations/month
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Advanced AI training
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Sentiment analysis
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Priority support
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-white text-black px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist text-center">
                Start Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-[#050505] border border-subtle p-8 [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
              <h3 className="text-2xl font-space-grotesk text-white mb-2">Enterprise</h3>
              <div className="text-4xl font-space-grotesk font-light text-white mb-6">
                $4,999<span className="text-sm text-neutral-500">/mo</span>
              </div>
              <ul className="space-y-3 font-geist text-sm text-neutral-300 mb-8">
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Unlimited team seats
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  White-label option
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Unlimited conversations
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Custom AI training
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  Dedicated CSM
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                  SLA guarantee
                </li>
              </ul>
              <Link href="/signup" className="block w-full bg-transparent border border-purple-500/30 text-white px-6 py-3 text-sm font-bold tracking-widest uppercase hover:bg-purple-500/10 transition-colors font-geist text-center">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              See ClientContact.IO <span className="text-gradient">in Action</span>
            </h2>
          </div>

          <div className="relative aspect-video bg-[#050505] border border-subtle [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center cursor-pointer hover:bg-purple-500/30 transition-colors">
                <svg className="w-10 h-10 text-purple-400 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Showcase */}
      <section className="py-24 relative z-10 border-t border-subtle bg-gradient-to-b from-black to-purple-950/5">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              CRM <span className="text-gradient">Integrations</span>
            </h2>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-6 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            {['Salesforce', 'HubSpot', 'Pipedrive', 'Zoho', 'Monday.com'].map((name, index) => (
              <div
                key={index}
                className="bg-[#050505] border border-subtle p-6 flex items-center justify-center hover:border-purple-500/30 transition-colors"
              >
                <span className="text-neutral-400 font-geist text-sm uppercase tracking-wider">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Related Platforms */}
      <section className="py-24 relative z-10 border-t border-subtle">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-12 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            <h2 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Complete <span className="text-gradient">Ecosystem</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'LeadSite.AI', desc: 'AI lead scoring and enrichment', href: '/leadsite-ai' },
              { name: 'LeadSite.IO', desc: 'Website builder to capture more leads', href: '/leadsite-io' },
              { name: 'VideoSite.IO', desc: 'AI video marketing platform', href: '/videosite-io' }
            ].map((platform, index) => (
              <Link
                key={index}
                href={platform.href}
                className="bg-[#050505] border border-subtle p-6 hover:border-purple-500/30 transition-all [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll"
                style={{ animationDelay: `${0.1 * index}s` }}
              >
                <h3 className="text-lg font-space-grotesk text-white mb-2">{platform.name}</h3>
                <p className="text-sm text-neutral-400 font-geist mb-4">{platform.desc}</p>
                <span className="text-purple-400 font-geist text-sm uppercase tracking-widest">Learn More →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-subtle bg-center z-10 border-t pt-32 pb-32 relative">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="md:text-8xl uppercase text-5xl font-light text-white tracking-tighter font-space-grotesk mb-8 [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll">
            Never Miss a <span className="text-gradient">Lead Again</span>
          </h2>
          <p className="text-xl text-neutral-400 font-geist mb-10 [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll">
            Join 1,800+ teams using unified inbox with AI auto-responses
          </p>
          <div className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll">
            <Link href="/signup" className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist">
              Start Free 14-Day Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle bg-black pt-12 pb-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
              <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse"></div>
              AI LEAD STRATEGIES
            </div>
            <div className="flex gap-8 text-xs font-geist text-neutral-500 uppercase tracking-widest">
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
              <Link href="#" className="hover:text-white transition-colors">Security</Link>
            </div>
          </div>

          <div className="border-t border-subtle pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] uppercase tracking-widest text-neutral-600">
            <p className="font-geist">© 2025 AI Lead Strategies LLC. All Rights Reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link href="#" className="hover:text-white transition-colors font-geist">Twitter</Link>
              <Link href="#" className="hover:text-white transition-colors font-geist">LinkedIn</Link>
              <Link href="#" className="hover:text-white transition-colors font-geist">GitHub</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
