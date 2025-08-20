import { z } from "zod";

// Schema base per i dati del profilo
const baseProfileSchema = z.object({
  username: z.string().min(3).max(30).optional(),
  firstName: z.string().min(1).max(50).optional(),
  lastName: z.string().min(1).max(50).optional(),
});

// Schema per l'aggiornamento del profilo
export const updateProfileSchema = baseProfileSchema.extend({
  name: z.string().min(1).max(50).optional(),
  notifications: z.boolean().optional(),
  notificationToken: z.string().optional(),
});

export const addUserSchema = z.object({
  email: z.string(),
  id: z.string(),
});
