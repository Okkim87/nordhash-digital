from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json,re,xml.etree.ElementTree as ET
class Check(HTMLParser):
 def __init__(self):super().__init__();self.links=[];self.ids=[];self.h1=0;self.alt=[];self.text=[]
 def handle_starttag(self,t,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.append(a['id'])
  if t=='h1':self.h1+=1
  if t=='a' and 'href' in a:self.links.append(a['href'])
  if t=='img':assert a.get('alt'), 'Missing image alternative';self.links.append(a['src'])
  if t=='link' and a.get('rel') in ('stylesheet','icon'):self.links.append(a['href'])
  if t=='script' and a.get('src'):self.links.append(a['src'])
  if t=='source' and a.get('srcset'):self.links.extend(item.strip().split()[0] for item in a['srcset'].split(','))
 def handle_data(self,d):self.text.append(d)
docs={}
for p in Path('.').glob('*.html'):
 c=Check();c.feed(p.read_text(encoding='utf-8-sig'));assert c.h1==1,p;assert len(c.ids)==len(set(c.ids)),p
 assert not any(x in ''.join(c.text) for x in ['Nordhash RC','ajovuoroja','RC-autoa netin yli']),p
 docs[p.name]=c
for name,c in docs.items():
 for link in c.links:
  u=urlsplit(link)
  if u.scheme or u.netloc:continue
  target=(unquote(u.path).removeprefix('./') or 'index.html') if u.path else name
  if target=='/':target='index.html'
  if target.startswith('/'):target=target[1:]
  assert Path(target).is_file(),(name,link)
  if u.fragment:assert u.fragment in docs[target].ids,(name,link)
print(f'PASS: all {len(docs)} HTML documents, local links, anchors, image alternatives, IDs and old branding checks')

# SEO and truthful release-state checks for the public content pages.
indexable=['index.html','pelista.html','ohjaimet.html','english.html','kehitys-0-20.html']
titles=[]
for name in indexable:
 raw=Path(name).read_text(encoding='utf-8')
 title=re.search(r'<title>(.*?)</title>',raw).group(1);titles.append(title)
 url='https://nordhash.fi/'+('' if name=='index.html' else name)
 assert f'rel="canonical" href="{url}"' in raw,name
 assert 'name="robots" content="index,follow,max-image-preview:large"' in raw,name
 assert 'content="https://nordhash.fi/assets/finnish-garage-simulator-talli-020.jpg"' in raw,name
 graph=json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>',raw,re.S).group(1))['@graph']
 game=next(node for node in graph if node['@type']=='VideoGame')
 assert game['creativeWorkStatus']=='In development' and 'offers' not in game and 'aggregateRating' not in game,name
 assert '0.12' not in raw,name
assert len(set(titles))==len(indexable)
ns={'s':'http://www.sitemaps.org/schemas/sitemap/0.9','image':'http://www.google.com/schemas/sitemap-image/1.1'}
tree=ET.parse('sitemap.xml');urls=[e.text for e in tree.findall('s:url/s:loc',ns)]
assert set(urls)=={'https://nordhash.fi/'+('' if p=='index.html' else p) for p in indexable}
for e in tree.findall('.//image:loc',ns):assert Path(e.text.removeprefix('https://nordhash.fi/')).is_file(),e.text
for name in ['index.html','english.html']:
 raw=Path(name).read_text(encoding='utf-8');assert 'hreflang="fi" href="https://nordhash.fi/"' in raw and 'hreflang="en" href="https://nordhash.fi/english.html"' in raw
print('PASS: unique content titles, canonical/social metadata, truthful game schema, reciprocal languages, responsive image files and image sitemap')
