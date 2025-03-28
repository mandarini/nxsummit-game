# 🎮 Nx Summit Game & Check-In App

This is the official event web app for the Nx Summit – built to make check-ins smoother and add a layer of fun and gamification to the day.

## 🌟 Features

### 📱 Check-in System

- Staff can quickly check in attendees by scanning QR codes
- Real-time status updates
- Efficient queue management

### 🎫 Attendee Ticket Page

- Personalized ticket link for each attendee (e.g., `https://nxsummit.com/ticket?email=...`)
- Features:
  - Unique QR code
  - Name and check-in status
  - Game interface (when active)
  - Points display

### 🎲 Gamification System

Once checked in, attendees can:

- Scan other attendees' QR codes
- Earn points for each unique interaction
- Collect bonus points from Nx team members
- Discover hidden QR codes around the venue

### 🎁 Bonus Points System

- Hidden QR codes throughout the venue
- Staff can award manual bonus points for:
  - Asking questions
  - Participating in discussions
  - Other meaningful interactions

### 🎯 Admin Features

- **Check-In Scanner**: Fast attendee processing
- **Admin Dashboard**:
  - Real-time attendee management
  - Points tracking
  - Game state control
  - Manual point awards
- **Raffle System**:
  - Two drawing modes:
    - Weighted (probability based on points)
    - Shares-based (one entry per point)
  - Live drawing animation
  - Winner tracking

## 🛠️ Tech Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase
- **QR Code**:
  - Scanning: html5-qrcode
  - Generation: qrcode.react
- **Serverless**: Supabase Edge Functions

## 📋 Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- Supabase project

## 🔧 Environment Setup

1. Create a `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

2. Set up Supabase environment variables:

- `STAFF_ACCESS_PASSWORD`: For staff authentication
- `SUPABASE_URL`: Your project URL
- `SUPABASE_ANON_KEY`: Public API key
- `SUPABASE_SERVICE_ROLE_KEY`: Admin API key

## 🚀 Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

## 📊 Database Schema

### Attendees

```sql
CREATE TABLE attendees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  checked_in boolean DEFAULT false,
  points integer DEFAULT 0,
  value integer DEFAULT 1,
  role text DEFAULT 'attendee' NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Scans

```sql
CREATE TABLE scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_id uuid REFERENCES attendees(id),
  scanned_id uuid REFERENCES attendees(id),
  timestamp timestamptz DEFAULT now(),
  UNIQUE(scanner_id, scanned_id)
);
```

### Bonus Codes

```sql
CREATE TABLE bonus_codes (
  code text PRIMARY KEY,
  description text NOT NULL,
  points integer NOT NULL,
  max_claims integer,
  created_at timestamptz DEFAULT now()
);
```

### Bonus Claims

```sql
CREATE TABLE bonus_claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id uuid REFERENCES attendees(id),
  bonus_code text REFERENCES bonus_codes(code),
  claimed_at timestamptz DEFAULT now(),
  UNIQUE(attendee_id, bonus_code)
);
```

### Raffle Winners

```sql
CREATE TABLE raffle_winners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attendee_id uuid REFERENCES attendees(id),
  raffle_type text NOT NULL,
  created_at timestamptz DEFAULT now()
);
```

### Settings

```sql
CREATE TABLE settings (
  key text PRIMARY KEY,
  value boolean NOT NULL,
  updated_at timestamptz DEFAULT now()
);
```

## 📁 Project Structure

```
├── src/
│   ├── components/     # Reusable React components
│   │   ├── admin/     # Admin-specific components
│   │   └── ...
│   ├── lib/           # Utility functions and API clients
│   ├── pages/         # Page components
│   └── main.tsx       # Application entry point
├── supabase/
│   ├── functions/     # Edge Functions
│   └── migrations/    # Database migrations
└── public/           # Static assets
```

## 🔒 Security Features

- Row Level Security (RLS) policies
- Staff authentication with password protection
- Duplicate scan prevention
- Role-based access control
- Environment variable protection

## 🎯 Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## 🎮 Game Mechanics

### Points System

- Each attendee starts with 0 points
- Points are earned through:
  - Scanning other attendees
  - Finding bonus QR codes
  - Staff awards
  - Participation rewards

### Raffle System

Two drawing modes:

1. **Weighted Raffle**:
   - Probability = attendee_points / total_points
   - Fair chance for everyone, weighted by participation
2. **Shares-Based Raffle**:
   - Each point = one entry
   - More points = more chances to win

## 📄 License

MIT License - see LICENSE file for details
