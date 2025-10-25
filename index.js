require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
const morgan = require('morgan');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));
app.use(express.static('public')); // Serve static files from public directory

// In-memory user store for demo purposes.
// In production, use a database.
const users = [
  { id: 1, email: 'admin@example.com', password: 'admin123', role: 'Admin' },
  { id: 2, email: 'mod@example.com', password: 'moderator123', role: 'Moderator' },
  { id: 3, email: 'user@example.com', password: 'user123', role: 'User' },
];

// Hash passwords on startup (demo only)
const userStore = users.map(u => ({
  ...u,
  passwordHash: bcrypt.hashSync(u.password, 10),
}));

// Helpers
function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'Missing Authorization header' });

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid Authorization header format' });
  }

  const token = parts[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'RBAC API running',
    endpoints: {
      login: { method: 'POST', path: '/login', body: { email: 'string', password: 'string' } },
      adminDashboard: { method: 'GET', path: '/admin/dashboard', auth: 'Bearer token', role: 'Admin' },
      moderatorTools: { method: 'GET', path: '/moderator/tools', auth: 'Bearer token', roles: ['Admin', 'Moderator'] },
      userProfile: { method: 'GET', path: '/user/profile', auth: 'Bearer token', roles: ['Admin', 'Moderator', 'User'] },
    }
  });
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password required' });
  }

  const user = userStore.find(u => u.email === email);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Invalid credentials' });

  const token = signToken({ id: user.id, email: user.email, role: user.role });
  res.json({
    token,
    user: { id: user.id, email: user.email, role: user.role }
  });
});

// Protected: Admin only
app.get('/admin/dashboard', authMiddleware, requireRole('Admin'), (req, res) => {
  res.json({ message: 'Welcome to Admin dashboard', user: req.user });
});

// Protected: Admin or Moderator
app.get('/moderator/tools', authMiddleware, requireRole('Admin', 'Moderator'), (req, res) => {
  res.json({ message: 'Moderator tools access granted', user: req.user });
});

// Protected: Any authenticated user
app.get('/user/profile', authMiddleware, requireRole('Admin', 'Moderator', 'User'), (req, res) => {
  res.json({ message: 'User profile', user: req.user });
});

// Error handler (basic)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});