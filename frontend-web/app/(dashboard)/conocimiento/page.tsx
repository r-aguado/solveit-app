'use client';

import { useEffect, useState } from 'react';
import {
  getKnowledgeArticles, getKnowledgeArticle,
  createKnowledgeArticle, updateKnowledgeArticle,
  deleteKnowledgeArticle, getCategories,
} from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

export default function ConocimientoPage() {
  const { user } = useAuth();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category_id: null as number | null });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetchArticles = async (q = '') => {
    try {
      const res = await getKnowledgeArticles(q ? { q } : {});
      setArticles(res.data);
    } catch { /* silencioso */ }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchArticles(); getCategories().then((r) => setCategories(r.data)).catch(() => {}); }, []);
  useEffect(() => {
    const t = setTimeout(() => fetchArticles(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  const openArticle = async (id: number) => {
    try {
      const res = await getKnowledgeArticle(id);
      setSelected(res.data);
    } catch { setError('No se pudo cargar el artículo'); }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError('Título y contenido son obligatorios'); return; }
    setSaving(true);
    try {
      const res = await createKnowledgeArticle(form);
      setArticles((prev) => [{ ...res.data, category_name: categories.find((c) => c.id === form.category_id)?.name }, ...prev]);
      setShowCreate(false);
      setForm({ title: '', content: '', category_id: null });
    } catch { setError('No se pudo crear el artículo'); }
    finally { setSaving(false); }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.content.trim()) { setError('Título y contenido son obligatorios'); return; }
    setSaving(true);
    try {
      const res = await updateKnowledgeArticle(selected.id, form);
      setSelected({ ...selected, ...res.data });
      setArticles((prev) => prev.map((a) => a.id === selected.id ? { ...a, title: res.data.title } : a));
      setShowEdit(false);
    } catch { setError('No se pudo actualizar el artículo'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este artículo?')) return;
    try {
      await deleteKnowledgeArticle(id);
      setArticles((prev) => prev.filter((a) => a.id !== id));
      setSelected(null);
    } catch { setError('No se pudo eliminar'); }
  };

  const openEdit = () => {
    setForm({ title: selected.title, content: selected.content, category_id: selected.category_id });
    setShowEdit(true);
  };

  if (selected) return (
    <div className="max-w-3xl mx-auto">
      <button onClick={() => setSelected(null)}
        className="flex items-center gap-1.5 text-sm font-medium mb-4 hover:opacity-80" style={{ color: 'var(--primary)' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
        </svg>
        Base de conocimiento
      </button>
      <div className="rounded-xl border p-6" style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
        {selected.category_name && (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
            style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            {selected.category_name}
          </span>
        )}
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text)' }}>{selected.title}</h1>
        <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
          {selected.author_name}
          {selected.created_at ? ` · ${new Date(selected.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}` : ''}
        </p>
        <div className="border-t pt-5 mb-5" style={{ borderColor: 'var(--border)' }}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text)' }}>{selected.content}</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'technician') && (
          <button onClick={openEdit}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-semibold mr-3 transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--primary)', color: 'var(--primary)', background: 'var(--primary-light)' }}>
            Editar artículo
          </button>
        )}
        {user?.role === 'admin' && (
          <button onClick={() => handleDelete(selected.id)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-semibold mt-2 transition-opacity hover:opacity-80"
            style={{ borderColor: 'var(--open)', color: 'var(--open)', background: 'var(--open-bg)' }}>
            Eliminar artículo
          </button>
        )}
      </div>

      {/* Modal edición */}
      {showEdit && (
        <ArticleModal
          title="Editar artículo" form={form} setForm={setForm}
          categories={categories} saving={saving} error={error}
          onSubmit={handleEdit} onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Base de conocimiento</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--text-sub)' }}>Soluciones a problemas frecuentes</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'technician') && (
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm text-white transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Nuevo artículo
          </button>
        )}
      </div>

      <div className="relative mb-5">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
          style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
        </svg>
        <input
          className="w-full max-w-md pl-9 pr-3 py-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderColor: 'var(--border)', background: 'var(--surface)', color: 'var(--text)' }}
          placeholder="Buscar artículos..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : articles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2" style={{ color: 'var(--text-muted)' }}>
          <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          <p>{search ? 'No se encontraron resultados' : 'No hay artículos todavía'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {articles.map((a) => (
            <button key={a.id} onClick={() => openArticle(a.id)}
              className="flex items-center gap-4 p-4 rounded-xl border text-left hover:shadow-md transition-shadow"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: 'var(--primary-light)' }}>
                <svg className="w-5 h-5" style={{ color: 'var(--primary)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{a.title}</p>
                {a.category_name && (
                  <p className="text-xs font-semibold mt-0.5" style={{ color: 'var(--primary)' }}>{a.category_name}</p>
                )}
                <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{a.content}</p>
              </div>
              <svg className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          ))}
        </div>
      )}

      {showCreate && (
        <ArticleModal
          title="Nuevo artículo" form={form} setForm={setForm}
          categories={categories} saving={saving} error={error}
          onSubmit={handleCreate} onClose={() => setShowCreate(false)}
        />
      )}
    </div>
  );
}

function ArticleModal({ title, form, setForm, categories, saving, error, onSubmit, onClose }: any) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ background: 'var(--surface)' }}>
        <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--text)' }}>{title}</h3>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>Título *</label>
            <input className="w-full border rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>Categoría</label>
            <div className="flex flex-wrap gap-2">
              {categories.map((c: any) => (
                <button key={c.id} type="button"
                  onClick={() => setForm({ ...form, category_id: form.category_id === c.id ? null : c.id })}
                  className="px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all"
                  style={{
                    borderColor: form.category_id === c.id ? 'var(--primary)' : 'var(--border)',
                    background: form.category_id === c.id ? 'var(--primary-light)' : 'var(--surface)',
                    color: form.category_id === c.id ? 'var(--primary)' : 'var(--text-sub)',
                  }}>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-sub)' }}>Contenido *</label>
            <textarea className="w-full border rounded-lg px-3 py-2.5 text-sm resize-none outline-none focus:ring-2 focus:ring-blue-500"
              style={{ borderColor: 'var(--border)', background: 'var(--surface-alt)', color: 'var(--text)' }}
              rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          {error && <p className="text-sm px-3 py-2 rounded-lg" style={{ background: 'var(--open-bg)', color: 'var(--open)' }}>{error}</p>}
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
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
    </div>
  );
}
