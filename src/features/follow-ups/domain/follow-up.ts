export interface FollowUp {
  id: string;
  name: string;
  profileUrl: string;
  platform: FollowUpPlatform;
  notes: string;
  status: FollowUpStatus;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  expirationDate: string;
}

export type FollowUpPlatform = 'linkedin' | 'instagram' | 'x';

export type FollowUpStatus = 'pending' | 'completed';

export interface FollowUpInput {
  id?: string;
  name?: string;
  profileUrl?: string;
  platform?: FollowUpPlatform;
  notes?: string;
  status?: FollowUpStatus;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string;
  expirationDate?: string;
}

export interface FollowUpValidationErrors {
  name?: string;
  profileUrl?: string;
  notes?: string;
  platform?: string;
  status?: string;
}