import { Router } from 'express';
import { celebrate } from 'celebrate';
import * as notesController from '../controllers/notesController.js';
import * as schemas from '../validations/notesValidation.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

router.get(
  '/notes',
  celebrate(schemas.getAllNotesSchema),
  notesController.getAllNotes
);

router.get(
  '/notes/:noteId',
  celebrate(schemas.noteIdSchema),
  notesController.getNoteById
);

router.post(
  '/notes',
  celebrate(schemas.createNoteSchema),
  notesController.createNote
);

router.patch(
  '/notes/:noteId',
  celebrate(schemas.updateNoteSchema),
  notesController.updateNote
);

router.delete(
  '/notes/:noteId',
  celebrate(schemas.noteIdSchema),
  notesController.deleteNote
);

export default router;
