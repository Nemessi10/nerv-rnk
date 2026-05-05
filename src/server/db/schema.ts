// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { pgTableCreator } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `nerv-rnk_${name}`);

export const users = createTable("user", (d) => ({
  id: d.text("id").primaryKey(),
  spotifyId: d.text("spotify_id").notNull().unique(),
  displayName: d.text("display_name"),
  createdAt: d.timestamp("created_at").defaultNow().notNull(),
}));

export const albums = createTable("album", (d) => ({
  id: d.text("id").primaryKey(),
  spotifyId: d.text("spotify_id").notNull().unique(),
  title: d.text("title").notNull(),
  artist: d.text("artist").notNull(),
  image: d.text("image"),
}));

export const ratings = createTable("rating", (d) => ({
  id: d.text("id").primaryKey(),

  userId: d
    .text("user_id")
    .notNull()
    .references(() => users.id),

  albumId: d
    .text("album_id")
    .notNull()
    .references(() => albums.id),

  rating: d.integer("rating").notNull(),

  createdAt: d.timestamp("created_at").defaultNow().notNull(),
}));
