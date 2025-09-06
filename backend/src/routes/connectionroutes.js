import express from "express";
import  protectRoute  from "../middleware/authmiddleware.js";
import {
  sendConnectionRequest,
  acceptConnectionRequest,

  getPendingRequests,
  getSentRequests,
  getReceivedRequests,
  getAcceptedConnections,
  rejectConnectionRequest,
} from "../controller/connectionrequestcontroller.js";


const router = express.Router();

router.post("/send", protectRoute, sendConnectionRequest);
router.put("/accept/:requestId", protectRoute, acceptConnectionRequest);

router.get("/pending", protectRoute, getPendingRequests);

// new ones for activity page
router.get("/sent", protectRoute, getSentRequests);
router.get("/received", protectRoute, getReceivedRequests);
router.get("/accepted", protectRoute, getAcceptedConnections);
router.get("/rejected", protectRoute, rejectConnectionRequest);

export default router;
