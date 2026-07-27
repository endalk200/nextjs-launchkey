import {
	boolean,
	foreignKey,
	index,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

// NOTE: `$onUpdate` on the `updatedAt` columns below runs in the Drizzle
// client only. Writes that bypass Drizzle (raw SQL, other clients) will not
// refresh `updatedAt`; add a database trigger if that ever becomes a problem.
const date = (name: string) => timestamp(name, { mode: "date", precision: 3 });

export const user = pgTable(
	"user",
	{
		id: text().primaryKey(),
		name: text().notNull(),
		email: text().notNull(),
		emailVerified: boolean("emailVerified").default(false).notNull(),
		image: text(),
		createdAt: date("createdAt").defaultNow().notNull(),
		updatedAt: date("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [uniqueIndex("user_email_key").on(table.email)],
);

export const session = pgTable(
	"session",
	{
		id: text().primaryKey(),
		expiresAt: date("expiresAt").notNull(),
		token: text().notNull(),
		createdAt: date("createdAt").defaultNow().notNull(),
		updatedAt: date("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
		ipAddress: text("ipAddress"),
		userAgent: text("userAgent"),
		userId: text("userId").notNull(),
	},
	(table) => [
		uniqueIndex("session_token_key").on(table.token),
		index("session_userId_idx").on(table.userId),
		foreignKey({
			name: "session_userId_fkey",
			columns: [table.userId],
			foreignColumns: [user.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	],
);

export const account = pgTable(
	"account",
	{
		id: text().primaryKey(),
		issuer: text().notNull(),
		providerAccountId: text("providerAccountId").notNull(),
		providerId: text("providerId").notNull(),
		userId: text("userId").notNull(),
		accessToken: text("accessToken"),
		refreshToken: text("refreshToken"),
		idToken: text("idToken"),
		accessTokenExpiresAt: date("accessTokenExpiresAt"),
		refreshTokenExpiresAt: date("refreshTokenExpiresAt"),
		scope: text(),
		password: text(),
		createdAt: date("createdAt").defaultNow().notNull(),
		updatedAt: date("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("account_issuer_providerAccountId_uidx").on(
			table.issuer,
			table.providerAccountId,
		),
		index("account_userId_idx").on(table.userId),
		foreignKey({
			name: "account_userId_fkey",
			columns: [table.userId],
			foreignColumns: [user.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	],
);

export const verification = pgTable(
	"verification",
	{
		id: text().primaryKey(),
		identifier: text().notNull(),
		value: text().notNull(),
		expiresAt: date("expiresAt").notNull(),
		createdAt: date("createdAt").defaultNow().notNull(),
		updatedAt: date("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

// Column names are camelCase to match the Better Auth tables above, keeping a
// single naming convention across the whole schema.
export const posts = pgTable(
	"posts",
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: text("userId").notNull(),
		title: text().notNull(),
		content: text().notNull(),
		createdAt: date("createdAt").defaultNow().notNull(),
		updatedAt: date("updatedAt")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("posts_userId_createdAt_idx").on(table.userId, table.createdAt),
		foreignKey({
			name: "posts_userId_fkey",
			columns: [table.userId],
			foreignColumns: [user.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	],
);

export const authSchema = { user, session, account, verification };
