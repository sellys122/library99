"""End-to-end browser QA. Requires Playwright + Chromium, not needed to play."""
from pathlib import Path
from playwright.sync_api import sync_playwright
import json
ROOT=Path(__file__).resolve().parents[1]
checks=[]
def check(name,condition):
    assert condition,name
    checks.append(name)
with sync_playwright() as pw:
    browser=pw.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
    page=browser.new_page(viewport={'width':1440,'height':960})
    errors=[]; page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto('http://127.0.0.1:8000',wait_until='networkidle')
    page.wait_for_function('!!window.libraryGame',timeout=30000)
    page.locator('#modal-actions button').first.click()
    check('ten shelves loaded',page.evaluate('libraryGame.layout.shelves.length===10'))
    def snapshot():return page.evaluate('JSON.parse(JSON.stringify(libraryGame.state))')
    def teleport(x,z):
        page.evaluate('([x,z])=>{libraryGame.close();libraryGame.state.player.x=x;libraryGame.state.player.z=z}',[x,z])
        page.wait_for_timeout(150)
    def e():
        page.keyboard.press('e');page.wait_for_timeout(80)
    def action(text):page.get_by_role('button',name=text,exact=True).click();page.wait_for_timeout(80)
    # Physical movement, cart follows and retains cargo.
    before=snapshot()['player'];page.keyboard.down('d');page.wait_for_timeout(900);page.keyboard.up('d');after=snapshot()['player']
    check('keyboard movement',abs(before['x']-after['x'])+abs(before['z']-after['z'])>.15)
    teleport(4.9,7.6);page.keyboard.press('c');check('cart attaches',snapshot()['cart']['attached'])
    cargo=[b['id'] for b in snapshot()['cart']['books']]
    before=snapshot()['cart'];page.keyboard.down('s');page.wait_for_timeout(1300);page.keyboard.up('s');after=snapshot()['cart']
    check('cart moves with books',abs(after['x']-before['x'])+abs(after['z']-before['z'])>.1 and cargo==[b['id'] for b in after['books']])
    page.keyboard.press('c');check('cart detaches',not snapshot()['cart']['attached'])
    # Direct positioning isolates interactions from pathfinding (tested separately).
    for day in range(1,6):
        if day==1:page.evaluate('libraryGame.populateDay()')
        check(f'day {day} begins',snapshot()['day']==day)
        # Collect scattered books, hand capacity respects limits.
        for b in snapshot()['floor']:
            teleport(b['x'],b['z']);e()
        check(f'day {day} floor books picked up',not snapshot()['floor'])
        # Book gets rejected on a wrong shelf, without disappearing.
        if day==1:
            b=snapshot()['hands'][0];wrong=page.evaluate('(cat)=>libraryGame.layout.shelves.find(s=>s.category!==(cat))',b['category'])
            teleport(wrong['x'],wrong['z']+1.35);before=snapshot();e();after=snapshot()
            check('wrong shelf preserves book and progress',before['hands']==after['hands'] and after['progress']['shelved']==0)
        # Use the computer's queue. Same conversation handlers as nearby visitors.
        page.evaluate('()=>{let s=libraryGame.state;s.elapsed=100;for(let n of s.npcs)if(n.mode!=="roam"){n.status=n.mode==="desk"?"waiting":"asking";n.x=n.mode==="desk"?-6:1;n.z=n.mode==="desk"?9.1:5;n.path=[]}libraryGame.renderUI()}')
        teleport(-6,9.05)
        for n in snapshot()['npcs']:
            if n['kind']=='roam':continue
            if n['mode']=='desk':
                page.evaluate('libraryGame.computerMenu()')
                label=n['name']+' · '+{'question':'서가 문의','loan':'대출','return':'반납','issue':'문제 접수'}[n['kind']]+' 처리'
                action(label)
            else:page.evaluate('(id)=>libraryGame.talk(libraryGame.state.npcs.find(n=>n.id===id))',n['id'])
            if n['kind']=='question':
                if day==1 and n['mode']=='approach':
                    page.locator('#modal-actions button').filter(has_text='서가를 안내한다').first.click()
                    if page.locator('#modal').evaluate('(d)=>d.open'):
                        check('incorrect answer does not dismiss patron',not next(x for x in snapshot()['npcs'] if x['id']==n['id'])['served'])
                    else:raise AssertionError('Wrong-answer fixture accidentally chose correct answer')
                cat=n['category'];code=str(cat*100).zfill(3)
                page.locator('#modal-actions button').filter(has_text=code+'번대').click()
            elif n['kind']=='loan':action('회원증 확인하고 책 대출 처리')
            elif n['kind']=='return':action('바코드를 스캔하고 반납 처리')
            else:action('문제를 접수하고 확인하겠다고 안내')
            check(f'day {day} {n["kind"]} resolved',next(x for x in snapshot()['npcs'] if x['id']==n['id'])['served'])
        ticket=snapshot()['ticket']
        if ticket['location']=='computer':
            teleport(-6,9.05);page.evaluate('libraryGame.computerMenu()');action('프린터 연결 확인 → 대기열 초기화 → 시험 인쇄')
        else:
            teleport(7.3,8.2);page.evaluate('libraryGame.machineMenu()');action('기기 정지 → 끼인 종이 제거 → 재시작')
        check(f'day {day} issue repaired',snapshot()['ticket'] is None and snapshot()['progress']['fixed']==1)
        # Shelve held books first, then cart stock, then returned books.
        def shelve_hands():
            for b in list(snapshot()['hands']):
                page.evaluate('(id)=>document.querySelectorAll(".book-slot").forEach(el=>{if(el.textContent.includes(id))el.click()})',b['title'])
                s=page.evaluate('(cat)=>libraryGame.layout.shelves.find(s=>s.category===cat)',b['category'])
                teleport(s['x'],s['z']+1.35);e()
        shelve_hands()
        # Take preloaded cart books into hands using the inventory UI.
        while snapshot()['cart']['books']:
            cart=snapshot()['cart'];teleport(cart['x'],cart['z']+1)
            page.evaluate('libraryGame.inventoryMenu()')
            for b in list(snapshot()['cart']['books'])[:3]:action(b['code']+' · '+b['title']+' → 손에 들기')
            page.evaluate('libraryGame.close()');shelve_hands()
        while snapshot()['machine']:
            teleport(7.3,8.2);page.evaluate('libraryGame.machineMenu()');action('반납 도서 → 손에 수거')
            # Save one book for the exhibit once quota is met.
            goal=4+day
            while snapshot()['hands'] and snapshot()['progress']['shelved']<goal:
                b=snapshot()['hands'][0];page.locator('.book-slot').first.click();s=page.evaluate('(cat)=>libraryGame.layout.shelves.find(s=>s.category===cat)',b['category']);teleport(s['x'],s['z']+1.35);e()
            if snapshot()['hands'] and snapshot()['progress']['displayed']==0:
                teleport(-8,4.7);e();action('선택한 책 전시하기')
        # Extra stock may remain in hand, but all goals must be genuinely complete.
        check(f'day {day} all task goals complete',not page.locator('#finish-day').is_disabled())
        page.locator('#finish-day').click()
        if day<5:action('다음 날 출근하기')
        else:action('완료하고 도서관 둘러보기')
    check('five-day ending reached',snapshot()['ended'])
    saved=snapshot();page.reload(wait_until='networkidle');page.wait_for_function('!!window.libraryGame',timeout=30000)
    check('save and reload',snapshot()['score']==saved['score'] and snapshot()['ended'])
    page.evaluate('()=>{libraryGame.state.day=1;libraryGame.state.ended=false;libraryGame.populateDay()}');page.wait_for_timeout(300)
    page.screenshot(path=str(ROOT/'models'/'game-desktop.png'))
    # Single-file executable with no HTTP server or external requests.
    offline=browser.new_page(viewport={'width':390,'height':844});offline.on('pageerror',lambda e:errors.append(str(e)))
    offline.goto((ROOT/'dist'/'play.html').as_uri(),wait_until='load');offline.wait_for_function('!!window.libraryGame',timeout=30000)
    offline.locator('#modal-actions button').first.click();offline.wait_for_timeout(250)
    check('single-file offline play works',offline.evaluate('libraryGame.assets.library.meshes.length>0'))
    check('mobile does not overflow horizontally',offline.evaluate('document.documentElement.scrollWidth<=innerWidth'))
    offline.screenshot(path=str(ROOT/'models'/'game-mobile.png'),full_page=True)
    check('no browser runtime errors',not errors)
    (ROOT/'tests'/'qa-results.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'errors':errors},ensure_ascii=False,indent=2))
    print(json.dumps({'passed':len(checks),'errors':errors},ensure_ascii=False))
    browser.close()
