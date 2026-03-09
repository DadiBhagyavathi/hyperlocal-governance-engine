const proofs = new Map();

// Initialize with sample data
proofs.set('main-street', {
  projectId: 'main-street',
  projectTitle: 'Main Street Renovation',
  beforeImage: 'https://images.unsplash.com/photo-1581094271901-8022df4466f9?w=400&h=250&fit=crop',
  afterImage: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=250&fit=crop',
  description: 'Transformed old damaged road into modern 4-lane smart road',
  status: 'COMPLETED',
  createdAt: new Date('2024-01-15')
});

proofs.set('community-park', {
  projectId: 'community-park',
  projectTitle: 'Community Park Development',
  beforeImage: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=250&fit=crop',
  afterImage: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400&h=250&fit=crop',
  description: 'Converted unused vacant land into green park with playground and walking trails',
  status: 'IN_PROGRESS',
  createdAt: new Date('2024-02-10')
});

proofs.set('hospital-upgrade', {
  projectId: 'hospital-upgrade',
  projectTitle: 'Hospital Infrastructure Upgrade',
  beforeImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&h=250&fit=crop',
  afterImage: 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=400&h=250&fit=crop',
  description: 'Upgraded old hospital building to modern 200-bed medical facility',
  status: 'COMPLETED',
  createdAt: new Date('2023-11-20')
});

exports.uploadProof = async (data) => {
  const { projectId, projectTitle, beforeImage, afterImage, description } = data;
  const proof = { 
    projectId, 
    projectTitle: projectTitle || 'Development Project',
    beforeImage, 
    afterImage, 
    description, 
    createdAt: new Date() 
  };
  proofs.set(projectId, proof);
  return proof;
};

exports.getProof = async (projectId) => {
  return proofs.get(projectId) || {
    projectId,
    beforeImage: 'https://via.placeholder.com/400x300?text=Old+Road',
    afterImage: 'https://via.placeholder.com/400x300?text=New+Smart+Road',
    description: 'Old Road → New Smart Road'
  };
};

exports.getAllProofs = async () => {
  return Array.from(proofs.values());
};
