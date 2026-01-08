# 🚀 Quick DNS Setup for leadsite.io

## ⚡ What You Need to Do RIGHT NOW

### 1. Find Your Domain Registrar
Where did you buy `leadsite.io`? Common registrars:
- GoDaddy → https://dcc.godaddy.com/domains
- Namecheap → https://ap.www.namecheap.com/domains/list
- Cloudflare → https://dash.cloudflare.com
- Google Domains → https://domains.google.com

### 2. Add This DNS Record

```
Type:  CNAME
Name:  @ (or leave blank for root domain)
Value: nevuabwf.up.railway.app
TTL:   Automatic (or 3600)
```

### 3. Save and Wait
- Changes take 15 minutes to 72 hours
- Usually works within 30 minutes

## 🎯 Visual Guide by Registrar

### GoDaddy
1. Go to: My Products → Domains → DNS
2. Click "Add" under Records
3. Select "CNAME" from dropdown
4. Name: `@`
5. Value: `nevuabwf.up.railway.app`
6. Click "Save"

### Namecheap
1. Go to: Domain List → Manage → Advanced DNS
2. Click "Add New Record"
3. Type: `CNAME Record`
4. Host: `@`
5. Value: `nevuabwf.up.railway.app`
6. Click "Save"

### Cloudflare
1. Go to: DNS → Records
2. Click "Add record"
3. Type: `CNAME`
4. Name: `@`
5. Target: `nevuabwf.up.railway.app`
6. Proxy status: DNS only (gray cloud)
7. Click "Save"

## ✅ How to Check if It's Working

### Option 1: Command Line
```powershell
nslookup leadsite.io
```
Should show: `nevuabwf.up.railway.app`

### Option 2: Online Tool
Visit: https://dnschecker.org/#CNAME/leadsite.io

### Option 3: Browser
Try: https://leadsite.io
(May take time to work)

## 🔴 Common Issues

### Issue: "CNAME already exists"
**Solution**: Delete the existing CNAME record first, then add the new one

### Issue: "Cannot use CNAME with @"
**Solution**: Some registrars don't allow CNAME at root. Use ALIAS or ANAME instead, or contact support

### Issue: "Still showing 404 after 24 hours"
**Solution**: 
1. Verify DNS with `nslookup leadsite.io`
2. Check Railway logs: `railway logs`
3. Contact registrar support

## 📞 Need Help?

1. **DNS Issues**: Contact your domain registrar's support
2. **Railway Issues**: https://railway.app/help
3. **Can't find registrar**: Use https://lookup.icann.org/en/lookup to find where your domain is registered

## 🎉 Success Indicators

✅ `nslookup leadsite.io` returns `nevuabwf.up.railway.app`
✅ https://leadsite.io loads without 404 error
✅ SSL certificate shows as valid (🔒 in browser)
✅ Railway dashboard shows domain as "Active"

---

**Current Status**: Domain added to Railway ✅ | DNS configuration pending ⏳
