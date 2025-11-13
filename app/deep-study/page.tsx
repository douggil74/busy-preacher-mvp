// app/deep-study/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Playfair_Display } from "next/font/google";
import { useEffect, useState, useMemo, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { SmartLoader } from "@/components/SmartLoader";
import { card, button, input, typography, cn } from '@/lib/ui-constants';
import WordStudyModal from "@/components/WordStudyModal";
import { PastorNote } from '@/components/PastorNote';

const playfair = Playfair_Display({
  weight: ["600", "700"],
  subsets: ["latin"],
  display: "swap",
});

interface SavedStudy {
  reference: string;
  timestamp: number;
}

interface StudyNote {
  reference: string;
  note: string;
  timestamp: number;
}

interface Video {
  id: string;
  title: string;
  description: string;
  channelTitle: string;
  publishedAt: string;
  thumbnail: string;
  duration: string;
  viewCount: string;
}

// Bible Commentary Service Class
class BibleCommentaryService {
  private bookMappings: Record<string, { code: string; name: string; number: number }>;
  private cache: Map<string, { data: any; timestamp: number }>;
  private cacheTimeout: number;

  constructor() {
    this.bookMappings = {
      genesis: { code: 'gen', name: 'Genesis', number: 1 },
      exodus: { code: 'exo', name: 'Exodus', number: 2 },
      leviticus: { code: 'lev', name: 'Leviticus', number: 3 },
      numbers: { code: 'num', name: 'Numbers', number: 4 },
      deuteronomy: { code: 'deu', name: 'Deuteronomy', number: 5 },
      joshua: { code: 'jos', name: 'Joshua', number: 6 },
      judges: { code: 'jdg', name: 'Judges', number: 7 },
      ruth: { code: 'rut', name: 'Ruth', number: 8 },
      '1samuel': { code: '1sa', name: '1 Samuel', number: 9 },
      '2samuel': { code: '2sa', name: '2 Samuel', number: 10 },
      '1kings': { code: '1ki', name: '1 Kings', number: 11 },
      '2kings': { code: '2ki', name: '2 Kings', number: 12 },
      '1chronicles': { code: '1ch', name: '1 Chronicles', number: 13 },
      '2chronicles': { code: '2ch', name: '2 Chronicles', number: 14 },
      ezra: { code: 'ezr', name: 'Ezra', number: 15 },
      nehemiah: { code: 'neh', name: 'Nehemiah', number: 16 },
      esther: { code: 'est', name: 'Esther', number: 17 },
      job: { code: 'job', name: 'Job', number: 18 },
      psalms: { code: 'psa', name: 'Psalms', number: 19 },
      psalm: { code: 'psa', name: 'Psalms', number: 19 },
      proverbs: { code: 'pro', name: 'Proverbs', number: 20 },
      ecclesiastes: { code: 'ecc', name: 'Ecclesiastes', number: 21 },
      songofsolomon: { code: 'sng', name: 'Song of Solomon', number: 22 },
      isaiah: { code: 'isa', name: 'Isaiah', number: 23 },
      jeremiah: { code: 'jer', name: 'Jeremiah', number: 24 },
      lamentations: { code: 'lam', name: 'Lamentations', number: 25 },
      ezekiel: { code: 'eze', name: 'Ezekiel', number: 26 },
      daniel: { code: 'dan', name: 'Daniel', number: 27 },
      hosea: { code: 'hos', name: 'Hosea', number: 28 },
      joel: { code: 'jol', name: 'Joel', number: 29 },
      amos: { code: 'amo', name: 'Amos', number: 30 },
      obadiah: { code: 'oba', name: 'Obadiah', number: 31 },
      jonah: { code: 'jon', name: 'Jonah', number: 32 },
      micah: { code: 'mic', name: 'Micah', number: 33 },
      nahum: { code: 'nah', name: 'Nahum', number: 34 },
      habakkuk: { code: 'hab', name: 'Habakkuk', number: 35 },
      zephaniah: { code: 'zep', name: 'Zephaniah', number: 36 },
      haggai: { code: 'hag', name: 'Haggai', number: 37 },
      zechariah: { code: 'zec', name: 'Zechariah', number: 38 },
      malachi: { code: 'mal', name: 'Malachi', number: 39 },
      matthew: { code: 'mat', name: 'Matthew', number: 40 },
      mark: { code: 'mrk', name: 'Mark', number: 41 },
      luke: { code: 'luk', name: 'Luke', number: 42 },
      john: { code: 'jhn', name: 'John', number: 43 },
      acts: { code: 'act', name: 'Acts', number: 44 },
      romans: { code: 'rom', name: 'Romans', number: 45 },
      '1corinthians': { code: '1co', name: '1 Corinthians', number: 46 },
      '2corinthians': { code: '2co', name: '2 Corinthians', number: 47 },
      galatians: { code: 'gal', name: 'Galatians', number: 48 },
      ephesians: { code: 'eph', name: 'Ephesians', number: 49 },
      philippians: { code: 'php', name: 'Philippians', number: 50 },
      colossians: { code: 'col', name: 'Colossians', number: 51 },
      '1thessalonians': { code: '1th', name: '1 Thessalonians', number: 52 },
      '2thessalonians': { code: '2th', name: '2 Thessalonians', number: 53 },
      '1timothy': { code: '1ti', name: '1 Timothy', number: 54 },
      '2timothy': { code: '2ti', name: '2 Timothy', number: 55 },
      titus: { code: 'tit', name: 'Titus', number: 56 },
      philemon: { code: 'phm', name: 'Philemon', number: 57 },
      hebrews: { code: 'heb', name: 'Hebrews', number: 58 },
      james: { code: 'jas', name: 'James', number: 59 },
      '1peter': { code: '1pe', name: '1 Peter', number: 60 },
      '2peter': { code: '2pe', name: '2 Peter', number: 61 },
      '1john': { code: '1jn', name: '1 John', number: 62 },
      '2john': { code: '2jn', name: '2 John', number: 63 },
      '3john': { code: '3jn', name: '3 John', number: 64 },
      jude: { code: 'jud', name: 'Jude', number: 65 },
      revelation: { code: 'rev', name: 'Revelation', number: 66 }
    };

    this.cache = new Map();
    this.cacheTimeout = 3600000;
  }

  parseReference(reference: string) {
    let match = reference.match(/^(.+?)\s+(\d+):(\d+)(?:-(\d+))?$/i);
    
    if (!match) {
      match = reference.match(/^(.+?)\s+(\d+)$/i);
      if (!match) return null;
      
      const [, book, chapter] = match;
      const normalizedBook = book.trim().toLowerCase().replace(/\s+/g, '');
      const bookInfo = this.bookMappings[normalizedBook];
      
      if (!bookInfo) return null;

      return {
        book: bookInfo.code,
        bookName: bookInfo.name,
        bookNumber: bookInfo.number,
        chapter: parseInt(chapter),
        verseStart: 1,
        verseEnd: 1,
        normalizedBook,
        isChapter: true
      };
    }

    const [, book, chapter, verseStart, verseEnd] = match;
    const normalizedBook = book.trim().toLowerCase().replace(/\s+/g, '');
    const bookInfo = this.bookMappings[normalizedBook];
    
    if (!bookInfo) return null;

    return {
      book: bookInfo.code,
      bookName: bookInfo.name,
      bookNumber: bookInfo.number,
      chapter: parseInt(chapter),
      verseStart: parseInt(verseStart),
      verseEnd: verseEnd ? parseInt(verseEnd) : parseInt(verseStart),
      normalizedBook
    };
  }

  async getAdditionalCommentaries(reference: string) {
    const commentaries: any = {};
    
    const stored = this.getStoredCommentary(reference);
    if (stored) commentaries.classic = stored;

    const crossRefs = this.getCrossReferences(reference);
    if (crossRefs.length > 0) commentaries.crossReferences = crossRefs;

    const parsed = this.parseReference(reference);
    if (parsed) {
      commentaries.studyQuestions = this.generateStudyQuestions(reference, parsed);
    }

    return commentaries;
  }

  getStoredCommentary(reference: string) {
    const parsed = this.parseReference(reference);
    if (!parsed) return null;
    
const storedCommentaries: Record<string, any> = {
  'john3:16': {
    matthewHenry: 'God so loved the world - Here commences the most important verse in all Scripture. The Father shows his love in giving his Son for us. This gift speaks to the magnitude of divine love - not merely affection, but sacrificial action. The world here means all of humanity, not just the elect, showing the universal scope of God\'s redemptive plan.',
    adamClarke: 'For God so loved the world - Such a love as that which induced God to give his only begotten Son to die for the world could not be described in any words less energetic than these. This demonstrates the amazing contrast between the state of man and the grace of God.',
    albertBarnes: 'For God so loved the world - This expresses the reason why God sent his Son. It was love - love that was manifested to an undeserving and rebellious world. The term world here means the whole human race, without distinction of Jew or Gentile. That he gave - Not lent, but gave freely, with no prospect of repayment.',
    johnGill: 'For God so loved the world - The objects of this love are described as the world, which cannot design the whole world, or all the individuals of mankind; for though Christ died for all in some sense, yet not in the sense here intended, which is to save them from perishing and give them everlasting life. The persons intended are the chosen of God, the children that were given to Christ.'
  },
  'psalm23:1': {
    matthewHenry: 'The Lord is my shepherd - God\'s people have always looked upon him as their shepherd. He leads, feeds, and protects as a shepherd does his flock. David had himself been a shepherd, and knew both the needs of the sheep and the care of a good shepherd.',
    adamClarke: 'The Lord is my shepherd - There is nothing I can need while under such a shepherd. He knows what pasture is best for me, and he will guide me to it in the proper season.',
    albertBarnes: 'The Lord is my shepherd - The Hebrew word rendered shepherd means to feed, and hence one who feeds a flock. The office was regarded as most honorable, and was often assumed by princes and kings. The idea here is tender, beautiful, and full of consolation.',
    johnGill: 'The Lord is my shepherd - Not only as he is the Creator and Governor of all, but as he is the covenant God of his people. Christ is peculiarly called the Shepherd of the sheep; he is the good, the great, and chief Shepherd, who laid down his life for the sheep.'
  },
  'romans8:28': {
    matthewHenry: 'All things work together for good - This includes not only positive circumstances but even afflictions and temptations. They work together like ingredients in medicine, where each component serves the greater healing purpose.',
    adamClarke: 'We know that all things work together for good - All occurrences in life, whether prosperous or adverse, are under Divine direction, and are working for the spiritual and eternal good of those who love God.',
    albertBarnes: 'All things work together for good - Not that all things are good, but they work together for good. Afflictions, persecutions, sickness, losses - all shall be made to contribute to the welfare of the righteous. God has infinite power to control them and direct them to the promotion of his glory and the salvation of his people.',
    johnGill: 'All things work together for good - Not only things that are good, but even those that are evil. Afflictions, temptations, desertions, and all other adverse dispensations of Providence work together for good. They work together in perfect harmony, like the wheels in a machine, all contributing to the same end.'
  },
  'genesis1:1': {
    matthewHenry: 'In the beginning - That is, in the beginning of time, when God first created all things. The beginning of the creation is the beginning of time itself, for before the creation there was nothing but eternity.',
    adamClarke: 'In the beginning God created - The word Elohim, which we translate God, is the plural of El or Eloah. This plural form is significant, hinting at the Trinity even in the first verse of Scripture.',
    albertBarnes: 'In the beginning - This phrase refers to the commencement of the material universe. Before this beginning there was God alone. The act of creation was the first putting forth of divine energy in the production of physical nature.',
    johnGill: 'In the beginning God created - By the beginning is meant, not the beginning of God, for he has no beginning, but the beginning of time. When the world was made, then time began; and this was now near six thousand years ago. God was before all time, from everlasting.'
  },
  'philippians4:13': {
    matthewHenry: 'I can do all things through Christ - Not by my own strength, but through Christ who strengthens me. This is not about personal achievement but about enduring all circumstances through divine enablement.',
    adamClarke: 'I can do all things - I can perform all the duties required of me, and bear all the trials and difficulties laid upon me, through the power of Christ supporting me.',
    albertBarnes: 'I can do all things - Not absolutely all things, but all that is needful for me to do in my circumstances. I can bear all trials, perform all duties, and meet all the responsibilities of my station through Christ who strengthens me.',
    johnGill: 'I can do all things - Both as a Christian and as an apostle. I can do everything that God calls me to do, perform every duty, bear every burden, and suffer every affliction, through Christ which strengtheneth me. Not in my own strength, but through the strength which Christ supplies.'
  },
  'hebrews11:1': {
    matthewHenry: 'Faith is the substance of things hoped for - Faith realizes the blessings of which hope speaks. It is a firm persuasion and expectation that God will perform all He has promised in Christ. It demonstrates to the eye of the mind the reality of things that cannot be discerned by our bodily senses.',
    adamClarke: 'Faith is the substance of things hoped for - Faith is the basis, the foundation on which all our hopes of eternal blessedness are built. The evidence of things not seen - It is that demonstration which we have from God that the spiritual world exists, though we cannot see it with our bodily eyes. Faith is both the evidence and the conviction of the soul concerning spiritual and eternal things.',
    albertBarnes: 'Faith is the substance of things hoped for - Faith gives reality or substance to things that are not seen. It is not a mere hope or opinion, but a firm conviction that what God has promised will certainly come to pass. It makes future things present, and invisible things visible to the mind.',
    johnGill: 'Faith is the substance of things hoped for - By faith we have a present enjoyment of future blessings. Faith gives them substance and reality in the heart before they are actually possessed. The evidence of things not seen - Faith is the eye that sees invisible things, the hand that takes hold of spiritual blessings, the foot that walks in the way of holiness.'
  },
  'hebrews11:2': {
    matthewHenry: 'For by it the elders obtained a good report - The ancient believers, the patriarchs and prophets, were accepted by God through their faith. Their faith is what made them pleasing to God and worthy of commendation.',
    adamClarke: 'The elders obtained a good report - The patriarchs and ancient believers were borne witness to by God himself as persons of eminent faith and piety, and through this faith they obtained the promises.',
    albertBarnes: 'For by it the elders obtained a good report - The ancient worthies, the fathers and saints of the Old Testament, obtained an honorable testimony from God. It was by faith that they were approved and accepted.',
    johnGill: 'By it the elders obtained a good report - They had witness borne to them by God concerning their faith and good works flowing from it. They were commended and approved by God as believers, and as such had a title to eternal life.'
  },
  'hebrews11:3': {
    matthewHenry: 'Through faith we understand that the worlds were framed by the word of God - It is by faith that we believe the Genesis account of creation. We believe that the visible universe was made by God\'s invisible power, by His word or command.',
    adamClarke: 'Through faith we understand - By faith we perceive that not only the matter of the universe was created by God, but that it was all modeled into order and beauty by His own hand, so that things which are seen were made from things which do not appear to the eye.',
    albertBarnes: 'Through faith we understand that the worlds were framed - We learn from revelation that the universe was formed by the divine command. This is not a matter of philosophical speculation, but of divine testimony received by faith.',
    johnGill: 'Through faith we understand that the worlds were framed by the word of God - Not by the power of our reason, but by divine revelation received by faith, we know that God created all things. The visible world was made out of nothing by the almighty word and power of God.'
  },
  '1corinthians13:4': {
    matthewHenry: 'Love suffereth long - Love is patient and endures injuries without seeking revenge. It is kind in action, showing goodness and benevolence to all. Love does not envy the prosperity of others, nor is it puffed up with pride.',
    adamClarke: 'Charity suffereth long - Love is long-suffering; it can endure much provocation without being provoked. It is kind, ever ready to do good to all, even to those who do not deserve it.',
    albertBarnes: 'Charity suffereth long - Love is patient under injuries and provocations. It endures without complaint. And is kind - It is benevolent, gentle, tender in feeling and in manner. Envieth not - It does not pain at the good of others, nor desire to deprive them of their enjoyments.',
    johnGill: 'Charity suffereth long - It bears all injuries and affronts with patience. It is not easily provoked to anger or resentment. And is kind - It is beneficent, does good to all, shows tenderness and compassion. Charity envieth not - It does not grieve at the prosperity and happiness of others, but rejoices in their welfare.'
  },
  '1corinthians13:5': {
    matthewHenry: 'Love does not behave unseemly - It is not rude or indecent in conduct. It seeks not its own advantage at the expense of others, is not easily provoked to anger, and keeps no record of wrongs.',
    adamClarke: 'Doth not behave itself unseemly - Love is decent and orderly in all its acts. It seeks not selfish ends, is not irritable, and takes no account of evil done to it.',
    albertBarnes: 'Doth not behave itself unseemly - It is not rude, coarse, or indecorous in behavior. Seeketh not her own - Does not pursue selfish interests, but regards the welfare of others. Is not easily provoked - Is not quick to anger, does not become irritated or exasperated.',
    johnGill: 'Doth not behave itself unseemly - Love acts in a proper, becoming manner in all circumstances. Seeketh not her own - It does not insist on its own rights, but considers the good of others. Is not easily provoked - It is not soon angry, not quick to take offense.'
  },
  '1corinthians13:6': {
    matthewHenry: 'Love rejoices not in iniquity - It takes no pleasure in seeing others fall into sin, but rejoices when truth prevails and righteousness is upheld.',
    adamClarke: 'Rejoiceth not in iniquity - Love has no fellowship with sin, does not rejoice when others fall, but rejoices in the truth and its triumph.',
    albertBarnes: 'Rejoiceth not in iniquity - Does not rejoice when others do wrong, or when they fall into sin. But rejoiceth in the truth - Rejoices when truth prevails, when justice is done, when righteousness triumphs.',
    johnGill: 'Rejoiceth not in iniquity - Love takes no pleasure in sin, neither in committing it nor in seeing others commit it. But rejoiceth in the truth - In the Gospel of truth, in the practice of truth and righteousness, and in the success and spread of truth.'
  },
  '1corinthians13:7': {
    matthewHenry: 'Love bears all things - It covers the faults of others with silence and patience, believes the best of people, hopes for their improvement, and endures all trials.',
    adamClarke: 'Beareth all things - Love can bear all injuries and affronts without complaint, believing all things that tend to the advantage of others.',
    albertBarnes: 'Beareth all things - Bears all wrongs and injuries without retaliation. Believeth all things - Is disposed to put the best construction on everything, to believe that things are as good as can be. Hopeth all things - Always hopes for the best, for the reformation and salvation of others.',
    johnGill: 'Beareth all things - Love covers a multitude of sins, bears with the infirmities of the weak. Believeth all things - Is not suspicious, but believes well of others. Hopeth all things - Hopes the best of everyone, hopes for their conversion and perseverance. Endureth all things - Bears up under every burden and trial.'
  },
  '1corinthians13:8': {
    matthewHenry: 'Love never fails - While prophecies will cease and knowledge will pass away, love abides forever. It is the eternal principle that will outlast all temporal gifts.',
    adamClarke: 'Charity never faileth - Love never falls off or becomes useless, while prophecies and tongues shall cease and knowledge shall be rendered unnecessary.',
    albertBarnes: 'Charity never faileth - Love shall never cease or come to an end. It is permanent, enduring, eternal. Whether there be prophecies, they shall fail - Shall cease, shall come to an end. The office of the prophet shall be unnecessary when the truth is fully revealed.',
    johnGill: 'Charity never faileth - Love never falls away, never becomes extinct. It will continue forever in heaven. But whether there be prophecies, they shall fail - The gift of prophecy will cease when there is no more need for it in the perfect state.'
  }
};
    if (parsed.verseEnd > parsed.verseStart) {
      let combinedMH = '';
      let combinedAC = '';
      let foundAny = false;
      
      for (let verse = parsed.verseStart; verse <= parsed.verseEnd; verse++) {
        const key = `${parsed.normalizedBook}${parsed.chapter}:${verse}`;
        const commentary = storedCommentaries[key];
        
        if (commentary) {
          foundAny = true;
          if (commentary.matthewHenry) {
            combinedMH += `\n\n**Verse ${verse}:** ${commentary.matthewHenry}`;
          }
          if (commentary.adamClarke) {
            combinedAC += `\n\n**Verse ${verse}:** ${commentary.adamClarke}`;
          }
        }
      }
      
      if (foundAny) {
        return {
          matthewHenry: combinedMH.trim(),
          adamClarke: combinedAC.trim()
        };
      }
      return null;
    }

    const key = `${parsed.normalizedBook}${parsed.chapter}:${parsed.verseStart}`;
    return storedCommentaries[key] || null;
  }

  getCrossReferences(reference: string) {
    const parsed = this.parseReference(reference);
    if (!parsed) return [];

    const crossRefs: Record<string, string[]> = {
      'john3:16': ['Romans 5:8', '1 John 4:9-10', '2 Corinthians 5:21', 'Isaiah 53:5-6', 'Ephesians 2:4-5'],
      'psalm23:1': ['John 10:11', 'Isaiah 40:11', 'Ezekiel 34:23', '1 Peter 2:25', 'Hebrews 13:20'],
      'genesis1:1': ['John 1:1-3', 'Hebrews 11:3', 'Psalm 33:6', 'Colossians 1:16', 'Revelation 4:11'],
      'romans8:28': ['Genesis 50:20', 'Romans 8:29-30', '1 Corinthians 2:9', 'Ephesians 1:11', '2 Timothy 1:9'],
      'philippians4:13': ['2 Corinthians 12:9-10', 'John 15:5', 'Colossians 1:11', 'Ephesians 3:16', 'Isaiah 40:29'],
      '1corinthians13:4': ['Romans 12:9-10', 'Galatians 5:22-23', 'Ephesians 4:2', 'Colossians 3:12-14', 'James 3:17'],
      '1corinthians13:5': ['Philippians 2:3-4', 'Romans 12:10', '1 Peter 4:8'],
      '1corinthians13:6': ['Romans 1:32', 'Psalm 119:136', '3 John 1:4'],
      '1corinthians13:7': ['1 Peter 4:8', 'Proverbs 10:12', '1 Thessalonians 5:8'],
      '1corinthians13:8': ['1 Peter 1:25', 'Romans 8:35-39', 'Hebrews 13:1'],
      'hebrews11:1': ['2 Corinthians 4:18', '2 Corinthians 5:7', 'Romans 8:24-25', 'Hebrews 6:11-12', '1 Peter 1:8-9'],
      'hebrews11:2': ['Hebrews 11:39', 'Romans 4:3', 'Genesis 15:6', 'James 2:23'],
      'hebrews11:3': ['Genesis 1:1', 'Psalm 33:6', 'John 1:1-3', 'Colossians 1:16', '2 Peter 3:5']
    };

    const key = `${parsed.normalizedBook}${parsed.chapter}:${parsed.verseStart}`;
    return crossRefs[key] || [];
  }

  generateStudyQuestions(reference: string, parsed: any) {
    return [
      `As you meditate on ${reference}, what is God revealing to you about His character or His promises?`,
      `How does this passage challenge or encourage you in your current circumstances?`,
      `What would it look like to live out this truth in your daily life this week?`,
      `Is there a sin to confess, a promise to claim, or an example to follow in this passage?`,
      `How does this passage point you toward the gospel and deepen your love for Christ?`
    ];
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
}

import { APP_VERSION } from "@/lib/version";
export default function DeepStudyPage() {
  const mdComponents = {
  p: ({ children }: any) => (
    <p style={{ color: 'var(--text-primary)' }} className="leading-relaxed mb-3">{children}</p>
  ),
  strong: ({ children }: any) => (
      <strong style={{ color: 'var(--text-primary)' }} className="font-semibold">{children}</strong>
    ),
    em: ({ children }: any) => <em style={{ color: 'var(--text-primary)' }} className="italic">{children}</em>,
    ul: ({ children }: any) => (
      <ul style={{ color: 'var(--text-primary)' }} className="list-disc list-outside ml-5 space-y-1 mb-3">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol style={{ color: 'var(--text-primary)' }} className="list-decimal list-outside ml-5 space-y-1 mb-3">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li style={{ color: 'var(--text-primary)' }}>{children}</li>,
    blockquote: ({ children }: any) => (
      <blockquote style={{ borderLeftColor: 'var(--card-border)', color: 'var(--text-secondary)' }} className="border-l-4 pl-4 italic mb-3">
        {children}
      </blockquote>
    ),
    h3: ({ children }: any) => (
      <h3 style={{ color: 'var(--text-primary)' }} className="font-semibold text-lg mt-4 mb-2">{children}</h3>
    ),
    h4: ({ children }: any) => (
      <h4 style={{ color: 'var(--text-primary)' }} className="font-semibold mt-3 mb-2">{children}</h4>
    ),
    a: ({ href, children }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-yellow-400 hover:text-yellow-300 underline decoration-yellow-400/40 underline-offset-2"
      >
        {children}
      </a>
    ),
    br: () => <br />,
  };

  const [reference, setReference] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"translations" | "commentary" | "videos" | "tools">("translations");
  
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['translations']));
  const [commentaryLoading, setCommentaryLoading] = useState(false);
  const [videosLoading, setVideosLoading] = useState(false);
  
  const [aiLoading, setAiLoading] = useState(false);
  const [additionalCommentaries, setAdditionalCommentaries] = useState<any>(null);
  const [savedStudies, setSavedStudies] = useState<SavedStudy[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [currentNote, setCurrentNote] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [videos, setVideos] = useState<Video[]>([]);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const [bpRef, setBpRef] = useState("");
  const [bpText, setBpText] = useState("");
  const [bpError, setBpError] = useState<string | null>(null);
  const [esvLoading, setEsvLoading] = useState(false);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [hoverData, setHoverData] = useState<{ lemma: string; strongs: string; plain: string } | null>(null);
  const [currentBookName, setCurrentBookName] = useState<string>('');
  const [popoverPinned, setPopoverPinned] = useState(false);
  const [popoverPos, setPopoverPos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const popoverRef = useRef<HTMLDivElement>(null);
  const [showWordStudyModal, setShowWordStudyModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hoverLoading, setHoverLoading] = useState(false);
  const hoverTimer = useRef<NodeJS.Timeout | null>(null);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const commentaryService = new BibleCommentaryService();

  const loadCommentaryData = async () => {
    if (loadedTabs.has('commentary') || !reference.trim()) return;
    
    setCommentaryLoading(true);
    try {
      const [additional, apiCommentary] = await Promise.all([
        commentaryService.getAdditionalCommentaries(reference.trim()),
        fetch(`/api/commentary?reference=${encodeURIComponent(reference.trim())}`)
          .then(res => res.json())
          .catch(() => null)
      ]);
      
      const merged = {
        ...additional,
        ...(apiCommentary && { apiCommentary })
      };
      
      setAdditionalCommentaries(merged);
      setLoadedTabs(prev => new Set(prev).add('commentary'));
    } catch (error) {
      console.error('Error loading commentary:', error);
    } finally {
      setCommentaryLoading(false);
    }
  };

  const loadVideos = async () => {
    if (loadedTabs.has('videos') || !reference.trim()) return;
    
    setVideosLoading(true);
    try {
      const response = await fetch(`/api/youtube-videos?passage=${encodeURIComponent(reference.trim())}`);
      const data = await response.json();
      setVideos(data.videos || []);
      setLoadedTabs(prev => new Set(prev).add('videos'));
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideos([]);
    } finally {
      setVideosLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'commentary' && !loadedTabs.has('commentary')) {
      loadCommentaryData();
    } else if (activeTab === 'videos' && !loadedTabs.has('videos')) {
      loadVideos();
    }
  }, [activeTab, reference]);

  const handleSave = () => {
    saveCurrentStudy();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/deep-study?passage=${encodeURIComponent(reference.trim())}`;
    copyToClipboard(shareUrl);
    setCopied('share-link');
    setTimeout(() => setCopied(null), 2000);
  };

  useEffect(() => {
    const saved = localStorage.getItem("bc-saved-studies");
    if (saved) {
      try {
        setSavedStudies(JSON.parse(saved));
      } catch (e) {
        setSavedStudies([]);
      }
    }

    const savedNotes = localStorage.getItem("bc-notes");
    if (savedNotes) {
      try {
        setNotes(JSON.parse(savedNotes));
      } catch (e) {
        setNotes([]);
      }
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const passageParam = params.get("passage");
    if (passageParam) {
      setReference(passageParam);
      setTimeout(() => {
        const btn = document.getElementById("fetch-btn");
        if (btn) btn.click();
      }, 300);
    }
  }, []);

  const saveCurrentStudy = () => {
    const study: SavedStudy = {
      reference: reference.trim(),
      timestamp: Date.now(),
    };
    
    const updated = [study, ...savedStudies.filter(s => s.reference !== study.reference)].slice(0, 20);
    setSavedStudies(updated);
    localStorage.setItem("bc-saved-studies", JSON.stringify(updated));
  };

  const loadSavedStudy = (study: SavedStudy) => {
    setReference(study.reference);
    setShowHistory(false);
    setTimeout(() => {
      const btn = document.getElementById("fetch-btn");
      if (btn) btn.click();
    }, 100);
  };

  const deleteSavedStudy = (timestamp: number) => {
    const updated = savedStudies.filter(s => s.timestamp !== timestamp);
    setSavedStudies(updated);
    localStorage.setItem("bc-saved-studies", JSON.stringify(updated));
  };

  const saveNote = () => {
    if (!currentNote.trim()) return;
    
    const note: StudyNote = {
      reference: reference.trim() || "General Note",
      note: currentNote.trim(),
      timestamp: Date.now()
    };
    
    const updated = [note, ...notes].slice(0, 100);
    setNotes(updated);
    localStorage.setItem("bc-notes", JSON.stringify(updated));
    setCurrentNote("");
  };

  const deleteNote = (timestamp: number) => {
    const updated = notes.filter(n => n.timestamp !== timestamp);
    setNotes(updated);
    localStorage.setItem("bc-notes", JSON.stringify(updated));
  };

  const currentRefNotes = useMemo(() => {
    const ref = reference.trim();
    return notes.filter(n => n.reference === ref);
  }, [notes, reference]);
  
  const fetchBibleData = async () => {
    if (!reference.trim()) {
      setError("Please enter a Bible reference");
      return;
    }
  
    setError(null);
    setLoading(true);
    setAiLoading(true);
    setData(null);
    setAdditionalCommentaries(null);
    setVideos([]);
    setActiveVideo(null);
    setLoadedTabs(new Set(['translations']));
  
    try {
      const url = `/api/deep-study?reference=${encodeURIComponent(reference.trim())}`;
      const response = await fetch(url);
      const result = await response.json();
  
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
        
        const additional = await commentaryService.getAdditionalCommentaries(reference.trim());
        setAdditionalCommentaries(additional);
      }
    } catch (err: any) {
      console.error("Deep study error:", err);
      setError(err.message || "Failed to fetch Bible data. Please try again.");
    } finally {
      setLoading(false);
      setAiLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchBibleData();
    }
  };

  const quickRefs = [
    "John 3:16",
    "Psalm 23:1-6",
    "Romans 8:28-30",
    "Philippians 4:13",
    "1 Corinthians 13:4-8",
  ];

  const referencesToShow = savedStudies.length > 0 
    ? savedStudies.slice(0, 5).map(s => s.reference)
    : quickRefs;

  const handleQuickRef = (ref: string) => {
    setReference(ref);
    setTimeout(() => {
      const btn = document.getElementById("fetch-btn");
      if (btn) btn.click();
    }, 100);
  };

  const handleCopy = (text: string, id: string) => {
    copyToClipboard(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const saveCommentaryAsNote = (commentary: string, type: string) => {
    const note = {
      reference: reference.trim(),
      note: `${type} Commentary:\n\n${commentary}`,
      timestamp: Date.now()
    };
    
    const existingNotes = localStorage.getItem("bc-notes");
    const notes = existingNotes ? JSON.parse(existingNotes) : [];
    notes.unshift(note);
    localStorage.setItem("bc-notes", JSON.stringify(notes));
    
    alert(`${type} commentary saved to your notes!`);
  };

  const loadCrossReference = (ref: string) => {
    setBpRef(ref);
    setEsvLoading(true);
    
    fetch("/api/esv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passage: ref }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.text) {
          setBpText(data.text);
          setBpError(null);
          setTimeout(() => {
            document.getElementById("esv-study")?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        } else {
          setBpError(data.error || "Failed to fetch verse");
        }
      })
      .catch(err => {
        setBpError("Failed to fetch verse");
      })
      .finally(() => {
        setEsvLoading(false);
      });
  };

  const tokens = useMemo(() => {
    if (!bpText) return [];
    const rough = bpText.split(/(\s+)/);
    return rough.flatMap((t) => t.split(/(\b)/));
  }, [bpText]);

  const requestHover = (surface: string) => {
    setHoverLoading(true);

    const rawBook = bpRef.trim().split(/\s+/)[0];
    const bookName = rawBook.charAt(0).toUpperCase() + rawBook.slice(1).toLowerCase();
    setCurrentBookName(bookName);

    fetch("/api/lexplain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ surface, book: bookName }),
    })
      .then(res => res.json())
      .then(data => {
        setHoverData({
          lemma: data.lemma || "—",
          strongs: data.strongs || "—",
          plain: data.plain || "No explanation available"
        });
      })
      .catch(() => {
        setHoverData({
          lemma: "—",
          strongs: "—",
          plain: "Failed to load explanation"
        });
      })
      .finally(() => setHoverLoading(false));
  };

  const onWordEnter = (e: React.MouseEvent, w: string) => {
    if (popoverPinned) return;
    setActiveWord(w);

    const calculatePosition = () => {
      const popoverWidth = 360;
      const popoverHeight = 220;
      const margin = 16;

      let x = e.clientX;
      let y = e.clientY + 12;

      if (x + popoverWidth > window.innerWidth - margin) {
        x = window.innerWidth - popoverWidth - margin;
      }

      if (x < margin) {
        x = margin;
      }

      if (y + popoverHeight > window.innerHeight - margin) {
        y = e.clientY - popoverHeight - 12;
      }

      if (y < margin) {
        y = margin;
      }

      return { x, y };
    };

    setPopoverPos(calculatePosition());
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => requestHover(w), 50);
  };

  const onWordLeave = () => {
    if (popoverPinned) return;
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    setActiveWord(null);
    setHoverData(null);
    setPopoverPos(null);
  };

  const onWordClick = (e: React.MouseEvent, w: string) => {
    e.preventDefault();

    // On mobile, open modal directly
    if (isMobile) {
      setActiveWord(w);
      requestHover(w);
      // Wait for hover data to load, then open modal
      setTimeout(() => {
        setShowWordStudyModal(true);
      }, 100);
      return;
    }

    // Desktop behavior: show/hide popover
    if (popoverPinned && activeWord === w) {
      setPopoverPinned(false);
      onWordLeave();
    } else {
      setPopoverPinned(true);
      setActiveWord(w);

      const calculatePosition = () => {
        const popoverWidth = 420; // Match actual popover width
        const popoverHeight = 300;
        const margin = 16;

        let x = e.clientX;
        let y = e.clientY + 12;

        // Keep within viewport horizontally
        if (x + popoverWidth > window.innerWidth - margin) {
          x = window.innerWidth - popoverWidth - margin;
        }
        if (x < margin) {
          x = margin;
        }

        // Keep within viewport vertically
        if (y + popoverHeight > window.innerHeight - margin) {
          y = e.clientY - popoverHeight - 12;
        }
        if (y < margin) {
          y = margin;
        }

        return { x, y };
      };

      setPopoverPos(calculatePosition());
      requestHover(w);
    }
  };

  // Drag handlers for pinned popover
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!popoverPinned) return;
    setIsDragging(true);
    const popoverRect = popoverRef.current?.getBoundingClientRect();
    if (popoverRect && popoverPos) {
      setDragOffset({
        x: e.clientX - popoverPos.x,
        y: e.clientY - popoverPos.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !popoverPinned) return;
    setPopoverPos({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (popoverPinned && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
      setPopoverPinned(false);
      setActiveWord(null);
      setHoverData(null);
      setPopoverPos(null);
    }
  };

  // Search button handlers - open detailed modal
  const handleSearchStrongs = () => {
    if (!hoverData) return;
    setShowWordStudyModal(true);
  };

  const handleLookupLemma = () => {
    if (!hoverData) return;
    setShowWordStudyModal(true);
  };

  // Add event listeners for drag and click outside
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging]);

  useEffect(() => {
    if (popoverPinned) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [popoverPinned]);

  const bpFetch = () => {
    const cleaned = bpRef.trim();
    if (!cleaned) return;
    setBpError(null);
    setEsvLoading(true);
    
    fetch("/api/esv", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ passage: cleaned }),
    })
      .then(res => res.json())
      .then(data => {
        if (data.text) {
          setBpText(data.text);
        } else {
          setBpError(data.error || "Failed to fetch ESV");
        }
      })
      .catch(err => {
        setBpError("Failed to fetch ESV");
      })
      .finally(() => setEsvLoading(false));
  };

  const onBottomKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") bpFetch();
  };

  const parseDuration = (duration: string): string => {
    const match = duration?.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';
    
    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');
    
    if (hours) {
      return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
    }
    return `${minutes || '0'}:${seconds.padStart(2, '0')}`;
  };

  const formatViews = (views: string) => {
    const num = parseInt(views || '0');
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 30) return `${diffDays} days ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <button
        onClick={() => window.history.back()}
        className="mb-6 flex items-center gap-2 text-sm transition-colors" style={{ color: 'var(--text-secondary)' }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className={cn(playfair.className, typography.h1, 'text-center mb-3')}>
        Deep Study
      </h1>
      <p className={cn(typography.body, 'text-white/80 mb-4 text-center')}>
        Compare translations, read commentary, watch teaching videos, and dig deep into God's Word
      </p>
      <div className="max-w-3xl mx-auto mb-8">
        <PastorNote />
      </div>

      <section className={cn(card.default, 'section-spacing', 'max-w-3xl mx-auto')}>
        <div>
          {savedStudies.length > 0 && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="mb-4 flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {showHistory ? "Hide" : "Show"} Recent Studies ({savedStudies.length})
            </button>
          )}

          {showHistory && (
            <div className="mb-4 rounded-lg border border-white/10 bg-white/5 p-4">
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {savedStudies.map((study) => (
                  <div key={study.timestamp} className="flex items-center justify-between gap-2 p-2 rounded hover:bg-white/5">
                    <button
                      onClick={() => loadSavedStudy(study)}
                      style={{ color: 'var(--text-secondary)' }} className="flex-1 text-left text-sm hover:opacity-100 truncate"
                    >
                      <span style={{ color: 'var(--text-muted)' }} className="text-xs mr-2">
                        {new Date(study.timestamp).toLocaleDateString()}
                      </span>
                      {study.reference}
                    </button>
                    <button
                      onClick={() => deleteSavedStudy(study.timestamp)}
                      className="text-red-400 hover:text-red-300 text-xs"
                      aria-label="Delete"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="reference" style={{ color: 'var(--text-secondary)' }} className="mb-2 block text-sm">
              Enter a Bible Reference
            </label>
            <input
              id="reference"
              type="text"
              placeholder="e.g., John 3:16, Psalms 51, Romans 8:28-30"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              onKeyDown={handleKeyPress}
              className="input"
            />
            <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-1">
              💡 Supports single verses (John 3:16), verse ranges (John 3:16-18), or entire chapters (Psalms 51)
            </p>
          </div>
        </div>

        <div>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p style={{ color: 'var(--text-secondary)' }} className="text-sm">
                {savedStudies.length > 0 ? "Your Saved Passages:" : "Quick References:"}
              </p>
              {savedStudies.length > 0 && (
                <Link
                  href="/library#studies"
                  className="text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                >
                  View All →
                </Link>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {referencesToShow.map((ref) => (
                <button
                  key={ref}
                  onClick={() => handleQuickRef(ref)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm hover:bg-white/10 transition-colors"
                >
                  {ref}
                </button>
              ))}
              {savedStudies.length === 0 && (
                <p style={{ color: 'var(--text-muted)' }} className="text-xs mt-1 w-full">
                  💡 Tip: Save passages to see your own quick links here!
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 justify-center">
            <button
              id="fetch-btn"
              onClick={() => fetchBibleData()}
              disabled={loading || !reference.trim()}
              className={cn(button.primary, 'flex-1 min-w-[120px] max-w-[160px]')}
            >
              {loading ? "Loading…" : "Study"}
            </button>
            {reference.trim() && (
              <>
                <button
                  onClick={handleSave}
                  className={cn(button.secondary, 'flex-1 min-w-[140px] max-w-[180px] flex items-center justify-center gap-1')}
                  title="Save this study to your library"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                  {saveSuccess ? "Saved! ✓" : "Save to Library"}
                </button>
                <button
                  onClick={handleShare}
                  className={cn(button.secondary, 'flex-1 min-w-[100px] max-w-[140px] flex items-center justify-center gap-1')}
                  title="Share this study"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {copied === 'share-link' ? "Copied! ✓" : "Share"}
                </button>
              </>
            )}
            <button
              onClick={() => {
                setReference("");
                setData(null);
                setError(null);
                setAdditionalCommentaries(null);
                setVideos([]);
                setActiveVideo(null);
                setLoadedTabs(new Set(['translations']));
              }}
              className={cn(button.secondary, 'flex-1 min-w-[100px] max-w-[140px]')}
            >
              Clear
            </button>
          </div>

          {error && (
            <div className={cn(card.danger, 'mt-4')}>
              <p className={typography.small}>{error}</p>
            </div>
          )}
        </div>
      </section>

      {(loading || aiLoading) && (
        <SmartLoader type="translations" duration={2000} />
      )}

      {data && (
        <>
          {data.parsed && data.isChapter && (
            <div className="mb-6 text-center">
              <h2 className={cn(typography.h2, 'mb-2')}>
                {data.reference}
                <span className={cn(typography.body, 'text-white/80 ml-2')}>(Entire Chapter)</span>
              </h2>
            </div>
          )}

          {additionalCommentaries?.crossReferences && additionalCommentaries.crossReferences.length > 0 && (
            <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <h3 style={{ color: 'var(--text-secondary)' }} className="text-sm font-semibold mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Cross References
              </h3>
              <div className="flex flex-wrap gap-2">
                {additionalCommentaries.crossReferences.map((ref: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => loadCrossReference(ref)}
                    className="rounded-lg border border-yellow-400/30 bg-yellow-400/10 px-3 py-1 text-sm hover:bg-yellow-400/20 transition-colors text-yellow-400"
                  >
                    {ref}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-4 mb-4 border-b border-white/10 pb-2 max-w-3xl mx-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab("translations")}
              className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === "translations"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-white/60 light:text-black/60 hover:text-white/90 light:text-black/90"
              }`}
            >
              Translations
            </button>
            <button
              onClick={() => setActiveTab("commentary")}
              className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === "commentary"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-white/60 light:text-black/60 hover:text-white/90 light:text-black/90"
              }`}
            >
              Commentary
            </button>
            <button
              onClick={() => setActiveTab("videos")}
              className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === "videos"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-white/60 light:text-black/60 hover:text-white/90 light:text-black/90"
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveTab("tools")}
              className={`px-4 py-2 text-sm font-semibold transition-colors whitespace-nowrap ${
                activeTab === "tools"
                  ? "text-yellow-400 border-b-2 border-yellow-400"
                  : "text-white/60 light:text-black/60 hover:text-white/90 light:text-black/90"
              }`}
            >
              Study Tools
            </button>
          </div>

          {activeTab === "translations" && (
            <div className="space-y-4">
              {Object.entries(data.translations || {}).map(
                ([version, versionData]: [string, any]) =>
                  !versionData.error &&
                  versionData.text && (
                    <div key={version} className="card">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className={`${playfair.className} text-xl font-semibold`}>
                          {version.toUpperCase()}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className="badge">
                            {versionData.book || "Scripture"}
                          </span>
                          <button
                            onClick={() => handleCopy(versionData.text, version)}
                            className="btn text-xs px-2 py-1"
                            title="Copy text"
                          >
                            {copied === version ? "✓" : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>
                      <p className="text-white/90 light:text-black/90 text-lg leading-relaxed whitespace-pre-wrap">
                        {versionData.text}
                      </p>
                    </div>
                  )
              )}
            </div>
          )}

          {activeTab === "commentary" && (
            <div className="space-y-4">
              {commentaryLoading ? (
                <SmartLoader type="commentary" duration={2000} />
              ) : (
                <>
                  <div className="rounded-2xl border border-yellow-400/30 bg-gradient-to-br from-yellow-400/10 to-amber-500/10 p-6 shadow-sm">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-yellow-400/20 border border-yellow-400/50 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className={`${playfair.className} text-xl font-semibold mb-1 text-white/90 light:text-black/90`}>
                          AI Commentary
                        </h3>
                        <p className="text-yellow-400/80 text-xs">
                          Generated by GPT-4 • Context-aware insights
                        </p>
                      </div>
                      {data?.commentaries?.ai && (
                        <>
                          <button
                            onClick={() => handleCopy(data.commentaries.ai.commentary, 'ai-commentary')}
                            className="btn text-xs px-2 py-1"
                            title="Copy commentary"
                          >
                            {copied === 'ai-commentary' ? "✓" : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => saveCommentaryAsNote(data.commentaries.ai.commentary, "AI")}
                            className="rounded-lg bg-yellow-400/20 border border-yellow-400 px-3 py-1.5 text-xs hover:bg-yellow-400/30 transition-colors flex items-center gap-1"
                            title="Save to notes"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                            </svg>
                            Save
                          </button>
                        </>
                      )}
                    </div>

                    {data?.commentaries?.ai ? (
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          components={mdComponents as any}
                        >
                          {data.commentaries.ai.commentary || ""}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="text-white/60 light:text-black/60 py-4">No AI commentary available.</p>
                    )}
                  </div>

                  {additionalCommentaries?.apiCommentary?.commentaries && additionalCommentaries.apiCommentary.commentaries.length > 0 && (
                    <div className="rounded-2xl border border-blue-400/30 bg-gradient-to-br from-blue-400/10 to-indigo-500/10 p-6 shadow-sm">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-400/20 border border-blue-400/50 flex items-center justify-center flex-shrink-0">
                          <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <h3 className={`${playfair.className} text-xl font-semibold mb-1 text-white/90 light:text-black/90`}>
                            Classic Commentaries
                          </h3>
                          <p className="text-blue-400/80 text-xs">
                            From BibleStudyTools.com
                          </p>
                        </div>
                      </div>

                      {additionalCommentaries.apiCommentary.commentaries.map((commentary: any, idx: number) => (
                        <div key={idx} className="mb-4 pb-4 border-b border-white/10 last:border-0">
                          <h4 className="text-sm font-semibold text-blue-400 mb-2">
                            {commentary.author} ({commentary.year})
                          </h4>
                          <p className="text-white/80 light:text-black/80 text-sm leading-relaxed">
                            {commentary.text}
                          </p>
                          <a 
                            href={commentary.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline mt-2 inline-block"
                          >
                            Read Full Commentary →
                          </a>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === "videos" && (
            <div className="space-y-4">
              <div className="card">
                {videosLoading ? (
                  <SmartLoader type="videos" duration={2000} />
                ) : videos.length === 0 ? (
                  <div className="rounded-lg border border-white/10 bg-white/5 p-6 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-white/60 light:text-black/60 mb-2">
                      No videos found for {reference}
                    </p>
                    <p className="text-sm text-white/40">
                      Try a different passage or browse{' '}
                      <a
                        href="https://www.desiringgod.org/scripture"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-yellow-400 hover:underline"
                      >
                        Desiring God's library
                      </a>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {videos.map((video) => (
                      <div
                        key={video.id}
                        className="rounded-xl border border-white/10 bg-white/5 overflow-hidden hover:border-yellow-400/30 transition-all"
                      >
                        {activeVideo === video.id ? (
                          <>
                            <div className="relative" style={{ paddingBottom: '56.25%' }}>
                              <iframe
                                className="absolute top-0 left-0 w-full h-full"
                                src={`https://www.youtube.com/embed/${video.id}?autoplay=1`}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                            <div className="p-4 bg-yellow-400/10 border-t border-yellow-400/30">
                              <button
                                onClick={() => setActiveVideo(null)}
                                className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-2"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Close Player
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col md:flex-row">
                            <div className="relative md:w-64 flex-shrink-0 group cursor-pointer" onClick={() => setActiveVideo(video.id)}>
                              <Image
                                src={video.thumbnail}
                                alt={video.title}
                                width={320}
                                height={180}
                                unoptimized
                                className="w-full h-48 md:h-full object-cover rounded-l-lg"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                </div>
                              </div>
                              {video.duration && (
                                <div className="absolute bottom-2 right-2 bg-black bg-opacity-80 text-white text-xs px-2 py-1 rounded">
                                  {parseDuration(video.duration)}
                                </div>
                              )}
                            </div>

                            <div className="flex-1 p-4">
                              <h4
                                className="font-semibold text-white/90 light:text-black/90 mb-2 line-clamp-2 cursor-pointer hover:text-yellow-400 transition-colors"
                                onClick={() => setActiveVideo(video.id)}
                              >
                                {video.title}
                              </h4>

                              <p className="text-sm text-white/60 light:text-black/60 mb-3 line-clamp-2">
                                {video.description}
                              </p>

                              <div className="flex items-center gap-3 text-xs text-white/50 light:text-black/50 mb-3">
                                <span className="font-medium text-red-400">{video.channelTitle}</span>
                                <span>•</span>
                                <span>{formatViews(video.viewCount)} views</span>
                                <span>•</span>
                                <span>{formatDate(video.publishedAt)}</span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => setActiveVideo(video.id)}
                                  className="rounded-lg bg-red-600 text-white px-4 py-2 text-sm hover:bg-red-700 transition-colors flex items-center gap-2"
                                >
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M8 5v14l11-7z"/>
                                  </svg>
                                  Watch Now
                                </button>
                                <a
                                  href={`https://www.youtube.com/watch?v=${video.id}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg border border-white/20 text-white/80 light:text-black/80 px-4 py-2 text-sm hover:bg-white/10 transition-colors"
                                >
                                  Open in YouTube ↗
                                </a>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-red-400 text-sm text-center">
                        Videos from{' '}
                        <a href="https://www.youtube.com/@desiringGod" target="_blank" rel="noopener noreferrer" className="underline hover:text-red-300">
                          Desiring God
                        </a>
                        {' '}• Trusted Bible teachers on {reference}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "tools" && (
            <div className="space-y-4">
              <div className="card">
                <h3 className={`${playfair.className} text-2xl font-semibold mb-2`}>
                  External Study Resources
                </h3>
                <p className="text-white/70 light:text-black/70 text-sm mb-6">
                  Explore {data.reference} with these trusted Bible study tools
                </p>

                <div className="grid md:grid-cols-3 gap-4">
                  <a
                    href={data.studyLinks?.bibleHub}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all hover:border-yellow-400/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/20 border border-blue-500/50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90 light:text-black/90 group-hover:text-yellow-400 transition-colors">
                          BibleHub
                        </h4>
                      </div>
                    </div>
                    <p className="text-white/60 light:text-black/60 text-sm mb-3">
                      Verse-by-verse commentaries, cross-references, original languages, and interlinear tools
                    </p>
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <span>Open Study Tools</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>

                  <a
                    href={data.studyLinks?.blueLetterBible}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all hover:border-yellow-400/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90 light:text-black/90 group-hover:text-yellow-400 transition-colors">
                          Blue Letter Bible
                        </h4>
                      </div>
                    </div>
                    <p className="text-white/60 light:text-black/60 text-sm mb-3">
                      In-depth Greek & Hebrew word studies, lexicons, and original language tools
                    </p>
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <span>Explore Word Studies</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>

                  <a
                    href={data.studyLinks?.studyLight}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition-all hover:border-yellow-400/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                        <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-semibold text-white/90 light:text-black/90 group-hover:text-yellow-400 transition-colors">
                          StudyLight
                        </h4>
                      </div>
                    </div>
                    <p className="text-white/60 light:text-black/60 text-sm mb-3">
                      Comprehensive Bible dictionaries, encyclopedias, and reference materials
                    </p>
                    <div className="flex items-center gap-2 text-xs text-yellow-400">
                      <span>Access Resources</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </a>
                </div>

                <div className="mt-6 p-4 rounded-lg bg-yellow-400/10 border border-yellow-400/30">
                  <p className="text-yellow-400 text-sm">
                    💡 <strong>Tip:</strong> These resources open in new tabs so you can easily compare different study tools
                  </p>
                </div>
              </div>
            </div>
          )}

          {reference && (
            <div className="card mt-6">
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 transition-colors mb-3"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {showNotes ? "Hide" : "Add"} Notes {currentRefNotes.length > 0 && `(${currentRefNotes.length})`}
              </button>

              {showNotes && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <textarea
                      value={currentNote}
                      onChange={(e) => setCurrentNote(e.target.value)}
                      placeholder="Add your personal notes here..."
                      className="input min-h-[80px]"
                    />
                    <button
                      onClick={saveNote}
                      disabled={!currentNote.trim()}
                      className="rounded-lg bg-yellow-400/20 border border-yellow-400 px-4 py-2 text-sm hover:bg-yellow-400/30 disabled:opacity-50 transition-colors h-fit"
                    >
                      Save
                    </button>
                  </div>

                  {currentRefNotes.length > 0 && (
                    <div className="space-y-2">
                      {currentRefNotes.map((note) => (
                        <div key={note.timestamp} className="rounded-lg border border-white/10 bg-white/5 p-3">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm text-white/80 light:text-black/80 flex-1">{note.note}</p>
                            <button
                              onClick={() => deleteNote(note.timestamp)}
                              className="text-red-400 hover:text-red-300 text-xs"
                              aria-label="Delete note"
                            >
                              ×
                            </button>
                          </div>
                          <p className="text-xs text-white/40 mt-1">
                            {new Date(note.timestamp).toLocaleString()}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!data && !loading && !error && (
        <div className="card p-12 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-16 w-16 mx-auto mb-4 text-white/20">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <p className="text-white/60 light:text-black/60 mb-2">Enter a verse reference to begin your study</p>
          <p className="text-white/40 text-sm">
            Compare translations • Read commentary • Watch videos • Access study tools
          </p>
        </div>
      )}

      <section id="esv-study" className="card mt-8">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="bpPassage" className="mb-2 block text-sm text-white/80">
              Passage (ESV) - Original Language Study
            </label>
            <input
              id="bpPassage"
              placeholder="e.g., John 11:25"
              value={bpRef}
              onChange={(e) => setBpRef(e.target.value)}
              onKeyDown={onBottomKey}
              className="input"
            />
          </div>

          <div className="flex items-center gap-2">
            <button onClick={bpFetch} disabled={esvLoading} className="btn">
              {esvLoading ? (
                <SmartLoader type="tools" duration={2000} className="py-8" />
              ) : (
                "Get ESV"
              )}
            </button>
            {bpText && (
              <>
                <button onClick={() => handleCopy(bpText, 'esv-text')} className="btn text-xs px-2 py-1" title="Copy text">
                  {copied === 'esv-text' ? "✓" : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
                <button
                  onClick={() => {
                    setReference(bpRef);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    setTimeout(() => {
                      const btn = document.getElementById("fetch-btn");
                      if (btn) btn.click();
                    }, 500);
                  }}
                  className="rounded-lg bg-yellow-400/20 border border-yellow-400 px-4 py-2 text-sm hover:bg-yellow-400/30 transition-colors"
                >
                  Study Deeper
                </button>
              </>
            )}
            <button
              onClick={() => {
                setBpRef("");
                setBpText("");
                setBpError(null);
                setActiveWord(null);
                setHoverData(null);
                setPopoverPinned(false);
              }}
              className="btn"
            >
              Clear
            </button>
          </div>
        </div>

        {bpError && (
          <div className="mt-3 rounded-md border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
            {bpError}
          </div>
        )}

        <div className="mt-5">
          {!bpText ? (
            <p className="text-white/60 text-sm">
              Enter a reference and click <span className="font-semibold">Get ESV</span>, or click any cross-reference above. 
              Hover any word for original language insights; click to pin/unpin the explanation.
            </p>
          ) : (
            <article className="whitespace-pre-wrap text-[1.05rem] leading-7">
              {tokens.map((t, i) => {
                const isWord = /\w/.test(t);
                if (!isWord) return <span key={i}>{t}</span>;
                return (
                  <span
                    key={i}
                    onMouseEnter={(e) => onWordEnter(e, t)}
                    onMouseLeave={onWordLeave}
                    onClick={(e) => onWordClick(e, t)}
                    className="cursor-help rounded-sm bg-transparent px-0.5 hover:bg-white/10 transition-colors"
                  >
                    {t}
                  </span>
                );
              })}
            </article>
          )}
        </div>
      </section>

      <footer className="mt-12 text-center text-xs text-white/40">
        © Cornerstone Church, Mandeville, LA – The Busy Christian • v{APP_VERSION}
      </footer>

{activeWord && popoverPos && !isMobile && (
        <div
          ref={popoverRef}
          className="hover-popover pointer-events-none fixed z-50 w-[420px] max-w-[90vw] rounded-2xl shadow-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700"
          style={{
            left: popoverPos.x,
            top: popoverPos.y,
            cursor: popoverPinned ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          <div
            className="pointer-events-auto p-6"
            onMouseDown={handleMouseDown}
          >
            {/* Header with Lemma */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1">
                {popoverPinned && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                    </svg>
                    <span>Drag to move</span>
                  </div>
                )}
                <h3 className="text-2xl font-serif text-slate-900 dark:text-white mb-1">
                  {hoverData?.lemma ?? activeWord}
                </h3>
                <div className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                  STRONG'S NUMBER: {hoverData?.strongs ?? "..."}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPopoverPinned((p) => !p);
                }}
                className="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0"
              >
                {popoverPinned ? "📌 Pinned" : "📍 Pin"}
              </button>
            </div>

            {/* Dictionary Definition Section */}
            <div className="mb-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                Dictionary Definition
              </h4>
              <div className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {hoverData?.plain ?? (hoverLoading ? "Loading definition..." : "—")}
              </div>
            </div>

            {/* Search Actions */}
            {hoverData && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-2">
                  SEARCH FOR
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearchStrongs();
                    }}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-lg border-2 border-indigo-600 dark:border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                  >
                    Search for {hoverData.strongs}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLookupLemma();
                    }}
                    className="flex-1 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                  >
                    Lookup {hoverData.lemma}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <WordStudyModal
        isOpen={showWordStudyModal}
        onClose={() => setShowWordStudyModal(false)}
        word={activeWord || ''}
        initialData={hoverData}
        bookName={currentBookName}
      />    </main>
  );
}