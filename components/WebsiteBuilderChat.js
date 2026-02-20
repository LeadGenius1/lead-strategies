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
} from 'lucide-react';
import toast from 'react-hot-toast';

// 6 questions to build a solid website - simple chat flow
const QUESTIONS = [
  { key: 'business_basics', question: "What's your business name and tagline? (e.g., Acme Corp | We deliver results)", parse: (a) => { const [n, t] = a.split(/[|–-]/).map((s) => s.trim()); return { business_name: n || a, tagline: t || '' }; } },
  { key: 'contact', question: "Contact email and phone (e.g., john@acme.com | 555-1234)", parse: (a) => { const p = a.split(/[|,]/).map((s) => s.trim()); const email = p.find((x) => x?.includes('@')) || ''; const phone = p.find((x) => x && !x.includes('@') && /\d/.test(x)) || p[1] || ''; return { email, phone }; } },
  { key: 'services', question: "Top 3 services or offerings. One per line: Name - Brief description", parse: (a) => { const lines = a.split(/\n/).map((s) => s.trim()).filter(Boolean).slice(0, 3); const parseLine = (l) => (l?.includes(' - ') ? l.split(' - ').map((x) => x.trim()) : [l || '', l || '']); const s1 = parseLine(lines[0]); const s2 = parseLine(lines[1]); const s3 = parseLine(lines[2]); return { service1_name: s1[0], service1_description: s1[1] || s1[0], service2_name: s2[0], service2_description: s2[1] || s2[0], service3_name: s3[0], service3_description: s3[1] || s3[0] }; } },
  { key: 'about', question: "About your business in 1–2 sentences (what you do, who you serve)", parse: (a) => ({ about_headline: a.split(/[.!?]/)[0]?.trim() || 'About Us', about_story: a }) },
  { key: 'cta', question: "Main call-to-action? (e.g., Get Started, Contact Us, Request Demo)", parse: (a) => { const p = a.split(/[|,]/).map((s) => s.trim()); return { primary_cta: p[0] || 'Get Started', secondary_cta: p[1] || 'Learn More', cta_destination: p[2] || '#contact' }; } },
  { key: 'template', question: "Pick a template style:", parse: (a) => ({ template: a }) },
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
    tagline: '',
    industry: 'Other',
    business_type: 'Both',
    owner_name: '',
    email: '',
    phone: '',
    address: '',
    hours: '',
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
    website_url: '',
    linkedin: '#',
    facebook: '#',
    instagram: '#',
    twitter: '#',
    accent_color: '#3b82f6',
    logo_url: '',
    hero_image_url: '',
    tone: 'Professional',
    target_audience: '',
    primary_cta: 'Get Started',
    secondary_cta: 'Learn More',
    cta_destination: '#contact',
    lead_magnet: '',
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

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  useEffect(() => {
    scrollToBottom();
  }, [currentQuestionIndex, answers]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [currentQuestionIndex]);

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

  const generateWebsite = async (allAnswers) => {
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

      const res = await fetch('/api/websites/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ templateId, formData }),
      });

      const json = await res.json();
      if (!res.ok) {
        if (res.status === 401) throw new Error('Session expired. Please sign in again.');
        throw new Error(json.error || 'Generation failed');
      }

      const website = json.data;
      setCreatedWebsite(website);
      setPreviewHtml(website?.html);
      setWebsiteCreated(true);
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
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your answer..."
            disabled={loading || generating}
            className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleAnswer}
            disabled={!input.trim() || loading || generating}
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white rounded-xl text-sm font-medium disabled:opacity-50 transition-all flex items-center gap-2"
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
