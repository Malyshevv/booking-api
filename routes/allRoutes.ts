import { router as authRouter } from './Auth/routerAuth';
import { router as userRouter } from './Users/routerUsers';
import { router as staticRouter } from './Static/routerStatic';
/*Generate Import*/

import { router as postsRouter } from './Posts/routerPosts';
/*Generate End Import*/
export {
    authRouter,
    userRouter,
    staticRouter,
    /*Generate Body*/

    postsRouter, 
    /*Generate End Body*/
};
