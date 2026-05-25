import React from 'react';
const StatCard = ({ title, value, icon: Icon, colorClass, glowClass }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl glass p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${glowClass}`}>
      {/* Decorative top gradient border */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClass}`} />
      
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold tracking-wider uppercase text-slate-400">
            {title}
          </span>
          <h3 className="mt-2 text-3xl font-black tracking-tight text-white">
            {value}
          </h3>
        </div>
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-white/[0.03] border border-white/5`}>
          <Icon className="w-6 h-6 text-slate-300" />
        </div>
      </div>
    </div>
  );
};
export default StatCard;
