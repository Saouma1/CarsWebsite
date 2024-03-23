const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const app = express();
require('dotenv').config();

app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.static('public'));
const dbURI = 'mongodb+srv://jfsawma:Df7oDymQJ1GfGw27@farhat.muf740n.mongodb.net/';
app.use(session({
  secret: 'your_secret_key', // Ensure you have a strong secret for production
  resave: false, // Do not save session if unmodified
  saveUninitialized: false, // Do not create session until something stored
  store: MongoStore.create({ mongoUrl: dbURI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // Example: 24-hour cookie life
}));

// MongoDB connection string


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
    if (user && user.password === password) { // Replace with bcrypt in production
      // Set user ID in session
      req.session.userId = user._id;
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
  carBrand: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
});

// Car model
const Car = mongoose.model('Car', carSchema);

// Cars route
app.post('/cars', async (req, res) => {
  try {
    // Assuming `req.session.userId` is set through some form of middleware after authentication
    const userId = req.session.userId; // This should be set correctly
    if (!userId) {
      // If userId is not set, throw an error or return a response
      return res.status(403).json({ message: 'Not authorized' });
    }

    const carData = { ...req.body, user: userId };
    const car = new Car(carData);
    await car.save();
    res.status(201).json(car);
  } catch (error) {
    console.error('Error saving car data:', error);
    // Send back a descriptive error message
    res.status(500).json({ message: 'Error saving car data', error: error.message });
  }
});

const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  // Redirect to login page or send an error
  res.status(401).send('You are not authenticated');
};

app.get('/cars-data', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId; // Retrieve user ID from session
    const cars = await Car.find({ user: userId }); // Fetch cars for the logged-in user
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

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Could not log out');
    }
    // Redirect to login page or send a success message
    res.redirect('/signin.html');
  });
});

// Use this middleware on routes that require authentication
app.get('/cars-data', isAuthenticated, async (req, res) => {
  // Your existing logic
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
      const carId = req.params.id;
      const updates = req.body;
      
      // Update the car with the new data
      const car = await Car.findByIdAndUpdate(carId, updates, { new: true });
      if (!car) {
          return res.status(404).json({ message: 'Car not found' });
      }
      res.json(car);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error updating car', error: error.message });
  }
});
