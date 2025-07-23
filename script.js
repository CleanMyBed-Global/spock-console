// netlify/functions/askSpock.js
export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const openAiApiKey = process.env.OPENAI_API_KEY;

    if (!openAiApiKey) {
      console.warn('Missing OpenAI API key');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ success: false, error: 'API key not configured' })
      };
    }

    const messages = body.messages;

    if (!Array.isArray(messages) || messages.length === 0) {
      console.warn('Empty or undefined message array received:', messages);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid input. Please provide a valid prompt.'
        })
      };
    }

    // Sanity check: ensure user message exists and isn’t just whitespace
    const userMsg = messages.find(msg => msg.role === 'user');
    if (!userMsg || !userMsg.content || userMsg.content.trim() === '') {
      console.warn('Blank or missing user message:', userMsg);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Your message was empty. Please try again with a specific question or command.'
        })
      };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages,
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
        response: data.choices?.[0]?.message?.content || '[No response from Spock]'
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        success: false,
        error: 'Server error',
        message: error.message
      })
    };
  }
}
