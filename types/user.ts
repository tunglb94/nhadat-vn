import type { User } from "@prisma/client";

export type PublicUser = Pick<User, "id" | "name" | "image" | "role">;

export type AgentProfile = Pick<
  User,
  "id" | "name" | "phone" | "image" | "role" | "createdAt"
>;
