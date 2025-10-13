import { db } from "$lib/server/db";
import { activities, leads, users } from "$lib/server/db/schema";
import { eq, and, gte, lte, desc, like, or } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals, url }) => {
  const user = locals.user!;

  // Get filter parameters
  const outcomeFilter = url.searchParams.get("outcome");
  const dateFrom = url.searchParams.get("dateFrom");
  const dateTo = url.searchParams.get("dateTo");
  const searchQuery = url.searchParams.get("q");

  // Build query conditions
  const conditions = [];

  // PH sees only their activities, Manager sees all
  if (user.role === "PH") {
    conditions.push(eq(activities.userId, user.id));
  }

  if (outcomeFilter) {
    conditions.push(eq(activities.outcome, outcomeFilter));
  }

  if (dateFrom) {
    conditions.push(gte(activities.activityDate, dateFrom));
  }

  if (dateTo) {
    conditions.push(lte(activities.activityDate, dateTo));
  }

  if (searchQuery) {
    conditions.push(
      or(
        like(activities.notes, `%${searchQuery}%`),
        like(activities.contactPersonName, `%${searchQuery}%`)
      )!
    );
  }

  // Fetch activities with lead and user info
  const activitiesData = await db
    .select({
      activity: activities,
      lead: {
        id: leads.id,
        companyName: leads.companyName,
        city: leads.city,
        contactPerson: leads.contactPerson,
      },
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        territory: users.territory,
      },
    })
    .from(activities)
    .leftJoin(leads, eq(activities.leadId, leads.id))
    .leftJoin(users, eq(activities.userId, users.id))
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(activities.activityDate));

  return {
    activities: activitiesData,
    filters: {
      outcome: outcomeFilter,
      dateFrom,
      dateTo,
      search: searchQuery,
    },
  };
};
