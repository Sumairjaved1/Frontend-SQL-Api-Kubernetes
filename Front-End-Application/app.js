const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();
const PORT = 3050;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:30100/orders', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.log('MongoDB connection error:', err);
});

// Create a schema and model for orders
const orderSchema = new mongoose.Schema({
  serial: { type: Number, required: true, unique: true },
  items: [
    {
      name: String,
      quantity: Number,
      price: Number
    }
  ],
  total: { type: Number, required: true }
});

const Order = mongoose.model('Order', orderSchema);

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'mysecret', resave: false, saveUninitialized: true }));

app.set('view engine', 'ejs');

// Dummy login
const USER = { username: 'admin', password: '1234' };

// Store Items
const storeItems = [
  { name: 'Apple', price: 50 },
  { name: 'Banana', price: 20 },
  { name: 'Orange', price: 30 },
  { name: 'Potato', price: 40 },
  { name: 'Tomato', price: 60 },
  { name: 'Cabbage', price: 80 },
  { name: 'Watermelon', price: 90 },
  { name: 'Melon', price: 75 },
  { name: 'Carrot', price: 100 },
  { name: 'Pumpkin', price: 200 },
];

// Routes
app.get('/', (req, res) => {
  res.render('login');
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === USER.username && password === USER.password) {
    req.session.user = username;
    res.redirect('/dashboard');
  } else {
    res.send('Invalid login. <a href="/">Try again</a>');
  }
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/');
  res.render('dashboard', { storeItems });
});

app.post('/add-order', async (req, res) => {
  const quantities = req.body.quantity; // Object { Apple: '2', Banana: '0', ... }

  let total = 0;
  let selectedItems = [];

  for (let item of storeItems) {
    let qty = parseInt(quantities[item.name]) || 0;
    if (qty > 0) {
      let itemTotal = qty * item.price;
      total += itemTotal;
      selectedItems.push({ name: item.name, quantity: qty, price: item.price });
    }
  }

  if (selectedItems.length > 0) {
    const newOrder = new Order({
      serial: Date.now(),
      items: selectedItems,
      total
    });

    try {
      await newOrder.save();
      console.log('Order saved to MongoDB');
      res.redirect('/dashboard');
    } catch (err) {
      console.log('Error saving order:', err);
      res.send('Error saving order');
    }
  } else {
    res.send('No items selected. <a href="/dashboard">Go back</a>');
  }
});

// Fetch and display orders
app.get('/orders', async (req, res) => {
  if (!req.session.user) return res.redirect('/');
  try {
    const orders = await Order.find();
    res.render('orders', { orders });
  } catch (err) {
    console.log('Error fetching orders:', err);
    res.send('Error fetching orders');
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
