document.body.classList.add('js');
const menu = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
if (menu && navigation) {
  const close = () => { menu.setAttribute('aria-expanded', 'false'); navigation.classList.remove('open'); };
  menu.addEventListener('click', () => { const expanded = menu.getAttribute('aria-expanded') !== 'true'; menu.setAttribute('aria-expanded', String(expanded)); navigation.classList.toggle('open', expanded); });
  navigation.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { close(); menu.focus(); } });
  window.matchMedia('(min-width: 801px)').addEventListener('change', event => { if(event.matches) close(); });
}
