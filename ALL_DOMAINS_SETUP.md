# 🌐 All Custom Domains Setup - Complete Guide

**Last Updated**: January 8, 2026
**Status**: ✅ All domains added to Railway | ⚠️ DNS configuration required

---

## 📊 Domains Added to Railway

All 6 custom domains have been successfully added to your Railway deployment:

| # | Domain | Status | CNAME Target |
|---|--------|--------|--------------|
| 1 | **leadsite.io** | ✅ Added | `nevuabwf.up.railway.app` |
| 2 | **clientcontact.io** | ✅ Added | `lipy7nr6.up.railway.app` |
| 3 | **leadsite.ai** | ✅ Added | `ue205c3b.up.railway.app` |
| 4 | **aileadstrategies.com** | ✅ Added | `q8hj95mm.up.railway.app` |
| 5 | **tackle.io** | ✅ Added | `r6ozv066.up.railway.app` |
| 6 | **video-site.com** | ✅ Added | `oy74xvsq.up.railway.app` |

---

## 🎯 DNS Configuration Required

For each domain, you need to add a CNAME record at your domain registrar:

### 1. leadsite.io
```
Type:  CNAME
Name:  @
Value: nevuabwf.up.railway.app
TTL:   Auto or 3600
```

### 2. clientcontact.io
```
Type:  CNAME
Name:  @
Value: lipy7nr6.up.railway.app
TTL:   Auto or 3600
```

### 3. leadsite.ai
```
Type:  CNAME
Name:  @
Value: ue205c3b.up.railway.app
TTL:   Auto or 3600
```

### 4. aileadstrategies.com
```
Type:  CNAME
Name:  @
Value: q8hj95mm.up.railway.app
TTL:   Auto or 3600
```

### 5. tackle.io
```
Type:  CNAME
Name:  @
Value: r6ozv066.up.railway.app
TTL:   Auto or 3600
```

### 6. video-site.com
```
Type:  CNAME
Name:  @
Value: oy74xvsq.up.railway.app
TTL:   Auto or 3600
```

---

## 📋 Step-by-Step Instructions

### For Each Domain:

1. **Log into your domain registrar** (where you purchased the domain)
   - GoDaddy, Namecheap, Cloudflare, Google Domains, etc.

2. **Navigate to DNS Management** for the domain

3. **Delete any existing A records** pointing to old IPs

4. **Add the CNAME record** using the values above

5. **Save changes**

6. **Wait 15-30 minutes** for DNS propagation

---

## 🔍 Quick Reference by Domain Purpose

### Main Platform Domains
- **leadsite.io** - Main LeadSite platform
- **leadsite.ai** - AI-powered lead generation features

### Product-Specific Domains
- **clientcontact.io** - ClientContact platform
- **tackle.io** - Tackle platform
- **video-site.com** - VideoSite platform

### Company Domain
- **aileadstrategies.com** - AI Lead Strategies company website

---

## ✅ Verification Commands

### Check DNS for Each Domain

```powershell
# Check all domains at once
nslookup leadsite.io
nslookup clientcontact.io
nslookup leadsite.ai
nslookup aileadstrategies.com
nslookup tackle.io
nslookup video-site.com
```

### Check Railway Configuration
```bash
railway domain
```

### Online DNS Checker
- https://dnschecker.org
- Enter each domain to check propagation worldwide

---

## 🚀 Railway Deployment Info

- **Project**: strong-communication
- **Environment**: production
- **Service**: superb-possibility
- **Railway URL**: https://superb-possibility-production.up.railway.app
- **Total Custom Domains**: 6

---

## ⏱️ Expected Timeline

| Time | Event |
|------|-------|
| **Now** | Update DNS at registrar for all domains |
| **+5 min** | DNS starts propagating |
| **+15-30 min** | DNS fully propagated (most cases) |
| **+30-60 min** | SSL certificates provisioned for all domains |
| **+1-2 hours** | All websites fully operational with HTTPS |
| **Up to 72 hours** | Complete worldwide DNS propagation |

---

## 🎯 Priority Order (Recommended)

If you want to set up domains one at a time, here's the recommended order:

1. **aileadstrategies.com** - Main company website (highest priority)
2. **leadsite.io** - Main platform
3. **leadsite.ai** - AI features
4. **clientcontact.io** - ClientContact platform
5. **tackle.io** - Tackle platform
6. **video-site.com** - VideoSite platform

---

## 📞 Support Resources

### Find Your Domain Registrars
Use https://lookup.icann.org/en/lookup to find where each domain is registered

### DNS Tools
- **DNS Checker**: https://dnschecker.org
- **DNS Propagation**: https://www.whatsmydns.net
- **MX Toolbox**: https://mxtoolbox.com

### Railway Support
- **Status**: `railway status`
- **Logs**: `railway logs`
- **Help**: https://railway.app/help

---

## 🎉 Success Indicators

For each domain, you'll know it's working when:

1. ✅ `nslookup [domain]` returns the correct Railway CNAME
2. ✅ `https://[domain]` loads your application
3. ✅ Browser shows secure padlock 🔒
4. ✅ No 404 or certificate errors
5. ✅ `railway domain` shows domain as active

---

## 🔴 Common Issues

### Issue: "CNAME already exists"
**Solution**: Delete the existing CNAME/A record first, then add the new one

### Issue: "Cannot use CNAME with @"
**Solution**: Some registrars don't allow CNAME at root. Use ALIAS or ANAME instead

### Issue: "Still showing 404 after 24 hours"
**Solution**: 
1. Verify DNS with `nslookup [domain]`
2. Check Railway logs: `railway logs`
3. Contact registrar support

### Issue: "Different registrars for different domains"
**Solution**: You may have purchased domains from different registrars. Check each domain separately using https://lookup.icann.org/en/lookup

---

## 📝 DNS Configuration Checklist

Use this checklist to track your progress:

### leadsite.io
- [ ] Log into registrar
- [ ] Delete old A record
- [ ] Add CNAME: `nevuabwf.up.railway.app`
- [ ] Save changes
- [ ] Verify with `nslookup leadsite.io`
- [ ] Test https://leadsite.io

### clientcontact.io
- [ ] Log into registrar
- [ ] Delete old A record
- [ ] Add CNAME: `lipy7nr6.up.railway.app`
- [ ] Save changes
- [ ] Verify with `nslookup clientcontact.io`
- [ ] Test https://clientcontact.io

### leadsite.ai
- [ ] Log into registrar
- [ ] Delete old A record
- [ ] Add CNAME: `ue205c3b.up.railway.app`
- [ ] Save changes
- [ ] Verify with `nslookup leadsite.ai`
- [ ] Test https://leadsite.ai

### aileadstrategies.com
- [ ] Log into registrar
- [ ] Delete old A record
- [ ] Add CNAME: `q8hj95mm.up.railway.app`
- [ ] Save changes
- [ ] Verify with `nslookup aileadstrategies.com`
- [ ] Test https://aileadstrategies.com

### tackle.io
- [ ] Log into registrar
- [ ] Delete old A record
- [ ] Add CNAME: `r6ozv066.up.railway.app`
- [ ] Save changes
- [ ] Verify with `nslookup tackle.io`
- [ ] Test https://tackle.io

### video-site.com
- [ ] Log into registrar
- [ ] Delete old A record
- [ ] Add CNAME: `oy74xvsq.up.railway.app`
- [ ] Save changes
- [ ] Verify with `nslookup video-site.com`
- [ ] Test https://video-site.com

---

## 🚀 Next Steps After All Domains Are Live

1. **Test all domains** - Verify each loads correctly
2. **Set up redirects** - Configure www to non-www redirects if needed
3. **Update environment variables** - Add domain-specific configs
4. **Set up monitoring** - Configure uptime monitoring for all domains
5. **Update documentation** - Update any hardcoded URLs in your app

---

## 💡 Pro Tips

1. **Batch DNS updates** - Update all domains at once to save time
2. **Use incognito mode** - Test in private browsing to avoid cache issues
3. **Check multiple locations** - Use DNS checker to verify worldwide propagation
4. **Keep records** - Save screenshots of your DNS settings
5. **Set calendar reminders** - Domain renewals are important!

---

**🎯 NEXT STEP**: Open your domain registrar(s) and add the CNAME records for all domains!

**⏱️ Time Estimate**: 5-10 minutes per domain × 6 domains = 30-60 minutes total setup time
