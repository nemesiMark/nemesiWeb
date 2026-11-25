# Mondi (pagina di prova) — Terra: dalle mappe NASA (pubblico dominio, in ../sorgenti) ricava le luci delle città e la maschera del mare.
# Uso: Blender -b --factory-startup --python terra.py -- res=4096 out=../tex/png
import bpy, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comune import *  # noqa

A = argomenti()
RES = int(A.get('res', '4096'))
QUI = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.abspath(A.get('out', os.path.join(QUI, '..', 'tex', 'png')))
SRC = os.path.join(QUI, '..', 'sorgenti')
os.makedirs(OUT, exist_ok=True)


def carica(nome):
    im = bpy.data.images.load(os.path.join(SRC, nome))
    im.colorspace_settings.name = 'Non-Color'
    if im.size[0] != RES:
        im.scale(RES, RES // 2)
    W, H = im.size
    px = np.empty(W * H * 4, np.float32)
    im.pixels.foreach_get(px)
    return px.reshape(H, W, 4)

notte = carica('terra-notte-4096.jpg')
r, g, b = notte[..., 0], notte[..., 1], notte[..., 2]
luci = np.clip((np.minimum(r, g) - b * 0.55) * 1.7, 0, 1) ** 0.85
salva_png(np.dstack([luci, luci, luci]), os.path.join(OUT, 'terra-luci.png'))

giorno = carica('terra-giorno-4096.jpg')
r, g, b = giorno[..., 0], giorno[..., 1], giorno[..., 2]
x = b - np.maximum(r, g)
mare = np.clip((x - 0.03) / 0.09, 0, 1)
mare = mare * mare * (3 - 2 * mare)
salva_png(np.dstack([mare, mare, mare]), os.path.join(OUT, 'terra-mare.png'))
print('fatto terra')
