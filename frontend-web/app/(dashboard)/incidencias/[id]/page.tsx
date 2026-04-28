'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getIncident, updateStatus, addComment, assignTechnician, getTechnicians } from '../../../services/api';
import { useAuth } from '../../../contexts/AuthContext';

const STATUS_LABEL: Record<string, string> = {
  open: 'Abierta', in_progress: 'En progreso', resolved: 'Resuelta', closed: 'Cerrada',
};
const STATUS_COLOR: Record<string, string> = {
  open: 'var(--open)', in_progress: 'var(--in-progress)', resolved: 'var(--resolved)', closed: 'var(--closed)',
};
const STATUS_BG: Record<string, string> = {
  open: 'var(--open-bg)', in_progress: 'var(--in-progress-bg)', resolved: 'var(--resolved-bg)', closed: 'var(--closed-bg)',
};
const PRIORITY_LABEL: Record<string, string> = {
  low: 'Baja', medium: 'Media', high: 'Alta', critical: 'Crítica',
};
const PRIORITY_COLOR: Record<string, string> = {
  low: 'var(--p-low)', medium: 'var(--p-medium)', high: 'var(--p-high)', critical: 'var(--p-critical)',
};
const PRIORITY_BG: Record<string, string> = {
  low: 'var(--p-low-bg)', medium: 'var(--p-medium-bg)', high: 'var(--p-high-bg)', critical: 'var(--p-critical-bg)',
};
const NEXT_STATUS: Record<string, string> = {
  open: 'in_progress', in_progress: 'resolved', resolved: 'closed',
};
const NEXT_LABEL: Record<string, string> = {
  open: 'Iniciar', in_progress: 'Resolver', resolved: 'Cerrar',
};
const SLA: Record<string, string> = {
  critical: 'Máximo 2 horas',
  high: 'Máximo 8 horas',
  medium: 'Máximo 3 días hábiles',
  low: 'Máximo 1 semana',
};

export default function IncidentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const id = params.id as string;

  const [incident, setIncident] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [showAssign, setShowAssign] = useState(false);
  const [error, setError] = useState('');

  const fetchIncident = async () => {
    try {
      const res = await getIncident(id);
      setIncident(res.data);
    } catch {
      setError('No se pudo cargar la incidencia');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncident(); }, [id]);

  const handleStatusChange = async () => {
    const next = NEXT_STATUS[incident.status];
    if (!next) return;
    try {
      await updateStatus(id, next);
      fetchIncident();
    } catch { setError('No se pudo actualizar el estado'); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setSending(true);
    try {
      await addComment(id, comment.trim());
      setComment('');
      fetchIncident();
    } catch { setError('No se pudo enviar el comentario'); }
    finally { setSending(false); }
  };

  const openAssign = async () => {
    try {
      const res = await getTechnicians();
      setTechnicians(res.data);
      setShowAssign(true);
    } catch { setError('No se pudieron cargar los técnicos'); }
  };

  const handleAssign = async (techId: number) => {
    try {
      await assignTechnician(id, techId);
      setShowAssign(false);
      fetchIncident();
    } catch { setError('No se pudo asignar el técnico'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!incident) return (
    <div className="text-center py-20" style={{ color: 'var(--text-muted)' }}>
      Incidencia no encontrada
    </div>
  );

  const canChangeStatus = (user?.role === 'admin' || user?.role === 'technician') && NEXT_STATUS[incident.status];

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-medium mb-4 hover:opacity-80 transition-opacity"
        style={{ color: 'var(--primary)' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Volver
      </button>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--open-bg)', color: 'var(--open)' }}>
          {error}
        </div>
      )}

      {/* Header card */}
      <div className="rounded-xl border p-6 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: PRIORITY_BG[incident.priority], color: PRIORITY_COLOR[incident.priority] }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: PRIORITY_COLOR[incident.priority] }} />
            {PRIORITY_LABEL[incident.priority]}
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
            style={{ background: STATUS_BG[incident.status], color: STATUS_COLOR[incident.status] }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_COLOR[incident.status] }} />
            {STATUS_LABEL[incident.status]}
          </span>
          {incident.category_name && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium"
              style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
              {incident.category_name}
            </span>
          )}
        </div>
        <h1 className="text-xl font-bold mb-4" style={{ color: 'var(--text)' }}>{incident.title}</h1>

        {canChangeStatus && (
          <button onClick={handleStatusChange}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-semibold text-sm text-white mb-4 transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)' }}>
            {NEXT_LABEL[incident.status]} incidencia
          </button>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-sub)' }}>Creado por</p>
            <p style={{ color: 'var(--text)' }}>{incident.created_by_name || '—'}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-sub)' }}>Asignado a</p>
            <div className="flex items-center gap-2">
              <p style={{ color: 'var(--text)' }}>{incident.assigned_to_name || 'Sin asignar'}</p>
              {user?.role === 'admin' && (
                <button onClick={openAssign}
                  className="text-xs font-semibold px-2 py-0.5 rounded"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  Cambiar
                </button>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-sub)' }}>Fecha</p>
            <p style={{ color: 'var(--text)' }}>{new Date(incident.created_at).toLocaleString('es-ES')}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'var(--text-sub)' }}>Tiempo estimado</p>
            <p className="text-xs font-semibold" style={{ color: PRIORITY_COLOR[incident.priority] }}>
              {SLA[incident.priority]}
            </p>
          </div>
        </div>
      </div>

      {/* Descripción */}
      <div className="rounded-xl border p-6 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'var(--text-sub)' }}>Descripción</p>
        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{incident.description}</p>
      </div>

      {/* Historial */}
      {incident.history?.length > 0 && (
        <div className="rounded-xl border p-6 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-sub)' }}>
            Historial de cambios
          </p>
          <div className="flex flex-col gap-3">
            {incident.history.map((h: any, i: number) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                  style={{ background: STATUS_BG[h.old_status], color: STATUS_COLOR[h.old_status] }}>
                  {STATUS_LABEL[h.old_status]}
                </span>
                <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold"
                  style={{ background: STATUS_BG[h.new_status], color: STATUS_COLOR[h.new_status] }}>
                  {STATUS_LABEL[h.new_status]}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {h.changed_by_name} · {new Date(h.changed_at).toLocaleString('es-ES')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Comentarios */}
      <div className="rounded-xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-sub)' }}>
          Comentarios ({incident.comments?.length || 0})
        </p>

        <div className="flex flex-col gap-3 mb-5">
          {incident.comments?.map((c: any) => (
            <div key={c.id} className="rounded-lg p-4" style={{ background: 'var(--bg)' }}>
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  {c.user_name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{c.user_name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(c.created_at).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>{c.message}</p>
            </div>
          ))}
        </div>

        <form onSubmit={handleComment} className="flex gap-2">
          <textarea
            className="flex-1 border rounded-lg px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
            style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            placeholder="Escribe un comentario..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
          />
          <button type="submit" disabled={sending || !comment.trim()}
            className="px-4 py-2 rounded-lg font-semibold text-sm text-white disabled:opacity-50 transition-opacity hover:opacity-90 shrink-0"
            style={{ background: 'var(--primary)' }}>
            {sending ? '...' : 'Enviar'}
          </button>
        </form>
      </div>

      {/* Modal asignar técnico */}
      {showAssign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Asignar técnico</h3>
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {technicians.map((t) => (
                <button key={t.id} onClick={() => handleAssign(t.id)}
                  className="flex items-center gap-3 p-3 rounded-lg border text-left hover:opacity-80 transition-opacity"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                    style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                    {t.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.email}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-1 rounded"
                    style={{ background: 'var(--in-progress-bg)', color: 'var(--in-progress)' }}>
                    {t.active_incidents} activas
                  </span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowAssign(false)}
              className="mt-4 w-full py-2.5 rounded-lg border font-semibold text-sm transition-opacity hover:opacity-80"
              style={{ borderColor: 'var(--border)', color: 'var(--text-sub)' }}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
