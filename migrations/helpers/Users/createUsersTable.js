module.exports =  `
    CREATE TABLE public.users (
        id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
        username varchar NOT NULL,
        email varchar NOT NULL,
        phone varchar NULL,
        "password" varchar NOT NULL,
        avatar varchar NULL,
        usertype int4 NULL DEFAULT 0
    );
`;
