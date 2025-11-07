# Studio Compliance Manager

Complete compliance and deadline management system for medical and dental practices in Italy.

## 🎯 Main Features

- **Multi-tenant**: Management of multiple organizations with complete data isolation
- **RBAC**: OWNER, ADMIN, MEMBER roles with granular permissions
- **Structure Management**: Creation and management of multiple operational structures
- **Personnel Management**: Complete registry with Italian fiscal code validation
- **Italian Compliance Catalog**: 35+ pre-configured GLOBAL templates for:
  - Workplace safety (D.Lgs. 81/08)
  - Radiation protection (D.Lgs. 101/2020 and corrections)
  - Medical waste (DPR 254/2003, RENTRI)
  - Fire safety, training, maintenance
  - Privacy/GDPR, CME, insurance
- **Template Versioning**: Version management with changelog and impact simulator
- **Email Notifications**: Automatic reminders at 90/60/30/7/1 days
- **KPI Dashboard**: Deadline overview with charts and statistics
- **Document Management**: Upload and storage of compliance documents
- **Audit Log**: Complete tracking of critical actions
- **Email Verification**: Email verification system with resend functionality

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Language**: TypeScript
- **UI**: Tailwind CSS + shadcn/ui (Stripe/Linear style design)
- **Forms**: React Hook Form + Zod
- **Database**: SQLite (dev) / PostgreSQL (prod) + Prisma ORM
- **Auth**: Auth.js (NextAuth) with Credentials
- **Email**: Resend (prod) / MailHog (dev)
- **Background Jobs**: node-cron (dev) / Vercel Cron (prod)
- **Testing**: Jest (unit) + Playwright (e2e)

## 📋 Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose (for MailHog in development)

## 🚀 Installation and Setup

### 1. Clone and install dependencies

```bash
cd studio-compliance-manager
npm install
```

### 2. Start MailHog with Docker (for development email)

```bash
docker-compose up -d
```

MailHog will be available at:

- SMTP: `localhost:1025`
- Web UI: `http://localhost:8025`

### 3. Configure environment variables

The `.env` file is already configured for local development. Verify the configuration:

```env
# Database (SQLite in dev, uses local file)
DATABASE_URL="file:./dev.db"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-in-production"

# Email (MailHog in dev)
EMAIL_FROM="noreply@studiocompliance.local"
EMAIL_SERVER_HOST="localhost"
EMAIL_SERVER_PORT="1025"
EMAIL_SERVER_USER=""
EMAIL_SERVER_PASSWORD=""
```

### 4. Initialize the database

```bash
# Generate Prisma Client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with initial data
npm run prisma:seed
```

### 5. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Test email sending

Emails sent from the application will appear in the MailHog UI at `http://localhost:8025`.

## 🔐 Demo Credentials

### Super Admin (GLOBAL template management)

- Email: `admin@studiocompliance.it`
- Password: `Admin123!`

### Demo User (Studio Dentistico Rossi)

- Email: `demo@studiodentistico.it`
- Password: `Demo123!`

## 📁 Project Structure

```
studio-compliance-manager/
├── app/                      # Next.js App Router
│   ├── api/                  # API Route Handlers
│   ├── auth/                 # Authentication pages
│   ├── dashboard/            # Main dashboard
│   ├── structures/           # Structure management
│   ├── people/               # People management
│   ├── roles/                # Role management
│   ├── deadlines/            # Deadline management
│   ├── templates/            # Template catalog
│   ├── admin/                # Admin panel
│   └── settings/             # Settings
├── components/               # React components
│   └── ui/                   # shadcn/ui components
├── lib/                      # Utilities and configurations
│   ├── auth.ts               # Auth.js config
│   ├── prisma.ts             # Prisma client
│   └── utils.ts              # Helper functions
├── prisma/                   # Database schema and seed
│   ├── schema.prisma         # Prisma schema
│   └── seed.ts               # Seed data
├── docker-compose.yml        # MailHog container
└── package.json              # Dependencies
```

## 🗄️ Database Schema

### Main Models

- **User**: System users
- **Organization**: Organizations (medical/dental practices)
- **OrganizationUser**: User-organization association with roles
- **Structure**: Operational structures/locations
- **StructurePerson**: Association between structures and people
- **Person**: People (employees, collaborators)
- **RoleTemplate**: Role templates (GLOBAL/ORG)
- **DeadlineTemplate**: Deadline templates with versioning
- **DeadlineInstance**: Actual deadline instances
- **RoleAssignment**: Role assignments to people
- **Document**: Uploaded documents
- **Notification**: Email notifications
- **AuditLog**: Critical action logs

## 📊 Implemented Features

### ✅ Authentication and Onboarding

- Login with credentials
- New organization registration
- Email verification with token and resend
- Account status management (PENDING_VERIFICATION, ACTIVE, SUSPENDED)
- Detailed error messages for each status
- Password reset (placeholder)

### ✅ Dashboard

- Deadline KPIs (overdue, 30/60/90 days)
- Upcoming deadlines list
- Charts and statistics
- Structure-based visualization

### ✅ Structure Management

- Complete structure CRUD operations
- People association to structures (with dedicated tab)
- Multiple structure assignments
- Deadlines per structure
- Primary structure management for personnel

### ✅ People Management

- People CRUD (employees/collaborators)
- **Italian fiscal code validation** (format and check character)
- **Fiscal code uniqueness check per organization**
- Automatic fiscal code normalization (uppercase, trim)
- Multiple structure associations
- Assignment from existing personnel
- Role assignments
- Personal deadlines tab
- Complete fields: first name, last name, email, phone, hire/birth dates, notes

### ✅ Role Management

- GLOBAL role templates (pre-configured)
- ORG role templates (customized)
- Role assignments to people
- Automatic deadline generation

### ✅ Deadline Template Catalog

- 35+ pre-configured GLOBAL Italian templates
- Regulatory metadata (legalReference, sourceUrl)
- Versioning and changelog
- Change impact simulator
- Organization-level configurability

### ✅ Deadline Management

- Automatic generation from templates
- States: PENDING, DONE, OVERDUE, CANCELLED
- Completion with document upload
- Automatic recurrence
- Advanced filters
- ICS calendar export

### ✅ Notifications

- Email reminders at 90/60/30/7/1 days
- Sending tracking (PENDING/SENT/FAILED)
- Daily cron job
- Email system with Resend (prod) / MailHog (dev)

### ✅ Admin Panel

- Organization member management
- Admin promotion/demotion
- SuperAdmin: GLOBAL template management
- Audit log

### ✅ User Profile

- Personal information management
- Password change
- Account status display

## 🔧 Available Scripts

```bash
# Development
npm run dev                   # Start dev server
npm run build                 # Production build
npm run start                 # Start production server

# Database
npm run prisma:generate       # Generate Prisma Client
npm run prisma:migrate        # Run migrations
npm run prisma:seed           # Seed database
npm run prisma:studio         # Open Prisma Studio

# Testing
npm run test                  # Jest unit tests
npm run test:watch            # Jest watch mode
npm run test:e2e              # Playwright e2e tests

# Code Quality
npm run lint                  # ESLint
npm run format                # Prettier
```

## 🌍 Deployment

### Vercel (Recommended)

1. Connect GitHub repository to Vercel
2. Configure environment variables:
   - `DATABASE_URL`: Neon/Supabase/Render PostgreSQL
   - `NEXTAUTH_URL`: Production URL
   - `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
   - `EMAIL_*`: SMTP configuration
   - `CRON_SECRET`: Secret for cron endpoint
3. Automatic deployment

### Vercel Cron for Notifications

Create `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/notifications/dispatch",
      "schedule": "0 6 * * *"
    }
  ]
}
```

## 📝 GLOBAL Italian Deadline Templates

The system includes 35+ pre-configured templates for:

### Workplace Safety (D.Lgs. 81/08)

- Worker training (five-yearly)
- Supervisor training (biennial)
- Manager training (five-yearly)
- RSPP employer (five-yearly)
- RLS (annual)
- Fire safety personnel (five-yearly)
- First aid personnel (triennial)
- DVR review
- Electrical system verification
- Extinguisher inspections

### Radiation Protection (D.Lgs. 101/2020)

- ER physical surveillance (annual)
- X-ray quality controls
- Radiological practice notification
- Medical exposure registration
- LDR four-yearly verification
- Radiation protection training (five-yearly)
- Radiation protection CME (15% triennial)
- Personal dosimetry

### Medical Waste

- Load/unload register (5 days)
- Temporary storage
- RENTRI registration

### Other Compliance

- BLSD/DAE retraining
- Health surveillance
- Autoclave maintenance
- Privacy/GDPR training
- General CME (triennial)
- Professional liability insurance

All templates include:

- Regulatory references
- Official source links
- Configurable periodicity
- Operational notes

## 🔒 Security and Compliance

- **Multi-tenancy**: Strict organizationId scoping in all queries
- **RBAC**: Granular access control (OWNER, ADMIN, MEMBER)
- **Password**: Bcrypt hashing
- **Session**: JWT with NextAuth
- **Email Verification**: Mandatory email verification with secure tokens
- **Fiscal Code Validation**: Complete Italian fiscal code validation with check character
- **Data Normalization**: Automatic data normalization (e.g., fiscal code uppercase)
- **Rate Limiting**: Implementable with Upstash
- **GDPR**: Soft-delete, audit log, consent management
- **Audit Trail**: Complete critical action logging

## 🧪 Testing

### Unit Tests (Jest)

```bash
npm run test
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
```

E2E flow covered:

1. Signup → Onboarding
2. Create Structure
3. Create Person
4. Assign Role
5. Verify generated deadlines
6. Complete deadline with document
7. Verify recurrence

## 📚 Additional Documentation

### API Endpoints

#### Authentication

- `POST /api/auth/[...nextauth]` - NextAuth handlers
- `GET /api/auth/verify-email` - Email verification with token
- `POST /api/auth/resend-verification` - Resend verification email

#### Organizations and Users

- `GET/POST /api/organizations` - Organization management
- `GET/PATCH /api/user/profile` - User profile
- `POST /api/user/change-password` - Password change

#### Structures

- `GET/POST /api/structures` - List and create structures
- `GET/PATCH/DELETE /api/structures/[id]` - Single structure management
- `GET/POST /api/structures/[id]/people` - People associated with structure

#### People

- `GET/POST /api/people` - List and create people
- `POST /api/people/check-fiscal-code` - Check fiscal code uniqueness
- `GET/PATCH/DELETE /api/people/[id]` - Single person management

#### Roles

- `GET/POST /api/roles/templates` - Role templates
- `GET/POST/PATCH/DELETE /api/roles/assignments` - Role assignments

#### Deadlines

- `GET/POST/PATCH /api/deadlines/templates` - Deadline templates
- `GET/POST/PATCH /api/deadlines` - Deadline instances

#### Other

- `POST /api/documents` - Document upload
- `POST /api/notifications/dispatch` - Dispatch notifications (cron)
- `GET /api/ics` - ICS calendar export

### Timezone Configuration

All dates are managed in `Europe/Rome`. Configurable per organization in `Organization.timezone`.

### Document Storage

- **Dev**: Local filesystem (`./uploads`)
- **Prod**: S3-compatible (configure `AWS_*` env vars)

## 🤝 Contributions

This is a complete demo project. For extensions:

1. Fork the repository
2. Create feature branch
3. Commit with descriptive messages
4. Push and open Pull Request

## 📄 License

ISC

## 🆘 Support

For questions or issues:

- Open an Issue on GitHub
- Consult Prisma/Next.js documentation
- Check logs with `npm run dev`

## 🎉 Future Developments

- [ ] Magic Link authentication
- [ ] CSV Import/Export for people and deadlines
- [ ] Advanced charts (recharts)
- [ ] In-app notifications
- [ ] Mobile app (React Native)
- [ ] Public API with rate limiting
- [ ] Calendar integration (Google/Outlook)
- [ ] Automatic PDF reports
- [ ] Multi-language (i18n)
- [ ] Billing and subscription (Stripe)

---

**Developed with ❤️ for Italian medical and dental practices**
