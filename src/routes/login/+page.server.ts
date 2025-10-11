import { fail, redirect } from "@sveltejs/kit";
import { lucia } from "$lib/server/auth";
import { db } from "$lib/server/db";
import { users } from "$lib/server/db/schema";
import { eq } from "drizzle-orm";
import { Argon2id } from "oslo/password";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  // Redirect if already logged in
  if (locals.user) {
    throw redirect(302, "/");
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const username = formData.get("username");
    const password = formData.get("password");

    // Validation
    if (
      typeof username !== "string" ||
      username.length < 3 ||
      username.length > 50
    ) {
      return fail(400, {
        error: "Nieprawidlowa nazwa uzytkownika",
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 6 ||
      password.length > 255
    ) {
      return fail(400, {
        error: "Nieprawidlowe haslo",
      });
    }

    // Find user
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    if (existingUser.length === 0) {
      return fail(400, {
        error: "Nieprawidlowa nazwa uzytkownika lub haslo",
      });
    }

    const user = existingUser[0];

    // Verify password
    const validPassword = await new Argon2id().verify(
      user.passwordHash,
      password
    );

    if (!validPassword) {
      return fail(400, {
        error: "Nieprawidlowa nazwa uzytkownika lub haslo",
      });
    }

    // Create session
    const session = await lucia.createSession(user.id, {});
    const sessionCookie = lucia.createSessionCookie(session.id);

    cookies.set(sessionCookie.name, sessionCookie.value, {
      path: ".",
      ...sessionCookie.attributes,
    });

    throw redirect(302, "/");
  },
};
