import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function CarePost() {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/content/get/care/${slug}`); // /api/content/get/care/:slug
        setDoc(res.data);
      } catch (e) {
        setDoc(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) return <div className="p-8 text-center text-green-800">Loading…</div>;
  if (!doc) return <div className="p-8 text-center text-red-600">Guide not found.</div>;

  const { frontmatter, html } = doc;
  return (
    <article className="max-w-3xl mx-auto px-4 py-10 prose prose-green">
      <h1 className="text-3xl font-bold text-green-900">{frontmatter.title}</h1>
      {frontmatter.description && (
        <p className="text-gray-600 mb-4">{frontmatter.description}</p>
      )}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
