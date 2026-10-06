(() => {
  'use strict';
  const $ = (s) => document.querySelector(s);
  const body = document.body;
  const rider = $('#rider'), heroSlot = $('#heroSlot'), whySlot = $('#whySlot');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const start = performance.now();
  const hidePreloader = () => {
    const wait = Math.max(0, 1200 - (performance.now() - start));
    setTimeout(() => {
      $('#preloader').classList.add('done');
      body.classList.remove('is-loading');
      
      // GSAP Hero Entry Animation
      if (typeof gsap !== 'undefined') {
        gsap.from(".hero-copy h1, .hero-copy p, .hero-copy .btn", {
          y: 40,
          opacity: 0,
          duration: 1,
          stagger: 0.15,
          ease: "power3.out"
        });
      }
    }, wait);
  };
  
  if (document.readyState === 'complete') hidePreloader();
  else addEventListener('load', hidePreloader);

  const spotlight = $('.cursor-spotlight');
  if (spotlight) {
    window.addEventListener('mousemove', (e) => {
      spotlight.style.left = `${e.clientX}px`;
      spotlight.style.top = `${e.clientY}px`;
    });
  }

  const docRect = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
  };
  let A, B, dist, current = 0, target = 0, ticking = false;

  const measure = () => {
    if (!heroSlot || !whySlot || !rider) return;
    A = docRect(heroSlot);
    B = docRect(whySlot);
    rider.style.width = A.w + 'px';
    dist = Math.max(1, (B.y + B.h / 2) - (A.y + A.h / 2));
    target = progress();
    current = reduced ? target : current;
    render();
    rider.classList.add('ready');
  };
  const progress = () => Math.min(1, Math.max(0, scrollY / dist));
  const ease = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  function render() {
    if (!A) return;
    const t = ease(current);
    const x = lerp(A.x, B.x, t);
    const targetY = B.y + 15; 
    const y = lerp(A.y, targetY, t);
    const s = lerp(1, B.w / A.w, t);
    
    const rumbleX = (Math.random() - 0.5) * 2;
    const rumbleY = (Math.random() - 0.5) * 2;
    const tilt = Math.sin(t * Math.PI) * -3 + Math.sin(scrollY * 0.1) * 0.8; 
    
    rider.style.transform = `translate3d(${x + rumbleX}px, ${y + rumbleY}px, 0) scale(${s}) rotate(${tilt}deg)`;
  }

  function loop() {
    current += (target - current) * 0.12;
    if (Math.abs(target - current) < 0.0005) { current = target; ticking = false; }
    render();
    if (ticking) requestAnimationFrame(loop);
  }

  const onScroll = () => {
    target = progress();
    let roadShift = scrollY * 0.4;
    document.body.style.backgroundPosition = `0px ${roadShift}px`;

    if (reduced) { current = target; render(); return; }
    if (!ticking) { ticking = true; requestAnimationFrame(loop); }
  };

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', measure);
  rider.complete ? measure() : rider.addEventListener('load', measure);
  addEventListener('load', measure);

  // GSAP ScrollTrigger Integration for Enhanced Reveal Animation
  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.reveal').forEach((elem) => {
      gsap.fromTo(elem, 
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: {
            trigger: elem,
            start: "top 85%",
            toggleActions: "play none none none"
          }
        }
      );
    });
  }

  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
      card.style.transition = 'transform 0.5s ease';
    });
    card.addEventListener('mouseenter', () => {
      card.style.transition = 'none';
    });
  });

  const counters = document.querySelectorAll('.counter');
  let animatedCounters = false;

  const runCounters = () => {
    counters.forEach(counter => {
      const targetVal = +counter.getAttribute('data-target');
      let count = 0;
      const speed = 400;
      const updateCount = () => {
        count += 0.05;
        if (count < targetVal) {
          counter.innerText = '0' + Math.ceil(count);
          setTimeout(updateCount, speed);
        } else {
          counter.innerText = targetVal < 10 ? '0' + targetVal : targetVal;
        }
      };
      updateCount();
    });
  };

  const visionSec = $('#vision');
  if (visionSec) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !animatedCounters) {
          runCounters();
          animatedCounters = true;
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.2 });
    io.observe(visionSec);
  }
})();