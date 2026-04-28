'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getNotifications, markNotificationRead, markAllNotificationsRead,
} from '../../services/api';

const TYPE_ICON: Record<string, React.ReactNode> = {
  incident_assigned: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
  ),
  status_changed: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  comment: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
    </svg>
  ),
};

export default function NotificacionesPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications()
      .then((r) => setNotifications(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePress = async (item: any) => {
    if (!item.read) {
      try {
        await markNotificationRead(item.id);
        setNotifications((prev) => prev.map((n) => n.id === item.id ? { ...n, read: true } : n));
      } catch { /* silencioso */ }
    }
    if (item.incident_id) {
      router.push(`/incidencias/${item.incident_id}`);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* silencioso */ }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Notificaciones</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'var(--open-bg)', color: 'var(--open)' }}>
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="text-sm font-semibold transition-opacity hover:opacity-80"
            style={{ color: 'var(--primary)' }}>
            Leer todas
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.143 17.082a24.248 24.248 0 0 0 3.844.148m-3.844-.148a23.856 23.856 0 0 1-5.455-1.31 8.964 8.964 0 0 0 2.3-5.542m3.155 6.852a3 3 0 0 0 5.667 1.329m-.397-6.08a23.918 23.918 0 0 0 .402-3.542m-5.27 6.08L3 3m6.143 14.082a23.856 23.856 0 0 0 3.848.14m3.851 0a23.856 23.856 0 0 0 4.46-1.43 8.964 8.964 0 0 1-2.3-5.542m-6.011 6.972a23.918 23.918 0 0 1-.403-3.538m0 0 6.014-6.01" />
          </svg>
          <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>Sin notificaciones</p>
          <p className="text-sm text-center">Aquí aparecerán los avisos sobre tus incidencias</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          {notifications.map((n, i) => (
            <button key={n.id}
              onClick={() => handlePress(n)}
              className="w-full flex items-start gap-4 px-4 py-4 text-left transition-colors hover:opacity-80"
              style={{
                background: n.read ? 'var(--bg)' : 'var(--surface)',
                borderBottom: i < notifications.length - 1 ? '1px solid var(--border-light)' : 'none',
              }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{
                  background: n.read ? 'var(--surface-alt)' : 'var(--primary-light)',
                  color: n.read ? 'var(--text-muted)' : 'var(--primary)',
                }}>
                {TYPE_ICON[n.type] || TYPE_ICON.info}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ color: n.read ? 'var(--text-sub)' : 'var(--text)' }}>
                  {n.title}
                </p>
                {n.body && (
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: 'var(--text-sub)' }}>{n.body}</p>
                )}
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  {new Date(n.created_at).toLocaleString('es-ES', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
              {!n.read && (
                <div className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5" style={{ background: 'var(--primary)' }} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
