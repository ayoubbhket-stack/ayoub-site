import { requireAdminPage } from '@/lib/auth';
import { getContent } from '@/lib/settings';
import { pendingLegacy } from '@/lib/importer';
import ContentEditor from '@/components/admin/ContentEditor';

export const metadata = { title: 'Site content' };

export default async function Content() {
  await requireAdminPage('content.write');
  const c = await getContent();
  return <ContentEditor initial={c} pending={pendingLegacy(c)} />;
}
