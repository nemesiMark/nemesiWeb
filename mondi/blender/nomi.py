# Mondi — i nomi in 3D sopra i pianeti (dalla 3.58): lettere maiuscole in Inter Tight ExtraBold, estruse e con lo
# spigolo smussato, fatte in Blender e salvate in un file binario compatto (mondi/nomi.bin) che mondi/mondi.js legge.
#
# Prima serve il carattere statico (il file del sito, fonts/inter-tight.woff2, è variabile e compresso), con fontTools:
#   python3 -m venv /tmp/vf && /tmp/vf/bin/pip install fonttools brotli
#   /tmp/vf/bin/python -c "from fontTools.ttLib import TTFont; from fontTools.varLib import instancer; \
#     f = TTFont('fonts/inter-tight.woff2'); f.flavor = None; \
#     instancer.instantiateVariableFont(f, {'wght': 800}).save('mondi/sorgenti/inter-tight-800.ttf')"
# Poi (dalla cartella mondi/blender):
#   /Applications/Blender.app/Contents/MacOS/Blender -b --factory-startup --python nomi.py -- out=../nomi.bin
#
# Le lettere stanno nel piano XY con la facciata verso +Z (in pagina si girano verso la camera); la parte dietro
# non si vede mai e si toglie. Misure: altezza delle maiuscole = 1, centro della scritta in (0, 0, 0).
# Formato (little endian): 'NOMI', uint32 versione, uint32 quanti; per ogni nome:
#   uint8 lunghezza + id in utf-8 + riempimento a 4 byte, float32 min[3] e max[3] (scatola della scritta),
#   uint32 vertici, uint32 indici, posizioni uint16×3 (dentro la scatola), normali int8×3, riempimento a 4 byte,
#   indici uint16 (uint32 se i vertici sono più di 65535), riempimento a 4 byte.
import bpy, bmesh, math, os, struct, sys
import numpy as np

QUI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, QUI)
from comune import argomenti, svuota  # noqa

A = argomenti()
OUT = os.path.abspath(A.get('out', os.path.join(QUI, '..', 'nomi.bin')))
FONT = os.path.abspath(A.get('font', os.path.join(QUI, '..', 'sorgenti', 'inter-tight-800.ttf')))

NOMI = [('portfolio', 'PORTFOLIO'), ('studio', 'STUDIO'), ('tool', 'TOOL'), ('contatti', 'CONTATTI'), ('area', 'AREA RISERVATA'), ('bio', 'BIO')]
SPAZIO = 1.07        # spaziatura fra le lettere (1 = quella del carattere)
PROF = 0.085         # metà dello spessore delle lettere (dimensione del carattere = 1)
SMUSSO = 0.026       # spigolo smussato
SMUSSO_RIS = 3       # passi dello smusso
CURVE = 5            # passi per ogni curva delle lettere
LISCIO = 42          # sotto quest'angolo (gradi) le facce si raccordano: smusso arrotondato, curve lisce


def scritta(id_, testo, font):
    cu = bpy.data.curves.new(id_, 'FONT')
    cu.body = testo
    cu.font = font
    cu.size = 1.0
    cu.space_character = SPAZIO
    cu.align_x = 'CENTER'
    cu.align_y = 'BOTTOM_BASELINE'
    cu.fill_mode = 'BOTH'
    cu.extrude = PROF
    cu.bevel_depth = SMUSSO
    cu.bevel_resolution = SMUSSO_RIS
    cu.resolution_u = CURVE
    cu.offset = -SMUSSO * 0.85     # lo smusso non deve ingrossare le lettere
    ob = bpy.data.objects.new(id_, cu)
    bpy.context.scene.collection.objects.link(ob)
    dg = bpy.context.evaluated_depsgraph_get()
    me = bpy.data.meshes.new_from_object(ob.evaluated_get(dg))
    # triangoli, via la parte dietro (non si vede mai)
    bm = bmesh.new()
    bm.from_mesh(me)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-6)
    bm.normal_update()
    dietro = [f for f in bm.faces if f.normal.z < -0.2]
    bmesh.ops.delete(bm, geom=dietro, context='FACES')
    bmesh.ops.triangulate(bm, faces=bm.faces, quad_method='BEAUTY', ngon_method='BEAUTY')
    bm.to_mesh(me)
    bm.free()
    me.shade_smooth()
    me.set_sharp_from_angle(angle=math.radians(LISCIO))
    me.calc_loop_triangles()
    nv = len(me.vertices)
    co = np.empty(nv * 3, np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
    nl = len(me.loops)
    lv = np.empty(nl, np.int32); me.loops.foreach_get('vertex_index', lv)
    cn = np.empty(nl * 3, np.float32); me.corner_normals.foreach_get('vector', cn); cn = cn.reshape(-1, 3)
    nt = len(me.loop_triangles)
    tl = np.empty(nt * 3, np.int32); me.loop_triangles.foreach_get('loops', tl)
    # un vertice per ogni coppia (posizione, normale): spigoli vivi dove serve, lisci altrove
    nq = np.clip(np.round(cn * 127), -127, 127).astype(np.int8)
    chiave = np.concatenate([lv[:, None].astype(np.int64), nq.astype(np.int64)], axis=1)
    uniche, inv = np.unique(chiave, axis=0, return_inverse=True)
    inv = inv.reshape(-1)
    pos = co[uniche[:, 0]]
    nor = uniche[:, 1:].astype(np.int8)
    idx = inv[tl]
    bpy.data.objects.remove(ob, do_unlink=True)
    bpy.data.meshes.remove(me)
    # misure: maiuscole alte 1, centro in (0, 0, 0)
    mn, mx = pos.min(0), pos.max(0)
    alt = mx[1] - mn[1]
    pos = (pos - (mn + mx) / 2) / alt
    return pos.astype(np.float32), nor, idx.astype(np.int64)


def main():
    svuota()
    font = bpy.data.fonts.load(FONT)
    dati = bytearray(b'NOMI' + struct.pack('<II', 1, len(NOMI)))

    def allinea():                      # a 4 byte dall'inizio del file (così in pagina si leggono senza copiarli)
        dati.extend(b'\0' * ((-len(dati)) % 4))

    for id_, testo in NOMI:
        pos, nor, idx = scritta(id_, testo, font)
        mn, mx = pos.min(0), pos.max(0)
        q = np.round((pos - mn) / np.maximum(mx - mn, 1e-9) * 65535).astype(np.uint16)
        nome = id_.encode('utf-8')
        dati.extend(struct.pack('<B', len(nome)) + nome); allinea()
        dati.extend(struct.pack('<6f', *mn, *mx))
        dati.extend(struct.pack('<II', len(pos), len(idx)))
        dati.extend(q.tobytes())
        dati.extend(nor.tobytes()); allinea()
        dati.extend((idx.astype(np.uint16) if len(pos) <= 65535 else idx.astype(np.uint32)).tobytes()); allinea()
        print('%-10s %-16s %6d vertici %6d triangoli  larghezza %.3f  spessore %.3f' % (id_, testo, len(pos), len(idx) // 3, mx[0] - mn[0], mx[2] - mn[2]))
    with open(OUT, 'wb') as f:
        f.write(bytes(dati))
    print('salvato', OUT, len(dati), 'byte')


main()
