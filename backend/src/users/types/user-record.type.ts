export interface UserRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  hasCompletedTour: boolean;
}
