'use client';

import { useState } from 'react';
import { Filter, X, Search } from 'lucide-react';

export default function AdvancedLeadFilters({ onApply, onReset }) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState({
    techStack: [],
    fundingStage: '',
    hiringSignal: false,
    industry: '',
    location: '',
    employeeCount: '',
    search: ''
  });

  const techStackOptions = ['React', 'Vue', 'Angular', 'Node.js', 'Python', 'AWS', 'Azure', 'GCP', 'Stripe', 'Shopify'];
  const fundingStages = ['seed', 'series-a', 'series-b', 'series-c', 'series-d', 'acquired', 'ipo'];
  const employeeRanges = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];

  const handleTechStackToggle = (tech) => {
    setFilters(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const handleApply = () => {
    onApply(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({
      techStack: [],
      fundingStage: '',
      hiringSignal: false,
      industry: '',
      location: '',
      employeeCount: '',
      search: ''
    });
    onReset();
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-white/10 text-white rounded-xl text-sm font-medium transition-all flex items-center gap-2"
      >
        <Filter className="w-4 h-4" />
        Advanced Filters
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl border border-white/10 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Advanced Filters</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Search
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    placeholder="Search by name, company, email..."
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-800 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Tech Stack */}
              <div>
                <label className="block text-sm font-medium text-white mb-3">
                  Tech Stack
                </label>
                <div className="flex flex-wrap gap-2">
                  {techStackOptions.map((tech) => (
                    <button
                      key={tech}
                      onClick={() => handleTechStackToggle(tech)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        filters.techStack.includes(tech)
                          ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                          : 'bg-neutral-800 text-neutral-400 border border-white/10 hover:bg-neutral-700'
                      }`}
                    >
                      {tech}
                    </button>
                  ))}
                </div>
              </div>

              {/* Funding Stage */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Funding Stage
                </label>
                <select
                  value={filters.fundingStage}
                  onChange={(e) => setFilters(prev => ({ ...prev, fundingStage: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Stages</option>
                  {fundingStages.map((stage) => (
                    <option key={stage} value={stage}>
                      {stage.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee Count */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Company Size
                </label>
                <select
                  value={filters.employeeCount}
                  onChange={(e) => setFilters(prev => ({ ...prev, employeeCount: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="">All Sizes</option>
                  {employeeRanges.map((range) => (
                    <option key={range} value={range}>
                      {range} employees
                    </option>
                  ))}
                </select>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Industry
                </label>
                <input
                  type="text"
                  value={filters.industry}
                  onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                  placeholder="e.g., SaaS, E-commerce, Healthcare"
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., San Francisco, CA or United States"
                  className="w-full px-4 py-2.5 bg-neutral-800 border border-white/10 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Hiring Signal */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="hiringSignal"
                  checked={filters.hiringSignal}
                  onChange={(e) => setFilters(prev => ({ ...prev, hiringSignal: e.target.checked }))}
                  className="w-4 h-4 rounded border-white/20 bg-neutral-800 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="hiringSignal" className="text-white text-sm cursor-pointer">
                  Actively Hiring
                </label>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-6 pt-6 border-t border-white/10">
              <button
                onClick={handleApply}
                className="flex-1 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl text-sm font-medium transition-all"
              >
                Apply Filters
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl text-sm font-medium transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
