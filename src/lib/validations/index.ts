import { z } from 'zod';

// Esquemas de Autenticación
export const loginSchema = z.object({
  email: z.string().trim().email('Por favor ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'El nombre completo debe tener al menos 2 caracteres'),
  email: z.string().trim().email('Por favor ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirma tu contraseña'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Esquemas de Negocio
export const businessSchema = z.object({
  name: z.string().trim().min(2, 'El nombre del negocio debe tener al menos 2 caracteres').max(80),
  slug: z.string().trim()
    .min(3, 'El slug debe tener al menos 3 caracteres')
    .max(50)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'El slug solo puede contener letras minúsculas, números y guiones medios (ej. barbery-elite)'),
  businessType: z.string().min(1, 'Selecciona un tipo de negocio'),
  description: z.string().trim().max(500).optional().nullable(),
  phone: z.string().trim().max(30).optional().nullable(),
  email: z.string().trim().email('Correo de contacto inválido').optional().nullable().or(z.literal('')),
  address: z.string().trim().max(200).optional().nullable(),
  timezone: z.string().default('America/Lima'),
  minBookingNoticeHours: z.number().int().min(0, 'Mínimo 0 horas').max(72).default(2),
  maxBookingAdvanceDays: z.number().int().min(1, 'Mínimo 1 día').max(365).default(30),
  cancellationNoticeHours: z.number().int().min(0, 'Mínimo 0 horas').max(72).default(4),
  bookingEnabled: z.boolean().default(true),
});

// Esquemas de Servicio
export const serviceSchema = z.object({
  name: z.string().trim().min(2, 'El nombre del servicio debe tener al menos 2 caracteres').max(100),
  description: z.string().trim().max(500).optional().nullable(),
  durationMinutes: z.number().int().min(5, 'La duración mínima es de 5 minutos').max(720, 'La duración máxima es de 12 horas'),
  bufferBeforeMinutes: z.number().int().min(0, 'El buffer previo no puede ser negativo').max(120).default(0),
  bufferAfterMinutes: z.number().int().min(0, 'El buffer posterior no puede ser negativo').max(120).default(0),
  priceAmount: z.number().min(0, 'El precio no puede ser negativo').optional().nullable(),
  currency: z.string().default('PEN'),
  active: z.boolean().default(true),
});

// Esquemas de Personal (Staff)
export const staffMemberSchema = z.object({
  displayName: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').max(100),
  email: z.string().trim().email('Correo inválido').optional().nullable().or(z.literal('')),
  phone: z.string().trim().max(30).optional().nullable(),
  active: z.boolean().default(true),
  serviceIds: z.array(z.string().uuid()).optional().default([]),
});

// Esquemas de Horario
export const businessHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Hora de inicio inválida'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, 'Hora de fin inválida'),
}).refine((data) => data.startTime < data.endTime, {
  message: 'La hora de inicio debe ser anterior a la hora de fin',
  path: ['endTime'],
});

// Esquemas de Reserva Pública
export const publicBookingSchema = z.object({
  businessSlug: z.string().min(1, 'Slug requerido'),
  serviceId: z.string().min(1, 'Servicio inválido'),
  staffMemberId: z.string().optional().nullable(),
  startAtIso: z.string().datetime({ message: 'Fecha y hora en formato ISO requerido' }),
  customerName: z.string().trim().min(2, 'Ingresa tu nombre completo (mínimo 2 letras)').max(100),
  customerEmail: z.string().trim().email('Ingresa un correo electrónico válido').optional().nullable().or(z.literal('')),
  customerPhone: z.string().trim().min(6, 'Ingresa un teléfono de contacto válido (mínimo 6 dígitos)').max(20),
  internalNotes: z.string().trim().max(400, 'Las notas no pueden superar 400 caracteres').optional().nullable(),
});

// Esquema de Cancelación por Token
export const cancelBookingSchema = z.object({
  cancellationToken: z.string().min(16, 'Token de cancelación inválido'),
  reason: z.string().trim().max(300, 'El motivo no puede superar 300 caracteres').optional(),
});

// Esquema de Reprogramación
export const rescheduleBookingSchema = z.object({
  appointmentId: z.string().min(1, 'ID de cita inválido'),
  newStartAtIso: z.string().datetime({ message: 'Fecha y hora válida requerida' }),
  staffMemberId: z.string().optional().nullable(),
});
