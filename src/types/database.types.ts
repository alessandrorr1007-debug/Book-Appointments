export type MembershipRole = 'owner' | 'admin' | 'receptionist';

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp';

export type NotificationType =
  | 'booking_created'
  | 'booking_confirmed'
  | 'booking_rescheduled'
  | 'booking_cancelled'
  | 'reminder';

export interface Profile {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  name: string;
  slug: string;
  business_type: string;
  description: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  timezone: string;
  logo_url: string | null;
  booking_enabled: boolean;
  min_booking_notice_hours: number;
  max_booking_advance_days: number;
  cancellation_notice_hours: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessMember {
  id: string;
  business_id: string;
  user_id: string;
  role: MembershipRole;
  created_at: string;
  profile?: Profile;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  price_amount: number | null;
  currency: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffMember {
  id: string;
  business_id: string;
  display_name: string;
  email: string | null;
  phone: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
  services?: Service[];
}

export interface StaffService {
  staff_member_id: string;
  service_id: string;
}

export interface BusinessHours {
  id: string;
  business_id: string;
  staff_member_id: string | null;
  day_of_week: number; // 0=Sunday, 1=Monday, ..., 6=Saturday
  start_time: string; // "09:00:00"
  end_time: string; // "18:00:00"
  created_at: string;
  updated_at: string;
}

export interface ScheduleException {
  id: string;
  business_id: string;
  staff_member_id: string | null;
  start_at: string;
  end_at: string;
  is_available: boolean;
  reason: string | null;
  created_at: string;
}

export interface Customer {
  id: string;
  business_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  customer_id: string;
  service_id: string;
  staff_member_id: string | null;
  start_at: string;
  end_at: string;
  status: AppointmentStatus;
  customer_name_snapshot: string;
  customer_email_snapshot: string | null;
  customer_phone_snapshot: string | null;
  service_name_snapshot: string;
  duration_minutes_snapshot: number;
  price_amount_snapshot: number | null;
  currency_snapshot: string;
  cancellation_token: string;
  cancellation_reason: string | null;
  internal_notes: string | null;
  created_at: string;
  updated_at: string;
  // Relaciones cargadas para vistas
  customer?: Customer;
  service?: Service;
  staff?: StaffMember;
  business?: Business;
}

export interface NotificationLog {
  id: string;
  business_id: string;
  appointment_id: string | null;
  channel: NotificationChannel;
  notification_type: NotificationType;
  status: 'pending' | 'sent' | 'failed';
  provider_reference: string | null;
  error_message: string | null;
  sent_at: string | null;
  created_at: string;
}
