'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowLeft,
} from 'lucide-react';
import { Appointment } from '@/types';
import { formatDateLegible, formatTimeLegible } from '@/lib/utils/dates';

export default function CancelBookingPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const token = params?.token as string;

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelledSuccess, setCancelledSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadAppointment() {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(`/api/appointment-by-token?token=${token}`);
        if (res.ok) {
          const data = await res.json();
          setAppointment(data.appointment);
        } else {
          setErrorMessage('No se encontró la cita o el enlace de cancelación ha expirado.');
        }
      } catch (err) {
        console.error('Error cargando cita:', err);
        setErrorMessage('Error al consultar los datos de la cita.');
      } finally {
        setLoading(false);
      }
    }

    loadAppointment();
  }, [token]);

  const handleCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setCancelling(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cancellationToken: token,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'No se pudo cancelar la cita.');
        return;
      }

      setCancelledSuccess(true);
    } catch (err) {
      console.error('Error al cancelar:', err);
      setErrorMessage('Error de conexión al procesar la cancelación.');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 text-sm">Consultando cita...</p>
        </div>
      </div>
    );
  }

  if (errorMessage && !appointment) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 mb-2">Enlace inválido</h2>
          <p className="text-slate-600 text-xs mb-6">{errorMessage}</p>
          <a
            href={`/reservar/${slug}`}
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition"
          >
            Ir a la página de reservas
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-12 px-4 flex items-center justify-center">
      <div className="max-w-lg w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
        <div className="mb-6 text-center">
          <a
            href={`/reservar/${slug}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a {appointment?.business?.name || 'reservas'}</span>
          </a>

          <h1 className="text-2xl font-bold text-slate-900">Gestión de Cita</h1>
          <p className="text-slate-500 text-xs mt-1">
            {appointment?.business?.name}
          </p>
        </div>

        {cancelledSuccess || appointment?.status === 'cancelled' ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Cita Cancelada</h3>
            <p className="text-xs text-slate-600 mb-6">
              Esta reserva ha sido cancelada exitosamente y el horario fue liberado.
            </p>
            <a
              href={`/reservar/${slug}`}
              className="inline-flex items-center justify-center px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
            >
              Agendar una nueva cita
            </a>
          </div>
        ) : (
          <div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-6 space-y-2.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Cliente:</span>
                <span className="font-bold text-slate-800">{appointment?.customer_name_snapshot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Servicio:</span>
                <span className="font-bold text-slate-800">{appointment?.service_name_snapshot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Fecha:</span>
                <span className="font-semibold text-slate-800">
                  {appointment ? formatDateLegible(appointment.start_at) : ''}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Hora:</span>
                <span className="font-bold text-blue-600">
                  {appointment ? formatTimeLegible(appointment.start_at) : ''}
                </span>
              </div>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo de cancelación <span className="text-slate-400 font-normal">(Opcional)</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Por favor indícanos el motivo de tu cancelación..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs outline-none focus:border-red-500 transition resize-none"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-800">
                <strong>Atención:</strong> Al cancelar se liberará el horario de forma inmediata para otros clientes.
              </div>

              <button
                type="submit"
                disabled={cancelling}
                className="w-full py-3 bg-red-600 text-white rounded-xl text-xs font-bold hover:bg-red-700 transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {cancelling ? (
                  <span>Cancelando cita...</span>
                ) : (
                  <span>Confirmar Cancelación de Cita</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
