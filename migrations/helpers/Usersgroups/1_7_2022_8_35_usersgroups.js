module.exports = `
        CREATE TABLE public.usersgroups (
            id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
            name varchar NOT NULL 
            
        );
        
        INSERT INTO public.usersgroups
        ("name")
        VALUES('admin');
        
        INSERT INTO public.usersgroups
        ("name")
        VALUES('user');

    `;
