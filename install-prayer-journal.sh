{\rtf1\ansi\ansicpg1252\cocoartf2865
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fswiss\fcharset0 Helvetica;}
{\colortbl;\red255\green255\blue255;}
{\*\expandedcolortbl;;}
\margl1440\margr1440\vieww11520\viewh8400\viewkind0
\pard\tx720\tx1440\tx2160\tx2880\tx3600\tx4320\tx5040\tx5760\tx6480\tx7200\tx7920\tx8640\pardirnatural\partightenfactor0

\f0\fs24 \cf0 #!/bin/bash\
\
# Prayer Journal Installation Script\
# This script creates all necessary files for the Prayer Journal feature\
\
echo "\uc0\u55357 \u56911  Installing Prayer Journal for The Busy Christian..."\
echo ""\
\
# Check if we're in the right directory\
if [ ! -f "package.json" ]; then\
    echo "\uc0\u10060  Error: package.json not found!"\
    echo "Please run this script from your Next.js project root directory."\
    exit 1\
fi\
\
# Create directories\
echo "\uc0\u55357 \u56513  Creating directories..."\
mkdir -p lib\
mkdir -p components\
mkdir -p app/prayer-journal\
\
echo "\uc0\u9989  Directories created!"\
echo ""\
\
# Install jsPDF\
echo "\uc0\u55357 \u56550  Installing jsPDF..."\
npm install jspdf\
echo "\uc0\u9989  jsPDF installed!"\
echo ""\
\
# Create lib/prayerStorage.ts\
echo "\uc0\u55357 \u56541  Creating lib/prayerStorage.ts..."\
cat > lib/prayerStorage.ts << 'EOF'\
// Prayer Journal Storage Utilities\
\
export interface Prayer \{\
  id: string;\
  title: string;\
  description: string;\
  tags: string[];\
  dateAdded: string;\
  dateAnswered?: string;\
  isAnswered: boolean;\
  linkedPassage?: string;\
  answerNotes?: string;\
\}\
\
export type PrayerFilter = 'all' | 'active' | 'answered';\
\
const STORAGE_KEY = 'busyChristian_prayers';\
\
export function getPrayers(): Prayer[] \{\
  if (typeof window === 'undefined') return [];\
  \
  try \{\
    const stored = localStorage.getItem(STORAGE_KEY);\
    if (!stored) return [];\
    return JSON.parse(stored);\
  \} catch (error) \{\
    console.error('Error loading prayers:', error);\
    return [];\
  \}\
\}\
\
export function savePrayers(prayers: Prayer[]): void \{\
  if (typeof window === 'undefined') return;\
  \
  try \{\
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prayers));\
  \} catch (error) \{\
    console.error('Error saving prayers:', error);\
  \}\
\}\
\
export function addPrayer(prayer: Omit<Prayer, 'id' | 'dateAdded' | 'isAnswered'>): Prayer \{\
  const newPrayer: Prayer = \{\
    ...prayer,\
    id: crypto.randomUUID(),\
    dateAdded: new Date().toISOString(),\
    isAnswered: false,\
  \};\
  \
  const prayers = getPrayers();\
  prayers.unshift(newPrayer);\
  savePrayers(prayers);\
  \
  return newPrayer;\
\}\
\
export function updatePrayer(id: string, updates: Partial<Prayer>): void \{\
  const prayers = getPrayers();\
  const index = prayers.findIndex(p => p.id === id);\
  \
  if (index !== -1) \{\
    prayers[index] = \{ ...prayers[index], ...updates \};\
    savePrayers(prayers);\
  \}\
\}\
\
export function markAnswered(id: string, answerNotes?: string): void \{\
  updatePrayer(id, \{\
    isAnswered: true,\
    dateAnswered: new Date().toISOString(),\
    answerNotes: answerNotes || undefined,\
  \});\
\}\
\
export function deletePrayer(id: string): void \{\
  const prayers = getPrayers();\
  const filtered = prayers.filter(p => p.id !== id);\
  savePrayers(filtered);\
\}\
\
export function filterPrayers(prayers: Prayer[], filter: PrayerFilter): Prayer[] \{\
  switch (filter) \{\
    case 'active':\
      return prayers.filter(p => !p.isAnswered);\
    case 'answered':\
      return prayers.filter(p => p.isAnswered);\
    default:\
      return prayers;\
  \}\
\}\
\
export function searchPrayers(prayers: Prayer[], query: string): Prayer[] \{\
  const lowerQuery = query.toLowerCase();\
  return prayers.filter(p => \
    p.title.toLowerCase().includes(lowerQuery) ||\
    p.description.toLowerCase().includes(lowerQuery) ||\
    p.tags.some(tag => tag.toLowerCase().includes(lowerQuery))\
  );\
\}\
\
export const PRAYER_TAGS = [\
  'Family',\
  'Health',\
  'Work',\
  'Finances',\
  'Relationships',\
  'Ministry',\
  'Salvation',\
  'Healing',\
  'Guidance',\
  'Protection',\
  'Thanksgiving',\
  'Confession',\
  'Praise',\
  'Church',\
  'Friends',\
  'Mission',\
  'Spiritual Growth',\
  'Anxiety',\
  'Decision',\
  'Travel',\
];\
\
export function getPrayerStats(prayers: Prayer[]) \{\
  const active = prayers.filter(p => !p.isAnswered).length;\
  const answered = prayers.filter(p => p.isAnswered).length;\
  const total = prayers.length;\
  \
  const thirtyDaysAgo = new Date();\
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);\
  \
  const recentlyAnswered = prayers.filter(p => \
    p.isAnswered && \
    p.dateAnswered && \
    new Date(p.dateAnswered) > thirtyDaysAgo\
  ).length;\
  \
  return \{\
    total,\
    active,\
    answered,\
    recentlyAnswered,\
    answerRate: total > 0 ? Math.round((answered / total) * 100) : 0,\
  \};\
\}\
\
export function formatPrayerDate(dateString: string): string \{\
  const date = new Date(dateString);\
  const now = new Date();\
  const diffTime = Math.abs(now.getTime() - date.getTime());\
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));\
  \
  if (diffDays === 0) return 'Today';\
  if (diffDays === 1) return 'Yesterday';\
  if (diffDays < 7) return `$\{diffDays\} days ago`;\
  if (diffDays < 30) return `$\{Math.floor(diffDays / 7)\} weeks ago`;\
  if (diffDays < 365) return `$\{Math.floor(diffDays / 30)\} months ago`;\
  \
  return date.toLocaleDateString('en-US', \{ \
    month: 'short', \
    day: 'numeric', \
    year: 'numeric' \
  \});\
\}\
EOF\
\
echo "\uc0\u9989  lib/prayerStorage.ts created!"\
echo ""\
\
# Create components/PrayerCard.tsx\
echo "\uc0\u55357 \u56541  Creating components/PrayerCard.tsx..."\
cat > components/PrayerCard.tsx << 'EOF'\
'use client';\
\
import \{ Prayer, formatPrayerDate \} from '@/lib/prayerStorage';\
\
interface PrayerCardProps \{\
  prayer: Prayer;\
  onEdit: (prayer: Prayer) => void;\
  onDelete: (id: string) => void;\
  onMarkAnswered: (prayer: Prayer) => void;\
\}\
\
export function PrayerCard(\{ prayer, onEdit, onDelete, onMarkAnswered \}: PrayerCardProps) \{\
  const isAnswered = prayer.isAnswered;\
  \
  return (\
    <div \
      className=\{`\
        card rounded-2xl p-6 transition-all\
        $\{isAnswered \
          ? 'border-green-400/30 bg-green-900/20' \
          : ''\
        \}\
      `\}\
    >\
      <div className="flex items-start justify-between mb-4">\
        <div className="flex items-center gap-3">\
          <span className="text-3xl">\
            \{isAnswered ? '\uc0\u9989 ' : '\u55357 \u56911 '\}\
          </span>\
          \
          \{isAnswered && (\
            <span className="badge rounded-full bg-green-400/20 border-green-400/30 text-green-400 text-xs px-3 py-1">\
              \uc0\u10003  Answered\
            </span>\
          )\}\
        </div>\
      </div>\
      \
      <h3 className=\{`text-xl font-semibold mb-3 $\{isAnswered ? 'text-green-300' : 'text-white'\}`\}>\
        \{prayer.title\}\
      </h3>\
      \
      \{prayer.description && (\
        <p className="text-white/70 text-sm mb-4 leading-relaxed line-clamp-3">\
          \{prayer.description\}\
        </p>\
      )\}\
      \
      \{prayer.tags.length > 0 && (\
        <div className="flex flex-wrap gap-2 mb-4">\
          \{prayer.tags.map(tag => (\
            <span \
              key=\{tag\}\
              className="badge rounded-full text-xs px-3 py-1"\
            >\
              \{tag\}\
            </span>\
          ))\}\
        </div>\
      )\}\
      \
      \{prayer.linkedPassage && (\
        <div className="mb-4">\
          <a \
            href=\{`/deep-study?passage=$\{encodeURIComponent(prayer.linkedPassage)\}`\}\
            className="inline-flex items-center gap-2 text-sm text-[#FFD966] hover:text-[#FFD966]/80 transition-colors"\
          >\
            <span>\uc0\u55357 \u56534 </span> \
            <span className="underline">\{prayer.linkedPassage\}</span>\
          </a>\
        </div>\
      )\}\
      \
      <div className="flex items-center gap-4 text-xs text-white/50 mb-4">\
        <div className="flex items-center gap-1.5">\
          <span>\uc0\u55357 \u56517 </span>\
          <span>\
            \{isAnswered \
              ? `Answered $\{formatPrayerDate(prayer.dateAnswered!)\}` \
              : `Started $\{formatPrayerDate(prayer.dateAdded)\}`\
            \}\
          </span>\
        </div>\
      </div>\
      \
      \{isAnswered && prayer.answerNotes && (\
        <div className="mb-4 rounded-2xl border border-green-400/30 bg-green-900/20 p-4">\
          <p className="text-xs font-semibold text-green-400 mb-2">How God Answered:</p>\
          <p className="text-sm text-green-300/90 leading-relaxed">\{prayer.answerNotes\}</p>\
        </div>\
      )\}\
      \
      <div className="flex flex-wrap gap-2 pt-4 border-t border-white/10">\
        \{!isAnswered && (\
          <button\
            onClick=\{() => onMarkAnswered(prayer)\}\
            className="flex-1 min-w-[140px] rounded-2xl border-2 border-green-400/30 bg-green-400/10 px-4 py-2.5 text-sm font-medium text-green-400 hover:bg-green-400/20 transition-colors"\
          >\
            Mark Answered\
          </button>\
        )\}\
        \
        <button\
          onClick=\{() => onEdit(prayer)\}\
          className="flex-1 min-w-[100px] rounded-2xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"\
        >\
          Edit\
        </button>\
        \
        <button\
          onClick=\{() => \{\
            if (window.confirm(`Delete prayer "$\{prayer.title\}"?`)) \{\
              onDelete(prayer.id);\
            \}\
          \}\}\
          className="rounded-2xl border border-red-400/30 bg-red-900/20 px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-900/30 transition-colors"\
        >\
          Delete\
        </button>\
      </div>\
    </div>\
  );\
\}\
EOF\
\
echo "\uc0\u9989  components/PrayerCard.tsx created!"\
echo ""\
\
# Create components/AddPrayerModal.tsx\
echo "\uc0\u55357 \u56541  Creating components/AddPrayerModal.tsx..."\
cat > components/AddPrayerModal.tsx << 'EOF'\
'use client';\
\
import \{ useState, useEffect \} from 'react';\
import \{ Playfair_Display \} from 'next/font/google';\
import \{ Prayer, PRAYER_TAGS \} from '@/lib/prayerStorage';\
\
const playfair = Playfair_Display(\{\
  subsets: ['latin'],\
  weight: ['600', '700'],\
  display: 'swap',\
\});\
\
interface AddPrayerModalProps \{\
  isOpen: boolean;\
  onClose: () => void;\
  onSave: (prayer: Omit<Prayer, 'id' | 'dateAdded' | 'isAnswered'>) => void;\
  editingPrayer?: Prayer | null;\
  isAnswering?: boolean;\
\}\
\
export function AddPrayerModal(\{ \
  isOpen, \
  onClose, \
  onSave, \
  editingPrayer,\
  isAnswering = false \
\}: AddPrayerModalProps) \{\
  const [title, setTitle] = useState('');\
  const [description, setDescription] = useState('');\
  const [selectedTags, setSelectedTags] = useState<string[]>([]);\
  const [linkedPassage, setLinkedPassage] = useState('');\
  const [answerNotes, setAnswerNotes] = useState('');\
  const [customTag, setCustomTag] = useState('');\
\
  useEffect(() => \{\
    if (editingPrayer) \{\
      setTitle(editingPrayer.title);\
      setDescription(editingPrayer.description);\
      setSelectedTags(editingPrayer.tags);\
      setLinkedPassage(editingPrayer.linkedPassage || '');\
      setAnswerNotes(editingPrayer.answerNotes || '');\
    \} else \{\
      setTitle('');\
      setDescription('');\
      setSelectedTags([]);\
      setLinkedPassage('');\
      setAnswerNotes('');\
    \}\
  \}, [editingPrayer, isOpen]);\
\
  if (!isOpen) return null;\
\
  const handleSubmit = (e: React.FormEvent) => \{\
    e.preventDefault();\
    \
    if (!title.trim()) \{\
      alert('Please enter a prayer title');\
      return;\
    \}\
\
    const prayerData: Omit<Prayer, 'id' | 'dateAdded' | 'isAnswered'> = \{\
      title: title.trim(),\
      description: description.trim(),\
      tags: selectedTags,\
      linkedPassage: linkedPassage.trim() || undefined,\
      answerNotes: answerNotes.trim() || undefined,\
      dateAnswered: isAnswering ? new Date().toISOString() : editingPrayer?.dateAnswered,\
    \};\
\
    onSave(prayerData);\
    onClose();\
  \};\
\
  const toggleTag = (tag: string) => \{\
    setSelectedTags(prev =>\
      prev.includes(tag)\
        ? prev.filter(t => t !== tag)\
        : [...prev, tag]\
    );\
  \};\
\
  const addCustomTag = () => \{\
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) \{\
      setSelectedTags(prev => [...prev, customTag.trim()]);\
      setCustomTag('');\
    \}\
  \};\
\
  return (\
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">\
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 backdrop-blur-xl p-6 shadow-2xl">\
        <button\
          onClick=\{onClose\}\
          className="absolute top-6 right-6 text-white/60 hover:text-white text-2xl w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-all"\
        >\
          \'d7\
        </button>\
\
        <div className="mb-6 pr-10">\
          <h2 className=\{`$\{playfair.className\} text-3xl font-bold mb-2 $\{isAnswering ? 'text-green-400' : 'text-[#FFD966]'\}`\}>\
            \{isAnswering \
              ? '\uc0\u9989  Mark Prayer as Answered' \
              : editingPrayer \
                ? '\uc0\u9999 \u65039  Edit Prayer' \
                : '\uc0\u55357 \u56911  Add New Prayer'\
            \}\
          </h2>\
          <p className="text-white/60 text-sm">\
            \{isAnswering \
              ? 'Share how God answered this prayer' \
              : 'Bring your requests to the Lord with thanksgiving'\
            \}\
          </p>\
        </div>\
\
        <form onSubmit=\{handleSubmit\} className="space-y-5">\
          <div>\
            <label htmlFor="title" className="block text-sm font-semibold text-white/90 mb-2">\
              Prayer Request *\
            </label>\
            <input\
              id="title"\
              type="text"\
              value=\{title\}\
              onChange=\{(e) => setTitle(e.target.value)\}\
              placeholder="e.g., For mom's healing, Job interview success..."\
              className="input"\
              required\
              disabled=\{isAnswering\}\
            />\
          </div>\
\
          \{!isAnswering && (\
            <div>\
              <label htmlFor="description" className="block text-sm font-semibold text-white/90 mb-2">\
                Details (Optional)\
              </label>\
              <textarea\
                id="description"\
                value=\{description\}\
                onChange=\{(e) => setDescription(e.target.value)\}\
                placeholder="Add more details about your prayer request..."\
                rows=\{4\}\
                className="input resize-none"\
              />\
            </div>\
          )\}\
\
          \{isAnswering && (\
            <div>\
              <label htmlFor="answerNotes" className="block text-sm font-semibold text-green-400 mb-2">\
                How God Answered This Prayer\
              </label>\
              <textarea\
                id="answerNotes"\
                value=\{answerNotes\}\
                onChange=\{(e) => setAnswerNotes(e.target.value)\}\
                placeholder="Share how God answered this prayer... What happened? How did He provide?"\
                rows=\{4\}\
                className="w-full rounded-2xl border-2 border-green-400/30 bg-green-900/20 px-4 py-3 text-base outline-none text-green-300 placeholder:text-green-700 focus:ring-2 focus:ring-green-400/50 focus:border-green-400 transition resize-none"\
              />\
            </div>\
          )\}\
\
          \{!isAnswering && (\
            <div>\
              <label className="block text-sm font-semibold text-white/90 mb-3">\
                Categories\
              </label>\
              <div className="flex flex-wrap gap-2 mb-3">\
                \{PRAYER_TAGS.map(tag => (\
                  <button\
                    key=\{tag\}\
                    type="button"\
                    onClick=\{() => toggleTag(tag)\}\
                    className=\{`\
                      rounded-full px-3 py-1.5 text-sm border-2 transition-all font-medium\
                      $\{selectedTags.includes(tag)\
                        ? 'bg-[#FFD966]/20 border-[#FFD966] text-[#FFD966]'\
                        : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'\
                      \}\
                    `\}\
                  >\
                    \{tag\}\
                  </button>\
                ))\}\
              </div>\
              \
              <div className="flex gap-2">\
                <input\
                  type="text"\
                  value=\{customTag\}\
                  onChange=\{(e) => setCustomTag(e.target.value)\}\
                  onKeyPress=\{(e) => e.key === 'Enter' && (e.preventDefault(), addCustomTag())\}\
                  placeholder="Add custom category..."\
                  className="flex-1 rounded-2xl border-2 border-white/10 bg-white/5 px-4 py-2 text-sm outline-none text-white placeholder:text-white/40 focus:ring-2 focus:ring-[#FFD966]/50 focus:border-[#FFD966] transition"\
                />\
                <button\
                  type="button"\
                  onClick=\{addCustomTag\}\
                  className="btn rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10 transition-colors"\
                >\
                  Add\
                </button>\
              </div>\
            </div>\
          )\}\
\
          \{!isAnswering && (\
            <div>\
              <label htmlFor="linkedPassage" className="block text-sm font-semibold text-white/90 mb-2">\
                Link to Scripture (Optional)\
              </label>\
              <input\
                id="linkedPassage"\
                type="text"\
                value=\{linkedPassage\}\
                onChange=\{(e) => setLinkedPassage(e.target.value)\}\
                placeholder="e.g., Philippians 4:6-7, Psalm 23..."\
                className="input"\
              />\
              <p className="mt-1.5 text-xs text-white/50">\
                Link this prayer to a Bible passage for context\
              </p>\
            </div>\
          )\}\
\
          <div className="flex gap-3 pt-4">\
            <button\
              type="button"\
              onClick=\{onClose\}\
              className="flex-1 btn rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-white/80 hover:bg-white/10 transition-colors"\
            >\
              Cancel\
            </button>\
            <button\
              type="submit"\
              className=\{`\
                flex-1 btn rounded-2xl px-6 py-3 font-semibold transition-all\
                $\{isAnswering\
                  ? 'border-2 border-green-400/30 bg-green-400/10 text-green-400 hover:bg-green-400/20'\
                  : 'border-2 border-[#FFD966] bg-[#FFD966]/10 text-[#FFD966] hover:bg-[#FFD966]/20'\
                \}\
              `\}\
            >\
              \{isAnswering ? 'Mark as Answered' : editingPrayer ? 'Save Changes' : 'Add Prayer'\}\
            </button>\
          </div>\
        </form>\
      </div>\
    </div>\
  );\
\}\
EOF\
\
echo "\uc0\u9989  components/AddPrayerModal.tsx created!"\
echo ""\
\
# Note: The page.tsx file is too large for a single cat command, so we'll split it\
echo "\uc0\u55357 \u56541  Creating app/prayer-journal/page.tsx..."\
cat > app/prayer-journal/page.tsx << 'EOFPAGE'\
'use client';\
\
import \{ useState, useEffect \} from 'react';\
import \{ Playfair_Display \} from 'next/font/google';\
import \{ PrayerCard \} from '@/components/PrayerCard';\
import \{ AddPrayerModal \} from '@/components/AddPrayerModal';\
import \{\
  Prayer,\
  PrayerFilter,\
  getPrayers,\
  addPrayer,\
  updatePrayer,\
  deletePrayer,\
  markAnswered,\
  filterPrayers,\
  searchPrayers,\
  getPrayerStats,\
\} from '@/lib/prayerStorage';\
\
const playfair = Playfair_Display(\{\
  subsets: ['latin'],\
  weight: ['400', '600', '700'],\
  display: 'swap',\
\});\
\
export default function PrayerJournalPage() \{\
  const [prayers, setPrayers] = useState<Prayer[]>([]);\
  const [filter, setFilter] = useState<PrayerFilter>('all');\
  const [searchQuery, setSearchQuery] = useState('');\
  const [isModalOpen, setIsModalOpen] = useState(false);\
  const [editingPrayer, setEditingPrayer] = useState<Prayer | null>(null);\
  const [isAnswering, setIsAnswering] = useState(false);\
\
  useEffect(() => \{\
    setPrayers(getPrayers());\
  \}, []);\
\
  const getDisplayedPrayers = () => \{\
    let result = prayers;\
    result = filterPrayers(result, filter);\
    if (searchQuery.trim()) \{\
      result = searchPrayers(result, searchQuery);\
    \}\
    return result;\
  \};\
\
  const displayedPrayers = getDisplayedPrayers();\
  const stats = getPrayerStats(prayers);\
\
  const handleAddPrayer = () => \{\
    setEditingPrayer(null);\
    setIsAnswering(false);\
    setIsModalOpen(true);\
  \};\
\
  const handleEditPrayer = (prayer: Prayer) => \{\
    setEditingPrayer(prayer);\
    setIsAnswering(false);\
    setIsModalOpen(true);\
  \};\
\
  const handleMarkAnswered = (prayer: Prayer) => \{\
    setEditingPrayer(prayer);\
    setIsAnswering(true);\
    setIsModalOpen(true);\
  \};\
\
  const handleSavePrayer = (prayerData: Omit<Prayer, 'id' | 'dateAdded' | 'isAnswered'>) => \{\
    if (isAnswering && editingPrayer) \{\
      markAnswered(editingPrayer.id, prayerData.answerNotes);\
    \} else if (editingPrayer) \{\
      updatePrayer(editingPrayer.id, prayerData);\
    \} else \{\
      addPrayer(prayerData);\
    \}\
    setPrayers(getPrayers());\
    setEditingPrayer(null);\
    setIsAnswering(false);\
  \};\
\
  const handleDeletePrayer = (id: string) => \{\
    deletePrayer(id);\
    setPrayers(getPrayers());\
  \};\
\
  const handleExportPDF = async () => \{\
    try \{\
      const \{ jsPDF \} = await import('jspdf');\
      const doc = new jsPDF();\
      const pageHeight = doc.internal.pageSize.height;\
      let yPosition = 20;\
      \
      doc.setFontSize(20);\
      doc.text('My Prayer Journal', 20, yPosition);\
      yPosition += 10;\
      \
      doc.setFontSize(12);\
      doc.text(`Total Prayers: $\{stats.total\}`, 20, yPosition);\
      yPosition += 7;\
      doc.text(`Active: $\{stats.active\} | Answered: $\{stats.answered\}`, 20, yPosition);\
      yPosition += 15;\
      \
      displayedPrayers.forEach((prayer) => \{\
        if (yPosition > pageHeight - 40) \{\
          doc.addPage();\
          yPosition = 20;\
        \}\
        \
        doc.setFontSize(14);\
        doc.text(`$\{prayer.isAnswered ? '\uc0\u10003 ' : '\u9675 '\} $\{prayer.title\}`, 20, yPosition);\
        yPosition += 7;\
        \
        doc.setFontSize(10);\
        if (prayer.description) \{\
          const lines = doc.splitTextToSize(prayer.description, 170);\
          doc.text(lines, 20, yPosition);\
          yPosition += lines.length * 5;\
        \}\
        \
        if (prayer.tags.length > 0) \{\
          doc.text(`Tags: $\{prayer.tags.join(', ')\}`, 20, yPosition);\
          yPosition += 5;\
        \}\
        \
        if (prayer.isAnswered && prayer.dateAnswered) \{\
          doc.text(`Answered: $\{new Date(prayer.dateAnswered).toLocaleDateString()\}`, 20, yPosition);\
          yPosition += 5;\
          \
          if (prayer.answerNotes) \{\
            const answerLines = doc.splitTextToSize(`How God answered: $\{prayer.answerNotes\}`, 170);\
            doc.text(answerLines, 20, yPosition);\
            yPosition += answerLines.length * 5;\
          \}\
        \} else \{\
          doc.text(`Started: $\{new Date(prayer.dateAdded).toLocaleDateString()\}`, 20, yPosition);\
          yPosition += 5;\
        \}\
        \
        yPosition += 10;\
      \});\
      \
      doc.save('prayer-journal.pdf');\
    \} catch (error) \{\
      console.error('Error exporting PDF:', error);\
      alert('Error exporting to PDF. Please try again.');\
    \}\
  \};\
\
  return (\
    <div className="min-h-screen">\
      <div className="container mx-auto max-w-5xl px-4 py-8">\
        <div className="mb-8">\
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">\
            <div>\
              <h1 className=\{`$\{playfair.className\} text-4xl md:text-5xl font-bold text-[#FFD966] mb-2`\}>\
                \uc0\u55357 \u56911  Prayer Journal\
              </h1>\
              <p className="text-white/70 text-lg">\
                Cast all your anxieties on Him, because He cares for you. \'97 1 Peter 5:7\
              </p>\
            </div>\
            \
            <button\
              onClick=\{handleAddPrayer\}\
              className="btn rounded-2xl border-2 border-[#FFD966] bg-[#FFD966]/10 px-6 py-3 text-[#FFD966] font-semibold hover:bg-[#FFD966]/20 transition-colors whitespace-nowrap"\
            >\
              + Add Prayer\
            </button>\
          </div>\
\
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">\
            <div className="card rounded-2xl p-5">\
              <div className="text-3xl font-bold text-[#FFD966] mb-1">\{stats.total\}</div>\
              <div className="text-sm text-white/60">Total Prayers</div>\
            </div>\
            <div className="card rounded-2xl p-5">\
              <div className="text-3xl font-bold text-blue-400 mb-1">\{stats.active\}</div>\
              <div className="text-sm text-white/60">Active</div>\
            </div>\
            <div className="card rounded-2xl p-5">\
              <div className="text-3xl font-bold text-green-400 mb-1">\{stats.answered\}</div>\
              <div className="text-sm text-white/60">Answered</div>\
            </div>\
            <div className="card rounded-2xl p-5">\
              <div className="text-3xl font-bold text-purple-400 mb-1">\{stats.recentlyAnswered\}</div>\
              <div className="text-sm text-white/60">Last 30 Days</div>\
            </div>\
          </div>\
\
          <div className="flex flex-col md:flex-row gap-4 mb-6">\
            <div className="flex gap-2 flex-wrap">\
              <button\
                onClick=\{() => setFilter('all')\}\
                className=\{`rounded-2xl px-5 py-2.5 text-sm font-medium border-2 transition-all $\{filter === 'all' ? 'bg-[#FFD966]/20 border-[#FFD966] text-[#FFD966]' : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'\}`\}\
              >\
                All (\{prayers.length\})\
              </button>\
              <button\
                onClick=\{() => setFilter('active')\}\
                className=\{`rounded-2xl px-5 py-2.5 text-sm font-medium border-2 transition-all $\{filter === 'active' ? 'bg-blue-400/20 border-blue-400 text-blue-400' : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'\}`\}\
              >\
                Active (\{stats.active\})\
              </button>\
              <button\
                onClick=\{() => setFilter('answered')\}\
                className=\{`rounded-2xl px-5 py-2.5 text-sm font-medium border-2 transition-all $\{filter === 'answered' ? 'bg-green-400/20 border-green-400 text-green-400' : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20'\}`\}\
              >\
                Answered (\{stats.answered\})\
              </button>\
            </div>\
\
            <div className="flex-1">\
              <input\
                type="text"\
                value=\{searchQuery\}\
                onChange=\{(e) => setSearchQuery(e.target.value)\}\
                placeholder="\uc0\u55357 \u56589  Search prayers..."\
                className="input w-full"\
              />\
            </div>\
\
            \{displayedPrayers.length > 0 && (\
              <button\
                onClick=\{handleExportPDF\}\
                className="btn rounded-2xl border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80 hover:bg-white/10 transition-colors whitespace-nowrap"\
              >\
                \uc0\u55357 \u56516  Export PDF\
              </button>\
            )\}\
          </div>\
        </div>\
\
        \{displayedPrayers.length === 0 ? (\
          <div className="card rounded-2xl p-12 text-center">\
            <div className="text-6xl mb-4">\uc0\u55357 \u56911 </div>\
            <h3 className=\{`$\{playfair.className\} text-2xl font-semibold text-white mb-2`\}>\
              \{searchQuery ? 'No prayers found' : filter === 'answered' ? 'No answered prayers yet' : 'No prayers yet'\}\
            </h3>\
            <p className="text-white/60 mb-6 max-w-md mx-auto">\
              \{searchQuery ? 'Try a different search term' : filter === 'answered' ? 'Prayers you mark as answered will appear here' : 'Start by adding your first prayer request'\}\
            </p>\
            \{!searchQuery && filter === 'all' && (\
              <button\
                onClick=\{handleAddPrayer\}\
                className="btn rounded-2xl border-2 border-[#FFD966] bg-[#FFD966]/10 px-6 py-3 text-[#FFD966] font-semibold hover:bg-[#FFD966]/20 transition-colors"\
              >\
                + Add Your First Prayer\
              </button>\
            )\}\
          </div>\
        ) : (\
          <div className="grid gap-4">\
            \{displayedPrayers.map(prayer => (\
              <PrayerCard\
                key=\{prayer.id\}\
                prayer=\{prayer\}\
                onEdit=\{handleEditPrayer\}\
                onDelete=\{handleDeletePrayer\}\
                onMarkAnswered=\{handleMarkAnswered\}\
              />\
            ))\}\
          </div>\
        )\}\
\
        \{prayers.length > 0 && (\
          <div className="card rounded-2xl p-8 text-center mt-8">\
            <p className="text-white/80 italic text-lg leading-relaxed mb-3">\
              "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving \
              let your requests be made known to God. And the peace of God, which surpasses all understanding, \
              will guard your hearts and your minds in Christ Jesus."\
            </p>\
            <p className="text-[#FFD966] font-semibold text-lg">\'97 Philippians 4:6-7 (ESV)</p>\
          </div>\
        )\}\
      </div>\
\
      <AddPrayerModal\
        isOpen=\{isModalOpen\}\
        onClose=\{() => \{\
          setIsModalOpen(false);\
          setEditingPrayer(null);\
          setIsAnswering(false);\
        \}\}\
        onSave=\{handleSavePrayer\}\
        editingPrayer=\{editingPrayer\}\
        isAnswering=\{isAnswering\}\
      />\
    </div>\
  );\
\}\
EOFPAGE\
\
echo "\uc0\u9989  app/prayer-journal/page.tsx created!"\
echo ""\
\
echo "\uc0\u9989  All files created successfully!"\
echo ""\
echo "\uc0\u55357 \u56523  NEXT STEPS:"\
echo ""\
echo "1. Add Prayer Journal link to your HeaderBar.tsx navigation menu:"\
echo "   Add between 'My Library' and 'Study Courses':"\
echo ""\
echo "   <Link"\
echo "     href=\\"/prayer-journal\\""\
echo "     className=\\"block rounded-lg px-3 py-2 hover:bg-white/10 transition-colors\\""\
echo "     onClick=\{() => setOpen(false)\}"\
echo "   >"\
echo "     \uc0\u55357 \u56911  Prayer Journal"\
echo "   </Link>"\
echo ""\
echo "2. Test the feature:"\
echo "   Visit http://localhost:3000/prayer-journal"\
echo ""\
echo "\uc0\u55356 \u57225  Prayer Journal installation complete!"\
echo "\uc0\u55357 \u56534  See REVISED_QUICK_START.md for more details"\
EOF\
\
chmod +x install-prayer-journal.sh\
\
echo "\uc0\u9989  Installation script created!"\
echo ""\
\
echo "\uc0\u55357 \u56960  Script is ready at: install-prayer-journal.sh"\
echo ""\
echo "To run it:"\
echo "  chmod +x install-prayer-journal.sh"\
echo "  ./install-prayer-journal.sh"}