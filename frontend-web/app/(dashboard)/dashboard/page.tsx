'use client';

import { useEffect, useState } from 'react';
import { getDashboard } from '../../services/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  open:        { label: 'Abiertas',    color: 'var(--open)',       bg: 'var(--open-bg)' },
  in_progress: { label: 'En progreso', color: 'var(--in-progress)', bg: 'var(--in-progress-bg)' },
  resolved:    { label: 'Resueltas',   color: 'var(--resolved)',   bg: 'var(--resolved-bg)' },
  closed:      { label: 'Cerradas',    color: 'var(--closed)',     bg: 'var(--closed-bg)' },
};
const PRIORITY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  critical: { label: 'Crítica', color: 'var(--p-critical)', bg: 'var(--p-critical-bg)' },
  high:     { label: 'Alta',    color: 'var(--p-high)',     bg: 'var(--p-high-bg)' },
  medium:   { label: 'Media',   color: 'var(--p-medium)',   bg: 'var(--p-medium-bg)' },
  low:      { label: 'Baja',    color: 'var(--p-low)',      bg: 'var(--p-low-bg)' },
};

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!stats) return (
    <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
      No se pudieron cargar las estadísticas
    </div>
  );

  const byStatusMap = Object.fromEntries(stats.byStatus.map((s: any) => [s.status, parseInt(s.count)]));
  const byPriorityMap = Object.fromEntries(stats.byPriority.map((p: any) => [p.priority, parseInt(p.count)]));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Dashboard</h1>
        <p className="text-sm mt-0.5" style={{ color: 'var(--text-sub)' }}>Resumen general del sistema</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border p-5 col-span-2 sm:col-span-1"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-sub)' }}>
            Total incidencias
          </p>
          <p className="text-4xl font-bold" style={{ color: 'var(--primary)' }}>{stats.total}</p>
        </div>
        <div className="rounded-xl border p-5"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--text-sub)' }}>
            Tiempo medio resolución
          </p>
          <p className="text-4xl font-bold" style={{ color: 'var(--resolved)' }}>
            {stats.avgResolutionHours ? `${stats.avgResolutionHours}h` : '—'}
          </p>
        </div>
        <div className="rounded-xl border p-5"
          style={{ background: 'var(--open-bg)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--open)' }}>
            Abiertas
          </p>
          <p className="text-4xl font-bold" style={{ color: 'var(--open)' }}>
            {byStatusMap['open'] || 0}
          </p>
        </div>
        <div className="rounded-xl border p-5"
          style={{ background: 'var(--in-progress-bg)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--in-progress)' }}>
            En progreso
          </p>
          <p className="text-4xl font-bold" style={{ color: 'var(--in-progress)' }}>
            {byStatusMap['in_progress'] || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Por estado */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-sub)' }}>
            Por estado
          </p>
          <div className="grid grid-cols-2 gap-3">
            {(['open', 'in_progress', 'resolved', 'closed'] as const).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const count = byStatusMap[s] || 0;
              return (
                <div key={s} className="rounded-lg p-4 flex flex-col items-center"
                  style={{ background: cfg.bg }}>
                  <p className="text-3xl font-bold" style={{ color: cfg.color }}>{count}</p>
                  <p className="text-xs font-semibold mt-1" style={{ color: cfg.color }}>{cfg.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Por prioridad */}
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-sub)' }}>
            Por prioridad
          </p>
          <div className="flex flex-col gap-3">
            {(['critical', 'high', 'medium', 'low'] as const).map((p) => {
              const cfg = PRIORITY_CONFIG[p];
              const count = byPriorityMap[p] || 0;
              const pct = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={p} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ background: cfg.color }} />
                  <span className="text-sm w-16" style={{ color: 'var(--text)' }}>{cfg.label}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${Math.max(2, pct)}%`, background: cfg.color }} />
                  </div>
                  <span className="text-sm font-bold w-6 text-right" style={{ color: cfg.color }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Por categoría */}
      {stats.byCategory?.length > 0 && (
        <div className="rounded-xl border p-5 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-sub)' }}>
            Por categoría
          </p>
          <div className="flex flex-col gap-3">
            {stats.byCategory.map((c: any, i: number) => {
              const pct = stats.total > 0 ? (parseInt(c.count) / stats.total) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-sm w-28 truncate" style={{ color: 'var(--text)' }}>{c.name}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg)' }}>
                    <div className="h-full rounded-full" style={{ width: `${Math.max(2, pct)}%`, background: 'var(--primary)' }} />
                  </div>
                  <span className="text-sm font-bold w-6 text-right" style={{ color: 'var(--primary)' }}>{c.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Carga por técnico */}
      {stats.byTechnician?.length > 0 && (
        <div className="rounded-xl border p-5" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-sub)' }}>
            Carga por técnico
          </p>
          <div className="flex flex-col gap-3">
            {stats.byTechnician.map((t: any, i: number) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg border"
                style={{ borderColor: 'var(--border-light)', background: 'var(--surface-alt)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {t.name?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.name}</p>
                  <div className="flex gap-2 mt-1">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ background: 'var(--open-bg)', color: 'var(--open)' }}>
                      {t.active} activas
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded"
                      style={{ background: 'var(--resolved-bg)', color: 'var(--resolved)' }}>
                      {t.resolved} resueltas
                    </span>
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{t.total}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>total</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
