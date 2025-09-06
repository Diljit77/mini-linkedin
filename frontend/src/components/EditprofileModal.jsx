import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Plus, Trash } from "lucide-react";
import { useAuthStore } from "../store/userAuthStore";
import { onboarding } from "../utils/api";
import toast from "react-hot-toast";
import { updatedUser } from "../utils/updateUserinfo";

const EditProfilePage = () => {
  const { user, refreshUser } = useAuthStore();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    bio: "",
    skills: "",
    education: [],
    experience: [],
    location: { city: "", country: "" },
    contactInfo: { phone: "", website: "", github: "", linkedin: "", twitter: "" },
    socialLinks: { portfolio: "", behance: "", dribbble: "", medium: "" }
  });

  const [loading, setLoading] = useState(false);
  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        title: user.title || "",
        bio: user.bio || "",
        skills: user.skills ? user.skills.join(", ") : "",
        education: user.education || [],
        experience: user.experience || [],
        location: user.location || { city: "", country: "" },
        contactInfo: user.contactInfo || { phone: "", website: "", github: "", linkedin: "", twitter: "" },
        socialLinks: user.socialLinks || { portfolio: "", behance: "", dribbble: "", medium: "" }
      });
      setPreview(user.profilePic);
    }
  }, [user]);

 
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePic(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Normal inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const addEducation = () =>
    setFormData((prev) => ({
      ...prev,
      education: [
        ...prev.education,
        {
          school: "",
          degree: "",
          fieldOfStudy: "",
          startYear: "",
          endYear: "",
          description: "",
        },
      ],
    }));
  const removeEducation = (i) =>
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, idx) => idx !== i),
    }));

  const addExperience = () =>
    setFormData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: "",
          position: "",
          role: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
    }));
  const removeExperience = (i) =>
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, idx) => idx !== i),
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();

      const processedData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim())
      };

      Object.keys(processedData).forEach((key) => {
        if (typeof processedData[key] === "object") {
          formDataToSend.append(key, JSON.stringify(processedData[key]));
        } else {
          formDataToSend.append(key, processedData[key]);
        }
      });

      if (profilePic) {
        formDataToSend.append("file", profilePic);
      }

      await onboarding(user._id, formDataToSend);
      await updatedUser();
      await refreshUser();
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
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-3xl font-bold text-center mb-8">
        Edit Your Profile
      </h2>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Profile Pic */}
        <div className="flex justify-center">
          <div className="relative w-32 h-32">
            <img
              src={preview || "/default-avatar.png"}
              alt="Profile Preview"
              className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
            />
            <label
              htmlFor="profilePic"
              className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg"
            >
              <Camera size={18} />
            </label>
            <input
              id="profilePic"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Basic Info */}
        <div className="card bg-base-200 p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="input input-bordered w-full"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <input
              type="text"
              name="title"
              placeholder="Professional Title"
              className="input input-bordered w-full"
              value={formData.title}
              onChange={handleInputChange}
              
            />
          </div>
          <textarea
            name="bio"
            placeholder="Tell us about yourself..."
            className="textarea textarea-bordered w-full mt-4"
            rows={4}
            value={formData.bio}
            onChange={handleInputChange}
          />
        </div>

        {/* Skills */}
        <div className="card bg-base-200 p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Skills</h3>
          <input
            type="text"
            placeholder="JavaScript, React, Node.js"
            className="input input-bordered w-full"
            value={formData.skills}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, skills: e.target.value }))
            }
          />
        </div>

        {/* Education */}
        <div className="card bg-base-200 p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex justify-between">
            Education
            <button
              type="button"
              onClick={addEducation}
              className="btn btn-sm btn-outline"
            >
              <Plus size={16} className="mr-1" /> Add
            </button>
          </h3>
          <div className="space-y-4">
            {formData.education.map((edu, idx) => (
              <div key={idx} className="space-y-2 border-b pb-4">
                <input
                  type="text"
                  placeholder="School"
                  className="input input-bordered w-full"
                  value={edu.school || ""}
                  onChange={(e) => {
                    const newEdu = [...formData.education];
                    newEdu[idx].school = e.target.value;
                    setFormData((prev) => ({ ...prev, education: newEdu }));
                  }}
                />
                <input
                  type="text"
                  placeholder="Degree"
                  className="input input-bordered w-full"
                  value={edu.degree || ""}
                  onChange={(e) => {
                    const newEdu = [...formData.education];
                    newEdu[idx].degree = e.target.value;
                    setFormData((prev) => ({ ...prev, education: newEdu }));
                  }}
                />
                <input
                  type="text"
                  placeholder="Field of Study"
                  className="input input-bordered w-full"
                  value={edu.fieldOfStudy || ""}
                  onChange={(e) => {
                    const newEdu = [...formData.education];
                    newEdu[idx].fieldOfStudy = e.target.value;
                    setFormData((prev) => ({ ...prev, education: newEdu }));
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Start Year"
                    className="input input-bordered w-full"
                    value={edu.startYear || ""}
                    onChange={(e) => {
                      const newEdu = [...formData.education];
                      newEdu[idx].startYear = e.target.value;
                      setFormData((prev) => ({ ...prev, education: newEdu }));
                    }}
                  />
                  <input
                    type="number"
                    placeholder="End Year"
                    className="input input-bordered w-full"
                    value={edu.endYear || ""}
                    onChange={(e) => {
                      const newEdu = [...formData.education];
                      newEdu[idx].endYear = e.target.value;
                      setFormData((prev) => ({ ...prev, education: newEdu }));
                    }}
                  />
                </div>
                <textarea
                  placeholder="Description"
                  className="textarea textarea-bordered w-full"
                  value={edu.description || ""}
                  onChange={(e) => {
                    const newEdu = [...formData.education];
                    newEdu[idx].description = e.target.value;
                    setFormData((prev) => ({ ...prev, education: newEdu }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeEducation(idx)}
                  className="btn btn-sm btn-error mt-2"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Experience */}
        <div className="card bg-base-200 p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4 flex justify-between">
            Experience
            <button
              type="button"
              onClick={addExperience}
              className="btn btn-sm btn-outline"
            >
              <Plus size={16} className="mr-1" /> Add
            </button>
          </h3>
          <div className="space-y-4">
            {formData.experience.map((exp, idx) => (
              <div key={idx} className="space-y-2 border-b pb-4">
                <input
                  type="text"
                  placeholder="Company"
                  className="input input-bordered w-full"
                  value={exp.company || ""}
                  onChange={(e) => {
                    const newExp = [...formData.experience];
                    newExp[idx].company = e.target.value;
                    setFormData((prev) => ({ ...prev, experience: newExp }));
                  }}
                />
                <input
                  type="text"
                  placeholder="Position"
                  className="input input-bordered w-full"
                  value={exp.position || ""}
                  onChange={(e) => {
                    const newExp = [...formData.experience];
                    newExp[idx].position = e.target.value;
                    setFormData((prev) => ({ ...prev, experience: newExp }));
                  }}
                />
                <input
                  type="text"
                  placeholder="Role"
                  className="input input-bordered w-full"
                  value={exp.role || ""}
                  onChange={(e) => {
                    const newExp = [...formData.experience];
                    newExp[idx].role = e.target.value;
                    setFormData((prev) => ({ ...prev, experience: newExp }));
                  }}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={exp.startDate || ""}
                    onChange={(e) => {
                      const newExp = [...formData.experience];
                      newExp[idx].startDate = e.target.value;
                      setFormData((prev) => ({ ...prev, experience: newExp }));
                    }}
                  />
                  <input
                    type="date"
                    className="input input-bordered w-full"
                    value={exp.endDate || ""}
                    onChange={(e) => {
                      const newExp = [...formData.experience];
                      newExp[idx].endDate = e.target.value;
                      setFormData((prev) => ({ ...prev, experience: newExp }));
                    }}
                  />
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={exp.current || false}
                    onChange={(e) => {
                      const newExp = [...formData.experience];
                      newExp[idx].current = e.target.checked;
                      setFormData((prev) => ({ ...prev, experience: newExp }));
                    }}
                  />
                  Current Job
                </label>
                <textarea
                  placeholder="Description"
                  className="textarea textarea-bordered w-full"
                  value={exp.description || ""}
                  onChange={(e) => {
                    const newExp = [...formData.experience];
                    newExp[idx].description = e.target.value;
                    setFormData((prev) => ({ ...prev, experience: newExp }));
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeExperience(idx)}
                  className="btn btn-sm btn-error mt-2"
                >
                  <Trash size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Location */}
        <div className="card bg-base-200 p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="City"
              className="input input-bordered w-full"
              value={formData.location.city}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: { ...prev.location, city: e.target.value },
                }))
              }
            />
            <input
              type="text"
              placeholder="Country"
              className="input input-bordered w-full"
              value={formData.location.country}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  location: { ...prev.location, country: e.target.value },
                }))
              }
            />
          </div>
        </div>

        {/* Contact Info */}
        <div className="card bg-base-200 p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["phone", "website", "github", "linkedin", "twitter"].map(
              (field) => (
                <input
                  key={field}
                  type="text"
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="input input-bordered w-full"
                  value={formData.contactInfo[field]}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contactInfo: {
                        ...prev.contactInfo,
                        [field]: e.target.value,
                      },
                    }))
                  }
                />
              )
            )}
          </div>
        </div>

        {/* Social Links */}
        <div className="card bg-base-200 p-6 shadow-md">
          <h3 className="text-lg font-semibold mb-4">Social Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {["portfolio", "behance", "dribbble", "medium"].map((field) => (
              <input
                key={field}
                type="text"
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                className="input input-bordered w-full"
                value={formData.socialLinks[field]}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    socialLinks: {
                      ...prev.socialLinks,
                      [field]: e.target.value,
                    },
                  }))
                }
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
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
  );
};

export default EditProfilePage;
