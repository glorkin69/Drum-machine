# Admin Account Setup Guide

## 🔑 Creating Admin Accounts

BeatForge 808 requires at least one admin account to manage users and access the admin portal.

### Method 1: Create Admin via Custom Script (Recommended)

Create a custom admin creation script:

```bash
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/create-admin.ts
```

Create the file `prisma/create-admin.ts` with your desired credentials:

```typescript
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = "admin@yourdomain.com"; // Change this
  const password = "your-secure-password"; // Change this
  const name = "Admin User"; // Change this

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      isAdmin: true,
    },
    create: {
      email,
      name,
      password: hashedPassword,
      isAdmin: true,
    },
  });

  console.log("Admin user created:", user.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
```

### Method 2: Promote Existing User via Database

If you already have a user account registered, you can promote it to admin status by directly updating the database:

```bash
npx prisma studio
```

Then update the user's `isAdmin` field to `true`.

### Method 3: Promote via Another Admin

If you already have an admin account:
1. Register a new user via `/register`
2. Use the admin portal at `/admin` to promote them via the "Promote" button

## 🚀 How to Access Admin Portal

1. Navigate to the login page: `/login`
2. Enter your admin credentials
3. Click "Sign In"
4. You will be redirected to `/dashboard`
5. Navigate to `/admin` to access the admin portal

## 🔑 Admin Portal Features

The admin portal at `/admin` provides full user management capabilities:

- **View All Users**: Browse all registered users in the system
- **Search & Filter**: Search users by email with pagination
- **View User Stats**: See number of saved patterns per user
- **Promote Users**: Grant admin privileges to other users
- **Demote Users**: Remove admin privileges (except self-demotion protection)
- **Change Password**: Update any user's password (except your own for security)
- **Delete Users**: Remove user accounts and their associated data

## 🔐 Security Best Practices

- **Passwords**: All passwords are hashed using bcryptjs with 10 salt rounds before storage
- **Self-Protection**: Admin accounts cannot self-demote or self-delete for protection
- **Password Changes**: Admins cannot change their own password through the admin interface (to prevent accidents)
- **Audit Trail**: All admin actions should be logged and can be audited via server logs
- **Strong Passwords**: Always use strong, unique passwords for admin accounts

## 📝 Database Info

Admin accounts are stored in the PostgreSQL database with:
- **Table**: User
- **Field**: isAdmin = true
- **Email**: unique constraint prevents duplicate accounts
- **Password**: bcrypt hash (never plaintext)

## 🔄 If You Forget the Admin Password

You have several options:

1. **Use the password reset flow:**
   - Go to `/forgot-password`
   - Enter your admin email
   - Check your email (requires Resend API key configured)
   - Click the reset link and set a new password

2. **Use another admin account:**
   - Login with a different admin account
   - Use the admin panel to reset the password

3. **Direct database update:**
   - Create a new password hash using bcryptjs
   - Update the user record directly in the database

## 🔒 Securing Admin Access

After creating your admin account:

1. **Change default passwords** - Never use simple or default passwords
2. **Enable email service** - Configure Resend for password reset functionality
3. **Limit admin accounts** - Only grant admin privileges to trusted users
4. **Monitor admin actions** - Regularly review server logs for suspicious activity
5. **Use strong authentication** - Consider adding 2FA in the future
