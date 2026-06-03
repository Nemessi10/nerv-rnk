import type { AppAlbum } from "./album";

export interface RatingRequestBody {
  album: AppAlbum;
  rating: number;
}

export interface SpotifyUserResponse {
  id: string;
  display_name: string;
  images?: { url: string }[];
}

export interface EloVoteRequestBody {
  winnerId: string;
  loserId: string;
}

export interface SyncUserRequestBody {
  accessToken: string;
}

export interface TokenExchangeRequestBody {
  code: string;
  codeVerifier: string;
}

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export interface RefreshTokenRequestBody {
  refresh_token: string;
}

export interface SpotifyRefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  refresh_token?: string;
}
