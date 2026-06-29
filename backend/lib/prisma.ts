import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";

const connectionString = `${process.env.DATABASE_URL}`;

// const adapter = new PrismaPg({ connectionString });
const adapter = new PrismaNeon(
  { connectionString: process.env.DATABASE_URL! },
  { schema: 'myPostgresSchema' }
)
const prisma = new PrismaClient({ adapter });

export { prisma };