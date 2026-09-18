// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const config=sqliteTable('config',{key:text('key').primaryKey(),value:text('value').notNull()});
export const sites=sqliteTable('sites',{id:text('id').primaryKey(),name:text('name').notNull(),domain:text('domain').notNull().unique(),active:integer('active').notNull().default(1),deleted:integer('deleted').notNull().default(0),version:integer('version').notNull().default(1)});
export const questions=sqliteTable('questions',{id:text('id').primaryKey(),payload:text('payload').notNull()});
export const connections=sqliteTable('connections',{id:text('id').primaryKey(),model:text('model').notNull(),secret:text('secret'),enabled:integer('enabled').notNull().default(0),tested:text('tested')});
export const jobs=sqliteTable('jobs',{id:text('id').primaryKey(),slot:text('slot').notNull().unique(),label:text('label').notNull(),kind:text('kind').notNull(),status:text('status').notNull(),createdAt:text('created_at').notNull()});
export const results=sqliteTable('results',{id:text('id').primaryKey(),jobId:text('job_id').notNull(),status:text('status').notNull(),payload:text('payload').notNull(),raw:text('raw'),lease:text('lease'),attempts:integer('attempts').notNull().default(0),createdAt:text('created_at').notNull()},t=>[index('idx_results_job_status').on(t.jobId,t.status),index('idx_results_created').on(t.createdAt)]);
export const usage=sqliteTable('usage',{month:text('month').primaryKey(),count:integer('count').notNull().default(0)});
export const members=sqliteTable('members',{email:text('email').primaryKey(),role:text('role').notNull()});
export const audit=sqliteTable('audit',{id:text('id').primaryKey(),actor:text('actor').notNull(),action:text('action').notNull(),createdAt:text('created_at').notNull()});
export const authSessions=sqliteTable('auth_sessions',{tokenHash:text('token_hash').primaryKey(),email:text('email').notNull(),expiresAt:integer('expires_at').notNull(),credentialVersion:text('credential_version').notNull()},t=>[index('idx_auth_sessions_expiry').on(t.expiresAt)]);
export const authAttempts=sqliteTable('auth_attempts',{id:text('id').primaryKey(),count:integer('count').notNull(),expiresAt:integer('expires_at').notNull()},t=>[index('idx_auth_attempts_expiry').on(t.expiresAt)]);
