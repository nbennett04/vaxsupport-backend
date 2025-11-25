require('dotenv').config();

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const morgan = require('morgan');

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reportRoutes = require('./routes/reportRoutes');
const userRoutes = require('./routes/userRoutes');
const countryRoutes = require('./routes/countryRoutes');
const stateRoutes = require('./routes/stateRoutes');
const modelRoutes = require('./routes/modelRoutes');
const toolRoutes = require('./routes/datasetRoutes'); // Import tool routes
const deleteOldConversations = require('./utils/cleanupService');
const resetDailyLimit = require('./utils/resetDailyLimit');

// (kept as in your file, even if unused)
// const Model = require('./models/models');
// const ModelController = require('./controllers/modelController');

const app = express();

// ----- DB connect + maintenance jobs -----
connectDB().then(() => {
  deleteOldConversations();
  resetDailyLimit();
});

// ----- Core middleware -----
app.use(express.json());

// IMPORTANT: must be BEFORE session when using secure cookies behind proxies (ngrok/Vercel/Nginx)
app.set('trust proxy', 1);

app.use(cookieParser());

// ----- CORS (credentials on) -----
const allowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://app.vaccinesupport.co',
  process.env.APP_URL, // optional
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ----- Session (env-aware cookie flags) -----
const isProd = process.env.NODE_ENV === 'production';
const SESSION_COOKIE_NAME = 'connect.sid';

if (!process.env.SESSION_SECRET) {
  console.warn('⚠️  SESSION_SECRET is not set. Set it in .env for security.');
}

app.use(
  session({
    name: SESSION_COOKIE_NAME,
    secret: process.env.SESSION_SECRET || 'change-me',
    resave: false,
    saveUninitialized: false, // don’t set cookie until something stored in session
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      dbName: process.env.DB_NAME,
      collectionName: 'sessions',
      ttl: 7 * 24 * 60 * 60, // seconds (store TTL)
    }),
    cookie: {
      httpOnly: true,
      path: '/',
      sameSite: isProd ? 'none' : 'lax', // cross-site needs None+Secure
      secure: isProd,                    // must be true when sameSite=None
      maxAge: 60 * 60 * 1000,            // ms (1 hour)
    },
  })
);

app.use(morgan('dev'));

// ----- Routes -----
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/countries', countryRoutes);
app.use('/api/states', stateRoutes);
app.use('/api/admin/models', modelRoutes);
app.use('/api/admin/tools', toolRoutes);

// Root
app.get('/', (_req, res) => {
  res.send('Hello!');
});

// Global error handler (prevents silent hangs)
app.use((err, req, res, next) => {
  console.error('UNHANDLED ERROR:', err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({ message: 'Internal error', detail: err?.message });
});

// ----- Start -----
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
