# Mondi (pagina di prova) — strumenti comuni per gli script di Blender.
# Le texture si «cuociono» (bake) su una sfera con le stesse UV di THREE.SphereGeometry,
# così in pagina si appoggiano sulla sfera di Three.js senza conversioni.
# Assi: Three (x, y, z) con y in alto  →  Blender (x, -z, y) con z in alto.
import bpy, math, os, sys
import numpy as np


def argomenti():
    argv = sys.argv
    args = argv[argv.index('--') + 1:] if '--' in argv else []
    d = {}
    for a in args:
        if '=' in a:
            k, v = a.split('=', 1)
            d[k] = v
    return d


def svuota():
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for m in list(bpy.data.materials):
        bpy.data.materials.remove(m)
    for i in list(bpy.data.images):
        bpy.data.images.remove(i)


def cycles(campioni=4, gpu=True):
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    sc.cycles.samples = campioni
    try:
        sc.cycles.use_denoising = False
    except Exception:
        pass
    sc.cycles.device = 'CPU'
    if gpu:
        try:
            prefs = bpy.context.preferences.addons['cycles'].preferences
            prefs.compute_device_type = 'METAL'
            prefs.get_devices()
            ok = False
            for dev in prefs.devices:
                dev.use = True
                ok = ok or dev.type == 'METAL'
            if ok:
                sc.cycles.device = 'GPU'
        except Exception as e:
            print('GPU non disponibile:', e)
    print('Cycles su', sc.cycles.device)
    return sc


def sfera_three(nome, W=512, H=256, r=1.0):
    """Sfera a meridiani e paralleli identica a THREE.SphereGeometry(r, W, H): stessi vertici, stesse UV."""
    verts, uvs = [], []
    for iy in range(H + 1):
        v = iy / H
        th = v * math.pi
        for ix in range(W + 1):
            u = ix / W
            ph = u * 2 * math.pi
            x3 = -r * math.cos(ph) * math.sin(th)
            y3 = r * math.cos(th)
            z3 = r * math.sin(ph) * math.sin(th)
            verts.append((x3, -z3, y3))
            uvs.append((u, 1 - v))
    faces = []
    for iy in range(H):
        for ix in range(W):
            a = iy * (W + 1) + ix + 1
            b = iy * (W + 1) + ix
            c = (iy + 1) * (W + 1) + ix
            d = (iy + 1) * (W + 1) + ix + 1
            if iy == 0:
                faces.append((b, c, d))
            elif iy == H - 1:
                faces.append((a, b, d))
            else:
                faces.append((a, b, c, d))
    me = bpy.data.meshes.new(nome)
    me.from_pydata(verts, [], faces)
    me.update()
    uv = me.uv_layers.new(name='UVMap')
    loops_v = np.empty(len(me.loops), np.int32)
    me.loops.foreach_get('vertex_index', loops_v)
    uvs = np.array(uvs, np.float32)
    uv.data.foreach_set('uv', uvs[loops_v].ravel())
    try:
        me.shade_smooth()
    except Exception:
        me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    ob = bpy.data.objects.new(nome, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def srgb_lin(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_lin(h, a=1.0):
    h = h.lstrip('#')
    return (srgb_lin(int(h[0:2], 16)), srgb_lin(int(h[2:4], 16)), srgb_lin(int(h[4:6], 16)), a)


def lin_srgb(x):
    x = np.clip(x, 0, 1)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055)


class Nodi:
    """Piccolo aiuto per costruire i nodi del materiale da codice."""

    def __init__(self, mat):
        mat.use_nodes = True
        self.mat = mat
        self.nt = mat.node_tree
        self.nt.nodes.clear()
        self.out = self.nt.nodes.new('ShaderNodeOutputMaterial')
        tc = self.nt.nodes.new('ShaderNodeTexCoord')
        self.p = tc.outputs['Object']

    def n(self, tipo, **props):
        node = self.nt.nodes.new(tipo)
        for k, v in props.items():
            setattr(node, k, v)
        return node

    def link(self, a, b):
        self.nt.links.new(a, b)

    def _in(self, sock, v):
        if v is None:
            return
        if isinstance(v, (int, float)):
            sock.default_value = v
        elif isinstance(v, tuple):
            sock.default_value = v
        else:
            self.link(v, sock)

    # --- matematica ---
    def m(self, op, a, b=None, c=None, clamp=False):
        node = self.n('ShaderNodeMath', operation=op, use_clamp=clamp)
        for i, v in enumerate((a, b, c)):
            self._in(node.inputs[i], v)
        return node.outputs[0]

    def v(self, op, a, b=None, scala=None):
        node = self.n('ShaderNodeVectorMath', operation=op)
        self._in(node.inputs[0], a)
        if b is not None:
            self._in(node.inputs[1], b)
        if scala is not None:
            self._in(node.inputs['Scale'], scala)
        if op in ('LENGTH', 'DOT_PRODUCT', 'DISTANCE'):
            return node.outputs['Value']
        return node.outputs['Vector']

    def xyz(self, vec):
        node = self.n('ShaderNodeSeparateXYZ')
        self.link(vec, node.inputs[0])
        return node.outputs['X'], node.outputs['Y'], node.outputs['Z']

    def vettore(self, x, y, z):
        node = self.n('ShaderNodeCombineXYZ')
        self._in(node.inputs[0], x)
        self._in(node.inputs[1], y)
        self._in(node.inputs[2], z)
        return node.outputs[0]

    def smooth(self, a, b, x):
        node = self.n('ShaderNodeMapRange', interpolation_type='SMOOTHSTEP')
        self._in(node.inputs['Value'], x)
        self._in(node.inputs['From Min'], a)
        self._in(node.inputs['From Max'], b)
        return node.outputs['Result']

    def mappa(self, x, a, b, c=0.0, d=1.0, clamp=True):
        node = self.n('ShaderNodeMapRange', interpolation_type='LINEAR', clamp=clamp)
        self._in(node.inputs['Value'], x)
        self._in(node.inputs['From Min'], a)
        self._in(node.inputs['From Max'], b)
        self._in(node.inputs['To Min'], c)
        self._in(node.inputs['To Max'], d)
        return node.outputs['Result']

    # --- texture procedurali ---
    def rumore(self, vec, scala, dett=4.0, rug=0.5, lac=2.0, dist=0.0, tipo='FBM'):
        t = self.n('ShaderNodeTexNoise')
        t.noise_dimensions = '3D'
        try:
            t.noise_type = tipo
        except Exception:
            pass
        t.inputs['Scale'].default_value = scala
        t.inputs['Detail'].default_value = dett
        t.inputs['Roughness'].default_value = rug
        t.inputs['Lacunarity'].default_value = lac
        t.inputs['Distortion'].default_value = dist
        self.link(vec, t.inputs['Vector'])
        return t

    def voronoi(self, vec, scala, caratt='F1', casuale=1.0, metrica='EUCLIDEAN'):
        t = self.n('ShaderNodeTexVoronoi')
        t.voronoi_dimensions = '3D'
        t.feature = caratt
        try:
            t.distance = metrica
        except Exception:
            pass
        t.inputs['Scale'].default_value = scala
        t.inputs['Randomness'].default_value = casuale
        self.link(vec, t.inputs['Vector'])
        return t

    def rampa(self, fac, tappe, interp='LINEAR'):
        r = self.n('ShaderNodeValToRGB')
        cr = r.color_ramp
        cr.interpolation = interp
        els = cr.elements
        els[0].position = tappe[0][0]
        els[0].color = hex_lin(tappe[0][1])
        els[1].position = tappe[-1][0]
        els[1].color = hex_lin(tappe[-1][1])
        for pos, col in tappe[1:-1]:
            e = els.new(pos)
            e.color = hex_lin(col)
        self.link(fac, r.inputs['Fac'])
        return r.outputs['Color']

    def mix(self, fac, a, b, modo='MIX'):
        node = self.n('ShaderNodeMix', data_type='RGBA', blend_type=modo)
        ins = {s.identifier: s for s in node.inputs}
        self._in(ins.get('Factor_Float', node.inputs[0]), fac)
        self._in(ins['A_Color'], a)
        self._in(ins['B_Color'], b)
        outs = {s.identifier: s for s in node.outputs}
        return outs.get('Result_Color', node.outputs[2])

    def emissione(self, sock):
        e = self.n('ShaderNodeEmission')
        self._in(e.inputs['Color'], sock)
        e.inputs['Strength'].default_value = 1.0
        return e.outputs[0]

    def superficie(self, shader_out):
        for l in list(self.out.inputs['Surface'].links):
            self.nt.links.remove(l)
        self.link(shader_out, self.out.inputs['Surface'])

    def rilievo(self, altezza, forza=1.0, distanza=0.02):
        b = self.n('ShaderNodeBump')
        b.inputs['Strength'].default_value = forza
        b.inputs['Distance'].default_value = distanza
        self.link(altezza, b.inputs['Height'])
        d = self.n('ShaderNodeBsdfDiffuse')
        self.link(b.outputs['Normal'], d.inputs['Normal'])
        return d.outputs[0]


def cuoci(ob, N, tipo, W, H, shader=None):
    """Cuoce sull'immagine (float, lineare) e restituisce i pixel H×W×4 (riga 0 = in basso)."""
    if shader is not None:
        N.superficie(shader)
    img = bpy.data.images.new('bake', W, H, alpha=False, float_buffer=True)
    img.colorspace_settings.name = 'Non-Color'
    tex = N.nt.nodes.new('ShaderNodeTexImage')
    tex.image = img
    for nd in N.nt.nodes:
        nd.select = False
    tex.select = True
    N.nt.nodes.active = tex
    bpy.context.view_layer.objects.active = ob
    for o in bpy.context.scene.objects:
        o.select_set(o == ob)
    sc = bpy.context.scene
    sc.render.bake.margin = 6
    if tipo == 'NORMAL':
        bpy.ops.object.bake(type='NORMAL', normal_space='OBJECT', normal_r='POS_X', normal_g='POS_Y', normal_b='POS_Z', margin=6, use_clear=True)
    else:
        bpy.ops.object.bake(type='EMIT', margin=6, use_clear=True)
    px = np.empty(W * H * 4, np.float32)
    img.pixels.foreach_get(px)
    N.nt.nodes.remove(tex)
    bpy.data.images.remove(img)
    return px.reshape(H, W, 4)


def salva_png(px, percorso, srgb=False, grigio=False):
    """px: H×W×(3|4) float lineari, riga 0 in basso (come Blender). Scrive un PNG a 8 bit."""
    H, W = px.shape[:2]
    rgb = px[..., :3].astype(np.float32)
    if srgb:
        rgb = lin_srgb(rgb)
    rgb = np.clip(rgb, 0, 1)
    if grigio:
        g = rgb[..., :1]
        rgb = np.concatenate([g, g, g], axis=2)
    out = np.concatenate([rgb, np.ones((H, W, 1), np.float32)], axis=2)
    img = bpy.data.images.new('salva', W, H, alpha=False, float_buffer=False)
    img.colorspace_settings.name = 'Non-Color'
    img.pixels.foreach_set(out.ravel())
    img.filepath_raw = percorso
    img.file_format = 'PNG'
    img.save()
    bpy.data.images.remove(img)
    print('salvato', percorso)
