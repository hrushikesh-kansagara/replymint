console.log('ReplyMint content script running');

// Capture text as soon as user stops selecting
document.addEventListener('mouseup', () => {
  setTimeout(() => {
    const selected = window.getSelection().toString().trim();
    if (selected.length > 60) {
      chrome.storage.local.set({ 
        replymint_post: selected,
        replymint_triggered: true,
        replymint_time: Date.now()
      }, () => {
        console.log('ReplyMint: captured', selected.length, 'chars');
      });
    }
  }, 100);
});

// Also capture on keyboard selection (Ctrl+A etc)
document.addEventListener('keyup', (e) => {
  if (e.shiftKey || e.ctrlKey || e.metaKey) {
    const selected = window.getSelection().toString().trim();
    if (selected.length > 60) {
      chrome.storage.local.set({ 
        replymint_post: selected,
        replymint_triggered: true,
        replymint_time: Date.now()
      });
    }
  }
});
