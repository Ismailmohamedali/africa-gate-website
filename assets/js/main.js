(function(){
  var root=document.documentElement;
  root.classList.add('js');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine=window.matchMedia('(pointer: fine)').matches;
  var hasGsap=!!(window.gsap&&window.ScrollTrigger)&&!reduce;
  if(hasGsap)root.classList.add('gsap');
  window.AG={reduce:reduce,fine:fine,hasGsap:hasGsap};

  /* ---------- language ---------- */
  function store(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v)}catch(e){return null}}
  function applyLang(lang){
    root.lang=lang; root.dir=lang==='ar'?'rtl':'ltr';
    document.querySelectorAll('[data-en]').forEach(function(el){
      if(el.dataset.ar===undefined) el.dataset.ar=el.innerHTML;
      el.innerHTML = lang==='en' ? el.dataset.en : el.dataset.ar;
    });
    document.querySelectorAll('[data-en-ph]').forEach(function(el){
      if(el.dataset.arPh===undefined) el.dataset.arPh=el.placeholder;
      el.placeholder = lang==='en' ? el.dataset.enPh : el.dataset.arPh;
    });
    document.querySelectorAll('[data-wa-en]').forEach(function(el){el.href=lang==='en'?el.dataset.waEn:el.dataset.waAr});
    var t=document.querySelector('title');
    if(t&&t.dataset.en){ if(t.dataset.ar===undefined)t.dataset.ar=t.textContent; t.textContent=lang==='en'?t.dataset.en:t.dataset.ar; }
    document.querySelectorAll('.lang').forEach(function(b){b.textContent=lang==='en'?'ع':'EN';b.setAttribute('aria-label',lang==='en'?'التبديل إلى العربية':'Switch to English')});
    document.dispatchEvent(new CustomEvent('langchange',{detail:lang}));
  }
  var lang=store('ag-lang')||'ar';
  applyLang(lang);
  document.querySelectorAll('.lang').forEach(function(b){b.addEventListener('click',function(){lang=lang==='ar'?'en':'ar';store('ag-lang',lang);applyLang(lang)})});

  /* ---------- loader ---------- */
  var loader=document.querySelector('.loader'),ldc=loader&&loader.querySelector('.ld-count');
  var loaderDone=false;
  function hideLoader(){
    if(loaderDone)return; loaderDone=true;
    if(loader){loader.classList.add('done');setTimeout(function(){loader.remove()},800)}
    document.dispatchEvent(new Event('ag:ready'));
  }
  window.AG.loaderDone=function(){return loaderDone};
  var seen=null;try{seen=sessionStorage.getItem('ag-loaded')}catch(e){}
  if(seen||reduce){hideLoader()}
  else{
    try{sessionStorage.setItem('ag-loaded','1')}catch(e){}
    var t0=Date.now(),bar=loader&&loader.querySelector('.bar i');
    if(bar){bar.style.animation='none';bar.style.width='0%';bar.style.transition='width 2.2s cubic-bezier(.45,.05,.25,1)';requestAnimationFrame(function(){requestAnimationFrame(function(){bar.style.width='100%'})})}
    var go=function(){var w=Math.max(0,2300-(Date.now()-t0));setTimeout(hideLoader,w)};
    if(document.readyState==='complete')go();else window.addEventListener('load',go);
    setTimeout(hideLoader,6000);
  }

  /* ---------- warm the image cache once the page is idle, so photos are ready before they scroll in ---------- */
  window.addEventListener('load',function(){setTimeout(function(){
    document.querySelectorAll('img[loading="lazy"]').forEach(function(im){im.loading='eager'});
  },700)});

  /* ---------- nav ---------- */
  var nav=document.querySelector('.nav'),mbar=document.querySelector('.mbar'),wa=document.querySelector('.wa');
  function onScroll(){
    var y=window.scrollY;
    if(nav)nav.classList.toggle('scrolled',y>20);
    if(mbar)mbar.classList.toggle('show',y>window.innerHeight*.6);
    if(wa)wa.classList.toggle('show',y>window.innerHeight*.5);
  }
  onScroll(); window.addEventListener('scroll',onScroll,{passive:true});
  var burger=document.querySelector('.burger');
  if(burger)burger.addEventListener('click',function(){var o=nav.classList.toggle('open');burger.setAttribute('aria-expanded',o)});
  try{history.scrollRestoration='manual'}catch(e){}
  /* new page -> start at the top; Back/Forward -> return to where the visitor was on that page */
  var yKey='ag-y:'+location.pathname,navType='navigate';
  try{var ne=performance.getEntriesByType('navigation')[0];if(ne)navType=ne.type}catch(e){}
  var savedY=null;try{savedY=sessionStorage.getItem(yKey)}catch(e){}
  if(navType==='back_forward'&&savedY!==null){
    var goY=function(){window.scrollTo(0,+savedY)};
    goY();window.addEventListener('load',function(){goY();setTimeout(goY,250)});
  }else if(!location.hash){window.scrollTo(0,0);window.addEventListener('load',function(){window.scrollTo(0,0)})}
  window.addEventListener('pagehide',function(){try{sessionStorage.setItem(yKey,String(Math.round(window.scrollY)))}catch(e){}});
  var here=(location.pathname.split('/').pop()||'index.html');
  document.querySelectorAll('.nav-links a').forEach(function(a){if(a.getAttribute('href')===here){a.classList.add('active');a.setAttribute('aria-current','page')}});

  /* ---------- page curtain on internal navigation ---------- */
  var curtain=document.querySelector('.curtain');
  document.querySelectorAll('a[href]').forEach(function(a){
    var h=a.getAttribute('href');
    if(!/^[\w-]+\.html(#[\w-]+)?$/.test(h))return;
    a.addEventListener('click',function(e){
      if(reduce||!curtain||e.metaKey||e.ctrlKey||e.shiftKey||a.target)return;
      var target=h.split('#')[0];
      if(target===here)return;
      e.preventDefault();
      try{sessionStorage.setItem('ag-nav','1')}catch(x){}
      curtain.classList.add('in'); setTimeout(function(){location.href=target},480);
    });
  });
  window.addEventListener('pageshow',function(){if(curtain)curtain.classList.remove('in')});

  /* ---------- reveal fallback (no GSAP) ---------- */
  if(!hasGsap&&'IntersectionObserver' in window&&!reduce){
    var rvs=[].slice.call(document.querySelectorAll('[data-stagger]>*,.sd,.phase,.val,.why-item,.step'));
    var vh=window.innerHeight;
    rvs.forEach(function(el){el.classList.add('rv');if(el.getBoundingClientRect().top>vh*.92)el.classList.add('pre')});
    var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.remove('pre');io.unobserve(en.target)}})},{threshold:.1});
    rvs.forEach(function(el){io.observe(el)});
  }

  /* ---------- counters ---------- */
  function runCount(el){
    var to=+el.dataset.count,dur=1800,t0=null,from=to>1000?to-60:0;
    if(reduce){el.textContent=to;return}
    function f(t){if(!t0)t0=t;var p=Math.min((t-t0)/dur,1),e=1-Math.pow(1-p,4);el.textContent=Math.round(from+(to-from)*e);if(p<1)requestAnimationFrame(f)}
    requestAnimationFrame(f);
  }
  var cs=document.querySelectorAll('[data-count]');
  if(cs.length&&'IntersectionObserver' in window){
    var cio=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){
      var go=function(){runCount(en.target)};
      if(loaderDone)go();else document.addEventListener('ag:ready',function(){setTimeout(go,600)},{once:true});
      cio.unobserve(en.target)}})},{threshold:.5});
    cs.forEach(function(c){cio.observe(c)});
  }

  /* ---------- pause looping animations while off-screen ---------- */
  var offIO=null;
  if('IntersectionObserver' in window){
    offIO=new IntersectionObserver(function(es){es.forEach(function(en){en.target.classList.toggle('is-off',!en.isIntersecting)})},{rootMargin:'120px 0px'});
    document.querySelectorAll('.hero,.mq-sec,.cta-band,.hscroll').forEach(function(el){offIO.observe(el)});
  }
  function isOff(el){return el&&el.classList.contains('is-off')}

  /* ---------- CNC readout ---------- */
  var ro=document.querySelector('[data-readout]'),heroEl=document.querySelector('.hero');
  if(ro){
    var X=ro.querySelector('[data-x]'),Y=ro.querySelector('[data-y]'),Z=ro.querySelector('[data-z]'),F=ro.querySelector('[data-f]');
    var t=0;
    function fmt(n){return (n<0?'-':' ')+Math.abs(n).toFixed(3).padStart(7,'0')}
    var fr=0;
    function tick(){
      if(!reduce)requestAnimationFrame(tick);
      if((fr++)%4)return;
      if(isOff(heroEl))return;
      t+=0.072;
      X.textContent=fmt(214+Math.sin(t)*38+Math.sin(t*2.7)*6);
      Y.textContent=fmt(88+Math.cos(t*.8)*24);
      Z.textContent=fmt(-12.4+Math.sin(t*1.9)*3.1);
      F.textContent=String(1180+Math.round(Math.sin(t*.6)*60)).padStart(4,'0');
    }
    tick();
  }

  /* ---------- card spotlight ---------- */
  document.querySelectorAll('.svc').forEach(function(c){
    c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px')});
  });

  /* ---------- timeline fill (about) ---------- */
  var tl=document.querySelector('.tl');
  if(tl){
    var fill=tl.querySelector('.fill'),items=tl.querySelectorAll('.tl-item');
    function tlScroll(){
      var r=tl.getBoundingClientRect(),vh=window.innerHeight;
      var p=Math.min(Math.max((vh*.6-r.top)/r.height,0),1);
      fill.style.height=(p*100)+'%';
      items.forEach(function(it){var ir=it.getBoundingClientRect();it.classList.toggle('lit',ir.top<vh*.62)});
    }
    var selfScroll=document.documentElement.scrollHeight>window.innerHeight+40;
    if(selfScroll||!('IntersectionObserver' in window)){tlScroll(); window.addEventListener('scroll',tlScroll,{passive:true});}
    else{
      /* auto-sized preview frame: the page never scrolls itself, so light each step as it is actually seen */
      var arr=[].slice.call(items),last=-1;
      var tio=new IntersectionObserver(function(es){es.forEach(function(en){
        if(en.intersectionRatio>=.6){var k=arr.indexOf(en.target);if(k>last){last=k;
          arr.forEach(function(it,j){it.classList.toggle('lit',j<=last)});
          var tr=tl.getBoundingClientRect(),ir=arr[last].getBoundingClientRect();
          fill.style.transition='height .8s cubic-bezier(.2,.7,.2,1)';
          fill.style.height=Math.min(100,((ir.top-tr.top+60)/tr.height)*100)+'%';
        }}
      })},{threshold:[0,.6,1]});
      arr.forEach(function(it){tio.observe(it)});
    }
  }

  /* ---------- services index (active section) ---------- */
  var idx=document.querySelectorAll('.svc-index a');
  if(idx.length&&'IntersectionObserver' in window){
    var sio=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){
      idx.forEach(function(a){a.classList.toggle('on',a.getAttribute('href')==='#'+en.target.id)});
    }})},{rootMargin:'-45% 0px -50% 0px'});
    document.querySelectorAll('.sd').forEach(function(s){sio.observe(s)});
  }

  /* ---------- process: active phase + tracks ---------- */
  /* active phase: works in a normal window and inside an auto-sized (cross-origin) preview frame,
     where scroll events and rootMargin are not available; IntersectionObserver still reports real visibility */
  var phs=[].slice.call(document.querySelectorAll('.phase'));
  /* mouse users: phases light on hover (CSS). touch screens have no hover, so they light as they come into view */
  if(phs.length&&!fine&&'IntersectionObserver' in window){
    var ratio=phs.map(function(){return 0}),curPh=-1;
    function phPick(){
      var full=[],best=-1,bm=0;
      ratio.forEach(function(r,k){if(r>=.98)full.push(k);if(r>bm){bm=r;best=k}});
      if(full.length)best=full[Math.floor((full.length-1)/2)];
      else if(bm<.45)best=-1;
      if(best===curPh)return;curPh=best;
      phs.forEach(function(p,k){p.classList.toggle('on',k===best)});
    }
    var th=[];for(var q=0;q<=20;q++)th.push(q/20);
    var pio=new IntersectionObserver(function(es){es.forEach(function(en){ratio[phs.indexOf(en.target)]=en.isIntersecting?en.intersectionRatio:0});phPick()},{threshold:th});
    phs.forEach(function(p){pio.observe(p)});
  }
  var tracks=document.querySelectorAll('.track');
  if(tracks.length){
    var cur='a',letters={a:'أ',b:'ب',c:'ج'};
    function setTrack(k,animate){
      cur=k;
      tracks.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.track===k)});
      document.querySelectorAll('.trk[data-a]').forEach(function(el,i){
        var L=root.lang==='en'?'en':'ar';
        var html='<small>'+(L==='en'?el.dataset.labelEn.replace('{T}',k.toUpperCase()):el.dataset.labelAr.replace('{T}',letters[k]))+'</small>'+el.dataset[k+(L==='en'?'En':'')];
        if(!animate||reduce){el.innerHTML=html;return}
        el.classList.add('swap');
        setTimeout(function(){el.innerHTML=html;el.classList.remove('swap')},180+i*60);
      });
    }
    tracks.forEach(function(b){b.addEventListener('click',function(){setTrack(b.dataset.track,true)})});
    document.addEventListener('langchange',function(){setTrack(cur,false)});
    setTrack('a',false);
  }

  /* ---------- contact form ---------- */
  var form=document.querySelector('#rfq');
  if(form){
    var picks=form.querySelectorAll('.chips-pick button');
    picks.forEach(function(b){b.addEventListener('click',function(){b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!=='true')})});
    var drop=form.querySelector('.drop'),file=form.querySelector('#f-file'),fname=form.querySelector('.fname');
    function showF(fs){fname.textContent=[].map.call(fs,function(f){return f.name}).join(' · ')}
    if(drop){
      ['dragenter','dragover'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.add('over')})});
      ['dragleave','drop'].forEach(function(ev){drop.addEventListener(ev,function(e){e.preventDefault();drop.classList.remove('over')})});
      drop.addEventListener('drop',function(e){if(e.dataTransfer.files.length){try{file.files=e.dataTransfer.files}catch(x){}showF(e.dataTransfer.files)}});
      file.addEventListener('change',function(){showF(file.files)});
    }
    function msg(ar,en){return root.lang==='en'?en:ar}
    function check(id,test,ar,en){
      var el=form.querySelector('#'+id),f=el.closest('.field'),er=f.querySelector('.err');
      var ok=test(el.value.trim());f.classList.toggle('bad',!ok);er.textContent=ok?'':msg(ar,en);
      el.addEventListener('input',function(){f.classList.remove('bad');er.textContent=''},{once:true});
      return ok;
    }
    form.addEventListener('submit',function(e){
      e.preventDefault();
      var ok=true;
      ok=check('f-name',function(v){return v.length>1},'أدخل اسمك','Enter your name')&&ok;
      ok=check('f-phone',function(v){return /^[+0-9\s-]{8,}$/.test(v)},'أدخل رقم هاتف صحيح','Enter a valid phone number')&&ok;
      ok=check('f-msg',function(v){return v.length>5},'اكتب رسالتك','Write your message')&&ok;
      if(!ok){var b=form.querySelector('.bad input,.bad textarea');if(b)b.focus();return}
      var v=function(id){return form.querySelector('#'+id).value.trim()};
      var chosen=[].slice.call(picks).filter(function(x){return x.getAttribute('aria-pressed')==='true'}).map(function(x){return x.textContent.trim()});
      var files=file&&file.files.length?[].map.call(file.files,function(f){return f.name}).join(', '):'';
      var lines=[msg('رسالة من موقع بوابة أفريقيا','Message from the Africa Gate website'),'',
        msg('الاسم: ','Name: ')+v('f-name'),
        v('f-company')?msg('الشركة: ','Company: ')+v('f-company'):'',
        msg('الهاتف: ','Phone: ')+v('f-phone'),
        v('f-email')?msg('البريد: ','Email: ')+v('f-email'):'',
        chosen.length?msg('الخدمة المطلوبة: ','Interested in: ')+chosen.join('، '):'',
        msg('الرسالة: ','Message: ')+v('f-msg')].filter(function(x){return x!==''||true}).filter(function(x,i,a){return x!==''||i===1}).join('\n');
      var url='https://wa.me/201097421513?text='+encodeURIComponent(lines);
      var sent=form.querySelector('.sent');
      sent.querySelector('a').href=url;
      sent.hidden=false;
      try{window.open(url,'_blank','noopener')}catch(x){}
    });
  }

  /* ---------- copy buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(function(b){
    b.addEventListener('click',function(){
      var txt=b.dataset.copy,o=b.innerHTML;
      var done=function(){b.textContent=root.lang==='en'?'Copied':'تم النسخ';setTimeout(function(){b.innerHTML=o},1400)};
      if(navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(txt).then(done,function(){});
    });
  });
})();
