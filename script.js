// Spock Console - Production Script
const assistantId = "asst_z1ejGukZ2eUJCJeTkpNX3MnD"; // Your actual Assistant ID

// Secure API key handling - no hardcoded keys in code
let openAiApiKey;

// Try to get API key from environment variables (Netlify) or prompt user
if (typeof process !== 'undefined' && process.env && process.env.OPENAI_API_KEY) {
  openAiApiKey = process.env.OPENAI_API_KEY;
} else {
  // For local testing or when environment variables aren't available
  openAiApiKey = prompt("🔑 Enter your OpenAI API key (starts with sk-):") || "demo-mode";
  if (openAiApiKey === "demo-mode") {
    alert("⚠️ Demo mode - Spock responses will be simulated");
  }
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

  // Disable button and show loading
  setLoadingState(true);
  responseBox.innerHTML = `<div class="loading">Spock is analyzing your request...
  
🔍 Scanning project parameters...
⚡ Accessing system data...
🧠 Generating response...</div>`;

  try {
    // Create thread if needed
    if (!currentThreadId) {
      currentThreadId = await createThread();
    }

    // Add context + user message
    const contextualMessage = `${projectContexts[project]}

USER QUERY: ${userInput}

Provide a structured response with code examples, explanations, and next actions.`;

    await addMessageToThread(currentThreadId, contextualMessage);
    
    // Run the assistant
    const runId = await runAssistant(currentThreadId);
    
    // Poll for completion and display response
    const response = await pollForCompletion(currentThreadId, runId);
    displayResponse(response);
    
  } catch (error) {
    console.error('Spock Console Error:', error);
    showError(`System Error: ${error.message}`);
  } finally {
    setLoadingState(false);
    document.getElementById('userInput').value = '';
  }
}

async function createThread() {
  const response = await fetch("https://api.openai.com/v1/threads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAiApiKey}`,
      "OpenAI-Beta": "assistants=v2"
    }
  });
  
  const data = await response.json();
  return data.id;
}

async function addMessageToThread(threadId, content) {
  await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAiApiKey}`,
      "OpenAI-Beta": "assistants=v2"
    },
    body: JSON.stringify({
      role: "user",
      content: content
    })
  });
}

async function runAssistant(threadId) {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${openAiApiKey}`,
      "OpenAI-Beta": "assistants=v2"
    },
    body: JSON.stringify({
      assistant_id: assistantId
    })
  });
  
  const data = await response.json();
  return data.id;
}

async function pollForCompletion(threadId, runId) {
  while (true) {
    const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/runs/${runId}`, {
      headers: {
        "Authorization": `Bearer ${openAiApiKey}`,
        "OpenAI-Beta": "assistants=v2"
      }
    });
    
    const run = await response.json();
    
    if (run.status === 'completed') {
      return await getLatestMessage(threadId);
    } else if (run.status === 'failed') {
      throw new Error('Assistant run failed');
    }
    
    // Wait 1 second before polling again
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}

async function getLatestMessage(threadId) {
  const response = await fetch(`https://api.openai.com/v1/threads/${threadId}/messages`, {
    headers: {
      "Authorization": `Bearer ${openAiApiKey}`,
      "OpenAI-Beta": "assistants=v2"
    }
  });
  
  const data = await response.json();
  return data.data[0].content[0].text.value;
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
  });
}

function regenerateResponse() {
  const lastInput = document.getElementById('userInput').getAttribute('data-last-input');
  if (lastInput) {
    document.getElementById('userInput').value = lastInput;
    submitToSpock();
  }
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
