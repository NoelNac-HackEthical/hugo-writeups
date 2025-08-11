/* highlight.js — surlignage inter-pages + [ / ] + ESC
 * URL: ?highlight=TERME&highlightIndex=N
 * Correctifs:
 *  - Ne surligne QUE le contenu (article/main/.content)
 *  - Ignore TOC/nav/header/footer/code/pre/script/style
 *  - Conserve la position au ESC, nettoie l’URL
 */
(function () {
  const PARAM_TERM = 'highlight';
  const PARAM_INDEX = 'highlightIndex';
  const MAX_MARKS = 500; // ajuste si besoin

  // Ne pas s'activer sur la page de recherche
  if (document.getElementById('search-root')) return;

  const qs = new URLSearchParams(location.search);

  // ---------- helpers ----------
  function removeParamsFromURL() {
    try {
      const url = new URL(location.href);
      url.searchParams.delete(PARAM_TERM);
      url.searchParams.delete(PARAM_INDEX);
      history.replaceState(null, '', url.toString());
    } catch {}
  }

  function contentRoot() {
    // Sélectionne la zone "contenu" la plus spécifique disponible
    const sels = [
      'main article .content',
      'article .content',
      'main .content',
      'article .post-content',
      'article .content',
      'article',
      'main',
      '#content'
    ];
    for (const s of sels) {
      const el = document.querySelector(s);
      if (el) return el;
    }
    return document.body; // repli
  }

  function buildNeedles(q) {
    if (!q) return [];
    const phrases = [];
    const re = /"([^"]+)"/g; let m;
    while ((m = re.exec(q))) if (m[1].trim().length > 2) phrases.push(m[1].trim());

    const cleaned = q.replace(/"([^"]+)"/g, ' ').trim();
    const tokens = cleaned ? cleaned.split(/\s+/) : [];

    const keep = [];
    for (const t of tokens) {
      if (!t) continue;
      if (t[0] === '-') continue;         // exclus -> pas de surlignage
      if (t[0] === '+') { if (t.length > 3) keep.push(t.slice(1)); continue; }
      if (t.length > 2) keep.push(t);
    }
    // Long -> court
    return Array.from(new Set([...phrases, ...keep])).sort((a,b)=>b.length-a.length);
  }

  function isBlockIgnored(node) {
    const p = node.parentElement;
    if (!p) return true;
    if (p.closest('nav, header, footer, aside, .toc, #TableOfContents')) return true;
    if (p.closest('code, pre, kbd, samp')) return true;
    const tag = p.tagName;
    if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return true;
    const cs = getComputedStyle(p);
    if (cs.display === 'none' || cs.visibility === 'hidden') return true;
    return false;
  }

  function textWalker(root) {
    return document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        if (isBlockIgnored(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
  }

  function buildRegex(token) {
    // Borne de mot pour tokens alphanum
    const asciiWord = /^[A-Za-z0-9_À-ÖØ-öø-ÿ-]+$/u.test(token);
    const esc = token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(asciiWord ? `\\b${esc}\\b` : esc, 'ig');
  }

  function surround(node, start, end) {
    const range = document.createRange();
    range.setStart(node, start);
    range.setEnd(node, end);
    const mark = document.createElement('mark');
    mark.dataset.hl = '1';
    mark.style.padding = '0 .15em';
    mark.style.borderRadius = '.2em';
    range.surroundContents(mark);
    return mark;
  }

  function highlightAll(q) {
    const needles = buildNeedles(q);
    if (!needles.length) return { marks: [], capped: false };

    const root = contentRoot();
    const walker = textWalker(root);
    const marks = [];
    let capped = false;

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.nodeValue;
      if (!text) continue;

      // Collecte toutes les plages pour tous les motifs
      const ranges = [];
      for (const n of needles) {
        const re = buildRegex(n);
        let m;
        while ((m = re.exec(text)) !== null) {
          ranges.push([m.index, m.index + m[0].length]);
          if (ranges.length + marks.length >= MAX_MARKS) { capped = true; break; }
        }
        if (capped) break;
      }
      if (!ranges.length) continue;

      // Fusion chevauchements
      ranges.sort((a,b)=>a[0]-b[0] || b[1]-a[1]);
      const merged = [];
      for (const r of ranges) {
        if (!merged.length || r[0] > merged[merged.length-1][1]) merged.push(r);
        else merged[merged.length-1][1] = Math.max(merged[merged.length-1][1], r[1]);
        if (merged.length + marks.length >= MAX_MARKS) { capped = true; break; }
      }

      // Appliquer du dernier au premier
      for (let i = merged.length - 1; i >= 0; i--) {
        marks.push(surround(node, merged[i][0], merged[i][1]));
        if (marks.length >= MAX_MARKS) { capped = true; break; }
      }
      if (capped) break;
    }

    return { marks, capped };
  }

  // ---------- état & UI ----------
  const state = {
    marks: [],
    current: 0,
    toolbar: null,
    capped: false,
    active: false,
  };

  function updateCounter() {
    const el = document.getElementById('hl-count');
    if (!el) return;
    if (!state.marks.length) { el.textContent = '0 / 0'; return; }
    const total = state.capped ? `${state.marks.length}+` : `${state.marks.length}`;
    el.textContent = `${state.current + 1} / ${total}`;
  }

  function buildToolbar() {
    const bar = document.createElement('div');
    bar.id = 'hl-toolbar';
    bar.style.cssText = `
      position: fixed; bottom: 1rem; left: 50%; transform: translateX(-50%);
      background: var(--entry); color: var(--primary);
      border: 1px solid var(--border); border-radius: .6rem;
      padding: .35rem .6rem; display: flex; gap: .5rem; align-items: center;
      box-shadow: 0 6px 18px rgba(0,0,0,.12); z-index: 9999; font-size: .95rem;
    `;
    bar.innerHTML = `
      <button type="button" data-act="prev" title="[ précédent" style="border:1px solid var(--border); background:transparent; padding:.25rem .5rem; border-radius:.4rem; cursor:pointer">◀</button>
      <span id="hl-count" style="min-width:9ch; text-align:center;"></span>
      <button type="button" data-act="next" title="] suivant" style="border:1px solid var(--border); background:transparent; padding:.25rem .5rem; border-radius:.4rem; cursor:pointer">▶</button>
      <span style="opacity:.75;">• Esc pour quitter</span>
    `;
    bar.addEventListener('click', (e) => {
      const act = e.target?.getAttribute?.('data-act');
      if (act === 'prev') goto(-1);
      else if (act === 'next') goto(+1);
    });
    document.body.appendChild(bar);
    state.toolbar = bar;
    updateCounter();
  }

  function scrollTo(i) {
    if (!state.marks.length) return;
    state.current = Math.max(0, Math.min(i, state.marks.length - 1));
    state.marks[state.current].scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateCounter();
  }

  function goto(dir) {
    if (!state.marks.length) return;
    const n = state.marks.length;
    scrollTo((state.current + (dir>0?1:-1) + n) % n);
  }

  function clearMarksKeepScroll() {
    const y = window.scrollY;
    document.querySelectorAll('mark[data-hl="1"]').forEach((m) => {
      const p = m.parentNode; if (!p) return;
      p.replaceChild(document.createTextNode(m.textContent), m);
      p.normalize();
    });
    if (state.toolbar) state.toolbar.remove();
    state.marks = [];
    state.capped = false;
    state.active = false;
    removeParamsFromURL();
    window.scrollTo({ top: y, left: 0, behavior: 'instant' });
  }

  function onKeydown(e) {
    if (!state.active) return;
    if (e.key === '[') { e.preventDefault(); goto(-1); }
    else if (e.key === ']') { e.preventDefault(); goto(+1); }
    else if (e.key === 'Escape') { e.preventDefault(); clearMarksKeepScroll(); }
  }

  // petit style hover
  (function ensureStyle() {
    if (document.getElementById('__hl_toolbar_css__')) return;
    const st = document.createElement('style');
    st.id = '__hl_toolbar_css__';
    st.textContent = `#hl-toolbar button:hover{background: var(--code-bg);}`;
    document.head.appendChild(st);
  })();

  function activate() {
    const term = qs.get(PARAM_TERM);
    if (!term) return;
    const idx = parseInt(qs.get(PARAM_INDEX) || '0', 10) || 0;

    const { marks, capped } = highlightAll(term);
    if (!marks.length) return;

    state.marks = marks;
    state.capped = capped;
    state.active = true;

    buildToolbar();
    scrollTo(idx);
  }

  document.addEventListener('keydown', onKeydown, { capture: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', activate);
  else activate();
})();
