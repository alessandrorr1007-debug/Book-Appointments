import React from 'react';
import {
  CalendarCheck2,
  Clock,
  ShieldCheck,
  Smartphone,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Users,
  ExternalLink,
  ChevronRight,
  Building,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Barra de Navegación Superior */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
              CF
            </div>
            <div className="leading-tight">
              <span className="font-extrabold text-slate-900 text-base tracking-tight">CitaFácil</span>
              <span className="text-[10px] text-blue-600 font-bold block uppercase tracking-wider">Perú</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 transition"
            >
              Iniciar Sesión
            </a>
            <a
              href="/dashboard"
              className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
            >
              Ir al Panel
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SaaS para Gestión Inteligente de Citas y Reservas</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] max-w-4xl mx-auto">
            Organiza tus citas, evita cruces de horarios y{' '}
            <span className="text-blue-600">multiplica tus reservas</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Permite que tus clientes elijan un servicio, consulten tus horarios disponibles en tiempo real y agenden su cita en segundos desde cualquier dispositivo.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <a
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition shadow-md flex items-center justify-center gap-2"
            >
              <span>Acceder al Panel Administrativo</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href="/reservar/don-luigi"
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 bg-white border border-slate-300 text-slate-800 rounded-2xl text-sm font-bold hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>Ver Demo Cliente en Vivo</span>
              <ExternalLink className="w-4 h-4 text-slate-400" />
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-500 font-semibold">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cero doble reserva
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> RLS multiempresa
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Zona horaria Perú
            </span>
          </div>
        </section>

        {/* Sectores Objetivo */}
        <section className="bg-white border-y border-slate-200/80 py-16">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Diseñado para negocios que trabajan por turnos y reservas
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Adaptable a diferentes rubros sin necesidad de desarrollos a medida.
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3 font-bold">
                  ✂️
                </div>
                <h3 className="font-bold text-slate-900 text-xs">Barberías y Salones</h3>
                <p className="text-[11px] text-slate-500 mt-1">Control por barbero y tiempo de lavado</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-pink-100 text-pink-700 flex items-center justify-center mx-auto mb-3 font-bold">
                  💅
                </div>
                <h3 className="font-bold text-slate-900 text-xs">Estéticas y Spas</h3>
                <p className="text-[11px] text-slate-500 mt-1">Cabinas, masajes y tratamientos faciales</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3 font-bold">
                  🩺
                </div>
                <h3 className="font-bold text-slate-900 text-xs">Consultorios</h3>
                <p className="text-[11px] text-slate-500 mt-1">Dentistas, psicólogos y nutricionistas</p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-3 font-bold">
                  🔧
                </div>
                <h3 className="font-bold text-slate-900 text-xs">Servicios Técnicos</h3>
                <p className="text-[11px] text-slate-500 mt-1">Talleres mecánicos y soporte especializado</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pilares Técnicos de Confianza */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Ingeniería sólida para tu negocio
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Más que una página estática: una plataforma transaccional robusta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Control de Concurrencia Atómica</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El motor previene solapamientos con transacciones atómicas PostgreSQL (RPC). Si dos clientes intentan reservar el mismo slot simultáneamente, solo uno obtiene la reserva.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Buffers y Políticas Reales</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Configura tiempos de limpieza previa y posterior por servicio, antelación mínima para reservar y políticas de cancelación segura por token criptográfico.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-slate-900 text-sm">100% Responsivo en Celulares</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Tus clientes pueden reservar cómodamente desde links de Instagram o WhatsApp en sus teléfonos con un flujo guiado en 5 pasos claros.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 px-4 text-center text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">CitaFácil SaaS</span>
            <span>• Gestión inteligente de citas</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="/login" className="hover:text-slate-700">Acceso Negocios</a>
            <a href="/reservar/don-luigi" className="hover:text-slate-700">Página de Reserva Pública</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
