import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { PencilIcon } from "lucide-react";
import { editpost, fetchpost } from "../utils/api";
import { useAuthStore } from "../store/userAuthStore";
import { useThemeStore } from "../store/useThemeStore";
import toast from "react-hot-toast";

const EditPostModal = () => {
  const { Id } = useParams();
  const navigate = useNavigate();
const {theme}= useThemeStore();
const {setUser,user}=useAuthStore();
const [formData, setFormData] = useState({});
  const [content, setContent] = useState(formData.content || "");
  const [visibility, setVisibility] = useState(formData.visibility || "public");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
const data=await fetchpost(Id);
console.log(data);
setFormData(data.post);
    setContent(data.post.content);          // ✅ update content
      setVisibility(data.post.visibility); 
    };
    fetchPost();
  }, [Id]);

const handleSubmit = async (e) => {
  e.preventDefault();
try {
await editpost(Id, { content, visibility });
toast.success("post updated successfully");
navigate(-1);
} catch (error) {
  console.log(error);
}

 

};


  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto mt-10" data-theme={theme}>
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold flex items-center gap-2">
              <PencilIcon className="w-6 h-6 text-primary" /> Edit Your Post
            </h2>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-semibold">Content</span>
              </label>
              <textarea
                className="textarea textarea-bordered min-h-[140px]"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind?"
                required
              />
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text text-base font-semibold">Visibility</span>
              </label>
              <select
                className="select select-bordered"
                value={visibility}
                onChange={(e) => setVisibility(e.target.value)}
              >
                <option value="public">🌍 Public</option>
                <option value="connectionsOnly">👥 Connections Only</option>
              </select>
            </div>

            <div className="divider" />

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="btn btn-outline"
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                Update Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPostModal;
