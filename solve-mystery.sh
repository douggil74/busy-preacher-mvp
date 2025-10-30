#!/bin/bash

# Reading Plans Mystery Solver
# This script investigates the synchronization issue between local, GitHub, and Vercel

echo "🔍 THE BUSY CHRISTIAN - READING PLANS MYSTERY SOLVER"
echo "======================================================="
echo ""

# Create a report file
REPORT="reading-plans-diagnostic-$(date +%Y%m%d-%H%M%S).txt"
exec > >(tee -a "$REPORT")
exec 2>&1

echo "📝 Generating report: $REPORT"
echo ""

# Color codes for terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Section header function
section() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📋 $1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
}

# Check function
check() {
    echo "▸ $1"
}

section "1. CURRENT DIRECTORY & GIT STATUS"
check "Current working directory:"
pwd
echo ""

check "Current git branch:"
git branch --show-current
echo ""

check "Git status:"
git status --short
echo ""

section "2. LOCAL FILE SYSTEM"
check "Contents of app/ directory:"
ls -la app/ | grep -E "(reading|plan)" || echo "No reading/plan folders found"
echo ""

check "Checking for reading-plan folder:"
if [ -d "app/reading-plan" ]; then
    echo "✅ app/reading-plan EXISTS"
    ls -la app/reading-plan/
else
    echo "❌ app/reading-plan DOES NOT EXIST"
fi
echo ""

check "Checking for reading-plans folder (plural):"
if [ -d "app/reading-plans" ]; then
    echo "✅ app/reading-plans EXISTS"
    ls -la app/reading-plans/
else
    echo "❌ app/reading-plans DOES NOT EXIST"
fi
echo ""

check "Searching for ALL reading-related files:"
find . -type f -name "*reading*" -o -name "*plan*" | grep -v node_modules | grep -v .next | grep -v .git || echo "None found"
echo ""

section "3. GIT REMOTE CONFIGURATION"
check "Git remote URLs:"
git remote -v
echo ""

check "Git config (user and remote):"
git config --get user.name
git config --get user.email
git config --get remote.origin.url
echo ""

section "4. BRANCH INFORMATION"
check "All local branches:"
git branch -a
echo ""

check "All remote branches:"
git fetch --quiet 2>&1
git branch -r
echo ""

check "Current branch tracking:"
git branch -vv
echo ""

section "5. GITHUB REPOSITORY STATE"
check "Files on origin/main (reading/plan related):"
git ls-tree -r origin/main --name-only | grep -i "reading\|plan" || echo "No reading/plan files found on origin/main"
echo ""

check "All files in app/ on origin/main:"
git ls-tree -r origin/main app/ --name-only | head -30
echo ""

check "Full tree structure of app/ on origin/main:"
git ls-tree -r origin/main app/
echo ""

section "6. GIT COMMIT HISTORY"
check "Last 15 commits:"
git log --oneline -15
echo ""

check "Commits mentioning 'reading' or 'plan':"
git log --all --oneline --grep="reading\|plan" -i || echo "No commits found with reading/plan in message"
echo ""

check "File history for reading-plans:"
git log --all --oneline --full-history -- "*reading-plans*" || echo "No history found for reading-plans"
echo ""

check "File history for reading-plan:"
git log --all --oneline --full-history -- "*reading-plan*" || echo "No history found for reading-plan"
echo ""

section "7. VERCEL CONFIGURATION"
check "Vercel project configuration:"
if [ -f ".vercel/project.json" ]; then
    echo "✅ Vercel config found:"
    cat .vercel/project.json
else
    echo "❌ No .vercel/project.json found"
fi
echo ""

check "Checking for vercel.json:"
if [ -f "vercel.json" ]; then
    echo "✅ vercel.json found:"
    cat vercel.json
else
    echo "❌ No vercel.json found"
fi
echo ""

section "8. PACKAGE.JSON INFO"
check "Project name and repository:"
cat package.json | grep -A2 '"name"'
cat package.json | grep -A5 '"repository"' || echo "No repository field in package.json"
echo ""

section "9. UNTRACKED & UNCOMMITTED CHANGES"
check "Untracked files:"
git ls-files --others --exclude-standard | head -20
echo ""

check "Modified but unstaged files:"
git diff --name-only
echo ""

check "Staged files:"
git diff --cached --name-only
echo ""

section "10. DIFFERENCE BETWEEN LOCAL AND REMOTE"
check "Files in local app/ but not on origin/main:"
comm -23 <(find app/ -type f | sort) <(git ls-tree -r origin/main --name-only app/ | sort) | head -20
echo ""

check "Files on origin/main but not in local app/:"
comm -13 <(find app/ -type f | sort) <(git ls-tree -r origin/main --name-only app/ | sort) | head -20
echo ""

section "11. CHECKING OTHER POSSIBLE BRANCHES"
check "Searching for reading-plans in ALL branches:"
for branch in $(git branch -r | grep -v HEAD); do
    echo "Checking branch: $branch"
    git ls-tree -r "$branch" --name-only | grep -i "reading-plans" && echo "  ✅ Found in $branch"
done
echo ""

section "12. CHECKING FOR MULTIPLE REPOSITORIES"
check "Checking for other .git directories:"
find . -name ".git" -type d | head -10
echo ""

section "13. RECENT PULL/PUSH ACTIVITY"
check "Last fetch time:"
stat .git/FETCH_HEAD 2>/dev/null || echo "Never fetched"
echo ""

check "Last git operation:"
ls -lt .git/ | head -10
echo ""

section "14. ENVIRONMENT & PATH INFO"
check "Git version:"
git --version
echo ""

check "Node version:"
node --version 2>/dev/null || echo "Node not found"
echo ""

check "NPM version:"
npm --version 2>/dev/null || echo "NPM not found"
echo ""

section "🎯 SUMMARY & DIAGNOSIS"
echo ""
echo "KEY FINDINGS:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if reading-plan exists locally
if [ -d "app/reading-plan" ]; then
    echo "✅ LOCAL: app/reading-plan exists"
else
    echo "❌ LOCAL: app/reading-plan missing"
fi

# Check if reading-plans exists locally
if [ -d "app/reading-plans" ]; then
    echo "✅ LOCAL: app/reading-plans exists"
else
    echo "❌ LOCAL: app/reading-plans missing"
fi

# Check git status
if git ls-tree -r origin/main --name-only | grep -q "reading-plans"; then
    echo "✅ GITHUB: reading-plans found on origin/main"
else
    echo "❌ GITHUB: reading-plans NOT found on origin/main"
fi

if git ls-tree -r origin/main --name-only | grep -q "reading-plan"; then
    echo "✅ GITHUB: reading-plan found on origin/main"
else
    echo "❌ GITHUB: reading-plan NOT found on origin/main"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Report saved to: $REPORT"
echo ""
echo "🔍 NEXT STEPS:"
echo "   1. Review the report above"
echo "   2. Check which branches have reading-plans"
echo "   3. Verify Vercel deployment branch in dashboard"
echo "   4. Look for any discrepancies in the git history"
echo ""
echo "💡 If you share this report, I can help diagnose the exact issue!"
echo ""