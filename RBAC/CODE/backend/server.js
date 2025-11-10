require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
const cookieParser = require('cookie-parser')
const logger = require('./utils/logger')
const metrics = require('./utils/metrics')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const authRoutes = require('./routes/auth')
const postRoutes = require('./routes/posts')
const adminRoutes = require('./routes/admin')

const app = express()
const PORT = process.env.PORT || 5000

// Middlewares
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}))

app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true 
}))

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

// Structured logging middleware
app.use((req, res, next) => {
  const { v4: uuidv4 } = require('uuid')
  req.corrId = req.corrId || uuidv4()
  metrics.increment('apiRequests')
  next()
})

// Morgan for HTTP logging
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api/', limiter)

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 login attempts per 15 minutes
  message: 'Too many login attempts, please try again later.',
  skipSuccessfulRequests: true
})

app.use('/api/auth/login', authLimiter)

// Metrics endpoint
app.get('/api/metrics', (req, res) => {
  res.json(metrics.getMetrics())
})

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use(notFoundHandler)

// Error handling middleware (must be last)
app.use(errorHandler)

// Connect to MongoDB and start
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_demo')
  .then(() => {
    logger.info('Connected to MongoDB', { 
      uri: process.env.MONGO_URI || 'mongodb://localhost:27017/rbac_demo'
    })
    app.listen(PORT, () => {
      logger.info(`Server listening on port ${PORT}`, { port: PORT })
    })
  })
  .catch((err) => {
    logger.error('MongoDB connection error', { error: err.message, stack: err.stack })
    process.exit(1)
  })

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server')
  process.exit(0)
})

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server')
  process.exit(0)
})
