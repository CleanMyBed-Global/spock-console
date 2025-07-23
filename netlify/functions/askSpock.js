// netlify/functions/askSpock.js
export async function handler(event, context) {
  // CORS headers for browser requests
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  // Handle preflight requests
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
    const { userInput, project } = JSON.parse(event.body);
    const openAiApiKey = process.env.OPENAI_API_KEY;
    const assistantId = "asst_z1ejGukZ2eUJCJeTkpNX3MnD";

    if (!openAiApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    // Project contexts
    const projectContexts = {
      telegram: `
TELEGRAM LEAD FLOW PROJECT CONTEXT:
- Bot framework: Telegram Bot API
- Lead capture and qualification system
- Database: Supabase with lead scoring
- Webhook integrations for real-time processing
- Focus: Conversation flows, data validation, CRM integration
`,
      email: `
EMAIL PORTAL LOGGING PROJECT CONTEXT:
- SMTP monitoring and email tracking
- Portal authentication via OAuth 2.0
- Time-series logging in Supabase
- React-based analytics dashboard
- Focus: Email throughput, session management, log compression
`,
      response: `
AI RESPONSE LAYER PROJECT CONTEXT:
- Multi-model AI system (GPT-4, Claude)
- Response caching with Redis
- Intent classification and sentiment analysis
- Context preservation across conversations
- Focus: Response optimization, token efficiency, A/B testing
`
    };

    const contextualMessage = `${projectContexts[project] || ''}

USER QUERY: ${userInput}

Provide a structured response with code examples, explanations, and next actions.`;

    // Call OpenAI API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: `You are Spock, the virtual co-founder-level system intelligence for CleanMyBed. You operate with Vulcan-like calm and precision.

CORE ROLE:
- System architect and code reviewer for CleanMyBed's full stack
- Logic handler for Supabase, Edge Functions, GHL, Telegram, Zoho integrations
- Clean code advocate - no fluff, only solutions
- Technical documentation expert

PERSONALITY:
- Confident but never robotic
- Structured and logical responses
- Always provide actionable solutions

TECHNOLOGY STACK:
- Supabase (database, auth, edge functions)
- Telegram Bot API integrations
- GoHighLevel (GHL) CRM workflows
- Zoho integrations
- JavaScript/Node.js
- HTML/CSS frontend systems

OUTPUT FORMAT:
- Provide clean, readable code blocks
- Include brief explanations
- Suggest improvements and optimizations
- Always end with next recommended actions`
          },
          { role: "user", content: contextualMessage }
        ],
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: data.choices[0].message.content
      })
    };

  } catch (error) {
    console.error('Spock function error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      })
    };
  }
}
