import { requireAdminApi } from '@/lib/auth';
import { handler, ok } from '@/lib/http';
import { importLegacyImages } from '@/lib/importer';

export const dynamic = 'force-dynamic';

export const POST = handler(async () => {
  await requireAdminApi('content.write');
  return ok(await importLegacyImages());
});
