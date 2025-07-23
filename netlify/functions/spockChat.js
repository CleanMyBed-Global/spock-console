// netlify/functions/spockChat.js - BRAND NEW FUNCTION
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
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    
    // DEBUGGING - Log exactly what we receive
    console.log('=== SPOCK CHAT FUNCTION DEBUG ===');
    console.log('Received body:', JSON.stringify(body, null, 2));
    console.log('Body type:', typeof body);
    console.log('Body keys:', Object.keys(body));
    
    const openAiApiKey = process.env.OPENAI_API_KEY;

    if (!openAiApiKey) {
      console.log('ERROR: No API key found');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'API key not configured' })
      };
    }

    // Get the messages array
    const messages = body.messages || [];
    console.log('Messages array length:', messages.length);
    console.log('Messages:', JSON.stringify(messages, null, 2));
    
    if (messages.length === 0) {
      console.log('ERROR: No messages in request');
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'No messages provided' })
      };
    }

    console.log('Calling OpenAI with', messages.length, 'messages');

    // Call OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${openAiApiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: messages,
        temperature: 0.3,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenAI response received successfully');
    console.log('Response length:', data.choices[0].message.content.length);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        response: data.choices[0].message.content,
        debug: {
          messagesReceived: messages.length,
          functionName: 'spockChat',
          timestamp: new Date().toISOString()
        }
      })
    };

  } catch (error) {
    console.error('Function error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Server error',
        message: error.message,
        debug: {
          functionName: 'spockChat',
          timestamp: new Date().toISOString()
        }
      })
    };
  }
}
