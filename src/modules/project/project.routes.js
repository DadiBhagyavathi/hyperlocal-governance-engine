const router = require("express").Router();
const { PrismaClient } = require('@prisma/client');
const { validateProjectInput } = require("./project.validator");

const prisma = new PrismaClient();

router.post("/", async (req, res, next) => {
  const { isValid, errors } = validateProjectInput(req.body);

  if (!isValid) {
    return res.status(400).json({
      success: false,
      errors,
    });
  }

  try {
    const { title, description, budget, status, latitude, longitude, startDate, progress } = req.body;
    
    const project = await prisma.project.create({
      data: {
        title,
        description,
        budget,
        status,
        latitude,
        longitude,
        startDate: new Date(startDate),
        progress: progress || 0
      }
    });
    
    res.status(201).json({ success: true, project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get("/", async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json({ success: true, projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;