import { Router } from 'express';
import * as notesController from '../controllers/notesController.js';
import * as schemas from '../validations/notesValidation.js';
import { authenticate } from '../middleware/authenticate.js';

const router = Router();

// Застосовуємо authenticate до всіх маршрутів нотаток
router.use(authenticate);

router.get('/', schemas.getAllNotesSchema, notesController.getAllNotes);
router.get('/:noteId', schemas.noteIdSchema, notesController.getNoteById);
router.post('/', schemas.createNoteSchema, notesController.createNote);
router.patch('/:noteId', schemas.updateNoteSchema, notesController.updateNote);
router.delete('/:noteId', schemas.noteIdSchema, notesController.deleteNote);

export default router;
