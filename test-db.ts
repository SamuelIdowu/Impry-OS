import { db } from "./src/server/db";
import { sessions } from "./src/server/db/schema";
import { eq } from "drizzle-orm";

async function main() {
    try {
        console.log("Querying sessions...");
        const result = await db.select().from(sessions).limit(1);
        console.log("Result:", result);
        process.exit(0);
    } catch (err) {
        console.error("Query failed:", err);
        process.exit(1);
    }
}

main();
