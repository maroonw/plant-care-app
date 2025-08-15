import { useState } from 'react';
import { createPortal } from 'react-dom';
import { toast } from 'react-hot-toast';
import useMyPlants from '../hooks/useMyPlants';

export default function AddToMyPlantsModal({ plant, onClose }) {
  const { add } = useMyPlants();
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    try {
      setSubmitting(true);
      await add(plant, { nickname, notes });
      toast.success('Added to My Plants');
      onClose?.();
    } catch (err) {
      console.error(err);
      toast.error('Could not add to My Plants');
    } finally {
      setSubmitting(false);
    }
  };

  // Render everything into <body> so it's not inside any <Link>
  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose} // click outside closes
      onMouseDown={(e) => e.stopPropagation()}
      onClickCapture={(e) => e.stopPropagation()}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}    // prevent bubbling to overlay
        onMouseDown={(e) => e.stopPropagation()} // and to any parent Link
      >
        <h2 className="text-xl font-semibold text-green-800 mb-4">Add to My Plants</h2>
        <p className="text-sm text-gray-600 mb-3">{plant?.name}</p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nickname (optional)</label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="e.g., Living Room Monstera"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              className="mt-1 w-full border rounded-lg px-3 py-2"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Water on Sundays; repot next spring"
            />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? 'Adding…' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

