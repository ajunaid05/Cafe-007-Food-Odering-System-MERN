const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Owner = require('./models/Owner');

dotenv.config();

async function migrateOwner() {
  const email = process.env.OWNER_EMAIL;
  const plainPassword = process.env.OWNER_PASSWORD;

  if (!email || !plainPassword) {
    console.error('Set OWNER_EMAIL and OWNER_PASSWORD in backend/.env before running this script.');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodordering');

    let owner = await Owner.findOne({ email: email.toLowerCase() });

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    if (owner) {
      owner.password = hashedPassword;
      await owner.save();
      console.log('Owner password updated for:', email.toLowerCase());
    } else {
      owner = await Owner.create({
        email: email.toLowerCase(),
        password: hashedPassword,
      });
      console.log('Owner created:', owner.email);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error migrating owner:', err.message);
    process.exit(1);
  }
}

migrateOwner();
