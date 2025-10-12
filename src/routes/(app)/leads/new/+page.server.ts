import { fail, redirect } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { leads, users } from "$lib/server/db/schema";
import { validateContact } from "$lib/server/validators";
import { eq } from "drizzle-orm";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const user = locals.user!;

  // If Manager, load all PH users for assignment
  let phUsers: Array<{ id: number; firstName: string; lastName: string; territory: string | null }> = [];

  if (user.role === "MANAGER") {
    phUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        territory: users.territory,
      })
      .from(users)
      .where(eq(users.role, "PH"));
  }

  return {
    phUsers,
  };
};

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const user = locals.user!;
    const formData = await request.formData();

    const companyName = formData.get("companyName")?.toString().trim();
    const city = formData.get("city")?.toString().trim();
    const address = formData.get("address")?.toString().trim() || null;
    const phone = formData.get("phone")?.toString().trim() || null;
    const email = formData.get("email")?.toString().trim() || null;
    const contactPerson = formData.get("contactPerson")?.toString().trim();
    const leadSource = formData.get("leadSource")?.toString().trim();
    const assignedToInput = formData.get("assignedTo")?.toString().trim();

    // Validation
    if (!companyName || companyName.length < 2) {
      return fail(400, {
        error: "Nazwa firmy jest wymagana (min. 2 znaki)",
        values: Object.fromEntries(formData),
      });
    }

    if (!city) {
      return fail(400, {
        error: "Miasto jest wymagane",
        values: Object.fromEntries(formData),
      });
    }

    if (!contactPerson || contactPerson.length < 2) {
      return fail(400, {
        error: "Osoba decyzyjna jest wymagana (min. 2 znaki)",
        values: Object.fromEntries(formData),
      });
    }

    if (!leadSource) {
      return fail(400, {
        error: "Źródło leada jest wymagane",
        values: Object.fromEntries(formData),
      });
    }

    // Validate phone OR email
    const contactValidation = validateContact(phone, email);
    if (!contactValidation.valid) {
      return fail(400, {
        error: contactValidation.error,
        values: Object.fromEntries(formData),
      });
    }

    // Determine assigned user
    let assignedTo: number;

    if (user.role === "MANAGER" && assignedToInput) {
      // Manager can assign to any PH
      assignedTo = parseInt(assignedToInput);
    } else {
      // PH assigns to themselves
      assignedTo = user.id;
    }

    // If no manual assignment, auto-assign based on city and territory
    if (user.role === "MANAGER" && !assignedToInput) {
      const phInTerritory = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.territory, city))
        .limit(1);

      if (phInTerritory.length > 0) {
        assignedTo = phInTerritory[0].id;
      } else {
        // If no PH for this territory, assign to first available PH
        const firstPH = await db
          .select({ id: users.id })
          .from(users)
          .where(eq(users.role, "PH"))
          .limit(1);

        if (firstPH.length > 0) {
          assignedTo = firstPH[0].id;
        } else {
          return fail(400, {
            error: "Brak dostępnych przedstawicieli handlowych",
            values: Object.fromEntries(formData),
          });
        }
      }
    }

    // Insert lead
    try {
      const [newLead] = await db
        .insert(leads)
        .values({
          companyName,
          city,
          address,
          phone,
          email,
          contactPerson,
          leadSource,
          status: "NEW",
          assignedTo,
        })
        .returning({ id: leads.id });

      throw redirect(303, `/leads/${newLead.id}`);
    } catch (error) {
      // Check if it's a redirect (which is expected)
      if (error && typeof error === 'object' && 'status' in error && 'location' in error) {
        throw error; // Re-throw redirects
      }
      console.error("Error creating lead:", error);
      return fail(500, {
        error: "Błąd podczas tworzenia leada",
        values: Object.fromEntries(formData),
      });
    }
  },
};
