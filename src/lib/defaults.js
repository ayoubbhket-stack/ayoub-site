// Default site content (taken from the original landing page). Everything here
// is editable from /admin → Content; saved values are stored in the database.
export const OLD_SITE = 'https://ayoub-bhket.pages.dev';

export const DEFAULT_CONTENT = {
  brand: {
    name: 'Ayoub Bhket',
    role: 'Media Buyer & Digital Marketing',
    logo: { mediaId: null, legacy: '528746458_122142952436756162_9122929301889969714_n.jpg' },
    seoTitle: 'Ayoub Bhket — Media Buyer',
    seoDescription: 'Ayoub Bhket — media buyer and digital marketing coach. Meta, Google, TikTok and Snapchat ads, pixel tracking and Shopify. Free consultation on WhatsApp.',
    gtmId: 'GTM-KPMZ5J47',
  },
  contact: {
    whatsapp: '201555227040', // international format, digits only
    phoneDisplay: '01555227040',
    email: 'ayoubbhket@gmail.com',
    facebookUrl: 'https://www.facebook.com/RealEstate1907',
    facebookLabel: 'Ayoub — Marketing Mindset',
  },
  hero: {
    eyebrow: 'Media Buyer · Meta · Google · TikTok · Snapchat',
    headline: 'Digital Marketing Course & Management',
    highlightLastWord: true,
    tagline: 'Media Buyer.|Growth Driver. Your Brand\'s Best Investment.',
    text: 'Scaling brands through data-driven ad campaigns that deliver real, measurable results.',
    primaryLabel: "Let's Work Together",
    metrics: [{ label: 'Avg. ROAS', value: '2x' }, { label: 'Campaigns', value: '50+' }, { label: 'Platforms', value: '4' }],
  },
  ticker: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Snapchat Ads', 'Pixel Tracking', 'Shopify'],
  about: {
    photo: { mediaId: null, legacy: 'about-photo.jpg' },
    name: 'Ayoub Misara Ayoub Bhket',
    facts: ['22 years old', 'B.Sc. Chemistry', 'Al-Azhar University'],
    paragraphs: [
      "I've been working in media buying for 2 years, helping brands turn ad spend into real, measurable growth across every major platform.",
      'My experience spans pixel setup & tracking, standard websites, and Shopify stores — giving clients a complete, data-driven approach from strategy to execution.',
    ],
    skills: ['Meta Ads', 'Google Ads', 'TikTok Ads', 'Snapchat Ads', 'Pixel Tracking', 'Shopify'],
  },
  stats: [
    { value: '3', suffix: '+', label: 'Years of experience' },
    { value: '50', suffix: '+', label: 'Successful campaigns' },
    { value: '2', suffix: 'x', label: 'Average ROAS' },
  ],
  services: [
    { icon: '📊', title: 'Media Buying', text: 'Managing and optimizing Meta & Google Ads campaigns for maximum return on ad spend.' },
    { icon: '🎓', title: 'Marketing Course', text: 'Comprehensive digital marketing courses for beginners and professionals looking to grow.' },
    { icon: '⚙️', title: 'Management', text: 'Full management of ad accounts and growth strategy from start to finish.' },
  ],
  results: {
    title: 'Inside the ad accounts',
    text: 'Screenshots from live campaigns. Drag sideways and tap any card to view it full size.',
    items: [
      { mediaId: null, legacy: '1782655240391.jpg', caption: 'Active Campaign — Leads & Engagement' },
      { mediaId: null, legacy: '1782655240307.jpg', caption: 'Active Campaign — New Leads' },
      { mediaId: null, legacy: '1782655240332.jpg', caption: 'High Performing — Leads & Engagement' },
      { mediaId: null, legacy: '1782655240358.jpg', caption: 'Active Campaign — Engagement' },
      { mediaId: null, legacy: 'Screenshot 2026-06-28 164128.png', caption: 'Campaign Stats Overview' },
      { mediaId: null, legacy: 'Screenshot 2026-06-28 164108.png', caption: 'Campaign Performance Data' },
    ],
  },
  consult: {
    title: 'Get a free consultation',
    text: 'Send your details and your message opens in WhatsApp, ready to send. I reply personally.',
    industries: ['Real estate', 'Medical / clinic', 'E-commerce / store', 'Education / courses', 'Restaurant / food', 'Other'],
  },
  closing: {
    title: "Let's grow|your business.",
    text: 'Ready to help you grow your business and achieve real, measurable results.',
  },
  footer: 'Crafted with ♥ — Ayoub Bhket © 2026',
};

/** Resolve an image field: uploaded/imported media first, then the original site. */
export function imgUrl(field) {
  if (!field) return null;
  if (field.mediaId) return `/api/media/${field.mediaId}`;
  if (field.legacy) return `${OLD_SITE}/${encodeURI(field.legacy)}`;
  return null;
}
