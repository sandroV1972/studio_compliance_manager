/**
 * Auth Validation Schemas
 */

import { z } from "zod";
import { emailSchema, passwordSchema, nameSchema } from "./common";

// Register
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: nameSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Login / Check Account
export const loginSchema = z.object({
  email: emailSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

// Forgot Password
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset Password
export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token richiesto"),
  password: passwordSchema,
});

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// Verify Email
export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Token richiesto"),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

// Resend Verification
export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
