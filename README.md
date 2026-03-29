# Varlık Yönetim Sistemi (Asset Management System)

Comprehensive asset management and contractor management system for facilities.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose

## Features

### Asset Management
- Asset inventory tracking
- Asset categorization
- Asset status management (active, maintenance, broken, retired)
- Asset location tracking
- Technical specifications management
- Purchase and warranty information

### Maintenance Management
- Periodic maintenance planning
- Maintenance records tracking
- Maintenance types (periodic, preventive, corrective, emergency)
- Maintenance scheduling
- Work performed documentation
- Cost tracking

### Fault Request Management
- Fault request creation and tracking
- Fault severity levels (low, medium, high, critical)
- Fault assignment to users/contractors
- Fault status tracking (pending, assigned, in_progress, completed, cancelled)
- Comments and resolution notes

### Area/Room Management
- Area categorization (Clinical, Administrative, Technical, Support, Common)
- Area type management
- Block and floor management
- Area size tracking

### Calendar
- Maintenance scheduling view
- Fault request tracking
- Event filtering by type and date

### Notifications
- Real-time notifications
- Notification types (maintenance, fault_request, system, contractor)
- Read/unread status
- Notification preferences

### Settings
- General system settings
- Notification preferences
- User management
- Role management
- Facility management
- Contractor management

### Role-Based Access Control (RBAC)
- User
- Technical Responsible
- Administrative Responsible
- Biomedical Responsible
- Information Systems Responsible
- Manager
- Hospital Manager
- Central Manager
- Admin

### Responsive Design
- Mobile-friendly interface
- Left sidebar navigation
- Collapsible sidebar for mobile

## Project Structure

```
.
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── config/       # Database configuration
│   │   ├── controllers/  # Request handlers
│   │   ├── middleware/   # Auth middleware
│   │   ├── models/       # Database models (if using ORM)
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utility functions
│   ├── Dockerfile
│   └── package.json
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── contexts/    # React contexts
│   │   ├── hooks/       # Custom hooks
│   │   ├── layouts/     # Layout components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   ├── public/
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
├── database/              # Database initialization
│   └── init/
│       ├── 01-init-schema.sql
│       └── 02-seed-data.sql
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd Varlik_Envanter_Yonetimi
```

2. Start all services:
```bash
docker-compose up -d
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- PostgreSQL: localhost:5432

4. Stop the services:
```bash
docker-compose down
```

### Local Development

#### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the backend directory:
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_USER=asset_admin
DB_PASSWORD=asset_password
DB_NAME=asset_management
JWT_SECRET=your_jwt_secret_key_change_in_production
ORACLE_API_URL=http://oracle-system:8080/api
```

4. Start the backend server:
```bash
npm run dev
```

#### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the frontend directory:
```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Asset Management System
```

4. Start the frontend server:
```bash
npm run dev
```

## Database

The database schema is automatically initialized when the PostgreSQL container starts. The initialization scripts are located in the `database/init/` directory:

- `01-init-schema.sql`: Creates all tables, indexes, and triggers
- `02-seed-data.sql`: Inserts default data (roles, area types, measurement units, etc.)

### Default Admin User

- Email: `admin@assetmanagement.com`
- Password: `admin123`

**Important**: Change the default password in production!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me` - Update current user
- `PUT /api/auth/me/password` - Change password

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/roles` - Assign role to user
- `DELETE /api/users/:id/roles/:roleId` - Remove role from user
- `POST /api/users/sync/oracle` - Sync users from Oracle

### Roles
- `GET /api/roles` - Get all roles
- `GET /api/roles/:id` - Get role by ID
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role

### Facilities
- `GET /api/facilities` - Get all facilities
- `GET /api/facilities/:id` - Get facility by ID
- `POST /api/facilities` - Create facility
- `PUT /api/facilities/:id` - Update facility
- `DELETE /api/facilities/:id` - Delete facility
- `GET /api/facilities/:id/blocks` - Get facility blocks
- `POST /api/facilities/:id/blocks` - Add block
- `GET /api/facilities/:id/statistics` - Get facility statistics

### Assets
- `GET /api/assets` - Get all assets
- `GET /api/assets/:id` - Get asset by ID
- `POST /api/assets` - Create asset
- `PUT /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset
- `GET /api/assets/facility/:facilityId` - Get assets by facility
- `GET /api/assets/:id/maintenance-history` - Get asset maintenance history
- `GET /api/assets/:id/fault-history` - Get asset fault history

### Maintenance
- `GET /api/maintenance/plans` - Get all maintenance plans
- `GET /api/maintenance/records` - Get all maintenance records
- `POST /api/maintenance/plans` - Create maintenance plan
- `POST /api/maintenance/records` - Create maintenance record
- `PUT /api/maintenance/records/:id` - Update maintenance record
- `POST /api/maintenance/records/:id/complete` - Complete maintenance
- `GET /api/maintenance/upcoming` - Get upcoming maintenance
- `GET /api/maintenance/overdue` - Get overdue maintenance
- `GET /api/maintenance/statistics` - Get maintenance statistics

### Fault Requests
- `GET /api/fault-requests` - Get all fault requests
- `GET /api/fault-requests/:id` - Get fault request by ID
- `POST /api/fault-requests` - Create fault request
- `PUT /api/fault-requests/:id` - Update fault request
- `POST /api/fault-requests/:id/assign` - Assign fault request
- `POST /api/fault-requests/:id/complete` - Complete fault request
- `POST /api/fault-requests/:id/comments` - Add comment
- `GET /api/fault-requests/statistics/dashboard` - Get fault request statistics

### Areas
- `GET /api/areas` - Get all areas
- `GET /api/areas/types` - Get all area types
- `POST /api/areas` - Create area
- `POST /api/areas/types` - Create area type (restricted to Admin/Central Manager/Hospital Manager roles)
- `PUT /api/areas/types/:id` - Update area type (restricted to Admin/Central Manager/Hospital Manager roles)
- `PUT /api/areas/:id` - Update area
- `DELETE /api/areas/:id` - Delete area

### Calendar
- `GET /api/calendar` - Get calendar events
- `GET /api/calendar/range` - Get events by date range
- `GET /api/calendar/type/:type` - Get events by type
- `GET /api/calendar/facility/:facilityId` - Get events by facility
- `GET /api/calendar/upcoming` - Get upcoming events

### Notifications
- `GET /api/notifications` - Get user notifications
- `GET /api/notifications/unread` - Get unread notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/read-all` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `GET /api/notifications/settings/my` - Get notification settings
- `PUT /api/notifications/settings/my` - Update notification settings

### Settings

General settings page includes a subsection for managing **Asset Categories** (used when creating assets and elsewhere in the system).
- Separate **Alan Türleri** tab – list types grouped by category and add new types. You can specify a category manually or select an existing one before creating the type, edit or delete entries as needed. **Note:** modifying area types is limited to users with Admin/Central Manager/Hospital Manager roles.

- `GET /api/settings/system` - Get system settings
- `PUT /api/settings/system/:key` - Update system setting
- `GET /api/settings/categories` - Get asset categories
- `GET /api/areas/types` - Get area types (with category field)
- `POST /api/areas/types` - Create new area type
- `PUT /api/areas/types/:id` - Update area type
- `DELETE /api/areas/types/:id` - Delete area type
- `GET /api/settings/measurement-units` - Get measurement units
- `GET /api/settings/energy-types` - Get energy types
- `GET /api/settings/departments` - Get authorized departments
- `GET /api/settings/maintenance-types` - Get maintenance types

### Contractors
- `GET /api/contractors` - Get all contractors
- `GET /api/contractors/:id` - Get contractor by ID
- `POST /api/contractors` - Create contractor
- `PUT /api/contractors/:id` - Update contractor
- `DELETE /api/contractors/:id` - Delete contractor
- `GET /api/contractors/:id/facilities` - Get contractor facilities
- `POST /api/contractors/:id/facilities/:facilityId` - Assign to facility
- `GET /api/contractors/:id/employees` - Get contractor employees
- `POST /api/contractors/:id/employees` - Add employee
- `GET /api/contractors/:id/statistics` - Get contractor statistics

## Security

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Rate limiting
- CORS configuration
- Helmet security headers

## Development

### Adding New Features

1. **Backend**:
   - Create controller in `backend/src/controllers/`
   - Create routes in `backend/src/routes/`
   - Add routes to `backend/src/index.js`

2. **Frontend**:
   - Create page component in `frontend/src/pages/`
   - Add route in `frontend/src/App.jsx`
   - Add navigation item in `frontend/src/layouts/Layout.jsx`

### Database Changes

1. Create migration SQL file in `database/init/`
2. Update the schema
3. Restart the PostgreSQL container

## Deployment

### Docker Deployment

1. Build and start containers:
```bash
docker-compose up -d --build
```

2. View logs:
```bash
docker-compose logs -f
```

### Production Considerations

- Change default passwords
- Configure proper JWT secret
- Set up SSL/HTTPS
- Configure proper CORS origins
- Set up database backups
- Configure environment-specific settings
- Enable logging and monitoring

## License

This project is proprietary software.

## Support

For support, contact the development team.

## Git Commands for Pushing Changes to GitHub

### Step 1: Check the current status
```bash
git status
```
This shows which files have been modified, added, or deleted.

### Step 2: Add all changes
```bash
git add .
```
This stages all modified and new files for commit.

### Step 3: Commit your changes
```bash
git commit -m "Your commit message here"
```
Replace "Your commit message here" with a descriptive message about what you changed.

### Step 4: Push to GitHub
```bash
git push origin main
```
This pushes your changes to the `main` branch on GitHub.

---

### Quick Reference Commands

**For frequent commits:**
```bash
git add . && git commit -m "Your message" && git push origin main
```

**To see what will be committed:**
```bash
git diff --staged
```

**To see uncommitted changes:**
```bash
git diff
```

**To see commit history:**
```bash
git log --oneline
```

---

### Example Workflow

```bash
# 1. Check status
git status

# 2. Add all changes
git add .

# 3. Commit with a descriptive message
git commit -m "Added facility blocks management feature"

# 4. Push to GitHub
git push origin main
```

---

### Important Notes

- Always use meaningful commit messages
- Commit frequently with small, logical changes
- Make sure you're on the `main` branch: `git branch`
- If there are conflicts, use: `git pull origin main` before pushing
