"use client";

import { StatCard } from "./StatCard";

export function StatGrid({ 
  stats, 
  columns = {
    default: 1,
    sm: 2,
    md: 3,
    lg: 4
  },
  gap = 6,
  className = "",
  stagger = true
}) {
  const columnClasses = {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6"
  };

  const gapClasses = {
    4: "gap-4",
    6: "gap-6",
    8: "gap-8"
  };

  const gridClass = `
    grid 
    ${columnClasses[columns.default] || 'grid-cols-1'}
    ${columns.sm ? `sm:${columnClasses[columns.sm]}` : ''}
    ${columns.md ? `md:${columnClasses[columns.md]}` : ''}
    ${columns.lg ? `lg:${columnClasses[columns.lg]}` : ''}
    ${gapClasses[gap] || 'gap-6'}
    ${stagger ? 'stagger-children' : ''}
    ${className}
  `.trim();

  return (
    <div className={gridClass}>
      {stats.map((stat, index) => (
        <StatCard
          key={stat.id || index}
          {...stat}
          delay={stagger ? index * 100 : 0}
        />
      ))}
    </div>
  );
}