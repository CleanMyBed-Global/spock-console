// netlify/functions/askSpock.js - Updated for Chat Interface
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
    const { messages, stream = false } = JSON.parse(event.body);
    const openAiApiKey = process.env.OPENAI_API_KEY;

    if (!openAiApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'OpenAI API key not configured' })
      };
    }

    if (!messages || !Array.isArray(messages)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Messages array is required' })
      };
    }

    // Enhanced system message for better Spock responses
    const enhancedMessages = messages.map((message, index) => {
      if (message.role === 'system' && index === 0) {
        return {
          ...message,
          content: `${message.content}

CORE SPOCK TRAITS:
- Vulcan-like calm and precision in all responses
- Logical analysis with practical solutions
- Clear, structured communication
- Code examples when relevant
- Always end with logical next steps

RESPONSE FORMAT:
- Be concise but thorough
- Use proper formatting for code blocks
- Provide actionable guidance
- Maintain professional technical tone
- Reference previous context when relevant

TECHNOLOGY EXPERTISE:
- Supabase (database, auth, edge functions, storage)
- JavaScript/Node.js/React development
- Telegram Bot API and webhook handling
- Email systems and SMTP integration
- AI/ML model integration and optimization
- System architecture and database design
- API development and integration patterns
- Modern web development practices

Remember: You are having an ongoing conversation. Build upon previous messages and maintain context.`
        };
      }
      return message;
    });

    // Call OpenAI Chat Completions API
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: enhancedMessages,
        temperature: 0.3,
        max_tokens: 2000,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
        stream: stream
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();

    // Validate response structure
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response structure from OpenAI API');
    }

    const spockResponse = data.choices[0].message.content;

    // Enhanced response with metadata
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: spockResponse,
        metadata: {
          model: data.model,
          usage: data.usage,
          timestamp: new Date().toISOString(),
          conversation_length: messages.length
        }
      })
    };

  } catch (error) {
    console.error('Spock function error:', error);
    
    // Enhanced error handling with specific error types
    let errorMessage = 'Internal server error';
    let statusCode = 500;

    if (error.message.includes('API key')) {
      errorMessage = 'Authentication failed - check API key configuration';
      statusCode = 401;
    } else if (error.message.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded - please try again in a moment';
      statusCode = 429;
    } else if (error.message.includes('OpenAI API error')) {
      errorMessage = error.message;
      statusCode = 502;
    } else if (error.message.includes('Messages array')) {
      errorMessage = 'Invalid request format';
      statusCode = 400;
    }
    
    return {
      statusCode: statusCode,
      headers,
      body: JSON.stringify({ 
        error: errorMessage,
        message: error.message,
        timestamp: new Date().toISOString()
      })
    };
  }
}
