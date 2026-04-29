let selectedStarter = '';
let selectedTone = 'Casual';
let currentPost = '';
let cachedAngles = null; // Cache so tone changes don't re-call API unnecessarily

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();
  loadHistory();
  bindEvents();
  chrome.storage.local.get(['replymint_api_key'], (data) => {
    if (!data.replymint_api_key) showSetup();
    else { showMain(); showHint(); }
  });
});

function bindEvents() {
  document.getElementById('save-key-btn').addEventListener('click', () => {
    const key = document.getElementById('api-key-input').value.trim();
    if (!key || key.length < 20) { showError('Please enter a valid API key!'); return; }
    chrome.storage.local.set({ replymint_api_key: key }, () => { showMain(); showHint(); });
  });

  document.getElementById('dark-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark');
    chrome.storage.local.set({ replymint_theme: document.body.classList.contains('dark') ? 'dark' : 'light' });
  });

  document.getElementById('analyse-btn').addEventListener('click', () => {
    const text = document.getElementById('paste-input').value.trim();
    if (!text || text.length < 30) { showError('Please paste some post text first!'); return; }
    currentPost = text;
    cachedAngles = null; // New post = fresh analysis
    showContentArea();
    analysePost(currentPost);
  });

  document.getElementById('new-post-btn').addEventListener('click', () => {
    document.getElementById('paste-input').value = '';
    cachedAngles = null;
    showHint();
  });

  document.querySelectorAll('.tone-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.tone-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      selectedTone = chip.dataset.tone;
      // Re-render cached angles with new tone labels if we have them
      // Otherwise re-analyse (only if no cache)
      if (cachedAngles) {
        rewriteStartersForTone();
      } else if (currentPost) {
        analysePost(currentPost);
      }
    });
  });

  document.querySelectorAll('.polish-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!selectedStarter) { showError('Pick an angle first! 👆'); return; }
      polishStarter(selectedStarter, btn.dataset.style);
    });
  });

  document.getElementById('refresh-btn').addEventListener('click', () => {
    if (currentPost) { cachedAngles = null; analysePost(currentPost); }
    else showHint();
  });

  document.getElementById('copy-btn').addEventListener('click', () => {
    const pb = document.getElementById('polished-box');
    const text = (pb.style.display !== 'none' && pb.innerText.trim()) ? pb.innerText.trim() : selectedStarter;
    if (!text) { showError('Pick an angle first!'); return; }
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('copy-btn');
      btn.textContent = 'Copied! ✓';
      btn.style.background = 'linear-gradient(135deg,#16a34a,#15803d)';
      setTimeout(() => { btn.textContent = 'Copy starter ✦'; btn.style.background = ''; }, 1500);
    });
  });

  document.getElementById('paste-input').addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') document.getElementById('analyse-btn').click();
  });
}

function analysePost(postText) {
  showLoading(true);
  selectedStarter = '';
  document.getElementById('polished-box').style.display = 'none';
  document.getElementById('angles-container').innerHTML = '';
  document.getElementById('tldr-box').textContent = '';

  const prompt = `You are ReplyMint. Analyse this LinkedIn post and return ONLY raw JSON — no markdown, no backticks, nothing else.

{"summary":"2-3 sentence TL;DR with witty tone","angles":[{"type":"agree","badge":"Agree + extend","title":"Validate and add a layer","starter":"First-person opener in ${selectedTone} tone"},{"type":"challenge","badge":"Push back","title":"Respectfully challenge","starter":"..."},{"type":"story","badge":"Personal story","title":"Share a moment","starter":"..."},{"type":"data","badge":"Add a fact","title":"Bring an insight","starter":"..."}]}

Post: """${postText.substring(0,1500)}"""`;

  chrome.runtime.sendMessage({ action: 'callClaude', prompt }, (response) => {
    showLoading(false);
    if (chrome.runtime.lastError || !response) { showError('Extension error — try closing and reopening.'); return; }
    if (response.error) { showError('API: ' + response.error.substring(0,80)); return; }
    try {
      let raw = response.result.trim().replace(/^```json\s*/i,'').replace(/^```/,'').replace(/```$/,'').trim();
      const data = JSON.parse(raw);
      cachedAngles = data; // Cache for tone switching
      renderResults(data, postText);
    } catch(e) {
      showError('Parse error — try again 🌱');
      console.error(e, response?.result);
    }
  });
}

function rewriteStartersForTone() {
  // Instead of calling API again, just re-call with cached post to get tone-adapted starters
  // This keeps UX fast — only the starters change, summary stays
  if (!currentPost || !cachedAngles) return;
  
  const prompt = `Rewrite these 4 LinkedIn comment starters in a ${selectedTone} tone. Keep same angle but adjust phrasing. Return ONLY raw JSON array:
[{"type":"agree","starter":"..."},{"type":"challenge","starter":"..."},{"type":"story","starter":"..."},{"type":"data","starter":"..."}]

Original starters:
${cachedAngles.angles.map(a => `${a.type}: "${a.starter}"`).join('\n')}`;

  showLoading(true);
  chrome.runtime.sendMessage({ action: 'callClaude', prompt }, (response) => {
    showLoading(false);
    if (!response || response.error || !response.result) return;
    try {
      let raw = response.result.trim().replace(/^```json\s*/i,'').replace(/^```/,'').replace(/```$/,'').trim();
      const newStarters = JSON.parse(raw);
      // Merge new starters into cached angles
      newStarters.forEach(ns => {
        const angle = cachedAngles.angles.find(a => a.type === ns.type);
        if (angle) angle.starter = ns.starter;
      });
      renderAngles(cachedAngles.angles);
    } catch(e) { /* silently fail, keep old starters */ }
  });
}

function polishStarter(starter, style) {
  showLoading(true);
  chrome.runtime.sendMessage({
    action: 'callClaude',
    prompt: `Rewrite this LinkedIn comment opener to be ${style}. Max 25 words. First person. Natural. Return ONLY the rewritten sentence:\n${starter}`
  }, (resp) => {
    showLoading(false);
    if (!resp || resp.error) { showError('Polish failed. Try again.'); return; }
    const box = document.getElementById('polished-box');
    box.textContent = resp.result.trim();
    box.style.display = 'block';
  });
}

function renderResults(data, postText) {
  document.getElementById('tldr-box').textContent = data.summary;
  renderAngles(data.angles);
  saveToHistory(postText, data.angles[0].type);
}

function renderAngles(angles) {
  const container = document.getElementById('angles-container');
  container.innerHTML = '';
  const bm = { agree:'badge-agree', challenge:'badge-challenge', story:'badge-story', data:'badge-data' };
  angles.forEach((angle, i) => {
    const card = document.createElement('div');
    card.className = 'angle-card' + (i === 0 ? ' selected' : '');
    card.innerHTML = `
      <span class="badge ${bm[angle.type]||'badge-agree'}">${angle.badge}</span>
      <div class="angle-title">${angle.title}</div>
      <div class="angle-starter">"${angle.starter}"</div>
    `;
    if (i === 0) selectedStarter = angle.starter;
    card.addEventListener('click', () => {
      document.querySelectorAll('.angle-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      selectedStarter = angle.starter;
      document.getElementById('polished-box').style.display = 'none';
    });
    container.appendChild(card);
  });
}

function saveToHistory(postText, type) {
  chrome.storage.local.get(['replymint_history'], (d) => {
    const h = d.replymint_history || [];
    h.unshift({ preview: postText.substring(0,55), type, time: Date.now() });
    if (h.length > 5) h.pop();
    chrome.storage.local.set({ replymint_history: h }, loadHistory);
  });
}

function loadHistory() {
  chrome.storage.local.get(['replymint_history'], (d) => {
    const list = document.getElementById('history-list');
    if (!list) return;
    const h = d.replymint_history || [];
    if (!h.length) { list.innerHTML = '<div class="empty-history">Nothing here yet — go mint some replies! 🌱</div>'; return; }
    const bm = { agree:'badge-agree', challenge:'badge-challenge', story:'badge-story', data:'badge-data' };
    list.innerHTML = h.map(item => `
      <div class="history-item">
        <span class="badge ${bm[item.type]||'badge-agree'}">${item.type}</span>
        <span class="history-preview">${item.preview}...</span>
        <span class="history-time">${timeAgo(item.time)}</span>
      </div>`).join('');
  });
}

function timeAgo(ts) {
  const d = Math.floor((Date.now()-ts)/1000);
  if (d<60) return d+'s ago'; if (d<3600) return Math.floor(d/60)+'m ago';
  if (d<86400) return Math.floor(d/3600)+'h ago'; return Math.floor(d/86400)+'d ago';
}

function showSetup() { document.getElementById('setup-section').style.display='block'; document.getElementById('main-section').style.display='none'; }
function showMain() { document.getElementById('setup-section').style.display='none'; document.getElementById('main-section').style.display='block'; }
function showHint() { document.getElementById('hint-box').style.display='block'; document.getElementById('content-area').style.display='none'; }
function showContentArea() { document.getElementById('hint-box').style.display='none'; document.getElementById('content-area').style.display='block'; }
function showLoading(show) { document.getElementById('loading').classList.toggle('show', show); }
function showError(msg) { const b=document.getElementById('error-box'); b.textContent=msg; b.classList.add('show'); setTimeout(()=>b.classList.remove('show'),5000); }
function loadTheme() { chrome.storage.local.get(['replymint_theme'],(d)=>{ if(d.replymint_theme==='dark') document.body.classList.add('dark'); }); }
