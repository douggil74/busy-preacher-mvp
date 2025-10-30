{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 #!/bin/bash\
\
echo "\uc0\u55357 \u56580  SYNCING READING PLANS TO LOCAL & GITHUB"\
echo "==========================================="\
echo ""\
\
cd ~/busy-preacher-mvp || exit 1\
\
# Step 1: Create the reading-plans directory\
echo "\uc0\u55357 \u56513  Step 1: Creating app/reading-plans directory..."\
mkdir -p app/reading-plans\
\
# Step 2: Create the reading-plans page\
echo "\uc0\u55357 \u56541  Step 2: Creating reading-plans/page.tsx..."\
cat > app/reading-plans/page.tsx << 'EOFPAGE'\
// app/reading-plans/page.tsx\
import \{ Playfair_Display \} from "next/font/google";\
\
const playfair = Playfair_Display(\{\
  subsets: ["latin"],\
  weight: ["400", "700"],\
  display: "swap",\
\});\
\
interface ReadingPlan \{\
  id: string;\
  title: string;\
  difficulty: "easy" | "moderate" | "hard";\
  duration: number;\
  description: string;\
  tags: string[];\
  startPath?: string;\
\}\
\
const readingPlans: ReadingPlan[] = [\
  \{\
    id: "bible-in-year",\
    title: "Bible in a Year",\
    difficulty: "moderate",\
    duration: 365,\
    description:\
      "Read through the entire Bible in 365 days with a mix of Old Testament, New Testament, Psalms, and Proverbs each day.",\
    tags: ["Complete Bible", "Popular", "Balanced"],\
  \},\
  \{\
    id: "nt-90-days",\
    title: "New Testament in 90 Days",\
    difficulty: "easy",\
    duration: 90,\
    description:\
      "Read the entire New Testament in just 3 months. Perfect for deepening your understanding of Jesus and the early church.",\
    tags: ["New Testament", "Quick", "Jesus-focused"],\
  \},\
  \{\
    id: "gospels-30-days",\
    title: "Gospels in 30 Days",\
    difficulty: "easy",\
    duration: 30,\
    description:\
      "Focus on the life and teachings of Jesus by reading all four Gospels in one month.",\
    tags: ["Gospels", "Jesus", "Quick Start"],\
  \},\
  \{\
    id: "psalms-proverbs",\
    title: "Psalms & Proverbs in a Month",\
    difficulty: "easy",\
    duration: 31,\
    description:\
      "Read through Psalms and Proverbs in 31 days. Perfect for daily wisdom and worship.",\
    tags: ["Wisdom", "Worship", "Short Readings"],\
  \},\
  \{\
    id: "pauls-letters",\
    title: "Paul's Letters in 30 Days",\
    difficulty: "moderate",\
    duration: 30,\
    description:\
      "Study all of Paul's epistles in one month. Dive deep into Christian doctrine and practical living.",\
    tags: ["Paul", "Doctrine", "Epistles"],\
  \},\
  \{\
    id: "spiritual-foundations",\
    title: "Spiritual Foundations (16 Lessons)",\
    difficulty: "moderate",\
    duration: 32,\
    description:\
      "Complete the Cornerstone Church Spiritual Foundations course with daily Bible readings aligned to each lesson.",\
    tags: ["Course", "Foundations", "Cornerstone"],\
  \},\
];\
\
const difficultyColors = \{\
  easy: "text-green-400 border-green-400/20 bg-green-400/10",\
  moderate: "text-yellow-400 border-yellow-400/20 bg-yellow-400/10",\
  hard: "text-red-400 border-red-400/20 bg-red-400/10",\
\};\
\
export default function ReadingPlansPage() \{\
  return (\
    <main className="min-h-screen px-4 py-8">\
      <div className="container max-w-5xl mx-auto">\
        \{/* Header */\}\
        <header className="text-center mb-12">\
          <h1\
            className=\{`$\{playfair.className\} text-4xl md:text-5xl font-bold text-white mb-4`\}\
          >\
            Reading Plans\
          </h1>\
          <p className="text-white/70 text-lg max-w-2xl mx-auto">\
            Stay consistent in God's Word with structured reading plans designed\
            for busy Christians.\
          </p>\
        </header>\
\
        \{/* Plans Grid */\}\
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">\
          \{readingPlans.map((plan) => (\
            <div\
              key=\{plan.id\}\
              className="card hover:border-[#FFD966]/20 transition-all"\
            >\
              \{/* Card Header */\}\
              <div className="mb-4">\
                <div className="flex items-start justify-between mb-3">\
                  <h3\
                    className=\{`$\{playfair.className\} text-xl font-bold text-white`\}\
                  >\
                    \{plan.title\}\
                  </h3>\
                </div>\
\
                \{/* Badges */\}\
                <div className="flex flex-wrap gap-2 mb-3">\
                  <span\
                    className=\{`inline-flex items-center px-2 py-1 rounded-full text-xs border $\{\
                      difficultyColors[plan.difficulty]\
                    \}`\}\
                  >\
                    \{plan.difficulty\}\
                  </span>\
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs border border-white/10 bg-white/5 text-white/70">\
                    \{plan.duration\} days\
                  </span>\
                </div>\
              </div>\
\
              \{/* Description */\}\
              <p className="text-white/70 text-sm mb-4 leading-relaxed">\
                \{plan.description\}\
              </p>\
\
              \{/* Tags */\}\
              <div className="flex flex-wrap gap-2 mb-4">\
                \{plan.tags.map((tag) => (\
                  <span\
                    key=\{tag\}\
                    className="text-xs px-2 py-1 rounded-md bg-white/5 text-white/60 border border-white/10"\
                  >\
                    \{tag\}\
                  </span>\
                ))\}\
              </div>\
\
              \{/* Start Button */\}\
              <button className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 font-medium hover:bg-white/10 transition-colors">\
                Start Plan\
              </button>\
            </div>\
          ))\}\
        </div>\
\
        \{/* How It Works Section */\}\
        <div className="card mt-12 bg-blue-500/10 border-blue-500/20">\
          <h3\
            className=\{`$\{playfair.className\} text-xl font-bold text-white mb-3`\}\
          >\
            How Reading Plans Work\
          </h3>\
          <ul className="space-y-2 text-white/80">\
            <li className="flex gap-3">\
              <span className="text-[#FFD966]">\'95</span>\
              <span>Choose a plan and start reading today</span>\
            </li>\
            <li className="flex gap-3">\
              <span className="text-[#FFD966]">\'95</span>\
              <span>Check off each day's reading as you complete it</span>\
            </li>\
            <li className="flex gap-3">\
              <span className="text-[#FFD966]">\'95</span>\
              <span>Track your progress and build reading streaks</span>\
            </li>\
            <li className="flex gap-3">\
              <span className="text-[#FFD966]">\'95</span>\
              <span>\
                Click any passage to study it in depth with commentaries and\
                word studies\
              </span>\
            </li>\
            <li className="flex gap-3">\
              <span className="text-[#FFD966]">\'95</span>\
              <span>All progress is saved locally on your device</span>\
            </li>\
          </ul>\
        </div>\
      </div>\
    </main>\
  );\
\}\
EOFPAGE\
\
echo "\uc0\u9989  Created app/reading-plans/page.tsx"\
echo ""\
\
# Step 3: Check current status\
echo "\uc0\u55357 \u56522  Step 3: Current git status..."\
git status --short\
echo ""\
\
# Step 4: Stage all files\
echo "\uc0\u55357 \u56550  Step 4: Staging files for commit..."\
git add app/reading-plans/page.tsx\
git add app/reading-plan/page.tsx 2>/dev/null || echo "  (reading-plan already tracked or doesn't exist)"\
git add app/HeaderBar.tsx\
git add components/TodaysReadingWidget.tsx\
git add app/components/KeywordSearchResults.tsx\
\
echo ""\
\
# Step 5: Show what will be committed\
echo "\uc0\u55357 \u56523  Step 5: Files to be committed..."\
git status --short\
echo ""\
\
# Step 6: Commit\
echo "\uc0\u55357 \u56510  Step 6: Committing changes..."\
git commit -m "Add reading plans page and sync all components\
\
- Created /reading-plans page with 6 curated Bible reading plans\
- Added reading plan cards: Bible in Year, NT in 90 Days, Gospels, Psalms & Proverbs, Paul's Letters, Spiritual Foundations\
- Updated HeaderBar with Reading Plan navigation link\
- Added TodaysReadingWidget component for daily scripture\
- Added KeywordSearchResults component\
- All plans include difficulty levels, durations, and helpful tags"\
\
echo ""\
\
# Step 7: Push to GitHub\
echo "\uc0\u55357 \u56960  Step 7: Pushing to GitHub..."\
git push origin main\
\
echo ""\
echo "\uc0\u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 "\
echo "\uc0\u9989  SYNC COMPLETE!"\
echo "\uc0\u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 \u9473 "\
echo ""\
echo "\uc0\u55357 \u56525  What was synced:"\
echo "   \uc0\u9989  app/reading-plans/page.tsx (FANCY PAGE with 6 plans)"\
echo "   \uc0\u9989  app/reading-plan/page.tsx (simple page)"\
echo "   \uc0\u9989  app/HeaderBar.tsx (with navigation link)"\
echo "   \uc0\u9989  components/TodaysReadingWidget.tsx"\
echo "   \uc0\u9989  app/components/KeywordSearchResults.tsx"\
echo ""\
echo "\uc0\u55356 \u57104  Vercel will auto-deploy in 1-2 minutes"\
echo ""\
echo "\uc0\u55357 \u56599  Check deployment at:"\
echo "   https://vercel.com/doug-gilfords-projects/thebusypreacher/deployments"\
echo ""\
echo "\uc0\u55357 \u56481  If Vercel doesn't pick up changes:"\
echo "   1. Go to Vercel Dashboard"\
echo "   2. Click 'Redeploy' on latest deployment"\
echo "   3. UNCHECK 'Use existing Build Cache'"\
echo ""}