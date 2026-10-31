# Finnish Garage Simulator — projektisivusto

Suomenkielinen staattinen esittelysivusto pelille. Julkaisu: https://nordhash.fi/ (GitHub Pages, main-haaran juuri). Sivustolla korostetaan, että peli on kehityksessä eikä julkista demoa ole vielä saatavilla.

## Sisältö

- index.html: pelin idea, oikeat kehityskuvat, kehitystilanne, kysymykset ja yhteys.
- pelista.html: pelin suunta ja kehityksen rajat.
- ohjaimet.html: suunniteltu alusta ja vielä vahvistamattomat ohjain-/laitevaatimukset.
- Tietosuoja, käyttöehdot ja 404.
- Vanha fpv-rc-auto.html ohjaa pelistä kertovalle sivulle; vanhaa RC-palvelua ei enää markkinoida.

Ei demoa, pelilatausta, ennakkotilausta, maksamista, uutiskirjettä tai yhteydenottolomaketta. Yhteys tapahtuu nykyisellä sähköpostiosoitteella. Steam Early Access esitetään suunniteltuna julkaisusuuntana, ei vahvistettuna julkaisuna.

## Paikallinen esikatselu

Aja `python -m http.server 4173 --bind 127.0.0.1` repositorion juuressa ja avaa http://127.0.0.1:4173/ . Rakennusvaihetta tai npm-riippuvuuksia ei tarvita. Pääsisältö ja navigaatio toimivat myös ilman JavaScriptiä.

## Päivittäminen

Muuta HTML-tiedostoja, style.css:ää ja tarvittaessa script.js:ää. Säilytä CNAME, joka pitää nordhash.fi-verkkotunnuksen käytössä. Main-haaraan lähetetty muutos käynnistää nykyisen GitHub Pages -julkaisun. Julkaisupäivää, hintaa, kauppalinkkiä tai demoa ei saa esittää saatavana ennen vahvistusta.

Kuvien alkuperä ja versiot ovat assets/README.md:ssä. Kehityskuvat on merkitty sivustolla; ne eivät lupaa lopullista grafiikkatasoa. Kuvia päivittäessä päivitä myös Open Graph -kuva ja sen mitat metatiedoissa.

Sivustolla on canonical-osoitteet, metakuvaukset, Open Graph -tiedot, WebPage-rakenteinen tieto, robots.txt ja sitemap.xml. Sivukartassa ovat vain varsinaiset sisältösivut.

## Testaus

`python tests/check_html.py` tarkistaa paikalliset linkit, ankkurit, kuvien vaihtoehtotekstit ja sivujen perustiedot. `npm ci` ja `npx playwright install chromium` asentavat vain kehittäjän testityökalut. `npm test` tarkistaa etusivun, alasivut, 390/320 px mobiilivalikot, JavaScriptittömän navigaation ja kuvakaappaukset. CI ajaa samat testit GitHubissa.

## Analytiikka 25.10.2026

Google Analytics 4 käyttää tunnusta G-F93778VN28. analytics.js sisältää käyttäjän Google-tagin ja lataa sen kaikille kuudelle varsinaiselle sivulle vasta analytiikan hyväksymisen jälkeen (basic consent mode). Vanhasta RC-osoitteesta ohjataan varsinaiselle sivulle ennen analytiikkaa. Hylkäys, puuttuva valinta ja JavaScriptitön käyttö eivät lataa Google-tagia. Valinta muistetaan 180 päivää; sivun alareunan Evästeasetukset avaa valinnan uudelleen. Peruuttaminen poistaa _ga-evästeet ja lataa sivun ilman tagia. Mainosten suostumukset pysyvät estettyinä.

Omistajan Analytics-tilin raportteja, tietojen säilytysasetuksia tai Google-tilin asetuksia ei muutettu. Tarkista ne Analyticsin hallinnassa. Testit varmistavat latausportin ja tunnisteen; raporttien kertymistä ei voi vahvistaa ilman Analytics-tilin näkymää. Toteutuksen lähde: https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic .

## Kuvat 31.10.2026

- Uudet 0.31-version oikeat pelikuvat: uudelleen mallinnetut autot ja konehuone. Pääkuva ja jakokuva näyttävät Korpin. Alkuperät: assets/screenshots-031.json.

## Kuvat ja SEO 26.10.2026

- Kahdeksan 0.20-version oikeaa pelikuvaa; responsive WebP 480/800/1280 px, progressiivinen JPEG-varakuva, mitat, kuvailevat vaihtoehtotekstit, etusivun pääkuvan korkea latausprioriteetti ja muiden kuvien viivästetty lataus.
- Etusivun kuusi kehityskuvaa, uusi `kehitys-0-20.html` ja täysi englanninkielinen `english.html`. Kielivastineet linkitetään molempiin suuntiin hreflang-merkinnöillä ja näkyvillä kielilinkeillä.
- Viisi erilaista indeksoitavaa sivuotsikkoa ja kuvausta, canonical-osoitteet, päivitetyt Open Graph / Twitter -kuvat, WebSite / Organization / WebPage / VideoGame / ImageObject sekä sisältösivujen murupolut. Ei keksittyjä arvosteluja, hintaa, myyntitarjousta tai julkaisupäivää.
- Sitemap sisältää viisi varsinaista sisältösivua, niiden todellisen muokkauspäivän ja kuvasivukartan. `robots.txt` linkittää sen. Lakisivujen, virhesivun ja vanhan ohjausosoitteen indeksointilinja säilyy.
- Analytiikan suostumus toimii nyt myös englanniksi. Mittaustunnus ja suostumuslogiikka säilyvät.

Toteutuksessa käytetyt ensisijaiset SEO-ohjeet: [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide) ja [Google Image SEO](https://developers.google.com/search/docs/appearance/google-images). Hakutulossijoitusta, indeksointia tai rikastettua hakutulosta ei voi taata. Search Consolen verkkotunnuksen vahvistusta tai omistajan tilin asetuksia ei muutettu. Sivukartan voi ilmoittaa omistajan Search Consolessa: `https://nordhash.fi/sitemap.xml`.

Selaintestipalvelin: `node tests/serve.cjs` (vain paikallinen esikatselu). Tuotantosivusto on edelleen staattinen GitHub Pages -julkaisu ilman Node-palvelinta.

Paikallinen tarkistus 26.10.2026: HTML-/linkki-/SEO-tarkistukset PASS ja 18/18 Playwright-testiä PASS (1440, 390 ja 320 px). Työpöytä- ja mobiilikuvakaappaukset tarkastettu. Ensimmäiset ajot eivät käynnistyneet paikallisen Python-palvelimen ja puuttuvan Playwright-selaimen vuoksi; lopullinen ajo käytti hiljaista Node-esikatselinta ja projektin lukittua selainta. Search Console -tiliä ei käsitelty.
