import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LoginForm } from '@/components/admin/AuthForms';
import { Mark } from '@/components/admin/Mark';
import { countAdmins, currentAdmin } from '@/lib/auth';

export const metadata = { title: 'Sign in' };

export default async function Login() {
  if (await currentAdmin()) redirect('/admin');
  const none = (await countAdmins()) === 0;
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <span className="logo"><Mark /> Control panel</span>
        <h1 className="display-s">Sign in</h1>
        {none ? <div className="notice">No account exists yet. <Link className="link" href="/admin/setup">Create the owner account</Link>.</div> : <LoginForm />}
        <p className="muted" style={{ fontSize: '.84rem', margin: 0 }}>Forgot your password? Open <Link className="link" href="/admin/setup">/admin/setup</Link> and use your setup token to choose a new one.</p>
        <Link href="/" className="link label">← Back to site</Link>
      </div>
    </main>
  );
}
