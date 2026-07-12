-- Add FOUNDER and MEMBER application roles for role-based permissions.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'FOUNDER';
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'MEMBER';
