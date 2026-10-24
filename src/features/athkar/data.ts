// Athkar repris de maquette-elhadj.html (Hisn al-Muslim). Textes à faire vérifier en phase 5.
// ar : texte arabe · fr : sens en français · an : note arabe courte (remplace le sens quand l'app est en arabe) · n : répétitions

import type { AthkarSet } from '@/db/types'

export type Dhikr = { ar: string; fr: string; an?: string; n: number }

export type AthkarSeries = { ar: string; hintFr: string; hintAr: string; items: readonly Dhikr[] }

export const ATHKAR: Record<AthkarSet, AthkarSeries> = {
  matin: {
    ar: 'أذكار الصباح',
    hintFr: 'Après Fajr, jusqu’au milieu de la matinée.',
    hintAr: 'بعد الفجر إلى الضحى.',
    items: [
      {
        ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ ﴿٢٥٥﴾ ',
        fr: 'Âyat al-Kursî, le Verset du Trône (Al-Baqara, 255).',
        n: 1,
      },
      {
        ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾ ',
        fr: 'Sourate Al-Ikhlâs. Avec Al-Falaq et An-Nâs, trois fois matin et soir : elles te suffisent contre toute chose.',
        an: 'ثلاث مرات صباحًا ومساءً مع المعوذتين: تكفيك من كل شيء.',
        n: 3,
      },
      {
        ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾ ',
        fr: 'Sourate Al-Falaq : refuge auprès du Seigneur de l’aube contre le mal de la création, de la nuit et de l’envieux.',
        n: 3,
      },
      {
        ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾ ',
        fr: 'Sourate An-Nâs : refuge auprès du Seigneur des hommes contre le chuchoteur qui se dérobe.',
        n: 3,
      },
      {
        ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذَا الْيَوْمِ وَخَيْرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
        fr: 'Nous voici au matin, et la royauté appartient à Allah. Je Te demande le bien de ce jour et de ce qui le suit, et je me réfugie auprès de Toi contre son mal, la paresse et le châtiment.',
        n: 1,
      },
      {
        ar: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ',
        fr: 'Ô Allah, c’est par Toi que nous atteignons le matin et le soir, par Toi que nous vivons et mourons, et vers Toi est la résurrection.',
        n: 1,
      },
      {
        ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        fr: 'Sayyid al-istighfâr, la meilleure demande de pardon : je reconnais Tes bienfaits et mes fautes, pardonne-moi.',
        an: 'سيد الاستغفار.',
        n: 1,
      },
      {
        ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
        fr: 'Au nom d’Allah, avec le nom de qui rien ne nuit, ni sur terre ni dans le ciel. Il entend tout et sait tout.',
        n: 3,
      },
      {
        ar: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
        fr: 'J’agrée Allah comme Seigneur, l’islam comme religion et Muhammad ﷺ comme Prophète.',
        n: 3,
      },
      {
        ar: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ',
        fr: 'Ô Allah, accorde-moi la santé dans mon corps, mon ouïe et ma vue. Nulle divinité sauf Toi.',
        n: 3,
      },
      {
        ar: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
        fr: 'Allah me suffit, nulle divinité sauf Lui. En Lui je place ma confiance, Il est le Seigneur du Trône immense.',
        n: 7,
      },
      {
        ar: 'يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ',
        fr: 'Ô Vivant, ô Subsistant, j’implore Ta miséricorde : arrange toutes mes affaires et ne me laisse pas à moi-même un seul instant.',
        n: 1,
      },
      {
        ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
        fr: 'Gloire et louange à Allah, autant que le nombre de Ses créatures, Sa satisfaction, le poids de Son Trône et l’encre de Ses paroles.',
        n: 3,
      },
      {
        ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        fr: 'Nulle divinité sauf Allah, seul, sans associé. À Lui la royauté et la louange, et Il est capable de toute chose.',
        n: 10,
      },
      {
        ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        fr: 'Gloire et louange à Allah. Cent fois par jour, les péchés sont effacés, même nombreux comme l’écume de la mer.',
        an: 'مائة مرة في اليوم: حُطّت خطاياه وإن كانت مثل زبد البحر.',
        n: 100,
      },
      { ar: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', fr: 'Je demande pardon à Allah et je me repens à Lui.', n: 100 },
      {
        ar: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ',
        fr: 'Ô Allah, prie sur notre Prophète Muhammad et accorde-lui la paix.',
        n: 10,
      },
    ],
  },
  soir: {
    ar: 'أذكار المساء',
    hintFr: 'Entre Asr et Maghrib, ou au début de la nuit.',
    hintAr: 'من العصر إلى المغرب، أو أول الليل.',
    items: [
      {
        ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ ﴿٢٥٥﴾ ',
        fr: 'Âyat al-Kursî, le Verset du Trône (Al-Baqara, 255).',
        n: 1,
      },
      {
        ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾ ',
        fr: 'Sourate Al-Ikhlâs. Avec Al-Falaq et An-Nâs, trois fois matin et soir : elles te suffisent contre toute chose.',
        an: 'ثلاث مرات صباحًا ومساءً مع المعوذتين: تكفيك من كل شيء.',
        n: 3,
      },
      {
        ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾ ',
        fr: 'Sourate Al-Falaq : refuge auprès du Seigneur de l’aube contre le mal de la création, de la nuit et de l’envieux.',
        n: 3,
      },
      {
        ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾ ',
        fr: 'Sourate An-Nâs : refuge auprès du Seigneur des hommes contre le chuchoteur qui se dérobe.',
        n: 3,
      },
      {
        ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَٰذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَٰذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
        fr: 'Nous voici au soir, et la royauté appartient à Allah. Je Te demande le bien de cette nuit et de ce qui la suit, et je me réfugie auprès de Toi contre son mal, la paresse et le châtiment.',
        n: 1,
      },
      {
        ar: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ',
        fr: 'Ô Allah, c’est par Toi que nous atteignons le soir et le matin, par Toi que nous vivons et mourons, et vers Toi est le retour.',
        n: 1,
      },
      {
        ar: 'اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي، فَاغْفِرْ لِي فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ',
        fr: 'Sayyid al-istighfâr, la meilleure demande de pardon : je reconnais Tes bienfaits et mes fautes, pardonne-moi.',
        an: 'سيد الاستغفار.',
        n: 1,
      },
      {
        ar: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ، وَهُوَ السَّمِيعُ الْعَلِيمُ',
        fr: 'Au nom d’Allah, avec le nom de qui rien ne nuit, ni sur terre ni dans le ciel. Il entend tout et sait tout.',
        n: 3,
      },
      {
        ar: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالْإِسْلَامِ دِينًا، وَبِمُحَمَّدٍ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ نَبِيًّا',
        fr: 'J’agrée Allah comme Seigneur, l’islam comme religion et Muhammad ﷺ comme Prophète.',
        n: 3,
      },
      {
        ar: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لَا إِلَٰهَ إِلَّا أَنْتَ',
        fr: 'Ô Allah, accorde-moi la santé dans mon corps, mon ouïe et ma vue. Nulle divinité sauf Toi.',
        n: 3,
      },
      {
        ar: 'حَسْبِيَ اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ، عَلَيْهِ تَوَكَّلْتُ، وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
        fr: 'Allah me suffit, nulle divinité sauf Lui. En Lui je place ma confiance, Il est le Seigneur du Trône immense.',
        n: 7,
      },
      {
        ar: 'يَا حَيُّ يَا قَيُّومُ، بِرَحْمَتِكَ أَسْتَغِيثُ، أَصْلِحْ لِي شَأْنِي كُلَّهُ، وَلَا تَكِلْنِي إِلَىٰ نَفْسِي طَرْفَةَ عَيْنٍ',
        fr: 'Ô Vivant, ô Subsistant, j’implore Ta miséricorde : arrange toutes mes affaires et ne me laisse pas à moi-même un seul instant.',
        n: 1,
      },
      {
        ar: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
        fr: 'Je me réfugie dans les paroles parfaites d’Allah contre le mal de ce qu’Il a créé.',
        n: 3,
      },
      {
        ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        fr: 'Nulle divinité sauf Allah, seul, sans associé. À Lui la royauté et la louange, et Il est capable de toute chose.',
        n: 10,
      },
      {
        ar: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
        fr: 'Gloire et louange à Allah. Cent fois par jour, les péchés sont effacés, même nombreux comme l’écume de la mer.',
        an: 'مائة مرة في اليوم: حُطّت خطاياه وإن كانت مثل زبد البحر.',
        n: 100,
      },
      { ar: 'أَسْتَغْفِرُ اللَّهَ وَأَتُوبُ إِلَيْهِ', fr: 'Je demande pardon à Allah et je me repens à Lui.', n: 100 },
      {
        ar: 'اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ',
        fr: 'Ô Allah, prie sur notre Prophète Muhammad et accorde-lui la paix.',
        n: 10,
      },
    ],
  },
  salat: {
    ar: 'أذكار بعد الصلاة',
    hintFr: 'Après chaque prière obligatoire. Recommence la série à chaque prière.',
    hintAr: 'بعد كل صلاة مفروضة. أعد السلسلة بعد كل صلاة.',
    items: [
      { ar: 'أَسْتَغْفِرُ اللَّهَ', fr: 'Je demande pardon à Allah.', n: 3 },
      {
        ar: 'اللَّهُمَّ أَنْتَ السَّلَامُ، وَمِنْكَ السَّلَامُ، تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
        fr: 'Ô Allah, Tu es la Paix et de Toi vient la paix. Béni sois-Tu, ô Détenteur de la majesté et de la générosité.',
        n: 1,
      },
      {
        ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ، اللَّهُمَّ لَا مَانِعَ لِمَا أَعْطَيْتَ، وَلَا مُعْطِيَ لِمَا مَنَعْتَ، وَلَا يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ',
        fr: 'Nulle divinité sauf Allah… Nul ne retient ce que Tu donnes, nul ne donne ce que Tu retiens, et la fortune ne sert à rien face à Toi.',
        n: 1,
      },
      { ar: 'سُبْحَانَ اللَّهِ', fr: 'Gloire à Allah.', n: 33 },
      { ar: 'الْحَمْدُ لِلَّهِ', fr: 'Louange à Allah.', n: 33 },
      { ar: 'اللَّهُ أَكْبَرُ', fr: 'Allah est le plus grand.', n: 33 },
      {
        ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        fr: 'Pour compléter la centaine.',
        an: 'تمام المائة.',
        n: 1,
      },
      {
        ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ ﴿٢٥٥﴾ ',
        fr: 'Âyat al-Kursî, le Verset du Trône (Al-Baqara, 255).',
        n: 1,
      },
      {
        ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾ \n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾ \n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾ ',
        fr: 'Al-Ikhlâs, Al-Falaq et An-Nâs. Trois fois après Fajr et Maghrib.',
        an: 'ثلاث مرات بعد الفجر والمغرب.',
        n: 1,
      },
    ],
  },
  nuit: {
    ar: 'أذكار النوم',
    hintFr: 'Au moment de se coucher, allongé sur le côté droit.',
    hintAr: 'عند النوم، على الجنب الأيمن.',
    items: [
      {
        ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ ﴿٢٥٥﴾ ',
        fr: 'Âyat al-Kursî avant de dormir : un gardien d’Allah veille sur toi jusqu’au matin.',
        an: 'من قرأها عند نومه لم يزل عليه من الله حافظ حتى يصبح.',
        n: 1,
      },
      {
        ar: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ ۚ كُلٌّ آمَنَ بِاللَّهِ وَمَلَائِكَتِهِ وَكُتُبِهِ وَرُسُلِهِ لَا نُفَرِّقُ بَيْنَ أَحَدٍ مِّن رُّسُلِهِ ۚ وَقَالُوا سَمِعْنَا وَأَطَعْنَا ۖ غُفْرَانَكَ رَبَّنَا وَإِلَيْكَ الْمَصِيرُ ﴿٢٨٥﴾ لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا ۚ لَهَا مَا كَسَبَتْ وَعَلَيْهَا مَا اكْتَسَبَتْ ۗ رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا ۚ رَبَّنَا وَلَا تَحْمِلْ عَلَيْنَا إِصْرًا كَمَا حَمَلْتَهُ عَلَى الَّذِينَ مِن قَبْلِنَا ۚ رَبَّنَا وَلَا تُحَمِّلْنَا مَا لَا طَاقَةَ لَنَا بِهِ ۖ وَاعْفُ عَنَّا وَاغْفِرْ لَنَا وَارْحَمْنَا ۚ أَنتَ مَوْلَانَا فَانصُرْنَا عَلَى الْقَوْمِ الْكَافِرِينَ ﴿٢٨٦﴾ ',
        fr: 'Les deux derniers versets d’Al-Baqara : ils suffisent à celui qui les récite la nuit.',
        an: 'من قرأهما في ليلة كفتاه.',
        n: 1,
      },
      {
        ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ هُوَ اللَّهُ أَحَدٌ ﴿١﴾ اللَّهُ الصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ ﴿٤﴾ \n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾ \n\nبِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ\nقُلْ أَعُوذُ بِرَبِّ النَّاسِ ﴿١﴾ مَلِكِ النَّاسِ ﴿٢﴾ إِلَٰهِ النَّاسِ ﴿٣﴾ مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ﴿٤﴾ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ﴿٥﴾ مِنَ الْجِنَّةِ وَالنَّاسِ ﴿٦﴾ ',
        fr: 'Joins tes mains, souffle dedans, récite les trois sourates puis passe les mains sur ton corps.',
        an: 'يجمع كفّيه وينفث فيهما ويقرأ، ثم يمسح بهما ما استطاع من جسده.',
        n: 3,
      },
      {
        ar: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
        fr: 'C’est en Ton nom, ô Allah, que je meurs et que je vis.',
        n: 1,
      },
      {
        ar: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
        fr: 'Ô Allah, préserve-moi de Ton châtiment le jour où Tu ressusciteras Tes serviteurs.',
        n: 3,
      },
      { ar: 'سُبْحَانَ اللَّهِ', fr: 'Gloire à Allah.', n: 33 },
      { ar: 'الْحَمْدُ لِلَّهِ', fr: 'Louange à Allah.', n: 33 },
      { ar: 'اللَّهُ أَكْبَرُ', fr: 'Allah est le plus grand.', n: 34 },
    ],
  },
}

/** Formules du tasbih. */
export const TASBIH_FORMULAS: readonly { ar: string; fr: string }[] = [
  { ar: 'سُبْحَانَ اللَّهِ', fr: 'Subhân Allah' },
  { ar: 'الْحَمْدُ لِلَّهِ', fr: 'Al-hamdu lillah' },
  { ar: 'اللَّهُ أَكْبَرُ', fr: 'Allahu akbar' },
  { ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ', fr: 'Lâ ilâha illa Allah' },
  { ar: 'أَسْتَغْفِرُ اللَّهَ', fr: 'Astaghfirullah' },
  { ar: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ', fr: 'Salât ‘ala an-Nabi ﷺ' },
]
