/**
 * CollapsibleSection Component
 * 
 * A mobile-friendly collapsible section that can be expanded/collapsed
 * to reduce scrolling on small screens. Automatically expanded on larger screens.
 */

import React, { useState } from 'react';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  alwaysExpanded?: boolean; // For desktop - always show expanded
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  children,
  defaultExpanded = false,
  alwaysExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const toggleExpanded = () => {
    if (!alwaysExpanded) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header - clickable on mobile */}
      <button
        type="button"
        onClick={toggleExpanded}
        className={`w-full px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between text-left transition-colors ${
          alwaysExpanded ? 'cursor-default' : 'hover:bg-gray-50 active:bg-gray-100 lg:cursor-default lg:hover:bg-white'
        }`}
        aria-expanded={alwaysExpanded || isExpanded}
        aria-label={`${isExpanded || alwaysExpanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
          {title}
        </h2>
        {!alwaysExpanded && (
          <svg
            className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-500 transition-transform lg:hidden ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        )}
      </button>

      {/* Content - collapsible on mobile, always visible on desktop */}
      <div
        className={`${
          alwaysExpanded || isExpanded ? 'block' : 'hidden'
        } lg:block px-4 sm:px-6 pb-4 sm:pb-6`}
      >
        {children}
      </div>
    </div>
  );
};

export default CollapsibleSection;
