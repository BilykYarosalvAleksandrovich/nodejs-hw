import { Router } from 'express';
import { celebrate, Segments } from 'celebrate';
import * as notesController from '../controllers/notesController.js';
import * as schemas from '../validations/notesValidation.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

router.use(authenticate);

// ВАЖЛИВО: вказуємо, яку частину запиту валідуємо (query, params або body)
router.get('/notes',
  celebrate({ [Segments.QUERY]: schemas.getAllNotesSchema }),
  notesController.getAllNotes
);

router.get('/notes/:noteId',
  celebrate({ [Segments.PARAMS]: schemas.noteIdSchema }),
  notesController.getNoteById
);

router.post('/notes',
  celebrate({ [Segments.BODY]: schemas.createNoteSchema }),
  notesController.createNote
);

router.patch('/notes/:noteId',
  celebrate({
    [Segments.PARAMS]: schemas.noteIdSchema,
    [Segments.BODY]: schemas.updateNoteSchema
  }),
  notesController.updateNote
);

router.delete('/notes/:noteId',
  celebrate({ [Segments.PARAMS]: schemas.noteIdSchema }),
  notesController.deleteNote
);

export default router;
