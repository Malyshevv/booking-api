import {SCHEME} from "../../../config/db.config";

export const insertUserTokens =  `
    CREATE TABLE ${SCHEME}.usertokens (
        id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
        userid int4 NOT NULL,
        authtoken varchar NOT NULL
    );
`;
