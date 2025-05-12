import { Memory } from "@mastra/memory";
import { PostgresStore, PgVector } from "@mastra/pg";
import { openai } from "@ai-sdk/openai";
 
// PostgreSQL connection details
const host = "localhost";
const port = 5432;
const user = "qlee_ai_app";
const database = "qlee_ai_app_db";
const password = "change_me";
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
  vector: new PgVector({ connectionString }),
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