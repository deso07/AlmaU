export interface CourseMaterial {
  id: string;
  type: 'video' | 'presentation' | 'task';
  title: string;
  description: string;
  duration?: string; // for videos
  url: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  instructor: string;
  rating: number;
  reviewsCount: number;
  materials: CourseMaterial[];
  thumbnail: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  isPurchased?: boolean;
}

export interface Discipline {
  id: string;
  title: string;
  description: string;
  courses: Course[];
  icon: string;
} 