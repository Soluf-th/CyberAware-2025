
import { LucideIcon } from 'lucide-react';

export interface InfoCardData {
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachments?: string[];
  groundingMetadata?: any;
}

export enum Section {
  HOME = 'HOME',
  TYPES = 'TYPES',
  FUTURE = 'FUTURE',
  CHAT = 'CHAT',
  MONITOR = 'MONITOR',
  IMAGE_LAB = 'IMAGE_LAB',
  VIDEO_LAB = 'VIDEO_LAB',
  LIVE_VOICE = 'LIVE_VOICE',
  SECURE_AUTH = 'SECURE_AUTH',
  SUPPLY_CHAIN = 'SUPPLY_CHAIN'
}
