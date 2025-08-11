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
      <span id="hl-count" style="min-width:8ch; text-align:center;"></span>
      <button type="button" data-act="next" title="] suivant" style="border:1px solid var(--border); background:transparent; padding:.25rem .5rem; border-radius:.4rem; cursor:pointer">▶</button>
      <span style="opacity:.75;">• Esc pour quitter</span>
    `;
    bar.addEventListener('click', (e) => {
      const act = e.target?.getAttribute?.('data-act');
      if (act === 'prev') gotoPrev();
      else if (act === 'next') gotoNext();
    });
    document.body.appendChild(bar);
    state.toolbar = bar;
    updateCounter();
  }

  function updateCounter() {
    const el = document.getElementById('hl-count');
    if (!el) return;
    el.textContent = state.marks.length ? `${state.current + 1} / ${state.marks.length}` : '0 / 0';
  }

  function makeMarkRange(textNode, start, end) {
    const range = document.createRange();
    range.setStart(textNode, start);
    range.setEnd(textNode, end);
    const mark = document.createElement('mark');
    mark.dataset.hl = '1';
    mark.style.padding = '0 .15em';
    mark.style.borderRadius = '.2em';
    range.surroundContents(mark);
    return mark;
  }

  function textWalker(root) {
    return document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
        if (!node.parentElement) return NodeFilter.FILTER_REJECT;
        const style = getComputedStyle(node.parentElement);
        if (style.visibility === 'hidden' || style.display === 'none') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
  }

  function highlightAll(termRaw) {
    const needles = splitQueryForHighlight(termRaw);
    if (!needles.length) return [];
    const marks = [];
    const walker = textWalker(document.body);

    while (walker.nextNode()) {
      const node = walker.currentNode;
      const text = node.nodeValue;
      if (!text) continue;

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
    }
    return marks;
  }

  function splitQueryForHighlight(q) {
    if (!q) return [];
    const phrases = [];
    const re = /"([^"]+)"/g;
    let m;
    while ((m = re.exec(q))) phrases.push(m[1]);
    const cleaned = q.replace(/"([^"]+)"/g, ' ').trim();
    const tokens = cleaned ? cleaned.split(/\s+/) : [];
    const must = [], terms = [];
    for (const t of tokens) {
      if (t.startsWith('+') && t.length > 1) must.push(t.slice(1));
      else if (!t.startsWith('-') && t) terms.push(t); // on ignore les -exclus
    }
    return Array.from(new Set([...phrases, ...must, ...terms])).sort((a, b) => b.length - a.length);
  }

  function scrollToMark(i) {
    if (!state.marks.length) return;
    state.current = Math.max(0, Math.min(i, state.marks.length - 1));
    state.marks[state.current].scrollIntoView({ behavior: 'smooth', block: 'center' });
    updateCounter();
  }

  function gotoNext() {
    if (!state.marks.length) return;
    scrollToMark((state.current + 1) % state.marks.length);
  }

  function gotoPrev() {
    if (!state.marks.length) return;
    scrollToMark((state.current - 1 + state.marks.length) % state.marks.length);
  }

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
})();
