/* Selainpohjainen palveluagentti: ei palvelinta, API-avainta eikä keskustelutallennusta. */
document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('agent-chat');
  const form = document.getElementById('agent-form');
  const input = document.getElementById('agent-input');

  if (!chat || !form || !input) return;

  const state = {
    lastService: '',
    lastQuestion: '',
    awaiting: ''
  };

  const CONTACT_EMAIL = 'nordhashoy@gmail.com';
  const CONTACT_PHONE = '050 556 1219';

  const normalize = value => String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9@.+\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const containsAny = (text, terms) => terms.some(term => text.includes(term));

  const words = text => normalize(text).split(' ').filter(Boolean);

  const editDistance = (a, b) => {
    if (a === b) return 0;
    if (!a.length) return b.length;
    if (!b.length) return a.length;
    const row = Array.from({ length: b.length + 1 }, (_, i) => i);
    for (let i = 1; i <= a.length; i += 1) {
      let previous = row[0];
      row[0] = i;
      for (let j = 1; j <= b.length; j += 1) {
        const old = row[j];
        row[j] = Math.min(
          row[j] + 1,
          row[j - 1] + 1,
          previous + (a[i - 1] === b[j - 1] ? 0 : 1)
        );
        previous = old;
      }
    }
    return row[b.length];
  };

  const fuzzyContains = (text, targets) => {
    const tokens = words(text);
    return targets.some(target => {
      const cleanTarget = normalize(target);
      if (text.includes(cleanTarget)) return true;
      if (cleanTarget.length < 5) return false;
      return tokens.some(token => {
        const limit = cleanTarget.length >= 8 ? 2 : 1;
        return Math.abs(token.length - cleanTarget.length) <= limit
          && editDistance(token, cleanTarget) <= limit;
      });
    });
  };

  const serviceFromText = text => {
    const matches = [];
    if (fuzzyContains(text, ['verkkosivu', 'verkkosivut', 'kotisivu', 'kotisivut', 'website', 'sivusto', 'nettisivu'])) matches.push('website');
    if (fuzzyContains(text, ['chatbot', 'chatbotti', 'palveluohjaaja', 'asiakaspalvelubotti', 'botti'])) matches.push('chatbot');
    if (fuzzyContains(text, ['automaatio', 'automatisointi', 'automatisoida', 'crm', 'liidien kasittely', 'raportointi'])) matches.push('automation');
    if (fuzzyContains(text, ['seo', 'google', 'hakukone', 'hakukoneoptimointi', 'nakyvyys', 'loydettavyys'])) matches.push('seo');
    if (fuzzyContains(text, ['verkkokauppa', 'webshop', 'woocommerce', 'shopify', 'tuotteiden myynti'])) matches.push('ecommerce');
    if (fuzzyContains(text, ['yllapito', 'paivitys', 'tietoturva', 'jatkuva tuki'])) matches.push('maintenance');
    return [...new Set(matches)];
  };

  const addMessage = (text, type) => {
    const el = document.createElement('div');
    el.className = `agent-message ${type}`;
    el.textContent = text;
    chat.append(el);
    chat.scrollTop = chat.scrollHeight;
  };

  const contactReply = () => {
    state.awaiting = '';
    return `Onnistuu. Voit lähettää sähköpostia osoitteeseen ${CONTACT_EMAIL} tai soittaa numeroon ${CONTACT_PHONE}. Kerro viestissä lyhyesti yrityksesi, tavoite ja mahdollinen aikataulu. Nordhash palaa asiaan viimeistään seuraavana arkipäivänä.`;
  };

  const priceReply = services => {
    const selected = services.length ? services : (state.lastService ? [state.lastService] : []);

    if (selected.includes('website') && selected.includes('chatbot')) {
      state.lastService = 'website';
      return 'Verkkosivut alkavat 490 € + alv (Starter, 1–3 sivua) tai 990 € + alv (Business, 4–8 sivua ja laajempi SEO-perusta). AI-chatbotin perusratkaisu sisältyy Premium-ylläpitoon alkaen 79 € / kk + alv. Tarkka kokonaisuus riippuu sivumäärästä ja siitä, mitä chatbotin pitää osata.';
    }

    switch (selected[0]) {
      case 'website':
        state.lastService = 'website';
        state.awaiting = 'websiteScope';
        return 'Starter-verkkosivusto alkaa 490 € + alv ja sisältää 1–3 sivua. Business alkaa 990 € + alv ja sisältää 4–8 sivua, palvelukohtaisia alasivuja sekä laajemman paikallisen SEO-perustan. Onko kyse pienestä 1–3 sivun kokonaisuudesta vai useamman palvelun sivustosta?';
      case 'chatbot':
        state.lastService = 'chatbot';
        return 'AI-chatbotin perusratkaisu sisältyy Premium-ylläpitoon alkaen 79 € / kk + alv. Jos chatbot tarvitsee integraatioita, laajan tietopohjan tai erityisiä työnkulkuja, hinta arvioidaan tarpeen mukaan.';
      case 'maintenance':
        state.lastService = 'maintenance';
        return 'Premium-ylläpito alkaa 79 € / kk + alv. Se sisältää sovitussa laajuudessa sisältöpäivityksiä, teknistä ylläpitoa, pieniä muutoksia, toimivuuden seurantaa ja AI-chatbotin perusratkaisun.';
      case 'automation':
        state.lastService = 'automation';
        state.awaiting = 'automationScope';
        return 'Automaation hinta riippuu siitä, mikä työvaihe automatisoidaan ja mihin järjestelmiin ratkaisu yhdistetään. Ensin rajataan yksi toistuva tehtävä, esimerkiksi tarjouspyyntöjen käsittely, liidien siirto tai raportointi. Mikä työvaihe vie teillä eniten aikaa?';
      case 'seo':
        state.lastService = 'seo';
        return 'SEO:n hinta riippuu sivuston nykytilasta ja tavoitteesta. Business-verkkosivupakettiin, alkaen 990 € + alv, sisältyy paikallinen hakukoneoptimointi, palvelukohtaiset alasivut, Analytics ja Search Console. Erillinen SEO-työ kartoitetaan tapauskohtaisesti.';
      case 'ecommerce':
        state.lastService = 'ecommerce';
        return 'Verkkokauppa hinnoitellaan tuotevalikoiman, maksutapojen, toimitusten ja tarvittavien integraatioiden mukaan. Kerro tuotteiden arvioitu määrä ja onko käytössä jo jokin kauppa-alusta, niin sopiva laajuus voidaan arvioida.';
      default:
        return 'Verkkosivujen Starter-paketti alkaa 490 € + alv, Business 990 € + alv ja Premium-ylläpito 79 € / kk + alv. Automaatioiden, verkkokauppojen ja laajempien AI-ratkaisujen hinta määritellään tarpeen mukaan. Mistä palvelusta haluat tarkemman arvion?';
    }
  };

  const websiteReply = text => {
    state.lastService = 'website';
    const pageMatch = text.match(/\b([1-9]|1[0-9])\s*(?:sivu|sivua|alasivu)/);
    const pageCount = pageMatch ? Number(pageMatch[1]) : null;

    if (pageCount !== null) {
      state.awaiting = '';
      if (pageCount <= 3) {
        return `Noin ${pageCount} sivun tarpeeseen Starter on todennäköinen lähtökohta: alkaen 490 € + alv. Se sisältää yksilöllisen, mobiiliystävällisen toteutuksen, yhteydenottolomakkeen, teknisen SEO-perustan ja julkaisun.`;
      }
      return `Noin ${pageCount} sivun kokonaisuuteen Business on todennäköisesti sopivampi: alkaen 990 € + alv. Siihen kuuluu 4–8 sivua, palvelukohtaiset alasivut, tekstien viimeistely, paikallinen SEO sekä Analytics ja Search Console. Jos sivuja tulee yli kahdeksan, laajuus arvioidaan erikseen.`;
    }

    if (containsAny(text, ['uudista', 'uudistus', 'vanha sivu', 'nykyinen sivu', 'uusiksi'])) {
      state.awaiting = 'websiteScope';
      return 'Nykyisen sivuston uudistus onnistuu. Ensin katsotaan, mitä kannattaa säilyttää ja missä asiakaspolku, mobiilikäyttö, sisältö tai Google-näkyvyys kaipaa parannusta. Montako palvelua yritykselläsi on ja mikä nykyisessä sivustossa toimii huonoimmin?';
    }

    if (containsAny(text, ['uusi yritys', 'aloittava', 'vastaperustettu', 'ensimmaiset sivut'])) {
      state.awaiting = 'websiteScope';
      return 'Aloittavalle yritykselle Starter on usein hyvä alku: 1–3 sivua alkaen 490 € + alv. Jos palveluja on useita tai paikallinen Google-näkyvyys on tärkeä heti alusta, Business voi olla järkevämpi. Kuinka monta palvelua haluat esitellä?';
    }

    state.awaiting = 'websiteScope';
    return 'Autan rajaamaan sopivan verkkosivuratkaisun. Starter sopii yleensä 1–3 sivun selkeään yrityssivustoon, kun taas Business sopii 4–8 sivuun, useisiin palveluihin ja vahvempaan paikalliseen SEO:on. Onko kyse kokonaan uudesta sivustosta vai nykyisen uudistamisesta?';
  };

  const chatbotReply = text => {
    state.lastService = 'chatbot';
    if (containsAny(text, ['tallenta', 'tietosuoja', 'gdpr', 'yksityisyys', 'data'])) {
      return 'Tämä demo toimii suoraan selaimessa eikä lähetä tai tallenna keskustelua palvelimelle. Asiakkaalle toteutettavan chatbotin tietolähteet, mahdollinen keskusteluloki ja tietosuojaratkaisu määritellään erikseen käyttötarkoituksen mukaan.';
    }
    if (containsAny(text, ['oppi', 'koulute', 'tieto', 'sisalto', 'vastaukset'])) {
      return 'Chatbot vastaa yrityksen hyväksytystä sisällöstä, kuten palvelukuvauksista, hinnoista, toimintatavoista ja usein kysytyistä kysymyksistä. Tavoite on, ettei se keksi asioita, vaan ohjaa ihmisen yhteydenottoon silloin, kun varmaa vastausta ei ole.';
    }
    return 'AI-chatbot voi vastata usein kysyttyihin kysymyksiin, ehdottaa asiakkaalle oikeaa palvelua ja ohjata yhteydenottoon myös työajan ulkopuolella. Se rakennetaan yrityksesi hyväksytyn sisällön ja palvelupolun ympärille. Mitä kysymyksiä asiakkaasi toistavat eniten?';
  };

  const automationReply = text => {
    state.lastService = 'automation';
    state.awaiting = 'automationScope';

    if (containsAny(text, ['tarjouspyynt', 'tarjous'])) {
      return 'Tarjouspyyntöjen käsittelyä voidaan automatisoida esimerkiksi luokittelemalla pyyntö, lähettämällä asiakkaalle kuittaus ja ohjaamalla tiedot oikealle henkilölle tai järjestelmään. Seuraava olennainen tieto on, mistä tarjouspyynnöt nyt tulevat: sähköpostista, lomakkeelta vai useasta kanavasta?';
    }
    if (containsAny(text, ['liidi', 'crm'])) {
      return 'Liidiautomaatio voi siirtää verkkosivun yhteydenotot CRM:ään, täydentää perustiedot, lähettää kuittauksen ja muistuttaa jatkotoimesta. Ratkaisu riippuu käytössä olevasta CRM:stä ja siitä, mitä liidille tehdään vastaanoton jälkeen.';
    }
    if (containsAny(text, ['raport', 'excel', 'taulukko'])) {
      return 'Raportointia voidaan automatisoida keräämällä tiedot eri lähteistä yhteen selkeäksi yhteenvedoksi. Aloitus onnistuu parhaiten yhdestä raportista: mistä tiedot tulevat nyt ja kuinka usein raportti tehdään?';
    }
    return 'Hyvä automaatiokohde on toistuva, sääntöpohjainen työvaihe, jossa tietoa kopioidaan, luokitellaan tai välitetään eteenpäin. Esimerkkejä ovat tarjouspyynnöt, liidien käsittely, kuittausviestit ja raportointi. Mikä tehtävä toistuu yrityksessäsi viikoittain lähes samanlaisena?';
  };

  const seoReply = text => {
    state.lastService = 'seo';
    if (containsAny(text, ['miksi', 'ei nay', 'ei loydy', 'huono sijoitus', 'sijoitus'])) {
      return 'Heikko Google-näkyvyys voi johtua esimerkiksi liian yleisestä tai vähäisestä sisällöstä, puuttuvista palvelusivuista, teknisistä ongelmista, hitaudesta tai vähäisestä paikallisesta luottamuksesta. Ensimmäinen askel on tarkistaa, millä hakusanoilla sivu jo näkyy ja vastaavatko sivut oikeita hakuaikeita.';
    }
    if (containsAny(text, ['paikallinen', 'jyvaskyla', 'laukaa', 'kunta', 'alue'])) {
      return 'Paikallisessa SEO:ssa rakennetaan selkeät palvelusivut, kerrotaan aidosti missä yritys palvelee ja viimeistellään Google Business Profile, tekninen rakenne sekä mittaus. Tärkein kysymys on: millä palvelulla ja millä paikkakunnalla haluat löytyä?';
    }
    return 'Google-näkyvyys rakentuu teknisesti toimivasta sivustosta, selkeistä palvelusivuista, hakua vastaavasta sisällöstä ja paikallisesta luottamuksesta. Kerro tärkein palvelusi ja alueesi, niin voin ehdottaa ensimmäistä SEO-toimenpidettä.';
  };

  const ecommerceReply = text => {
    state.lastService = 'ecommerce';
    if (containsAny(text, ['palvelu', 'ajanvaraus', 'varaus'])) {
      return 'Myös palveluja voidaan myydä verkossa. Ratkaisu voi olla verkkokauppa, varausjärjestelmä tai kevyt maksullinen tilauspolku sen mukaan, tarvitseeko asiakkaan valita aika, paketti vai yksittäinen palvelu.';
    }
    return 'Hyvä verkkokauppa tekee tuotteen löytämisestä, hyödyn ymmärtämisestä ja ostamisesta helppoa myös mobiilissa. Toteutuksen laajuuteen vaikuttavat tuotteiden määrä, maksutavat, toimitukset ja integraatiot. Kuinka monta tuotetta tai palvelua kauppaan tulisi?';
  };

  const maintenanceReply = () => {
    state.lastService = 'maintenance';
    return 'Ylläpito voi sisältää sisältöpäivitykset, teknisen ylläpidon, pienet muutokset, toimivuuden seurannan ja tuen. Premium alkaa 79 € / kk + alv ja on vapaaehtoinen — verkkosivuprojektiin ei liity pakollista Nordhashin vuosittaista ylläpitosopimusta.';
  };

  const recommendationReply = text => {
    if (containsAny(text, ['uusi yritys', 'aloittava yritys', 'ei sivuja', 'ei verkkosivuja'])) {
      state.lastService = 'website';
      state.awaiting = 'websiteScope';
      return 'Aloittaisin selkeästä verkkosivusta, jossa palvelu, hyödyt ja yhteydenotto löytyvät heti. Starter sopii pieneen 1–3 sivun tarpeeseen, Business taas useisiin palveluihin ja vahvempaan paikalliseen Google-näkyvyyteen. Montako palvelua yritykselläsi on?';
    }
    if (containsAny(text, ['enemman asiakkaita', 'lisaa asiakkaita', 'myyntia', 'yhteydenottoja', 'liideja'])) {
      return 'Lisää yhteydenottoja varten tarkistaisin ensin kolme asiaa: löytävätkö oikeat ihmiset sivulle, ymmärtävätkö he palvelun nopeasti ja onko yhteydenotto helppo. Usein paras kokonaisuus on selkeä palvelusivu + paikallinen SEO + vahva yhteydenottopolku. Onko suurin ongelma vähäinen liikenne vai se, etteivät kävijät ota yhteyttä?';
    }
    if (containsAny(text, ['aikaa', 'kasityo', 'toistuva', 'manuaalinen', 'kopioi'])) {
      return automationReply(text);
    }
    return '';
  };

  const fallbackReply = text => {
    const recommendation = recommendationReply(text);
    if (recommendation) return recommendation;

    if (state.awaiting === 'websiteScope') {
      return 'Voin rajata verkkosivupaketin, kun tiedän kaksi asiaa: montako palvelua sivustolla esitellään ja haluatko panostaa paikalliseen Google-näkyvyyteen. Voit vastata esimerkiksi: “5 sivua ja näkyvyys Jyväskylässä”.';
    }
    if (state.awaiting === 'automationScope') {
      return 'Kuvaile työvaihe mahdollisimman käytännöllisesti: mitä tietoa tulee sisään, mitä sille tehdään käsin ja mihin lopputulos siirretään. Sen perusteella voidaan arvioida, kannattaako se automatisoida.';
    }
    return 'En halua arvata väärin. Tarkoitatko verkkosivuja, Google-näkyvyyttä, AI-chatbotia, automaatiota, verkkokauppaa vai ylläpitoa? Voit myös kertoa tavoitteen omin sanoin, esimerkiksi “haluan enemmän tarjouspyyntöjä”.';
  };

  const reply = message => {
    const clean = normalize(message);
    const services = serviceFromText(clean);
    const firstService = services[0];
    if (firstService) state.lastService = firstService;
    state.lastQuestion = clean;

    const hasEmail = /\b[\w.+-]+@[\w.-]+\.[a-z]{2,}\b/i.test(message);
    const hasPhone = /(?:\+358|0)[\s-]?(?:\d[\s-]?){6,10}/.test(message);
    if (hasEmail || hasPhone) {
      addMessage(`Kiitos. Tämä selainversio ei lähetä tai tallenna yhteystietoja. Lähetä yhteydenotto suoraan osoitteeseen ${CONTACT_EMAIL} tai soita numeroon ${CONTACT_PHONE}.`, 'agent-bot');
      return;
    }

    if (!clean) return;

    if (containsAny(clean, ['hei', 'heippa', 'moi', 'moro', 'terve', 'paivaa']) && clean.split(' ').length <= 4) {
      addMessage('Hei! Kerro tärkein tavoitteesi: tarvitsetko uudet verkkosivut, enemmän näkyvyyttä Googlessa vai haluatko vähentää käsityötä automaatiolla?', 'agent-bot');
      return;
    }

    if (containsAny(clean, ['kiitos', 'selva', 'hyva juttu', 'ymmarsin'])) {
      addMessage('Ole hyvä! Voit jatkaa kertomalla yrityksesi tärkeimmän tavoitteen tai pyytää suoraan hinta-arviota, suositusta tai yhteystiedot.', 'agent-bot');
      return;
    }

    if (state.awaiting === 'automationScope' && containsAny(clean, ['tarjouspyynt', 'liidi', 'crm', 'raport', 'excel', 'sahkoposti', 'lomake', 'kasittely', 'kopiointi'])) {
      addMessage(automationReply(clean), 'agent-bot');
      return;
    }

    if (state.awaiting === 'websiteScope' && (/\b([1-9]|1[0-9])\s*(?:sivu|sivua|alasivu)/.test(clean) || containsAny(clean, ['uusi sivu', 'uudistus', 'nykyinen sivu', 'palvelua']))) {
      addMessage(websiteReply(clean), 'agent-bot');
      return;
    }

    if (!services.length && state.lastService === 'chatbot' && containsAny(clean, ['tallenta', 'tietosuoja', 'gdpr', 'yksityisyys', 'data', 'oppi', 'koulute', 'sisalto', 'vastaukset'])) {
      addMessage(chatbotReply(clean), 'agent-bot');
      return;
    }

    if (containsAny(clean, ['ota yhteytta', 'ottaa yhteytta', 'yhteystiedot', 'sahkoposti', 'puhelinnumero', 'soittaa', 'soitto', 'haluan tarjouksen', 'pyyda tarjous', 'varaa kartoitus', 'haluan keskustella'])) {
      addMessage(contactReply(), 'agent-bot');
      return;
    }

    if (containsAny(clean, ['vuosimaksu', 'pakollinen sopimus', 'sitoutuminen', 'vuosisopimus'])) {
      addMessage('Verkkosivujen toteutukseen ei liity pakollista Nordhashin vuosittaista ylläpitosopimusta. Verkkotunnuksesta ja mahdollisesta palvelintilasta voi syntyä pieni vuosikustannus palveluntarjoajalle. Nordhashin ylläpito on erillinen ja vapaaehtoinen palvelu.', 'agent-bot');
      return;
    }

    if (containsAny(clean, ['hinta', 'maksaa', 'paljonko', 'kustannus', 'hinnoittelu', 'budjetti'])) {
      addMessage(priceReply(services), 'agent-bot');
      return;
    }

    if (containsAny(clean, ['kauanko', 'kuinka kauan', 'aikataulu', 'valmistuu', 'toimitusaika'])) {
      addMessage('Tyypillinen verkkosivustoprojekti valmistuu noin 4–8 viikossa. Tarkka aikataulu riippuu sivumäärästä, sisällöistä ja tarvittavista ominaisuuksista. Projekti etenee selkeillä välitavoitteilla.', 'agent-bot');
      return;
    }

    if (containsAny(clean, ['voinko paivittaa', 'paivittaa sivu', 'itse paivittaa', 'oma hallinta', 'omistanko', 'saan tiedostot', 'luovutetaan'])) {
      addMessage('Kyllä. Toteutustapa ja julkaisu sovitaan projektin alussa, ja asiakkaalle voidaan luovuttaa sivuston tiedostot sekä pääsy sovittuihin palveluihin. Voit päivittää sivustoa itse tai käyttää vapaaehtoista ylläpitopalvelua.', 'agent-bot');
      return;
    }

    if (containsAny(clean, ['koko suomi', 'etana', 'muualla', 'paikkakunta', 'missä toimitte', 'missa toimitte', 'alueella'])) {
      addMessage('Nordhash toimii Jyväskylän ja Laukaan alueella sekä toteuttaa projektit etänä koko Suomeen. Suunnittelu, luonnosten läpikäynti ja muutokset voidaan hoitaa verkkopalavereilla.', 'agent-bot');
      return;
    }

    if (containsAny(clean, ['prosessi', 'miten alkaa', 'miten projekti', 'aloitus', 'vaiheet'])) {
      addMessage('Projekti alkaa tavoitteen ja laajuuden kartoituksella. Sen jälkeen sovitaan sisältörakenne ja toteutustapa, tehdään luonnos, rakennetaan ja testataan sivusto sekä julkaistaan se. Saat selkeän tarjouksen ennen työn aloittamista.', 'agent-bot');
      return;
    }

    if (containsAny(clean, ['referenssi', 'esimerkki', 'aiempi tyo', 'portfolio'])) {
      addMessage('Yksi julkaistu referenssi on Leppäveden Siivouspalvelun sivusto. Siinä toteutettiin mobiiliystävällinen rakenne, palvelukohtaiset alasivut, selkeä tarjouspyyntöpolku ja paikallisen näkyvyyden SEO-perusta. Referenssit löytyvät Nordhashin etusivulta.', 'agent-bot');
      return;
    }

    if (services.includes('website') && services.includes('seo')) {
      state.lastService = 'website';
      state.awaiting = 'websiteScope';
      addMessage('Verkkosivut ja SEO kannattaa suunnitella yhtenä kokonaisuutena. Business-paketti on tähän yleensä vahvin lähtökohta: 4–8 sivua, palvelukohtaiset alasivut, tekstien viimeistely, paikallinen SEO, Analytics ja Search Console alkaen 990 € + alv. Millä palvelulla ja alueella haluat erityisesti löytyä?', 'agent-bot');
      return;
    }

    if (services.includes('website') && services.includes('chatbot')) {
      state.lastService = 'website';
      addMessage('Verkkosivut ja chatbot voidaan toteuttaa samaan kokonaisuuteen. Ensin rakennetaan selkeä palvelurakenne, jonka hyväksytystä sisällöstä chatbot vastaa ja ohjaa asiakkaan oikeaan palveluun. Verkkosivut alkavat 490 € + alv ja chatbotin perusratkaisu sisältyy Premium-ylläpitoon alkaen 79 € / kk + alv.', 'agent-bot');
      return;
    }

    if (services.includes('website') || (state.lastService === 'website' && state.awaiting === 'websiteScope')) {
      addMessage(websiteReply(clean), 'agent-bot');
      return;
    }
    if (services.includes('chatbot')) {
      addMessage(chatbotReply(clean), 'agent-bot');
      return;
    }
    if (services.includes('automation')) {
      addMessage(automationReply(clean), 'agent-bot');
      return;
    }
    if (services.includes('seo')) {
      addMessage(seoReply(clean), 'agent-bot');
      return;
    }
    if (services.includes('ecommerce')) {
      addMessage(ecommerceReply(clean), 'agent-bot');
      return;
    }
    if (services.includes('maintenance')) {
      addMessage(maintenanceReply(), 'agent-bot');
      return;
    }

    addMessage(fallbackReply(clean), 'agent-bot');
  };

  const send = message => {
    const value = message.trim();
    if (!value) return;
    addMessage(value, 'agent-user');
    input.value = '';
    setTimeout(() => reply(value), 250);
  };

  form.addEventListener('submit', event => {
    event.preventDefault();
    send(input.value);
  });

  document.querySelectorAll('.agent-suggestions button').forEach(button => {
    button.addEventListener('click', () => send(button.textContent));
  });
});
