import { describe, it, expect } from 'vitest';
import { computeAvailableSlots } from '../src/features/scheduling/availability-engine';
import { Business, Service, StaffMember, BusinessHours, Appointment } from '../src/types';

describe('CitaFácil — Motor de Disponibilidad (Availability Engine)', () => {
  const mockBusiness: Business = {
    id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Barbería Don Luigi',
    slug: 'barberia-don-luigi',
    business_type: 'barbershop',
    description: 'Cortes clásicos y afeitado tradicional',
    phone: '+51 987654321',
    email: 'contacto@donluigi.pe',
    address: 'Av. Larco 450, Miraflores, Lima',
    timezone: 'America/Lima',
    logo_url: null,
    booking_enabled: true,
    min_booking_notice_hours: 2,
    max_booking_advance_days: 30,
    cancellation_notice_hours: 4,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const mockService: Service = {
    id: 's1111111-1111-1111-1111-111111111111',
    business_id: mockBusiness.id,
    name: 'Corte de Cabello Clásico',
    description: 'Lavado, corte y peinado',
    duration_minutes: 30,
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    price_amount: 35.0,
    currency: 'PEN',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  };

  const mockStaff: StaffMember[] = [
    {
      id: 'st111111-1111-1111-1111-111111111111',
      business_id: mockBusiness.id,
      display_name: 'Carlos Barbero',
      email: 'carlos@donluigi.pe',
      phone: '+51 911222333',
      active: true,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ];

  // Supongamos fecha 2026-10-15 (Jueves = 4)
  // Horario: Jueves de 09:00 a 12:00
  const mockHours: BusinessHours[] = [
    {
      id: 'h1',
      business_id: mockBusiness.id,
      staff_member_id: null,
      day_of_week: 4, // Jueves
      start_time: '09:00:00',
      end_time: '12:00:00',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    },
  ];

  it('debe generar slots disponibles dentro del horario de atención comercial', () => {
    // Referencia: Miércoles 2026-10-14 12:00 UTC (con suficiente antelación previa a 2h)
    const referenceNow = new Date('2026-10-14T12:00:00Z');

    const result = computeAvailableSlots({
      business: mockBusiness,
      service: mockService,
      dateStr: '2026-10-15',
      businessHours: mockHours,
      exceptions: [],
      existingAppointments: [],
      staffMembers: mockStaff,
      slotStepMinutes: 30,
      referenceNow,
    });

    expect(result.hasSlots).toBe(true);
    // De 09:00 a 12:00 cada 30min: 09:00, 09:30, 10:00, 10:30, 11:00, 11:30 = 6 slots
    expect(result.slots.length).toBe(6);
    expect(result.slots[0].startTime).toBe('09:00');
    expect(result.slots[5].startTime).toBe('11:30');
  });

  it('no debe ofrecer slots que ya están ocupados por una cita confirmada', () => {
    const referenceNow = new Date('2026-10-14T12:00:00Z');

    // Cita existente de 10:00 a 10:30 para Carlos Barbero
    // En America/Lima (UTC-5), 10:00 es 15:00 UTC
    const existingAppointment: Appointment = {
      id: 'app-1',
      business_id: mockBusiness.id,
      customer_id: 'c1',
      service_id: mockService.id,
      staff_member_id: mockStaff[0].id,
      start_at: '2026-10-15T15:00:00Z', // 10:00 hora Lima
      end_at: '2026-10-15T15:30:00Z',   // 10:30 hora Lima
      status: 'confirmed',
      customer_name_snapshot: 'Juan Pérez',
      customer_email_snapshot: 'juan@gmail.com',
      customer_phone_snapshot: '999888777',
      service_name_snapshot: mockService.name,
      duration_minutes_snapshot: 30,
      price_amount_snapshot: 35.0,
      currency_snapshot: 'PEN',
      cancellation_token: 'tok-1234567890123456',
      cancellation_reason: null,
      internal_notes: null,
      created_at: '2026-10-14T12:00:00Z',
      updated_at: '2026-10-14T12:00:00Z',
    };

    const result = computeAvailableSlots({
      business: mockBusiness,
      service: mockService,
      dateStr: '2026-10-15',
      businessHours: mockHours,
      exceptions: [],
      existingAppointments: [existingAppointment],
      staffMembers: mockStaff,
      slotStepMinutes: 30,
      referenceNow,
    });

    const slot10am = result.slots.find((s) => s.startTime === '10:00');
    expect(slot10am).toBeUndefined(); // El slot de las 10:00 está bloqueado
    expect(result.slots.length).toBe(5);
  });

  it('debe ignorar citas canceladas y mantener el horario disponible', () => {
    const referenceNow = new Date('2026-10-14T12:00:00Z');

    const cancelledAppointment: Appointment = {
      id: 'app-cancelled',
      business_id: mockBusiness.id,
      customer_id: 'c1',
      service_id: mockService.id,
      staff_member_id: mockStaff[0].id,
      start_at: '2026-10-15T15:00:00Z',
      end_at: '2026-10-15T15:30:00Z',
      status: 'cancelled',
      customer_name_snapshot: 'Cliente Cancelado',
      customer_email_snapshot: null,
      customer_phone_snapshot: null,
      service_name_snapshot: mockService.name,
      duration_minutes_snapshot: 30,
      price_amount_snapshot: 35.0,
      currency_snapshot: 'PEN',
      cancellation_token: 'tok-cancelled',
      cancellation_reason: 'Motivo personal',
      internal_notes: null,
      created_at: '2026-10-14T12:00:00Z',
      updated_at: '2026-10-14T12:00:00Z',
    };

    const result = computeAvailableSlots({
      business: mockBusiness,
      service: mockService,
      dateStr: '2026-10-15',
      businessHours: mockHours,
      exceptions: [],
      existingAppointments: [cancelledAppointment],
      staffMembers: mockStaff,
      slotStepMinutes: 30,
      referenceNow,
    });

    const slot10am = result.slots.find((s) => s.startTime === '10:00');
    expect(slot10am).toBeDefined();
    expect(result.slots.length).toBe(6);
  });

  it('debe respetar el tiempo de antelación mínima (min_booking_notice_hours)', () => {
    // Si la hora de referencia es el mismo día a las 09:15 AM (14:15 UTC) y min_notice es 2h,
    // ningún slot antes de las 11:15 AM debe estar disponible
    const referenceNow = new Date('2026-10-15T14:15:00Z'); // 09:15 AM Lima

    const result = computeAvailableSlots({
      business: mockBusiness,
      service: mockService,
      dateStr: '2026-10-15',
      businessHours: mockHours,
      exceptions: [],
      existingAppointments: [],
      staffMembers: mockStaff,
      slotStepMinutes: 30,
      referenceNow,
    });

    // 09:00, 09:30, 10:00, 10:30, 11:00 quedan descartados (< 11:15 AM)
    // Solo queda 11:30 AM
    expect(result.slots.length).toBe(1);
    expect(result.slots[0].startTime).toBe('11:30');
  });

  it('no debe ofrecer slots en días donde el negocio no atiende', () => {
    const referenceNow = new Date('2026-10-14T12:00:00Z');

    // 2026-10-16 es Viernes (día 5), pero mockHours solo cubre día 4 (Jueves)
    const result = computeAvailableSlots({
      business: mockBusiness,
      service: mockService,
      dateStr: '2026-10-16',
      businessHours: mockHours,
      exceptions: [],
      existingAppointments: [],
      staffMembers: mockStaff,
      referenceNow,
    });

    expect(result.hasSlots).toBe(false);
    expect(result.slots.length).toBe(0);
  });
});
