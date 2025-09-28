(function() {
  'use strict';
  
  console.log('🚀 AI Prompt Enhancer: Content script loaded');
  
  let enhanceButton = null;
  let currentTextarea = null;
  let isEnhancing = false; // Prevent multiple simultaneous requests
  
  // Updated selectors for ChatGPT
  const SELECTORS = [
    'textarea[data-id="root"]',
    '#prompt-textarea', 
    'textarea[placeholder*="Message"]',
    'div[contenteditable="true"][data-id="root"]',
    'div[contenteditable="true"]'
  ];
  
  function findTextInput() {
    for (const selector of SELECTORS) {
      const element = document.querySelector(selector);
      if (element && isVisible(element)) {
        return element;
      }
    }
    return null;
  }
  
  function isVisible(element) {
    const rect = element.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0;
  }
  
  function createEnhanceButton() {
    const button = document.createElement('button');
    button.id = 'ai-prompt-enhancer-btn';
    button.innerHTML = '✨ Enhance';
    button.title = 'Enhance this prompt with AI';
    
    button.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isEnhancing) {
        await handleEnhanceClick();
      }
    });
    
    return button;
  }
  
  async function handleEnhanceClick() {
    if (!currentTextarea || isEnhancing) return;
    
    const originalText = getTextContent(currentTextarea);
    if (!originalText.trim()) {
      showNotification('Please write a prompt first!', 'warning');
      return;
    }
    
    // Prevent multiple requests
    isEnhancing = true;
    enhanceButton.innerHTML = '⏳ Enhancing...';
    enhanceButton.disabled = true;
    
    try {
      console.log('📡 Sending request...');
      const startTime = Date.now();
      
      const response = await chrome.runtime.sendMessage({
        action: 'enhancePrompt',
        prompt: originalText
      });
      
      const duration = Date.now() - startTime;
      console.log(`📨 Response received in ${duration}ms`);
      
      if (response.error) {
        throw new Error(response.error);
      }
      
      if (response.enhanced) {
        setTextContent(currentTextarea, response.enhanced);
        showNotification(`Enhanced in ${Math.round(duration/1000)}s! ✨`, 'success');
      }
      
    } catch (error) {
      console.error('💥 Enhancement error:', error);
      showNotification('Enhancement failed. Check backend.', 'error');
    } finally {
      isEnhancing = false;
      enhanceButton.innerHTML = '✨ Enhance';
      enhanceButton.disabled = false;
    }
  }
  
  function getTextContent(element) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      return element.value;
    } else if (element.contentEditable === 'true') {
      return element.textContent || element.innerText || '';
    }
    return '';
  }
  
  function setTextContent(element, text) {
    if (element.tagName === 'TEXTAREA' || element.tagName === 'INPUT') {
      element.value = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.contentEditable === 'true') {
      element.textContent = text;
      element.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
  
  function positionButton(textarea) {
    if (!enhanceButton || !textarea) return;
    
    const rect = textarea.getBoundingClientRect();
    enhanceButton.style.position = 'fixed';
    enhanceButton.style.top = (rect.top - 45) + 'px';
    enhanceButton.style.right = '20px';
    enhanceButton.style.zIndex = '10000';
    enhanceButton.style.display = 'block';
  }
  
  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `ai-enhancer-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 2500); // Shorter notification time
  }
  
  function setupButton() {
    const textarea = findTextInput();
    
    if (textarea && textarea !== currentTextarea) {
      currentTextarea = textarea;
      
      if (enhanceButton) {
        enhanceButton.remove();
      }
      
      enhanceButton = createEnhanceButton();
      document.body.appendChild(enhanceButton);
      positionButton(textarea);
      
      // Show/hide button on focus/blur
      textarea.addEventListener('focus', () => {
        enhanceButton.style.display = 'block';
        positionButton(textarea);
      });
      
      textarea.addEventListener('blur', () => {
        setTimeout(() => {
          if (!enhanceButton.matches(':hover')) {
            enhanceButton.style.display = 'none';
          }
        }, 100);
      });
      
      // Reposition on scroll
      window.addEventListener('scroll', () => positionButton(textarea), { passive: true });
    }
  }
  
  // Initialize with debouncing
  let setupTimeout;
  function debouncedSetup() {
    clearTimeout(setupTimeout);
    setupTimeout = setTimeout(setupButton, 200);
  }
  
  // Wait for page load then initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', debouncedSetup);
  } else {
    setTimeout(debouncedSetup, 1000);
  }
  
  // Watch for DOM changes (debounced)
  const observer = new MutationObserver(debouncedSetup);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
  
})();