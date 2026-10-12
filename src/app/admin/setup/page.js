import { SetupForm } from '@/components/admin/AuthForms';
import { Mark } from '@/components/admin/Mark';
import { countAdmins } from '@/lib/auth';

export const metadata = { title: 'Setup' };

export default async function Setup() {
  const exists = (await countAdmins()) > 0;
  return (
    <main className="auth-wrap">
      <div className="auth-card">
        <span className="logo"><Mark /> Setup</span>
        <h1 className="display-s">{exists ? 'Reset the owner password' : 'Create the owner account'}</h1>
        {exists && <p className="muted" style={{ margin: 0 }}>An account already exists. Enter the owner email and your setup token to choose a new password.</p>}
        {process.env.SETUP_TOKEN ? <SetupForm /> : <div className="notice bad">Setup is locked. Add a SETUP_TOKEN environment variable on the server, redeploy, then reload this page.</div>}
      </div>
    </main>
  );
}
