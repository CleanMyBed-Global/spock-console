// Spock Console - Simple Browser Version
const assistantId = "asst_z1ejGukZ2eUJCJeTkpNX3MnD";

// Simple API key handling - ask once per session
let openAiApiKey = null;

function getApiKey() {
  if (!openAiApiKey) {
    openAiApiKey = prompt("🔑 Enter your OpenAI API key (starts with sk-):") || "demo-mode";
  }
  return openAiApiKey;
}

// Project context configurations
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

let currentThreadId = null;

async function submitToSpock() {
  const userInput = document.getElementById('userInput').value.trim();
  const project = document.getElementById('projectSelector').value;
  const responseBox = document.getElementById('responseBox');
  const button = document.querySelector('button');
  
  if (!userInput) {
    showError("Please enter a query for Spock to analyze.");
    return;
  }

  const apiKey = getApiKey();
  
  if (apiKey === "demo-mode") {
    displayDemoResponse(userInput, project);
    return;
  }

  // Disable button and show loading
  setLoadingState(true);
  responseBox.innerHTML = `<div class="loading">Spock is analyzing your request...
  
🔍 Scanning project parameters...
⚡ Accessing system data...
🧠 Generating response...</div>`;

  try {
    // Use simple chat completions instead of assistants for reliability
    const contextualMessage = `${projectContexts[project]}

USER QUERY: ${userInput}

You are Spock, the virtual co-founder-level system intelligence for CleanMyBed. Operate with Vulcan-like calm and precision.

Provide a structured response with code examples, explanations, and next actions.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const spockResponse = data.choices[0].message.content;
    displayResponse(spockResponse);
    
  } catch (error) {
    console.error('Spock Console Error:', error);
    showError(`System Error: ${error.message}`);
    
    if (error.message.includes('Incorrect API key') || error.message.includes('401')) {
      openAiApiKey = null; // Reset so user can enter new key
      showError("Invalid API key. Click Send to try again with a new key.");
    }
  } finally {
    setLoadingState(false);
    document.getElementById('userInput').value = '';
  }
}

function displayDemoResponse(userInput, project) {
  const demoResponses = {
    telegram: `**SPOCK ANALYSIS - TELEGRAM LEAD FLOW**

Query: "${userInput}"

\`\`\`javascript
// Supabase Edge Function for Telegram Lead Processing
export async function handler(req) {
  const { message, user_id, chat_id } = await req.json();
  
  // Log incoming message
  const { data, error } = await supabase
    .from('telegram_leads')
    .insert({
      user_id,
      chat_id, 
      message,
      timestamp: new Date().toISOString(),
      status: 'new'
    });
    
  return new Response(JSON.stringify({ success: true }));
}
\`\`\`

**SPOCK RECOMMENDATION:**
This demonstrates basic lead capture structure. Next actions:
1. Add validation for message content
2. Implement lead scoring algorithm
3. Connect to CRM pipeline

*Logic is the beginning of wisdom, not the end.*`,

    email: `**SPOCK ANALYSIS - EMAIL PORTAL LOGGING**

Query: "${userInput}"

\`\`\`javascript
// Email Portal Logger
async function logEmailEvent(eventData) {
  const logEntry = {
    email_id: eventData.id,
    event_type: eventData.type,
    timestamp: new Date(),
    portal_session: eventData.session_id,
    success_rate: calculateSuccessRate()
  };
  
  await supabase
    .from('email_logs')
    .insert(logEntry);
}
\`\`\`

**SYSTEM STATUS:** Optimal
- Email throughput: 1,247/day
- Portal success: 89%
- Response time: 156ms

**NEXT ACTIONS:**
1. Implement real-time alerts
2. Add deduplication logic
3. Optimize storage compression`,

    response: `**SPOCK ANALYSIS - AI RESPONSE LAYER**

Query: "${userInput}"

\`\`\`javascript
// AI Response Handler
class SpockResponseLayer {
  async generateResponse(query, context) {
    const response = await this.callPrimaryModel(query);
    
    // Cache for optimization
    await this.cacheResponse(query, response);
    
    return {
      response,
      confidence: this.calculateConfidence(response),
      latency: this.measureLatency(),
      tokens_used: this.countTokens(response)
    };
  }
}
\`\`\`

**PERFORMANCE METRICS:**
- Success rate: 98.7%
- Avg response: 342ms
- Cache hit ratio: 76%

**OPTIMIZATION QUEUE:**
1. Fine-tune response templates
2. Implement A/B testing
3. Reduce token usage by 15%`
  };

  const demoResponse = demoResponses[project] || "Demo mode active. Please add your OpenAI API key for full functionality.";
  displayResponse(demoResponse);
}

function displayResponse(response) {
  const responseBox = document.getElementById('responseBox');
  
  // Format the response with syntax highlighting
  const formattedResponse = formatResponse(response);
  
  responseBox.innerHTML = `
    <div class="response-header">
      <div class="spock-status">🖖 SPOCK RESPONSE</div>
      <div class="response-actions">
        <button onclick="copyToClipboard()" class="action-btn">📋 Copy</button>
        <button onclick="regenerateResponse()" class="action-btn">🔄 Regenerate</button>
        <button onclick="resetApiKey()" class="action-btn">🔑 Reset Key</button>
      </div>
    </div>
    <div class="response-content">${formattedResponse}</div>
  `;
}

function formatResponse(text) {
  // Basic markdown-like formatting
  return text
    .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="code-block"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function copyToClipboard() {
  const responseContent = document.querySelector('.response-content');
  const textContent = responseContent.innerText;
  
  navigator.clipboard.writeText(textContent).then(() => {
    showNotification('Response copied to clipboard!');
  }).catch(() => {
    showNotification('Copy failed - please select and copy manually');
  });
}

function regenerateResponse() {
  const lastInput = document.getElementById('userInput').getAttribute('data-last-input');
  if (lastInput) {
    document.getElementById('userInput').value = lastInput;
    submitToSpock();
  }
}

function resetApiKey() {
  openAiApiKey = null;
  showNotification('API key reset. Next query will prompt for new key.');
}

function setLoadingState(isLoading) {
  const button = document.querySelector('button');
  button.disabled = isLoading;
  button.textContent = isLoading ? "Processing..." : "Send";
}

function showError(message) {
  const responseBox = document.getElementById('responseBox');
  responseBox.innerHTML = `<div class="error">❌ ${message}</div>`;
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  // Store last input for regeneration
  const textarea = document.getElementById('userInput');
  textarea.addEventListener('input', function() {
    this.setAttribute('data-last-input', this.value);
  });
  
  // Enter key submission
  textarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitToSpock();
    }
  });
  
  // Project selector updates
  document.getElementById('projectSelector').addEventListener('change', function() {
    const projectInfo = document.getElementById('projectInfo');
    const descriptions = {
      telegram: "Telegram Lead Flow - Automated lead capture and qualification via bot integration",
      email: "Email Portal Logging - Email tracking and portal access monitoring system", 
      response: "AI Response Layer - Intelligent response generation and routing system"
    };
    projectInfo.textContent = descriptions[this.value];
  });
  
  // Initialize first project description
  document.getElementById('projectSelector').dispatchEvent(new Event('change'));
});
