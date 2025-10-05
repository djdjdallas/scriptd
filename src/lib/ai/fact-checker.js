import { verifyEvent, getEventDetails } from './perplexity-research.js';

/**
 * Fact-checking service to verify content ideas are based on real events
 */

export async function verifyContentIdea(idea) {
  try {
    // Extract the potential event name from the title
    const eventName = extractEventName(idea.title);

    // Verify with Perplexity
    const verificationResult = await verifyEvent(eventName, idea.description || '');

    if (!verificationResult.success) {
      return {
        isFactual: false,
        confidence: 0,
        status: 'error',
        message: 'Verification service unavailable'
      };
    }

    const { verification, citations } = verificationResult;

    // Get more details if it's a real event
    let eventDetails = null;
    if (verification.isReal && verification.confidence > 70) {
      const detailsResult = await getEventDetails(verification.realEventName || eventName);
      if (detailsResult.success) {
        eventDetails = detailsResult.details;
      }
    }

    return {
      isFactual: verification.isReal,
      confidence: verification.confidence,
      status: verification.isReal ? 'verified' : 'unverified',
      realEventName: verification.realEventName,
      date: verification.date,
      sources: verification.sources || [],
      citations,
      eventDetails,
      summary: verification.summary
    };

  } catch (error) {
    console.error('Content idea verification error:', error);
    return {
      isFactual: false,
      confidence: 0,
      status: 'error',
      error: error.message
    };
  }
}

export async function batchVerifyIdeas(ideas) {
  const verificationPromises = ideas.map(idea =>
    verifyContentIdea(idea).then(result => ({
      ...idea,
      factualVerification: result
    }))
  );

  try {
    const results = await Promise.all(verificationPromises);

    // Sort by confidence score
    results.sort((a, b) =>
      (b.factualVerification?.confidence || 0) - (a.factualVerification?.confidence || 0)
    );

    return {
      success: true,
      verifiedIdeas: results.filter(r => r.factualVerification?.isFactual),
      unverifiedIdeas: results.filter(r => !r.factualVerification?.isFactual),
      totalVerified: results.filter(r => r.factualVerification?.isFactual).length,
      totalIdeas: results.length
    };

  } catch (error) {
    console.error('Batch verification error:', error);
    return {
      success: false,
      error: error.message,
      verifiedIdeas: [],
      unverifiedIdeas: ideas
    };
  }
}

export async function crossReferenceWithPerplexity(title, details) {
  try {
    // Quick verification check
    const verification = await verifyEvent(title, details);

    if (!verification.success) {
      return {
        verified: false,
        confidence: 0,
        sources: []
      };
    }

    return {
      verified: verification.verification.isReal,
      confidence: verification.verification.confidence,
      sources: verification.verification.sources || [],
      realEventName: verification.verification.realEventName,
      date: verification.verification.date
    };

  } catch (error) {
    console.error('Cross-reference error:', error);
    return {
      verified: false,
      confidence: 0,
      sources: [],
      error: error.message
    };
  }
}

// Helper function to extract potential event name from video title
function extractEventName(title) {
  // Remove common video title patterns
  const patterns = [
    /^How /i,
    /^The /i,
    /^When /i,
    /^Why /i,
    / That /i,
    / Who /i,
    /\$[\d,]+(\.\d+)?[MBK]?/g, // Remove money amounts
    /\d+/g, // Remove numbers
  ];

  let eventName = title;
  patterns.forEach(pattern => {
    eventName = eventName.replace(pattern, '');
  });

  return eventName.trim();
}

export function calculateFactualityScore(idea) {
  let score = 0;
  const weights = {
    hasRealEvent: 40,
    hasSources: 20,
    hasDate: 15,
    hasAmount: 10,
    hasVerification: 15
  };

  if (idea.factualBasis) {
    if (idea.factualBasis.realEvent) score += weights.hasRealEvent;
    if (idea.factualBasis.sources?.length > 0) score += weights.hasSources;
    if (idea.factualBasis.date) score += weights.hasDate;
    if (idea.factualBasis.amount) score += weights.hasAmount;
    if (idea.factualBasis.verified) score += weights.hasVerification;
  }

  return score;
}

export function filterFactualIdeas(ideas, minFactualityScore = 70) {
  return ideas.filter(idea => {
    const score = calculateFactualityScore(idea);
    return score >= minFactualityScore;
  });
}

export function addFactualMetadata(idea, verificationData) {
  return {
    ...idea,
    factualBasis: {
      verified: verificationData.isFactual,
      confidence: verificationData.confidence,
      realEvent: verificationData.realEventName || 'Unverified',
      date: verificationData.date,
      sources: verificationData.sources || [],
      keyFacts: verificationData.eventDetails?.keyFacts || [],
      status: verificationData.eventDetails?.currentStatus || 'Unknown'
    },
    metadata: {
      ...idea.metadata,
      factualityScore: calculateFactualityScore({
        factualBasis: {
          verified: verificationData.isFactual,
          realEvent: verificationData.realEventName,
          date: verificationData.date,
          sources: verificationData.sources
        }
      }),
      verifiedAt: new Date().toISOString()
    }
  };
}

export default {
  verifyContentIdea,
  batchVerifyIdeas,
  crossReferenceWithPerplexity,
  calculateFactualityScore,
  filterFactualIdeas,
  addFactualMetadata
};