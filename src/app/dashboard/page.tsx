'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  DollarSign,
  TrendingUp,
  Users,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Appointment, DashboardMetrics } from '@/types';
import { formatDateLegible, formatTimeLegible } from '@/lib/utils/dates';

export default function DashboardSummaryPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentAppointments, setRecentAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const res = await fetch('/api/dashboard-summary');
        if (res.ok) {
          const data = await res.json();
          setMetrics(data.metrics);
          setRecentAppointments(data.recentAppointments);
        }
      } catch (err) {
        console.error('Error cargando métricas:', err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 text-xs font-semibold">Cargando indicadores de negocio...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Saludo y Accesos Rápidos */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Resumen General
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Supervisa el estado de tus citas, disponibilidad e ingresos en tiempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/dashboard/citas"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
          >
            Ver todas las citas
          </a>
        </div>
      </div>

      {/* Tarjetas de Métricas (KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Citas Hoy</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics?.todayAppointmentsCount || 0}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Programadas para hoy</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Próximas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics?.upcomingCount || 0}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Citas activas a futuro</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Completadas</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {metrics?.completedCount || 0}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">Atendidas con éxito</span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Ingresos Est.</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            S/ {(metrics?.estimatedRevenue || 0).toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1">En citas activas y completadas</span>
        </div>
      </div>

      {/* Grid: Próximas Citas + Servicios más solicitados */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Próximas Citas */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
            <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              Próximas Reservas Agendadas
            </h2>
            <a href="/dashboard/citas" className="text-xs font-bold text-blue-600 hover:underline">
              Ver todas
            </a>
          </div>

          {recentAppointments.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">No hay citas registradas en el periodo actual.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentAppointments.slice(0, 6).map((app) => (
                <div key={app.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0">
                      {app.customer_name_snapshot.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-xs">
                        {app.customer_name_snapshot}
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        {app.service_name_snapshot} ({app.duration_minutes_snapshot} min)
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-bold text-blue-600 block">
                      {formatTimeLegible(app.start_at)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDateLegible(app.start_at).split(',')[0]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Servicios Populares */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h2 className="font-bold text-slate-900 text-sm mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Servicios Más Solicitados
          </h2>

          {metrics?.popularServices && metrics.popularServices.length > 0 ? (
            <div className="space-y-3">
              {metrics.popularServices.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 truncate max-w-[70%]">
                    {item.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                    {item.count} citas
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">
              Aún no hay suficiente historial de reservas.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
