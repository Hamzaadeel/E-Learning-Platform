import { Course, Category } from '../types';

export const categories: Category[] = [
  { id: 'all', name: 'All Courses' },
  { id: 'web-dev', name: 'Web Development' },
  { id: 'data-science', name: 'Data Science' },
  { id: 'devops', name: 'DevOps' },
  { id: 'mobile', name: 'Mobile Development' },
  { id: 'ai', name: 'AI & Machine Learning' }
];

export const courses: Course[] = [
  {
    id: '1',
    title: 'Complete Web Development Bootcamp',
    description: 'Learn full-stack web development from scratch. Cover HTML, CSS, JavaScript, React, and Node.js.',
    instructor: 'Sarah Johnson',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085',
    price: 99.99,
    duration: '12 weeks',
    level: 'Beginner',
    category: 'web-dev'
  },
  {
    id: '2',
    title: 'Advanced React Patterns',
    description: 'Master advanced React concepts including hooks, context, and performance optimization.',
    instructor: 'Michael Chen',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee',
    price: 79.99,
    duration: '8 weeks',
    level: 'Advanced',
    category: 'web-dev'
  },
  {
    id: '3',
    title: 'Data Science Fundamentals',
    description: 'Introduction to data analysis, visualization, and machine learning basics.',
    instructor: 'Emily Rodriguez',
    imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
    price: 89.99,
    duration: '10 weeks',
    level: 'Intermediate',
    category: 'data-science'
  },
  {
    id: '4',
    title: 'DevOps Engineering Professional',
    description: 'Master CI/CD, Docker, Kubernetes, and cloud deployment strategies.',
    instructor: 'Alex Kumar',
    imageUrl: 'https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9',
    price: 129.99,
    duration: '10 weeks',
    level: 'Advanced',
    category: 'devops'
  }
];