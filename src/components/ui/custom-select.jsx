'use client';

import { ChevronDown } from 'lucide-react';

export function CustomSelect({ 
  value, 
  onChange, 
  options, 
  placeholder = "Select an option",
  className = "",
  ...props 
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        className={`
          w-full px-4 py-3 
          bg-black/50 
          border border-purple-500/30 
          rounded-lg 
          text-white 
          focus:border-purple-500 
          focus:bg-black/70
          focus:outline-none 
          appearance-none 
          cursor-pointer
          transition-all
          hover:border-purple-500/50
          ${className}
        `}
        style={{
          // Custom dropdown arrow with gradient
          backgroundImage: `
            linear-gradient(45deg, transparent 50%, white 50%),
            linear-gradient(135deg, white 50%, transparent 50%),
            linear-gradient(to right, #9333ea, #ec4899)
          `,
          backgroundPosition: `
            calc(100% - 20px) calc(1em + 2px),
            calc(100% - 15px) calc(1em + 2px),
            100% 0
          `,
          backgroundSize: `
            5px 5px,
            5px 5px,
            2.5em 100%
          `,
          backgroundRepeat: 'no-repeat',
          paddingRight: '3rem'
        }}
        {...props}
      >
        {placeholder && (
          <option value="" className="bg-gray-900 text-gray-400">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="bg-gray-900 text-white"
          >
            {option.label}
          </option>
        ))}
      </select>
      <style jsx>{`
        select option {
          background-color: #111827;
          color: white;
          padding: 0.5rem;
        }
        select option:hover {
          background-color: #1f2937;
        }
        select option:checked {
          background: linear-gradient(to right, #9333ea, #ec4899);
          color: white;
        }
      `}</style>
    </div>
  );
}