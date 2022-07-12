let whitelist = ['http://localhost:5001', process.env.WEB_SERVER_FRONT]

export const corsConfig = {
    credentials: true,
    methods: ['GET', 'POST', 'HEAD', 'PUT', 'PATCH', 'DELETE', 'OPTIONS' ],
    origin: function(origin, callback){
        // allow requests with no origin
        if(!origin) return callback(null, true);
        if(whitelist.indexOf(origin) === -1){
            let message = `The CORS policy for this origin doesnt \n allow access from the particular origin.`;
            return callback(new Error(message), false);
        }
        return callback(null, true);
    },
    optionsSuccessStatus: 200,
    //allowedHeaders: ['Origin', 'Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Access-Control-Request-Method', 'Access-Control-Request-Headers' ,'X-CSRF-Token', 'Cache-Control', 'Pragma'],
    exposedHeaders: 'Access-Control-Allow-Origin ,Access-Control-Allow-Credentials, Content-Range, X-Content-Range, X-Total-Count',
}
