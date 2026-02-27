const dotenv = require("dotenv");

dotenv.config();

/**
 * Required environment variables
 */
const required = [
  "PORT",
  "NODE_ENV",
  "JWT_SECRET"
];

// Validate required env variables
required.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

const env = {
  port: Number(process.env.PORT) || 5000,

  nodeEnv: process.env.NODE_ENV,
  isDev: process.env.NODE_ENV === "development",
  isProd: process.env.NODE_ENV === "production",

  // Database configs (optional depending on your setup)
  mongoUri: process.env.MONGO_URI || null,
  databaseUrl: process.env.DATABASE_URL || null,

  // Security
  jwtSecret: process.env.JWT_SECRET,

  // Business Config
  defaultGeofenceRadius:
    parseInt(process.env.GEOFENCE_DEFAULT_RADIUS, 10) || 200,
};

/**
 * Optional: Log environment mode on startup
 */
console.log(`🌍 Running in ${env.nodeEnv.toUpperCase()} mode`);

module.exports = env;