# Medical Platform - Complete Healthcare Management System

A comprehensive medical platform built with React, TypeScript, and Supabase that connects patients with verified healthcare professionals.

## 🌟 Features

### For Patients
- **Easy Registration**: Simple signup with email verification
- **Profile Management**: Manage personal information and health goals
- **Doctor Discovery**: Browse and find qualified healthcare professionals
- **Secure Communication**: HIPAA-compliant messaging with doctors

### For Doctors
- **Professional Verification**: Complete verification process with document upload
- **Profile Showcase**: Detailed professional profiles with specialties and credentials
- **Patient Management**: Secure patient communication and consultation tools
- **Admin Approval**: Thorough vetting process ensures quality healthcare providers

### For Administrators
- **Doctor Verification**: Review and approve doctor applications
- **Document Review**: Examine uploaded medical licenses and certifications
- **User Management**: Comprehensive dashboard for platform oversight
- **Analytics**: Track platform usage and user engagement

## 🚀 Technology Stack

- **Frontend**: React 18 with TypeScript
- **Styling**: Tailwind CSS for responsive design
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Deployment**: Netlify

## 📋 Prerequisites

Before you begin, ensure you have:
- Node.js (v16 or higher)
- npm or yarn package manager
- A Supabase account

## 🛠️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd medical-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Supabase Setup

#### Create a New Supabase Project
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Wait for the project to be fully initialized

#### Get Your Supabase Credentials
1. Go to Project Settings > API
2. Copy your Project URL and anon public key

#### Set Environment Variables
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Run Database Migrations
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the migration files in order:
   - `supabase/migrations/create_medical_platform_schema.sql`
   - `supabase/migrations/create_admin_user.sql`

#### Configure Authentication
1. In Supabase Dashboard, go to Authentication > Settings
2. Configure email templates as needed
3. Set up email confirmation (optional for demo)

### 4. Start Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🗄️ Database Schema

### Tables
- **user_roles**: Manages user roles (patient, doctor, admin)
- **doctor_profiles**: Stores doctor professional information
- **patient_profiles**: Stores patient information
- **documents**: Manages uploaded medical documents

### Security
- Row Level Security (RLS) enabled on all tables
- Role-based access control
- Secure file upload for medical documents

## 👥 User Roles & Access

### Patient
- Register with alias and email
- Email verification required
- Access to patient dashboard and profile

### Doctor
- Comprehensive registration with professional details
- Document upload for verification
- Email verification + admin approval required
- Access to doctor dashboard after approval

### Admin
- Pre-configured admin access
- Doctor application review and approval
- Full platform oversight capabilities

## 🔐 Authentication Flow

1. **Registration**: Users choose their role and complete registration
2. **Email Verification**: All users must verify their email addresses
3. **Doctor Approval**: Doctors require additional admin approval
4. **Role-Based Access**: Users are redirected based on their roles

## 🚀 Deployment

### Netlify Deployment
The project is configured for easy Netlify deployment:

```bash
npm run build
```

Deploy the `dist` folder to Netlify or use the Netlify CLI.

### Environment Variables for Production
Set the following environment variables in your deployment platform:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## 📱 Demo Accounts

For testing purposes, you can create accounts with these roles:

### Admin Account
1. Register normally with any email
2. After registration, run this SQL in Supabase:
```sql
SELECT make_user_admin('your-admin-email@example.com');
```

### Doctor Account
- Register as a doctor
- Upload sample documents
- Wait for admin approval

### Patient Account
- Register as a patient
- Immediate access after email verification

## 🔧 Configuration

### Supabase Policies
The application uses Row Level Security with policies for:
- Users can only access their own data
- Admins can access all doctor profiles for approval
- Secure document access based on ownership

### File Upload
- Profile images stored in Supabase Storage
- Medical documents securely stored with access controls
- Automatic file type validation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the database schema
- Examine the authentication flow
- Test with demo accounts

## 🔮 Future Enhancements

- Video consultation integration
- Appointment scheduling system
- Medical records management
- Payment processing
- Mobile app development
- Multi-language support

---

Built with ❤️ for better healthcare accessibility