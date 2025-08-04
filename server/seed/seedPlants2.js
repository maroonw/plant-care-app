const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Plant = require('../models/Plant');

dotenv.config();

const seedPlants = [
  {
    name: 'Monstera deliciosa',
    tier: 'standard',
    wateringSchedule: 'weekly',
    lightRequirement: 'medium',
    soilType: 'peat-based',
    animalFriendly: false
  },
  {
    name: 'Golden Pothos',
    tier: 'easy',
    wateringSchedule: 'weekly',
    lightRequirement: 'low',
    soilType: 'well-draining',
    animalFriendly: false
  },
  {
    name: 'Snake Plant',
    tier: 'easy',
    wateringSchedule: 'biweekly',
    lightRequirement: 'low',
    soilType: 'cactus',
    animalFriendly: false
  },
  {
    name: 'Spider Plant',
    tier: 'easy',
    wateringSchedule: 'weekly',
    lightRequirement: 'bright indirect',
    soilType: 'well-draining',
    animalFriendly: true
  },
  {
    name: 'Peace Lily',
    tier: 'standard',
    wateringSchedule: 'weekly',
    lightRequirement: 'low',
    soilType: 'moist',
    animalFriendly: false
  },
  {
    name: 'Fiddle-Leaf Fig',
    tier: 'hard',
    wateringSchedule: 'weekly',
    lightRequirement: 'bright indirect',
    soilType: 'well-draining',
    animalFriendly: false
  },
  {
    name: 'ZZ Plant',
    tier: 'easy',
    wateringSchedule: 'biweekly',
    lightRequirement: 'low',
    soilType: 'well-draining',
    animalFriendly: false
  },
  {
    name: 'Pilea peperomioides',
    tier: 'standard',
    wateringSchedule: 'weekly',
    lightRequirement: 'bright indirect',
    soilType: 'peat-based',
    animalFriendly: false
  },
  {
    name: 'Aloe Vera',
    tier: 'standard',
    wateringSchedule: 'biweekly',
    lightRequirement: 'direct',
    soilType: 'cactus',
    animalFriendly: false
  },
  {
    name: 'Jade Plant',
    tier: 'standard',
    wateringSchedule: 'biweekly',
    lightRequirement: 'bright indirect',
    soilType: 'cactus',
    animalFriendly: false
  },
  {
    name: 'Dracaena marginata',
    tier: 'standard',
    wateringSchedule: 'weekly',
    lightRequirement: 'medium',
    soilType: 'well-draining',
    animalFriendly: false
  },
  {
    name: 'Croton',
    tier: 'hard',
    wateringSchedule: 'weekly',
    lightRequirement: 'bright indirect',
    soilType: 'moist',
    animalFriendly: false
  }
];

async function seedDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Plant.deleteMany(); // clear out old plants
    await Plant.insertMany(seedPlants);
    console.log('🌿 Plants seeded with clean enums!');
    mongoose.connection.close();
  } catch (err) {
    console.error(err);
    mongoose.connection.close();
  }
}

seedDB();
