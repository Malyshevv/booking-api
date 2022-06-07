import { migrate } from "postgres-migrations"
import { generateSql } from "./scripts";
import { sendQuery } from "../config/db.config";
import {globalMessages} from "../config/globalMessages";

async function dbMigrations() {
    const client = sendQuery // or a Pool, or a PoolClient
    await client.connect();

    try {
        console.log(globalMessages['db.migration.successful']);
        await migrate({ client }, generateSql())
    } catch (e) {
        console.log(globalMessages['db.migration.error']);
        if (e) throw new Error(e);
    } finally {
        await client.end()
    }
}

dbMigrations().then(() => console.log(globalMessages['global.equals']));
