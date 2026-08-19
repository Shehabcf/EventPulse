require('dotenv').config();
const dns = require('dns')
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Category = require('../models/Category');
const Event = require('../models/Event');
const User = require('../models/User');

dns.setServers(['8.8.8.8', '8.8.4.4']);
const CATEGORY_NAMES = ['Music', 'Tech', 'Sports'];

const ADMIN = {
  name: 'Admin User',
  email: 'admin@eventpulse.com',
  password: 'Admin@1234',
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB for seeding...');

  // 1) Categories — upsert so running the script twice never duplicates data
  const categories = {};
  for (const name of CATEGORY_NAMES) {
    const category = await Category.findOneAndUpdate(
      { name },
      { name },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    categories[name] = category;
  }
  console.log('Categories ready:', Object.keys(categories));

  // 2) Admin user — only create if it doesn't already exist
  let admin = await User.findOne({ email: ADMIN.email });
  if (!admin) {
    const hashedPassword = await bcrypt.hash(ADMIN.password, 12);
    admin = await User.create({
      name: ADMIN.name,
      email: ADMIN.email,
      password: hashedPassword,
      role: 'admin',
    });
    console.log('Admin user created:', admin.email);
  } else {
    console.log('Admin user already exists:', admin.email);
  }

  // 3) Sample events — upsert on a unique-ish combination (name) to avoid duplicates
  const sampleEvents = [
    {
      name: 'Cairo Jazz Night',
      description: 'A relaxed evening of live jazz in downtown Cairo.',
      date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      city: 'Cairo',
      capacity: 100,
      category: categories.Music._id,
    },
    {
      name: 'JS Backend Meetup',
      description: 'Community meetup on Node.js, Express and MongoDB best practices.',
      date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
      city: 'Alexandria',
      capacity: 50,
      category: categories.Tech._id,
    },
    {
      name: 'Damietta 5K Run',
      description: 'A community 5K run along the Damietta corniche.',
      date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      city: 'Damietta',
      capacity: 200,
      category: categories.Sports._id,
    },
  ];

  for (const eventData of sampleEvents) {
    await Event.findOneAndUpdate(
      { name: eventData.name },
      { ...eventData, createdBy: admin._id },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('Sample events ready:', sampleEvents.map((e) => e.name));

  console.log('Seeding complete.');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
