export interface Event {
  id: string;
  title: string;
  slug: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  venue: string;
  category: string;
  price: number;
  currency: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export interface Testimonial {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
}