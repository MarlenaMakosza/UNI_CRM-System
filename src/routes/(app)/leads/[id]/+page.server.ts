import { error } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { leads, users, activities, visits, contracts } from "$lib/server/db/schema";
import { eq, desc } from "drizzle-orm";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const user = locals.user!;
  const leadId = parseInt(params.id);

  if (isNaN(leadId)) {
    throw error(400, "Invalid lead ID");
  }

  // Get lead with assigned user
  const [leadData] = await db
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
    .where(eq(leads.id, leadId));

  if (!leadData) {
    throw error(404, "Lead nie został znaleziony");
  }

  // Permission check: PH can only see their own leads
  if (user.role === "PH" && leadData.lead.assignedTo !== user.id) {
    throw error(403, "Brak dostępu do tego leada");
  }

  // Get activities for this lead
  const activitiesData = await db
    .select({
      activity: activities,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      },
    })
    .from(activities)
    .leftJoin(users, eq(activities.userId, users.id))
    .where(eq(activities.leadId, leadId))
    .orderBy(desc(activities.activityDate));

  // Get visits for this lead
  const visitsData = await db
    .select({
      visit: visits,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      },
    })
    .from(visits)
    .leftJoin(users, eq(visits.userId, users.id))
    .where(eq(visits.leadId, leadId))
    .orderBy(desc(visits.scheduledAt));

  // Get contracts for this lead
  const contractsData = await db
    .select({
      contract: contracts,
      user: {
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
      },
    })
    .from(contracts)
    .leftJoin(users, eq(contracts.userId, users.id))
    .where(eq(contracts.leadId, leadId))
    .orderBy(desc(contracts.signedAt));

  return {
    lead: leadData.lead,
    assignedUser: leadData.assignedUser,
    activities: activitiesData,
    visits: visitsData,
    contracts: contractsData,
  };
};
