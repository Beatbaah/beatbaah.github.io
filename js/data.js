// Content used by the terminal. The page (index.html) carries the same content as HTML;
// tests/e2e/page.test.mjs checks the two stay in sync.

export const DATA = {
  bio: {
    name: 'Beatrice Baah',
    role: 'Software & AI Engineer',
    pitch: 'I build full-stack apps and AI products, shaped by years of statistics and data-quality work in Ghana\'s public sector and an MSc in Cybersecurity.',
    whoami: [
      'Beatrice Baah. Software & AI engineer.',
      'MSc Cybersecurity & Digital Forensics · BSc Statistics (KNUST).',
      '5+ years of statistics and data-quality work in Ghana\'s public sector.',
    ],
  },

  stats: [
    { value: '8+', label: 'products shipped' },
    { value: '5+', label: 'years in data & government' },
    { value: '100K+', label: 'citizens served' },
  ],

  featured: [
    {
      slug: 'proassess', title: 'ProAssess',
      tagline: 'AI hiring assessment platform',
      built: 'Recruiters invite candidates, candidates take four timed reasoning tests, and Gemini writes a score summary the moment they submit. Side-by-side shortlisting and GDPR-compliant data erasure.',
      stack: ['react', 'typescript', 'firebase', 'gemini'],
      links: { code: 'https://github.com/Beatbaah/ProAssess' },
      image: 'assets/projects/proassess.webp',
    },
    {
      slug: 'amansie-ride', title: 'Amansie Ride',
      tagline: 'Ride-hailing for the districts the big apps don\'t serve',
      built: 'Three apps and a backend: a rider app, a driver app and an operations console, with live dispatch, trip lifecycle, cash and Mobile Money records, zone-based fares and ratings, all on Firestore listeners and Cloud Functions.',
      stack: ['react native', 'expo', 'firebase', 'cloud functions', 'react'],
      links: {},
      image: 'assets/projects/amansie-ride.webp',
    },
    {
      slug: 'mysoc', title: 'mySOC',
      tagline: 'Network security monitoring & incident response console',
      built: 'A sensor turns traffic and device logs into flows, runs detections mapped to MITRE ATT&CK, and folds them into a deduplicated, risk-scored alert queue. Analysts triage, open cases, hunt and hand over between shifts.',
      stack: ['python', 'fastapi', 'postgresql', 'react', 'mitre att&ck'],
      links: { code: 'https://github.com/Beatbaah/mySOC' },
      image: 'assets/projects/mysoc.webp',
    },
    {
      slug: 'bma-website', title: 'BMA website',
      tagline: 'Redesign of the Bekwai Municipal Assembly website',
      built: 'Replaced an end-of-life Drupal site served over plain HTTP with fast static pages: HTTPS-only with a strict CSP, ~75 KB to first view (down from 3.7 MB), and organised around what residents come to do.',
      stack: ['astro', 'typescript', 'static', 'security headers'],
      links: {},
      image: 'assets/projects/bma-website.webp',
    },
    {
      slug: 'ghana-card-patch-detection', title: 'Ghana Card patch detection',
      tagline: 'MSc thesis (KNUST, 2026): a CNN that detects adversarial-patch attacks on Ghana Card face photos',
      built: 'Detects 101 of 103 adversarial-patch (spot evasion) attacks on a held-out set, with error analysis and an honest look at limits under adaptive attackers.',
      stack: ['python', 'pytorch', 'cnn', 'adversarial ml'],
      links: { code: 'https://github.com/Beatbaah/ghana-card-patch-detection' },
      stat: { value: '101/103', label: 'attacks detected on the held-out set' },
    },
  ],

  more: [
    {
      slug: 'dream-trip-planner', title: 'Dream Trip Planner',
      tagline: 'AI travel agent: Claude + vector search match trips to what you describe',
      stack: ['flutter', 'node', 'claude', 'cloud run'],
      links: { code: 'https://github.com/Beatbaah/dream-trip-planner' },
    },
    {
      slug: 'civicmind-ai', title: 'CivicMind AI',
      tagline: 'Municipal revenue and performance tracking, with Gemini insights',
      stack: ['react', 'mongodb', 'gemini'],
      links: { code: 'https://github.com/Beatbaah/civicmind-ai' },
    },
    {
      slug: 'excellent-susu', title: 'Excellent Susu',
      tagline: 'Savings-group management: contributions, payouts and an audit trail',
      stack: ['react', 'firebase', 'rbac'],
      links: { code: 'https://github.com/Beatbaah/susu-management-app' },
    },
    {
      slug: 'tax-system', title: 'Tax System',
      tagline: 'Municipal revenue management for a real assembly client',
      stack: ['react', 'firebase', 'cloud functions'],
      links: {},
    },
    {
      slug: 'corporate-world', title: 'Corporate World',
      tagline: 'Client e-commerce shop for a Ghanaian office-wear brand',
      stack: ['firebase', 'firestore', 'e-commerce'],
      links: { live: 'https://corporate-world-gh.web.app' },
    },
    {
      slug: 'haske', title: 'Haske Spa & Events',
      tagline: 'Client booking site that routes straight into WhatsApp',
      stack: ['firebase hosting', 'booking flow'],
      links: { live: 'https://haskespaandevents.web.app' },
    },
  ],

  capabilities: [
    { title: 'Full-stack & AI products', tools: ['react', 'typescript', 'react native', 'flutter', 'claude', 'gemini', 'openai'] },
    { title: 'Cloud & backend', tools: ['node', 'python', 'fastapi', 'firebase', 'gcp', 'cloud run', 'postgresql', 'mongodb'] },
    { title: 'Security', tools: ['mitre att&ck', 'threat hunting', 'incident response', 'csp & headers', 'adversarial ml'] },
    { title: 'Data & analytics', tools: ['stata', 'sql', 'power bi', 'excel', 'pandas'] },
  ],

  experience: [
    { start: '2023-11', end: 'now', title: 'Municipal Statistician', org: 'Local Government Service · Bekwai Municipal Assembly',
      bullets: ['Analyzed data from 100,000+ citizens, achieving 25% efficiency improvement in resource allocation across 161 communities.',
        'Designed 5 dynamic dashboards used by 50 municipal members, reducing decision-making delays by 40%.'] },
    { start: '2024-12', end: '2024-12', title: 'Constituency Collation Officer', org: 'Electoral Commission Ghana · Bekwai Constituency',
      bullets: ['Collated and verified presidential and parliamentary election results from all polling stations.'] },
    { start: '2023-12', end: '2024-04', title: 'Zonal Data Quality Monitor', org: 'Ghana Statistical Service · Bekwai / Amansie West',
      bullets: ['Mentored 188 supervisors and enumerators, reducing operational errors by 50%.'] },
    { start: '2022-01', end: '2023-08', title: 'Assistant Statistician', org: 'Local Government Service · Bekwai Municipal Assembly',
      bullets: ['Created detailed pivot reports and visualizations using Excel and Power BI for key stakeholders.'] },
    { start: '2021-06', end: '2021-09', title: 'Data Quality Monitor', org: 'Ghana Statistical Service · Ga North',
      bullets: ['Surveyed 87,556 households and 93,833 structures across 36 supervisory areas.'] },
    { start: '2019-09', end: '2020-09', title: 'Data Analyst Intern', org: 'SSNIT · Kumasi',
      bullets: ['Conducted data validation, cleanup, and SSNIT contribution calculations for companies.'] },
  ],

  education: [
    { start: '', end: '2026', title: 'MSc Cybersecurity & Digital Forensics', org: 'KNUST', bullets: [] },
    { start: '', end: '', title: 'BSc Statistics', org: 'KNUST', bullets: [] },
  ],

  certs: [
    { name: 'Certified Cybersecurity Educator Professional (CCEP)', issuer: '', date: '2025-11' },
    { name: 'Google Cybersecurity Certificate', issuer: 'Google', date: '2024-12' },
    { name: 'Respond & Mitigate Security Threats', issuer: 'IBM', date: '2024-10' },
    { name: 'Mastercard Cybersecurity Job Simulation', issuer: 'Forage', date: '2024-09' },
    { name: 'SQL Fundamentals', issuer: 'Dataquest.io', date: '2023' },
    { name: 'Power BI in Data Analytics', issuer: 'Forage', date: '2022-09' },
    { name: 'Python Programming Foundations', issuer: 'Udacity', date: '2022' },
    { name: 'Excel Fundamentals: Formulas for Finance', issuer: 'CFI', date: '2022' },
  ],

  contact: {
    email: 'beatrice.baah3@hotmail.com',
    linkedin: 'https://linkedin.com/in/bbaah2',
    github: 'https://github.com/Beatbaah',
    whatsapp: 'https://wa.me/233245989981',
  },

  cvPath: 'assets/Beatrice_Baah_CV.pdf',
};
