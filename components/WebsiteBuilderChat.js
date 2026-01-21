'use client';

import { useState, useRef, useEffect } from 'react';
import api from '@/lib/api';
import { 
  Send, 
  Loader2,
  Sparkles,
  CheckCircle2,
  Globe
} from 'lucide-react';
import toast from 'react-hot-toast';

const QUESTIONS = [
  {
    id: 1,
    question: "What's the main goal of your website? (e.g., generate leads, sell products, showcase services)",
    key: 'goal'
  },
  {
    id: 2,
    question: "Who is your target audience? (e.g., small business owners, enterprise CTOs, consumers)",
    key: 'audience'
  },
  {
    id: 3,
    question: "What's your unique value proposition? What makes you different?",
    key: 'valueProp'
  },
  {
    id: 4,
    question: "What are your top 3-5 key features or benefits you want to highlight?",
    key: 'features'
  },
  {
    id: 5,
    question: "What's your primary call-to-action? (e.g., 'Get Started', 'Request Demo', 'Contact Us')",
    key: 'cta'
  },
  {
    id: 6,
    question: "Choose a template style: (1) Modern Business, (2) Professional Services, (3) Creative Agency, (4) SaaS Product, (5) E-commerce, (6) Minimal Portfolio",
    key: 'template'
  }
];

export default function WebsiteBuilderChat({ onWebsiteCreated }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [websiteCreated, setWebsiteCreated] = useState(false);
  const [createdWebsite, setCreatedWebsite] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

    // Validate template selection
    if (currentQuestion.key === 'template') {
      const templateNum = parseInt(answer);
      if (isNaN(templateNum) || templateNum < 1 || templateNum > 6) {
        toast.error('Please enter a number between 1 and 6');
        return;
      }
    }

    // Save answer
    const newAnswers = {
      ...answers,
      [currentQuestion.key]: answer
    };
    setAnswers(newAnswers);
    setInput('');

    // Move to next question or generate website
    if (currentQuestionIndex < QUESTIONS.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered - generate website
      await generateWebsite(newAnswers);
    }
  };

  const generateWebsite = async (allAnswers) => {
    setGenerating(true);
    setLoading(true);

    try {
      // Convert answers to chat format
      const chatAnswers = QUESTIONS.map(q => ({
        question: q.question,
        answer: allAnswers[q.key] || ''
      }));

      // Extract template ID
      const templateId = parseInt(allAnswers.template) || 1;

      const response = await api.post('/api/v1/websites/generate', {
        chatAnswers,
        templateId
      });

      const website = response.data?.data?.website;
      if (website) {
        setCreatedWebsite(website);
        setWebsiteCreated(true);
        toast.success('Website generated successfully!');
        
        if (onWebsiteCreated) {
          onWebsiteCreated(website);
        }
      }
    } catch (error) {
      console.error('Generate website error:', error);
      toast.error(error.response?.data?.message || 'Failed to generate website');
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
          Your website "{createdWebsite.name}" has been created successfully.
        </p>
        <div className="flex gap-3">
          <a
            href={`/sites/${createdWebsite.subdomain}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            Preview Website
          </a>
          <button
            onClick={() => {
              setWebsiteCreated(false);
              setCurrentQuestionIndex(0);
              setAnswers({});
              setCreatedWebsite(null);
            }}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-neutral-300 rounded-xl text-sm font-medium transition-all"
          >
            Create Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Progress Bar */}
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-neutral-500">
            Question {currentQuestionIndex + 1} of {QUESTIONS.length}
          </span>
          <span className="text-xs text-neutral-500">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {/* Assistant Message */}
        <div className="flex gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex-1">
            <div className="bg-neutral-900/50 border border-white/10 rounded-2xl p-4">
              <p className="text-white text-sm leading-relaxed">
                {currentQuestion.question}
              </p>
            </div>
          </div>
        </div>

        {/* User Answers */}
        {Object.entries(answers).map(([key, answer], idx) => {
          const question = QUESTIONS.find(q => q.key === key);
          if (!question) return null;
          
          return (
            <div key={key} className="flex gap-3">
              <div className="flex-1" />
              <div className="flex-1">
                <div className="bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/20 rounded-2xl p-4">
                  <p className="text-white text-sm leading-relaxed">{answer}</p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Generating Indicator */}
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

      {/* Input */}
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
