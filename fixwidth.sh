#!/bin/bash

# Script to update card widths from max-w-xl to max-w-2xl
# Run from your project root directory

echo "🔧 Fixing card widths to max-w-2xl..."
echo ""

# Detect OS for sed compatibility
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  SED_CMD="sed -i ''"
else
  # Linux
  SED_CMD="sed -i"
fi

# Fix StudyReminderBanner.tsx
FILE1="app/components/StudyReminderBanner.tsx"
if [ -f "$FILE1" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/max-w-xl mx-auto/max-w-2xl mx-auto/g' "$FILE1"
  else
    sed -i 's/max-w-xl mx-auto/max-w-2xl mx-auto/g' "$FILE1"
  fi
  echo "✅ Fixed $FILE1"
else
  echo "⚠️  $FILE1 not found"
fi

# Fix PastoralInsightBanner.tsx
FILE2="app/components/PastoralInsightBanner.tsx"
if [ -f "$FILE2" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/max-w-xl mx-auto/max-w-2xl mx-auto/g' "$FILE2"
  else
    sed -i 's/max-w-xl mx-auto/max-w-2xl mx-auto/g' "$FILE2"
  fi
  echo "✅ Fixed $FILE2"
else
  echo "⚠️  $FILE2 not found"
fi

# Fix RelatedCoursesPanel.tsx
FILE3="app/components/RelatedCoursesPanel.tsx"
if [ -f "$FILE3" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/max-w-xl mx-auto/max-w-2xl mx-auto/g' "$FILE3"
  else
    sed -i 's/max-w-xl mx-auto/max-w-2xl mx-auto/g' "$FILE3"
  fi
  echo "✅ Fixed $FILE3"
else
  echo "⚠️  $FILE3 not found"
fi

# Fix page.tsx
FILE4="app/page.tsx"
if [ -f "$FILE4" ]; then
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' 's/border-yellow-400\/30 max-w-xl mx-auto/border-yellow-400\/30 max-w-2xl mx-auto/g' "$FILE4"
  else
    sed -i 's/border-yellow-400\/30 max-w-xl mx-auto/border-yellow-400\/30 max-w-2xl mx-auto/g' "$FILE4"
  fi
  echo "✅ Fixed $FILE4"
else
  echo "⚠️  $FILE4 not found"
fi

echo ""
echo "🎉 All card widths updated to max-w-2xl!"
echo ""
echo "Next steps:"
echo "1. Review changes: git diff"
echo "2. Test locally: npm run dev"
echo "3. Commit: git add . && git commit -m 'Fix card widths to max-w-2xl'"