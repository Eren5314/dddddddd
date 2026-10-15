import { WeekData, Task } from '../types';

export const STORAGE_KEY_PERMANENT_WEEKS = 'eren_roadmap_weeks_permanent_v1';
export const STORAGE_KEY_LEGACY_V4 = 'eren_roadmap_weeks_v4';
export const STORAGE_KEY_TASKS_VAULT = 'eren_tasks_persistent_vault_v1';
export const STORAGE_KEY_DELETED_VAULT = 'eren_tasks_deleted_vault_v1';
export const STORAGE_KEY_LOCK_DELETION = 'eren_lock_task_deletion_v1';

const LEGACY_STORAGE_KEYS = [
  'eren_roadmap_weeks_v4',
  'eren_roadmap_weeks_v3',
  'eren_roadmap_weeks_v2',
  'eren_roadmap_weeks_v1',
  'eren_roadmap_weeks',
];

export interface ArchivedTaskItem {
  id: string;
  weekId: string;
  task: Task;
  deletedAt: string;
}

export interface TaskVaultItem {
  taskId: string;
  weekId: string;
  task: Task;
  updatedAt: string;
}

/**
 * Loads weeks data with multi-layer permanent persistence.
 * Scans primary permanent store, legacy keys, and persistent task vault
 * to guarantee that no user-added tasks are ever lost.
 */
export function loadWeeksWithPermanentPersistence(initialWeeks: WeekData[]): WeekData[] {
  let loadedWeeks: WeekData[] | null = null;

  // 1. Check permanent master storage
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERMANENT_WEEKS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        loadedWeeks = parsed;
      }
    }
  } catch (e) {
    console.error('Error reading permanent weeks storage:', e);
  }

  // 2. If not found in permanent store, scan legacy keys
  if (!loadedWeeks) {
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      try {
        const raw = localStorage.getItem(legacyKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            loadedWeeks = parsed;
            console.log(`Migrated weeks from legacy key: ${legacyKey}`);
            break;
          }
        }
      } catch (e) {
        console.error(`Error checking legacy key ${legacyKey}:`, e);
      }
    }
  }

  // 3. Fallback to initial weeks template if nothing found
  let resultWeeks: WeekData[] = loadedWeeks ? [...loadedWeeks] : initialWeeks.map(w => ({ ...w, tasks: [...w.tasks], resources: [...w.resources] }));

  // Ensure all 20 weeks exist
  for (const initW of initialWeeks) {
    if (!resultWeeks.some(w => w.id === initW.id || w.weekNumber === initW.weekNumber)) {
      resultWeeks.push({ ...initW, tasks: [], resources: [] });
    }
  }
  resultWeeks.sort((a, b) => a.weekNumber - b.weekNumber);

  // 4. Recover any orphaned tasks from Task Vault (multi-layer safety)
  try {
    const vaultRaw = localStorage.getItem(STORAGE_KEY_TASKS_VAULT);
    if (vaultRaw) {
      const vault: Record<string, TaskVaultItem> = JSON.parse(vaultRaw);
      let recoveredCount = 0;

      Object.values(vault).forEach(item => {
        if (!item || !item.task || !item.weekId) return;
        const targetWeek = resultWeeks.find(w => w.id === item.weekId || w.weekNumber === Number(item.weekId.replace('week-', '')));
        if (targetWeek) {
          const taskExists = targetWeek.tasks.some(t => t.id === item.task.id);
          if (!taskExists) {
            targetWeek.tasks.push(item.task);
            recoveredCount++;
          }
        }
      });

      if (recoveredCount > 0) {
        console.log(`Recovered ${recoveredCount} tasks from persistent vault.`);
      }
    }
  } catch (e) {
    console.error('Error recovering tasks from vault:', e);
  }

  // Save the consolidated result back into permanent storage
  saveWeeksPermanently(resultWeeks);

  return resultWeeks;
}

/**
 * Saves weeks to permanent storage and synchronizes the persistent tasks vault.
 */
export function saveWeeksPermanently(weeks: WeekData[]): void {
  try {
    const serialized = JSON.stringify(weeks);
    localStorage.setItem(STORAGE_KEY_PERMANENT_WEEKS, serialized);
    localStorage.setItem(STORAGE_KEY_LEGACY_V4, serialized);

    // Update persistent task vault so tasks can never be lost
    const vault: Record<string, TaskVaultItem> = {};
    weeks.forEach(w => {
      w.tasks.forEach(t => {
        vault[t.id] = {
          taskId: t.id,
          weekId: w.id,
          task: t,
          updatedAt: new Date().toISOString(),
        };
      });
    });

    localStorage.setItem(STORAGE_KEY_TASKS_VAULT, JSON.stringify(vault));
  } catch (e) {
    console.error('Failed to save weeks permanently:', e);
  }
}

/**
 * Archive a deleted task to safety vault instead of destroying it completely.
 */
export function archiveDeletedTask(weekId: string, task: Task): void {
  try {
    const existing = getArchivedTasks();
    const newItem: ArchivedTaskItem = {
      id: `archived-${Date.now()}-${task.id}`,
      weekId,
      task,
      deletedAt: new Date().toISOString(),
    };
    const updated = [newItem, ...existing].slice(0, 50); // keep last 50
    localStorage.setItem(STORAGE_KEY_DELETED_VAULT, JSON.stringify(updated));

    // Remove from vault
    const vaultRaw = localStorage.getItem(STORAGE_KEY_TASKS_VAULT);
    if (vaultRaw) {
      const vault: Record<string, TaskVaultItem> = JSON.parse(vaultRaw);
      delete vault[task.id];
      localStorage.setItem(STORAGE_KEY_TASKS_VAULT, JSON.stringify(vault));
    }
  } catch (e) {
    console.error('Failed to archive deleted task:', e);
  }
}

/**
 * Gets the list of archived/deleted tasks.
 */
export function getArchivedTasks(): ArchivedTaskItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_DELETED_VAULT);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.error('Failed to read archived tasks:', e);
  }
  return [];
}

/**
 * Clear or restore from deleted tasks
 */
export function removeArchivedTask(archiveId: string): void {
  try {
    const existing = getArchivedTasks();
    const updated = existing.filter(item => item.id !== archiveId);
    localStorage.setItem(STORAGE_KEY_DELETED_VAULT, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to remove archived task:', e);
  }
}

/**
 * Check whether task deletion is locked across the site
 */
export function isTaskDeletionLocked(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEY_LOCK_DELETION);
    // Default to true (locked) so tasks cannot be deleted without unlocking or admin
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

/**
 * Set task deletion locked status
 */
export function setTaskDeletionLocked(locked: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOCK_DELETION, String(locked));
  } catch (e) {
    console.error('Failed to set task deletion lock status:', e);
  }
}
