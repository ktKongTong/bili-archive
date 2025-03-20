CREATE UNLOGGED TABLE "cache" (
	"id" serial PRIMARY KEY NOT NULL,
	"key" text NOT NULL,
	"value" jsonb,
	"inserted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cache_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE INDEX "cache_key_idx" ON "cache" USING btree ("key");