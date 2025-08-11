// assets/js/highlight.js — navigation + sortie douce (Esc court) + sortie dure (Esc long | Shift+Esc)
(function(){
  const MANIFEST_KEY = 'HL_MANIFEST_V1';
  const PARAM_TERM  = 'highlight';
  const PARAM_INDEX = 'highlightIndex';

  // ---------- Utils ----------
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function samePath(a, b){
    try{
      const ua = new URL(a, window.location.origin).pathname.replace(/\/+$/,'/') || '/';
      const ub = new URL(b, window.location.origin).pathname.replace(/\/+$/,'/') || '/';
      return ua === ub;
    }catch{ return a === b; }
  }
  function removeParamsFromURL(){
    try{
      const url = new URL(location.href);
      url.searchParams.delete(PARAM_TERM);
      url.searchParams.delete(PARAM_INDEX);
      history.replaceState(null, '', url.toString());
    }catch{}
  }

  // ---------- Styles ----------
  const css = `
  mark.__hl-target { outline: 2px solid currentColor; }
  @keyframes __hlPulse { from { color: #d4aa00; font-weight: bold; } to { color: #e6b800; font-weight: bold; } }
  mark.__hl { background: none !important; color: #e6b800; font-weight: bold; animation: __hlPulse 1.2s ease-in-out 1; }
  pre code mark.__hl { background: none !important; color: #e6b800; font-weight: bold; padding: 0; border-radius: 0; box-shadow: none; }

  /* Sortie douce: on "désactive" visuellement sans toucher au DOM */
  body[data-hl-active="0"] mark.__hl { color: inherit !important; font-weight: inherit !important; animation: none !important; }
  body[data-hl-active="0"] pre code mark.__hl { color: inherit !important; }
  body[data-hl-active="0"] mark.__hl-target { outline: none !important; }

  .__hl-nav {
    position: fixed; right: 1rem; bottom: 1rem; display: flex; gap: .5rem; align-items: center;
    padding: .4rem .6rem; border: 1px solid var(--border, #ddd);
    background: var(--theme, #fff); color: inherit; border-radius: .5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,.08); z-index: 9999;
    font: 14px/1.3 system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, "Helvetica Neue", Arial, "Noto Sans";
  }
  .__hl-nav button { cursor: pointer; border: 1px solid var(--border, #ddd); background: transparent; padding: .25rem .6rem; border-radius: .4rem; }
  .__hl-nav button:disabled { opacity: .5; cursor: default; }
  .__hl-counter { min-width: 5.8rem; text-align: center; }
  .__hl-spacer { flex: 0 0 .25rem; }
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  // ---------- Paramètres URL ----------
  const params = new URLSearchParams(window.location.search);
  const termRaw = params.get(PARAM_TERM);
  if (!termRaw) return;

  const initialIndex = (() => {
    const v = parseInt(params.get(PARAM_INDEX) || '0', 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  })();

  // Construire la liste des motifs : "phrases" + mots
  const needles = [];
  const phraseRE = /"([^"]+)"/g; let m;
  while((m = phraseRE.exec(termRaw))) needles.push(m[1]);
  const cleaned = termRaw.replace(/"([^"]+)"/g,' ').trim();
  if (cleaned) needles.push(...cleaned.split(/\s+/));
  const uniqueNeedles = Array.from(new Set(needles.filter(Boolean)));
  if (!uniqueNeedles.length) return;

  // Zone scannée et exclusions
  const scope = document.querySelector('.post-single, .post-content, .entry-content, article, main, body') || document.body;
  const EXCLUDED_SELECTOR = [
    '.post-meta',
    '.toc', '.toc-container', '.toc__menu', '.toc-list', '.table-of-contents',
    'details.toc',
    'nav#TableOfContents', '#TableOfContents', '[id*="TableOfContents"]',
    '[class*="toc"]',
    '[data-no-hl]'
  ].join(', ');

  // ---------- Surlignage ----------
  function highlightInNode(node, re, marks){
    const text = node.nodeValue;
    let match, offset = 0;
    const frag = document.createDocumentFragment();
    while((match = re.exec(text)) !== null){
      const start = match.index, end = start + match[0].length;
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

  function walkAndHighlight(root, needles){
    const marks = [];
    const pattern = needles.map(escapeRegExp).join('|');
    const re = new RegExp(pattern, 'gi');

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.nodeName.toLowerCase();
        if (/(script|style|noscript|textarea|svg)/.test(tag)) return NodeFilter.FILTER_REJECT;
        if (p.closest(EXCLUDED_SELECTOR)) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const toProcess = [];
    while (walker.nextNode()){
      const n = walker.currentNode;
      if (re.test(n.nodeValue)) toProcess.push(n);
      re.lastIndex = 0;
    }
    for (const n of toProcess) highlightInNode(n, re, marks);
    return marks;
  }

  const marks = walkAndHighlight(scope, uniqueNeedles);
  if (!marks.length) return;

  // ---------- Manifest global (inter-pages) ----------
  let manifest = null;
  let globalPos = null;
  try{
    const raw = sessionStorage.getItem(MANIFEST_KEY);
    if (raw){
      const obj = JSON.parse(raw);
      if (obj && obj.q != null && Array.isArray(obj.items) && typeof obj.items[0] === 'object'){
        manifest = obj;
        const currPath = window.location.pathname;
        const localIndex = initialIndex;
        for (let i = 0; i < manifest.items.length; i++){
          const it = manifest.items[i];
          if (samePath(it.url, currPath) && String(it.index) === String(localIndex)) { globalPos = i; break; }
        }
        if (globalPos == null){
          for (let i = 0; i < manifest.items.length; i++){
            const it = manifest.items[i];
            if (samePath(it.url, currPath)) { globalPos = i; break; }
          }
        }
      }
    }
  }catch{}

  // ---------- Barre de navigation ----------
  const nav = document.createElement('div');
  nav.className = '__hl-nav';
  nav.innerHTML = `
    <button type="button" class="__hl-close" aria-label="Quitter la recherche">×</button>
    <span class="__hl-spacer"></span>
    <button type="button" class="__hl-prev" aria-label="Occurrence précédente">◀</button>
    <span class="__hl-counter" aria-live="polite" aria-atomic="true"></span>
    <button type="button" class="__hl-next" aria-label="Occurrence suivante">▶</button>
  `;
  document.body.appendChild(nav);
  const btnClose = nav.querySelector('.__hl-close');
  const btnPrev  = nav.querySelector('.__hl-prev');
  const btnNext  = nav.querySelector('.__hl-next');
  const counter  = nav.querySelector('.__hl-counter');

  // ---------- État actif / inactif ----------
  let active = true;
  try { document.body.setAttribute('data-hl-active', '1'); } catch {}

  // ---------- Navigation locale ----------
  let idx = Math.max(0, Math.min(initialIndex, marks.length - 1));

  function updateURLIndex(i){
    try{
      const url = new URL(window.location.href);
      url.searchParams.set(PARAM_INDEX, String(i));
      window.history.replaceState(null, '', url.toString());
    }catch{}
  }
  function clearTargets(){ for (const m of marks) m.classList.remove('__hl-target'); }

  function updateCounter(){
    if (!active) { counter.textContent = ''; btnPrev.disabled = true; btnNext.disabled = true; return; }
    if (manifest && globalPos != null) counter.textContent = `${globalPos + 1} / ${manifest.items.length}`;
    else counter.textContent = `${idx + 1} / ${marks.length}`;
    const onlyOne = manifest ? (manifest.items.length <= 1) : (marks.length <= 1);
    btnPrev.disabled = onlyOne; btnNext.disabled = onlyOne;
  }

  function goToLocal(i, smooth = true){
    if (!marks.length) return;
    idx = Math.max(0, Math.min(i, marks.length - 1));
    clearTargets();
    const target = marks[idx];
    target.classList.add('__hl-target');
    target.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center', inline: 'nearest' });
    updateURLIndex(idx);
  }

  function navigate(delta){
    if (!active) return;
    if (manifest && manifest.items && manifest.items.length){
      if (globalPos == null){ // fallback local
        goToLocal((idx + delta + marks.length) % marks.length);
        updateCounter(); return;
      }
      let nextPos = (globalPos + delta + manifest.items.length) % manifest.items.length;
      const nextItem = manifest.items[nextPos];
      const currPath = window.location.pathname;

      if (samePath(nextItem.url, currPath)){ // même page
        globalPos = nextPos; goToLocal(nextItem.index); updateCounter(); return;
      }
      // Page différente
      try { sessionStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest)); } catch {}
      const url = new URL(nextItem.url, window.location.origin);
      url.searchParams.set(PARAM_TERM, manifest.q);
      url.searchParams.set(PARAM_INDEX, String(nextItem.index));
      globalPos = nextPos; updateCounter();
      window.location.href = url.toString();
    } else {
      goToLocal((idx + delta + marks.length) % marks.length);
      updateCounter();
    }
  }

  btnPrev.addEventListener('click', ()=> navigate(-1));
  btnNext.addEventListener('click', ()=> navigate(+1));

  // ---------- Sortie douce ----------
  function exitSoft(){
    if (!active) { // on permet la répétition sans effet
      try { removeParamsFromURL(); } catch {}
      return;
    }
    active = false;
    clearTargets();                        // enlève l’outline de l’occurrence en cours
    try { document.body.setAttribute('data-hl-active', '0'); } catch {}
    try { nav.remove(); } catch {}
    removeParamsFromURL();                 // nettoie ?highlight=…&highlightIndex=…
    updateCounter();                       // (counter devient vide)
  }
  btnClose.addEventListener('click', exitSoft);

  // ---------- Sortie dure (nettoyage DOM) ----------
  function exitHard(){
    // Ancre invisible à l’emplacement de l’occurrence courante (ou 1ère en secours)
    const target = marks[idx] || marks[0];
    let anchor = null, oldTop = null;
    if (target && target.parentNode){
      anchor = document.createElement('span');
      anchor.setAttribute('data-hl-anchor','');
      anchor.style.display = 'inline-block';
      anchor.style.width = '0'; anchor.style.height = '0'; anchor.style.overflow = 'hidden';
      target.parentNode.insertBefore(anchor, target);
      oldTop = anchor.getBoundingClientRect().top;
    }

    // Remplacer tous les <mark> par du texte pur
    for (const mark of marks.slice()){
      const parent = mark.parentNode;
      if (!parent) continue;
      const text = document.createTextNode(mark.textContent);
      parent.replaceChild(text, mark);
      parent.normalize();
    }

    // Désactiver UI + URL propre
    try { document.body.setAttribute('data-hl-active', '0'); } catch {}
    try { nav.remove(); } catch {}
    removeParamsFromURL();
    active = false;
    updateCounter();

    // Recalage scroll pour garder la même zone à l’écran (si ancre posée)
    if (anchor && oldTop != null){
      const newTop = anchor.getBoundingClientRect().top;
      const delta  = newTop - oldTop; // scrollBy ce delta pour que l'ancre garde la même position visuelle
      try { window.scrollBy({ top: delta, left: 0, behavior: 'auto' }); } catch { window.scrollTo(window.scrollX, window.scrollY + delta); }
      anchor.remove();
    }
  }

  // ---------- Gestion clavier (Esc court = douce, Esc long / Shift+Esc = dure) ----------
  let escHoldTimer = null;
  let escHardFired = false;

  document.addEventListener('keydown', (e)=>{
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    if (/(input|textarea|select)/.test(tag)) return;

    if (e.key === 'Escape'){
      e.preventDefault();
      // Modif immédiate : Shift+Esc => sortie dure
      if (e.shiftKey){ exitHard(); return; }

      escHardFired = false;
      clearTimeout(escHoldTimer);
      escHoldTimer = setTimeout(()=>{ escHardFired = true; exitHard(); }, 700); // appui long ≈ 0,7 s
      return;
    }

    // Navigation seulement si actif
    if (!active) return;
    if (e.key === '['){ e.preventDefault(); navigate(-1); }
    if (e.key === ']'){ e.preventDefault(); navigate(+1); }
  });

  document.addEventListener('keyup', (e)=>{
    if (e.key !== 'Escape') return;
    clearTimeout(escHoldTimer);
    // Si l'appui long n'a pas déjà déclenché la sortie dure, faire la sortie douce
    if (!escHardFired) exitSoft();
  });

  // ---------- Initialisation ----------
  if (manifest && globalPos != null) { goToLocal(initialIndex, false); }
  else { goToLocal(idx, false); }
  updateCounter();
})();
