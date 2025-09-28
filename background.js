chrome.runtime.onInstalled.addListener(() => {
  console.log('AI Prompt Enhancer installed');
});

// Listen for messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'enhancePrompt') {
    enhancePrompt(request.prompt)
      .then(result => sendResponse(result))
      .catch(error => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  }
});

async function enhancePrompt(prompt) {
  try {
    const response = await fetch('http://localhost:3000/enhance-prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error enhancing prompt:', error);
    throw error;
  }
}