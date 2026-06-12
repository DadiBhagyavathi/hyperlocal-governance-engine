/**
 * seedAll.js — Seeds all collections so every dashboard shows real data on login.
 * Run: node seedAll.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hypergov';

/* ─── Inline schemas (avoids import path issues) ─────────────────────────── */

const User = mongoose.model('User', new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['CITIZEN','GOVERNMENT','ENGINEER','ADMIN'], default: 'CITIZEN' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true }));

const Report = mongoose.model('Report', new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, required: true },
  location: {
    text: { type: String, required: true },
    lat:  Number,
    lng:  Number
  },
  category:    { type: String, enum: ['ROAD','HOSPITAL','BRIDGE','PARK','OTHER'], required: true },
  photoUrl:    String,
  status:      { type: String, enum: ['PENDING','CLAIMED'], default: 'PENDING' },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  claimedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId:   { type: mongoose.Schema.Types.ObjectId, ref: 'RbacProject' }
}, { timestamps: true }));

const RbacProject = mongoose.model('RbacProject', new mongoose.Schema({
  title:             { type: String, required: true },
  description:       String,
  reportId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Report' },
  status:            { type: String, enum: ['PLANNING','IN_PROGRESS','COMPLETED'], default: 'PLANNING' },
  assignedEngineers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdBy:         { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }));

const ProgressUpdate = mongoose.model('ProgressUpdate', new mongoose.Schema({
  projectId:            { type: mongoose.Schema.Types.ObjectId, ref: 'RbacProject', required: true },
  text:                 { type: String, required: true },
  completionPercentage: { type: Number, min: 0, max: 100, required: true },
  photoUrl:             String,
  postedBy:             { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true }));

const Notification = mongoose.model('Notification', new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      String,
  title:     String,
  message:   String,
  relatedId: mongoose.Schema.Types.ObjectId,
  read:      { type: Boolean, default: false }
}, { timestamps: true }));

/* ─── Seed data ──────────────────────────────────────────────────────────── */

const DEMO_USERS = [
  { name: 'Admin User',      email: 'admin@demo.civillens.ai',    password: 'demo1234', role: 'ADMIN' },
  { name: 'Govt Official',   email: 'govt@demo.civillens.ai',     password: 'demo1234', role: 'GOVERNMENT' },
  { name: 'Site Engineer',   email: 'engineer@demo.civillens.ai', password: 'demo1234', role: 'ENGINEER' },
  { name: 'Rahul Citizen',   email: 'citizen@demo.civillens.ai',  password: 'demo1234', role: 'CITIZEN' }
];

// Reports: damaged/broken conditions submitted by citizen
const REPORT_TEMPLATES = [
  {
    title: 'Broken Road with Deep Potholes',
    description: 'The main road near the market has severe potholes causing accidents. Vehicles are getting damaged daily.',
    location: { text: 'MG Road, Ward 12, Mumbai', lat: 19.0760, lng: 72.8777 },
    category: 'ROAD',
    photoUrl: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600'
  },
  {
    title: 'Collapsed Bridge Railing',
    description: 'The bridge railing has collapsed on the east side. Very dangerous for pedestrians and cyclists.',
    location: { text: 'River Bridge, Ward 7, Delhi', lat: 28.6139, lng: 77.2090 },
    category: 'BRIDGE',
    photoUrl: 'https://images.unsplash.com/photo-1590932770935-f9b3a4200d42?w=600'
  },
  {
    title: 'Old Hospital Building Needs Urgent Repair',
    description: 'The district hospital building has cracks in walls and leaking roof. Patients are at risk.',
    location: { text: 'District Hospital, Ward 5, Bengaluru', lat: 12.9716, lng: 77.5946 },
    category: 'HOSPITAL',
    photoUrl: 'https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=600'
  },
  {
    title: 'Neglected Park Full of Garbage',
    description: 'The community park has not been maintained for months. Garbage is piling up and lights are broken.',
    location: { text: 'Green Park, Ward 3, Hyderabad', lat: 17.3850, lng: 78.4867 },
    category: 'PARK',
    photoUrl: 'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=600'
  },
  {
    title: 'Waterlogged Road After Rain',
    description: 'The road near school gets completely waterlogged after every rain. Children cannot walk safely.',
    location: { text: 'School Road, Ward 9, Chennai', lat: 13.0827, lng: 80.2707 },
    category: 'ROAD',
    photoUrl: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=600'
  }
];

// Progress updates with "after" improvement photos
const UPDATE_TEMPLATES = [
  {
    text: 'Road resurfacing work started. Old damaged layer removed and new base layer applied.',
    completionPercentage: 35,
    photoUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600'
  },
  {
    text: 'Bridge railing reconstruction 60% complete. New steel railings installed on east side.',
    completionPercentage: 60,
    photoUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600'
  },
  {
    text: 'Hospital renovation complete. New walls, roof, and modern equipment installed.',
    completionPercentage: 100,
    photoUrl: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600'
  },
  {
    text: 'Park cleaned, new benches installed, lights repaired. Landscaping in progress.',
    completionPercentage: 75,
    photoUrl: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=600'
  },
  {
    text: 'Drainage system improved. Road resurfacing with proper slope to prevent waterlogging.',
    completionPercentage: 50,
    photoUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600'
  }
];

/* ─── Main seed function ─────────────────────────────────────────────────── */

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ MongoDB connected:', MONGO_URI);

  /* 1. Clear all collections */
  await Promise.all([
    User.deleteMany({}),
    Report.deleteMany({}),
    RbacProject.deleteMany({}),
    ProgressUpdate.deleteMany({}),
    Notification.deleteMany({})
  ]);
  console.log('🗑️  Cleared all collections');

  /* 2. Create users */
  const createdUsers = {};
  for (const u of DEMO_USERS) {
    const hashed = await bcrypt.hash(u.password, 12);
    const user = await User.create({ ...u, password: hashed });
    createdUsers[u.role] = user;
    console.log(`✅ User [${u.role}] ${u.email}`);
  }

  const citizen  = createdUsers['CITIZEN'];
  const govt     = createdUsers['GOVERNMENT'];
  const engineer = createdUsers['ENGINEER'];

  /* 3. Create reports (submitted by citizen) */
  const createdReports = [];
  for (const t of REPORT_TEMPLATES) {
    const report = await Report.create({ ...t, submittedBy: citizen._id, status: 'PENDING' });
    createdReports.push(report);
  }
  console.log(`✅ Created ${createdReports.length} citizen reports`);

  /* 4. Government claims reports → creates projects */
  const createdProjects = [];
  for (let i = 0; i < createdReports.length; i++) {
    const report = createdReports[i];
    const statuses = ['IN_PROGRESS', 'IN_PROGRESS', 'COMPLETED', 'IN_PROGRESS', 'PLANNING'];

    const project = await RbacProject.create({
      title: report.title,
      description: report.description,
      reportId: report._id,
      status: statuses[i],
      assignedEngineers: [engineer._id],
      createdBy: govt._id
    });

    report.status = 'CLAIMED';
    report.claimedBy = govt._id;
    report.projectId = project._id;
    await report.save();

    createdProjects.push(project);
  }
  console.log(`✅ Created ${createdProjects.length} RBAC projects (claimed by govt)`);

  /* 5. Engineer posts progress updates */
  let updateCount = 0;
  for (let i = 0; i < createdProjects.length; i++) {
    const project = createdProjects[i];
    const upd = UPDATE_TEMPLATES[i];
    if (!upd) continue;

    await ProgressUpdate.create({
      projectId: project._id,
      text: upd.text,
      completionPercentage: upd.completionPercentage,
      photoUrl: upd.photoUrl,
      postedBy: engineer._id
    });
    updateCount++;
  }
  console.log(`✅ Created ${updateCount} progress updates`);

  /* 6. Notifications for citizen */
  for (const project of createdProjects) {
    const report = createdReports.find(r => r.projectId?.toString() === project._id.toString());
    if (!report) continue;

    await Notification.create({
      userId: citizen._id,
      type: 'REPORT_CLAIMED',
      title: 'Your report was claimed!',
      message: `"${report.title}" has been picked up by the government and a project has been created.`,
      relatedId: project._id,
      read: false
    });
  }
  console.log(`✅ Created ${createdProjects.length} notifications for citizen`);

  /* 7. Summary */
  console.log('\n══════════════════════════════════════════════════════');
  console.log('  🎉  DATABASE SEEDED SUCCESSFULLY');
  console.log('══════════════════════════════════════════════════════');
  console.log('\n  LOGIN CREDENTIALS');
  console.log('  ─────────────────────────────────────────────────────');
  console.log('  Role        │ Email                          │ Password');
  console.log('  ─────────────────────────────────────────────────────');
  DEMO_USERS.forEach(u => {
    console.log(`  ${u.role.padEnd(11)} │ ${u.email.padEnd(30)} │ ${u.password}`);
  });
  console.log('  ─────────────────────────────────────────────────────');
  console.log('\n  WHAT EACH DASHBOARD WILL SHOW');
  console.log('  ─────────────────────────────────────────────────────');
  console.log('  CITIZEN     → 5 submitted reports, map pins, notifications');
  console.log('  GOVERNMENT  → 5 pending→claimed projects, assign engineers');
  console.log('  ENGINEER    → 5 assigned projects, progress updates with photos');
  console.log('  ADMIN       → All users, stats, role management');
  console.log('══════════════════════════════════════════════════════\n');

  await mongoose.connection.close();
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seed failed:', err.message);
  process.exit(1);
});
