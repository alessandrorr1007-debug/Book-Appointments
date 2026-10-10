import {
  Business,
  BusinessHours,
  ScheduleException,
  Service,
  StaffMember,
  Appointment,
  TimeSlot,
  DayAvailability,
} from '@/types';
import {
  combineDateAndTime,
  getDayOfWeekFromDateString,
  timeStringToMinutes,
  minutesToTimeString,
  DEFAULT_TIMEZONE,
} from '@/lib/utils/dates';

export interface ComputeSlotsParams {
  business: Business;
  service: Service;
  dateStr: string; // "YYYY-MM-DD"
  businessHours: BusinessHours[];
  exceptions: ScheduleException[];
  existingAppointments: Appointment[];
  staffMembers: StaffMember[];
  selectedStaffId?: string | null;
  slotStepMinutes?: number; // Intervalo de separación entre slots (por defecto 30 minutos o según duración)
  referenceNow?: Date; // Fecha de referencia (por defecto Date.now())
}

/**
 * Calcula la lista de TimeSlots para un servicio y un día determinado
 */
export function computeAvailableSlots(params: ComputeSlotsParams): DayAvailability {
  const {
    business,
    service,
    dateStr,
    businessHours,
    exceptions,
    existingAppointments,
    staffMembers,
    selectedStaffId,
    slotStepMinutes = 30,
    referenceNow = new Date(),
  } = params;

  const timeZone = business.timezone || DEFAULT_TIMEZONE;
  const dayOfWeek = getDayOfWeekFromDateString(dateStr);

  // 1. Validar que el negocio tenga reservas activas
  if (!business.booking_enabled || !service.active) {
    return { date: dateStr, hasSlots: false, slots: [] };
  }

  // 2. Comprobar límites de antelación máxima (días a futuro)
  const maxAdvanceMs = business.max_booking_advance_days * 24 * 60 * 60 * 1000;
  const targetDayStart = combineDateAndTime(dateStr, '00:00', timeZone);
  if (targetDayStart.getTime() > referenceNow.getTime() + maxAdvanceMs) {
    return { date: dateStr, hasSlots: false, slots: [] };
  }

  // 3. Comprobar antelación mínima requerida en horas
  const minNoticeMs = business.min_booking_notice_hours * 60 * 60 * 1000;
  const earliestAllowedTime = new Date(referenceNow.getTime() + minNoticeMs);

  // 4. Filtrar horarios de atención para este día de la semana
  const dayHours = businessHours.filter(
    (h) => h.day_of_week === dayOfWeek && (!h.staff_member_id || h.staff_member_id === selectedStaffId)
  );

  if (dayHours.length === 0) {
    return { date: dateStr, hasSlots: false, slots: [] };
  }

  // 5. Filtrar excepciones de horario para este día
  const dayExceptions = exceptions.filter((exc) => {
    const excStart = new Date(exc.start_at);
    const excEnd = new Date(exc.end_at);
    const dayStart = combineDateAndTime(dateStr, '00:00', timeZone);
    const dayEnd = combineDateAndTime(dateStr, '23:59', timeZone);
    return excStart <= dayEnd && excEnd >= dayStart;
  });

  // Si hay una excepción que cierra todo el día
  const fullDayClosure = dayExceptions.find(
    (exc) => !exc.is_available && (!exc.staff_member_id || exc.staff_member_id === selectedStaffId)
  );

  // Duración total ocupada = buffer_before + duración + buffer_after
  const totalServiceDuration = service.duration_minutes;
  const bufferBefore = service.buffer_before_minutes || 0;
  const bufferAfter = service.buffer_after_minutes || 0;

  // Filtrar profesionales que pueden atender este servicio
  const eligibleStaff = staffMembers.filter((staff) => {
    if (!staff.active) return false;
    if (selectedStaffId && staff.id !== selectedStaffId) return false;
    // Si el staff tiene servicios asociados, verificar que incluya este servicio
    if (staff.services && staff.services.length > 0) {
      return staff.services.some((s) => s.id === service.id);
    }
    return true;
  });

  const slots: TimeSlot[] = [];

  // Recorrer cada turno del día
  for (const bh of dayHours) {
    const shiftStartMin = timeStringToMinutes(bh.start_time);
    const shiftEndMin = timeStringToMinutes(bh.end_time);

    let currentStartMin = shiftStartMin;

    while (currentStartMin + totalServiceDuration <= shiftEndMin) {
      const currentEndMin = currentStartMin + totalServiceDuration;
      const startTimeStr = minutesToTimeString(currentStartMin);
      const endTimeStr = minutesToTimeString(currentEndMin);

      const slotStartDate = combineDateAndTime(dateStr, startTimeStr, timeZone);
      const slotEndDate = combineDateAndTime(dateStr, endTimeStr, timeZone);

      // Comprobar si ya pasó la hora o no cumple con antelación mínima
      if (slotStartDate.getTime() < earliestAllowedTime.getTime()) {
        currentStartMin += slotStepMinutes;
        continue;
      }

      // Comprobar si choca con una excepción de horario (cierre temporal)
      let blockedByException = false;
      for (const exc of dayExceptions) {
        if (!exc.is_available) {
          const excStart = new Date(exc.start_at).getTime();
          const excEnd = new Date(exc.end_at).getTime();
          if (slotStartDate.getTime() < excEnd && slotEndDate.getTime() > excStart) {
            blockedByException = true;
            break;
          }
        }
      }

      if (blockedByException) {
        currentStartMin += slotStepMinutes;
        continue;
      }

      // Intervalo efectivo con buffers incluidos
      const effectiveStartWithBuffer = new Date(slotStartDate.getTime() - bufferBefore * 60 * 1000).getTime();
      const effectiveEndWithBuffer = new Date(slotEndDate.getTime() + bufferAfter * 60 * 1000).getTime();

      // Verificar disponibilidad contra citas existentes
      let availableStaffForSlot: StaffMember | null = null;

      if (eligibleStaff.length > 0) {
        // Encontrar al menos un staff disponible para este slot
        for (const staff of eligibleStaff) {
          const hasCollision = existingAppointments.some((app) => {
            if (app.status === 'cancelled' || app.status === 'no_show') return false;
            if (app.staff_member_id && app.staff_member_id !== staff.id) return false;

            const appStart = new Date(app.start_at).getTime();
            const appEnd = new Date(app.end_at).getTime();

            // Dos intervalos [A, B] y [C, D] se solapan si A < D y B > C
            return effectiveStartWithBuffer < appEnd && effectiveEndWithBuffer > appStart;
          });

          if (!hasCollision) {
            availableStaffForSlot = staff;
            break; // Encontramos personal disponible
          }
        }
      } else {
        // Negocio sin asignación de staff individual (capacidad única general)
        const hasCollision = existingAppointments.some((app) => {
          if (app.status === 'cancelled' || app.status === 'no_show') return false;
          const appStart = new Date(app.start_at).getTime();
          const appEnd = new Date(app.end_at).getTime();
          return effectiveStartWithBuffer < appEnd && effectiveEndWithBuffer > appStart;
        });

        if (!hasCollision) {
          availableStaffForSlot = null; // Disponible como recurso general
        }
      }

      // Determinamos si el slot está disponible
      const isAvailable = eligibleStaff.length > 0 ? availableStaffForSlot !== null : !existingAppointments.some((app) => {
        if (app.status === 'cancelled' || app.status === 'no_show') return false;
        const appStart = new Date(app.start_at).getTime();
        const appEnd = new Date(app.end_at).getTime();
        return effectiveStartWithBuffer < appEnd && effectiveEndWithBuffer > appStart;
      });

      if (isAvailable) {
        slots.push({
          startTime: startTimeStr,
          endTime: endTimeStr,
          startAtIso: slotStartDate.toISOString(),
          endAtIso: slotEndDate.toISOString(),
          available: true,
          staffMemberId: availableStaffForSlot ? availableStaffForSlot.id : selectedStaffId || null,
          staffDisplayName: availableStaffForSlot ? availableStaffForSlot.display_name : undefined,
        });
      }

      currentStartMin += slotStepMinutes;
    }
  }

  return {
    date: dateStr,
    hasSlots: slots.length > 0,
    slots,
  };
}
