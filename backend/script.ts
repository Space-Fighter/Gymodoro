import { prisma } from "./lib/prisma";

async function main() {
  // 1. Create a new user along with a RefreshToken (Nested Write)
  const user = await prisma.user.create({
    data: {
      name: "Alice",
      email: "alice@prisma.io",
      password: "secure_hashed_password_here", // Required in your schema
      refreshTokens: {
        create: {
          hashedToken: "some_secure_token_string_abc123",
          expireAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Expires in 7 days
        },
      },
    },
    include: {
      refreshTokens: true, // Includes the relation array in the output payload
    },
  });
  console.log("🚀 Created user with Refresh Token:", JSON.stringify(user, null, 2));

  // 2. Fetch all users along with their active refresh tokens
  const allUsers = await prisma.user.findMany({
    include: {
      refreshTokens: true,
    },
  });
  console.log("📋 All users with tokens:", JSON.stringify(allUsers, null, 2));
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Script Error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });