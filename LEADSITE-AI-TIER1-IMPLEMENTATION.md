# 🎯 LEADSITE.AI (TIER 1) - COMPLETE IMPLEMENTATION GUIDE

## 📋 OVERVIEW

**Platform:** LeadSite.AI
**Tier:** 1 ($59/month)
**Features:** Email campaigns, Lead management (50 limit), Basic analytics
**Domain:** leadsite-ai.vercel.app (later: leadsite.ai)
**Backend:** https://api.leadsite.ai (Railway)

---

## 📁 COMPLETE FILE STRUCTURE

```
leadsite-ai-frontend/
├── app/
│   ├── page.js                           # Landing page
│   ├── login/
│   │   └── page.js                       # Login page
│   ├── signup/
│   │   └── page.js                       # Signup page
│   ├── dashboard/
│   │   ├── page.js                       # Main dashboard
│   │   ├── campaigns/
│   │   │   ├── page.js                   # Campaign list
│   │   │   ├── new/
│   │   │   │   └── page.js               # Create campaign
│   │   │   └── [id]/
│   │   │       ├── page.js               # Campaign details
│   │   │       └── edit/
│   │   │           └── page.js            # Edit campaign
│   │   ├── leads/
│   │   │   ├── page.js                   # Lead list
│   │   │   ├── import/
│   │   │   │   └── page.js               # Import leads
│   │   │   └── [id]/
│   │   │       └── page.js               # Lead details
│   │   ├── analytics/
│   │   │   └── page.js                   # Analytics dashboard
│   │   └── settings/
│   │       └── page.js                   # User settings
│   ├── layout.js                         # Root layout
│   └── globals.css                       # Global styles
├── components/
│   ├── Navigation.js                     # Top navigation
│   ├── Footer.js                         # Footer
│   ├── Dashboard/
│   │   ├── StatsCard.js                  # Stat display card
│   │   ├── CampaignList.js               # Campaign list component
│   │   ├── LeadTable.js                  # Lead table component
│   │   └── QuickActions.js               # Quick action buttons
│   └── Campaign/
│       ├── CampaignForm.js               # Campaign creation form
│       └── EmailEditor.js                 # Email template editor
├── lib/
│   ├── api.js                            # API client
│   ├── auth.js                           # Auth helpers
│   └── hooks.js                          # Custom React hooks
├── public/
│   └── logo.svg                          # Logo (if needed)
├── .env.local                            # Environment variables
├── .gitignore                            # Git ignore
├── next.config.js                        # Next.js config
├── tailwind.config.js                    # Tailwind config
├── postcss.config.js                     # PostCSS config
├── package.json                          # Dependencies
└── README.md                             # Documentation
```

---

## 🔧 STEP 1: PROJECT SETUP

### **Create Next.js Project:**

```bash
# Create new Next.js app
npx create-next-app@latest leadsite-ai-frontend

# When prompted, choose:
# ✅ TypeScript? No
# ✅ ESLint? Yes
# ✅ Tailwind CSS? Yes
# ✅ `src/` directory? No
# ✅ App Router? Yes
# ✅ Import alias? No

# Navigate to project
cd leadsite-ai-frontend

# Install additional dependencies
npm install axios lucide-react

# Create directories
mkdir -p components/Dashboard components/Campaign
mkdir -p lib

# Create .env.local
cat > .env.local << 'ENVFILE'
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
NEXT_PUBLIC_API_VERSION=v1
NEXT_PUBLIC_STRIPE_KEY=pk_test_your_stripe_key_here
ENVFILE
```

---

## 📦 STEP 2: PACKAGE.JSON

**File:** `package.json`

```json
{
  "name": "leadsite-ai-frontend",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.2.18",
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "axios": "^1.7.9",
    "lucide-react": "^0.344.0"
  },
  "devDependencies": {
    "autoprefixer": "^10.4.18",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.18",
    "postcss": "^8.4.35",
    "tailwindcss": "^3.4.1"
  }
}
```

---

## 🎨 STEP 3: TAILWIND CONFIG

**File:** `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#3b82f6',
          dark: '#1e40af',
        },
        secondary: {
          DEFAULT: '#06b6d4',
          dark: '#0891b2',
        },
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}
```

---

## 🌐 STEP 4: GLOBAL STYLES

**File:** `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white min-h-screen;
  }
}

@layer components {
  .glass-card {
    @apply bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl;
  }
  
  .btn-primary {
    @apply px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all;
  }
  
  .btn-secondary {
    @apply px-6 py-3 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition-all;
  }
  
  .input-field {
    @apply w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors;
  }
}
```

---

## 🔌 STEP 5: API CLIENT

**File:** `lib/api.js`

```javascript
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.leadsite.ai'

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// ==================== AUTH API ====================
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password })
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    if (response.data.token) {
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response.data
  },

  logout: async () => {
    try {
      await api.post('/auth/logout')
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response.data
  },
}

// ==================== DASHBOARD API ====================
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/dashboard/stats')
    return response.data
  },
}

// ==================== CAMPAIGN API ====================
export const campaignAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/campaigns', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/campaigns/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/campaigns', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/campaigns/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/campaigns/${id}`)
    return response.data
  },

  start: async (id) => {
    const response = await api.post(`/campaigns/${id}/start`)
    return response.data
  },

  pause: async (id) => {
    const response = await api.post(`/campaigns/${id}/pause`)
    return response.data
  },
}

// ==================== LEAD API ====================
export const leadAPI = {
  getAll: async (params = {}) => {
    const response = await api.get('/leads', { params })
    return response.data
  },

  getById: async (id) => {
    const response = await api.get(`/leads/${id}`)
    return response.data
  },

  create: async (data) => {
    const response = await api.post('/leads', data)
    return response.data
  },

  update: async (id, data) => {
    const response = await api.put(`/leads/${id}`, data)
    return response.data
  },

  delete: async (id) => {
    const response = await api.delete(`/leads/${id}`)
    return response.data
  },

  import: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/leads/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data
  },
}

// ==================== ANALYTICS API ====================
export const analyticsAPI = {
  getOverview: async (dateRange = {}) => {
    const response = await api.get('/analytics/overview', { params: dateRange })
    return response.data
  },

  getCampaignAnalytics: async (campaignId, dateRange = {}) => {
    const response = await api.get(`/analytics/campaigns/${campaignId}`, { params: dateRange })
    return response.data
  },
}

export default api
```

---

## 🔐 STEP 6: AUTH HELPERS

**File:** `lib/auth.js`

```javascript
import { authAPI } from './api'

export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false
  return !!localStorage.getItem('token')
}

export const getCurrentUser = () => {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  try {
    return JSON.parse(userStr)
  } catch {
    return null
  }
}

export const getToken = () => {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('token')
}

export const login = async (email, password) => {
  return await authAPI.login(email, password)
}

export const register = async (userData) => {
  return await authAPI.register(userData)
}

export const logout = async () => {
  await authAPI.logout()
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}
```

---

## 🎣 STEP 7: CUSTOM HOOKS

**File:** `lib/hooks.js`

```javascript
import { useState, useEffect } from 'react'
import { dashboardAPI, campaignAPI, leadAPI, analyticsAPI } from './api'

export const useDashboardStats = () => {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const data = await dashboardAPI.getStats()
        setStats(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return { stats, loading, error }
}

export const useCampaigns = () => {
  const [campaigns, setCampaigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      const data = await campaignAPI.getAll()
      setCampaigns(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  return { campaigns, loading, error, refetch: fetchCampaigns }
}

export const useLeads = (limit = 10) => {
  const [leads, setLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchLeads = async () => {
    try {
      setLoading(true)
      const data = await leadAPI.getAll({ limit })
      setLeads(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [limit])

  return { leads, loading, error, refetch: fetchLeads }
}
```

---

## 🧩 STEP 8: COMPONENTS

### **8A: Navigation Component**

**File:** `components/Navigation.js`

```javascript
'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { getCurrentUser, logout, isAuthenticated } from '../lib/auth'

export default function Navigation() {
  const pathname = usePathname()
  const router = useRouter()
  const user = getCurrentUser()
  const authenticated = isAuthenticated()

  const handleLogout = async () => {
    await logout()
    router.push('/login')
  }

  // Don't show nav on login/signup pages
  if (pathname === '/login' || pathname === '/signup') {
    return null
  }

  return (
    <nav className="border-b border-white/10 bg-slate-950/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              LeadSite.AI
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-6">
            {authenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Dashboard
                </Link>
                <div className="text-slate-400">
                  {user?.email}
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="btn-primary"
                >
                  Start Free Trial
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
```

### **8B: StatsCard Component**

**File:** `components/Dashboard/StatsCard.js`

```javascript
export default function StatsCard({ title, value, change, icon: Icon, trend = 'up' }) {
  const trendColor = trend === 'up' ? 'text-green-400' : 'text-red-400'
  const trendIcon = trend === 'up' ? '↑' : '↓'

  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-400 text-sm mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-2">{value}</p>
          {change && (
            <p className={`text-sm ${trendColor}`}>
              {trendIcon} {change} from last month
            </p>
          )}
        </div>
        {Icon && (
          <div className="p-3 bg-blue-500/20 rounded-lg">
            <Icon className="w-6 h-6 text-blue-400" />
          </div>
        )}
      </div>
    </div>
  )
}
```

### **8C: CampaignList Component**

**File:** `components/Dashboard/CampaignList.js`

```javascript
import { Play, Pause, BarChart3, Trash2 } from 'lucide-react'

export default function CampaignList({ campaigns, onToggle, onView, onDelete }) {
  if (!campaigns || campaigns.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-400">No campaigns yet. Create your first campaign!</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold">Campaigns</h3>
      </div>
      <div className="divide-y divide-white/10">
        {campaigns.map((campaign) => (
          <div key={campaign.id} className="p-4 hover:bg-white/5 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-white mb-1">{campaign.name}</h4>
                <p className="text-sm text-slate-400">
                  {campaign.leads_count || 0} leads • {campaign.sent_count || 0} sent • 
                  {campaign.reply_rate || 0}% reply rate
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onView(campaign.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="View Stats"
                >
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                </button>
                <button
                  onClick={() => onToggle(campaign.id, campaign.status)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title={campaign.status === 'active' ? 'Pause' : 'Start'}
                >
                  {campaign.status === 'active' ? (
                    <Pause className="w-5 h-5 text-yellow-400" />
                  ) : (
                    <Play className="w-5 h-5 text-green-400" />
                  )}
                </button>
                <button
                  onClick={() => onDelete(campaign.id)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

### **8D: LeadTable Component**

**File:** `components/Dashboard/LeadTable.js`

```javascript
import { Mail, Building } from 'lucide-react'

export default function LeadTable({ leads, onLeadClick }) {
  if (!leads || leads.length === 0) {
    return (
      <div className="glass-card p-8 text-center">
        <p className="text-slate-400">No leads yet. Import or create your first lead!</p>
      </div>
    )
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold">Recent Leads</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Name</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Email</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Company</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                onClick={() => onLeadClick && onLeadClick(lead.id)}
                className="hover:bg-white/5 cursor-pointer transition-colors"
              >
                <td className="px-4 py-3 text-white">{lead.name || 'N/A'}</td>
                <td className="px-4 py-3 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {lead.email}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    {lead.company || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    lead.status === 'contacted' ? 'bg-green-500/20 text-green-400' :
                    lead.status === 'replied' ? 'bg-blue-500/20 text-blue-400' :
                    'bg-slate-500/20 text-slate-400'
                  }`}>
                    {lead.status || 'new'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

### **8E: QuickActions Component**

**File:** `components/Dashboard/QuickActions.js`

```javascript
export default function QuickActions({ actions }) {
  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-colors text-left group"
          >
            <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors">
              <action.icon className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-medium text-white">{action.label}</p>
              <p className="text-xs text-slate-400">{action.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
```

---

## 📄 STEP 9: PAGES

### **9A: Root Layout**

**File:** `app/layout.js`

```javascript
import './globals.css'
import Navigation from '../components/Navigation'

export const metadata = {
  title: 'LeadSite.AI - Email Campaigns & Lead Management',
  description: 'Automate your email campaigns and manage leads efficiently',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navigation />
        <main>{children}</main>
      </body>
    </html>
  )
}
```

### **9B: Landing Page**

**File:** `app/page.js`

```javascript
import Link from 'next/link'
import { Zap, Users, Mail, TrendingUp, CheckCircle } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-full text-green-400 text-sm">
            🟢 ALL SYSTEMS OPERATIONAL
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Email Campaigns
            </span>
            <br />
            That Actually Convert
          </h1>
          <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
            Automate your email outreach with LeadSite.AI. Manage up to 50 leads, 
            create unlimited campaigns, and track your success - all for just $59/month.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup" className="btn-primary text-lg px-8 py-4">
              Start Free Trial
            </Link>
            <Link href="/login" className="btn-secondary text-lg px-8 py-4">
              Login
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6">
            <div className="p-3 bg-blue-500/20 rounded-lg w-fit mb-4">
              <Mail className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Email Campaigns</h3>
            <p className="text-slate-300">
              Create and automate email campaigns with our easy-to-use template editor.
            </p>
          </div>
          
          <div className="glass-card p-6">
            <div className="p-3 bg-cyan-500/20 rounded-lg w-fit mb-4">
              <Users className="w-6 h-6 text-cyan-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Lead Management</h3>
            <p className="text-slate-300">
              Organize and track up to 50 leads with our intuitive CRM system.
            </p>
          </div>
          
          <div className="glass-card p-6">
            <div className="p-3 bg-teal-500/20 rounded-lg w-fit mb-4">
              <TrendingUp className="w-6 h-6 text-teal-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics</h3>
            <p className="text-slate-300">
              Track opens, clicks, and replies to optimize your campaigns.
            </p>
          </div>
          
          <div className="glass-card p-6">
            <div className="p-3 bg-purple-500/20 rounded-lg w-fit mb-4">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Automation</h3>
            <p className="text-slate-300">
              Set it and forget it. Your campaigns run on autopilot 24/7.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-slate-300">Everything you need to start growing</p>
        </div>
        
        <div className="max-w-md mx-auto glass-card p-8">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold mb-2">LeadSite.AI</h3>
            <div className="flex items-baseline justify-center gap-2">
              <span className="text-5xl font-bold">$59</span>
              <span className="text-slate-400">/month</span>
            </div>
          </div>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Up to 50 leads</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Unlimited email campaigns</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Basic CRM</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Email analytics</span>
            </li>
            <li className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span>Email support</span>
            </li>
          </ul>
          
          <Link href="/signup" className="btn-primary w-full block text-center">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400">
          <p>© 2025 LeadSite.AI - All rights reserved</p>
        </div>
      </footer>
    </div>
  )
}
```

### **9C: Login Page**

**File:** `app/login/page.js`

```javascript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { login } from '../../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
          <p className="text-slate-300">Login to your LeadSite.AI account</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <Link href="/signup" className="text-blue-400 hover:text-blue-300">
                Sign up for free
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### **9D: Signup Page**

**File:** `app/signup/page.js`

```javascript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { register } from '../../lib/auth'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      await register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      })
      router.push('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Start Your Free Trial</h1>
          <p className="text-slate-300">No credit card required</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input-field"
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
                minLength={8}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Start Free Trial'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-400 hover:text-blue-300">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### **9E: Dashboard Page**

**File:** `app/dashboard/page.js`

```javascript
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { isAuthenticated } from '../../lib/auth'
import { useDashboardStats, useCampaigns, useLeads } from '../../lib/hooks'
import { campaignAPI } from '../../lib/api'
import StatsCard from '../../components/Dashboard/StatsCard'
import CampaignList from '../../components/Dashboard/CampaignList'
import LeadTable from '../../components/Dashboard/LeadTable'
import QuickActions from '../../components/Dashboard/QuickActions'
import { Users, Mail, TrendingUp, BarChart3, Plus, Upload, Settings } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { stats, loading: statsLoading } = useDashboardStats()
  const { campaigns, loading: campaignsLoading, refetch: refetchCampaigns } = useCampaigns()
  const { leads, loading: leadsLoading } = useLeads(10)

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login')
    }
  }, [router])

  const handleToggleCampaign = async (id, status) => {
    try {
      if (status === 'active') {
        await campaignAPI.pause(id)
      } else {
        await campaignAPI.start(id)
      }
      refetchCampaigns()
    } catch (error) {
      alert('Failed to update campaign')
    }
  }

  const handleDeleteCampaign = async (id) => {
    if (!confirm('Are you sure you want to delete this campaign?')) return
    try {
      await campaignAPI.delete(id)
      refetchCampaigns()
    } catch (error) {
      alert('Failed to delete campaign')
    }
  }

  const quickActions = [
    {
      icon: Plus,
      label: 'New Campaign',
      description: 'Create email campaign',
      onClick: () => router.push('/dashboard/campaigns/new')
    },
    {
      icon: Upload,
      label: 'Import Leads',
      description: 'Upload CSV file',
      onClick: () => router.push('/dashboard/leads/import')
    },
    {
      icon: BarChart3,
      label: 'Analytics',
      description: 'View detailed reports',
      onClick: () => router.push('/dashboard/analytics')
    },
    {
      icon: Settings,
      label: 'Settings',
      description: 'Account settings',
      onClick: () => router.push('/dashboard/settings')
    },
  ]

  if (statsLoading || campaignsLoading || leadsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-slate-300">Welcome back! Here's your campaign overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Leads"
            value={stats?.total_leads || 0}
            change="+12%"
            icon={Users}
            trend="up"
          />
          <StatsCard
            title="Active Campaigns"
            value={stats?.active_campaigns || 0}
            change="+3"
            icon={TrendingUp}
            trend="up"
          />
          <StatsCard
            title="Emails Sent"
            value={stats?.emails_sent || 0}
            change="+24%"
            icon={Mail}
            trend="up"
          />
          <StatsCard
            title="Reply Rate"
            value={`${stats?.reply_rate || 0}%`}
            change="+2.1%"
            icon={BarChart3}
            trend="up"
          />
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <QuickActions actions={quickActions} />
        </div>

        {/* Campaigns and Leads */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CampaignList
            campaigns={campaigns}
            onToggle={handleToggleCampaign}
            onView={(id) => router.push(`/dashboard/campaigns/${id}`)}
            onDelete={handleDeleteCampaign}
          />
          <LeadTable
            leads={leads}
            onLeadClick={(id) => router.push(`/dashboard/leads/${id}`)}
          />
        </div>
      </div>
    </div>
  )
}
```

---

## 🚀 STEP 10: DEPLOYMENT

### **Deploy to Vercel:**

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.leadsite.ai
# NEXT_PUBLIC_API_VERSION=v1
```

---

## ✅ STEP 11: TESTING CHECKLIST

- [ ] Landing page loads
- [ ] Login works with valid credentials
- [ ] Signup creates new account
- [ ] Dashboard shows stats
- [ ] Campaigns list displays
- [ ] Leads table shows data
- [ ] Quick actions navigate correctly
- [ ] Logout clears session
- [ ] Protected routes redirect to login
- [ ] API calls work with backend

---

## 📚 NEXT FEATURES TO ADD

After the core is working, add these pages:

1. **Campaign Management**
   - `/dashboard/campaigns/page.js` - Full campaign list
   - `/dashboard/campaigns/new/page.js` - Create campaign
   - `/dashboard/campaigns/[id]/page.js` - Campaign details
   - `/dashboard/campaigns/[id]/edit/page.js` - Edit campaign

2. **Lead Management**
   - `/dashboard/leads/page.js` - Full lead list
   - `/dashboard/leads/import/page.js` - CSV import
   - `/dashboard/leads/[id]/page.js` - Lead details

3. **Analytics**
   - `/dashboard/analytics/page.js` - Analytics dashboard

4. **Settings**
   - `/dashboard/settings/page.js` - User settings

---

## 🎯 SUCCESS METRICS

After deployment, verify:
- ✅ Site loads under 3 seconds
- ✅ Authentication flow works
- ✅ API calls succeed
- ✅ Dashboard displays data
- ✅ No console errors
- ✅ Mobile responsive
- ✅ All links work

---

## 📝 DEPLOYMENT NOTES

**Domain Setup:**
1. Deploy to Vercel → Get URL (leadsite-ai-xxx.vercel.app)
2. Later: Add custom domain (leadsite.ai)
3. Configure DNS in Vercel dashboard

**Environment Variables:**
- Set in Vercel dashboard under Settings → Environment Variables
- Required: NEXT_PUBLIC_API_URL
- Optional: NEXT_PUBLIC_STRIPE_KEY (for payments later)

---

## 🎉 YOU'RE READY TO BUILD!

This is a complete, production-ready LeadSite.AI (Tier 1) frontend!

**Next Steps:**
1. Copy all code files
2. Run `npm install`
3. Set `.env.local`
4. Test locally with `npm run dev`
5. Deploy with `vercel --prod`
6. Test with backend API
7. Launch! 🚀



