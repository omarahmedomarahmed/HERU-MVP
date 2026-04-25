import React, { useEffect, useState } from 'react';
import { Plus, Briefcase, Trash2, Edit2, X, ExternalLink, Star, ImageOff } from 'lucide-react';
import { Input } from '@/components/ui/input';

function getAuthToken() {
  const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
  return JSON.parse(localStorage.getItem(key) || '{}')?.access_token || '';
}

const PORTFOLIO_TYPES = ['general','tournament','branding','production','event','coaching'];

const EMPTY_FORM = {
  title: '', description: '', type: 'general', client_name: '', tournament_name: '',
  image_url: '', video_url: '', testimonial: '',
  deliverables: [], links: [],
  newDeliverable: '', newLink: '',
};

function PortfolioModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item ? {
    ...EMPTY_FORM, ...item,
    deliverables: item.deliverables || [],
    links: item.links || [],
    newDeliverable: '', newLink: '',
  } : { ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const addDeliverable = () => {
    if (!form.newDeliverable.trim()) return;
    setForm(f => ({ ...f, deliverables: [...f.deliverables, f.newDeliverable.trim()], newDeliverable: '' }));
  };
  const removeDeliverable = (i) => setForm(f => ({ ...f, deliverables: f.deliverables.filter((_, idx) => idx !== i) }));

  const addLink = () => {
    if (!form.newLink.trim()) return;
    setForm(f => ({ ...f, links: [...f.links, { url: f.newLink.trim(), label: '' }], newLink: '' }));
  };
  const removeLink = (i) => setForm(f => ({ ...f, links: f.links.filter((_, idx) => idx !== i) }));

  const handleSave = async () => {
    if (!form.title) { setError('Title is required'); return; }
    setSaving(true); setError('');
    try {
      const payload = {
        title: form.title, description: form.description, type: form.type,
        client_name: form.client_name, tournament_name: form.tournament_name,
        image_url: form.image_url, video_url: form.video_url, testimonial: form.testimonial,
        deliverables: form.deliverables, links: form.links,
      };
      const url = item?.id ? `/api/providers/portfolio/${item.id}` : '/api/providers/portfolio';
      const method = item?.id ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getAuthToken()}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      onSave(data.item);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white font-bold text-lg">{item ? 'Edit Portfolio Item' : 'Add Portfolio Item'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Title *</label>
              <Input value={form.title} onChange={set('title')} placeholder="ELAN Championship Branding" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Type</label>
              <select value={form.type} onChange={set('type')} className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-cyan-500">
                {PORTFOLIO_TYPES.map(t => <option key={t} value={t} className="bg-[#111]">{t}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Client / Organizer</label>
              <Input value={form.client_name} onChange={set('client_name')} placeholder="HERU Esports" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Tournament Name</label>
              <Input value={form.tournament_name} onChange={set('tournament_name')} placeholder="ELAN Season 3" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={3} placeholder="Describe the work you did..." className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 resize-none" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Cover Image URL</label>
              <Input value={form.image_url} onChange={set('image_url')} placeholder="https://..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Video URL (optional)</label>
              <Input value={form.video_url} onChange={set('video_url')} placeholder="https://youtube.com/..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-600" />
            </div>
          </div>
          {/* Deliverables */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Deliverables</label>
            <div className="flex gap-2 mb-2">
              <Input value={form.newDeliverable} onChange={set('newDeliverable')} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addDeliverable())} placeholder="e.g. Full logo package" className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1" />
              <button type="button" onClick={addDeliverable} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm">Add</button>
            </div>
            {form.deliverables.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.deliverables.map((d, i) => (
                  <span key={i} className="flex items-center gap-1 bg-white/10 text-gray-300 text-xs px-2 py-1 rounded-full">
                    {d} <button type="button" onClick={() => removeDeliverable(i)}><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
          {/* Links */}
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Links (portfolio, case study, etc.)</label>
            <div className="flex gap-2 mb-2">
              <Input value={form.newLink} onChange={set('newLink')} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addLink())} placeholder="https://behance.net/project/..." className="bg-white/5 border-white/10 text-white placeholder:text-gray-600 flex-1" />
              <button type="button" onClick={addLink} className="px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm">Add</button>
            </div>
            {form.links.length > 0 && (
              <div className="space-y-1">
                {form.links.map((l, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-cyan-400 bg-white/5 px-2 py-1 rounded">
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    <span className="flex-1 truncate">{l.url}</span>
                    <button type="button" onClick={() => removeLink(i)} className="text-gray-500 hover:text-red-400"><X className="w-3 h-3" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* Testimonial */}
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Client Testimonial</label>
            <textarea value={form.testimonial} onChange={set('testimonial')} rows={2} placeholder="What did the client say about your work?" className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm placeholder:text-gray-600 focus:outline-none focus:border-cyan-500 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 p-6 border-t border-white/10">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-semibold transition-colors disabled:opacity-50">{saving ? 'Saving...' : 'Save'}</button>
        </div>
      </div>
    </div>
  );
}

export default function ProviderPortfolio() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | item object
  const [viewItem, setViewItem] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetch('/api/providers/me', { headers: { 'Authorization': `Bearer ${getAuthToken()}` } })
      .then(r => r.json())
      .then(d => setItems(d.provider?.provider_portfolio_items || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaved = (item) => {
    setItems(prev => {
      const idx = prev.findIndex(i => i.id === item.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = item; return next; }
      return [item, ...prev];
    });
    setModal(null);
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await fetch(`/api/providers/portfolio/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${getAuthToken()}` } });
      setItems(prev => prev.filter(i => i.id !== id));
    } catch {}
    setDeleting(null);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-gray-400 mt-1">Showcase your past work to attract organizers</p>
        </div>
        <button onClick={() => setModal('new')} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Add Work
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-48 bg-white/5 rounded-xl animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="bg-white/5 border border-white/10 rounded-xl p-12 text-center">
          <Briefcase className="w-12 h-12 text-gray-600 mx-auto mb-4 opacity-40" />
          <p className="text-gray-400 mb-4">No portfolio items yet</p>
          <button onClick={() => setModal('new')} className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Add your first work
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden group">
              <div className="relative h-40 bg-white/5 overflow-hidden cursor-pointer" onClick={() => setViewItem(item)}>
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" onError={e => { e.target.style.display='none'; }} />
                ) : (
                  <div className="flex items-center justify-center h-full"><ImageOff className="w-10 h-10 text-gray-700" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="absolute top-2 right-2 bg-black/50 text-xs text-gray-300 px-2 py-0.5 rounded-full capitalize">{item.type}</span>
              </div>
              <div className="p-4">
                <h3 className="text-white font-semibold mb-1 truncate">{item.title}</h3>
                {item.client_name && <p className="text-xs text-gray-500 mb-1">{item.client_name}</p>}
                {item.description && <p className="text-gray-400 text-sm line-clamp-2 mb-3">{item.description}</p>}
                {item.testimonial && (
                  <div className="flex items-start gap-1.5 bg-white/5 rounded-lg p-2 mb-3">
                    <Star className="w-3 h-3 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-300 text-xs italic line-clamp-2">{item.testimonial}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setViewItem(item)} className="flex-1 py-1.5 text-xs rounded-lg bg-white/10 hover:bg-white/15 text-white transition-colors">View</button>
                  <button onClick={() => setModal(item)} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id} className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors disabled:opacity-50"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View modal */}
      {viewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
          <div className="bg-[#0f0f0f] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {viewItem.image_url && (
              <div className="h-56 overflow-hidden rounded-t-2xl">
                <img src={viewItem.image_url} alt={viewItem.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-xs text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full capitalize mb-2 inline-block">{viewItem.type}</span>
                  <h2 className="text-xl font-bold text-white">{viewItem.title}</h2>
                  {viewItem.client_name && <p className="text-gray-400 text-sm mt-0.5">Client: {viewItem.client_name}</p>}
                  {viewItem.tournament_name && <p className="text-gray-400 text-sm mt-0.5">Tournament: {viewItem.tournament_name}</p>}
                </div>
                <button onClick={() => setViewItem(null)} className="text-gray-400 hover:text-white ml-4"><X className="w-5 h-5" /></button>
              </div>
              {viewItem.description && <p className="text-gray-300 text-sm mb-4 leading-relaxed">{viewItem.description}</p>}
              {viewItem.deliverables?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-white text-sm font-semibold mb-2">Deliverables</h4>
                  <ul className="space-y-1">
                    {viewItem.deliverables.map((d, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-300 text-sm"><span className="w-1.5 h-1.5 rounded-full bg-cyan-400 flex-shrink-0" />{d}</li>
                    ))}
                  </ul>
                </div>
              )}
              {viewItem.links?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-white text-sm font-semibold mb-2">Links</h4>
                  <div className="space-y-1">
                    {viewItem.links.map((l, i) => (
                      <a key={i} href={l.url || l} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />{l.label || l.url || l}
                      </a>
                    ))}
                  </div>
                </div>
              )}
              {viewItem.testimonial && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mt-2">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-yellow-300 text-sm font-semibold">Client Testimonial</span>
                  </div>
                  <p className="text-gray-300 text-sm italic">"{viewItem.testimonial}"</p>
                </div>
              )}
              {viewItem.video_url && (
                <a href={viewItem.video_url} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors">
                  <ExternalLink className="w-4 h-4" /> View Video
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {modal && (
        <PortfolioModal
          item={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSaved}
        />
      )}
    </div>
  );
}
