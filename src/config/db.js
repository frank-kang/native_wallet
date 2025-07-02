import {neon} from '@neondatabase/serverless';
import "dotenv/config";
//creates a sql connection suing db url.
export const sql = neon(process.env.DATABASE_URL);