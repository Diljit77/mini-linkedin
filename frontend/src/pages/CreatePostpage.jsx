import  { useState, useRef } from "react";
import Navbar from "../components/Navbar";
import { createpost } from "../utils/api";
import toast from "react-hot-toast";
import { useThemeStore } from "../store/useThemeStore";
import { useNavigate } from "react-router-dom";
import { ImageIcon, Smile, X } from "lucide-react"; 
import Picker from "emoji-picker-react"; 

function CreatePostPage() {
  const { theme } = useThemeStore();
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("public");
  const [image, setImage] = useState([]);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

 
  const handleFileClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const totalFiles = [...image, ...selectedFiles];

    if (totalFiles.length > 5) {
      toast.error("You can upload a maximum of 5 images.");
      setImage(totalFiles.slice(0, 5));
    } else {
      setImage(totalFiles);
    }
  };

  const handleRemoveImage = (index) => {
    setImage(image.filter((_, i) => i !== index));

  };

  const handleEmojiClick = (emojiData) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  const handlePost = async () => {
    try {
      const formData = new FormData();
      formData.append("content", content);
      formData.append("visibility", visibility);

      image.forEach((file) => {
        formData.append("image", file);
      });

      await createpost(formData);
      toast.success("Post created successfully!");
      navigate("/");
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("Failed to create post.");
    }
  };

  return (
    <div className="min-h-screen bg-base-200" data-theme={theme}>
      <Navbar />

      <div className="max-w-3xl mx-auto mt-10 p-4">
        <div className="card bg-base-100 shadow-xl p-6">
          <h2 className="text-2xl font-bold text-primary mb-4 text-center">
            Create a Post
          </h2>

          {/* Post Text */}
          <div className="form-control w-full mb-4">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="textarea textarea-bordered w-full"
              placeholder="What do you want to talk about?"
            />
          </div>

          {/* Action buttons: image + emoji */}
          <div className="flex items-center gap-4 mb-4">
            {/* Hidden File Input */}
            <input
              type="file"
              accept="image/*"
              multiple
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Image Upload Button */}
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

        
          {image.length > 0 && (
            <div className="mt-4">
              {image.length === 1 ? (
                <div className="relative flex justify-center">
                  <img
                    src={URL.createObjectURL(image[0])}
                    alt="preview"
                    className="w-full max-w-2xl h-auto rounded-xl shadow-md object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(0)}
                    className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {image.map((file, i) => (
                    <div key={i} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt="preview"
                        className="w-full h-48 object-cover rounded-xl shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(i)}
                        className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          <div className="form-control mb-4 mt-4">
            <label className="label">
              <span className="label-text">Post Visibility</span>
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

    
          <div className="text-right">
            <button className="btn btn-primary" onClick={handlePost}>
              📤 Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CreatePostPage;
