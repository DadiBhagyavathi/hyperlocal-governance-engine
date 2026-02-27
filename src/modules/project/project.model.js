const mongoose = require("mongoose");
const { PROJECT_STATUS } = require("../../config/constants");

/**
 * Project Schema
 * Represents a public development project
 * Geo-indexed and optimized for scalable querying
 */
const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    department: {
      type: String,
      trim: true,
      index: true,
    },

    /**
     * GeoJSON location field (Industry Standard)
     * coordinates: [longitude, latitude]
     */
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
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

    radius: {
      type: Number,
      required: true,
      min: 10,
      max: 5000,
    },

    status: {
      type: String,
      enum: Object.values(PROJECT_STATUS),
      default: PROJECT_STATUS.PLANNED,
      index: true,
    },

    /**
     * Soft delete flag (Enterprise Best Practice)
     */
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* ===========================
   INDEXING (CRITICAL FOR SCALE)
=========================== */

// Geo-spatial index
ProjectSchema.index({ location: "2dsphere" });

// Compound index for filtering active projects by status
ProjectSchema.index({ status: 1, isActive: 1 });

// Sort optimization
ProjectSchema.index({ createdAt: -1 });

/* ===========================
   PRE-SAVE HOOK (Data Normalization)
=========================== */

ProjectSchema.pre("save", function (next) {
  if (this.title) {
    this.title = this.title.trim();
  }
  next();
});

/* ===========================
   STATIC METHODS (Reusable Queries)
=========================== */

/**
 * Fetch only active projects
 */
ProjectSchema.statics.getActiveProjects = function () {
  return this.find({ isActive: true });
};

/**
 * Fetch active in-progress projects
 */
ProjectSchema.statics.getActiveInProgressProjects = function () {
  return this.find({
    isActive: true,
    status: PROJECT_STATUS.IN_PROGRESS,
  });
};

module.exports = mongoose.model("Project", ProjectSchema);