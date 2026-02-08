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

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(400, 'Email in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, password: hashedPassword });

    const session = await createSession(user._id);
    setSessionCookies(res, session);

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
    const { sessionId } = req.cookies;
    if (sessionId) {
      await Session.deleteOne({ _id: sessionId });
    }
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// --- ВИПРАВЛЕНИЙ КОНТРОЛЕР ТУТ ---
export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;

    if (!sessionId || !refreshToken) {
      throw createHttpError(401, 'Session not found');
    }

    const session = await Session.findOne({ _id: sessionId, refreshToken });
    if (!session) {
      throw createHttpError(401, 'Session not found');
    }

    if (new Date() > new Date(session.refreshTokenValidUntil)) {
      throw createHttpError(401, 'Refresh token expired');
    }

    const userId = session.userId;
    await Session.deleteOne({ _id: sessionId });

    const newSession = await createSession(userId);
    setSessionCookies(res, newSession);

    // Змінено з повернення токена на JSON-повідомлення
    res.status(200).json({
      message: 'Successfully refreshed session!',
    });
  } catch (error) {
    next(error);
  }
};

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
      from: process.env.SMTP_FROM,
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
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      throw createHttpError(401, 'Invalid or expired token');
    }

    const user = await User.findOne({ _id: decoded.sub, email: decoded.email });
    if (!user) throw createHttpError(404, 'User not found');

    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
