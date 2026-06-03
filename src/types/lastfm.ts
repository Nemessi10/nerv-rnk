export interface LastFmTopTagsResponse {
  toptags?: {
    tag?: {
      name: string;
      count: number;
      url: string;
    }[];
  };
}
