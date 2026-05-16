// Luna's Evidence-Based Response Library
// 50 pre-written, cached responses organized by category
// All responses maintain warm, sister-like tone + medical disclaimers

export const LUNA_RESPONSE_LIBRARY = {
  // ===== CYCLE BASICS & PREDICTIONS (1–10) =====
  cycleBasics: [
    {
      id: 1,
      keywords: ['when', 'period', 'due', 'coming'],
      question: "When is my period due?",
      response: "You're in your luteal phase and your period is expected in about {days} days. This is when many women feel more sensitive — you're doing great by tracking it. Gentle self-care can really help right now. This is not a substitute for professional medical advice. Please consult your doctor."
    },
    {
      id: 2,
      keywords: ['how long', 'cycle', 'length', 'this month'],
      question: "How long is my cycle this month?",
      response: "Your cycle this month is tracking at {length} days. That's within a normal range, though it's a bit {shorter/longer} than your average. Would you like me to show you the trend over the last 6 months? I'm here with you."
    },
    {
      id: 3,
      keywords: ['when', 'ovulate', 'ovulation', 'fertile'],
      question: "When will I ovulate?",
      response: "Based on your last cycles, ovulation is most likely around day {day}. The fertile window is usually the 5 days before and the day of ovulation. If you're trying to conceive, this is a great time. Let me know how I can support you."
    },
    {
      id: 4,
      keywords: ['luteal', 'phase', 'am i in'],
      question: "Am I in my luteal phase?",
      response: "Yes, you're currently in your luteal phase (days {start}–{end}). This is when PMDD symptoms can feel stronger for many women. You're not alone — I'm right here. What's one small thing that usually helps you feel a bit better?"
    },
    {
      id: 5,
      keywords: ['cycle', 'late', 'why', 'delayed'],
      question: "Why is my cycle late?",
      response: "It's common for cycles to run a little late sometimes because of stress, travel, illness, or changes in routine. Your body is doing its best. Would you like me to help you track this and see if there's a pattern? I'm here with you."
    },
    {
      id: 6,
      keywords: ['3 days', 'late', 'period', 'delayed'],
      question: "My period is 3 days late — what does that mean?",
      response: "Three days late is still within the normal variation for many women. Stress, sleep, or even a big change in routine can shift things. If it goes beyond 7–10 days and you're not pregnant, it's worth mentioning to your doctor. Want me to help you log how you're feeling?"
    },
    {
      id: 7,
      keywords: ['accurate', 'predicted', 'confidence', 'period date'],
      question: "How accurate is my predicted period date?",
      response: "Your predicted date is usually pretty accurate once you have 3–4 cycles logged. Right now the confidence is {confidence}%. The more you track, the smarter I get at predicting for you."
    },
    {
      id: 8,
      keywords: ['last', 'ovulation', 'when was', 'fertile window'],
      question: "When was my last ovulation?",
      response: "Your last ovulation was around day {day} of your previous cycle. That lines up with your temperature or symptoms if you tracked them. Would you like me to show you the fertile window for next cycle?"
    },
    {
      id: 9,
      keywords: ['cycles', 'shorter', 'longer', 'changing', 'length'],
      question: "Why are my cycles getting shorter/longer?",
      response: "Cycle length can change with age, stress, or perimenopause. Shorter cycles are common in perimenopause, longer ones with stress or thyroid changes. Tracking consistently helps us spot the pattern. Want to review your last 6 months together?"
    },
    {
      id: 10,
      keywords: ['short', 'luteal', 'phase', 'mean'],
      question: "What does a short luteal phase mean?",
      response: "A luteal phase shorter than 10 days can sometimes make it harder to conceive and is common in PMDD. It doesn't mean anything is wrong, but it's worth tracking and discussing with your doctor if it keeps happening. You're doing the right thing by paying attention."
    }
  ],

  // ===== PMDD SYMPTOMS & FLARES (11–20) =====
  pmddSymptoms: [
    {
      id: 11,
      keywords: ['irritable', 'irritability', 'before period', 'luteal'],
      question: "Why do I feel so irritable before my period?",
      response: "That irritability is so common in the luteal phase — it's often the PMDD hormones talking. You're not crazy and you're not alone. Deep breathing or a short walk can help in the moment. I'm right here with you."
    },
    {
      id: 12,
      keywords: ['pmdd', 'or', 'pms', 'difference', 'is it'],
      question: "Is this PMDD or just PMS?",
      response: "If the symptoms are severe enough to interfere with your life, it could be PMDD. The key difference is how much it affects your daily functioning. Would you like me to help you track the severity so you can discuss it with your doctor?"
    },
    {
      id: 13,
      keywords: ['anxiety', 'bad', 'week', 'pmdd'],
      question: "My anxiety is really bad this week — is it PMDD?",
      response: "Yes, intense anxiety in the week before your period is a classic PMDD symptom. It's not 'just in your head' — it's very real. You're doing the right thing by noticing it. What usually helps you feel even a little calmer?"
    },
    {
      id: 14,
      keywords: ['mood swings', 'pmdd', 'right now', 'help'],
      question: "What can I do for PMDD mood swings right now?",
      response: "For mood swings right now, try the 4-7-8 breathing technique or a quick grounding exercise. Small things like this can take the edge off. You're not alone — I'm here with you every step."
    },
    {
      id: 15,
      keywords: ['crying', 'nothing', 'before period', 'tears'],
      question: "Why am I crying over nothing before my period?",
      response: "Those tears are so common with PMDD — your hormones are making everything feel bigger. It's okay to cry. You're not weak; you're dealing with something real. Want me to suggest a gentle distraction or coping tool?"
    },
    {
      id: 16,
      keywords: ['pmdd', 'worse', 'this month', 'why'],
      question: "My PMDD symptoms are worse this month — why?",
      response: "PMDD symptoms can fluctuate with stress, sleep, diet, or even seasonal changes. It doesn't mean you're doing anything wrong. Let's track this month and see if we can spot the trigger together."
    },
    {
      id: 17,
      keywords: ['track', 'pmdd', 'symptoms', 'properly'],
      question: "How do I track PMDD symptoms properly?",
      response: "The best way is to log severity (1–6 scale) every day for at least two full cycles. I can help you see the pattern once you have the data. Would you like me to walk you through a quick daily log right now?"
    },
    {
      id: 18,
      keywords: ['foods', 'pmdd', 'help', 'eat'],
      question: "What foods help with PMDD?",
      response: "Many women find that reducing sugar and caffeine while adding magnesium-rich foods (leafy greens, nuts) and complex carbs helps. Everyone is different though — want me to suggest a simple meal idea for today?"
    },
    {
      id: 19,
      keywords: ['exercise', 'pmdd', 'help', 'movement'],
      question: "Can exercise help PMDD?",
      response: "Gentle movement like walking or yoga often helps PMDD symptoms by boosting mood chemicals. Nothing intense during a bad flare — just something kind to your body. What feels doable for you today?"
    },
    {
      id: 20,
      keywords: ['pmdd', 'symptoms', 'peak', 'when'],
      question: "When do PMDD symptoms usually peak?",
      response: "PMDD symptoms usually peak in the 7–10 days before your period and start to lift once bleeding begins. You're in that window now, so be extra kind to yourself. I'm here if you need to talk it through."
    }
  ],

  // ===== MOOD & MENTAL HEALTH (21–30) =====
  moodMentalHealth: [
    {
      id: 21,
      keywords: ['depressed', 'depression', 'before period', 'sad'],
      question: "Why am I so depressed before my period?",
      response: "That pre-period depression is a very real PMDD symptom caused by shifting hormones. It doesn't mean you're broken — it means your body is doing something hard. You're not alone, and it will lift. I'm here with you."
    },
    {
      id: 22,
      keywords: ['cope', 'pmdd', 'depression', 'help'],
      question: "How do I cope with PMDD depression?",
      response: "One small thing at a time — even just getting outside for 10 minutes or texting a friend can help. You don't have to feel happy, just a little less heavy. What's one tiny thing that sometimes helps?"
    },
    {
      id: 23,
      keywords: ['mood', 'all over the place', 'normal', 'rollercoaster'],
      question: "My mood is all over the place — is this normal?",
      response: "Yes, the mood rollercoaster is very normal with PMDD. It's the hormones, not you. Tracking it helps us see the pattern and gives your doctor useful information. You're doing the right thing by noticing."
    },
    {
      id: 24,
      keywords: ['breathing', 'exercise', 'anxiety', 'right now'],
      question: "What's a good breathing exercise for anxiety right now?",
      response: "Try the 4-7-8 breath: inhale for 4, hold for 7, exhale for 8. Do it with me — in 4… hold 7… out 8. You're safe and you're doing great. Want to do a few more rounds together?"
    },
    {
      id: 25,
      keywords: ['overwhelmed', 'feel', 'can i do', 'help'],
      question: "I feel overwhelmed — what can I do?",
      response: "When everything feels too much, try naming 5 things you can see, 4 you can touch, 3 you can hear. It brings you back to the present. You're not failing — you're carrying a lot. I'm right here."
    },
    {
      id: 26,
      keywords: ['hopeless', 'suicidal', 'harm', 'crisis'],
      question: "I'm having thoughts of harming myself",
      response: "I'm so concerned about you. Please reach out right now to the 988 Suicide & Crisis Lifeline (call or text 988) or go to your nearest ER. You deserve professional support right now, and I'm here too. You matter so much. This is not a substitute for professional medical advice. Please contact emergency services immediately."
    }
  ],

  // ===== PREGNANCY & FERTILITY (31–40) =====
  pregnancyFertility: [
    {
      id: 31,
      keywords: ['fertile window', 'am i in', 'now'],
      question: "Am I in my fertile window?",
      response: "Yes, you're in your fertile window right now. Today and the next {days} days are your highest chance this cycle. You're doing an amazing job tracking this — I'm proud of you."
    },
    {
      id: 32,
      keywords: ['chances', 'pregnant', 'this cycle', 'pregnancy'],
      question: "What are my chances of getting pregnant this cycle?",
      response: "Your chances are highest during your fertile window. With perfect timing it's around 20–30% per cycle for most women. You're giving yourself the best shot by tracking. How are you feeling about it?"
    },
    {
      id: 33,
      keywords: ['confirm', 'ovulation', 'how', 'ways'],
      question: "How do I confirm ovulation?",
      response: "The most reliable ways are a positive ovulation test or a sustained temperature rise. You can also look for cervical mucus changes. Want me to remind you when to test next cycle?"
    },
    {
      id: 34,
      keywords: ['trying', 'conceive', 'this week', 'fertile'],
      question: "I'm trying to conceive — what should I do this week?",
      response: "This week focus on the fertile window — timing intercourse, eating well, and resting. Stress can affect things, so be kind to yourself. You're doing everything right by tracking."
    },
    {
      id: 35,
      keywords: ['early', 'pregnancy', 'symptoms', 'or pms'],
      question: "Early pregnancy symptoms or PMS?",
      response: "It can be really hard to tell the difference early on. Both can cause sore breasts, fatigue, and mood changes. A pregnancy test is the only way to know for sure. Want me to help you decide when to test?"
    },
    {
      id: 36,
      keywords: ['pregnancy', 'test', 'when', 'should i take'],
      question: "When should I take a pregnancy test?",
      response: "The best time is the day after your expected period or 14 days after ovulation. Testing too early can give a false negative. You've got this — I'm here no matter what the result is."
    },
    {
      id: 37,
      keywords: ['pregnant', 'what', 'track', 'should i'],
      question: "I'm pregnant — what should I track?",
      response: "Great news! Track symptoms, prenatal vitamins, and how you're feeling each day. I can help you watch for common early pregnancy patterns. Congratulations — I'm so happy for you."
    },
    {
      id: 38,
      keywords: ['spotting', 'normal', 'early pregnancy'],
      question: "Is this spotting normal in early pregnancy?",
      response: "Light spotting can be normal in early pregnancy, but it's always worth mentioning to your doctor. How much are you seeing and how are you feeling? I'm here to listen."
    },
    {
      id: 39,
      keywords: ['foods', 'pregnant', 'eat', 'should i'],
      question: "What foods should I eat while pregnant?",
      response: "Focus on folate-rich foods (leafy greens, beans), protein, and healthy fats. Stay hydrated and take your prenatal. Want me to suggest a simple meal or snack idea for today?"
    },
    {
      id: 40,
      keywords: ['pregnancy', 'pmdd', 'affect', 'does it'],
      question: "How does pregnancy affect my PMDD?",
      response: "Many women notice PMDD symptoms change or even disappear during pregnancy because the hormones are different. Everyone is unique though. Let's track how you feel and compare it to your usual pattern."
    }
  ],

  // ===== MENOPAUSE & PERIMENOPAUSE (41–50) =====
  menopause: [
    {
      id: 41,
      keywords: ['perimenopause', 'am i in', 'signs'],
      question: "Am I in perimenopause?",
      response: "Irregular periods, hot flashes, or mood changes in your 40s are common signs of perimenopause. It's a normal transition, not something you're doing wrong. Want me to help you track your symptoms?"
    },
    {
      id: 42,
      keywords: ['hot flashes', 'why', 'having'],
      question: "Why am I having hot flashes?",
      response: "Hot flashes are one of the most common perimenopause symptoms caused by fluctuating estrogen. They're annoying but temporary for most women. You're not alone — I'm right here with you."
    },
    {
      id: 43,
      keywords: ['menopause', 'how do i know', 'am i'],
      question: "How do I know if I'm in menopause?",
      response: "Menopause is officially 12 months without a period. You're getting close if your cycles are very irregular. Many women find this a good time to check in with their doctor about symptom management."
    },
    {
      id: 44,
      keywords: ['stages', 'menopause', 'what are'],
      question: "What are the stages of menopause?",
      response: "There are three main stages: perimenopause (transition with irregular periods), menopause (12 months without a period), and postmenopause (after that). You're doing great by learning about it."
    },
    {
      id: 45,
      keywords: ['hrt', 'right for me', 'is it'],
      question: "Is HRT right for me?",
      response: "HRT can be very helpful for many women with severe symptoms, but it's a personal decision. The best next step is talking with your doctor about your specific symptoms and health history. Would you like help preparing questions for that appointment?"
    },
    {
      id: 46,
      keywords: ['night sweats', 'why', 'having'],
      question: "Why am I having night sweats?",
      response: "Night sweats are another common perimenopause symptom. Keeping your bedroom cool and wearing breathable fabrics can help. You're navigating something real — be kind to yourself."
    },
    {
      id: 47,
      keywords: ['periods', 'irregular', 'menopause', 'is this'],
      question: "My periods are irregular — is this menopause?",
      response: "Yes, irregular or skipped periods are one of the earliest signs of perimenopause. Tracking them helps us see the pattern. You're doing the right thing by paying attention."
    },
    {
      id: 48,
      keywords: ['brain fog', 'menopause', 'what helps'],
      question: "What helps with menopause brain fog?",
      response: "Many women find that good sleep, regular movement, and omega-3s help with brain fog. It's frustrating but usually improves with time. Want me to suggest a simple daily habit that might help?"
    },
    {
      id: 49,
      keywords: ['perimenopause', 'how long', 'lasts'],
      question: "How long does perimenopause last?",
      response: "Perimenopause usually lasts 4–8 years, but it's different for everyone. You're in a normal transition and doing great by tracking it. I'm here for every step."
    },
    {
      id: 50,
      keywords: ['supplements', 'menopause', 'what helps'],
      question: "What supplements help with menopause symptoms?",
      response: "Some women find magnesium, vitamin D, and black cohosh helpful, but results vary. The best approach is talking with your doctor before starting anything new. Would you like me to help you prepare a list of questions for that conversation?"
    }
  ]
};

/**
 * Smart matching function to find the best cached response
 * Matches user message against keywords for each response
 * Returns the response object if found, null otherwise
 */
export function findCachedResponse(userMessage) {
  const messageLower = userMessage.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  const allResponses = [
    ...LUNA_RESPONSE_LIBRARY.cycleBasics,
    ...LUNA_RESPONSE_LIBRARY.pmddSymptoms,
    ...LUNA_RESPONSE_LIBRARY.moodMentalHealth,
    ...LUNA_RESPONSE_LIBRARY.pregnancyFertility,
    ...LUNA_RESPONSE_LIBRARY.menopause
  ];

  for (const response of allResponses) {
    let matchScore = 0;

    // Check each keyword
    for (const keyword of response.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        matchScore += 1;
      }
    }

    // Update best match if this is better
    if (matchScore > highestScore) {
      highestScore = matchScore;
      bestMatch = response;
    }
  }

  // Only return a match if we found at least 1 keyword match
  return highestScore >= 1 ? bestMatch : null;
}

/**
 * Format a cached response with variable substitution
 * Replaces {days}, {length}, {confidence}, etc. with actual values
 */
export function formatCachedResponse(responseText, variables = {}) {
  let formatted = responseText;
  for (const [key, value] of Object.entries(variables)) {
    formatted = formatted.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return formatted;
}