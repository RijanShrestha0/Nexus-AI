const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth');
const { usersDB } = require('../models/database');

exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ error: 'Please specifically fill all actively required structured fields.' });
    }

    const existingUser = usersDB.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User mapping natively exists.' });
    }

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
      residency: 'eu',
      createdAt: new Date().toISOString()
    };

    usersDB.push(newUser);

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role, residency: newUser.residency }, 
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
        role: newUser.role,
        residency: newUser.residency
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
      { id: user.id, email: user.email, name: user.name, role: user.role, residency: user.residency }, 
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
        role: user.role,
        residency: user.residency
      }
    });

  } catch (error) {
    console.error('Login specifically failed:', error);
    res.status(500).json({ error: 'Server authentication pipeline crashed.' });
  }
};

exports.getMe = (req, res) => {
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
      residency: user.residency || 'eu'
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

    usersDB[userIndex] = user;

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
        role: user.role,
        residency: user.residency
      }
    });

  } catch (error) {
    console.error('Update specifically failed:', error);
    res.status(500).json({ error: 'Update pipeline crashed.' });
  }
};
