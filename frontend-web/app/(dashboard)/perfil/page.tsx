'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateProfile } from '../../services/api';

const ROLE_LABEL: Record<string, string> = { admin: 'Administrador', technician: 'Técnico', user: 'Usuario' };

export default function PerfilPage() {
  const { user, logout, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || '', department: user?.department || '' });
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const initials = user?.name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError('El nombre no puede estar vacío'); return; }
    if (showPass) {
      if (!passwords.current) { setError('Introduce tu contraseña actual'); return; }
      if (passwords.newPass.length < 6) { setError('La nueva contraseña debe tener al menos 6 caracteres'); return; }
      if (passwords.newPass !== passwords.confirm) { setError('Las contraseñas no coinciden'); return; }
    }
    setSaving(true);
    setError('');
    try {
      const payload: any = { name: form.name, department: form.department };
      if (showPass && passwords.newPass) {
        payload.currentPassword = passwords.current;
        payload.newPassword = passwords.newPass;
      }
      const res = await updateProfile(payload);
      updateUser((res.data as any).user);
      setEditing(false);
      setShowPass(false);
      setPasswords({ current: '', newPass: '', confirm: '' });
      setSuccess('Perfil actualizado correctamente');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const res = await updateProfile({ profile_photo: reader.result as string });
        updateUser((res.data as any).user);
        setSuccess('Foto actualizada');
        setTimeout(() => setSuccess(''), 3000);
      } catch { setError('No se pudo guardar la foto'); }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Perfil</h1>

      {success && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--resolved-bg)', color: 'var(--resolved)' }}>
          {success}
        </div>
      )}

      {/* Foto + info */}
      <div className="rounded-2xl p-6 mb-4 flex flex-col items-center"
        style={{ background: 'var(--primary)' }}>
        <label className="relative cursor-pointer mb-3">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white/40">
            {user?.profile_photo ? (
              <img src={user.profile_photo} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
                {initials}
              </div>
            )}
          </div>
          <div className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center border-2 border-white"
            style={{ background: 'var(--primary-dark)' }}>
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
            </svg>
          </div>
          <input type="file" accept="image/*" className="sr-only" onChange={handlePhotoChange} />
        </label>
        <h2 className="text-xl font-bold text-white">{user?.name}</h2>
        <p className="text-blue-100 text-sm">{user?.email}</p>
        <span className="mt-2 px-3 py-1 rounded-full text-xs font-semibold"
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>
          {ROLE_LABEL[user?.role || 'user']}
        </span>
        <p className="text-blue-200 text-xs mt-2">Haz clic en la foto para cambiarla</p>
      </div>

      {/* Info card */}
      {!editing ? (
        <div className="rounded-xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-sub)' }}>
            Información personal
          </p>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Nombre', value: user?.name },
              { label: 'Email', value: user?.email },
              { label: 'Departamento', value: user?.department || 'No especificado' },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{f.label}</p>
                <p className="font-medium mt-0.5" style={{ color: 'var(--text)' }}>{f.value}</p>
              </div>
            ))}
          </div>
          <button onClick={() => { setEditing(true); setForm({ name: user?.name || '', department: user?.department || '' }); }}
            className="mt-5 flex items-center gap-2 w-full justify-center py-2.5 rounded-lg border-2 font-semibold text-sm transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'var(--primary-light)' }}>
            Editar información
          </button>
        </div>
      ) : (
        <div className="rounded-xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-sub)' }}>
            Editar información
          </p>
          <form onSubmit={handleSave} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>Nombre</label>
              <input className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>Departamento</label>
              <input className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                placeholder="Ej: IT, RRHH, Soporte..."
                value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
            </div>
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="flex items-center gap-2 text-sm font-semibold w-fit"
              style={{ color: 'var(--primary)' }}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
              </svg>
              {showPass ? 'Cancelar cambio de contraseña' : 'Cambiar contraseña'}
            </button>
            {showPass && (
              <>
                {[
                  { key: 'current', label: 'Contraseña actual' },
                  { key: 'newPass', label: 'Nueva contraseña' },
                  { key: 'confirm', label: 'Confirmar contraseña' },
                ].map((f) => (
                  <div key={f.key}>
                    <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>{f.label}</label>
                    <input type="password"
                      className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                      style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                      value={(passwords as any)[f.key]}
                      onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })} />
                  </div>
                ))}
              </>
            )}
            {error && <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--open-bg)', color: 'var(--open)' }}>{error}</p>}
            <div className="flex gap-3">
              <button type="button" onClick={() => { setEditing(false); setShowPass(false); setError(''); }}
                className="flex-1 py-2.5 rounded-lg border font-semibold text-sm"
                style={{ borderColor: 'var(--border)', color: 'var(--text-sub)' }}>
                Cancelar
              </button>
              <button type="submit" disabled={saving}
                className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white disabled:opacity-60"
                style={{ background: 'var(--primary)' }}>
                {saving ? '...' : 'Guardar'}
              </button>
            </div>
          </form>
        </div>
      )}

      <button onClick={logout}
        className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-bold text-sm transition-opacity hover:opacity-80"
        style={{ borderColor: 'var(--open)', color: 'var(--open)', background: 'var(--open-bg)' }}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
        </svg>
        Cerrar sesión
      </button>
    </div>
  );
}
