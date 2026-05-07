# Quick Setup Guide

## Step-by-Step Setup

### 1. Install MongoDB

**Windows:**
- Download from: https://www.mongodb.com/try/download/community
- Install MongoDB Community Edition
- MongoDB will start as a Windows service automatically

**macOS:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt-get update
sudo apt-get install -y mongodb
sudo systemctl start mongodb
```

### 2. Setup Backend

1. Open terminal in project root
2. Navigate to backend folder:
   ```bash
   cd backend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Create `.env` file in backend folder with:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/foodordering
   ```

5. Start MongoDB (if not running):
   - Windows: MongoDB service should auto-start
   - macOS/Linux: `sudo systemctl start mongod` or `brew services start mongodb-community`

6. Start backend server:
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

   You should see: `Server running on port 5000` and `MongoDB Connected Successfully`

### 3. Setup Frontend

1. Open a NEW terminal window (keep backend running)
2. Navigate to frontend folder:
   ```bash
   cd frontend
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start React app:
   ```bash
   npm start
   ```

   The browser should automatically open at `http://localhost:3000`

### 4. Access the Application

- Home Page: http://localhost:3000
- Owner Dashboard: http://localhost:3000/owner
- User Menu: http://localhost:3000/user

## MongoDB Atlas (Cloud) Alternative

If you prefer using MongoDB Atlas instead of local MongoDB:

1. Create account at: https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Update backend/.env:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/foodordering?retryWrites=true&w=majority
   ```
   Replace `username` and `password` with your Atlas credentials

## Testing the Application

### Owner Side:
1. Go to Owner Dashboard
2. Add some menu items with different categories
3. Use image URLs from the internet (e.g., Unsplash, Pexels)
4. Go to Orders Management to see orders

### User Side:
1. Go to User Menu
2. Browse menu items
3. Add items to cart
4. Go to Cart and confirm order
5. Check "My Orders" to see order status
6. Go back to Owner Dashboard → Orders Management
7. Update order status and see it reflect in User's "My Orders"

## Common Issues

**MongoDB Connection Failed:**
- Check if MongoDB is running: `mongosh` or `mongo` command
- Verify connection string in `.env`
- Check MongoDB logs

**Port 5000 already in use:**
- Change PORT in backend/.env to another port (e.g., 5001)
- Update frontend/src/services/api.js if you change the port

**CORS errors:**
- Ensure backend server is running
- Check that proxy in frontend/package.json points to correct backend URL

**Module not found errors:**
- Delete `node_modules` folder
- Delete `package-lock.json`
- Run `npm install` again

## Next Steps

1. Add menu items through Owner Dashboard
2. Test ordering flow as a user
3. Update order statuses as owner
4. Experiment with search and category filters
5. Try adding images to menu items using image URLs

## Image URLs for Testing

You can use these sample image URLs for menu items:
- https://images.unsplash.com/photo-1565299624946-b28f40a0ae38 (Pizza)
- https://images.unsplash.com/photo-1551782450-a2132b4ba21d (Burger)
- https://images.unsplash.com/photo-1563379091339-03246963d4c9 (Chicken)
- https://images.unsplash.com/photo-1551024506-0bccd828d307 (Drinks)

Or search for food images on Unsplash/Pexels and use their URLs.

