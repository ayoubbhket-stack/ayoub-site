import { eq, sql } from 'drizzle-orm';
import { getDb, schema as s } from '@/db';
import { requireAdminPage, can } from '@/lib/auth';
import { getContent } from '@/lib/settings';
import { AdminProvider } from '@/components/admin/ui';
import Shell from '@/components/admin/Shell';

export const dynamic = 'force-dynamic';

export default async function PanelLayout({ children }) {
  const me = await requireAdminPage('dashboard');
  const db = await getDb();
  const [{ n }] = await db.select({ n: sql`count(*)::int` }).from(s.leads).where(eq(s.leads.status, 'new'));
  const c = await getContent();
  return <AdminProvider><Shell me={me} name={c.brand.name} newLeads={n} canContent={can(me, 'content.write')}>{children}</Shell></AdminProvider>;
}
