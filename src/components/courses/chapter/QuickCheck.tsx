import React from 'react';

interface QuickCheckProps {
  title?: string;
  message?: string;
  onClose: () => void;
  closeLabel?: string;
}

const QuickCheck: React.FC<QuickCheckProps> = ({ title = 'Quick check', message = "You've been watching for a while — take a short break or continue when ready.", onClose, closeLabel = 'Close' }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-sm text-gray-700">{message}</p>
      <div className="flex justify-end">
        <button onClick={onClose} className="px-3 py-1 bg-indigo-600 text-white rounded">{closeLabel}</button>
      </div>
    </div>
  );
};

export default QuickCheck;
