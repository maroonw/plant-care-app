// client/src/utils/imgFallback.js
export function withFallback(src, fallback = '/images/placeholder.jpg') {
  return src || fallback;
}
export function onErrorSetFallback(e, fallback = '/images/placeholder.jpg') {
  if (e?.target) {
    e.target.onerror = null;
    e.target.src = fallback;
  }
}
