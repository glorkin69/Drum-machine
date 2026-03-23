# Authentication Debugging Guide - Quick Reference

## Current Status

✅ **Database**: Working correctly with 3 users
✅ **Code Configuration**: All auth code is correct
✅ **Build**: Compiles successfully
⚠️ **Runtime Environment**: Environment variables may not be loaded in preview

## Test Credentials

```
Email:    demo@example.com
Password: demo123
```

This account has been verified and the password reset to work correctly.

## Quick Diagnostic URLs

Access these in your preview environment to diagnose issues:

1. **Runtime Environment Check**
   `/api/runtime-check`
   Shows if environment variables are loaded at runtime

2. **Environment Variable Check**
   `/api/auth/env-check`
   Verifies NextAuth configuration

3. **Database & User Check**
   `/api/auth/diagnostics?email=demo@example.com`
   Confirms database connection and user existence

## Most Likely Issue

The preview environment is not loading the `.env` file at runtime.

### Solution
Set these environment variables in your Avery project settings:

```bash
NEXTAUTH_SECRET=KIsOl2d251Wdd6A+7bkwSlBEEtXUSCQYHJgsMwMgwDY=
DATABASE_URL=postgresql://avery_c0ac84abe5a14440ba0201a36870d6c2:x0VcQKEBO8T_fEK8ZcOpxY8wD2S79OjmqWq_05Py0mE@10.1.0.4:5432/preview_c0ac84ab_e5a1_4440_ba02_01a36870d6c2
NODE_ENV=production
```

Then redeploy the preview environment.

## Verification Steps

1. Open `/api/runtime-check` in your browser
2. Check that `nextauthSecretExists: true`
3. If false, environment variables aren't loaded
4. Configure them in platform settings and redeploy

## Database Utility Scripts

If you need to manage users, these scripts are available:

### Check Database Status
```bash
node -e "const {PrismaClient}=require('@prisma/client');const p=new PrismaClient();(async()=>{const c=await p.user.count();console.log('Users:',c);const u=await p.user.findMany({select:{email:1,name:1,isAdmin:1}});console.log(u);await p.\$disconnect();})()"
```

### Reset User Password
```bash
node -e "const {PrismaClient}=require('@prisma/client');const bcrypt=require('bcryptjs');const p=new PrismaClient();const [,,...args]=process.argv;const email=args[0]||'demo@example.com';const pwd=args[1]||'demo123';(async()=>{const hash=await bcrypt.hash(pwd,10);await p.user.update({where:{email:email.toLowerCase()},data:{password:hash}});console.log('Password reset:',email);await p.\$disconnect();})()" demo@example.com newpassword
```

## Full Documentation

See `PREVIEW_AUTH_FIX.md` for complete details and troubleshooting.
