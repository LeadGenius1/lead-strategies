// Lead Scoring Service
// Scores leads from 0-100 based on multiple factors

const calculateLeadScore = (lead, userProfile = {}) => {
  let score = 0;
  const factors = {
    dataCompleteness: 0,
    engagement: 0,
    companyFit: 0,
    behaviorSignals: 0,
    customFit: 0
  };

  // 1. Data Completeness (0-25 points)
  // More complete data = higher score
  if (lead.email) factors.dataCompleteness += 5;
  if (lead.name) factors.dataCompleteness += 5;
  if (lead.company) factors.dataCompleteness += 5;
  if (lead.phone) factors.dataCompleteness += 3;
  if (lead.title) factors.dataCompleteness += 3;
  if (lead.website) factors.dataCompleteness += 2;
  if (lead.linkedinUrl) factors.dataCompleteness += 2;

  // 2. Engagement Signals (0-25 points)
  // Based on past interactions and status
  if (lead.status === 'replied') factors.engagement += 15;
  else if (lead.status === 'contacted') factors.engagement += 10;
  else if (lead.status === 'qualified') factors.engagement += 20;
  else if (lead.status === 'converted') factors.engagement += 25;
  
  if (lead.lastContactedAt) {
    const daysSinceContact = Math.floor((new Date() - new Date(lead.lastContactedAt)) / (1000 * 60 * 60 * 24));
    if (daysSinceContact < 7) factors.engagement += 5;
    else if (daysSinceContact < 30) factors.engagement += 2;
  }

  // 3. Company Fit (0-25 points)
  // Based on company size, industry match, etc.
  if (lead.company) {
    // Check if company matches user's ICP (if provided)
    if (userProfile.targetIndustries && userProfile.targetIndustries.length > 0) {
      // This would require industry matching - simplified for now
      factors.companyFit += 10;
    } else {
      factors.companyFit += 5;
    }
    
    // Company size indicators (if available in customFields)
    if (lead.customFields?.companySize) {
      const size = lead.customFields.companySize.toLowerCase();
      if (size.includes('enterprise') || size.includes('large')) factors.companyFit += 10;
      else if (size.includes('mid') || size.includes('medium')) factors.companyFit += 7;
      else if (size.includes('small') || size.includes('startup')) factors.companyFit += 5;
    } else {
      factors.companyFit += 5; // Default assumption
    }
  }

  // 4. Behavior Signals (0-15 points)
  // Based on tags, notes, and custom fields
  if (lead.tags && Array.isArray(lead.tags)) {
    const positiveTags = ['hot', 'interested', 'qualified', 'budget', 'decision-maker'];
    const matchingTags = lead.tags.filter(tag => 
      positiveTags.some(pt => tag.toLowerCase().includes(pt))
    );
    factors.behaviorSignals += matchingTags.length * 3;
  }

  if (lead.notes && lead.notes.length > 50) {
    factors.behaviorSignals += 5; // Detailed notes indicate engagement
  }

  // 5. Custom Fit Score (0-10 points)
  // Based on custom fields and user-defined criteria
  if (lead.customFields) {
    if (lead.customFields.hasBudget === true) factors.customFit += 5;
    if (lead.customFields.hasAuthority === true) factors.customFit += 3;
    if (lead.customFields.hasNeed === true) factors.customFit += 2;
  }

  // Calculate total score
  score = Math.min(100, Math.round(
    factors.dataCompleteness +
    factors.engagement +
    factors.companyFit +
    factors.behaviorSignals +
    factors.customFit
  ));

  return {
    score,
    factors,
    breakdown: {
      dataCompleteness: factors.dataCompleteness,
      engagement: factors.engagement,
      companyFit: factors.companyFit,
      behaviorSignals: factors.behaviorSignals,
      customFit: factors.customFit
    }
  };
};

// Score multiple leads in batch
const scoreLeadsBatch = (leads, userProfile = {}) => {
  return leads.map(lead => {
    const scoringResult = calculateLeadScore(lead, userProfile);
    return {
      ...lead,
      score: scoringResult.score,
      scoreBreakdown: scoringResult.breakdown
    };
  });
};

module.exports = {
  calculateLeadScore,
  scoreLeadsBatch
};
