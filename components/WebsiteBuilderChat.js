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

// Chat questions map to formData for /api/websites/generate (5 templates, placeholder replacement)
const QUESTIONS = [
  { key: 'business_basics', question: "What's your business name and tagline? (e.g., Acme Corp | We deliver results)", parse: (a) => { const [n, t] = a.split(/[|–-]/).map((s) => s.trim()); return { business_name: n || a, tagline: t || '' }; } },
  { key: 'industry_type', question: "What industry and who do you serve? (e.g., Technology, B2B - or: Healthcare, B2C - or: Consulting, Both)", parse: (a) => { const m = a.match(/([^,]+),?\s*(B2B|B2C|Both)/i); return { industry: m ? m[1].trim() : a, business_type: m ? m[2] : 'Both' }; } },
  { key: 'contact', question: "Primary contact: name, email, phone (e.g., John Smith | john@acme.com | 555-1234)", parse: (a) => { const p = a.split(/[|,]/).map((s) => s.trim()); return { owner_name: p[0] || '', email: p[1] || '', phone: p[2] || '' }; } },
  { key: 'address_hours', question: "Address and hours? (e.g., 123 Main St | Mon-Fri 9-5) or type 'skip'", parse: (a) => { if (/skip|none|n\/a/i.test(a)) return { address: '', hours: '' }; const [addr, hrs] = a.split(/[|]/).map((s) => s.trim()); return { address: addr || '', hours: hrs || '' }; } },
  { key: 'services', question: "Top 3 services. One per line: Name - Description (e.g., Consulting - Strategy and analysis)", parse: (a) => { const lines = a.split(/\n/).map((s) => s.trim()).filter(Boolean).slice(0, 3); const parseLine = (l) => (l?.includes(' - ') ? l.split(' - ').map((x) => x.trim()) : [l || '', l || '']); const s1 = parseLine(lines[0]); const s2 = parseLine(lines[1]); const s3 = parseLine(lines[2]); return { service1_name: s1[0], service1_description: s1[1] || s1[0], service2_name: s2[0], service2_description: s2[1] || s2[0], service3_name: s3[0], service3_description: s3[1] || s3[0] }; } },
  { key: 'about', question: "About: headline and your story (1-2 sentences)", parse: (a) => ({ about_headline: a.split(/[.!?]/)[0]?.trim() || 'About Us', about_story: a }) },
  { key: 'stats', question: "Years in business and clients served? (e.g., 5+ years, 100+ clients) or 'skip'", parse: (a) => { if (/skip|none/i.test(a)) return { years_experience: '5+', clients_served: '100+' }; const y = a.match(/(\d+\+?)\s*(years?|yrs?)?/i); const c = a.match(/(\d+\+?)\s*(clients?|customers?)?/i); return { years_experience: y ? y[1] : '5+', clients_served: c ? c[1] : '100+' }; } },
  { key: 'unique_value', question: "What makes you unique? Your value proposition in one sentence.", parse: (a) => ({ unique_value: a }) },
  { key: 'social', question: "Social links: LinkedIn, Facebook, Instagram (paste URLs or 'skip')", parse: (a) => { if (/skip|none/i.test(a)) return { linkedin: '#', facebook: '#', instagram: '#' }; const urls = a.split(/\s+/).filter((u) => u.startsWith('http')); return { linkedin: urls[0] || '#', facebook: urls[1] || '#', instagram: urls[2] || '#' }; } },
  { key: 'branding', question: "Brand tone and target audience? (e.g., Professional, Small business owners) or (Friendly, Consumers)", parse: (a) => { const p = a.split(/[,]/).map((s) => s.trim()); return { tone: p[0] || 'Professional', target_audience: p[1] || p[0] || 'Business professionals' }; } },
  { key: 'cta', question: "Call-to-action: primary button text, secondary text, link URL (e.g., Get Started | Learn More | #contact)", parse: (a) => { const p = a.split(/[|,]/).map((s) => s.trim()); return { primary_cta: p[0] || 'Get Started', secondary_cta: p[1] || 'Learn More', cta_destination: p[2] || '#contact' }; } },
  { key: 'template', question: "Choose template (1-5): 1=Executive Dark, 2=Warm Professional, 3=Tech Premium, 4=Minimal Portfolio, 5=AI Agency", parse: (a) => ({ template: a }) },
];

const TEMPLATE_SLUGS = ['executive-dark', 'warm-professional', 'tech-premium', 'minimal-portfolio', 'ai-agency'];

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

  const handleAnswer = async () => {
    if (!input.trim() || loading) return;

    const currentQuestion = QUESTIONS[currentQuestionIndex];
    const answer = input.trim();

    if (currentQuestion.key === 'template') {
      const n = parseInt(answer);
      if (isNaN(n) || n < 1 || n > 5) {
        toast.error('Enter 1, 2, 3, 4, or 5');
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
      const formData = answersToFormData(allAnswers);
      const templateNum = parseInt(allAnswers.template) || 1;
      const templateId = TEMPLATE_SLUGS[templateNum - 1] || TEMPLATE_SLUGS[0];

      const token = Cookies.get('token') || Cookies.get('admin_token');
      const res = await fetch('/api/websites/generate', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ templateId, formData }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Generation failed');

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

  const handleKeyPress = (e) => {
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
            onKeyPress={handleKeyPress}
            placeholder="Type your answer..."
            disabled={loading || generating}
            className="flex-1 px-4 py-3 bg-black/50 border border-white/10 rounded-xl text-white placeholder-neutral-600 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all disabled:opacity-50"
          />
          <button
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
