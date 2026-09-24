import React, { useState, useEffect } from 'react';
import { WeekData, Task, UserProfile, DayOfWeek, WeekStatus } from './types';
import { initialWeeks, initialUserProfile } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { TaskListView } from './components/TaskListView';
import { DailyKanbanView } from './components/DailyKanbanView';
import { WeeklyNotesAndResources } from './components/WeeklyNotesAndResources';
import { FocusTimer } from './components/FocusTimer';
import { ProgressStats } from './components/ProgressStats';
import { TaskModal } from './components/TaskModal';
import { WeekModal } from './components/WeekModal';
import { ProfileModal } from './components/ProfileModal';

const STORAGE_KEY_WEEKS = 'eren_roadmap_weeks_v4';
const STORAGE_KEY_USER = 'eren_roadmap_user_v4';
const STORAGE_KEY_SELECTED_WEEK = 'eren_roadmap_active_week_id_v4';

export default function App() {
  // Load state from localStorage or fallback
  const [weeks, setWeeks] = useState<WeekData[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_WEEKS);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load weeks from storage', e);
    }
    return initialWeeks;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name === 'Eren') {
          parsed.name = 'Eren Pehlivan';
        }
        return { ...initialUserProfile, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load user profile from storage', e);
    }
    return initialUserProfile;
  });

  const [selectedWeekId, setSelectedWeekId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SELECTED_WEEK);
    if (saved && initialWeeks.some((w) => w.id === saved)) {
      return saved;
    }
    const inProg = initialWeeks.find((w) => w.status === 'in_progress');
    return inProg ? inProg.id : initialWeeks[0]?.id || 'week-1';
  });

  const [activeTab, setActiveTab] = useState<string>('tasks'); // 'tasks', 'daily', 'notes', 'timer', 'stats'
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskModalDefaultDay, setTaskModalDefaultDay] = useState<DayOfWeek>('Pazartesi');

  const [isWeekModalOpen, setIsWeekModalOpen] = useState(false);
  const [editingWeek, setEditingWeek] = useState<WeekData | null>(null);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WEEKS, JSON.stringify(weeks));
    } catch (e) {
      console.error('Failed to save weeks', e);
    }
  }, [weeks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user', e);
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_SELECTED_WEEK, selectedWeekId);
  }, [selectedWeekId]);

  // Selected week object
  const selectedWeek = weeks.find((w) => w.id === selectedWeekId) || weeks[0] || null;

  // Global calculations
  const totalTasks = weeks.reduce((sum, w) => sum + w.tasks.length, 0);
  const completedTasks = weeks.reduce(
    (sum, w) => sum + w.tasks.filter((t) => t.completed).length,
    0
  );
  const totalMinutes = weeks.reduce((sum, w) => sum + (w.studyMinutesLogged || 0), 0);

  // Task actions
  const handleToggleTask = (taskId: string) => {
    setWeeks((prev) =>
      prev.map((w) => {
        if (!w.tasks.some((t) => t.id === taskId)) return w;
        return {
          ...w,
          tasks: w.tasks.map((t) =>
            t.id === taskId
              ? {
                  ...t,
                  completed: !t.completed,
                  completedAt: !t.completed ? new Date().toISOString() : undefined,
                }
              : t
          ),
        };
      })
    );
  };

  const handleSaveTask = (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (!selectedWeek) return;

    if (editingTask) {
      setWeeks((prev) =>
        prev.map((w) => {
          if (w.id !== selectedWeek.id) return w;
          return {
            ...w,
            tasks: w.tasks.map((t) =>
              t.id === editingTask.id ? { ...t, ...taskData } : t
            ),
          };
        })
      );
    } else {
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        completed: false,
      };

      setWeeks((prev) =>
        prev.map((w) => {
          if (w.id !== selectedWeek.id) return w;
          return {
            ...w,
            tasks: [...w.tasks, newTask],
          };
        })
      );
    }
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (!selectedWeek) return;
    setWeeks((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWeek.id) return w;
        return {
          ...w,
          tasks: w.tasks.filter((t) => t.id !== taskId),
        };
      })
    );
  };

  const handleQuickAddTask = (title: string) => {
    if (!selectedWeek) return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title,
      completed: false,
      day: 'Pazartesi',
      category: 'Çalışma',
      priority: 'Orta',
      timeEstimateMinutes: 30,
    };
    setWeeks((prev) =>
      prev.map((w) => {
        if (w.id !== selectedWeek.id) return w;
        return {
          ...w,
          tasks: [...w.tasks, newTask],
        };
      })
    );
  };

  // Week actions
  const handleSaveWeek = (data: {
    weekNumber: number;
    title: string;
    theme: string;
    status: WeekStatus;
    driveUrl?: string;
  }) => {
    if (editingWeek) {
      setWeeks((prev) =>
        prev.map((w) =>
          w.id === editingWeek.id
            ? {
                ...w,
                weekNumber: data.weekNumber,
                title: data.title,
                theme: data.theme,
                status: data.status,
                driveUrl: data.driveUrl,
              }
            : w
        )
      );
    } else {
      const newWeek: WeekData = {
        id: `week-${Date.now()}`,
        weekNumber: data.weekNumber,
        title: data.title,
        theme: data.theme,
        startDate: `${data.weekNumber}. Hafta`,
        endDate: '7 Gün',
        status: data.status,
        studyMinutesLogged: 0,
        tasks: [],
        notes: '',
        resources: [],
        driveUrl: data.driveUrl,
      };
      setWeeks((prev) => {
        const updated = [...prev, newWeek].sort((a, b) => a.weekNumber - b.weekNumber);
        return updated;
      });
      setSelectedWeekId(newWeek.id);
      setActiveTab('tasks');
    }
    setEditingWeek(null);
  };

  const handleUpdateDriveUrl = (weekId: string, driveUrl: string) => {
    setWeeks((prev) =>
      prev.map((w) => (w.id === weekId ? { ...w, driveUrl: driveUrl.trim() || undefined } : w))
    );
  };

  const handleDeleteWeek = (weekId: string) => {
    setWeeks((prev) => {
      const remaining = prev.filter((w) => w.id !== weekId);
      if (selectedWeekId === weekId && remaining.length > 0) {
        setSelectedWeekId(remaining[0].id);
      }
      return remaining;
    });
  };

  // Notes & Resources
  const handleUpdateNotes = (notes: string) => {
    if (!selectedWeek) return;
    setWeeks((prev) =>
      prev.map((w) => (w.id === selectedWeek.id ? { ...w, notes } : w))
    );
  };

  const handleUpdateRating = (rating: number) => {
    if (!selectedWeek) return;
    setWeeks((prev) =>
      prev.map((w) => (w.id === selectedWeek.id ? { ...w, rating } : w))
    );
  };

  const handleUpdateRetrospective = (retrospective: {
    highlights: string;
    challenges: string;
    nextWeekFocus: string;
  }) => {
    if (!selectedWeek) return;
    setWeeks((prev) =>
      prev.map((w) => (w.id === selectedWeek.id ? { ...w, retrospective } : w))
    );
  };

  const handleAddResource = (resource: any) => {
    if (!selectedWeek) return;
    const newRes = {
      ...resource,
      id: `res-${Date.now()}`,
    };
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === selectedWeek.id ? { ...w, resources: [...w.resources, newRes] } : w
      )
    );
  };

  const handleDeleteResource = (resourceId: string) => {
    if (!selectedWeek) return;
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === selectedWeek.id
          ? { ...w, resources: w.resources.filter((r) => r.id !== resourceId) }
          : w
      )
    );
  };

  const handleLogStudyMinutes = (weekId: string, minutes: number) => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === weekId
          ? { ...w, studyMinutesLogged: (w.studyMinutesLogged || 0) + minutes }
          : w
      )
    );
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify({ user, weeks }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${user.name.toLowerCase()}_haftalik_plan_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    localStorage.removeItem(STORAGE_KEY_WEEKS);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_SELECTED_WEEK);
    setWeeks(initialWeeks);
    setUser(initialUserProfile);
    setSelectedWeekId('week-1');
  };

  const highestWeekNumber = weeks.reduce((max, w) => Math.max(max, w.weekNumber), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased">
      {/* Left Sidebar with all weeks (1. Hafta, 2. Hafta, ...) */}
      <Sidebar
        weeks={weeks}
        selectedWeekId={selectedWeekId}
        onSelectWeek={(id) => {
          setSelectedWeekId(id);
          if (activeTab === 'stats') {
            setActiveTab('tasks');
          }
        }}
        onAddWeek={() => {
          setEditingWeek(null);
          setIsWeekModalOpen(true);
        }}
        onEditWeek={(w) => {
          setEditingWeek(w);
          setIsWeekModalOpen(true);
        }}
        onDeleteWeek={handleDeleteWeek}
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsProfileModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area (offset by left sidebar on desktop) */}
      <div className="lg:pl-72 flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onAddTask={() => {
            setEditingTask(null);
            setTaskModalDefaultDay('Pazartesi');
            setIsTaskModalOpen(true);
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          onOpenSettings={() => setIsProfileModalOpen(true)}
          currentWeek={selectedWeek}
          userName={user.name}
        />

        {/* Main Body */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Hero Banner for Eren */}
          <HeroBanner
            user={user}
            currentWeek={selectedWeek}
            totalWeeksCount={weeks.length}
            totalTasks={totalTasks}
            completedTasks={completedTasks}
            totalMinutes={totalMinutes}
            onSelectWeek={(id) => {
              setSelectedWeekId(id);
              setActiveTab('tasks');
            }}
            onEditProfile={() => setIsProfileModalOpen(true)}
          />

          {/* Active Tab View */}
          {activeTab === 'tasks' && selectedWeek && (
            <TaskListView
              week={selectedWeek}
              onToggleTask={handleToggleTask}
              onAddTask={() => {
                setEditingTask(null);
                setTaskModalDefaultDay('Pazartesi');
                setIsTaskModalOpen(true);
              }}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
              onDeleteTask={handleDeleteTask}
              onQuickAddTask={handleQuickAddTask}
              onUpdateDriveUrl={(url) => handleUpdateDriveUrl(selectedWeek.id, url)}
            />
          )}

          {activeTab === 'daily' && selectedWeek && (
            <DailyKanbanView
              week={selectedWeek}
              onToggleTask={handleToggleTask}
              onAddTaskForDay={(day) => {
                setEditingTask(null);
                setTaskModalDefaultDay(day);
                setIsTaskModalOpen(true);
              }}
              onEditTask={(task) => {
                setEditingTask(task);
                setIsTaskModalOpen(true);
              }}
            />
          )}

          {activeTab === 'notes' && selectedWeek && (
            <WeeklyNotesAndResources
              week={selectedWeek}
              onUpdateNotes={handleUpdateNotes}
              onUpdateRating={handleUpdateRating}
              onUpdateRetrospective={handleUpdateRetrospective}
              onAddResource={handleAddResource}
              onDeleteResource={handleDeleteResource}
              onUpdateDriveUrl={(url) => handleUpdateDriveUrl(selectedWeek.id, url)}
            />
          )}

          {activeTab === 'timer' && selectedWeek && (
            <FocusTimer
              week={selectedWeek}
              onLogMinutes={handleLogStudyMinutes}
            />
          )}

          {activeTab === 'stats' && (
            <ProgressStats
              weeks={weeks}
              user={user}
              onResetData={handleResetData}
              onExportData={handleExportData}
            />
          )}
        </main>

        {/* Light Theme Footer */}
        <footer className="border-t border-slate-200 bg-white py-6 mt-12 no-print">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <div>
              <span className="font-semibold text-slate-900">{user.name}</span>
              <span aria-hidden="true" className="mx-2 text-slate-300">·</span>
              <span>Haftalık Çalışma ve İlerleme Sistemi</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{weeks.length} Hafta Kayıtlı</span>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono tabular-nums">{completedTasks} Görev Tamamlandı</span>
            </div>
          </div>
        </footer>
      </div>

      {/* Modals */}
      {selectedWeek && (
        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSave={handleSaveTask}
          editingTask={editingTask}
          defaultDay={taskModalDefaultDay}
          weekNumber={selectedWeek.weekNumber}
        />
      )}

      <WeekModal
        isOpen={isWeekModalOpen}
        onClose={() => {
          setIsWeekModalOpen(false);
          setEditingWeek(null);
        }}
        onSave={handleSaveWeek}
        editingWeek={editingWeek}
        suggestedWeekNumber={highestWeekNumber + 1}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onSave={(data) => setUser((prev) => ({ ...prev, ...data }))}
      />
    </div>
  );
}
