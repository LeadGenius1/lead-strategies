# 🗄️ Database Reset Guide

This guide explains how to clear all user data and mock data from the database to start fresh.

---

## ⚠️ WARNING

**This will delete ALL data from the database including:**
- All users
- All leads/prospects
- All campaigns
- All websites
- All conversations
- All CRM deals
- All calls
- All analytics data

**This action cannot be undone!**

---

## 📋 Prerequisites

1. Access to the backend server/container
2. Node.js installed
3. Database connection configured
4. Prisma client installed

---

## 🚀 Method 1: Safe Reset (Recommended)

The safe reset script requires explicit confirmation before proceeding.

### Steps:

1. **Navigate to backend directory:**
   ```bash
   cd lead-strategies-backend
   ```

2. **Copy the reset script:**
   ```bash
   # Copy scripts/reset-database-safe.js to backend/scripts/
   ```

3. **Run the safe reset script:**
   ```bash
   node scripts/reset-database-safe.js
   ```

4. **Follow the prompts:**
   - Type `RESET` to confirm
   - Type `DELETE ALL DATA` to confirm again

5. **Verify the reset:**
   ```bash
   # Check that tables are empty
   npx prisma studio
   ```

---

## ⚡ Method 2: Direct Reset (For Automation)

For CI/CD or automated scripts, use the direct reset script.

### Steps:

1. **Navigate to backend directory:**
   ```bash
   cd lead-strategies-backend
   ```

2. **Run the reset script:**
   ```bash
   node scripts/reset-database.js
   ```

---

## 🔧 Method 3: Using Prisma CLI

If you prefer using Prisma directly:

### Steps:

1. **Reset database schema (WARNING: This also drops tables):**
   ```bash
   npx prisma migrate reset
   ```

2. **Or manually delete data:**
   ```bash
   npx prisma studio
   # Then manually delete all records
   ```

---

## 🐳 Method 4: Using Docker (If Backend is Containerized)

If your backend runs in Docker:

1. **Access the container:**
   ```bash
   docker exec -it <container-name> bash
   ```

2. **Run the reset script:**
   ```bash
   node scripts/reset-database-safe.js
   ```

---

## 📊 Verification

After resetting, verify the database is empty:

```bash
# Using Prisma Studio
npx prisma studio

# Or using a database client
# Check that all tables are empty
```

---

## 🔄 After Reset

1. **Verify database is empty**
2. **Test user registration** - Create a new test user
3. **Verify all features work** - Test core functionality
4. **Monitor for errors** - Check logs for any issues

---

## 🚨 Troubleshooting

### Error: "Cannot delete due to foreign key constraint"

**Solution:** The script deletes in the correct order. If you encounter this:
1. Check that all tables exist
2. Verify Prisma schema matches database
3. Run migrations: `npx prisma migrate deploy`

### Error: "Connection refused"

**Solution:**
1. Check database URL in `.env`
2. Verify database is running
3. Check network connectivity

### Error: "Table does not exist"

**Solution:**
1. Run migrations: `npx prisma migrate deploy`
2. Generate Prisma client: `npx prisma generate`

---

## 📝 Notes

- The reset script deletes data but **does not** drop tables
- Database schema remains intact
- You can immediately start using the platform after reset
- Consider backing up data before reset (if needed)

---

## 🔐 Security

- Only run reset scripts in development/staging environments
- Never run in production without explicit approval
- Consider adding IP whitelist restrictions
- Log all reset operations for audit purposes

---

**Last Updated:** January 15, 2026
