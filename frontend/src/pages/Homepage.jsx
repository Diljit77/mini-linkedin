import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard';
import LeftSidebar from '../components/LeftSidebar';
import RightSidebar from '../components/RightSidebar';
import { allpostsfeed,getSuggestedUsers } from '../utils/api';
import { useThemeStore } from '../store/useThemeStore';
import { X } from 'lucide-react';


function Homepage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [highlightedPostId, setHighlightedPostId] = useState(null);
  const [showHighlightBanner, setShowHighlightBanner] = useState(false);
  const {theme} = useThemeStore();

  useEffect(() => {
    // Check URL for highlighted post parameter
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('highlightPost');
    
    if (postId) {
      setHighlightedPostId(postId);
      setShowHighlightBanner(true);
      
      // Set timer to hide banner after 10 seconds
      const timer = setTimeout(() => {
        setShowHighlightBanner(false);
      }, 10000); // 10 seconds

      // Clean up timer on component unmount
      return () => clearTimeout(timer);
      
      // Optional: Scroll to the post after loading
      setTimeout(() => {
        const element = document.getElementById(`post-${postId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('ring-4', 'ring-primary', 'animate-pulse');
          setTimeout(() => {
            element.classList.remove('animate-pulse');
          }, 2000);
        }
      }, 1000);
    }

    const getFeed = async () => {
      try {
        const response = await allpostsfeed();
        console.log("Posts fetched successfully:", response);
        setPosts(response?.posts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    const getsuggestedUsers = async () => {
      try {
        const response = await getSuggestedUsers();
        console.log("Suggested users fetched successfully:", response);
        setSuggestedUsers(response || []);
      } catch (error) {
        console.error("Error fetching suggested users:", error);
      }
    };

    getsuggestedUsers();
    getFeed();
  }, []);

  // Add manual close functionality
  const closeBanner = () => {
    setShowHighlightBanner(false);
  };

  const handleCommentCountChange = (postId, newCount) => {
    setPosts(prev => prev.map(post => 
      post._id === postId ? { ...post, commentsCount: post.comments?.length || 0 } : post
    ));
  };

  return (
    <div className="min-h-screen bg-base-200" data-theme={theme}>
      <Navbar />

      <div className="flex flex-col lg:flex-row px-4 py-6 gap-6 max-w-[1440px] mx-auto">
        <div className="hidden lg:block lg:w-1/4">
          <LeftSidebar />
        </div>

        <div className="w-full lg:w-2/4">
          {/* Show highlighted post banner if applicable - with close button and timer */}
          {showHighlightBanner && highlightedPostId && (
            <div className="alert alert-info mb-4 relative">
              <button 
                onClick={closeBanner}
                className="absolute right-2 top-2 btn btn-ghost btn-xs btn-circle"
              >
                <X size={16} />
              </button>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Showing a post shared with you</span>
              
              {/* Progress bar for visual timer */}
              <div className="w-full bg-info/20 h-1 mt-2 rounded-full">
                <div 
                  className="bg-info h-1 rounded-full transition-all duration-10000 ease-linear"
                  style={{ width: '100%' }}
                  onAnimationEnd={closeBanner}
                />
              </div>
            </div>
          )}

          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-primary">Welcome to the Home Feed</h1>
            <p className="text-base-content opacity-70">
              Start engaging with your community by viewing the latest posts.
            </p>
          </div>

          <div className="space-y-6">
            {loading ? (
              <p>Loading posts...</p>
            ) : posts.length === 0 ? (
              <p className="text-center opacity-50">No posts yet</p>
            ) : (
              <>
                {Array.isArray(posts) &&
                  posts.map((post) => (
                    <div 
                      key={post._id} 
                      id={`post-${post._id}`}
                      className={highlightedPostId === post._id ? 'highlighted-post' : ''}
                    >
                      <PostCard 
                        post={post}   
                        onCommentCountChange={handleCommentCountChange} 
                        isHighlighted={highlightedPostId === post._id && showHighlightBanner}
                      />
                    </div>
                  ))
                }
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:block lg:w-1/4">
          <RightSidebar suggestions={suggestedUsers} />
        </div>
      </div>
    </div>
  );
}

export default Homepage;
