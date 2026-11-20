import { z } from 'zod';

/** Configuración global de la tienda (un solo documento). */
export const SettingsSchema = z.object({
  storeName: z.string().min(1).max(80).default('Switch&Tech'),
  supportEmail: z.string().email().default('soporte@switchandtech.com'),
  whatsapp: z.string().max(30).optional().default(''),
  instagram: z.string().max(100).optional().default(''),
  /** Costo de envío (COP) para pedidos bajo el umbral. Ver lib/shipping.ts. */
  shippingCost: z.number().nonnegative().default(25000),
  /** Subtotal (COP) desde el cual el envío es gratis. 0 = nunca gratis. */
  freeShippingThreshold: z.number().nonnegative().default(450000),
  announcement: z.string().max(300).optional().default(''),
  announcementEnabled: z.boolean().optional().default(false),
});

export type Settings = z.infer<typeof SettingsSchema>;

export const DEFAULT_SETTINGS: Settings = SettingsSchema.parse({});