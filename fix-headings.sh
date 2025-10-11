#!/bin/bash

# Script to fix text color classes in page.tsx files
# This adds light: variants to text color classes that don't have them

echo "Finding and fixing heading colors in page.tsx files..."

# Find all page.tsx files
find ./app -name "page.tsx" -type f | while read file; do
  echo "Processing: $file"
  
  # Create a backup
  cp "$file" "$file.backup"
  
  # Fix common patterns:
  # text-white -> text-white light:text-black
  # text-white/95 -> text-white/95 light:text-black/95
  # text-white/90 -> text-white/90 light:text-black/90
  # text-white/80 -> text-white/80 light:text-black/80
  # text-white/70 -> text-white/70 light:text-black/70
  # text-white/60 -> text-white/60 light:text-black/60
  
  sed -i.tmp \
    -e 's/text-white\([^/]\)/text-white light:text-black\1/g' \
    -e 's/text-white\/95\([^0-9]\)/text-white\/95 light:text-black\/95\1/g' \
    -e 's/text-white\/90\([^0-9]\)/text-white\/90 light:text-black\/90\1/g' \
    -e 's/text-white\/80\([^0-9]\)/text-white\/80 light:text-black\/80\1/g' \
    -e 's/text-white\/70\([^0-9]\)/text-white\/70 light:text-black\/70\1/g' \
    -e 's/text-white\/60\([^0-9]\)/text-white\/60 light:text-black\/60\1/g' \
    -e 's/text-white\/50\([^0-9]\)/text-white\/50 light:text-black\/50\1/g' \
    "$file"
  
  rm "$file.tmp"
  
  # Show what changed
  if ! diff -q "$file" "$file.backup" > /dev/null; then
    echo "  ✓ Updated $file"
  else
    echo "  - No changes needed in $file"
    rm "$file.backup"
  fi
done

echo ""
echo "Done! Backup files (.backup) created for modified files."
echo "Review changes, then run: find ./app -name '*.backup' -delete"