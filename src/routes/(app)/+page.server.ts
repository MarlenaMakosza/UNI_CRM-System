import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async () => {
  // Auth check is handled by layout
  // TODO: Load real dashboard stats here
  return {};
};
