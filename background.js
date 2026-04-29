chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'callClaude') {
    chrome.storage.local.get(['replymint_api_key'], async (result) => {
      const apiKey = result.replymint_api_key;
      if (!apiKey) { sendResponse({ error: 'No API key saved' }); return; }
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true',
            'content-type': 'application/json'
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 1000,
            messages: [{ role: 'user', content: message.prompt }]
          })
        });
        const data = await response.json();
        if (data.error) { sendResponse({ error: data.error.message }); }
        else { sendResponse({ result: data.content[0].text }); }
      } catch (err) {
        sendResponse({ error: err.message });
      }
    });
    return true;
  }

  if (message.action === 'scrapeAndStore') {
    chrome.tabs.query({ url: 'https://www.linkedin.com/*' }, async (tabs) => {
      if (!tabs || tabs.length === 0) {
        sendResponse({ error: 'No LinkedIn tab found. Make sure LinkedIn is open.' });
        return;
      }
      const tab = tabs[0];
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            let best = '';
            document.querySelectorAll('div, p, span').forEach(el => {
              if (el.children.length > 8) return;
              const t = (el.innerText || '').trim();
              if (t.length > 100 && t.length > best.length && t.length < 3000) {
                const low = t.toLowerCase();
                if (!low.includes('cookie') && !low.includes('sign in') &&
                    !low.includes('privacy policy') && !low.includes('terms of service') &&
                    !low.includes('javascript')) {
                  best = t;
                }
              }
            });
            return best;
          }
        });
        const text = results?.[0]?.result || '';
        if (text && text.length > 50) {
          sendResponse({ text });
        } else {
          sendResponse({ error: 'Could not find post text on page' });
        }
      } catch (e) {
        sendResponse({ error: 'Scripting error: ' + e.message });
      }
    });
    return true;
  }

});
