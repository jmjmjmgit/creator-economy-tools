import csv, json, urllib.request, urllib.error, concurrent.futures, ssl

csv_path = "/Users/jamesmacintosh/Desktop/Creator Economy Tools by Janis Mjartans (1).csv"

tools = []
with open(csv_path, encoding='utf-8-sig') as f:
    reader = csv.DictReader(f)
    for row in reader:
        name = (row.get('Name') or '').strip()
        url  = (row.get('URL')  or '').strip()
        if not name or not url:
            continue
        if not url.startswith('http'):
            url = 'https://' + url
        tools.append({'name': name, 'url': url})

print(f"Checking {len(tools)} URLs with 40 workers...")

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

results = {'ok': [], 'broken': [], 'timeout': [], 'error': []}

def check(tool):
    try:
        req = urllib.request.Request(
            tool['url'],
            headers={'User-Agent': 'Mozilla/5.0 (compatible; URLChecker/1.0)'},
            method='HEAD'
        )
        with urllib.request.urlopen(req, timeout=8, context=ctx) as r:
            code = r.status
            if code < 400:
                return ('ok', tool['name'], tool['url'], code)
            return ('broken', tool['name'], tool['url'], code)
    except urllib.error.HTTPError as e:
        # 403/405/406/429 = server responded = site is alive
        if e.code in (403, 405, 406, 429):
            return ('ok', tool['name'], tool['url'], e.code)
        return ('broken', tool['name'], tool['url'], e.code)
    except urllib.error.URLError as e:
        reason = str(e.reason)
        if 'timed out' in reason.lower():
            return ('timeout', tool['name'], tool['url'], reason)
        return ('error', tool['name'], tool['url'], reason[:80])
    except Exception as e:
        return ('error', tool['name'], tool['url'], str(e)[:80])

with concurrent.futures.ThreadPoolExecutor(max_workers=40) as ex:
    for status, name, url, detail in ex.map(check, tools):
        results[status].append({'name': name, 'url': url, 'detail': str(detail)})

with open('/Users/jamesmacintosh/.gemini/antigravity/scratch/creator-economy-tools/url_results.json', 'w') as f:
    json.dump(results, f, indent=2)

print(f"\n✅ OK:      {len(results['ok'])}")
print(f"❌ Broken:  {len(results['broken'])}")
print(f"⏱  Timeout: {len(results['timeout'])}")
print(f"⚠️  Error:   {len(results['error'])}")

print("\n--- BROKEN (HTTP error) ---")
for r in sorted(results['broken'], key=lambda x: x['name']):
    print(f"  [{r['detail']}] {r['name']}  {r['url']}")

print("\n--- ERROR / DEAD ---")
for r in sorted(results['error'], key=lambda x: x['name'])[:60]:
    print(f"  {r['name']}  — {r['detail']}")
