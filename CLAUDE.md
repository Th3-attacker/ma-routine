# Sama Jàmm (سلامي) — PWA de vie quotidienne musulmane (ex-ELHADJ)

Nom en wolof, devise « Une vie organisée, un cœur apaisé. » Les clés internes gardent `elhadj` (localStorage `elhadj.*`,
base Dexie `elhadj`, sauvegardes `app: 'ELHADJ'`) pour ne perdre aucune donnée.

Le cahier des charges complet a été donné par l'utilisateur dans la première session. La référence visuelle et
fonctionnelle validée est `maquette-elhadj.html` (racine) : couleurs, polices, écrans, libellés FR/AR, données
(athkar, versets, villes…), comportements. **Ne pas reprendre** de la maquette : `window.claude`, son calcul maison
des horaires (→ adhan-js) et `zoom` pour la taille du texte (→ `font-size` de `<html>`).

## Façon de travailler

- Toujours répondre **en français, avec des mots simples** : l'utilisateur n'est pas développeur expérimenté.
  Expliquer pas à pas ce qu'il doit faire lui-même (comptes, réglages).
- Décisions : outil de questions à choix (2 à 4 options, recommandation en premier avec « (Recommandé) »,
  une ligne d'explication). Jamais de question ouverte si un choix suffit.
- Avant de coder une phase : montrer son plan en quelques points et poser les questions.
- Fin de phase : tests + build verts → commit + push → résumé court → demander (avec choix) si on passe à la suite.
- **Coût zéro** : aucun service ni bibliothèque payante. **Aucune donnée vers des tiers**, pas d'analytics.
- **Secrets** jamais commités : `.env.local` (ignoré), secrets GitHub Actions ou Supabase.
- **HTML sémantique** obligatoire : `header`/`nav`/`main`, un `h1` par écran, `section` avec titre
  (`aria-labelledby`), `fieldset`/`legend` pour les groupes de choix, `ul`/`li`, `button` pour les actions et
  `Link` pour la navigation, `time` pour les dates.
- Aucun texte en dur dans les composants : tout passe par i18next (`src/i18n/fr.json`, `ar.json`, clés typées).

## Branches et mise en ligne

- **Jamais de commit direct sur `dev` ni sur `main`.** Chaque travail suit ce chemin :
  1. une **issue** GitHub (`gh issue create`), prévue dans le plan de la phase ;
  2. une **branche** créée depuis `dev`, nommée d'après l'issue : `feat/12-horaires-priere`, `fix/…`, `docs/…` ;
  3. des **commits** courts qui citent l'issue (`(#12)`) ;
  4. `pnpm verify` (formate, lint, types, tests), puis `pnpm build && pnpm test:e2e` ;
  5. une **PR vers `dev`** (`gh pr create --base dev`) avec `Closes #12`, que je fusionne moi-même
     (`gh pr merge --squash --delete-branch`) quand la CI est verte ;
  6. « Closes » ne ferme l'issue qu'en arrivant sur `main` : la fermer à la main
     (`gh issue close 12 -c "Fusionnée dans dev par #13."`).
- Une phase validée passe de `dev` à **`main`** par une PR ; `main` est mise en ligne.
- `.github/workflows/ci.yml` : lint, format, tests, build et Playwright sur chaque push ; déploiement GitHub Pages
  seulement depuis `main`. URL : `https://th3-attacker.github.io/ma-routine/` (`base: '/ma-routine/'`).

## Stack

React 19 + TypeScript strict + Vite 8 · pnpm · TanStack Router (code-based, `createHashHistory`) · TanStack Query
(`networkMode: 'offlineFirst'`) · TanStack Form + zod · shadcn/ui (style radix-nova, `rtl: true`) + Tailwind v4 ·
i18next/react-i18next · lucide-react + icônes SVG de la maquette (`src/components/icons.tsx`) · @fontsource
(Reem Kufi titres, Manrope texte latin, IBM Plex Sans Arabic texte arabe, Amiri Coran/athkar) · vite-plugin-pwa +
@vite-pwa/assets-generator · Dexie + dexie-react-hooks (phase 1A) · adhan (phase 1A) · Supabase (phase 2) ·
Web Push VAPID (phase 3) · Vitest + Testing Library · Playwright (360 et 390 px) · ESLint + Prettier.

## Commandes

```
pnpm dev            # serveur local
pnpm dev:phone      # serveur HTTPS sur le Wi-Fi, pour tester sur un téléphone (le code à 4 chiffres exige https)
pnpm test           # Vitest
pnpm test:e2e       # Playwright (après pnpm build) ; la CI ajoute WebKit + profil iPhone 13 (WEBKIT=1 en local)
pnpm verify         # formate, puis lint + types + tests (avant chaque commit)
pnpm lint && pnpm format:check
pnpm build          # tsc -b + vite build
pnpm icons          # régénère les icônes PWA depuis public/logo.svg (pwa-assets.config.ts)
```

## Architecture

```
src/app/        router.tsx, AppLayout, Providers (QueryClient + préférences), device-prefs.ts, fonts.ts
src/routes/     aujourdhui, priere, athkar, budget, projets (Réglages = Drawer, components/SettingsDrawer)
src/i18n/       fr.json, ar.json, index.ts, i18next.d.ts
src/features/   prayer, athkar, tasbih, daily, ramadan, budget, debts, savings, recurring, projects, quran, habits, calendar
src/db/         schéma Dexie        src/sync/  Supabase + moteur de synchro        src/push/  notifications
src/components/ ui/ (shadcn, ne pas reformater) + composants ELHADJ (AppHeader, TabBar, ChipGroup…)
src/lib/        dates (fuseau de la ville), montants, durées, storage
supabase/       migrations/, functions/send-prayer-push/
e2e/            tests Playwright
```

## Thème, langue, taille du texte (préférences de l'appareil, jamais synchronisées)

- Clés localStorage `elhadj.lang`, `elhadj.mode`, `elhadj.size` (comme la maquette), lues aussi par le script inline
  de `index.html` pour éviter un flash. Logique dans `src/app/device-prefs.ts`, état dans `PreferencesProvider`.
- Thème : Automatique → Clair → Sombre ; classe `.dark` sur `<html>`. Tokens dans `src/index.css` : noms de la
  maquette (`--bg`, `--surface`, `--ink`, `--gold`, `--c1`…, `--sky-*`), sauf `--muted` de la maquette renommé
  **`--ink-3`** (shadcn utilise `--muted` comme fond). Les variables shadcn pointent vers ces tokens.
  Le ciel et la carte Ramadan gardent les mêmes couleurs dans les deux thèmes.
- Taille du texte : `font-size` de `<html>` à 92/100/110/122 %. Tout en `rem` suit. **L'en-tête est en px** pour
  ne jamais déborder ; sous 420 px, le nom arabe passe sous le nom latin.
- Arabe : `lang="ar" dir="rtl"` sur `<html>`, `DirectionProvider` (Radix), propriétés logiques Tailwind
  (`ms-`, `pe-`, `start-`, `text-start`…), `.rtl-flip` pour l'arc solaire et les flèches, jamais
  d'espacement de lettres ni de majuscules forcées sur de l'arabe (`rtl:tracking-normal rtl:normal-case`).
- Dates : `fr-FR` / `ar-MR-u-nu-latn` (mois mauritaniens, chiffres latins), dans le fuseau de la ville.

## Choix techniques à garder

- **Listes déroulantes : `AppSelect` (natif)**, jamais le Select dessiné de shadcn : sur iPhone il ne défile pas
  dans un volet du bas. Volets : `AppDrawer`. Suppressions : `ConfirmDialog`.
- **Toasts traversables** (`pointer-events: none`, sauf leurs boutons) et `scroll-padding` haut/bas : rien ne doit
  être caché sous la barre d'onglets ou un message.
- **Montants** : entiers, `formatMoney` (espace insécable classique, pas l'espace fine). En arabe, les nombres
  (`.tabular`) prennent la police du texte : le 0 de Reem Kufi ressemble à ٥.
- **Tests** : la CI lance aussi WebKit + iPhone 13 (60 s par test, captures en artefact `playwright-results`).
  Dans les tests, viser les onglets avec `tab(page, 'Budget')` ; après `page.reload()`, ne pas refaire `goto`.

## Qualité (toujours)

360 px sans défilement horizontal dans les 2 langues et les 4 tailles · cibles tactiles ≥ 44 px · safe areas ·
hors connexion après la première visite · `lang="ar"` sur chaque texte arabe · libellés aria traduits ·
focus visible · `prefers-reduced-motion`.

## Phases

0 Mise en place ✅ · 1A Cœur hors connexion (Dexie, Réglages, Aujourd'hui, Prière, Athkar, tasbih) ✅ ·
1A+ Verrou à 4 chiffres et appel avant l'adhan (Ajout n° 1) ✅ ·
1B Budget, projets, bilan du soir, Ramadan, export/import (dont JSON de la maquette) ✅ · 2 Compte + synchro Supabase
(code à 6 chiffres par e-mail) · 3 Notifications d'adhan · 4 Conseils sans IA · 5 Finitions (a11y, Lighthouse ≥ 90,
README FR/AR, liste des textes à faire vérifier).

Valeurs de référence pour les tests (Nouakchott 18,0858 ; −15,9785, 23/10/2026, Ligue islamique mondiale, Asr
standard, ±2 min) : Fajr 05:47 · Chourouq 07:00 · Dhohr 12:48 · Asr 16:08 · Maghrib 18:36 · Icha 19:45 ;
hégirien 12 Joumada al-oula 1448 ; le 24/10/2026 est le premier des jours blancs.

## Ajout n° 1 : verrou à 4 chiffres et appel avant l'adhan (phase 1A+)

- **Verrou de l'app sur l'appareil**, distinct du compte Supabase (qui garde le code e-mail, phase 2).
  Redemandé au démarrage et au retour après le délai (0 / 1 / 5 par défaut / 15 min, `visibilitychange`).
- Inscription en 3 étapes : Bienvenue (langue) → Prénom + prénom arabe (facultatif) + ville → Code ×2.
  Codes refusés : 4 chiffres identiques, suites croissantes / décroissantes.
- Clavier 3 × 4 dessiné, `dir="ltr"`, touches ≥ 56 px, validation au 4e chiffre, tremblement + vibration.
  Tant que le code n'est pas bon, **aucune donnée n'est chargée** dans l'interface.
- Paliers : 5e erreur → 30 s, 6e → 1 min, 7e → 5 min, ensuite 15 min ; enregistrés (survivent au rechargement).
- Code oublié : sans compte → effacer l'appareil (confirmation en 2 temps) ; avec compte → code e-mail (phase 2).
- Table Dexie **`security`** (jamais synchronisée) : hachage PBKDF2-SHA-256, sel 16 octets, 210 000 itérations.
  Ne jamais promettre un chiffrement ; ne pas chiffrer la base avec ce code. WebAuthn : à proposer en phase 5.
- **Appel avant l'adhan** : « {prénom}, la prière » / « {الاسم}، الصلاة » (prénom arabe sinon latin), N min avant
  (3 par défaut, 1–15), une fois par prière et par jour. App ouverte : voix Web Speech (0,95, voix ar-* / fr-*,
  pas pendant le plein écran des athkar) + bandeau 2 min. App fermée : notification en phase 3 (`call:<prière>`
  dans `push_log`, une seule notification si l'alerte d'adhan tombe au même moment).
- `settings.nameAr` et `settings.call` sont synchronisés (le serveur en a besoin).

## Logo

Pas encore de photo : monogramme « SJ » (Reem Kufi, tracé dans `public/logo.svg`) sur indigo, contour doré.
Si `logo.jpg`/`logo.png` est ajouté à la racine : l'utiliser recadré en rond dans `Logo.tsx` et régénérer les
icônes (`pwa-assets.config.ts` → `images`, puis `pnpm icons`).
