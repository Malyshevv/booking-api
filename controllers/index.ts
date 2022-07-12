import { AuthController } from './Auth/Auth.controller';
import { UsersController } from './Users/Users.controller';

/*Generate Import*/

import { PostsController } from './Posts/Posts.controller';
/*Generate End Import*/

const authController = new AuthController();
const usersController = new UsersController();

/*Generate Const*/

const postsController = new PostsController();
/*Generate End Const*/

export {
    authController,
    usersController,
    /*Generate Body*/

    postsController, 
    /*Generate End Body*/
};
