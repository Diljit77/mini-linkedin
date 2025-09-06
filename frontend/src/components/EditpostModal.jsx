import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PencilIcon, ImageIcon, Smile, X } from "lucide-react";
import { editpost, fetchpost } from "../utils/api";
import { useThemeStore } from "../store/useThemeStore";
import toast from "react-hot-toast";
import Picker from "emoji-picker-react";

const EditPostModal = () => {
  const { Id } = useParams();
  const navigate = useNavigate();
  const { theme } = useThemeStore();

  const [formData, setFormData] = useState(null);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [existingImages, setExistingImages] = useState([]); // images already stored
  const [newImages, setNewImages] = useState([]); // newly uploaded images
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        const data = await fetchpost(Id);
        setFormData(data.post);
        setContent(data.post.content);
        setVisibility(data.post.visibility);
        setExistingImages(data.post.image || []); // assuming backend sends images array
      } catch (err) {
        console.error(err);
      }
    };
    fetchPostData();
  }, [Id]);

  const handleFileClick = () => fileInputRef.current.click();

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFiles = [...newImages, ...selectedFiles];
    if (totalFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      setNewImages(totalFiles.slice(0, 5));
    } else {
      setNewImages(totalFiles);
    }
  };

  const handleRemoveExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  const handleRemoveNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  const handleEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const payload = new FormData();
    payload.append("content", content);
    payload.append("visibility", visibility);

    // find removed images (difference between original post.images and kept images)
    const removed = formData.image.filter((url) => !existingImages.includes(url));
    payload.append("removeImages", JSON.stringify(removed));

    // attach new images
    newImages.forEach((file) => payload.append("image", file));

    await editpost(Id, payload);
    toast.success("Post updated successfully");
    navigate(-1);
  } catch (error) {
    console.error(error);
    toast.error("Failed to update post");
  }
};


  if (!formData) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="min-h-screen bg-base-200 p-6" data-theme={theme}>
      <div className="max-w-3xl mx-auto card bg-base-100 shadow-xl p-6">
        <h2 className="text-2xl font-bold text-primary mb-6 flex items-center gap-2">
          <PencilIcon className="w-6 h-6" /> Edit Your Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Post content */}
          <div className="form-control">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea textarea-bordered w-full min-h-[120px]"
              placeholder="Update your thoughts..."
              required
            />
          </div>

          {/* Action buttons: image + emoji */}
          <div className="flex items-center gap-4">
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={handleFileClick}
              className="btn btn-ghost btn-circle"
            >
              <ImageIcon className="w-6 h-6 text-primary" />
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((prev) => !prev)}
                className="btn btn-ghost btn-circle"
              >
                <Smile className="w-6 h-6 text-primary" />
              </button>
              {showEmojiPicker && (
                <div className="absolute z-10 mt-2">
                  <Picker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
          </div>

          {/* Preview existing images */}
          {existingImages.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Existing Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {existingImages.map((url, i) => (
                  <div key={i} className="relative">
                    <img
                      src={url}
                      alt="existing"
                      className="w-full h-40 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(i)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Preview new images */}
          {newImages.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">New Images</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {newImages.map((file, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-40 object-cover rounded-lg shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNewImage(i)}
                      className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Visibility */}
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Post Visibility</span>
            </label>
            <select
              className="select select-bordered"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
            >
              <option value="public">🌍 Public</option>
              <option value="connections">👥 Connections Only</option>
            </select>
          </div>

          {/* Buttons */}
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
  );
};

export default EditPostModal;

