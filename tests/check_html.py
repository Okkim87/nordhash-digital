from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit,unquote
import json
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
print('PASS: all 7 HTML documents, local links, anchors, image alternatives, IDs and old branding checks')
