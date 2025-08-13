import React, { useEffect, useState } from 'react';
import api from '../../api';
import { toast } from 'react-hot-toast';

export default function AdminContentAssets() {
  const [type, setType] = useState('blog'); // 'blog' | 'care'
  const [slug, setSlug] = useState('');
  const [files, setFiles] = useState([]);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [working, setWorking] = useState(false);

  const canLoad = type && slug;

  const load = async () => {
    if (!canLoad) return;
    try {
      setLoading(true);
      const r = await api.get(`/content/${type}/${slug}/assets`);
      setList(r.data || []);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [type, slug]);

  const onUpload = async (e) => {
    e.preventDefault();
    if (!files.length || !canLoad) return;
    try {
      setWorking(true);
      const fd = new FormData();
      for (const f of files) fd.append('files', f);
      const r = await api.post(`/content/${type}/${slug}/assets`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success(`Uploaded ${r.data?.uploaded?.length || 0} file(s)`);
      setFiles([]);
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Upload failed');
    } finally {
      setWorking(false);
    }
  };

  const remove = async (filename) => {
    if (!window.confirm('Delete this file?')) return;
    try {
      setWorking(true);
      await api.delete(`/content/${type}/${slug}/assets/${encodeURIComponent(filename)}`);
      toast.success('Deleted');
      await load();
    } catch (e) {
      console.error(e);
      toast.error('Delete failed');
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-green-900 mb-4">Content Assets</h1>

      <div className="bg-white rounded-xl shadow p-4 space-y-3 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select value={type} onChange={(e)=>setType(e.target.value)} className="w-full border rounded px-3 py-2">
              <option value="blog">Blog</option>
              <option value="care">Care</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              value={slug}
              onChange={(e)=>setSlug(e.target.value)}
              placeholder="e.g. why-snake-plant-belongs-in-your-home"
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>

        <form onSubmit={onUpload} className="flex items-center gap-3">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e)=>setFiles(Array.from(e.target.files || []))}
          />
          <button
            type="submit"
            disabled={!files.length || !canLoad || working}
            className="bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
          >
            {working ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="text-xl font-semibold mb-3">Files {loading && <span className="text-sm text-gray-500">(loading…)</span>}</h2>
        {list.length === 0 ? (
          <div className="text-gray-600">No files yet.</div>
        ) : (
          <ul className="space-y-2">
            {list.map(f => (
              <li key={f.filename} className="flex items-center justify-between">
                <div className="flex-1">
                  <a href={f.url} target="_blank" rel="noreferrer" className="text-green-700 hover:underline">{f.filename}</a>
                  <div className="text-xs text-gray-500">{f.url}</div>
                </div>
                <button
                  onClick={()=>remove(f.filename)}
                  disabled={working}
                  className="ml-3 bg-red-600 text-white px-3 py-1 rounded disabled:opacity-50"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-6 text-sm text-gray-600">
        Use these URLs in your markdown, e.g.:<br/>
        <code>![](/content-assets/{'{'}type{'}'}/{'{'}slug{'}'}/your-file.jpg)</code>
      </div>
    </div>
  );
}
