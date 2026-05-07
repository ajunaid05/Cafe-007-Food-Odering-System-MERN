const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const Owner = require('./models/Owner');

dotenv.config();

async function migrateOwner() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/foodordering', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Your existing owner credentials
    const email = 'ahmadjunaid007.07@gmail.com';
    const plainPassword = 'Daoud@123';

    // Check if owner already exists
    let owner = await Owner.findOne({ email });
    
    if (owner) {
      console.log('Owner already exists. Updating password...');
      // Hash the plain password
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      owner.password = hashedPassword;
      await owner.save();
      console.log('Owner password updated successfully!');
    } else {
      console.log('Creating new owner...');
      // Hash the plain password
      const hashedPassword = await bcrypt.hash(plainPassword, 10);
      owner = new Owner({ 
        email: email.toLowerCase(), 
        password: hashedPassword 
      });
      await owner.save();
      console.log('Owner created successfully!');
    }

    console.log('\nOwner credentials:');
    console.log('Email:', email);
    console.log('Password:', plainPassword);
    console.log('\nYou can now login with these credentials.');

    process.exit(0);
  } catch (err) {
    console.error('Error migrating owner:', err);
    process.exit(1);
  }
}

migrateOwner();

