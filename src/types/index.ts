export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  level: string;
  durationValue: number;
  durationType: string;
  instructor: string;
  averageRating?: number;
}


