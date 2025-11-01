import { Router } from "express";
import { registerUser } from "../controllers/user.controller";

const router = Router();

// Define user-related routes here
router.route('/register')
    .post(userController.registerUser);
router.route('/login')
    .post(userController.loginUser);
router.route('/profile')
    .get(userController.getUserProfile);


export { registerUser };
export default router;