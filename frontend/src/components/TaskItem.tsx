import React from 'react';
import { ChevronRight, Trash2 } from 'lucide-react';

interface TaskItemProps {
  taskName: string;
  petName: string;
  icon: React.ReactNode;
  iconBgColor: string;
  isCompleted?: boolean;
  onToggle?: () => void;
  onDelete?: () => void;
}

export default function TaskItem({
  taskName,
  petName,
  icon,
  iconBgColor,
  isCompleted = false,
  onToggle,
  onDelete,
}: TaskItemProps) {
  return (
    <div className="flex items-center justify-between bg-white p-3 rounded-2xl mb-3 shadow-sm border border-gray-100">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={onToggle}
          className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
        />
        <div className={`w-10 h-10 flex items-center justify-center rounded-xl ${iconBgColor}`}>
          {icon}
        </div>
        <div>
          <p className={`font-semibold text-sm ${isCompleted ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {taskName}
          </p>
          <p className="text-xs text-gray-500">{petName}</p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            title="Quitar esta actividad"
            className="p-2 text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        )}
        <ChevronRight size={20} className="text-gray-400" />
      </div>
    </div>
  );
}
