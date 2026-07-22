import express from "express";
import { createRazorpayorder, paywithStripe, verifyPayment, verifyStripe } from "../controller/payment.js";

const router = express.Router();

router.post("/create",createRazorpayorder);
router.post("/verify",verifyPayment);
router.post("/stripe/create",paywithStripe);
router.post("/stripe/verify",verifyStripe);

export default router;