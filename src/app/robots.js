export const dynamic = 'force-dynamic';
export default function robots() { return { rules: [{ userAgent: '*', allow: '/', disallow: ['/admin', '/api'] }] }; }
