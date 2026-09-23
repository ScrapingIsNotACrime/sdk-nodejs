import type { HttpClient } from "../http.js";
import { type Page, numberedPage } from "../pagination.js";
import type { AppstoreReview, AppstoreReviews, AppstoreSearch } from "../types/appstore.js";

const LAST_REVIEW_PAGE = 10;

export class Appstore {
  constructor(private readonly http: HttpClient) {}

  /** GET /appstore/search — country defaults to "us", limit 1–200 (default 10). */
  search(term: string, options: { country?: string; limit?: number } = {}): Promise<AppstoreSearch> {
    return this.http.get("/appstore/search", { term, country: options.country, limit: options.limit });
  }

  /** GET /appstore/reviews — pages 1–10 (Apple's cap); the API returns 400 past page 10. */
  reviews(appId: string, options: { country?: string; page?: number } = {}): Promise<Page<AppstoreReview, AppstoreReviews>> {
    return numberedPage({
      page: options.page ?? 1,
      load: (page) => this.http.get<AppstoreReviews>("/appstore/reviews", { appId, country: options.country, page }),
      items: (data) => data.reviews,
      hasMore: (data, page) => data.reviews.length > 0 && page < LAST_REVIEW_PAGE,
    });
  }
}
