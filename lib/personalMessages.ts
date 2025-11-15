// Personal messages to make the app feel alive and conversational
// Like Doug is right there with you

export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 6) {
    const greetings = [
      "Up early seeking the Lord? I love it!",
      "Early morning with God is the best time.",
      "You're up early! Let's spend some time in the Word.",
      "Can't sleep? God's got something to tell you."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else if (hour < 12) {
    const greetings = [
      "Good morning! Let's start this day right.",
      "Morning! Ready to dig into God's Word?",
      "Hey there! Great morning to grow in faith.",
      "Good morning! What's God teaching you today?",
      "Morning! Let's make today count for the Kingdom."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else if (hour < 17) {
    const greetings = [
      "Good afternoon! Taking a break to refuel?",
      "Hey! Perfect time for some spiritual refreshment.",
      "Afternoon! Let's spend some time together.",
      "Good afternoon! Need some encouragement today?",
      "Hey there! Glad you're here."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else if (hour < 22) {
    const greetings = [
      "Good evening! Ending your day with God?",
      "Evening! Let's wind down with some truth.",
      "Good evening! How's your heart tonight?",
      "Hey! Perfect time to reflect on God's goodness.",
      "Evening! Let's close the day well together."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  } else {
    const greetings = [
      "Up late? God's still here with you.",
      "Late night study session? I'm here for it.",
      "Can't sleep? Let's seek God together.",
      "Burning the midnight oil? Let me help."
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
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
    "🎯 Keep this in mind: Progress over perfection. Always.",
    "❤️ From my heart: God's love for you isn't based on your performance.",
    "🔥 Don't forget: Your worst day doesn't change God's best promise.",
    // Pastor Doug's encouraging words from Spiritual Foundations
    "Salvation is God's free gift, received by grace through faith. -PD",
    "In Christ you are a new creation and a child of God. -PD",
    "You have been born again into abundant life in God's family as His child. -PD",
    "God loves all people and desires to be their Father. -PD",
    "By new birth and adoption you become an heir of God and co-heir with Christ. -PD",
    "God has a place for you to serve and flourish. -PD",
    "You won't grow as you should apart from a local church. -PD",
    "The church needs your presence, prayers, giving, and gifts. -PD",
    "Victory is God's will for you in Christ. -PD",
    "Your weapons: God's Word, Christ's blood, faith, prayer, and steadfast obedience. -PD",
    "Stand firm and resist; do not fight alone. -PD",
    "Keep coming to Jesus — for mercy after sin and grace before temptation. -PD",
    "Faith is how we start and how we finish. -PD",
    "Community is essential; isolation is dangerous. -PD",
    "God's discipline is love in action, producing holiness and fruit. -PD",
    "God's kindness and godly sorrow lead us to repent. -PD",
    "Faith rests on who God is and what He has said. -PD",
    "Real faith works through love and obedience. -PD",
    "Feed faith with Scripture; starve doubt with prayerful obedience. -PD",
    "You are gifted by God for the good of others. -PD",
    "Gifts flourish through service, feedback, and faithfulness. -PD",
    "God fills hungry hearts; keep asking and yielding. -PD",
    "Expect growth in boldness, love, and spiritual gifts. -PD",
    "Heaven with Christ is the believer's sure hope. -PD",
    "Resurrection hope rests on Jesus' empty tomb. -PD",
    "Our future bodies will be incorruptible and Christlike. -PD",
    "Hope fuels steadfast work in the Lord now. -PD",
    "Healthy homes grow from sacrificial love and mutual honor. -PD",
    "Giving fuels mission; integrity guards witness. -PD",
    "Submit to God, resist the devil, and he will flee. -PD",
    "The One in you is greater than the one in the world. -PD"
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
    "What's God showing you today?",
    "What's on your heart?",
    "What passage is speaking to you?",
    "Where do you want to dig in?",
    "What question do you have?",
    "What are you wrestling with?",
    "What do you want to learn?",
    "Where should we start?"
  ];
  return prompts[Math.floor(Math.random() * prompts.length)];
}
