'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export function CustomDropdown({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "",
  disabled = false,
  ...props 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState('bottom');
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  // Find the selected option's label
  const selectedOption = options.find(opt => opt.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate dropdown position to prevent cutoff
  useEffect(() => {
    if (isOpen && dropdownRef.current && menuRef.current) {
      const buttonRect = dropdownRef.current.getBoundingClientRect();
      const menuHeight = menuRef.current.offsetHeight;
      const viewportHeight = window.innerHeight;
      
      // Check if dropdown would go off the bottom of the viewport
      if (buttonRect.bottom + menuHeight > viewportHeight - 20) {
        setDropdownPosition('top');
      } else {
        setDropdownPosition('bottom');
      }
    }
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 
          bg-black/50 
          border border-purple-500/30 
          rounded-lg 
          text-white 
          text-left
          focus:border-purple-500 
          focus:bg-black/70
          focus:outline-none 
          cursor-pointer
          transition-all
          hover:border-purple-500/50
          disabled:opacity-50
          disabled:cursor-not-allowed
          flex items-center justify-between
          ${className}
        `}
        disabled={disabled}
      >
        <span className={value ? 'text-white' : 'text-gray-400'}>
          {displayValue}
        </span>
        <ChevronDown 
          className={`h-4 w-4 text-purple-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div 
          ref={menuRef}
          className={`
            absolute z-[9999] w-full min-w-max
            ${dropdownPosition === 'bottom' ? 'mt-2 top-full' : 'mb-2 bottom-full'}
            overflow-hidden rounded-lg shadow-2xl 
            animate-in fade-in 
            ${dropdownPosition === 'bottom' ? 'slide-in-from-top-1' : 'slide-in-from-bottom-1'}
          `}
          style={{
            // Ensure dropdown is not constrained by parent overflow
            position: 'absolute',
            zIndex: 9999,
          }}
        >
          {/* Glass effect background */}
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
          
          {/* Purple gradient border */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-500/20 to-pink-500/20 rounded-lg" />
          
          {/* Options container */}
          <div className="relative max-h-60 overflow-auto custom-scrollbar">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                disabled={option.disabled}
                className={`
                  w-full px-4 py-3 
                  text-left 
                  transition-all
                  flex items-center justify-between
                  ${option.value === value 
                    ? 'bg-gradient-to-r from-purple-600/30 to-pink-600/30 text-white' 
                    : 'text-gray-300 hover:bg-purple-500/20 hover:text-white'
                  }
                  ${option.disabled 
                    ? 'opacity-50 cursor-not-allowed' 
                    : 'cursor-pointer'
                  }
                  border-b border-purple-500/10 last:border-0
                `}
              >
                <span>{option.label}</span>
                {option.value === value && (
                  <Check className="h-4 w-4 text-purple-400" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes animate-in {
          from {
            opacity: 0;
            transform: translateY(-4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-in {
          animation: animate-in 0.2s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #9333ea, #ec4899);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(to bottom, #a855f7, #f472b6);
        }
      `}</style>
    </div>
  );
}