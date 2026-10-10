import { mockDb } from './mock-db';
import { createServerSupabaseClient } from './server';
import {
  Business,
  Service,
  StaffMember,
  BusinessHours,
  ScheduleException,
  Customer,
  Appointment,
  AppointmentStatus,
  BookingSubmission,
  BookingResult,
  DashboardMetrics,
} from '@/types';

/**
 * Repositorio unificado de CitaFácil.
 * Soporta Supabase PostgreSQL en producción y el motor atómico mockDb en desarrollo/tests.
 */
export class AppointmentRepository {
  private static isSupabaseConfigured(): boolean {
    return !!(
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
      !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('tu-proyecto')
    );
  }

  static async getBusinessBySlug(slug: string): Promise<Business | null> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.getBusinessBySlug(slug);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.getBusinessBySlug(slug);

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) return null;
    return data as Business;
  }

  static async getBusinessById(id: string): Promise<Business | null> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.getBusinessById(id);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.getBusinessById(id);

    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as Business;
  }

  static async updateBusiness(id: string, data: Partial<Business>): Promise<Business> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.updateBusiness(id, data);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.updateBusiness(id, data);

    const { data: updated, error } = await supabase
      .from('businesses')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) throw new Error(error?.message || 'Error al actualizar negocio');
    return updated as Business;
  }

  static async listServices(businessId: string, onlyActive: boolean = false): Promise<Service[]> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.listServices(businessId, onlyActive);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.listServices(businessId, onlyActive);

    let query = supabase.from('services').select('*').eq('business_id', businessId);
    if (onlyActive) query = query.eq('active', true);

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Service[];
  }

  static async createService(data: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.createService(data);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.createService(data);

    const { data: created, error } = await supabase
      .from('services')
      .insert(data)
      .select()
      .single();

    if (error || !created) throw new Error(error?.message || 'Error al crear servicio');
    return created as Service;
  }

  static async updateService(id: string, data: Partial<Service>): Promise<Service> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.updateService(id, data);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.updateService(id, data);

    const { data: updated, error } = await supabase
      .from('services')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error || !updated) throw new Error(error?.message || 'Error al actualizar servicio');
    return updated as Service;
  }

  static async deleteService(id: string): Promise<boolean> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.deleteService(id);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.deleteService(id);

    const { error } = await supabase.from('services').delete().eq('id', id);
    return !error;
  }

  static async listStaff(businessId: string): Promise<StaffMember[]> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.listStaff(businessId);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.listStaff(businessId);

    const { data, error } = await supabase
      .from('staff_members')
      .select('*, staff_services(service_id)')
      .eq('business_id', businessId)
      .eq('active', true);

    if (error || !data) return [];
    return data as StaffMember[];
  }

  static async listBusinessHours(businessId: string): Promise<BusinessHours[]> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.listBusinessHours(businessId);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.listBusinessHours(businessId);

    const { data, error } = await supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', businessId);

    if (error || !data) return [];
    return data as BusinessHours[];
  }

  static async listExceptions(businessId: string): Promise<ScheduleException[]> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.listExceptions(businessId);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.listExceptions(businessId);

    const { data, error } = await supabase
      .from('schedule_exceptions')
      .select('*')
      .eq('business_id', businessId);

    if (error || !data) return [];
    return data as ScheduleException[];
  }

  static async listCustomers(businessId: string): Promise<Customer[]> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.listCustomers(businessId);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.listCustomers(businessId);

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('business_id', businessId);

    if (error || !data) return [];
    return data as Customer[];
  }

  static async listAppointments(
    businessId: string,
    filter?: { status?: string; date?: string; search?: string }
  ): Promise<Appointment[]> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.listAppointments(businessId, filter);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.listAppointments(businessId, filter);

    let query = supabase
      .from('appointments')
      .select('*, customer:customers(*), service:services(*), staff:staff_members(*)')
      .eq('business_id', businessId)
      .order('start_at', { ascending: true });

    if (filter?.status && filter.status !== 'all') {
      query = query.eq('status', filter.status);
    }

    const { data, error } = await query;
    if (error || !data) return [];
    return data as Appointment[];
  }

  static async getAppointmentById(id: string): Promise<Appointment | null> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.getAppointmentById(id);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.getAppointmentById(id);

    const { data, error } = await supabase
      .from('appointments')
      .select('*, customer:customers(*), service:services(*), staff:staff_members(*), business:businesses(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return data as Appointment;
  }

  static async getAppointmentByToken(token: string): Promise<Appointment | null> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.getAppointmentByToken(token);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.getAppointmentByToken(token);

    const { data, error } = await supabase
      .from('appointments')
      .select('*, service:services(*), business:businesses(*)')
      .eq('cancellation_token', token)
      .single();

    if (error || !data) return null;
    return data as Appointment;
  }

  /**
   * Operación atómica de reserva que previene dobles reservas bajo concurrencia
   */
  static async createAppointmentAtomic(submission: BookingSubmission): Promise<BookingResult> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.createAppointmentAtomic(submission);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.createAppointmentAtomic(submission);

    // Llamada al RPC seguro de PostgreSQL
    const { data, error } = await supabase.rpc('create_appointment_atomic', {
      p_business_slug: submission.businessSlug,
      p_service_id: submission.serviceId,
      p_staff_member_id: submission.staffMemberId || null,
      p_start_at: submission.startAtIso,
      p_customer_name: submission.customerName,
      p_customer_email: submission.customerEmail || null,
      p_customer_phone: submission.customerPhone || null,
      p_internal_notes: submission.internalNotes || null,
    });

    if (error || !data) {
      return {
        success: false,
        error: error?.message || 'Error al procesar la reserva.',
      };
    }

    const res = data as any;
    if (!res.success) {
      return { success: false, error: res.error };
    }

    return {
      success: true,
      appointmentId: res.appointment_id,
      cancellationCode: res.cancellation_token,
      startAt: res.start_at,
      endAt: res.end_at,
      serviceName: res.service_name,
      businessName: res.business_name,
      businessAddress: res.business_address,
    };
  }

  static async cancelAppointmentByToken(token: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.cancelAppointmentByToken(token, reason);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.cancelAppointmentByToken(token, reason);

    const { data, error } = await supabase.rpc('cancel_appointment_by_token', {
      p_cancellation_token: token,
      p_reason: reason || null,
    });

    if (error || !data) {
      return { success: false, error: error?.message || 'Error al cancelar la cita.' };
    }

    const res = data as any;
    return { success: res.success, error: res.error };
  }

  static async updateAppointmentStatus(id: string, status: AppointmentStatus, notes?: string): Promise<Appointment> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.updateAppointmentStatus(id, status, notes);
    }

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.updateAppointmentStatus(id, status, notes);

    const updatePayload: any = { status, updated_at: new Date().toISOString() };
    if (notes !== undefined) updatePayload.internal_notes = notes;

    const { data, error } = await supabase
      .from('appointments')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Error al actualizar estado');
    return data as Appointment;
  }

  static async rescheduleAppointment(id: string, newStartAtIso: string, staffMemberId?: string | null): Promise<Appointment> {
    if (!this.isSupabaseConfigured()) {
      return mockDb.rescheduleAppointment(id, newStartAtIso, staffMemberId);
    }

    // En Supabase, actualizamos recalculando end_at
    const app = await this.getAppointmentById(id);
    if (!app) throw new Error('Cita no encontrada');

    const duration = app.duration_minutes_snapshot;
    const newStart = new Date(newStartAtIso);
    const newEnd = new Date(newStart.getTime() + duration * 60 * 1000);

    const supabase = await createServerSupabaseClient();
    if (!supabase) return mockDb.rescheduleAppointment(id, newStartAtIso, staffMemberId);

    const updateData: any = {
      start_at: newStart.toISOString(),
      end_at: newEnd.toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (staffMemberId !== undefined) updateData.staff_member_id = staffMemberId;

    const { data, error } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) throw new Error(error?.message || 'Conflicto al reprogramar horario.');
    return data as Appointment;
  }

  static async getDashboardMetrics(businessId: string): Promise<DashboardMetrics> {
    return mockDb.getDashboardMetrics(businessId);
  }
}
