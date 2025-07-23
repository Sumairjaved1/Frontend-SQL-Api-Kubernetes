const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();
const PORT = 3050;
require('dotenv').config();
// Build the MongoDB URI using environment variables
const mongoURI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@mongodb-service:27017/${process.env.MONGO_DB}?authSource=admin`;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  connectTimeoutMS: 30000,  // Timeout for initial connection attempt
  socketTimeoutMS: 45000,   // Timeout for socket inactivity (queries)
  maxPoolSize: 10,          // Connection pool size (adjust as needed)
  autoIndex: false,         // Disable auto-indexing in production for performance
  retryWrites: true,        // Enable retryable writes (if your setup supports it)
};

// Connect to MongoDB
mongoose.connect(mongoURI, options)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

// Event listeners for connection status
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Gracefully handle process termination (e.g., Ctrl+C)
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  console.log('Mongoose disconnected due to app termination');
  process.exit(0);
});
// Create a schema and model for orders
const orderSchema = new mongoose.Schema({
  serial: { type: Number, required: true, unique: true },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number,
    },
  ],
  total: { type: Number, required: true },
});

const Order = mongoose.model('Order', orderSchema);

// Middleware setup
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'mysecret', resave: false, saveUninitialized: true }));

// Set view engine to EJS
app.set('view engine', 'ejs');

// Dummy login credentials
const USER = { username: 'admin', password: '1234' };

// Store items available for order
const storeItems = [
  { name: 'Apple', price: 50 },
  { name: 'Banana', price: 20 },
  { name: 'Orange', price: 30 },
  { name: 'Pota', price: 40 },
  { name: 'Toma', price: 60 },
  { name: 'Cab', price: 80 },
  { name: 'Watermelon', price: 90 },
  { name: 'Melon', price: 75 },
  { name: 'Carrot', price: 100 },
  { name: 'Pumpkin', price: 200 },
];

// Routes

// Render the login page
app.get('/', (req, res) => {
  res.render('login');
});

// Handle login and redirect to the dashboard
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid login. <a href="/">Try again</a>');
  }
});

// Render the dashboard and fetch orders
app.get('/dashboard', async (req, res) => {
  if (!req.session.user) return res.redirect('/'); // Redirect if not logged in
  try {
    const orders = await Order.find().sort({ serial: -1 }); // Fetch orders sorted by serial number
    res.render('dashboard', { storeItems, orders }); // Pass store items and orders to the dashboard
  } catch (err) {
    console.log('Error fetching orders:', err);
    res.send('Error fetching orders');
  }
});

// Handle new order submission
app.post('/add-order', async (req, res) => {
  const quantities = req.body.quantity; // Get quantities from the form (Object: { Apple: '2', Banana: '0', ... })

  let total = 0;
  let selectedItems = [];

  for (let item of storeItems) {
    let qty = parseInt(quantities[item.name]) || 0; // Ensure the quantity is an integer
    if (qty > 0) {
      let itemTotal = qty * item.price;
      total += itemTotal;
      selectedItems.push({ name: item.name, quantity: qty, price: item.price });
    }
  }

  if (selectedItems.length > 0) {
    const newOrder = new Order({
      serial: Date.now(), // Use the current timestamp as the serial number
      items: selectedItems,
      total,
    });

    try {
      await newOrder.save(); // Save the order to the database
      console.log('Order saved to MongoDB');
      res.redirect('/dashboard'); // Redirect to dashboard after order is saved
    } catch (err) {
      console.log('Error saving order:', err);
      res.send('Error saving order');
    }
  } else {
    res.send('No items selected. <a href="/dashboard">Go back</a>');
  }
});

// Fetch and display all orders (this route may be redundant but can be useful for additional features)
app.get('/orders', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  try {
    const orders = await Order.find().sort({ serial: -1 });
    res.render('orders', { orders });
  } catch (err) {
    console.log('Error fetching orders:', err);
    res.send('Error fetching orders');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
