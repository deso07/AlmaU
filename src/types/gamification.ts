export interface Achievement {
  id: string;
  title: string;
  description: string;
  points: number;
  icon: string;
  unlockedAt?: Date;
}

export interface StudentPoints {
  userId: string;
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  recentActivities: Activity[];
}

export interface Activity {
  id: string;
  type: 'attendance' | 'assignment' | 'quiz' | 'participation';
  points: number;
  description: string;
  timestamp: Date;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalPoints: number;
  level: number;
  rank: number;
}

export interface Feedback {
  id: string;
  courseId: string;
  teacherId: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  createdAt: Date;
}

export interface Analytics {
  attendance: {
    present: number;
    absent: number;
    total: number;
    percentage: number;
  };
  grades: {
    subject: string;
    average: number;
    assignments: {
      name: string;
      grade: number;
      maxGrade: number;
    }[];
  }[];
  progress: {
    completedCourses: number;
    totalCourses: number;
    currentGPA: number;
  };
} 