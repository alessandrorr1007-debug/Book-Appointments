'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Filter,
} from 'lucide-react';
import { Appointment, StaffMember } from '@/types';
import {
  formatDateLegible,
  formatTimeLegible,
  formatDateToYYYYMMDD,
  DAYS_OF_WEEK_SPANISH,
} from '@/lib/utils/dates';

export default function CalendarPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Vista actual: 'day' | 'week' | 'month'
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState<Date>(new Date('2026-10-10T12:00:00Z'));
  const [selectedStaffId, setSelectedStaffId] = useState<string>('all');

  useEffect(() => {
    setCurrentDate(new Date());
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [appRes, staffRes] = await Promise.all([
          fetch('/api/admin/appointments'),
          fetch('/api/admin/staff'),
        ]);

        if (appRes.ok) {
          const aData = await appRes.json();
          setAppointments(aData.appointments || []);
        }
        if (staffRes.ok) {
          const sData = await staffRes.json();
          setStaffList(sData.staff || []);
        }
      } catch (e) {
        console.error('Error cargando calendario:', e);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Navegación en fechas
  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() - 1);
    if (viewMode === 'week') d.setDate(d.getDate() - 7);
    if (viewMode === 'month') d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'day') d.setDate(d.getDate() + 1);
    if (viewMode === 'week') d.setDate(d.getDate() + 7);
    if (viewMode === 'month') d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Cálculo de los días de la semana activa
  const weekDays = useMemo(() => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Empezar en Lunes
    start.setDate(diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return {
        dateObj: d,
        dateStr: formatDateToYYYYMMDD(d),
        label: DAYS_OF_WEEK_SPANISH[d.getDay()],
        dayNum: d.getDate(),
      };
    });
  }, [currentDate]);

  // Filtrar citas por staff
  const filteredAppointments = useMemo(() => {
    return appointments.filter((app) => {
      if (selectedStaffId !== 'all' && app.staff_member_id !== selectedStaffId) return false;
      return true;
    });
  }, [appointments, selectedStaffId]);

  return (
    <div className="space-y-6">
      {/* Encabezado y Controles del Calendario */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Calendario de Citas</h1>
          <p className="text-xs text-slate-500 mt-1">
            Visualiza y coordina la agenda de tu equipo por día, semana o mes.
          </p>
        </div>

        {/* Controles de Navegación */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Selector de Staff */}
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-600 bg-white font-semibold text-slate-700"
          >
            <option value="all">Todo el equipo</option>
            {staffList.map((st) => (
              <option key={st.id} value={st.id}>{st.display_name}</option>
            ))}
          </select>

          {/* Selector de Modo */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 rounded-lg transition ${viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Día
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 rounded-lg transition ${viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Semana
            </button>
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1.5 rounded-lg transition ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'}`}
            >
              Mes
            </button>
          </div>

          {/* Flechas Hoy / Prev / Next */}
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-1">
            <button
              onClick={handlePrev}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              title="Anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition"
            >
              Hoy
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              title="Siguiente"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Título de periodo actual */}
      <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
        <CalendarIcon className="w-4 h-4 text-blue-600" />
        <span>
          {viewMode === 'day' && formatDateLegible(currentDate.toISOString())}
          {viewMode === 'week' && `Semana del ${weekDays[0].dayNum} al ${weekDays[6].dayNum} de ${DAYS_OF_WEEK_SPANISH[weekDays[0].dateObj.getDay()]}`}
          {viewMode === 'month' && currentDate.toLocaleString('es-PE', { month: 'long', year: 'numeric' })}
        </span>
      </div>

      {/* Grilla Semanal */}
      {viewMode === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
          {weekDays.map((col) => {
            const dayAppointments = filteredAppointments.filter((a) =>
              a.start_at.startsWith(col.dateStr) && a.status !== 'cancelled'
            );
            const isToday = formatDateToYYYYMMDD(new Date()) === col.dateStr;

            return (
              <div
                key={col.dateStr}
                className={`bg-white border rounded-2xl p-3 min-h-[300px] flex flex-col ${
                  isToday ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-slate-200'
                }`}
              >
                <div className="pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase block">{col.label.slice(0, 3)}</span>
                    <span className={`text-base font-black ${isToday ? 'text-blue-600' : 'text-slate-900'}`}>{col.dayNum}</span>
                  </div>
                  {dayAppointments.length > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded-full">
                      {dayAppointments.length}
                    </span>
                  )}
                </div>

                <div className="space-y-2 flex-1">
                  {dayAppointments.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-[11px] text-slate-300">
                      Sin citas
                    </div>
                  ) : (
                    dayAppointments.map((app) => (
                      <div
                        key={app.id}
                        className="p-2 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/70 transition text-xs"
                      >
                        <div className="font-bold text-blue-900 flex items-center justify-between text-[11px]">
                          <span>{formatTimeLegible(app.start_at)}</span>
                          <span className="text-[9px] uppercase px-1 rounded bg-white font-extrabold text-blue-700">
                            {app.duration_minutes_snapshot}m
                          </span>
                        </div>
                        <p className="font-bold text-slate-900 truncate mt-0.5">{app.customer_name_snapshot}</p>
                        <p className="text-[10px] text-slate-500 truncate">{app.service_name_snapshot}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Grilla Diaria o Mensual */}
      {viewMode !== 'week' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="text-center py-10 text-slate-500 text-xs">
            Mostrando {filteredAppointments.length} citas registradas en el periodo.
            <div className="mt-4 flex flex-wrap gap-3 justify-center">
              {filteredAppointments.slice(0, 8).map((app) => (
                <div key={app.id} className="p-3 border border-slate-200 rounded-xl text-left bg-slate-50 w-64">
                  <span className="text-[11px] font-bold text-blue-600 block">{formatTimeLegible(app.start_at)}</span>
                  <span className="font-bold text-slate-900 text-xs block truncate">{app.customer_name_snapshot}</span>
                  <span className="text-[11px] text-slate-500 block truncate">{app.service_name_snapshot}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
