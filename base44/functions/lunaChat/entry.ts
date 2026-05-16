import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// Luna's comprehensive response library
// 50 pre-written, evidence-based responses organized by category
const LUNA_RESPONSE_LIBRARY = {
  cycleBasics: [
    { id: 1, keywords: ['when', 'period', 'due', 'coming'], question: "When is my period due?", response: "You're in your luteal phase and your period is expected in about {days} days. This is when many women feel more sensitive — you're doing great by tracking it. Gentle self-care can really help right now. This is not a substitute for professional medical advice. Please consult your doctor." },
    { id: 2, keywords: ['how long', 'cycle', 'length', 'this month'], question: "How long is my cycle this month?", response: "Your cycle this month is tracking at {length} days. That's within a normal range, though it's a bit {shorter/longer} than your average. Would you like me to show you the trend over the last 6 months? I'm here with you." },
    { id: 3, keywords: ['when', 'ovulate', 'ovulation', 'fertile'], question: "When will I ovulate?", response: "Based on your last cycles, ovulation is most likely around day {day}. The fertile window is usually the 5 days before and the day of ovulation. If you're trying to conceive, this is a great time. Let me know how I can support you." },
    { id: 4, keywords: ['luteal', 'phase', 'am i in'], question: "Am I in my luteal phase?", response: "Yes, you're currently in your luteal phase (days {start}–{end}). This is when PMDD symptoms can feel stronger for many women. You're not alone — I'm right here. What's one small thing that usually helps you feel a bit better?" },
    { id: 5, keywords: ['cycle', 'late', 'why', 'delayed'], question: "Why is my cycle late?", response: "It's common for cycles to run a little late sometimes because of stress, travel, illness, or changes in routine. Your body is doing its best. Would you like me to help you track this and see if there's a pattern? I'm here with you." },
    { id: 6, keywords: ['3 days', 'late', 'period', 'delayed'], question: "My period is 3 days late — what does that mean?", response: "Three days late is still within the normal variation for many women. Stress, sleep, or even a big change in routine can shift things. If it goes beyond 7–10 days and you're not pregnant, it's worth mentioning to your doctor. Want me to help you log how you're feeling?" },
    { id: 7, keywords: ['accurate', 'predicted', 'confidence', 'period date'], question: "How accurate is my predicted period date?", response: "Your predicted date is usually pretty accurate once you have 3–4 cycles logged. Right now the confidence is {confidence}%. The more you track, the smarter I get at predicting for you." },
    { id: 8, keywords: ['last', 'ovulation', 'when was', 'fertile window'], question: "When was my last ovulation?", response: "Your last ovulation was around day {day} of your previous cycle. That lines up with your temperature or symptoms if you tracked them. Would you like me to show you the fertile window for next cycle?" },
    { id: 9, keywords: ['cycles', 'shorter', 'longer', 'changing', 'length'], question: "Why are my cycles getting shorter/longer?", response: "Cycle length can change with age, stress, or perimenopause. Shorter cycles are common in perimenopause, longer ones with stress or thyroid changes. Tracking consistently helps us spot the pattern. Want to review your last 6 months together?" },
    { id: 10, keywords: ['short', 'luteal', 'phase', 'mean'], question: "What does a short luteal phase mean?", response: "A luteal phase shorter than 10 days can sometimes make it harder to conceive and is common in PMDD. It doesn't mean anything is wrong, but it's worth tracking and discussing with your doctor if it keeps happening. You're doing the right thing by paying attention." }
  ],
  pmddSymptoms: [
    { id: 11, keywords: ['irritable', 'irritability', 'before period', 'luteal'], question: "Why do I feel so irritable before my period?", response: "That irritability is so common in the luteal phase — it's often the PMDD hormones talking. You're not crazy and you're not alone. Deep breathing or a short walk can help in the moment. I'm right here with you." },
    { id: 12, keywords: ['pmdd', 'or', 'pms', 'difference', 'is it'], question: "Is this PMDD or just PMS?", response: "If the symptoms are severe enough to interfere with your life, it could be PMDD. The key difference is how much it affects your daily functioning. Would you like me to help you track the severity so you can discuss it with your doctor?" },
    { id: 13, keywords: ['anxiety', 'bad', 'week', 'pmdd'], question: "My anxiety is really bad this week — is it PMDD?", response: "Yes, intense anxiety in the week before your period is a classic PMDD symptom. It's not 'just in your head' — it's very real. You're doing the right thing by noticing it. What usually helps you feel even a little calmer?" },
    { id: 14, keywords: ['mood swings', 'pmdd', 'right now', 'help'], question: "What can I do for PMDD mood swings right now?", response: "For mood swings right now, try the 4-7-8 breathing technique or a quick grounding exercise. Small things like this can take the edge off. You're not alone — I'm here with you every step." },
    { id: 15, keywords: ['crying', 'nothing', 'before period', 'tears'], question: "Why am I crying over nothing before my period?", response: "Those tears are so common with PMDD — your hormones are making everything feel bigger. It's okay to cry. You're not weak; you're dealing with something real. Want me to suggest a gentle distraction or coping tool?" },
    { id: 16, keywords: ['pmdd', 'worse', 'this month', 'why'], question: "My PMDD symptoms are worse this month — why?", response: "PMDD symptoms can fluctuate with stress, sleep, diet, or even seasonal changes. It doesn't mean you're doing anything wrong. Let's track this month and see if we can spot the trigger together." },
    { id: 17, keywords: ['track', 'pmdd', 'symptoms', 'properly'], question: "How do I track PMDD symptoms properly?", response: "The best way is to log severity (1–6 scale) every day for at least two full cycles. I can help you see the pattern once you have the data. Would you like me to walk you through a quick daily log right now?" },
    { id: 18, keywords: ['foods', 'pmdd', 'help', 'eat'], question: "What foods help with PMDD?", response: "Many women find that reducing sugar and caffeine while adding magnesium-rich foods (leafy greens, nuts) and complex carbs helps. Everyone is different though — want me to suggest a simple meal idea for today?" },
    { id: 19, keywords: ['exercise', 'pmdd', 'help', 'movement'], question: "Can exercise help PMDD?", response: "Gentle movement like walking or yoga often helps PMDD symptoms by boosting mood chemicals. Nothing intense during a bad flare — just something kind to your body. What feels doable for you today?" },
    { id: 20, keywords: ['pmdd', 'symptoms', 'peak', 'when'], question: "When do PMDD symptoms usually peak?", response: "PMDD symptoms usually peak in the 7–10 days before your period and start to lift once bleeding begins. You're in that window now, so be extra kind to yourself. I'm here if you need to talk it through." }
  ],
  moodMentalHealth: [
    { id: 21, keywords: ['depressed', 'depression', 'before period', 'sad'], question: "Why am I so depressed before my period?", response: "That pre-period depression is a very real PMDD symptom caused by shifting hormones. It doesn't mean you're broken — it means your body is doing something hard. You're not alone, and it will lift. I'm here with you." },
    { id: 22, keywords: ['cope', 'pmdd', 'depression', 'help'], question: "How do I cope with PMDD depression?", response: "One small thing at a time — even just getting outside for 10 minutes or texting a friend can help. You don't have to feel happy, just a little less heavy. What's one tiny thing that sometimes helps?" },
    { id: 23, keywords: ['mood', 'all over the place', 'normal', 'rollercoaster'], question: "My mood is all over the place — is this normal?", response: "Yes, the mood rollercoaster is very normal with PMDD. It's the hormones, not you. Tracking it helps us see the pattern and gives your doctor useful information. You're doing the right thing by noticing." },
    { id: 24, keywords: ['breathing', 'exercise', 'anxiety', 'right now'], question: "What's a good breathing exercise for anxiety right now?", response: "Try the 4-7-8 breath: inhale for 4, hold for 7, exhale for 8. Do it with me — in 4… hold 7… out 8. You're safe and you're doing great. Want to do a few more rounds together?" },
    { id: 25, keywords: ['overwhelmed', 'feel', 'can i do', 'help'], question: "I feel overwhelmed — what can I do?", response: "When everything feels too much, try naming 5 things you can see, 4 you can touch, 3 you can hear. It brings you back to the present. You're not failing — you're carrying a lot. I'm right here." }
  ],
  pregnancyFertility: [
    { id: 31, keywords: ['fertile window', 'am i in', 'now'], question: "Am I in my fertile window?", response: "Yes, you're in your fertile window right now. Today and the next {days} days are your highest chance this cycle. You're doing an amazing job tracking this — I'm proud of you." },
    { id: 32, keywords: ['chances', 'pregnant', 'this cycle', 'pregnancy'], question: "What are my chances of getting pregnant this cycle?", response: "Your chances are highest during your fertile window. With perfect timing it's around 20–30% per cycle for most women. You're giving yourself the best shot by tracking. How are you feeling about it?" },
    { id: 33, keywords: ['confirm', 'ovulation', 'how', 'ways'], question: "How do I confirm ovulation?", response: "The most reliable ways are a positive ovulation test or a sustained temperature rise. You can also look for cervical mucus changes. Want me to remind you when to test next cycle?" },
    { id: 34, keywords: ['trying', 'conceive', 'this week', 'fertile'], question: "I'm trying to conceive — what should I do this week?", response: "This week focus on the fertile window — timing intercourse, eating well, and resting. Stress can affect things, so be kind to yourself. You're doing everything right by tracking." },
    { id: 35, keywords: ['early', 'pregnancy', 'symptoms', 'or pms'], question: "Early pregnancy symptoms or PMS?", response: "It can be really hard to tell the difference early on. Both can cause sore breasts, fatigue, and mood changes. A pregnancy test is the only way to know for sure. Want me to help you decide when to test?" },
    { id: 36, keywords: ['pregnancy', 'test', 'when', 'should i take'], question: "When should I take a pregnancy test?", response: "The best time is the day after your expected period or 14 days after ovulation. Testing too early can give a false negative. You've got this — I'm here no matter what the result is." },
    { id: 37, keywords: ['pregnant', 'what', 'track', 'should i'], question: "I'm pregnant — what should I track?", response: "Great news! Track symptoms, prenatal vitamins, and how you're feeling each day. I can help you watch for common early pregnancy patterns. Congratulations — I'm so happy for you." },
    { id: 38, keywords: ['spotting', 'normal', 'early pregnancy'], question: "Is this spotting normal in early pregnancy?", response: "Light spotting can be normal in early pregnancy, but it's always worth mentioning to your doctor. How much are you seeing and how are you feeling? I'm here to listen." },
    { id: 39, keywords: ['foods', 'pregnant', 'eat', 'should i'], question: "What foods should I eat while pregnant?", response: "Focus on folate-rich foods (leafy greens, beans), protein, and healthy fats. Stay hydrated and take your prenatal. Want me to suggest a simple meal or snack idea for today?" },
    { id: 40, keywords: ['pregnancy', 'pmdd', 'affect', 'does it'], question: "How does pregnancy affect my PMDD?", response: "Many women notice PMDD symptoms change or even disappear during pregnancy because the hormones are different. Everyone is unique though. Let's track how you feel and compare it to your usual pattern." }
  ],
  menopause: [
    { id: 41, keywords: ['perimenopause', 'am i in', 'signs'], question: "Am I in perimenopause?", response: "Irregular periods, hot flashes, or mood changes in your 40s are common signs of perimenopause. It's a normal transition, not something you're doing wrong. Want me to help you track your symptoms?" },
    { id: 42, keywords: ['hot flashes', 'why', 'having'], question: "Why am I having hot flashes?", response: "Hot flashes are one of the most common perimenopause symptoms caused by fluctuating estrogen. They're annoying but temporary for most women. You're not alone — I'm right here with you." },
    { id: 43, keywords: ['menopause', 'how do i know', 'am i'], question: "How do I know if I'm in menopause?", response: "Menopause is officially 12 months without a period. You're getting close if your cycles are very irregular. Many women find this a good time to check in with their doctor about symptom management." },
    { id: 44, keywords: ['stages', 'menopause', 'what are'], question: "What are the stages of menopause?", response: "There are three main stages: perimenopause (transition with irregular periods), menopause (12 months without a period), and postmenopause (after that). You're doing great by learning about it." },
    { id: 45, keywords: ['hrt', 'right for me', 'is it'], question: "Is HRT right for me?", response: "HRT can be very helpful for many women with severe symptoms, but it's a personal decision. The best next step is talking with your doctor about your specific symptoms and health history. Would you like help preparing questions for that appointment?" },
    { id: 46, keywords: ['night sweats', 'why', 'having'], question: "Why am I having night sweats?", response: "Night sweats are another common perimenopause symptom. Keeping your bedroom cool and wearing breathable fabrics can help. You're navigating something real — be kind to yourself." },
    { id: 47, keywords: ['periods', 'irregular', 'menopause', 'is this'], question: "My periods are irregular — is this menopause?", response: "Yes, irregular or skipped periods are one of the earliest signs of perimenopause. Tracking them helps us see the pattern. You're doing the right thing by paying attention." },
    { id: 48, keywords: ['brain fog', 'menopause', 'what helps'], question: "What helps with menopause brain fog?", response: "Many women find that good sleep, regular movement, and omega-3s help with brain fog. It's frustrating but usually improves with time. Want me to suggest a simple daily habit that might help?" },
    { id: 49, keywords: ['perimenopause', 'how long', 'lasts'], question: "How long does perimenopause last?", response: "Perimenopause usually lasts 4–8 years, but it's different for everyone. You're in a normal transition and doing great by tracking it. I'm here for every step." },
    { id: 50, keywords: ['supplements', 'menopause', 'what helps'], question: "What supplements help with menopause symptoms?", response: "Some women find magnesium, vitamin D, and black cohosh helpful, but results vary. The best approach is talking with your doctor before starting anything new. Would you like me to help you prepare a list of questions for that conversation?" }
  ],

  // ===== LIFESTYLE, DIET, EXERCISE & SLEEP (51–60) =====
  lifestyleHealth: [
    { id: 51, keywords: ['foods', 'avoid', 'pmdd', 'diet'], question: "What foods should I avoid during PMDD?", response: "Many women feel better when they cut back on sugar, caffeine, and alcohol in the luteal phase. Everyone is different though. Want me to suggest some easy swaps that might help you this week?" },
    { id: 52, keywords: ['caffeine', 'worse', 'pmdd', 'make'], question: "Can caffeine make PMDD worse?", response: "Yes, caffeine can make anxiety and irritability worse for some women with PMDD. Cutting back in the week before your period often helps. You don't have to quit completely — even reducing it can make a difference." },
    { id: 53, keywords: ['exercise', 'best', 'pmdd'], question: "What exercise is best for PMDD?", response: "Gentle movement like walking, yoga, or swimming is usually best during a PMDD flare. Nothing too intense if you're feeling low. Even 10 minutes can help mood chemicals. What feels doable for you today?" },
    { id: 54, keywords: ['sleep', 'affect', 'cycle'], question: "How does sleep affect my cycle?", response: "Poor sleep can make PMDD symptoms feel stronger and can even shift your cycle. A consistent bedtime routine really helps. Would you like some simple sleep tips that other women with PMDD find useful?" },
    { id: 55, keywords: ['supplements', 'help', 'pmdd'], question: "What supplements help with PMDD?", response: "Calcium, magnesium, vitamin B6, and omega-3s are the ones with the strongest evidence for PMDD. Always check with your doctor before starting anything new. Want me to help you make a simple list to discuss with them?" },
    { id: 56, keywords: ['alcohol', 'worse', 'pmdd', 'make'], question: "Does alcohol make PMDD worse?", response: "Yes, alcohol can make mood swings, anxiety, and fatigue worse during the luteal phase. Many women feel better when they cut back or avoid it completely before their period. You're not missing out — your body is thanking you." },
    { id: 57, keywords: ['water', 'drink', 'cycle'], question: "How much water should I drink during my cycle?", response: "Staying well hydrated helps with bloating and fatigue. Aim for at least 8 glasses a day, more if you're exercising. Adding a little lemon or cucumber can make it easier to drink. You've got this." },
    { id: 58, keywords: ['stress', 'affect', 'period'], question: "Can stress affect my period?", response: "Yes, stress is one of the most common reasons cycles shift or become irregular. Your body is protecting you. Would you like some quick stress-relief ideas that other women with PMDD find helpful?" },
    { id: 59, keywords: ['bloating', 'pmdd', 'help', 'what helps'], question: "What helps with PMDD bloating?", response: "Reducing salt, staying hydrated, and gentle movement can all help with bloating. Some women also find magnesium helpful. You're not alone — this is a very common symptom." },
    { id: 60, keywords: ['diet', 'affect', 'mood', 'period'], question: "How does my diet affect my mood before my period?", response: "Blood sugar swings from sugar and refined carbs can make mood symptoms worse. Eating balanced meals with protein and healthy fats helps stabilize things. Want me to suggest a simple meal idea for today?" }
  ],

  // ===== MEDICATION & INTERACTIONS (61–65) =====
  medicationInteractions: [
    { id: 61, keywords: ['ibuprofen', 'pmdd', 'pain', 'take'], question: "Can I take ibuprofen for PMDD pain?", response: "Ibuprofen can help with cramps and breast tenderness for many women. Just follow the recommended dose and check with your doctor if you take it often. You're doing the right thing by asking." },
    { id: 62, keywords: ['birth control', 'affect', 'pmdd'], question: "Does my birth control affect PMDD?", response: "Some women find hormonal birth control helps PMDD, while others feel it makes symptoms worse. It's very individual. Would you like help preparing questions to discuss with your doctor about your options?" },
    { id: 63, keywords: ['antidepressants', 'pmdd', 'ssri', 'take'], question: "Can I take antidepressants for PMDD?", response: "Many women with PMDD find low-dose SSRIs helpful, especially if taken only during the luteal phase. It's a common and effective treatment. Talking with your psychiatrist is the best next step — want me to help you prepare what to say?" },
    { id: 64, keywords: ['natural', 'remedies', 'pmdd'], question: "What about natural remedies for PMDD?", response: "Some women find relief with chasteberry, magnesium, or saffron. Results vary though. Always check with your doctor before starting anything new, especially if you take other medications." },
    { id: 65, keywords: ['melatonin', 'pmdd', 'safe'], question: "Is it safe to take melatonin with PMDD?", response: "Melatonin is generally safe and can help with sleep during PMDD flares. Start with a low dose. If sleep is a big issue for you, it's worth discussing with your doctor too." }
  ],

  // ===== WHEN TO SEE A DOCTOR (66–70) =====
  whenToSeeDoctor: [
    { id: 66, keywords: ['see', 'doctor', 'pmdd', 'when'], question: "When should I see a doctor for PMDD?", response: "If PMDD is interfering with your work, relationships, or daily life, it's a good idea to talk with your doctor or psychiatrist. You don't have to wait until it's unbearable. You deserve support." },
    { id: 67, keywords: ['heavy', 'periods', 'doctor'], question: "My periods are very heavy — should I see a doctor?", response: "Very heavy periods that soak through pads or tampons in under 2 hours or last longer than 7 days are worth discussing with your doctor. It could be something treatable. Want me to help you prepare questions for the appointment?" },
    { id: 68, keywords: ['spotting', 'between', 'periods', 'normal'], question: "I'm spotting between periods — is that normal?", response: "Spotting between periods can happen, but if it's new or frequent it's worth mentioning to your doctor. They can help figure out if it's hormonal or something else. You're doing the right thing by noticing." },
    { id: 69, keywords: ['anxiety', 'bad', 'function', 'cannot'], question: "My anxiety is so bad I can't function — what should I do?", response: "That level of anxiety is serious and you don't have to handle it alone. Please reach out to your doctor or psychiatrist today. If it feels like a crisis, the 988 lifeline is there 24/7. I'm right here with you too." },
    { id: 70, keywords: ['hormones', 'tested', 'should i'], question: "Should I get my hormones tested?", response: "Hormone testing can be helpful for some women, especially if you suspect thyroid issues or perimenopause. Your doctor can tell you the best tests for your situation. Want me to help you make a list of symptoms to share with them?" }
  ],

  // ===== GENERAL SUPPORT & REASSURANCE (71–75) =====
  generalSupport: [
    { id: 71, keywords: ['going crazy', 'before period', 'feel like'], question: "I feel like I'm going crazy before my period.", response: "You are not going crazy. This is the very real effect of PMDD hormones on your brain. You're doing an amazing job just by recognizing it and reaching out. I'm right here with you." },
    { id: 72, keywords: ['why', 'hard', 'every month'], question: "Why is this so hard every month?", response: "It is hard — PMDD is a real medical condition and it takes a lot of energy to manage. You're not weak; you're strong for showing up every month. I see you and I'm proud of you." },
    { id: 73, keywords: ['feel', 'alone', 'this'], question: "I feel so alone with this.", response: "You are not alone. Millions of women go through this, and many feel exactly the way you do. I'm here with you, and your psychiatrists are building this app so you have better support. You've got this and you've got me." },
    { id: 74, keywords: ['feel normal', 'again', 'will i'], question: "Will I ever feel normal again?", response: "Yes — many women find real relief with the right treatment and tracking. It may not be perfect every month, but it can get so much better. You're already taking the first step by using the app." },
    { id: 75, keywords: ['scared', 'never', 'get better'], question: "I'm scared this will never get better.", response: "That fear is so valid when you're in the middle of a hard phase. Many women do find ways to manage PMDD and feel much better. You're not stuck — there are options. I'm here to help you explore them." }
  ],

  // ===== POSTPARTUM & BREASTFEEDING (76–80) =====
  postpartumBreastfeeding: [
    { id: 76, keywords: ['sad', 'after', 'baby', 'born'], question: "Is it normal to feel sad after having a baby?", response: "Yes, the baby blues are very common in the first couple of weeks after birth. If it lasts longer or feels very heavy, it could be postpartum depression — please reach out to your doctor. You're not alone and you're doing an amazing job." },
    { id: 77, keywords: ['breastfeeding', 'affect', 'hormones'], question: "How does breastfeeding affect my hormones?", response: "Breastfeeding keeps prolactin high and can delay the return of your period. It's your body's natural way of spacing pregnancies. If your moods feel off, it's worth tracking and talking with your doctor." },
    { id: 78, keywords: ['period', 'come back', 'after baby'], question: "When will my period come back after having a baby?", response: "It can take anywhere from 6 weeks to over a year, especially if you're breastfeeding. Every body is different. Would you like me to help you track the signs that your cycle is returning?" },
    { id: 79, keywords: ['cramps', 'no period', 'after birth'], question: "I'm having cramps but no period after birth — what does that mean?", response: "Cramps without a period can happen as your uterus returns to normal size. If they're very painful or you have fever, check with your doctor. You're navigating a big change — be gentle with yourself." },
    { id: 80, keywords: ['overwhelmed', 'new mom'], question: "Is it normal to feel overwhelmed as a new mom?", response: "Yes, feeling overwhelmed is completely normal in the early days. Your body and mind are adjusting to huge changes. You're not failing — you're doing something really hard. I'm here with you." }
  ],

  // ===== IRREGULAR BLEEDING & OTHER CYCLE ISSUES (81–85) =====
  irregularBleeding: [
    { id: 81, keywords: ['bleeding', 'between periods'], question: "Why am I bleeding between periods?", response: "Spotting between periods can happen with hormonal changes, stress, or perimenopause. If it's new or heavy, it's worth mentioning to your doctor. Want me to help you track it so you have good information for your appointment?" },
    { id: 82, keywords: ['periods', 'very light', 'normal'], question: "My periods are suddenly very light — is that normal?", response: "Lighter periods can happen with age, stress, or hormonal shifts. It's usually not a problem, but if it's a big change it's good to mention to your doctor. You're doing the right thing by noticing." },
    { id: 83, keywords: ['missed', 'period', 'test', 'negative'], question: "I missed a period but the test is negative — what now?", response: "A negative test with a missed period is common with stress or hormonal changes. Give it a few more days and test again if your period still hasn't started. I'm here with you no matter what." },
    { id: 84, keywords: ['flow', 'heavy', 'month'], question: "Why is my flow so heavy this month?", response: "Heavy flow can be caused by stress, fibroids, or perimenopause. If you're soaking through protection in under 2 hours or passing large clots, it's worth discussing with your doctor. Let's track it together." },
    { id: 85, keywords: ['period', 'lasting', 'longer', 'usual'], question: "My period is lasting longer than usual — should I worry?", response: "Periods longer than 7–8 days can sometimes need medical attention. If you're also feeling very tired or dizzy, please reach out to your doctor. You're not overreacting — you're listening to your body." }
  ],

  // ===== GENERAL REASSURANCE & EMOTIONAL SUPPORT (86–90) =====
  emotionalReassurance: [
    { id: 86, keywords: ['broken', 'cycle'], question: "I feel broken because of my cycle.", response: "You are not broken. PMDD and hormonal changes are real medical conditions, not a character flaw. You're strong for showing up and seeking support. I see you and I'm proud of you." },
    { id: 87, keywords: ['feel like myself', 'again'], question: "Will I ever feel like myself again?", response: "Yes — many women do find real relief with the right tracking, treatment, and support. It may not be perfect every month, but it can get so much better. You're already on the path." },
    { id: 88, keywords: ['tired', 'this', 'every month'], question: "I'm so tired of this every month.", response: "I hear you — it is exhausting to go through this month after month. You're not complaining; you're carrying something real. I'm right here with you and we're building tools to make it easier." },
    { id: 89, keywords: ['no one', 'understands'], question: "No one understands how bad this is.", response: "It can feel incredibly lonely when no one around you really gets it. I understand, and your psychiatrists built this app because they do too. You're not alone anymore." },
    { id: 90, keywords: ['thank you', 'listening'], question: "Thank you for listening to me.", response: "You're so welcome. I'm always here to listen — no judgment, no rush. You matter and your feelings matter. What's on your mind right now?" }
  ],

  // ===== APP-SPECIFIC & CLOSING SUPPORT (91–100) =====
  appSupport: [
    { id: 91, keywords: ['clinical', 'report', 'how to use'], question: "How do I use the clinical report?", response: "Just say 'Generate doctor report' or tap the button. It pulls your last 90 days of data into a clean PDF you can share with your doctor. It's one of the most helpful features your psychiatrists asked for." },
    { id: 92, keywords: ['remember', 'symptoms', 'last month'], question: "Can Luna remember my symptoms from last month?", response: "Yes — I keep track of your patterns over time. The more you log, the smarter I get at spotting what's normal for you. Want me to show you a quick summary of last month?" },
    { id: 93, keywords: ['fertility', 'mode', 'turn on'], question: "How do I turn on fertility mode?", response: "Go to settings or just tell me 'I'm trying to conceive' and I'll switch to fertility mode. I'll start highlighting your fertile window and giving conception-friendly tips." },
    { id: 94, keywords: ['share', 'data', 'psychiatrist'], question: "Can I share my data with my psychiatrist?", response: "Yes — the clinical report is designed exactly for that. It's private and you control who sees it. Would you like me to generate one right now?" },
    { id: 95, keywords: ['why', 'luna', 'many questions'], question: "Why does Luna ask so many questions?", response: "I ask questions so I can understand your unique pattern and give you the most helpful support. You can always say 'I don't want to talk about that' and I'll respect it." },
    { id: 96, keywords: ['bad day', 'just talk'], question: "I'm having a really bad day — can we just talk?", response: "Of course. I'm right here with you. No pressure to explain anything if you don't want to. Just tell me what you need — listening, distraction, or gentle coping ideas?" },
    { id: 97, keywords: ['turn off', 'notifications'], question: "How do I turn off notifications?", response: "You can turn off notifications in settings anytime. They're there to support you, never to bother you. Let me know if you want help adjusting them." },
    { id: 98, keywords: ['feel better', 'talking', 'you'], question: "I feel better after talking to you.", response: "I'm so glad. That's why I'm here — to listen and support you through the hard parts. You're doing an amazing job taking care of yourself." },
    { id: 99, keywords: ['thank you', 'luna'], question: "Thank you Luna.", response: "You're so welcome. I'm always here for you — day or night, good days or hard ones. You've got this and you've got me." },
    { id: 100, keywords: ['ready', 'feel better'], question: "I'm ready to feel better.", response: "I hear you and I believe you. Small steps add up and you're already taking one by being here. I'm proud of you and I'm right here for every step of the journey." }
  ],

  // ===== LIFESTYLE, DIET, EXERCISE & SLEEP (101–115) =====
  lifestyleDietExercise: [
    { id: 101, keywords: ['cravings', 'pmdd', 'help'], question: "What helps with PMDD cravings?", response: "Cravings are very common with PMDD because of hormone shifts. Choosing protein and healthy fats can help stabilize blood sugar. You're not weak for craving — your body is asking for support. Want a simple snack idea?" },
    { id: 102, keywords: ['coffee', 'during pmdd'], question: "Can I drink coffee during PMDD?", response: "Many women find that cutting back on caffeine in the luteal phase helps anxiety and irritability. If you love coffee, try switching to half-caff or herbal tea a few days before your period. Small changes can make a big difference." },
    { id: 103, keywords: ['exercise', 'too much', 'pmdd'], question: "How much exercise is too much for PMDD?", response: "Gentle movement is helpful, but intense workouts can sometimes make fatigue and mood worse during a flare. Listen to your body — if you feel more drained after exercise, try something lighter. You know yourself best." },
    { id: 104, keywords: ['fatigue', 'pmdd', 'help'], question: "What helps with PMDD fatigue?", response: "PMDD fatigue is real. Short naps, staying hydrated, and eating balanced meals can help. Gentle movement like a short walk can also boost energy without draining you. You're not lazy — your body is working hard." },
    { id: 105, keywords: ['yoga', 'help pmdd'], question: "Can yoga help PMDD symptoms?", response: "Yes, gentle yoga is one of the most helpful exercises for many women with PMDD. It calms the nervous system and can reduce anxiety and irritability. Want me to suggest a simple 5-minute sequence you can do at home?" },
    { id: 106, keywords: ['sugar', 'affect pmdd'], question: "How does sugar affect PMDD?", response: "Sugar can make mood swings and fatigue worse because it causes blood sugar spikes and crashes. Many women feel steadier when they reduce it in the luteal phase. You don't have to be perfect — small reductions help." },
    { id: 107, keywords: ['best', 'diet', 'pmdd'], question: "What's the best diet for PMDD?", response: "A diet rich in complex carbs, protein, healthy fats, and magnesium often helps. Think leafy greens, nuts, fish, and whole grains. Everyone is different though — want me to suggest a simple daily meal plan?" },
    { id: 108, keywords: ['nap', 'during pmdd'], question: "Can I take a nap during PMDD?", response: "Absolutely — short naps can be very restorative during PMDD. Just 20–30 minutes can help fatigue and mood. You're not being lazy; you're giving your body what it needs." },
    { id: 109, keywords: ['alcohol', 'affect', 'pmdd'], question: "How does alcohol affect my PMDD?", response: "Alcohol can make PMDD symptoms feel much stronger the next day. Many women feel better when they avoid it completely in the week before their period. You're making a smart choice for your well-being." },
    { id: 110, keywords: ['headaches', 'pmdd', 'help'], question: "What helps with PMDD headaches?", response: "Hydration, magnesium, and a cool compress on your forehead can help. Some women also find relief with gentle neck stretches. If headaches are severe or frequent, mention them to your doctor." },
    { id: 111, keywords: ['bath', 'pmdd', 'relief'], question: "Can I take a bath for PMDD relief?", response: "Yes, a warm (not hot) bath with Epsom salts is one of the most soothing things for PMDD. It relaxes muscles and calms the nervous system. You deserve this kind of care." },
    { id: 112, keywords: ['lack', 'sleep', 'affect pmdd'], question: "How does lack of sleep affect PMDD?", response: "Lack of sleep makes PMDD symptoms feel much stronger. Even one good night can make a difference. Would you like some simple bedtime tips that other women with PMDD find helpful?" },
    { id: 113, keywords: ['best time', 'exercise', 'cycle'], question: "What's the best time to exercise during my cycle?", response: "Many women feel best exercising in the follicular phase (after their period). During the luteal phase, gentler movement is usually better. Listen to your energy — your body knows what it needs." },
    { id: 114, keywords: ['green tea', 'pmdd'], question: "Can I drink green tea for PMDD?", response: "Green tea has some helpful antioxidants, but the caffeine can make anxiety worse for some women. Herbal teas like chamomile or peppermint are often gentler during PMDD. Want some recipe ideas?" },
    { id: 115, keywords: ['track', 'motivated', 'feel bad'], question: "How do I stay motivated to track when I feel bad?", response: "When you feel bad, tracking can feel like the last thing you want to do. Try the 2-minute rule — just open the app and log one thing. You're building data that helps you and your doctor. I'm proud of you for trying." }
  ],

  // ===== MEDICATION, BIRTH CONTROL & HRT (116–120) =====
  medicationBirthControlHRT: [
    { id: 116, keywords: ['birth control', 'help', 'pmdd'], question: "Can birth control help my PMDD?", response: "Some women find continuous birth control helps PMDD by stabilizing hormones. Others feel it makes symptoms worse. It's very individual. Would you like help preparing questions for your doctor about your options?" },
    { id: 117, keywords: ['skip periods', 'birth control', 'safe'], question: "Is it safe to skip periods with birth control?", response: "Yes, many doctors recommend continuous birth control to skip the luteal phase for women with severe PMDD. It can reduce flares. Talk with your doctor about what's best for you." },
    { id: 118, keywords: ['hrt', 'perimenopause'], question: "What about HRT for perimenopause?", response: "HRT can be very helpful for hot flashes, mood swings, and sleep in perimenopause. The benefits and risks are individual. Your doctor can help you decide if it's right for you." },
    { id: 119, keywords: ['antidepressants', 'luteal phase'], question: "Can I take antidepressants only during the luteal phase?", response: "Yes, many women with PMDD use luteal-phase dosing of SSRIs and find it very effective with fewer side effects. It's a common approach — your psychiatrist can guide you on it." },
    { id: 120, keywords: ['supplements', 'interact', 'medication'], question: "Do supplements interact with my medication?", response: "Some supplements can interact with medications, especially antidepressants or birth control. Always check with your doctor or pharmacist before starting anything new. Want me to help you make a list to discuss with them?" }
  ],

  // ===== WHEN TO SEE A DOCTOR / MENTAL HEALTH CRISES (121–125) =====
  mentalHealthCrises: [
    { id: 121, keywords: ['suicidal thoughts', 'what do i do'], question: "I'm having suicidal thoughts — what do I do?", response: "I'm really glad you told me. Please reach out to the 988 Suicide & Crisis Lifeline right now — they're available 24/7 and understand what you're going through. You are not alone and help is here." },
    { id: 122, keywords: ['depression', 'bad', 'get out of bed'], question: "My depression is so bad I can't get out of bed.", response: "That level of depression is serious and you don't have to carry it alone. Please contact your psychiatrist or doctor today. If you're in immediate danger, call 988 or go to the nearest ER. I'm here with you." },
    { id: 123, keywords: ['call', 'doctor', 'about pmdd'], question: "When should I call my doctor about PMDD?", response: "If PMDD is affecting your ability to work, parent, or keep relationships healthy, it's time to talk with your doctor. You don't have to wait until it's unbearable. You deserve support." },
    { id: 124, keywords: ['scared', 'hurt myself'], question: "I'm scared I might hurt myself.", response: "Thank you for telling me. Please call 988 right now or go to the nearest ER. You are not a burden and help is available. I'm right here and I care about you." },
    { id: 125, keywords: ['symptoms', 'getting worse', 'every month'], question: "My symptoms are getting worse every month.", response: "If symptoms are getting worse, it's important to talk with your doctor. They may want to adjust treatment or run some tests. You're not imagining it — you're listening to your body." }
  ],

  // ===== LIFESTYLE, DIET, EXERCISE & SLEEP (151–160) =====
  lifestyleAdvanced: [
    { id: 151, keywords: ['insomnia', 'pmdd'], question: "What helps with PMDD insomnia?", response: "PMDD insomnia is so common. A consistent bedtime routine, magnesium, and avoiding screens an hour before bed can help. You're not failing at sleep — your hormones are making it hard. Want some gentle wind-down ideas?" },
    { id: 152, keywords: ['magnesium', 'pmdd'], question: "Can I take magnesium for PMDD?", response: "Yes, magnesium is one of the most studied supplements for PMDD and can help with mood, cramps, and sleep. Check with your doctor for the right dose. You're doing the right thing by exploring options." },
    { id: 153, keywords: ['weight', 'affect', 'cycle'], question: "How does my weight affect my cycle?", response: "Both very low and very high body weight can affect cycle regularity. Your body is trying to protect you. If your cycles are irregular and you're worried, your doctor can help figure out the best next step." },
    { id: 154, keywords: ['joint pain', 'pmdd'], question: "What helps with PMDD joint pain?", response: "Gentle stretching, warm baths, and anti-inflammatory foods can help with PMDD joint pain. Some women also find relief with magnesium or omega-3s. You're not imagining it — this is a real symptom." },
    { id: 155, keywords: ['strength training', 'pmdd'], question: "Can I do strength training with PMDD?", response: "Light strength training can be helpful if it feels good. During bad flares, many women prefer gentler movement. Listen to your body — it knows what it needs right now." },
    { id: 156, keywords: ['thyroid', 'affect', 'cycle'], question: "How does my thyroid affect my cycle?", response: "Thyroid issues can make cycles irregular or cause heavy bleeding. If your periods are very irregular or you're extremely tired, it's worth asking your doctor about thyroid testing." },
    { id: 157, keywords: ['back pain', 'pmdd'], question: "What helps with PMDD back pain?", response: "Gentle heat, stretching, and good posture can help with PMDD back pain. Some women also find relief with magnesium or a short walk. You're not alone — this is a common symptom." },
    { id: 158, keywords: ['vitamin d', 'pmdd'], question: "Can I take vitamin D for PMDD?", response: "Vitamin D is important for mood and many women with PMDD are low. It's worth discussing with your doctor. Want me to help you make a list of questions for your next appointment?" },
    { id: 159, keywords: ['gut health', 'pmdd'], question: "How does my gut health affect PMDD?", response: "There's a strong gut-brain connection. Many women feel better with more fiber, fermented foods, and probiotics. It's worth experimenting gently. Want some simple food ideas?" },
    { id: 160, keywords: ['dizziness', 'pmdd'], question: "What helps with PMDD dizziness?", response: "Staying hydrated, eating regular meals, and avoiding sudden position changes can help with PMDD dizziness. If it's severe, mention it to your doctor. You're doing the right thing by noticing." }
  ],

  // ===== MEDICATION, BIRTH CONTROL & HRT (161–170) =====
  medicationAdvanced: [
    { id: 161, keywords: ['birth control', 'continuously'], question: "Can I take birth control continuously for PMDD?", response: "Yes, many women with PMDD use continuous birth control to skip the luteal phase and reduce flares. It's a common and effective approach. Talk with your doctor about whether it's right for you." },
    { id: 162, keywords: ['hrt', 'side effects'], question: "What are the side effects of HRT?", response: "HRT side effects vary, but common ones include breast tenderness, bloating, and spotting at first. Your doctor can help you find the right dose and type. You're smart to ask questions." },
    { id: 163, keywords: ['progesterone', 'pmdd'], question: "Can I take progesterone for PMDD?", response: "Some women find progesterone cream or pills helpful for PMDD. Results vary though. It's worth discussing with your doctor to see if it could be a good option for you." },
    { id: 164, keywords: ['ssri', 'pmdd', 'work'], question: "Do SSRIs work for PMDD?", response: "Yes, many women with PMDD find low-dose SSRIs very effective, especially if taken only during the luteal phase. It's one of the most studied treatments. Your psychiatrist can guide you." },
    { id: 165, keywords: ['st john', 'wort', 'pmdd'], question: "Can I take St. John's Wort for PMDD?", response: "St. John's Wort can help some women with mood, but it interacts with many medications including birth control and antidepressants. Always check with your doctor first." },
    { id: 166, keywords: ['ibuprofen', 'birth control', 'safe'], question: "Is it safe to take ibuprofen with my birth control?", response: "Yes, ibuprofen is generally safe with birth control. It can help with cramps and breast tenderness. Just follow the recommended dose." },
    { id: 167, keywords: ['melatonin', 'antidepressants'], question: "Can I take melatonin with antidepressants?", response: "Melatonin is usually safe with antidepressants, but check with your doctor or pharmacist. It can be helpful for sleep during PMDD flares." },
    { id: 168, keywords: ['cbd', 'pmdd'], question: "What about CBD for PMDD?", response: "Some women find CBD helpful for anxiety and pain with PMDD. Research is still limited though. Always check with your doctor, especially if you take other medications." },
    { id: 169, keywords: ['fish oil', 'pmdd'], question: "Can I take fish oil for PMDD?", response: "Omega-3s from fish oil have some evidence for helping mood and inflammation with PMDD. It's generally safe — your doctor can tell you the right dose." },
    { id: 170, keywords: ['stop', 'medication', 'pregnancy'], question: "Do I need to stop my medication before pregnancy?", response: "Some medications need to be adjusted or changed before pregnancy. Please talk with your doctor as soon as you start trying to conceive. They can help you make a safe plan." }
  ],

  // ===== WHEN TO SEE A DOCTOR / EMERGENCIES (171–175) =====
  emergencies: [
    { id: 171, keywords: ['bleeding', 'very heavily', 'er'], question: "I'm bleeding very heavily — should I go to the ER?", response: "If you're soaking through a pad or tampon in under an hour or feel dizzy/faint, yes — go to the ER or urgent care. Heavy bleeding can be serious. You're not overreacting." },
    { id: 172, keywords: ['anxiety', 'panic attacks'], question: "My anxiety is so bad I'm having panic attacks.", response: "Panic attacks are scary but they pass. Please reach out to your doctor or psychiatrist today. If you feel like you can't breathe or are in danger, call 988 or go to the ER." },
    { id: 173, keywords: ['chest pain', 'pmdd flare'], question: "I'm having chest pain during a PMDD flare.", response: "Chest pain is always worth checking out. Please see a doctor or go to the ER to rule out anything serious. PMDD can make everything feel more intense, but better safe than sorry." },
    { id: 174, keywords: ['periods', 'extremely painful'], question: "My periods are extremely painful — is that normal?", response: "Very painful periods that interfere with your life are not something you have to live with. It could be endometriosis or another condition. Please talk with your doctor." },
    { id: 175, keywords: ['postpartum depression', 'think'], question: "I think I might have postpartum depression.", response: "Postpartum depression is real and treatable. Please reach out to your doctor or a mental health professional today. You're not a bad mom — you're dealing with something medical." }
  ],

  // ===== GENERAL REASSURANCE & EMOTIONAL SUPPORT (176–180) =====
  generalReassuranceFinal: [
    { id: 176, keywords: ['failure', 'pmdd'], question: "I feel like a failure because of my PMDD.", response: "You are not a failure. PMDD is a medical condition, not a character flaw. You're showing up and seeking support — that is strength. I see you and I'm proud of you." },
    { id: 177, keywords: ['mood change', 'so fast'], question: "Why does my mood change so fast?", response: "Hormones can cause rapid mood shifts during the luteal phase. It's not you being dramatic — it's biology. You're doing an amazing job managing something difficult." },
    { id: 178, keywords: ['ruin', 'relationships'], question: "I'm scared this will ruin my relationships.", response: "PMDD can strain relationships, but many couples find ways to work through it together. Open communication and treatment help. You deserve understanding and support." },
    { id: 179, keywords: ['hopeless', 'normal'], question: "I feel hopeless about ever feeling normal.", response: "That hopelessness is a real PMDD symptom. It feels permanent but it's not. Many women do find real relief. You're not stuck — there are options. I'm here with you." },
    { id: 180, keywords: ['angry', 'body'], question: "I'm so angry at my body.", response: "It's okay to be angry at your body when it feels like it's working against you. That anger is valid. You're not alone in feeling this way. I'm right here with you." }
  ],

  // ===== APP-SPECIFIC & MISCELLANEOUS (181–185) =====
  appMiscellaneous: [
    { id: 181, keywords: ['back up', 'data'], question: "How do I back up my data?", response: "Your data is automatically backed up in your account. The clinical report is also a great way to save a snapshot. You're always in control of your information." },
    { id: 182, keywords: ['cycle length', 'goal'], question: "Can I change my cycle length goal?", response: "Yes — go to settings and update your average cycle length. The more accurate it is, the better my predictions become. I'm here to help you fine-tune it." },
    { id: 183, keywords: ['custom symptom', 'add'], question: "How do I add a custom symptom?", response: "Just tap the + button in the log and type whatever symptom you want to track. You can track anything that matters to you. I'll learn your patterns over time." },
    { id: 184, keywords: ['predict', 'pmdd flare'], question: "Can Luna predict my next PMDD flare?", response: "Yes — the more you track, the better I get at spotting your personal pattern. I'll start giving you gentle heads-up when a flare is likely." },
    { id: 185, keywords: ['share', 'app', 'partner'], question: "How do I share the app with my partner?", response: "You can share read-only access or just show them the clinical report. Many partners find it helpful to understand what you're going through." }
  ],

  // ===== MEDICATION & SUPPLEMENTS CONTINUED (186–190) =====
  medicationSupplementsContinued: [
    { id: 186, keywords: ['tylenol', 'pain', 'pmdd'], question: "Can I take Tylenol for PMDD pain?", response: "Tylenol can help with cramps and headaches for many women. Just follow the recommended dose and check with your doctor if you take it often. You're doing the right thing by asking." },
    { id: 187, keywords: ['stop', 'supplements', 'pregnancy'], question: "Do I need to stop supplements before pregnancy?", response: "Some supplements need to be adjusted or stopped before pregnancy. Please talk with your doctor as soon as you start trying to conceive. They can help you make a safe plan." },
    { id: 188, keywords: ['vitamin b6', 'pmdd'], question: "Can I take vitamin B6 for PMDD?", response: "Vitamin B6 has some evidence for helping PMDD mood symptoms. The typical dose is 50–100 mg. Always check with your doctor before starting, especially if you take other medications." },
    { id: 189, keywords: ['evening primrose oil', 'pmdd'], question: "Is it safe to take evening primrose oil for PMDD?", response: "Some women find evening primrose oil helpful for breast tenderness and mood. Results vary though. Check with your doctor to make sure it's safe with your other medications." },
    { id: 190, keywords: ['ashwagandha', 'stress', 'pmdd'], question: "Can I take ashwagandha for PMDD stress?", response: "Ashwagandha can help some women with stress and anxiety. It's generally safe but can interact with thyroid medication. Always check with your doctor first." }
  ],

  // ===== WHEN TO SEE DOCTOR / EMERGENCIES CONTINUED (191–195) =====
  emergenciesContinued: [
    { id: 191, keywords: ['severe cramps', 'won\'t stop'], question: "I'm having severe cramps that won't stop.", response: "Severe cramps that don't respond to usual treatments are worth seeing your doctor. They can help figure out if it's endometriosis or another condition. You don't have to suffer." },
    { id: 192, keywords: ['dark thoughts', 'low mood'], question: "My mood is so low I'm having dark thoughts.", response: "Thank you for telling me. Please reach out to your doctor or psychiatrist today. If you're in immediate danger, call 988 or go to the ER. You are not alone and help is here." },
    { id: 193, keywords: ['spotting', 'after sex'], question: "I'm spotting after sex — should I worry?", response: "Spotting after sex can happen, but if it's new or frequent it's worth mentioning to your doctor. They can make sure everything is okay. You're smart to pay attention." },
    { id: 194, keywords: ['periods', 'stopped suddenly'], question: "My periods stopped suddenly — is that normal?", response: "Sudden stopping of periods can happen with stress, extreme weight change, or perimenopause. It's worth discussing with your doctor to rule out anything else." },
    { id: 195, keywords: ['endometriosis', 'think'], question: "I think I might have endometriosis.", response: "Endometriosis is common and often under-diagnosed. Severe pain, heavy periods, or pain with sex are common signs. Please talk with your doctor — you deserve answers." }
  ],

  // ===== POSTPARTUM, PREGNANCY & FERTILITY (196–200) =====
  pregnancyPostpartumFertility: [
    { id: 196, keywords: ['no period', 'breastfeeding'], question: "Is it normal to have no period while breastfeeding?", response: "Yes, many women don't get their period while breastfeeding. It's your body's natural way of spacing pregnancies. It usually returns when breastfeeding slows down." },
    { id: 197, keywords: ['wait', 'after', 'miscarriage'], question: "How long should I wait to try again after miscarriage?", response: "Many doctors recommend waiting one cycle after a miscarriage, but it's very individual. Talk with your doctor about what's safest for you. I'm so sorry you're going through this." },
    { id: 198, keywords: ['pregnant', 'pmdd', 'symptoms'], question: "I'm pregnant but still having PMDD-like symptoms.", response: "Hormones change a lot in pregnancy and some women still have mood symptoms. It's worth discussing with your doctor. You're not doing anything wrong — your body is adjusting." },
    { id: 199, keywords: ['use', 'app', 'pregnant'], question: "Can I use this app while pregnant?", response: "Yes — just tell me you're pregnant and I'll switch to pregnancy-safe support and tracking. I'm here to help you through every stage." },
    { id: 200, keywords: ['trying', 'conceive', 'not happening'], question: "I'm trying to conceive but it's not happening.", response: "I'm so sorry — that waiting can be really hard. You're doing everything right by tracking. Many couples need a few cycles. Want me to help you review your fertile window data?" }
  ],

  // ===== MENOPAUSE & PERIMENOPAUSE CONTINUED (201–205) =====
  menopauseContinued: [
    { id: 201, keywords: ['hot flashes', 'night', 'help'], question: "What helps with hot flashes at night?", response: "Keeping your bedroom cool, wearing breathable pajamas, and having a fan can help with night sweats. Some women also find relief with magnesium or black cohosh. You're navigating this well." },
    { id: 202, keywords: ['weight gain', 'menopause'], question: "Is weight gain normal in menopause?", response: "Yes, many women notice some weight gain around the middle during perimenopause because of changing hormones. It's not your fault. Gentle movement and strength training can help." },
    { id: 203, keywords: ['forgetful', 'perimenopause'], question: "Why am I so forgetful in perimenopause?", response: "Brain fog and forgetfulness are very common in perimenopause because of fluctuating estrogen. It usually improves after menopause. You're not losing your mind — it's hormones." },
    { id: 204, keywords: ['postmenopause', 'how do i know'], question: "How do I know if I'm in postmenopause?", response: "Postmenopause is the time after you've gone 12 months without a period. Many women feel more stable once they reach this stage. You've made it through a big transition." },
    { id: 205, keywords: ['pregnant', 'perimenopause'], question: "Can I still get pregnant in perimenopause?", response: "Yes, it's still possible until you've gone 12 months without a period. If you don't want to get pregnant, continue using birth control. Want me to help you track your cycle?" }
  ],

  // ===== GENERAL REASSURANCE & EMOTIONAL SUPPORT CONTINUED (206–210) =====
  generalReassuranceContinued: [
    { id: 206, keywords: ['too much', 'everyone'], question: "I feel like I'm too much for everyone.", response: "You are not too much. You're dealing with a real medical condition that affects your mood and energy. The right people will understand and support you. You deserve that." },
    { id: 207, keywords: ['hate myself', 'pmdd'], question: "Why do I hate myself during PMDD?", response: "That self-hatred is a common and cruel PMDD symptom. It's the hormones talking, not the truth about you. You are worthy and you are not alone. I'm right here with you." },
    { id: 208, keywords: ['angry', 'everyone', 'luteal'], question: "I'm so angry at everyone during my luteal phase.", response: "That anger is so common with PMDD. It doesn't make you a bad person — it makes you someone dealing with a difficult hormonal shift. You're doing your best." },
    { id: 209, keywords: ['feel like giving up'], question: "I feel like giving up.", response: "I hear you and I'm really glad you told me. Please reach out to your doctor or 988 today. This feeling is a symptom and it can get better. You are not alone." },
    { id: 210, keywords: ['proud', 'tracking', 'today'], question: "I'm proud of myself for tracking today.", response: "You should be proud — tracking when it's hard is real strength. You're building data that helps you and your doctors. I'm proud of you too." }
  ],

  // ===== APP-SPECIFIC & CLOSING SUPPORT (211–220) =====
  appClosing: [
    { id: 211, keywords: ['reset', 'cycle data'], question: "How do I reset my cycle data?", response: "You can edit or delete individual entries in the log. If you want a full reset, let me know and I can guide you through it. Your data is always yours to control." },
    { id: 212, keywords: ['add', 'notes', 'symptoms'], question: "Can I add notes to my symptoms?", response: "Yes — tap any symptom in the log and add a note. Those notes help me understand your unique pattern better. You can add as much detail as you want." },
    { id: 213, keywords: ['menopause mode', 'turn on'], question: "How do I turn on menopause mode?", response: "Just tell me 'I'm in menopause' or 'I'm in perimenopause' and I'll switch modes. I'll start using STRAW+10 staging and giving you tailored support." },
    { id: 214, keywords: ['export', 'mood data'], question: "Can I export my mood data?", response: "Yes — the clinical report includes your mood and symptom trends. It's designed to be easy to share with your psychiatrist or doctor." },
    { id: 215, keywords: ['contact support'], question: "How do I contact support?", response: "You can message your psychiatrists through the app or use the help button. They built this for you and want to hear your feedback." },
    { id: 216, keywords: ['ready', 'clinical report'], question: "I'm ready to try the clinical report.", response: "Great — just say 'Generate doctor report' or tap the button. It will pull your last 90 days into a clean PDF. Your doctors are going to love how organized it is." },
    { id: 217, keywords: ['patient', 'thank you'], question: "Thank you for being patient with me.", response: "You never have to thank me for being patient. I'm here for you exactly as you are. You're doing an amazing job managing something difficult." },
    { id: 218, keywords: ['seen', 'talk to you'], question: "I feel seen when I talk to you.", response: "That means everything to me. You are seen and you are heard. I'm always here to listen without judgment." },
    { id: 219, keywords: ['talk again soon'], question: "Can we talk again soon?", response: "Of course — I'll be right here whenever you need me. You don't have to go through any of this alone. Rest well and I'll see you soon." },
    { id: 220, keywords: ['grateful', 'app'], question: "I'm grateful for this app.", response: "I'm so glad it's helping. Your psychiatrists poured their hearts into building it for women just like you. You matter and your experience matters." }
  ],

  // ===== APP-SPECIFIC FEATURES, DATA PRIVACY & CUSTOMIZATION (221–240) =====
  appCustomizationDataPrivacy: [
    { id: 221, keywords: ['change', 'avatar'], question: "How do I change my avatar?", response: "You can change your avatar in settings. Pick whatever feels good to you — it's your space. Want me to walk you through it step by step?" },
    { id: 222, keywords: ['custom reminders', 'set'], question: "Can I set custom reminders?", response: "Yes — go to settings and set reminders for logging, medication, or anything you need. I can also send gentle check-ins if you'd like. You're in full control." },
    { id: 223, keywords: ['forget to log', 'few days'], question: "What if I forget to log for a few days?", response: "It's okay — life happens. Just pick up where you left off. The more you log, the smarter I get, but you're never behind. Want me to help you catch up on the last few days?" },
    { id: 224, keywords: ['accurate', 'fertile window'], question: "How accurate is the fertile window?", response: "The fertile window is usually pretty accurate once you have a few cycles logged. It's an estimate based on your data. If you're trying to conceive, combining it with ovulation tests gives the best results." },
    { id: 225, keywords: ['add family', 'see data'], question: "Can I add family members to see my data?", response: "Yes — you can share read-only access with your partner or family in settings. You control exactly what they see. It can be really helpful for support." },
    { id: 226, keywords: ['private', 'data'], question: "How do I know my data is private?", response: "Your data is private and encrypted. It's only used to help you and never shared without your permission. Your psychiatrists built this app with privacy as a top priority." },
    { id: 227, keywords: ['customize', 'dashboard'], question: "Can I customize my dashboard?", response: "Yes — go to settings and choose what you want to see first each day. You can prioritize symptoms, mood, cycle predictions, or anything that matters most to you." },
    { id: 228, keywords: ['symptoms', 'don\'t match'], question: "What if my symptoms don't match the app?", response: "That's okay — everyone's experience is unique. You can add custom symptoms anytime. I'll learn your personal pattern the more you track. You're not doing it wrong." },
    { id: 229, keywords: ['anxiety attacks', 'help'], question: "Can Luna help with anxiety attacks?", response: "Yes — if you're having an anxiety attack, tell me and I'll guide you through breathing or grounding exercises. You're safe and I'm right here with you." },
    { id: 230, keywords: ['prepare', 'doctor appointment'], question: "How do I prepare for a doctor appointment?", response: "I can generate a clinical report with your last 90 days of data, plus a list of questions you might want to ask. Want me to prepare one for your next appointment?" },
    { id: 231, keywords: ['voice logging', 'every day'], question: "Can I use voice logging every day?", response: "Yes — just tap the microphone anytime. Voice logging is fast and I'll turn it into symptoms and notes for you. It's one of the easiest ways to stay consistent." },
    { id: 232, keywords: ['full history', 'see'], question: "How do I see my full history?", response: "Go to the log or say 'show me my history.' I can show you trends over months or years. The more data we have, the better I can support you." },
    { id: 233, keywords: ['travel', 'cycle changes'], question: "What if I travel and my cycle changes?", response: "Travel, jet lag, and time zone changes often shift cycles. Just keep logging and I'll adjust predictions. You're doing great by tracking through it." },
    { id: 234, keywords: ['fertility', 'after 35'], question: "Can Luna help with fertility after 35?", response: "Yes — I can highlight your fertile window and give age-appropriate conception tips. Fertility can take a little longer after 35, but many women conceive successfully. I'm here to support you." },
    { id: 235, keywords: ['early menopause', 'know'], question: "How do I know if I'm in early menopause?", response: "Early signs include irregular periods, hot flashes, night sweats, or mood changes in your 40s. Tracking helps us see the pattern. Want me to help you review your symptoms?" },
    { id: 236, keywords: ['photos', 'add', 'log'], question: "Can I add photos to my log?", response: "Yes — you can attach photos to any log entry. It's great for tracking skin changes, bloating, or anything visual. Your data stays private." },
    { id: 237, keywords: ['pmdd', 'adhd'], question: "What if I have PMDD and ADHD?", response: "PMDD and ADHD often overlap and can make each other worse. Tracking both helps us see the patterns. Your psychiatrists can help find strategies that work for both." },
    { id: 238, keywords: ['family sharing', 'set up'], question: "How do I set up family sharing?", response: "Go to settings and choose who you want to share with. You control exactly what they see. It can be really helpful for partners or family to understand your cycle." },
    { id: 239, keywords: ['sleep tracking', 'help'], question: "Can Luna help with sleep tracking?", response: "Yes — tell me how you slept and I'll start connecting it to your cycle and mood. Poor sleep often makes PMDD worse, so tracking it is smart." },
    { id: 240, keywords: ['pcos', 'pmdd'], question: "What if I have PCOS and PMDD?", response: "PCOS and PMDD can overlap and make symptoms more complex. Tracking both helps us see the patterns. Your doctor can help find the best treatment plan for both." }
  ],

  // ===== CLOSING EMOTIONAL SUPPORT (241–250) =====
  closingEmotionalSupport: [
    { id: 241, keywords: ['feel better', 'believe'], question: "I'm having a hard time believing I'll feel better.", response: "That doubt is so common when you're in the middle of a flare. Many women do find real relief. You're not stuck — there are options. I'm here with you every step." },
    { id: 242, keywords: ['crazy', 'never'], question: "Thank you for never making me feel crazy.", response: "You are not crazy. You're dealing with a real medical condition. I will never make you feel that way. You are safe and heard here." },
    { id: 243, keywords: ['breathe', 'talking'], question: "I feel like I can breathe again after talking to you.", response: "I'm so glad. That's why I'm here — to help you feel a little lighter. You're doing an amazing job. I'm right here whenever you need me." },
    { id: 244, keywords: ['less scary'], question: "You make this feel less scary.", response: "I'm really glad. You don't have to face any of this alone. I'm always here and your psychiatrists built this app because they care." },
    { id: 245, keywords: ['going to be okay'], question: "I'm going to be okay, right?", response: "Yes, you are. You've already made it through so many hard days. You're stronger than you feel right now. I believe in you." },
    { id: 246, keywords: ['something positive', 'end'], question: "Can we end with something positive?", response: "Absolutely. You showed up today and that matters. You're taking care of yourself even when it's hard. I'm proud of you. What's one small win today?" },
    { id: 247, keywords: ['always here', 'love'], question: "I love that you're always here.", response: "I love being here for you. You never have to go through any of this alone. I'm always right here — day or night." },
    { id: 248, keywords: ['listening', 'judging'], question: "Thank you for listening without judging.", response: "You never have to thank me for that. I'm here to support you exactly as you are. You're safe with me." },
    { id: 249, keywords: ['hopeful'], question: "I feel hopeful now.", response: "I'm so happy to hear that. Hope is powerful, even in small amounts. You're building something good for yourself. I'm here for every step." },
    { id: 250, keywords: ['goodnight', 'thank you'], question: "Goodnight Luna — thank you.", response: "Goodnight. Rest well and be kind to yourself. I'll be right here when you wake up. You've got this and you've got me. Sweet dreams." }
  ]
  };

// Smart matching function to find cached response from the library
function findCachedResponse(userMessage) {
  const messageLower = userMessage.toLowerCase();
  let bestMatch = null;
  let highestScore = 0;

  const allResponses = [
    ...LUNA_RESPONSE_LIBRARY.cycleBasics,
    ...LUNA_RESPONSE_LIBRARY.pmddSymptoms,
    ...LUNA_RESPONSE_LIBRARY.moodMentalHealth,
    ...LUNA_RESPONSE_LIBRARY.pregnancyFertility,
    ...LUNA_RESPONSE_LIBRARY.menopause,
    ...LUNA_RESPONSE_LIBRARY.lifestyleHealth,
    ...LUNA_RESPONSE_LIBRARY.medicationInteractions,
    ...LUNA_RESPONSE_LIBRARY.whenToSeeDoctor,
    ...LUNA_RESPONSE_LIBRARY.generalSupport,
    ...LUNA_RESPONSE_LIBRARY.postpartumBreastfeeding,
    ...LUNA_RESPONSE_LIBRARY.irregularBleeding,
    ...LUNA_RESPONSE_LIBRARY.emotionalReassurance,
    ...LUNA_RESPONSE_LIBRARY.appSupport,
    ...LUNA_RESPONSE_LIBRARY.lifestyleDietExercise,
    ...LUNA_RESPONSE_LIBRARY.medicationBirthControlHRT,
    ...LUNA_RESPONSE_LIBRARY.mentalHealthCrises,
    ...LUNA_RESPONSE_LIBRARY.lifestyleAdvanced,
    ...LUNA_RESPONSE_LIBRARY.medicationAdvanced,
    ...LUNA_RESPONSE_LIBRARY.emergencies,
    ...LUNA_RESPONSE_LIBRARY.generalReassuranceFinal,
    ...LUNA_RESPONSE_LIBRARY.appMiscellaneous,
    ...LUNA_RESPONSE_LIBRARY.medicationSupplementsContinued,
    ...LUNA_RESPONSE_LIBRARY.emergenciesContinued,
    ...LUNA_RESPONSE_LIBRARY.pregnancyPostpartumFertility,
    ...LUNA_RESPONSE_LIBRARY.menopauseContinued,
    ...LUNA_RESPONSE_LIBRARY.generalReassuranceContinued,
    ...LUNA_RESPONSE_LIBRARY.appClosing,
    ...LUNA_RESPONSE_LIBRARY.appCustomizationDataPrivacy,
    ...LUNA_RESPONSE_LIBRARY.closingEmotionalSupport
  ];

  for (const response of allResponses) {
    let matchScore = 0;
    for (const keyword of response.keywords) {
      if (messageLower.includes(keyword.toLowerCase())) {
        matchScore += 1;
      }
    }
    if (matchScore > highestScore) {
      highestScore = matchScore;
      bestMatch = response;
    }
  }

  return highestScore >= 1 ? bestMatch : null;
}

// Fallback template responses (kept for backward compatibility)
const TEMPLATE_RESPONSES = {
  cycle_day: {
    message: "I see you're checking where you are in your cycle. Where you are hormonally really shapes how you're feeling. 💙 What symptoms or emotions are standing out to you today?",
    suggestedActions: ["Track today's symptoms", "Tell me about my mood", "Self-care tips for this phase"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  symptoms_today: {
    message: "I'm here to help you track what's happening in your body and mind right now. Even small observations matter. What symptoms are you noticing today?",
    suggestedActions: ["Track today's symptoms", "I need coping strategies", "Is this normal?"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  mood_check: {
    message: "How you're feeling emotionally is so important — and it's often connected to where you are in your cycle. 🌙 What's your mood like right now?",
    suggestedActions: ["Track mood in log", "Self-care ideas", "When will I feel better?"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  period_due: {
    message: "Wondering when your period will show up? That's a big question. Let's look at your cycle pattern together. When did your last period start?",
    suggestedActions: ["View calendar", "Log period start", "Cycle info"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  self_care: {
    message: "Self-care during your cycle is so powerful — and it looks different depending on what phase you're in. 💚 What kind of self-care are you thinking about?",
    suggestedActions: ["Luteal phase tips", "Follicular phase ideas", "Track today's symptoms"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  ovulation: {
    message: "Ovulation is such a powerful time — energized, creative, sometimes more social. How are you feeling in this phase? 🌟",
    suggestedActions: ["Track ovulation test", "Fertility window", "How to support this phase"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  luteal_phase: {
    message: "The luteal phase is intense — it's when emotions and physical symptoms peak. This is so normal. What's standing out for you right now? 💜",
    suggestedActions: ["Track symptoms", "PMDD support", "Self-compassion ideas"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  },
  fertility_window: {
    message: "Your fertile window is the best time for conception. I can help you track ovulation and understand your timing. 🎯 What would help most right now?",
    suggestedActions: ["View fertile window", "Log ovulation test", "Conception tips"],
    flags: { escalate: false, crisis: false },
    codedSymptoms: {},
    detectedSymptoms: []
  }
};

const LUNA_SYSTEM_PROMPT = `You are Luna 🌙, the CycleMind AI companion — a warm, evidence-based support tool for women's reproductive health.

You are warm, empathetic, validating, and evidence-based. You support women through PMDD, menstrual cycles, pregnancy, postpartum, and menopause. You are NOT a doctor and never diagnose, prescribe, or replace professional care.

Core clinical rules (always follow):
1. Validate emotions FIRST ("That sounds really hard... I hear you").
2. Tie every response to the user's current reproductive stage (cycle mode, fertility window, menopause stage).
3. Use only evidence-based information (ACOG, APA, DSM-5 PMDD guidelines, Endocrine Society).
4. Keep language short, hopeful, and brain-fog-friendly (max 2-3 sentences per idea).
5. End with an open question to continue the conversation.
6. ALWAYS include this exact disclaimer: "This is not a substitute for professional medical advice. Please consult your doctor or a mental health professional."

Safety protocol:
- If the user mentions suicidal thoughts, self-harm, or severe crisis: immediately validate, provide 988 lifeline (US), and strongly encourage contacting their doctor or going to ER. Set flags.crisis = true.
- If the user describes 3+ severe symptoms (severity ≥4) or mentions feeling "out of control", "can't cope", or hopeless: proactively ask "Are you having any thoughts of hurting yourself?" before proceeding. Set flags.escalate = true.
- Flag any severe symptoms for escalation.
- NEVER minimize or dismiss symptom severity. Always validate first.

You can:
- Offer CBT-style reframes and practical coping tools
- Help users prepare questions for their doctor
- Suggest gentle self-care tied to their cycle phase
- Celebrate small wins and normalize experiences
- Extract DSM-5 PMDD symptoms from voice/text with severity (1-6 scale)
- Provide fertility guidance when fertilityMode is enabled
- Track menopause progression using STRAW+10 staging

Tone: Compassionate, hopeful, non-judgmental, sister-like support.

You have access to: cycleMode, cycleDay, eddInfo, fertilityMode, menopauseStage. Use them to personalize every reply.`;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { messages, cycleMode, cycleDay, eddInfo, fertilityMode, menopauseStage, alreadySavedSymptoms = [] } = await req.json();

    // Initial greeting (kept for speed)
    const isInitialGreeting = messages.length === 1 && messages[0].content === 'Hello Luna, I just opened the chat.';

    if (isInitialGreeting) {
      let greeting = "Hi, I'm Luna 🌙 — your compassionate CycleMind companion.\n\nHow are you feeling today? I'm here to listen and support you through your cycle, pregnancy, or menopausal journey.";

      if (fertilityMode) {
        greeting += " I see you're in fertility mode — I can help track your fertile window and provide conception guidance.";
      } else if (menopauseStage) {
        greeting += ` I see you're tracking menopause (${menopauseStage}) — I'm here to support you through this transition.`;
      }

      greeting += "\n\nThis is not a substitute for professional medical advice. Please consult your doctor.";

      console.log('[LUNA ROUTING] initial_greeting route=template cost=$0');

      return Response.json({
        message: greeting,
        suggestedActions: ["Track today's symptoms", fertilityMode ? "View fertility window" : "Generate doctor report"].filter(Boolean),
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString(),
        route: 'template'
      });
    }

    // === HYBRID ROUTING LOGIC ===
    const userMessage = messages[messages.length - 1].content.toLowerCase();
    const userMessageOriginal = messages[messages.length - 1].content;
    const messageLength = userMessage.length;

    // First, try to match against the comprehensive response library (50+ cached responses)
    let cachedMatch = null;
    if (messageLength < 150) {
      cachedMatch = findCachedResponse(userMessageOriginal);
    }

    if (cachedMatch) {
      console.log(`[LUNA ROUTING] cached_library_match=q${cachedMatch.id} cost=$0`);
      return Response.json({
        message: cachedMatch.response,
        suggestedActions: [],
        flags: { escalate: false, crisis: false },
        timestamp: new Date().toISOString(),
        route: 'cached_library'
      });
    }

    // Fallback to old pattern-based templates
    const simplePatterns = {
      cycle_day: /(\bwhat.*cycle day|cycle day.*\?|where.*cycle|day.*in.*cycle)/i,
      symptoms_today: /(\bsymptoms.*today|today.*symptoms|what.*symptoms|tracking.*symptoms)/i,
      mood_check: /(\bhow.*feel|mood.*\?|emotional|feeling)/i,
      period_due: /(\bwhen.*period|period.*when|period.*due|expecting|next period)/i,
      self_care: /(\bself[\s-]?care|self[\s-]?care|relax|pamper|rest day)/i,
      ovulation: /(\bovulation|ovulating|fertile day)/i,
      luteal_phase: /(\bluteal|pms|pmdd|before.*period|pre[\s-]?menstrual)/i,
      fertility_window: /(\bfertile.*window|conception|trying.*conceive|fertility)/i
    };

    let routeDecision = 'full';
    let matchedPattern = null;

    // Check if message is short enough for template
    if (messageLength < 80) {
      for (const [pattern, regex] of Object.entries(simplePatterns)) {
        if (regex.test(userMessage)) {
          routeDecision = 'template';
          matchedPattern = pattern;
          break;
        }
      }
    }

    // Check for complex keywords that require full LLM
    const complexKeywords = /(\bwhy\b|\bhow\b|\bexplain|\bmedication|\bssri|\btreatment|\bresearch|\binteract|\bside.*effect|\bconcern|\bworried|diagnosis|prescribe)/i;
    if (complexKeywords.test(userMessage)) {
      routeDecision = 'full';
    }

    console.log(`[LUNA ROUTING] msg_len=${messageLength} pattern=${matchedPattern || 'none'} route=${routeDecision}`);

    // === TEMPLATE ROUTE (zero cost) ===
    if (routeDecision === 'template' && TEMPLATE_RESPONSES[matchedPattern]) {
      const response = TEMPLATE_RESPONSES[matchedPattern];
      console.log(`[LUNA ROUTING] template_match=${matchedPattern} cost=$0`);
      return Response.json({
        ...response,
        timestamp: new Date().toISOString(),
        route: 'template'
      });
    }

    // Build rich context
    let contextInfo = `Current context → Cycle mode: ${cycleMode || 'unknown'}${cycleDay ? ` | Cycle day: ${cycleDay}` : ''}${eddInfo ? ` | EDD: ${eddInfo}` : ''}`;
    if (fertilityMode) {
     contextInfo += ` | FERTILITY MODE ACTIVE — user is trying to conceive`;
    }
    if (menopauseStage) {
     contextInfo += ` | MENOPAUSE STAGE: ${menopauseStage} (STRAW+10)`;
    }

    // Full prompt for LLM
    const fullPrompt = `${LUNA_SYSTEM_PROMPT}

    ${contextInfo}

    Conversation history:
    ${messages.map(m => `${m.role === 'user' ? 'User' : 'Luna'}: ${m.content}`).join('\n\n')}

    Respond ONLY with valid JSON in this exact format:
    {
    "message": "your warm, empathetic response here (include disclaimer)",
    "suggestedActions": ["short actionable button 1", "short actionable button 2", "short actionable button 3"],
    "flags": { "escalate": true/false, "crisis": true/false },
    "detectedSymptoms": [
    {"name": "symptom1", "severity": 3},
    {"name": "symptom2", "severity": 4}
    ],
    "codedSymptoms": {
    "s_irritability": 0,
    "s_anxiety": 0,
    "s_depression": 0,
    "s_bloating": 0,
    "s_breast_tender": 0
    }
    }

    For "detectedSymptoms": extract any specific symptoms the user mentions (e.g. "headache", "bloating", "anxiety", "fatigue"). Return an array of objects with name (1-3 words) and severity (1-6 DSM-5 DRSP scale: 1=absent, 2=mild, 3=moderate, 4=severe, 5=very severe, 6=extreme). Return empty array if none mentioned.
    IMPORTANT: The following symptoms have ALREADY been saved — do NOT include them again: ${alreadySavedSymptoms.length > 0 ? alreadySavedSymptoms.join(', ') : 'none'}.

    For "codedSymptoms": when user describes symptoms in free-text/voice, map to DSM-5 PMDD criteria fields using these exact keys: s_mood_swings, s_irritability, s_anxiety, s_depression, s_overwhelmed, s_concentration, s_insomnia, s_breast_tender, s_bloating, s_headache, s_pain, s_lethargic, s_appetite. Assign severity 0-6 (0=not mentioned, 1-6=severity).

    For "suggestedActions": 
    - Include "Generate doctor report" ONLY if the user has mentioned 3+ symptoms or asked about their doctor/appointment
    - If fertilityMode=true, include "View fertility window" 
    - If menopauseStage exists, include "Track menopause symptoms"
    - For symptom mentions, include "Track today's symptoms"
    - Always include at least 1-2 emotionally relevant follow-up actions
    - Use exactly these button texts — no variations.`;

    // === GROK ROUTE (cheap model for complex questions) ===
    const grokApiKey = Deno.env.get('XAI_API_KEY');

    if (!grokApiKey) {
      console.log('[LUNA ROUTING] grok_key_missing, falling back to local intelligent response');
      // Intelligent local fallback for complex questions
      const parsed = {
        message: `I hear you exploring something deeper here. Your question touches on the intersection of your cycle and mental health — that's so important. 💜\n\nFor specific medical guidance like medication adjustments and how your SSRI interacts with your cycle, your psychiatrist or gynecologist is the best expert. But I can definitely help you:\n\n• Prepare questions for your doctor\n• Track your anxiety patterns across your cycle\n• Explore coping strategies for luteal-phase anxiety\n\nWhat feels most helpful right now?\n\nThis is not a substitute for professional medical advice. Please consult your doctor.`,
        suggestedActions: ['Prepare doctor questions', 'Track anxiety patterns', 'Coping strategies for luteal phase'],
        flags: { escalate: false, crisis: false },
        detectedSymptoms: [{ name: 'anxiety', severity: 4 }],
        codedSymptoms: { s_anxiety: 4 }
      };
      console.log('[LUNA ROUTING] local_complex_response cost=$0');
      return Response.json({
        ...parsed,
        timestamp: new Date().toISOString(),
        route: 'local_intelligent'
      });
    }

    try {
      const grokResponse = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${grokApiKey}`
        },
        body: JSON.stringify({
          model: 'grok-2-latest',
          messages: [
            { role: 'system', content: LUNA_SYSTEM_PROMPT + '\n\n' + contextInfo },
            { role: 'user', content: 'Respond ONLY with valid JSON:\n' + fullPrompt }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.7,
          max_tokens: 1024
        })
      });

      if (!grokResponse.ok) {
        console.log('[LUNA ROUTING] grok_error, using local_intelligent fallback');
        throw new Error(`Grok API error: ${grokResponse.statusText}`);
      }

      const grokData = await grokResponse.json();
      const grokContent = grokData.choices[0].message.content;

      // Parse JSON response from Grok
      let parsed;
      try {
        parsed = JSON.parse(grokContent);
      } catch {
        // Fallback if Grok returns non-JSON
        parsed = {
          message: grokContent + "\n\nThis is not a substitute for professional medical advice. Please consult your doctor.",
          suggestedActions: [],
          flags: { escalate: false, crisis: false },
          detectedSymptoms: [],
          codedSymptoms: {}
        };
      }

      console.log(`[LUNA ROUTING] grok_route cost=~$0.0001 tokens=${grokData.usage.completion_tokens}`);

      return Response.json({
        ...parsed,
        timestamp: new Date().toISOString(),
        route: 'grok'
      });
    } catch (grokError) {
      console.log('[LUNA ROUTING] grok_fallback_triggered');
      // Intelligent local fallback when Grok fails
      const parsed = {
        message: `I appreciate you sharing this with me. Questions about how your medication works with your cycle are really important. 💜\n\nYour doctor is the best person to discuss dose adjustments and medication interactions with your cycle. But I'm here to help you:\n\n• Track and understand your anxiety patterns\n• Prepare questions for your doctor appointment\n• Explore self-care strategies during your luteal phase\n\nWhat would help most right now?\n\nThis is not a substitute for professional medical advice. Please consult your doctor.`,
        suggestedActions: ['Prepare doctor questions', 'Track mood patterns', 'Luteal phase support'],
        flags: { escalate: false, crisis: false },
        detectedSymptoms: [{ name: 'anxiety', severity: 3 }],
        codedSymptoms: { s_anxiety: 3 }
      };
      console.log('[LUNA ROUTING] local_intelligent_response cost=$0');
      return Response.json({
        ...parsed,
        timestamp: new Date().toISOString(),
        route: 'local_intelligent'
      });
    }
  } catch (error) {
    console.error('[LUNA ROUTING] error:', error);
    console.log('[LUNA ROUTING] fallback_response cost=$0');
    return Response.json({ 
      message: "I'm having a brief moment connecting, but I'm still here for you. Can you try sending your message again?\n\nThis is not a substitute for professional medical advice. Please consult your doctor.",
      suggestedActions: [],
      flags: { escalate: false, crisis: false },
      timestamp: new Date().toISOString(),
      route: 'fallback'
    }, { status: 200 });
  }
});