ALTER TABLE "posts" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "posts" RENAME COLUMN "created_at" TO "createdAt";--> statement-breakpoint
ALTER TABLE "posts" RENAME COLUMN "updated_at" TO "updatedAt";--> statement-breakpoint
ALTER INDEX "posts_user_id_created_at_idx" RENAME TO "posts_userId_createdAt_idx";--> statement-breakpoint
ALTER TABLE "posts" RENAME CONSTRAINT "posts_user_id_fkey" TO "posts_userId_fkey";