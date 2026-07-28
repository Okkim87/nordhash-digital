/* Selainpohjainen palveluagentti: ei palvelinta, API-avainta eikä keskustelutallennusta. */
document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('agent-chat');
  const form = document.getElementById('agent-form');
  const input = document.getElementById('agent-input');
  const answers = [
    {keys:['verkkosivu','kotisivu','sivu','website'],text:'Verkkosivut sopivat, kun haluat selkeän digitaalisen kotipesän, joka ohjaa kävijää yhteydenottoon. Starter-sivusto alkaa 490 € + alv ja Business-kokonaisuus 990 € + alv. Haluatko kertoa, montako palvelua yritykselläsi on?'},
    {keys:['chatbot','botti','asiakaspalvelu','faq'],text:'AI-chatbot vastaa yrityksesi hyväksytystä sisällöstä usein kysyttyihin kysymyksiin, ohjaa oikeaan palveluun ja voi kerätä yhteydenottopyynnön. Perusratkaisu sisältyy Premium-ylläpitoon alkaen 79 € / kk + alv.'},
    {keys:['automaatio','automatis','tarjous','crm','liidi'],text:'AI-automaatio sopii toistuviin työvaiheisiin: tarjouspyyntöjen luokitteluun, kuittausviesteihin, liidien siirtoon ja raportointiin. Aloitamme aina yhdestä selkeästä työvaiheesta ja kartoitamme hyödyn ennen toteutusta.'},
    {keys:['seo','google','hakukone','löyty','näkyv'],text:'SEO yhdistää teknisen kunnon, hyödylliset palvelusivut ja paikallisen löydettävyyden. Autamme yrityksiä näkymään esimerkiksi Jyväskylään, Laukaaseen ja palveluihin liittyvissä hauissa.'},
    {keys:['verkkokauppa','kauppa','myydä','tuote'],text:'Verkkokaupassa tärkeintä on sujuva ostopolku: asiakas löytää tuotteen, ymmärtää hyödyn ja voi ostaa ilman turhia vaiheita. Ratkaisu suunnitellaan valikoiman ja tavoitteiden mukaan.'},
    {keys:['ylläpito','päivity','tietoturva','turvall'],text:'Ylläpito pitää sivuston ajan tasalla: tekniset päivitykset, tietoturva, pienet kehitystoimet ja tuki samasta paikasta. Premium-ylläpito alkaa 79 € / kk + alv.'},
    {keys:['hinta','maksaa','hinnasto'],text:'Verkkosivujen Starter-paketti alkaa 490 € + alv, Business 990 € + alv ja Premium-ylläpito 79 € / kk + alv. Tarkka toteutus sovitaan aina tarpeen mukaan.'}
  ];
  const addMessage = (text, type) => { const el=document.createElement('div'); el.className=`agent-message ${type}`; el.textContent=text; chat.append(el); chat.scrollTop=chat.scrollHeight; };
  const reply = message => { const clean=message.toLowerCase(); const result=answers.find(item=>item.keys.some(key=>clean.includes(key))); addMessage(result ? result.text : 'Kiitos! Voin auttaa verkkosivuissa, AI-chatboteissa, automaatioissa, SEO:ssa, verkkokaupoissa ja ylläpidossa. Kerro hieman tarkemmin, mikä yrityksessäsi vie eniten aikaa tai mitä haluat saavuttaa.','agent-bot'); };
  const send = message => { const value=message.trim(); if(!value)return; addMessage(value,'agent-user'); input.value=''; setTimeout(()=>reply(value),250); };
  form.addEventListener('submit', event=>{event.preventDefault();send(input.value)});
  document.querySelectorAll('.agent-suggestions button').forEach(button=>button.addEventListener('click',()=>send(button.textContent)));
});
