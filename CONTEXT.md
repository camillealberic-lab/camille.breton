# Contexte complet — Portfolio Camille Breton
> Généré le 15 avril 2026 — à utiliser pour démarrer une nouvelle conversation Claude Code

---

## 1. Projet & stack

- **Framework** : Next.js 14 App Router, TypeScript
- **Styles** : Tailwind CSS (config custom : couleurs `cream`, `ink`, `orange`, `blue`, `green`)
- **Animation** : Framer Motion (`motion`, `AnimatePresence`, `useAnimation`)
- **Smooth scroll** : Lenis (`window.__lenis`)
- **Dossier racine** : `/Users/camillebreton/Desktop/ALL Camille/Portolio/`
- **Dev server** : `npm run dev` → `localhost:3000`

---

## 2. Fichiers clés

```
app/
  page.tsx                        ← Accueil (carousel projets)
  about/page.tsx                  ← Page À propos
  work/[slug]/
    page.tsx                      ← Route dynamique projet
    ProjectDetail.tsx             ← Composant détail projet (très lourd)
  icon.svg                        ← Favicon orange rectangle

components/
  Navbar.tsx                      ← Navigation fixe
  ArchivePanel.tsx                ← Panel vert Archive (portal body)
  Preloader.tsx                   ← Écran de chargement avec trail

lib/
  projects.ts                     ← Données de tous les projets + interfaces
  constants.ts                    ← NAV_HEIGHT, CONTACT, SCROLL_THRESHOLD
  easing.ts                       ← EASE_OUT, EASE_EXPO
  navTransition.ts                ← flagFromNav() pour transitions SPA

public/projects/
  jacquemus/
  ethikwear/
  henri cartier bresson/
  shift/
  la-boutik-deco/
  queen/
  archive/
```

---

## 3. Design system (Tailwind)

| Token | Valeur |
|---|---|
| `cream` | `#F5F0E8` (fond principal) |
| `ink` | `#0A0A0A` (texte) |
| `orange` | `#FE6D2C` |
| `blue` | bleu foncé (panel contact About) |
| `green` | vert (panel Archive) |
| `NAV_HEIGHT` | `clamp(56px, 12vw, 172px)` |

**Fonts** : `font-geologica` (titres), `font-montserrat` (corps)

---

## 4. `lib/projects.ts` — état final complet

### Interface Project
```ts
{
  slug, title, category, year, shortDesc, description,
  reflection?,   // texte fin de page (fallback = description)
  tools,
  images: {
    cover,       // image carousel accueil
    left,        // 2e image strip gauche desktop
    detail[],    // galerie page projet
    positions?,  // objectPosition par image (home grid)
    scales?,     // scale par image (home grid)
  },
  detailCover?,          // image hero page projet (fallback = cover)
  detailCoverPosition?,  // objectPosition hero image
  link?,                 // lien Figma/prototype
  homeCount?,            // nb images home grid (défaut 4)
  video?,                // vidéo principale page projet
  accentColor,
}
```

### Projets — covers actuelles

| Slug | `cover` (accueil carousel) | `detailCover` (hero page projet) | Notes position |
|---|---|---|---|
| `jacquemus` | `up copie.mp4` | `P_toprightright.webp` | `detailCoverPosition: 'calc(50% + 20px) center'` |
| `ethkwear` | `home_mov.mp4` | `Home_d.webp` | `detailCoverPosition: 'center -60px'` |
| `henri-cartier-bresson` | `2.mp4` | `Screen_4.webp` | — |
| `barbershop-shift-bordeaux` | `1.webp` | `2.webp` | `detailCoverPosition: 'calc(50% + 5px) center'` |
| `la-boutik-deco` | `4.mp4` | `imgaaa.webp` | — |
| `queen` | `1.mp4` | `11.webp` | — |

> ⚠️ **À vérifier avec Camille** : `detailCover` de Shift (`2.webp`) et La Boutik Deco (`imgaaa.webp`) — peut-être pas les bonnes images, jamais confirmées.

---

## 5. `app/page.tsx` — Accueil

### Desktop
- `fixed inset-0 bg-cream overflow-hidden flex flex-col`
- Strip gauche : 2 images par projet, `width: calc(24vw + 10px)`
- Strip droite : 4 images par projet, `width: calc(48vw + 30px)`
- Nav centrale : titres projets, scroll wheel/keyboard → `setActiveIndex`
- Gradient top sur chaque strip : `h-14 bg-gradient-to-b from-cream to-transparent z-10`
- Numéro projet bas-gauche : `opacity: 0.1`, `clamp(48px, 6.5vw, 100px)`
- Transition : `EASE_EXPO`, durée 0.75s

### Mobile (`md:hidden`)
- **Carousel vertical centré** sur l'image active
- `mobileContainerRef` + `ResizeObserver` → `mobileCardH`, `mobileContainerH`
- `MOBILE_GAP = 12px`, images avec marge `left:16, right:16`
- `mobileStripY = containerH/2 - activeIndex*(cardH+gap) - cardH/2`
- Image active : `opacity: 1`, `blur(0px)`
- Images inactives : `opacity: 0.55`, `blur(1px)`
- Titres overlay haut-gauche (`z-20`, `pt-5 pl-5`) : actif `fontWeight:700 opacity:1 fontSize:clamp(14px,3.8vw,22px)`, inactifs `fontWeight:400 opacity:0.1`
- Archive : `opacity: 0.07`
- **Gradient top** (FIXE, `md:hidden`) :
  ```jsx
  <div className="md:hidden fixed inset-x-0 top-0 z-[15] pointer-events-none"
    style={{ height:'38vh', background:'linear-gradient(to bottom, var(--cream) 0%, var(--cream) 42%, transparent 100%)', opacity: 1 }} />
  ```
- **Gradient bas** (absolu dans le container mobile) :
  ```jsx
  <div className="absolute inset-x-0 bottom-0 z-10 pointer-events-none"
    style={{ height:'22%', background:'linear-gradient(to top, var(--cream) 0%, transparent 100%)' }} />
  ```

### Swipe mobile
- `touchstart` / `touchmove` (passive:false) → accumulation → `go(1|-1)`
- Seuil : `SCROLL_THRESHOLD` depuis `lib/constants.ts`
- Throttle 600ms entre navigations

### Archive
- `ARCHIVE_IDX = projects.length` (dernier index)
- Active `ArchivePanel` via `isArchive` prop

---

## 6. `app/about/page.tsx`

- `fixed inset-0 bg-cream overflow-hidden`
- **"07" desktop** : `hidden md:block absolute left-6 bottom-7px`, `clamp(220px,40vw,600px)`, orange
- **"07" mobile** : `block md:hidden absolute right-4 bottom-7px`, `clamp(130px,32vw,260px)`, orange, `font-black`
- Sidebar droite : `w-full md:w-[42%]`, sections Biographie / Compétences / Outils / Contact / Réseaux
- Texte : `text-[11.5px] md:text-[13.5px]`
- **Panel bleu contact** (portail `document.body`, `z-[60]`) :
  - Déclenché par scroll wheel (accumulé > 380px) OU touch swipe vers le haut
  - `touchstart` + `touchmove` passive:false
  - Animation : `y: '100%'` → `y: '0%'`
  - Contenu : "Let's work / together." + lien mailto

---

## 7. `components/Navbar.tsx`

### Pages normales (Works, About)
- `fixed top-0 left-0 w-full z-50 px-8 md:px-10 pt-2`
- Titre actif : gros, gauche — `clamp(44px,8vw,132px)`, `font-geologica font-semibold`
- Pages inactives : petites, droite
- Animation stagger par caractère (`NavStaggerText`) au clic de navigation
- Délai navigation : 820ms (laisse le stagger jouer)
- `flagFromNav()` → template.tsx entre depuis le bas

### Pages projets (`/work/[slug]`)
- Navbar minimaliste : `fixed top-0 right-0`, petits liens `Works , About , Contact`
- `pointer-events-none` sauf les liens eux-mêmes

---

## 8. `components/ArchivePanel.tsx`

- Panel vert (`var(--green)`), `fixed inset-0 z-[60]`, portail body
- Texte "Archive" centré, `clamp(64px,11vw,172px)`
- **Desktop** : trail d'images au mouvement de souris (MIN_DIST=90px entre spawns)
- **Mobile** : spawn au `touchend` avec direction aléatoire
- Images trail : `ARCHIVE_IMGS` = 5 webp dans `/projects/archive/`
- Cursor custom desktop : "Move cursor" centré sur la souris
- Hint mobile : "Tap to explore" bas de page

---

## 9. `components/Preloader.tsx`

- Plein écran `fixed inset-0 bg-cream z-[100]`
- **Desktop** : trail de formes SVG au mouvement de souris (MIN_DIST=70px)
- **Mobile** : spawn de formes au `click`
- Formes : cercles, rectangles, triangles — couleurs cream/orange/ink
- Disparaît après délai ou interaction suffisante

---

## 10. `app/work/[slug]/ProjectDetail.tsx`

### Hero
```jsx
<div className="w-full h-[75vh] overflow-hidden">
  // video ou img selon extension
  // src = project.detailCover ?? project.images.cover
  // objectPosition = project.detailCoverPosition si défini
</div>
```

### Meta
```jsx
<div className="px-8 md:px-16 py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-ink/10">
  // category + title (h1 text-[5vw] md:text-[5vw])
  // year + tools + lien prototype
</div>
```

### Description
```jsx
<div className="px-8 md:px-16 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-24">
  // shortDesc (h2 text-[5.5vw] md:text-[2.2vw] font-semibold)
  // description (p text-[13px])
</div>
```

### Galerie — Layouts mobiles (IMPORTANT)

**Règle mobile** : toutes les sections côte-à-côte → `flex flex-col md:flex-row`

Patterns de classes appliqués :
```
"flex flex-col md:flex-row md:min-h-[55vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
"flex flex-col md:flex-row md:min-h-[60vh] mt-5 px-8 md:px-16 gap-4 md:gap-12"
"w-full md:w-[42%] flex flex-col justify-center pt-3 pb-0 md:py-12 gap-6"
"w-full md:w-[38%] flex flex-col justify-end pb-0 md:pb-12 gap-6"
"w-full md:w-[36%] flex flex-col justify-center gap-6"
```

Titres sections galerie :
- `text-[4.5vw] md:text-[1.6vw] font-semibold` (sections process/identité)

**La Boutik Deco section 3 spéciale** (phones mobiles) :
- `6.1.webp` : `hidden md:block` (masqué sur mobile)
- `7.mp4` : `w-full md:w-auto md:h-full` (pleine largeur sur mobile)

### Navigation inter-projets
- Wheel scroll en bas de page → accumulation → slide vers projet suivant
- Animation : `x: '-100vw'`, 0.72s, EASE_EXPO
- `_fromSlide` flag module-level → page suivante entre sans curtain

### Curtain d'entrée
- Entrée directe : rideau ink depuis le haut (`scaleY: 1→0`, `transformOrigin: top`)
- Entrée par slide : rideau cream depuis la droite (`x: 0→-100%`)

---

## 11. Favicon

```svg
<!-- app/icon.svg -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="5" fill="#FE6D2C"/>
</svg>
```

---

## 12. Historique des décisions importantes

### Covers projets
- **Séparation cover/detailCover** : le champ `cover` est utilisé pour le carousel accueil, le champ `detailCover` pour le hero de la page projet. Ne jamais les confondre.
- Jacquemus et Queen avaient déjà un `detailCover` custom depuis le début.
- Ethikwear, HCB, Shift, La Boutik Deco ont eu leur `detailCover` ajouté lors de cette session.

### Gradient mobile accueil
- Gradient `fixed` (pas `absolute`) pour partir du haut absolu de l'écran, flush avec la navbar. Si `absolute`, il part du bas de la navbar → ligne visible.
- `md:hidden` impératif pour ne pas affecter le desktop.
- Opacité `1` : les images doivent être totalement invisibles en haut.

### Layout mobile projets
- On est passé de `flex` (row uniquement) à `flex flex-col md:flex-row`.
- Les `w-[42%]` etc. doivent toujours avoir `w-full` en mobile.
- Le `py-12` des panneaux texte est préservé sur desktop via `md:py-12`.

---

## 13. Points à vérifier / work in progress

| Élément | Status | Note |
|---|---|---|
| `detailCover` Shift → `2.webp` | ⚠️ À confirmer | Jamais validé par Camille |
| `detailCover` La Boutik Deco → `imgaaa.webp` | ⚠️ À confirmer | Jamais validé |
| Ordre image/texte mobile | ⚠️ Non traité | Quand texte était à gauche en desktop, il apparaît avant l'image sur mobile — peut être corrigé avec `order-` Tailwind |
| `ethikwear` slug | ⚠️ Bug connu | Le slug dans projects.ts est `'ethkwear'` (sans le "i") — à corriger si jamais ça pose problème de routing |

---

## 14. Commandes utiles

```bash
# Démarrer le dev server
cd "/Users/camillebreton/Desktop/ALL Camille/Portolio"
npm run dev

# Vider le cache Next si comportement bizarre
rm -rf .next && npm run dev
```
