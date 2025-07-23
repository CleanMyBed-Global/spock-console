// netlify/functions/spockSummarize.js
// Dedicated summarization endpoint for Spock Console Phase 2

exports.handler = async (event, context) => {
  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Parse request body
    const { messages, projectName, currentSummary } = JSON.parse(event.body);
    
    // Validate required fields
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' })
      };
    }

    // Prepare summarization prompt
    const summaryPrompt = createSummarizationPrompt(messages, projectName, currentSummary);
    
    // Call OpenAI API for summarization
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: summaryPrompt.systemPrompt
          },
          {
            role: 'user',
            content: summaryPrompt.userPrompt
          }
        ],
        temperature: 0.3, // Lower temperature for consistent summarization
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API Error:', errorData);
      throw new Error(`OpenAI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const summaryContent = data.choices[0].message.content;

    // Parse the structured summary response
    const parsedSummary = parseSummaryResponse(summaryContent);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        summary: parsedSummary,
        timestamp: new Date().toISOString(),
        messageCount: messages.length,
        project: projectName || 'Unknown'
      })
    };

  } catch (error) {
    console.error('Summarization Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to generate summary',
        details: error.message
      })
    };
  }
};

// Create the summarization prompt based on conversation and context
function createSummarizationPrompt(messages, projectName, currentSummary) {
  const systemPrompt = `You are Spock, an AI assistant that creates intelligent summaries of development conversations. Your task is to analyze conversations and extract key information in a structured format.

CRITICAL INSTRUCTIONS:
1. Focus on ACTIONABLE and TECHNICAL information only
2. Ignore casual conversation, greetings, and meta-discussion
3. Extract concrete decisions, code changes, architecture choices, and todos
4. Use the exact JSON structure provided below
5. Be concise but comprehensive - each point should be valuable for future reference

PROJECT CONTEXT: ${projectName || 'General Development'}
EXISTING SUMMARY: ${currentSummary ? 'Update the existing summary with new information' : 'Create initial summary'}

REQUIRED JSON STRUCTURE:
{
  "version": "1.0",
  "architecture": ["Key architectural decisions and patterns"],
  "codeChanges": ["Specific code implementations or modifications"],
  "todoItems": ["Action items and future tasks"],
  "issues": ["Problems identified and solutions implemented"],
  "performance": ["Performance considerations and optimizations"],
  "dependencies": ["New dependencies, integrations, or external services"],
  "keyDecisions": ["Important project decisions and rationale"],
  "insights": ["General insights or lessons learned"]
}`;

  const conversationText = messages
    .filter(msg => msg.role === 'user' || msg.role === 'assistant')
    .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
    .join('\n\n');

  const userPrompt = `Analyze this conversation and create a structured summary following the JSON format exactly:

CONVERSATION TO SUMMARIZE:
${conversationText}

${currentSummary ? `\nEXISTING SUMMARY TO UPDATE:\n${JSON.stringify(currentSummary, null, 2)}` : ''}

Return ONLY the JSON structure with the summarized information. Do not include any explanatory text outside the JSON.`;

  return { systemPrompt, userPrompt };
}

// Parse the AI response into structured summary data
function parseSummaryResponse(content) {
  try {
    // Clean up the response to extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }
    
    const parsedData = JSON.parse(jsonMatch[0]);
    
    // Validate required structure
    const requiredFields = ['architecture', 'codeChanges', 'todoItems', 'issues', 'performance', 'dependencies', 'keyDecisions', 'insights'];
    const missingFields = requiredFields.filter(field => !parsedData.hasOwnProperty(field));
    
    if (missingFields.length > 0) {
      console.warn('Missing fields in summary:', missingFields);
      // Add empty arrays for missing fields
      missingFields.forEach(field => {
        parsedData[field] = [];
      });
    }

    // Add metadata
    parsedData.version = parsedData.version || '1.0';
    parsedData.lastUpdated = new Date().toISOString();
    
    return parsedData;
    
  } catch (error) {
    console.error('Failed to parse summary response:', error);
    // Return fallback structure
    return {
      version: '1.0',
      architecture: [],
      codeChanges: [],
      todoItems: [],
      issues: [],
      performance: [],
      dependencies: [],
      keyDecisions: [],
      insights: [],
      lastUpdated: new Date().toISOString(),
      parseError: true,
      rawContent: content
    };
  }
}
