import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { openai } from "@ai-sdk/openai";
 
// PostgreSQL connection details
const host = process.env.DATABASE_HOST || "localhost";
const port = Number(process.env.DATABASE_PORT) || 5432;
const user = process.env.DATABASE_USER || "postgres";
const database = process.env.DATABASE_NAME || "postgres";
const password = process.env.DATABASE_PASSWORD || "postgres";
const connectionString = `postgresql://${user}:${password}@${host}:${port}/${database}`;
export const storage = new PostgresStore({
  host,
  port,
  user,
  database,
  password,
})
 
// Initialize memory with PostgreSQL storage and vector search
export const ninjaChefMemory = new Memory({
  storage: storage,
  vector: new PgVector({ connectionString, pgPoolOptions: {ssl: false} }), // not recommended for production
  embedder: openai.embedding("text-embedding-3-small"),
  options: {
    threads: {
        generateTitle: false
    },
    lastMessages: 10,
    semanticRecall: {
      topK: 3,
      messageRange: 2,
    },
  },
});