'use client';

import React, { useState } from 'react';
import Link from 'next/navigation';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  CalendarDays,
  Users,
  Scissors,
  UserCheck,
  Clock,
  Settings,
  ExternalLink,
  Menu,
  X,
  Bell,
  Sparkles,
  LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Resumen', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Calendario', href: '/dashboard/calendario', icon: CalendarDays },
  { name: 'Citas', href: '/dashboard/citas', icon: Calendar },
  { name: 'Clientes', href: '/dashboard/clientes', icon: Users },
  { name: 'Servicios', href: '/dashboard/servicios', icon: Scissors },
  { name: 'Equipo', href: '/dashboard/equipo', icon: UserCheck },
  { name: 'Horarios', href: '/dashboard/horarios', icon: Clock },
  { name: 'Configuración', href: '/dashboard/configuracion', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Slug por defecto del negocio activo
  const activeSlug = 'don-luigi';
  const businessName = 'Barbería & Spa Don Luigi';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar de Escritorio */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col justify-between shrink-0 fixed inset-y-0 z-30">
        <div>
          {/* Logo y Nombre */}
          <div className="h-16 px-6 border-b border-slate-100 flex items-center justify-between">
            <a href="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-lg shadow-sm">
                CF
              </div>
              <div className="leading-tight">
                <span className="font-extrabold text-slate-900 tracking-tight text-base">CitaFácil</span>
                <span className="text-[10px] block text-blue-600 font-bold uppercase tracking-wider">SaaS Pro</span>
              </div>
            </a>
          </div>

          {/* Negocio Activo */}
          <div className="px-4 py-3 mx-3 my-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Negocio</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">Activo</span>
            </div>
            <p className="font-bold text-slate-800 text-xs truncate mt-0.5">{businessName}</p>
          </div>

          {/* Menú de Navegación */}
          <nav className="px-3 space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </a>
              );
            })}
          </nav>
        </div>

        {/* Sección Inferior */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <a
            href={`/reservar/${activeSlug}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200/60 hover:bg-blue-100 transition"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5" />
              Ver Página Pública
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
          </a>

          <div className="pt-2 px-2 flex items-center justify-between text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-xs">
                CL
              </div>
              <div className="leading-none">
                <span className="font-bold text-slate-800 text-[11px] block">Carlos Luigi</span>
                <span className="text-[10px] text-slate-400">Propietario</span>
              </div>
            </div>
            <a href="/login" className="text-slate-400 hover:text-red-600 p-1 rounded transition" title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
            </a>
          </div>
        </div>
      </aside>

      {/* Navegación Móvil (Drawer) */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-64 bg-white flex flex-col justify-between h-full p-4 z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black flex items-center justify-center text-sm">
                    CF
                  </div>
                  <span className="font-extrabold text-slate-900 text-base">CitaFácil</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold transition ${
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </a>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <a
                href={`/reservar/${activeSlug}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200"
              >
                <span>Ver Página Pública</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Contenido Principal con Topbar */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-slate-800">
              Panel Administrativo
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`/reservar/${activeSlug}`}
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
            >
              <span>Ir a Reserva Pública</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
            </a>
          </div>
        </header>

        <main className="p-4 sm:p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
