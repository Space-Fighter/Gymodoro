import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString = process.env.DATABASE_URL?.trim();

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

// Debug: verify the adapter receives valid, parseable credentials (password masked)
try {
  const parsed = new URL(connectionString);
  console.log(
    `[Prisma] Using DB host=${parsed.hostname} user=${parsed.username || "(EMPTY!)"} db=${parsed.pathname}`
  );
} catch {
  console.error("[Prisma] DATABASE_URL is not a valid URL. Check for unencoded special characters in the password.");
}

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "error", "warn"]
      : ["error"],
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    console.log("DB Connected via Prisma");
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
};

export { prisma, connectDB, disconnectDB };