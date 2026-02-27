const mongoose = require("mongoose");

/**
 * Engagement Schema
 * Tracks citizen interactions with geo-fenced public projects
 * Optimized for analytics, aggregation, and scalability
 */

const EngagementSchema = new mongoose.Schema(
  {
    /**
     * Reference to Project
     */
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },

    /**
     * GeoJSON location of engagement event
     * coordinates: [longitude, latitude]
     */
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true,
        validate: {
          validator: function (value) {
            return value.length === 2;
          },
          message: "Coordinates must be [longitude, latitude]",
        },
      },
    },

    /**
     * Engagement source
     * Helps differentiate interaction origin
     */
    source: {
      type: String,
      enum: ["GEOFENCE", "DASHBOARD", "API"],
      default: "GEOFENCE",
      index: true,
    },

    /**
     * Optional metadata (future extensibility)
     */
    metadata: {
      deviceType: String,
      appVersion: String,
    },

    /**
     * Timestamp
     */
    triggeredAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ===========================
   INDEXING STRATEGY (CRITICAL)
=========================== */

// Geo index for spatial analytics
EngagementSchema.index({ location: "2dsphere" });

// Compound index for fast project analytics
EngagementSchema.index({ projectId: 1, triggeredAt: -1 });

// Compound index for filtering by source
EngagementSchema.index({ source: 1, triggeredAt: -1 });

// Global time-based sorting
EngagementSchema.index({ createdAt: -1 });

/* ===========================
   STATIC METHODS (Reusable Queries)
=========================== */

/**
 * Get engagements for a specific project
 */
EngagementSchema.statics.getByProject = function (projectId) {
  return this.find({ projectId }).sort({ triggeredAt: -1 });
};

/**
 * Get engagements within a date range
 */
EngagementSchema.statics.getWithinRange = function (startDate, endDate) {
  return this.find({
    triggeredAt: { $gte: startDate, $lte: endDate },
  });
};

module.exports = mongoose.model("Engagement", EngagementSchema);