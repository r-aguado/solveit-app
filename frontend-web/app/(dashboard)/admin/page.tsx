'use client';

import { useEffect, useState } from 'react';
import { getUsers, toggleUserActive, createUser } from '../../services/api';

const ROLE_LABEL: Record<string, string> = { admin: 'Admin', technician: 'Técnico', user: 'Usuario' };
const ROLE_COLOR: Record<string, string> = {
  admin: 'var(--open)', technician: 'var(--primary)', user: 'var(--resolved)',
};
const ROLE_BG: Record<string, string> = {
  admin: 'var(--open-bg)', technician: 'var(--primary-light)', user: 'var(--resolved-bg)',
};

export default function AdminPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', department: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getUsers().then((r) => setUsers(r.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleToggle = async (user: any) => {
    try {
      await toggleUserActive(user.id);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, active: !u.active } : u));
    } catch { setError('No se pudo cambiar el estado'); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Nombre, email y contraseña son obligatorios'); return; }
    setSaving(true);
    try {
      const res = await createUser(form);
      setUsers((prev) => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ name: '', email: '', password: '', role: 'user', department: '' });
    } catch (err: any) { setError(err.response?.data?.message || 'No se pudo crear el usuario'); }
    finally { setSaving(false); }
  };

  const filtered = search
    ? users.filter((u) =>
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())
      )
    : users;

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Usuarios</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-sub)' }}>{users.length} registrados</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--open-bg)', color: 'var(--open)' }}>
          {error}
        </div>
      )}

      <div className="relative mb-4">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          className="w-full max-w-sm pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
          placeholder="Buscar usuarios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface-alt)' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-sub)' }}>Usuario</th>
                <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell" style={{ color: 'var(--text-sub)' }}>Departamento</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-sub)' }}>Rol</th>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: 'var(--text-sub)' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id}
                  className="transition-colors hover:bg-gray-50"
                  style={{
                    borderBottom: i < filtered.length - 1 ? '1px solid var(--border-light)' : 'none',
                    opacity: u.active ? 1 : 0.5,
                  }}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                        style={{ background: ROLE_BG[u.role], color: ROLE_COLOR[u.role] }}>
                        {u.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold" style={{ color: 'var(--text)' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm hidden sm:table-cell" style={{ color: 'var(--text-sub)' }}>
                    {u.department || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold px-2 py-1 rounded"
                      style={{ background: ROLE_BG[u.role], color: ROLE_COLOR[u.role] }}>
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(u)}
                      className="text-xs font-semibold px-2.5 py-1 rounded transition-opacity hover:opacity-80"
                      style={{
                        background: u.active ? 'var(--resolved-bg)' : 'var(--open-bg)',
                        color: u.active ? 'var(--resolved)' : 'var(--open)',
                      }}>
                      {u.active ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="py-16 text-center" style={{ color: 'var(--text-muted)' }}>No hay usuarios</div>
          )}
        </div>
      )}

      {/* Modal crear usuario */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
            style={{ background: 'var(--surface)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Nuevo usuario</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              {(['name', 'email', 'password', 'department'] as const).map((field) => (
                <div key={field}>
                  <label className="text-xs font-semibold block mb-1.5 capitalize" style={{ color: 'var(--text-sub)' }}>
                    {field === 'name' ? 'Nombre' : field === 'email' ? 'Email' : field === 'password' ? 'Contraseña' : 'Departamento'}
                    {field !== 'department' && ' *'}
                  </label>
                  <input
                    className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                    type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
                    placeholder={field === 'department' ? 'Ej: IT, RRHH...' : undefined}
                    value={(form as any)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  />
                </div>
              ))}
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>Rol</label>
                <div className="flex gap-2">
                  {(['user', 'technician', 'admin'] as const).map((r) => (
                    <button key={r} type="button" onClick={() => setForm({ ...form, role: r })}
                      className="flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all"
                      style={{
                        borderColor: ROLE_COLOR[r],
                        background: form.role === r ? ROLE_COLOR[r] : ROLE_BG[r],
                        color: form.role === r ? 'white' : ROLE_COLOR[r],
                      }}>
                      {ROLE_LABEL[r]}
                    </button>
                  ))}
                </div>
              </div>
              {error && <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--open-bg)', color: 'var(--open)' }}>{error}</p>}
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 rounded-lg border font-semibold text-sm"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-sub)' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white disabled:opacity-60"
                  style={{ background: 'var(--primary)' }}>
                  {saving ? '...' : 'Crear usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
