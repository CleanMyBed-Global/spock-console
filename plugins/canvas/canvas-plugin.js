// ===== CANVAS PLUGIN - COMPLETE FILE =====
// FILE: plugins/canvas/canvas-plugin.js
class CanvasPlugin {
  constructor() {
    this.isEnabled = false;
    this.isInitialized = false;
    this.version = '1.0.0';
    
    console.log('🎨 Canvas Plugin loaded v' + this.version);
  }
  
  // Initialize the plugin
  async initialize() {
    try {
      console.log('🎨 Initializing Canvas Plugin...');
      
      // Load required CSS
      this.loadCSS();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize UI components
      this.initializeUI();
      
      this.isInitialized = true;
      this.isEnabled = true;
      
      console.log('✅ Canvas Plugin initialized successfully');
      
      // Notify the main app
      window.dispatchEvent(new CustomEvent('canvas-plugin-ready', {
        detail: { version: this.version }
      }));
      
    } catch (error) {
      console.error('❌ Canvas Plugin initialization failed:', error);
      this.isEnabled = false;
    }
  }
  
  // Load plugin CSS
  loadCSS() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './plugins/canvas/canvas-styles.css';
    document.head.appendChild(link);
  }
  
  // Set up event listeners for chat integration
  setupEventListeners() {
    // Listen for chat messages
    window.addEventListener('spock-chat-message', (event) => {
      this.handleChatMessage(event.detail);
    });
    
    // Listen for canvas creation requests
    window.addEventListener('canvas-create-request', (event) => {
      this.createCanvas(event.detail);
    });
  }
  
  // Initialize UI components
  initializeUI() {
    // Add canvas toggle button to chat header
    this.addCanvasToggleButton();
    
    // Create hidden canvas container
    this.createCanvasContainer();
  }
  
  // Add canvas toggle button to existing chat header
  addCanvasToggleButton() {
    const chatHeader = document.querySelector('.chat-header');
    if (!chatHeader) return;
    
    const toggleButton = document.createElement('button');
    toggleButton.id = 'canvasToggleBtn';
    toggleButton.className = 'canvas-toggle-btn';
    toggleButton.innerHTML = '🎨 Show Canvas';
    toggleButton.onclick = () => this.toggleCanvas();
    
    chatHeader.appendChild(toggleButton);
  }
  
  // Create canvas container (initially hidden)
  createCanvasContainer() {
    const main = document.querySelector('.main');
    if (!main) return;
    
    const canvasContainer = document.createElement('div');
    canvasContainer.id = 'canvasContainer';
    canvasContainer.className = 'canvas-container hidden';
    canvasContainer.innerHTML = `
      <div class="canvas-header">
        <div class="canvas-title">🎨 Canvas Workspace</div>
        <div class="canvas-controls">
          <button class="canvas-btn" onclick="canvasPlugin.hideCanvas()">Hide</button>
        </div>
      </div>
      <div class="canvas-content">
        <div class="canvas-placeholder">
          <div class="canvas-placeholder-icon">🎨</div>
          <div class="canvas-placeholder-text">No canvas created yet</div>
          <div class="canvas-placeholder-hint">Ask Spock to build something to create your first canvas</div>
        </div>
      </div>
    `;
    
    // Insert after main content
    document.querySelector('.container').appendChild(canvasContainer);
  }
  
  // Handle incoming chat messages
  handleChatMessage(messageData) {
    if (!this.isEnabled) return;
    
    console.log('🎨 Canvas Plugin received chat message:', messageData);
    
    // Enhanced canvas trigger detection
    const message = messageData.content.toLowerCase();
    const canvasData = this.detectCanvasTrigger(message);
    
    if (canvasData) {
      console.log('🎨 Canvas trigger detected:', canvasData);
      this.showCanvasConfirmation(canvasData);
    }
  }
  
  // Smart canvas trigger detection
  detectCanvasTrigger(message) {
    // Define trigger patterns with confidence scores
    const patterns = [
      // High confidence triggers
      { regex: /build\s+(me\s+)?(?:a\s+)?(.+?)(?:\s+(?:system|app|component|interface|feature|module|function|class|api))?$/i, confidence: 0.9, type: 'build' },
      { regex: /create\s+(?:a\s+)?(.+?)(?:\s+(?:system|app|component|interface|feature|module|function|class|api))?$/i, confidence: 0.9, type: 'create' },
      { regex: /generate\s+(?:a\s+)?(.+?)(?:\s+(?:system|code|script|function|class|component))?$/i, confidence: 0.8, type: 'generate' },
      { regex: /make\s+(?:me\s+)?(?:a\s+)?(.+?)(?:\s+(?:system|app|component|interface|feature))?$/i, confidence: 0.8, type: 'make' },
      { regex: /develop\s+(?:a\s+)?(.+?)(?:\s+(?:system|application|feature|module))?$/i, confidence: 0.8, type: 'develop' },
      { regex: /write\s+(?:a\s+)?(.+?)(?:\s+(?:function|class|component|script|module))?$/i, confidence: 0.7, type: 'write' },
      
      // Medium confidence triggers
      { regex: /implement\s+(?:a\s+)?(.+?)$/i, confidence: 0.6, type: 'implement' },
      { regex: /design\s+(?:a\s+)?(.+?)$/i, confidence: 0.5, type: 'design' },
      { regex: /code\s+(?:a\s+)?(.+?)$/i, confidence: 0.7, type: 'code' },
      
      // Code-specific triggers
      { regex: /(?:html|css|javascript|python|react|vue|angular|node|express)\s+(.+)/i, confidence: 0.8, type: 'code' },
      { regex: /(?:function|class|component|api|endpoint|database|auth|login|signup)\s+(.+)/i, confidence: 0.7, type: 'code' }
    ];
    
    // Keywords that boost confidence
    const boostKeywords = [
      'system', 'application', 'app', 'interface', 'dashboard', 'portal',
      'component', 'module', 'feature', 'function', 'class', 'api',
      'database', 'auth', 'authentication', 'login', 'signup', 'user',
      'admin', 'management', 'booking', 'payment', 'chat', 'bot'
    ];
    
    // Keywords that reduce confidence (discussion words)
    const reduceKeywords = [
      'about', 'how', 'why', 'what', 'when', 'where', 'explain', 'tell',
      'describe', 'discuss', 'think', 'opinion', 'advice', 'help',
      'question', 'problem', 'issue', 'error', 'debug', 'fix'
    ];
    
    for (const pattern of patterns) {
      const match = message.match(pattern.regex);
      if (match && match[1]) {
        let confidence = pattern.confidence;
        const extractedName = match[1].trim();
        
        // Skip if extracted name is too short or generic
        if (extractedName.length < 3 || ['it', 'this', 'that', 'one', 'something'].includes(extractedName)) {
          continue;
        }
        
        // Boost confidence for specific keywords
        if (boostKeywords.some(keyword => message.includes(keyword))) {
          confidence += 0.1;
        }
        
        // Reduce confidence for discussion keywords
        if (reduceKeywords.some(keyword => message.includes(keyword))) {
          confidence -= 0.2;
        }
        
        // Only trigger if confidence is above threshold
        if (confidence >= 0.6) {
          return {
            name: this.cleanCanvasName(extractedName),
            type: pattern.type,
            confidence: confidence,
            originalText: match[0]
          };
        }
      }
    }
    
    return null;
  }
  
  // Clean and format canvas name
  cleanCanvasName(name) {
    return name
      .replace(/(?:system|app|application|component|interface|feature|module|function|class|api)$/i, '')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  // Show canvas creation confirmation
  showCanvasConfirmation(canvasData) {
    // Remove any existing confirmation
    this.hideCanvasConfirmation();
    
    // Create confirmation UI
    const confirmation = document.createElement('div');
    confirmation.id = 'canvasConfirmation';
    confirmation.className = 'canvas-confirmation';
    confirmation.innerHTML = `
      <div class="canvas-confirmation-content">
        <div class="canvas-confirmation-icon">🎨</div>
        <div class="canvas-confirmation-text">
          <div class="canvas-confirmation-title">Create Canvas?</div>
          <div class="canvas-confirmation-subtitle">"${canvasData.name}"</div>
        </div>
        <div class="canvas-confirmation-actions">
          <button class="canvas-confirmation-btn create" onclick="canvasPlugin.confirmCanvasCreation('${canvasData.name}', '${canvasData.type}')">
            ✅ Create Canvas
          </button>
          <button class="canvas-confirmation-btn cancel" onclick="canvasPlugin.hideCanvasConfirmation()">
            💬 Chat Only
          </button>
        </div>
      </div>
    `;
    
    // Add to chat messages area
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      chatMessages.appendChild(confirmation);
      this.scrollToBottom();
      
      // Auto-hide after 10 seconds
      setTimeout(() => {
        this.hideCanvasConfirmation();
      }, 10000);
    }
  }
  
  // Hide canvas confirmation
  hideCanvasConfirmation() {
    const confirmation = document.getElementById('canvasConfirmation');
    if (confirmation) {
      confirmation.remove();
    }
  }
  
  // Confirm canvas creation
  confirmCanvasCreation(name, type) {
    this.hideCanvasConfirmation();
    console.log('🎨 Creating canvas:', { name, type });
    
    // Show canvas if hidden
    this.showCanvas();
    
    // Create the actual canvas
    this.createNewCanvas(name, type);
  }
  
  // Check if canvas has active work
  hasActiveCanvas() {
    const canvasContent = document.querySelector('.canvas-content');
    return canvasContent && !canvasContent.querySelector('.canvas-placeholder');
  }
  
  // Save current canvas state
  saveCurrentState() {
    // Implementation for saving canvas state
    console.log('🎨 Canvas state saved');
  }
  
  // Canvas action methods (placeholder implementations)
  saveCanvas() {
    console.log('🎨 Saving canvas...');
    showNotification('Canvas saved!');
  }
  
  deployCanvas() {
    console.log('🎨 Deploying canvas...');
    showNotification('Canvas deployed!');
  }
  
  editCanvas() {
    console.log('🎨 Editing canvas...');
    showNotification('Edit mode activated');
  }
  
  copyCanvas() {
    const content = document.querySelector('.canvas-artifact-content');
    if (content) {
      navigator.clipboard.writeText(content.textContent).then(() => {
        showNotification('Canvas content copied!');
      });
    }
  }
  
  // Create a new canvas
  createNewCanvas(name, type) {
    const canvasId = 'canvas_' + Date.now();
    
    const newCanvas = {
      id: canvasId,
      name: name,
      type: type,
      content: this.getCanvasTemplate(name, type),
      created: new Date().toISOString(),
      saves: [],
      isActive: true
    };
    
    // For now, just update the placeholder
    this.displayCanvas(newCanvas);
    
    console.log('🎨 Canvas created:', newCanvas);
  }
  
  // Get canvas template based on type
  getCanvasTemplate(name, type) {
    const templates = {
      'build': `# ${name}

## Overview
Building ${name.toLowerCase()} with the following components:

## Architecture
- [ ] Core structure
- [ ] Key components
- [ ] Integration points

## Implementation Plan
1. Foundation setup
2. Core functionality
3. Integration & testing

## Code Structure
\`\`\`
// ${name} implementation will go here
\`\`\`

---
*Canvas created: ${new Date().toLocaleString()}*`,

      'create': `# ${name}

## Requirements
Creating ${name.toLowerCase()} with these specifications:

## Features
- [ ] Primary functionality
- [ ] User interface
- [ ] Data management

## Technical Details
\`\`\`
// ${name} code structure
\`\`\`

---
*Canvas created: ${new Date().toLocaleString()}*`,

      'default': `# ${name}

## Project Overview
${name} development workspace

## Current Status
🚀 Canvas created - ready for development

## Next Steps
- [ ] Define requirements
- [ ] Plan architecture
- [ ] Begin implementation

---
*Canvas created: ${new Date().toLocaleString()}*`
    };
    
    return templates[type] || templates['default'];
  }
  
  // Display canvas content
  displayCanvas(canvas) {
    const canvasContent = document.querySelector('.canvas-content');
    if (!canvasContent) return;
    
    canvasContent.innerHTML = `
      <div class="canvas-editor">
        <div class="canvas-workspace">
          <div class="canvas-toolbar">
            <div class="canvas-toolbar-left">
              <input type="text" class="canvas-name-input" value="${canvas.name}" readonly>
              <span class="canvas-status">📝 Active</span>
            </div>
            <div class="canvas-toolbar-right">
              <button class="canvas-btn" onclick="canvasPlugin.saveCanvas()">💾 Save</button>
              <button class="canvas-btn primary" onclick="canvasPlugin.deployCanvas()">🚀 Deploy</button>
            </div>
          </div>
          <div class="canvas-content-area">
            <div class="canvas-artifact">
              <div class="canvas-artifact-header">
                <div class="canvas-artifact-title">${canvas.name}</div>
                <div class="canvas-artifact-actions">
                  <button class="canvas-artifact-btn" onclick="canvasPlugin.editCanvas()">✏️ Edit</button>
                  <button class="canvas-artifact-btn" onclick="canvasPlugin.copyCanvas()">📋 Copy</button>
                </div>
              </div>
              <div class="canvas-artifact-content">${canvas.content}</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }
  
  // Helper function for scrolling
  scrollToBottom() {
    const messagesContainer = document.getElementById('chatMessages');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
  
  // Toggle canvas visibility
  toggleCanvas() {
    const container = document.getElementById('canvasContainer');
    const toggleBtn = document.getElementById('canvasToggleBtn');
    
    if (!container) return;
    
    if (container.classList.contains('hidden')) {
      this.showCanvas();
    } else {
      this.hideCanvas();
    }
  }
  
  // Show canvas
  showCanvas() {
    const container = document.getElementById('canvasContainer');
    const toggleBtn = document.getElementById('canvasToggleBtn');
    const main = document.querySelector('.main');
    
    if (!container || !main) return;
    
    container.classList.remove('hidden');
    main.classList.add('split-mode');
    toggleBtn.innerHTML = '🎨 Hide Canvas';
    
    console.log('🎨 Canvas shown');
  }
  
  // Hide canvas
  hideCanvas() {
    const container = document.getElementById('canvasContainer');
    const toggleBtn = document.getElementById('canvasToggleBtn');
    const main = document.querySelector('.main');
    
    if (!container || !main) return;
    
    container.classList.add('hidden');
    main.classList.remove('split-mode');
    toggleBtn.innerHTML = '🎨 Show Canvas';
    
    console.log('🎨 Canvas hidden');
  }
  
  // Create a new canvas
  createCanvas(canvasData) {
    console.log('🎨 Creating canvas:', canvasData);
    // Canvas creation logic will go here
  }
  
  // Cleanup method for nuking the plugin
  destroy() {
    console.log('💥 Destroying Canvas Plugin...');
    
    // Remove UI elements
    const toggleBtn = document.getElementById('canvasToggleBtn');
    const container = document.getElementById('canvasContainer');
    
    if (toggleBtn) toggleBtn.remove();
    if (container) container.remove();
    
    // Reset main layout
    const main = document.querySelector('.main');
    if (main) main.classList.remove('split-mode');
    
    // Remove event listeners
    window.removeEventListener('spock-chat-message', this.handleChatMessage);
    window.removeEventListener('canvas-create-request', this.createCanvas);
    
    this.isEnabled = false;
    this.isInitialized = false;
    
    console.log('💥 Canvas Plugin destroyed');
  }
}

// Global plugin instance
let canvasPlugin = null;

// Plugin loader function
async function loadCanvasPlugin() {
  try {
    canvasPlugin = new CanvasPlugin();
    window.canvasPlugin = canvasPlugin; // Make sure it's globally available
    await canvasPlugin.initialize();
  } catch (error) {
    console.error('Failed to load Canvas Plugin:', error);
  }
}

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasPlugin;
}
