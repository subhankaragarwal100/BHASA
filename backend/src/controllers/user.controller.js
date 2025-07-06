import User from "../models/User.js";
import FriendRequest from "../models/FriendRequest.js";

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user.id;
        const currentUser = req.user

        // Assuming you have a User model to interact with your database
        const recommendedUsers = await User.find({
            $and:[
                { _id: { $ne: currentUserId } }, // Exclude the current user
                { $id: { $nin: currentUser.friends } } ,// Exclude friends of the current user
                {isOnboarded: true} // Only include users who have completed onboarding
            ]
        })    
        
        res.status(200).json(recommendedUsers);

    } catch (error) {
        console.error("Error in getRecommendedUsers:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}


export async function getMyFriends(req, res) {
    try {
        const user = await User.findById(req.user.id)
        .select('friends') // Select only the friends field
        .populate('friends', 'fullName profilePic nativeLanguage learningLanguage') // Populate friends with specific fields;

        res.status(200).json(user.friends);
        
    } catch (error) {
        console.error("Error in getMyFriends:", error.message);
        res.status(500).json({ message: "Internal server error" });       
    }

}

export async function sendFriendRequest(req , res){
    try {
        const myId = req.user.id;
        const { id : recipientId } = req.params;

        //prevent sending friend request to self
        if(myId === recipientId) {
            return res.status(400).json({ message: "You can't send friend request to yourself" });
        }       
        const recipient = await User.findById(recipientId);

        //check if the recipient exists
        if(!recipient) {
            return res.status(404).json({ message: "Recipient not found" });
        }

        //check if the recipient is already a friend
        if(recipient.friends.includes(myId)) {
            return res.status(400).json({ message: "You are already friends with this user" });
        }

        //check if the recipient has already sent a friend request
        const existingRequest = await FriendRequest.findOne({
            $or: [
                { sender: myId, recipient: recipientId },
                { sender: recipientId, recipient: myId }
            ]
        });

        if(existingRequest) {
            return res.status(400).json({ message: "Friend request already exists" });
        }

        //create a new friend request
        const friendRequest = await FriendRequest.create({
            sender: myId,
            recipient: recipientId
        });

        res.status(201).json(friendRequest);


    } catch (error) {
        console.error("Error in sendFriendRequest:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function acceptFriendRequest(req, res) {
    try {
        const { id: requestId } = req.params;

        const friendRequest = await FriendRequest.findById(requestId);

        if (!friendRequest) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        //verift if the current user is the recipient of the friend request
        if (friendRequest.recipient.toString() !== req.user.id) {
            return res.status(403).json({ message: "You are not authorized to accept this friend request" });
        }

        friendRequest.status = "accepted";
        await friendRequest.save();

        // Add the sender to the recipient's friends list
        await User.findByIdAndUpdate(friendRequest.sender, { 
            $addToSet: { friends: friendRequest.recipient },
         });

        await User.findByIdAndUpdate(friendRequest.recipient, { 
            $addToSet: { friends: friendRequest.sender },
         });

        res.status(200).json({ message: "Friend request accepted" });


    } catch (error) {
        console.error("Error in acceptFriendRequest:", error.message);
        res.status(500).json({ message: "Internal server error" });
        
    }
}


export async function getFriendRequests(req, res) {
    try {
    const incomingReqs = await FriendRequest.find({
      recipient: req.user.id,
      status: "pending",
    }).populate("sender", "fullName profilePic nativeLanguage learningLanguage");

    const acceptedReqs = await FriendRequest.find({
      sender: req.user.id,
      status: "accepted",
    }).populate("recipient", "fullName profilePic");

    res.status(200).json({ incomingReqs, acceptedReqs });
  } catch (error) {
    console.log("Error in getPendingFriendRequests controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function getOutgoingFriendReqs(req, res) {
  try {
    const outgoingRequests = await FriendRequest.find({
      sender: req.user.id,
      status: "pending",
    }).populate("recipient", "fullName profilePic nativeLanguage learningLanguage");

    res.status(200).json(outgoingRequests);
  } catch (error) {
    console.log("Error in getOutgoingFriendReqs controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}