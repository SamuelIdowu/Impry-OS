import { z } from "zod";

// Email validation
export const emailSchema = z
    .string()
    .min(1, "Email is required")
    .email("Invalid email address");

// Password validation
export const passwordSchema = z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password is too long");

// Login validation
export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
});

export type LoginInput = z.infer<typeof loginSchema>;

// Registration validation
export const registerSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: emailSchema,
    password: passwordSchema,
    agreeToTerms: z.boolean().refine((val) => val === true, {
        message: "You must agree to the terms and conditions",
    }),
});

export type RegisterInput = z.infer<typeof registerSchema>;

// Account update validation
export const updateProfileSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    email: emailSchema,
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

// Password update validation
export const updatePasswordSchema = z
    .object({
        currentPassword: passwordSchema,
        newPassword: passwordSchema,
        confirmPassword: passwordSchema,
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    })
    .refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password",
        path: ["newPassword"],
    });

export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
