"""Optional local server. Run Python serve.py; standalone dist/play.html also works."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from pathlib import Path
import webbrowser
root=Path(__file__).resolve().parent
server=ThreadingHTTPServer(('127.0.0.1',8000),partial(SimpleHTTPRequestHandler,directory=str(root/'dist')))
print('작은 도서관의 5일: http://127.0.0.1:8000  (종료: Ctrl+C)')
webbrowser.open('http://127.0.0.1:8000')
try: server.serve_forever()
except KeyboardInterrupt: server.server_close()
