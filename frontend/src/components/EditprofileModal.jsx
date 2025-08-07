

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PencilIcon } from "lucide-react";

import { useAuthStore } from "../store/userAuthStore";
import { onboarding } from "../utils/api";
import toast from "react-hot-toast";
import { updatedUser } from "../utils/updateUserinfo";
import { useThemeStore } from "../store/useThemeStore";

const EditProfilePage = () => {
  const {user,setUser}=useAuthStore();
  const navigate = useNavigate();
const {theme}= useThemeStore();
  const [formData, setFormData] = useState({
    name: user.name || "",
    bio: user.bio || "",
   
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {

    await onboarding(user._id, formData); 

    await updatedUser();


    toast.success("Profile updated successfully");
    navigate("/profile"); 
  } catch (error) {
    console.error(error);
    toast.error("Failed to update profile");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="max-w-3xl mx-auto mt-10" data-theme={theme}>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <PencilIcon className="w-6 h-6 text-primary" />
              Edit Your Profile
            </h2>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text font-semibold mb-2">Name</span>
              </label>
              <input
                type="text"
                name="name"
                className="input input-bordered"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-control flex flex-col">
              <label className="label">
                <span className="label-text font-semibold mb-2">Bio</span>
              </label>
              <textarea
                name="bio"
                className="textarea textarea-bordered"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us something about yourself..."
              />
            </div>

           
            <div className="divider" />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-outline"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
