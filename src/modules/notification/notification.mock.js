/**
 * Centralized mock civic notification templates
 * Can be replaced by DB / external notification provider later
 */

module.exports = {
  HOSPITAL: [
    "This government hospital renovation improves healthcare access for your locality.",
    "Public funds are being utilized to upgrade medical infrastructure here.",
  ],
  EDUCATION: [
    "This government college upgrade enhances learning facilities for students.",
    "New classrooms and labs are part of this public education initiative.",
  ],
  INFRASTRUCTURE: [
    "This infrastructure project improves public connectivity and safety.",
    "This development work is part of the city's long-term growth plan.",
  ],
  DEFAULT: [
    "This is a government development project funded for public benefit.",
  ],
};

/**
 * Centralized mock civic notification templates
 * Designed for future DB or provider replacement
 */

module.exports = {
  HOSPITAL: [
    {
      category: "HEALTHCARE",
      text: "This government hospital renovation improves healthcare access for your locality.",
    },
    {
      category: "HEALTHCARE",
      text: "Public funds are being utilized to upgrade medical infrastructure here.",
    },
  ],

  EDUCATION: [
    {
      category: "EDUCATION",
      text: "This government college upgrade enhances learning facilities for students.",
    },
    {
      category: "EDUCATION",
      text: "New classrooms and labs are part of this public education initiative.",
    },
  ],

  INFRASTRUCTURE: [
    {
      category: "CIVIC_DEVELOPMENT",
      text: "This infrastructure project improves public connectivity and safety.",
    },
    {
      category: "CIVIC_DEVELOPMENT",
      text: "This development work is part of the city's long-term growth plan.",
    },
  ],

  DEFAULT: [
    {
      category: "GENERAL",
      text: "This is a government development project funded for public benefit.",
    },
  ],
};