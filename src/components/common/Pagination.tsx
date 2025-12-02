import React from 'react';

type Props = {
  page: number;
  totalPages: number | null;
  hasNext?: boolean | null;
  hasPrev?: boolean | null;
  onPageChange: (page: number) => void;
  windowSize?: number; // number of visible page buttons
};

export default function Pagination({ page, totalPages, hasNext = null, hasPrev = null, onPageChange, windowSize = 5 }: Props) {
  if (totalPages == null) {
    // unknown total — render simple previous/next
    const disablePrev = hasPrev === false || page <= 1;
    const disableNext = hasNext === false;
    return (
      <div className="flex items-center space-x-2">
        <button
          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={disablePrev}
        >
          Previous
        </button>
        <button
          className="px-3 py-1 bg-gray-100 rounded disabled:opacity-50"
          onClick={() => onPageChange(page + 1)}
          disabled={disableNext}
        >
          Next
        </button>
      </div>
    );
  }

  const windowSz = Math.max(3, windowSize);
  const half = Math.floor(windowSz / 2);
  let start = Math.max(1, page - half);
  let end = Math.min(totalPages, start + windowSz - 1);
  if (end - start + 1 < windowSz) {
    start = Math.max(1, end - windowSz + 1);
  }

  const buttons: React.ReactNode[] = [];
  if (start > 1) {
    buttons.push(
      <button key="first" onClick={() => onPageChange(1)} className="px-2 py-1 rounded bg-gray-100">1</button>
    );
    if (start > 2) buttons.push(<span key="dots1" className="px-2">...</span>);
  }

  for (let i = start; i <= end; i++) {
    buttons.push(
      <button
        key={i}
        onClick={() => onPageChange(i)}
        aria-current={i === page}
        className={`px-3 py-1 rounded ${i === page ? 'bg-blue-600 text-white' : 'bg-gray-100'}`}
      >
        {i}
      </button>
    );
  }

  if (end < totalPages) {
    if (end < totalPages - 1) buttons.push(<span key="dots2" className="px-2">...</span>);
    buttons.push(
      <button key="last" onClick={() => onPageChange(totalPages)} className="px-2 py-1 rounded bg-gray-100">{totalPages}</button>
    );
  }

  return (
    <div className="flex items-center space-x-1">{buttons}</div>
  );
}
