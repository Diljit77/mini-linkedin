import { DeleteIcon, EditIcon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '../store/useThemeStore';
import toast from 'react-hot-toast';
import { deletepost } from '../utils/api';

function timeAgo(dateString) {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now - past) / 1000);

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count} ${unit}${count > 1 ? 's' : ''} ago`;
    }
  }

  return "just now";
}

function PostCard({ post }) {
  const location = useLocation();
  const isProfilePage = location.pathname === '/profile';
  const navigate = useNavigate();
  const { theme } = useThemeStore();

  function handleedit(postId) {
    navigate(`/post/${postId}`);
  }

 async function handleDelete(postId) {

  try {
    await deletepost(postId);
    toast.success("post deleted successfully");
   navigate("/")
  } catch (error) {
    console.error("Error deleting post:", error);
  }

  }

  return (
    <div
      className="relative card bg-base-100 shadow-md hover:shadow-xl border border-base-200 rounded-lg overflow-hidden"
      data-theme={theme}
    >
      {/* Floating Badge */}
      {!isProfilePage && (
        <div className="absolute top-3 right-3 z-10">
          {post.visibility === 'public' && (
            <div className="badge badge-success gap-1 text-xs">
              🌐 Public
            </div>
          )}
          {post.visibility === 'connections' && (
            <div className="badge badge-info gap-1 text-xs">
              👥 Connections Only
            </div>
          )}
        </div>
      )}

      <div className="card-body space-y-3">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex items-start gap-4">
            <div className="avatar">
              <div className="w-12 h-12 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img src={post.author.profilePic} alt={post.author.name} />
              </div>
            </div>

            <div>
              <h2 className="font-semibold text-base">{post.author.name}</h2>
              <p className="text-sm text-base-content opacity-60">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {isProfilePage && post && (
            <div className="flex items-center gap-2">
              <button onClick={() => handleedit(post._id)} className="btn btn-sm btn-ghost">
                <EditIcon size={18} />
              </button>
              <button onClick={() => handleDelete(post._id)} className="btn btn-sm btn-ghost">
                <DeleteIcon size={18} />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="text-base-content text-sm leading-relaxed">
          {post.content}
        </div>
      </div>
    </div>
  );
}

export default PostCard;


