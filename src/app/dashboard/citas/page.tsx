'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  MoreVertical,
  Phone,
  Mail,
  Edit,
  X,
  User,
} from 'lucide-react';
import { Appointment, AppointmentStatus } from '@/types';
import { formatDateLegible, formatTimeLegible } from '@/lib/utils/dates';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  // Modal Detalle / Edición de Estado
  const [selectedApp, setSelectedApp] = useState<Appointment | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [internalNotes, setInternalNotes] = useState('');

  // Modal de Reprogramación
  const [reschedulingApp, setReschedulingApp] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [reschedulingLoading, setReschedulingLoading] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('search', searchQuery);
      if (selectedDate) params.set('date', selectedDate);

      const res = await fetch(`/api/admin/appointments?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error('Error cargando citas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [statusFilter, selectedDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAppointments();
  };

  // Cambiar estado de una cita
  const handleStatusChange = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch('/api/admin/appointments/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId,
          status: newStatus,
          notes: internalNotes || undefined,
        }),
      });

      if (res.ok) {
        await loadAppointments();
        setSelectedApp(null);
      } else {
        alert('No se pudo actualizar el estado de la cita.');
      }
    } catch (err) {
      console.error('Error actualizando estado:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Reprogramar cita
  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingApp || !newDate || !newTime) return;

    setReschedulingLoading(true);
    setRescheduleError(null);

    try {
      // Crear fecha ISO combinada
      const newStartAt = new Date(`${newDate}T${newTime}:00`);

      const res = await fetch('/api/admin/appointments/reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentId: reschedulingApp.id,
          newStartAtIso: newStartAt.toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setRescheduleError(data.error || 'No se pudo reprogramar la cita en ese horario.');
        return;
      }

      await loadAppointments();
      setReschedulingApp(null);
    } catch (err) {
      console.error('Error al reprogramar:', err);
      setRescheduleError('Error de conexión al reprogramar.');
    } finally {
      setReschedulingLoading(false);
    }
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Confirmada</span>;
      case 'pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Pendiente</span>;
      case 'completed':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Completada</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Cancelada</span>;
      case 'no_show':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-300">No asistió</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Gestión de Citas</h1>
          <p className="text-xs text-slate-500 mt-1">
            Consulta, filtra, actualiza estados y reprograma turnos.
          </p>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full md:w-auto flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, teléfono o servicio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-600 transition"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
          >
            Buscar
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Filtro de Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-600 bg-white font-medium text-slate-700"
          >
            <option value="all">Todos los estados</option>
            <option value="confirmed">Confirmadas</option>
            <option value="pending">Pendientes</option>
            <option value="completed">Completadas</option>
            <option value="cancelled">Canceladas</option>
            <option value="no_show">No asistió</option>
          </select>

          {/* Filtro de Fecha */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-600 bg-white font-medium text-slate-700"
          />

          {selectedDate && (
            <button
              onClick={() => setSelectedDate('')}
              className="p-2 text-xs text-slate-400 hover:text-slate-600"
              title="Limpiar fecha"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabla de Citas */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Cargando citas...</span>
          </div>
        ) : appointments.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-bold text-slate-700 mb-1">No se encontraron citas</h3>
            <p className="text-xs text-slate-500">Prueba ajustando los filtros o realizando otra búsqueda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Servicio</th>
                  <th className="py-3 px-4">Fecha y Hora</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {appointments.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{app.customer_name_snapshot}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                        {app.customer_phone_snapshot && (
                          <span className="flex items-center gap-0.5">
                            <Phone className="w-3 h-3" />
                            {app.customer_phone_snapshot}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800">{app.service_name_snapshot}</span>
                      <span className="text-slate-400 text-[11px] block">{app.duration_minutes_snapshot} min</span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-blue-600">{formatTimeLegible(app.start_at)}</div>
                      <div className="text-[11px] text-slate-500">{formatDateLegible(app.start_at).split(',')[0]}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {getStatusBadge(app.status)}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedApp(app);
                            setInternalNotes(app.internal_notes || '');
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition"
                        >
                          Detalles
                        </button>
                        <button
                          onClick={() => {
                            setReschedulingApp(app);
                            setNewDate(app.start_at.split('T')[0]);
                            setNewTime(app.start_at.split('T')[1].slice(0, 5));
                            setRescheduleError(null);
                          }}
                          className="px-2.5 py-1.5 rounded-lg border border-blue-200 text-blue-700 font-bold hover:bg-blue-50 transition"
                        >
                          Reprogramar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Detalles y Cambio de Estado */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedApp(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Detalle de la Cita</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">ID: {selectedApp.id}</p>

            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Cliente:</span>
                <span className="font-bold text-slate-800">{selectedApp.customer_name_snapshot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Teléfono:</span>
                <span className="font-bold text-slate-800">{selectedApp.customer_phone_snapshot || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Servicio:</span>
                <span className="font-bold text-slate-800">{selectedApp.service_name_snapshot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Horario:</span>
                <span className="font-bold text-blue-600">
                  {formatDateLegible(selectedApp.start_at)} a las {formatTimeLegible(selectedApp.start_at)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Estado actual:</span>
                {getStatusBadge(selectedApp.status)}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">Notas internas:</label>
              <textarea
                rows={2}
                value={internalNotes}
                onChange={(e) => setInternalNotes(e.target.value)}
                placeholder="Observaciones internas del equipo..."
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-600"
              />
            </div>

            <div className="space-y-2">
              <span className="block text-[11px] font-bold text-slate-500 uppercase">Cambiar estado a:</span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(selectedApp.id, 'confirmed')}
                  className="py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition"
                >
                  Confirmar
                </button>
                <button
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(selectedApp.id, 'completed')}
                  className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs transition"
                >
                  Completada
                </button>
                <button
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(selectedApp.id, 'cancelled')}
                  className="py-2 px-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 font-bold text-xs transition"
                >
                  Cancelar
                </button>
                <button
                  disabled={updatingStatus}
                  onClick={() => handleStatusChange(selectedApp.id, 'no_show')}
                  className="py-2 px-3 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition"
                >
                  No Asistió
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reprogramación */}
      {reschedulingApp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setReschedulingApp(null)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">Reprogramar Cita</h3>
            <p className="text-xs text-slate-500 mb-4">
              Cliente: <strong>{reschedulingApp.customer_name_snapshot}</strong> ({reschedulingApp.service_name_snapshot})
            </p>

            {rescheduleError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{rescheduleError}</span>
              </div>
            )}

            <form onSubmit={handleRescheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nueva Fecha:</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nueva Hora:</label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setReschedulingApp(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={reschedulingLoading}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {reschedulingLoading ? 'Verificando y guardando...' : 'Guardar Nuevo Horario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
