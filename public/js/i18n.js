/* ============================================================
 * next — lightweight i18n (English / Bengali / Hindi)
 * Zero dependencies. Exposes window.NextI18n.
 *
 * Usage:
 *   NextI18n.t('Continue')            -> translated string for current lang
 *   NextI18n.setLang('bn')            -> switch language (persisted)
 *   NextI18n.apply()                  -> translate all [data-i18n] nodes
 *   document.addEventListener('next:langchange', fn)
 * ============================================================ */
(function () {
  'use strict';

  var STORAGE_KEY = 'next_lang';
  var SUPPORTED = ['en', 'bn', 'hi'];

  /* ---------- Translation dictionary ----------
   * Keyed by the English source string. Pure numeric / currency
   * options (e.g. "₹10", "18–25", "100+") are intentionally omitted
   * and fall back to the original text. */
  var DICT = {
    bn: {
      /* hero */
      '2-minute survey · Help shape your city\u2019s delivery': '২ মিনিটের সমীক্ষা · আপনার শহরের ডেলিভারি গড়ে তুলুন',
      'What do you need': 'আপনার এরপর কী',
      'next': 'next',
      '?': ' দরকার?',
      'We\u2019re building a fast local delivery app for': 'আমরা তৈরি করছি একটি দ্রুত স্থানীয় ডেলিভারি অ্যাপ',
      'groceries, daily essentials and more, delivered from shops near you. Your answers decide if & how we launch.':
        '— মুদিখানা, প্রতিদিনের জিনিসপত্র এবং আরও অনেক কিছু, আপনার কাছের দোকান থেকে। আমরা কীভাবে চালু করব তা আপনার উত্তরই ঠিক করবে।',
      'Takes ~2 minutes': 'প্রায় ২ মিনিট সময় লাগে',
      '100% anonymous (unless you join the waitlist)': '১০০% নাম-গোপন (ওয়েটলিস্টে যোগ না দিলে)',
      'Works on any device': 'যেকোনো ডিভাইসে চলে',
      'Start the survey': 'সমীক্ষা শুরু করুন',
      '\uD83C\uDF81 Early users get free delivery for a week':
        '\uD83C\uDF81 প্রথম ব্যবহারকারীরা এক সপ্তাহ বিনামূল্যে ডেলিভারি পাবেন',

      /* footer */
      'Fast local delivery for 721401': '721401-এর জন্য দ্রুত স্থানীয় ডেলিভারি',
      'Admin dashboard': 'অ্যাডমিন ড্যাশবোর্ড',
      'Made for the people of our city. What do you need next?':
        'আমাদের শহরের মানুষের জন্য তৈরি। আপনার এরপর কী দরকার?',

      /* chrome buttons */
      'Continue': 'এগিয়ে যান',
      'Submit survey': 'সমীক্ষা জমা দিন',
      '\u2190 Back': '\u2190 পিছনে',
      'Back': 'পিছনে',
      'optional': 'ঐচ্ছিক',
      'Sending\u2026': 'পাঠানো হচ্ছে\u2026',
      'Submit another response': 'আরেকটি উত্তর জমা দিন',
      'Back to home': 'হোমে ফিরুন',

      /* cheers */
      'Let\u2019s go! \uD83D\uDE80': 'চলুন শুরু করি! \uD83D\uDE80',
      'Nice start! \uD83D\uDCAA': 'দারুণ শুরু! \uD83D\uDCAA',
      'You\u2019re cruising \uD83C\uDF1F': 'আপনি এগিয়ে চলেছেন \uD83C\uDF1F',
      'Great answers! \uD83D\uDC4F': 'দারুণ উত্তর! \uD83D\uDC4F',
      'Almost there \uD83C\uDFAF': 'প্রায় শেষ \uD83C\uDFAF',
      'Last step! \uD83C\uDFC1': 'শেষ ধাপ! \uD83C\uDFC1',
      'min left': 'মিনিট বাকি',
      's left': 'সেকেন্ড বাকি',

      /* role step */
      'Welcome to next': 'next-এ স্বাগতম',
      'First, who are you?': 'প্রথমে বলুন, আপনি কে?',
      'We\u2019ll ask a few questions made just for you.': 'আমরা শুধু আপনার জন্য কিছু প্রশ্ন করব।',
      'I want to order': 'আমি অর্ডার করতে চাই',
      'A shopper / customer': 'একজন ক্রেতা / গ্রাহক',
      'I want to deliver': 'আমি ডেলিভারি করতে চাই',
      'A delivery rider': 'একজন ডেলিভারি রাইডার',
      'I own a shop': 'আমার একটি দোকান আছে',
      'A merchant / seller': 'একজন বিক্রেতা / দোকানদার',
      'Just tap your answer \u2014 we\u2019ll take you straight to the next step \u2728':
        'শুধু আপনার উত্তরে ট্যাপ করুন \u2014 আমরা সরাসরি পরের ধাপে নিয়ে যাব \u2728',

      /* profile */
      'About you': 'আপনার সম্পর্কে',
      'Tell us where you are': 'আপনি কোথায় আছেন বলুন',
      'This helps us know which neighbourhoods to launch in first.':
        'এটি আমাদের জানতে সাহায্য করে প্রথমে কোন এলাকায় চালু করব।',
      'Your name': 'আপনার নাম',
      'Your area / locality': 'আপনার এলাকা / অঞ্চল',
      'Pincode': 'পিনকোড',
      'Your age group': 'আপনার বয়সের সীমা',
      'Under 18': '১৮-এর কম',
      '50+': '৫০+',

      /* customer habits */
      'Your habits': 'আপনার অভ্যাস',
      'How do you shop today?': 'আপনি এখন কীভাবে কেনাকাটা করেন?',
      'There are no wrong answers \u2014 we just want the real picture.':
        'কোনো উত্তর ভুল নয় \u2014 আমরা শুধু আসল ছবিটা জানতে চাই।',
      'How often do you buy groceries / daily essentials?':
        'আপনি কত ঘন ঘন মুদিখানা / প্রতিদিনের জিনিস কেনেন?',
      'Daily': 'প্রতিদিন',
      'Few times a week': 'সপ্তাহে কয়েকবার',
      'Weekly': 'সাপ্তাহিক',
      'Occasionally': 'মাঝে মাঝে',
      'How do you usually get them now?': 'এখন সাধারণত কীভাবে সেগুলি পান?',
      'Choose all that apply.': 'যা যা প্রযোজ্য সব বেছে নিন।',
      '\uD83D\uDEB6 Go to a local shop myself': '\uD83D\uDEB6 নিজে স্থানীয় দোকানে যাই',
      '\uD83D\uDCDE Phone the shop / WhatsApp order': '\uD83D\uDCDE দোকানে ফোন / WhatsApp-এ অর্ডার',
      '\uD83D\uDEF5 Ask a family member': '\uD83D\uDEF5 পরিবারের কাউকে বলি',
      '\uD83D\uDCE6 Other delivery apps': '\uD83D\uDCE6 অন্য ডেলিভারি অ্যাপ',
      '\uD83C\uDFEA Big supermarket': '\uD83C\uDFEA বড় সুপারমার্কেট',
      'What would you most want delivered fast?': 'কোন জিনিস দ্রুত ডেলিভারি পেতে সবচেয়ে চান?',
      'Pick everything you would use.': 'আপনি যা যা ব্যবহার করবেন সব বেছে নিন।',
      '\uD83E\uDD66 Vegetables & fruit': '\uD83E\uDD66 শাকসবজি ও ফল',
      '\uD83D\uDED2 Groceries & staples': '\uD83D\uDED2 মুদিখানা ও নিত্যপণ্য',
      '\uD83E\uDD5B Milk & dairy': '\uD83E\uDD5B দুধ ও দুগ্ধজাত',
      '\uD83D\uDC8A Medicines': '\uD83D\uDC8A ওষুধ',
      '\uD83C\uDF7F Snacks & drinks': '\uD83C\uDF7F স্ন্যাকস ও পানীয়',
      '\uD83E\uDDF4 Personal care': '\uD83E\uDDF4 ব্যক্তিগত যত্ন',
      '\uD83E\uDDF9 Household items': '\uD83E\uDDF9 ঘরোয়া জিনিস',
      '\uD83C\uDF71 Cooked food / meals': '\uD83C\uDF71 রান্না করা খাবার',
      '\uD83D\uDCD2 Stationery': '\uD83D\uDCD2 স্টেশনারি',

      /* customer demand */
      'The big question': 'বড় প্রশ্ন',
      'Would you actually use next?': 'আপনি কি সত্যিই next ব্যবহার করবেন?',
      'Be honest \u2014 this is the answer that matters most.':
        'সৎ থাকুন \u2014 এই উত্তরটাই সবচেয়ে গুরুত্বপূর্ণ।',
      'Biggest frustration with shopping today?': 'এখন কেনাকাটায় সবচেয়ে বড় অসুবিধা কী?',
      'Optional \u2014 choose any that apply.': 'ঐচ্ছিক \u2014 যা প্রযোজ্য বেছে নিন।',
      '\u23F3 Wastes my time': '\u23F3 আমার সময় নষ্ট হয়',
      '\uD83D\uDE97 Travel / distance': '\uD83D\uDE97 যাতায়াত / দূরত্ব',
      '\u274C Items out of stock': '\u274C জিনিস স্টকে থাকে না',
      '\uD83D\uDCB8 Prices too high': '\uD83D\uDCB8 দাম অনেক বেশি',
      '\uD83C\uDF27\uFE0F Weather / going out': '\uD83C\uDF27\uFE0F আবহাওয়া / বাইরে যাওয়া',
      '\uD83D\uDD57 Shop timings': '\uD83D\uDD57 দোকানের সময়',
      'If next delivered to your door in 15\u201330 minutes, would you use it?':
        'next যদি ১৫\u201330 মিনিটে আপনার দরজায় পৌঁছে দেয়, ব্যবহার করবেন?',
      '\uD83E\uDD29 Yes, definitely': '\uD83E\uDD29 হ্যাঁ, নিশ্চিতভাবে',
      '\uD83D\uDE42 Probably yes': '\uD83D\uDE42 সম্ভবত হ্যাঁ',
      '\uD83E\uDD14 Maybe / not sure': '\uD83E\uDD14 হয়তো / নিশ্চিত নই',
      '\uD83D\uDE45 Probably not': '\uD83D\uDE45 সম্ভবত না',
      '\uD83D\uDEAB No': '\uD83D\uDEAB না',
      'What delivery time feels good to you?': 'কোন ডেলিভারি সময় আপনার ভালো লাগে?',
      'Under 15 min': '১৫ মিনিটের কম',
      '15\u201330 min': '১৫\u201330 মিনিট',
      '30\u201345 min': '৩০\u201345 মিনিট',
      'Up to 1 hour is fine': '১ ঘণ্টা পর্যন্ত ঠিক আছে',

      /* customer money */
      'Making it work': 'এটি কার্যকর করা',
      'A few money questions': 'কয়েকটি টাকা সংক্রান্ত প্রশ্ন',
      'This helps us price delivery fairly so next can survive in our city.':
        'এটি আমাদের ডেলিভারি ফি ন্যায্যভাবে ঠিক করতে সাহায্য করে যাতে next আমাদের শহরে টিকে থাকতে পারে।',
      'What delivery fee would you happily pay?': 'কত ডেলিভারি ফি আপনি খুশি মনে দেবেন?',
      'Only if it is free': 'শুধু বিনামূল্যে হলে',
      'Free above a cart value': 'নির্দিষ্ট কার্ট মূল্যের উপরে বিনামূল্যে',
      'A typical order would be worth about\u2026': 'সাধারণ একটি অর্ডারের মূল্য প্রায়\u2026',
      'Under \u20B9100': '\u20B9১০০-এর কম',
      'How would you like to pay?': 'আপনি কীভাবে টাকা দিতে চান?',
      '\uD83D\uDCB5 Cash on delivery': '\uD83D\uDCB5 ডেলিভারিতে নগদ',
      '\uD83D\uDCF2 UPI': '\uD83D\uDCF2 UPI',
      '\uD83D\uDCB3 Card': '\uD83D\uDCB3 কার্ড',
      '\uD83D\uDC5B Wallet': '\uD83D\uDC5B ওয়ালেট',
      'When would you order most? (optional)': 'কখন সবচেয়ে বেশি অর্ডার করবেন? (ঐচ্ছিক)',
      '\uD83C\uDF05 Morning': '\uD83C\uDF05 সকাল',
      '\uD83C\uDF1E Afternoon': '\uD83C\uDF1E দুপুর',
      '\uD83C\uDF06 Evening': '\uD83C\uDF06 সন্ধ্যা',
      '\uD83C\uDF19 Late night': '\uD83C\uDF19 গভীর রাত',
      'How likely are you to recommend next to a friend?':
        'বন্ধুকে next সুপারিশ করার সম্ভাবনা কতটা?',
      'Not likely': 'সম্ভাবনা কম',
      'Very likely': 'খুব সম্ভাবনা',

      /* rider */
      'Become a delivery partner': 'ডেলিভারি পার্টনার হন',
      'Riding with next': 'next-এর সঙ্গে রাইডিং',
      'We want partners to earn well. Tell us about you.':
        'আমরা চাই পার্টনাররা ভালো আয় করুক। আপনার সম্পর্কে বলুন।',
      'What will you deliver on?': 'আপনি কীসে ডেলিভারি করবেন?',
      '\uD83C\uDFCD\uFE0F Motorbike': '\uD83C\uDFCD\uFE0F মোটরবাইক',
      '\uD83D\uDEF5 Scooter': '\uD83D\uDEF5 স্কুটার',
      '\uD83D\uDEB2 Bicycle': '\uD83D\uDEB2 সাইকেল',
      '\uD83D\uDEB6 On foot': '\uD83D\uDEB6 পায়ে হেঁটে',
      'No vehicle yet': 'এখনো কোনো বাহন নেই',
      'How many hours a day can you give?': 'দিনে কত ঘণ্টা দিতে পারবেন?',
      '1\u20132 hours': '১\u20132 ঘণ্টা',
      '3\u20135 hours': '৩\u20135 ঘণ্টা',
      '6\u20138 hours': '৬\u20138 ঘণ্টা',
      'Full time (8+)': 'পূর্ণ সময় (৮+)',
      'What daily earning makes it worth it?': 'কত দৈনিক আয় হলে এটি সার্থক?',
      'How well do you know the local roads?': 'স্থানীয় রাস্তা কতটা ভালো চেনেন?',
      'Very well': 'খুব ভালো',
      'Somewhat': 'কিছুটা',
      'Not much': 'বেশি না',
      'Do you have a smartphone with internet?': 'আপনার কি ইন্টারনেটসহ স্মার্টফোন আছে?',
      'Yes': 'হ্যাঁ',
      'No': 'না',
      'Can arrange': 'ব্যবস্থা করতে পারি',
      'Do you want to join as a rider when we launch?':
        'আমরা চালু করলে আপনি কি রাইডার হিসেবে যোগ দিতে চান?',
      '\uD83D\uDE4C Yes, sign me up': '\uD83D\uDE4C হ্যাঁ, আমাকে যুক্ত করুন',
      '\uD83E\uDD14 Maybe': '\uD83E\uDD14 হয়তো',
      '\uD83D\uDC40 Just curious': '\uD83D\uDC40 শুধু কৌতূহল',

      /* merchant */
      'For shop owners': 'দোকান মালিকদের জন্য',
      'Selling on next': 'next-এ বিক্রি',
      'Get more orders from your neighbourhood without extra staff.':
        'অতিরিক্ত কর্মী ছাড়াই আপনার এলাকা থেকে বেশি অর্ডার পান।',
      'What kind of shop do you run?': 'আপনি কী ধরনের দোকান চালান?',
      '\uD83D\uDED2 Grocery / Kirana': '\uD83D\uDED2 মুদিখানা / কিরানা',
      '\uD83D\uDC8A Pharmacy': '\uD83D\uDC8A ওষুধের দোকান',
      '\uD83C\uDF71 Restaurant / food': '\uD83C\uDF71 রেস্তোরাঁ / খাবার',
      '\uD83E\uDDC1 Bakery / sweets': '\uD83E\uDDC1 বেকারি / মিষ্টি',
      '\uD83E\uDDF4 General / cosmetics': '\uD83E\uDDF4 জেনারেল / প্রসাধনী',
      '\uD83D\uDCE6 Other': '\uD83D\uDCE6 অন্যান্য',
      'Do you deliver to customers today?': 'আপনি কি এখন গ্রাহকদের ডেলিভারি দেন?',
      'Yes, on phone orders': 'হ্যাঁ, ফোন অর্ডারে',
      'Sometimes': 'কখনো কখনো',
      'No, walk-in only': 'না, শুধু সরাসরি দোকানে',
      'Roughly how many customers per day?': 'প্রতিদিন প্রায় কতজন গ্রাহক?',
      'Would you list your products on next to get more orders?':
        'বেশি অর্ডার পেতে আপনি কি next-এ আপনার পণ্য তালিকাভুক্ত করবেন?',
      '\uD83E\uDD29 Yes, very interested': '\uD83E\uDD29 হ্যাঁ, খুব আগ্রহী',
      '\uD83D\uDE42 Probably': '\uD83D\uDE42 সম্ভবত',
      '\uD83D\uDE45 Not now': '\uD83D\uDE45 এখন নয়',
      'Comfortable managing orders on a phone app?':
        'ফোন অ্যাপে অর্ডার সামলাতে স্বচ্ছন্দ?',
      'Very': 'খুব',
      'Need help': 'সাহায্য দরকার',
      'A fair commission per order would be\u2026': 'প্রতি অর্ডারে ন্যায্য কমিশন হবে\u2026',
      'Prefer flat fee': 'নির্দিষ্ট ফি পছন্দ করি',
      'Do you keep daily essentials in stock?': 'আপনি কি প্রতিদিনের জিনিস স্টকে রাখেন?',
      'Yes, lots': 'হ্যাঁ, প্রচুর',
      'Some': 'কিছুটা',

      /* closing */
      'Almost done': 'প্রায় শেষ',
      'Anything else + stay in the loop': 'আর কিছু + যোগাযোগে থাকুন',
      'Join the waitlist to be among the first when next goes live.':
        'next চালু হলে প্রথমদের একজন হতে ওয়েটলিস্টে যোগ দিন।',
      'Anything you want next to know?': 'next-কে কিছু জানাতে চান?',
      'Ideas, worries, products you miss\u2026': 'আইডিয়া, উদ্বেগ, যে পণ্য খুঁজে পান না\u2026',
      'Want early access / launch updates?': 'আগাম অ্যাক্সেস / চালুর খবর চান?',
      '\u2705 Yes, add me': '\u2705 হ্যাঁ, আমাকে যুক্ত করুন',
      'No thanks': 'না, ধন্যবাদ',
      'Phone or email for updates': 'খবরের জন্য ফোন বা ইমেল',
      'Only if you said yes above.': 'শুধু উপরে হ্যাঁ বললে।',

      /* validation */
      'Please choose one option to continue.': 'এগিয়ে যেতে একটি বিকল্প বেছে নিন।',
      'Please answer this question.': 'অনুগ্রহ করে এই প্রশ্নের উত্তর দিন।',
      'Enter a valid 6-digit pincode.': 'একটি সঠিক ৬-সংখ্যার পিনকোড দিন।',
      'Please add a phone or email so we can reach you.':
        'আমরা যেন যোগাযোগ করতে পারি, একটি ফোন বা ইমেল দিন।',
      'Sorry, something went wrong saving your answers. Please try again.':
        'দুঃখিত, আপনার উত্তর সংরক্ষণে সমস্যা হয়েছে। আবার চেষ্টা করুন।',

      /* thank you */
      'Thank you! \uD83C\uDF89': 'ধন্যবাদ! \uD83C\uDF89',
      'You\u2019re on the waitlist \u2014 we\u2019ll reach out the moment next launches near you.':
        'আপনি ওয়েটলিস্টে আছেন \u2014 next আপনার কাছে চালু হলেই আমরা যোগাযোগ করব।',
      'Your answers help us decide how to launch next in 721401. We really appreciate it.':
        'আপনার উত্তর 721401-এ next কীভাবে চালু করব তা ঠিক করতে সাহায্য করে। অসংখ্য ধন্যবাদ।',
      '\uD83D\uDCF2 Share on WhatsApp': '\uD83D\uDCF2 WhatsApp-এ শেয়ার করুন',
      'I just shared what I need from next \u2014 a fast local delivery app for 721401. Add your voice too:':
        'আমি এইমাত্র next-কে আমার চাহিদা জানালাম \u2014 721401-এর জন্য একটি দ্রুত স্থানীয় ডেলিভারি অ্যাপ। আপনিও আপনার মত জানান:',
      'You\u2019re respondent': 'আপনি উত্তরদাতা নম্বর',
      'in 721401': '721401-এ',

      /* social proof */
      'neighbours in 721401 have already shared their thoughts':
        'জন প্রতিবেশী 721401-এ ইতিমধ্যে তাদের মত জানিয়েছেন',
      '\u2728 Be one of the first in 721401 to shape next':
        '\u2728 721401-এ next গড়ে তোলা প্রথমদের একজন হোন'
    },

    hi: {
      /* hero */
      '2-minute survey · Help shape your city\u2019s delivery': '2-मिनट का सर्वे · अपने शहर की डिलीवरी बनाने में मदद करें',
      'What do you need': 'आपको आगे क्या',
      'next': 'next',
      '?': ' चाहिए?',
      'We\u2019re building a fast local delivery app for': 'हम बना रहे हैं एक तेज़ लोकल डिलीवरी ऐप',
      'groceries, daily essentials and more, delivered from shops near you. Your answers decide if & how we launch.':
        '— किराना, रोज़मर्रा की ज़रूरतें और भी बहुत कुछ, आपके पास की दुकानों से। हम कैसे शुरू करें यह आपके जवाब तय करेंगे।',
      'Takes ~2 minutes': 'लगभग 2 मिनट लगते हैं',
      '100% anonymous (unless you join the waitlist)': '100% गुमनाम (जब तक आप वेटलिस्ट में शामिल न हों)',
      'Works on any device': 'किसी भी डिवाइस पर चलता है',
      'Start the survey': 'सर्वे शुरू करें',
      '\uD83C\uDF81 Early users get free delivery for a week':
        '\uD83C\uDF81 शुरुआती उपयोगकर्ताओं को एक हफ्ते की मुफ्त डिलीवरी',

      /* footer */
      'Fast local delivery for 721401': '721401 के लिए तेज़ लोकल डिलीवरी',
      'Admin dashboard': 'एडमिन डैशबोर्ड',
      'Made for the people of our city. What do you need next?':
        'हमारे शहर के लोगों के लिए बना। आपको आगे क्या चाहिए?',

      /* chrome */
      'Continue': 'आगे बढ़ें',
      'Submit survey': 'सर्वे जमा करें',
      '\u2190 Back': '\u2190 पीछे',
      'Back': 'पीछे',
      'optional': 'वैकल्पिक',
      'Sending\u2026': 'भेजा जा रहा है\u2026',
      'Submit another response': 'एक और जवाब जमा करें',
      'Back to home': 'होम पर लौटें',

      /* cheers */
      'Let\u2019s go! \uD83D\uDE80': 'चलिए शुरू करें! \uD83D\uDE80',
      'Nice start! \uD83D\uDCAA': 'बढ़िया शुरुआत! \uD83D\uDCAA',
      'You\u2019re cruising \uD83C\uDF1F': 'आप आगे बढ़ रहे हैं \uD83C\uDF1F',
      'Great answers! \uD83D\uDC4F': 'शानदार जवाब! \uD83D\uDC4F',
      'Almost there \uD83C\uDFAF': 'बस थोड़ा और \uD83C\uDFAF',
      'Last step! \uD83C\uDFC1': 'आख़िरी कदम! \uD83C\uDFC1',
      'min left': 'मिनट बाकी',
      's left': 'सेकंड बाकी',

      /* role */
      'Welcome to next': 'next में आपका स्वागत है',
      'First, who are you?': 'पहले बताइए, आप कौन हैं?',
      'We\u2019ll ask a few questions made just for you.': 'हम सिर्फ़ आपके लिए कुछ सवाल पूछेंगे।',
      'I want to order': 'मैं ऑर्डर करना चाहता/चाहती हूँ',
      'A shopper / customer': 'एक खरीदार / ग्राहक',
      'I want to deliver': 'मैं डिलीवरी करना चाहता/चाहती हूँ',
      'A delivery rider': 'एक डिलीवरी राइडर',
      'I own a shop': 'मेरी एक दुकान है',
      'A merchant / seller': 'एक व्यापारी / विक्रेता',
      'Just tap your answer \u2014 we\u2019ll take you straight to the next step \u2728':
        'बस अपने जवाब पर टैप करें \u2014 हम सीधे अगले चरण पर ले जाएंगे \u2728',

      /* profile */
      'About you': 'आपके बारे में',
      'Tell us where you are': 'बताइए आप कहाँ हैं',
      'This helps us know which neighbourhoods to launch in first.':
        'इससे हमें पता चलता है कि पहले किन इलाकों में शुरू करें।',
      'Your name': 'आपका नाम',
      'Your area / locality': 'आपका इलाका / क्षेत्र',
      'Pincode': 'पिनकोड',
      'Your age group': 'आपकी आयु वर्ग',
      'Under 18': '18 से कम',
      '50+': '50+',

      /* customer habits */
      'Your habits': 'आपकी आदतें',
      'How do you shop today?': 'आप आजकल कैसे खरीदारी करते हैं?',
      'There are no wrong answers \u2014 we just want the real picture.':
        'कोई जवाब गलत नहीं है \u2014 हम बस असली तस्वीर जानना चाहते हैं।',
      'How often do you buy groceries / daily essentials?':
        'आप कितनी बार किराना / रोज़मर्रा का सामान खरीदते हैं?',
      'Daily': 'रोज़',
      'Few times a week': 'हफ्ते में कुछ बार',
      'Weekly': 'साप्ताहिक',
      'Occasionally': 'कभी-कभी',
      'How do you usually get them now?': 'अभी आप आमतौर पर इन्हें कैसे लाते हैं?',
      'Choose all that apply.': 'जो भी लागू हो सब चुनें।',
      '\uD83D\uDEB6 Go to a local shop myself': '\uD83D\uDEB6 खुद लोकल दुकान जाता/जाती हूँ',
      '\uD83D\uDCDE Phone the shop / WhatsApp order': '\uD83D\uDCDE दुकान को फोन / WhatsApp ऑर्डर',
      '\uD83D\uDEF5 Ask a family member': '\uD83D\uDEF5 परिवार के किसी सदस्य से कहता/कहती हूँ',
      '\uD83D\uDCE6 Other delivery apps': '\uD83D\uDCE6 अन्य डिलीवरी ऐप',
      '\uD83C\uDFEA Big supermarket': '\uD83C\uDFEA बड़ा सुपरमार्केट',
      'What would you most want delivered fast?': 'क्या आप सबसे ज़्यादा तेज़ डिलीवरी चाहते हैं?',
      'Pick everything you would use.': 'जो भी आप इस्तेमाल करेंगे सब चुनें।',
      '\uD83E\uDD66 Vegetables & fruit': '\uD83E\uDD66 सब्ज़ियाँ और फल',
      '\uD83D\uDED2 Groceries & staples': '\uD83D\uDED2 किराना और ज़रूरी सामान',
      '\uD83E\uDD5B Milk & dairy': '\uD83E\uDD5B दूध और डेयरी',
      '\uD83D\uDC8A Medicines': '\uD83D\uDC8A दवाइयाँ',
      '\uD83C\uDF7F Snacks & drinks': '\uD83C\uDF7F स्नैक्स और पेय',
      '\uD83E\uDDF4 Personal care': '\uD83E\uDDF4 व्यक्तिगत देखभाल',
      '\uD83E\uDDF9 Household items': '\uD83E\uDDF9 घरेलू सामान',
      '\uD83C\uDF71 Cooked food / meals': '\uD83C\uDF71 पका हुआ खाना / भोजन',
      '\uD83D\uDCD2 Stationery': '\uD83D\uDCD2 स्टेशनरी',

      /* customer demand */
      'The big question': 'बड़ा सवाल',
      'Would you actually use next?': 'क्या आप वाकई next इस्तेमाल करेंगे?',
      'Be honest \u2014 this is the answer that matters most.':
        'ईमानदार रहें \u2014 यही जवाब सबसे ज़्यादा मायने रखता है।',
      'Biggest frustration with shopping today?': 'आज खरीदारी में सबसे बड़ी परेशानी क्या है?',
      'Optional \u2014 choose any that apply.': 'वैकल्पिक \u2014 जो भी लागू हो चुनें।',
      '\u23F3 Wastes my time': '\u23F3 मेरा समय बर्बाद होता है',
      '\uD83D\uDE97 Travel / distance': '\uD83D\uDE97 आना-जाना / दूरी',
      '\u274C Items out of stock': '\u274C सामान स्टॉक में नहीं रहता',
      '\uD83D\uDCB8 Prices too high': '\uD83D\uDCB8 कीमतें बहुत ज़्यादा',
      '\uD83C\uDF27\uFE0F Weather / going out': '\uD83C\uDF27\uFE0F मौसम / बाहर जाना',
      '\uD83D\uDD57 Shop timings': '\uD83D\uDD57 दुकान का समय',
      'If next delivered to your door in 15\u201330 minutes, would you use it?':
        'अगर next 15\u201330 मिनट में आपके दरवाज़े पर पहुँचाए, तो क्या आप इस्तेमाल करेंगे?',
      '\uD83E\uDD29 Yes, definitely': '\uD83E\uDD29 हाँ, ज़रूर',
      '\uD83D\uDE42 Probably yes': '\uD83D\uDE42 शायद हाँ',
      '\uD83E\uDD14 Maybe / not sure': '\uD83E\uDD14 शायद / पक्का नहीं',
      '\uD83D\uDE45 Probably not': '\uD83D\uDE45 शायद नहीं',
      '\uD83D\uDEAB No': '\uD83D\uDEAB नहीं',
      'What delivery time feels good to you?': 'कौन सा डिलीवरी समय आपको अच्छा लगता है?',
      'Under 15 min': '15 मिनट से कम',
      '15\u201330 min': '15\u201330 मिनट',
      '30\u201345 min': '30\u201345 मिनट',
      'Up to 1 hour is fine': '1 घंटे तक ठीक है',

      /* customer money */
      'Making it work': 'इसे चलाने के लिए',
      'A few money questions': 'पैसे से जुड़े कुछ सवाल',
      'This helps us price delivery fairly so next can survive in our city.':
        'इससे हम डिलीवरी शुल्क सही तय कर पाते हैं ताकि next हमारे शहर में टिक सके।',
      'What delivery fee would you happily pay?': 'कितना डिलीवरी शुल्क आप खुशी से देंगे?',
      'Only if it is free': 'सिर्फ़ अगर यह मुफ्त हो',
      'Free above a cart value': 'एक कार्ट मूल्य से ऊपर मुफ्त',
      'A typical order would be worth about\u2026': 'एक सामान्य ऑर्डर की कीमत लगभग\u2026',
      'Under \u20B9100': '\u20B9100 से कम',
      'How would you like to pay?': 'आप कैसे भुगतान करना चाहेंगे?',
      '\uD83D\uDCB5 Cash on delivery': '\uD83D\uDCB5 डिलीवरी पर नकद',
      '\uD83D\uDCF2 UPI': '\uD83D\uDCF2 UPI',
      '\uD83D\uDCB3 Card': '\uD83D\uDCB3 कार्ड',
      '\uD83D\uDC5B Wallet': '\uD83D\uDC5B वॉलेट',
      'When would you order most? (optional)': 'आप सबसे ज़्यादा कब ऑर्डर करेंगे? (वैकल्पिक)',
      '\uD83C\uDF05 Morning': '\uD83C\uDF05 सुबह',
      '\uD83C\uDF1E Afternoon': '\uD83C\uDF1E दोपहर',
      '\uD83C\uDF06 Evening': '\uD83C\uDF06 शाम',
      '\uD83C\uDF19 Late night': '\uD83C\uDF19 देर रात',
      'How likely are you to recommend next to a friend?':
        'किसी दोस्त को next सुझाने की कितनी संभावना है?',
      'Not likely': 'कम संभावना',
      'Very likely': 'बहुत संभावना',

      /* rider */
      'Become a delivery partner': 'डिलीवरी पार्टनर बनें',
      'Riding with next': 'next के साथ राइडिंग',
      'We want partners to earn well. Tell us about you.':
        'हम चाहते हैं पार्टनर अच्छी कमाई करें। अपने बारे में बताइए।',
      'What will you deliver on?': 'आप किस पर डिलीवरी करेंगे?',
      '\uD83C\uDFCD\uFE0F Motorbike': '\uD83C\uDFCD\uFE0F मोटरबाइक',
      '\uD83D\uDEF5 Scooter': '\uD83D\uDEF5 स्कूटर',
      '\uD83D\uDEB2 Bicycle': '\uD83D\uDEB2 साइकिल',
      '\uD83D\uDEB6 On foot': '\uD83D\uDEB6 पैदल',
      'No vehicle yet': 'अभी कोई वाहन नहीं',
      'How many hours a day can you give?': 'दिन में कितने घंटे दे सकते हैं?',
      '1\u20132 hours': '1\u20132 घंटे',
      '3\u20135 hours': '3\u20135 घंटे',
      '6\u20138 hours': '6\u20138 घंटे',
      'Full time (8+)': 'पूर्णकालिक (8+)',
      'What daily earning makes it worth it?': 'कितनी दैनिक कमाई इसे सार्थक बनाती है?',
      'How well do you know the local roads?': 'आप स्थानीय रास्तों को कितना अच्छा जानते हैं?',
      'Very well': 'बहुत अच्छी तरह',
      'Somewhat': 'कुछ हद तक',
      'Not much': 'ज़्यादा नहीं',
      'Do you have a smartphone with internet?': 'क्या आपके पास इंटरनेट वाला स्मार्टफोन है?',
      'Yes': 'हाँ',
      'No': 'नहीं',
      'Can arrange': 'इंतज़ाम कर सकता/सकती हूँ',
      'Do you want to join as a rider when we launch?':
        'क्या हमारे शुरू होने पर आप राइडर के रूप में जुड़ना चाहते हैं?',
      '\uD83D\uDE4C Yes, sign me up': '\uD83D\uDE4C हाँ, मुझे जोड़ें',
      '\uD83E\uDD14 Maybe': '\uD83E\uDD14 शायद',
      '\uD83D\uDC40 Just curious': '\uD83D\uDC40 बस जिज्ञासा',

      /* merchant */
      'For shop owners': 'दुकान मालिकों के लिए',
      'Selling on next': 'next पर बिक्री',
      'Get more orders from your neighbourhood without extra staff.':
        'बिना अतिरिक्त स्टाफ के अपने इलाके से ज़्यादा ऑर्डर पाएँ।',
      'What kind of shop do you run?': 'आप किस तरह की दुकान चलाते हैं?',
      '\uD83D\uDED2 Grocery / Kirana': '\uD83D\uDED2 किराना',
      '\uD83D\uDC8A Pharmacy': '\uD83D\uDC8A फार्मेसी',
      '\uD83C\uDF71 Restaurant / food': '\uD83C\uDF71 रेस्तरां / खाना',
      '\uD83E\uDDC1 Bakery / sweets': '\uD83E\uDDC1 बेकरी / मिठाई',
      '\uD83E\uDDF4 General / cosmetics': '\uD83E\uDDF4 जनरल / कॉस्मेटिक्स',
      '\uD83D\uDCE6 Other': '\uD83D\uDCE6 अन्य',
      'Do you deliver to customers today?': 'क्या आप आज ग्राहकों को डिलीवरी देते हैं?',
      'Yes, on phone orders': 'हाँ, फोन ऑर्डर पर',
      'Sometimes': 'कभी-कभी',
      'No, walk-in only': 'नहीं, सिर्फ़ दुकान पर आकर',
      'Roughly how many customers per day?': 'रोज़ाना लगभग कितने ग्राहक?',
      'Would you list your products on next to get more orders?':
        'ज़्यादा ऑर्डर पाने के लिए क्या आप next पर अपने उत्पाद सूचीबद्ध करेंगे?',
      '\uD83E\uDD29 Yes, very interested': '\uD83E\uDD29 हाँ, बहुत इच्छुक',
      '\uD83D\uDE42 Probably': '\uD83D\uDE42 शायद',
      '\uD83D\uDE45 Not now': '\uD83D\uDE45 अभी नहीं',
      'Comfortable managing orders on a phone app?':
        'फोन ऐप पर ऑर्डर संभालने में सहज हैं?',
      'Very': 'बहुत',
      'Need help': 'मदद चाहिए',
      'A fair commission per order would be\u2026': 'प्रति ऑर्डर एक उचित कमीशन होगा\u2026',
      'Prefer flat fee': 'फिक्स्ड शुल्क पसंद है',
      'Do you keep daily essentials in stock?': 'क्या आप रोज़मर्रा का सामान स्टॉक में रखते हैं?',
      'Yes, lots': 'हाँ, बहुत',
      'Some': 'कुछ',

      /* closing */
      'Almost done': 'बस हो गया',
      'Anything else + stay in the loop': 'और कुछ + संपर्क में रहें',
      'Join the waitlist to be among the first when next goes live.':
        'next शुरू होने पर पहले लोगों में रहने के लिए वेटलिस्ट में शामिल हों।',
      'Anything you want next to know?': 'next को कुछ बताना चाहते हैं?',
      'Ideas, worries, products you miss\u2026': 'विचार, चिंताएँ, जो उत्पाद नहीं मिलते\u2026',
      'Want early access / launch updates?': 'जल्दी एक्सेस / लॉन्च अपडेट चाहते हैं?',
      '\u2705 Yes, add me': '\u2705 हाँ, मुझे जोड़ें',
      'No thanks': 'नहीं, धन्यवाद',
      'Phone or email for updates': 'अपडेट के लिए फोन या ईमेल',
      'Only if you said yes above.': 'सिर्फ़ अगर आपने ऊपर हाँ कहा हो।',

      /* validation */
      'Please choose one option to continue.': 'आगे बढ़ने के लिए एक विकल्प चुनें।',
      'Please answer this question.': 'कृपया इस सवाल का जवाब दें।',
      'Enter a valid 6-digit pincode.': 'एक मान्य 6-अंकों का पिनकोड डालें।',
      'Please add a phone or email so we can reach you.':
        'ताकि हम संपर्क कर सकें, कृपया फोन या ईमेल जोड़ें।',
      'Sorry, something went wrong saving your answers. Please try again.':
        'क्षमा करें, आपके जवाब सहेजने में कुछ गड़बड़ हुई। कृपया फिर कोशिश करें।',

      /* thank you */
      'Thank you! \uD83C\uDF89': 'धन्यवाद! \uD83C\uDF89',
      'You\u2019re on the waitlist \u2014 we\u2019ll reach out the moment next launches near you.':
        'आप वेटलिस्ट में हैं \u2014 next आपके पास शुरू होते ही हम संपर्क करेंगे।',
      'Your answers help us decide how to launch next in 721401. We really appreciate it.':
        'आपके जवाब 721401 में next कैसे शुरू करें यह तय करने में मदद करते हैं। हम बहुत आभारी हैं।',
      '\uD83D\uDCF2 Share on WhatsApp': '\uD83D\uDCF2 WhatsApp पर शेयर करें',
      'I just shared what I need from next \u2014 a fast local delivery app for 721401. Add your voice too:':
        'मैंने अभी next को अपनी ज़रूरत बताई \u2014 721401 के लिए एक तेज़ लोकल डिलीवरी ऐप। आप भी अपनी राय दें:',
      'You\u2019re respondent': 'आप उत्तरदाता नंबर',
      'in 721401': '721401 में',

      /* social proof */
      'neighbours in 721401 have already shared their thoughts':
        'पड़ोसियों ने 721401 में पहले ही अपनी राय साझा की है',
      '\u2728 Be one of the first in 721401 to shape next':
        '\u2728 721401 में next बनाने वाले पहले लोगों में बनें'
    }
  };

  /* ---------- core ---------- */
  function detectLang() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED.indexOf(stored) > -1) return stored;
    } catch (e) {}
    return 'en';
  }

  var current = detectLang();

  function t(str) {
    if (str == null) return str;
    if (current === 'en') return str;
    var table = DICT[current];
    if (table && Object.prototype.hasOwnProperty.call(table, str)) return table[str];
    return str; // graceful fallback to English
  }

  function setLang(lang) {
    if (SUPPORTED.indexOf(lang) < 0) return;
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    document.documentElement.setAttribute('lang', lang);
    apply();
    document.dispatchEvent(new CustomEvent('next:langchange', { detail: { lang: lang } }));
  }

  function getLang() { return current; }

  /* Translate static nodes carrying data-i18n="<english>" */
  function apply(root) {
    var scope = root || document;
    var nodes = scope.querySelectorAll('[data-i18n]');
    Array.prototype.forEach.call(nodes, function (n) {
      var key = n.getAttribute('data-i18n');
      n.textContent = t(key);
    });
    var phNodes = scope.querySelectorAll('[data-i18n-placeholder]');
    Array.prototype.forEach.call(phNodes, function (n) {
      var key = n.getAttribute('data-i18n-placeholder');
      n.setAttribute('placeholder', t(key));
    });
    // reflect active state on any language switcher
    var switches = scope.querySelectorAll('[data-lang]');
    Array.prototype.forEach.call(switches, function (b) {
      if (b.getAttribute('data-lang') === current) b.classList.add('active');
      else b.classList.remove('active');
    });
  }

  document.documentElement.setAttribute('lang', current);

  window.NextI18n = {
    t: t,
    setLang: setLang,
    getLang: getLang,
    apply: apply,
    SUPPORTED: SUPPORTED
  };
})();
