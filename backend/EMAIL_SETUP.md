# Email Setup Guide for Forgot Password Feature

## Gmail Configuration

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/
2. Click on **Security**
3. Under "Signing in to Google", enable **2-Step Verification**

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select **Mail** as the app
3. Select **Other (Custom name)** as the device
4. Enter a name like "Food Ordering App"
5. Click **Generate**
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Add these to your `backend/.env` file:

```env
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=abcdefghijklmnop
EMAIL_SERVICE=gmail
FRONTEND_URL=http://localhost:3000
```

**Important:**
- Use the **App Password** (16 characters), NOT your regular Gmail password
- Remove spaces from the app password when pasting
- Keep your `.env` file secure and never commit it to git

### Step 4: Test Email Sending
1. Restart your backend server
2. Try the forgot password feature
3. Check the backend console for email sending logs
4. Check your email inbox (and spam folder)

## Troubleshooting

### Error: "Invalid login"
- Make sure you're using the **App Password**, not your regular password
- Verify 2-Step Verification is enabled
- Regenerate the App Password if needed

### Error: "Connection timeout"
- Check your internet connection
- Verify Gmail SMTP settings are correct
- Try using port 465 with `secure: true` instead

### Email not received
- Check spam/junk folder
- Verify the email address is correct
- Check backend console for error messages
- In development mode, the reset link will be shown on the page if email fails

## Alternative: Other Email Services

### Outlook/Hotmail
```env
EMAIL_SERVICE=hotmail
EMAIL_USER=your_email@outlook.com
EMAIL_PASS=your_password
```

### Custom SMTP
Update the transporter in `authRoutes.js`:
```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.yourdomain.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
```

