import { useEffect, useState } from 'react';
import ModalBase from './ModalBase';

export default function EditMyPlantModal({ userPlant, onSave, onClose }) {
  const [nickname, setNickname] = useState(userPlant?.nickname || '');
  const [notes, setNotes] = useState(userPlant?.notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setNickname(userPlant?.nickname || '');
    setNotes(userPlant?.notes || '');
  }, [userPlant]);

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try { await onSave({ nickname, notes }); }
    finally { setSaving(false); }
  };

  return (
    <ModalBase onClose={onClose}>
      <h2 className="text-xl font-semibold text-green-800 mb-2">Edit Plant</h2>
      <p className="text-sm text-gray-600 mb-4">{userPlant?.plant?.name}</p>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nickname</label>
          <input
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="e.g., Living Room Monstera"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Water on Sundays; repot next spring"
          />
        </div>
        <div className="flex justify-end gap-3">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
          <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </ModalBase>
  );
}
