// Hisn al-Muslim (Sa‘îd al-Qahtânî) : invocations des situations du quotidien. Chargé à la demande (onglet Invocations).
// Textes et sens à faire vérifier (pnpm texts). ar : texte arabe · fr : sens en français · an : note arabe courte ·
// n : répétitions · src : recueils (voir SOURCES).

import type { Dhikr } from './data'

export const SOURCES = {
  B: { fr: 'Al-Bukhârî', ar: 'البخاري' },
  M: { fr: 'Muslim', ar: 'مسلم' },
  AD: { fr: 'Abû Dâwûd', ar: 'أبو داود' },
  T: { fr: 'At-Tirmidhî', ar: 'الترمذي' },
  N: { fr: 'An-Nasâ’î', ar: 'النسائي' },
  IM: { fr: 'Ibn Mâjah', ar: 'ابن ماجه' },
  A: { fr: 'Ahmad', ar: 'أحمد' },
  IH: { fr: 'Ibn Hibbân', ar: 'ابن حبان' },
  Mw: { fr: 'Al-Muwatta’', ar: 'الموطأ' },
} as const

export type Source = keyof typeof SOURCES

export type Dua = Dhikr & { src: readonly Source[] }

export type HisnChapter = { id: string; fr: string; ar: string; items: readonly Dua[] }

export const HISN: readonly HisnChapter[] = [
  {
    id: 'reveil',
    fr: 'Au réveil',
    ar: 'الاستيقاظ من النوم',
    items: [
      {
        ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
        fr: 'Louange à Allah qui nous a rendu la vie après nous avoir fait mourir, et c’est vers Lui la résurrection.',
        n: 1,
        src: ['B'],
      },
      {
        ar: 'الْحَمْدُ لِلَّهِ الَّذِي عَافَانِي فِي جَسَدِي، وَرَدَّ عَلَيَّ رُوحِي، وَأَذِنَ لِي بِذِكْرِهِ',
        fr: 'Louange à Allah qui a préservé mon corps, m’a rendu mon âme et m’a permis de L’évoquer.',
        n: 1,
        src: ['T'],
      },
    ],
  },
  {
    id: 'habits',
    fr: 'S’habiller',
    ar: 'لبس الثوب',
    items: [
      {
        ar: 'الْحَمْدُ لِلَّهِ الَّذِي كَسَانِي هَٰذَا الثَّوْبَ وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        fr: 'Louange à Allah qui m’a vêtu de cet habit et me l’a accordé sans force ni puissance de ma part.',
        n: 1,
        src: ['AD', 'T'],
      },
      {
        ar: 'اللَّهُمَّ لَكَ الْحَمْدُ أَنْتَ كَسَوْتَنِيهِ، أَسْأَلُكَ مِنْ خَيْرِهِ وَخَيْرِ مَا صُنِعَ لَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّهِ وَشَرِّ مَا صُنِعَ لَهُ',
        fr: 'Pour un habit neuf : à Toi la louange, c’est Toi qui m’en as vêtu. Je Te demande son bien et le bien pour lequel il a été fait.',
        an: 'عند لبس الثوب الجديد.',
        n: 1,
        src: ['AD', 'T'],
      },
      {
        ar: 'بِسْمِ اللَّهِ',
        fr: 'En se déshabillant : « Au nom d’Allah ».',
        an: 'عند وضع الثوب.',
        n: 1,
        src: ['T'],
      },
    ],
  },
  {
    id: 'toilettes',
    fr: 'Toilettes',
    ar: 'دخول الخلاء والخروج منه',
    items: [
      {
        ar: 'بِسْمِ اللَّهِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْخُبُثِ وَالْخَبَائِثِ',
        fr: 'En entrant : au nom d’Allah. Ô Allah, je me réfugie auprès de Toi contre les démons mâles et femelles.',
        an: 'عند الدخول.',
        n: 1,
        src: ['B', 'M'],
      },
      {
        ar: 'غُفْرَانَكَ',
        fr: 'En sortant : « (Je demande) Ton pardon ».',
        an: 'عند الخروج.',
        n: 1,
        src: ['AD', 'T'],
      },
    ],
  },
  {
    id: 'wudu',
    fr: 'Ablutions',
    ar: 'الوضوء',
    items: [
      { ar: 'بِسْمِ اللَّهِ', fr: 'Avant les ablutions : « Au nom d’Allah ».', an: 'قبل الوضوء.', n: 1, src: ['AD'] },
      {
        ar: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        fr: 'Après les ablutions : j’atteste qu’il n’y a de divinité qu’Allah, seul, sans associé, et que Muhammad est Son serviteur et Son messager.',
        an: 'بعد الوضوء.',
        n: 1,
        src: ['M'],
      },
      {
        ar: 'اللَّهُمَّ اجْعَلْنِي مِنَ التَّوَّابِينَ، وَاجْعَلْنِي مِنَ الْمُتَطَهِّرِينَ',
        fr: 'Ô Allah, place-moi parmi ceux qui se repentent et parmi ceux qui se purifient.',
        n: 1,
        src: ['T'],
      },
      {
        ar: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
        fr: 'Gloire et louange à Toi, ô Allah. J’atteste qu’il n’y a de divinité que Toi ; je Te demande pardon et je me repens à Toi.',
        n: 1,
        src: ['N'],
      },
    ],
  },
  {
    id: 'sortie',
    fr: 'Sortir de la maison',
    ar: 'الخروج من المنزل',
    items: [
      {
        ar: 'بِسْمِ اللَّهِ، تَوَكَّلْتُ عَلَى اللَّهِ، وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        fr: 'Au nom d’Allah, je m’en remets à Allah ; il n’y a de force ni de puissance qu’en Allah.',
        n: 1,
        src: ['AD', 'T'],
      },
      {
        ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ أَنْ أَضِلَّ أَوْ أُضَلَّ، أَوْ أَزِلَّ أَوْ أُزَلَّ، أَوْ أَظْلِمَ أَوْ أُظْلَمَ، أَوْ أَجْهَلَ أَوْ يُجْهَلَ عَلَيَّ',
        fr: 'Ô Allah, je me réfugie auprès de Toi contre le fait d’égarer ou d’être égaré, de faillir ou qu’on me fasse faillir, d’opprimer ou d’être opprimé, d’agir sottement ou qu’on agisse sottement envers moi.',
        n: 1,
        src: ['AD', 'T', 'N', 'IM'],
      },
    ],
  },
  {
    id: 'entree',
    fr: 'Entrer à la maison',
    ar: 'دخول المنزل',
    items: [
      {
        ar: 'بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
        fr: 'Au nom d’Allah nous entrons, au nom d’Allah nous sortons, et en Allah notre Seigneur nous plaçons notre confiance. Puis saluer les siens.',
        an: 'ثم يسلّم على أهله.',
        n: 1,
        src: ['AD'],
      },
    ],
  },
  {
    id: 'mosquee',
    fr: 'Mosquée',
    ar: 'المسجد',
    items: [
      {
        ar: 'أَعُوذُ بِاللَّهِ الْعَظِيمِ، وَبِوَجْهِهِ الْكَرِيمِ، وَسُلْطَانِهِ الْقَدِيمِ، مِنَ الشَّيْطَانِ الرَّجِيمِ',
        fr: 'En entrant : je me réfugie auprès d’Allah l’Immense, de Sa noble Face et de Son pouvoir éternel contre Satan le maudit.',
        an: 'عند دخول المسجد.',
        n: 1,
        src: ['AD'],
      },
      {
        ar: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَىٰ رَسُولِ اللَّهِ، اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
        fr: 'En entrant (pied droit) : au nom d’Allah, prière et salut sur le Messager d’Allah. Ô Allah, ouvre-moi les portes de Ta miséricorde.',
        an: 'عند الدخول، يقدّم رجله اليمنى.',
        n: 1,
        src: ['M', 'AD'],
      },
      {
        ar: 'بِسْمِ اللَّهِ، وَالصَّلَاةُ وَالسَّلَامُ عَلَىٰ رَسُولِ اللَّهِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
        fr: 'En sortant (pied gauche) : … Ô Allah, je Te demande de Ta grâce.',
        an: 'عند الخروج، يقدّم رجله اليسرى.',
        n: 1,
        src: ['M', 'AD'],
      },
    ],
  },
  {
    id: 'adhan',
    fr: 'En entendant l’adhan',
    ar: 'الأذان',
    items: [
      {
        ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
        fr: 'Répéter ce que dit le muezzin, sauf « Hayya ‘ala-s-salât » et « Hayya ‘ala-l-falâh » : on dit alors « Il n’y a de force ni de puissance qu’en Allah ».',
        an: 'يقول مثل ما يقول المؤذن إلا في «حيّ على الصلاة» و«حيّ على الفلاح».',
        n: 1,
        src: ['B', 'M'],
      },
      {
        ar: 'وَأَنَا أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ، رَضِيتُ بِاللَّهِ رَبًّا، وَبِمُحَمَّدٍ رَسُولًا، وَبِالْإِسْلَامِ دِينًا',
        fr: 'Après les deux attestations du muezzin : moi aussi j’atteste… J’agrée Allah comme Seigneur, Muhammad comme messager et l’islam comme religion.',
        an: 'بعد تشهّد المؤذن.',
        n: 1,
        src: ['M'],
      },
      {
        ar: 'اللَّهُمَّ رَبَّ هَٰذِهِ الدَّعْوَةِ التَّامَّةِ، وَالصَّلَاةِ الْقَائِمَةِ، آتِ مُحَمَّدًا الْوَسِيلَةَ وَالْفَضِيلَةَ، وَابْعَثْهُ مَقَامًا مَحْمُودًا الَّذِي وَعَدْتَهُ',
        fr: 'Après l’adhan (et la prière sur le Prophète ﷺ) : ô Allah, Seigneur de cet appel parfait et de la prière qui va être accomplie, accorde à Muhammad le rang d’intercession et l’excellence, et ressuscite-le à la station louable que Tu lui as promise.',
        an: 'بعد الأذان والصلاة على النبي ﷺ.',
        n: 1,
        src: ['B'],
      },
    ],
  },
  {
    id: 'priere',
    fr: 'Pendant la prière',
    ar: 'في الصلاة',
    items: [
      {
        ar: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالَىٰ جَدُّكَ، وَلَا إِلَٰهَ غَيْرُكَ',
        fr: 'Ouverture : gloire et louange à Toi, ô Allah, béni soit Ton nom, élevée soit Ta majesté ; il n’y a de divinité que Toi.',
        an: 'دعاء الاستفتاح.',
        n: 1,
        src: ['AD', 'T'],
      },
      {
        ar: 'اللَّهُمَّ بَاعِدْ بَيْنِي وَبَيْنَ خَطَايَايَ كَمَا بَاعَدْتَ بَيْنَ الْمَشْرِقِ وَالْمَغْرِبِ، اللَّهُمَّ نَقِّنِي مِنْ خَطَايَايَ كَمَا يُنَقَّى الثَّوْبُ الْأَبْيَضُ مِنَ الدَّنَسِ، اللَّهُمَّ اغْسِلْ خَطَايَايَ بِالثَّلْجِ وَالْمَاءِ وَالْبَرَدِ',
        fr: 'Autre ouverture : ô Allah, éloigne-moi de mes fautes comme Tu as éloigné l’Orient de l’Occident, purifie-moi de mes fautes comme on nettoie l’habit blanc de la saleté, lave mes fautes avec la neige, l’eau et la grêle.',
        an: 'دعاء الاستفتاح.',
        n: 1,
        src: ['B', 'M'],
      },
      {
        ar: 'سُبْحَانَ رَبِّيَ الْعَظِيمِ',
        fr: 'Inclinaison (rukû‘) : gloire à mon Seigneur l’Immense.',
        an: 'في الركوع.',
        n: 3,
        src: ['AD', 'T'],
      },
      {
        ar: 'سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ، رَبَّنَا وَلَكَ الْحَمْدُ، حَمْدًا كَثِيرًا طَيِّبًا مُبَارَكًا فِيهِ',
        fr: 'En se relevant : Allah entend celui qui Le loue. Notre Seigneur, à Toi la louange, une louange abondante, pure et bénie.',
        an: 'عند الرفع من الركوع.',
        n: 1,
        src: ['B'],
      },
      {
        ar: 'سُبْحَانَ رَبِّيَ الْأَعْلَىٰ',
        fr: 'Prosternation : gloire à mon Seigneur le Très-Haut.',
        an: 'في السجود.',
        n: 3,
        src: ['AD', 'T'],
      },
      {
        ar: 'رَبِّ اغْفِرْ لِي، رَبِّ اغْفِرْ لِي',
        fr: 'Entre les deux prosternations : Seigneur, pardonne-moi.',
        an: 'بين السجدتين.',
        n: 1,
        src: ['AD'],
      },
      {
        ar: 'التَّحِيَّاتُ لِلَّهِ، وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، السَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ، السَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللَّهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
        fr: 'Le tashahhud : les salutations, les prières et les bonnes œuvres sont à Allah. Paix sur toi, ô Prophète… J’atteste qu’il n’y a de divinité qu’Allah et que Muhammad est Son serviteur et Son messager.',
        an: 'التشهد.',
        n: 1,
        src: ['B', 'M'],
      },
      {
        ar: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ، اللَّهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ، كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ، إِنَّكَ حَمِيدٌ مَجِيدٌ',
        fr: 'Prière sur le Prophète ﷺ (salât ibrâhîmiyya), après le tashahhud.',
        an: 'الصلاة الإبراهيمية بعد التشهد.',
        n: 1,
        src: ['B'],
      },
      {
        ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ عَذَابِ الْقَبْرِ، وَمِنْ عَذَابِ جَهَنَّمَ، وَمِنْ فِتْنَةِ الْمَحْيَا وَالْمَمَاتِ، وَمِنْ شَرِّ فِتْنَةِ الْمَسِيحِ الدَّجَّالِ',
        fr: 'Avant le salâm : ô Allah, je me réfugie auprès de Toi contre le châtiment de la tombe, le châtiment de l’Enfer, l’épreuve de la vie et de la mort, et le mal de l’épreuve de l’Antéchrist.',
        an: 'قبل السلام.',
        n: 1,
        src: ['B', 'M'],
      },
    ],
  },
  {
    id: 'witr',
    fr: 'Witr et qunût',
    ar: 'الوتر والقنوت',
    items: [
      {
        ar: 'اللَّهُمَّ اهْدِنِي فِيمَنْ هَدَيْتَ، وَعَافِنِي فِيمَنْ عَافَيْتَ، وَتَوَلَّنِي فِيمَنْ تَوَلَّيْتَ، وَبَارِكْ لِي فِيمَا أَعْطَيْتَ، وَقِنِي شَرَّ مَا قَضَيْتَ، فَإِنَّكَ تَقْضِي وَلَا يُقْضَىٰ عَلَيْكَ، إِنَّهُ لَا يَذِلُّ مَنْ وَالَيْتَ، تَبَارَكْتَ رَبَّنَا وَتَعَالَيْتَ',
        fr: 'Qunût du witr : ô Allah, guide-moi parmi ceux que Tu as guidés, préserve-moi parmi ceux que Tu as préservés… Béni sois-Tu, notre Seigneur, et exalté.',
        an: 'دعاء قنوت الوتر.',
        n: 1,
        src: ['AD', 'T', 'N'],
      },
      {
        ar: 'سُبْحَانَ الْمَلِكِ الْقُدُّوسِ',
        fr: 'Après le salâm du witr : gloire au Roi, le Très-Saint (la 3e fois en élevant la voix).',
        an: 'بعد السلام من الوتر، يرفع صوته في الثالثة.',
        n: 3,
        src: ['N'],
      },
    ],
  },
  {
    id: 'istikhara',
    fr: 'Prière de consultation (istikhâra)',
    ar: 'الاستخارة',
    items: [
      {
        ar: 'اللَّهُمَّ إِنِّي أَسْتَخِيرُكَ بِعِلْمِكَ، وَأَسْتَقْدِرُكَ بِقُدْرَتِكَ، وَأَسْأَلُكَ مِنْ فَضْلِكَ الْعَظِيمِ، فَإِنَّكَ تَقْدِرُ وَلَا أَقْدِرُ، وَتَعْلَمُ وَلَا أَعْلَمُ، وَأَنْتَ عَلَّامُ الْغُيُوبِ، اللَّهُمَّ إِنْ كُنْتَ تَعْلَمُ أَنَّ هَٰذَا الْأَمْرَ خَيْرٌ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي، فَاقْدُرْهُ لِي وَيَسِّرْهُ لِي، ثُمَّ بَارِكْ لِي فِيهِ، وَإِنْ كُنْتَ تَعْلَمُ أَنَّ هَٰذَا الْأَمْرَ شَرٌّ لِي فِي دِينِي وَمَعَاشِي وَعَاقِبَةِ أَمْرِي، فَاصْرِفْهُ عَنِّي وَاصْرِفْنِي عَنْهُ، وَاقْدُرْ لِيَ الْخَيْرَ حَيْثُ كَانَ، ثُمَّ أَرْضِنِي بِهِ',
        fr: 'Après deux rak‘a surérogatoires : ô Allah, je Te consulte par Ta science… Si cette affaire (la nommer) est un bien pour moi, décrète-la et facilite-la ; si c’est un mal, détourne-la de moi, décrète pour moi le bien où qu’il soit et rends-m’en satisfait.',
        an: 'بعد ركعتين من غير الفريضة، ويسمّي حاجته.',
        n: 1,
        src: ['B'],
      },
    ],
  },
  {
    id: 'souci',
    fr: 'Souci et tristesse',
    ar: 'الهم والحزن',
    items: [
      {
        ar: 'اللَّهُمَّ إِنِّي عَبْدُكَ، ابْنُ عَبْدِكَ، ابْنُ أَمَتِكَ، نَاصِيَتِي بِيَدِكَ، مَاضٍ فِيَّ حُكْمُكَ، عَدْلٌ فِيَّ قَضَاؤُكَ، أَسْأَلُكَ بِكُلِّ اسْمٍ هُوَ لَكَ سَمَّيْتَ بِهِ نَفْسَكَ، أَوْ أَنْزَلْتَهُ فِي كِتَابِكَ، أَوْ عَلَّمْتَهُ أَحَدًا مِنْ خَلْقِكَ، أَوِ اسْتَأْثَرْتَ بِهِ فِي عِلْمِ الْغَيْبِ عِنْدَكَ، أَنْ تَجْعَلَ الْقُرْآنَ رَبِيعَ قَلْبِي، وَنُورَ صَدْرِي، وَجَلَاءَ حُزْنِي، وَذَهَابَ هَمِّي',
        fr: 'Ô Allah, je suis Ton serviteur, fils de Ton serviteur et de Ta servante… Je Te demande par chacun de Tes noms de faire du Coran le printemps de mon cœur, la lumière de ma poitrine, ce qui dissipe ma tristesse et chasse mon souci.',
        n: 1,
        src: ['A'],
      },
      {
        ar: 'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ، وَالْبُخْلِ وَالْجُبْنِ، وَضَلَعِ الدَّيْنِ، وَغَلَبَةِ الرِّجَالِ',
        fr: 'Ô Allah, je me réfugie auprès de Toi contre le souci et la tristesse, l’incapacité et la paresse, l’avarice et la lâcheté, le poids de la dette et la domination des hommes.',
        n: 1,
        src: ['B'],
      },
    ],
  },
  {
    id: 'detresse',
    fr: 'Détresse',
    ar: 'الكرب',
    items: [
      {
        ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ، لَا إِلَٰهَ إِلَّا اللَّهُ رَبُّ السَّمَاوَاتِ وَرَبُّ الْأَرْضِ وَرَبُّ الْعَرْشِ الْكَرِيمِ',
        fr: 'Il n’y a de divinité qu’Allah, l’Immense, le Longanime ; Seigneur du Trône immense ; Seigneur des cieux, de la terre et du noble Trône.',
        n: 1,
        src: ['B', 'M'],
      },
      {
        ar: 'اللَّهُمَّ رَحْمَتَكَ أَرْجُو، فَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ، وَأَصْلِحْ لِي شَأْنِي كُلَّهُ، لَا إِلَٰهَ إِلَّا أَنْتَ',
        fr: 'Ô Allah, c’est Ta miséricorde que j’espère : ne m’abandonne pas à moi-même le temps d’un clin d’œil, et arrange toutes mes affaires. Il n’y a de divinité que Toi.',
        n: 1,
        src: ['AD'],
      },
      {
        ar: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
        fr: 'L’invocation de Yûnus : il n’y a de divinité que Toi, gloire à Toi, j’ai été parmi les injustes (Al-Anbiyâ’, 87).',
        n: 1,
        src: ['T'],
      },
      {
        ar: 'اللَّهُ اللَّهُ رَبِّي لَا أُشْرِكُ بِهِ شَيْئًا',
        fr: 'Allah, Allah est mon Seigneur, je ne Lui associe rien.',
        n: 1,
        src: ['AD'],
      },
    ],
  },
  {
    id: 'epreuve',
    fr: 'Épreuve et difficulté',
    ar: 'المصيبة والأمر الصعب',
    items: [
      {
        ar: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ، اللَّهُمَّ أْجُرْنِي فِي مُصِيبَتِي، وَأَخْلِفْ لِي خَيْرًا مِنْهَا',
        fr: 'Nous sommes à Allah et c’est vers Lui que nous retournons. Ô Allah, récompense-moi dans mon malheur et remplace-le par un bien meilleur.',
        n: 1,
        src: ['M'],
      },
      {
        ar: 'اللَّهُمَّ لَا سَهْلَ إِلَّا مَا جَعَلْتَهُ سَهْلًا، وَأَنْتَ تَجْعَلُ الْحَزْنَ إِذَا شِئْتَ سَهْلًا',
        fr: 'Ô Allah, rien n’est facile sauf ce que Tu rends facile, et Tu rends facile la difficulté quand Tu le veux.',
        n: 1,
        src: ['IH'],
      },
      {
        ar: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
        fr: 'Allah nous suffit, et quel excellent garant ! (face à la peur des gens)',
        an: 'عند الخوف من الناس.',
        n: 1,
        src: ['B'],
      },
    ],
  },
  {
    id: 'dette',
    fr: 'Dette et subsistance',
    ar: 'قضاء الدين',
    items: [
      {
        ar: 'اللَّهُمَّ اكْفِنِي بِحَلَالِكَ عَنْ حَرَامِكَ، وَأَغْنِنِي بِفَضْلِكَ عَمَّنْ سِوَاكَ',
        fr: 'Ô Allah, suffis-moi par ce que Tu as permis contre ce que Tu as interdit, et enrichis-moi par Ta grâce de sorte que je n’aie besoin de personne d’autre que Toi.',
        n: 1,
        src: ['T'],
      },
    ],
  },
  {
    id: 'colere',
    fr: 'Colère',
    ar: 'الغضب',
    items: [
      {
        ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
        fr: 'Je me réfugie auprès d’Allah contre Satan le maudit.',
        n: 1,
        src: ['B', 'M'],
      },
    ],
  },
  {
    id: 'doute',
    fr: 'Doute et insufflations',
    ar: 'الوسوسة',
    items: [
      {
        ar: 'آمَنْتُ بِاللَّهِ وَرُسُلِهِ',
        fr: 'Face au doute dans la foi : j’ai cru en Allah et en Ses messagers.',
        n: 1,
        src: ['M'],
      },
      {
        ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ',
        fr: 'Distrait pendant la prière ou la lecture : chercher refuge et souffler légèrement trois fois vers la gauche.',
        an: 'في الصلاة والقراءة، ويتفل عن يساره ثلاثًا.',
        n: 3,
        src: ['M'],
      },
    ],
  },
  {
    id: 'reves',
    fr: 'Mauvais rêve et frayeur',
    ar: 'الرؤيا والفزع في النوم',
    items: [
      {
        ar: 'أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ وَمِنْ شَرِّ مَا رَأَيْتُ',
        fr: 'Après un mauvais rêve : souffler légèrement trois fois à gauche, chercher refuge, ne le raconter à personne et changer de côté.',
        an: 'ينفث عن يساره ثلاثًا، ولا يحدّث بها أحدًا، ويتحوّل عن جنبه.',
        n: 3,
        src: ['M'],
      },
      {
        ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ غَضَبِهِ وَعِقَابِهِ، وَشَرِّ عِبَادِهِ، وَمِنْ هَمَزَاتِ الشَّيَاطِينِ وَأَنْ يَحْضُرُونِ',
        fr: 'Réveil en sursaut : je me réfugie dans les paroles parfaites d’Allah contre Sa colère, Son châtiment, le mal de Ses serviteurs, les incitations des démons et leur présence.',
        n: 1,
        src: ['AD', 'T'],
      },
    ],
  },
  {
    id: 'malade',
    fr: 'Visite au malade',
    ar: 'عيادة المريض',
    items: [
      {
        ar: 'لَا بَأْسَ، طَهُورٌ إِنْ شَاءَ اللَّهُ',
        fr: 'Ce n’est rien : une purification, si Allah le veut.',
        n: 1,
        src: ['B'],
      },
      {
        ar: 'أَسْأَلُ اللَّهَ الْعَظِيمَ، رَبَّ الْعَرْشِ الْعَظِيمِ، أَنْ يَشْفِيَكَ',
        fr: 'Je demande à Allah l’Immense, Seigneur du Trône immense, de te guérir.',
        n: 7,
        src: ['AD', 'T'],
      },
    ],
  },
  {
    id: 'douleur',
    fr: 'Douleur',
    ar: 'الألم',
    items: [
      {
        ar: 'بِسْمِ اللَّهِ',
        fr: 'Poser la main sur l’endroit douloureux et dire trois fois « Au nom d’Allah ».',
        an: 'يضع يده على الذي يألم من جسده.',
        n: 3,
        src: ['M'],
      },
      {
        ar: 'أَعُوذُ بِاللَّهِ وَقُدْرَتِهِ مِنْ شَرِّ مَا أَجِدُ وَأُحَاذِرُ',
        fr: 'Puis sept fois : je me réfugie auprès d’Allah et de Sa puissance contre le mal que je ressens et que je redoute.',
        n: 7,
        src: ['M'],
      },
    ],
  },
  {
    id: 'deces',
    fr: 'Décès et condoléances',
    ar: 'الميت والتعزية',
    items: [
      {
        ar: 'اللَّهُمَّ اغْفِرْ لَهُ وَارْحَمْهُ، وَعَافِهِ وَاعْفُ عَنْهُ، وَأَكْرِمْ نُزُلَهُ، وَوَسِّعْ مُدْخَلَهُ، وَاغْسِلْهُ بِالْمَاءِ وَالثَّلْجِ وَالْبَرَدِ، وَنَقِّهِ مِنَ الْخَطَايَا كَمَا نَقَّيْتَ الثَّوْبَ الْأَبْيَضَ مِنَ الدَّنَسِ',
        fr: 'Pour le défunt (prière funéraire, extrait) : ô Allah, pardonne-lui, fais-lui miséricorde, préserve-le, efface ses fautes, honore son accueil, élargis sa demeure, lave-le avec l’eau, la neige et la grêle, et purifie-le de ses fautes.',
        an: 'في صلاة الجنازة (مختصر).',
        n: 1,
        src: ['M'],
      },
      {
        ar: 'إِنَّ لِلَّهِ مَا أَخَذَ، وَلَهُ مَا أَعْطَىٰ، وَكُلُّ شَيْءٍ عِنْدَهُ بِأَجَلٍ مُسَمًّى، فَلْتَصْبِرْ وَلْتَحْتَسِبْ',
        fr: 'Condoléances : à Allah ce qu’Il a pris et ce qu’Il a donné, et toute chose a auprès de Lui un terme fixé. Sois patient et espère la récompense.',
        an: 'التعزية.',
        n: 1,
        src: ['B', 'M'],
      },
      {
        ar: 'السَّلَامُ عَلَيْكُمْ أَهْلَ الدِّيَارِ مِنَ الْمُؤْمِنِينَ وَالْمُسْلِمِينَ، وَإِنَّا إِنْ شَاءَ اللَّهُ بِكُمْ لَاحِقُونَ، نَسْأَلُ اللَّهَ لَنَا وَلَكُمُ الْعَافِيَةَ',
        fr: 'Au cimetière : paix sur vous, habitants de ces demeures, croyants et musulmans ; nous vous rejoindrons si Allah le veut. Nous demandons à Allah le salut pour nous et pour vous.',
        an: 'عند زيارة القبور.',
        n: 1,
        src: ['M'],
      },
    ],
  },
  {
    id: 'pluie',
    fr: 'Pluie, vent et tonnerre',
    ar: 'المطر والريح والرعد',
    items: [
      {
        ar: 'اللَّهُمَّ أَغِثْنَا، اللَّهُمَّ أَغِثْنَا، اللَّهُمَّ أَغِثْنَا',
        fr: 'Pour demander la pluie : ô Allah, secours-nous (par la pluie).',
        an: 'الاستسقاء.',
        n: 1,
        src: ['B'],
      },
      {
        ar: 'اللَّهُمَّ صَيِّبًا نَافِعًا',
        fr: 'Quand il pleut : ô Allah, (fais-en) une pluie bienfaisante.',
        an: 'عند نزول المطر.',
        n: 1,
        src: ['B'],
      },
      {
        ar: 'مُطِرْنَا بِفَضْلِ اللَّهِ وَرَحْمَتِهِ',
        fr: 'Après la pluie : nous avons reçu la pluie par la grâce d’Allah et Sa miséricorde.',
        an: 'بعد نزول المطر.',
        n: 1,
        src: ['B', 'M'],
      },
      {
        ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّهَا',
        fr: 'Quand le vent souffle : ô Allah, je Te demande son bien et je me réfugie auprès de Toi contre son mal.',
        an: 'عند هبوب الريح.',
        n: 1,
        src: ['AD', 'IM'],
      },
      {
        ar: 'سُبْحَانَ الَّذِي يُسَبِّحُ الرَّعْدُ بِحَمْدِهِ وَالْمَلَائِكَةُ مِنْ خِيفَتِهِ',
        fr: 'En entendant le tonnerre : gloire à Celui dont le tonnerre célèbre la louange, ainsi que les anges, par crainte de Lui.',
        an: 'عند سماع الرعد.',
        n: 1,
        src: ['Mw'],
      },
    ],
  },
  {
    id: 'hilal',
    fr: 'Nouvelle lune',
    ar: 'رؤية الهلال',
    items: [
      {
        ar: 'اللَّهُ أَكْبَرُ، اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالْأَمْنِ وَالْإِيمَانِ، وَالسَّلَامَةِ وَالْإِسْلَامِ، وَالتَّوْفِيقِ لِمَا تُحِبُّ رَبَّنَا وَتَرْضَىٰ، رَبُّنَا وَرَبُّكَ اللَّهُ',
        fr: 'Allah est le plus grand. Ô Allah, fais-la apparaître sur nous avec la sécurité, la foi, le salut, l’islam et la réussite dans ce que Tu aimes et agrées. Notre Seigneur et ton Seigneur est Allah.',
        n: 1,
        src: ['T'],
      },
    ],
  },
  {
    id: 'jeune',
    fr: 'Jeûne et rupture',
    ar: 'الصيام والإفطار',
    items: [
      {
        ar: 'ذَهَبَ الظَّمَأُ، وَابْتَلَّتِ الْعُرُوقُ، وَثَبَتَ الْأَجْرُ إِنْ شَاءَ اللَّهُ',
        fr: 'À la rupture du jeûne : la soif est partie, les veines sont humectées et la récompense est acquise, si Allah le veut.',
        an: 'عند الإفطار.',
        n: 1,
        src: ['AD'],
      },
      {
        ar: 'إِنِّي صَائِمٌ، إِنِّي صَائِمٌ',
        fr: 'Si l’on t’insulte pendant le jeûne : « Je jeûne, je jeûne ».',
        an: 'إذا سابّه أحد وهو صائم.',
        n: 1,
        src: ['B', 'M'],
      },
      {
        ar: 'أَفْطَرَ عِنْدَكُمُ الصَّائِمُونَ، وَأَكَلَ طَعَامَكُمُ الْأَبْرَارُ، وَصَلَّتْ عَلَيْكُمُ الْمَلَائِكَةُ',
        fr: 'Invité à rompre le jeûne : que les jeûneurs rompent le jeûne chez vous, que les pieux mangent votre nourriture et que les anges prient pour vous.',
        an: 'لمن أفطر عند قوم.',
        n: 1,
        src: ['AD'],
      },
    ],
  },
  {
    id: 'repas',
    fr: 'Repas',
    ar: 'الطعام والشراب',
    items: [
      {
        ar: 'بِسْمِ اللَّهِ',
        fr: 'Avant de manger : « Au nom d’Allah ».',
        an: 'قبل الطعام.',
        n: 1,
        src: ['AD', 'T'],
      },
      {
        ar: 'بِسْمِ اللَّهِ فِي أَوَّلِهِ وَآخِرِهِ',
        fr: 'Si on l’a oublié au début : au nom d’Allah, au début et à la fin.',
        an: 'إذا نسي التسمية في أوله.',
        n: 1,
        src: ['AD', 'T'],
      },
      {
        ar: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنِي هَٰذَا، وَرَزَقَنِيهِ مِنْ غَيْرِ حَوْلٍ مِنِّي وَلَا قُوَّةٍ',
        fr: 'Après le repas : louange à Allah qui m’a nourri de ceci et me l’a accordé sans force ni puissance de ma part.',
        an: 'بعد الفراغ من الطعام.',
        n: 1,
        src: ['AD', 'T'],
      },
      {
        ar: 'اللَّهُمَّ بَارِكْ لَهُمْ فِيمَا رَزَقْتَهُمْ، وَاغْفِرْ لَهُمْ وَارْحَمْهُمْ',
        fr: 'L’invité pour ses hôtes : ô Allah, bénis-les dans ce que Tu leur as accordé, pardonne-leur et fais-leur miséricorde.',
        an: 'دعاء الضيف لصاحب الطعام.',
        n: 1,
        src: ['M'],
      },
      {
        ar: 'اللَّهُمَّ أَطْعِمْ مَنْ أَطْعَمَنِي، وَاسْقِ مَنْ سَقَانِي',
        fr: 'Pour qui t’offre à manger ou à boire : ô Allah, nourris qui m’a nourri et abreuve qui m’a abreuvé.',
        n: 1,
        src: ['M'],
      },
    ],
  },
  {
    id: 'eternuement',
    fr: 'Éternuement',
    ar: 'العطاس',
    items: [
      {
        ar: 'الْحَمْدُ لِلَّهِ\nيَرْحَمُكَ اللَّهُ\nيَهْدِيكُمُ اللَّهُ وَيُصْلِحُ بَالَكُمْ',
        fr: 'Celui qui éternue : « Louange à Allah ». On lui répond : « Qu’Allah te fasse miséricorde ». Il répond : « Qu’Allah vous guide et améliore votre état ».',
        an: 'يقول العاطس، ثم يرد عليه أخوه، ثم يجيبه.',
        n: 1,
        src: ['B'],
      },
    ],
  },
  {
    id: 'salam',
    fr: 'Salutation et remerciement',
    ar: 'السلام والشكر',
    items: [
      {
        ar: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ\nوَعَلَيْكُمُ السَّلَامُ وَرَحْمَةُ اللَّهِ وَبَرَكَاتُهُ',
        fr: 'Que la paix soit sur vous, ainsi que la miséricorde d’Allah et Ses bénédictions. Et la réponse.',
        n: 1,
        src: ['AD', 'T'],
      },
      {
        ar: 'جَزَاكَ اللَّهُ خَيْرًا',
        fr: 'À qui t’a fait du bien : qu’Allah te récompense en bien.',
        n: 1,
        src: ['T'],
      },
    ],
  },
  {
    id: 'mariage',
    fr: 'Mariage',
    ar: 'الزواج',
    items: [
      {
        ar: 'بَارَكَ اللَّهُ لَكَ، وَبَارَكَ عَلَيْكَ، وَجَمَعَ بَيْنَكُمَا فِي خَيْرٍ',
        fr: 'Pour féliciter le marié : qu’Allah te bénisse, répande Sa bénédiction sur toi et vous unisse dans le bien.',
        n: 1,
        src: ['AD', 'T'],
      },
    ],
  },
  {
    id: 'voyage',
    fr: 'Voyage',
    ar: 'السفر',
    items: [
      {
        ar: 'اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، اللَّهُ أَكْبَرُ، سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ، وَإِنَّا إِلَىٰ رَبِّنَا لَمُنْقَلِبُونَ، اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ، وَمِنَ الْعَمَلِ مَا تَرْضَىٰ، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَٰذَا وَاطْوِ عَنَّا بُعْدَهُ، اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ، اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنْ وَعْثَاءِ السَّفَرِ، وَكَآبَةِ الْمَنْظَرِ، وَسُوءِ الْمُنْقَلَبِ فِي الْمَالِ وَالْأَهْلِ',
        fr: 'Au départ : gloire à Celui qui a mis ceci à notre service… Ô Allah, nous Te demandons dans ce voyage la bonté et la piété, facilite-le et raccourcis sa distance. Tu es le Compagnon du voyage et le Gardien de la famille. Au retour, ajouter : « De retour, repentants, adorant notre Seigneur et Le louant ».',
        an: 'وإذا رجع زاد: آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ.',
        n: 1,
        src: ['M'],
      },
      {
        ar: 'أَسْتَوْدِعُ اللَّهَ دِينَكَ، وَأَمَانَتَكَ، وَخَوَاتِيمَ عَمَلِكَ',
        fr: 'À celui qui part : je confie à Allah ta religion, ta loyauté et la fin de tes œuvres.',
        an: 'لمن يودّع مسافرًا.',
        n: 1,
        src: ['T'],
      },
      {
        ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        fr: 'En s’arrêtant dans un lieu : je me réfugie dans les paroles parfaites d’Allah contre le mal de ce qu’Il a créé.',
        an: 'عند نزول منزل.',
        n: 1,
        src: ['M'],
      },
    ],
  },
  {
    id: 'nouvelle',
    fr: 'Bonne ou mauvaise nouvelle',
    ar: 'الأمر السار والمكروه',
    items: [
      {
        ar: 'الْحَمْدُ لِلَّهِ الَّذِي بِنِعْمَتِهِ تَتِمُّ الصَّالِحَاتُ',
        fr: 'Pour une bonne nouvelle : louange à Allah par la grâce de qui s’accomplissent les bonnes choses.',
        an: 'إذا أتاه أمر يسرّه.',
        n: 1,
        src: ['IM'],
      },
      {
        ar: 'الْحَمْدُ لِلَّهِ عَلَىٰ كُلِّ حَالٍ',
        fr: 'Pour ce qui déplaît : louange à Allah en toute situation.',
        an: 'إذا أتاه أمر يكرهه.',
        n: 1,
        src: ['IM'],
      },
    ],
  },
  {
    id: 'assemblee',
    fr: 'Fin d’une assemblée',
    ar: 'كفارة المجلس',
    items: [
      {
        ar: 'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ، أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا أَنْتَ، أَسْتَغْفِرُكَ وَأَتُوبُ إِلَيْكَ',
        fr: 'En quittant une assemblée : gloire et louange à Toi, ô Allah ; j’atteste qu’il n’y a de divinité que Toi, je Te demande pardon et je me repens à Toi.',
        n: 1,
        src: ['T'],
      },
    ],
  },
  {
    id: 'pardon',
    fr: 'Demande de pardon',
    ar: 'الاستغفار والتوبة',
    items: [
      {
        ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        fr: 'Sayyid al-istighfâr, la meilleure demande de pardon : ô Allah, Tu es mon Seigneur… Je reconnais Ta grâce sur moi et je reconnais mon péché : pardonne-moi, car nul ne pardonne les péchés sauf Toi.',
        an: 'سيد الاستغفار.',
        n: 1,
        src: ['B'],
      },
      {
        ar: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ',
        fr: 'Je demande pardon à Allah et je me repens à Lui (cent fois par jour).',
        an: 'مائة مرة في اليوم.',
        n: 100,
        src: ['B', 'M'],
      },
      {
        ar: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ، إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
        fr: 'Seigneur, pardonne-moi et accepte mon repentir : Tu es Celui qui accueille le repentir, le Très-Miséricordieux.',
        n: 1,
        src: ['AD', 'T'],
      },
    ],
  },
]

/** Pour chercher sans tenir compte des voyelles arabes, des formes de l'alif ni des accents français. */
export function normalizeSearch(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ً-ٰٟۖ-ۭـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/[’'‘]/g, '')
    .toLowerCase()
    .trim()
}

/** Chapitres dont le titre ou un texte contient la recherche (tous si la recherche est vide). */
export function searchHisn(query: string, chapters: readonly HisnChapter[] = HISN): readonly HisnChapter[] {
  const q = normalizeSearch(query)
  if (!q) return chapters
  return chapters.filter((c) =>
    [c.fr, c.ar, ...c.items.flatMap((d) => [d.ar, d.fr, d.an ?? ''])].some((s) => normalizeSearch(s).includes(q)),
  )
}

/** « Al-Bukhârî et Muslim » / « البخاري ومسلم ». */
export function formatSources(src: readonly Source[], lang: 'fr' | 'ar'): string {
  const names = src.map((s) => SOURCES[s][lang])
  if (names.length < 2) return names.join('')
  return lang === 'ar' ? names.join(' و') : `${names.slice(0, -1).join(', ')} et ${names[names.length - 1]}`
}
