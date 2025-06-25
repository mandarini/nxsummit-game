# 🎯 Fork & Customize: Make This Your Own Event App

This guide will walk you through forking the Nx Summit Game repository and customizing it for your own event. Whether you're running a conference, meetup, workshop, or any gathering that could benefit from gamified networking and check-ins, this app can be adapted to fit your needs!

## 🚀 Quick Start: Fork & Deploy

### 1. Fork the Repository

1. Click the "Fork" button at the top of this repository
2. Clone your forked repository locally:

```bash
git clone git@github.com:mandarini/nxsummit-game.git
cd nxsummit-game
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Your Supabase Project

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the database migrations in the `supabase/migrations/` folder
3. Set up your environment variables (see [Environment Setup](#environment-setup))

## 📝 Required Customizations

### 🏷️ Basic Branding & Naming

**Files to Update:**

1. **`package.json`**

   ```json
   {
     "name": "your-event-game" // Change from "nx-summit-game"
     // ... rest of config
   }
   ```

2. **`index.html`**

   ```html
   <title>Your Event Name</title>
   <!-- Change from "Nx Summit" -->
   ```

3. **`README.md`**
   - Update the title from "🎮 Nx Summit Game & Check-In App"
   - Replace all references to "Nx Summit" with your event name
   - Update the description and features to match your event

### 🎫 Event-Specific Content

**4. `src/pages/TicketPage.tsx`**

```tsx
<h1 className="text-3xl font-bold text-gray-900 mb-2">
  Your [EVENT NAME] Ticket  {/* Change from "Your Nx Summit Ticket" */}
</h1>

{/* Update event details */}
<div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
  <Calendar size={14} className="text-purple-500" />
  <span>Your Date • Your Time</span> {/* Change from "April 4, 2025 • 9:00 AM" */}
  <span className="mx-1">•</span>
  <a
    href="YOUR_VENUE_MAP_LINK" {/* Update venue link */}
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-1 hover:text-purple-600 transition-colors"
  >
    <MapPin size={14} className="text-purple-500" />
    <span>Your Venue Name</span> {/* Change from "Pllek" */}
  </a>
</div>
```

**5. `src/pages/RulesPage.tsx`**

```tsx
<h1 className="text-4xl font-bold text-gray-900 mb-4">
  How the [EVENT NAME] Game Works  {/* Update event name */}
</h1>
<p className="text-xl text-gray-600">
  A quick guide to playing (and winning) the game!
</p>
```

**6. `src/pages/InfoPage.tsx` - MOST IMPORTANT**

This file contains the complete event schedule and needs major customization:

```tsx
// Update page title
<h1 className="text-4xl font-bold text-gray-900 mb-4">About</h1>

// Replace the entire schedule section with your agenda:
<section className="mb-12">
  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
    <Calendar className="text-purple-600 mr-2" size={24} />
    [YOUR EVENT] Schedule ⏱️  {/* Update event name */}
  </h2>
  <div className="space-y-4">
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="space-y-6">
        {/* Replace ALL schedule content with your event agenda */}
        <div>
          <h3 className="font-semibold text-lg mb-3">Morning Session</h3>
          <div className="space-y-4">
            <div className="flex">
              <div className="w-32 text-gray-500">9:00-9:30</div>
              <div className="flex-1">
                <div className="font-medium">Your Event Activity</div>
              </div>
            </div>
            {/* Add all your time slots and activities */}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
```

### 🎨 Visual Customization

**7. Color Scheme (Optional)**

The app uses Tailwind CSS with a purple theme. To change colors:

- Find and replace `purple-` classes with your preferred color
- Main colors used: `purple-600`, `purple-100`, `purple-500`
- Common files: All `.tsx` files in `src/pages/` and `src/components/`

**8. Favicon & Branding**

- Replace `public/vite.svg` with your event logo
- Update the favicon reference in `index.html`

## ⚙️ Environment Setup

Create a `.env` file in your project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Staff Access (set this to a secure password)
STAFF_ACCESS_PASSWORD=your_secure_staff_password

# Additional Supabase Keys (for deployment)
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🗄️ Database Setup

### Attendee Data Import

You'll need to populate the `attendees` table with your event participants:

```sql
-- Example: Import your attendee list
INSERT INTO attendees (email, name, role, value) VALUES
  ('john@example.com', 'John Doe', 'attendee', 1),
  ('jane@example.com', 'Jane Smith', 'attendee', 1),
  ('staff@example.com', 'Staff Member', 'staff', 4),
  ('admin@example.com', 'Super Admin', 'super_admin', 4);
```

**Role Types:**

- `attendee` (default) - Regular participants, worth 1 point when scanned
- `staff` - Event staff, worth 4 points, has admin access
- `super_admin` - Full admin control, can toggle game on/off

### Bonus Codes Setup (Optional)

Create special QR codes hidden around your venue:

```sql
INSERT INTO bonus_codes (code, description, points, max_claims) VALUES
  ('WELCOME2024', 'Welcome Bonus', 10, 100),
  ('COFFEE_CORNER', 'Found the Coffee Station!', 5, 50),
  ('HIDDEN_TREASURE', 'Secret Location Bonus', 20, 10);
```

## 🎯 Point System Customization

### Adjusting Point Values

In your database, you can customize the point values:

```sql
-- Make VIP attendees worth more points
UPDATE attendees SET value = 5 WHERE email IN ('vip1@example.com', 'vip2@example.com');

-- Adjust staff member values
UPDATE attendees SET value = 3 WHERE role = 'staff';
```

### Custom Bonus Point Rules

Modify the scanning logic in `src/pages/ScanPage.tsx` if you want special rules like:

- Time-based bonuses (early bird scanning)
- Location-based multipliers
- Special attendee categories

## 🚀 Deployment

1. Connect repo to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables

## 🧪 Testing Your Customization

### Local Development

```bash
npm run dev
```

### Test Checklist

- [ ] Event name appears correctly throughout the app
- [ ] Schedule shows your event agenda
- [ ] Date, time, and venue information is correct
- [ ] QR codes generate and scan properly
- [ ] Staff access works with your password
- [ ] Points system reflects your custom values
- [ ] Database contains your attendee list

## 🆘 Troubleshooting

### Common Issues

**"Game not enabled" error:**

- Check that `game_on` is set to `true` in the `settings` table
- Verify super admin can access the game toggle

**QR codes not scanning:**

- Ensure proper lighting and camera permissions
- Check that attendee IDs are valid UUIDs
- Verify attendees are checked in

**Staff access denied:**

- Confirm `STAFF_ACCESS_PASSWORD` environment variable is set
- Check that user role is `staff` or `super_admin`
- Verify Supabase edge functions are deployed

**Points not updating:**

- Check database permissions and RLS policies
- Verify `increment_points` function exists
- Ensure no duplicate scans (unique constraint)

### Getting Help

1. Check the [original repository issues](https://github.com/mandarini/nxsummit-game/issues)
2. Review Supabase documentation for database issues
3. Test with a small group before your main event

## 📋 Pre-Event Checklist

- [ ] All event-specific text updated
- [ ] Schedule reflects your actual agenda
- [ ] Date, time, venue information correct
- [ ] Attendee list imported to database
- [ ] Staff accounts created and tested
- [ ] Environment variables configured
- [ ] App deployed and accessible
- [ ] QR code scanning tested on mobile devices
- [ ] Raffle system tested with sample data
- [ ] Backup plan prepared for technical issues

---

## 🎉 You're Ready to Go!

Once you've completed these customizations, you'll have a fully functional event app that:

- ✅ Streamlines attendee check-in
- ✅ Gamifies networking and engagement
- ✅ Provides real-time event management
- ✅ Creates memorable interactive experiences
- ✅ Generates valuable engagement analytics

**Pro Tip:** Test everything with a small group of colleagues before your main event. Have them scan each other, try the admin functions, and run through the complete user journey!

Good luck with your event!
