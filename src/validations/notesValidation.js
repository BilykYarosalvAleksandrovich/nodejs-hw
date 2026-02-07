import { Joi, celebrate, Segments } from 'celebrate';
import { isValidObjectId } from 'mongoose';
import { TAGS } from '../constants/tags.js';

const customObjectId = (value, helpers) => {
  if (!isValidObjectId(value)) {
    return helpers.message('Invalid ID format');
  }
  return value;
};

export const getAllNotesSchema = celebrate({
  [Segments.QUERY]: Joi.object().keys({
    page: Joi.number().integer().min(1).default(1),
    perPage: Joi.number().integer().min(5).max(20).default(10),
    tag: Joi.string()
      .valid(...TAGS)
      .optional(),
    search: Joi.string().allow('').optional(),
  }),
});

export const noteIdSchema = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    noteId: Joi.string().custom(customObjectId).required(),
  }),
});

export const createNoteSchema = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(1).required(),
    content: Joi.string().allow('').optional(),
    tag: Joi.string()
      .valid(...TAGS)
      .optional(),
  }),
});

export const updateNoteSchema = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    noteId: Joi.string().custom(customObjectId).required(),
  }),
  [Segments.BODY]: Joi.object()
    .keys({
      title: Joi.string().min(1).optional(),
      content: Joi.string().allow('').optional(),
      tag: Joi.string()
        .valid(...TAGS)
        .optional(),
    })
    .min(1), // Хоча б одне поле має бути
});
