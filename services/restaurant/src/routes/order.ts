import express from "express";
import { isAuth, isSeller } from "../middleware/isAuth.js";
import { assignRiderToOrder, createOrder, fetchOrderforPayment, fetchRestaurantOrders, fetchSingleOrder,  getCurrentOrdersForRiders, getMyOrders, updateOrderStatus, updateOrderStatusForRider } from "../controller/order.js";

const router = express.Router();

router.get("/my",isAuth , getMyOrders);
router.get("/:id",isAuth , fetchSingleOrder);
router.post("/new",isAuth,createOrder);
router.get("/payment/:id",fetchOrderforPayment);
router.get("/restaurant/:restaurantId",isAuth , isSeller ,fetchRestaurantOrders);
router.put("/:orderId",isAuth , isSeller , updateOrderStatus);
router.post("/assign/rider",assignRiderToOrder); //put or post?
router.get("/current/rider",getCurrentOrdersForRiders);
router.put("/update/status/rider",updateOrderStatusForRider);

export default router;