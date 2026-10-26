import { addDays, daysBetween } from '@/lib/dates'

// Modèles d'étapes pour « Proposer des étapes », sans IA. Textes à faire relire (phase 5).

export type TemplateId = 'memorize' | 'save' | 'business' | 'learn' | 'travel' | 'ramadan' | 'family' | 'debt'

export type Template = {
  id: TemplateId
  /** Mots-clés (sans accents, en minuscules) pour reconnaître le modèle dans le nom du projet. */
  keywords: readonly string[]
  steps: readonly { fr: string; ar: string }[]
}

export const TEMPLATES: readonly Template[] = [
  {
    id: 'memorize',
    keywords: [
      'memoriser',
      'apprendre par coeur',
      'hifz',
      'sourate',
      'surah',
      'juz',
      'coran',
      'حفظ',
      'سورة',
      'جزء',
      'القرآن',
    ],
    steps: [
      { fr: 'Choisir la sourate ou le juz et un mushaf unique', ar: 'اختيار السورة أو الجزء ومصحف واحد' },
      { fr: 'Fixer un moment chaque jour (après Fajr par exemple)', ar: 'تحديد وقت يومي (بعد الفجر مثلًا)' },
      { fr: 'Écouter la récitation d’un récitateur', ar: 'الاستماع إلى تلاوة قارئ' },
      { fr: 'Apprendre 3 à 5 versets par jour', ar: 'حفظ من 3 إلى 5 آيات يوميًا' },
      { fr: 'Réviser chaque jour ce qui est déjà appris', ar: 'مراجعة المحفوظ كل يوم' },
      { fr: 'Réciter à quelqu’un une fois par semaine', ar: 'التسميع على شخص مرة في الأسبوع' },
      { fr: 'Réciter le tout dans la prière', ar: 'قراءة المحفوظ كاملًا في الصلاة' },
    ],
  },
  {
    id: 'save',
    keywords: [
      'epargner',
      'economiser',
      'omra',
      'umrah',
      'hajj',
      'acheter',
      'achat',
      'mouton',
      'voiture',
      'ادخار',
      'عمرة',
      'الحج',
      'شراء',
    ],
    steps: [
      { fr: 'Fixer le montant à atteindre', ar: 'تحديد المبلغ المستهدف' },
      { fr: 'Créer l’objectif dans Budget → Épargne', ar: 'إنشاء الهدف في الميزانية ← الادخار' },
      { fr: 'Choisir le montant à mettre de côté chaque mois', ar: 'تحديد المبلغ الشهري للادخار' },
      { fr: 'Réduire une dépense non essentielle', ar: 'تقليل مصروف غير ضروري' },
      { fr: 'Verser l’épargne dès le jour du salaire', ar: 'إيداع المدخرات يوم استلام الراتب' },
      { fr: 'Faire le point chaque fin de mois', ar: 'مراجعة التقدم في نهاية كل شهر' },
    ],
  },
  {
    id: 'business',
    keywords: [
      'commerce',
      'boutique',
      'business',
      'vendre',
      'entreprise',
      'magasin',
      'projet commercial',
      'تجارة',
      'متجر',
      'دكان',
      'بيع',
      'مشروع تجاري',
    ],
    steps: [
      { fr: 'Écrire l’idée et le besoin des clients', ar: 'كتابة الفكرة وحاجة الزبائن' },
      { fr: 'Étudier les prix et les concurrents du quartier', ar: 'دراسة الأسعار والمنافسين في الحي' },
      { fr: 'Calculer le budget de départ', ar: 'حساب ميزانية البداية' },
      { fr: 'Trouver un local ou un emplacement', ar: 'إيجاد محل أو مكان' },
      { fr: 'Faire les papiers nécessaires', ar: 'استخراج الأوراق اللازمة' },
      { fr: 'Acheter le premier stock', ar: 'شراء البضاعة الأولى' },
      {
        fr: 'Faire connaître le commerce (famille, voisins, WhatsApp)',
        ar: 'التعريف بالتجارة (العائلة، الجيران، واتساب)',
      },
      { fr: 'Ouvrir, bismillah', ar: 'الافتتاح، بسم الله' },
    ],
  },
  {
    id: 'learn',
    keywords: [
      'apprendre',
      'langue',
      'arabe',
      'anglais',
      'francais',
      'cours',
      'formation',
      'competence',
      'تعلم',
      'لغة',
      'دورة',
      'مهارة',
    ],
    steps: [
      { fr: 'Choisir un objectif précis et mesurable', ar: 'اختيار هدف واضح وقابل للقياس' },
      { fr: 'Trouver un cours, un livre ou un professeur', ar: 'إيجاد دورة أو كتاب أو معلم' },
      { fr: 'Prévoir 20 minutes par jour', ar: 'تخصيص 20 دقيقة يوميًا' },
      { fr: 'Pratiquer avec quelqu’un chaque semaine', ar: 'التدرب مع شخص كل أسبوع' },
      { fr: 'Faire un petit bilan chaque mois', ar: 'تقييم صغير كل شهر' },
      { fr: 'Utiliser la compétence dans un vrai projet', ar: 'استعمال المهارة في مشروع حقيقي' },
    ],
  },
  {
    id: 'travel',
    keywords: ['voyage', 'voyager', 'partir', 'visa', 'billet', 'vacances', 'سفر', 'رحلة', 'تأشيرة', 'تذكرة'],
    steps: [
      { fr: 'Choisir la destination et les dates', ar: 'اختيار الوجهة والتواريخ' },
      { fr: 'Vérifier le passeport et le visa', ar: 'التحقق من جواز السفر والتأشيرة' },
      { fr: 'Fixer le budget du voyage', ar: 'تحديد ميزانية السفر' },
      { fr: 'Réserver le transport', ar: 'حجز وسيلة النقل' },
      { fr: 'Réserver le logement', ar: 'حجز السكن' },
      { fr: 'Préparer les bagages et les documents', ar: 'تجهيز الأمتعة والوثائق' },
      { fr: 'Apprendre le du‘â’ du voyage', ar: 'حفظ دعاء السفر' },
    ],
  },
  {
    id: 'ramadan',
    keywords: ['ramadan', 'ramadhan', 'jeune', 'رمضان', 'صيام'],
    steps: [
      { fr: 'Rattraper les jours de jeûne manqués', ar: 'قضاء الأيام الفائتة من الصيام' },
      { fr: 'Jeûner quelques jours en Cha‘bane', ar: 'صيام بعض الأيام في شعبان' },
      { fr: 'Fixer un objectif de Coran (une khatma ?)', ar: 'تحديد هدف للقرآن (ختمة؟)' },
      { fr: 'Prévoir le budget des courses et de la sadaqa', ar: 'تخصيص ميزانية للمشتريات والصدقة' },
      { fr: 'Préparer la liste des du‘â’', ar: 'تجهيز قائمة الأدعية' },
      { fr: 'Organiser les horaires (suhûr, travail, tarawih)', ar: 'تنظيم الأوقات (السحور، العمل، التراويح)' },
      { fr: 'Prévoir la zakat al-fitr', ar: 'تجهيز زكاة الفطر' },
    ],
  },
  {
    id: 'family',
    keywords: [
      'mariage',
      'bapteme',
      'naissance',
      'aqiqa',
      'fete',
      'evenement',
      'famille',
      'tabaski',
      'aid',
      'زواج',
      'عرس',
      'عقيقة',
      'عيد',
      'مناسبة',
      'العائلة',
    ],
    steps: [
      { fr: 'Fixer la date et le lieu', ar: 'تحديد التاريخ والمكان' },
      { fr: 'Faire la liste des invités', ar: 'إعداد قائمة المدعوين' },
      { fr: 'Fixer le budget', ar: 'تحديد الميزانية' },
      { fr: 'Répartir les tâches dans la famille', ar: 'توزيع المهام على العائلة' },
      { fr: 'Réserver le repas et le matériel', ar: 'حجز الطعام والمعدات' },
      { fr: 'Envoyer les invitations', ar: 'إرسال الدعوات' },
      { fr: 'Remercier tout le monde après', ar: 'شكر الجميع بعد المناسبة' },
    ],
  },
  {
    id: 'debt',
    keywords: ['dette', 'rembourser', 'remboursement', 'credit', 'pret', 'دين', 'سداد', 'قرض'],
    steps: [
      { fr: 'Lister toutes les dettes dans Budget → Dettes', ar: 'تسجيل كل الديون في الميزانية ← الديون' },
      { fr: 'Parler avec chaque personne et fixer une date', ar: 'التحدث مع كل شخص وتحديد موعد' },
      { fr: 'Choisir un montant à rembourser chaque mois', ar: 'تحديد مبلغ شهري للسداد' },
      { fr: 'Commencer par la plus petite ou la plus urgente', ar: 'البدء بالأصغر أو الأكثر استعجالًا' },
      { fr: 'Éviter toute nouvelle dette pendant ce temps', ar: 'تجنب أي دين جديد خلال هذه المدة' },
      { fr: 'Noter chaque remboursement', ar: 'تسجيل كل سداد' },
    ],
  },
]

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[‘’'`]/g, ' ')

/** Modèle le plus proche du nom du projet (plus de mots-clés trouvés), ou null si aucun ne correspond. */
export function suggestTemplate(projectName: string): TemplateId | null {
  const name = normalize(projectName)
  let best: { id: TemplateId; score: number } | null = null
  for (const t of TEMPLATES) {
    const score = t.keywords.filter((k) => name.includes(normalize(k))).length
    if (score > 0 && (!best || score > best.score)) best = { id: t.id, score }
  }
  return best?.id ?? null
}

/**
 * Dates des étapes ajoutées : réparties régulièrement entre aujourd'hui et l'échéance du projet
 * (la dernière étape tombe le jour de l'échéance). Sans échéance, ou échéance passée : pas de date.
 */
export function spreadDueDates(count: number, today: string, deadline: string): string[] {
  if (!deadline || count <= 0) return Array.from({ length: count }, () => '')
  const span = daysBetween(today, deadline)
  if (span <= 0) return Array.from({ length: count }, () => '')
  return Array.from({ length: count }, (_, i) => addDays(today, Math.max(1, Math.round(((i + 1) * span) / count))))
}
