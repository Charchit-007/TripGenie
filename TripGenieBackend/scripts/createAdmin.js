const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/user');
require('dotenv').config();

async function createAdmin() {
  await mongoose.connect(process.env.MONGO_URI);
  
  const password = await bcrypt.hash('Admin@123', 10);
  await User.create({
    name: 'Admin',
    email: 'admin@tripgenie.com',
    password,
    role: 'admin',
    isEmailVerified: true,
  });

  console.log('✅ Admin created successfully');
  await mongoose.disconnect();
}

createAdmin().catch(console.error);