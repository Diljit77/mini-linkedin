import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import {
  getSentRequests,
  getReceivedRequests,
  getAcceptedConnections,
  acceptConnectionRequest,
} from '../utils/api'; // You'll implement these APIs
import toast from 'react-hot-toast';
import { updatedUser } from '../utils/updateUserinfo';
import { useThemeStore } from '../store/useThemeStore';

function ActivityPage() {
  const [activeTab, setActiveTab] = useState('sent');
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [acceptedConnections, setAcceptedConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const {theme}= useThemeStore();
async function handleAccept(requestId) {
    try {
        const res =await acceptConnectionRequest(requestId);
        await updatedUser();
        toast.success("Connection request accepted!");
    } catch (error) {
        console.error("Error accepting connection request:", error);
    }
}
  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const [sent, received, accepted] = await Promise.all([
          getSentRequests(),
          getReceivedRequests(),
          getAcceptedConnections(),
        ]);

        setSentRequests(sent || []);
        setReceivedRequests(received || []);
        setAcceptedConnections(accepted || []);
      } catch (error) {
        console.error("Error fetching activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, []);

  const renderList = (data, type) => {
    if (loading) return <p>Loading {type}...</p>;
    if (data.length === 0) return <p className="text-center opacity-50">No {type} yet</p>;

    return data.map((item) => (
      <div key={item._id} className="p-4 bg-base-100 shadow rounded-md mb-4">
        <p className="font-semibold">
          {type === 'sent' && `You sent a request to ${item.receiver.name}`}
        {type === 'received' && (
  <>
    <span>{item.sender.name} sent you a request</span>
    <button
      className="ml-4 btn btn-sm btn-success"
      onClick={() => handleAccept(item._id)}
    >
      Accept
    </button>
  </>
)}
          {type === 'accepted' && `You are now connected with ${item.name}`}
        </p>
        <p className="text-sm opacity-70">
          {new Date(item.createdAt || item.updatedAt).toLocaleString()}
        </p>
      </div>
    ));
  };

  return (
    <div className="min-h-screen bg-base-200" data-theme={theme}>
      <Navbar />

      <div className="flex flex-col lg:flex-row px-4 py-6 gap-6 max-w-[1440px] mx-auto">
        {/* Left Sidebar */}
        {/* <div className="hidden lg:block lg:w-1/4">
          <LeftSidebar />
        </div> */}

        {/* Center Feed */}
        <div className="w-full lg:w-2/4">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-primary">Your Activity</h1>
            <p className="text-base-content opacity-70">
              Track your sent, received, and accepted connection requests.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-4 gap-4">
            <button
              className={`btn ${activeTab === 'sent' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('sent')}
            >
              Sent
            </button>
            <button
              className={`btn ${activeTab === 'received' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('received')}
            >
              Received
            </button>
            <button
              className={`btn ${activeTab === 'accepted' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setActiveTab('accepted')}
            >
              Accepted
            </button>
          </div>

          {/* Activity Feed */}
          <div className="space-y-4">
            {activeTab === 'sent' && renderList(sentRequests, 'sent')}
            {activeTab === 'received' && renderList(receivedRequests, 'received')}
            {activeTab === 'accepted' && renderList(acceptedConnections, 'accepted')}
          </div>
        </div>

        {/* Right Sidebar */}
        {/* <div className="hidden lg:block lg:w-1/4">
          <RightSidebar />
        </div> */}
      </div>
    </div>
  );
}

export default ActivityPage;
