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
    { value: '10', label: 'products built' },
    { value: '5+', label: 'years in data & government' },
    { value: '50+', label: 'dashboard users' },
  ],

  featured: [
    {
      slug: 'proassess', title: 'ProAssess',
      tagline: 'AI hiring assessment platform',
      stack: ['react', 'typescript', 'firebase', 'gemini'],
      links: { code: 'https://github.com/Beatbaah/ProAssess' },
      image: 'assets/projects/proassess.webp',
    },
    {
      slug: 'amansie-ride', title: 'Amansie Ride',
      tagline: 'Ride-hailing for the districts the big apps don\'t serve',
      stack: ['react native', 'expo', 'firebase', 'cloud functions', 'react'],
      links: {},
      image: 'assets/projects/amansie-ride.webp',
    },
    {
      slug: 'mysoc', title: 'mySOC',
      tagline: 'Network security monitoring & incident response console',
      stack: ['python', 'fastapi', 'postgresql', 'react', 'mitre att&ck'],
      links: { code: 'https://github.com/Beatbaah/mySOC' },
      image: 'assets/projects/mysoc.webp',
    },
    {
      slug: 'bma-website', title: 'BMA website',
      tagline: 'Proposed redesign of the Bekwai Municipal Assembly website',
      stack: ['astro', 'typescript', 'static', 'security headers'],
      links: {},
      image: 'assets/projects/bma-website.webp',
    },
    {
      slug: 'ghana-card-patch-detection', title: 'Ghana Card patch detection',
      tagline: 'MSc thesis (KNUST): a TensorFlow/Keras CNN that flags adversarial patches on Ghana Card-style face photos',
      stack: ['python', 'tensorflow', 'keras', 'cnn', 'adversarial ml'],
      links: { code: 'https://github.com/Beatbaah/ghana-card-patch-detection' },
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
      links: { live: 'https://excellent-susu-app.web.app', code: 'https://github.com/Beatbaah/susu-management-app' },
    },
    {
      slug: 'tax-system', title: 'Bekwai Tax Revenue',
      tagline: 'Municipal revenue system: collection, taxpayer records, e-payment, receipt checks',
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
    { start: '2023-11', end: 'now', title: 'Municipal Statistician; Acting Head, Statistics Department', org: 'Local Government Service · Bekwai Municipal Assembly',
      bullets: ['Compile and validate administrative data from all Assembly departments each quarter and report to the Ghana Statistical Service.',
        'Built Power BI dashboards used by 50+ stakeholders, reducing decision-making delays by about 40%.',
        'Prepare revenue trend analyses and forecasts for the Municipal Coordinating Director, and figures for the development plan and budget; supervise and train department staff.'] },
    { start: '2024-11', end: '2024-12', title: 'Constituency Collation Officer', org: 'Electoral Commission Ghana · Bekwai Constituency',
      bullets: ['Collated and verified presidential and parliamentary election results from all polling stations.'] },
    { start: '2023-12', end: '2024-04', title: 'Zonal Data Quality Monitor', org: 'Ghana Statistical Service · Bekwai / Amansie West',
      bullets: ['Supervised data quality for 188 field staff across 288 enumeration zones in the Integrated Business Establishment Survey, using STATA and Excel checks to catch and correct errors.'] },
    { start: '2022-01', end: '2023-08', title: 'Assistant Statistician', org: 'Local Government Service · Bekwai Municipal Assembly',
      bullets: ['Analysed municipal datasets and produced Excel and Power BI reports for planning and policy.'] },
    { start: '2021-06', end: '2021-09', title: 'Data Quality Monitor', org: 'Ghana Statistical Service · Ga North',
      bullets: ['Used STATA daily to find and resolve data errors across 186 enumeration areas.'] },
    { start: '2019-09', end: '2020-09', title: 'Data Analyst (National Service)', org: 'SSNIT · Kumasi',
      bullets: ['Validated and cleaned contribution data and prepared contribution reports for client companies.'] },
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
