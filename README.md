# Food Ordering System - MERN Stack Application

A simple and elegant food ordering system for a single restaurant built with MERN (MongoDB, Express, React, Node.js) stack. This application provides two main interfaces: one for restaurant owners to manage menu items and orders, and one for customers to browse menu, place orders, and track their order status.

## 🎯 Features

### Owner Interface
- **Menu Management**: Full CRUD operations on menu items
  - Add new menu items with name, description, price, category, and image
  - Update existing menu items
  - Delete menu items
  - View all menu items in a grid layout
  - Search menu items by name or description
  - Filter menu items by category (Fast Food, Desi, Desert, Cold Drinks, Hot Drinks, Snacks)
  - Mark items as available/unavailable

- **Orders Management**: 
  - View all customer orders
  - Filter orders by status (Pending, Confirmed, Preparing, Ready, Delivered, Cancelled)
  - Update order status through the order lifecycle
  - Real-time order updates (auto-refresh every 5 seconds)

### User Interface
- **Menu Browsing**:
  - View available menu items in an attractive grid layout
  - Search items by name or description
  - Filter items by category
  - See item images, descriptions, and prices
  - Real-time menu updates (auto-refresh every 10 seconds)

- **Shopping Cart**:
  - Add items to cart
  - Update item quantities
  - Remove items from cart
  - View total price
  - Cart persisted in localStorage

- **Order Management**:
  - Place orders from cart
  - View order history
  - Track order status in real-time
  - Filter orders by status
  - See order details including items, quantities, and totals

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB object modeling
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Frontend
- **React** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling with animations and effects

## 📁 Project Structure

```
food-ordering/
├── backend/
│   ├── models/
│   │   ├── MenuItem.js       # Menu item schema
│   │   └── Order.js          # Order schema
│   ├── routes/
│   │   ├── menuRoutes.js     # Menu API routes
│   │   └── orderRoutes.js    # Order API routes
│   ├── server.js             # Express server setup
│   ├── package.json          # Backend dependencies
│   └── .env                  # Environment variables
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── Home.js       # Landing page
│   │   │   ├── owner/
│   │   │   │   ├── OwnerDashboard.js
│   │   │   │   ├── MenuManagement.js
│   │   │   │   ├── MenuItemCard.js
│   │   │   │   ├── MenuItemForm.js
│   │   │   │   └── OrdersManagement.js
│   │   │   └── user/
│   │   │       ├── UserMenu.js
│   │   │       ├── MenuView.js
│   │   │       ├── MenuItemCard.js
│   │   │       ├── Cart.js
│   │   │       └── MyOrders.js
│   │   ├── services/
│   │   │   └── api.js        # API service layer
│   │   ├── App.js            # Main app component
│   │   ├── App.css           # Global styles
│   │   ├── index.js          # React entry point
│   │   └── index.css         # Base styles
│   └── package.json          # Frontend dependencies
│
└── README.md                 # Project documentation
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (installed locally or MongoDB Atlas account)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   - Create a `.env` file in the backend directory (already created)
   - Update MongoDB connection string if needed:
     ```
     PORT=5000
     MONGODB_URI=mongodb://localhost:27017/foodordering
     ```
   - For MongoDB Atlas, use:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodordering
     ```

4. **Start MongoDB** (if using local MongoDB):
   ```bash
   # Windows
   net start MongoDB
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

5. **Start the backend server**:
   ```bash
   npm start
   # OR for development with auto-reload
   npm run dev
   ```

   The server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the React development server**:
   ```bash
   npm start
   ```

   The app will open in your browser at `http://localhost:3000`

## 📖 Usage Guide

### For Restaurant Owners

1. **Access Owner Dashboard**:
   - Go to the home page
   - Click on "Owner Dashboard"

2. **Manage Menu Items**:
   - Navigate to "Menu Management"
   - Click "Add New Item" to create menu items
   - Fill in item details (name, description, price, category, image URL)
   - Click "Edit" to modify existing items
   - Click "Delete" to remove items
   - Use search and category filters to find items quickly

3. **Manage Orders**:
   - Navigate to "Orders Management"
   - View all customer orders
   - Use status filters to see orders by status
   - Update order status:
     - Pending → Confirm
     - Confirmed → Start Preparing
     - Preparing → Mark Ready
     - Ready → Mark Delivered
   - Cancel orders if needed

### For Customers

1. **Access User Menu**:
   - Go to the home page
   - Click on "User Menu"

2. **Browse Menu**:
   - View available items
   - Use search bar to find specific items
   - Filter by category using category buttons
   - Click "Add to Cart" on desired items

3. **Manage Cart**:
   - Navigate to "Cart"
   - Adjust quantities using + and - buttons
   - Remove items if needed
   - Review total price
   - Click "Confirm Order" to place order

4. **Track Orders**:
   - Navigate to "My Orders"
   - View all your orders
   - Filter orders by status
   - See real-time status updates

## 🔌 API Endpoints

### Menu Endpoints

- `GET /api/menu` - Get all menu items (supports query params: category, search, available)
- `GET /api/menu/:id` - Get single menu item
- `POST /api/menu` - Create new menu item
- `PUT /api/menu/:id` - Update menu item
- `DELETE /api/menu/:id` - Delete menu item

### Order Endpoints

- `GET /api/orders` - Get all orders (supports query param: status)
- `GET /api/orders/user/orders` - Get user orders (supports query param: status)
- `GET /api/orders/:id` - Get single order
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id/status` - Update order status

## 🎨 Design Features

- **Color Scheme**: Black and white theme with minimal accent colors for status indicators
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Fade-in, slide-in, and hover effects for better UX
- **Modern UI**: Clean, minimalist design with proper spacing and typography
- **Real-time Updates**: Auto-refresh for menu and orders

## 📝 Data Models

### MenuItem
```javascript
{
  name: String (required),
  description: String (required),
  price: Number (required, min: 0),
  category: String (enum: ['fast food', 'desi', 'desert', 'cold drinks', 'hot drinks', 'snacks']),
  image: String,
  available: Boolean (default: true),
  createdAt: Date
}
```

### Order
```javascript
{
  items: [{
    menuItemId: ObjectId (ref: MenuItem),
    name: String,
    quantity: Number,
    price: Number,
    image: String
  }],
  totalAmount: Number,
  status: String (enum: ['pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled']),
  orderNumber: String (auto-generated),
  createdAt: Date,
  updatedAt: Date
}
```

## 🔄 Order Status Flow

1. **Pending** - Order just placed by customer
2. **Confirmed** - Owner confirms the order
3. **Preparing** - Kitchen starts preparing the order
4. **Ready** - Order is ready for pickup/delivery
5. **Delivered** - Order has been delivered to customer
6. **Cancelled** - Order cancelled by owner

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check connection string in `.env` file
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change PORT in backend `.env` file
- Kill process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

### CORS Issues
- Ensure backend CORS is configured correctly
- Check API URL in frontend `api.js`

## 🔐 Security Notes

- This is a simplified version without authentication
- In production, implement:
  - User authentication and authorization
  - Input validation and sanitization
  - Rate limiting
  - Environment variable protection
  - HTTPS

## 📦 Future Enhancements

- User authentication and profiles
- Payment integration
- Order tracking with map
- Reviews and ratings
- Multiple restaurant support
- Admin dashboard
- Email notifications
- Image upload functionality

## 👨‍💻 Development

### Running in Development Mode

**Backend**:
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

**Frontend**:
```bash
cd frontend
npm start  # React development server with hot reload
```

## 📄 License

This project is created for educational purposes.

## 🤝 Contributing

This is a learning project. Feel free to fork and modify as needed.

## 📧 Support

For issues or questions, please check the code comments or MongoDB/Express/React documentation.

---

**Note**: Make sure MongoDB is running before starting the backend server. The application uses local storage for cart management, so cart data persists across page refreshes but is user-specific.

