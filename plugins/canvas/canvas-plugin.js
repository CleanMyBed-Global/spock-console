// ===== STEP 1: PLUGIN FOUNDATION =====

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
    
    // Simple canvas trigger detection (we'll make this smarter later)
    const message = messageData.content.toLowerCase();
    const canvasTriggers = ['build me', 'create a', 'generate a', 'make a'];
    
    if (canvasTriggers.some(trigger => message.includes(trigger))) {
      console.log('🎨 Potential canvas trigger detected');
      // For now, just log - we'll add canvas creation logic later
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
    await canvasPlugin.initialize();
  } catch (error) {
    console.error('Failed to load Canvas Plugin:', error);
  }
}

// Export for potential future use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CanvasPlugin;
}
