{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 #!/bin/bash\
\
echo "\uc0\u55357 \u56615  Fixing TodaysReadingWidget component..."\
echo ""\
\
# Step 1: Create the component file\
echo "\uc0\u55357 \u56541  Creating components/TodaysReadingWidget.tsx..."\
cat > components/TodaysReadingWidget.tsx << 'EOF'\
"use client";\
\
import \{ useEffect, useState \} from "react";\
import Link from "next/link";\
\
interface ReadingPlan \{\
  date: string;\
  reference: string;\
  book: string;\
  chapters: string;\
\}\
\
export default function TodaysReadingWidget() \{\
  const [todaysReading, setTodaysReading] = useState<ReadingPlan | null>(null);\
  const [loading, setLoading] = useState(true);\
\
  useEffect(() => \{\
    // Simple reading plan: Read through the Bible in a year\
    // This is a placeholder - you can make it more sophisticated later\
    const getTodaysReading = () => \{\
      const today = new Date();\
      const startOfYear = new Date(today.getFullYear(), 0, 1);\
      const dayOfYear = Math.floor(\
        (today.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)\
      );\
\
      // Simple rotation through some key passages\
      const readings = [\
        \{ book: "Genesis", chapters: "1-2", reference: "Genesis 1" \},\
        \{ book: "Psalm", chapters: "1", reference: "Psalm 1" \},\
        \{ book: "Matthew", chapters: "5-7", reference: "Matthew 5" \},\
        \{ book: "John", chapters: "3", reference: "John 3" \},\
        \{ book: "Romans", chapters: "8", reference: "Romans 8" \},\
        \{ book: "Ephesians", chapters: "1-2", reference: "Ephesians 1" \},\
        \{ book: "Philippians", chapters: "2", reference: "Philippians 2" \},\
      ];\
\
      const reading = readings[dayOfYear % readings.length];\
\
      setTodaysReading(\{\
        date: today.toLocaleDateString("en-US", \{\
          weekday: "long",\
          month: "long",\
          day: "numeric",\
        \}),\
        reference: reading.reference,\
        book: reading.book,\
        chapters: reading.chapters,\
      \});\
      setLoading(false);\
    \};\
\
    getTodaysReading();\
  \}, []);\
\
  if (loading) \{\
    return (\
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">\
        <div className="animate-pulse">\
          <div className="h-4 bg-slate-700 rounded w-3/4 mb-3"></div>\
          <div className="h-8 bg-slate-700 rounded w-1/2"></div>\
        </div>\
      </div>\
    );\
  \}\
\
  return (\
    <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700 hover:border-yellow-400/30 transition-all">\
      <div className="flex items-start justify-between mb-3">\
        <div>\
          <p className="text-slate-400 text-sm mb-1">\{todaysReading?.date\}</p>\
          <h3 className="text-yellow-400 font-bold text-lg">Today's Reading</h3>\
        </div>\
        <div className="text-2xl">\uc0\u55357 \u56534 </div>\
      </div>\
\
      <div className="mb-4">\
        <p className="text-white text-2xl font-serif mb-1">\
          \{todaysReading?.book\} \{todaysReading?.chapters\}\
        </p>\
      </div>\
\
      <Link\
        href=\{`/deep-study?passage=$\{encodeURIComponent(\
          todaysReading?.reference || ""\
        )\}`\}\
        className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 transition-colors text-sm font-medium"\
      >\
        Start Studying\
        <svg\
          className="w-4 h-4"\
          fill="none"\
          stroke="currentColor"\
          viewBox="0 0 24 24"\
        >\
          <path\
            strokeLinecap="round"\
            strokeLinejoin="round"\
            strokeWidth=\{2\}\
            d="M9 5l7 7-7 7"\
          />\
        </svg>\
      </Link>\
\
      <p className="text-slate-500 text-xs mt-4 italic">\
        "Your word is a lamp to my feet and a light to my path." - Psalm 119:105\
      </p>\
    </div>\
  );\
\}\
EOF\
\
echo "\uc0\u9989  Component created!"\
echo ""\
\
# Step 2: Test the build\
echo "\uc0\u55357 \u56616  Testing build..."\
npm run build\
\
if [ $? -eq 0 ]; then\
    echo ""\
    echo "\uc0\u9989  Build successful!"\
    echo ""\
    \
    # Step 3: Git add, commit, push\
    echo "\uc0\u55357 \u56548  Committing to GitHub..."\
    git add components/TodaysReadingWidget.tsx\
    git commit -m "Add missing TodaysReadingWidget component"\
    git push origin main\
    \
    if [ $? -eq 0 ]; then\
        echo ""\
        echo "\uc0\u55356 \u57225  SUCCESS! Component added and pushed to GitHub!"\
        echo ""\
        echo "Next steps:"\
        echo "  1. Wait for Vercel to auto-deploy (2-3 minutes)"\
        echo "  2. Test your app at thebusychristianapp.com"\
        echo "  3. The widget should appear on your homepage now! \uc0\u55357 \u56534 "\
    else\
        echo ""\
        echo "\uc0\u9888 \u65039   Push failed. You may need to pull first:"\
        echo "    git pull origin main"\
        echo "    git push origin main"\
    fi\
else\
    echo ""\
    echo "\uc0\u10060  Build failed. Check the errors above."\
    exit 1\
fi}