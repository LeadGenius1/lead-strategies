'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [tier, setTier] = useState('tackle-io');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form data state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    password: '',
    industry: '',
    companySize: '',
    currentTools: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.companyName) {
        setError('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Submit to API
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          tier,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || result.message || 'Signup failed. Please try again.');
        setLoading(false);
        return;
      }

      // Success - user is now automatically logged in (auth-token cookie set by API)
      // Wait briefly for cookie to be set, then redirect
      console.log('✅ Signup successful, redirecting to dashboard...');
      setTimeout(() => {
        router.push('/dashboard');
        router.refresh();
      }, 300);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#030303]">
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
      <nav className="fixed top-6 left-0 right-0 z-50 flex justify-center px-4">
        <div className="border-subtle flex bg-black/90 w-full max-w-4xl border p-2 shadow-2xl backdrop-blur-xl gap-1 items-center justify-between">
          <Link href="/" className="bg-white/5 hover:bg-white/10 px-5 py-2 text-xs tracking-widest uppercase transition-all text-neutral-300 font-geist">
            ← Back
          </Link>
          
          <div className="px-6 text-2xl text-white uppercase flex items-center gap-2 tracking-tighter font-space-grotesk font-light">
            <div className="w-1.5 h-1.5 bg-purple-500 animate-pulse shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
            AI LEAD
          </div>

          <div className="px-5 py-2 text-xs tracking-widest uppercase text-neutral-500 font-geist">
            Step {step}/4
          </div>
        </div>
      </nav>

      {/* Signup Form */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-7xl uppercase mb-4 text-white tracking-tighter font-space-grotesk font-light">
              Start Your <span className="text-gradient">Free Trial</span>
            </h1>
            <p className="text-neutral-400 font-geist">14 days free. No credit card required. Cancel anytime.</p>
          </div>

          <div className="bg-[#050505] border border-subtle p-8 md:p-12 max-w-3xl mx-auto">
            {step === 1 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-space-grotesk text-white mb-8">Choose Your Tier</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* LeadSite.AI */}
                  <button
                    onClick={() => setTier('leadsite-ai')}
                    className={`text-left p-6 border transition-all ${
                      tier === 'leadsite-ai'
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-subtle hover:border-purple-500/30'
                    }`}
                  >
                    <h3 className="text-xl font-space-grotesk text-white mb-2">LeadSite.AI</h3>
                    <p className="text-3xl font-space-grotesk font-light text-white mb-2">
                      $49<span className="text-sm text-neutral-500">/mo</span>
                    </p>
                    <p className="text-sm text-neutral-400 font-geist">1,000 Leads/Month</p>
                  </button>

                  {/* LeadSite.IO */}
                  <button
                    onClick={() => setTier('leadsite-io')}
                    className={`text-left p-6 border transition-all ${
                      tier === 'leadsite-io'
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-subtle hover:border-purple-500/30'
                    }`}
                  >
                    <h3 className="text-xl font-space-grotesk text-white mb-2">LeadSite.IO</h3>
                    <p className="text-3xl font-space-grotesk font-light text-white mb-2">
                      $49<span className="text-sm text-neutral-500">/mo</span>
                    </p>
                    <p className="text-sm text-neutral-400 font-geist">1,000 Leads + 1 Free Website</p>
                  </button>

                  {/* ClientContact.IO */}
                  <button
                    onClick={() => setTier('clientcontact-io')}
                    className={`text-left p-6 border transition-all ${
                      tier === 'clientcontact-io'
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-subtle hover:border-purple-500/30'
                    }`}
                  >
                    <h3 className="text-xl font-space-grotesk text-white mb-2">ClientContact</h3>
                    <p className="text-3xl font-space-grotesk font-light text-white mb-2">
                      $149<span className="text-sm text-neutral-500">/mo</span>
                    </p>
                    <p className="text-sm text-neutral-400 font-geist">22+ channel inbox</p>
                  </button>

                  {/* Tackle.IO */}
                  <button
                    onClick={() => setTier('tackle-io')}
                    className={`text-left p-6 border transition-all ${
                      tier === 'tackle-io'
                        ? 'border-purple-500 bg-purple-500/5'
                        : 'border-subtle hover:border-purple-500/30'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-space-grotesk text-white">Tackle.IO</h3>
                      <span className="px-2 py-0.5 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] uppercase tracking-wider font-geist">
                        Enterprise
                      </span>
                    </div>
                    <p className="text-3xl font-space-grotesk font-light text-white mb-2">
                      $249<span className="text-sm text-neutral-500">/mo</span>
                    </p>
                    <p className="text-sm text-neutral-400 font-geist">2,000 Leads + Full CRM</p>
                  </button>
                </div>

                <button
                  onClick={() => setStep(2)}
                  className="w-full bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist mt-8"
                >
                  Continue to Account Details →
                </button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-space-grotesk text-white mb-8">Account Details</h2>
                
                <div className="space-y-6">
                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 p-4 text-red-400 text-sm font-geist">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      minLength={8}
                      className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                    />
                    <p className="text-xs text-neutral-500 font-geist mt-1">Minimum 8 characters</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-transparent border border-subtle text-white px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    disabled={!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.companyName}
                    className="flex-1 bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8">
                <h2 className="text-2xl font-space-grotesk text-white mb-8">Company Information</h2>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                      Industry
                    </label>
                    <select 
                      value={formData.industry}
                      onChange={(e) => handleInputChange('industry', e.target.value)}
                      className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                    >
                      <option value="" className="bg-[#050505]">Select industry...</option>
                      <option value="saas" className="bg-[#050505]">B2B SaaS</option>
                      <option value="agency" className="bg-[#050505]">Marketing Agency</option>
                      <option value="consulting" className="bg-[#050505]">Consulting</option>
                      <option value="ecommerce" className="bg-[#050505]">E-commerce</option>
                      <option value="other" className="bg-[#050505]">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                      Company Size
                    </label>
                    <select 
                      value={formData.companySize}
                      onChange={(e) => handleInputChange('companySize', e.target.value)}
                      className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist"
                    >
                      <option value="" className="bg-[#050505]">Select size...</option>
                      <option value="1-10" className="bg-[#050505]">1-10 employees</option>
                      <option value="11-50" className="bg-[#050505]">11-50 employees</option>
                      <option value="51-200" className="bg-[#050505]">51-200 employees</option>
                      <option value="201+" className="bg-[#050505]">201+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-neutral-500 font-geist mb-2">
                      Current Marketing Tools
                    </label>
                    <textarea
                      rows={3}
                      value={formData.currentTools}
                      onChange={(e) => handleInputChange('currentTools', e.target.value)}
                      placeholder="e.g., HubSpot, Mailchimp, Salesforce..."
                      className="w-full bg-transparent border border-subtle p-3 text-white outline-none focus:border-purple-500 transition-colors font-geist placeholder-neutral-600"
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-transparent border border-subtle text-white px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-white/5 transition-colors font-geist"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                      </>
                    ) : (
                      'Start Free Trial →'
                    )}
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="text-center space-y-8">
                <div className="w-20 h-20 mx-auto bg-purple-500/10 border border-purple-500/30 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                  </svg>
                </div>
                
                <div>
                  <h2 className="text-3xl font-space-grotesk text-white mb-4">Account Created!</h2>
                  <p className="text-neutral-400 font-geist mb-2">Your 14-day free trial has started.</p>
                  <p className="text-sm text-neutral-500 font-geist">
                    We've sent a verification email to your inbox.
                  </p>
                </div>

                <div className="bg-purple-500/5 border border-purple-500/20 p-6">
                  <h3 className="text-sm uppercase tracking-widest text-purple-300 font-geist mb-2">
                    Selected Tier
                  </h3>
                  <p className="text-2xl font-space-grotesk text-white">
                    {tier === 'leadsite-ai' && 'LeadSite.AI - $49/mo'}
                    {tier === 'leadsite-io' && 'LeadSite.IO - $49/mo'}
                    {tier === 'clientcontact-io' && 'ClientContact.IO - $149/mo'}
                    {tier === 'tackle-io' && 'Tackle.IO - $249/mo'}
                  </p>
                  <p className="text-sm text-neutral-400 font-geist mt-2">
                    Trial ends in 14 days. Add payment anytime to continue.
                  </p>
                </div>

                <Link
                  href="/dashboard"
                  className="inline-block bg-white text-black px-10 py-4 text-sm font-bold tracking-widest uppercase hover:bg-neutral-200 transition-colors font-geist"
                >
                  Go to Dashboard →
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-subtle bg-black py-8 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center text-[10px] uppercase tracking-widest text-neutral-600 font-geist">
            © 2025 AI Lead Strategies LLC. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
