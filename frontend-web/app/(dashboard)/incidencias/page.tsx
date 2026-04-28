'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getIncidents } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const STATUS_LABEL: Record<string, string> = {
  open: 'Abierta', in_progress: 'En progreso', resolved: 'Resuelta', closed: 'Cerrada',
};
const STATUS_COLOR: Record<string, string> = {
  open: 'var(--open)', in_progress: 'var(--in-progress)', resolved: 'var(--resolved)', closed: 'var(--closed)',
};
const STATUS_BG: Record<string, string> = {
  open: 'var(--open-bg)', in_progress: 'var(--in-progress-bg)', resolved: 'var(--resolved-bg)', closed: 'var(--closed-bg)',
};
const PRIORITY_COLOR: Record<string, string> = {
  low: 'var(--p-low)', medium: 'var(--p-medium)', high: 'var(--p-high)', critical: 'var(--p-critical)',
};
const PRIORITY_LABEL: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
};

const FILTERS = [
  { label: 'Todas', value: null },
  { label: 'Abiertas', value: 'open' },
  { label: 'En progreso', value: 'in_progress' },
  { label: 'Resueltas', value: 'resolved' },
  { label: 'Cerradas', value: 'closed' },
];

interface Incident {
  id: number;
  title: string;
  status: string;
  priority: string;
  category_name?: string;
  created_by_name?: string;
  assigned_to_name?: string;
  created_at: string;
}

export default function IncidentasPage() {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchIncidents = useCallback(async (status: string | null) => {
    setLoading(true);
    try {
      const res = await getIncidents(status ? { status } : {});
      setIncidents(res.data);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchIncidents(filter); }, [filter, fetchIncidents]);

  const filtered = search
    ? incidents.filter((i) =>
        i.title.toLowerCase().includes(search.toLowerCase()) ||
        i.category_name?.toLowerCase().includes(search.toLowerCase())
      )
    : incidents;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Incidencias</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-sub)' }}>
            {filtered.length} incidencia{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link href="/incidencias/nueva"
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva incidencia
        </Link>
      </div>

      {/* Búsqueda + Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
            placeholder="Buscar incidencias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f.label}
              onClick={() => setFilter(f.value)}
              className="px-3 py-2 rounded-lg text-sm font-medium border transition-all"
              style={{
                borderColor: filter === f.value ? 'var(--primary)' : 'var(--border)',
                background: filter === f.value ? 'var(--primary-light)' : 'var(--surface)',
                color: filter === f.value ? 'var(--primary)' : 'var(--text-sub)',
              }}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla / Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z" />
          </svg>
          <p className="text-base font-medium">No hay incidencias</p>
        </div>
      ) : (
        <>
          {/* Vista tabla (md+) */}
          <div className="hidden md:block rounded-xl border overflow-hidden"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-sub)' }}>Título</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-sub)' }}>Estado</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-sub)' }}>Prioridad</th>
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-sub)' }}>Categoría</th>
                  {user?.role !== 'user' && (
                    <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-sub)' }}>Creado por</th>
                  )}
                  <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-sub)' }}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc, i) => (
                  <tr key={inc.id}
                    style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none' }}
                    className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/incidencias/${inc.id}`}
                        className="font-semibold hover:underline"
                        style={{ color: 'var(--primary)' }}>
                        {inc.title}
                        {inc.priority === 'critical' && (
                          <span className="ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded"
                            style={{ background: 'var(--p-critical-bg)', color: 'var(--p-critical)' }}>
                            CRÍTICA
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{ background: STATUS_BG[inc.status], color: STATUS_COLOR[inc.status] }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[inc.status] }} />
                        {STATUS_LABEL[inc.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold" style={{ color: PRIORITY_COLOR[inc.priority] }}>
                        {PRIORITY_LABEL[inc.priority]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-sub)' }}>
                      {inc.category_name || '—'}
                    </td>
                    {user?.role !== 'user' && (
                      <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-sub)' }}>
                        {inc.created_by_name || '—'}
                      </td>
                    )}
                    <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {new Date(inc.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Vista cards (mobile) */}
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((inc) => (
              <Link key={inc.id} href={`/incidencias/${inc.id}`}
                className="flex overflow-hidden rounded-xl border transition-shadow hover:shadow-md"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="w-1 shrink-0" style={{ background: PRIORITY_COLOR[inc.priority] }} />
                <div className="p-4 flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{inc.title}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ml-2 shrink-0"
                      style={{ background: STATUS_BG[inc.status], color: STATUS_COLOR[inc.status] }}>
                      {STATUS_LABEL[inc.status]}
                    </span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {inc.category_name || 'Sin categoría'} · {new Date(inc.created_at).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
