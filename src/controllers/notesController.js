import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

/* GET /notes */
export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;
    const limit = parseInt(perPage);
    const skip = (parseInt(page) - 1) * limit;

    // Створюємо базовий запит через ланцюжок методів Mongoose
    const notesQuery = Note.find();

    if (tag) {
      notesQuery.where('tag').equals(tag);
    }

    if (search) {
      notesQuery.where({ $text: { $search: search } });
    }

    // Створюємо окремий запит для підрахунку з тими ж фільтрами
    const countQuery = Note.countDocuments(notesQuery.getFilter());

    // Виконуємо обидва запити паралельно через Promise.all
    const [totalNotes, notes] = await Promise.all([
      countQuery,
      notesQuery.skip(skip).limit(limit).sort({ createdAt: -1 }).exec(),
    ]);

    const totalPages = Math.ceil(totalNotes / limit);

    res.status(200).json({
      page: parseInt(page),
      perPage: limit,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

/* GET /notes/:noteId */
export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

/* POST /notes */
export const createNote = async (req, res, next) => {
  try {
    const note = await Note.create(req.body);
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

/* DELETE /notes/:noteId */
export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndDelete(noteId);
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

/* PATCH /notes/:noteId */
export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findByIdAndUpdate(noteId, req.body, { new: true });
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};
