-- Database Cleanup Script
-- WARNING: This will delete ALL users and related data
-- Run this script to start fresh with a clean database

-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';

-- Delete all user-related data (in order of dependencies)
DELETE FROM campaign_analytics;
DELETE FROM email_campaigns;
DELETE FROM prospects;
DELETE FROM crm_contacts;
DELETE FROM crm_deals;
DELETE FROM crm_activities;
DELETE FROM inbox_messages;
DELETE FROM connected_channels;
DELETE FROM voice_calls;
DELETE FROM webhooks;
DELETE FROM api_keys;
DELETE FROM background_jobs;
DELETE FROM agent_logs;
DELETE FROM websites;
DELETE FROM built_websites;
DELETE FROM analytics_events;
DELETE FROM website_leads;
DELETE FROM team_members;
DELETE FROM subscriptions;
DELETE FROM users;

-- Reset sequences (if using serial/identity columns)
-- Adjust table names and column names based on your actual schema
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;
-- ALTER SEQUENCE prospects_id_seq RESTART WITH 1;
-- ALTER SEQUENCE email_campaigns_id_seq RESTART WITH 1;

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- Verify cleanup
SELECT 
  (SELECT COUNT(*) FROM users) as users_count,
  (SELECT COUNT(*) FROM prospects) as prospects_count,
  (SELECT COUNT(*) FROM email_campaigns) as campaigns_count,
  (SELECT COUNT(*) FROM subscriptions) as subscriptions_count;

-- Should all return 0
