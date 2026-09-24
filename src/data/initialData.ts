import { WeekData, UserProfile } from '../types';

export const initialUserProfile: UserProfile = {
  name: 'Eren Pehlivan',
  goalTitle: 'Kişisel Gelişim & Haftalık Hedef Takibi',
  subtitle: 'Haftalık görevlerini kendin belirle, adım adım hedeflerine ulaş',
  avatarUrl: '/src/assets/images/eren_profile_avatar_1790237161271.jpg',
  bannerUrl: '/src/assets/images/eren_workspace_banner_1790237175348.jpg',
};

// Generates clean empty weeks for Eren (from 1 to 20) with no pre-filled tasks
export const initialWeeks: WeekData[] = Array.from({ length: 20 }, (_, index) => {
  const weekNum = index + 1;
  return {
    id: `week-${weekNum}`,
    weekNumber: weekNum,
    title: `${weekNum}. Hafta Planı`,
    theme: '',
    startDate: `${weekNum}. Hafta`,
    endDate: '7 Gün',
    status: weekNum === 1 ? 'in_progress' : 'upcoming',
    studyMinutesLogged: 0,
    tasks: [],
    notes: '',
    resources: [],
  };
});
