'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Phone, Mail, Calendar, FileText } from 'lucide-react';
import { Customer } from '@/types';
import { formatDateLegible } from '@/lib/utils/dates';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function loadCustomers() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/customers');
        if (res.ok) {
          const data = await res.json();
          setCustomers(data.customers || []);
        }
      } catch (e) {
        console.error('Error cargando clientes:', e);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.full_name.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Directorio de Clientes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Clientes registrados automáticamente a través de las reservas del negocio.
          </p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-center gap-2">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Buscar cliente por nombre, teléfono o correo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs outline-none bg-transparent"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
            <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">Cargando directorio...</span>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <h3 className="text-sm font-bold text-slate-700 mb-1">No hay clientes encontrados</h3>
            <p className="text-xs text-slate-500">Los clientes se registrarán automáticamente al reservar citas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Cliente</th>
                  <th className="py-3 px-4">Teléfono / WhatsApp</th>
                  <th className="py-3 px-4">Correo</th>
                  <th className="py-3 px-4">Notas Internas</th>
                  <th className="py-3 px-4 text-right">Registrado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 font-extrabold flex items-center justify-center text-xs">
                          {c.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="font-bold text-slate-900">{c.full_name}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {c.phone || <span className="text-slate-300">—</span>}
                    </td>

                    <td className="py-3.5 px-4 text-slate-600">
                      {c.email || <span className="text-slate-300">—</span>}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {c.notes || <span className="text-slate-300">—</span>}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                      {c.created_at ? formatDateLegible(c.created_at).split(',')[0] : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
