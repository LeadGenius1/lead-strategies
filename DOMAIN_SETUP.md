# Custom Domain Setup for LeadSite.io

## ✅ Domain Added to Railway

The custom domain `leadsite.io` has been successfully added to your Railway deployment.

## 🔧 DNS Configuration Required

To complete the setup, you need to add the following DNS record to your domain registrar (where you purchased leadsite.io):

### DNS Record Details

| Type  | Name | Value                    | TTL  |
|-------|------|--------------------------|------|
| CNAME | @    | nevuabwf.up.railway.app  | Auto |

### Step-by-Step Instructions

1. **Log in to your domain registrar** (e.g., GoDaddy, Namecheap, Cloudflare, etc.)
2. **Navigate to DNS Management** for leadsite.io
3. **Add a new CNAME record** with the following settings:
   - **Type**: CNAME
   - **Name**: @ (this represents the root domain)
   - **Value/Target**: `nevuabwf.up.railway.app`
   - **TTL**: Automatic (or 3600 seconds)

4. **Save the DNS record**

### Important Notes

- **Propagation Time**: DNS changes can take up to 72 hours to propagate worldwide, but typically complete within 15-30 minutes
- **Root Domain**: The "@" symbol represents the root domain (leadsite.io), not a subdomain
- **SSL Certificate**: Railway will automatically provision an SSL certificate once DNS is verified

## 🔍 Verifying DNS Configuration

After adding the DNS record, you can verify it using these methods:

### Method 1: Command Line (Windows PowerShell)
```powershell
nslookup leadsite.io
```

### Method 2: Online Tools
- https://dnschecker.org/#CNAME/leadsite.io
- https://mxtoolbox.com/SuperTool.aspx?action=cname%3aleadsite.io

### Method 3: Railway CLI
```bash
railway domain
```

## 📋 Additional Domains to Configure

Based on your project structure, you may want to set up these additional domains:

1. **api.leadsite.ai** - For backend API
2. **clientcontact.io** - For ClientContact platform
3. **tackle.io** - For Tackle platform
4. **videosite.io** - For VideoSite platform

Would you like me to set up these domains as well?

## 🚀 Current Deployment Status

- **Project**: strong-communication
- **Environment**: production
- **Service**: superb-possibility
- **Railway Domain**: https://superb-possibility-production.up.railway.app
- **Custom Domain**: https://leadsite.io (pending DNS verification)

## 🔗 Next Steps

1. ✅ Add DNS CNAME record at your registrar
2. ⏳ Wait for DNS propagation (15 minutes - 72 hours)
3. 🔒 Railway will auto-provision SSL certificate
4. ✅ Visit https://leadsite.io to verify

## 🆘 Troubleshooting

### If the domain doesn't work after 24 hours:

1. **Verify DNS Record**:
   ```powershell
   nslookup leadsite.io
   ```
   Should return: `nevuabwf.up.railway.app`

2. **Check Railway Status**:
   ```bash
   railway domain
   ```

3. **Clear Browser Cache**:
   - Chrome: Ctrl + Shift + Delete
   - Edge: Ctrl + Shift + Delete

4. **Try Incognito/Private Mode**

5. **Contact Railway Support**: https://railway.app/help

## 📞 Support

If you need help with:
- **DNS Configuration**: Contact your domain registrar's support
- **Railway Deployment**: https://railway.app/help
- **Application Issues**: Check logs with `railway logs`
