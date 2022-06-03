import { AuthController } from './Auth/Auth.controller';
import { UsersController } from './Users/Users.controller';

const authController = new AuthController();
const usersController = new UsersController();

export {
    authController,
    usersController,
};
