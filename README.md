# ProductApp 🛍️

A premium e-commerce product viewer application with modern authentication, dynamic product displays, and secure checkout functionality.

## ✨ Features

### 🔐 Authentication
- **Email/Password Authentication** - Secure user registration and login
- **Google OAuth Integration** - One-click sign-in with Google
- **Session Management** - Persistent user sessions with Express
- **Protected Routes** - Middleware-based route protection

### 🛒 E-Commerce Functionality
- **Dynamic Product Catalog** - Beautiful product grid with smooth animations
- **Interactive Product Cards** - Hover effects and detailed product information
- **Shopping Cart** - Add/remove items with real-time updates
- **Secure Checkout** - Complete checkout flow with order confirmation
- **Order Summary** - Detailed breakdown of items, pricing, and totals

### 🎨 Modern UI/UX
- **Responsive Design** - Works seamlessly on all devices
- **Glassmorphism Effects** - Modern, premium aesthetic
- **Smooth Animations** - Engaging micro-interactions
- **Dark Mode Ready** - Eye-friendly color schemes
- **Premium Typography** - Clean, professional fonts

## 🚀 Tech Stack

### Frontend
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with modern features
- **Vanilla JavaScript** - No framework dependencies
- **Supabase Client** - Authentication and data management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web application framework
- **Supabase** - Backend-as-a-Service for authentication and database
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management
- **express-session** - Session middleware

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)
- **Git**
- A **Supabase account** (free tier available)

## 🛠️ Installation

### 1. Clone the Repository
```bash
git clone https://github.com/abhishekvn017/ProductApp.git
cd ProductApp
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Session Secret
SESSION_SECRET=your_random_session_secret

# Server Configuration
PORT=3000
```

**To get your Supabase credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing one
3. Navigate to **Settings** → **API**
4. Copy your **Project URL** and **anon/public key**

### 4. Configure Google OAuth (Optional)

If you want to enable Google sign-in:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Create **OAuth 2.0 credentials**
5. Add authorized redirect URI: `http://localhost:3000/auth/callback`
6. In Supabase Dashboard:
   - Go to **Authentication** → **Providers**
   - Enable **Google**
   - Add your Google Client ID and Secret

## 🎯 Usage

### Start the Development Server
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Available Scripts
- `npm start` - Start the production server
- `npm run dev` - Start the development server

## 📁 Project Structure

```
ProductApp/
├── server/
│   ├── config/
│   │   └── supabase.js       # Supabase configuration
│   ├── middleware/
│   │   └── auth.js           # Authentication middleware
│   ├── routes/
│   │   ├── auth.js           # Authentication routes
│   │   └── payment.js        # Payment/checkout routes
│   └── server.js             # Express server setup
├── auth-client.js            # Client-side auth logic
├── auth.html                 # Login/signup page
├── checkout.html             # Checkout page
├── checkout.js               # Checkout functionality
├── confirmation.html         # Order confirmation page
├── index.html                # Main product catalog page
├── script.js                 # Main application logic
├── style.css                 # Global styles
├── package.json              # Project dependencies
├── .env                      # Environment variables (not in repo)
├── .gitignore                # Git ignore rules
└── README.md                 # This file
```

## 🔒 Security Features

- **Environment Variables** - Sensitive data stored securely
- **Session Management** - Secure cookie-based sessions
- **CORS Protection** - Configured cross-origin policies
- **Authentication Middleware** - Protected API endpoints
- **Supabase RLS** - Row Level Security for database

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user
- `GET /api/auth/google` - Google OAuth login

### Checkout
- `POST /api/checkout` - Process checkout
- `GET /api/orders/:id` - Get order details

## 🎨 Customization

### Adding Products
Edit the product data in `script.js` to add or modify products:

```javascript
const products = [
    {
        id: 1,
        name: 'Product Name',
        price: 99.99,
        image: 'image-url',
        description: 'Product description'
    },
    // Add more products...
];
```

### Styling
Modify `style.css` to customize the appearance of your application.

## 🐛 Troubleshooting

### Port Already in Use
If port 3000 is already in use, change the `PORT` in your `.env` file.

### Supabase Connection Issues
- Verify your `SUPABASE_URL` and `SUPABASE_ANON_KEY` are correct
- Check if your Supabase project is active
- Ensure your network allows connections to Supabase

### Google OAuth Not Working
- Verify redirect URIs match in Google Console and Supabase
- Check that Google provider is enabled in Supabase
- Ensure credentials are correctly configured

## 📝 License

ISC

## 👤 Author

**Abhishek VN**
- GitHub: [@abhishekvn017](https://github.com/abhishekvn017)

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- [Supabase](https://supabase.com) - Backend infrastructure
- [Express.js](https://expressjs.com) - Web framework
- [Google Fonts](https://fonts.google.com) - Typography

---

Made with ❤️ by Abhishek VN
