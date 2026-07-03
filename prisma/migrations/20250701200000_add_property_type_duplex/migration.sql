-- Add DUPLEX as a distinct property type (PF Expert and brokerage inventory)
ALTER TYPE "PropertyType" ADD VALUE IF NOT EXISTS 'DUPLEX';
