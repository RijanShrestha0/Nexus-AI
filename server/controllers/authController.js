const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');

// In-Memory DB Simulation (Replace with mapped PostgreSQL/Mongoose or Prisma architecture)
const usersDB = [];
exports.usersDB = usersDB;

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
  // We must physically verify the user exists in our current state boundary
  const user = usersDB.find(u => u.id === req.user.id);
  
  if (!user) {
    return res.status(401).json({ error: 'Session context invalidated after server restart. Please re-authenticate.' });
  }

  res.json({ 
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      residency: user.residency || 'eu' // mapping region residency
    } 
  });
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, residency, currentPassword, newPassword } = req.body;
    const userId = req.user.id;
    
    const userIndex = usersDB.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'User context not found.' });
    }

    const user = usersDB[userIndex];

    // If updating sensitive fields, verify credentials if password is provided
    if (newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password verification failed.' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (residency) user.residency = residency;

    // Update global reference
    usersDB[userIndex] = user;

    // Re-sign token if name/email changed for UI consistency
    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role, residency: user.residency }, 
      JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Profile configuration updated successfully.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update specifically failed:', error);
    res.status(500).json({ error: 'Update pipeline crashed.' });
  }
};
