export {};

declare namespace Express {
    export interface Request {
        session: any;
    }
    export interface Response {
        /*YourType: any;*/
    }
}
