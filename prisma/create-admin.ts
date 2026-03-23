import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function createOrUpdateAdmin() {
  const email = "tim@tim.com";
  const password = "tim@tim";
  const name = "Tim";

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      // Update existing user
      const updatedUser = await prisma.user.update({
        where: { email },
        data: {
          password: hashedPassword,
          isAdmin: true,
          name, // Update name if provided
        },
      });

      console.log("✅ Admin user updated successfully:");
      console.log(`   Email: ${updatedUser.email}`);
      console.log(`   Name: ${updatedUser.name}`);
      console.log(`   Admin: ${updatedUser.isAdmin}`);
      console.log(`   ID: ${updatedUser.id}`);
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          isAdmin: true,
        },
      });

      console.log("✅ Admin user created successfully:");
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Name: ${newUser.name}`);
      console.log(`   Admin: ${newUser.isAdmin}`);
      console.log(`   ID: ${newUser.id}`);
    }

    console.log("\n🎉 Admin account is ready!");
    console.log("   Login URL: /login");
    console.log(`   Username: ${email}`);
    console.log(`   Password: ${password}`);
  } catch (error) {
    console.error("❌ Error creating/updating admin user:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createOrUpdateAdmin();
