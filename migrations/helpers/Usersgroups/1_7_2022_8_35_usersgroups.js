module.exports = `
        CREATE TABLE public.usersgroups (
            id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
            name varchar NOT NULL 
            
            PRIMARY KEY ("id")
        );
    `;
