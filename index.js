import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import Razorpay from "razorpay";
import mongoose from "mongoose";
dotenv.config();
const app = express();

// Middleware using Express's built-in body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//connect to database
mongoose.connect('mongodb+srv://Abhishek:abhishek@cluster1.gmodt.mongodb.net/?retryWrites=true&w=majority&appName=Cluster1').then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
})

// Routes


app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Create an order using Razorpay
app.post("/orders", async (req, res) => {
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mRruX6qumRiKsn",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "JFVDEEGzM79e6NcCFY3x1K2C",
    });

    const options = {
      amount: req.body.amount, // amount in smallest currency unit
      currency: req.body.currency,
      receipt: "receipt#1",
      payment_capture: 1,
    };

    const response = await razorpay.orders.create(options);
    res.status(200).json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Payment failed" });
  }
});

// Fetch a payment's details from Razorpay
app.get("/payment/:paymentId", async (req, res) => {
  const { paymentId } = req.params;
  try {
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_mRruX6qumRiKsn",
      key_secret: process.env.RAZORPAY_KEY_SECRET || "JFVDEEGzM79e6NcCFY3x1K2C",
    });
    const payment = await razorpay.payments.fetch(paymentId);
    if (!payment) {
      return res.status(404).json({ error: "Payment not found" });
    }
    res.status(200).json({
      status: payment.status,
      method: payment.method,
      amount: payment.amount,
      currency: payment.currency,
    });
  } catch (error) {
    console.error("Payment fetch error:", error);
    res.status(500).json({ error: "Payment not found" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;