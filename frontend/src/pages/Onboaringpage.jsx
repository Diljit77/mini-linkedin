import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Mail, User } from 'lucide-react';
import { useAuthStore } from '../store/userAuthStore';
import toast from 'react-hot-toast';
import { AxiosInstance } from '../utils/axios'; // or your Axios path
import { useThemeStore } from '../store/useThemeStore';

function OnboardingPage() {
  const [bio, setBio] = useState('');
  const [image, setImage] = useState(null); // actual File
  const [previewUrl, setPreviewUrl] = useState(null); // URL string for image preview
  const [loading, setLoading] = useState(false);
const {theme}= useThemeStore();
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file); // for upload
      setPreviewUrl(URL.createObjectURL(file)); // for image preview
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user?._id) {
      toast.error("User not found in auth store.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      if (image) {
        formData.append("profilePic", image);
      }

      const res = await AxiosInstance.put(`/auth/onboarding/${user._id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const data = res.data;

      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Onboarding complete!");
      navigate('/'); // Redirect to home or desired page after onboarding

    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error(error?.response?.data?.message || "Onboarding failed");
    } finally {
      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200" data-theme={theme}>
      <div className="bg-base-100 p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-1 text-center">Welcome, {user?.name}</h2>
        <p className="text-sm text-center text-gray-500 mb-6">{user?.email}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <label className="cursor-pointer relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-base-300 flex items-center justify-center hover:bg-base-200 transition group-hover:opacity-90">
                {previewUrl ? (
                  <img src={previewUrl} alt="Profile Preview" className="object-cover w-full h-full" />
                ) : (
                  <Camera className="w-10 h-10 text-gray-500" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="form-control">
            <label className="label mb-2">Full Name</label>
            <div className="relative">
              <input
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="John Doe"
                className="input input-bordered w-full pl-10"
              />
              <User className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text mb-2">Email</span>
            </label>
            <div className="relative">
              <input
                name="email"
                value={email}
                disabled
                type="email"
                placeholder="Enter email"
                className="input input-bordered w-full pl-10"
              />
              <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
            </div>
          </div>

          <div className="form-control w-full">
            <label className="label">
              <span className="label-text mb-2">Your Bio</span>
            </label>
            <textarea
              className="textarea textarea-bordered pl-2 w-full"
              placeholder="Tell us about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-full">
            {loading ? 'Completing...' : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPage;
