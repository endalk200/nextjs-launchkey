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
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [index("verification_identifier_idx").on(table.identifier)],
);

export const posts = pgTable(
	"posts",
	{
		id: uuid().defaultRandom().primaryKey(),
		userId: text("user_id").notNull(),
		title: text().notNull(),
		content: text().notNull(),
		createdAt: date("created_at").defaultNow().notNull(),
		updatedAt: date("updated_at")
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("posts_user_id_created_at_idx").on(table.userId, table.createdAt),
		foreignKey({
			name: "posts_user_id_fkey",
			columns: [table.userId],
			foreignColumns: [user.id],
		})
			.onDelete("cascade")
			.onUpdate("cascade"),
	],
);

export const authSchema = { user, session, account, verification };
