import { Router } from "express";
import * as notesController from "../controllers/notesController.js";
import * as schemas from "../validations/notesValidation.js";

const router = Router();

router.get("/", schemas.getAllNotesSchema, notesController.getAllNotes);

router.get("/:noteId", schemas.noteIdSchema, notesController.getNoteById);

router.post("/", schemas.createNoteSchema, notesController.createNote);

router.delete("/:noteId", schemas.noteIdSchema, notesController.deleteNote);

router.patch("/:noteId", schemas.updateNoteSchema, notesController.updateNote);

export default router;
