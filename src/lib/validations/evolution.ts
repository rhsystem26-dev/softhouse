import { z } from "zod";

export const saveEvolutionConfigSchema = z.object({
  instanceUrl: z.string().url("URL da instancia invalida"),
  apiKey: z.string().min(1, "API Key e obrigatoria"),
  webhookSecret: z.string().min(1, "Webhook Secret e obrigatorio"),
  enabled: z.boolean(),
});

export const sendEvolutionMessageSchema = z.object({
  toPhone: z.string().min(1, "Telefone e obrigatorio").transform((v) => v.replace(/\D/g, "")),
  message: z.string().min(1, "Mensagem e obrigatoria").max(4000, "Mensagem muito longa"),
});

export const evolutionConfigStatusSchema = z.object({
  connected: z.boolean(),
  instance: z.string().optional(),
  error: z.string().optional(),
});

export type SaveEvolutionConfigInput = z.infer<typeof saveEvolutionConfigSchema>;
export type SendEvolutionMessageInput = z.infer<typeof sendEvolutionMessageSchema>;
