import rateLimit from "../config/upstash.js";

export const rateLimiter = async (req, res, next) => {
    try {
        // Apply rate limiting
        const {success} = await rateLimit.limit("my-rate-limit");
        
        // If the request is allowed, proceed to the next middleware
        if (!success) {
           
            // If the request is denied, send a 429 Too Many Requests response
            res.status(429).json({ error: 'Too many requests, please try again later.' });
        }
        next();
    } catch (error) {
        console.error('Rate limiting error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}