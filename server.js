const express = require('express');
const app = express();
const cors = require('cors');
const sequelize = require('./src/config/Database');
const runConsumer = require('./kafka/consumers/kafkaConsumer');

app.use(express.json());

const authRoutes = require('./src/routes/routes');
app.use(cors());
app.use('/api', authRoutes);

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    runConsumer().catch(error => console.error('Error in running consumer:', error));

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
  }
};

startServer();
