const express = require('express');
const mongoose = require('mongoose');
const app = express();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static('public'));


// MongoDB connection string
const dbURI = 'mongodb+srv://jfsawma:Df7oDymQJ1GfGw27@farhat.muf740n.mongodb.net/';

mongoose.connect(dbURI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));
  
  app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/signin.html');
});


  
// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String // Note: In production, ensure you hash passwords before storing them!
});

// User model
const User = mongoose.model('User', userSchema);

// Sign-up route
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = new User({ name, email, password });
    await user.save();
    res.status(201).send('User created successfully');
  } catch (error) {
    res.status(500).send('Error creating user');
  }
});

// Sign-in route
app.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email: email });
      if (user && user.password === password) {
        // Passwords match (use bcrypt in production)
        res.status(200).json({ message: "Authenticated successfully", redirectURL: "/welcome.html" });
      } else {
        // Authentication failed
        res.status(401).send('Authentication failed');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error during sign in');
    }
  });
  
// Car Schema
const carSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  lotNumber: String,
  carBrand: String
});

// Car model
const Car = mongoose.model('Car', carSchema);

// Cars route
app.post('/cars', async (req, res) => {
  try {
      const car = new Car(req.body);
      await car.save();
      res.status(201).json(car); // Make sure to send JSON back
  } catch (error) {
      res.status(500).json({ message: 'Error saving car data', error: error });
  }
});

app.get('/cars-data', async (req, res) => {
  try {
    const cars = await Car.find();
    res.status(200).json(cars);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching cars', error: error });
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.delete('/cars/:id', async (req, res) => {
  try {
      const result = await Car.deleteOne({ _id: req.params.id });
      if (result.deletedCount === 1) {
          res.status(200).json({ success: true });
      } else {
          res.status(404).json({ success: false, message: 'Car not found' });
      }
  } catch (error) {
      res.status(500).json({ success: false, message: 'Error deleting car', error: error });
  }
});

app.get('/cars/:id', async (req, res) => {
  try {
      const car = await Car.findById(req.params.id);
      if (car) {
          res.status(200).json(car);
      } else {
          res.status(404).send('Car not found');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching car');
  }
});
app.put('/cars/:id', async (req, res) => {
  try {
      const updatedCar = await Car.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (updatedCar) {
          res.status(200).json(updatedCar);
      } else {
          res.status(404).json({ message: 'Car not found' });
      }
  } catch (error) {
      res.status(500).json({ message: 'Error updating car', error: error });
  }
});
