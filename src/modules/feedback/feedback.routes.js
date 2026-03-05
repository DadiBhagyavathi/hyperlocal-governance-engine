const express = require('express');
const { PrismaClient } = require('@prisma/client');
const router = express.Router();

const prisma = new PrismaClient();

router.post('/', async (req, res) => {
  try {
    const { name, email, category, subject, message, rating } = req.body;
    
    if (!name || !email || !category || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'All fields are required' 
      });
    }
    
    // For now, just return success without database storage
    console.log('Feedback received:', { name, email, category, subject, message, rating });
    
    res.status(201).json({ 
      success: true, 
      message: 'Feedback submitted successfully'
    });
  } catch (error) {
    console.error('Feedback error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

module.exports = router;
