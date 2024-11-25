import { z } from "zod";

export const setPasswordSchema = z.object({
  password: z.string().min(5, "Must be at least 5 characters"),
});
