# Nx Summit Game

A digital ticket and networking game application for Nx Summit attendees. This application allows attendees to check in, manage their digital tickets, and participate in a networking game by scanning other attendees' QR codes.

## Features

- **Digital Tickets**: Each attendee gets a unique QR code ticket
- **Check-in System**: Staff members can scan tickets to check in attendees
- **Networking Game**: Attendees can scan each other's QR codes to earn points
- **Admin Dashboard**: Staff members can view attendee statistics and export data
- **Role-based Access**: Separate interfaces for attendees and staff members

## Tech Stack

- **Frontend**: React with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Database**: Supabase
- **QR Code**: html5-qrcode (scanning) and qrcode.react (generation)
- **Hosting**: Supabase Edge Functions

## Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher
- A Supabase project

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For the staff password verification function, set up the following in your Supabase project:

- Environment variable: `STAFF_ACCESS_PASSWORD`

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Database Schema

### Attendees Table

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

### Scans Table

```sql
CREATE TABLE scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scanner_id uuid REFERENCES attendees(id),
  scanned_id uuid REFERENCES attendees(id),
  timestamp timestamptz DEFAULT now(),
  UNIQUE(scanner_id, scanned_id)
);
```

## Project Structure

```
├── src/
│   ├── components/     # Reusable React components
│   ├── lib/           # Utility functions and API clients
│   ├── pages/         # Page components
│   └── main.tsx       # Application entry point
├── supabase/
│   ├── functions/     # Edge Functions
│   └── migrations/    # Database migrations
└── public/           # Static assets
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build
- `npm run lint`: Run ESLint

## Security Features

- Row Level Security (RLS) policies for database tables
- Staff authentication with password protection
- Unique scan tracking to prevent duplicate scans
- Environment variable protection for sensitive data

## Contributing

1. Create a feature branch
2. Make your changes
3. Submit a pull request
