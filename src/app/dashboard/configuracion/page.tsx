'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, ExternalLink, Globe, AlertCircle } from 'lucide-react';
import { Business } from '@/types';

export default function BusinessSettingsPage() {
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Formulario
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [timezone, setTimezone] = useState('America/Lima');
  const [minBookingNotice, setMinBookingNotice] = useState(2);
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(30);
  const [cancellationNotice, setCancellationNotice] = useState(4);
  const [bookingEnabled, setBookingEnabled] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const data = await res.json();
          const b: Business = data.business;
          setBusiness(b);
          setName(b.name);
          setSlug(b.slug);
          setDescription(b.description || '');
          setPhone(b.phone || '');
          setEmail(b.email || '');
          setAddress(b.address || '');
          setTimezone(b.timezone);
          setMinBookingNotice(b.min_booking_notice_hours);
          setMaxAdvanceDays(b.max_booking_advance_days);
          setCancellationNotice(b.cancellation_notice_hours);
          setBookingEnabled(b.booking_enabled);
        }
      } catch (e) {
        console.error('Error cargando configuración:', e);
      } finally {
        setLoading(false);
      }
    }

    loadSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim().toLowerCase(),
          description: description.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          address: address.trim() || null,
          timezone,
          minBookingNoticeHours: Number(minBookingNotice),
          maxBookingAdvanceDays: Number(maxAdvanceDays),
          cancellationNoticeHours: Number(cancellationNotice),
          bookingEnabled,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Error al guardar la configuración');
        return;
      }

      setSuccessMessage('¡Configuración actualizada exitosamente!');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error guardando configuración:', err);
      setErrorMessage('Error de conexión al guardar.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
        <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Configuración del Negocio</h1>
          <p className="text-xs text-slate-500 mt-1">
            Parámetros comerciales, página pública de reservas y políticas de cancelación.
          </p>
        </div>

        <a
          href={`/reservar/${slug}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 border border-slate-300 text-slate-700 bg-white rounded-xl text-xs font-bold hover:bg-slate-50 transition shadow-sm"
        >
          <Globe className="w-4 h-4 text-blue-600" />
          <span>Ver mi página pública</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Identidad */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Identidad y Datos Comerciales
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nombre comercial *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                URL Pública (slug) *
              </label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-slate-100 text-slate-500 rounded-l-xl border border-r-0 border-slate-200 text-xs font-mono">
                  /reservar/
                </span>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-r-xl outline-none focus:border-blue-600 font-mono text-xs"
                />
              </div>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">Descripción corta</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600 resize-none text-xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Teléfono / WhatsApp</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Correo de contacto</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Zona horaria</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600 bg-white"
              >
                <option value="America/Lima">America/Lima (Perú - UTC-5)</option>
                <option value="America/Bogota">America/Bogota (Colombia - UTC-5)</option>
                <option value="America/Santiago">America/Santiago (Chile)</option>
                <option value="America/Mexico_City">America/Mexico_City (México)</option>
              </select>
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-bold text-slate-700 mb-1">Dirección del local</label>
            <input
              type="text"
              placeholder="Ej. Av. Larco 450, Miraflores, Lima"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
            />
          </div>
        </div>

        {/* Políticas de Reserva */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
            Reglas de Reserva y Cancelación
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Antelación mínima (horas)</label>
              <input
                type="number"
                min={0}
                max={72}
                value={minBookingNotice}
                onChange={(e) => setMinBookingNotice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Los clientes no podrán reservar con menos de estas horas de aviso.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Máximo días a futuro</label>
              <input
                type="number"
                min={1}
                max={365}
                value={maxAdvanceDays}
                onChange={(e) => setMaxAdvanceDays(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Límite de días visibles en el calendario público.
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Aviso para cancelar (horas)</label>
              <input
                type="number"
                min={0}
                max={72}
                value={cancellationNotice}
                onChange={(e) => setCancellationNotice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Horas requeridas antes de la cita para permitir auto-cancelación.
              </span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="checkbox"
              id="bookingEnabledCheck"
              checked={bookingEnabled}
              onChange={(e) => setBookingEnabled(e.target.checked)}
              className="rounded text-blue-600 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="bookingEnabledCheck" className="text-xs font-bold text-slate-800 cursor-pointer select-none">
              Página de reservas pública habilitada (permite recibir citas en la web)
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando cambios...' : 'Guardar Configuración'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
