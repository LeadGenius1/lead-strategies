# 🎯 Exact Vercel DNS Values for clientcontact.io

## ⚠️ Important: Get Exact Values from Vercel

**Vercel provides unique DNS values for each project.** You must deploy first to get the exact values.

---

## 📋 Step 1: Deploy to Vercel (Required First)

```bash
cd clientcontact-io-frontend
vercel login
vercel --prod
```

**After deployment, Vercel will show you the exact DNS records.**

---

## 🔧 Step 2: Get Exact DNS Values from Vercel Dashboard

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your `clientcontact-io-frontend` project

2. **Add Domain:**
   - Go to: **Settings** → **Domains**
   - Click: **Add Domain**
   - Enter: `clientcontact.io`
   - Click: **Add**

3. **Vercel Will Show Exact DNS Records:**
   - You'll see something like this:
   
   ```
   Configure the following DNS records:
   
   Type: A
   Name: @
   Value: 76.76.21.21
   
   Type: CNAME  
   Name: www
   Value: cname.vercel-dns.com
   ```
   
   **⚠️ IMPORTANT:** Copy the EXACT values Vercel shows you - they may differ from examples!

---

## 📝 Common Vercel DNS Values (Reference Only)

**These are common values, but Vercel may provide different ones:**

### **Option 1: A Record (Most Common)**
```
Type: A
Host: @ (or leave blank for root domain)
Points to: 76.76.21.21
TTL: 3600 (or default)
```

### **Option 2: CNAME Record (Alternative)**
```
Type: CNAME
Host: @
Points to: cname.vercel-dns.com
TTL: 3600 (or default)
```

**Note:** Some registrars don't allow CNAME on root domain (@), so A record is preferred.

### **For www Subdomain:**
```
Type: CNAME
Host: www
Points to: cname.vercel-dns.com
TTL: 3600 (or default)
```

---

## 🎯 Exact Steps for Squarespace

### **After Getting Values from Vercel:**

1. **Log into Squarespace:**
   - Go to: https://www.squarespace.com
   - Log in

2. **Access Domain Settings:**
   - Settings → Domains → `clientcontact.io`
   - Click: **DNS Settings** or **Advanced DNS**

3. **Update A Record:**
   - Find existing A record for `@` (root domain)
   - **Edit** it:
     - Type: **A**
     - Host: **@** (or leave blank)
     - Points to: **[EXACT IP FROM VERCEL]** ← Use Vercel's value
     - TTL: 3600
   - **Save**

4. **Update CNAME Record (for www):**
   - Find existing CNAME for `www`
   - **Edit** it:
     - Type: **CNAME**
     - Host: **www**
     - Points to: **[EXACT CNAME FROM VERCEL]** ← Use Vercel's value
     - TTL: 3600
   - **Save**

---

## 🔍 How to Find Exact Values in Vercel Dashboard

After adding domain in Vercel:

1. **In Vercel Dashboard:**
   - Settings → Domains
   - Click on `clientcontact.io`
   - You'll see: **"Configure the following DNS records"**
   - **Copy these exact values**

2. **Example of what you'll see:**
   ```
   Configure DNS
   
   Add the following DNS records to your domain provider:
   
   Record Type: A
   Name: @
   Value: 76.76.21.21
   
   Record Type: CNAME
   Name: www  
   Value: cname.vercel-dns.com
   ```

---

## ⚠️ Why You Need Exact Values

- Vercel may use different IP addresses for different projects
- DNS values can change over time
- Using wrong values will cause domain to not work
- **Always use the values Vercel shows you in the dashboard**

---

## 🚀 Quick Action Plan

1. ✅ **Deploy to Vercel** (if not done)
   ```bash
   cd clientcontact-io-frontend
   vercel --prod
   ```

2. ✅ **Add domain in Vercel Dashboard**
   - Settings → Domains → Add Domain → `clientcontact.io`

3. ✅ **Copy exact DNS values** from Vercel

4. ✅ **Update DNS in Squarespace** with exact values

5. ✅ **Wait for propagation** (24-48 hours)

---

## 📞 If You Need Help Getting Values

**If you've already deployed:**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Domains
4. Click on `clientcontact.io`
5. Copy the DNS records shown

**If you haven't deployed yet:**
- Deploy first using `vercel --prod`
- Then follow steps above

---

**Remember:** The exact DNS values are unique to your Vercel project and will be shown in the Vercel dashboard after you add the domain.

