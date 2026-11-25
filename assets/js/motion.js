/* Africa Gate motion layer (GSAP + ScrollTrigger). Content stays readable if this file or GSAP fails to load. */
(function(){
  var AG=window.AG;
  if(!AG||!AG.hasGsap)return;
  var root=document.documentElement;
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ignoreMobileResize:true});


  var rtl=function(){return root.dir==='rtl'};
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return [].slice.call((c||document).querySelectorAll(s))};
  var EASE='expo.out';
  /* phones/tablets get time-based reveals only; scroll-linked transforms stay on desktop */
  var DESK=AG.fine&&window.innerWidth>900;

  /* ---------- word split (Arabic-safe: words only, never letters) ---------- */
  function split(el){
    var walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT,null),nodes=[],n;
    while((n=walker.nextNode()))nodes.push(n);
    nodes.forEach(function(tn){
      var parts=tn.nodeValue.split(/(\s+)/),frag=document.createDocumentFragment();
      parts.forEach(function(p){
        if(!p)return;
        if(/^\s+$/.test(p)){frag.appendChild(document.createTextNode(p));return}
        var w=document.createElement('span');w.className='w';
        var wi=document.createElement('span');wi.className='wi';wi.textContent=p;
        w.appendChild(wi);frag.appendChild(w);
      });
      tn.parentNode.replaceChild(frag,tn);
    });
    return $$('.wi',el);
  }

  function init(){
    /* page-enter curtain */
    var curtain=$('.curtain'),fromNav=false;
    try{fromNav=sessionStorage.getItem('ag-nav')==='1';sessionStorage.removeItem('ag-nav')}catch(e){}
    if(curtain&&fromNav){
      gsap.fromTo(curtain,{scaleY:1,transformOrigin:'50% 0%'},{scaleY:0,duration:.9,ease:'expo.inOut',clearProps:'transform,transformOrigin'});
    }

    /* scroll progress */
    gsap.to('.sprog i',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:.3}});

    /* ---------- HERO ---------- */
    var hero=$('.hero');
    if(hero){
      setTimeout(function(){document.documentElement.classList.add('hero-in')},4000);
      var h1w=split($('h1',hero));
      var tl=gsap.timeline({defaults:{ease:EASE},delay:fromNav?.35:0});
      tl.from('.hero .eyebrow',{y:20,autoAlpha:0,duration:.9})
        .from(h1w,{yPercent:115,rotate:rtl()?-4:4,duration:1.3,stagger:.075},'<.1')
        .from('.hero .lead',{y:28,autoAlpha:0,duration:1.1},'<.45')
        .from('.hero-btns .btn',{y:24,autoAlpha:0,stagger:.1,duration:.9},'<.2')
        .from('.hero-visual .gear-wrap',{scale:.5,rotate:-120,autoAlpha:0,duration:2},0.15)
        .from('.hero-visual .gear-sm',{scale:0,rotate:180,autoAlpha:0,duration:1.6},0.5)
        .from('.hero-visual .robot',{y:140,autoAlpha:0,duration:1.8},0.35)
        .from('.hero-visual .dim',{scaleX:0,autoAlpha:0,duration:1.2},0.9)
        .from('.hero-visual .readout',{y:30,autoAlpha:0,duration:1},1.1)
        .from('.hero-visual .callout',{x:rtl()?-30:30,autoAlpha:0,duration:.9},1.25)
        .from('.hero-stats>div',{y:34,autoAlpha:0,stagger:.09,duration:1},0.9)
        .from('.scroll-cue',{autoAlpha:0,duration:.8},1.6);
      document.documentElement.classList.add('hero-in');
      $$('.blueprint .bp').forEach(function(el,i){
        if(el.classList.contains('dash')){tl.from(el,{autoAlpha:0,duration:1.4},0.4);return}
        var len=el.getTotalLength?el.getTotalLength():1000;
        gsap.set(el,{strokeDasharray:len,strokeDashoffset:len});
        tl.to(el,{strokeDashoffset:0,duration:2.2,ease:'power3.inOut'},0.2+i*.12);
      });
      if(DESK)tl.add(function(){
        var fl=gsap.to('.hero-visual .robot',{y:-14,duration:3.4,ease:'sine.inOut',yoyo:true,repeat:-1});
        ScrollTrigger.create({trigger:hero,start:'top bottom',end:'bottom top',onToggle:function(s){s.isActive?fl.play():fl.pause()}});
      });

      /* scroll-out */
      var st={trigger:hero,start:'top top',end:'bottom top',scrub:true};
      if(DESK){
      gsap.to('.hero-copy',{yPercent:-14,autoAlpha:.25,ease:'none',scrollTrigger:st});
      gsap.to('.hero-visual .gear-wrap',{rotate:140,ease:'none',scrollTrigger:st});
      gsap.to('.hero-visual .blueprint',{rotate:-30,scale:1.08,ease:'none',scrollTrigger:st});
      gsap.to('.hero-glow',{yPercent:40,ease:'none',scrollTrigger:st});
      }

      /* mouse tilt */
      if(AG.fine){
        var hv=$('.hero-visual');gsap.set(hv,{transformPerspective:1300});
        var rx=gsap.quickTo(hv,'rotationX',{duration:.9,ease:'power3'}),ry=gsap.quickTo(hv,'rotationY',{duration:.9,ease:'power3'});
        var rb=gsap.quickTo('.hero-visual .robot','x',{duration:1.2,ease:'power3'});
        hero.addEventListener('mousemove',function(e){
          var dx=e.clientX/window.innerWidth-.5,dy=e.clientY/window.innerHeight-.5;
          ry(dx*10);rx(-dy*8);rb(dx*-26);
        });
        hero.addEventListener('mouseleave',function(){rx(0);ry(0);rb(0)});
      }
    }

    /* ---------- inner page heroes ---------- */
    var ph=$('.phero');
    if(ph){
      var w=split($('h1',ph));
      var t2=gsap.timeline({defaults:{ease:EASE},delay:fromNav?.35:.05});
      t2.from($('.crumbs',ph),{y:14,autoAlpha:0,duration:.8})
        .from(w,{yPercent:115,duration:1.25,stagger:.07},'<.1')
        .from($$('.lead,.btn-row',ph),{y:26,autoAlpha:0,duration:1,stagger:.12},'<.45')
        .from($('.bgimg',ph),{scale:1.25,autoAlpha:0,duration:2.2,ease:'power2.out'},0);
      if(DESK)gsap.to($('.bgimg',ph),{yPercent:14,ease:'none',scrollTrigger:{trigger:ph,start:'top top',end:'bottom top',scrub:true}});
    }

    /* ---------- section headings ---------- */
    $$('[data-split]').forEach(function(el){
      if(el.closest('.hero')||el.closest('.phero'))return;
      var words=split(el);
      gsap.from(words,{yPercent:115,duration:1.15,ease:EASE,stagger:.05,scrollTrigger:{trigger:el,start:'top 88%'}});
    });
    $$('.eyebrow').forEach(function(el){
      if(el.closest('.hero'))return;
      gsap.from(el,{autoAlpha:0,x:rtl()?24:-24,duration:.9,ease:EASE,scrollTrigger:{trigger:el,start:'top 90%'}});
    });
    $$('.sec-head .lead, .about-split .txt p, .cta-band p, .foot .about').forEach(function(el){
      gsap.from(el,{y:24,autoAlpha:0,duration:1,ease:EASE,scrollTrigger:{trigger:el,start:'top 90%'}});
    });
    $$('.sec-head.split>.btn, .sec .btn-row:not(.hero-btns)').forEach(function(el){
      if(el.closest('.phero')||el.closest('.cta-band'))return;
      gsap.from(el,{y:20,autoAlpha:0,duration:.9,ease:EASE,scrollTrigger:{trigger:el,start:'top 92%'}});
    });

    /* ---------- staggered groups ---------- */
    function batch(sel,from,extra){
      var els=$$(sel);if(!els.length)return;
      gsap.set(els,from);
      ScrollTrigger.batch(els,{start:'top 90%',once:true,onEnter:function(b){
        gsap.to(b,Object.assign({y:0,x:0,autoAlpha:1,scale:1,rotationX:0,duration:DESK?1.1:.8,ease:EASE,stagger:.09,overwrite:'auto'},extra||{}));
      }});
    }
    batch('.svc-grid .svc',DESK?{y:70,autoAlpha:0,rotationX:-12,transformPerspective:900}:{y:40,autoAlpha:0});
    batch('.ind-grid .ind',{y:80,autoAlpha:0});
    batch('.why-list .why-item',{x:rtl()?-40:40,autoAlpha:0});
    batch('.values .val',{y:60,autoAlpha:0});
    batch('.step',{y:60,autoAlpha:0});
    batch('.sd',{y:60,autoAlpha:0});
    batch('.phase',{y:50,autoAlpha:0});
    batch('.track',{y:30,autoAlpha:0});
    batch('.form>*',{y:30,autoAlpha:0},{stagger:.05});
    batch('.cards>*',{y:30,autoAlpha:0});
    batch('.faq-item',{y:30,autoAlpha:0});
    batch('.foot-grid>div',{y:30,autoAlpha:0});
    $$('.sd').forEach(function(sd){
      gsap.from($('.ic',sd),{scale:.3,rotate:-40,autoAlpha:0,duration:1.1,ease:'back.out(2)',scrollTrigger:{trigger:sd,start:'top 85%'}});
      gsap.from($$('li',sd),{x:rtl()?-20:20,autoAlpha:0,duration:.8,stagger:.08,ease:EASE,scrollTrigger:{trigger:sd,start:'top 80%'}});
    });

    /* card 3D tilt */
    if(AG.fine){
      $$('.svc,.step,.val').forEach(function(c){
        gsap.set(c,{transformPerspective:900});
        var tx=gsap.quickTo(c,'rotationY',{duration:.6,ease:'power3'}),ty=gsap.quickTo(c,'rotationX',{duration:.6,ease:'power3'});
        c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();tx(((e.clientX-r.left)/r.width-.5)*10);ty(-((e.clientY-r.top)/r.height-.5)*10)});
        c.addEventListener('pointerleave',function(){tx(0);ty(0)});
      });
    }

    /* steps connector */
    var sl=$('.steps-line i');
    if(sl)gsap.fromTo(sl,{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{trigger:'.steps',start:'top 75%',end:'bottom 60%',scrub:true}});

    /* image wipes */
    $$('[data-wipe]').forEach(function(el){
      var img=$('img',el);
      var t=gsap.timeline({scrollTrigger:{trigger:el,start:'top 94%'}});
      t.fromTo(el,{clipPath:'inset(0% 0% 100% 0% round 24px)'},{clipPath:'inset(0% 0% 0% 0% round 24px)',duration:.95,ease:'power3.out'})
       .from(img,{scale:1.18,duration:1.3,ease:'power3.out'},0);
      if(el.classList.contains('vm-card'))t.from($$('.in>*',el),{y:30,autoAlpha:0,stagger:.1,duration:1,ease:EASE},.6);
    });

    /* industry parallax */
    $$('.ind').forEach(function(card){
      var im=$('.ind-img img',card);if(!im)return;
      if(DESK)gsap.fromTo(im,{yPercent:-7},{yPercent:7,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom top',scrub:true}});
    });

    /* about gear frame */
    var gf=$('[data-gearframe]');
    if(gf){
      gsap.from(gf,{scale:.7,autoAlpha:0,rotate:-60,duration:1.6,ease:EASE,scrollTrigger:{trigger:gf,start:'top 85%'}});
      if(DESK)gsap.to($('img',gf),{rotate:60,ease:'none',scrollTrigger:{trigger:gf,start:'top bottom',end:'bottom top',scrub:true}});
    }

    /* CTA band */
    $$('[data-cta]').forEach(function(b){
      if(DESK)gsap.fromTo(b,{scale:.9,borderRadius:'60px'},{scale:1,borderRadius:'28px',ease:'none',scrollTrigger:{trigger:b,start:'top bottom',end:'top 55%',scrub:true}});
    });

    /* footer wordmark */
    var bm=$$('.bigmark span');
    if(bm.length)gsap.from(bm,{yPercent:100,duration:1.2,ease:EASE,stagger:.05,scrollTrigger:{trigger:'.bigmark',start:'top 95%'}});

    /* ---------- process phases: grid on desktop, native swipe on mobile (no scroll hijack) ---------- */
    var hs=$('[data-hscroll]');
    if(hs){
      var vp=$('.hs-viewport',hs),cards=$$('.hcard',hs),cnt=$('.hs-count',hs),bar=$('.hs-bar i',hs),total=cards.length;
      function mark(i){
        cards.forEach(function(c,k){c.classList.toggle('on',k<=i)});
        if(cnt)cnt.textContent=String(Math.min(i+1,total)).padStart(2,'0')+' / '+String(total).padStart(2,'0');
        if(bar)gsap.to(bar,{scaleX:(i+1)/total,duration:.5,ease:'power3.out'});
      }
      var mm=gsap.matchMedia();
      mm.add('(min-width: 901px)',function(){
        gsap.set(cards,{y:60,autoAlpha:0});
        ScrollTrigger.create({trigger:$('.hs-track',hs),start:'top 80%',once:true,onEnter:function(){
          gsap.to(cards,{y:0,autoAlpha:1,duration:1,ease:EASE,stagger:.1});
          cards.forEach(function(c,k){setTimeout(function(){mark(k)},350+k*220)});
        }});
        return function(){gsap.set(cards,{clearProps:'all'})};
      });
      mm.add('(max-width: 900px)',function(){
        mark(0);
        function onS(){var max=vp.scrollWidth-vp.clientWidth;var p=max?Math.abs(vp.scrollLeft)/max:0;mark(Math.round(p*(total-1)))}
        vp.addEventListener('scroll',onS,{passive:true});
        return function(){vp.removeEventListener('scroll',onS)};
      });
    }

    /* ---------- FAQ smooth accordion ---------- */
    $$('.faq-item').forEach(function(d){
      var s=$('summary',d),a=$('.faq-a',d);
      s.addEventListener('click',function(e){
        e.preventDefault();
        if(d.open){gsap.to(a,{height:0,autoAlpha:0,duration:.45,ease:'power3.inOut',onComplete:function(){d.open=false;gsap.set(a,{clearProps:'all'})}})}
        else{d.open=true;gsap.from(a,{height:0,autoAlpha:0,duration:.55,ease:'power3.out',clearProps:'all'})}
      });
    });

    /* ---------- magnetic buttons ---------- */
    if(AG.fine){
      $$('.btn,.lang,.wa').forEach(function(b){
        var mx=gsap.quickTo(b,'x',{duration:.5,ease:'power3'}),my=gsap.quickTo(b,'y',{duration:.5,ease:'power3'});
        b.addEventListener('mousemove',function(e){var r=b.getBoundingClientRect();mx((e.clientX-r.left-r.width/2)*.25);my((e.clientY-r.top-r.height/2)*.35)});
        b.addEventListener('mouseleave',function(){mx(0);my(0)});
      });
    }

    /* language switch: re-measure everything */
    document.addEventListener('langchange',function(){setTimeout(function(){ScrollTrigger.refresh()},60)});
    window.addEventListener('load',function(){ScrollTrigger.refresh()});
  }

  if(AG.loaderDone())init();
  else{
    /* keep the hero hidden under the loader, then start the intro as it lifts */
    document.addEventListener('ag:ready',function(){setTimeout(init,100)},{once:true});
  }
})();
