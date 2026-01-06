import { useState } from "react";

interface Props {
  title: string;
  initialExpanded?: boolean;
  headerRight?: React.ReactNode; 
  children: React.ReactNode;
}

export default function CollapsibleSection({
  title,
  initialExpanded = false,
  headerRight,
  children,
}: Props) {
  const [expanded, setExpanded] = useState(initialExpanded);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 mt-6">
      <div className="border rounded-xl bg-white shadow-sm">
        {/* HEADER */}
        <button
          onClick={() => setExpanded(prev => !prev)}
          className="w-full flex items-center justify-between px-5 py-4 font-semibold text-left"
        >
          <div className="flex items-center gap-3">
            <span>{title}</span>
            {headerRight}
          </div>

          <span className="text-indigo-600 text-sm">
            {expanded ? "Hide" : "View"}
          </span>
        </button>

        {/* BODY */}
        {expanded && (
          <div className="border-t px-5 py-4 bg-gray-50">
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
