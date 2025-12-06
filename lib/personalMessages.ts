// Personal messages to make the app feel alive and conversational
// Warm, empathetic, friendly - like a good friend who cares

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 6) {
    const greetings = [
      "We all need moments of quiet before the world wakes up. This is yours.",
      "There's something special about these early hours. God meets us here.",
      "The stillness of early morning is a gift. Let's not waste it.",
      "Rest can be hard to find. Maybe peace is what you're really looking for.",
      "Before the chaos begins, there's space to breathe. Take it.",
      "Early risers often carry heavy hearts. God knows yours.",
      "The best conversations happen when the world is still sleeping.",
      "This quiet moment matters more than you might think.",
      "Some of the deepest growth happens in the dark hours before dawn."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else if (hour < 12) {
    const greetings = [
      "A new day, a fresh start. We all need those.",
      "Mornings remind us that God's mercies are new every day.",
      "Whatever today holds, you don't have to face it alone.",
      "Starting the day grounded makes everything else easier.",
      "There's grace for today. That's all we need to know.",
      "Every morning is proof that God gives second chances.",
      "The weight of yesterday doesn't have to follow you into today.",
      "You woke up. That alone is a gift worth acknowledging.",
      "Today has possibilities you haven't even imagined yet.",
      "Morning light has a way of making things clearer."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else if (hour < 17) {
    const greetings = [
      "The middle of the day can feel heavy. God's strength is real.",
      "Taking time to pause matters. You're doing something important right now.",
      "We all need a moment to catch our breath. This is yours.",
      "Life gets busy, but God never stops being present.",
      "A few minutes with God can change the whole rest of your day.",
      "Sometimes the best thing we can do is just stop for a moment.",
      "Afternoons can feel like the hardest stretch. You're not imagining it.",
      "Right in the middle of everything, God is still working.",
      "This pause you're taking? It's not weakness. It's wisdom.",
      "You don't have to power through alone. Help is here."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else if (hour < 22) {
    const greetings = [
      "God's peace is what we all need. This app will help you find it.",
      "The day's almost done. Let's end it with something meaningful.",
      "Evening is a beautiful time to reflect on what matters most.",
      "You made it through today. That's worth acknowledging.",
      "There's rest waiting for you in God's presence tonight.",
      "Sometimes we just need to be still. This is that moment.",
      "The noise of the day fades here. Just you and God now.",
      "Whatever happened today, grace covers it all.",
      "You showed up. That's what matters. God honors that.",
      "Evenings are for exhaling. Let the tension go.",
      "The day may have been hard, but it doesn't get the final word.",
      "Before sleep comes, there's room for gratitude.",
      "God doesn't keep score of your mistakes. Neither should you.",
      "Rest isn't earned. It's a gift. Receive it tonight."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else {
    const greetings = [
      "Late nights can be lonely, but you're not alone. God is here.",
      "The quiet hours are often when God speaks the clearest.",
      "Can't sleep? Maybe there's something God wants you to hear.",
      "The world is asleep, but God never is. He sees you right now.",
      "These moments of stillness are precious. Don't rush them.",
      "Whatever's keeping you up, you can bring it to God.",
      "Night seasons can be hard. But God's presence is real, even now.",
      "The darkness isn't as empty as it feels. God fills it.",
      "Late night thoughts hit different. God can handle them all.",
      "When sleep won't come, peace still can.",
      "The midnight hours have heard more prayers than any church.",
      "You're not the only one awake right now. God is too."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
}

export function getTimeGreetingPrefix(): string {
  const hour = new Date().getHours();

  if (hour < 6) {
    const options = ["Up early", "Rise and shine", "Good early morning"];
    return options[Math.floor(Math.random() * options.length)];
  }
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  if (hour < 22) return "Good evening";
  // Late night (after 10pm)
  const lateOptions = ["Up late", "Still up", "Burning the midnight oil"];
  return lateOptions[Math.floor(Math.random() * lateOptions.length)];
}

// Weather-aware greetings - returns null if shouldn't show (random ~35% chance)
export function getWeatherAwareGreeting(scene: string | null, tempF?: number | null): string | null {
  // Only show weather greeting about 35% of the time
  if (Math.random() > 0.35) return null;
  if (!scene) return null;

  // Check if it's Christmas week (Dec 20-26)
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const day = now.getDate();
  const isChristmasWeek = month === 11 && day >= 20 && day <= 26;
  const isChristmasDay = month === 11 && day === 25;

  // Cold weather greetings (temp below 45°F)
  const coldGreetings = [
    "Brrrr, it's cold out there! Warm up with some time in the Word.",
    "Bundle up! It's chilly outside. Perfect time to cozy up with Scripture.",
    "It's freezing out there! Good thing God's love warms the heart.",
    "Cold one today! Hot coffee and God's Word — that's the combo.",
    "Chilly day! Stay warm. God's got you covered.",
  ];

  // Christmas week cold greetings
  const christmasColdGreetings = [
    "Baby, it's cold outside! But God's love keeps us warm this Christmas.",
    "Brrrr! It's beginning to feel a lot like Christmas!",
    "Cold outside, but the Christmas spirit is warm. Emmanuel is with us!",
    "It's cold, but Christmas joy warms the soul!",
    "Baby, it's cold outside! Perfect weather for the Christmas season.",
  ];

  // Hot weather greetings (temp above 85°F)
  const hotGreetings = [
    "Whew, it's hot out there! Stay cool and hydrated.",
    "Summer heat is no joke! Take it easy out there.",
    "Hot one today! God's refreshing presence is what we need.",
    "Scorcher! Stay in the shade and in the Word.",
  ];

  // If we have temperature data, use it
  if (tempF !== undefined && tempF !== null) {
    if (tempF < 45) {
      if (isChristmasWeek) {
        return christmasColdGreetings[Math.floor(Math.random() * christmasColdGreetings.length)];
      }
      return coldGreetings[Math.floor(Math.random() * coldGreetings.length)];
    }
    if (tempF > 85) {
      return hotGreetings[Math.floor(Math.random() * hotGreetings.length)];
    }
  }

  const weatherGreetings: Record<string, string[]> = {
    'sunny': [
      "Beautiful day outside! Soak up that sunshine.",
      "The sun is shining. So is God's love for you.",
      "Clear skies today! What a gift.",
      "Gorgeous day out there! Enjoy it.",
    ],
    'partly-cloudy': [
      "Nice day out there. A few clouds, but mostly good vibes.",
      "Partly cloudy — could be worse, could be better. Just like life sometimes!",
      "Mixed skies today. God's love remains constant through it all.",
    ],
    'cloudy': [
      "Overcast today. Cozy weather for some quiet time.",
      "Gray skies outside. Good day to stay in.",
      "Cloudy day. Sometimes we need the clouds to appreciate the sun.",
    ],
    'rainy': [
      "It's raining! Perfect excuse to stay in with a good book (hint: the Bible).",
      "Rain is falling. Cozy up and let God's Word wash over you.",
      "Wet weather out there. Good day to stay in and stay close to God.",
      "Rainy day vibes. Time for some indoor soul care.",
    ],
    'stormy': [
      "Storms outside! Stay safe in there.",
      "Wild weather today. The One who calms storms is with you.",
      "It's storming! Perfect time to remember who controls the wind and waves.",
      "Rough weather out there. You're safe here.",
    ],
    'snowy': [
      "Snow day! There's something magical about it.",
      "It's snowing! Enjoy the wonder.",
      "Winter wonderland outside. Stay warm!",
      "Snow falling. God makes all things white as snow.",
    ],
    'night-clear': [
      "Clear night sky. The stars are putting on a show!",
      "Stars are out tonight. Beautiful night.",
      "Gorgeous night. God's wonders are on full display.",
    ],
    'night-cloudy': [
      "Quiet night outside. Hope you're winding down well.",
      "Cloudy evening. Peaceful in its own way.",
    ],
    'foggy': [
      "Foggy out there. Mysterious kind of day.",
      "Hazy day. Drive careful if you're heading out!",
    ],
    'tornado': [
      "Dangerous weather! Stay safe. God is your refuge.",
      "Severe weather warning. Stay sheltered and stay safe.",
    ],
    'hurricane': [
      "Major storm approaching. Stay safe out there!",
      "Storm warnings. Praying for everyone in the path.",
    ],
    'christmas': [
      "Merry Christmas! The Light of the World came for you.",
      "It's Christmastime! Emmanuel — God with us.",
      "Christmas vibes! The greatest gift ever given.",
      "Merry Christmas! Hope your day is full of joy.",
      ...(isChristmasDay ? ["Merry Christmas Day! He is born!", "It's Christmas! Celebrate the Savior!"] : []),
    ],
    'thanksgiving': [
      "Happy Thanksgiving! What are you grateful for today?",
      "Thanksgiving vibes. Gratitude changes everything.",
      "Turkey day! Hope you're with people you love.",
    ],
    'easter': [
      "Happy Easter! He is risen!",
      "Easter Sunday! That changes everything.",
      "Resurrection day! Because He lives, we have hope.",
    ],
    'new-years': [
      "Happy New Year! Fresh start energy.",
      "New year, new mercies! Here we go.",
      "New beginnings. God makes all things new.",
    ],
    'valentines': [
      "Happy Valentine's Day! You are deeply loved.",
      "Love is in the air. God's love is the greatest of all.",
    ],
  };

  const greetings = weatherGreetings[scene];
  if (!greetings || greetings.length === 0) return null;

  return greetings[Math.floor(Math.random() * greetings.length)];
}

export function getLoadingMessage(): string {
  const messages = [
    "Hang tight...",
    "Just a sec...",
    "Getting that for you...",
    "One moment...",
    "Almost there...",
    "Loading...",
    "Working on it...",
    "Hold on...",
    "Just a moment...",
    "Bear with me..."
  ];
  return messages[Math.floor(Math.random() * messages.length)];
}

export function getEncouragingWord(): string {
  const words = [
    "God's got you. Even when it doesn't feel like it.",
    "You're not alone. Never have been, never will be.",
    "Keep going. One step at a time.",
    "God sees you. He knows. He cares.",
    "You're doing better than you think.",
    "Grace upon grace. That's what He gives.",
    "He's working even when you can't see it.",
    "Your faithfulness matters. Keep showing up.",
    "It's okay to not be okay. God can handle it.",
    "He loves you. Nothing can change that.",
    "One day at a time. That's all He asks.",
    "You're stronger than you know because He's in you."
  ];
  return words[Math.floor(Math.random() * words.length)];
}

export function getPastorNote(): string {
  const notes = [
    // Original encouraging notes
    "💭 Quick thought: God's not looking for perfect. He's looking for willing.",
    "📖 Been thinking: Sometimes the hardest prayers are the most honest ones.",
    "💡 Remember: Your struggle doesn't disqualify you. It often prepares you.",
    "🙏 On my heart today: God's timing isn't late. It's perfect.",
    "✨ Real talk: You don't have to have it all figured out. Just take the next step.",
    "🌟 Reminder: God's not disappointed in you. He's cheering you on.",
    "💪 Truth: Your past doesn't define you. God's grace does.",
    "❤️ From my heart: God's love for you isn't based on your performance.",
    "🔥 Don't forget: Your worst day doesn't change God's best promise.",
    // Encouraging words from Spiritual Foundations course
    "Salvation is God's free gift, received by grace through faith.",
    "In Christ you are a new creation and a child of God.",
    "You have been born again into abundant life in God's family as His child.",
    "God loves all people and desires to be their Father.",
    "By new birth and adoption you become an heir of God and co-heir with Christ.",
    "God has a place for you to serve and flourish.",
    "You won't grow as you should apart from a local church.",
    "The church needs your presence, prayers, giving, and gifts.",
    "Victory is God's will for you in Christ.",
    "Your weapons: God's Word, Christ's blood, faith, prayer, and steadfast obedience.",
    "Stand firm and resist; do not fight alone.",
    "Keep coming to Jesus — for mercy after sin and grace before temptation.",
    "Faith is how we start and how we finish.",
    "Community is essential; isolation is dangerous.",
    "God's discipline is love in action, producing holiness and fruit.",
    "God's kindness and godly sorrow lead us to repent.",
    "Faith rests on who God is and what He has said.",
    "Real faith works through love and obedience.",
    "Feed faith with Scripture; starve doubt with prayerful obedience.",
    "You are gifted by God for the good of others.",
    "Gifts flourish through service, feedback, and faithfulness.",
    "God fills hungry hearts; keep asking and yielding.",
    "Expect growth in boldness, love, and spiritual gifts.",
    "Heaven with Christ is the believer's sure hope.",
    "Resurrection hope rests on Jesus' empty tomb.",
    "Our future bodies will be incorruptible and Christlike.",
    "Hope in Christ gives us strength to keep serving faithfully.",
    "Healthy homes grow from sacrificial love and mutual honor.",
    "Giving fuels mission; integrity guards witness.",
    "Submit to God, resist the devil, and he will flee.",
    "The One in you is greater than the one in the world.",
    "If you gonna be stupid...don't stay that way for long."
  ];
  return notes[Math.floor(Math.random() * notes.length)];
}

export function getEmptyStateMessage(context: 'library' | 'prayer' | 'notes' | 'general'): string {
  switch (context) {
    case 'library':
      return "Nothing saved yet? That's okay! Every journey starts somewhere. As you study, save your favorites here.";
    case 'prayer':
      return "No prayers yet? That's fine! God hears your heart even before the words come. Ready to start?";
    case 'notes':
      return "No notes yet? No worries! God's teaching you things every day. Start capturing them here.";
    case 'general':
    default:
      return "Nothing here yet, but that's okay! We all start somewhere. Let's begin this journey together.";
  }
}

export function getErrorMessage(type: '404' | '500' | 'network' | 'general'): { title: string; message: string } {
  switch (type) {
    case '404':
      return {
        title: "Hmm, can't find that page",
        message: "Looks like this page doesn't exist or moved. No worries - let me help you get where you need to go. Try the menu above, or head back home."
      };
    case '500':
      return {
        title: "Oops, something went wrong",
        message: "My bad! Something broke on our end. We're on it. Try refreshing, or come back in a few minutes. Your patience means the world."
      };
    case 'network':
      return {
        title: "Can't connect right now",
        message: "Looks like your internet connection is having a moment. Check your connection and try again. I'll be here when you're back!"
      };
    case 'general':
    default:
      return {
        title: "Uh oh, hit a snag",
        message: "Something didn't work right. Try again? If it keeps happening, let me know so I can fix it for you."
      };
  }
}

export function getButtonText(action: 'save' | 'submit' | 'continue' | 'start' | 'load_more'): string {
  switch (action) {
    case 'save':
      const saveTexts = ["Save it", "Keep this", "Save", "Store this"];
      return saveTexts[Math.floor(Math.random() * saveTexts.length)];
    case 'submit':
      const submitTexts = ["Send it", "Submit", "Let's go", "Send"];
      return submitTexts[Math.floor(Math.random() * submitTexts.length)];
    case 'continue':
      const continueTexts = ["Keep going", "Continue", "Next", "Let's continue"];
      return continueTexts[Math.floor(Math.random() * continueTexts.length)];
    case 'start':
      const startTexts = ["Let's start", "Begin", "Start", "Let's do this"];
      return startTexts[Math.floor(Math.random() * startTexts.length)];
    case 'load_more':
      const loadTexts = ["Show me more", "Load more", "More", "Keep loading"];
      return loadTexts[Math.floor(Math.random() * loadTexts.length)];
    default:
      return action;
  }
}

export function getStudyPrompt(): string {
  const prompts = [
    "What's on your heart?",
    "What's on your mind today? A Bible verse, or biblical view on a topic?",
    "Where do you want to dig in?",
    "What question do you have?",
    "What would you like to explore today?",
    "What do you want to learn?",
    "Where should we start?"
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}
