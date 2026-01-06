'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

export default function HomePage() {
  const [countersStarted, setCountersStarted] = useState(false)
  const [activeStep, setActiveStep] = useState('1')
  const counterTriggerRef = useRef(null)
  const scrollRevealRef = useRef(null)
  const wordsRef = useRef([])
  const workflowStepsRef = useRef([])

  // Animation on scroll observer
  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .animate-on-scroll { animation-play-state: paused !important; }
      .animate-on-scroll.animate { animation-play-state: running !important; }
    `
    document.head.appendChild(style)

    if (!window.__inViewIO) {
      window.__inViewIO = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('animate')
              window.__inViewIO.unobserve(entry.target)
            }
          })
        },
        { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
      )
    }

    const initAnimations = () => {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        window.__inViewIO.observe(el)
      })
    }

    initAnimations()
  }, [])

  // Counter animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !countersStarted) {
            startCounters(entry.target)
            setCountersStarted(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1 }
    )

    if (counterTriggerRef.current) {
      observer.observe(counterTriggerRef.current)
    }

    return () => observer.disconnect()
  }, [countersStarted])

  const startCounters = (container) => {
    container.querySelectorAll('[data-target]').forEach((counter) => {
      const target = parseFloat(counter.getAttribute('data-target'))
      const suffix = counter.getAttribute('data-suffix') || ''
      const prefix = counter.getAttribute('data-prefix') || ''
      let start = 0
      const duration = 1500
      const startTime = performance.now()

      function update(t) {
        const p = Math.min((t - startTime) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 4)
        counter.innerText =
          prefix + (target * ease).toFixed(target % 1 === 0 ? 0 : 1) + suffix
        if (p < 1) requestAnimationFrame(update)
      }
      requestAnimationFrame(update)
    })
  }

  // Text reveal on scroll
  useEffect(() => {
    const textSection = scrollRevealRef.current
    if (!textSection) return

    const words = textSection.querySelectorAll('.reveal-word')
    wordsRef.current = Array.from(words)

    const handleScroll = () => {
      const rect = textSection.getBoundingClientRect()
      const winH = window.innerHeight
      const startReveal = winH * 0.9
      const endReveal = winH * 0.4
      let progress = (startReveal - rect.top) / (startReveal - endReveal)
      progress = Math.max(0, Math.min(1, progress))
      const activeCount = Math.floor(progress * words.length)

      words.forEach((w, i) => {
        if (i < activeCount) {
          w.classList.add('active')
        } else {
          w.classList.remove('active')
        }
      })
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Workflow steps observer
  useEffect(() => {
    const workflowSteps = document.querySelectorAll('.workflow-step-content')
    workflowStepsRef.current = Array.from(workflowSteps)

    const stepObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = entry.target.getAttribute('data-step')
            setActiveStep(index)
          }
        })
      },
      { rootMargin: '-40% 0px -40% 0px' }
    )

    workflowSteps.forEach((step) => stepObserver.observe(step))

    return () => stepObserver.disconnect()
  }, [])

  return (
    <div className="min-h-screen relative">
      {/* Background Component */}
      <div
        className="aura-background-component fixed top-0 w-full h-screen"
        data-alpha-mask="80"
        style={{
          maskImage:
            'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)',
          WebkitMaskImage:
            'linear-gradient(to bottom, transparent, black 0%, black 80%, transparent)',
        }}
      >
        <div className="aura-background-component top-0 w-full -z-10 absolute h-full">
          <div
            data-us-project="ZHhDKfVqqu8PKOSMwfuA"
            className="absolute w-full h-full left-0 top-0 -z-10"
          ></div>
          <script
            type="text/javascript"
            dangerouslySetInnerHTML={{
              __html: `!function(){if(!window.UnicornStudio){window.UnicornStudio={isInitialized:!1};var i=document.createElement("script");i.src="https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.29/dist/unicornStudio.umd.js",i.onload=function(){window.UnicornStudio.isInitialized||(UnicornStudio.init(),window.UnicornStudio.isInitialized=!0)},(document.head || document.body).appendChild(i)}}();`,
            }}
          />
        </div>
      </div>

      {/* Container-Size Grid Background */}
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
          <Link
            href="/"
            className="bg-white/5 hover:bg-white/10 px-5 py-2 text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist"
          >
            LeadSite.AI
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <a
              href="#strategy"
              className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist"
            >
              Strategy
            </a>
            <a
              href="#workflows"
              className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist"
            >
              Workflows
            </a>
          </div>

          <div className="px-6 text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
            LEAD
          </div>

          <div className="hidden md:flex items-center gap-1">
            <a
              href="#results"
              className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist"
            >
              Results
            </a>
            <a
              href="#contact"
              className="hover:text-white px-4 py-2 text-xs tracking-widest uppercase transition-colors text-neutral-500 font-geist"
            >
              Contact
            </a>
          </div>

          <Link
            href="/signup"
            className="group relative bg-white text-black px-6 py-2 text-xs font-semibold tracking-widest uppercase transition-transform overflow-hidden"
          >
            <span className="relative z-10 font-geist">Start Free Trial</span>
            <div className="absolute inset-0 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left bg-neutral-200"></div>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 overflow-hidden z-10">
        <div className="container mx-auto px-4 relative max-w-7xl">
          <div className="flex flex-col text-center mb-24 relative space-y-0 items-center justify-center">
            {/* Version Tag */}
            <div className="absolute -left-4 md:left-20 top-0 flex flex-col gap-2 opacity-30 hidden lg:flex [animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll">
              <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist">
                Ver. 2.4
              </span>
              <div className="w-px h-12 bg-gradient-to-b to-transparent from-neutral-500"></div>
            </div>

            <div className="flex flex-col z-10 w-full items-center justify-center">
              <h1 className="uppercase leading-[0.85] flex flex-wrap justify-center gap-x-4 md:text-9xl md:gap-x-8 text-6xl font-semibold text-white tracking-tighter mt-8 mb-0">
                <span className="[animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll tracking-tighter font-space-grotesk font-light">
                  Email
                </span>
                <span className="text-gradient [animation:animationIn_0.8s_ease-out_0.3s_both] animate-on-scroll font-light tracking-tighter font-space-grotesk">
                  Campaigns
                </span>
              </h1>
            </div>

            <div className="flex flex-col md:flex-row md:mt-12 md:mb-12 z-10 w-full mt-10 mb-8 gap-x-6 gap-y-6 items-center justify-center">
              {/* Status Button with Border Beam */}
              <div className="[animation:animationIn_0.8s_ease-out_0.5s_both] animate-on-scroll group my-8 relative">
                <div className="beam-border"></div>
                <div className="border-subtle flex group-hover:bg-[#0a0a0a] transition-colors md:h-16 bg-[#080808] h-12 z-10 border rounded-full mt-[1px] mr-[1px] mb-[1px] ml-[1px] pr-6 pl-3 relative gap-x-4 gap-y-4 items-center">
                  <div className="md:w-10 md:h-10 overflow-hidden flex border-subtle text-white bg-neutral-900 w-8 h-8 border rounded-full relative items-center justify-center">
                    <Icon icon="solar:bot-line-duotone" className="text-lg text-white" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[10px] uppercase tracking-widest text-neutral-500 font-geist">
                      AI_Status
                    </span>
                    <span className="text-xs md:text-sm leading-none text-white font-geist">
                      Optimizing
                    </span>
                  </div>
                </div>
              </div>

              <h2 className="[animation:animationIn_0.8s_ease-out_0.4s_both] animate-on-scroll text-lg text-neutral-400 tracking-tight font-space-grotesk md:text-3xl">
                Automated Email Campaigns That Convert
              </h2>
            </div>

            <div className="leading-relaxed [animation:animationIn_0.8s_ease-out_0.6s_both] animate-on-scroll md:text-2xl text-xs text-neutral-500 font-space-grotesk text-center max-w-lg">
              We leverage AI to automate your email outreach, manage leads, and turn
              engagement into revenue - all for just $59/month.
            </div>
          </div>

          {/* Stats Grid */}
          <div
            ref={counterTriggerRef}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 max-w-6xl mx-auto counter-trigger [animation:animationIn_0.8s_ease-out_0.2s_both] animate-on-scroll"
          >
            {/* Card 1 */}
            <div className="bg-[#050505] border border-subtle p-8 flex flex-col justify-between min-h-[220px] relative group hover:border-white/10 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">01</div>
              <div className="flex justify-between items-start">
                <Icon
                  icon="solar:chart-2-bold-duotone"
                  className="text-2xl text-neutral-300"
                />
                <div className="px-2 py-0.5 border border-green-900/30 bg-green-900/10 text-green-400 text-[10px] uppercase tracking-wider font-geist">
                  Live
                </div>
              </div>
              <div className="">
                <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="400" data-prefix="+" data-suffix="%">
                    +400%
                  </span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">
                  Reach Lift
                </h3>
              </div>
            </div>
            {/* Card 2 */}
            <div className="bg-[#050505] border border-subtle p-8 flex flex-col justify-between min-h-[220px] relative group hover:border-white/10 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">02</div>
              <div className="flex justify-between items-start">
                <Icon
                  icon="solar:users-group-two-rounded-bold-duotone"
                  className="text-2xl text-neutral-300"
                />
              </div>
              <div className="">
                <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="12.5" data-suffix="k">12.5k</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">
                  Leads Generated
                </h3>
              </div>
            </div>
            {/* Card 3 */}
            <div className="bg-[#050505] border border-subtle p-8 flex flex-col justify-between min-h-[220px] relative group hover:border-white/10 transition-colors">
              <div className="absolute top-4 right-4 text-xs text-white/20 font-geist">03</div>
              <div className="flex justify-between items-start">
                <Icon icon="solar:bolt-bold-duotone" className="text-2xl text-neutral-300" />
              </div>
              <div className="">
                <div className="text-4xl text-white mb-1 tracking-tighter font-space-grotesk font-light">
                  <span data-target="10" data-suffix="x">10x</span>
                </div>
                <h3 className="text-xs uppercase tracking-widest text-neutral-500 font-geist">
                  Execution Speed
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Scroll Text Section */}
      <section
        ref={scrollRevealRef}
        className="border-y border-subtle overflow-hidden bg-black pt-32 pb-32 relative"
        id="scroll-reveal-section"
      >
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto text-center leading-tight">
            <h2 className="text-3xl md:text-5xl tracking-tight uppercase leading-[1.3] font-semibold text-white">
              <span className="reveal-word font-space-grotesk font-light">Stop</span>{' '}
              <span className="reveal-word font-space-grotesk font-light">guessing.</span>{' '}
              <span className="reveal-word font-space-grotesk font-light">Start</span>
              <span className="reveal-word inline-flex align-middle bg-white/5 border border-subtle px-4 py-1 mx-1 text-white font-space-grotesk font-light">
                <Icon
                  icon="solar:cpu-bold-duotone"
                  className="text-2xl mr-2 text-neutral-300"
                />
                Scaling
              </span>
              <span className="reveal-word font-space-grotesk font-light"> with</span>{' '}
              <span className="reveal-word font-space-grotesk font-light">our</span>
              <span className="reveal-word text-black bg-white px-4 py-1 mx-1 font-space-grotesk font-light">
                Email Engine
              </span>
              <span className="reveal-word font-space-grotesk font-light"> that</span>{' '}
              <span className="reveal-word font-space-grotesk font-light">turns</span>{' '}
              <span className="reveal-word font-space-grotesk font-light">leads</span>{' '}
              <span className="reveal-word font-space-grotesk font-light">into</span>
              <span className="reveal-word inline-flex align-middle border border-subtle text-white px-4 py-1 mx-1">
                <Icon icon="solar:dollar-minimalistic-bold-duotone" className="text-2xl" />
              </span>
              <span className="reveal-word font-space-grotesk font-light"> predictable</span>{' '}
              <span className="reveal-word font-space-grotesk font-light">revenue.</span>
            </h2>
          </div>
        </div>
      </section>

      {/* Workflows Section */}
      <section
        id="workflows"
        className="z-10 border-subtle bg-black border-b relative"
      >
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col lg:flex-row">
            {/* Sticky Left Side */}
            <div className="lg:w-1/2 lg:h-screen sticky top-0 flex flex-col justify-center py-12 lg:py-0 pr-0 lg:pr-20 border-r border-subtle/0 lg:border-subtle">
              <h2 className="text-5xl md:text-6xl uppercase mb-8 lg:mb-8 text-white tracking-tighter font-space-grotesk font-light">
                Growth<br />
                <span className="text-neutral-600">Protocol</span>
              </h2>

              {/* Steps Navigation */}
              <div className="space-y-6 relative mb-12 hidden lg:block">
                {/* Step 1 */}
                <div
                  className={`step-trigger group cursor-pointer flex items-center gap-6`}
                  data-step="1"
                >
                  <div className="h-12 w-[2px] bg-neutral-800 relative overflow-hidden">
                    <div
                      className={`step-indicator absolute top-0 left-0 w-full h-full ${
                        activeStep === '1' ? 'active' : ''
                      }`}
                    ></div>
                  </div>
                  <div>
                    <h3 className="text-xl uppercase tracking-widest text-white font-space-grotesk">
                      01 / Lead Management
                    </h3>
                    <p
                      className={`step-text text-sm ${
                        activeStep === '1' ? 'active' : 'text-neutral-500'
                      } font-geist`}
                    >
                      Organize and track up to 50 leads.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="step-trigger group cursor-pointer flex items-center gap-6" data-step="2">
                  <div className="h-12 w-[2px] bg-neutral-800 relative overflow-hidden">
                    <div
                      className={`step-indicator absolute top-0 left-0 w-full h-full ${
                        activeStep === '2' ? 'active' : ''
                      }`}
                    ></div>
                  </div>
                  <div>
                    <h3 className="text-xl uppercase tracking-widest text-white font-space-grotesk">
                      02 / Campaign Creation
                    </h3>
                    <p
                      className={`step-text text-sm ${
                        activeStep === '2' ? 'active' : 'text-neutral-500'
                      } font-geist`}
                    >
                      Auto-create email campaigns.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="step-trigger group cursor-pointer flex items-center gap-6" data-step="3">
                  <div className="h-12 w-[2px] bg-neutral-800 relative overflow-hidden">
                    <div
                      className={`step-indicator absolute top-0 left-0 w-full h-full ${
                        activeStep === '3' ? 'active' : ''
                      }`}
                    ></div>
                  </div>
                  <div>
                    <h3 className="text-xl uppercase tracking-widest text-white font-space-grotesk">
                      03 / Revenue Conversion
                    </h3>
                    <p
                      className={`step-text text-sm ${
                        activeStep === '3' ? 'active' : 'text-neutral-500'
                      } font-geist`}
                    >
                      Track conversions and revenue.
                    </p>
                  </div>
                </div>
              </div>

              {/* Dynamic Visual Display */}
              <div className="w-full aspect-video bg-neutral-900 border border-subtle relative overflow-hidden rounded-sm hidden lg:block">
                {/* Step 1 Visual */}
                <div
                  className={`workflow-img absolute inset-0 transition-all duration-700 ease-out flex items-center justify-center bg-black ${
                    activeStep === '1'
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'
                  }`}
                  data-step="1"
                >
                  <div className="relative z-10 text-center">
                    <Icon
                      icon="solar:users-group-two-rounded-bold-duotone"
                      className="text-4xl text-white mb-2"
                    />
                    <div className="text-xs font-mono text-green-400">MANAGING LEADS...</div>
                  </div>
                </div>
                {/* Step 2 Visual */}
                <div
                  className={`workflow-img absolute inset-0 transition-all duration-700 ease-out flex items-center justify-center bg-black ${
                    activeStep === '2'
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'
                  }`}
                  data-step="2"
                >
                  <div className="relative z-10 text-center">
                    <Icon
                      icon="solar:pen-new-square-bold-duotone"
                      className="text-4xl text-white mb-2"
                    />
                    <div className="text-xs font-mono text-blue-400">CREATING CAMPAIGNS...</div>
                  </div>
                </div>
                {/* Step 3 Visual */}
                <div
                  className={`workflow-img absolute inset-0 transition-all duration-700 ease-out flex items-center justify-center bg-black ${
                    activeStep === '3'
                      ? 'opacity-100 scale-100'
                      : 'opacity-0 scale-95'
                  }`}
                  data-step="3"
                >
                  <div className="relative z-10 text-center">
                    <Icon
                      icon="solar:check-circle-bold-duotone"
                      className="text-4xl text-white mb-2"
                    />
                    <div className="text-xs font-mono text-purple-400">CONVERSION COMPLETE</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrolling Right Side */}
            <div className="lg:w-1/2">
              <div className="h-[20vh] hidden lg:block"></div>

              {/* Step 1 Content */}
              <div
                className="workflow-step-content min-h-[50vh] lg:min-h-[80vh] flex flex-col justify-center px-0 lg:px-20 py-12 lg:py-20 border-b border-subtle"
                data-step="1"
              >
                <span className="text-6xl text-white/10 font-bold mb-6 font-space-grotesk">
                  01
                </span>
                <h3 className="text-3xl text-white mb-6 font-space-grotesk tracking-tight">
                  Lead Management
                </h3>

                <div className="w-full aspect-video bg-neutral-900 border border-subtle relative overflow-hidden rounded-sm mb-8 block lg:hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="relative z-10 text-center">
                      <Icon
                        icon="solar:users-group-two-rounded-bold-duotone"
                        className="text-4xl text-white mb-2"
                      />
                      <div className="text-xs font-mono text-green-400">MANAGING LEADS...</div>
                    </div>
                  </div>
                </div>

                <p className="text-neutral-400 leading-relaxed mb-8 font-geist">
                  Organize and track up to 50 leads with our intuitive CRM system. Import from
                  CSV, manage contact details, and track engagement status.
                </p>
                <ul className="space-y-4 font-geist text-sm text-neutral-300">
                  <li className="flex items-center gap-3">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-green-500" />
                    Lead Import & Export
                  </li>
                  <li className="flex items-center gap-3">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-green-500" />
                    Contact Management
                  </li>
                  <li className="flex items-center gap-3">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-green-500" />
                    Status Tracking
                  </li>
                </ul>
              </div>

              {/* Step 2 Content */}
              <div
                className="workflow-step-content min-h-[50vh] lg:min-h-[80vh] flex flex-col justify-center px-0 lg:px-20 py-12 lg:py-20 border-b border-subtle"
                data-step="2"
              >
                <span className="text-6xl text-white/10 font-bold mb-6 font-space-grotesk">
                  02
                </span>
                <h3 className="text-3xl text-white mb-6 font-space-grotesk tracking-tight">
                  Campaign Creation
                </h3>

                <div className="w-full aspect-video bg-neutral-900 border border-subtle relative overflow-hidden rounded-sm mb-8 block lg:hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="relative z-10 text-center">
                      <Icon
                        icon="solar:pen-new-square-bold-duotone"
                        className="text-4xl text-white mb-2"
                      />
                      <div className="text-xs font-mono text-blue-400">CREATING CAMPAIGNS...</div>
                    </div>
                  </div>
                </div>

                <p className="text-neutral-400 leading-relaxed mb-8 font-geist">
                  Create unlimited email campaigns with our easy-to-use template editor. Schedule
                  sends, personalize content, and automate follow-ups.
                </p>
                <ul className="space-y-4 font-geist text-sm text-neutral-300">
                  <li className="flex items-center gap-3">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-blue-500" />
                    Template Editor
                  </li>
                  <li className="flex items-center gap-3">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-blue-500" />
                    Scheduled Sending
                  </li>
                  <li className="flex items-center gap-3">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-blue-500" />
                    A/B Testing
                  </li>
                </ul>
              </div>

              {/* Step 3 Content */}
              <div
                className="workflow-step-content min-h-[50vh] lg:min-h-[80vh] flex flex-col justify-center px-0 lg:px-20 py-12 lg:py-20"
                data-step="3"
              >
                <span className="text-6xl text-white/10 font-bold mb-6 font-space-grotesk">
                  03
                </span>
                <h3 className="text-3xl text-white mb-6 font-space-grotesk tracking-tight">
                  Revenue Conversion
                </h3>

                <div className="w-full aspect-video bg-neutral-900 border border-subtle relative overflow-hidden rounded-sm mb-8 block lg:hidden">
                  <div className="absolute inset-0 flex items-center justify-center bg-black">
                    <div className="relative z-10 text-center">
                      <Icon
                        icon="solar:check-circle-bold-duotone"
                        className="text-4xl text-white mb-2"
                      />
                      <div className="text-xs font-mono text-purple-400">CONVERSION COMPLETE</div>
                    </div>
                  </div>
                </div>

                <p className="text-neutral-400 leading-relaxed mb-8 font-geist">
                  Track opens, clicks, and replies to optimize your campaigns. View detailed
                  analytics and measure ROI from your email outreach.
                </p>
                <ul className="space-y-4 font-geist text-sm text-neutral-300">
                  <li className="flex items-center gap-3">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-purple-500" />
                    Real-time Analytics
                  </li>
                  <li className="flex items-center gap-3">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-purple-500" />
                    Conversion Tracking
                  </li>
                  <li className="flex items-center gap-3">
                    <Icon icon="solar:check-circle-bold-duotone" className="text-purple-500" />
                    ROI Reporting
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section
        id="results"
        className="bg-black text-white pt-24 pb-12 border-t border-subtle relative z-10"
      >
        <div className="container max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 pb-8 border-b border-subtle">
            <div>
              <h2 className="text-5xl md:text-7xl uppercase mb-2 text-white tracking-tighter font-space-grotesk font-light">
                Outputs
              </h2>
              <p className="text-xs uppercase tracking-widest text-neutral-500 font-geist">
                / Case Studies / Email ROI
              </p>
            </div>
          </div>

          {/* Mosaic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 mb-20 items-stretch">
            {/* Col 1 */}
            <div className="flex flex-col gap-1 h-full">
              <div className="bg-white/[0.02] border border-subtle w-full aspect-[9/16] relative group overflow-hidden">
                <div className="absolute top-4 right-4 z-20 text-[10px] text-white/50 border border-white/5 px-2 py-0.5 font-geist">
                  MOBILE
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-purple-900/20"></div>
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-xl uppercase tracking-tight font-space-grotesk text-white">
                    Mobile Optimized
                  </h3>
                </div>
              </div>
            </div>

            {/* Col 2 */}
            <div className="flex flex-col gap-1 h-full aspect-[9/16] md:aspect-auto">
              <div className="relative flex-1 group overflow-hidden border border-subtle bg-white/[0.02]">
                <div className="absolute top-4 right-4 z-20 text-[10px] text-white/50 border border-white/5 px-2 py-0.5 font-geist">
                  WEB
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-blue-900/20"></div>
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-xl uppercase tracking-tight font-space-grotesk text-white">
                    Web Dashboard
                  </h3>
                </div>
              </div>
              <div className="relative flex-1 group overflow-hidden border border-subtle bg-white/[0.02]">
                <div className="absolute top-4 right-4 z-20 text-[10px] text-white/50 border border-white/5 px-2 py-0.5 font-geist">
                  AI
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 to-pink-900/20"></div>
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-xl uppercase tracking-tight font-space-grotesk text-white">
                    AI Powered
                  </h3>
                </div>
              </div>
              <div className="relative flex-1 group overflow-hidden border border-subtle bg-white/[0.02]">
                <div className="absolute top-4 right-4 z-20 text-[10px] text-white/50 border border-white/5 px-2 py-0.5 font-geist">
                  DATA
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 to-red-900/20"></div>
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-xl uppercase tracking-tight font-space-grotesk text-white">
                    Analytics
                  </h3>
                </div>
              </div>
            </div>

            {/* Col 3 */}
            <div className="flex flex-col gap-1 h-full">
              <div className="bg-white/[0.02] border border-subtle w-full aspect-[9/16] relative group overflow-hidden">
                <div className="absolute top-4 right-4 z-20 text-[10px] text-white/50 border border-white/5 px-2 py-0.5 font-geist">
                  APP
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-teal-900/20"></div>
                <div className="absolute bottom-6 left-6 z-20">
                  <h3 className="text-xl uppercase tracking-tight font-space-grotesk text-white">
                    Responsive Design
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="border-subtle overflow-hidden z-10 border-t pt-24 pb-24 relative">
        <div className="container mx-auto px-4 max-w-7xl mb-12">
          <h2 className="text-3xl md:text-5xl uppercase text-center text-white tracking-tighter font-space-grotesk font-light">
            Founder <span className="text-neutral-600">Feedback</span>
          </h2>
        </div>

        {/* Marquee */}
        <div className="marquee-container w-full relative overflow-hidden py-10">
          <div className="flex w-[200%] marquee-content hover:[animation-play-state:paused]">
            {/* Item Set 1 */}
            <div className="flex w-1/2 justify-around gap-6 px-4">
              <div className="w-[400px] border border-subtle p-8 bg-[#050505] shrink-0">
                <p className="text-sm leading-relaxed mb-6 text-neutral-300 font-geist">
                  &quot;LeadSite.AI didn&apos;t just automate our email campaigns, they
                  fundamentally changed our lead generation. We scaled to 12.5k leads.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded">
                    <Icon icon="solar:user-bold-duotone" className="text-xl text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-white uppercase font-bold font-geist">
                      Sarah Jenks
                    </div>
                    <div className="text-[10px] text-neutral-500 uppercase font-geist">
                      CMO, TechCorp
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[400px] border border-subtle p-8 bg-[#050505] shrink-0">
                <p className="text-sm leading-relaxed mb-6 text-neutral-300 font-geist">
                  &quot;The precision in targeting is unlike anything we&apos;ve seen. We reduced
                  our CPA by 40% while doubling our email output.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded">
                    <Icon icon="solar:user-bold-duotone" className="text-xl text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-white uppercase font-bold font-geist">
                      David K.
                    </div>
                    <div className="text-[10px] text-neutral-500 uppercase font-geist">
                      VP, StartupXYZ
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[400px] border border-subtle p-8 bg-[#050505] shrink-0">
                <p className="text-sm leading-relaxed mb-6 text-neutral-300 font-geist">
                  &quot;Automated email funnels are bringing us qualified leads while we sleep. The
                  ROI was evident within the first 14 days.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded">
                    <Icon icon="solar:user-bold-duotone" className="text-xl text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-white uppercase font-bold font-geist">
                      Elena R.
                    </div>
                    <div className="text-[10px] text-neutral-500 uppercase font-geist">
                      CEO, GrowthCo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Item Set 2 (Duplicate) */}
            <div className="flex w-1/2 justify-around gap-6 px-4">
              <div className="w-[400px] border border-subtle p-8 bg-[#050505] shrink-0">
                <p className="text-sm leading-relaxed mb-6 text-neutral-300 font-geist">
                  &quot;LeadSite.AI didn&apos;t just automate our email campaigns, they
                  fundamentally changed our lead generation. We scaled to 12.5k leads.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded">
                    <Icon icon="solar:user-bold-duotone" className="text-xl text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-white uppercase font-bold font-geist">
                      Sarah Jenks
                    </div>
                    <div className="text-[10px] text-neutral-500 uppercase font-geist">
                      CMO, TechCorp
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[400px] border border-subtle p-8 bg-[#050505] shrink-0">
                <p className="text-sm leading-relaxed mb-6 text-neutral-300 font-geist">
                  &quot;The precision in targeting is unlike anything we&apos;ve seen. We reduced
                  our CPA by 40% while doubling our email output.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded">
                    <Icon icon="solar:user-bold-duotone" className="text-xl text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-white uppercase font-bold font-geist">
                      David K.
                    </div>
                    <div className="text-[10px] text-neutral-500 uppercase font-geist">
                      VP, StartupXYZ
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-[400px] border border-subtle p-8 bg-[#050505] shrink-0">
                <p className="text-sm leading-relaxed mb-6 text-neutral-300 font-geist">
                  &quot;Automated email funnels are bringing us qualified leads while we sleep. The
                  ROI was evident within the first 14 days.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center bg-white/5 rounded">
                    <Icon icon="solar:user-bold-duotone" className="text-xl text-white" />
                  </div>
                  <div>
                    <div className="text-xs text-white uppercase font-bold font-geist">
                      Elena R.
                    </div>
                    <div className="text-[10px] text-neutral-500 uppercase font-geist">
                      CEO, GrowthCo
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-subtle bg-center z-10 border-t pt-32 pb-32 relative">
        <div className="container mx-auto px-4 text-center max-w-4xl">
          <h2 className="md:text-8xl uppercase text-5xl font-light text-white tracking-tighter font-space-grotesk mix-blend-plus-lighter mb-8">
            Ready to <span className="text-neutral-600">Scale?</span>
          </h2>
          <p className="text-xl text-neutral-400 font-geist mix-blend-plus-lighter max-w-xl mr-auto mb-10 ml-auto">
            Join the 1% of brands leveraging autonomous email growth infrastructure.
          </p>
          <div>
            <Link
              href="/signup"
              className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section
        id="contact"
        className="py-24 relative z-10 border-t border-subtle bg-black"
      >
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            {/* Left: Info */}
            <div>
              <h3 className="text-3xl uppercase text-white mb-6 tracking-tighter font-space-grotesk font-light">
                Initialize Contact
              </h3>
              <p className="text-sm text-neutral-400 mb-8 leading-relaxed font-geist">
                Fill out the parameters for your growth inquiry. Our team will respond within 24
                hours.
              </p>
              <div className="space-y-4 font-geist-mono text-sm">
                <div className="flex items-center gap-4 text-neutral-300">
                  <Icon icon="solar:letter-bold-duotone" className="text-lg" />
                  <span className="font-geist">hello@leadsite.ai</span>
                </div>
                <div className="flex items-center gap-4 text-neutral-300">
                  <Icon icon="solar:map-point-bold-duotone" className="text-lg" />
                  <span className="font-geist">San Francisco, CA</span>
                </div>
              </div>
            </div>

            {/* Right: Form */}
            <div>
              <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <div className="group relative">
                  <input
                    type="text"
                    required
                    className="outline-none focus:border-white transition-colors peer placeholder-transparent text-white font-geist-mono bg-transparent w-full border-neutral-800 border-b pt-3 pb-3"
                    id="name"
                    placeholder=" "
                  />
                  <label
                    htmlFor="name"
                    className="absolute left-0 -top-3 text-[10px] text-neutral-500 uppercase tracking-widest transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-600 peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-white font-geist"
                  >
                    Name
                  </label>
                </div>
                <div className="group relative">
                  <input
                    type="email"
                    id="email"
                    required
                    className="w-full bg-transparent border-b border-neutral-800 py-3 text-white outline-none focus:border-white transition-colors font-geist-mono peer placeholder-transparent"
                    placeholder=" "
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-0 -top-3 text-[10px] text-neutral-500 uppercase tracking-widest transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-600 peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-white font-geist"
                  >
                    Email Address
                  </label>
                </div>
                <div className="group relative">
                  <textarea
                    id="message"
                    rows={3}
                    className="w-full bg-transparent border-b border-neutral-800 py-3 text-white outline-none focus:border-white transition-colors font-geist-mono peer placeholder-transparent resize-none"
                    placeholder=" "
                  ></textarea>
                  <label
                    htmlFor="message"
                    className="absolute left-0 -top-3 text-[10px] text-neutral-500 uppercase tracking-widest transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-neutral-600 peer-focus:-top-3 peer-focus:text-[10px] peer-focus:text-white font-geist"
                  >
                    Project Data
                  </label>
                </div>

                <button
                  type="submit"
                  className="group flex items-center gap-4 text-white uppercase tracking-widest text-xs font-bold hover:text-neutral-300 transition-colors pt-4"
                >
                  <span className="font-geist">Transmit</span>
                  <Icon
                    icon="solar:arrow-right-bold-duotone"
                    className="transform group-hover:translate-x-1 transition-transform"
                  />
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle bg-black pt-12 pb-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
            <div className="text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
              <div className="w-1.5 h-1.5 bg-neutral-500"></div>
              LEAD
            </div>
            <div className="flex gap-8 text-xs font-geist-mono text-neutral-500 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors font-geist">
                Privacy Protocol
              </a>
              <a href="#" className="hover:text-white transition-colors font-geist">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors font-geist">
                System Status
              </a>
            </div>
          </div>

          <div className="border-t border-subtle pt-8 flex flex-col md:flex-row justify-between items-center text-[10px] font-mono uppercase tracking-widest text-neutral-600">
            <p className="font-geist">© 2025 LeadSite.AI // All Rights Reserved</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a
                href="#"
                className="hover:text-white transition-colors flex items-center gap-2 font-geist"
              >
                <Icon icon="prime:twitter" className="text-sm" /> Twitter
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors flex items-center gap-2 font-geist"
              >
                <Icon icon="prime:linkedin" className="text-sm" /> LinkedIn
              </a>
              <a
                href="#"
                className="hover:text-white transition-colors flex items-center gap-2 font-geist"
              >
                <Icon icon="prime:instagram" className="text-sm" /> Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
