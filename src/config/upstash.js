import { Redis } from '@upstash/redis'
import { Ratelimit } from "@upstash/ratelimit";

import "dotenv/config";

const rateLimit = new Ratelimit({
  redis: Redis.fromEnv(), // Use the Redis instance from environment variables
  // Define the rate limit rules
  limiter: Ratelimit.slidingWindow(100, '1h'), // 100 requests per hour
  // You can also use other limiters like fixedWindow, tokenBucket, etc.
  // Define the key prefix for rate limiting
});
export default rateLimit;

