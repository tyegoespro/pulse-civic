/**
 * Gemini AI Service for Pulse
 * Uses @google/genai SDK with gemini-3-flash-preview model
 * Provides: Impact analysis, comment polishing, duplicate detection
 */

import { GoogleGenAI } from '@google/genai'

const apiKey = import.meta.env.VITE_GEMINI_API_KEY

// Gracefully handle missing API key
const ai = (apiKey && apiKey !== 'your_gemini_key_here')
  ? new GoogleGenAI({ apiKey })
  : null

const MODEL = 'gemini-3-flash-preview'

export const isGeminiConfigured = () => !!ai

// ─── JSON Schemas for Structured Output ───

const impactSchema = {
  type: 'object',
  properties: {
    score: {
      type: 'integer',
      description: 'Impact score from 0-100 measuring how actionable this issue is for city government. Higher = more actionable.',
      minimum: 0,
      maximum: 100
    },
    analysis: {
      type: 'string',
      description: 'Brief 1-2 sentence analysis of the civic impact of this post.'
    },
    constructiveFeedback: {
      type: 'string',
      description: 'Constructive suggestion to make the post more effective for driving municipal action.'
    },
    category_confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
      description: 'How confident the AI is that the selected category is correct.'
    }
  },
  required: ['score', 'analysis', 'constructiveFeedback', 'category_confidence']
}

const duplicateSchema = {
  type: 'object',
  properties: {
    isDuplicate: {
      type: 'boolean',
      description: 'Whether the draft is about the same specific issue as an existing post.'
    },
    matchedPostId: {
      type: 'string',
      description: 'The ID of the matching post if a duplicate is found, or empty string.'
    },
    confidence: {
      type: 'string',
      enum: ['high', 'medium', 'low'],
      description: 'How confident the match is.'
    },
    reason: {
      type: 'string',
      description: 'Brief explanation of why the posts are or are not duplicates.'
    }
  },
  required: ['isDuplicate', 'matchedPostId', 'confidence', 'reason']
}

const politeRewriteSchema = {
  type: 'object',
  properties: {
    rewrittenText: {
      type: 'string',
      description: 'The rewritten comment that is more constructive and respectful while keeping the original opinion.'
    },
    changesExplanation: {
      type: 'string',
      description: 'Brief explanation of what was changed and why.'
    }
  },
  required: ['rewrittenText', 'changesExplanation']
}

// ─── AI Functions ───

/**
 * Analyze the civic impact of a post draft.
 * Returns a structured impact assessment with score, analysis, and feedback.
 */
export async function analyzePostImpact(title, description, category) {
  if (!ai) return getFallbackImpact()

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are a municipal engagement analyst for City of Oshkosh, Wisconsin.
Evaluate this citizen post for civic impact and actionability.

Category: ${category}
Title: ${title}
Description: ${description || 'No additional details provided.'}

Score based on:
- Specificity (exact location, measurable problem)
- Safety urgency
- Number of people affected
- Actionability for city departments
- Constructiveness of tone`,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: impactSchema
      }
    })

    return JSON.parse(response.text)
  } catch (error) {
    console.error('Gemini impact analysis error:', error)
    return getFallbackImpact()
  }
}

/**
 * Check if a draft post is a semantic duplicate of existing posts.
 * Goes beyond keyword matching — understands whether it's the SAME specific issue.
 */
export async function checkDuplicateSemantic(draftTitle, draftDescription, existingPosts) {
  if (!ai || existingPosts.length === 0) {
    return { isDuplicate: false, matchedPostId: '', confidence: 'low', reason: 'AI not configured.' }
  }

  const postsContext = existingPosts.slice(0, 10).map(p =>
    `[ID: ${p.id}] "${p.title}" — ${p.description || ''} (Category: ${p.category}, Location: ${p.location})`
  ).join('\n')

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are a content deduplication system for a civic engagement platform in Oshkosh, WI.

Determine if this new DRAFT post is about THE SAME SPECIFIC ISSUE as any existing post.
Important: Posts in the same category are NOT automatically duplicates. They must be about the same specific problem at the same location.

NEW DRAFT:
Title: "${draftTitle}"
Description: "${draftDescription || ''}"

EXISTING POSTS:
${postsContext}

Only flag as duplicate if the posts describe the exact same issue (e.g., both about potholes on Main St near 9th Ave, not just both about potholes in general).`,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: duplicateSchema
      }
    })

    return JSON.parse(response.text)
  } catch (error) {
    console.error('Gemini duplicate check error:', error)
    return { isDuplicate: false, matchedPostId: '', confidence: 'low', reason: 'Analysis unavailable.' }
  }
}

/**
 * Suggest a more constructive and polite version of a comment.
 * Preserves the original opinion but improves tone for civic discourse.
 */
export async function suggestPoliteComment(originalText) {
  if (!ai) {
    return { rewrittenText: originalText, changesExplanation: 'AI not configured.' }
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL,
      contents: `You are a civic discourse assistant. Rewrite this comment to be more constructive and respectful while fully preserving the author's original opinion and intent.

Rules:
- Keep it roughly the same length
- Don't add new arguments the author didn't make
- Don't water down strong opinions — just improve the delivery
- Make it the kind of comment that would be effective at a city council meeting

Original comment: "${originalText}"`,
      config: {
        responseMimeType: 'application/json',
        responseJsonSchema: politeRewriteSchema
      }
    })

    return JSON.parse(response.text)
  } catch (error) {
    console.error('Gemini polite rewrite error:', error)
    return { rewrittenText: originalText, changesExplanation: 'Rewrite unavailable.' }
  }
}

// ─── Fallback for when Gemini is not configured ───

function getFallbackImpact() {
  return {
    score: Math.floor(Math.random() * 30) + 50,
    analysis: 'AI analysis requires a Gemini API key. Add your key to .env.local to enable impact scoring.',
    constructiveFeedback: 'Configure VITE_GEMINI_API_KEY in your .env.local file to get AI-powered feedback on your posts.',
    category_confidence: 'medium'
  }
}
