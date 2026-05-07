const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Owner = require('./models/Owner');

dotenv.config();

async function seedOwner() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodordering', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = 'owner@restaurant.com';
    const password = 'Owner@123'; // change after first login

    let owner = await Owner.findOne({ email });
    if (!owner) {
      const hashed = await bcrypt.hash(password, 10);
      owner = new Owner({ email, password: hashed });
      await owner.save();
      console.log('Owner created:', email);
    } else {
      console.log('Owner already exists:', email);
    }
    process.exit(0);
  } catch (err) {
    console.error('Error seeding owner:', err);
    process.exit(1);
  }
}

seedOwner();


