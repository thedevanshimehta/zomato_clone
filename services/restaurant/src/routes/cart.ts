import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { addToCart, clearCart, decrementItem, fetchMyCart, incrementItem } from "../controller/cart.js";

const router = express.Router();

router.post("/add" , isAuth , addToCart);
router.get("/all",isAuth,fetchMyCart);
router.put("/inc",isAuth,incrementItem);
router.put("/dec",isAuth,decrementItem);
router.delete("/clear",isAuth,clearCart);

export default router;