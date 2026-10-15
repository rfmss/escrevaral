"""Static phase-0 server. Bind explicitly to LAN only when testing a device."""
import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('--bind', default='127.0.0.1')
parser.add_argument('--port', type=int, default=8765)
args = parser.parse_args()
root = Path(__file__).resolve().parents[1]

class Handler(SimpleHTTPRequestHandler):
    extensions_map = dict(SimpleHTTPRequestHandler.extensions_map, **{'.manifest': 'text/cache-manifest'})

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

print('dict-ptbr static fixture on %s:%s' % (args.bind, args.port), flush=True)
ThreadingHTTPServer((args.bind, args.port), partial(Handler, directory=str(root))).serve_forever()
