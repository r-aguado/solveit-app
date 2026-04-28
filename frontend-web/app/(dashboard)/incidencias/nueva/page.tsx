'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createIncident, getCategories } from '../../../services/api';

const PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
const PRIORITY_LABEL: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
};
const PRIORITY_COLOR: Record<string, string> = {
  low: 'var(--p-low)', medium: 'var(--p-medium)', high: 'var(--p-high)', critical: 'var(--p-critical)',
};
const PRIORITY_BG: Record<string, string> = {
  low: 'var(--p-low-bg)', medium: 'var(--p-medium-bg)', high: 'var(--p-high-bg)', critical: 'var(--p-critical-bg)',
};

export default function NuevaIncidenciaPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [created, setCreated] = useState<any>(null);

  useEffect(() => {
    getCategories().then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError('El título y la descripción son obligatorios');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await createIncident({ title, description, priority, category_id: categoryId });
      setCreated(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo crear la incidencia');
    } finally {
      setLoading(false);
    }
  };

  if (created) return (
    <div className="max-w-md mx-auto mt-12 flex flex-col items-center text-center">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ background: 'var(--resolved-bg)' }}>
        <svg className="w-10 h-10" style={{ color: 'var(--resolved)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      </div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>¡Incidencia creada!</h2>
      <p className="text-sm mb-6" style={{ color: 'var(--text-sub)' }}>
        Tu incidencia ha sido registrada y será atendida en breve.
      </p>
      <div className="w-full rounded-xl border p-4 mb-6 text-left" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-sm"><span className="font-semibold" style={{ color: 'var(--text-sub)' }}>Título:</span>{' '}
          <span style={{ color: 'var(--text)' }}>{title}</span></p>
        <p className="text-sm mt-2"><span className="font-semibold" style={{ color: 'var(--text-sub)' }}>Prioridad:</span>{' '}
          <span className="font-semibold" style={{ color: PRIORITY_COLOR[priority] }}>{PRIORITY_LABEL[priority]}</span></p>
      </div>
      <div className="flex flex-col gap-3 w-full">
        <button onClick={() => router.push(`/incidencias/${created.id}`)}
          className="w-full py-3 rounded-lg font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          Ver incidencia
        </button>
        <button onClick={() => router.push('/incidencias')}
          className="w-full py-2.5 rounded-lg font-semibold border transition-opacity hover:opacity-80"
          style={{ borderColor: 'var(--border)', color: 'var(--text-sub)' }}>
          Volver al listado
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => router.back()} className="p-1.5 rounded-lg hover:opacity-70" style={{ color: 'var(--text-sub)' }}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Nueva incidencia</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Título */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <label className="text-xs font-bold uppercase tracking-wide block mb-2" style={{ color: 'var(--text-sub)' }}>
            Título <span style={{ color: 'var(--open)' }}>*</span>
          </label>
          <input
            className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
            placeholder="Describe brevemente el problema"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Descripción */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <label className="text-xs font-bold uppercase tracking-wide block mb-2" style={{ color: 'var(--text-sub)' }}>
            Descripción <span style={{ color: 'var(--open)' }}>*</span>
          </label>
          <textarea
            className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
            placeholder="Explica el problema con detalle: pasos para reproducirlo, mensajes de error, etc."
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Prioridad */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <label className="text-xs font-bold uppercase tracking-wide block mb-3" style={{ color: 'var(--text-sub)' }}>
            Prioridad
          </label>
          <div className="flex flex-wrap gap-2">
            {PRIORITIES.map((p) => {
              const active = priority === p;
              return (
                <button key={p} type="button" onClick={() => setPriority(p)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border-2 text-sm font-semibold transition-all"
                  style={{
                    borderColor: PRIORITY_COLOR[p],
                    background: active ? PRIORITY_COLOR[p] : PRIORITY_BG[p],
                    color: active ? 'white' : PRIORITY_COLOR[p],
                  }}>
                  {active && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                    </svg>
                  )}
                  {PRIORITY_LABEL[p]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categoría */}
        {categories.length > 0 && (
          <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <label className="text-xs font-bold uppercase tracking-wide block mb-3" style={{ color: 'var(--text-sub)' }}>
              Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => {
                const active = categoryId === c.id;
                return (
                  <button key={c.id} type="button" onClick={() => setCategoryId(active ? null : c.id)}
                    className="px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all"
                    style={{
                      borderColor: active ? 'var(--primary)' : 'var(--border)',
                      background: active ? 'var(--primary-light)' : 'var(--surface)',
                      color: active ? 'var(--primary)' : 'var(--text-sub)',
                    }}>
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && (
          <div className="px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--open-bg)', color: 'var(--open)' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-white text-base flex items-center justify-center gap-2 transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ background: 'var(--primary)' }}>
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Crear incidencia
            </>
          )}
        </button>
      </form>
    </div>
  );
}
