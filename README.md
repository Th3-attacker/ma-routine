# Sama Jàmm · سلامي

**Une vie organisée, un cœur apaisé.** · **حياة منظّمة، وقلب مطمئن.**

[Français](#français) · [العربية](#العربية)

---

## Français

Sama Jàmm (« ma paix » en wolof) est une application gratuite pour la vie quotidienne d'un musulman, en français et
en arabe. Elle fonctionne sans connexion, et tes données restent sur ton téléphone.

### Ce qu'elle fait

- **Prière** : les horaires de ta ville (Ligue islamique mondiale), le temps qui reste, la prière en cours, et le
  suivi de chaque prière (à l'heure, en retard, à rattraper).
- **Appel avant l'adhan** : « {ton prénom}, la prière », à voix haute quelques minutes avant, et en notification
  quand l'app est fermée.
- **Athkar** du matin, du soir, après la prière et avant de dormir, avec un compteur ; un tasbih.
- **Aujourd'hui** : le ciel du jour, la date hégirienne, un verset ou un hadith, le wird de Coran, les habitudes,
  le bilan du soir et le mode Ramadan.
- **Budget** en ouguiyas : dépenses et revenus, budgets par catégorie, dettes, épargne, opérations qui reviennent
  chaque mois, et des conseils du mois calculés sur le téléphone.
- **Projets** avec leurs étapes, leur intention (niyya) et leurs échéances ; l'app peut proposer des étapes.
- **Sécurité** : un code à 4 chiffres, et en option l'empreinte ou le visage.
- **Compte facultatif** (code reçu par e-mail) pour retrouver tes données sur un autre téléphone.

### L'installer sur ton téléphone

Ouvre <https://th3-attacker.github.io/ma-routine/>, puis :

- **Android (Chrome)** : menu ⋮ → « Installer l'application » (ou « Ajouter à l'écran d'accueil »).
- **iPhone (Safari)** : bouton Partager → « Sur l'écran d'accueil ». Sur iPhone, les notifications ne marchent
  qu'une fois l'app ajoutée à l'écran d'accueil (iOS 16.4 ou plus récent).

Après la première ouverture, l'app marche sans internet.

### Tes données

- Tout est enregistré **sur ton téléphone**. Pas de publicité, pas de statistiques, rien n'est vendu.
- Le code à 4 chiffres protège l'app contre un regard ou un accès rapide. Ce n'est pas un chiffrement.
- L'empreinte et le visage restent dans ton téléphone : l'app ne les voit jamais.
- Avec un compte, tes données sont copiées sur un serveur Supabase en Europe (Paris), visibles par toi seul. Le
  code, le thème, la langue et la taille du texte ne quittent jamais l'appareil.
- Réglages → Sauvegarde : tu peux télécharger toutes tes données dans un fichier, et les réimporter.

### Textes religieux

Les versets, hadiths et athkar viennent de sources reconnues (Hisn al-Muslim pour les athkar). Ils sont en cours de
relecture : la liste complète est dans [TEXTES-A-VERIFIER.md](TEXTES-A-VERIFIER.md). Une erreur ? Ouvre une
issue sur GitHub.

### Pour les développeurs

React 19, TypeScript, Vite, Dexie (IndexedDB), adhan-js, TanStack Router / Query / Form, Tailwind et shadcn/ui,
i18next, vite-plugin-pwa ; Supabase (compte, synchro, notifications) en option. Tout est gratuit.

```bash
pnpm install
pnpm dev          # serveur local
pnpm verify       # format, lint, types, tests
pnpm build && pnpm test:e2e
```

Pour le compte et les notifications, copier `.env.example` en `.env.local` et remplir les clés publiques du projet
Supabase et la clé publique VAPID. Sans ces clés, l'app reste 100 % locale. Les règles du projet sont dans
[CLAUDE.md](CLAUDE.md).

---

<div dir="rtl" lang="ar">

## العربية

سلامي (Sama Jàmm بالولوفية، ومعناه «سلامي») تطبيق مجاني للحياة اليومية للمسلم، بالعربية والفرنسية. يعمل دون اتصال،
وبياناتك تبقى على هاتفك.

### ماذا يقدّم

- **الصلاة**: مواقيت مدينتك (رابطة العالم الإسلامي)، والوقت المتبقي، والصلاة الحالية، ومتابعة كل صلاة (في وقتها،
  متأخرة، قضاء).
- **النداء قبل الأذان**: «{اسمك}، الصلاة» بصوت مسموع قبل الأذان ببضع دقائق، وفي إشعار إذا كان التطبيق مغلقًا.
- **الأذكار**: أذكار الصباح والمساء وبعد الصلاة وقبل النوم، مع عدّاد، ومسبحة.
- **اليوم**: سماء اليوم، والتاريخ الهجري، وآية أو حديث، وورد القرآن، والعادات، وحصيلة المساء، ووضع رمضان.
- **الميزانية** بالأوقية: المصاريف والمداخيل، وميزانية لكل فئة، والديون، والادخار، والعمليات الشهرية، ونصائح
  الشهر محسوبة على الهاتف.
- **المشاريع** بخطواتها ونيتها ومواعيدها، ويمكن للتطبيق أن يقترح خطوات.
- **الأمان**: رمز من 4 أرقام، والبصمة أو الوجه اختياريًا.
- **حساب اختياري** (رمز يصلك بالبريد) لاسترجاع بياناتك على هاتف آخر.

### تثبيته على هاتفك

افتح <https://th3-attacker.github.io/ma-routine/> ثم:

- **أندرويد (Chrome)**: القائمة ⋮ ← «تثبيت التطبيق» (أو «إضافة إلى الشاشة الرئيسية»).
- **آيفون (Safari)**: زر المشاركة ← «إضافة إلى الشاشة الرئيسية». على آيفون لا تعمل الإشعارات إلا بعد إضافة
  التطبيق إلى الشاشة الرئيسية (iOS 16.4 أو أحدث).

بعد أول فتح، يعمل التطبيق دون إنترنت.

### بياناتك

- كل شيء محفوظ **على هاتفك**. لا إعلانات ولا إحصاءات، ولا يُباع شيء.
- الرمز من 4 أرقام يحمي التطبيق من نظرة عابرة أو استعمال سريع. ليس تشفيرًا.
- البصمة والوجه يبقيان في هاتفك: التطبيق لا يراهما أبدًا.
- مع الحساب، تُنسخ بياناتك إلى خادم Supabase في أوروبا (باريس)، ولا يراها غيرك. الرمز والمظهر واللغة وحجم الخط
  لا تغادر الجهاز أبدًا.
- الإعدادات ← النسخ الاحتياطي: يمكنك تنزيل كل بياناتك في ملف واستيرادها من جديد.

### النصوص الدينية

الآيات والأحاديث والأذكار مأخوذة من مصادر معروفة (حصن المسلم للأذكار)، وهي قيد المراجعة: القائمة الكاملة في
[TEXTES-A-VERIFIER.md](TEXTES-A-VERIFIER.md). وجدت خطأ؟ افتح «issue» على GitHub.

</div>
