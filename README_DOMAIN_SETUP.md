# 🚀 LeadSite.io Domain Setup - Complete Guide

## 📋 Current Situation

✅ **Railway Deployment**: Running successfully
✅ **Domain Added to Railway**: leadsite.io configured
❌ **DNS Configuration**: Needs to be updated at your registrar
❌ **Website Access**: 404 error due to incorrect DNS

---

## 🎯 What You Need to Do (5 Minutes)

### 1️⃣ Find Your Domain Registrar
Where did you buy `leadsite.io`?
- Check your email for purchase confirmation
- Common registrars: GoDaddy, Namecheap, Cloudflare, Google Domains

### 2️⃣ Update DNS Record
Add this CNAME record at your registrar:

```
Type:  CNAME
Name:  @ (or blank for root domain)
Value: nevuabwf.up.railway.app
```

**Important**: Delete any old A record pointing to `76.76.21.21` first!

### 3️⃣ Wait for Propagation
- **5-15 minutes**: DNS starts updating
- **30 minutes**: Usually fully working
- **Up to 72 hours**: Complete worldwide propagation

---

## 📚 Documentation Files

I've created detailed guides to help you:

| File | Purpose | When to Use |
|------|---------|-------------|
| **URGENT_DNS_FIX.md** | ⚠️ Immediate action steps | **READ THIS FIRST** |
| **DNS_QUICK_SETUP.md** | ⚡ Quick reference | For fast setup |
| **DOMAIN_SETUP.md** | 📖 Complete documentation | For detailed info |
| **DOMAIN_STATUS_SUMMARY.md** | 📊 Status overview | To check progress |

---

## 🔍 Quick Verification

### Before DNS Update:
```powershell
nslookup leadsite.io
```
**Shows**: `76.76.21.21` ❌ Wrong server

### After DNS Update (wait 15-30 min):
```powershell
nslookup leadsite.io
```
**Should show**: `nevuabwf.up.railway.app` ✅ Correct!

### Test Website:
```
https://leadsite.io
```
**Should show**: Your application (not 404)

---

## 🎯 Quick Start Checklist

- [ ] Read `URGENT_DNS_FIX.md`
- [ ] Log into domain registrar
- [ ] Delete old A record (76.76.21.21)
- [ ] Add CNAME record (nevuabwf.up.railway.app)
- [ ] Save changes
- [ ] Wait 15-30 minutes
- [ ] Run `nslookup leadsite.io`
- [ ] Test https://leadsite.io
- [ ] Verify SSL certificate (🔒)

---

## 🌐 Railway Deployment Info

- **Project**: strong-communication
- **Service**: superb-possibility
- **Environment**: production
- **Status**: ✅ Running
- **Railway URL**: https://superb-possibility-production.up.railway.app
- **Custom Domain**: leadsite.io (pending DNS)

---

## 📞 Need Help?

### DNS Issues
- Find registrar: https://lookup.icann.org/en/lookup
- Check DNS: https://dnschecker.org/#CNAME/leadsite.io
- Contact registrar support

### Railway Issues
- View logs: `railway logs`
- Check status: `railway status`
- Support: https://railway.app/help

---

## 🚀 Next Steps After DNS Works

1. ✅ Verify https://leadsite.io loads
2. ✅ Check SSL certificate is active
3. ✅ Test all pages/routes
4. 🎯 Set up additional domains:
   - api.leadsite.ai
   - clientcontact.io
   - tackle.io
   - videosite.io

---

## 💡 Pro Tips

1. **Use incognito mode** when testing to avoid cache issues
2. **Check multiple DNS checkers** to verify propagation
3. **Don't panic** if it takes a few hours - DNS is slow
4. **Keep Railway CLI updated**: `railway version`
5. **Monitor logs**: `railway logs --tail 50`

---

## ✅ Success Indicators

Everything is working when you see:

1. ✅ `nslookup leadsite.io` → `nevuabwf.up.railway.app`
2. ✅ https://leadsite.io → Your app loads
3. ✅ Browser shows 🔒 (secure connection)
4. ✅ No 404 or certificate errors
5. ✅ Works on multiple devices/browsers

---

**🎯 START HERE**: Open `URGENT_DNS_FIX.md` for step-by-step instructions!

**⏱️ Time Estimate**: 5 minutes to update DNS + 15-30 minutes for propagation = ~35 minutes total
