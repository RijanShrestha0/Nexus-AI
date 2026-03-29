const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// In-Memory DB Simulation (Replace with mapped PostgreSQL/Mongoose or Prisma architecture)
const usersDB = [];

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ error: 'Please specifically fill all actively required structured fields.' });
    }

    // Check existing
    const existingUser = usersDB.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User mapping natively exists.' });
    }

    // Hash securely
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      id: String(usersDB.length + 1),
      firstName,
      lastName,
      name: `${firstName} ${lastName || ''}`.trim(),
      email,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString()
    };

    usersDB.push(newUser);

    // Create Token universally
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Account configured correctly.',
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Registration structurally failed:', error);
    res.status(500).json({ error: 'Server authentication pipeline crashed.' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = usersDB.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid authentication keys.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid authentication keys.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Logged directly in.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login specifically failed:', error);
    res.status(500).json({ error: 'Server authentication pipeline crashed.' });
  }
};

exports.getMe = (req, res) => {
  // `req.user` uniquely populated successfully via verifyToken
  res.json({ user: req.user });
};
