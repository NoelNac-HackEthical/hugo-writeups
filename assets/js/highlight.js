// assets/js/highlight.js
(function(){
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Styles : jaune gras sans fond + barre navigation
  const css = `
  mark.__hl-target {
    outline: 2px solid currentColor;
  }
  @keyframes __hlPulse {
    from { color: #d4aa00; font-weight: bold; }
    to   { color: #e6b800; font-weight: bold; }
  }
  mark.__hl {
    background: none !important;
    color: #e6b800;
    font-weight: bold;
    animation: __hlPulse 1.2s ease-in-out 1;
  }
  pre code mark.__hl {
    background: none !important;
    color: #e6b800;
    font-weight: bold;
    padding: 0;
    border-radius: 0;
    box-shadow: none;
  }
  .__hl-nav {
    position: fixed; right: 1rem; bottom: 1rem;
    display: flex; gap: .5rem; align-items: center;
    padding: .4rem .6rem; border: 1px solid var(--border, #ddd);
    background: var(--theme, #fff); color: inherit;
    border-radius: .5rem; box-shadow: 0 4px 20px rgba(0,0,0,.08); z-index: 9999;
    font: 14px/1.3 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji","Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  }
  .__hl-nav button {
    cursor: pointer; border: 1px solid var(--border, #ddd); background: transparent;
    padding: .25rem .6rem; border-radius: .4rem;
  }
  .__hl-nav button:disabled { opacity: .5; cursor: default; }
  .__hl-counter { min-width: 4.6rem; text-align: center; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const params = new URLSearchParams(window.location.search);
  const termRaw = params.get('highlight');
  if (!termRaw) return;

  const initialIndex = (() => {
    const v = parseInt(params.get('highlightIndex') || '0', 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  })();

  // Décoder la requête : "phrase exacte" + mots (AND)
  const needles = [];
  const phraseRE = /"([^"]+)"/g;
  let m;
  while((m = phraseRE.exec(termRaw))) needles.push(m[1]);
  const cleaned = termRaw.replace(/"([^"]+)"/g,' ').trim();
  if (cleaned) needles.push(...cleaned.split(/\s+/));
  const uniqueNeedles = Array.from(new Set(needles.filter(Boolean)));
  if (!uniqueNeedles.length) return;

  // ✅ Zone scannée élargie
  const scope = document.querySelector('.post-single, .post-content, .entry-content, article, main, body') || document.body;

  function highlightInNode(node, re, marks){
    const text = node.nodeValue;
    let match;
    let offset = 0;
    const frag = document.createDocumentFragment();

    while((match = re.exec(text)) !== null){
      const start = match.index;
      const end = start + match[0].length;
      if (start > offset) frag.appendChild(document.createTextNode(text.slice(offset, start)));
      const mark = document.createElement('mark');
      mark.className = '__hl';
      mark.textContent = text.slice(start, end);
      frag.appendChild(mark);
      marks.push(mark);
      offset = end;
    }
    if (offset < text.length) frag.appendChild(document.createTextNode(text.slice(offset)));
    node.parentNode.replaceChild(frag, node);
  }

  // ✅ Autoriser <pre> et <code> mais exclure post-meta et toc
  function walkAndHighlight(root, needles){
    const marks = [];
    const pattern = needles.map(escapeRegExp).join('|');
    const re = new RegExp(pattern, 'gi');
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.nodeName.toLowerCase();

        // Exclusions spécifiques
        if (
          /(script|style|noscript|textarea|svg)/.test(tag) ||
          p.closest('.post-meta, .toc, .toc-container')
        ) return NodeFilter.FILTER_REJECT;

        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    const toProcess = [];
    while(walker.nextNode()){
      const n = walker.currentNode;
      if (re.test(n.nodeValue)) toProcess.push(n);
      re.lastIndex = 0;
    }
    for (const n of toProcess){
      highlightInNode(n, re, marks);
    }
    return marks;
  }

  const marks = walkAndHighlight(scope, uniqueNeedles);
  if (!marks.length) return;

  // Navigation UI
  const nav = document.createElement('div');
  nav.className = '__hl-nav';
  nav.innerHTML = `
    <button type="button" class="__hl-prev" aria-label="Occurrence précédente">◀</button>
    <span class="__hl-counter" aria-live="polite" aria-atomic="true"></span>
    <button type="button" class="__hl-next" aria-label="Occurrence suivante">▶</button>
  `;
  document.body.appendChild(nav);
  const btnPrev = nav.querySelector('.__hl-prev');
  const btnNext = nav.querySelector('.__hl-next');
  const counter = nav.querySelector('.__hl-counter');

  let idx = Math.max(0, Math.min(initialIndex, marks.length - 1));

  function updateURLIndex(i){
    const url = new URL(window.location.href);
    url.searchParams.set('highlightIndex', String(i));
    window.history.replaceState(null, '', url.toString());
  }
  function clearTargets(){
    for (const m of marks) m.classList.remove('__hl-target');
  }
  function updateCounter(){
    counter.textContent = `${idx + 1} / ${marks.length}`;
    btnPrev.disabled = marks.length <= 1;
    btnNext.disabled = marks.length <= 1;
  }
  function goTo(i, smooth = true){
    if (!marks.length) return;
    idx = Math.max(0, Math.min(i, marks.length - 1));
    clearTargets();
    const target = marks[idx];
    target.classList.add('__hl-target');
    target.scrollIntoView({behavior: smooth ? 'smooth' : 'auto', block: 'center', inline: 'nearest'});
    updateCounter();
    updateURLIndex(idx);
  }
  btnPrev.addEventListener('click', ()=> goTo((idx - 1 + marks.length) % marks.length));
  btnNext.addEventListener('click', ()=> goTo((idx + 1) % marks.length));
  document.addEventListener('keydown', (e)=>{
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    if (/(input|textarea|select)/.test(tag)) return;
    if (e.key === '[') { e.preventDefault(); btnPrev.click(); }
    if (e.key === ']') { e.preventDefault(); btnNext.click(); }
  });
  goTo(idx, false);
})();
