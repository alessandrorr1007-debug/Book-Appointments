import { describe, it, expect } from 'vitest';
import { AppointmentRepository } from '../src/lib/supabase/repository';

describe('CitaFácil — Prevención de Doble Reserva y Pruebas Críticas de Concurrencia', () => {
  it('debe impedir solapamientos y confirmar exactamente UNA cita ante múltiples peticiones concurrentes idénticas', async () => {
    const slug = 'don-luigi';
    const business = await AppointmentRepository.getBusinessBySlug(slug);
    expect(business).toBeDefined();

    const services = await AppointmentRepository.listServices(business!.id, true);
    const targetService = services[0];
    expect(targetService).toBeDefined();

    const staff = await AppointmentRepository.listStaff(business!.id);
    const targetStaff = staff[0];
    expect(targetStaff).toBeDefined();

    // Horario a reservar: dentro de 5 días a las 10:00 AM
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 5);
    targetDate.setHours(10, 0, 0, 0);
    const startAtIso = targetDate.toISOString();

    // Lanzamos 10 peticiones concurrentes simultáneas hacia el mismo profesional y slot exacto
    const concurrentRequestsCount = 10;
    const promises = Array.from({ length: concurrentRequestsCount }).map((_, index) => {
      return AppointmentRepository.createAppointmentAtomic({
        businessSlug: slug,
        serviceId: targetService.id,
        staffMemberId: targetStaff.id,
        startAtIso,
        customerName: `Cliente Concurrente ${index + 1}`,
        customerEmail: `cliente${index + 1}@ejemplo.com`,
        customerPhone: `+51 900 000 00${index}`,
        internalNotes: `Prueba de concurrencia #${index + 1}`,
      });
    });

    const results = await Promise.all(promises);

    const successfulBookings = results.filter((r) => r.success);
    const failedBookings = results.filter((r) => !r.success);

    // EXACTAMENTE una solicitud debe ganar la reserva confirmada
    expect(successfulBookings.length).toBe(1);
    expect(successfulBookings[0].appointmentId).toBeDefined();
    expect(successfulBookings[0].cancellationCode).toBeDefined();

    // Las otras 9 deben ser rechazadas con mensaje limpio de colisión
    expect(failedBookings.length).toBe(concurrentRequestsCount - 1);
    for (const failed of failedBookings) {
      expect(failed.error).toContain('Lo sentimos, ese horario acaba de ser ocupado');
    }

    // Verificar en la base de datos que solo existe una cita para ese intervalo y personal
    const allAppointments = await AppointmentRepository.listAppointments(business!.id);
    const conflicting = allAppointments.filter(
      (a) =>
        a.staff_member_id === targetStaff.id &&
        a.start_at === startAtIso &&
        a.status === 'confirmed'
    );
    expect(conflicting.length).toBe(1);
  });
});
