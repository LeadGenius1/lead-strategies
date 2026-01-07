# LeadSite.IO Frontend (Tier 2)

Professional lead generation platform with website integration and email campaigns. Built with Aether UI - Black/Indigo theme.

## Features

- **Website Integration**: Embed lead capture forms into your website
- **Email Campaigns**: Automated email sequences to nurture leads
- **Analytics Dashboard**: Track leads, campaigns, and conversions
- **Aether UI**: Modern dark theme with space animations and glassmorphism

## Tech Stack

- **Next.js 14**: React framework
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Modern icon set
- **Axios**: HTTP client for API calls

## Getting Started

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

### Build for Production

```bash
npm run build
npm start
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=https://api.leadsite.ai
```

## Project Structure

```
leadsite-io-frontend/
├── app/
│   ├── layout.js          # Root layout
│   ├── page.js            # Landing page
│   ├── login/
│   │   └── page.js        # Login page
│   ├── signup/
│   │   └── page.js        # Signup page
│   ├── dashboard/
│   │   └── page.js        # Dashboard page
│   └── globals.css        # Global styles with animations
├── lib/
│   ├── api.js             # API client
│   └── auth.js            # Authentication helpers
└── package.json
```

## API Integration

All API calls connect to `https://api.leadsite.ai/api/v1`:

- **Authentication**: Login, register, logout
- **Dashboard**: Stats and overview
- **Leads**: Manage leads
- **Campaigns**: Email campaigns
- **Forms**: Website form integration

## Theme

- **Primary Colors**: Black background with Indigo/Purple accents
- **Typography**: Inter font family
- **Effects**: Space star animations, grid background, glassmorphism
- **Animations**: Float, shimmer, pulse-glow effects

## License

Private - Professional License

