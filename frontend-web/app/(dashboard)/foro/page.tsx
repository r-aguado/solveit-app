'use client';

import { useEffect, useState } from 'react';
import {
  getForumPosts, getForumPost, createForumPost,
  deleteForumPost, addForumComment, deleteForumComment,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ForoPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', content: '' });
  const [saving, setSaving] = useState(false);
  const [comment, setComment] = useState('');
  const [sendingComment, setSendingComment] = useState(false);
  const [error, setError] = useState('');

  const fetchPosts = async () => {
    try { const res = await getForumPosts(); setPosts(res.data); }
    catch { setError('No se pudieron cargar los posts'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPosts(); }, []);

  const openPost = async (id: number) => {
    setDetailLoading(true);
    setSelected({ id });
    try { const res = await getForumPost(id); setSelected(res.data); }
    catch { setError('No se pudo cargar el post'); setSelected(null); }
    finally { setDetailLoading(false); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError('Título y contenido son obligatorios'); return; }
    setSaving(true);
    try {
      await createForumPost(form);
      setShowCreate(false);
      setForm({ title: '', content: '' });
      fetchPosts();
    } catch { setError('No se pudo publicar el post'); }
    finally { setSaving(false); }
  };

  const handleDeletePost = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este post?')) return;
    try { await deleteForumPost(id); setSelected(null); fetchPosts(); }
    catch { setError('No se pudo eliminar'); }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !selected) return;
    setSendingComment(true);
    try {
      const res = await addForumComment(selected.id, comment.trim());
      setSelected((prev: any) => ({ ...prev, comments: res.data }));
      setComment('');
    } catch { setError('No se pudo enviar el comentario'); }
    finally { setSendingComment(false); }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('¿Eliminar este comentario?')) return;
    try {
      await deleteForumComment(selected.id, commentId);
      setSelected((prev: any) => ({ ...prev, comments: prev.comments.filter((c: any) => c.id !== commentId) }));
    } catch { setError('No se pudo eliminar el comentario'); }
  };

  if (selected) return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => setSelected(null)}
        className="flex items-center gap-1.5 text-sm font-medium mb-4 hover:opacity-80" style={{ color: 'var(--primary)' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Foro
      </button>

      {detailLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="rounded-xl border p-6 mb-4" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-3 mb-4">
              <Avatar name={selected.author_name} photo={selected.author_photo} size={40} />
              <div className="flex-1">
                <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{selected.author_name}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {selected.created_at ? new Date(selected.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : ''}
                </p>
              </div>
              {(user?.id === selected.user_id || user?.role === 'admin') && (
                <button onClick={() => handleDeletePost(selected.id)}
                  className="p-2 rounded-lg transition-opacity hover:opacity-80"
                  style={{ color: 'var(--open)', background: 'var(--open-bg)' }}>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              )}
            </div>
            <h1 className="text-xl font-bold mb-3" style={{ color: 'var(--text)' }}>{selected.title}</h1>
            <div className="border-t pt-4" style={{ borderColor: 'var(--border)' }}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{selected.content}</p>
            </div>
          </div>

          <div className="rounded-xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-4" style={{ color: 'var(--text-sub)' }}>
              {selected.comments?.length || 0} respuesta{selected.comments?.length !== 1 ? 's' : ''}
            </p>

            {selected.comments?.map((c: any) => (
              <div key={c.id} className="flex gap-3 pb-4 mb-4 border-b last:border-0 last:pb-0 last:mb-0"
                style={{ borderColor: 'var(--border-light)' }}>
                <Avatar name={c.user_name} photo={c.user_photo} size={34} />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <div>
                      <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{c.user_name}</span>
                      <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                        {new Date(c.created_at).toLocaleString('es-ES')}
                      </span>
                    </div>
                    {(user?.id === c.user_id || user?.role === 'admin') && (
                      <button onClick={() => handleDeleteComment(c.id)}
                        className="p-1 hover:opacity-70" style={{ color: 'var(--text-muted)' }}>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--text)' }}>{c.message}</p>
                </div>
              </div>
            ))}

            <form onSubmit={handleComment} className="flex gap-2 mt-4">
              <input
                className="flex-1 border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                style={{ borderColor: 'var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
                placeholder="Escribe una respuesta..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
              <button type="submit" disabled={sendingComment || !comment.trim()}
                className="px-4 py-2 rounded-lg font-semibold text-sm text-white disabled:opacity-50"
                style={{ background: 'var(--primary)' }}>
                {sendingComment ? '...' : 'Responder'}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Foro</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-sub)' }}>Ayuda y experiencias de la comunidad</p>
        </div>
        <button onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)' }}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Publicar
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg text-sm" style={{ background: 'var(--open-bg)', color: 'var(--open)' }}>
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
          </svg>
          <p className="font-semibold text-base" style={{ color: 'var(--text)' }}>Todavía no hay posts</p>
          <p className="text-sm">¡Sé el primero en compartir tu experiencia!</p>
          <button onClick={() => setShowCreate(true)}
            className="mt-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white"
            style={{ background: 'var(--primary)' }}>
            Crear el primer post
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <button key={p.id} onClick={() => openPost(p.id)}
              className="w-full p-5 rounded-xl border text-left hover:shadow-md transition-shadow"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3 mb-3">
                <Avatar name={p.author_name} photo={p.author_photo} size={36} />
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>{p.author_name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {new Date(p.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-full"
                  style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
                  </svg>
                  {p.comment_count}
                </span>
              </div>
              <p className="font-bold text-base mb-1.5" style={{ color: 'var(--text)' }}>{p.title}</p>
              <p className="text-sm line-clamp-2" style={{ color: 'var(--text-sub)' }}>{p.content}</p>
            </button>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl p-6" style={{ background: 'var(--surface)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>Nueva publicación</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>Título *</label>
                <input className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                  placeholder="¿Sobre qué quieres hablar?"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>Descripción *</label>
                <textarea className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
                  style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
                  rows={5} placeholder="Cuéntanos tu experiencia, pregunta o truco..."
                  value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
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
                  {saving ? '...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ name, photo, size = 36 }: { name?: string; photo?: string; size?: number }) {
  const initials = name?.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  if (photo) return <img src={photo} alt="" className="rounded-full object-cover shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full flex items-center justify-center font-bold shrink-0"
      style={{ width: size, height: size, background: 'var(--primary-light)', color: 'var(--primary)', fontSize: size * 0.38 }}>
      {initials}
    </div>
  );
}
