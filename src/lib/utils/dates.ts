// Utilidades para cálculo de fechas, horas y zonas horarias en CitaFácil

export const DEFAULT_TIMEZONE = 'America/Lima';

/**
 * Convierte una fecha a string de fecha YYYY-MM-DD en la zona horaria dada
 */
export function formatDateToYYYYMMDD(date: Date, timeZone: string = DEFAULT_TIMEZONE): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(date);
}

/**
 * Devuelve el día de la semana (0=Domingo, 1=Lunes, ..., 6=Sábado) para una fecha YYYY-MM-DD
 */
export function getDayOfWeekFromDateString(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  return date.getUTCDay();
}

/**
 * Parsea una hora HH:MM a minutos desde medianoche
 */
export function timeStringToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + (minutes || 0);
}

/**
 * Convierte minutos desde medianoche a string HH:MM
 */
export function minutesToTimeString(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Formatea una fecha ISO a hora legible en español (ej. "03:30 PM")
 */
export function formatTimeLegible(isoString: string, timeZone: string = DEFAULT_TIMEZONE): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('es-PE', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Formatea una fecha ISO a fecha legible en español (ej. "Viernes, 14 de Noviembre de 2026")
 */
export function formatDateLegible(isoString: string, timeZone: string = DEFAULT_TIMEZONE): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('es-PE', {
    timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/**
 * Formatea fecha y hora completa en español (ej. "14 nov 2026, 03:30 PM")
 */
export function formatDateTimeShort(isoString: string, timeZone: string = DEFAULT_TIMEZONE): string {
  const date = new Date(isoString);
  return new Intl.DateTimeFormat('es-PE', {
    timeZone,
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

/**
 * Construye una fecha ISO UTC dada una fecha YYYY-MM-DD y una hora HH:MM en la zona horaria del negocio
 */
export function combineDateAndTime(dateStr: string, timeStr: string, timeZone: string = DEFAULT_TIMEZONE): Date {
  // Obtenemos los componentes
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);

  // Estimación base
  const approxUtc = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0));
  
  // Ajuste fino por diferencia de zona horaria usando Intl
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: false,
  });

  const parts = formatter.formatToParts(approxUtc);
  const partMap: Record<string, number> = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      partMap[part.type] = Number(part.value);
    }
  }

  // Diferencia entre la hora local deseada y la hora local obtenida
  const targetLocalTimeMinutes = hours * 60 + minutes;
  const currentLocalHour = partMap.hour === 24 ? 0 : partMap.hour;
  const currentLocalMinutes = currentLocalHour * 60 + partMap.minute;
  const diffMinutes = targetLocalTimeMinutes - currentLocalMinutes;

  return new Date(approxUtc.getTime() + diffMinutes * 60 * 1000);
}

/**
 * Nombre del día de la semana en español
 */
export const DAYS_OF_WEEK_SPANISH = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
