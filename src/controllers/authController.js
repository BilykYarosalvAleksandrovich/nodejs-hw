import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import path from 'node:path';
import fs from 'node:fs/promises';
import handlebars from 'handlebars';

import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { sendEmail } from '../utils/sendMail.js';
import { createSession, setSessionCookies } from '../services/auth.js';

// --- Існуючі контролери ---
export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) throw createHttpError(409, 'Email in use');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, password: hashedPassword });
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw createHttpError(401, 'Invalid credentials');
    }
    await Session.deleteMany({ userId: user._id });
    const session = await createSession(user._id);
    setSessionCookies(res, session);
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    if (req.cookies.refreshToken) {
      await Session.deleteOne({ refreshToken: req.cookies.refreshToken });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const session = await createSession(req.user._id); // Логіка сервісу
    setSessionCookies(res, session);
    res.status(200).json({ message: 'Session refreshed' });
  } catch (error) {
    next(error);
  }
};

// --- Скидання пароля ---
export const requestResetEmail = async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res
      .status(200)
      .json({ message: 'Password reset email sent successfully' });
  }

  const token = jwt.sign({ sub: user._id, email }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });

  try {
    const templateSource = await fs.readFile(
      path.resolve('src/templates/reset-password-email.html'),
      'utf-8'
    );
    const template = handlebars.compile(templateSource);
    const html = template({
      name: user.username,
      link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`,
    });

    await sendEmail({
      from: process.env.SMTP_FROM, // Явно вказуємо відправника
      to: email,
      subject: 'Reset your password',
      html,
    });

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    next(
      createHttpError(500, 'Failed to send the email, please try again later.')
    );
  }
};

export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.sub, email: decoded.email });
    if (!user) throw createHttpError(404, 'User not found');

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(
      error.name === 'TokenExpiredError'
        ? createHttpError(401, 'Token expired')
        : error
    );
  }
};
