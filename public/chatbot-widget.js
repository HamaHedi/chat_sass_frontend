/**
 * Chatbot Widget - Embed script for external websites
 * 
 * Usage:
 * <script src="https://your-domain.com/chatbot-widget.js"></script>
 * <div id="chatbot-container"></div>
 * <script>
 *   ChatbotWidget.init({
 *     id: 'chatbot_123',
 *     containerId: 'chatbot-container'
 *   });
 * </script>
 */

(function() {
  const ChatbotWidget = {
    config: {
      id: null,
      containerId: 'chatbot-container',
      width: '400px',
      height: '600px',
      position: 'bottom-right',
      apiBaseUrl: 'https://your-domain.com',
    },

    init: function(options) {
      // Merge options with defaults
      this.config = { ...this.config, ...options };

      if (!this.config.id) {
        console.error('ChatbotWidget: chatbot ID is required');
        return;
      }

      // Create container if it doesn't exist
      let container = document.getElementById(this.config.containerId);
      if (!container) {
        container = document.createElement('div');
        container.id = this.config.containerId;
        document.body.appendChild(container);
      }

      // Create iframe
      const iframe = document.createElement('iframe');
      iframe.src = `${this.config.apiBaseUrl}/widget?id=${this.config.id}`;
      iframe.width = this.config.width;
      iframe.height = this.config.height;
      iframe.frameBorder = '0';
      iframe.allow = 'autoplay';
      iframe.style.cssText = `
        border: none;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(165, 131, 210, 0.15);
        display: block;
        width: 100%;
        height: 100%;
      `;

      // Set container styles
      container.style.cssText = `
        width: ${this.config.width};
        height: ${this.config.height};
        position: fixed;
        ${this.config.position.includes('bottom') ? `bottom: 20px;` : `top: 20px;`}
        ${this.config.position.includes('right') ? `right: 20px;` : `left: 20px;`}
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      `;

      // Append iframe
      container.appendChild(iframe);

      return this;
    },

    // Utility method to generate embed code
    generateEmbedCode: function(chatbotId) {
      const apiUrl = this.config.apiBaseUrl;
      return `<!-- Chatbot Widget -->
<div id="chatbot-container" style="width: 400px; height: 600px; position: fixed; bottom: 20px; right: 20px; z-index: 9999;"></div>
<script src="${apiUrl}/chatbot-widget.js"><\/script>
<script>
  ChatbotWidget.init({
    id: '${chatbotId}',
    containerId: 'chatbot-container'
  });
<\/script>`;
    },
  };

  // Expose globally
  window.ChatbotWidget = ChatbotWidget;

  // Auto-initialize if data attributes are present
  document.addEventListener('DOMContentLoaded', function() {
    const autoInit = document.querySelector('[data-chatbot-widget]');
    if (autoInit) {
      const chatbotId = autoInit.getAttribute('data-chatbot-id');
      const containerId = autoInit.getAttribute('data-container-id') || 'chatbot-container';
      const apiBaseUrl = autoInit.getAttribute('data-api-url') || 'https://your-domain.com';

      ChatbotWidget.config.apiBaseUrl = apiBaseUrl;
      ChatbotWidget.init({
        id: chatbotId,
        containerId: containerId,
      });
    }
  });
})();
