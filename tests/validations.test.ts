import { describe, it, expect } from 'vitest';
import { businessSchema, publicBookingSchema, serviceSchema } from '../src/lib/validations';

describe('CitaFácil — Validaciones Zod de Dominio', () => {
  it('debe validar slugs comerciales correctamente', () => {
    // Slugs válidos
    expect(businessSchema.safeParse({
      name: 'Barbería Don Luigi',
      slug: 'don-luigi',
      businessType: 'barbershop',
    }).success).toBe(true);

    expect(businessSchema.safeParse({
      name: 'Spa Centro 123',
      slug: 'spa-centro-123',
      businessType: 'salon',
    }).success).toBe(true);

    // Slugs inválidos (mayúsculas, caracteres especiales, espacios)
    expect(businessSchema.safeParse({
      name: 'Barbería Don Luigi',
      slug: 'Don Luigi',
      businessType: 'barbershop',
    }).success).toBe(false);

    expect(businessSchema.safeParse({
      name: 'Barbería Don Luigi',
      slug: 'don_luigi!',
      businessType: 'barbershop',
    }).success).toBe(false);
  });

  it('debe exigir datos de cliente y fecha válida en reservas públicas', () => {
    const validBooking = {
      businessSlug: 'don-luigi',
      serviceId: '11111111-1111-1111-1111-111111111111',
      startAtIso: new Date().toISOString(),
      customerName: 'Carlos Ruiz',
      customerPhone: '987654321',
      customerEmail: 'carlos@ruiz.pe',
    };

    expect(publicBookingSchema.safeParse(validBooking).success).toBe(true);

    // Sin teléfono o teléfono muy corto
    expect(publicBookingSchema.safeParse({
      ...validBooking,
      customerPhone: '123',
    }).success).toBe(false);

    // Sin nombre
    expect(publicBookingSchema.safeParse({
      ...validBooking,
      customerName: ' ',
    }).success).toBe(false);
  });

  it('debe verificar duraciones y buffers de servicio válidos', () => {
    expect(serviceSchema.safeParse({
      name: 'Corte Varón',
      durationMinutes: 30,
      bufferBeforeMinutes: 5,
      bufferAfterMinutes: 5,
      priceAmount: 35,
    }).success).toBe(true);

    // Duración negativa o cero debe fallar
    expect(serviceSchema.safeParse({
      name: 'Corte Varón',
      durationMinutes: 0,
    }).success).toBe(false);

    // Buffer negativo debe fallar
    expect(serviceSchema.safeParse({
      name: 'Corte Varón',
      durationMinutes: 30,
      bufferBeforeMinutes: -5,
    }).success).toBe(false);
  });
});
