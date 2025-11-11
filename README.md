# Safe Logistics

A modern logistics management application built with **Next.js**, **Supabase**, and deployed on **Vercel**.

## 🚀 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org) with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database & Auth**: [Supabase](https://supabase.com)
- **Deployment**: [Vercel](https://vercel.com)

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- A Supabase account ([sign up here](https://supabase.com))
- A Vercel account ([sign up here](https://vercel.com))

## 🛠️ Setup Instructions

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd safe-logistics-
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > API
3. Copy your project URL and anon/public key
4. Create a `.env.local` file in the root directory:

```bash
cp .env.local.example .env.local
```

5. Update `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

## 🚢 Deploy to Vercel

### Option 1: Deploy via Vercel Dashboard

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts and add your environment variables when prompted.

## 📁 Project Structure

```
safe-logistics-/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── lib/                   # Utility functions
│   └── supabase/          # Supabase client setup
│       ├── client.ts      # Browser client
│       ├── server.ts      # Server client
│       └── middleware.ts  # Middleware utilities
├── middleware.ts          # Next.js middleware
├── .env.local.example     # Environment variables template
└── vercel.json           # Vercel configuration
```

## 🔐 Authentication Setup

This project uses Supabase for authentication. To enable authentication:

1. In your Supabase dashboard, go to Authentication > Providers
2. Enable your preferred authentication providers (Email, Google, GitHub, etc.)
3. Configure redirect URLs:
   - Site URL: `http://localhost:3000` (development)
   - Site URL: `https://your-domain.vercel.app` (production)
   - Redirect URLs: Add both development and production URLs

## 🧪 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 📚 Learn More

### Next.js
- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

### Vercel
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

