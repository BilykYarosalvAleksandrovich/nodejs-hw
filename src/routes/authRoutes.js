import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import * as authController from '../controllers/authController.js';
import { registerUserSchema, loginUserSchema } from '../validations/authValidation.js';

const router = Router();

router.post(
  '/auth/register',
  celebrate({ [Segments.BODY]: registerUserSchema }),
  authController.registerUser
);

router.post(
  '/auth/login',
  celebrate({ [Segments.BODY]: loginUserSchema }),
  authController.loginUser
);

router.post('/auth/refresh', authController.refreshUserSession);

router.post('/auth/logout', authController.logoutUser);

export default router;
