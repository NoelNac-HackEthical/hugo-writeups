<<<<<<< HEAD
// assets/js/highlight.js
(function(){
  const MANIFEST_KEY = 'HL_MANIFEST_V1';

  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function samePath(a, b){
    try{
      const ua = new URL(a, window.location.origin).pathname.replace(/\/+$/,'/') || '/';
      const ub = new URL(b, window.location.origin).pathname.replace(/\/+$/,'/') || '/';
      return ua === ub;
    }catch{ return a === b; }
=======
/* highlight.js – surlignage inter-pages + navigation + sortie avec ESC
 * Utilise l’URL: ?highlight=TERME&highlightIndex=N
 * - ESC : quitte le mode surlignage, nettoie l’URL, conserve la position
 * - [ / ] : occurrence précédente / suivante
 * - Mini-barre avec compteur
 */
(function () {
  const PARAM_TERM = 'highlight';
  const PARAM_INDEX = 'highlightIndex';
  const MANIFEST_KEY = 'HL_MANIFEST_V1';

  let state = {
    term: null,
    index: 0,
    marks: [],
    current: 0,
    toolbar: null,
    inHighlightMode: false,
  };

  const qs = new URLSearchParams(location.search);
  const norm = (s) => (s || '').toString().normalize('NFKD').toLowerCase();

  function removeParamsFromURL() {
    try {
      const url = new URL(location.href);
      url.searchParams.delete(PARAM_TERM);
      url.searchParams.delete(PARAM_INDEX);
      history.replaceState(null, '', url.toString());
    } catch {}
>>>>>>> parent of 47d73d5 (search escape version optimisée)
  }

  // Styles : jaune gras sans fond + barre navigation
  const css = `
  mark.__hl-target { outline: 2px solid currentColor; }
  @keyframes __hlPulse { from { color: #d4aa00; font-weight: bold; } to { color: #e6b800; font-weight: bold; } }
  mark.__hl { background: none !important; color: #e6b800; font-weight: bold; animation: __hlPulse 1.2s ease-in-out 1; }
  pre code mark.__hl { background: none !important; color: #e6b800; font-weight: bold; padding: 0; border-radius: 0; box-shadow: none; }
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
  `;
  const style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);

  const params = new URLSearchParams(window.location.search);
  const termRaw = params.get('highlight');
  if (!termRaw) return;

  const initialIndex = (() => {
    const v = parseInt(params.get('highlightIndex') || '0', 10);
    return Number.isFinite(v) && v >= 0 ? v : 0;
  })();

  // Requête : "phrase exacte" + mots
  const needles = [];
  const phraseRE = /"([^"]+)"/g; let m;
  while((m = phraseRE.exec(termRaw))) needles.push(m[1]);
  const cleaned = termRaw.replace(/"([^"]+)"/g,' ').trim();
  if (cleaned) needles.push(...cleaned.split(/\s+/));
  const uniqueNeedles = Array.from(new Set(needles.filter(Boolean)));
  if (!uniqueNeedles.length) return;

  // Zone scannée élargie
  const scope = document.querySelector('.post-single, .post-content, .entry-content, article, main, body') || document.body;

  // Exclusions (TOC + meta + opt-out data-no-hl)
  const EXCLUDED_SELECTOR = [
    '.post-meta',
    '.toc', '.toc-container', '.toc__menu', '.toc-list', '.table-of-contents',
    'details.toc',
    'nav#TableOfContents', '#TableOfContents', '[id*="TableOfContents"]',
    '[class*="toc"]',
    '[data-no-hl]'
  ].join(', ');

<<<<<<< HEAD
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
=======
      // Trouver toutes les occurrences (non sensibles à la casse/accents)
      const nn = norm(text);
      let ranges = [];
      for (const needle of needles) {
        const n = norm(needle);
        if (!n) continue;
        let from = 0;
        while (true) {
          const i = nn.indexOf(n, from);
          if (i === -1) break;
          ranges.push([i, i + n.length]);
          from = i + Math.max(1, n.length);
        }
      }
      if (!ranges.length) continue;

      // Fusion des chevauchements
      ranges.sort((a, b) => a[0] - b[0] || b[1] - a[1]);
      const merged = [];
      for (const r of ranges) {
        if (!merged.length || r[0] > merged[merged.length - 1][1]) merged.push(r);
        else merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], r[1]);
      }

      // Appliquer du dernier au premier pour conserver les offsets
      for (let i = merged.length - 1; i >= 0; i--) {
        marks.push(makeMarkRange(node, merged[i][0], merged[i][1]));
      }
>>>>>>> parent of 47d73d5 (search escape version optimisée)
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

  // Surligner toutes les occurrences de la page
  const marks = walkAndHighlight(scope, uniqueNeedles);
  if (!marks.length) return;

  // Récupérer manifest global (si présent)
  let manifest = null;
  let globalPos = null; // index global dans manifest.items
  try {
    const raw = sessionStorage.getItem(MANIFEST_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj && obj.q != null && Array.isArray(obj.items) && obj.q === termRaw) {
        manifest = obj;
        const currPath = window.location.pathname;
        const localIndex = initialIndex;
        for (let i = 0; i < manifest.items.length; i++) {
          const it = manifest.items[i];
          if (samePath(it.url, currPath) && String(it.index) === String(localIndex)) { globalPos = i; break; }
        }
        if (globalPos == null) {
          for (let i = 0; i < manifest.items.length; i++) {
            const it = manifest.items[i];
            if (samePath(it.url, currPath)) { globalPos = i; break; }
          }
        }
      }
    }
  } catch {}

  // Barre de navigation
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

  // Navigation locale
  let idx = Math.max(0, Math.min(initialIndex, marks.length - 1));

  function updateURLIndex(i){
    const url = new URL(window.location.href);
    url.searchParams.set('highlightIndex', String(i));
    window.history.replaceState(null, '', url.toString());
  }
  function clearTargets(){ for (const m of marks) m.classList.remove('__hl-target'); }

  function updateCounter(){
    if (manifest && globalPos != null) {
      counter.textContent = `${globalPos + 1} / ${manifest.items.length}`;
    } else {
      counter.textContent = `${idx + 1} / ${marks.length}`;
    }
    const onlyOne = manifest ? (manifest.items.length <= 1) : (marks.length <= 1);
    btnPrev.disabled = onlyOne; btnNext.disabled = onlyOne;
  }

  function goToLocal(i, smooth = true){
    if (!marks.length) return;
    idx = Math.max(0, Math.min(i, marks.length - 1));
    clearTargets();
    const target = marks[idx];
    target.classList.add('__hl-target');
    target.scrollIntoView({behavior: smooth ? 'smooth' : 'auto', block: 'center', inline: 'nearest'});
    updateURLIndex(idx);
  }

  function navigate(delta){
    if (manifest && manifest.items && manifest.items.length){
      if (globalPos == null) { // fallback local
        goToLocal((idx + delta + marks.length) % marks.length);
        updateCounter(); return;
      }
      let nextPos = (globalPos + delta + manifest.items.length) % manifest.items.length;
      const nextItem = manifest.items[nextPos];
      const currPath = window.location.pathname;

      if (samePath(nextItem.url, currPath)) { // même page
        globalPos = nextPos; goToLocal(nextItem.index); updateCounter(); return;
      }

      // Page différente
      sessionStorage.setItem(MANIFEST_KEY, JSON.stringify(manifest));
      const url = new URL(nextItem.url, window.location.origin);
      url.searchParams.set('highlight', manifest.q);
      url.searchParams.set('highlightIndex', String(nextItem.index));
      globalPos = nextPos; updateCounter();
      window.location.href = url.toString();
    } else {
      goToLocal((idx + delta + marks.length) % marks.length);
      updateCounter();
    }
  }

  btnPrev.addEventListener('click', ()=> navigate(-1));
  btnNext.addEventListener('click', ()=> navigate(+1));
  document.addEventListener('keydown', (e)=>{
    const tag = (e.target && e.target.tagName || '').toLowerCase();
    if (/(input|textarea|select)/.test(tag)) return;
    if (e.key === '[') { e.preventDefault(); navigate(-1); }
    if (e.key === ']') { e.preventDefault(); navigate(+1); }
  });

<<<<<<< HEAD
  // Position initiale + affichage compteur
  if (manifest && globalPos != null) { goToLocal(initialIndex, false); }
  else { goToLocal(idx, false); }
  updateCounter();
=======
  function clearMarksKeepScroll() {
    const y = window.scrollY;
    document.querySelectorAll('mark[data-hl="1"]').forEach((m) => {
      const parent = m.parentNode;
      if (!parent) return;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
    if (state.toolbar) state.toolbar.remove();
    state.marks = [];
    state.inHighlightMode = false;
    removeParamsFromURL();
    window.scrollTo({ top: y, left: 0, behavior: 'instant' });
  }

  function onKeydown(e) {
    if (!state.inHighlightMode) return;
    if (e.key === '[') { e.preventDefault(); gotoPrev(); }
    else if (e.key === ']') { e.preventDefault(); gotoNext(); }
    else if (e.key === 'Escape') { e.preventDefault(); clearMarksKeepScroll(); }
  }

  function activateFromURL() {
    const term = qs.get(PARAM_TERM);
    if (!term) return;
    const idx = parseInt(qs.get(PARAM_INDEX) || '0', 10);
    state.term = term;
    state.index = isNaN(idx) ? 0 : Math.max(0, idx);

    state.marks = highlightAll(term);
    if (!state.marks.length) return;

    buildToolbar();
    state.inHighlightMode = true;
    scrollToMark(state.index);
  }

  // Style discret pour le bouton survol
  (function ensureStyle() {
    if (document.getElementById('__hl_toolbar_css__')) return;
    const st = document.createElement('style');
    st.id = '__hl_toolbar_css__';
    st.textContent = `#hl-toolbar button:hover{background: var(--code-bg);}`;
    document.head.appendChild(st);
  })();

  document.addEventListener('keydown', onKeydown, { capture: true });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', activateFromURL);
  } else {
    activateFromURL();
  }
>>>>>>> parent of 47d73d5 (search escape version optimisée)
})();
