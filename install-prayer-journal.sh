#!/bin/bash

echo "📖 Setting up Community Prayer Journal environment..."

# Create directories
mkdir -p app/community-prayers components lib docs/ai-instructions

# Create or touch files
touch app/community-prayers/page.tsx
touch components/PrayerCard.tsx
touch components/AddPrayerModal.tsx
touch lib/prayerStorage.ts

# Make sure permissions are correct
chmod 644 app/community-prayers/page.tsx components/*.tsx lib/prayerStorage.ts

echo "✅ Basic structure created."
echo "Next step: Fill in code for Community Prayers and shared toggle."
