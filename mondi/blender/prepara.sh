#!/bin/zsh
# Mondi (la home dalla 3.57) — dai PNG cotti in Blender (tex/png) ai JPG usati dalla pagina:
# tex/<nome>.jpg (computer) e tex/m/<nome>.jpg (telefono, metà lato).
# Qualità (dalla 3.57, per alleggerire di circa un quinto senza differenze visibili): colori 76, normali 82.
# A lato pieno servono solo le texture che il computer grande carica intere (quelle fuori da PICCOLE in mondi/mondi.js):
# se cambia PICCOLE, cambiare anche GRANDI.
GRANDI=(cielo nemesi-colore nemesi-luce terra-luci)
set -e
cd "$(dirname "$0")/../tex"
mkdir -p m
for f in png/*.png; do
  n=$(basename "$f" .png)
  [[ "$n" == "anelli" ]] && { cp "$f" anelli.png; continue; }
  q=76; [[ "$n" == *normale* ]] && q=82
  w=$(sips -g pixelWidth "$f" | awk '/pixelWidth/{print $2}')
  if (( ${GRANDI[(Ie)$n]} )); then sips -s format jpeg -s formatOptions $q "$f" --out "$n.jpg" >/dev/null; else rm -f "$n.jpg"; fi
  h=$((w / 4)); sips -s format jpeg -s formatOptions $q -z $h $((w / 2)) "$f" --out "m/$n.jpg" >/dev/null
done
# Terra di giorno: direttamente dalla mappa NASA ridotta
src=../sorgenti/terra-giorno-4096.jpg
sips -s format jpeg -s formatOptions 76 "$src" --out terra-giorno.jpg >/dev/null
sips -s format jpeg -s formatOptions 78 -z 1024 2048 "$src" --out m/terra-giorno.jpg >/dev/null
ls -la . m
