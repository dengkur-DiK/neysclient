// Minimal client-side schema shims
// This file provides the TypeScript types the client imports from 'server/schema'.
// It's intentionally simple — adapt to your real backend schema as needed.

export interface Message {
  id: number;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface PortfolioItem {
  id: number;
  title: string;
  description: string;
  image: string;
  category: string;
}

export type InsertPortfolioItem = Omit<PortfolioItem, 'id'>;
export type UpdatePortfolioItem = Partial<InsertPortfolioItem>;

export interface Booking {
  id: number;
  name: string;
  email: string;
  phone?: string;
  date: string; // ISO date string
  service?: string;
  message?: string;
  createdAt?: string;
}
