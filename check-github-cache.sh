#!/bin/bash
echo "🔍 CHECKING GITHUB - CACHE vs REALITY"
echo "======================================"
echo ""

echo "1. Checking GitHub API directly (no browser cache):"
curl -s "https://api.github.com/repos/douggil74/busy-preacher-mvp/contents/app" | grep '"name"' | grep -i "reading\|plan"
[ $? -eq 0 ] && echo "✅ Found reading/plan files via API!" || echo "❌ No reading/plan files via API"
echo ""

echo "2. Testing direct file access - reading-plans (plural):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://raw.githubusercontent.com/douggil74/busy-preacher-mvp/main/app/reading-plans/page.tsx")
echo "   HTTP Status: $STATUS"
[ "$STATUS" = "200" ] && echo "   ✅ app/reading-plans/page.tsx EXISTS on GitHub!" || echo "   ❌ app/reading-plans/page.tsx NOT on GitHub (404)"
echo ""

echo "3. Testing direct file access - reading-plan (singular):"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://raw.githubusercontent.com/douggil74/busy-preacher-mvp/main/app/reading-plan/page.tsx")
echo "   HTTP Status: $STATUS"
[ "$STATUS" = "200" ] && echo "   ✅ app/reading-plan/page.tsx EXISTS on GitHub!" || echo "   ❌ app/reading-plan/page.tsx NOT on GitHub (404)"
echo ""

echo "4. Checking all directories in app/ via API:"
curl -s "https://api.github.com/repos/douggil74/busy-preacher-mvp/contents/app" | jq -r '.[] | select(.type=="dir") | .name' 2>/dev/null || curl -s "https://api.github.com/repos/douggil74/busy-preacher-mvp/contents/app" | grep '"name":' | grep -o '"[^"]*"' | head -20
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎯 VERDICT:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
