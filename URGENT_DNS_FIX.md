# 🚨 URGENT: DNS Configuration Issue Detected

## ⚠️ Current Problem

Your domain `leadsite.io` is currently pointing to the **WRONG SERVER**:
- **Current IP**: `76.76.21.21` (Unknown/Old server)
- **Should point to**: `nevuabwf.up.railway.app` (Railway server)

This is why you're seeing the 404 error!

## 🔧 IMMEDIATE FIX REQUIRED

### Step 1: Log into Your Domain Registrar
Find where you registered `leadsite.io`:
- Check your email for domain purchase confirmation
- Common registrars: GoDaddy, Namecheap, Cloudflare, Google Domains

### Step 2: Delete Old DNS Records
Look for and **DELETE** these records:
- Any A record pointing to `76.76.21.21`
- Any old CNAME records
- Any ALIAS records

### Step 3: Add New CNAME Record
Add this exact record:

```
Type:  CNAME
Name:  @ (or blank for root)
Value: nevuabwf.up.railway.app
TTL:   Auto or 3600
```

### Step 4: Save Changes
Click "Save" or "Apply Changes" in your DNS manager

## 🔍 Detailed Instructions by Registrar

### If using GoDaddy:
1. Go to: https://dcc.godaddy.com/domains
2. Find `leadsite.io` → Click "DNS"
3. **DELETE** the A record with IP `76.76.21.21`
4. Click "Add" → Select "CNAME"
5. Name: `@`, Value: `nevuabwf.up.railway.app`
6. Click "Save"

### If using Namecheap:
1. Go to: https://ap.www.namecheap.com/domains/list
2. Find `leadsite.io` → Click "Manage"
3. Go to "Advanced DNS" tab
4. **DELETE** the A record with IP `76.76.21.21`
5. Click "Add New Record" → Type: "CNAME"
6. Host: `@`, Value: `nevuabwf.up.railway.app`
7. Click "Save"

### If using Cloudflare:
1. Go to: https://dash.cloudflare.com
2. Select `leadsite.io` domain
3. Go to "DNS" → "Records"
4. **DELETE** the A record with IP `76.76.21.21`
5. Click "Add record" → Type: "CNAME"
6. Name: `@`, Target: `nevuabwf.up.railway.app`
7. **IMPORTANT**: Set Proxy status to "DNS only" (gray cloud ☁️)
8. Click "Save"

### If using Google Domains:
1. Go to: https://domains.google.com
2. Find `leadsite.io` → Click "Manage"
3. Go to "DNS" section
4. **DELETE** the A record with IP `76.76.21.21`
5. Click "Add custom record"
6. Type: "CNAME", Host: "@", Data: `nevuabwf.up.railway.app`
7. Click "Save"

## 🎯 What's Happening

```
Current (WRONG):
leadsite.io → 76.76.21.21 → 404 Error ❌

After Fix (CORRECT):
leadsite.io → nevuabwf.up.railway.app → Your Railway App ✅
```

## ⏱️ Timeline

- **Immediate**: Changes saved at registrar
- **5-15 minutes**: DNS starts propagating
- **30 minutes - 2 hours**: Most users see new site
- **Up to 72 hours**: Complete worldwide propagation

## ✅ Verification Steps

### 1. Check DNS (Wait 15 minutes after making changes)
```powershell
nslookup leadsite.io
```
**Should return**: `nevuabwf.up.railway.app` (not 76.76.21.21)

### 2. Check Online
Visit: https://dnschecker.org/#CNAME/leadsite.io
**Should show**: CNAME pointing to `nevuabwf.up.railway.app`

### 3. Test Website
Visit: https://leadsite.io
**Should show**: Your application (not 404 error)

## 🔴 Troubleshooting

### "I can't find the DNS settings"
- Check your registrar's help docs
- Contact their support chat/phone
- Search: "[Your Registrar] how to change DNS records"

### "It says I can't use CNAME at root"
Some registrars don't support CNAME at root. Try:
1. Use ALIAS or ANAME record instead (same value)
2. OR add A records pointing to Railway's IPs
3. OR contact registrar support for help

### "Still showing 404 after 24 hours"
1. Verify DNS: `nslookup leadsite.io` should show Railway
2. Clear browser cache: Ctrl + Shift + Delete
3. Try incognito mode
4. Check Railway logs: `railway logs`
5. Contact Railway support: https://railway.app/help

## 📊 Current Status

| Item | Status |
|------|--------|
| Domain added to Railway | ✅ Complete |
| DNS pointing to Railway | ❌ **NEEDS FIX** |
| SSL Certificate | ⏳ Waiting for DNS |
| Website accessible | ❌ **NEEDS FIX** |

## 🎯 Success Checklist

- [ ] Log into domain registrar
- [ ] Delete old A record (76.76.21.21)
- [ ] Add new CNAME record (nevuabwf.up.railway.app)
- [ ] Save changes
- [ ] Wait 15-30 minutes
- [ ] Verify with `nslookup leadsite.io`
- [ ] Test https://leadsite.io in browser
- [ ] Confirm SSL certificate is active

## 📞 Support Resources

- **Find your registrar**: https://lookup.icann.org/en/lookup
- **Railway support**: https://railway.app/help
- **DNS checker**: https://dnschecker.org
- **SSL checker**: https://www.ssllabs.com/ssltest/

---

**⚡ ACTION REQUIRED**: Update DNS records at your domain registrar NOW to fix the 404 error!
