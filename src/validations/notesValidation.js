import Joi from 'joi';
import { TAGS } from '../constants/tags.js';

export const getAllNotesSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  perPage: Joi.number().integer().min(1).max(100).default(10),
  tag: Joi.string()
    .valid(...TAGS)
    .optional(),
  search: Joi.string().allow('').optional(),
});

export const noteIdSchema = Joi.object({
  noteId: Joi.string().hex().length(24).required(),
});

export const createNoteSchema = Joi.object({
  title: Joi.string().required().min(3).max(50),
  content: Joi.string().required(),
  tag: Joi.string()
    .valid(...TAGS)
    .default('Todo'),
});

export const updateNoteSchema = Joi.object({
  title: Joi.string().min(3).max(50).optional(),
  content: Joi.string().optional(),
  tag: Joi.string()
    .valid(...TAGS)
    .optional(),
}).min(1); // Хоча б одне поле має бути для оновлення
