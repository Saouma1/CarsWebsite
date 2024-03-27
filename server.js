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
    res.sendFile(__dirname + '/public/main.html');
});

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { 
    type: String, 
    unique: true,
    required: true
  },
  password: String, // Hash passwords before storing
  role: {
    type: String,
    default: 'user', // Default role is 'user'. Other role is 'admin'.
    enum: ['user', 'admin']
  },
  cars: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Car' }]
});

// User model
const User = mongoose.model('User', userSchema);

// Sign-up route
app.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    // Using the Account model for registration
    const account = new User({ name, email, password });
    await account.save();
    res.status(201).send('Account created successfully');
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error code
      res.status(400).send('Email already exists');
    } else {
      console.error('Signup error:', error);
      res.status(500).send('Error creating account');
    }
  }
});

// Sign-in route
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email });
    if (user && user.password === password) {
      req.session.userId = user._id;
      req.session.userName = user.name; // Store the user's name in the session
      req.session.userRole = user.role; // Store the user's role in the session

      if (user.role === 'admin') {
        // Redirect admin users to the admin dashboard
        return res.json({ success: true, redirectURL: "/adminDashboard.html" });
      } else {
        // Redirect non-admin users to the welcome page
        return res.json({ success: true, redirectURL: "/welcome" });
      }
    } else {
      return res.status(401).send('Authentication failed');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error during sign in');
  }
});

function isAdmin(req, res, next) {
  if (req.session.userRole === 'admin') {
    return next();
  }
  return res.status(403).send("Access denied. Admins only.");
}

app.get('/adminDashboard', isAdmin, async (req, res) => {
  try {
    // Use aggregation to fetch users and their associated cars
    const usersWithCars = await User.aggregate([
      {
        $lookup: {
          from: 'cars', // Ensure this matches the actual collection name in MongoDB
          localField: '_id', // The field in the User collection
          foreignField: 'user', // The field in the Car collection that corresponds to the User _id
          as: 'cars', // The field in the aggregated result that will contain the matched cars
        },
      },
      {
        $project: { password: 0 }, // Exclude sensitive information like passwords from the result
      },
    ]);

    // Since you're sending JSON back, make sure the client-side code can handle this data structure
    res.json(usersWithCars);
  } catch (error) {
    console.error("Error loading admin dashboard:", error);
    res.status(500).send('Error loading admin dashboard');
  }
});

// Create a new route for '/welcome'
app.get('/welcome', check, (req, res) => {
  if (req.session.userName) {
    res.sendFile(__dirname + '/public/welcome.html');
  } else {
    res.redirect('/signin.html');
  }
});

// Middleware to check if the user is authenticated
function check(req, res, next) {
  if (req.session.userId) {
    return next();
  }
  res.redirect('/signin.html');
}
app.get('/getUserName', (req, res) => {
  if (req.session.userName) {
    res.json({ userName: req.session.userName });
  } else {
    res.status(401).send('Not authenticated');
  }
});
  
// Car Schema
const carSchema = new mongoose.Schema({
  name: String,
  lastName: String,
  lotNumber: { type: String, unique: true, required: true },
  carBrand: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
});

// Car model
const Car = mongoose.model('Car', carSchema);

// Cars route
app.post('/cars', async (req, res) => {
  const { name, lastName, lotNumber, carBrand } = req.body;
  const userId = req.session.userId; // This should be set correctly

  if (!userId) {
    // If userId is not set, throw an error or return a response
    return res.status(403).json({ message: 'Not authorized' });
  }

  try {
    const car = new Car({
      name,
      lastName,
      lotNumber,
      carBrand,
      user: userId // Associate the car with the currently authenticated user
    });
    await car.save();
    res.status(201).json({ message: 'Car added successfully', car });
  } catch (error) {
    if (error.code === 11000) { // MongoDB duplicate key error for lotNumber
      res.status(400).send('A car with this lot number already exists.');
    } else {
      console.error('Error saving car data:', error);
      res.status(500).send('Error saving car data');
    }
  }
});

const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  }
  // Redirect to login page or send an error
  res.status(401).send('You are not authenticated');
};

app.get('/search-cars', isAuthenticated, async (req, res) => {
  try {
    const lotNumber = req.query.lotNumber;
    const cars = await Car.find({ lotNumber: lotNumber }).populate('user');
    res.json(cars);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).send('Error performing search');
  }
});

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


