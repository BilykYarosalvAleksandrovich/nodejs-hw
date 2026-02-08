import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import handlebars from 'handlebars';
import fs from 'node:fs/promises';
import path from 'node:path';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { sendEmail } from '../utils/sendMail.js';

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
    const templatePath = path.resolve(
      'src/templates/reset-password-email.html'
    );
    const templateSource = await fs.readFile(templatePath, 'utf-8');
    const template = handlebars.compile(templateSource);

    const html = template({
      name: user.username,
      link: `${process.env.FRONTEND_DOMAIN}/reset-password?token=${token}`,
    });

    await sendEmail({
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch (err) {
    return next(
      createHttpError(500, 'Failed to send the email, please try again later.')
    );
  }

  res.status(200).json({ message: 'Password reset email sent successfully' });
};

export const resetPassword = async (req, res, next) => {
  const { token, password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({ _id: decoded.sub, email: decoded.email });

    if (!user) throw createHttpError(404, 'User not found');

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(createHttpError(401, 'Invalid or expired token'));
    }
    next(err);
  }
};
