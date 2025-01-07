export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  imageUrl: string;
  price: number;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  avatar?: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface EnrolledCourse extends Course {
  progress: number;
  lastAccessed: string;
}