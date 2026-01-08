# 🌐 Connecting leadsite.io Domain (Squarespace) to Vercel

## 📋 Overview

This guide shows how to connect your `leadsite.io` domain that's currently hosted by Squarespace to your LeadSite.IO platform deployed on Vercel.

---

## 🎯 Goal

**Current Setup:**
- Domain: `leadsite.io` (registered/managed in Squarespace)
- Platform: LeadSite.IO (Tier 2) deployed on Vercel
- Need: Point `leadsite.io` to Vercel deployment

---

## ✅ Step-by-Step Process

### **Step 1: Prepare Vercel Deployment**

1. **Deploy LeadSite.IO to Vercel:**
   ```bash
   cd leadsite-io-frontend
   vercel login
   vercel --prod
   ```

2. **Note your Vercel deployment URL:**
   - Example: `leadsite-io-frontend-abc123.vercel.app`
   - You'll need this for DNS configuration

---

### **Step 2: Configure Domain in Vercel**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Select your LeadSite.IO project

2. **Add Custom Domain:**
   - Go to: **Settings** → **Domains**
   - Click: **Add Domain**
   - Enter: `leadsite.io`
   - Click: **Add**

3. **Vercel will show DNS configuration:**
   - You'll see DNS records needed
   - **Record Type:** `A` or `CNAME`
   - **Value:** Vercel's IP addresses or CNAME target

---

### **Step 3: Configure DNS in Squarespace**

#### **Option A: Using Squarespace DNS (Recommended)**

1. **Access Squarespace Domain Settings:**
   - Log into Squarespace
   - Go to: **Settings** → **Domains**
   - Click on `leadsite.io`
   - Select: **DNS Settings** or **Advanced DNS**

2. **Add/Update DNS Records:**

   **For A Record (if Vercel provides IP addresses):**
   ```
   Type: A
   Host: @ (or leave blank for root domain)
   Points to: [Vercel IP address]
   TTL: 3600 (or default)
   ```

   **For CNAME Record (if Vercel provides CNAME):**
   ```
   Type: CNAME
   Host: @ (or www)
   Points to: [Vercel CNAME target, e.g., cname.vercel-dns.com]
   TTL: 3600 (or default)
   ```

   **Common Vercel DNS Configuration:**
   ```
   Type: A
   Host: @
   Points to: 76.76.21.21
   
   Type: CNAME
   Host: www
   Points to: cname.vercel-dns.com
   ```

3. **Remove/Update Existing Records:**
   - If Squarespace has existing A/CNAME records pointing to Squarespace servers, update them to point to Vercel
   - Keep any MX records (for email) if needed

---

#### **Option B: Using External DNS Provider**

If Squarespace allows DNS management through external provider:

1. **Get Nameservers from DNS Provider:**
   - Use providers like: Cloudflare, Namecheap, Google Domains, etc.
   - Get nameserver addresses

2. **Update Nameservers in Squarespace:**
   - Go to: **Settings** → **Domains** → `leadsite.io`
   - Change nameservers to your DNS provider's nameservers
   - Wait for propagation (24-48 hours)

3. **Configure DNS Records in External Provider:**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: Auto
   
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: Auto
   ```

---

### **Step 4: Verify DNS Configuration**

1. **Check DNS Propagation:**
   ```bash
   # Check A record
   dig leadsite.io A
   
   # Or use online tools:
   # https://dnschecker.org
   # https://www.whatsmydns.net
   ```

2. **Verify in Vercel:**
   - Go back to Vercel Dashboard → **Settings** → **Domains**
   - Status should show: **Valid Configuration** or **Ready**
   - Wait for SSL certificate generation (automatic, takes a few minutes)

---

### **Step 5: SSL Certificate (Automatic)**

- Vercel automatically provisions SSL certificates via Let's Encrypt
- Once DNS is configured correctly, SSL will be active within minutes
- You'll see a green checkmark in Vercel dashboard when ready

---

## 🔧 Common DNS Record Types

### **A Record (IPv4 Address)**
```
Type: A
Host: @
Points to: 76.76.21.21
```
- Points root domain directly to IP address

### **CNAME Record (Canonical Name)**
```
Type: CNAME
Host: www
Points to: cname.vercel-dns.com
```
- Points subdomain to another domain name

### **Vercel's Typical Configuration:**
```
@ (root) → A Record → 76.76.21.21
www → CNAME → cname.vercel-dns.com
```

---

## ⚠️ Important Notes

### **Squarespace-Specific Considerations:**

1. **Domain Registration vs. Hosting:**
   - If domain is **registered** with Squarespace but **hosted** elsewhere, you can change nameservers
   - If domain is **hosted** by Squarespace, you may need to:
     - Use Squarespace's DNS settings
     - Or transfer domain to another registrar

2. **Email Services:**
   - If you use Squarespace email, keep MX records pointing to Squarespace
   - Example MX record:
     ```
     Type: MX
     Host: @
     Priority: 10
     Points to: mail.squarespace.com
     ```

3. **Subdomain Handling:**
   - `www.leadsite.io` → CNAME to Vercel
   - `leadsite.io` (root) → A record to Vercel IP

---

## 🐛 Troubleshooting

### **Problem: Domain not resolving**
**Solution:**
- Wait 24-48 hours for DNS propagation
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Verify DNS records are correct using `dig` or online DNS checker

### **Problem: SSL certificate not generating**
**Solution:**
- Ensure DNS records are correctly configured
- Wait 5-10 minutes after DNS propagation
- Check Vercel dashboard for error messages
- Verify domain is not pointing to another service

### **Problem: Squarespace won't let me change DNS**
**Solution:**
- Contact Squarespace support to enable DNS management
- Consider transferring domain to another registrar (Namecheap, Cloudflare, etc.)
- Use external DNS provider and update nameservers

### **Problem: Site shows Squarespace page**
**Solution:**
- Ensure DNS records are pointing to Vercel, not Squarespace
- Check that A/CNAME records are updated
- Clear browser cache and try again

---

## 📝 Step-by-Step Checklist

- [ ] Deploy LeadSite.IO to Vercel
- [ ] Add `leadsite.io` domain in Vercel dashboard
- [ ] Get DNS configuration from Vercel
- [ ] Access Squarespace domain settings
- [ ] Update A record to point to Vercel IP (or CNAME)
- [ ] Update CNAME record for www subdomain (if needed)
- [ ] Keep MX records for email (if using Squarespace email)
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Verify DNS propagation using DNS checker
- [ ] Check Vercel dashboard for SSL certificate status
- [ ] Test `leadsite.io` in browser
- [ ] Verify HTTPS is working

---

## 🔗 Quick Reference Links

- **Vercel DNS Documentation:** https://vercel.com/docs/concepts/projects/domains
- **Squarespace Domain Help:** https://support.squarespace.com/hc/en-us/articles/205812668
- **DNS Checker:** https://dnschecker.org
- **Vercel Dashboard:** https://vercel.com/dashboard

---

## 💡 Alternative: Use Subdomain

If you can't change root domain DNS:

1. **Use subdomain instead:**
   - `app.leadsite.io` → Point to Vercel
   - Keep `leadsite.io` on Squarespace

2. **Configure in Vercel:**
   - Add `app.leadsite.io` as custom domain
   - Add CNAME record in Squarespace:
     ```
     Type: CNAME
     Host: app
     Points to: cname.vercel-dns.com
     ```

---

## ✅ Expected Result

After successful configuration:
- ✅ `leadsite.io` → Points to Vercel deployment
- ✅ `www.leadsite.io` → Points to Vercel deployment (optional)
- ✅ HTTPS/SSL → Automatically enabled by Vercel
- ✅ LeadSite.IO platform → Accessible via custom domain

---

**Note:** DNS changes can take 24-48 hours to fully propagate globally. Be patient and verify using DNS checker tools.

