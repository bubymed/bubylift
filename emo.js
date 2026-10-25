/* Replaces phone emoji in the screens with line icons (Tabler) so the app looks consistent and professional.
   Reemplaza los emojis del teléfono en las pantallas por iconos de línea (Tabler) para que la app se vea consistente y profesional. */
(function(){
  const RE=/(?:[✓✕★▶✎☰ⓘ❤♥⚠⚙⚖☁✅✨⚡⭐⬆➕✏⏱⏭⚽]|[\u{1F000}-\u{1FAFF}])(?:️|︎)?(?:‍[♀♂\u{1F000}-\u{1FAFF}]️?)*|[⬆❤⚖⚙]️/gu;
  const SKIP={SCRIPT:1,STYLE:1,TEXTAREA:1,OPTION:1,SELECT:1,INPUT:1,TITLE:1,SVG:1,svg:1,NOSCRIPT:1,CANVAS:1};
  function svg(n){return ic(n).replace('class="ic"','class="ic ei"');}
  function conv(tn){
    const s=tn.nodeValue;if(!s||!RE.test(s)){RE.lastIndex=0;return;}RE.lastIndex=0;
    const p=tn.parentNode;if(!p||SKIP[p.nodeName]||(p.isContentEditable))return;
    const fr=document.createDocumentFragment();let last=0,m,any=false;
    while((m=RE.exec(s))){
      const k=m[0].replace(/[︎️]/g,'').split('‍')[0],n=EMO[k];
      if(!n)continue;
      if(m.index>last)fr.appendChild(document.createTextNode(s.slice(last,m.index)));
      const sp=document.createElement('span');sp.className='emo';sp.setAttribute('role','img');sp.innerHTML=svg(n);fr.appendChild(sp);
      last=m.index+m[0].length;any=true;
    }
    RE.lastIndex=0;if(!any)return;
    if(last<s.length)fr.appendChild(document.createTextNode(s.slice(last)));
    p.replaceChild(fr,tn);
  }
  function sweep(root){
    if(!root)return;
    if(root.nodeType===3){conv(root);return;}
    if(root.nodeType!==1||SKIP[root.nodeName])return;
    const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{const p=n.parentNode;return(p&&!SKIP[p.nodeName])?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}}),L=[];
    while(w.nextNode())L.push(w.currentNode);
    L.forEach(conv);
  }
  window.emoSweep=sweep;
  let q=false,pend=[];
  function flush(){q=false;const l=pend;pend=[];l.forEach(n=>{if(n.isConnected)sweep(n);});}
  function start(){
    sweep(document.body);
    new MutationObserver(ms=>{
      ms.forEach(m=>{if(m.type==='characterData')pend.push(m.target);else m.addedNodes.forEach(n=>pend.push(n));});
      if(!q){q=true;(window.requestAnimationFrame||setTimeout)(flush);}
    }).observe(document.body,{childList:true,subtree:true,characterData:true});
  }
  if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
