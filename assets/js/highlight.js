// assets/js/highlight.js — surlignage + nav locale/inter-pages + sorties douce/dure + icônes
(function(){
  let __booted = false;

  function init(){
    if (__booted) return;
    __booted = true;

    const MANIFEST_KEY = 'HL_MANIFEST_V1';
    const PARAM_TERM  = 'highlight';
    const PARAM_INDEX = 'highlightIndex';

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
        const url = new URL(window.location.href);
        url.searchParams.delete(PARAM_TERM);
        url.searchParams.delete(PARAM_INDEX);
        window.history.replaceState(null, '', url.toString());
      }catch{}
    }
    function getAllTextNodes(root){
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
      const nodes = [];
      let n; while((n = walker.nextNode())) nodes.push(n);
      return nodes;
    }
    function isExcluded(el){
      if (el.hasAttribute && el.hasAttribute('data-no-hl')) return true;
      return !!(el.closest && el.closest([
        '.post-meta',
        'aside.toc',
        'details.toc',
        '.toc',
        '#TableOfContents',
        'nav#TableOfContents',
        '.toc-container',
        '.toc__menu',
        '.toc-list',
        '.table-of-contents'
      ].join(', ')));
    }

    // --- Paramètres URL ---
    const params = new URLSearchParams(window.location.search);
    const termRaw = params.get(PARAM_TERM);
    if (!termRaw) return;

    const initialIndex = (() => {
      const v = parseInt(params.get(PARAM_INDEX) || '0', 10);
      return Number.isFinite(v) && v >= 0 ? v : 0;
    })();

    // --- Aiguilles : "phrases" + mots
    const needles = [];
    const phraseRE = /"([^"]+)"/g; let m;
    while((m = phraseRE.exec(termRaw))) needles.push(m[1]);
    const cleaned = termRaw.replace(/"([^"]+)"/g,' ').trim();
    if (cleaned) needles.push(...cleaned.split(/\s+/));
    const uniqueNeedles = Array.from(new Set(needles.filter(Boolean)));
    if (!uniqueNeedles.length) return;

    // --- Zone scannée
    const scope =
      document.querySelector('.post-content .content-col') ||
      document.querySelector('.post-content') ||
      document.querySelector('.post-single, .entry-content, article, main, body') ||
      document.body;

    // --- Marquage ---
    const textNodes = getAllTextNodes(scope).filter((n)=>{
      const t = (n.nodeValue || '').trim();
      if (!t) return false;
      const el = n.parentElement;
      if (!el || isExcluded(el)) return false;
      return true;
    });

    const marks = [];
    function markNode(node, reList){
      const txt = node.nodeValue;
      let last = 0;
      const frag = document.createDocumentFragment();
      let matched = false;
      const matches = [];
      for (const re of reList){
        re.lastIndex = 0;
        let mm; while((mm = re.exec(txt))) matches.push([mm.index, mm.index + mm[0].length]);
      }
      matches.sort((a,b)=>a[0]-b[0]);
      const merged = [];
      for (const [s,e] of matches){
        if (!merged.length || s > merged[merged.length-1][1]) merged.push([s,e]);
        else merged[merged.length-1][1] = Math.max(merged[merged.length-1][1], e);
      }
      for (const [s,e] of merged){
        if (s > last) frag.appendChild(document.createTextNode(txt.slice(last, s)));
        const mk = document.createElement('mark');
        mk.className = '__hl';
        mk.textContent = txt.slice(s,e);
        frag.appendChild(mk);
        marks.push(mk);
        matched = true;
        last = e;
      }
      if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
      if (matched) node.parentNode.replaceChild(frag, node);
    }

    const reList = uniqueNeedles.map(n=> new RegExp(escapeRegExp(n), 'gi'));
    textNodes.forEach(n => markNode(n, reList));
    if (!marks.length) return;

    // --- Manifest inter-pages (par occurrence) ---
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

    // --- Barre nav + styles des occurrences ---
    const nav = document.createElement('div');
    nav.className = '__hl-nav';
    nav.innerHTML = `
      <style>
        .__hl-nav{
          position: fixed; right: .75rem; bottom: .75rem;
          display: flex; gap: .35rem; align-items: center;
          background: var(--entry, rgba(0,0,0,.6));
          color: var(--primary, #fff);
          border: 1px solid var(--border, rgba(255,255,255,.25));
          border-radius: .5rem; padding: .35rem .4rem;
          z-index: 9999; backdrop-filter: blur(3px);
        }
        .__hl-nav button{
          all: unset; cursor: pointer;
          padding: .25rem; border-radius: .35rem;
          border: 1px solid var(--border, rgba(255,255,255,.25));
          display: inline-flex; align-items: center; justify-content: center;
          width: 28px; height: 28px;
        }
        .__hl-nav button:focus-visible{ outline: 2px solid currentColor; }
        .__hl-count{ font: 12px/1 monospace; opacity: .9; padding: 0 .2rem; min-width: 5ch; text-align: center; }

        /* Articles : occurrences = texte ORANGE vif (#ff9800), pas de fond ; active = fond jaune */
        mark.__hl{
          background: transparent !important;
          color: #ff9800 !important;   /* <<< orange vif */
          font-weight: 700;
          border-radius: 2px;
          text-decoration: none;
        }
        mark.__hl-target{
          background: #ffeb3b !important; /* jaune pour l’active */
          color: #111 !important;
          font-weight: 800;
          border-radius: 2px;
          outline: 1px solid rgba(0,0,0,.25);
        }
        @keyframes __hlPulse { from { outline-width: 3px; } to { outline-width: 0px; } }
        .__hl-icon{ width:16px; height:16px; display:block; }
      </style>
      <button class="__hl-prev" title="Précédent [" aria-label="Précédent">
        <svg class="__hl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>
      <span class="__hl-count">0/0</span>
      <button class="__hl-next" title="Suivant ]" aria-label="Suivant">
        <svg class="__hl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
      <button class="__hl-close" title="Fermer (Esc)" aria-label="Fermer">×</button>
    `;
    document.body.appendChild(nav);

    const btnPrev  = nav.querySelector('.__hl-prev');
    const btnNext  = nav.querySelector('.__hl-next');
    const btnClose = nav.querySelector('.__hl-close');
    const counter  = nav.querySelector('.__hl-count');

    // --- Position & navigation locale ---
    let idx = Math.min(Math.max(initialIndex, 0), marks.length - 1);
    let active = true;

    function updateCounter(){
      counter.textContent = `${(manifest && globalPos != null ? globalPos+1 : idx+1)}/${manifest ? manifest.items.length : marks.length}`;
    }
    function ensureVisible(m, smooth=true){
      if (!m) return;
      m.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
      try{
        m.classList.add('__hl-target');
        m.style.animation = '__hlPulse .7s ease-out 1';
        setTimeout(()=> m.style.animation = '', 800);
      }catch{}
    }
    function clearCurrent(){
      document.querySelectorAll('mark.__hl-target').forEach(el => el.classList.remove('__hl-target'));
    }
    function goToLocal(i, smooth = true){
      if (!marks.length) return;
      clearCurrent();
      idx = (i + marks.length) % marks.length;
      const m = marks[idx];
      if (m){
        ensureVisible(m, smooth);
      }
      updateURLIndex(idx);
    }
    function navigate(delta){
      if (!active) return;
      if (manifest && manifest.items && manifest.items.length){
        if (globalPos == null){ goToLocal((idx + delta + marks.length) % marks.length); updateCounter(); return; }
        let nextPos = (globalPos + delta + manifest.items.length) % manifest.items.length;
        const nextItem = manifest.items[nextPos];
        const currPath = window.location.pathname;
        if (samePath(nextItem.url, currPath)){
          globalPos = nextPos; goToLocal(nextItem.index); updateCounter(); return;
        }
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
    function updateURLIndex(i){
      try{
        const url = new URL(window.location.href);
        url.searchParams.set(PARAM_TERM, termRaw);
        url.searchParams.set(PARAM_INDEX, String(i));
        window.history.replaceState(null, '', url.toString());
      }catch{}
    }

    // --- Boutons & clavier ---
    btnPrev.addEventListener('click', ()=> navigate(-1));
    btnNext.addEventListener('click', ()=> navigate(+1));
    btnClose.addEventListener('click', (e)=>{ e.preventDefault(); e.stopPropagation(); exitSoft(); });

    document.addEventListener('keydown', (e)=>{
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (/(input|textarea|select)/.test(tag)) return;
      if (e.key === '['){ e.preventDefault(); navigate(-1); }
      else if (e.key === ']'){ e.preventDefault(); navigate(+1); }
    });

    // --- Sortie totale en un seul clic (ou Esc) ---
    function exitSoft(){
      const anchorEl = (document.querySelector('mark.__hl-target') || document.querySelector('mark.__hl'))?.parentElement || document.body;
      const oldTop = anchorEl.getBoundingClientRect().top;
      const oldY   = window.pageYOffset || document.documentElement.scrollTop || 0;

      try{
        let node;
        while ((node = document.querySelector('mark.__hl, mark.__hl-target'))) {
          const txt = document.createTextNode(node.textContent);
          const parent = node.parentNode;
          parent.replaceChild(txt, node);
          parent.normalize();
        }
      }catch{}

      try { document.querySelector('div.__hl-nav')?.remove(); } catch {}
      removeParamsFromURL();
      try { sessionStorage.removeItem(MANIFEST_KEY); } catch {}
      active = false; updateCounter();

      const newTop = anchorEl.getBoundingClientRect().top;
      const delta  = newTop - oldTop;
      try { window.scrollTo({ top: oldY + delta, left: 0, behavior: 'auto' }); }
      catch { window.scrollTo(0, oldY + delta); }
    }
    function exitHard(){ exitSoft(); }

    let escHoldTimer = null;
    let escHardFired = false;
    document.addEventListener('keydown', (e)=>{
      const tag = (e.target && e.target.tagName || '').toLowerCase();
      if (/(input|textarea|select)/.test(tag)) return;
      if (e.key === 'Escape'){
        e.preventDefault();
        if (e.shiftKey){ exitHard(); return; }
        escHardFired = false;
        clearTimeout(escHoldTimer);
        escHoldTimer = setTimeout(()=>{ escHardFired = true; exitHard(); }, 700);
      }
    });
    document.addEventListener('keyup', (e)=>{
      if (e.key !== 'Escape') return;
      clearTimeout(escHoldTimer);
      if (!escHardFired) exitSoft();
    });

    // --- Position initiale ---
    goToLocal(Math.min(initialIndex, Math.max(0, marks.length-1)), /*smooth*/false);
    updateCounter();
  }

  // Expo public minimal
  window.__HL = { init, booted: ()=>__booted };

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init, { once: true });

  window.addEventListener('postcontent-ready', () => {
    if (window.__HL?.booted?.()){
      const current = document.querySelector('mark.__hl-target');
      if (current) current.scrollIntoView({ behavior:'smooth', block:'center' });
    } else window.__HL?.init?.();
  });

})();
