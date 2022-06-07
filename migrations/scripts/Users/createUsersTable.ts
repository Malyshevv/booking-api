import {SCHEME} from "../../../config/db.config";

export const insertUsers =  `
    CREATE TABLE ${SCHEME}.users (
        id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
        username varchar NOT NULL,
        email varchar NOT NULL,
        phone varchar NULL,
        "password" varchar NOT NULL
    );
`;
