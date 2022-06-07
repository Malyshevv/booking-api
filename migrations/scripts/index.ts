import { insertUsers } from "./Users/createUsersTable";
import {insertUserTokens} from "./Users/createUsersTokensTable";

export const generateSql = () => `
    ${insertUsers}
    ${insertUserTokens}
`;
