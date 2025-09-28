#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

die(){ echo "✖ $*" >&2; exit 1; }
log(){ echo "• $*"; }

OWNER_REPO="$(git config --get remote.origin.url | sed -E 's#.*github.com[:/](.+/.+)(\.git)?#\1#')"
[ -n "${OWNER_REPO:-}" ] || die "Cannot determine owner/repo"

mapfile -t SCRIPTS < <(
  git ls-files   | grep -v -E '^(.github/|templates/|tools/|README|LICENSE)'   | grep -v -E '\.sha256$'   | while read -r f; do
      [ -f "$f" ] || continue
      head -n1 "$f" | grep -q '^#!' || continue
      grep -q -m1 -E '^#\s*VERSION=' "$f" || continue
      echo "$f"
    done
)

[ ${#SCRIPTS[@]} -gt 0 ] || die "No scripts detected (missing '# VERSION=' lines?)"

NOTES="$(mktemp)"
FILES_TO_UPLOAD=()

{
  echo "## Scripts et versions"
  echo
  echo "| Script | Version |"
  echo "|-------:|:--------|"
} > "$NOTES"

for f in "${SCRIPTS[@]}"; do
  name="$(basename "$f")"
  ver="$(grep -m1 -E '^#\s*VERSION=' "$f" | sed -E 's/^#\s*VERSION=//')"
  [ -n "$ver" ] || ver="inconnue"

  hash="$(sha256sum "$f" | awk '{print tolower($1)}')"
  printf "%s  %s\n" "$hash" "$name" > "$f.sha256"

  FILES_TO_UPLOAD+=( "$f" "$f.sha256" )
  printf "| \`%s\` | \`%s\` |\n" "$name" "$ver" >> "$NOTES"
done

pad(){ printf "%02d" "$1"; }
year=$(date -u +%Y)
month=$(date -u +%m)
day=$(date -u +%d)
hour=$(date -u +%H)
min=$(date -u +%M)

moisNoms=( "" "janvier" "février" "mars" "avril" "mai" "juin" "juillet" "août" "septembre" "octobre" "novembre" "décembre" )
moisIdx=$((10#$month))
date_fr="${day} ${moisNoms[$moisIdx]} ${year} ${hour}h${min}"

TAG="r-${year}-${month}-${day}-${hour}${min}"
TITLE="Mes scripts au ${date_fr}"

echo -e "\n---"
echo "Tag      : $TAG"
echo "Titre    : $TITLE"
echo "Repo     : $OWNER_REPO"
echo "Scripts  : ${#SCRIPTS[@]}"
echo "---"

if ! command -v gh >/dev/null 2>&1; then
  die "GitHub CLI (gh) is required on the runner"
fi

if gh release view "$TAG" >/dev/null 2>&1; then
  log "Tag $TAG already exists – deleting release and tag"
  gh release delete "$TAG" -y || true
  git push origin ":refs/tags/$TAG" || true
fi

gh release create "$TAG"   --title "$TITLE"   --notes-file "$NOTES"   --latest   "${FILES_TO_UPLOAD[@]}"

log "Release $TAG published with ${#FILES_TO_UPLOAD[@]} assets."

RETAIN="${RETAIN:-5}"
log "Pruning releases beyond the most recent ${RETAIN}…"

gh api -H "Accept: application/vnd.github+json" "/repos/${OWNER_REPO}/releases?per_page=100"   | jq -r '.[].tag_name'   | awk 'NF'   | nl -ba   | while read -r idx tag; do
      if [ "$idx" -gt "$RETAIN" ]; then
        log "  - deleting $tag"
        gh release delete "$tag" -y || true
        git push origin ":refs/tags/$tag" || true
      fi
    done

log "Done."
