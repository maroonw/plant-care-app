// server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const plantRoutes = require('./routes/plantRoutes');
const authRoutes = require('./routes/authRoutes');
const userPlantRoutes = require('./routes/userPlantRoutes');
const wantedPlantRoutes = require('./routes/wantedPlantRoutes');
const careLogRoutes = require('./routes/careLogRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // for serving uploaded images
app.use('/api/plants', plantRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/userplants', userPlantRoutes);
app.use('/api/wanted', wantedPlantRoutes);
app.use('/api/carelog', careLogRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error(err));
