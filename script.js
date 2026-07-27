/* Kevyet, saavutettavat käyttöliittymätoiminnot. */
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav'), navLinks = [...document.querySelectorAll('nav a:not(.nav-cta)')];
  const menu = document.querySelector('.menu-btn'), top = document.querySelector('.to-top');
  document.getElementById('year').textContent = new Date().getFullYear();
  const onScroll = () => { const y = scrollY, h = document.documentElement.scrollHeight - innerHeight; document.querySelector('.progress i').style.width = `${h ? y / h * 100 : 0}%`; nav.classList.toggle('scrolled', y > 12); top.classList.toggle('show', y > 700); };
  addEventListener('scroll', onScroll, {passive:true}); onScroll();
  menu.addEventListener('click', () => { const open = nav.classList.toggle('open'); menu.setAttribute('aria-expanded', open); document.body.classList.toggle('menu-open', open); });
  navLinks.forEach(a => a.addEventListener('click', () => { nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); document.body.classList.remove('menu-open'); }));
  top.addEventListener('click', () => scrollTo({top:0, behavior:'smooth'}));
  const sections = [...document.querySelectorAll('main section[id]')];
  const spy = new IntersectionObserver(entries => entries.forEach(e => { if(e.isIntersecting) navLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === `#${e.target.id}`)); }), {rootMargin:'-35% 0px -55%', threshold:0}); sections.forEach(s => spy.observe(s));
  const reveal = new IntersectionObserver(entries => entries.forEach(e => {if(e.isIntersecting){e.target.classList.add('visible');reveal.unobserve(e.target)}}), {threshold:.12}); document.querySelectorAll('.reveal').forEach(e => reveal.observe(e));
  document.querySelectorAll('.accordion button').forEach(button => button.addEventListener('click', () => { const article = button.parentElement, willOpen = !article.classList.contains('open'); document.querySelectorAll('.accordion article').forEach(a => {a.classList.remove('open');a.querySelector('button').setAttribute('aria-expanded','false')}); if(willOpen){article.classList.add('open');button.setAttribute('aria-expanded','true')} }));
  document.querySelectorAll('.button').forEach(btn => btn.addEventListener('click', e => { const r = btn.getBoundingClientRect(), ink = document.createElement('i'); ink.className='ripple'; ink.style.left=`${e.clientX-r.left}px`;ink.style.top=`${e.clientY-r.top}px`;btn.append(ink);setTimeout(()=>ink.remove(),650); }));
});
