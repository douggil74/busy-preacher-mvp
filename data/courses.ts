import { TopicalCourse } from '@/lib/courseTypes';

export const spiritualFoundationsCourse: TopicalCourse = {
  id: 'spiritual-foundations',
  title: 'Spiritual Foundations',
  subtitle: 'Essential Biblical Principles for New Believers',
  category: 'spiritual-growth',
  description: "Build a strong foundation in Christ through 16 essential biblical principles. Grow by leaps and bounds as you commit to these core teachings.",
  coveragePassages: [
    'John 3:3',
    'John 10:28',
    'Romans 3:23',
    '2 Corinthians 5:21',
    'John 16:7-8',
    'Romans 10:9-10',
    'Psalm 5:3',
    'Matthew 6:9-13',
    'Hebrews 10:25',
    'Hebrews 13:17',
    'Acts 2:44-46',
    '1 Corinthians 12:21',
    'James 4:7',
    'Ephesians 6:10-18',
    'Hebrews 12:1-2',
    'Hebrews 4:14-16'
  ],
  themes: ['salvation', 'prayer', 'bible study', 'church', 'spiritual warfare', 'faith', 'discipleship'],
  lessons: [
    {
      number: 1,
      title: 'What Does It Mean to Be Saved?',
      keyPassages: ['John 3:3', 'Romans 3:23', '2 Corinthians 5:21', 'Romans 10:9-10'],
      questions: [
        `How would you explain "born again" in your own words?`,
        `What is God's part in your salvation? What is your part?`,
        `Have you confessed Jesus as Lord publicly?`,
        `Are you ready to obey Christ in water baptism?`
      ],
      application: `Thank God for your salvation. If you haven't already, make plans to be baptized and publicly confess your faith in Christ.`,
      estimatedMinutes: 45,
      content: {
        introduction: `By now you have decided to make Jesus your Lord and Savior. In doing so, you have been born again (John 3:3). We rejoice with you that you have been saved. When we talk about being "born again" or being "saved" we are essentially saying the same thing. A person is SAVED when he turns from sin to God, which is done by repentance. He is then saved from sin and given a new life, saved from eternal hell and given eternal life.`,
        sections: [
          {
            title: 'What Are You Saved From?',
            content: `In this life, you are saved from the bondage of sin and the destruction, guilt, and loss of purpose it brings…and in the afterlife, saved from God's wrath and eternal punishment.`,
            scripture: `John 10:28 (ESV) — I give them eternal life, and they will never perish, and no one will snatch them out of my hand.`,
          },
          {
            title: 'What Are You Saved To?',
            content: `You have been born again into abundant life in God's family as His child — with access to His righteousness, peace, joy, healing, and provision — and, above all, eternal life with Him.`,
          },
          {
            title: "God's Part in Salvation",
            subsections: [
              {
                title: 'God Loves You',
                content: `God loves all people and desires to be their Father (John 3:16). He loves sinners yet hates sin.`,
                scripture: `Romans 3:23 — for all have sinned and fall short of the glory of God.`,
              },
              {
                title: 'God Sent Jesus to Die for You',
                content: `Jesus, the sinless One, became our substitute, bearing the penalty for our sin.`,
                scripture: `2 Corinthians 5:21 — For our sake he made him to be sin who knew no sin, so that in him we might become the righteousness of God.`,
              },
              {
                title: 'God Sends His Holy Spirit',
                content: `The Spirit convicts of sin, leads to repentance, and testifies that Jesus is the only way to the Father.`,
                scripture: `John 16:7–8 — … if I do not go away, the Helper will not come to you. But if I go, I will send him to you. And when he comes, he will convict the world…`,
              },
              {
                title: 'God Forgives You',
                content: `When you believe in Jesus, confess your sins, and receive Him as Lord, God forgives you and receives you as His own.`,
                scripture: `Romans 10:9–10 — … if you confess with your mouth that Jesus is Lord and believe in your heart that God raised him from the dead, you will be saved…`,
              },
              {
                title: 'God Gives You New Life',
                content: `God indwells you by His Spirit and imparts His life and nature.`,
                scripture: `Revelation 3:20 — Behold, I stand at the door and knock…`,
              },
              {
                title: 'God Accepts You Into His Family',
                content: `By new birth and adoption you become an heir of God and co-heir with Christ.`,
                scripture: `Romans 8:17 — and if children, then heirs—heirs of God and fellow heirs with Christ…`,
              },
            ],
          },
          {
            title: 'Your Part in Salvation',
            subsections: [
              {
                title: 'Admit You Are a Sinner',
                content: `Acknowledge your sin, inability to save yourself, and your need for a Savior.`,
                scripture: 'Romans 3:23',
              },
              {
                title: 'Repent and Turn to God',
                content: `Forsake sin and choose God's way over your own.`,
                scripture: '2 Peter 3:9',
              },
              {
                title: 'Believe',
                content: `Trust fully in Christ's finished work on the cross and His resurrection.`,
                scripture: '1 Corinthians 1:18',
              },
              {
                title: 'Ask and Receive',
                content: `Ask God to forgive you; receive Jesus as Lord and Savior.`,
                scripture: '1 John 1:9',
              },
              {
                title: 'Confess Jesus as Lord',
                content: `Confess openly with your mouth what you believe in your heart.`,
                scripture: 'Romans 10:9–10',
              },
              {
                title: 'Obedience in Baptism',
                content: `Be water-baptized in obedience to Christ's command.`,
                scripture: 'Mark 16:16',
              },
            ],
          },
        ],
        keyTakeaways: [
          `Salvation is God's free gift, received by grace through faith.`,
          `God has a part and you have a part; both matter.`,
          `Saved FROM sin and wrath; saved TO life with God now and forever.`,
          `Repentance, faith, confession, and obedience are essential responses.`,
          `In Christ you are a new creation and a child of God.`,
        ],
        reflectionQuestions: [
          `How would you explain "born again" in your own words?`,
          `What is God's part in your salvation? What is your part?`,
          `Have you confessed Jesus as Lord publicly?`,
          `Are you ready to obey Christ in water baptism?`,
        ],
      }
    },
    // For now, lessons 2-16 without detailed content - we can add them incrementally
    {
      number: 2,
      title: 'Prayer and Bible Study',
      keyPassages: ['Psalm 5:3', 'Matthew 6:9-13', 'Matthew 14:23', 'Romans 1:17', 'Joshua 1:8'],
      questions: [
        `What time of day will you consistently meet with God?`,
        `Which element of the Lord's Prayer do you tend to skip?`,
        `What practical steps will you start this week to build a quiet-time habit?`
      ],
      application: `Set a specific time and place for daily prayer and Bible reading. Start with 15 minutes and the book of Mark.`,
      estimatedMinutes: 40
    },
    {
      number: 3,
      title: 'Your Relationship to the Local Church',
      keyPassages: ['Hebrews 10:25', 'Hebrews 13:17', 'Acts 2:44-46', '1 Corinthians 12:21'],
      questions: [
        `Are you committed to a local church? Why or why not?`,
        `What gifts or abilities could you offer this month?`,
        `How can you strengthen your church through prayer and giving?`,
        `Where do you sense God inviting you to serve?`
      ],
      application: `If you're not already part of a local church, begin praying about where God wants you. If you are, identify one way to serve this month.`,
      estimatedMinutes: 45
    },
    {
      number: 4,
      title: 'Spiritual Warfare',
      keyPassages: ['James 4:7', 'Ephesians 6:10-18', '1 John 4:4', 'Revelation 12:11', '1 Peter 5:8-10'],
      questions: [
        `Which of Satan's tactics trips you most often?`,
        `What Scriptures will you memorize to answer temptation?`,
        `Where do you need to stand firm today?`,
        `Who can stand with you in prayer and accountability?`
      ],
      application: `Memorize one Scripture to use against temptation. Identify an accountability partner for prayer and support.`,
      estimatedMinutes: 50
    },
    {
      number: 5,
      title: 'Living the Christian Life',
      keyPassages: ['Hebrews 12:1-2', 'Hebrews 4:14-16', 'Hebrews 11', 'Hebrews 12:5-11'],
      questions: [
        `Where do you need mercy today? Where do you need empowering grace?`,
        `What weight or sin do you need to lay aside?`,
        `Who are your "run-with" people in this race?`
      ],
      application: `Identify one hindrance in your race and bring it to Jesus. Find at least one person to run alongside you in faith.`,
      estimatedMinutes: 35
    },
    {
      number: 6,
      title: 'Repentance',
      keyPassages: ['Acts 26:20', 'Matthew 3:8', '2 Corinthians 7:9-10', 'Acts 3:19', 'Luke 13:3'],
      questions: [
        `What "change of mind" is the Spirit prompting in you right now?`,
        `Where do you need to bear fruit in keeping with repentance?`,
        `Who can walk with you in repentance and renewal?`
      ],
      application: `Ask God to show you any area where you need to repent. Make a plan to turn from that sin and walk in obedience.`,
      estimatedMinutes: 30
    },
    {
      number: 7,
      title: 'Water Baptism',
      keyPassages: ['Matthew 28:19-20', 'Acts 2:38', 'Romans 6:3-5', '1 Peter 3:21'],
      questions: [
        `Have you been baptized since believing?`,
        `Who can you invite to witness your baptism?`,
        `What "old ways" are you leaving in the water?`
      ],
      application: `If you haven't been baptized, schedule it with your pastor. If you have, thank God for your baptism and what it represents.`,
      estimatedMinutes: 35
    },
    {
      number: 8,
      title: 'Laying On of Hands',
      keyPassages: ['Hebrews 6:1-2', 'Mark 16:18', 'Acts 8:17', 'Acts 13:2-3', '1 Timothy 5:22'],
      questions: [
        `Where in your life do you need prayer with laying on of hands?`,
        `How can you prepare your heart to receive from God through this practice?`
      ],
      application: `Seek prayer with laying on of hands for a specific need. Prepare your heart with faith and humility.`,
      estimatedMinutes: 30
    },
    {
      number: 9,
      title: 'Faith',
      keyPassages: ['Hebrews 11:1-6', 'Romans 10:17', 'James 2:14-26', 'Mark 11:24'],
      questions: [
        `Where is God inviting you to trust Him next?`,
        `Which Scripture will you meditate on to strengthen faith?`,
        `What step of obedience will you take this week?`
      ],
      application: `Choose one Scripture promise and meditate on it daily. Take one step of faith-filled obedience this week.`,
      estimatedMinutes: 40
    },
    {
      number: 10,
      title: 'Worship',
      keyPassages: ['John 4:24', 'Psalm 96:4', '1 Peter 2:9', 'Ephesians 5:19', 'Romans 12:1'],
      questions: [
        `How can you prepare your heart before gathered worship?`,
        `Which biblical expressions of worship stretch you?`,
        `What would "living sacrifice" worship look like in your week?`
      ],
      application: `This week, try one new expression of worship (lifting hands, kneeling, etc.). Prepare your heart before Sunday worship.`,
      estimatedMinutes: 45
    },
    {
      number: 11,
      title: 'Your Gifts',
      keyPassages: ['1 Corinthians 12', 'Ephesians 4:11-16', '1 Corinthians 12:7', '1 Corinthians 13'],
      questions: [
        `Where do you sense grace and fruit as you serve?`,
        `Who can affirm and help develop your gifts?`,
        `How will you use your gifts this month to build others up?`
      ],
      application: `Ask a mature believer what gifts they see in you. Commit to using your gifts to serve others this month.`,
      estimatedMinutes: 40
    },
    {
      number: 12,
      title: 'Baptism of the Holy Spirit',
      keyPassages: ['Matthew 3:11', 'Luke 24:49', 'Acts 1:8', 'Luke 11:13', 'Acts 2'],
      questions: [
        `Have you asked Jesus to baptize you with the Holy Spirit?`,
        `What hinders your expectancy?`,
        `Who can pray with you to receive?`
      ],
      application: `Ask Jesus to baptize you with the Holy Spirit. Yield your whole self to Him and expect to receive.`,
      estimatedMinutes: 40
    },
    {
      number: 13,
      title: 'Our Eternity',
      keyPassages: ['2 Corinthians 5:8', 'Philippians 1:23', 'Revelation 21:4', 'Matthew 25:41', '2 Thessalonians 1:8-9'],
      questions: [
        `How does eternity shape your choices this week?`,
        `Who is one person you will pray for and engage with the gospel?`
      ],
      application: `Write down three people who don't know Jesus. Pray for them daily and look for opportunities to share the gospel.`,
      estimatedMinutes: 45
    },
    {
      number: 14,
      title: 'Resurrection of the Dead',
      keyPassages: ['1 Corinthians 15', '1 Corinthians 15:20-23', 'Philippians 3:20-21', '1 Thessalonians 4:13-18'],
      questions: [
        `Which aspect of the resurrection most encourages you?`,
        `How does this hope motivate your service today?`
      ],
      application: `Meditate on the promise of resurrection. Let this hope fuel your faithfulness in serving the Lord this week.`,
      estimatedMinutes: 35
    },
    {
      number: 15,
      title: 'Marriage and the Home',
      keyPassages: ['Genesis 2:24', 'Ephesians 5:22-6:4', 'Colossians 3:18-21', 'Hebrews 13:4'],
      questions: [
        `Where can you show Christlike love at home this week?`,
        `What practices will keep short accounts and quick forgiveness?`,
        `How can your household serve others together?`
      ],
      application: `Identify one way to love your family more like Christ this week. Plan one way your household can serve together.`,
      estimatedMinutes: 50
    },
    {
      number: 16,
      title: 'What God Says About Money',
      keyPassages: ['Psalm 24:1', 'Matthew 6:24-34', '2 Corinthians 9:6-8', 'Malachi 3:10', '1 Timothy 6:6-10'],
      questions: [
        `What step will you take to put God first in finances?`,
        `Where can you create margin (spend less / save more) this month?`,
        `How will you participate in funding the Great Commission?`
      ],
      application: `Review your budget. Commit to honoring God with the first 10% and look for one area to increase margin.`,
      estimatedMinutes: 40
    }
  ],
  totalSessions: 16,
  source: 'Pastor Doug Gilford',
  sourceUrl: '',
  difficulty: 'beginner'
};