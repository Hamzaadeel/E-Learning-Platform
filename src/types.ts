export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  imageUrl: string;
  price: number;
  duration: string;
  level: string;
  category: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "learner" | "instructor";
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
