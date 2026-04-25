import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import StaffLayout from '@/components/layouts/StaffLayout';
import { apiCall } from '@/api/heruClient';
import { FileText, Edit, Eye, EyeOff, Save, X, Plus } from 'lucide-react';

export default function StaffCMS() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editingSlug, setEditingSlug] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [editVisible, setEditVisible] = useState(true);

  React.useEffect(() => {
    const token = localStorage.getItem('heru_staff_token');
    const expires = localStorage.getItem('heru_staff_expires');
    if (!token || !expires || new Date(expires) < new Date()) {
      localStorage.removeItem('heru_staff_token');
      localStorage.removeItem('heru_staff_expires');
      navigate('/admin', { replace: true });
    }
  }, [navigate]);

  const { data: rawPages = [], isLoading } = useQuery({
    queryKey: ['staff-cms-pages'],
    queryFn: () => apiCall('/cms'),
    staleTime: 30_000,
  });

  const pages = Array.isArray(rawPages) ? rawPages : rawPages.data || [];

  const saveMutation = useMutation({
    mutationFn: ({ slug, content, is_visible }) =>
      apiCall(`/cms/${slug}`, { method: 'PUT', body: { content, is_visible } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff-cms-pages'] });
      setEditingSlug(null);
    },
  });

  function startEdit(page) {
    setEditingSlug(page.slug);
    setEditContent(page.content || '');
    setEditVisible(page.is_visible !== false);
  }

  return (
    <StaffLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">CMS Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Edit homepage copy, pricing text, and feature descriptions.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-gray-400">Loading pages...</div>
          ) : pages.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <FileText className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No CMS pages yet.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Slug</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Visible</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Updated</th>
                  <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pages.map((page) => (
                  <tr key={page.slug} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5">
                      <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{page.slug}</code>
                    </td>
                    <td className="px-6 py-3.5 text-sm text-gray-900">{page.title || page.slug}</td>
                    <td className="px-6 py-3.5">
                      {page.is_visible !== false ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-600"><Eye className="w-3.5 h-3.5" /> Visible</span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gray-400"><EyeOff className="w-3.5 h-3.5" /> Hidden</span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-xs text-gray-500">
                      {page.updated_at ? new Date(page.updated_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button
                        onClick={() => startEdit(page)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-50 text-gray-700 hover:bg-gray-100 transition border border-gray-200"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Edit modal */}
        {editingSlug && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setEditingSlug(null)} />
            <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h3 className="text-base font-semibold text-gray-900">
                  Editing: <code className="text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded">{editingSlug}</code>
                </h3>
                <button onClick={() => setEditingSlug(null)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none font-mono"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editVisible}
                    onChange={(e) => setEditVisible(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">Visible on site</span>
                </label>
              </div>
              <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                <button onClick={() => setEditingSlug(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                  Cancel
                </button>
                <button
                  onClick={() => saveMutation.mutate({ slug: editingSlug, content: editContent, is_visible: editVisible })}
                  disabled={saveMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {saveMutation.isPending ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StaffLayout>
  );
}
