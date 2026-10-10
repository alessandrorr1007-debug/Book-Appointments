export * from './database.types';

export interface TimeSlot {
  startTime: string; // "09:00"
  endTime: string; // "10:00"
  startAtIso: string;
  endAtIso: string;
  available: boolean;
  reason?: string;
  staffMemberId?: string | null;
  staffDisplayName?: string | null;
}

export interface DayAvailability {
  date: string; // "YYYY-MM-DD"
  hasSlots: boolean;
  slots: TimeSlot[];
}

export interface BookingSubmission {
  businessSlug: string;
  serviceId: string;
  staffMemberId?: string | null;
  startAtIso: string;
  customerName: string;
  customerEmail?: string | null;
  customerPhone?: string | null;
  internalNotes?: string | null;
}

export interface BookingResult {
  success: boolean;
  error?: string;
  appointmentId?: string;
  cancellationCode?: string;
  startAt?: string;
  endAt?: string;
  serviceName?: string;
  businessName?: string;
  businessAddress?: string | null;
}

export interface DashboardMetrics {
  todayAppointmentsCount: number;
  upcomingCount: number;
  pendingCount: number;
  confirmedCount: number;
  cancelledCount: number;
  completedCount: number;
  estimatedRevenue: number;
  popularServices: { name: string; count: number }[];
}
