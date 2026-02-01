import { betterAuth } from "better-auth";

// For now, we'll set up basic auth configuration
// The actual adapter will be configured when we connect to the database
export const auth = betterAuth({
  // Database configuration will be added when database is set up
  // database: drizzleAdapter(...),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // For simplicity in this phase
  },
  socialProviders: {
    // Add social providers if needed
  },
  secret: process.env.BETTER_AUTH_SECRET || "fallback-secret-change-in-production",
  basePath: "/api/auth",
});