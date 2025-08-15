import ModalBase from './ModalBase';
export default function ConfirmModal({ title, message, confirmText = 'Confirm', onConfirm, onClose }) {
  return (
    <ModalBase onClose={onClose}>
      <h2 className="text-lg font-semibold text-green-800">{title}</h2>
      <p className="text-sm text-gray-700 mt-2">{message}</p>
      <div className="flex justify-end gap-3 mt-5">
        <button className="px-4 py-2 rounded-lg border" onClick={onClose}>Cancel</button>
        <button className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700" onClick={onConfirm}>
          {confirmText}
        </button>
      </div>
    </ModalBase>
  );
}
