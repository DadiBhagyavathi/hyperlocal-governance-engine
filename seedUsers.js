const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['CITIZEN', 'GOVERNMENT', 'ENGINEER', 'ADMIN'], default: 'CITIZEN' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const demoUsers = [
  { name: 'Admin User',       email: 'admin@demo.civillens.ai',    password: 'demo1234', role: 'ADMIN' },
  { name: 'Government User',  email: 'govt@demo.civillens.ai',     password: 'demo1234', role: 'GOVERNMENT' },
  { name: 'Engineer User',    email: 'engineer@demo.civillens.ai', password: 'demo1234', role: 'ENGINEER' },
  { name: 'Citizen User',     email: 'citizen@demo.civillens.ai',  password: 'demo1234', role: 'CITIZEN' }
];

async function seedUsers() {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/hypergov';
    await mongoose.connect(uri);
    console.log('✅ MongoDB connected:', uri);

    for (const u of demoUsers) {
      const existing = await User.findOne({ email: u.email });
      if (existing) {
        await User.deleteOne({ email: u.email });
        console.log(`🗑️  Removed old user: ${u.email}`);
      }
      const hashed = await bcrypt.hash(u.password, 12);
      await User.create({ name: u.name, email: u.email, password: hashed, role: u.role });
      console.log(`✅ Created [${u.role}] ${u.email}`);
    }

    console.log('\n🎉 All demo users seeded successfully!');
    console.log('─────────────────────────────────────────');
    console.log('Role        | Email                          | Password');
    console.log('─────────────────────────────────────────');
    demoUsers.forEach(u => {
      console.log(`${u.role.padEnd(11)} | ${u.email.padEnd(30)} | ${u.password}`);
    });
    console.log('─────────────────────────────────────────');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
}

seedUsers();
