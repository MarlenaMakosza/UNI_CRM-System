// Phone validation: 9-15 digits, optional spaces/hyphens
export function validatePhone(phone: string | null | undefined): boolean {
  if (!phone) return false;

  // Remove spaces and hyphens
  const cleaned = phone.replace(/[\s-]/g, "");

  // Check if only digits remain and length is 9-15
  const phoneRegex = /^\d{9,15}$/;
  return phoneRegex.test(cleaned);
}

// Email validation: basic format
export function validateEmail(email: string | null | undefined): boolean {
  if (!email) return false;

  // Basic email format: xxx@xxx.xx
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate that at least phone OR email is provided
export function validateContact(phone: string | null | undefined, email: string | null | undefined): {
  valid: boolean;
  error?: string;
} {
  const hasPhone = phone && phone.trim().length > 0;
  const hasEmail = email && email.trim().length > 0;

  if (!hasPhone && !hasEmail) {
    return {
      valid: false,
      error: "Musisz podać telefon lub email (co najmniej jeden)"
    };
  }

  if (hasPhone && !validatePhone(phone)) {
    return {
      valid: false,
      error: "Nieprawidłowy format telefonu (9-15 cyfr, opcjonalne spacje/myślniki)"
    };
  }

  if (hasEmail && !validateEmail(email)) {
    return {
      valid: false,
      error: "Nieprawidłowy format email"
    };
  }

  return { valid: true };
}

// Clean phone number (remove spaces/hyphens)
export function cleanPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  return phone.replace(/[\s-]/g, "");
}
