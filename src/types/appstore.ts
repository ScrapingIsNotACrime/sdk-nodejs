/** One app in an App Store search result. */
export interface AppstoreApp {
  id: number;
  bundleId: string;
  name: string;
  developer: string;
  url: string;
  iconUrl: string;
  price: number;
  currency: string;
  rating: number;
  ratingCount: number;
  version: string;
  genres: string[];
  screenshots: string[];
}

/** GET /appstore/search */
export interface AppstoreSearch {
  term: string;
  country: string;
  resultCount: number;
  apps: AppstoreApp[];
}

/** One customer review of an app. */
export interface AppstoreReview {
  id: string;
  author: string;
  rating: number;
  title: string;
  content: string;
  version: string;
  updatedAt: string;
  voteCount: number;
  voteSum: number;
}

/** GET /appstore/reviews */
export interface AppstoreReviews {
  appId: string;
  country: string;
  page: number;
  reviews: AppstoreReview[];
}
