import express from "express";
import { isAuth } from "../middleware/isAuth.js";
import { acceptOrder, addRiderProfile, fetchMyOrder, fetchMyProfile, toggleAvailability, updateOrderStatus } from "../controller/rider.js";
import uploadFile from "../middleware/multer.js";

const router=express.Router();

router.post("/new",isAuth , uploadFile , addRiderProfile);
router.get("/myProfile",isAuth,fetchMyProfile);
router.patch("/toggle",isAuth , toggleAvailability);
router.post("/accept/:orderId",isAuth,acceptOrder);
router.get("/order/current",isAuth,fetchMyOrder);
router.put("/order/update/:orderId",isAuth,updateOrderStatus);

export default router;