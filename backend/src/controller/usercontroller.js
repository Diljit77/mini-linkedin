
import ConnectionRequest from '../models/connectonreuqestmodel.js';
import User from '../models/UserModel.js';

export const getSuggestedUsers = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;

    // 1. Get all onboarded users except the current user
    const onboardedUsers = await User.find({
      _id: { $ne: loggedInUserId },
      isOnboarded: true,
    });

    // 2. Get current user's connections
    const currentUser = await User.findById(loggedInUserId);
    const connectedUserIds = currentUser.connections.map(id => id.toString());

    // 3. Get pending requests involving the current user
    const pendingRequests = await ConnectionRequest.find({
      status: "pending",
      $or: [
        { sender: loggedInUserId },
        { receiver: loggedInUserId },
      ],
    });

    // 4. Extract all users involved in those pending requests
    const pendingUserIds = new Set();
    pendingRequests.forEach(req => {
      pendingUserIds.add(req.sender.toString());
      pendingUserIds.add(req.receiver.toString());
    });

    // 5. Filter out users who are either already connected or have a pending request
    const suggested = onboardedUsers.filter(user =>
      !connectedUserIds.includes(user._id.toString()) &&
      !pendingUserIds.has(user._id.toString())
    );

    res.status(200).json({ success: true, users: suggested });
  } catch (error) {
    console.error("Error fetching suggested users:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export const getConnectedUsers = async (req, res) => {
  try {
    const userId = req.user._id;

const user = await User.findById(req.user._id)
  .populate("connections", "name profilePic");

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      success: true,
      data: user.connections
    });
  } catch (err) {
    console.error('Error fetching connected users:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};
export const getUserprofile=async (req,res) => {
  try {
    const id=req.params.id;
    const user=await User.findById(id).select("-password");
    if(!user){
      return res.status(404).json({message:"no user exist" ,success:false});
    }
    return res.status(200).json(user);
  } catch (error) {
    console.log(error);
   return res.status(500).json({message:"something went wrong"})
    
  }
  
}