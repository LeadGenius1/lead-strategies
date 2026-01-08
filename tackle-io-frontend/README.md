# Tackle.IO Frontend (Tier 5)

Enterprise lead generation platform with NASA Control theme - Dark/Teal design with interactive 3D builder.

## Features

- **Interactive 3D Builder**: Manipulate lead stack visualization with real-time controls
- **NASA Control Theme**: Dark/Teal color scheme with glassmorphism effects
- **API Integration**: Full API access for programmatic lead generation
- **White-Label**: Complete brand customization
- **Enterprise Scale**: Manage 10,000+ leads with precision

## Tech Stack

- **Next.js 14**: React framework
- **Three.js**: 3D visualization and WebGL rendering
- **GSAP**: Smooth animations and transitions
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Modern icon set

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
tackle-io-frontend/
├── app/
│   ├── layout.js          # Root layout
│   ├── page.js            # Landing page with 3D builder
│   └── globals.css        # Global styles
├── lib/
│   ├── api.js             # API client
│   └── auth.js            # Authentication helpers
├── public/
│   └── tackle-3d.js       # Three.js 3D builder logic
└── package.json
```

## API Integration

All API calls connect to `https://api.leadsite.ai/api/v1`:

- **Authentication**: Login, register, logout
- **API Keys**: Manage API keys for programmatic access
- **White-Label**: Customize branding and settings
- **Campaigns**: Create and manage lead generation campaigns
- **Dashboard**: View stats and analytics

## Deployment

Deploy to Vercel:

```bash
vercel
```

## Theme

- **Primary Colors**: Dark (#050505) background with white/teal accents
- **Typography**: Inter and Space Grotesk fonts
- **Effects**: Glassmorphism, bloom, SSAO post-processing
- **Interactions**: Smooth GSAP animations, 3D orbit controls

## License

Private - Enterprise License

