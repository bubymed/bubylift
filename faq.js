'use strict';
/* Help & FAQ: common questions on top, a box for questions, complaints or comments below (sent through a Tally form).
   Ayuda y preguntas frecuentes: arriba las dudas comunes, abajo un recuadro para dudas, quejas o comentarios (se envía con un formulario de Tally). */
const FAQ_N=15,FAQ_FORM='https://tally.so/r/KpYVek';
function faqOpen(){
  let h='<div class="form"><div class="pick-h"><h3>'+t('faqT')+'</h3><button class="ico" onclick="sheetClose()" aria-label="'+esc(t('close'))+'">✕</button></div><p class="muted sm">'+t('faqIntro')+'</p><div class="faq">';
  for(let i=1;i<=FAQ_N;i++)h+='<details><summary>'+esc(t('faqQ'+i))+'</summary><p>'+esc(t('faqA'+i))+'</p></details>';
  h+='</div>';
  if(canInstall())h+='<div class="row"><button class="btn" onclick="installApp()">'+ic('device-mobile')+' '+t('faqInstall')+'</button></div>';
  h+='<div class="card faqbox"><b>'+t('faqBoxT')+'</b><p class="muted sm">'+t('faqBoxP')+'</p><textarea id="faqmsg" class="in wide" rows="4" maxlength="600" placeholder="'+esc(t('faqBoxPh'))+'"></textarea>'+
    '<div class="row"><button class="btn pri" onclick="faqSend()">'+t('faqSend')+' ›</button></div><p class="muted sm">'+t('faqNote')+'</p></div></div>';
  sheet(h);
}
function faqSend(){
  const e=$('faqmsg'),m=e?e.value.trim().slice(0,600):'';
  if(!m){toast(t('faqNeed'));return;}
  const u=FAQ_FORM+'?msg='+encodeURIComponent(m)+'&app='+encodeURIComponent(APP_VER)+'&lang='+encodeURIComponent(LANG);
  window.open(u,'_blank','noopener');
}
