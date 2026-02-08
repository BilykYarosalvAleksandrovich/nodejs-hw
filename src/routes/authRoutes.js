import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import * as authController from '../controllers/authController.js';
import {
  registerUserSchema,
  loginUserSchema,
  requestResetEmailSchema,
  resetPasswordSchema,
} from '../validations/authValidation.js';

const router = Router();

// Реєстрація користувача
router.post(
  '/register',
  celebrate({ [Segments.BODY]: registerUserSchema }),
  authController.registerUser
);

// Логін користувача
router.post(
  '/login',
  celebrate({ [Segments.BODY]: loginUserSchema }),
  authController.loginUser
);

// Оновлення сесії
router.post('/refresh', authController.refreshUserSession);

// Логаут
router.post('/logout', authController.logoutUser);

// Запит на скидання пароля (надсилання email)
router.post(
  '/request-reset-email',
  celebrate({ [Segments.BODY]: requestResetEmailSchema }),
  authController.requestResetEmail
);

// Безпосередньо скидання пароля за токеном
router.post(
  '/reset-password',
  celebrate({ [Segments.BODY]: resetPasswordSchema }),
  authController.resetPassword
);

export default router;
