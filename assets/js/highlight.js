// assets/js/highlight.js
(function(){
  function escapeRegExp(s){ return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // Style de surlignage
  const css = `
  mark.__hl-target { outline: 2px solid currentColor; }
  @keyframes __hlPulse { from { background: #fffd8a; } to { background: #fff2a6; } }
  mark.__hl { animation: __hlPulse 1.2s ease-in-out 1; }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const params = new URLSearchParams(window.location.search);
  const termRaw = params.get('highlight');
  if (!termRaw) return;
  const idx = parseInt(params.get('highlightIndex') || '0', 10);

  const needles = [];
  const phraseRE = /"([^"]+)"/g;
  let m;
  while((m = phraseRE.exec(termRaw))) needles.push(m[1]);
  const cleaned = termRaw.replace(/"([^"]+)"/g,' ').trim();
  if (cleaned) needles.push(...cleaned.split(/\s+/));

  const uniqueNeedles = Array.from(new Set(needles.filter(Boolean)));
  if (!uniqueNeedles.length) return;

  const scope = document.querySelector('.post-content, .entry-content, article, main, body');

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

  function walkAndHighlight(root, needles){
    const marks = [];
    const pattern = needles.map(escapeRegExp).join('|');
    const re = new RegExp(pattern, 'gi');

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        const p = node.parentNode;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.nodeName.toLowerCase();
        if (/(script|style|noscript|textarea|svg|code|pre)/.test(tag)) return NodeFilter.FILTER_REJECT;
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

  const target = marks[Math.max(0, Math.min(idx, marks.length-1))];
  target.classList.add('__hl-target');
  target.scrollIntoView({behavior:'smooth', block:'center', inline:'nearest'});
})();
