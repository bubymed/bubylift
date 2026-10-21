const C='bubylift-v52';
const FILES=['./','index.html','style.css','app.js','workout.js','plan.js','data/poolx.js','opt.js','pers.js','wizard.js','data/library.js','data/library2.js','data/programs.js','faq.js','library.js','stretch.js','data/stretch.js','data/exmeta.js','profiles.js','lib/qrcode.min.js','lib/jsqr.min.js','data/howto.js','data/howto2.js','data/howto3.js','data/howto4.js','data/howto5.js','data/howto6.js','data/exercises2.js','data/exphotos.js','data/icons.js','data/exmeta2.js','history.js','body.js','data/i18n.js','data/exercises.js','data/whatsnew.js','manifest.json','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon-32.png','icons/creator.jpg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()));});
// Network-first: always the newest files when online; cached copy when offline.
// Red primero: siempre los archivos más nuevos con internet; copia guardada sin internet.
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const same=new URL(e.request.url).origin===location.origin;
  const net=same?(e.request.mode==='navigate'?fetch(e.request.url,{cache:'no-cache',credentials:'same-origin'}):fetch(new Request(e.request,{cache:'no-cache'}))):fetch(e.request);
  e.respondWith(net.then(r=>{if(r&&r.ok&&same){const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));}return r;}).catch(()=>caches.match(e.request).then(r=>r||caches.match('index.html'))));
});
