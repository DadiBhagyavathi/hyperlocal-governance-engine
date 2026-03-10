const mongoose = require('mongoose');
require('dotenv').config();

const projectSchema = new mongoose.Schema({
  name: String,
  location: String,
  ward: String,
  category: String,
  beforeImage: String,
  afterImage: String,
  description: String,
  budget: Number,
  completionDate: Date,
  createdAt: { type: Date, default: Date.now }
});

const Project = mongoose.model('Project', projectSchema);

const sampleProjects = [
  {
    name: "Main Street Road Renovation",
    location: "Downtown Area",
    ward: "Ward 12",
    category: "Infrastructure",
    beforeImage: "https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?w=400",
    afterImage: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400",
    description: "Damaged pothole-filled road transformed into smooth 4-lane highway with proper drainage.",
    budget: 2100000,
    completionDate: new Date("2024-11-15")
  },
  {
    name: "Community Park Development",
    location: "Green Avenue",
    ward: "Ward 3",
    category: "Environment",
    beforeImage: "https://images.unsplash.com/photo-1611348524140-53c9a25263d6?w=400",
    afterImage: "https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400",
    description: "Vacant neglected land converted into beautiful park with playground and walking trails.",
    budget: 1800000,
    completionDate: new Date("2024-12-20")
  },
  {
    name: "District Hospital Upgrade",
    location: "Medical Road",
    ward: "Ward 5",
    category: "Healthcare",
    beforeImage: "https://images.unsplash.com/photo-1632833239869-a37e3a5806d2?w=400",
    afterImage: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400",
    description: "Old hospital building upgraded to modern facility with 50 new beds and advanced equipment.",
    budget: 4500000,
    completionDate: new Date("2024-10-30")
  },
  {
    name: "River Bridge Construction",
    location: "River Road",
    ward: "Ward 7",
    category: "Infrastructure",
    beforeImage: "https://images.unsplash.com/photo-1590932770935-f9b3a4200d42?w=400",
    afterImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
    description: "Old deteriorating bridge replaced with modern concrete structure for 5000+ daily commuters.",
    budget: 3200000,
    completionDate: new Date("2024-09-25")
  },
  {
    name: "School Infrastructure Upgrade",
    location: "Education Zone",
    ward: "Ward 9",
    category: "Education",
    beforeImage: "https://images.unsplash.com/photo-1613665813446-82a78c468a1d?w=400",
    afterImage: "https://images.unsplash.com/photo-1562774053-701939374585?w=400",
    description: "Old school renovated with new classrooms, computer lab, and sports facilities for 800+ students.",
    budget: 2800000,
    completionDate: new Date("2024-08-15")
  },
  {
    name: "Water Pipeline Network",
    location: "Residential Area",
    ward: "Ward 15",
    category: "Infrastructure",
    beforeImage: "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400",
    afterImage: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400",
    description: "Old leaking pipes replaced with new pipeline ensuring 24/7 water supply to 3000+ households.",
    budget: 1500000,
    completionDate: new Date("2024-07-10")
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hypergov');
    console.log('✅ MongoDB Connected');
    
    await Project.deleteMany({});
    await Project.insertMany(sampleProjects);
    
    console.log('✅ Seeded 6 projects with realistic before/after images');
    mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

seed();
