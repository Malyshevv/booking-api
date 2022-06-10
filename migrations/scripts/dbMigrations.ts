import { migrate } from "postgres-migrations"
import { sendQuery } from "../../config/db.config";
import {globalMessages} from "../../config/globalMessages";

async function dbMigrations() {
    const client = sendQuery // or a Pool, or a PoolClient
    await client.connect();

    try {
        await migrate({ client }, './migrations')
        console.log(globalMessages["db.migration.successful"]);
        process.exit();
    } catch (e) {
        console.log(globalMessages['db.migration.error']);
        if (e) throw new Error(e);
    }

}

dbMigrations().then(() => console.log(globalMessages['global.equals']));
