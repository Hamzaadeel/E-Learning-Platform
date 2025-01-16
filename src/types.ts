export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  imageUrl: string;
  price: number;
  durationValue: number;
  durationType: string;
  level: string;
  category: string;
  outlineDescription?: string;
  outlineItems?: { title: string; topics: string[] }[];
  content?: { title: string; videoUrl: string; description: string }[];
  averageRating?: number;
  rating?: number;
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
export interface Assignment {
  id: string;
  title: string;
  questions: Question[];
  hints: string[];
  dueDate: string;
}

export interface Option {
  text: string;
  isCorrect: boolean;
}

export interface Question {
  questionText: string;
  options: Option[];
  hint: string;
}
