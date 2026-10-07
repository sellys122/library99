"""Create a double-click, offline playable HTML and a distributable ZIP."""
from pathlib import Path
import base64, json, re, zipfile
root=Path(__file__).resolve().parents[1]
dist=root/'dist'
assets={f'assets/{p.name}':base64.b64encode(p.read_bytes()).decode() for p in (dist/'assets').iterdir() if p.suffix in ['.glb','.json']}
code=[]
for name in ['engine.js','core.js','game.js']:
    js=(dist/name).read_text()
    js=re.sub(r'^import .*?;\s*','',js,flags=re.M)
    js=re.sub(r'\bexport\s+(?=const |function |async function |class )','',js)
    code.append(js)
html=(dist/'index.html').read_text()
html=html.replace('<link rel="stylesheet" href="style.css">','<style>'+(dist/'style.css').read_text()+'</style>')
script='window.LIBRARY_EMBEDDED='+json.dumps(assets,separators=(',',':'))+';\n'+'\n'.join(code)
html=html.replace('<script type="module" src="game.js"></script>','<script type="module">'+script+'</script>')
# Home button should reopen the standalone file as well.
html=html.replace('href="./"','href="play.html"')
(dist/'play.html').write_text(html)
out=root.parent/'library99.zip'
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED,compresslevel=9) as z:
    for p in root.rglob('*'):
        if p.is_file() and '.git' not in p.parts and p.suffix not in ['.blend1','.pyc'] and 'node_modules' not in p.parts:
            z.write(p,Path('library99')/p.relative_to(root))
print(json.dumps({'standalone':str(dist/'play.html'),'zip':str(out),'zip_bytes':out.stat().st_size}))
