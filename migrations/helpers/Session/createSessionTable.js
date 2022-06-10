module.exports =  `
    CREATE TABLE public.session (
        sid character varying PRIMARY KEY NOT NULL,
        sess json NOT NULL,
        expire timestamp(6) without time zone NOT NULL
    );
`;
