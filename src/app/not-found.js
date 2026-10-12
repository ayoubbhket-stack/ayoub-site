import Link from 'next/link';
export default function NotFound() {
  return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#080808', color: '#fff', fontFamily: 'system-ui', textAlign: 'center' }}><div><h1 style={{ fontSize: '5rem', margin: 0, color: '#ff6a00' }}>404</h1><p>This page does not exist.</p><Link href="/" style={{ color: '#ff6a00' }}>Back home</Link></div></main>;
}
