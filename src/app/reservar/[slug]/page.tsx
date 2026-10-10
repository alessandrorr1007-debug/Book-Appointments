'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Phone,
  Scissors,
  AlertCircle,
  Sparkles,
  CalendarPlus,
} from 'lucide-react';
import { Business, Service, StaffMember, TimeSlot } from '@/types';
import {
  formatDateLegible,
  formatTimeLegible,
  formatDateToYYYYMMDD,
  DAYS_OF_WEEK_SPANISH,
} from '@/lib/utils/dates';

export default function PublicBookingPage() {
  const params = useParams();
  const slug = params?.slug as string;

  // Estados principales
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [errorInitial, setErrorInitial] = useState<string | null>(null);

  // Estados del flujo (Pasos 1 a 5)
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  // Slots del día seleccionado
  const [daySlots, setDaySlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Formulario cliente
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [internalNotes, setInternalNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Envío y Confirmación
  const [submitting, setSubmitting] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 1. Cargar datos del negocio
  useEffect(() => {
    async function loadBusinessData() {
      if (!slug) return;
      try {
        setLoadingInitial(true);
        setErrorInitial(null);

        // Obtenemos los datos desde el servidor
        const res = await fetch(`/api/availability?slug=${slug}&serviceId=probe&date=2099-01-01`);
        // Si el negocio no existe recibimos 404
        if (res.status === 404) {
          setErrorInitial('El negocio no existe o no tiene las reservas públicas habilitadas.');
          return;
        }

        // Consultamos directamente el perfil y catálogo
        const [servicesRes, staffRes] = await Promise.all([
          fetch(`/api/services?slug=${slug}`),
          fetch(`/api/staff?slug=${slug}`),
        ]);

        if (servicesRes.ok && staffRes.ok) {
          const sData = await servicesRes.json();
          const stData = await staffRes.json();
          setBusiness(sData.business);
          setServices(sData.services);
          setStaffList(stData.staff);
        } else {
          // Fallback seguro de lectura
          const resp = await fetch(`/api/business-public/${slug}`);
          if (resp.ok) {
            const data = await resp.json();
            setBusiness(data.business);
            setServices(data.services);
            setStaffList(data.staff);
          } else {
            setErrorInitial('No se pudo cargar la información del negocio.');
          }
        }
      } catch (err) {
        console.error('Error cargando negocio:', err);
        setErrorInitial('Ocurrió un error al cargar la página de reservas.');
      } finally {
        setLoadingInitial(false);
      }
    }

    loadBusinessData();
  }, [slug]);

  // Días disponibles para seleccionar
  const [availableDays, setAvailableDays] = useState<{ dateStr: string; labelDay: string; dayNum: number; monthName: string }[]>([]);

  useEffect(() => {
    const days: { dateStr: string; labelDay: string; dayNum: number; monthName: string }[] = [];
    const now = new Date();
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(now.getDate() + i);
      const dateStr = formatDateToYYYYMMDD(d);
      const dayOfWeek = d.getDay();
      days.push({
        dateStr,
        labelDay: DAYS_OF_WEEK_SPANISH[dayOfWeek].slice(0, 3),
        dayNum: d.getDate(),
        monthName: months[d.getMonth()],
      });
    }
    setAvailableDays(days);
    if (days.length > 0) {
      setSelectedDate(days[0].dateStr);
    }
  }, []);

  // 2. Cargar slots cuando cambie fecha, servicio o staff
  useEffect(() => {
    async function fetchSlots() {
      if (!slug || !selectedService || !selectedDate) return;
      setLoadingSlots(true);
      setSelectedSlot(null);
      try {
        const staffParam = selectedStaffId ? `&staffId=${selectedStaffId}` : '';
        const res = await fetch(
          `/api/availability?slug=${slug}&serviceId=${selectedService.id}&date=${selectedDate}${staffParam}`
        );
        if (res.ok) {
          const data = await res.json();
          setDaySlots(data.slots || []);
        } else {
          setDaySlots([]);
        }
      } catch (e) {
        console.error('Error al consultar horarios:', e);
        setDaySlots([]);
      } finally {
        setLoadingSlots(false);
      }
    }

    if (currentStep === 3) {
      fetchSlots();
    }
  }, [slug, selectedService, selectedDate, selectedStaffId, currentStep]);

  // Validación del formulario de cliente
  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!customerName.trim() || customerName.trim().length < 2) {
      errors.name = 'Por favor ingresa tu nombre completo';
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 6) {
      errors.phone = 'Por favor ingresa un número de teléfono o WhatsApp válido';
    }
    if (customerEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      errors.email = 'El formato del correo es inválido';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enviar reserva
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedService || !selectedSlot) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessSlug: slug,
          serviceId: selectedService.id,
          staffMemberId: selectedStaffId || selectedSlot.staffMemberId || null,
          startAtIso: selectedSlot.startAtIso,
          customerName: customerName.trim(),
          customerEmail: customerEmail.trim() || null,
          customerPhone: customerPhone.trim(),
          internalNotes: internalNotes.trim() || null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setSubmitError(data.error || 'No fue posible completar la reserva.');
        return;
      }

      setBookingConfirmation(data);
      setCurrentStep(5); // Paso de confirmación
    } catch (err) {
      console.error('Error al enviar reserva:', err);
      setSubmitError('Ocurrió un error de conexión. Inténtalo de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm font-medium">Cargando página de reservas...</p>
        </div>
      </div>
    );
  }

  if (errorInitial || !business) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No se encontró el negocio</h2>
          <p className="text-slate-600 text-sm mb-6">{errorInitial}</p>
          <a
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            Ir al inicio de CitaFácil
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-16">
      {/* Encabezado del Negocio */}
      <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              {business.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                {business.name}
              </h1>
              <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                {business.address && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {business.address}
                  </span>
                )}
                {business.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {business.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Reservas abiertas
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6">
        {/* Barra de Pasos */}
        {currentStep < 5 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Paso {currentStep} de 4
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {currentStep === 1 && 'Selecciona un servicio'}
                {currentStep === 2 && 'Elige un profesional'}
                {currentStep === 3 && 'Selecciona fecha y hora'}
                {currentStep === 4 && 'Completa tus datos'}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(currentStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 1: SELECCIONAR SERVICIO
        ========================================================================= */}
        {currentStep === 1 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">¿Qué servicio deseas agendar?</h2>
              <p className="text-slate-600 text-sm mt-1">
                Elige uno de los servicios disponibles a continuación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.filter((s) => s.active).map((service) => {
                const isSelected = selectedService?.id === service.id;
                return (
                  <div
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all bg-white relative flex flex-col justify-between ${
                      isSelected
                        ? 'border-blue-600 shadow-md ring-2 ring-blue-600/10'
                        : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="font-bold text-slate-900 text-base leading-snug">
                          {service.name}
                        </h3>
                        {service.price_amount ? (
                          <span className="font-extrabold text-blue-600 text-base whitespace-nowrap">
                            S/ {service.price_amount.toFixed(2)}
                          </span>
                        ) : (
                          <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                            Consultar
                          </span>
                        )}
                      </div>
                      {service.description && (
                        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
                          {service.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{service.duration_minutes} minutos</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                disabled={!selectedService}
                onClick={() => setCurrentStep(staffList.length > 0 ? 2 : 3)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition ${
                  selectedService
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Continuar</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 2: SELECCIONAR PROFESIONAL (STAFF)
        ========================================================================= */}
        {currentStep === 2 && (
          <div>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">¿Con quién deseas atenderte?</h2>
                <p className="text-slate-600 text-sm mt-1">
                  Puedes elegir un especialista o dejarlo automático para mayor disponibilidad.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Opción Cualquier profesional */}
              <div
                onClick={() => setSelectedStaffId(null)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all bg-white flex items-center justify-between ${
                  selectedStaffId === null
                    ? 'border-blue-600 shadow-md ring-2 ring-blue-600/10'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Cualquier profesional</h3>
                    <p className="text-xs text-slate-500">Mayor disponibilidad de horarios</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    selectedStaffId === null ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                  }`}
                >
                  {selectedStaffId === null && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>

              {/* Lista de Profesionales */}
              {staffList.filter((s) => s.active).map((staff) => {
                const isSelected = selectedStaffId === staff.id;
                return (
                  <div
                    key={staff.id}
                    onClick={() => setSelectedStaffId(staff.id)}
                    className={`cursor-pointer rounded-2xl p-5 border-2 transition-all bg-white flex items-center justify-between ${
                      isSelected
                        ? 'border-blue-600 shadow-md ring-2 ring-blue-600/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                        <User className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-base">{staff.display_name}</h3>
                        <p className="text-xs text-slate-500">Especialista calificado</p>
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
              >
                <span>Continuar a Horarios</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 3: SELECCIONAR FECHA Y HORA DISPONIBLE
        ========================================================================= */}
        {currentStep === 3 && (
          <div>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Selecciona fecha y hora</h2>
              <p className="text-slate-600 text-sm mt-1">
                Servicio: <strong>{selectedService?.name}</strong> ({selectedService?.duration_minutes} min)
              </p>
            </div>

            {/* Selector Horizontal de Fechas */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  Próximos días disponibles
                </span>
                <span className="text-xs text-slate-500">Zona horaria: {business.timezone}</span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {availableDays.map((d) => {
                  const isDaySelected = selectedDate === d.dateStr;
                  return (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => setSelectedDate(d.dateStr)}
                      className={`flex flex-col items-center justify-center min-w-[70px] py-3 px-2 rounded-xl border-2 transition ${
                        isDaySelected
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold shadow-sm'
                          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-100 text-slate-600'
                      }`}
                    >
                      <span className="text-[11px] uppercase tracking-wide">{d.labelDay}</span>
                      <span className="text-lg font-extrabold my-0.5">{d.dayNum}</span>
                      <span className="text-[10px] text-slate-400">{d.monthName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Parrilla de Horas Disponibles */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Horarios para el {selectedDate ? formatDateLegible(selectedDate, business.timezone) : ''}
                </h3>
                {daySlots.length > 0 && (
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                    {daySlots.length} horarios libres
                  </span>
                )}
              </div>

              {loadingSlots ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2">
                  <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500">Consultando disponibilidad en tiempo real...</p>
                </div>
              ) : daySlots.length === 0 ? (
                <div className="py-12 text-center">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 mb-1">No hay horarios disponibles</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Para esta fecha no quedan turnos libres o el negocio permanece cerrado. Por favor selecciona otro día.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {daySlots.map((slot) => {
                    const isSelected = selectedSlot?.startAtIso === slot.startAtIso;
                    return (
                      <button
                        key={slot.startAtIso}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`py-2.5 px-3 rounded-xl text-xs font-bold border-2 transition ${
                          isSelected
                            ? 'border-blue-600 bg-blue-600 text-white shadow-sm'
                            : 'border-slate-200 text-slate-800 hover:border-blue-300 hover:bg-blue-50/50 bg-white'
                        }`}
                      >
                        {formatTimeLegible(slot.startAtIso, business.timezone)}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-between">
              <button
                onClick={() => setCurrentStep(staffList.length > 0 ? 2 : 1)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
              <button
                disabled={!selectedSlot}
                onClick={() => setCurrentStep(4)}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition ${
                  selectedSlot
                    ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <span>Continuar a Datos</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 4: DATOS DEL CLIENTE Y CONFIRMACIÓN
        ========================================================================= */}
        {currentStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Ingresa tus datos de contacto</h2>
                  <p className="text-slate-600 text-xs mt-1">
                    Te enviaremos los detalles y recordatorios de tu cita.
                  </p>
                </div>

                {submitError && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-red-900">No se pudo procesar la reserva</h4>
                      <p className="text-xs text-red-700 mt-0.5">{submitError}</p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Nombre completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Carlos Mendoza"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                        formErrors.name ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-blue-600'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">{formErrors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Teléfono o WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="Ej. 987 654 321"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                        formErrors.phone ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-blue-600'
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Correo electrónico <span className="text-slate-400 font-normal">(Opcional, para confirmación)</span>
                    </label>
                    <input
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm outline-none transition ${
                        formErrors.email ? 'border-red-400 bg-red-50/20' : 'border-slate-200 focus:border-blue-600'
                      }`}
                    />
                    {formErrors.email && (
                      <p className="text-[11px] text-red-500 mt-1 font-medium">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Notas u observaciones <span className="text-slate-400 font-normal">(Opcional)</span>
                    </label>
                    <textarea
                      rows={2}
                      placeholder="¿Alguna indicación especial o preferencia?"
                      value={internalNotes}
                      onChange={(e) => setInternalNotes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm outline-none focus:border-blue-600 transition resize-none"
                    />
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Cambiar horario</span>
                    </button>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Confirmando reserva...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirmar mi Cita</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Resumen lateral */}
            <div>
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm sticky top-24">
                <h3 className="font-bold text-slate-900 text-sm mb-4 pb-2 border-b border-slate-100">
                  Resumen de tu reserva
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block mb-0.5">Servicio:</span>
                    <span className="font-bold text-slate-800 text-sm">{selectedService?.name}</span>
                    <span className="text-slate-500 block">{selectedService?.duration_minutes} minutos</span>
                  </div>

                  <div>
                    <span className="text-slate-400 block mb-0.5">Fecha y hora:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedSlot ? formatDateLegible(selectedSlot.startAtIso, business.timezone) : ''}
                    </span>
                    <span className="font-bold text-blue-600 block text-sm mt-0.5">
                      {selectedSlot ? formatTimeLegible(selectedSlot.startAtIso, business.timezone) : ''}
                    </span>
                  </div>

                  {selectedSlot?.staffDisplayName && (
                    <div>
                      <span className="text-slate-400 block mb-0.5">Atendido por:</span>
                      <span className="font-semibold text-slate-800">{selectedSlot.staffDisplayName}</span>
                    </div>
                  )}

                  {selectedService?.price_amount && (
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-slate-600 font-medium">Total a pagar en local:</span>
                      <span className="font-extrabold text-base text-slate-900">
                        S/ {selectedService.price_amount.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 5: CONFIRMACIÓN EXITOSA
        ========================================================================= */}
        {currentStep === 5 && bookingConfirmation && (
          <div className="max-w-xl mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-1">¡Cita confirmada con éxito!</h2>
            <p className="text-slate-600 text-sm mb-6">
              Te esperamos en <strong>{business.name}</strong>.
            </p>

            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 mb-6 text-left space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Código de reserva:</span>
                <span className="font-mono font-bold text-slate-800">
                  {bookingConfirmation.appointmentId?.slice(-8).toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Servicio:</span>
                <span className="font-bold text-slate-800">{bookingConfirmation.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Fecha:</span>
                <span className="font-bold text-slate-800">
                  {formatDateLegible(bookingConfirmation.startAt, business.timezone)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Hora:</span>
                <span className="font-bold text-blue-600 text-sm">
                  {formatTimeLegible(bookingConfirmation.startAt, business.timezone)}
                </span>
              </div>
              {business.address && (
                <div className="flex justify-between pt-2 border-t border-slate-200/60">
                  <span className="text-slate-500 font-medium">Dirección:</span>
                  <span className="font-semibold text-slate-800 text-right max-w-[60%]">
                    {business.address}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <a
                href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                  `Cita en ${business.name}: ${bookingConfirmation.serviceName}`
                )}&dates=${new Date(bookingConfirmation.startAt)
                  .toISOString()
                  .replace(/-|:|\.\d\d\d/g, '')}/${new Date(bookingConfirmation.endAt)
                  .toISOString()
                  .replace(/-|:|\.\d\d\d/g, '')}&location=${encodeURIComponent(
                  business.address || ''
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Agregar a Google Calendar</span>
              </a>

              <a
                href={`/reservar/${slug}/cancelar/${bookingConfirmation.cancellationCode}`}
                className="inline-flex items-center justify-center px-5 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-100 transition"
              >
                Gestionar o cancelar cita
              </a>
            </div>

            <button
              onClick={() => {
                setCurrentStep(1);
                setSelectedService(null);
                setSelectedSlot(null);
                setBookingConfirmation(null);
              }}
              className="text-xs text-blue-600 hover:underline font-semibold"
            >
              Hacer otra reserva en {business.name}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
