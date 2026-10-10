import {
  Business,
  Service,
  StaffMember,
  BusinessHours,
  ScheduleException,
  Customer,
  Appointment,
  NotificationLog,
  AppointmentStatus,
  BookingSubmission,
  BookingResult,
  DashboardMetrics,
} from '@/types';
import { combineDateAndTime } from '@/lib/utils/dates';

// Semillas iniciales realistas para negocios en Perú
const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Barbería & Spa Don Luigi',
    slug: 'don-luigi',
    business_type: 'barbershop',
    description: 'Especialistas en corte clásico, afeitado tradicional con toalla caliente y cuidado masculino en Lima.',
    phone: '+51 987 654 321',
    email: 'contacto@donluigi.pe',
    address: 'Av. José Larco 450, Interior 201, Miraflores, Lima',
    timezone: 'America/Lima',
    logo_url: null,
    booking_enabled: true,
    min_booking_notice_hours: 2,
    max_booking_advance_days: 30,
    cancellation_notice_hours: 4,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const INITIAL_SERVICES: Service[] = [
  {
    id: 's1111111-1111-1111-1111-111111111111',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Corte de Cabello Clásico',
    description: 'Diagnóstico capilar, corte a tijera/máquina, lavado exfoliante y peinado con cera mate.',
    duration_minutes: 30,
    buffer_before_minutes: 5,
    buffer_after_minutes: 5,
    price_amount: 35.0,
    currency: 'PEN',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 's2222222-2222-2222-2222-222222222222',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Ritual de Barba Don Luigi',
    description: 'Perfilado con navaja japonesa, toallas calientes aromatizadas y bálsamo hidratante.',
    duration_minutes: 25,
    buffer_before_minutes: 5,
    buffer_after_minutes: 5,
    price_amount: 25.0,
    currency: 'PEN',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 's3333333-3333-3333-3333-333333333333',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    name: 'Combo Don Luigi: Corte + Barba + Mascarilla Black Mask',
    description: 'El servicio estrella completo. Corte impecable, afeitado deluxe y limpieza profunda de poros.',
    duration_minutes: 60,
    buffer_before_minutes: 5,
    buffer_after_minutes: 10,
    price_amount: 60.0,
    currency: 'PEN',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
  },
];

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'st111111-1111-1111-1111-111111111111',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    display_name: 'Carlos "Luigi" Mendoza',
    email: 'luigi@donluigi.pe',
    phone: '+51 911 222 333',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    services: INITIAL_SERVICES,
  },
  {
    id: 'st222222-2222-2222-2222-222222222222',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    display_name: 'Mateo Fernández',
    email: 'mateo@donluigi.pe',
    phone: '+51 944 555 666',
    active: true,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z',
    services: [INITIAL_SERVICES[0], INITIAL_SERVICES[1]],
  },
];

// Horario de atención de Lunes (1) a Sábado (6) de 09:00 a 20:00
const INITIAL_HOURS: BusinessHours[] = [1, 2, 3, 4, 5, 6].map((day) => ({
  id: `bh-${day}`,
  business_id: 'b1111111-1111-1111-1111-111111111111',
  staff_member_id: null,
  day_of_week: day,
  start_time: '09:00:00',
  end_time: '20:00:00',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}));

const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    full_name: 'Alejandro Vargas',
    email: 'alejandro.vargas@gmail.com',
    phone: '+51 988 123 456',
    notes: 'Prefiere corte con tijera en los laterales.',
    created_at: '2026-01-05T00:00:00Z',
    updated_at: '2026-01-05T00:00:00Z',
  },
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    business_id: 'b1111111-1111-1111-1111-111111111111',
    full_name: 'Renzo Cavagnaro',
    email: 'renzo.c@outlook.com',
    phone: '+51 977 654 321',
    notes: 'Cliente puntual. Siempre solicita el combo completo.',
    created_at: '2026-01-10T00:00:00Z',
    updated_at: '2026-01-10T00:00:00Z',
  },
];

class MockDatabase {
  private businesses: Business[] = [...INITIAL_BUSINESSES];
  private services: Service[] = [...INITIAL_SERVICES];
  private staffMembers: StaffMember[] = [...INITIAL_STAFF];
  private businessHours: BusinessHours[] = [...INITIAL_HOURS];
  private exceptions: ScheduleException[] = [];
  private customers: Customer[] = [...INITIAL_CUSTOMERS];
  private appointments: Appointment[] = [];
  private notificationLogs: NotificationLog[] = [];

  // Mutex para simular concurrencia atómica de base de datos
  private lockPromise: Promise<void> = Promise.resolve();

  private async acquireLock(): Promise<() => void> {
    let release: () => void = () => {};
    const nextLock = new Promise<void>((resolve) => {
      release = resolve;
    });
    const currentLock = this.lockPromise;
    this.lockPromise = this.lockPromise.then(() => nextLock);
    await currentLock;
    return release;
  }

  // --- Negocios ---
  async getBusinessBySlug(slug: string): Promise<Business | null> {
    return this.businesses.find((b) => b.slug === slug) || null;
  }

  async getBusinessById(id: string): Promise<Business | null> {
    return this.businesses.find((b) => b.id === id) || null;
  }

  async updateBusiness(id: string, data: Partial<Business>): Promise<Business> {
    const index = this.businesses.findIndex((b) => b.id === id);
    if (index === -1) throw new Error('Negocio no encontrado');
    this.businesses[index] = {
      ...this.businesses[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.businesses[index];
  }

  // --- Servicios ---
  async listServices(businessId: string, onlyActive: boolean = false): Promise<Service[]> {
    return this.services.filter(
      (s) => s.business_id === businessId && (!onlyActive || s.active)
    );
  }

  async getServiceById(id: string): Promise<Service | null> {
    return this.services.find((s) => s.id === id) || null;
  }

  async createService(data: Omit<Service, 'id' | 'created_at' | 'updated_at'>): Promise<Service> {
    const newService: Service = {
      ...data,
      id: `s-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.services.push(newService);
    return newService;
  }

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const index = this.services.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Servicio no encontrado');
    this.services[index] = {
      ...this.services[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.services[index];
  }

  async deleteService(id: string): Promise<boolean> {
    const hasAppointments = this.appointments.some((a) => a.service_id === id);
    if (hasAppointments) {
      // Si tiene citas históricas, se desactiva en vez de borrar (integridad referencial)
      await this.updateService(id, { active: false });
      return true;
    }
    this.services = this.services.filter((s) => s.id !== id);
    return true;
  }

  // --- Staff ---
  async listStaff(businessId: string): Promise<StaffMember[]> {
    return this.staffMembers.filter((sm) => sm.business_id === businessId && sm.active);
  }

  async createStaff(data: Omit<StaffMember, 'id' | 'created_at' | 'updated_at'>): Promise<StaffMember> {
    const newStaff: StaffMember = {
      ...data,
      id: `st-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    this.staffMembers.push(newStaff);
    return newStaff;
  }

  async updateStaff(id: string, data: Partial<StaffMember>): Promise<StaffMember> {
    const index = this.staffMembers.findIndex((s) => s.id === id);
    if (index === -1) throw new Error('Personal no encontrado');
    this.staffMembers[index] = {
      ...this.staffMembers[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    return this.staffMembers[index];
  }

  // --- Horarios y Excepciones ---
  async listBusinessHours(businessId: string): Promise<BusinessHours[]> {
    return this.businessHours.filter((bh) => bh.business_id === businessId);
  }

  async updateBusinessHours(businessId: string, hours: Omit<BusinessHours, 'id' | 'created_at' | 'updated_at'>[]): Promise<BusinessHours[]> {
    this.businessHours = this.businessHours.filter((bh) => bh.business_id !== businessId);
    const newHours: BusinessHours[] = hours.map((h, i) => ({
      ...h,
      id: `bh-${Date.now()}-${i}`,
      business_id: businessId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
    this.businessHours.push(...newHours);
    return newHours;
  }

  async listExceptions(businessId: string): Promise<ScheduleException[]> {
    return this.exceptions.filter((exc) => exc.business_id === businessId);
  }

  // --- Clientes ---
  async listCustomers(businessId: string): Promise<Customer[]> {
    return this.customers.filter((c) => c.business_id === businessId);
  }

  // --- Citas y Creación Atómica Anti-Colisión ---
  async listAppointments(
    businessId: string,
    filter?: { status?: string; date?: string; search?: string }
  ): Promise<Appointment[]> {
    return this.appointments
      .filter((app) => {
        if (app.business_id !== businessId) return false;
        if (filter?.status && filter.status !== 'all' && app.status !== filter.status) return false;
        if (filter?.date && !app.start_at.startsWith(filter.date)) return false;
        if (filter?.search) {
          const q = filter.search.toLowerCase();
          const matchName = app.customer_name_snapshot.toLowerCase().includes(q);
          const matchPhone = app.customer_phone_snapshot?.toLowerCase().includes(q);
          const matchService = app.service_name_snapshot.toLowerCase().includes(q);
          if (!matchName && !matchPhone && !matchService) return false;
        }
        return true;
      })
      .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime());
  }

  async getAppointmentById(id: string): Promise<Appointment | null> {
    return this.appointments.find((a) => a.id === id) || null;
  }

  async getAppointmentByToken(token: string): Promise<Appointment | null> {
    const app = this.appointments.find((a) => a.cancellation_token === token);
    if (!app) return null;
    const business = await this.getBusinessById(app.business_id);
    const service = await this.getServiceById(app.service_id);
    return {
      ...app,
      business: business || undefined,
      service: service || undefined,
    };
  }

  /**
   * Creación atómica de citas: previene colisiones y solapamientos
   * con control estricto de concurrencia y snapshots históricos.
   */
  async createAppointmentAtomic(submission: BookingSubmission): Promise<BookingResult> {
    const releaseLock = await this.acquireLock();
    try {
      const business = await this.getBusinessBySlug(submission.businessSlug);
      if (!business || !business.booking_enabled) {
        return { success: false, error: 'El negocio no existe o tiene las reservas deshabilitadas.' };
      }

      const service = await this.getServiceById(submission.serviceId);
      if (!service || !service.active || service.business_id !== business.id) {
        return { success: false, error: 'El servicio solicitado no está disponible.' };
      }

      const startAtDate = new Date(submission.startAtIso);
      const endAtDate = new Date(startAtDate.getTime() + service.duration_minutes * 60 * 1000);
      const now = new Date();

      // Validación de antelación mínima
      const minNoticeTime = new Date(now.getTime() + business.min_booking_notice_hours * 60 * 60 * 1000);
      if (startAtDate < minNoticeTime) {
        return { success: false, error: `La reserva requiere al menos ${business.min_booking_notice_hours} horas de anticipación.` };
      }

      // Verificación de colisión
      const effectiveStartWithBuffer = startAtDate.getTime() - (service.buffer_before_minutes || 0) * 60 * 1000;
      const effectiveEndWithBuffer = endAtDate.getTime() + (service.buffer_after_minutes || 0) * 60 * 1000;

      let assignedStaffId = submission.staffMemberId;

      if (assignedStaffId) {
        const staff = this.staffMembers.find((sm) => sm.id === assignedStaffId && sm.active);
        if (!staff) {
          return { success: false, error: 'El profesional seleccionado no está disponible.' };
        }

        const isColliding = this.appointments.some((app) => {
          if (app.status === 'cancelled' || app.status === 'no_show') return false;
          if (app.staff_member_id !== assignedStaffId) return false;
          const aStart = new Date(app.start_at).getTime();
          const aEnd = new Date(app.end_at).getTime();
          return effectiveStartWithBuffer < aEnd && effectiveEndWithBuffer > aStart;
        });

        if (isColliding) {
          return {
            success: false,
            error: 'Lo sentimos, ese horario acaba de ser ocupado. Por favor selecciona otro horario.',
          };
        }
      } else {
        // Encontrar primer staff disponible o asignar general
        const availableStaff = this.staffMembers.find((sm) => {
          if (!sm.active || sm.business_id !== business.id) return false;
          return !this.appointments.some((app) => {
            if (app.status === 'cancelled' || app.status === 'no_show') return false;
            if (app.staff_member_id !== sm.id) return false;
            const aStart = new Date(app.start_at).getTime();
            const aEnd = new Date(app.end_at).getTime();
            return effectiveStartWithBuffer < aEnd && effectiveEndWithBuffer > aStart;
          });
        });

        if (this.staffMembers.filter((s) => s.business_id === business.id && s.active).length > 0 && !availableStaff) {
          return {
            success: false,
            error: 'No hay profesionales disponibles en el horario solicitado.',
          };
        }

        assignedStaffId = availableStaff ? availableStaff.id : null;
      }

      // Buscar o registrar cliente
      let customer = this.customers.find(
        (c) =>
          c.business_id === business.id &&
          ((submission.customerPhone && c.phone === submission.customerPhone) ||
            (submission.customerEmail && c.email === submission.customerEmail))
      );

      if (!customer) {
        customer = {
          id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          business_id: business.id,
          full_name: submission.customerName,
          email: submission.customerEmail || null,
          phone: submission.customerPhone || null,
          notes: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        this.customers.push(customer);
      } else {
        customer.full_name = submission.customerName;
        if (submission.customerEmail) customer.email = submission.customerEmail;
        if (submission.customerPhone) customer.phone = submission.customerPhone;
      }

      // Generar token no predecible de cancelación
      const cancellationToken = `token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const appointmentId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

      const newAppointment: Appointment = {
        id: appointmentId,
        business_id: business.id,
        customer_id: customer.id,
        service_id: service.id,
        staff_member_id: assignedStaffId || null,
        start_at: startAtDate.toISOString(),
        end_at: endAtDate.toISOString(),
        status: 'confirmed',
        customer_name_snapshot: submission.customerName,
        customer_email_snapshot: submission.customerEmail || null,
        customer_phone_snapshot: submission.customerPhone || null,
        service_name_snapshot: service.name,
        duration_minutes_snapshot: service.duration_minutes,
        price_amount_snapshot: service.price_amount,
        currency_snapshot: service.currency,
        cancellation_token: cancellationToken,
        cancellation_reason: null,
        internal_notes: submission.internalNotes || null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      this.appointments.push(newAppointment);

      // Log de notificación
      this.notificationLogs.push({
        id: `notif-${Date.now()}`,
        business_id: business.id,
        appointment_id: newAppointment.id,
        channel: 'email',
        notification_type: 'booking_created',
        status: 'sent',
        provider_reference: 'mock_provider_sent',
        error_message: null,
        sent_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      });

      return {
        success: true,
        appointmentId: newAppointment.id,
        cancellationCode: cancellationToken,
        startAt: newAppointment.start_at,
        endAt: newAppointment.end_at,
        serviceName: service.name,
        businessName: business.name,
        businessAddress: business.address,
      };
    } finally {
      releaseLock();
    }
  }

  async cancelAppointmentByToken(token: string, reason?: string): Promise<{ success: boolean; error?: string }> {
    const releaseLock = await this.acquireLock();
    try {
      const app = this.appointments.find((a) => a.cancellation_token === token);
      if (!app) return { success: false, error: 'Cita no encontrada o enlace inválido.' };
      if (app.status === 'cancelled') return { success: false, error: 'La cita ya fue cancelada previamente.' };

      const business = await this.getBusinessById(app.business_id);
      if (business) {
        const noticeMs = business.cancellation_notice_hours * 60 * 60 * 1000;
        const now = new Date();
        const appStart = new Date(app.start_at);
        if (now.getTime() > appStart.getTime() - noticeMs) {
          return {
            success: false,
            error: `La política del negocio requiere al menos ${business.cancellation_notice_hours} horas de anticipación para cancelar.`,
          };
        }
      }

      app.status = 'cancelled';
      app.cancellation_reason = reason || 'Cancelada por el cliente desde la web';
      app.updated_at = new Date().toISOString();

      return { success: true };
    } finally {
      releaseLock();
    }
  }

  async updateAppointmentStatus(id: string, status: AppointmentStatus, notes?: string): Promise<Appointment> {
    const app = this.appointments.find((a) => a.id === id);
    if (!app) throw new Error('Cita no encontrada');
    app.status = status;
    if (notes !== undefined) app.internal_notes = notes;
    app.updated_at = new Date().toISOString();
    return app;
  }

  async rescheduleAppointment(id: string, newStartAtIso: string, staffMemberId?: string | null): Promise<Appointment> {
    const releaseLock = await this.acquireLock();
    try {
      const app = this.appointments.find((a) => a.id === id);
      if (!app) throw new Error('Cita no encontrada');
      if (app.status === 'cancelled') throw new Error('No se puede reprogramar una cita cancelada');

      const service = await this.getServiceById(app.service_id);
      const duration = service ? service.duration_minutes : app.duration_minutes_snapshot;
      const newStart = new Date(newStartAtIso);
      const newEnd = new Date(newStart.getTime() + duration * 60 * 1000);

      // Verificar colisión
      const targetStaffId = staffMemberId !== undefined ? staffMemberId : app.staff_member_id;
      const collision = this.appointments.some((other) => {
        if (other.id === app.id) return false;
        if (other.status === 'cancelled' || other.status === 'no_show') return false;
        if (targetStaffId && other.staff_member_id !== targetStaffId) return false;
        const oStart = new Date(other.start_at).getTime();
        const oEnd = new Date(other.end_at).getTime();
        return newStart.getTime() < oEnd && newEnd.getTime() > oStart;
      });

      if (collision) {
        throw new Error('El nuevo horario seleccionado ya está ocupado.');
      }

      app.start_at = newStart.toISOString();
      app.end_at = newEnd.toISOString();
      if (targetStaffId !== undefined) app.staff_member_id = targetStaffId;
      app.updated_at = new Date().toISOString();

      return app;
    } finally {
      releaseLock();
    }
  }

  // --- Métricas del Dashboard ---
  async getDashboardMetrics(businessId: string): Promise<DashboardMetrics> {
    const businessApps = this.appointments.filter((a) => a.business_id === businessId);
    const today = new Date().toISOString().split('T')[0];
    const nowMs = Date.now();

    const todayApps = businessApps.filter((a) => a.start_at.startsWith(today));
    const upcoming = businessApps.filter((a) => new Date(a.start_at).getTime() > nowMs && a.status !== 'cancelled');
    const pending = businessApps.filter((a) => a.status === 'pending');
    const confirmed = businessApps.filter((a) => a.status === 'confirmed');
    const cancelled = businessApps.filter((a) => a.status === 'cancelled');
    const completed = businessApps.filter((a) => a.status === 'completed');

    const estimatedRevenue = businessApps
      .filter((a) => a.status === 'completed' || a.status === 'confirmed')
      .reduce((sum, a) => sum + (a.price_amount_snapshot || 0), 0);

    const serviceCounts: Record<string, number> = {};
    for (const a of businessApps) {
      serviceCounts[a.service_name_snapshot] = (serviceCounts[a.service_name_snapshot] || 0) + 1;
    }
    const popularServices = Object.entries(serviceCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      todayAppointmentsCount: todayApps.length,
      upcomingCount: upcoming.length,
      pendingCount: pending.length,
      confirmedCount: confirmed.length,
      cancelledCount: cancelled.length,
      completedCount: completed.length,
      estimatedRevenue,
      popularServices,
    };
  }
}

// Instancia global en memoria
export const mockDb = new MockDatabase();
