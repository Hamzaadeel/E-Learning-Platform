import { ReactNode } from "react";

export interface Course {
  durationType: ReactNode;
  durationValue: ReactNode;
  id: string;
  title: string;
  description: string;
  instructor: string;
  imageUrl: string;
  price: number;
  rating?: number;
  students?: number;
  duration: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
}

export interface Category {
  id: string;
  name: string;
}

export const categories: Category[] = [
  { id: "all", name: "All Courses" },
  { id: "web-dev", name: "Web Development" },
  { id: "data-science", name: "Data Science" },
  { id: "devops", name: "DevOps" },
  { id: "mobile", name: "Mobile Development" },
  { id: "ai", name: "AI & Machine Learning" },
  { id: "design", name: "Design" },
  { id: "business", name: "Business" },
  { id: "marketing", name: "Marketing" },
];

export const courses: Course[] = [
  {
    id: "1",
    title: "Complete Web Development Bootcamp",
    description:
      "Learn full-stack web development from scratch. Cover HTML, CSS, JavaScript, React, and Node.js.",
    instructor: "Sarah Johnson",
    imageUrl: "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
    price: 99.99,
    rating: 4.8,
    students: 3456,
    duration: "12 weeks",
    level: "Beginner",
    category: "web-dev",
    durationType: "weeks",
    durationValue: 12,
  },
  {
    id: "2",
    title: "Advanced React Patterns",
    description:
      "Master advanced React concepts including hooks, context, and performance optimization.",
    instructor: "Michael Chen",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-f134324a6cee",
    price: 79.99,
    rating: 4.9,
    students: 2145,
    duration: "8 weeks",
    level: "Advanced",
    category: "web-dev",
    durationType: "weeks",
    durationValue: 8,
  },
  {
    id: "3",
    title: "Data Science Fundamentals",
    description:
      "Introduction to data analysis, visualization, and machine learning basics.",
    instructor: "Emily Rodriguez",
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    price: 89.99,
    rating: 4.7,
    students: 1876,
    duration: "10 weeks",
    level: "Intermediate",
    category: "data-science",
    durationType: "weeks",
    durationValue: 10,
  },
  {
    id: "4",
    title: "DevOps Engineering Professional",
    description:
      "Master CI/CD, Docker, Kubernetes, and cloud deployment strategies.",
    instructor: "Alex Kumar",
    imageUrl: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9",
    price: 129.99,
    rating: 4.9,
    students: 1234,
    duration: "10 weeks",
    level: "Advanced",
    category: "devops",
    durationType: "weeks",
    durationValue: 10,
  },
  {
    id: "5",
    title: "UI/UX Design Principles",
    description:
      "Learn modern design principles and create beautiful user interfaces",
    instructor: "Mike Wilson",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5",
    price: 69.99,
    rating: 4.7,
    students: 1567,
    duration: "10 weeks",
    level: "Intermediate",
    category: "design",
    durationType: "weeks",
    durationValue: 10,
  },
  {
    id: "6",
    title: "Business Analytics",
    description: "Master data analysis techniques for business decision making",
    instructor: "Emily Brown",
    imageUrl: "https://images.unsplash.com/photo-1460925895917-afdab827c52f",
    price: 89.99,
    rating: 4.9,
    students: 978,
    duration: "12 weeks",
    level: "Intermediate",
    category: "business",
    durationType: "weeks",
    durationValue: 12,
  },
  {
    id: "7",
    title: "Mobile App Development with Flutter",
    description: "Build cross-platform mobile apps with Flutter and Dart",
    instructor: "David Kim",
    imageUrl: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c",
    price: 94.99,
    rating: 4.8,
    students: 1456,
    duration: "10 weeks",
    level: "Intermediate",
    category: "mobile",
    durationType: "weeks",
    durationValue: 10,
  },
  {
    id: "8",
    title: "Machine Learning Fundamentals",
    description: "Learn the basics of machine learning and AI algorithms",
    instructor: "Lisa Wang",
    imageUrl: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4",
    price: 119.99,
    rating: 4.9,
    students: 2345,
    duration: "14 weeks",
    level: "Advanced",
    category: "ai",
    durationType: "weeks",
    durationValue: 14,
  },
  {
    id: "9",
    title: "Digital Marketing Fundamentals",
    description:
      "Learn the core concepts of digital marketing and social media",
    instructor: "Sarah Johnson",
    imageUrl: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a",
    price: 59.99,
    rating: 4.6,
    students: 2145,
    duration: "4 weeks",
    level: "Beginner",
    category: "marketing",
    durationType: "weeks",
    durationValue: 4,
  },
  {
    id: "10",
    title: "Python for Data Science",
    description:
      "Master Python programming for data analysis and visualization",
    instructor: "John Smith",
    imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    price: 84.99,
    rating: 4.8,
    students: 3210,
    duration: "8 weeks",
    level: "Intermediate",
    category: "data-science",
    durationType: "weeks",
    durationValue: 8,
  },
];
