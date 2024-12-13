type UnsavedModalProps = {
  onClose: () => void;
  onSave: () => void;
  onContinue: () => void;
};

function UnsavedModal({ onClose, onSave, onContinue }: UnsavedModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 font-montserrat">
      <div className="relative flex w-1/3 flex-col justify-center rounded-lg bg-white px-6 py-16   text-center shadow-lg">
        <button
          onClick={onClose}
          className="absolute right-4 top-2 text-3xl  font-bold text-gray-600 hover:text-gray-900"
        >
          ×
        </button>
        <h3 className="mb-6 text-xl font-semibold lg:text-2xl">
          You have unsaved changes!
        </h3>
        <p className="my-4 text-gray-700">Continue with or without saving?</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onContinue}
            className="rounded bg-gray-400 px-4 py-2 font-bold text-white hover:bg-gray-600"
          >
            Continue
          </button>
          <button
            autoFocus
            onClick={onSave}
            className="rounded bg-northeastern-red px-4  py-2 font-bold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-black"
          >
            Save and Continue
          </button>
        </div>
      </div>
    </div>
  );
}
export default UnsavedModal;
