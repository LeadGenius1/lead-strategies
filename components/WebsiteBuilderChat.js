'use client';

import { useState, useRef, useEffect } from 'react';
import Cookies from 'js-cookie';
import {
  Send,
  Loader2,
  Sparkles,
  CheckCircle2,
  Globe,
  Eye,
  Lock,
  CreditCard,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Allowed platforms for website builder
const ALLOWED_PLATFORMS = ['leadsite.io', 'ultralead.ai', 'aileadstrategies.com', 'localhost'];

// 7 questions: 6 content + template picker
const QUESTIONS = [
  {
    key: 'business_name',
    question: "What's your business name?",
    placeholder: 'e.g., Acme Solutions, Prestige Properties',
    parse: (a) => ({ business_name: a.trim() }),
  },
  {
    key: 'industry',
    question: 'What industry or category best describes your business?',
    placeholder: 'e.g., AI/Tech, Real Estate, Health & Wellness, Consulting, Luxury Products',
    hint: 'This helps us pick the perfect design style',
    parse: (a) => ({ businessType: a.trim(), industry: a.trim() }),
  },
  {
    key: 'description',
    question: 'Describe your business in 2–3 sentences. What do you do and who do you help?',
    placeholder: 'e.g., We help small businesses automate their marketing with AI-powered tools...',
    parse: (a) => ({
      about_story: a.trim(),
      description: a.trim(),
      about_headline: (a.split(/[.!?]/)[0]?.trim() || 'About Us'),
    }),
  },
  {
    key: 'services',
    question: 'List your TOP 3 services or products (one per line)',
    placeholder: '1. Lead Generation\n2. Email Automation\n3. Analytics Dashboard',
    hint: 'Be specific — these become your service cards',
    multiline: true,
    parse: (a) => {
      const lines = a.split(/\n/).map((s) => s.replace(/^\d+[.)]\s*/, '').trim()).filter(Boolean).slice(0, 3);
      const p = (l) => (l?.includes(' - ') ? l.split(' - ').map((x) => x.trim()) : [l || '', l || '']);
      const s1 = p(lines[0]); const s2 = p(lines[1]); const s3 = p(lines[2]);
      return {
        service1_name: s1[0], service1_description: s1[1] || s1[0],
        service2_name: s2?.[0] || '', service2_description: s2?.[1] || s2?.[0] || '',
        service3_name: s3?.[0] || '', service3_description: s3?.[1] || s3?.[0] || '',
      };
    },
  },
  {
    key: 'differentiators',
    question: 'What makes you unique? Include any impressive stats!',
    placeholder: 'e.g., 10+ years experience, 500+ clients served, 98% satisfaction rate, Award-winning team',
    hint: 'Stats and proof points build trust',
    parse: (a) => {
      const yrs = a.match(/(\d+\+?)\s*(?:years?|yrs?)/i);
      const clients = a.match(/(\d+\+?)\s*(?:clients?|customers?|projects?)/i);
      return {
        years_experience: yrs?.[1] || '5+',
        clients_served: clients?.[1] || '100+',
        unique_value: a.trim(),
      };
    },
  },
  {
    key: 'contact',
    question: 'How can customers reach you?',
    placeholder: 'Email: hello@company.com\nPhone: (555) 123-4567\nLocation: New York, NY',
    multiline: true,
    parse: (a) => {
      const email = a.match(/[\w.-]+@[\w.-]+\.\w+/)?.[0] || '';
      const phone = a.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/)?.[0] || '';
      const remaining = a.replace(email, '').replace(phone, '')
        .replace(/email:?|phone:?|location:?|address:?/gi, '').trim()
        .replace(/^[\n,|]+|[\n,|]+$/g, '').trim();
      return { email, phone, address: remaining };
    },
  },
  {
    key: 'template',
    question: 'Pick a template style:',
    parse: (a) => ({ template: a }),
  },
];

const TEMPLATE_OPTIONS = [
  { slug: 'aether', name: 'AETHER', description: 'Dark space theme with animated stars, gradient text, glassmorphism cards', bestFor: 'AI/Tech, SaaS, Digital agencies' },
  { slug: 'uslu', name: 'USLU', description: 'Sophisticated dark theme with bronze/gold accents, elegant typography', bestFor: 'Real estate, Architecture, Premium services' },
  { slug: 'vitalis', name: 'VITALIS', description: 'Warm organic feel with cream backgrounds, green accents, smooth animations', bestFor: 'Health/Wellness, Food, Lifestyle brands' },
  { slug: 'sourcing-sense', name: 'SOURCING SENSE', description: 'Classical influence with gold accents, timeline layouts', bestFor: 'Consultants, Professional services, B2B' },
  { slug: 'svrn', name: 'SVRN', description: 'Ultra-minimal dark theme with full-bleed layouts, premium feel', bestFor: 'Luxury marketplaces, High-end products' },
];

function answersToFormData(answers) {
  const formData = {
    business_name: '',
    businessType: '',
    industry: '',
    description: '',
    email: '',
    phone: '',
    address: '',
    service1_name: '',
    service1_description: '',
    service2_name: '',
    service2_description: '',
    service3_name: '',
    service3_description: '',
    about_headline: 'About Us',
    about_story: '',
    years_experience: '5+',
    clients_served: '100+',
    unique_value: '',
    linkedin: '#',
    facebook: '#',
    instagram: '#',
    accent_color: '#6366f1',
    primary_cta: 'Get Started',
    secondary_cta: 'Learn More',
    cta_destination: '#contact',
  };
  for (const q of QUESTIONS) {
    const ans = answers[q.key];
    if (!ans) continue;
    const parsed = q.parse ? q.parse(ans) : {};
    Object.assign(formData, parsed);
  }
  return formData;
}

export default function WebsiteBuilderChat({ onWebsiteCreated }) {
  const [hasAccess, setHasAccess] = useState(true);
  const [paymentRequired, setPaymentRequired] = useState(false);
  const [subscriptionRequired, setSubscriptionRequired] = useState(false);
  const [websiteCount, setWebsiteCount] = useState(0);
  const [profileData, setProfileData] = useState(null);
  const [profileComplete, setProfileComplete] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [missingFields, setMissingFields] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [websiteCreated, setWebsiteCreated] = useState(false);
  const [createdWebsite, setCreatedWebsite] = useState(null);
  const [previewHtml, setPreviewHtml] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const hostname = window.location.hostname;
    const allowed = ALLOWED_PLATFORMS.some(domain =>
      hostname === domain || hostname.endsWith('.' + domain) || hostname.includes('localhost')
    );
    setHasAccess(allowed);
  }, []);

  // Check profile on mount — skip questions if complete
  useEffect(() => {
    async function checkProfile() {
      try {
        const token = Cookies.get('token') || Cookies.get('admin_token');
        if (!token) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.aileadstrategies.com';
        const res = await fetch(`${apiUrl}/api/v1/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const profile = json.data || json;
        setProfileData(profile);

        const missing = [];
        if (!profile.companyName && !profile.company) missing.push('Business Name');
        if (!profile.industry) missing.push('Industry');
        if (!profile.productsServices) missing.push('Services');
        if (!profile.email && !profile.phone) missing.push('Contact Info');

        if (missing.length === 0) {
          setProfileComplete(true);
          setAnswers({
            business_name: profile.companyName || profile.company || '',
            industry: profile.industry || '',
            description: profile.uniqueValueProposition || profile.productsServices || '',
            services: profile.productsServices || '',
            differentiators: [
              profile.competitorDifferentiation,
              profile.keyBenefits,
            ].filter(Boolean).join('. ') || '',
            contact: [profile.email, profile.phone, profile.location].filter(Boolean).join('\n'),
          });
          setCurrentQuestionIndex(QUESTIONS.length - 1);
        } else {
          setMissingFields(missing);
          setShowProfilePrompt(true);
        }
      } catch (error) {
        console.log('Profile check skipped:', error);
      }
    }
    if (hasAccess) checkProfile();
  }, [hasAccess]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [currentQuestionIndex, answers]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentQuestionIndex]);

  // Check for ?purchased=true after Stripe redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const purchased = params.get('purchased');
    const sessionId = params.get('session_id');
    if (purchased === 'true' && sessionId && Object.keys(answers).length > 0) {
      // Clean up URL params
      const url = new URL(window.location.href);
      url.searchParams.delete('purchased');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url.pathname);
      // Retry generation with purchaseId
      setPaymentRequired(false);
      generateWebsite(answers, sessionId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePurchaseWebsite = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();
      if (!token) {
        toast.error('Please sign in first.');
        setLoading(false);
        return;
      }
      const currentUrl = window.location.href.split('?')[0];
      const res = await fetch('/api/stripe/create-website-checkout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          successUrl: `${currentUrl}?purchased=true&session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: currentUrl,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to start checkout');
      if (json.url) {
        window.location.href = json.url;
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to start checkout');
      setLoading(false);
    }
  };

  const getAuthToken = async () => {
    const fromCookie = Cookies.get('token') || Cookies.get('admin_token');
    if (fromCookie) return fromCookie;
    try {
      const res = await fetch('/api/backend-token', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        return data.token;
      }
    } catch (_) {}
    return null;
  };

  const handleAnswer = async () => {
    if (!input.trim() || loading) return;

    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const answer = input.trim();

    if (currentQuestion.key === 'template') {
      const n = parseInt(answer, 10);
      const nameMap = { 'aether': 1, 'uslu': 2, 'vitalis': 3, 'sourcing': 4, 'svrn': 5 };
      const byName = nameMap[answer.toLowerCase().split(/\s+/)[0]];
      const valid = (!isNaN(n) && n >= 1 && n <= 5) || (byName && byName >= 1 && byName <= 5);
      if (!valid) {
        toast.error('Enter 1–5 or a template name (Aether, USLU, Vitalis, Sourcing, SVRN)');
        return;
      }
    }

    const newAnswers = { ...answers, [currentQuestion.key]: answer };
    setAnswers(newAnswers);
    setInput('');

    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await generateWebsite(newAnswers);
    }
  };

  const generateWebsite = async (allAnswers, purchaseId = null) => {
    setGenerating(true);
    setLoading(true);

    try {
      const token = await getAuthToken();
      if (!token) {
        toast.error('Please sign in to generate a website.');
        setGenerating(false);
        setLoading(false);
        return;
      }

      const formData = answersToFormData(allAnswers);
      const t = String(allAnswers.template || '1');
      const n = parseInt(t, 10);
      const nameMap = { aether: 1, uslu: 2, vitalis: 3, sourcing: 4, svrn: 5 };
      const templateNum = (!isNaN(n) && n >= 1 && n <= 5) ? n : (nameMap[t.toLowerCase().split(/\s+/)[0]] || 1);
      const templateId = TEMPLATE_OPTIONS[templateNum - 1]?.slug || TEMPLATE_OPTIONS[0].slug;

      const reqBody = { templateId, formData };
      if (purchaseId) reqBody.purchaseId = purchaseId;

      const res = await fetch('/api/websites/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reqBody),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 402) {
          if (json.error === 'subscription_required') {
            setSubscriptionRequired(true);
          } else {
            setPaymentRequired(true);
            setWebsiteCount(json.existingCount || 1);
          }
          setGenerating(false);
          setLoading(false);
          return;
        }
        if (res.status === 401) throw new Error('Session expired. Please sign in again.');
        throw new Error(json.error || 'Generation failed');
      }

      const website = json.data;
      setCreatedWebsite(website);
      setPreviewHtml(website?.html);
      setWebsiteCreated(true);
      setPaymentRequired(false);
      toast.success('Website generated successfully!');

      if (onWebsiteCreated) onWebsiteCreated(website);
    } catch (error) {
      console.error('Generate website error:', error);
      toast.error(error.message || 'Failed to generate website');
    } finally {
      setGenerating(false);
      setLoading(false);
    }
  };

  const handleTemplateSelect = (index) => {
    if (loading || generating) return;
    setInput(String(index + 1));
    const currentQ = QUESTIONS[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQ.key]: String(index + 1) };
    setAnswers(newAnswers);
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      generateWebsite(newAnswers);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAnswer();
    }
  };

  const currentQuestion = QUESTIONS[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / QUESTIONS.length) * 100;

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Website Builder Not Available</h2>
          <p className="text-slate-400 mb-6">
            The AI Website Builder is exclusively available on <strong className="text-cyan-400">LeadSite.IO</strong> and <strong className="text-cyan-400">UltraLead.AI</strong>.
          </p>
          <div className="bg-black/30 rounded-xl p-4 mb-6">
            <p className="text-sm text-slate-500 mb-3">Included with:</p>
            <div className="flex gap-6 justify-center">
              <div className="text-center">
                <p className="text-white font-medium">LeadSite.IO</p>
                <p className="text-xs text-cyan-400">$49/mo</p>
                <p className="text-xs text-slate-500">1 Free Website</p>
              </div>
              <div className="text-center">
                <p className="text-white font-medium">UltraLead.AI</p>
                <p className="text-xs text-cyan-400">$499/mo</p>
                <p className="text-xs text-slate-500">1 Free Website</p>
              </div>
            </div>
          </div>
          <a href="https://leadsiteio.com" className="inline-block px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 text-white rounded-xl font-medium hover:from-cyan-600 hover:to-indigo-600 transition-all">
            Get LeadSite.IO →
          </a>
        </div>
      </div>
    );
  }

  if (subscriptionRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <Lock className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Subscription Required</h2>
          <p className="text-slate-400 mb-6">
            Your free trial has ended. Subscribe to <strong className="text-white">LeadSite.IO Starter</strong> to keep building websites and keep your sites active.
          </p>
          <div className="bg-black/30 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">LeadSite.IO Starter</span>
              <span className="text-white font-medium">$49/mo</span>
            </div>
            <div className="border-t border-white/10 mt-2 pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">AI website builder</span>
                <span className="text-cyan-400">Included</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Website hosting</span>
                <span className="text-cyan-400">Included</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Lead generation</span>
                <span className="text-cyan-400">Included</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Additional websites</span>
                <span className="text-cyan-400">$19 each</span>
              </div>
            </div>
          </div>
          <Link
            href="/settings"
            className="w-full inline-flex px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Subscribe — $49/mo
          </Link>
          <button
            onClick={() => { setSubscriptionRequired(false); setCurrentQuestionIndex(0); setAnswers({}); }}
            className="mt-3 block w-full text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (paymentRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <CreditCard className="w-8 h-8 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Additional Website</h2>
          <p className="text-slate-400 mb-6">
            You&apos;ve used your included website. Additional websites are just <strong className="text-white">$19.00</strong> each, including hosting.
          </p>
          <div className="bg-black/30 rounded-xl p-4 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Current websites</span>
              <span className="text-white font-medium">{websiteCount}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-500">Additional website</span>
              <span className="text-white font-medium">$19.00</span>
            </div>
            <div className="border-t border-white/10 mt-2 pt-2 flex justify-between text-sm">
              <span className="text-slate-400">Includes</span>
              <span className="text-cyan-400">Hosting included</span>
            </div>
          </div>
          <button
            onClick={handlePurchaseWebsite}
            disabled={loading}
            className="w-full px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CreditCard className="w-4 h-4" />
            )}
            Purchase Website — $19.00
          </button>
          <button
            onClick={() => { setPaymentRequired(false); setCurrentQuestionIndex(0); setAnswers({}); }}
            className="mt-3 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  if (showProfilePrompt && !paymentRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Complete Your Profile First</h2>
          <p className="text-slate-400 mb-6">
            Your profile is missing some info we need to build your website. Fill it in once and we&apos;ll skip the questions next time!
          </p>
          <div className="bg-black/30 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-slate-500 mb-3">Missing fields:</p>
            <ul className="space-y-2">
              {missingFields.map((field) => (
                <li key={field} className="flex items-center gap-2 text-sm text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  {field}
                </li>
              ))}
            </ul>
          </div>
          <Link
            href="/profile"
            className="inline-block w-full px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-600 transition-all mb-3"
          >
            Complete Profile →
          </Link>
          <button
            onClick={() => setShowProfilePrompt(false)}
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            Answer questions instead
          </button>
        </div>
      </div>
    );
  }

  if (websiteCreated && createdWebsite) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Website Generated!</h3>
        <p className="text-neutral-400 mb-6 text-sm">
          &quot;{createdWebsite.name || 'Your website'}&quot; has been created successfully.
        </p>
        <div className="flex gap-3 flex-wrap justify-center">
          {createdWebsite.websiteId && (
            <a
              href={`/preview/${createdWebsite.websiteId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Preview Website
            </a>
          )}
          <a
            href="/websites"
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            View All Websites
          </a>
          <button
            onClick={() => {
              setWebsiteCreated(false);
              setCurrentQuestionIndex(0);
              setAnswers({});
              setCreatedWebsite(null);
              setPreviewHtml(null);
            }}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded-xl text-sm font-medium"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-6 pt-6 pb-4">
        <div className="flex justify-between mb-2">
          <span className="text-xs text-neutral-500">
            Question {currentQuestionIndex + 1} of {QUESTIONS.length}
          </span>
          <span className="text-xs text-neutral-500">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-4">
              <p className="text-white text-sm leading-relaxed">{currentQuestion.question}</p>
              {currentQuestion.hint && (
                <p className="text-xs text-cyan-400/70 mt-2">{currentQuestion.hint}</p>
              )}
            </div>
            {currentQuestion.key === 'template' && (
              <div className="mt-3 grid gap-2">
                {TEMPLATE_OPTIONS.map((tpl, i) => (
                  <button
                    key={tpl.slug}
                    onClick={() => handleTemplateSelect(i)}
                    disabled={loading || generating}
                    className="p-4 rounded-xl border border-white/10 hover:border-indigo-500/50 bg-neutral-900/30 hover:bg-neutral-800/50 text-left transition-all group disabled:opacity-50"
                  >
                    <div className="font-semibold text-sm text-white group-hover:text-indigo-400 transition-colors">
                      {i + 1}. {tpl.name}
                    </div>
                    <div className="text-xs text-neutral-400 mt-1">{tpl.description}</div>
                    <div className="text-xs text-indigo-400/70 mt-1.5">Best for: {tpl.bestFor}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {Object.entries(answers).map(([key, answer]) => {
          const q = QUESTIONS.find((x) => x.key === key);
          if (!q) return null;
          return (
            <div key={key} className="flex gap-3">
              <div className="flex-1" />
              <div className="flex-1">
                <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-2xl p-4">
                  <p className="text-white text-sm leading-relaxed whitespace-pre-wrap">{answer}</p>
                </div>
              </div>
            </div>
          );
        })}

        {generating && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
            </div>
            <div className="flex-1">
              <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-4">
                <p className="text-white text-sm">Generating your website with AI...</p>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="px-6 pb-6 pt-4 border-t border-white/10">
        <div className="flex gap-3">
          {currentQuestion.multiline ? (
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAnswer(); }
              }}
              placeholder={currentQuestion.placeholder || 'Type your answer...'}
              disabled={loading || generating}
              rows={3}
              className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all disabled:opacity-50 resize-none"
            />
          ) : (
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={currentQuestion.placeholder || 'Type your answer...'}
              disabled={loading || generating}
              className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all disabled:opacity-50"
            />
          )}
          <button
            type="button"
            onClick={handleAnswer}
            disabled={!input.trim() || loading || generating}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all flex items-center gap-2 self-end"
          >
            {loading || generating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
