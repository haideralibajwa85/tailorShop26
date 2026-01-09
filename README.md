# Tailor Shop Management System

A complete tailor shop web application with Supabase backend, multi-language support (English, Urdu, Arabic – Saudi), modern UI/UX, and full order lifecycle management.

## Features

- **Multi-language Support**: English, Urdu, and Arabic (with RTL support)
- **User Roles**: Admin, Tailor, and Customer
- **Order Management**: Complete order lifecycle tracking
- **Authentication**: Email and phone number login with OTP
- **Responsive Design**: Mobile-friendly UI
- **Supabase Backend**: Secure and scalable database solution

## Tech Stack

- **Frontend**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **Internationalization**: i18next for multi-language support
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context API

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd tailorshop
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.local.example .env.local
   ```
   
   Add your Supabase credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

The database schema is defined in `supabase/schema.sql`. It includes tables for:
- Users (with roles: admin, tailor, customer)
- Categories (e.g., Shalwar Kameez, Saudi Traditional Wear)
- Clothing Types
- Orders
- Order Measurements
- Staff assignments

## Multi-language Support

The application supports three languages:
- English (default)
- Urdu (RTL)
- Arabic - Saudi (RTL)

Language can be switched using the language selector in the navigation bar. The UI automatically adjusts for RTL languages.

## User Roles

### Admin
- Full system control
- Add/edit/remove categories and clothing types
- Manage staff and tailors
- View all orders and reports
- Access to all system features

### Tailor/Staff
- View assigned orders
- Update order status
- Add completion dates
- Track progress on assigned tasks

### Customer
- Register and login
- Place new orders
- Track order status
- View order history
- Update personal profile

## Order Management

The system supports a complete order lifecycle:
- **Pending**: Order placed but not yet started
- **In Stitching**: Currently being worked on
- **Completed**: Finished but not yet collected
- **Late**: Exceeded expected completion date
- **Completed but Not Picked**: Completed but customer hasn't collected
- **Delivered**: Collected by customer

## File Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── (auth)/          # Authentication pages
│   ├── (customer)/      # Customer dashboard pages
│   ├── (tailor)/        # Tailor dashboard pages
│   ├── (admin)/         # Admin dashboard pages
│   └── globals.css      # Global styles
├── components/          # Reusable UI components
├── context/             # React context providers
├── lib/                 # Utilities and Supabase client
├── i18n/                # Internationalization files
└── types/               # TypeScript type definitions
```

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.