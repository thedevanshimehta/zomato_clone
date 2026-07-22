import express from "express";
import { isAuth, isSeller } from "../middleware/isAuth.js";
import { addMenuItem, deleteItems, getAllItems, isItemAvailable } from "../controller/addMenuItem.js";
import uploadFile from "../middleware/multer.js";

const router = express.Router();

router.post("/new",isAuth,isSeller,uploadFile,addMenuItem);
router.get("/all/:id",isAuth,getAllItems); //for both user and seller
router.delete("/:itemId",isAuth,isSeller,deleteItems);
router.put("/status/:itemId",isAuth,isSeller,isItemAvailable);

export default router;