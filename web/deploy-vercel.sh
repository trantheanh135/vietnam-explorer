#!/usr/bin/env bash
# Deploys Vietnam Explorer to Vercel (project "vietnam-explorer") as a production deployment.
# Usage: bash deploy-vercel.sh   (needs `vercel login` once)
set -euo pipefail
cd "$(dirname "$0")"

npm test            # don't ship broken data or search
vercel link --yes --project vietnam-explorer >/dev/null 2>&1 \
  || { vercel project add vietnam-explorer >/dev/null; vercel link --yes --project vietnam-explorer >/dev/null; }
vercel deploy --prod --yes 2>&1 | grep -E "https://|Error|error" | tail -3
