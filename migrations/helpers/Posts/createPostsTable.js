module.exports = `
    CREATE TABLE public.post (
        id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
        title text NOT NULL,
        "content" text NOT NULL,
        published bool NULL DEFAULT false,
        date_ins date NULL DEFAULT now(),
        userid int4 NULL
    );
`
