{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 #!/bin/bash\
# Prayer System Migration Commands\
# Run these in your project root directory\
\
echo "\uc0\u55357 \u56960  Migrating to Unified Prayer System..."\
echo ""\
\
# 1. Create lib directory if it doesn't exist\
echo "\uc0\u55357 \u56513  Ensuring lib directory exists..."\
mkdir -p lib\
\
# 2. Copy locationHelper.ts to lib\
echo "\uc0\u55357 \u56523  Installing locationHelper.ts..."\
cp /mnt/user-data/outputs/locationHelper.ts lib/locationHelper.ts\
\
# 3. Replace prayer page\
echo "\uc0\u55357 \u56523  Installing unified prayer page..."\
cp /mnt/user-data/outputs/unified-prayer-page.tsx app/prayer/page.tsx\
\
# 4. Update admin moderation page\
echo "\uc0\u55357 \u56523  Updating admin moderation page..."\
cp /mnt/user-data/outputs/admin-moderation-page.tsx app/admin/prayer-moderation/page.tsx\
\
# 5. Delete old files (no longer needed)\
echo "\uc0\u55357 \u56785 \u65039   Removing old files..."\
rm -f app/my-prayers/page.tsx\
rm -f lib/sharePrayer.ts\
\
# Optional: Remove the my-prayers directory if it's empty\
if [ -d "app/my-prayers" ]; then\
  rmdir app/my-prayers 2>/dev/null && echo "\uc0\u10003  Removed empty my-prayers directory" || echo "\u9888 \u65039   my-prayers directory not empty, keeping it"\
fi\
\
echo ""\
echo "\uc0\u9989  Migration complete!"\
echo ""\
echo "\uc0\u55357 \u56541  NEXT STEPS:"\
echo "1. Update your navigation links to use /prayer instead of /my-prayers"\
echo "2. Test the new unified prayer page at /prayer"\
echo "3. Verify admin moderation at /admin/prayer-moderation"\
echo ""\
echo "\uc0\u55356 \u57225  You're all set!"}