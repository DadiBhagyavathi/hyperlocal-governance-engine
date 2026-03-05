# Database Setup Instructions

## PostgreSQL Setup

### 1. Install PostgreSQL
- Download from: https://www.postgresql.org/download/
- Install with default settings
- Remember the password you set for 'postgres' user

### 2. Create Database
```sql
-- Connect to PostgreSQL as postgres user
CREATE DATABASE hypergov;
CREATE USER hypergov_user WITH PASSWORD 'hypergov_password';
GRANT ALL PRIVILEGES ON DATABASE hypergov TO hypergov_user;
```

### 3. Update Environment Variables
Update `.env` file:
```
DATABASE_URL="postgresql://hypergov_user:hypergov_password@localhost:5432/hypergov"
```

### 4. Run Database Migration
```bash
npx prisma generate
npx prisma db push
```

### 5. Seed Sample Data (Optional)
```bash
node scripts/seed.js
```

## Quick Setup Commands

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Start the application
npm start
```

## Database Schema

The application uses the following tables:
- **users**: User accounts with authentication
- **projects**: Civic projects with geolocation
- **feedbacks**: User feedback on projects

## Admin Access

To create a government admin user:
1. Sign up normally at `/auth.html`
2. Manually update user role in database:
```sql
UPDATE users SET role = 'GOVERNMENT' WHERE email = 'admin@gov.com';
```
3. Access admin panel at `/admin.html`