# 🚀 ClientContact.IO - Deploy & Connect Custom Domain

## ⚠️ Current Issue
- `clientcontact.io` is showing "Coming Soon" page (Squarespace placeholder)
- Domain is not connected to Vercel deployment
- Need to deploy to Vercel and update DNS

---

## ✅ Step-by-Step Solution

### **Step 1: Deploy ClientContact.IO to Vercel**

1. **Navigate to project directory:**
   ```bash
   cd clientcontact-io-frontend
   ```

2. **Login to Vercel (if not already):**
   ```bash
   vercel login
   ```

3. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```
   
   **During deployment, Vercel will ask:**
   - "Set up and deploy?" → **Yes**
   - "Which scope?" → Select your account
   - "Link to existing project?" → **No** (first time) or **Yes** (if exists)
   - "Project name?" → `clientcontact-io-frontend` (or your preferred name)
   - "Directory?" → `./` (current directory)
   - "Override settings?" → **No**

4. **Note your Vercel deployment URL:**
   - Example: `clientcontact-io-frontend-abc123.vercel.app`
   - You'll see this in the terminal output

---

### **Step 2: Set Environment Variables in Vercel**

1. **Go to Vercel Dashboard:**
   - Visit: https://vercel.com/dashboard
   - Click on your `clientcontact-io-frontend` project

2. **Add Environment Variables:**
   - Go to: **Settings** → **Environment Variables**
   - Click: **Add New**
   - Add these variables:

   ```env
   Name: NEXT_PUBLIC_API_URL
   Value: https://api.leadsite.ai
   Environment: Production, Preview, Development
   
   Name: NEXT_PUBLIC_API_VERSION
   Value: v1
   Environment: Production, Preview, Development
   
   Name: NEXT_PUBLIC_PLATFORM
   Value: tier3
   Environment: Production, Preview, Development
   ```

3. **Redeploy after adding variables:**
   - Go to: **Deployments** tab
   - Click: **Redeploy** (or push a new commit)

---

### **Step 3: Add Custom Domain in Vercel**

1. **In Vercel Dashboard:**
   - Go to: **Settings** → **Domains**
   - Click: **Add Domain**

2. **Enter your domain:**
   - Type: `clientcontact.io`
   - Click: **Add**

3. **Vercel will show DNS configuration:**
   - You'll see required DNS records
   - **Copy these values** - you'll need them for Squarespace

   **Typical Vercel DNS Configuration:**
   ```
   For root domain (clientcontact.io):
   Type: A
   Name: @
   Value: 76.76.21.21
   
   For www subdomain (www.clientcontact.io):
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

   **Note:** Vercel may provide different IP addresses or CNAME targets - **use the exact values Vercel shows you**

---

### **Step 4: Update DNS in Squarespace**

1. **Log into Squarespace:**
   - Go to: https://www.squarespace.com
   - Log in to your account

2. **Access Domain Settings:**
   - Go to: **Settings** → **Domains**
   - Find and click on: `clientcontact.io`

3. **Open DNS Settings:**
   - Click: **DNS Settings** or **Advanced DNS**
   - You may need to click: **Use Squarespace Nameservers** first (if not already)

4. **Update/Add DNS Records:**

   **A. Update Root Domain (clientcontact.io):**
   - Find existing **A Record** for `@` or root domain
   - **Edit** it or **Add** new A record:
     ```
     Type: A
     Host: @ (or leave blank)
     Points to: [Vercel IP from Step 3 - e.g., 76.76.21.21]
     TTL: 3600 (or default)
     ```
   - **Save**

   **B. Add/Update www Subdomain:**
   - Find existing **CNAME Record** for `www`
   - **Edit** it or **Add** new CNAME record:
     ```
     Type: CNAME
     Host: www
     Points to: [Vercel CNAME from Step 3 - e.g., cname.vercel-dns.com]
     TTL: 3600 (or default)
     ```
   - **Save**

5. **Keep Email Records (if using Squarespace email):**
   - **DO NOT DELETE** MX records
   - Keep them pointing to Squarespace:
     ```
     Type: MX
     Host: @
     Priority: 10
     Points to: mail.squarespace.com
     ```

6. **Remove Squarespace Website Records (if any):**
   - If there are A/CNAME records pointing to Squarespace hosting, **update them** to point to Vercel
   - Example: If you see `@` pointing to `xxx.squarespace.com`, change it to Vercel IP

---

### **Step 5: Verify DNS Configuration**

1. **Check DNS Propagation:**
   - Visit: https://dnschecker.org
   - Enter: `clientcontact.io`
   - Select: **A Record**
   - Check if it shows Vercel's IP address
   - Wait 24-48 hours for full propagation

2. **Verify in Vercel:**
   - Go back to Vercel Dashboard → **Settings** → **Domains**
   - Status should show: **Valid Configuration** or **Ready**
   - If it shows an error, check DNS records again

3. **Wait for SSL Certificate:**
   - Vercel automatically generates SSL certificates
   - Takes 5-10 minutes after DNS is correct
   - You'll see a green checkmark when ready

---

### **Step 6: Test Your Domain**

1. **Wait for DNS propagation** (can take up to 48 hours, but often works within minutes)

2. **Test in browser:**
   - Visit: `https://clientcontact.io`
   - Should show your ClientContact.IO landing page (not "Coming Soon")

3. **If still showing "Coming Soon":**
   - Clear browser cache
   - Try incognito/private window
   - Check DNS propagation status
   - Verify DNS records are correct

---

## 🔧 Troubleshooting

### **Problem: Domain still shows "Coming Soon"**

**Check 1: DNS Records**
- Verify A record points to Vercel IP (not Squarespace)
- Verify CNAME for www points to Vercel
- Use DNS checker: https://dnschecker.org

**Check 2: Vercel Domain Status**
- Go to Vercel Dashboard → Settings → Domains
- Check if domain shows "Valid Configuration"
- If error, click on domain to see what's wrong

**Check 3: DNS Propagation**
- DNS changes can take 24-48 hours
- Check multiple locations: https://dnschecker.org
- Clear DNS cache: `ipconfig /flushdns` (Windows)

**Check 4: Squarespace Settings**
- Make sure domain is not "parked" on Squarespace
- Disable Squarespace website hosting for this domain
- Ensure DNS records are updated (not cached)

---

### **Problem: SSL Certificate Not Working**

**Solution:**
- Wait 5-10 minutes after DNS is correct
- Check Vercel dashboard for SSL status
- Ensure DNS records are pointing to Vercel (not Squarespace)
- Try accessing `https://clientcontact.io` (not http)

---

### **Problem: Squarespace Won't Let Me Edit DNS**

**Solution:**
- Contact Squarespace support to enable DNS management
- Or transfer domain to another registrar (Namecheap, Cloudflare, etc.)
- Then update nameservers and configure DNS there

---

## 📝 Quick Checklist

- [ ] Deploy ClientContact.IO to Vercel (`vercel --prod`)
- [ ] Set environment variables in Vercel dashboard
- [ ] Add `clientcontact.io` domain in Vercel
- [ ] Copy DNS records from Vercel
- [ ] Update A record in Squarespace (point to Vercel IP)
- [ ] Update CNAME record in Squarespace (point to Vercel CNAME)
- [ ] Keep MX records for email (if using Squarespace email)
- [ ] Wait for DNS propagation (24-48 hours)
- [ ] Verify DNS propagation using DNS checker
- [ ] Check Vercel dashboard for domain status
- [ ] Wait for SSL certificate (5-10 minutes)
- [ ] Test `https://clientcontact.io` in browser
- [ ] Verify landing page loads (not "Coming Soon")

---

## 🎯 Expected Result

After completing these steps:
- ✅ `clientcontact.io` → Points to Vercel deployment
- ✅ Shows ClientContact.IO landing page (not "Coming Soon")
- ✅ `www.clientcontact.io` → Also works (optional)
- ✅ HTTPS/SSL → Automatically enabled
- ✅ Email → Still works (if using Squarespace email)

---

## 🚨 Important Notes

1. **DNS Propagation Time:**
   - Can take 24-48 hours globally
   - Often works within minutes in your location
   - Be patient and verify using DNS checker

2. **Vercel IP Addresses:**
   - Vercel may provide different IPs than examples
   - **Always use the exact values Vercel shows you**
   - Don't use example IPs from this guide

3. **Squarespace Email:**
   - Keep MX records pointing to Squarespace
   - Don't delete or change MX records
   - Only update A and CNAME records

4. **First Deployment:**
   - Build errors are already fixed
   - Deployment should succeed
   - If build fails, check Vercel logs

---

**Next Steps:** Follow the steps above in order. Start with deploying to Vercel, then configure the domain.

