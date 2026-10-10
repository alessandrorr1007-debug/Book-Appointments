'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Building2,
  Clock,
  Scissors,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  // Paso 1: Negocio
  const [businessName, setBusinessName] = useState('Mi Negocio');
  const [slug, setSlug] = useState('mi-negocio');
  const [businessType, setBusinessType] = useState('barbershop');
  const [phone, setPhone] = useState('+51 987 654 321');
  const [address, setAddress] = useState('Lima, Perú');

  // Paso 2: Horarios
  const [startHour, setStartHour] = useState('09:00');
  const [endHour, setEndHour] = useState('19:00');

  // Paso 3: Primer Servicio
  const [serviceName, setServiceName] = useState('Corte o Atención Estándar');
  const [serviceDuration, setServiceDuration] = useState(30);
  const [servicePrice, setServicePrice] = useState('35.00');

  const [saving, setSaving] = useState(false);

  const handleFinish = async () => {
    setSaving(true);
    // Simular guardado y redirigir al panel
    setTimeout(() => {
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Cabecera */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-xl shadow-sm">
              CF
            </div>
            <span className="text-2xl font-black text-slate-900 tracking-tight">CitaFácil</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Configura tu Negocio</h1>
          <p className="text-xs text-slate-500 mt-1">
            Solo 3 pasos rápidos para tener tu enlace de reservas listo para tus clientes.
          </p>
        </div>

        {/* Indicador de Pasos */}
        <div className="flex items-center justify-between mb-8 px-8">
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              1
            </div>
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">Tu Negocio</span>
          </div>
          <div className={`h-1 flex-1 mx-4 rounded ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              2
            </div>
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">Horarios</span>
          </div>
          <div className={`h-1 flex-1 mx-4 rounded ${step >= 3 ? 'bg-blue-600' : 'bg-slate-200'}`} />
          <div className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
              }`}
            >
              3
            </div>
            <span className="text-xs font-bold text-slate-700 hidden sm:inline">Primer Servicio</span>
          </div>
        </div>

        {/* Contenido del Paso */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          {/* PASO 1 */}
          {step === 1 && (
            <div className="space-y-4 text-xs">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">Datos Principales</h2>
                <p className="text-slate-500 text-xs">¿Cómo se llama tu negocio y dónde se ubica?</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del negocio *</label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => {
                    setBusinessName(e.target.value);
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9]+/g, '-')
                        .replace(/(^-|-$)+/g, '')
                    );
                  }}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-600 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Enlace público de reservas *</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-slate-100 text-slate-500 rounded-l-xl border border-r-0 border-slate-200 font-mono">
                    citafacil.pe/reservar/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase())}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-r-xl outline-none focus:border-blue-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Tipo de negocio</label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-600 bg-white"
                  >
                    <option value="barbershop">Barbería o Peluquería</option>
                    <option value="salon">Centro de Estética / Spa</option>
                    <option value="medical_clinic">Consultorio / Salud</option>
                    <option value="tech_repair">Servicio Técnico</option>
                    <option value="academy">Academia / Clases</option>
                    <option value="other">Otro Negocio</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Teléfono o WhatsApp</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Dirección o Referencia</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  <span>Continuar a Horarios</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {step === 2 && (
            <div className="space-y-4 text-xs">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">Horarios de Atención</h2>
                <p className="text-slate-500 text-xs">Configura el turno estándar de apertura y cierre.</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora de Apertura</label>
                  <input
                    type="time"
                    value={startHour}
                    onChange={(e) => setStartHour(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hora de Cierre</label>
                  <input
                    type="time"
                    value={endHour}
                    onChange={(e) => setEndHour(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none bg-white font-bold"
                  />
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                * Se aplicará de Lunes a Sábado por defecto. Luego podrás personalizar días de descanso y excepciones desde el panel.
              </p>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Volver
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition"
                >
                  <span>Continuar a Primer Servicio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {step === 3 && (
            <div className="space-y-4 text-xs">
              <div className="mb-4">
                <h2 className="text-lg font-bold text-slate-900">Tu Primer Servicio</h2>
                <p className="text-slate-500 text-xs">Define el servicio principal que podrán reservar tus clientes.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del servicio *</label>
                <input
                  type="text"
                  required
                  value={serviceName}
                  onChange={(e) => setServiceName(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-600 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duración (minutos) *</label>
                  <input
                    type="number"
                    min={5}
                    max={360}
                    value={serviceDuration}
                    onChange={(e) => setServiceDuration(Number(e.target.value))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio referencial (S/)</label>
                  <input
                    type="number"
                    step="0.50"
                    value={servicePrice}
                    onChange={(e) => setServicePrice(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-start gap-3 mt-4">
                <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 text-xs">¡Todo listo para empezar!</h4>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    Al finalizar se creará tu negocio y accederás directamente a tu panel de control.
                  </p>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Volver
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleFinish}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50"
                >
                  {saving ? (
                    <span>Activando tu negocio...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Completar y Entrar al Panel</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
