// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import { pgTableCreator, uniqueIndex, index } from "drizzle-orm/pg-core";

export const createTable = pgTableCreator((name) => `nerv-rnk_${name}`);

export const users = createTable("user", (d) => ({
  spotifyId: d.text("spotify_id").primaryKey(),
  displayName: d.text("display_name"),
  avatarUrl: d.text("avatar_url"),
  createdAt: d.timestamp("created_at").defaultNow().notNull(),
}));

export const albums = createTable("album", (d) => ({
  spotifyId: d.text("spotify_id").primaryKey(),
  title: d.text("title").notNull(),
  artist: d.text("artist").notNull(),
  artistSpotifyId: d.text("artist_spotify_id"),
  image: d.text("image"),
  genre: d.text("genre"),
  subgenres: d.text("subgenres").array(),
  releaseDate: d.text("release_date"),
  spotifyAddedAt: d.timestamp("spotify_added_at"),
  lastPlayedAt: d.timestamp("last_played_at"),
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
    rating: d.real("rating"),
    eloRating: d.real("elo_rating").default(1000).notNull(),
    matchesCount: d.integer("matches_count").default(0).notNull(),
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    updatedAt: d.timestamp("updated_at").defaultNow().notNull(),
  }),
  (table) => ({
    userAlbumUnique: uniqueIndex("user_album_unique").on(
      table.userSpotifyId,
      table.albumSpotifyId,
    ),
    eloRatingIdx: index("rating_elo_idx").on(table.eloRating),
    classicRatingIdx: index("rating_classic_idx").on(table.rating),
  }),
);

export const eloMatches = createTable(
  "elo_match",
  (d) => ({
    id: d.text("id").primaryKey(),
    userSpotifyId: d
      .text("user_id")
      .notNull()
      .references(() => users.spotifyId),
    winnerId: d
      .text("winner_id")
      .notNull()
      .references(() => albums.spotifyId),
    loserId: d
      .text("loser_id")
      .notNull()
      .references(() => albums.spotifyId),
    eloDelta: d.real("elo_delta").notNull(),
    createdAt: d.timestamp("created_at").defaultNow().notNull(),
  }),
  (table) => ({
    matchUserIdx: index("match_user_idx").on(table.userSpotifyId),
  }),
);

export const albumCustomMetadata = createTable(
  "album_custom_metadata",
  (d) => ({
    id: d.text("id").primaryKey(),
    userSpotifyId: d
      .text("user_id")
      .notNull()
      .references(() => users.spotifyId, { onDelete: "cascade" }),
    albumSpotifyId: d
      .text("album_id")
      .notNull()
      .references(() => albums.spotifyId, { onDelete: "cascade" }),

    customGenre: d.text("custom_genre"),
    customSubgenres: d
      .text("custom_subgenres")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    moods: d
      .text("moods")
      .array()
      .notNull()
      .default(sql`'{}'::text[]`),

    createdAt: d.timestamp("created_at").defaultNow().notNull(),
    updatedAt: d.timestamp("updated_at").defaultNow().notNull(),
  }),
  (table) => ({
    userAlbumMetaUnique: uniqueIndex("user_album_meta_unique").on(
      table.userSpotifyId,
      table.albumSpotifyId,
    ),
    customGenreIdx: index("custom_genre_idx").on(table.customGenre),
  }),
);
