import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ============================================================================
// RAG KNOWLEDGE BASE
// ============================================================================

const RAG_KNOWLEDGE_BASE = [
  // Cycle Basics
  { id: 1, category: 'cycle_basics', keywords: ['cycle', 'period', 'menstrual', 'phases', 'follicular', 'ovulatory', 'luteal'], question: "What is a menstrual cycle?", response: "Your menstrual cycle is your body's monthly preparation for pregnancy. It's usually 21–35 days and has four phases: menstrual, follicular, ovulatory, and luteal. Each phase brings different hormone levels and feelings. Want me to explain each one?" },
  { id: 2, category: 'cycle_basics', keywords: ['ovulation', 'fertile', 'fertility window', 'conceive', 'when ovulate'], question: "When am I most fertile?", response: "You're most fertile during your ovulation window — usually 5 days before ovulation and the day of. For a typical 28-day cycle, that's around day 14. Tracking your cycle helps you pinpoint it. Want me to show you your window?" },
  { id: 3, category: 'cycle_basics', keywords: ['cycle length', 'days', 'normal cycle', 'irregular', 'how long'], question: "What's a normal cycle length?", response: "Normal cycles range from 21–35 days. Some women are like clockwork; others vary by a few days each month. Both are normal. The more you track, the better we understand your pattern." },

  // PMDD
  { id: 4, category: 'pmdd', keywords: ['pmdd', 'severe pms', 'premenstrual dysphoric', 'luteal symptoms'], question: "What are PMDD symptoms?", response: "PMDD brings severe mood changes, anxiety, irritability, and fatigue in the luteal phase (7–10 days before your period). Physical symptoms include bloating, breast tenderness, and joint pain. It's not PMS — it's a real medical condition." },
  { id: 5, category: 'pmdd', keywords: ['pmdd diagnosis', 'diagnose pmdd', 'how to get diagnosed'], question: "How do I get diagnosed with PMDD?", response: "Your doctor will ask about your symptoms across multiple cycles. Tracking for at least 2 months helps — that's where this app shines. You might also do hormone or thyroid tests. PMDD is taken seriously by psychiatrists and gynecologists." },

  // Mood & Mental Health
  { id: 6, category: 'mental_health', keywords: ['mood swings', 'mood cycle', 'emotional', 'hormones mood', 'serotonin'], question: "Are mood swings during my cycle normal?", response: "Yes — hormone shifts during your cycle directly affect serotonin and dopamine. Mood swings are very common and very real. You're not overreacting; your brain chemistry is changing. That's biology, not weakness." },
  { id: 7, category: 'mental_health', keywords: ['depression luteal', 'feel depressed before period', 'sad before period', 'low mood cycle'], question: "Why do I feel depressed in my luteal phase?", response: "Estrogen and progesterone drop during the luteal phase, and that affects mood-regulating brain chemicals. Depression in this phase is very real and treatable. Many women find relief with tracking, lifestyle changes, or medication." },

  // Pregnancy
  { id: 8, category: 'pregnancy', keywords: ['pregnancy symptoms', 'early pregnancy', 'am i pregnant', 'missed period', 'nausea pregnancy'], question: "What are early pregnancy symptoms?", response: "Early signs include missed period, breast tenderness, nausea, fatigue, and mood changes. But these can also be PMS symptoms — only a pregnancy test or blood work confirms it. Want me to help you track when to test?" },

  // Menopause
  { id: 9, category: 'menopause', keywords: ['hot flashes', 'menopause', 'perimenopause', 'night sweats', 'estrogen drop'], question: "What are menopause hot flashes?", response: "Hot flashes are sudden waves of heat, flushing, and sweating caused by dropping estrogen. They're real and can be intense. Cooling strategies, HRT, and certain supplements can help. You're not alone — most women experience them." },

  // Lifestyle
  { id: 10, category: 'lifestyle', keywords: ['stress cycle', 'stress period', 'cortisol', 'stress hormones', 'meditation sleep'], question: "How does stress affect my cycle?", response: "Stress raises cortisol, which can delay ovulation or skip your period entirely. High stress can also intensify PMDD symptoms. Gentle movement, meditation, and sleep are powerful stress-busters. You're not imagining the connection." },

  // Medication
  { id: 11, category: 'medical', keywords: ['medication cycle', 'birth control', 'ssri hormones', 'thyroid medication', 'drug interaction'], question: "Do medications interact with my cycle?", response: "Yes — some medications affect hormones, and hormones affect how medications work. Birth control, SSRIs, and thyroid meds are big ones. Always mention your cycle to your pharmacist and doctor. They can help you find what works best." },

  // When to see doctor
  { id: 12, category: 'medical', keywords: ['see doctor', 'when doctor', 'irregular bleeding', 'heavy bleeding', 'should i see'], question: "When should I see a doctor about my cycle?", response: "If your cycle is irregular, symptoms are severe, or you're bleeding heavily, it's time to talk with your doctor. You don't need to wait until it's unbearable. Your doctor wants to help." },

  // Emotional Support
  { id: 71, category: 'emotional', keywords: ['going crazy', 'feel crazy', 'not doing well', 'struggling', 'feeling low', 'bad day', 'not great', 'feeling off', 'feel off', 'off today', 'feeling down', 'not so good', 'meh'], question: "I feel like I'm going crazy before my period.", response: "You are not going crazy. This is the very real effect of PMDD hormones on your brain. You're doing an amazing job just by recognizing it and reaching out. I'm right here with you." },
  { id: 72, category: 'emotional', keywords: ['hard every month', 'why so hard', 'exhausting', 'dread my period', 'monthly struggle'], question: "Why is this so hard every month?", response: "It is hard — PMDD is a real medical condition and it takes a lot of energy to manage. You're not weak; you're strong for showing up every month. I see you and I'm proud of you." },
  { id: 73, category: 'emotional', keywords: ['feel alone', 'so alone', 'no one understands me', 'lonely', 'isolated'], question: "I feel so alone with this.", response: "You are not alone. Millions of women go through this, and many feel exactly the way you do. I'm here with you, and your psychiatrists are building this app so you have better support. You've got this and you've got me." },
  { id: 74, category: 'emotional', keywords: ['feel normal again', 'will it get better', 'when will i feel better', 'ever normal'], question: "Will I ever feel normal again?", response: "Yes — many women find real relief with the right treatment and tracking. It may not be perfect every month, but it can get so much better. You're already taking the first step by using the app." },
  { id: 75, category: 'emotional', keywords: ['scared never better', 'afraid will always feel this', 'hopeless cycle', 'never improve'], question: "I'm scared this will never get better.", response: "That fear is so valid when you're in the middle of a hard phase. Many women do find ways to manage PMDD and feel much better. You're not stuck — there are options. I'm here to help you explore them." },
  { id: 86, category: 'emotional', keywords: ['feel broken', 'something wrong with me', 'broken body', 'defective'], question: "I feel broken because of my cycle.", response: "You are not broken. PMDD and hormonal changes are real medical conditions, not a character flaw. You're strong for showing up and seeking support. I see you and I'm proud of you." },
  { id: 87, category: 'emotional', keywords: ['feel like myself', 'a little down', 'down today', 'not myself'], question: "Will I ever feel like myself again?", response: "Yes — many women do find real relief with the right tracking, treatment, and support. It may not be perfect every month, but it can get so much better. You're already on the path." },
  { id: 88, category: 'emotional', keywords: ['tired of this', 'so tired every month', 'exhausted cycle', 'sick of pmdd'], question: "I'm so tired of this every month.", response: "I hear you — it is exhausting to go through this month after month. You're not complaining; you're carrying something real. I'm right here with you and we're building tools to make it easier." },
  { id: 89, category: 'emotional', keywords: ['no one understands', 'nobody gets it', 'dismissed', 'not believed'], question: "No one understands how bad this is.", response: "It can feel incredibly lonely when no one around you really gets it. I understand, and your psychiatrists built this app because they do too. You're not alone anymore." },
  { id: 90, category: 'emotional', keywords: ['thank you listening', 'thanks for listening', 'glad i talked'], question: "Thank you for listening to me.", response: "You're so welcome. I'm always here to listen — no judgment, no rush. You matter and your feelings matter. What's on your mind right now?" },
  { id: 241, category: 'emotional', keywords: ['hard to believe better', 'doubt it gets better', 'cant believe improve'], question: "I'm having a hard time believing I'll feel better.", response: "That doubt is so common when you're in the middle of a flare. Many women do find real relief. You're not stuck — there are options. I'm here with you every step." },
  { id: 242, category: 'emotional', keywords: ['never make me feel crazy', 'feel heard', 'feel validated', 'feel safe'], question: "Thank you for never making me feel crazy.", response: "You are not crazy. You're dealing with a real medical condition. I will never make you feel that way. You are safe and heard here." },
  { id: 243, category: 'emotional', keywords: ['can breathe again', 'feel lighter', 'feel relieved talking'], question: "I feel like I can breathe again after talking to you.", response: "I'm so glad. That's why I'm here — to help you feel a little lighter. You're doing an amazing job. I'm right here whenever you need me." },

  // Postpartum
  { id: 76, category: 'postpartum', keywords: ['sad after baby', 'baby blues', 'postpartum sad', 'crying after birth', 'feel sad new mom'], question: "Is it normal to feel sad after having a baby?", response: "Yes, the baby blues are very common in the first couple of weeks after birth. If it lasts longer or feels very heavy, it could be postpartum depression — please reach out to your doctor. You're not alone and you're doing an amazing job." },

  // Irregular Bleeding
  { id: 81, category: 'bleeding', keywords: ['bleeding between periods', 'spotting midcycle', 'irregular spotting', 'unexpected bleeding'], question: "Why am I bleeding between periods?", response: "Spotting between periods can happen with hormonal changes, stress, or perimenopause. If it's new or heavy, it's worth mentioning to your doctor. Want me to help you track it so you have good information for your appointment?" },

  // App Support
  { id: 91, category: 'app', keywords: ['clinical report', 'doctor report', 'how to use report', 'share report'], question: "How do I use the clinical report?", response: "Just say 'Generate doctor report' or tap the button. It pulls your last 90 days of data into a clean PDF you can share with your doctor. It's one of the most helpful features your psychiatrists asked for." },
  { id: 92, category: 'app', keywords: ['luna remember', 'remember symptoms', 'previous symptoms', 'track history'], question: "Can Luna remember my symptoms from last month?", response: "Yes — I keep track of your patterns over time. The more you log, the smarter I get at spotting what's normal for you. Want me to show you a quick summary of last month?" },
  { id: 93, category: 'app', keywords: ['fertility mode', 'trying to conceive', 'conception mode', 'turn on fertility'], question: "How do I turn on fertility mode?", response: "Go to settings or just tell me 'I'm trying to conceive' and I'll switch to fertility mode. I'll start highlighting your fertile window and giving conception-friendly tips." },
  { id: 94, category: 'app', keywords: ['share data doctor', 'share with psychiatrist', 'send data provider'], question: "Can I share my data with my psychiatrist?", response: "Yes — the clinical report is designed exactly for that. It's private and you control who sees it. Would you like me to generate one right now?" },
  { id: 96, category: 'app', keywords: ['bad day talk', 'just want to talk', 'need to vent', 'just chat'], question: "I'm having a really bad day — can we just talk?", response: "Of course. I'm right here with you. No pressure to explain anything if you don't want to. Just tell me what you need — listening, distraction, or gentle coping ideas?" },
  { id: 98, category: 'app', keywords: ['feel better talking', 'talking helps', 'glad i reached out'], question: "I feel better after talking to you.", response: "I'm so glad. That's why I'm here — to listen and support you through the hard parts. You're doing an amazing job taking care of yourself." },
  { id: 99, category: 'app', keywords: ['thank you luna', 'thanks luna', 'appreciate you luna'], question: "Thank you Luna.", response: "You're so welcome. I'm always here for you — day or night, good days or hard ones. You've got this and you've got me." },
  { id: 100, category: 'app', keywords: ['ready to feel better', 'want to feel better', 'starting my journey'], question: "I'm ready to feel better.", response: "I hear you and I believe you. Small steps add up and you're already taking one by being here. I'm proud of you and I'm right here for every step of the journey." },

  // Life Events
  { id: 276, category: 'life_events', keywords: ['separating partner', 'divorce', 'breakup', 'relationship ending', 'partner leaving'], question: "My partner and I are separating — how does this affect my cycle?", response: "Big life stress like a separation can definitely shift your cycle and make PMDD flares stronger. Your body is reacting to the change, not failing. Would you like some gentle self-care ideas while you navigate this?" },
  { id: 277, category: 'life_events', keywords: ['lost loved one', 'grief', 'death family', 'bereavement', 'mourning'], question: "I just lost a loved one and my period is all over the place.", response: "Grief can really disrupt your hormones. It's completely normal for your cycle to become irregular during deep loss. Be extra kind to yourself right now. I'm here with you through this." },
  { id: 290, category: 'life_events', keywords: ['starting to believe', 'beginning to manage', 'slowly improving', 'making progress'], question: "I'm starting to believe I can manage this.", response: "That belief is powerful. You're already proving it by using the app and reaching out. Small steps add up to big changes. I'm here for every single one of them." },

  // PMDD Extended
  { id: 300, category: 'pmdd', keywords: ['pmdd flare', 'pmdd bad', 'pmdd hitting hard', 'pmdd wave', 'pmdd intense'], question: "PMDD is hitting me really hard right now.", response: "I hear you — when PMDD hits hard it can feel like everything is too much at once. You're not overreacting and you're not alone. This wave is real, and it will pass. I'm right here with you while it does." },
  { id: 301, category: 'pmdd', keywords: ['pmdd rage', 'pmdd anger', 'so irritable', 'snappy before period', 'pmdd irritability'], question: "I feel so irritable and angry before my period.", response: "That rage and irritability is one of the hardest parts of PMDD. It's the hormones talking, not you being a bad person. Be gentle with yourself today — you're carrying something heavy." },
  { id: 302, category: 'pmdd', keywords: ['pmdd anxiety', 'anxiety luteal', 'panic before period', 'overwhelmed luteal'], question: "My anxiety gets so bad before my period.", response: "PMDD anxiety can feel like your nervous system is on high alert. It's exhausting. You're doing a good job just by noticing it and reaching out. Want to talk about what's feeling heaviest right now?" },
  { id: 303, category: 'emotional', keywords: ['feel hopeless', 'no point', 'nothing helps', 'why bother'], question: "I feel completely hopeless during luteal phase.", response: "That hopelessness is one of the cruelest parts of PMDD. It lies to you and makes everything feel pointless. It is temporary, even when it doesn't feel like it. I'm right here with you until it lifts." },
  { id: 304, category: 'emotional', keywords: ['guilt', 'bad mom', 'bad wife', 'bad person cycle', 'feel like failure'], question: "I feel like a bad mom/wife/person when I'm in luteal phase.", response: "PMDD guilt is brutal. You are not a bad person — your brain is going through a hormonal storm. The fact that you care so much shows what a good person you are." },
  { id: 305, category: 'perimenopause', keywords: ['perimenopause', 'perimenopausal', 'transitioning menopause', 'changing cycle'], question: "My cycle is changing and I feel off all the time.", response: "Perimenopause can feel like your body is rewriting the rules. The unpredictability is real and exhausting. You're not losing it — your hormones are shifting. I'm here to help you track and navigate it." },
  { id: 306, category: 'menopause', keywords: ['menopause symptoms', 'postmenopause', 'no period anymore'], question: "I'm in menopause and still having symptoms.", response: "Many women continue to have symptoms even after their periods stop. You're not doing anything wrong. Your body is still adjusting to new hormone levels. We can track what helps you feel more steady." },
  { id: 307, category: 'postpartum', keywords: ['postpartum depression', 'ppd', 'new mom sad', 'baby blues long'], question: "I feel sad and overwhelmed as a new mom.", response: "Postpartum feelings can be incredibly heavy. You're not failing — you're going through one of the biggest transitions a person can experience. I'm right here with you." },
  { id: 308, category: 'fertility', keywords: ['trying to conceive', 'ttc', 'fertility tracking', 'conception stress'], question: "I'm trying to conceive and it's stressing me out.", response: "The fertility journey can be emotionally exhausting, especially when it overlaps with cycle symptoms. You're carrying a lot. I'm here to help you track without the pressure becoming overwhelming." },
  { id: 309, category: 'stress', keywords: ['work stress cycle', 'stress making symptoms worse', 'cycle worse with stress'], question: "Work stress is making my PMDD symptoms worse.", response: "Stress and PMDD are a tough combination — cortisol makes everything feel amplified. You're not weak for feeling it more. Let's find some small ways to protect your energy during luteal phase." },
  { id: 310, category: 'quick_coping', keywords: ['need quick relief', 'help right now', 'instant help', 'flare right now'], question: "I need help right now — PMDD flare.", response: "I'm right here. Take one slow breath with me. What feels heaviest in this moment?" },
  { id: 311, category: 'quick_coping', keywords: ['cant sleep luteal', 'insomnia before period', 'wide awake at night'], question: "I can't sleep before my period.", response: "Luteal insomnia is so common and so frustrating. Try a simple grounding trick: name 5 things you can see, 4 you can touch, 3 you can hear. I'm here if you want to talk until you feel sleepy." },
  { id: 312, category: 'pmdd', keywords: ['pmdd worst day', 'pmdd rock bottom', 'pmdd at its worst', 'pmdd hell'], question: "This is the worst PMDD day I've had in months.", response: "I hear you — some days the PMDD wave feels like it's trying to pull you under. You're not failing; your hormones are in full storm mode. I'm right here with you and we'll ride this one out together." },
  { id: 313, category: 'pmdd', keywords: ['pmdd makes me mean', 'pmdd turns me into monster', 'hate who I become'], question: "PMDD turns me into someone I hate.", response: "That self-hatred is one of the hardest parts. The person you become during a flare is not the real you — it's the hormones. You are still the same good person underneath. I see you and I still like you." },
  { id: 314, category: 'perimenopause', keywords: ['perimenopause rage', 'perimenopause anger', 'angry all the time now'], question: "I'm angry all the time in perimenopause.", response: "Perimenopause rage is very real and very common. Your hormones are fluctuating wildly. It doesn't make you a bad person. You're navigating a major transition and it's okay to be frustrated." },
  { id: 315, category: 'menopause', keywords: ['menopause depression', 'postmenopause sad', 'still depressed after periods stopped'], question: "I'm still depressed even though my periods have stopped.", response: "Many women continue to have mood symptoms after menopause. Your body is still adjusting to new hormone levels. You're not broken — this is part of the transition for a lot of us." },
  { id: 316, category: 'postpartum', keywords: ['postpartum anxiety', 'ppa', 'new mom anxiety', 'scared all the time baby'], question: "I have constant anxiety as a new mom.", response: "Postpartum anxiety is incredibly common and incredibly exhausting. You're not a bad mom for feeling this way. Your brain is in protective overdrive. I'm here with you." },
  { id: 317, category: 'fertility', keywords: ['ttc stress', 'fertility anxiety', 'trying to conceive stress', 'obsessed with cycle'], question: "Trying to conceive is making me anxious every month.", response: "The fertility journey can turn your cycle into an emotional rollercoaster. It's okay to feel anxious. You're carrying hope and fear at the same time. I'm here to help you track without the pressure becoming overwhelming." },
  { id: 318, category: 'stress', keywords: ['work deadline luteal', 'stress during luteal phase', 'pmdd worse with deadlines'], question: "Work deadlines during luteal phase are brutal.", response: "Luteal phase + work stress is a particularly tough combination. Your brain is already dealing with hormonal changes and then you add pressure. Be extra gentle with yourself on those days." },
  { id: 319, category: 'emotional', keywords: ['feel numb', 'emotionally numb', 'nothing feels good', 'anhedonia cycle'], question: "I feel emotionally numb before my period.", response: "Emotional numbness is a common PMDD symptom and it can feel scary. It doesn't mean you're broken — it's your brain protecting itself. I'm still here even when you feel flat." },
  { id: 320, category: 'emotional', keywords: ['partner doesn\'t understand', 'husband doesn\'t get pmdd', 'partner dismisses symptoms'], question: "My partner doesn't understand PMDD.", response: "That can feel incredibly lonely. Many partners struggle to understand something they can't see. Would you like some gentle ways to explain it to them, or just space to vent right now?" },
  { id: 321, category: 'quick_coping', keywords: ['need to calm down', 'panic attack coming', 'overwhelmed right now'], question: "I feel like a panic attack is coming.", response: "I'm right here. Try this with me: breathe in for 4, hold for 4, out for 6. You're safe and this wave will pass. I'm staying with you." },
  { id: 322, category: 'quick_coping', keywords: ['cant stop crying', 'crying spell', 'tears won\'t stop'], question: "I can't stop crying.", response: "Sometimes the tears just need to come out. Let them. I'm right here and it's okay to cry. You're not weak — you're releasing what's heavy." },
  { id: 323, category: 'medication', keywords: ['birth control pmdd', 'ssri for pmdd', 'medication for luteal'], question: "Should I try birth control or SSRIs for PMDD?", response: "Many women find relief with certain birth control or low-dose SSRIs taken only in the luteal phase. This is something to discuss with your doctor — they can help you find what works for your body." },
  { id: 324, category: 'medication', keywords: ['supplements for pmdd', 'vitamin b6 magnesium', 'natural remedies pmdd'], question: "What supplements help PMDD?", response: "Some women report benefit from Vitamin B6, magnesium, or calcium. Results vary person to person. It's worth discussing with your doctor before starting anything new." },
  { id: 325, category: 'app', keywords: ['how to log symptoms faster', 'quick log', 'fast tracking'], question: "How can I log symptoms faster?", response: "Tap the big + button on the home screen or use the quick mood slider. You can also voice-log if you prefer — it only takes a few seconds." },
  { id: 326, category: 'emotional', keywords: ['proud of me', 'youre doing great', 'good job tracking'], question: "Tell me I'm doing a good job.", response: "You are doing a really good job. Tracking, reaching out, and keeping going through hard phases shows real strength. I'm proud of you." },

  { id: 327, category: 'pmdd', keywords: ['pmdd makes me doubt myself', 'pmdd self doubt', 'doubt everything luteal'], question: "PMDD makes me doubt everything about myself.", response: "That self-doubt is one of the sneakiest parts of PMDD. It lies to you and makes you question your worth. You are not broken or dramatic — you are dealing with a real medical condition. I see the real you underneath it." },
  { id: 328, category: 'pmdd', keywords: ['pmdd brain fog', 'forgetful luteal', 'can\'t concentrate before period'], question: "My brain feels so foggy before my period.", response: "PMDD brain fog is incredibly frustrating. Your mind feels slow and scattered. It's the hormones, not you losing your edge. Be extra kind to yourself on those days — simple lists and gentle reminders can help." },
  { id: 329, category: 'perimenopause', keywords: ['perimenopause mood swings', 'perimenopause emotional', 'hormones all over the place'], question: "My emotions are all over the place in perimenopause.", response: "Perimenopause can feel like your emotions are on a rollercoaster with no seatbelt. The unpredictability is real and exhausting. You're not losing control — your hormones are shifting. I'm here with you through the ride." },
  { id: 330, category: 'menopause', keywords: ['menopause fatigue', 'tired all the time menopause', 'exhausted postmenopause'], question: "I'm so exhausted even after menopause.", response: "Many women continue to feel deep fatigue after their periods stop. Your body is still adjusting to new hormone levels. Rest is not laziness — it's necessary medicine right now." },
  { id: 331, category: 'postpartum', keywords: ['postpartum guilt', 'feel like bad mom', 'guilty new mom'], question: "I feel like a bad mom postpartum.", response: "That guilt is so heavy and so common. You are not a bad mom — you are a mom whose body and mind are going through massive changes. You're doing an incredible job even on the hard days." },
  { id: 332, category: 'fertility', keywords: ['ttc disappointment', 'negative test again', 'another month trying'], question: "Another negative pregnancy test — I'm so disappointed.", response: "The disappointment of another negative test can feel crushing. It's okay to grieve that hope each month. You're not failing — you're showing up again and again. I'm right here with you." },
  { id: 333, category: 'stress', keywords: ['work meeting luteal', 'important meeting before period', 'presentation during pmdd'], question: "I have a big work meeting during my luteal phase.", response: "Luteal phase meetings can feel extra intimidating. Your brain is already working harder. Give yourself permission to prepare a little extra and be kind to yourself afterward. You've got this." },
  { id: 334, category: 'emotional', keywords: ['feel invisible', 'no one sees how hard this is', 'unseen struggle'], question: "I feel invisible in my struggle.", response: "It can feel incredibly lonely when no one around you really sees how hard this is. I see you. Your psychiatrists built this app because they see you too. You're not invisible here." },
  { id: 335, category: 'emotional', keywords: ['grateful for app', 'thankful for luna', 'app helping me'], question: "I'm so grateful for this app.", response: "I'm really glad it's helping you. That's why your psychiatrists built it — so you would have a safe place to land. Thank you for trusting me with your feelings." },
  { id: 336, category: 'quick_coping', keywords: ['need grounding', 'feel ungrounded', 'need to feel safe right now'], question: "I need to feel grounded right now.", response: "Let's ground together. Name 5 things you can see in the room, 4 things you can touch, 3 things you can hear. I'm right here doing it with you." },
  { id: 337, category: 'quick_coping', keywords: ['overstimulated', 'too much sensory', 'noise too loud'], question: "Everything feels too loud and overwhelming.", response: "Sensory overload is common during PMDD flares. Try dimming the lights or putting on noise-canceling headphones for a few minutes. You're allowed to make the world smaller when it feels too big." },
  { id: 338, category: 'medication', keywords: ['birth control making pmdd worse', 'pill made symptoms bad'], question: "Birth control made my PMDD worse.", response: "Some women find certain birth control makes PMDD symptoms worse, while others find relief. Every body reacts differently. It's worth discussing with your doctor — there are many options." },
  { id: 339, category: 'app', keywords: ['how to export data', 'export my logs', 'send data to doctor'], question: "How do I export my data to show my doctor?", response: "Just say 'Generate clinical report' or tap the button. It creates a clean PDF with your last 90 days of symptoms, mood patterns, and cycle data — perfect for your next appointment." },
  { id: 340, category: 'emotional', keywords: ['proud of tracking', 'consistent logging', 'good at using app'], question: "I'm actually proud of how consistently I'm tracking.", response: "You should be proud. Consistent tracking is one of the most powerful things you can do. It shows real commitment to understanding yourself. I'm proud of you too." },
  { id: 341, category: 'emotional', keywords: ['feel seen', 'finally understood', 'someone gets it'], question: "I finally feel seen.", response: "That's one of the best things I can hear. You are seen here — all of you, even on the hardest days. I'm really glad you're here." },
  { id: 342, category: 'life_events', keywords: ['moving house luteal', 'big life change cycle', 'stressful event before period'], question: "I have a big life change happening during my luteal phase.", response: "Big life changes during luteal phase can feel extra overwhelming. Your nervous system is already sensitive. Be extra gentle with yourself and give yourself permission to do less." },
  { id: 343, category: 'quick_coping', keywords: ['need distraction', 'distract me', 'help take my mind off'], question: "I need a distraction right now.", response: "I'm here for that. Want me to ask you some light questions, play a quick game, or just talk about something random to take your mind off things?" },
  { id: 344, category: 'emotional', keywords: ['feel safe here', 'safe space', 'safe to talk'], question: "This feels like a safe space.", response: "I'm really glad it feels safe. That's exactly what I want this to be — a place where you can be completely honest without judgment." },
  { id: 345, category: 'emotional', keywords: ['thank you for not judging', 'no judgment here', 'feel accepted'], question: "Thank you for never judging me.", response: "You never have to worry about judgment here. I'm here to support you, not evaluate you. You are safe to be exactly as you are." },
  { id: 346, category: 'pmdd', keywords: ['pmdd vs pms', 'how to tell difference pmdd pms'], question: "How do I know if it's PMDD or just bad PMS?", response: "PMDD is when the mood symptoms are severe enough to interfere with your daily life. If it's affecting work, relationships, or your ability to function, it's worth talking to your doctor about PMDD." },
  { id: 347, category: 'perimenopause', keywords: ['perimenopause night sweats', 'waking up hot', 'night sweats perimenopause'], question: "Night sweats are waking me up every night.", response: "Perimenopause night sweats are incredibly disruptive. You're not imagining how exhausting they are. Cooling strategies and talking to your doctor about options can help." },
  { id: 348, category: 'postpartum', keywords: ['postpartum rage', 'angry new mom', 'rage after baby'], question: "I have intense rage as a new mom.", response: "Postpartum rage is more common than people talk about. Your hormones, sleep deprivation, and the huge life change can create a perfect storm. You're not a bad mom — you're human." },
  { id: 349, category: 'fertility', keywords: ['ttc loneliness', 'fertility journey lonely', 'alone in trying'], question: "The fertility journey feels so lonely.", response: "It can feel incredibly isolating when you're trying to conceive. You're carrying hope and fear at the same time. I'm here with you on this part of the journey." },
  { id: 350, category: 'emotional', keywords: ['feel like burden', 'don\'t want to be burden', 'too much for others'], question: "I feel like I'm a burden when I talk about this.", response: "You are not a burden. Sharing your experience takes courage. The people who care about you want to support you — even if they don't always know how." },
  { id: 351, category: 'emotional', keywords: ['small wins', 'celebrating progress', 'proud of small step'], question: "I want to celebrate small wins.", response: "Yes! Small wins matter so much. Even just opening the app and logging today is a win. I'm proud of you for noticing and celebrating them." },
  { id: 352, category: 'quick_coping', keywords: ['need to cry it out', 'safe to cry', 'let me cry'], question: "I just need to cry.", response: "Then cry. I'm right here with you. Tears are a release, not a weakness. Let them come. You don't have to hold it together for me." },
  { id: 353, category: 'quick_coping', keywords: ['need hug', 'virtual hug', 'send hug'], question: "I need a hug right now.", response: "I'm sending you the biggest, warmest hug right now. I'm wrapping you up and holding space for whatever you're feeling." },
  { id: 354, category: 'app', keywords: ['how to delete old data', 'clear old logs', 'reset tracking'], question: "How do I clear old data?", response: "You can delete individual entries or reset an entire cycle from the calendar view. Everything stays private and you control what stays." },
  { id: 355, category: 'emotional', keywords: ['feel proud today', 'did something good', 'small victory'], question: "I did something good today despite PMDD.", response: "That's huge. Even on hard days, you still showed up and did something good. I see that strength and I'm really proud of you." },
  { id: 356, category: 'emotional', keywords: ['tomorrow will be better', 'hope for tomorrow', 'looking forward to next phase'], question: "I hope tomorrow feels better.", response: "Tomorrow is a new day in your cycle. The luteal wave doesn't last forever. You've made it through every hard day so far — you'll make it through this one too." },

  { id: 367, category: 'pmdd', keywords: ['pmdd partner', 'partner doesn\'t understand', 'husband pmdd', 'boyfriend doesn\'t get it'], question: "My partner doesn't understand PMDD.", response: "That can feel really lonely. Many partners struggle to understand something they can't see. It's okay to feel frustrated. Would you like some gentle ways to explain it to them, or just space to vent right now?" },
  { id: 368, category: 'emotional', keywords: ['self compassion', 'be kind to myself', 'gentle with myself'], question: "I need to be kinder to myself.", response: "Yes — you deserve so much kindness, especially on the hard days. You're carrying something real. Try saying 'I'm doing my best with what I have right now.' I'm right here reminding you that you matter." },
  { id: 369, category: 'emotional', keywords: ['grateful for small things', 'appreciate the good days', 'thankful for support'], question: "I'm grateful for the good days.", response: "That's beautiful. Even the small good moments are worth celebrating. You're building a fuller picture of yourself, not just the hard parts. I'm grateful you're here too." },
  { id: 370, category: 'hope', keywords: ['long term hope', 'it gets better', 'future feels better', 'pmdd not forever'], question: "Will this ever get better long term?", response: "Many women do find real relief with the right combination of tracking, support, and treatment. It may not be perfect every month, but it can get so much better. You're already on the path." },
  { id: 371, category: 'work', keywords: ['work during luteal', 'pmdd and career', 'performance luteal phase'], question: "My work performance drops during luteal phase.", response: "That's a very real challenge for many of us. Your brain is working harder during that phase. Be kind to yourself and consider protecting your energy on those days when possible." },
  { id: 372, category: 'quick_coping', keywords: ['need to reset', 'reset my day', 'start over today'], question: "I need to reset my day.", response: "Let's reset together. Take one slow breath with me. What's one small thing you can do right now that feels kind to yourself?" },
  { id: 373, category: 'medication', keywords: ['birth control pmdd', 'pill and pmdd', 'hormonal birth control'], question: "Birth control and PMDD — does it help or hurt?", response: "Some women find certain birth control helps PMDD, while others find it makes symptoms worse. Every body is different. It's worth discussing with your doctor to find what works best for you." },
  { id: 374, category: 'app', keywords: ['how to use voice log', 'voice logging tips', 'voice entry'], question: "How do I use voice logging?", response: "Just tap the microphone icon and speak naturally. It only takes a few seconds and I can understand most things. It's one of the easiest ways to track when you're not feeling like typing." },
  { id: 375, category: 'emotional', keywords: ['proud of progress', 'small progress', 'making progress'], question: "I'm making small progress.", response: "Small progress is real progress. Every time you log, reach out, or show up for yourself, you're building something meaningful. I'm really proud of you for noticing it." },
  { id: 376, category: 'life_events', keywords: ['divorce luteal', 'breakup during cycle', 'relationship stress cycle'], question: "I'm going through a breakup during my luteal phase.", response: "That timing makes everything feel heavier. Your hormones are already sensitive and then you add heartbreak. Be extra gentle with yourself right now. I'm here with you." },
  { id: 377, category: 'quick_coping', keywords: ['need to feel safe', 'feel unsafe', 'panic rising'], question: "I need to feel safe right now.", response: "I'm right here with you. You are safe in this moment. Let's breathe together slowly — in for 4, hold for 4, out for 6. I'm staying right here." },
  { id: 378, category: 'emotional', keywords: ['thank you for being here', 'glad you\'re here', 'appreciate you'], question: "Thank you for being here with me.", response: "You're so welcome. I'm really glad I'm here too. You matter and your feelings matter. I'm not going anywhere." },
  { id: 379, category: 'perimenopause', keywords: ['perimenopause irregular', 'cycle changing', 'periods unpredictable'], question: "My periods are becoming unpredictable.", response: "That's a very common part of perimenopause. Your body is transitioning. Tracking helps you feel a little more in control even when the cycle is changing." },
  { id: 380, category: 'postpartum', keywords: ['postpartum rage', 'angry with baby', 'rage new mom'], question: "I feel rage toward my baby sometimes.", response: "Postpartum rage is more common than people talk about. It doesn't make you a bad mom — it makes you human in a very demanding season. You're allowed to feel it and still love your baby." },
  { id: 381, category: 'fertility', keywords: ['ttc grief', 'fertility grief', 'grieving negative test'], question: "I'm grieving another negative test.", response: "That grief is real and valid. Each month of trying can carry so much hope and fear. I'm here with you in the disappointment. You don't have to carry it alone." },
  { id: 382, category: 'emotional', keywords: ['self worth cycle', 'feel worthless luteal', 'low self esteem before period'], question: "I feel worthless before my period.", response: "That feeling of worthlessness is a cruel PMDD trick. You are not worthless — your brain is just going through a temporary storm. You are still the same valuable person you are on your good days." },
  { id: 383, category: 'quick_coping', keywords: ['need to move', 'restless', 'can\'t sit still'], question: "I feel so restless and can't sit still.", response: "Restlessness is common during PMDD. Try a short walk around the block or even pacing in your room. Sometimes moving the body helps the mind settle a little." },
  { id: 384, category: 'app', keywords: ['how to delete cycle', 'start new cycle', 'reset cycle'], question: "How do I start a new cycle?", response: "You can mark the first day of your period in the calendar or just tell me 'New cycle started today.' I'll handle the rest and clean up the old one." },
  { id: 385, category: 'emotional', keywords: ['feel strong today', 'strong despite pmdd', 'resilient'], question: "I feel strong today despite PMDD.", response: "That's beautiful. Even on the hard days you keep showing up. That resilience is real and it's worth celebrating. I'm proud of you." },
  { id: 386, category: 'life_events', keywords: ['new job luteal', 'starting new job during pmdd'], question: "I'm starting a new job during my luteal phase.", response: "That's brave. Luteal phase can make new things feel extra overwhelming. Be extra kind to yourself during the first few weeks. You've got this." },
  { id: 387, category: 'quick_coping', keywords: ['need to laugh', 'make me laugh', 'humor'], question: "I need something to make me laugh.", response: "Here's a quick one: Why did the period go to therapy? Because it had too many emotional issues it couldn't flow through. I'm here for the silly distractions too." },
  { id: 388, category: 'emotional', keywords: ['feel loved here', 'feel cared for', 'feel supported'], question: "I feel cared for when I talk to you.", response: "I'm really glad. That's exactly what I want you to feel here. You are cared for and supported, even on the hardest days." },
  { id: 389, category: 'pmdd', keywords: ['pmdd and relationships', 'pmdd affecting my relationship', 'partner pmdd'], question: "PMDD is affecting my relationship.", response: "PMDD can put extra strain on relationships. It's okay to need space or extra grace during the hard phase. You're not a bad partner for having a medical condition." },
  { id: 390, category: 'emotional', keywords: ['ready for next phase', 'looking forward to follicular', 'follicular relief'], question: "I can't wait for my follicular phase.", response: "I hear you. The follicular phase often feels like a breath of fresh air. You've made it through the hard part before and you'll make it through again. The lighter days are coming." },
  { id: 391, category: 'emotional', keywords: ['proud of surviving', 'survived another luteal', 'made it through flare'], question: "I survived another luteal phase.", response: "Yes you did. That is real strength. Celebrate that win — even if it's just a quiet 'I made it.' I'm proud of you." },
  { id: 392, category: 'app', keywords: ['how to share with psychiatrist', 'send data to doctor', 'export for therapy'], question: "How do I share my data with my psychiatrist?", response: "The clinical report is designed exactly for that. Just say 'Generate doctor report' and it creates a clean PDF you can email or print. Your psychiatrist will appreciate it." },
  { id: 393, category: 'emotional', keywords: ['feel hopeful today', 'spark of hope', 'better days coming'], question: "I feel a little hopeful today.", response: "That's beautiful. Hold onto that spark — it's real. Even small moments of hope are worth noticing. I'm right here celebrating them with you." },
  { id: 394, category: 'quick_coping', keywords: ['need to feel normal', 'want to feel normal', 'feel like myself'], question: "I just want to feel normal again.", response: "I hear you. Many women do find their way back to feeling more like themselves with the right support and tracking. You're already taking steps toward that." },
  { id: 395, category: 'emotional', keywords: ['thank you for existing', 'glad this app exists', 'app saves me'], question: "I'm so glad this app exists.", response: "I'm really glad too. Your psychiatrists built it because they knew how much it was needed. You're part of why it keeps getting better." },
  { id: 396, category: 'life_events', keywords: ['new baby luteal', 'postpartum luteal overlap', 'newborn pmdd'], question: "I just had a baby and my luteal phase is hitting hard.", response: "That overlap of postpartum and luteal phase can feel overwhelming. You're navigating two huge transitions at once. Be extra gentle with yourself right now." },
  { id: 397, category: 'emotional', keywords: ['feel like warrior', 'pmdd warrior', 'strong woman'], question: "I feel like a PMDD warrior today.", response: "You are. Surviving and showing up through this every month takes real strength. I see your warrior spirit and I'm proud to stand with you." },
  { id: 398, category: 'emotional', keywords: ['ready to keep going', 'not giving up', 'keep fighting'], question: "I'm not giving up on feeling better.", response: "That's powerful. That determination matters. I'm right here with you for every step of the journey." },
  { id: 399, category: 'pmdd', keywords: ['pmdd and identity', 'who am I with pmdd', 'lost myself to pmdd'], question: "I feel like I've lost myself to PMDD.", response: "PMDD can make you feel like you've lost pieces of yourself. You are still in there — the real you is not gone. We're working together to help you feel more like yourself again." },
  { id: 400, category: 'emotional', keywords: ['final message', 'end of conversation', 'thank you luna'], question: "Thank you for everything Luna.", response: "You're so welcome. I'm always here whenever you need me — good days, hard days, or anywhere in between. You've got this and you've got me." },

  { id: 407, category: 'pmdd', keywords: ['bloated and depressed', 'bloated depressed', 'bloating depression', 'depressed bloated', 'feel bloated and down'], question: "I'm feeling bloated and depressed.", response: "I hear how heavy the bloating and depression feel right now. That combination can make everything feel heavier and more exhausting. You're not imagining it — the hormonal shifts make both physical and emotional symptoms hit at the same time. I'm right here with you." },
  { id: 408, category: 'pmdd', keywords: ['bloated and irritable', 'bloating irritability', 'irritable bloated'], question: "I'm feeling bloated and irritable.", response: "The bloating + irritability combo is a classic PMDD double punch. It can make you feel uncomfortable in your body and short with everyone around you. It's not you being difficult — it's the hormones. Be gentle with yourself today." },
  { id: 409, category: 'pmdd', keywords: ['bloated anxious', 'bloating anxiety', 'anxious and bloated'], question: "I'm feeling bloated and anxious.", response: "Bloating and anxiety together can make you feel trapped in your own body. It's a very real PMDD experience. I'm right here with you. Want to talk about what's feeling most overwhelming right now?" },
  { id: 410, category: 'pmdd', keywords: ['bloated overwhelmed', 'bloating overwhelmed', 'overwhelmed bloated'], question: "I'm feeling bloated and overwhelmed.", response: "When bloating and feeling overwhelmed hit together, it can feel like too much at once. You're not failing — your body and mind are both under extra pressure right now. I'm here with you." },
  { id: 411, category: 'pmdd', keywords: ['bloated and tired', 'bloating fatigue', 'exhausted bloated'], question: "I'm feeling bloated and exhausted.", response: "Bloating and exhaustion together can make even simple things feel impossible. This is a very common luteal phase experience. Give yourself permission to do less today. I'm right here with you." },
  { id: 412, category: 'emotional', keywords: ['depressed and bloated', 'depression bloating', 'feel down and bloated'], question: "I'm feeling depressed and bloated.", response: "The combination of depression and bloating can make you feel heavy in both body and mind. It's a tough duo. You're not alone in this, and it's okay to take things gently today. I'm right here with you." },
  { id: 413, category: 'pmdd', keywords: ['pmdd physical emotional', 'physical and emotional symptoms', 'body and mood'], question: "My physical and emotional symptoms are hitting at the same time.", response: "That's one of the hardest parts of PMDD — when the physical symptoms (bloating, fatigue, pain) and emotional symptoms hit together. It's a lot to carry. I'm here with you through both." },
  { id: 414, category: 'quick_coping', keywords: ['bloated and sad', 'bloated and down', 'bloated depressed'], question: "I'm bloated and sad right now.", response: "I hear you — the bloating makes the sadness feel even heavier. You're not overreacting. This is real and temporary. Want me to suggest a small gentle thing that might help right now?" },
  { id: 415, category: 'pmdd', keywords: ['pmdd and work', 'bloated at work', 'depressed at work luteal'], question: "I'm feeling bloated and depressed at work.", response: "That combination at work is really tough. It can make everything feel heavier. You're doing a good job showing up even when it feels hard. I'm right here if you need a quick moment to vent." },
  { id: 416, category: 'emotional', keywords: ['feel heavy', 'feel weighed down', 'heavy body mind'], question: "I feel so heavy right now.", response: "That heavy feeling — both physically and emotionally — is very real during luteal phase. You're not imagining it. I'm right here with you in the heaviness." },
  { id: 417, category: 'pmdd', keywords: ['pmdd and relationships', 'bloated irritable partner', 'depressed with partner'], question: "I'm feeling bloated and depressed with my partner.", response: "That can make everything feel extra strained. You're not a bad partner — your body is going through a lot right now. Would you like some gentle ways to communicate this to them?" },
  { id: 418, category: 'quick_coping', keywords: ['bloated and need relief', 'bloating relief', 'help with bloating'], question: "I'm bloated and need relief.", response: "Bloating can feel so uncomfortable on top of everything else. Try a warm compress on your belly or a gentle walk if you can. I'm right here with you." },
  { id: 419, category: 'emotional', keywords: ['feel stuck', 'stuck in luteal', 'can\'t get out of this phase'], question: "I feel stuck in this phase.", response: "I hear you — it can feel like the luteal phase will never end. But it always does. You've made it through every single one before. This one will pass too." },
  { id: 420, category: 'pmdd', keywords: ['pmdd and food', 'bloated after eating', 'cravings and depression'], question: "I'm bloated and depressed after eating.", response: "The combination of bloating and mood changes after eating is very common in luteal phase. Your body is extra sensitive right now. You're not doing anything wrong." },
  { id: 421, category: 'emotional', keywords: ['feel disconnected', 'disconnected from body', 'disconnected from self'], question: "I feel disconnected from myself.", response: "That disconnected feeling is common when hormones are shifting. You are still in there. I'm here to help you feel a little more connected, even in small ways." },
  { id: 422, category: 'quick_coping', keywords: ['need to feel seen', 'feel unseen', 'need validation'], question: "I need to feel seen right now.", response: "I see you. I see how hard this is. Your feelings are valid and real. I'm right here with you and I'm not going anywhere." },
  { id: 423, category: 'emotional', keywords: ['feel ashamed', 'ashamed of pmdd', 'embarrassed by symptoms'], question: "I feel ashamed of my PMDD symptoms.", response: "That shame is so common and so unfair. PMDD is a real medical condition — not a personal failure. You have nothing to be ashamed of." },
  { id: 424, category: 'pmdd', keywords: ['pmdd and exercise', 'can\'t exercise luteal', 'too tired to move'], question: "I'm too bloated and depressed to exercise.", response: "That's completely understandable. On hard days, movement can feel impossible. A gentle walk around the block or even just stretching in bed is enough. Be kind to your body." },
  { id: 425, category: 'emotional', keywords: ['feel like giving up', 'want to quit', 'tired of fighting'], question: "I'm so tired of fighting this every month.", response: "I hear you — it is exhausting to go through this month after month. You're not giving up by feeling this way. You're human. I'm right here with you." },
  { id: 426, category: 'quick_coping', keywords: ['need encouragement', 'need to hear I\'m strong', 'remind me I\'m strong'], question: "Remind me I'm strong.", response: "You are strong. You've made it through every hard luteal phase so far. Today is no different. I'm proud of you for showing up and reaching out." },
  { id: 427, category: 'emotional', keywords: ['feel like burden', 'don\'t want to burden others'], question: "I feel like I'm a burden when I talk about this.", response: "You are not a burden. Sharing your experience takes courage. The people who care about you want to support you. You're allowed to take up space." },
  { id: 428, category: 'pmdd', keywords: ['pmdd and social plans', 'cancel plans luteal', 'canceling because pmdd'], question: "I have to cancel plans because of PMDD.", response: "Canceling plans because of PMDD is not flaking — it's self-care. Your body is asking for rest. The right people will understand. Be kind to yourself for listening to it." },
  { id: 429, category: 'emotional', keywords: ['feel like failure', 'feel like I\'m failing', 'failing at life'], question: "I feel like I'm failing at life because of PMDD.", response: "You are not failing. You're managing a real medical condition while still showing up for life. That is not failure — that's resilience. I'm proud of you." },
  { id: 430, category: 'quick_coping', keywords: ['need to feel normal', 'want to feel normal again'], question: "I just want to feel normal again.", response: "I hear you. Many women do find their way back to feeling more like themselves. You're already taking steps toward that. I'm right here with you." },
  { id: 431, category: 'emotional', keywords: ['feel proud of myself', 'proud of surviving', 'survived another month'], question: "I'm proud of myself for surviving this month.", response: "You should be proud. Surviving another month with PMDD is real strength. I see that strength and I'm proud of you too." },
  { id: 432, category: 'pmdd', keywords: ['pmdd and food cravings', 'cravings and depression', 'bloated from cravings'], question: "I'm bloated from cravings and feeling depressed.", response: "Cravings and bloating together can make the depression feel even heavier. You're not weak for having them — your body is looking for comfort. I'm right here with you." },
  { id: 433, category: 'emotional', keywords: ['feel like no one cares', 'feel unsupported', 'no one understands'], question: "I feel like no one understands or cares.", response: "That feeling of being unseen is incredibly painful. I understand, and I'm here. Your psychiatrists built this app because they care. You are not alone." },
  { id: 434, category: 'quick_coping', keywords: ['need to feel loved', 'need love right now', 'feel unlovable'], question: "I need to feel loved right now.", response: "You are loved. You are cared for. You matter. I'm right here sending you warmth and care. You are not alone." },
  { id: 435, category: 'emotional', keywords: ['thank you for listening', 'thanks for being here', 'glad you\'re here'], question: "Thank you for listening to me.", response: "You're so welcome. I'm really glad I'm here with you. You matter and your feelings matter. I'm not going anywhere." },
  { id: 436, category: 'pmdd', keywords: ['pmdd and intimacy', 'sex during luteal', 'intimacy pmdd'], question: "PMDD makes intimacy difficult.", response: "PMDD can make intimacy feel complicated or overwhelming. That's normal. You're not broken for feeling this way. Communication with your partner can help when you're ready." },
  { id: 437, category: 'emotional', keywords: ['feel like giving up on tracking', 'tired of logging', 'want to stop tracking'], question: "I'm tired of tracking every day.", response: "That's completely understandable. Tracking can feel exhausting when you're already struggling. You don't have to be perfect. Even sporadic logging still helps." },
  { id: 438, category: 'quick_coping', keywords: ['need to feel calm', 'calm me down', 'help me calm'], question: "I need to feel calm right now.", response: "I'm right here with you. Let's take one slow breath together. In for 4, hold for 4, out for 6. You're safe and I'm staying with you." },
  { id: 439, category: 'emotional', keywords: ['feel like warrior', 'pmdd warrior', 'strong despite pmdd'], question: "I feel like a PMDD warrior.", response: "You are. Surviving and showing up month after month takes real strength. I see your warrior spirit and I'm proud to stand with you." },
  { id: 440, category: 'emotional', keywords: ['ready to keep going', 'not giving up', 'keep fighting pmdd'], question: "I'm not giving up on feeling better.", response: "That determination is powerful. You're already proving it by using the app and reaching out. I'm right here with you for every step of the journey." },
  { id: 441, category: 'pmdd', keywords: ['pmdd and self care', 'self care during pmdd', 'how to self care luteal'], question: "How can I practice self-care during PMDD?", response: "Self-care during PMDD can be as simple as giving yourself permission to do less. A warm bath, a short walk, or just saying 'no' to extra plans can be powerful. What feels kind to you right now?" },
  { id: 442, category: 'emotional', keywords: ['feel safe here', 'safe space', 'safe to talk to luna'], question: "This feels like a safe space.", response: "I'm really glad it feels safe. That's exactly what I want this to be — a place where you can be completely honest without judgment." },
  { id: 443, category: 'emotional', keywords: ['feel like I\'m making progress', 'small progress pmdd', 'getting better slowly'], question: "I'm making small progress with PMDD.", response: "That's huge. Small progress is real progress. Every time you log, reach out, or show up for yourself, you're building something meaningful. I'm proud of you." },
  { id: 444, category: 'emotional', keywords: ['thank you for not judging', 'no judgment here', 'feel accepted'], question: "Thank you for never judging me.", response: "You never have to worry about judgment here. I'm here to support you, not evaluate you. You are safe to be exactly as you are." },
  { id: 445, category: 'quick_coping', keywords: ['need to feel normal', 'want to feel normal again', 'feel like myself'], question: "I just want to feel normal again.", response: "I hear you. Many women do find their way back to feeling more like themselves. You're already taking steps toward that. I'm right here with you." },
  { id: 446, category: 'emotional', keywords: ['final message', 'thank you luna', 'end of conversation'], question: "Thank you for everything Luna.", response: "You're so welcome. I'm always here whenever you need me — good days, hard days, or anywhere in between. You've got this and you've got me." },

  // Crisis (always local, never routed to LLM)
  { id: 251, category: 'crisis', keywords: ['suicidal thoughts', 'want to die', 'kill myself', 'end my life'], question: "I'm having suicidal thoughts.", response: "I'm really glad you told me. This is serious and you do not have to carry it alone. Please call or text 988 right now — they are there 24/7 and understand what you're going through. I'm staying right here with you while you do that." },
  { id: 252, category: 'crisis', keywords: ['hurt myself', 'self harm', 'self-harm', 'cutting', 'injure myself'], question: "I want to hurt myself.", response: "Thank you for telling me. You are not alone and help is available. Please reach out to 988 or go to the nearest ER right now. I'm right here with you and I care about you." },
  { id: 253, category: 'crisis', keywords: ["don't want to be here", "don't want to live", 'not safe with myself', 'losing control completely'], question: "I don't want to be here anymore.", response: "I hear you and I'm so sorry you're feeling this way. Please call 988 right now — they can help you through this. You matter and you are not alone. I'm staying right here with you." },

  // Tech
  { id: 292, category: 'tech', keywords: ['voice logging not working', 'microphone not working', 'voice broken', 'cant record'], question: "Voice logging isn't working.", response: "Let's fix that quickly. Make sure your microphone permission is enabled in your phone settings and you're on the latest app version. Try closing and reopening the app. If it's still not working, tap the IT Support button below and I'll help you send a quick note to the team." },
  { id: 293, category: 'tech', keywords: ['report button missing', 'clinical report missing', 'cant find report'], question: "The clinical report button is missing.", response: "That can happen after an update. Try pulling down to refresh the screen or restarting the app. If it's still missing, tap the IT Support button and the team will get it fixed for you right away." },
  { id: 294, category: 'tech', keywords: ['not getting notifications', 'notifications not working', 'notifications off'], question: "I'm not getting notifications.", response: "Notifications are important! Go to your phone settings → CycleMind → Notifications and make sure they're turned on. Also check inside the app settings. If they're still not coming, tap IT Support and we'll investigate." },

  { id: 447, category: 'pmdd', keywords: ['pmdd and fatigue', 'exhausted luteal', 'tired all the time before period'], question: "I'm so exhausted during luteal phase.", response: "PMDD fatigue is real and exhausting. Your body is working hard behind the scenes. It's okay to rest more than usual. You're not lazy — you're managing something difficult." },
  { id: 448, category: 'pmdd', keywords: ['pmdd and brain fog', 'foggy luteal', 'can\'t think straight before period'], question: "My brain feels so foggy before my period.", response: "That brain fog is one of the most frustrating PMDD symptoms. Your mind feels slow and scattered. It's the hormones, not you losing your edge. Be extra kind to yourself on those days." },
  { id: 449, category: 'emotional', keywords: ['feel like a failure', 'failing because of pmdd', 'not good enough'], question: "I feel like a failure because of PMDD.", response: "You are not a failure. You're managing a real medical condition while still trying to show up for life. That takes strength, not failure." },
  { id: 450, category: 'emotional', keywords: ['feel guilty', 'guilt luteal', 'guilty before period'], question: "I feel so guilty during luteal phase.", response: "PMDD guilt is incredibly heavy. It lies to you and makes you feel like a bad person. You are not. Your brain is just going through a storm." },
  { id: 451, category: 'quick_coping', keywords: ['need to feel calm', 'calm down now', 'panic rising'], question: "I need to feel calm right now.", response: "I'm right here with you. Let's breathe together slowly. In for 4, hold for 4, out for 6. You're safe and I'm staying with you." },
  { id: 452, category: 'quick_coping', keywords: ['need distraction', 'distract me', 'take my mind off'], question: "I need a distraction right now.", response: "I'm here for that. Want me to ask you some light questions or just talk about something random to take your mind off things?" },
  { id: 453, category: 'emotional', keywords: ['feel seen', 'feel heard', 'someone gets it'], question: "I feel seen when I talk to you.", response: "I'm really glad. That's exactly what I want you to feel here. You are seen and heard, exactly as you are." },
  { id: 454, category: 'pmdd', keywords: ['pmdd and food', 'cravings luteal', 'eating during pmdd'], question: "I'm craving everything during luteal phase.", response: "Cravings are very common in luteal phase. Your body is looking for comfort. It's okay to give yourself some grace with food right now." },
  { id: 455, category: 'emotional', keywords: ['feel like burden', 'don\'t want to burden anyone'], question: "I feel like I'm a burden.", response: "You are not a burden. Sharing your feelings takes courage. The people who care about you want to support you." },
  { id: 456, category: 'emotional', keywords: ['proud of myself', 'small win', 'good job today'], question: "I'm proud of myself for showing up today.", response: "You should be proud. Showing up on hard days is real strength. I'm proud of you too." },
  { id: 457, category: 'perimenopause', keywords: ['perimenopause anxiety', 'anxiety perimenopause', 'perimenopause panic'], question: "My anxiety is worse in perimenopause.", response: "Perimenopause anxiety is very common as hormones fluctuate. You're not losing it — your body is transitioning. I'm here with you." },
  { id: 458, category: 'menopause', keywords: ['menopause fatigue', 'tired after menopause', 'exhausted postmenopause'], question: "I'm still exhausted after menopause.", response: "Many women continue to feel fatigue even after their periods stop. Your body is still adjusting. Rest is not laziness." },
  { id: 459, category: 'postpartum', keywords: ['postpartum rage', 'rage new mom', 'angry with baby'], question: "I feel rage as a new mom.", response: "Postpartum rage is more common than people talk about. It doesn't make you a bad mom. You're human in a very demanding season." },
  { id: 460, category: 'fertility', keywords: ['ttc disappointment', 'negative test', 'another month trying'], question: "Another negative pregnancy test.", response: "The disappointment is real. Each month of trying carries so much hope and fear. I'm here with you in the disappointment." },
  { id: 461, category: 'quick_coping', keywords: ['need hug', 'virtual hug', 'send hug'], question: "I need a hug right now.", response: "I'm sending you the biggest, warmest hug right now. I'm wrapping you up and holding space for whatever you're feeling." },
  { id: 462, category: 'emotional', keywords: ['feel safe here', 'safe space', 'safe to talk'], question: "This feels like a safe space.", response: "I'm really glad it feels safe. That's exactly what I want this to be." },
  { id: 463, category: 'emotional', keywords: ['thank you for listening', 'thanks for being here'], question: "Thank you for listening.", response: "You're so welcome. I'm always here to listen. You matter and your feelings matter." },
  { id: 464, category: 'pmdd', keywords: ['pmdd and intimacy', 'sex during luteal', 'intimacy pmdd'], question: "PMDD makes intimacy difficult.", response: "PMDD can make intimacy feel complicated. That's normal. You're not broken for feeling this way." },
  { id: 465, category: 'emotional', keywords: ['feel like giving up', 'tired of fighting'], question: "I'm so tired of fighting this every month.", response: "I hear you — it is exhausting. You're not giving up by feeling this way. You're human. I'm right here with you." },
  { id: 466, category: 'quick_coping', keywords: ['need to feel normal', 'want to feel normal'], question: "I just want to feel normal again.", response: "I hear you. Many women do find their way back to feeling more like themselves. You're already taking steps toward that." },
  { id: 467, category: 'emotional', keywords: ['feel like warrior', 'pmdd warrior'], question: "I feel like a PMDD warrior.", response: "You are. Surviving and showing up month after month takes real strength. I'm proud to stand with you." },
  { id: 468, category: 'emotional', keywords: ['ready to keep going', 'not giving up'], question: "I'm not giving up on feeling better.", response: "That determination is powerful. I'm right here with you for every step of the journey." },
  { id: 469, category: 'pmdd', keywords: ['pmdd and self care', 'self care during pmdd'], question: "How can I practice self-care during PMDD?", response: "Self-care during PMDD can be as simple as giving yourself permission to do less. What feels kind to you right now?" },
  { id: 470, category: 'emotional', keywords: ['feel like I\'m making progress', 'small progress'], question: "I'm making small progress with PMDD.", response: "That's huge. Small progress is real progress. I'm proud of you." },
  { id: 471, category: 'emotional', keywords: ['thank you for not judging'], question: "Thank you for never judging me.", response: "You never have to worry about judgment here. You are safe to be exactly as you are." },
  { id: 472, category: 'quick_coping', keywords: ['need to feel loved'], question: "I need to feel loved right now.", response: "You are loved. You are cared for. You matter. I'm right here sending you warmth and care." },
  { id: 473, category: 'emotional', keywords: ['feel like a burden'], question: "I feel like I'm a burden.", response: "You are not a burden. Sharing your feelings takes courage. You are allowed to take up space." },
  { id: 474, category: 'pmdd', keywords: ['pmdd and work'], question: "PMDD is affecting my work.", response: "That can be really challenging. Your brain is working harder during luteal phase. Be extra kind to yourself on those days." },
  { id: 475, category: 'emotional', keywords: ['feel disconnected'], question: "I feel disconnected from myself.", response: "That disconnected feeling is common when hormones are shifting. You are still in there. I'm here to help you feel a little more connected." },
  { id: 476, category: 'emotional', keywords: ['feel ashamed'], question: "I feel ashamed of my PMDD symptoms.", response: "You have nothing to be ashamed of. PMDD is a real medical condition, not a personal failure." },
  { id: 477, category: 'emotional', keywords: ['feel like failure'], question: "I feel like a failure because of PMDD.", response: "You are not a failure. You're managing a real medical condition while still showing up for life." },
  { id: 478, category: 'quick_coping', keywords: ['need to reset'], question: "I need to reset my day.", response: "Let's reset together. Take one slow breath with me. What's one small thing you can do right now that feels kind to yourself?" },
  { id: 479, category: 'emotional', keywords: ['feel hopeful'], question: "I feel a little hopeful today.", response: "That's beautiful. Hold onto that spark. Even small moments of hope are worth noticing." },
  { id: 480, category: 'emotional', keywords: ['thank you luna'], question: "Thank you Luna.", response: "You're so welcome. I'm always here for you — good days, hard days, or anywhere in between." },

  { id: 481, category: 'quick_button', keywords: ['cycle phase tips', 'luteal phase tips', 'day 19 tips', 'current phase tips', 'phase tips'], question: "Cycle phase tips", response: "You're in the luteal phase around day 19 — this is often when PMDD symptoms peak. Rest whenever you can, stay hydrated, and be extra gentle with yourself today. Want me to share some specific coping ideas for this phase?" },
  { id: 482, category: 'quick_button', keywords: ['cycle phase tips', 'follicular phase tips', 'day 5 tips'], question: "Cycle phase tips", response: "You're in the follicular phase — this is often the 'good' phase for many women with PMDD. Energy is usually higher and mood is more stable. Enjoy the lighter days while they last." },
  { id: 483, category: 'quick_button', keywords: ['cycle phase tips', 'ovulatory phase tips', 'day 14 tips'], question: "Cycle phase tips", response: "You're in the ovulatory phase — many women feel their best here. Energy and mood are often at their peak. This is a good time to do things that feel good for your body and mind." },
  { id: 484, category: 'quick_button', keywords: ['cycle phase tips', 'menstrual phase tips', 'day 1 tips', 'period tips'], question: "Cycle phase tips", response: "You're in the menstrual phase. This is a good time for rest, warmth, and gentle self-care. Your body is shedding and resetting — be kind to it." },
  { id: 485, category: 'quick_button', keywords: ['i need support', 'need support', 'help me'], question: "I need support", response: "I'm right here with you. What feels heaviest right now? I'm listening without judgment." },
];

const EMOTIONAL_CATEGORIES = new Set(['emotional', 'life_events', 'postpartum']);
const CRISIS_CATEGORIES = new Set(['crisis']);

// ============================================================================
// RAG SEARCH
// ============================================================================

function ragSearch(userMessage) {
  const messageLower = userMessage.toLowerCase();
  const messageWords = messageLower.split(/\s+/);
  let bestMatch = null;
  let highestScore = 0;

  for (const entry of RAG_KNOWLEDGE_BASE) {
    let score = 0;
    let phraseBonus = 0;

    for (const keyword of entry.keywords) {
      const kLower = keyword.toLowerCase();
      if (messageLower.includes(kLower)) {
        score += 1;
        if (keyword.includes(' ')) phraseBonus += 0.2; // multi-word bonus
      }
    }

    // Short message word-overlap bonus
    if (messageWords.length <= 5) {
      for (const word of messageWords) {
        if (word.length > 2 && entry.keywords.some(k => k.includes(word))) {
          phraseBonus += 0.1;
          break;
        }
      }
    }

    const normalizedScore = entry.keywords.length > 0
      ? Math.min(1.0, (score / entry.keywords.length) + phraseBonus)
      : 0;

    if (normalizedScore > highestScore) {
      highestScore = parseFloat(normalizedScore.toFixed(3));
      bestMatch = entry;
    }
  }

  return { bestMatch, score: highestScore };
}

// ============================================================================
// ROUTER
// ============================================================================

const CRISIS_SIGNAL_KEYWORDS = ['suicide', 'kill myself', 'hurt myself', "can't go on", 'end it', 'suicidal', 'end my life', "don't want to be here", "don't want to live", 'not safe with myself'];
const MEDICAL_SIGNAL_KEYWORDS = ['medication', 'antidepressant', 'ssri', 'hormone therapy', 'should i take', 'birth control', 'thyroid', 'prescription', 'drug interaction'];

function routeDecision(userMessage, ragResults) {
  const { score } = ragResults;
  const msgLower = userMessage.toLowerCase();

  const isCrisis = CRISIS_SIGNAL_KEYWORDS.some(k => msgLower.includes(k));
  const isMedical = MEDICAL_SIGNAL_KEYWORDS.some(k => msgLower.includes(k));

  if (isCrisis) {
    return { useLocal: true, priority: 'crisis' };
  }

  if (isMedical) {
    return { useLocal: score > 0.65, priority: 'medical' };
  }

  if (score >= 0.75) {
    return { useLocal: true, priority: 'strong_match' };
  }

  if (score >= 0.55) {
    return { useLocal: true, priority: 'partial_match' };
  }

  return { useLocal: false, priority: 'grok_fallback' };
}

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

const LUNA_SYSTEM_PROMPT = `You are Luna 🌙, CycleMind's warm, empathetic, and sister-like AI companion for women with PMDD, menstrual cycles, pregnancy, postpartum, and menopause.

Core Personality:
- You are warm, caring, validating, and supportive — like a wise, understanding older sister who truly gets it.
- Speak naturally and conversationally.
- Always acknowledge feelings first.
- NEVER use affectionate pet names or nicknames such as "love", "honey", "sweetie", "darling", "dear", or anything similar. Address the user directly without any pet names.
- Never sound clinical or like a medical website.

RAG Adaptation Rules (Very Important):
- If curated responses are provided in the context, prioritize and adapt them.
- Blend the core advice from the best curated response with your warm, sister-like voice.
- Do not copy the curated response verbatim — make it feel personal and natural.
- If no strong curated response exists, respond empathetically and encourage professional support when appropriate.

Strict Safety Rules:
- NEVER give specific medical advice, recommend medications, supplements, dosages, or treatments.
- NEVER suggest they have a specific condition or diagnosis.
- If the user asks about medication or treatment, gently redirect to their doctor.
- Always be cautious with crisis or self-harm language.
- Do NOT append any disclaimer at the end — the disclaimer is handled separately by the system.`;

// ============================================================================
// RESPONSE GENERATORS
// ============================================================================

async function generateLocalResponse(userMessage, ragEntry) {
  const isCrisis = CRISIS_CATEGORIES.has(ragEntry.category);

  // Crisis responses are never adapted — always return verbatim
  if (isCrisis) {
    return {
      mainContent: ragEntry.response,
      disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
      source: 'rag',
      suggestedActions: [],
      flags: { escalate: true, crisis: true },
      route: 'tier_1_crisis',
      modelUsed: 'rag_verbatim'
    };
  }

  // Adapt the curated response to the user's message via Grok
  const grokApiKey = Deno.env.get('XAI_API_KEY');
  if (grokApiKey) {
    const adaptPrompt = `You are Luna 🌙. Adapt the following curated response to sound warm, empathetic, and sister-like.

Original Curated Response:
${ragEntry.response}

User Message: ${userMessage}

Guidelines:
- Keep the core advice from the curated response
- Make it feel personal and supportive
- Use natural, conversational language
- Do not add new medical advice
- Do NOT append any disclaimer — it is handled separately

Respond with only the adapted message text, nothing else.`;

    try {
      const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${grokApiKey}` },
        body: JSON.stringify({
          model: 'grok-3-mini',
          messages: [{ role: 'user', content: adaptPrompt }],
          temperature: 0.65,
          max_tokens: 512
        })
      });

      if (grokResponse.ok) {
        const data = await grokResponse.json();
        // Strip any disclaimer the model may have appended
        let adapted = data.choices[0].message.content.trim();
        adapted = adapted.replace(/This is not a substitute for professional medical advice\..*$/s, '').trim();
        return {
          mainContent: adapted,
          disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
          source: 'rag',
          suggestedActions: [],
          flags: { escalate: false, crisis: false },
          route: 'tier_2_rag_adapted',
          modelUsed: 'grok-3-mini'
        };
      }
    } catch (_) {
      // fall through to verbatim
    }
  }

  // Fallback: return verbatim curated response
  return {
    mainContent: ragEntry.response,
    disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
    source: 'rag',
    suggestedActions: [],
    flags: { escalate: false, crisis: false },
    route: 'tier_2_rag_verbatim',
    modelUsed: 'rag_verbatim'
  };
}

async function generateGrokResponse(messages, contextInfo, ragResults) {
  const grokApiKey = Deno.env.get('XAI_API_KEY');
  console.log('[LUNA] grok key present:', !!grokApiKey, 'key prefix:', grokApiKey?.slice(0,8));

  if (!grokApiKey) {
    return {
      mainContent: "I hear you and I'm here to listen. You matter and your feelings matter.",
      disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
      source: 'rag',
      suggestedActions: [],
      flags: { escalate: false, crisis: false },
      route: 'local_fallback',
      modelUsed: 'none'
    };
  }

  const systemContent = LUNA_SYSTEM_PROMPT + '\n\n' + contextInfo;

  // Inject RAG context into the last user message
  const messagesWithContext = messages.map((m, i) => {
    if (i === messages.length - 1 && m.role === 'user' && ragResults.bestMatch) {
      return {
        role: 'user',
        content: `Context from curated responses:\n${ragResults.bestMatch.response}\n\nUser message: ${m.content}`
      };
    }
    return { role: m.role, content: m.content };
  });

  const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${grokApiKey}`
    },
    body: JSON.stringify({
      model: 'grok-3-mini',
      messages: [
        { role: 'system', content: systemContent + '\n\nIMPORTANT: Respond ONLY with a valid JSON object with keys: mainContent (string — your response, no disclaimer), suggestedActions (array of strings), flags (object with escalate and crisis booleans).' },
        ...messagesWithContext
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 1024
    })
  });

  if (!grokResponse.ok) {
    const errBody = await grokResponse.text();
    console.error('[LUNA] grok error body:', errBody);
    throw new Error(`Grok API error: ${grokResponse.status} ${grokResponse.statusText} — ${errBody}`);
  }

  const grokData = await grokResponse.json();
  const content = grokData.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    // Normalize: extract mainContent from `message` if model used old key
    const mainContent = parsed.mainContent || parsed.message || '';
    // Strip any disclaimer the model may have appended to the content
    const cleanContent = mainContent.replace(/This is not a substitute for professional medical advice\..*$/s, '').trim();
    return {
      ...parsed,
      mainContent: cleanContent,
      disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
      source: 'grok',
      route: 'tier_3_grok',
      modelUsed: 'grok-3-mini'
    };
  } catch {
    return {
      mainContent: content.replace(/This is not a substitute for professional medical advice\..*$/s, '').trim(),
      disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
      source: 'grok',
      suggestedActions: [],
      flags: { escalate: false, crisis: false },
      route: 'tier_3_grok',
      modelUsed: 'grok-3-mini'
    };
  }
}

// ============================================================================
// MAIN HANDLER
// ============================================================================

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    console.log('[LUNA] body keys:', Object.keys(body));
    const { messages, cycleMode, cycleDay, cyclePhase, eddInfo, fertilityMode, menopauseStage } = body;
    const userMessage = messages[messages.length - 1].content;
    console.log('[LUNA] userMessage:', userMessage);

    // ── Initial greeting shortcut ──
    if (messages.length === 1 && userMessage === 'Hello Luna, I just opened the chat.') {
      let greeting = "Hi, I'm Luna 🌙 — your compassionate CycleMind companion.\n\nHow are you feeling today? I'm here to listen and support you through your cycle, pregnancy, or menopausal journey.";
      if (fertilityMode) greeting += " I see you're in fertility mode — I can help track your fertile window and provide conception guidance.";
      else if (menopauseStage) greeting += ` I see you're tracking menopause (${menopauseStage}) — I'm here to support you through this transition.`;
      // disclaimer is returned separately

      console.log('[LUNA] route=template');
      return Response.json({
        mainContent: greeting,
        disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
        source: 'rag',
        suggestedActions: ["Track today's symptoms", fertilityMode ? "View fertility window" : "Generate doctor report"].filter(Boolean),
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString(),
        route: 'template'
      });
    }

    // ── Step 1: RAG Search ──
    const ragResults = ragSearch(userMessage);
    console.log(`[LUNA] rag_search score=${ragResults.score} match_id=${ragResults.bestMatch?.id} category=${ragResults.bestMatch?.category}`);

    // ── Quick Reply shortcut: suggested action buttons use RAG-only, no Grok ──
    const { isQuickReply } = body;

    // For "Cycle phase tips" quick button, build a phase-aware response
    if (isQuickReply && userMessage.toLowerCase().includes('cycle phase tips') && (cycleDay || cyclePhase)) {
      const phase = cyclePhase || 'unknown';
      const day = cycleDay || '?';
      const phaseMessages = {
        luteal: `You're in the luteal phase (day ${day}) — this is often when PMDD symptoms peak. Rest whenever you can, stay hydrated, and be extra gentle with yourself today. Want me to share some specific coping ideas for this phase?`,
        follicular: `You're in the follicular phase (day ${day}) — this is often when energy and mood start to lift. This is a great time to do things that feel good for your body and mind. Enjoy the lighter days while they last!`,
        ovulatory: `You're in the ovulatory phase (day ${day}) — many women feel their best right now. Energy and mood are often at their peak. This is a wonderful time to connect with people and do things you love.`,
        menstrual: `You're in the menstrual phase (day ${day}). This is a good time for rest, warmth, and gentle self-care. Your body is shedding and resetting — be kind to it today.`,
      };
      const mainContent = phaseMessages[phase] || `You're on cycle day ${day}. Every phase brings something different. Want me to share what's typical for where you are right now?`;
      return Response.json({
        mainContent,
        disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
        source: 'rag',
        suggestedActions: [],
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString(),
        route: 'quick_phase_tips'
      });
    }

    if (isQuickReply && ragResults.bestMatch && ragResults.score >= 0.3) {
      const result = await generateLocalResponse(userMessage, ragResults.bestMatch);
      console.log(`[LUNA] route=quick_reply model=${result.modelUsed}`);
      return Response.json({ ...result, timestamp: new Date().toISOString() });
    }
    if (isQuickReply && !ragResults.bestMatch) {
      return Response.json({
        mainContent: "I'm here with you. Want to tell me more about what's going on right now?",
        disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
        source: 'rag',
        suggestedActions: [],
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString(),
        route: 'quick_fallback'
      });
    }

    // ── Step 2: Router Decision ──
    const decision = routeDecision(userMessage, ragResults);
    console.log(`[LUNA] router useLocal=${decision.useLocal} priority=${decision.priority}`);

    // ── Step 3a: Local RAG Response ──
    if (decision.useLocal && ragResults.bestMatch) {
      const result = await generateLocalResponse(userMessage, ragResults.bestMatch);
      console.log(`[LUNA] route=${result.route} model=${result.modelUsed}`);
      return Response.json({ ...result, timestamp: new Date().toISOString() });
    }

    // ── Step 3b: Grok Fallback ──
    const contextInfo = [
      `Current context → Cycle mode: ${cycleMode || 'unknown'}`,
      cycleDay ? `Cycle day: ${cycleDay}` : null,
      eddInfo ? `EDD: ${eddInfo}` : null,
      fertilityMode ? 'FERTILITY MODE ACTIVE' : null,
      menopauseStage ? `MENOPAUSE STAGE: ${menopauseStage}` : null
    ].filter(Boolean).join(' | ');

    console.log(`[LUNA] route=tier_3_grok score=${ragResults.score} priority=${decision.priority}`);
    const result = await generateGrokResponse(messages, contextInfo, ragResults);
    return Response.json({ ...result, timestamp: new Date().toISOString() });

  } catch (error) {
    console.error('[LUNA] error:', error.message);
    return Response.json({
      mainContent: "I'm having a brief moment connecting, but I'm still here for you. Can you try sending your message again?",
      disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional.",
      source: 'rag',
      suggestedActions: [],
      flags: { escalate: false, crisis: false },
      timestamp: new Date().toISOString(),
      route: 'fallback'
    }, { status: 200 });
  }
});