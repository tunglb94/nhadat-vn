import type { User } from "@prisma/client";

export type PublicUser = Pick<User, "id" | "name" | "avatar" | "role">;

export type AgentProfile = Pick<
  User,
  "id" | "name" | "phone" | "avatar" | "role" | "createdAt"
>;
