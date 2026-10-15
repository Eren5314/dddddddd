import React, { useState, useEffect, useRef } from 'react';
import { WeekData, Task, UserProfile, DayOfWeek, WeekStatus, Resource } from './types';
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
import { AdminPasswordModal, ADMIN_PASSWORD } from './components/AdminPasswordModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { subscribeToRoadmap, loadRoadmapFromFirestore, saveRoadmapToFirestore } from './utils/firebaseSync';

const STORAGE_KEY_WEEKS = 'eren_roadmap_weeks_v4';
const STORAGE_KEY_USER = 'eren_roadmap_user_v4';
const STORAGE_KEY_SELECTED_WEEK = 'eren_roadmap_active_week_id_v4';
const STORAGE_KEY_THEME = 'eren_roadmap_theme_v1';
const STORAGE_KEY_ADMIN = 'eren_roadmap_admin_auth_v1';

export default function App() {
  // Theme state: light or dark
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    } catch (e) {
      console.error('Error reading theme', e);
    }
    return 'light';
  });

  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_ADMIN) === 'true';
    } catch {
      return false;
    }
  });

  // Admin Password Verification Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordModalConfig, setPasswordModalConfig] = useState<{
    title: string;
    description: string;
    onSuccess: () => void;
  }>({
    title: 'Yönetici Doğrulaması',
    description: 'Bu işlemi gerçekleştirmek için admin şifresini (Eren9852) girmeniz gerekmektedir.',
    onSuccess: () => {},
  });

  // Admin Panel Modal state
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  // Sync theme with HTML class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch (e) {
      console.error('Failed to save theme', e);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Helper to require admin password before executing an action
  const requireAdmin = (
    action: () => void,
    promptReason: string = 'Bu işlemi gerçekleştirmek için admin şifresini (Eren9852) girmeniz gerekmektedir.',
    title: string = 'Yönetici Doğrulaması Gerekli'
  ) => {
    if (isAdmin) {
      action();
      return;
    }

    setPasswordModalConfig({
      title,
      description: promptReason,
      onSuccess: () => {
        setIsAdmin(true);
        try {
          localStorage.setItem(STORAGE_KEY_ADMIN, 'true');
        } catch (e) {
          console.error(e);
        }
        action();
      },
    });
    setIsPasswordModalOpen(true);
  };

  const handleOpenAdminPanel = () => {
    if (isAdmin) {
      setIsAdminPanelOpen(true);
    } else {
      requireAdmin(
        () => setIsAdminPanelOpen(true),
        'Admin paneline giriş yapmak için yönetici şifresini (Eren9852) giriniz.',
        'Admin Paneli Girişi'
      );
    }
  };

  const handleLogoutAdmin = () => {
    setIsAdmin(false);
    try {
      localStorage.removeItem(STORAGE_KEY_ADMIN);
    } catch (e) {
      console.error(e);
    }
  };

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

  const [isFirebaseReady, setIsFirebaseReady] = useState(false);
  const isRemoteUpdateRef = useRef(false);

  // Real-time live synchronization with Firebase Firestore
  // When an authorized person adds or edits tasks, Drive links, or resources,
  // all clients across all devices receive the updates immediately without refreshing!
  useEffect(() => {
    let isMounted = true;

    const unsubscribe = subscribeToRoadmap(
      ({ weeks: remoteWeeks, user: remoteUser }) => {
        if (!isMounted) return;
        isRemoteUpdateRef.current = true;
        if (remoteWeeks && remoteWeeks.length > 0) {
          setWeeks(remoteWeeks);
          try {
            localStorage.setItem(STORAGE_KEY_WEEKS, JSON.stringify(remoteWeeks));
          } catch (e) {
            console.error(e);
          }
        }
        if (remoteUser) {
          setUser((prev) => ({ ...prev, ...remoteUser }));
          try {
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(remoteUser));
          } catch (e) {
            console.error(e);
          }
        }
        setIsFirebaseReady(true);
        setTimeout(() => {
          isRemoteUpdateRef.current = false;
        }, 300);
      },
      (error) => {
        console.warn('Real-time sync error, falling back to local storage:', error);
        setIsFirebaseReady(true);
      }
    );

    // Initial check: if no remote document exists yet, mark as ready so admin can seed it
    loadRoadmapFromFirestore().then((initial) => {
      if (!isMounted) return;
      if (!initial) {
        setIsFirebaseReady(true);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Sync to localStorage and Firebase Firestore
  // Guaranteed not to wipe Firestore with empty or uninitialized local state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WEEKS, JSON.stringify(weeks));
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }

    if (isFirebaseReady && !isRemoteUpdateRef.current && weeks.length > 0) {
      saveRoadmapToFirestore(weeks, user);
    }
  }, [weeks, user, isFirebaseReady]);

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

  const handleQuickAddTask = (title: string, targetWeekId?: string) => {
    const targetId = targetWeekId || selectedWeekId;
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      title,
      completed: false,
      day: 'Pazartesi',
      category: 'Çalışma',
      priority: 'Orta',
      timeEstimateMinutes: 30,
    };

    setWeeks((prev) =>
      prev.map((w) => {
        if (w.id !== targetId) return w;
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

  const handleAddResource = (resource: Omit<Resource, 'id'>, targetWeekId?: string) => {
    const targetId = targetWeekId || selectedWeekId;
    const newRes: Resource = {
      ...resource,
      id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
    };
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === targetId ? { ...w, resources: [...w.resources, newRes] } : w
      )
    );
  };

  const handleDeleteResource = (resourceId: string, targetWeekId?: string) => {
    const targetId = targetWeekId || selectedWeekId;
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === targetId
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors duration-200">
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
          requireAdmin(
            () => {
              setEditingWeek(null);
              setIsWeekModalOpen(true);
            },
            'Yeni hafta eklemek için yönetici şifresini (Eren9852) girin.',
            'Yeni Hafta - Yönetici Doğrulaması'
          );
        }}
        onEditWeek={(w) => {
          requireAdmin(
            () => {
              setEditingWeek(w);
              setIsWeekModalOpen(true);
            },
            'Haftayı düzenlemek için yönetici şifresini (Eren9852) girin.',
            'Hafta Düzenleme'
          );
        }}
        onDeleteWeek={(weekId) => {
          requireAdmin(
            () => handleDeleteWeek(weekId),
            'Haftayı silmek için yönetici şifresini girin.',
            'Hafta Silme'
          );
        }}
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsProfileModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        isAdmin={isAdmin}
        onOpenAdminPanel={handleOpenAdminPanel}
        theme={theme}
        onToggleTheme={toggleTheme}
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
          isAdmin={isAdmin}
          onOpenAdminPanel={handleOpenAdminPanel}
          theme={theme}
          onToggleTheme={toggleTheme}
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
              isAdmin={isAdmin}
              onRequireAdmin={requireAdmin}
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
              isAdmin={isAdmin}
              onRequireAdmin={requireAdmin}
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

        {/* Footer */}
        <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 mt-12 no-print transition-colors">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">{user.name}</span>
              <span aria-hidden="true" className="mx-2 text-slate-300 dark:text-slate-700">·</span>
              <span>Haftalık Çalışma ve İlerleme Sistemi</span>
            </div>
            <div className="flex items-center gap-3">
              <span>{weeks.length} Hafta Kayıtlı</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <span className="font-mono tabular-nums">{completedTasks} Görev Tamamlandı</span>
              <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
              <button
                onClick={handleOpenAdminPanel}
                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
              >
                {isAdmin ? 'Admin Paneli (Açık)' : 'Admin Girişi'}
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Admin Password Prompt Modal */}
      <AdminPasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={passwordModalConfig.onSuccess}
        title={passwordModalConfig.title}
        description={passwordModalConfig.description}
      />

      {/* Admin Management Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        weeks={weeks}
        onUpdateDriveUrl={handleUpdateDriveUrl}
        onAddResource={(weekId, res) => handleAddResource(res, weekId)}
        onDeleteResource={(weekId, resId) => handleDeleteResource(resId, weekId)}
        onQuickAddTaskToWeek={(weekId, taskTitle) => handleQuickAddTask(taskTitle, weekId)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onLogoutAdmin={handleLogoutAdmin}
      />

      {/* Other Modals */}
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
