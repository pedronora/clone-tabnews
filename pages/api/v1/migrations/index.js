import migrationRunner from "node-pg-migrate";
import { resolve } from "node:path";
import database from "infra/database.js";

export default async function migrations(request, response) {
  const allowedMethodos = ["GET", "POST"];

  if (!allowedMethodos.includes(request.method)) {
    return response.status(405).json({
      error: `Method "${request.method}" not allowed.`,
    });
  }

  let dbClient;

  try {
    dbClient = await database.getNewClient();

    const defaultMigrationOptions = {
      dbClient: dbClient,
      databaseUrl: process.env.DATABASE_URL,
      dir: resolve("infra", "migrations"),
      migrationsTable: "pgmigrations",
      direction: "up",
      dryRun: true,
      verbose: true,
    };

    if (request.method === "GET") {
      const pendingMigrations = await migrationRunner(defaultMigrationOptions);
      return response.status(200).json(pendingMigrations);
    }

    if (request.method === "POST") {
      const migratedMigrations = await migrationRunner({
        ...defaultMigrationOptions,
        dryRun: false,
      });

      if (migratedMigrations.length > 0) {
        return response.status(201).json(migratedMigrations);
      }
      return response.status(200).json(migratedMigrations);
    }
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await dbClient.end();
  }
}
