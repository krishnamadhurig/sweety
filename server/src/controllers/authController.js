const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRegistration } = require('../services/validation');

const SALT_ROUNDS = 10;

function signToken(userId) {
  return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

exports.register = async (req, res, next) => {
  try {
    const errors = validateRegistration(req.body);
    if (Object.keys(errors).length) {
      return res.status(400).json({ error: Object.values(errors)[0], errors });
    }

    const passwordHash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
    try {
      const user = await User.create({
        name: req.body.name.trim(),
        email: req.body.email.trim().toLowerCase(),
        passwordHash,
      });
      return res.status(201).json({ user: publicUser(user), token: signToken(user.id) });
    } catch (err) {
      if (err.code === '23505') {
        const message = 'An account with this email already exists.';
        return res.status(409).json({ error: message, errors: { email: message } });
      }
      throw err;
    }
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'Please enter your email and password.' });
    }

    const user = await User.findByEmail(String(email).trim());

    const ok = user && (await bcrypt.compare(String(password), user.password_hash));
    if (!ok) return res.status(401).json({ error: 'Incorrect email or password.' });

    return res.json({ user: publicUser(user), token: signToken(user.id) });
  } catch (err) {
    return next(err);
  }
};

exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ error: 'Please log in again.' });
    return res.json({ user: publicUser(user) });
  } catch (err) {
    return next(err);
  }
};