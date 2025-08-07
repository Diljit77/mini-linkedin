import toast from "react-hot-toast";
import { Sendrequest } from "../utils/api";
import { useThemeStore } from "../store/useThemeStore";

function RightSidebar({ suggestions }) {
  const {theme}= useThemeStore();
  const sendrequest = async (id)=> {
    console.log("Connection request sent!");
    try {
      const res=await Sendrequest(id);
      if(res.ok){
        toast.success("Connection request sent successfully!");
      }
    } catch (error) {
      console.error("Error sending connection request:", error);
      
    }

  }
  return (
    <div className="card bg-base-100 shadow-md p-4" data-theme={theme}>
      <h2 className="text-lg font-bold mb-4">People you may know</h2>
      {
        suggestions.length === 0 ? (
          <p className="text-sm opacity-60">No recommended users</p>
        ) : (
          <ul className="space-y-3">
            {suggestions.map((user) => (
              <li key={user._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-10 rounded-full">
                      <img src={user.profilePic} alt={user.name} />
                    </div>
                  </div>
                  <div>
                    <p className="font-semibold">{user.name}</p>
                    <p className="text-xs opacity-60">{user.role}</p>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline btn-primary" onClick={()=>sendrequest(user._id)}>Connect</button>
              </li>
            ))}
          </ul>
        )
      }
    </div>
  );
}


export default RightSidebar;
