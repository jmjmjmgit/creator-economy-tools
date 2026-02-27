import json, urllib.request, urllib.error, concurrent.futures, ssl
import sys

def run():
    with open('data.js', encoding='utf-8') as f:
        content = f.read()

    start = content.index('const TOOLS = ') + len('const TOOLS = ')
    end = content.index(';\n\nconst ALL_CATEGORIES')
    tools = json.loads(content[start:end])

    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    def check(tool, attempt=1):
        url = tool['url']
        req = urllib.request.Request(
            url,
            headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'},
            method='HEAD' if attempt == 1 else 'GET'
        )
        try:
            with urllib.request.urlopen(req, timeout=12, context=ctx) as r:
                code = r.status
                return code, "OK"
        except urllib.error.HTTPError as e:
            # 404, 410, and Cloudflare host-down errors
            if e.code in (404, 410, 521, 522, 523, 525, 526, 530):
                if attempt == 1:
                    return check(tool, attempt=2)
                return e.code, "DEAD_HTTP"
            # Site returned 403/500/etc -> the server exists, maybe blocking us 
            return e.code, "ALIVE_HTTP"
        except urllib.error.URLError as e:
            reason = str(e.reason).lower()
            if 'nodename nor servname' in reason or 'name or service not known' in reason or 'getaddrinfo failed' in reason:
                return 0, "DEAD_DNS"
            if 'connection refused' in reason:
                return 0, "DEAD_REFUSED"
            if 'timed out' in reason or 'timeout' in reason:
                return 0, "ALIVE_TIMEOUT" # Slow responding site, better safe than sorry
            
            return 0, f"ALIVE_ERROR: {reason}"
        except Exception as e:
            return 0, f"ALIVE_EXCEPTION: {str(e)}"

    print("Checking", len(tools), "URLs for Graveyard...")
    results = []
    
    with concurrent.futures.ThreadPoolExecutor(max_workers=50) as ex:
        future_map = {ex.submit(check, t): t for t in tools}
        for i, future in enumerate(concurrent.futures.as_completed(future_map)):
            t = future_map[future]
            try:
                code, status = future.result()
            except Exception as e:
                code, status = 0, "ALIVE_EXCEPTION"
            results.append((t, code, status))
            if (i+1) % 50 == 0:
                print(f"[{i+1}/{len(tools)}] Finished...")

    dead_count = 0
    alive_count = 0
    dead_list = []
    for t, code, status in results:
        is_dead = status.startswith("DEAD_")
        if is_dead:
            t['dead'] = True
            dead_count += 1
            dead_list.append(f"{t['name']} ({status} - {code})")
        else:
            t['dead'] = False
            alive_count += 1

    print(f"\nDone! Identified {dead_count} dead tools, {alive_count} alive tools.")
    print("Recent deaths:", dead_list[:20])

    # Re-assemble data.js
    all_cats_start = content.index('const ALL_CATEGORIES = ') + len('const ALL_CATEGORIES = ')
    all_cats_end = content.rindex(';')
    all_cats = json.loads(content[all_cats_start:all_cats_end])

    js = "// Auto-generated — Creator Economy Tools by Janis Mjartans\n"
    js += f"const TOOLS = {json.dumps(tools, ensure_ascii=False, indent=2)};\n\n"
    js += f"const ALL_CATEGORIES = {json.dumps(all_cats, ensure_ascii=False, indent=2)};\n"

    with open('data.js', 'w', encoding='utf-8') as f:
        f.write(js)

if __name__ == '__main__':
    run()
