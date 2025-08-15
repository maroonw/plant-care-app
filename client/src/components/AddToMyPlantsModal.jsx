import { useState } from 'react';
import ModalBase from './ModalBase';

export default function AddToMyPlantsModal({ plant, onAdd, onClose }) {
  const [nickname, setNickname] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onAdd({ nickname, notes }); // parent wires this to useMyPlants.add(plant, { ... })
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalBase onClose={onClose}>
      <h2 className="text-lg font-semibold text-green-800 mb-2">Add to My Plants</h2>
      <p className="text-sm text-gray-600 mb-4">{plant?.name}</p>

      <div className="text-xs text-gray-600 mb-4 space-y-1">
        <div>Recommended watering every <strong>{plant?.wateringFrequencyDays ?? 7}</strong> days</div>
        <div>Recommended fertilizing every <strong>{plant?.fertilizingFrequencyDays ?? 30}</strong> days</div>
        <div className="text-gray-500">You can edit these later in “Edit Schedule”.</div>
      </div>

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium mb-1">Nickname (optional)</label>
          <input
            className="w-full border rounded px-3 py-2"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g., Monty"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notes (optional)</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Where it lives, light, quirks…"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" className="px-4 py-2 rounded-lg border" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
            {saving ? 'Adding…' : 'Add plant'}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
