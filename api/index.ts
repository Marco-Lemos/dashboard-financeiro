import "dotenv/config";
import { createApp } from "../server/_core/app";

// Vercel trata um Express app exportado como default aqui como uma função
// serverless: cada requisição a /api/* é roteada para este handler.
const app = createApp();

export default app;
