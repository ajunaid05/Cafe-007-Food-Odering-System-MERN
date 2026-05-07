# Stripe Payment Gateway Setup

## Installation

After making changes, you need to install the new dependencies:

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd frontend
npm install
```

## Configuration

### Backend (.env)

Add your Stripe secret key to `backend/.env`:

```env
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

### Frontend (.env or .env.local)

Create `frontend/.env.local` and add:

```env
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

**Note:** The keys in the code are test keys from your Flutter app. Replace them with your own Stripe keys if needed.

## How It Works

1. User clicks "Proceed to Payment" in Cart
2. User is redirected to Payment page
3. Payment page creates a payment intent with backend
4. User enters card details using Stripe Elements
5. Payment is processed via Stripe
6. On success, order is created in database
7. Cart is cleared and user is redirected to Orders page

## Test Cards

Use these test card numbers for testing:

- **Success:** 4242 4242 4242 4242
- **Decline:** 4000 0000 0000 0002
- **3D Secure:** 4000 0027 6000 3184

Use any future expiry date and any 3-digit CVC.

## Currency Note

Currently using USD currency for Stripe (PKR requires special account setup). The amounts displayed are in PKR, but Stripe processes in USD. For production, you may want to:
- Set up PKR currency support in Stripe (requires account verification)
- Or implement currency conversion

