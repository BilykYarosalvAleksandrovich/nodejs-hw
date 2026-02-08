import { celebrate, Segments } from 'celebrate';
import { requestResetEmailSchema, resetPasswordSchema } from '../validations/authValidation.js';

// ...
router.post(
  '/request-reset-email',
  celebrate({ [Segments.BODY]: requestResetEmailSchema }),
  authController.requestResetEmail
);

router.post(
  '/reset-password',
  celebrate({ [Segments.BODY]: resetPasswordSchema }),
  authController.resetPassword
);
