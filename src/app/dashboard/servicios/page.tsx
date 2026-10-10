'use client';

import React, { useState, useEffect } from 'react';
import {
  Scissors,
  Plus,
  Clock,
  DollarSign,
  Edit,
  Trash2,
  Check,
  X,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { Service } from '@/types';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal Crear / Editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  // Formulario
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [bufferBefore, setBufferBefore] = useState(0);
  const [bufferAfter, setBufferAfter] = useState(0);
  const [priceAmount, setPriceAmount] = useState<string>('');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadServices = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/services');
      if (res.ok) {
        const data = await res.json();
        setServices(data.services || []);
      }
    } catch (e) {
      console.error('Error cargando servicios:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  const openCreateModal = () => {
    setEditingService(null);
    setName('');
    setDescription('');
    setDurationMinutes(30);
    setBufferBefore(0);
    setBufferAfter(0);
    setPriceAmount('');
    setActive(true);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const openEditModal = (service: Service) => {
    setEditingService(service);
    setName(service.name);
    setDescription(service.description || '');
    setDurationMinutes(service.duration_minutes);
    setBufferBefore(service.buffer_before_minutes || 0);
    setBufferAfter(service.buffer_after_minutes || 0);
    setPriceAmount(service.price_amount ? service.price_amount.toString() : '');
    setActive(service.active);
    setErrorMessage(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      durationMinutes: Number(durationMinutes),
      bufferBeforeMinutes: Number(bufferBefore),
      bufferAfterMinutes: Number(bufferAfter),
      priceAmount: priceAmount ? Number(priceAmount) : null,
      active,
    };

    try {
      const url = editingService
        ? `/api/admin/services/${editingService.id}`
        : '/api/admin/services';
      const method = editingService ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Error al guardar el servicio');
        return;
      }

      await loadServices();
      setModalOpen(false);
    } catch (err) {
      console.error('Error guardando servicio:', err);
      setErrorMessage('Error de conexión al guardar.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (service: Service) => {
    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !service.active }),
      });
      if (res.ok) {
        await loadServices();
      }
    } catch (e) {
      console.error('Error alternando estado:', e);
    }
  };

  const handleDelete = async (service: Service) => {
    if (!confirm(`¿Estás seguro de eliminar el servicio "${service.name}"?`)) return;

    try {
      const res = await fetch(`/api/admin/services/${service.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        await loadServices();
      }
    } catch (e) {
      console.error('Error eliminando servicio:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Catálogo de Servicios</h1>
          <p className="text-xs text-slate-500 mt-1">
            Administra los servicios que ofreces, sus duraciones, buffers de preparación y precios.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Grilla de Servicios */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-2 text-slate-400">
          <div className="w-7 h-7 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs">Cargando servicios...</span>
        </div>
      ) : services.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <Scissors className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <h3 className="text-sm font-bold text-slate-700 mb-1">No hay servicios registrados</h3>
          <p className="text-xs text-slate-500 mb-4">Crea tu primer servicio para empezar a recibir reservas.</p>
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition"
          >
            Crear Servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.id}
              className={`bg-white border rounded-2xl p-5 shadow-sm flex flex-col justify-between transition ${
                service.active ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">{service.name}</h3>
                  <button
                    onClick={() => handleToggleActive(service)}
                    className="text-slate-400 hover:text-slate-600 transition"
                    title={service.active ? 'Desactivar servicio' : 'Activar servicio'}
                  >
                    {service.active ? (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Activo
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">
                        Pausado
                      </span>
                    )}
                  </button>
                </div>

                {service.description && (
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                    {service.description}
                  </p>
                )}

                <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl mb-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      Duración:
                    </span>
                    <span className="font-bold text-slate-800">{service.duration_minutes} min</span>
                  </div>

                  {(service.buffer_before_minutes > 0 || service.buffer_after_minutes > 0) && (
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Buffers (pre/post):</span>
                      <span className="font-medium text-slate-700">
                        +{service.buffer_before_minutes}m / +{service.buffer_after_minutes}m
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 text-[11px]">Precio:</span>
                    <span className="font-extrabold text-blue-600">
                      {service.price_amount ? `S/ ${service.price_amount.toFixed(2)}` : 'Informativo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => openEditModal(service)}
                  className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  title="Editar"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(service)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
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
              {editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Configura las características y tiempos de atención.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombre del servicio *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Corte Clásico"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Descripción</label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre lo que incluye..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duración (minutos) *</label>
                  <input
                    type="number"
                    min={5}
                    max={720}
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Precio (S/)</label>
                  <input
                    type="number"
                    step="0.50"
                    placeholder="35.00"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Buffer antes (min)</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={bufferBefore}
                    onChange={(e) => setBufferBefore(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">Buffer después (min)</label>
                  <input
                    type="number"
                    min={0}
                    max={120}
                    value={bufferAfter}
                    onChange={(e) => setBufferAfter(Number(e.target.value))}
                    className="w-full px-2 py-1.5 border border-slate-200 rounded-lg outline-none bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="activeCheck"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="activeCheck" className="font-semibold text-slate-700 cursor-pointer">
                  Servicio activo (visible para reservas públicas)
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
                  {saving ? 'Guardando...' : 'Guardar Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
