"""Re-creates the gallery JPGs in public/images/gallery/ from the `gallery` entries in ../data/*.json.

    python research_notes/<topic>/tools/fetch-gallery.py           # only files that are missing
    python research_notes/<topic>/tools/fetch-gallery.py --force   # everything

Needs Python 3 + Pillow. Photos: Commons 1920 px thumbnail (or the original when smaller) -> 1600 px and
640 px (-sm) JPG, quality 82, progressive, no metadata. Videos: poster from Commons' video thumbnail
(1280 px, or 960 px for portrait clips) -> <breed>-video.jpg + -video-sm.jpg; the video itself stays remote.
Downloads run one at a time and back off on HTTP 429 (Commons rate limit).
"""
import json, sys, time, urllib.error, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None
HERE = Path(__file__).resolve().parent
DATA = HERE.parent / 'data'
PUBLIC = HERE.parents[2] / 'public'
UA = 'MaewCatalogue/1.0 (static brochure build; https://commons.wikimedia.org/wiki/Commons:Reuse)'
API = 'https://commons.wikimedia.org/w/api.php'
FORCE = '--force' in sys.argv
# Frame (seconds) used for a video poster when Commons' default frame doesn't show the cat well.
POSTER_SEEK = {'bengal': 42}


def http(url, tries=8):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': UA}), timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code == 429 or e.code >= 500:
                wait = e.headers.get('Retry-After')
                time.sleep(int(wait) if wait and wait.isdigit() else 5 * (i + 1))
                continue
            raise
        except urllib.error.URLError:
            time.sleep(5 * (i + 1))
    raise RuntimeError(f'gave up on {url}')


def api(**params):
    params.update(format='json', formatversion='2')
    return json.loads(http(API + '?' + urllib.parse.urlencode(params)))


def save(im, width, dest):
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(dest, 'JPEG', quality=82, optimize=True, progressive=True)


def to_rgb(im):
    im = ImageOps.exif_transpose(im)
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGB', im.size, 'white')
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert('RGB')


def main():
    tmp = HERE / '.download'
    tmp.mkdir(exist_ok=True)
    for path in sorted(DATA.glob('*.json')):
        if path.name == 'market.json':
            continue
        breed = json.loads(path.read_text(encoding='utf-8'))
        for g in breed.get('gallery', []):
            big, small = PUBLIC / g['src'], PUBLIC / g['srcSmall']
            if not FORCE and big.exists() and small.exists():
                continue
            title = urllib.parse.unquote(g['page'].split('/wiki/', 1)[1])
            if g['kind'] == 'video':
                info = api(action='query', titles=title, prop='videoinfo', viprop='url|size', viurlwidth=1280)
                vi = info['query']['pages'][0]['videoinfo'][0]
                width = 960 if vi['height'] > vi['width'] else 1280
                thumb = vi['thumburl'].split('?')[0].replace('/1280px--', f'/{width}px--')
                if breed['id'] in POSTER_SEEK:
                    thumb = thumb.replace(f'/{width}px--', f'/{width}px-seek={POSTER_SEEK[breed["id"]]}-')
                src, sizes = thumb, (1280, 640)
            else:
                info = api(action='query', titles=title, prop='imageinfo', iiprop='url|size', iiurlwidth=1920)
                ii = info['query']['pages'][0]['imageinfo'][0]
                src, sizes = (ii['thumburl'] if ii['width'] > 1920 else ii['url']), (1600, 640)
            raw = tmp / 'file'
            raw.write_bytes(http(src))
            with Image.open(raw) as im:
                im = to_rgb(im)
                big.parent.mkdir(parents=True, exist_ok=True)
                save(im, sizes[0], big)
                save(im, sizes[1], small)
            print('saved', g['src'])
            time.sleep(1.5)
    for f in tmp.iterdir():
        f.unlink()
    tmp.rmdir()


if __name__ == '__main__':
    main()
