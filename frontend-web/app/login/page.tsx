'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login, user, loading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!loading && user) router.replace('/incidencias');
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Introduce tu email y contraseña'); return; }
    setError('');
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      router.replace('/incidencias');
    } catch (err: any) {
      setError(err.response?.data?.message || 'No se pudo conectar con el servidor');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--primary)' }}>
      {/* Header azul */}
      <div className="flex flex-col items-center pt-16 pb-10">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'rgba(255,255,255,0.2)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-white" fill="none"
            viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold text-white tracking-wide">SolveIT</h1>
        <p className="text-blue-100 text-sm mt-1">Gestión de Incidencias IT</p>
      </div>

      {/* Card formulario */}
      <div className="flex-1 flex flex-col items-center px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 -mt-2">
          <h2 className="text-xl font-bold mb-6" style={{ color: 'var(--text)' }}>Iniciar sesión</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>
                Email
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2.5 gap-2"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>
                <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }}
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                <input
                  type="email"
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: 'var(--text)' }}
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>
                Contraseña
              </label>
              <div className="flex items-center border rounded-lg px-3 py-2.5 gap-2"
                style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)' }}>
                <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }}
                  xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
                <input
                  type={showPass ? 'text' : 'password'}
                  className="flex-1 bg-transparent outline-none text-sm"
                  style={{ color: 'var(--text)' }}
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="p-0.5" style={{ color: 'var(--text-muted)' }}>
                  {showPass ? (
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm"
                style={{ background: 'var(--open-bg)', color: 'var(--open)' }}>
                <svg className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg font-bold text-white text-base mt-2 transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)' }}
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : 'Entrar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
