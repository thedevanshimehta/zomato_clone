import express from "express";
import { addAddress, deleteAddress, fetchMyAddresses } from "../controller/address.js";
import { isAuth } from "../middleware/isAuth.js";

const router = express.Router();

router.post("/new",isAuth,addAddress);
router.delete("/:id",isAuth,deleteAddress);
router.get("/all",isAuth,fetchMyAddresses);

export default router;