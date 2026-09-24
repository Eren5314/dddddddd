import React from 'react';
import { WeekData, Task, DayOfWeek } from '../types';
import { Plus, Check } from 'lucide-react';

interface DailyKanbanViewProps {
  week: WeekData;
  onToggleTask: (taskId: string) => void;
  onAddTaskForDay: (day: DayOfWeek) => void;
  onEditTask: (task: Task) => void;
}

const DAYS: DayOfWeek[] = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

export const DailyKanbanView: React.FC<DailyKanbanViewProps> = ({
  week,
  onToggleTask,
  onAddTaskForDay,
  onEditTask,
}) => {
  return (
    <div className="space-y-5">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {week.weekNumber}. Hafta Günlük Dağılımı
          </h2>
          <p className="text-xs text-slate-500">
            Haftanın 7 gününe yayılan plan ve görevlerin günlük akış panosu.
          </p>
        </div>
      </div>

      {/* 7 Days Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-3">
        {DAYS.map((day) => {
          const dayTasks = week.tasks.filter((t) => t.day === day);
          const completedDayCount = dayTasks.filter((t) => t.completed).length;

          return (
            <div
              key={day}
              className="bg-white border border-slate-200 rounded-xl p-3 flex flex-col min-h-[220px] shadow-2xs"
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-150">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    {day}
                  </h3>
                  <div className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {completedDayCount}/{dayTasks.length} Görev
                  </div>
                </div>
                <button
                  onClick={() => onAddTaskForDay(day)}
                  className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                  title={`${day} gününe görev ekle`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Tasks in this day */}
              <div className="space-y-2 flex-1">
                {dayTasks.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center p-3 text-[11px] text-slate-400">
                    Planlanan görev yok
                  </div>
                ) : (
                  dayTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => onEditTask(task)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        task.completed
                          ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                          : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleTask(task.id);
                          }}
                          className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center border transition-colors shrink-0 ${
                            task.completed
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-blue-500'
                          }`}
                        >
                          {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </button>
                        <div className="text-xs leading-tight font-medium min-w-0 flex-1">
                          {task.title}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-500">
                        <span>{task.category}</span>
                        {task.timeEstimateMinutes && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono tabular-nums">{task.timeEstimateMinutes} dk</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Bottom Quick Button */}
              <button
                onClick={() => onAddTaskForDay(day)}
                className="mt-3 w-full py-1 text-center text-[11px] font-semibold text-slate-600 hover:text-blue-700 hover:bg-blue-50/80 rounded transition-colors cursor-pointer"
              >
                + Görev Ekle
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
