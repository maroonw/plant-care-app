import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function EditCareScheduleModal({ userPlant, onSave, onClose }) {
  const cs = userPlant?.careSchedule || {};
  const [isCustom, setIsCustom] = useState(!!cs.isCustom);
  const [watering, setWatering] = useState(cs.wateringFrequencyDays ?? 7);
  const [fertilizing, setFertilizing] = useState(cs.fertilizingFrequencyDays ?? 30);
  const [repot, setRepot] = useState(cs.repotIntervalMonths ?? 18);
  const [rotate, setRotate] = useState(cs.rotateIntervalDays ?? 14);
  const [saving, setSaving] = useState(false);

  // Recommended values could come from the Plant (if you expose them). Fallbacks here:
  const rec = {
    wateringFrequencyDays: 7,
    fertilizingFrequencyDays: 30,
    repotIntervalMonths: 18,
    rotateIntervalDays: 14,
  };

  useEffect(() => {
    // If the user toggles off custom, reset to recommendations
    if (!isCustom) {
      setWatering(rec.wateringFrequencyDays);
      setFertilizing(rec.fertilizingFrequencyDays);
      setRepot(rec.repotIntervalMonths);
      setRotate(rec.rotateIntervalDays);
    }
    // eslint-disable-next-line
  }, [isCustom]);

  const submit = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await onSave({
        isCustom,
        wateringFrequencyDays: Number(watering),
        fertilizingFrequencyDays: Number(fertilizing),
        repotIntervalMonths: Number(repot),
        rotateIntervalDays: Number(rotate),
      });
    } finally {
      setSaving(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold text-green-800 mb-2">Care Schedule</h2>
        <p className="text-sm text-gray-600 mb-4">{userPlant?.plant?.name}</p>

        <form onSubmit={submit} className="space-y-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="accent-green-600"
              checked={isCustom}
              onChange={(e) => setIsCustom(e.target.checked)}
            />
            <span>Use custom schedule (override recommendations)</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium">Watering (days)</div>
              <div className="text-xs text-gray-500 mb-1">Recommended: {rec.wateringFrequencyDays}</div>
              <input type="number" min="1" disabled={!isCustom} value={watering}
                     onChange={(e) => setWatering(e.target.value)}
                     className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <div className="text-sm font-medium">Fertilizing (days)</div>
              <div className="text-xs text-gray-500 mb-1">Recommended: {rec.fertilizingFrequencyDays}</div>
              <input type="number" min="1" disabled={!isCustom} value={fertilizing}
                     onChange={(e) => setFertilizing(e.target.value)}
                     className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <div className="text-sm font-medium">Repot (months)</div>
              <div className="text-xs text-gray-500 mb-1">Recommended: {rec.repotIntervalMonths}</div>
              <input type="number" min="1" disabled={!isCustom} value={repot}
                     onChange={(e) => setRepot(e.target.value)}
                     className="w-full border rounded px-3 py-2" />
            </div>

            <div>
              <div className="text-sm font-medium">Rotate (days)</div>
              <div className="text-xs text-gray-500 mb-1">Recommended: {rec.rotateIntervalDays}</div>
              <input type="number" min="1" disabled={!isCustom} value={rotate}
                     onChange={(e) => setRotate(e.target.value)}
                     className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">Cancel</button>
            <button type="submit" disabled={saving}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 disabled:opacity-60">
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}
