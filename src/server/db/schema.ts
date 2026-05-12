// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { pgTableCreator, uniqueIndex } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `nerv-rnk_${name}`);

export const users = createTable("user", (d) => ({
  spotifyId: d.text("spotify_id").primaryKey(),
  displayName: d.text("display_name"),
  createdAt: d.timestamp("created_at").defaultNow().notNull(),
}));

export const albums = createTable("album", (d) => ({
  spotifyId: d.text("spotify_id").primaryKey(),
  title: d.text("title").notNull(),
  artist: d.text("artist").notNull(),
  artistSpotifyId: d.text("artist_spotify_id"),
  image: d.text("image"),
  releaseDate: d.text("release_date"),
  createdAt: d.timestamp("created_at").defaultNow().notNull(),
}));

export const ratings = createTable(
  "rating",
  (d) => ({
    id: d.text("id").primaryKey(),
    userSpotifyId: d
      .text("user_id")
      .notNull()
      .references(() => users.spotifyId),
      albumSpotifyId: d
      .text("album_id")
      .notNull()
      .references(() => albums.spotifyId),
    rating: d.real("rating").notNull(),
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    updatedAt: d.timestamp("updated_at").defaultNow().notNull(),
  }),
  (table) => ({
    userAlbumUnique: uniqueIndex("user_album_unique").on(
      table.userSpotifyId,
      table.albumSpotifyId,
    ),
  }),
);
