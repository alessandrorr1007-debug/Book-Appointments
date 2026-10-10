-- ==============================================================================
-- CITAFÁCIL — MIGRACIÓN INICIAL COMPLETA (PostgreSQL + Supabase)
-- Arquitectura SaaS multiempresa, RLS estricto, Concurrencia segura y RPCs
-- ==============================================================================

-- 1. Extensiones requeridas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- 2. Enumerados y Dominios
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'membership_role') THEN
        CREATE TYPE membership_role AS ENUM ('owner', 'admin', 'receptionist');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
        CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled', 'no_show');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
        CREATE TYPE notification_channel AS ENUM ('email', 'sms', 'whatsapp');
    END IF;
END $$;

-- 3. Tabla: profiles (Vinculada a auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Tabla: businesses (Negocios / Espacios de trabajo aislados)
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    business_type TEXT NOT NULL DEFAULT 'other',
    description TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    timezone TEXT NOT NULL DEFAULT 'America/Lima',
    logo_url TEXT,
    booking_enabled BOOLEAN NOT NULL DEFAULT true,
    min_booking_notice_hours INT NOT NULL DEFAULT 2 CHECK (min_booking_notice_hours >= 0),
    max_booking_advance_days INT NOT NULL DEFAULT 30 CHECK (max_booking_advance_days >= 1),
    cancellation_notice_hours INT NOT NULL DEFAULT 4 CHECK (cancellation_notice_hours >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_slug CHECK (slug ~* '^[a-z0-9]+(?:-[a-z0-9]+)*$')
);

CREATE INDEX IF NOT EXISTS idx_businesses_slug ON public.businesses(slug);

-- 5. Tabla: business_members (Membresías y roles multiempresa)
CREATE TABLE IF NOT EXISTS public.business_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role membership_role NOT NULL DEFAULT 'owner',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(business_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_business_members_user ON public.business_members(user_id);
CREATE INDEX IF NOT EXISTS idx_business_members_business ON public.business_members(business_id);

-- 6. Tabla: services (Catálogo de servicios ofrecidos)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0 AND duration_minutes <= 1440),
    buffer_before_minutes INT NOT NULL DEFAULT 0 CHECK (buffer_before_minutes >= 0 AND buffer_before_minutes <= 180),
    buffer_after_minutes INT NOT NULL DEFAULT 0 CHECK (buffer_after_minutes >= 0 AND buffer_after_minutes <= 180),
    price_amount NUMERIC(10, 2) CHECK (price_amount IS NULL OR price_amount >= 0),
    currency TEXT NOT NULL DEFAULT 'PEN',
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_services_business ON public.services(business_id);

-- 7. Tabla: staff_members (Profesionales / Operadores asignables)
CREATE TABLE IF NOT EXISTS public.staff_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_staff_business ON public.staff_members(business_id);

-- 8. Tabla: staff_services (Relación qué staff ofrece qué servicio)
CREATE TABLE IF NOT EXISTS public.staff_services (
    staff_member_id UUID NOT NULL REFERENCES public.staff_members(id) ON DELETE CASCADE,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    PRIMARY KEY (staff_member_id, service_id)
);

-- 9. Tabla: business_hours (Horarios de atención regulares por día)
CREATE TABLE IF NOT EXISTS public.business_hours (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    staff_member_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_time_range CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_business_hours_lookup ON public.business_hours(business_id, day_of_week);

-- 10. Tabla: schedule_exceptions (Feriados, descansos, cierres o extensiones)
CREATE TABLE IF NOT EXISTS public.schedule_exceptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    staff_member_id UUID REFERENCES public.staff_members(id) ON DELETE CASCADE,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT false,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_exception_range CHECK (start_at < end_at)
);

CREATE INDEX IF NOT EXISTS idx_exceptions_business ON public.schedule_exceptions(business_id, start_at, end_at);

-- 11. Tabla: customers (Directorio de clientes por empresa)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_customers_business ON public.customers(business_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(business_id, phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(business_id, email);

-- 12. Tabla: appointments (Citas y reservas con snapshots inmutables)
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
    service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
    staff_member_id UUID REFERENCES public.staff_members(id) ON DELETE RESTRICT,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    status appointment_status NOT NULL DEFAULT 'confirmed',
    -- Snapshots históricos inmutables
    customer_name_snapshot TEXT NOT NULL,
    customer_email_snapshot TEXT,
    customer_phone_snapshot TEXT,
    service_name_snapshot TEXT NOT NULL,
    duration_minutes_snapshot INT NOT NULL,
    price_amount_snapshot NUMERIC(10, 2),
    currency_snapshot TEXT NOT NULL DEFAULT 'PEN',
    -- Token no predecible para que el cliente cancele o consulte su cita sin exponer IDs secuenciales
    cancellation_token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
    cancellation_reason TEXT,
    internal_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT valid_appointment_time CHECK (start_at < end_at)
);

CREATE INDEX IF NOT EXISTS idx_appointments_business_dates ON public.appointments(business_id, start_at, end_at);
CREATE INDEX IF NOT EXISTS idx_appointments_staff ON public.appointments(staff_member_id, start_at);
CREATE INDEX IF NOT EXISTS idx_appointments_customer ON public.appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_token ON public.appointments(cancellation_token);

-- Restricción de exclusión GiST: Previene citas solapadas por profesional activo
-- cuando el estado es 'pending' o 'confirmed'
ALTER TABLE public.appointments ADD CONSTRAINT no_overlapping_staff_appointments
EXCLUDE USING gist (
    staff_member_id WITH =,
    tstzrange(start_at, end_at) WITH &&
)
WHERE (status IN ('pending', 'confirmed') AND staff_member_id IS NOT NULL);

-- 13. Tabla: notification_logs (Registro de notificaciones enviadas/pendientes)
CREATE TABLE IF NOT EXISTS public.notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
    channel notification_channel NOT NULL DEFAULT 'email',
    notification_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    provider_reference TEXT,
    error_message TEXT,
    sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_notifications_business ON public.notification_logs(business_id);

-- ==============================================================================
-- FUNCIONES AUXILIARES Y TRIGGERS DE AUDITORÍA
-- ==============================================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_businesses_updated_at ON public.businesses;
CREATE TRIGGER set_businesses_updated_at BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_services_updated_at ON public.services;
CREATE TRIGGER set_services_updated_at BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_staff_updated_at ON public.staff_members;
CREATE TRIGGER set_staff_updated_at BEFORE UPDATE ON public.staff_members
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_appointments_updated_at ON public.appointments;
CREATE TRIGGER set_appointments_updated_at BEFORE UPDATE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Trigger para crear profile al registrarse en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'Usuario'),
        NEW.email,
        NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO UPDATE
    SET full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEGURIDAD: ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_exceptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Helper: Determina si el usuario actual es miembro del negocio
CREATE OR REPLACE FUNCTION public.is_business_member(b_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.business_members
        WHERE business_id = b_id AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper: Obtiene el rol del usuario en el negocio
CREATE OR REPLACE FUNCTION public.get_business_member_role(b_id UUID)
RETURNS membership_role AS $$
    SELECT role FROM public.business_members
    WHERE business_id = b_id AND user_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 1. Políticas PROFILES
CREATE POLICY "Users can read own profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles FOR UPDATE
USING (auth.uid() = id);

-- 2. Políticas BUSINESSES
-- Público puede leer negocios activos si tienen booking_enabled
CREATE POLICY "Public businesses readable if booking enabled"
ON public.businesses FOR SELECT
USING (booking_enabled = true OR is_business_member(id));

-- Autenticados pueden crear negocios
CREATE POLICY "Authenticated users can create businesses"
ON public.businesses FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

-- Solo owner o admin puede actualizar el negocio
CREATE POLICY "Owners and admins can update business"
ON public.businesses FOR UPDATE
USING (get_business_member_role(id) IN ('owner', 'admin'));

-- Solo owner puede eliminar el negocio
CREATE POLICY "Owners can delete business"
ON public.businesses FOR DELETE
USING (get_business_member_role(id) = 'owner');

-- 3. Políticas BUSINESS_MEMBERS
CREATE POLICY "Members can view members of their business"
ON public.business_members FOR SELECT
USING (is_business_member(business_id));

CREATE POLICY "Owners and admins can manage members"
ON public.business_members FOR ALL
USING (get_business_member_role(business_id) IN ('owner', 'admin'));

-- Permitir al creador asignarse a sí mismo como owner
CREATE POLICY "User can add self as owner when creating business"
ON public.business_members FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 4. Políticas SERVICES
CREATE POLICY "Public can view active services"
ON public.services FOR SELECT
USING (
    active = true 
    OR is_business_member(business_id)
);

CREATE POLICY "Owners and admins can manage services"
ON public.services FOR ALL
USING (get_business_member_role(business_id) IN ('owner', 'admin'));

-- 5. Políticas STAFF_MEMBERS & STAFF_SERVICES
CREATE POLICY "Public can view active staff"
ON public.staff_members FOR SELECT
USING (
    active = true 
    OR is_business_member(business_id)
);

CREATE POLICY "Owners and admins can manage staff"
ON public.staff_members FOR ALL
USING (get_business_member_role(business_id) IN ('owner', 'admin'));

CREATE POLICY "Public can view staff services"
ON public.staff_services FOR SELECT
USING (true);

CREATE POLICY "Owners and admins can manage staff services"
ON public.staff_services FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.staff_members sm
        WHERE sm.id = staff_services.staff_member_id
        AND get_business_member_role(sm.business_id) IN ('owner', 'admin')
    )
);

-- 6. Políticas BUSINESS_HOURS & SCHEDULE_EXCEPTIONS
CREATE POLICY "Public can view business hours"
ON public.business_hours FOR SELECT
USING (true);

CREATE POLICY "Owners and admins can manage business hours"
ON public.business_hours FOR ALL
USING (get_business_member_role(business_id) IN ('owner', 'admin'));

CREATE POLICY "Public can view schedule exceptions"
ON public.schedule_exceptions FOR SELECT
USING (true);

CREATE POLICY "Owners and admins can manage schedule exceptions"
ON public.schedule_exceptions FOR ALL
USING (get_business_member_role(business_id) IN ('owner', 'admin'));

-- 7. Políticas CUSTOMERS (Completamente privadas para el negocio)
CREATE POLICY "Business members can manage customers"
ON public.customers FOR ALL
USING (is_business_member(business_id));

-- 8. Políticas APPOINTMENTS
CREATE POLICY "Business members can view business appointments"
ON public.appointments FOR SELECT
USING (is_business_member(business_id));

CREATE POLICY "Business members can manage appointments"
ON public.appointments FOR ALL
USING (is_business_member(business_id));

-- 9. Políticas NOTIFICATION_LOGS
CREATE POLICY "Business members can view logs"
ON public.notification_logs FOR SELECT
USING (is_business_member(business_id));

-- ==============================================================================
-- PROCEDIMIENTOS ALMACENADOS (RPC) ATÓMICOS PARA CONCURRENCIA
-- ==============================================================================

-- RPC: create_appointment_atomic
-- Valida disponibilidad en tiempo real con bloqueo y garantiza cero dobles reservas
CREATE OR REPLACE FUNCTION public.create_appointment_atomic(
    p_business_slug TEXT,
    p_service_id UUID,
    p_staff_member_id UUID,
    p_start_at TIMESTAMPTZ,
    p_customer_name TEXT,
    p_customer_email TEXT DEFAULT NULL,
    p_customer_phone TEXT DEFAULT NULL,
    p_internal_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_business public.businesses%ROWTYPE;
    v_service public.services%ROWTYPE;
    v_staff public.staff_members%ROWTYPE;
    v_customer_id UUID;
    v_end_at TIMESTAMPTZ;
    v_appointment_id UUID;
    v_cancellation_token TEXT;
    v_conflict_count INT;
BEGIN
    -- 1. Validar que el negocio exista y acepte reservas
    SELECT * INTO v_business
    FROM public.businesses
    WHERE slug = p_business_slug AND booking_enabled = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'El negocio no existe o tiene las reservas deshabilitadas');
    END IF;

    -- 2. Validar servicio
    SELECT * INTO v_service
    FROM public.services
    WHERE id = p_service_id AND business_id = v_business.id AND active = true;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'El servicio seleccionado no está disponible');
    END IF;

    -- 3. Calcular hora de fin
    v_end_at := p_start_at + (v_service.duration_minutes || ' minutes')::INTERVAL;

    -- 4. Validar antelación mínima
    IF p_start_at < (timezone('utc'::text, now()) + (v_business.min_booking_notice_hours || ' hours')::INTERVAL) THEN
        RETURN jsonb_build_object('success', false, 'error', 'La cita no cumple con la antelación mínima requerida');
    END IF;

    -- 5. Validar fecha máxima de antelación
    IF p_start_at > (timezone('utc'::text, now()) + (v_business.max_booking_advance_days || ' days')::INTERVAL) THEN
        RETURN jsonb_build_object('success', false, 'error', 'La cita excede el límite de días permitido por adelantado');
    END IF;

    -- 6. Si se especificó un staff, verificar y aplicar bloqueo de concurrencia
    IF p_staff_member_id IS NOT NULL THEN
        SELECT * INTO v_staff
        FROM public.staff_members
        WHERE id = p_staff_member_id AND business_id = v_business.id AND active = true;

        IF NOT FOUND THEN
            RETURN jsonb_build_object('success', false, 'error', 'El profesional asignado no está disponible');
        END IF;

        -- Comprobar si existe solapamiento activo
        SELECT COUNT(*) INTO v_conflict_count
        FROM public.appointments
        WHERE business_id = v_business.id
          AND staff_member_id = p_staff_member_id
          AND status IN ('pending', 'confirmed')
          AND tstzrange(start_at, end_at) && tstzrange(p_start_at, v_end_at);

        IF v_conflict_count > 0 THEN
            RETURN jsonb_build_object('success', false, 'error', 'El horario seleccionado ya ha sido reservado. Por favor elige otro horario.');
        END IF;
    ELSE
        -- Si no hay staff específico, verificar si hay citas generales que colisionen
        -- o asignar el primer staff disponible para este servicio
        SELECT sm.id INTO p_staff_member_id
        FROM public.staff_members sm
        JOIN public.staff_services ss ON ss.staff_member_id = sm.id
        WHERE sm.business_id = v_business.id
          AND sm.active = true
          AND ss.service_id = v_service.id
          AND NOT EXISTS (
              SELECT 1 FROM public.appointments a
              WHERE a.staff_member_id = sm.id
                AND a.status IN ('pending', 'confirmed')
                AND tstzrange(a.start_at, a.end_at) && tstzrange(p_start_at, v_end_at)
          )
        LIMIT 1;
    END IF;

    -- 7. Registrar o reutilizar cliente por teléfono o email en este negocio
    SELECT id INTO v_customer_id
    FROM public.customers
    WHERE business_id = v_business.id
      AND (
          (p_customer_phone IS NOT NULL AND phone = p_customer_phone)
          OR (p_customer_email IS NOT NULL AND email = p_customer_email)
      )
    LIMIT 1;

    IF v_customer_id IS NULL THEN
        INSERT INTO public.customers (business_id, full_name, email, phone)
        VALUES (v_business.id, p_customer_name, p_customer_email, p_customer_phone)
        RETURNING id INTO v_customer_id;
    ELSE
        -- Actualizar nombre si cambió
        UPDATE public.customers
        SET full_name = p_customer_name,
            email = COALESCE(p_customer_email, email),
            phone = COALESCE(p_customer_phone, phone)
        WHERE id = v_customer_id;
    END IF;

    -- 8. Insertar cita con snapshots inmutables
    v_cancellation_token := encode(gen_random_bytes(24), 'hex');

    INSERT INTO public.appointments (
        business_id,
        customer_id,
        service_id,
        staff_member_id,
        start_at,
        end_at,
        status,
        customer_name_snapshot,
        customer_email_snapshot,
        customer_phone_snapshot,
        service_name_snapshot,
        duration_minutes_snapshot,
        price_amount_snapshot,
        currency_snapshot,
        cancellation_token,
        internal_notes
    ) VALUES (
        v_business.id,
        v_customer_id,
        v_service.id,
        p_staff_member_id,
        p_start_at,
        v_end_at,
        'confirmed',
        p_customer_name,
        p_customer_email,
        p_customer_phone,
        v_service.name,
        v_service.duration_minutes,
        v_service.price_amount,
        v_service.currency,
        v_cancellation_token,
        p_internal_notes
    ) RETURNING id INTO v_appointment_id;

    -- 9. Registrar log de notificación
    INSERT INTO public.notification_logs (
        business_id,
        appointment_id,
        channel,
        notification_type,
        status
    ) VALUES (
        v_business.id,
        v_appointment_id,
        'email',
        'booking_created',
        'pending'
    );

    RETURN jsonb_build_object(
        'success', true,
        'appointment_id', v_appointment_id,
        'cancellation_token', v_cancellation_token,
        'start_at', p_start_at,
        'end_at', v_end_at,
        'service_name', v_service.name,
        'business_name', v_business.name,
        'business_address', v_business.address
    );

EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'El horario seleccionado ya no está disponible por conflicto de concurrencia.');
WHEN exclusion_violation THEN
    RETURN jsonb_build_object('success', false, 'error', 'El profesional seleccionado ya tiene una cita confirmada en ese intervalo.');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: cancel_appointment_by_token
CREATE OR REPLACE FUNCTION public.cancel_appointment_by_token(
    p_cancellation_token TEXT,
    p_reason TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_appointment public.appointments%ROWTYPE;
    v_business public.businesses%ROWTYPE;
BEGIN
    SELECT * INTO v_appointment
    FROM public.appointments
    WHERE cancellation_token = p_cancellation_token;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cita no encontrada o enlace de cancelación inválido');
    END IF;

    IF v_appointment.status = 'cancelled' THEN
        RETURN jsonb_build_object('success', false, 'error', 'Esta cita ya ha sido cancelada previamente');
    END IF;

    SELECT * INTO v_business
    FROM public.businesses
    WHERE id = v_appointment.business_id;

    -- Validar política de cancelación con antelación
    IF timezone('utc'::text, now()) > (v_appointment.start_at - (v_business.cancellation_notice_hours || ' hours')::INTERVAL) THEN
        RETURN jsonb_build_object('success', false, 'error', 'No es posible cancelar con menos de ' || v_business.cancellation_notice_hours || ' horas de antelación según la política del negocio.');
    END IF;

    UPDATE public.appointments
    SET status = 'cancelled',
        cancellation_reason = p_reason,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_appointment.id;

    -- Registrar log de notificación
    INSERT INTO public.notification_logs (
        business_id,
        appointment_id,
        channel,
        notification_type,
        status
    ) VALUES (
        v_appointment.business_id,
        v_appointment.id,
        'email',
        'booking_cancelled',
        'pending'
    );

    RETURN jsonb_build_object('success', true, 'message', 'Cita cancelada exitosamente');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
