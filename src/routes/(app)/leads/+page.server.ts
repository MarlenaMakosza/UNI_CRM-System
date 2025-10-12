import { db } from "$lib/server/db";
import { leads, users } from "$lib/server/db/schema";
import { eq, and, like, or, desc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.user!;

  // Get filter parameters from URL
  const statusFilter = url.searchParams.get("status");
  const cityFilter = url.searchParams.get("city");
  const sourceFilter = url.searchParams.get("source");
  const searchQuery = url.searchParams.get("q");

  // Build query conditions
  const conditions = [];

  // PH sees only their leads, Manager sees all
  if (user.role === "PH") {
    conditions.push(eq(leads.assignedTo, user.id));
  }

  if (statusFilter) {
    conditions.push(eq(leads.status, statusFilter));
  }

  if (cityFilter) {
    conditions.push(eq(leads.city, cityFilter));
  }

  if (sourceFilter) {
    conditions.push(eq(leads.leadSource, sourceFilter));
  }

  if (searchQuery) {
    conditions.push(
      or(
        like(leads.companyName, `%${searchQuery}%`),
        like(leads.contactPerson, `%${searchQuery}%`)
      )!
    );
  }

  // Fetch leads with assigned user info
  const leadsData = await db
    .select({
      lead: leads,
      assignedUser: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        territory: users.territory,
      },
    })
    .from(leads)
    .leftJoin(users, eq(leads.assignedTo, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(leads.createdAt));

  return {
    leads: leadsData,
    filters: {
      status: statusFilter,
      city: cityFilter,
      source: sourceFilter,
      search: searchQuery,
    },
  };
};
