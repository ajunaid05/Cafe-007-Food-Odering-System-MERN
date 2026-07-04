const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Owner = require('./models/Owner');

dotenv.config();

async function seedOwner() {
  const email = process.env.OWNER_EMAIL || 'owner@restaurant.com';
  const password = process.env.OWNER_PASSWORD;

  if (!password) {
    console.error('Set OWNER_PASSWORD in backend/.env before running seedOwner.js');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodordering');

    const emailNorm = email.toLowerCase();
    let owner = await Owner.findOne({ email: emailNorm });

    if (!owner) {
      const hashed = await bcrypt.hash(password, 10);
      owner = await Owner.create({ email: emailNorm, password: hashed });
      console.log('Owner created:', emailNorm);
    } else {
      console.log('Owner already exists:', emailNorm);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error seeding owner:', err.message);
    process.exit(1);
  }
}

seedOwner();
