import React, { useEffect, useState } from 'react';
import api from '../api';

export default function BlogIndex() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const r = await api.get('/content/list', { params: { type: 'blog' } });
        setItems(r.data || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-green-900 mb-6">Blog</h1>
      {items.length === 0 ? (
        <div className="text-gray-600">No posts yet.</div>
      ) : (
        <ul className="space-y-3">
          {items.map(p => {
            const slug = p.slug;
            return (
              <li key={slug} className="bg-white rounded shadow p-4">
                <a
                  href={`/blog/${slug}`} // server-rendered page
                  className="text-green-700 hover:underline text-lg font-semibold"
                >
                  {p.title || slug}
                </a>
                {p.description && <p className="text-gray-600 mt-1">{p.description}</p>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
