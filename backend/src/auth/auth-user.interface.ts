import { Role } from '@prisma/client';

export interface AuthUser {
  userId: string;
  email: string;
  role: Role;
  departmentId?: string | null;
  department?: {
    id: string;
    name: string;
    createdAt: Date;
  } | null;
}
