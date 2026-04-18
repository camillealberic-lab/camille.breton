export interface Project {
  slug: string;
  title: string;
  category: string;
  year: string;
  shortDesc: string;
  description: string;
  /** Optional reflection text for the end-of-page section (falls back to description) */
  reflection?: string;
  tools: string[];
  images: {
    cover: string;
    left: string;
    detail: string[];
    /** objectPosition per detail image for the home grid (e.g. 'center 30%') */
    positions?: string[];
    /** scale per detail image for the home grid (e.g. 1.15) */
    scales?: number[];
  };
  /** Override cover shown in the project detail hero (falls back to images.cover) */
  detailCover?: string;
  /** Override cover shown only on mobile (falls back to detailCover, then images.cover) */
  detailCoverMobile?: string;
  /** objectPosition for the detail hero image on mobile (e.g. 'center calc(50% - 20px)') */
  detailCoverPosition?: string;
  /** objectPosition for the detail hero image on desktop (falls back to detailCoverPosition) */
  detailCoverPositionDesktop?: string;
  /** Hero height on mobile (e.g. '58vh'). Falls back to 75vh. Desktop always 75vh. */
  detailHeroHeightMobile?: string;
  /** External link (Figma prototype, live site…) displayed in the project meta */
  link?: string;
  /** Number of detail images shown on the home grid (default 4) */
  homeCount?: number;
  video?: string;
  accentColor: string;
}

export const projects: Project[] = [
  {
    slug: 'jacquemus',
    title: 'Jacquemus',
    category: '3D & Motion',
    year: '2025',
    shortDesc: 'Imagination d\'une publicité 3D pour un nouveau parfum.',
    description:
      'Première expérience sur Blender — sans IA. Concept d\'une publicité 3D autour d\'un nouveau parfum Jacquemus imaginaire, "Le Gadjo". Modélisation, éclairage et rendu entièrement réalisés à la main, en explorant les fondamentaux de la 3D au service d\'une direction artistique épurée.',
    tools: ['Blender'],
    reflection:
      'Cette première expérience sur Blender m\'a permis de prendre en main un logiciel complexe et difficile à maîtriser. Aujourd\'hui, je m\'en sers dans des intégrations 3D légères — notamment lorsque l\'IA n\'est pas coopérative sur la précision de certains éléments placés dans une scène.',
    images: {
      cover:  '/projects/jacquemus/up copie.mp4',
      left:   '/projects/jacquemus/P_bottomleft.webp',
      detail: [
        '/projects/jacquemus/P_toprightright.webp',
        '/projects/jacquemus/jacq.mp4',
        '/projects/jacquemus/P_topright.webp',
        '/projects/jacquemus/Work_video.mp4',
      ],
      positions: ['center 35%', 'center 40%', 'right center', 'center 35%'],
      scales: [1.12, 1.1, 1.12, 1.1],
    },
    detailCover: '/projects/jacquemus/P_toprightright.webp',
    detailCoverPosition: 'calc(50% + 20px) center',
    detailCoverPositionDesktop: 'center center',
    video: '/projects/jacquemus/Video.mp4',
    accentColor: '#C4B59A',
  },
  {
    slug: 'ethkwear',
    title: 'Ethikwear',
    category: 'Branding & Identité Visuelle',
    year: '2026',
    shortDesc: 'Maquette web d\'une marque de mode écoresponsable fictive.',
    description:
      'Projet réalisé en équipe autour de la création d\'une marque de mode écoresponsable fictive : Ethikwear. L\'objectif était de concevoir la maquette complète d\'un site e-commerce, du cadrage UX à la mise en page finale, en respectant des délais de rendu serrés.',
    reflection:
      'Ce projet m\'a permis de développer un savoir-faire en équipe et de faire mes premiers pas dans le domaine de l\'UX/UI et de ses règles de conception, tout en apprenant à respecter des dates de rendu courtes.',
    tools: ['Figma'],
    images: {
      cover: '/projects/ethikwear/home_mov.mp4',
      left:  '/projects/ethikwear/Home_d.webp',
      detail: [
        '/projects/ethikwear/mobile.webp',
        '/projects/ethikwear/Homelow_d.webp',
        '/projects/ethikwear/product_mov.mp4',
        '/projects/ethikwear/Productlow_d.webp',
        '/projects/ethikwear/Product_d.webp',
        '/projects/ethikwear/Home_m.webp',
        '/projects/ethikwear/Product_m.webp',
        '/projects/ethikwear/Menu_m.webp',
        '/projects/ethikwear/Àproposlow_m.webp',
      ],
    },
    video: '/projects/ethikwear/home_mov.mp4',
    detailCover: '/projects/ethikwear/Home_d.webp',
    detailCoverMobile: '/projects/ethikwear/Home_m.webp',
    detailCoverPosition: 'center 11%',
    detailCoverPositionDesktop: 'center 28%',
    detailHeroHeightMobile: '42vh',
    link: 'https://www.figma.com/proto/6k9hJ4tUqNZOSi7QaEseFu/Fil-rouge?node-id=280-364&page-id=94%3A2&starting-point-node-id=280%3A364&t=WIwp6C1O4BZVoh5o-1',
    accentColor: '#3653D4',
  },
  {
    slug: 'henri-cartier-bresson',
    title: 'Henri Cartier-Bresson',
    category: 'Creative & Art Direction',
    year: '2026',
    shortDesc: 'Création d\'une vitrine digitale pour un artiste photographe reconnu.',
    description:
      'Première utilisation de WordPress. Le projet a débuté par une recherche approfondie sur l\'identité de l\'artiste — son œuvre, ses influences, sa sensibilité — pour en dégager une définition artistique claire. Cette base a ensuite guidé la maquette du site vitrine sur Figma, avant l\'élaboration complète du site sur WordPress.',
    reflection:
      'Première prise en main de WordPress, première conception autour d\'une identité existante forte. Travailler l\'univers d\'HCB imposait une règle simple : chaque décision graphique devait s\'effacer devant l\'œuvre. Ce projet m\'a appris à designer par soustraction — et à penser la conception web dans sa dimension stratégique, pas seulement esthétique.',
    tools: ['Figma', 'WordPress'],
    images: {
      cover: '/projects/henri%20cartier%20bresson/2.mp4',
      left:  '/projects/henri%20cartier%20bresson/Video_2.mp4',
      detail: [
        '/projects/henri%20cartier%20bresson/3.webp',
        '/projects/henri%20cartier%20bresson/4.mp4',
        '/projects/henri%20cartier%20bresson/5.webp',
        '/projects/henri%20cartier%20bresson/6.webp',
      ],
    },
    detailCover: '/projects/henri%20cartier%20bresson/cover_HCB.jpg',
    accentColor: '#0A0A0A',
  },
  {
    slug: 'barbershop-shift-bordeaux',
    title: 'Shift',
    category: 'Branding & Visual Identity',
    year: '2026',
    shortDesc: 'Accompagnement marketing et DA pour un barbershop bordelais.',
    description:
      'Mission d\'accompagnement complète pour Shift, barbershop premium à Bordeaux. Une identité visuelle professionnelle a été construite de A à Z, complétée par un plan de communication structuré et un accompagnement marketing et d\'organisation financière — pour poser des bases solides autant sur le fond que sur la forme.',
    reflection:
      'Premier vrai client, premières vraies contraintes. Positionnement flou, budget serré, identité à construire de zéro — ce projet m\'a forcé à penser stratégie avant de penser forme. Ce que j\'en retiens : une identité ne sert à rien sans stratégie derrière, et une stratégie ne tient pas sans indicateurs réels pour la piloter.',
    tools: ['Figma', 'Photoshop', 'Claude'],
    images: {
      cover: '/projects/shift/1.webp',
      left:  '/projects/shift/2.webp',
      detail: [
        '/projects/shift/3.webp',
        '/projects/shift/3b.webp',
        '/projects/shift/4.webp',
        '/projects/shift/5.webp',
      ],
    },
    detailCover: '/projects/shift/2.webp',
    detailCoverPosition: 'calc(50% - 5px) center',
    detailCoverPositionDesktop: 'calc(50% + 5px) center',
    accentColor: '#568920',
  },
  {
    slug: 'la-boutik-deco',
    title: 'La Boutik Deco',
    category: 'Branding & Visual Identity',
    year: '2026',
    shortDesc: 'Identité visuelle et refonte digitale pour une boutique de décoration.',
    description:
      'Découverte d\'une boutique de décoration à Andernos-les-Bains, dont l\'identité visuelle ne reflétait pas la qualité des produits proposés. Mission complète : refonte de l\'identité graphique, charte typographique, palette de couleurs — et première utilisation de Claude Code pour développer des outils d\'aide à la production visuelle. Un projet ancré dans la réalité d\'une petite structure locale, avec des contraintes concrètes.',
    reflection:
      'Premier projet où j\'ai utilisé Claude Code comme vrai support de création — un outil qui m\'a permis de réaliser ce que je voulais développer sans avoir les compétences dev nécessaires. Ce projet m\'a aussi appris que travailler pour une petite boutique locale, c\'est avant tout comprendre sa réalité avant de lui proposer quoi que ce soit.',
    tools: ['Figma', 'Claude Code'],
    images: {
      cover: '/projects/la-boutik-deco/4.mp4',
      left:  '/projects/la-boutik-deco/4.mp4',
      detail: [
        '/projects/la-boutik-deco/5.webp',
        '/projects/la-boutik-deco/10.webp',
        '/projects/la-boutik-deco/8.webp',
        '/projects/la-boutik-deco/6.webp',
        '/projects/la-boutik-deco/3.webp',
        '/projects/la-boutik-deco/7.mp4',
      ],
    },
    detailCover: '/projects/la-boutik-deco/imgaaa.webp',
    detailCoverPosition: 'calc(50% + 10px) center',
    detailCoverPositionDesktop: 'center center',
    accentColor: '#C4B59A',
  },
  {
    slug: 'queen',
    title: 'Queen',
    category: 'Web & Art Direction',
    year: '2026',
    shortDesc: 'Création d\'une vitrine web shop graphique pour le groupe Queen.',
    description:
      'Création d\'un site web complet dédié au groupe Queen — intégration WordPress réalisée en groupe, avec prototypage Figma incluant maquettes, design et définition de la charte graphique. En tant que chef de projet, j\'ai supervisé l\'ensemble du processus : de l\'audit du besoin à la livraison finale, en coordonnant les contributions de chaque membre de l\'équipe.',
    reflection:
      'Première expérience de chef de projet sur un projet web en groupe. Coordonner les wireframes, la charte graphique, le design, le moodboard et l\'audit technique en simultané m\'a appris à penser l\'organisation avant l\'exécution — et à assurer la cohérence d\'ensemble quand plusieurs personnes travaillent sur le même livrable.',
    tools: ['WordPress', 'Figma', 'Claude'],
    images: {
      cover: '/projects/queen/1.mp4',
      left:  '/projects/queen/2.webp',
      detail: [
        '/projects/queen/9.webp',
        '/projects/queen/4.mp4',
        '/projects/queen/6.webp',
        '/projects/queen/5.mp4',
        '/projects/queen/7.webp',
        '/projects/queen/8.webp',
        '/projects/queen/10.webp',
      ],
    },
    detailCover: '/projects/queen/11.webp',
    accentColor: '#0A0A0A',
  },
];


export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getNextProject(slug: string): Project {
  const index = projects.findIndex((p) => p.slug === slug);
  return projects[(index + 1) % projects.length];
}
