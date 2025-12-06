// lib/courseDatabase.ts
import { TopicalCourse } from './courseTypes';
import { spiritualFoundationsCourse } from '@/data/courses';

export const TOPICAL_COURSES: TopicalCourse[] = [
  // === NEW COURSES ===
  {
    id: 'how-to-study-the-bible',
    title: 'How to Study the Bible',
    subtitle: 'Discovering God\'s Word for Yourself',
    category: 'doctrine',
    description: 'Learn practical methods for reading, understanding, and applying Scripture. Master the basics of inductive Bible study to hear God speak through His Word.',
    coveragePassages: [
      '2 Timothy 2:15',
      '2 Timothy 3:16-17',
      'Psalm 119:105',
      'Hebrews 4:12',
      'James 1:22-25',
      'Acts 17:11',
      'Joshua 1:8'
    ],
    themes: ['bible study', 'scripture', 'interpretation', 'hermeneutics', 'application', 'meditation'],
    lessons: [
      {
        number: 1,
        title: 'Why Study the Bible?',
        keyPassages: ['2 Timothy 3:16-17', 'Hebrews 4:12', 'Psalm 119:105'],
        questions: [
          'What does it mean that Scripture is "God-breathed"?',
          'How has the Bible shaped your life so far?',
          'What barriers keep you from regular Bible study?'
        ],
        application: 'Commit to reading the Bible daily for at least 15 minutes this week.',
        estimatedMinutes: 40
      },
      {
        number: 2,
        title: 'Observation: What Does It Say?',
        keyPassages: ['Acts 17:11', '2 Timothy 2:15', 'Proverbs 2:1-5'],
        questions: [
          'What questions should you ask when reading a passage?',
          'Why is context so important in Bible study?',
          'What details do you often overlook when reading quickly?'
        ],
        application: 'Practice observation by reading Mark 4:35-41 and writing down everything you notice.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'Interpretation: What Does It Mean?',
        keyPassages: ['2 Peter 1:20-21', 'Nehemiah 8:8', '1 Corinthians 2:12-14'],
        questions: [
          'How do we determine the author\'s intended meaning?',
          'Why is it important to compare Scripture with Scripture?',
          'How does the Holy Spirit help us understand the Bible?'
        ],
        application: 'Take a familiar verse and research its historical and literary context.',
        estimatedMinutes: 50
      },
      {
        number: 4,
        title: 'Application: How Should I Respond?',
        keyPassages: ['James 1:22-25', 'Joshua 1:8', 'Matthew 7:24-27'],
        questions: [
          'What is the danger of hearing without doing?',
          'How do you move from head knowledge to heart obedience?',
          'What specific change is God calling you to make?'
        ],
        application: 'Choose one truth from your recent Bible reading and create a specific action plan.',
        estimatedMinutes: 40
      }
    ],
    totalSessions: 4,
    source: 'The Busy Christian App',
    sourceUrl: '',
    difficulty: 'beginner'
  },
  {
    id: 'sermon-on-the-mount',
    title: 'The Sermon on the Mount',
    subtitle: 'Living the Kingdom Life',
    category: 'doctrine',
    description: 'Explore Jesus\' most famous teaching in Matthew 5-7. Discover what it means to live as citizens of God\'s kingdom in a world that follows different values.',
    coveragePassages: [
      'Matthew 5:1-12',
      'Matthew 5:13-16',
      'Matthew 5:17-48',
      'Matthew 6:1-18',
      'Matthew 6:19-34',
      'Matthew 7:1-12',
      'Matthew 7:13-29'
    ],
    themes: ['kingdom', 'beatitudes', 'righteousness', 'prayer', 'sermon', 'Jesus teaching'],
    lessons: [
      {
        number: 1,
        title: 'The Beatitudes: Kingdom Character',
        keyPassages: ['Matthew 5:1-12'],
        questions: [
          'Which beatitude challenges you most?',
          'How is Jesus\' definition of "blessed" different from the world\'s?',
          'What does it mean to hunger and thirst for righteousness?'
        ],
        application: 'Identify which beatitude you need to grow in and pray about it daily this week.',
        estimatedMinutes: 45
      },
      {
        number: 2,
        title: 'Salt and Light: Kingdom Influence',
        keyPassages: ['Matthew 5:13-16', 'Matthew 5:17-20'],
        questions: [
          'How can salt lose its saltiness? How might we?',
          'Where has God placed you to be light?',
          'What does righteousness that surpasses the Pharisees look like?'
        ],
        application: 'Look for one opportunity this week to let your light shine through loving action.',
        estimatedMinutes: 40
      },
      {
        number: 3,
        title: 'Heart Righteousness',
        keyPassages: ['Matthew 5:21-48'],
        questions: [
          'Why does Jesus go deeper than external behavior?',
          'How does anger relate to murder? Lust to adultery?',
          'What does it mean to love your enemies?'
        ],
        application: 'Ask God to reveal any hidden anger, lust, or bitterness you need to address.',
        estimatedMinutes: 50
      },
      {
        number: 4,
        title: 'Secret Disciplines',
        keyPassages: ['Matthew 6:1-18'],
        questions: [
          'Why is motive so important in spiritual practices?',
          'What does the Lord\'s Prayer teach about priorities?',
          'How can you practice giving, praying, and fasting in secret?'
        ],
        application: 'Practice one spiritual discipline this week without telling anyone.',
        estimatedMinutes: 45
      },
      {
        number: 5,
        title: 'Kingdom Priorities',
        keyPassages: ['Matthew 6:19-34'],
        questions: [
          'Where is your treasure? How do you know?',
          'What anxieties reveal about where you\'ve placed your trust?',
          'What does seeking God\'s kingdom first look like practically?'
        ],
        application: 'Identify one area of worry and consciously entrust it to God each day.',
        estimatedMinutes: 40
      },
      {
        number: 6,
        title: 'Building on the Rock',
        keyPassages: ['Matthew 7:1-29'],
        questions: [
          'What is the difference between judging and discerning?',
          'Why is the gate narrow and the road hard?',
          'What separates wise builders from foolish ones?'
        ],
        application: 'Choose one teaching from the Sermon to put into practice this week.',
        estimatedMinutes: 45
      }
    ],
    totalSessions: 6,
    source: 'The Busy Christian App',
    sourceUrl: '',
    difficulty: 'intermediate'
  },
  {
    id: 'fruit-of-the-spirit',
    title: 'Fruit of the Spirit',
    subtitle: 'Growing in Christlike Character',
    category: 'character',
    description: 'Explore the nine characteristics of the Spirit-filled life in Galatians 5. Learn how to cooperate with the Holy Spirit as He produces His fruit in you.',
    coveragePassages: [
      'Galatians 5:16-26',
      'John 15:1-8',
      'Romans 8:5-14',
      'Colossians 3:12-17',
      '2 Peter 1:5-8'
    ],
    themes: ['fruit', 'spirit', 'character', 'love', 'joy', 'peace', 'patience', 'kindness', 'goodness', 'faithfulness', 'gentleness', 'self-control'],
    lessons: [
      {
        number: 1,
        title: 'Walking by the Spirit',
        keyPassages: ['Galatians 5:16-18', 'Galatians 5:24-26', 'Romans 8:5-14'],
        questions: [
          'What does it mean to "walk by the Spirit"?',
          'How do the flesh and Spirit war against each other?',
          'How do we crucify the flesh with its passions?'
        ],
        application: 'Each morning this week, ask the Holy Spirit to lead your day.',
        estimatedMinutes: 40
      },
      {
        number: 2,
        title: 'Love, Joy, Peace',
        keyPassages: ['Galatians 5:22', '1 Corinthians 13:4-7', 'Philippians 4:4-7', 'John 14:27'],
        questions: [
          'How is the Spirit\'s love different from human affection?',
          'Can you have joy in suffering? How?',
          'What is the peace that passes understanding?'
        ],
        application: 'Practice love by serving someone who cannot repay you.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'Patience, Kindness, Goodness',
        keyPassages: ['Galatians 5:22', 'James 5:7-11', 'Ephesians 4:32', 'Romans 2:4'],
        questions: [
          'Where do you struggle most with patience?',
          'How has God\'s kindness led you to repentance?',
          'What is the difference between being nice and being good?'
        ],
        application: 'Show unexpected kindness to someone difficult this week.',
        estimatedMinutes: 45
      },
      {
        number: 4,
        title: 'Faithfulness, Gentleness, Self-Control',
        keyPassages: ['Galatians 5:22-23', 'Proverbs 3:3-4', 'Matthew 11:29', '1 Corinthians 9:24-27'],
        questions: [
          'What does faithfulness look like in small things?',
          'How is gentleness strength under control?',
          'Where do you need more self-control?'
        ],
        application: 'Identify one area needing self-control and create a plan with accountability.',
        estimatedMinutes: 45
      },
      {
        number: 5,
        title: 'Abiding in the Vine',
        keyPassages: ['John 15:1-8', '2 Peter 1:5-8', 'Colossians 3:12-17'],
        questions: [
          'What does abiding in Christ look like daily?',
          'Why can\'t we produce fruit apart from Him?',
          'How do we cooperate with the Spirit\'s work?'
        ],
        application: 'Spend 10 minutes daily in quiet communion with Jesus this week.',
        estimatedMinutes: 40
      }
    ],
    totalSessions: 5,
    source: 'The Busy Christian App',
    sourceUrl: '',
    difficulty: 'beginner'
  },
  {
    id: 'spiritual-disciplines',
    title: 'Spiritual Disciplines',
    subtitle: 'Practices That Transform',
    category: 'spiritual-growth',
    description: 'Discover time-tested practices that open us to God\'s transforming grace. Learn to incorporate prayer, fasting, solitude, and other disciplines into your busy life.',
    coveragePassages: [
      '1 Timothy 4:7-8',
      'Matthew 6:5-18',
      'Mark 1:35',
      'Luke 4:1-2',
      'Psalm 46:10',
      'Psalm 1:1-3',
      'Hebrews 10:24-25'
    ],
    themes: ['disciplines', 'prayer', 'fasting', 'solitude', 'meditation', 'study', 'worship', 'service'],
    lessons: [
      {
        number: 1,
        title: 'Why Spiritual Disciplines?',
        keyPassages: ['1 Timothy 4:7-8', '1 Corinthians 9:24-27', '2 Peter 1:3-8'],
        questions: [
          'How are spiritual disciplines like physical training?',
          'What is the goal of spiritual disciplines?',
          'What discipline do you most need to develop?'
        ],
        application: 'Choose one discipline to focus on for the next month.',
        estimatedMinutes: 35
      },
      {
        number: 2,
        title: 'The Discipline of Prayer',
        keyPassages: ['Matthew 6:5-15', 'Mark 1:35', 'Luke 18:1-8', '1 Thessalonians 5:17'],
        questions: [
          'What made Jesus\' prayer life so powerful?',
          'How can you develop a consistent prayer rhythm?',
          'What hinders your prayers?'
        ],
        application: 'Set a specific time and place for daily prayer this week.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'The Discipline of Fasting',
        keyPassages: ['Matthew 6:16-18', 'Luke 4:1-2', 'Isaiah 58:6-9', 'Acts 13:2-3'],
        questions: [
          'What is the purpose of fasting?',
          'How do you fast with the right motives?',
          'What type of fast might God be calling you to?'
        ],
        application: 'Plan a one-day fast focused on seeking God for a specific need.',
        estimatedMinutes: 40
      },
      {
        number: 4,
        title: 'Solitude and Silence',
        keyPassages: ['Psalm 46:10', 'Mark 6:31', 'Luke 5:16', '1 Kings 19:11-13'],
        questions: [
          'Why is silence so difficult in our noisy world?',
          'How did Jesus practice solitude?',
          'What might God say to you in the quiet?'
        ],
        application: 'Schedule 30 minutes of solitude with no phone, music, or distractions.',
        estimatedMinutes: 35
      },
      {
        number: 5,
        title: 'Scripture Meditation',
        keyPassages: ['Psalm 1:1-3', 'Joshua 1:8', 'Psalm 119:15-16', 'Psalm 119:97'],
        questions: [
          'How is meditation different from just reading?',
          'What does it mean to "chew" on Scripture?',
          'Which passage will you meditate on this week?'
        ],
        application: 'Choose one verse and meditate on it for 10 minutes daily.',
        estimatedMinutes: 40
      },
      {
        number: 6,
        title: 'Community and Service',
        keyPassages: ['Hebrews 10:24-25', 'Galatians 6:2', 'Mark 10:43-45', 'John 13:14-15'],
        questions: [
          'Why can\'t we grow alone?',
          'How does serving others transform us?',
          'Where is God calling you to serve?'
        ],
        application: 'Commit to a regular gathering with believers and one act of service.',
        estimatedMinutes: 40
      }
    ],
    totalSessions: 6,
    source: 'The Busy Christian App',
    sourceUrl: '',
    difficulty: 'intermediate'
  },
  {
    id: 'healing-and-wholeness',
    title: 'Healing & Wholeness',
    subtitle: 'God\'s Heart for Your Restoration',
    category: 'difficult-times',
    description: 'Explore what Scripture teaches about healing—physical, emotional, and spiritual. Discover how God wants to bring wholeness to every area of your life.',
    coveragePassages: [
      'Isaiah 53:4-5',
      'James 5:14-16',
      'Psalm 103:2-5',
      'Matthew 8:16-17',
      '3 John 1:2',
      'Psalm 147:3',
      'Jeremiah 17:14'
    ],
    themes: ['healing', 'wholeness', 'restoration', 'prayer', 'faith', 'hope', 'suffering'],
    lessons: [
      {
        number: 1,
        title: 'God\'s Heart for Healing',
        keyPassages: ['Psalm 103:2-5', 'Exodus 15:26', 'Jeremiah 30:17'],
        questions: [
          'What do God\'s names reveal about His desire to heal?',
          'How does Jesus\' ministry demonstrate God\'s heart?',
          'What healing do you need from God?'
        ],
        application: 'Bring your need for healing to God in honest prayer.',
        estimatedMinutes: 40
      },
      {
        number: 2,
        title: 'Healing in the Atonement',
        keyPassages: ['Isaiah 53:4-5', 'Matthew 8:16-17', '1 Peter 2:24'],
        questions: [
          'What did Jesus accomplish on the cross for our healing?',
          'How do we appropriate what Christ has provided?',
          'Why isn\'t everyone healed immediately?'
        ],
        application: 'Thank Jesus specifically for bearing your sicknesses and pains.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'Emotional and Inner Healing',
        keyPassages: ['Psalm 147:3', 'Isaiah 61:1-3', 'Luke 4:18-19'],
        questions: [
          'What emotional wounds need God\'s healing touch?',
          'How does God heal the brokenhearted?',
          'What lies do you believe that need to be replaced with truth?'
        ],
        application: 'Invite the Holy Spirit to reveal and heal one area of inner pain.',
        estimatedMinutes: 50
      },
      {
        number: 4,
        title: 'The Prayer of Faith',
        keyPassages: ['James 5:14-16', 'Mark 11:22-24', 'Matthew 17:20'],
        questions: [
          'What role does faith play in healing?',
          'How do we pray with confidence without presuming on God?',
          'Who can you ask to pray with you for healing?'
        ],
        application: 'Ask elders or mature believers to pray over you for a specific need.',
        estimatedMinutes: 40
      },
      {
        number: 5,
        title: 'When Healing Tarries',
        keyPassages: ['2 Corinthians 12:7-10', 'Romans 8:28', 'Hebrews 11:35-40'],
        questions: [
          'How do we trust God when healing doesn\'t come?',
          'What did Paul learn through his thorn?',
          'How can suffering produce deeper faith?'
        ],
        application: 'Write out your honest feelings to God about any unanswered prayers.',
        estimatedMinutes: 45
      }
    ],
    totalSessions: 5,
    source: 'The Busy Christian App',
    sourceUrl: '',
    difficulty: 'intermediate'
  },
  {
    id: 'walking-in-holiness',
    title: 'Walking in Holiness',
    subtitle: 'Becoming Who God Made You to Be',
    category: 'character',
    description: 'Discover what it means to be holy as God is holy. Learn how the Holy Spirit sanctifies us and empowers us to live lives that honor God.',
    coveragePassages: [
      '1 Peter 1:15-16',
      '1 Thessalonians 4:3-8',
      'Hebrews 12:14',
      'Romans 6:1-14',
      '2 Corinthians 7:1',
      'Leviticus 19:2',
      'Romans 12:1-2'
    ],
    themes: ['holiness', 'sanctification', 'purity', 'obedience', 'transformation', 'sin', 'righteousness'],
    lessons: [
      {
        number: 1,
        title: 'Called to Be Holy',
        keyPassages: ['1 Peter 1:15-16', 'Leviticus 19:2', 'Hebrews 12:14'],
        questions: [
          'What does holiness mean?',
          'Why does God call us to be holy?',
          'How is holiness possible for ordinary people?'
        ],
        application: 'Ask God to show you one area where He\'s calling you to greater holiness.',
        estimatedMinutes: 40
      },
      {
        number: 2,
        title: 'Dead to Sin, Alive to God',
        keyPassages: ['Romans 6:1-14', 'Galatians 2:20', 'Colossians 3:1-5'],
        questions: [
          'What does it mean that we died with Christ?',
          'How do we "reckon" ourselves dead to sin?',
          'What sin patterns still have a grip on you?'
        ],
        application: 'Identify one sin pattern and declare your freedom from it in Christ.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'The Work of Sanctification',
        keyPassages: ['1 Thessalonians 4:3-8', '1 Thessalonians 5:23-24', 'Philippians 2:12-13'],
        questions: [
          'What is God\'s role in sanctification? What is ours?',
          'How does the Spirit empower us to live holy lives?',
          'What does progressive sanctification look like?'
        ],
        application: 'Work out your salvation by taking one step of obedience this week.',
        estimatedMinutes: 45
      },
      {
        number: 4,
        title: 'Purity of Heart',
        keyPassages: ['Matthew 5:8', 'Psalm 51:10', 'Psalm 24:3-4', '2 Corinthians 7:1'],
        questions: [
          'What does it mean to be pure in heart?',
          'How do we cleanse ourselves from defilement?',
          'What impurities need to be addressed in your life?'
        ],
        application: 'Pray Psalm 51 as your own prayer for a clean heart.',
        estimatedMinutes: 40
      },
      {
        number: 5,
        title: 'Living Sacrifices',
        keyPassages: ['Romans 12:1-2', '1 Corinthians 6:19-20', '2 Timothy 2:21'],
        questions: [
          'What does it mean to offer your body as a living sacrifice?',
          'How do we renew our minds?',
          'What worldly patterns need to be transformed?'
        ],
        application: 'Present yourself to God as a living sacrifice, holding nothing back.',
        estimatedMinutes: 45
      }
    ],
    totalSessions: 5,
    source: 'The Busy Christian App',
    sourceUrl: '',
    difficulty: 'intermediate'
  },
  {
    id: 'heart-of-worship',
    title: 'The Heart of Worship',
    subtitle: 'Encountering God in Spirit and Truth',
    category: 'spiritual-growth',
    description: 'Go beyond singing songs to discover what true worship means. Learn to worship God with your whole life, in spirit and in truth.',
    coveragePassages: [
      'John 4:23-24',
      'Psalm 95:1-7',
      'Romans 12:1',
      'Psalm 100',
      'Revelation 4:8-11',
      'Hebrews 13:15',
      'Psalm 150'
    ],
    themes: ['worship', 'praise', 'adoration', 'thanksgiving', 'music', 'lifestyle', 'presence'],
    lessons: [
      {
        number: 1,
        title: 'What Is True Worship?',
        keyPassages: ['John 4:23-24', 'Romans 12:1', 'Psalm 29:2'],
        questions: [
          'What does it mean to worship in spirit and truth?',
          'How is worship more than music?',
          'What does God seek in worshipers?'
        ],
        application: 'Worship God through an act of service or obedience, not just singing.',
        estimatedMinutes: 40
      },
      {
        number: 2,
        title: 'The God We Worship',
        keyPassages: ['Revelation 4:8-11', 'Isaiah 6:1-5', 'Psalm 145'],
        questions: [
          'What attributes of God move you to worship?',
          'How does understanding who God is transform our worship?',
          'When did you last stand in awe of God?'
        ],
        application: 'Spend time meditating on God\'s attributes and respond in praise.',
        estimatedMinutes: 45
      },
      {
        number: 3,
        title: 'Expressions of Worship',
        keyPassages: ['Psalm 150', 'Psalm 95:1-7', 'Psalm 47:1', '2 Samuel 6:14'],
        questions: [
          'What biblical expressions of worship are you comfortable with?',
          'Which ones stretch you? Why?',
          'How can you worship with your whole being?'
        ],
        application: 'Try one new expression of worship (lifting hands, kneeling, etc.).',
        estimatedMinutes: 40
      },
      {
        number: 4,
        title: 'A Lifestyle of Worship',
        keyPassages: ['Romans 12:1-2', '1 Corinthians 10:31', 'Colossians 3:17', 'Hebrews 13:15-16'],
        questions: [
          'How can ordinary activities become worship?',
          'What does 24/7 worship look like?',
          'Where is your worship lacking in your daily life?'
        ],
        application: 'Choose three daily activities and turn them into acts of worship.',
        estimatedMinutes: 40
      },
      {
        number: 5,
        title: 'Corporate Worship',
        keyPassages: ['Psalm 100', 'Hebrews 10:24-25', 'Psalm 122:1', 'Acts 2:42-47'],
        questions: [
          'Why is gathering to worship so important?',
          'How can you prepare your heart before worship services?',
          'How can you contribute to the worship of your church?'
        ],
        application: 'Come to church this week prepared and expectant to meet with God.',
        estimatedMinutes: 40
      }
    ],
    totalSessions: 5,
    source: 'The Busy Christian App',
    sourceUrl: '',
    difficulty: 'beginner'
  },
  {
    id: 'sharing-your-faith',
    title: 'Sharing Your Faith',
    subtitle: 'Practical Evangelism for Everyday Life',
    category: 'mission',
    description: 'Learn to share the good news naturally and effectively. Overcome fear and discover how God can use you to lead others to Christ.',
    coveragePassages: [
      '1 Peter 3:15',
      'Matthew 28:19-20',
      'Acts 1:8',
      'Romans 1:16',
      '2 Corinthians 5:18-20',
      'Colossians 4:5-6',
      'Mark 5:19'
    ],
    themes: ['evangelism', 'witnessing', 'gospel', 'testimony', 'mission', 'outreach', 'salvation'],
    lessons: [
      {
        number: 1,
        title: 'Why Share Your Faith?',
        keyPassages: ['Matthew 28:19-20', 'Romans 10:14-15', '2 Corinthians 5:18-20'],
        questions: [
          'What motivates you to share the gospel?',
          'How can love for others overcome fear?',
          'Who in your life needs to hear about Jesus?'
        ],
        application: 'Write down three people you want to share the gospel with and pray for them.',
        estimatedMinutes: 40
      },
      {
        number: 2,
        title: 'Your Testimony',
        keyPassages: ['Mark 5:19', 'John 9:25', 'Acts 26:1-23', '1 John 1:1-3'],
        questions: [
          'What was your life like before Christ?',
          'How did you come to know Jesus?',
          'How has He changed your life?'
        ],
        application: 'Write out your testimony in 3 minutes or less and practice sharing it.',
        estimatedMinutes: 50
      },
      {
        number: 3,
        title: 'The Gospel Message',
        keyPassages: ['Romans 3:23', 'Romans 6:23', 'Romans 5:8', 'Romans 10:9-10', 'Ephesians 2:8-9'],
        questions: [
          'What are the essential elements of the gospel?',
          'How do you explain salvation simply?',
          'What questions do people commonly ask?'
        ],
        application: 'Practice explaining the gospel in your own words to a Christian friend.',
        estimatedMinutes: 45
      },
      {
        number: 4,
        title: 'Overcoming Fear',
        keyPassages: ['2 Timothy 1:7', 'Acts 4:29-31', 'Romans 1:16', 'Isaiah 41:10'],
        questions: [
          'What fears hold you back from sharing?',
          'How did the early church pray for boldness?',
          'What is the worst that could happen? The best?'
        ],
        application: 'Pray for boldness and look for one opportunity to share this week.',
        estimatedMinutes: 40
      },
      {
        number: 5,
        title: 'Lifestyle Evangelism',
        keyPassages: ['Colossians 4:5-6', '1 Peter 3:15', 'Matthew 5:16', 'Titus 2:7-8'],
        questions: [
          'How does your life attract people to Jesus?',
          'How do you make the most of every opportunity?',
          'What conversations can you turn toward spiritual things?'
        ],
        application: 'Identify one relationship where you can be more intentional about your faith.',
        estimatedMinutes: 45
      }
    ],
    totalSessions: 5,
    source: 'The Busy Christian App',
    sourceUrl: '',
    difficulty: 'beginner'
  },
  // === ORIGINAL COURSES ===
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