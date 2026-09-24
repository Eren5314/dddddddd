export type DayOfWeek = 'Pazartesi' | 'Salı' | 'Çarşamba' | 'Perşembe' | 'Cuma' | 'Cumartesi' | 'Pazar';

export type TaskCategory = 'Çalışma' | 'Kodlama' | 'Okuma' | 'Proje' | 'Sağlık / Spor' | 'Diğer';

export type TaskPriority = 'Düşük' | 'Orta' | 'Yüksek';

export type WeekStatus = 'completed' | 'in_progress' | 'upcoming';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  day: DayOfWeek;
  category: TaskCategory;
  priority: TaskPriority;
  timeEstimateMinutes?: number;
  notes?: string;
  completedAt?: string;
}

export interface Resource {
  id: string;
  title: string;
  url?: string;
  type: 'Link' | 'Kitap' | 'Video' | 'Doküman' | 'Google Drive';
  description?: string;
}

export interface WeekRetrospective {
  highlights: string;
  challenges: string;
  nextWeekFocus: string;
}

export interface WeekData {
  id: string;
  weekNumber: number;
  title: string;
  theme: string;
  startDate?: string;
  endDate?: string;
  status: WeekStatus;
  tasks: Task[];
  notes: string;
  resources: Resource[];
  rating?: number;
  retrospective?: WeekRetrospective;
  studyMinutesLogged?: number;
  driveUrl?: string;
}

export interface UserProfile {
  name: string;
  goalTitle: string;
  subtitle: string;
  avatarUrl: string;
  bannerUrl: string;
}
