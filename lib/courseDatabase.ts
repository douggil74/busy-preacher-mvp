// lib/courseDatabase.ts
import { TopicalCourse } from './courseTypes';
import { spiritualFoundationsCourse } from '@/data/courses';

export const TOPICAL_COURSES: TopicalCourse[] = [
  {
    id: 'when-life-hurts',
    title: 'When Life Hurts',
    subtitle: 'Finding God in the Midst of Suffering',
    category: 'difficult-times',
    description: 'Learn how God uses trials to fortify faith and further the cause, comfort and reality of Christ. Understand victory and intimacy with Jesus in tough times.',
    coveragePassages: [
      'Job 1-2',
      'Job 42',
      'Psalm 23',
      'Psalm 46',
      'Romans 5:1-5',
      'Romans 8:28-39',
      '2 Corinthians 1:3-7',
      '2 Corinthians 4:7-18',
      'James 1:2-4',
      '1 Peter 1:6-7',
      '1 Peter 4:12-19',
      'Hebrews 12:1-11'
    ],
    themes: ['suffering', 'trials', 'pain', 'loss', 'grief', 'comfort', 'perseverance', 'hope'],
    lessons: [
      {
        number: 1,
        title: 'Dealing With Loss',
        keyPassages: ['Job 1:13-22', 'Psalm 46:1-3', '2 Corinthians 1:3-7'],
        questions: [
          'How does Job respond to devastating loss?',
          'What does it mean that God is our refuge and strength?',
          'How does God comfort us in our troubles?'
        ],
        application: 'Identify one area of loss in your life and bring it before God in prayer.',
        estimatedMinutes: 45
      },
      {
        number: 2,
        title: 'The Spiritual Fruit of Trials',
        keyPassages: ['James 1:2-4', 'Romans 5:3-5', '1 Peter 1:6-7'],
        questions: [
          'What does James say we should do when facing trials?',
          'How do sufferings produce perseverance and character?',
          'What is the purpose of trials according to Peter?'
        ],
        application: 'Write down a current trial and the character God might be developing through it.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'God in the Midst of Suffering',
        keyPassages: ['Romans 8:28-39', '2 Corinthians 4:16-18', 'Hebrews 12:7-11'],
        questions: [
          'What does Romans 8:28 promise about all things?',
          'How does Paul keep perspective in suffering?',
          'Why does God discipline those He loves?'
        ],
        application: 'Reflect on how God has been present in past difficulties.',
        estimatedMinutes: 45
      },
      {
        number: 4,
        title: 'Sharing God\'s Comfort',
        keyPassages: ['2 Corinthians 1:3-7', '1 Peter 4:12-19', 'Psalm 23'],
        questions: [
          'How can we comfort others with the comfort we\'ve received?',
          'What perspective should we have about suffering as Christians?',
          'How does the Good Shepherd care for us in dark valleys?'
        ],
        application: 'Reach out to someone going through a difficult time and offer encouragement.',
        estimatedMinutes: 45
      }
    ],
    totalSessions: 4,
    source: 'topicalbiblestudylessons',
    sourceUrl: 'https://www.topicalbiblestudylessons.com/',
    difficulty: 'beginner'
  },
  {
    id: 'power-to-persevere',
    title: 'Power to Persevere',
    subtitle: 'Staying Strong in Your Faith Journey',
    category: 'spiritual-growth',
    description: 'Learn to discern who you are listening to and follow Christ\'s example in difficult situations. Let Christ\'s love deepen your devotion and give you strength to live for Him.',
    coveragePassages: [
      'Hebrews 12:1-3',
      'Philippians 3:12-14',
      'Galatians 6:9',
      '1 Corinthians 15:58',
      '2 Timothy 4:7-8',
      'James 1:12',
      'Revelation 2:10',
      'Matthew 24:13',
      'Romans 5:3-5'
    ],
    themes: ['perseverance', 'endurance', 'faithfulness', 'strength', 'courage', 'steadfast'],
    lessons: [
      {
        number: 1,
        title: 'Running with Endurance',
        keyPassages: ['Hebrews 12:1-3', 'Philippians 3:12-14'],
        questions: [
          'What hinders us in the race God has set before us?',
          'How does fixing our eyes on Jesus help us persevere?',
          'What does Paul mean by pressing toward the goal?'
        ],
        application: 'Identify one "weight" or sin you need to lay aside to run better.',
        estimatedMinutes: 45
      },
      {
        number: 2,
        title: 'Not Growing Weary',
        keyPassages: ['Galatians 6:9', '1 Corinthians 15:58', 'Isaiah 40:28-31'],
        questions: [
          'What promise does God give to those who do not give up?',
          'How can our labor in the Lord never be in vain?',
          'What does it mean to wait on the Lord?'
        ],
        application: 'Choose one area where you feel weary and commit to continue faithfully.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'Finishing Strong',
        keyPassages: ['2 Timothy 4:7-8', 'Matthew 24:13', 'James 1:12'],
        questions: [
          'What characterized Paul\'s life as he neared the end?',
          'What does Jesus promise to those who stand firm to the end?',
          'What crown awaits those who persevere under trial?'
        ],
        application: 'Write a personal commitment to finish your faith journey well.',
        estimatedMinutes: 45
      },
      {
        number: 4,
        title: 'Sources of Strength',
        keyPassages: ['Philippians 4:13', 'Ephesians 3:16-19', 'Psalm 46:1'],
        questions: [
          'Where does Paul say his strength comes from?',
          'How does God strengthen our inner being?',
          'What does it mean that God is our refuge and strength?'
        ],
        application: 'Practice relying on God\'s strength rather than your own this week.',
        estimatedMinutes: 45
      }
    ],
    totalSessions: 4,
    source: 'topicalbiblestudylessons',
    sourceUrl: 'https://www.topicalbiblestudylessons.com/',
    difficulty: 'intermediate'
  },
  {
    id: 'low-self-worth',
    title: 'Discovering Your Worth in Christ',
    subtitle: 'Made in God\'s Image',
    category: 'character',
    description: 'All of us need to feel significant, purposeful and fulfilled. Learn your value to Jesus, your Creator, and discover your purpose in life.',
    coveragePassages: [
      'Genesis 1:26-27',
      'Psalm 139:13-16',
      'Ephesians 1:3-6',
      'Ephesians 2:10',
      '1 Peter 2:9',
      'Romans 8:15-17',
      '2 Corinthians 5:17',
      'John 1:12',
      'Romans 5:8'
    ],
    themes: ['identity', 'worth', 'value', 'purpose', 'self-esteem', 'acceptance', 'loved', 'chosen'],
    lessons: [
      {
        number: 1,
        title: 'Made in God\'s Image',
        keyPassages: ['Genesis 1:26-27', 'Psalm 139:13-16', 'Ephesians 2:10'],
        questions: [
          'What does it mean to be made in God\'s image?',
          'How does Psalm 139 describe God\'s involvement in creating you?',
          'What does Ephesians say about being God\'s workmanship?'
        ],
        application: 'Thank God for how He created you with unique purpose.',
        estimatedMinutes: 40
      },
      {
        number: 2,
        title: 'Accepted and Loved',
        keyPassages: ['Romans 5:8', 'Ephesians 1:3-6', 'Romans 8:38-39'],
        questions: [
          'What does God\'s love demonstrate about your worth?',
          'What does it mean to be accepted in the beloved?',
          'What can separate you from God\'s love?'
        ],
        application: 'Meditate on the truth that God loves you unconditionally.',
        estimatedMinutes: 40
      },
      {
        number: 3,
        title: 'Chosen and Blessed by God',
        keyPassages: ['1 Peter 2:9', 'John 1:12', 'Romans 8:15-17', 'Ephesians 1:11'],
        questions: [
          'What identities does Peter give to believers?',
          'What does it mean to be a child of God?',
          'What inheritance do we have as God\'s children?'
        ],
        application: 'Write down your identity in Christ and read it daily this week.',
        estimatedMinutes: 40
      }
    ],
    totalSessions: 3,
    source: 'topicalbiblestudylessons',
    sourceUrl: 'https://www.topicalbiblestudylessons.com/',
    difficulty: 'beginner'
  },
  {
    id: 'building-community',
    title: 'Building Community',
    subtitle: 'Living in Love and Unity',
    category: 'relationships',
    description: 'A trusting relationship with Jesus impacts our ability to trust, care and serve others. Discover greater significance through life in community.',
    coveragePassages: [
      'John 13:34-35',
      'Romans 12:9-18',
      '1 Corinthians 12:12-27',
      'Ephesians 4:1-6',
      'Ephesians 4:25-32',
      'Philippians 2:1-8',
      'Hebrews 10:24-25',
      '1 John 4:7-12',
      'Colossians 3:12-17'
    ],
    themes: ['community', 'fellowship', 'unity', 'love', 'church', 'body of Christ', 'relationships'],
    lessons: [
      {
        number: 1,
        title: 'Called to Love',
        keyPassages: ['John 13:34-35', '1 John 4:7-12', 'Romans 12:9-10'],
        questions: [
          'What new command did Jesus give His disciples?',
          'How does loving others demonstrate that we know God?',
          'What does genuine love look like according to Romans 12?'
        ],
        application: 'Show sacrificial love to one person in your community this week.',
        estimatedMinutes: 45
      },
      {
        number: 2,
        title: 'One Body, Many Members',
        keyPassages: ['1 Corinthians 12:12-27', 'Romans 12:4-8', 'Ephesians 4:11-16'],
        questions: [
          'Why do we need each member of the body?',
          'What spiritual gifts has God given you?',
          'How does the body grow and build itself up?'
        ],
        application: 'Identify your spiritual gift and use it to serve your church this week.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'Maintaining Unity',
        keyPassages: ['Ephesians 4:1-6', 'Philippians 2:1-8', 'Colossians 3:12-17'],
        questions: [
          'What does Paul urge us to do in Ephesians 4:1-3?',
          'What attitude should we have toward others?',
          'How do we put on love as the perfect bond of unity?'
        ],
        application: 'Seek reconciliation with someone you have conflict with.',
        estimatedMinutes: 45
      },
      {
        number: 4,
        title: 'Encouraging One Another',
        keyPassages: ['Hebrews 10:24-25', '1 Thessalonians 5:11', 'Ephesians 4:29'],
        questions: [
          'Why should we not give up meeting together?',
          'How can we spur one another on toward love and good deeds?',
          'What kind of words should come from our mouths?'
        ],
        application: 'Send an encouraging message to three people in your church family.',
        estimatedMinutes: 45
      }
    ],
    totalSessions: 4,
    source: 'topicalbiblestudylessons',
    sourceUrl: 'https://www.topicalbiblestudylessons.com/',
    difficulty: 'beginner'
  },
  {
    id: 'gods-call-to-mission',
    title: 'God\'s Call to Mission',
    subtitle: 'Joining Jesus in Seeking the Lost',
    category: 'mission',
    description: 'Jesus is on mission to seek and save the lost. Walk with Jesus as He shares His heart for lost people and guides us in ministry.',
    coveragePassages: [
      'Matthew 28:18-20',
      'Luke 19:10',
      'John 20:21',
      'Acts 1:8',
      'Romans 10:14-15',
      '2 Corinthians 5:18-20',
      '1 Peter 3:15',
      'Matthew 9:35-38',
      'Luke 15:1-7'
    ],
    themes: ['mission', 'evangelism', 'witnessing', 'great commission', 'sharing faith', 'gospel'],
    lessons: [
      {
        number: 1,
        title: 'Jesus\' Mission',
        keyPassages: ['Luke 19:10', 'Matthew 9:35-38', 'Luke 15:1-7'],
        questions: [
          'What did Jesus say was His purpose in coming?',
          'How did Jesus have compassion on the crowds?',
          'How does God feel about lost people according to Luke 15?'
        ],
        application: 'Pray for one person who doesn\'t know Jesus by name this week.',
        estimatedMinutes: 45
      },
      {
        number: 2,
        title: 'The Great Commission',
        keyPassages: ['Matthew 28:18-20', 'Acts 1:8', 'John 20:21'],
        questions: [
          'What authority does Jesus have to send us?',
          'What are we commissioned to do?',
          'Where does the Holy Spirit empower us to witness?'
        ],
        application: 'Ask God to show you one person to share the gospel with.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'Ambassadors for Christ',
        keyPassages: ['2 Corinthians 5:18-20', 'Romans 10:14-15', '1 Peter 3:15'],
        questions: [
          'What does it mean to be an ambassador for Christ?',
          'How beautiful are the feet of those who bring good news?',
          'How should we be prepared to share our hope?'
        ],
        application: 'Write out your testimony to share with someone.',
        estimatedMinutes: 45
      },
      {
        number: 4,
        title: 'Overcoming Fear',
        keyPassages: ['2 Timothy 1:7-8', 'Acts 4:29-31', 'Philippians 1:14'],
        questions: [
          'What spirit has God given us?',
          'How did the early church pray for boldness?',
          'How can chains actually advance the gospel?'
        ],
        application: 'Share your faith with one person this week, trusting the Holy Spirit.',
        estimatedMinutes: 45
      }
    ],
    totalSessions: 4,
    source: 'topicalbiblestudylessons',
    sourceUrl: 'https://www.topicalbiblestudylessons.com/',
    difficulty: 'intermediate'
  },
  {
    id: 'turning-negatives-into-positives',
    title: 'Turning Negatives into Positives',
    subtitle: 'Overcoming with Christ',
    category: 'character',
    description: 'Be an overcomer as you walk with the Gentle Shepherd. Discover how the Lord uses failures to fortify faith and nurture courage.',
    coveragePassages: [
      'Romans 8:28',
      'Romans 8:37',
      'Philippians 4:4-7',
      'Philippians 4:13',
      '2 Corinthians 12:9-10',
      'Isaiah 41:10',
      'Psalm 34:4',
      'Proverbs 3:5-6',
      'James 1:2-4'
    ],
    themes: ['overcoming', 'fear', 'anxiety', 'worry', 'failure', 'courage', 'victory', 'peace'],
    lessons: [
      {
        number: 1,
        title: 'Fear Not',
        keyPassages: ['Isaiah 41:10', 'Psalm 34:4', 'Philippians 4:6-7'],
        questions: [
          'What does God promise when we fear?',
          'How did David overcome his fears?',
          'What is the antidote to anxiety according to Paul?'
        ],
        application: 'Bring your fears to God in prayer instead of worrying about them.',
        estimatedMinutes: 45
      },
      {
        number: 2,
        title: 'Learning from Failure',
        keyPassages: ['Romans 8:28', 'James 1:2-4', 'Proverbs 24:16'],
        questions: [
          'How does God work all things for good?',
          'What good can come from trials and failures?',
          'What distinguishes the righteous when they fall?'
        ],
        application: 'Reflect on a past failure and identify what God taught you through it.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'Strength in Weakness',
        keyPassages: ['2 Corinthians 12:9-10', 'Philippians 4:13', 'Isaiah 40:29-31'],
        questions: [
          'What did Paul discover about weakness?',
          'Where does our strength come from?',
          'What happens when we wait on the Lord?'
        ],
        application: 'Identify one weakness and ask God to show His strength through it.',
        estimatedMinutes: 45
      },
      {
        number: 4,
        title: 'More Than Conquerors',
        keyPassages: ['Romans 8:31-39', '1 John 5:4', 'Revelation 12:11'],
        questions: [
          'If God is for us, who can be against us?',
          'What has overcome the world?',
          'How do believers overcome the accuser?'
        ],
        application: 'Claim victory in Christ over one area where you feel defeated.',
        estimatedMinutes: 45
      }
    ],
    totalSessions: 4,
    source: 'topicalbiblestudylessons',
    sourceUrl: 'https://www.topicalbiblestudylessons.com/',
    difficulty: 'intermediate'
  }
];

// Update this function to include Spiritual Foundations
export function getAllCourses(): TopicalCourse[] {
  return [
    spiritualFoundationsCourse as TopicalCourse,
    ...TOPICAL_COURSES
  ];
}

// Helper function to find courses relevant to a passage
export function findCoursesForPassage(passageRef: string): TopicalCourse[] {
  const normalizedRef = passageRef.toLowerCase().trim();
  
  return TOPICAL_COURSES.filter(course => {
    // Check if passage is directly mentioned in course coverage
    const directMatch = course.coveragePassages.some(ref => 
      normalizedRef.includes(ref.toLowerCase()) || ref.toLowerCase().includes(normalizedRef)
    );
    
    return directMatch;
  });
}

// Helper function to find courses by theme/keyword
export function findCoursesByTheme(theme: string): TopicalCourse[] {
  const normalizedTheme = theme.toLowerCase().trim();
  
  return TOPICAL_COURSES.filter(course => 
    course.themes.some(t => 
      t.toLowerCase().includes(normalizedTheme) || 
      normalizedTheme.includes(t.toLowerCase())
    )
  );
}

// Helper function to get course by ID
export function getCourseById(courseId: string): TopicalCourse | undefined {
  const allCourses = getAllCourses();
  return allCourses.find(course => course.id === courseId);
}