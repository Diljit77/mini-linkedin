import ConnectionRequest from "../models/connectonreuqestmodel.js";
import User from "../models/UserModel.js";

// 1. Send connection request
export const sendConnectionRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const { receiverId } = req.body;

    if (senderId.toString() === receiverId) {
      return res.status(400).json({ message: "You can't connect with yourself" });
    }

    // Check if request already exists (both ways)
    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiverId },
        { sender: receiverId, receiver: senderId },
      ],
    });

    if (existingRequest) {
      return res.status(400).json({ message: "Connection request already exists" });
    }

    const newRequest = await ConnectionRequest.create({
      sender: senderId,
      receiver: receiverId,
    });

    res.status(201).json({ message: "Connection request sent", data: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

// 2. Accept connection request
export const acceptConnectionRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id;

    const request = await ConnectionRequest.findById(requestId);

    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.receiver.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized action" });
    }

    request.status = "accepted";
    await request.save();

    // Add each other to connections
    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { connections: request.receiver },
    });
    await User.findByIdAndUpdate(request.receiver, {
      $addToSet: { connections: request.sender },
    });

    res.status(200).json({ message: "Connection accepted" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};



// 4. Get all pending requests for user
export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      receiver: userId,
      status: "pending",
    }).populate("sender", "name email profilePic");

    res.status(200).json({ data: requests });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
export const getSentRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      sender: userId,
    }).populate("receiver", "name email profilePic");

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
export const getReceivedRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await ConnectionRequest.find({
      receiver: userId,
      status: 'pending',
    }).populate("sender", "name email profilePic");

    res.status(200).json({ requests });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
export const getAcceptedConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId)
      .populate("connections", "name email profilePic");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ connections: user.connections });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};
