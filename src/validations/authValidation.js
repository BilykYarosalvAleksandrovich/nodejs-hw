import { Joi, celebrate, Segments } from 'celebrate';

export const registerUserSchema = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    username: Joi.string().trim().optional(),
  }),
});

export const loginUserSchema = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});
