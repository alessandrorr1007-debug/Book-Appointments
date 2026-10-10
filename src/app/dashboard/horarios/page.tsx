'use client';

import React, { useState, useEffect } from 'react';
import { Clock, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { BusinessHours } from '@/types';
import { DAYS_OF_WEEK_SPANISH } from '@/lib/utils/dates';

interface DayConfig {
  dayOfWeek: number;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

export default function BusinessHoursPage() {
  const [schedule, setSchedule] = useState<DayConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadHours() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/hours');
        if (res.ok) {
          const data = await res.json();
          const existingHours: BusinessHours[] = data.hours || [];

          // Inicializar para los 7 días (0=Domingo..6=Sábado)
          const days: DayConfig[] = [1, 2, 3, 4, 5, 6, 0].map((dayNum) => {
            const found = existingHours.find((h) => h.day_of_week === dayNum);
            return {
              dayOfWeek: dayNum,
              enabled: !!found,
              startTime: found ? found.start_time.slice(0, 5) : '09:00',
              endTime: found ? found.end_time.slice(0, 5) : '19:00',
            };
          });

          setSchedule(days);
        }
      } catch (e) {
        console.error('Error cargando horarios:', e);
      } finally {
        setLoading(false);
      }
    }

    loadHours();
  }, []);

  const handleToggleDay = (dayOfWeek: number) => {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const handleTimeChange = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, [field]: value } : d))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccessMessage(null);

    const activeDays = schedule.filter((d) => d.enabled);

    try {
      const res = await fetch('/api/admin/hours', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hours: activeDays.map((d) => ({
            dayOfWeek: d.dayOfWeek,
            startTime: `${d.startTime}:00`,
            endTime: `${d.endTime}:00`,
          })),
        }),
      });

      if (res.ok) {
        setSuccessMessage('¡Horarios actualizados exitosamente!');
        setTimeout(() => setSuccessMessage(null), 4000);
      } else {
        alert('Error al guardar horarios.');
      }
    } catch (e) {
      console.error('Error guardando horarios:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Horarios de Atención</h1>
          <p className="text-xs text-slate-500 mt-1">
            Define los días de la semana y turnos regulares de atención al público.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Guardando...' : 'Guardar Horarios'}</span>
        </button>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Cargando turnos...</span>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100 overflow-hidden">
          {schedule.map((item) => (
            <div
              key={item.dayOfWeek}
              className={`p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition ${
                item.enabled ? 'bg-white' : 'bg-slate-50/70 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3 w-40">
                <input
                  type="checkbox"
                  id={`day-${item.dayOfWeek}`}
                  checked={item.enabled}
                  onChange={() => handleToggleDay(item.dayOfWeek)}
                  className="rounded text-blue-600 w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor={`day-${item.dayOfWeek}`}
                  className="font-bold text-slate-900 text-xs cursor-pointer select-none"
                >
                  {DAYS_OF_WEEK_SPANISH[item.dayOfWeek]}
                </label>
              </div>

              {item.enabled ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-slate-400">Desde:</span>
                  <input
                    type="time"
                    value={item.startTime}
                    onChange={(e) => handleTimeChange(item.dayOfWeek, 'startTime', e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                  />
                  <span className="text-slate-400">Hasta:</span>
                  <input
                    type="time"
                    value={item.endTime}
                    onChange={(e) => handleTimeChange(item.dayOfWeek, 'endTime', e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-800 outline-none focus:border-blue-600"
                  />
                </div>
              ) : (
                <span className="text-xs font-semibold text-slate-400">
                  Cerrado todo el día
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
