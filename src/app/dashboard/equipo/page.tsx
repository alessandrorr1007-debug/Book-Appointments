'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Plus,
  Phone,
  Mail,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  AlertCircle,
} from 'lucide-react';
import { StaffMember, Service } from '@/types';

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [staffRes, servicesRes] = await Promise.all([
        fetch('/api/admin/staff'),
        fetch('/api/admin/services'),
      ]);

      if (staffRes.ok) {
        const data = await staffRes.json();
        setStaff(data.staff || []);
      }
      if (servicesRes.ok) {
        const data = await servicesRes.json();
        setServices(data.services || []);
      }
    } catch (e) {
      console.error('Error cargando equipo:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingStaff(null);
    setDisplayName('');
    setEmail('');
    setPhone('');
    setActive(true);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setDisplayName(member.display_name);
    setEmail(member.email || '');
    setPhone(member.phone || '');
    setActive(member.active);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    const payload = {
      displayName: displayName.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      active,
    };

    try {
      const url = editingStaff
        ? `/api/admin/staff/${editingStaff.id}`
        : '/api/admin/staff';
      const method = editingStaff ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Error al guardar el profesional');
        return;
      }

      await loadData();
      setModalOpen(false);
    } catch (err) {
      console.error('Error guardando staff:', err);
      setErrorMessage('Error de conexión al guardar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Equipo de Profesionales</h1>
          <p className="text-xs text-slate-500 mt-1">
            Gestiona los miembros que prestan atención y atienden citas de clientes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Profesional</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Cargando equipo...</span>
        </div>
      ) : staff.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-bold text-slate-700 mb-1">No hay profesionales registrados</h3>
          <p className="text-xs text-slate-500 mb-4">Agrega miembros para asignarlos a servicios específicos.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
          >
            Agregar Profesional
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 font-extrabold flex items-center justify-center text-sm">
                    {member.display_name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {member.display_name}
                    </h3>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {member.active ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                  {member.phone && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  {member.email && (
                    <div className="flex items-center gap-2 text-[11px]">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{member.email}</span>
                    </div>
                  )}
                  {!member.phone && !member.email && (
                    <span className="text-[11px] text-slate-400">Sin datos de contacto</span>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(member)}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Crear / Editar */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-slate-900 mb-1">
              {editingStaff ? 'Editar Profesional' : 'Nuevo Profesional'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Registra un especialista del equipo.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre o Apodo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Mateo Barbero"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Teléfono</label>
                <input
                  type="tel"
                  placeholder="Ej. +51 987 654 321"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Correo</label>
                <input
                  type="email"
                  placeholder="mateo@ejemplo.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeStaff"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="activeStaff" className="font-semibold text-slate-700 cursor-pointer">
                  Profesional activo (habilitado para asignación de citas)
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl font-semibold hover:bg-slate-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
