module.exports =  `
    CREATE TABLE public.usertokens (
        id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
        userid int4 NOT NULL,
        authtoken varchar NOT NULL
        
    );
`;
