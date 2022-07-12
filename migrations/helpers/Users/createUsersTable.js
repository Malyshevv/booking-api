module.exports =  `
    CREATE TABLE public.users (
        id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
        username varchar NOT NULL,
        email varchar NOT NULL,
        phone varchar NULL,
        "password" varchar NOT NULL,
        avatar varchar NULL DEFAULT 'https://cdn-icons-png.flaticon.com/512/147/147140.png'::character varying,
        usertype int4 NULL DEFAULT 1
    
    );
`;
