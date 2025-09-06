import { useEffect, useState, useRef } from "react";
import { currentUser, connectedUsers, fetchMessages, deleteMessage, updateMessage } from "../utils/api";
import Navbar from "../components/Navbar";
import { useThemeStore } from "../store/useThemeStore";
import { useChatStore } from "../store/useChatStore";
import Picker from "emoji-picker-react"; 
import { Smile, Send, Edit, Trash2, X, Check, Reply, ImageIcon, VideoIcon, FileIcon, Mic, Square, Play, Pause } from "lucide-react"; 
import GiphyPicker from "../components/GiphyPicker";
import { useDebounce } from "react-use"; 
import RecordingAnimation from "../components/RecordiingAnimation";

function ChatPage() {
  const { theme } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { connectSocket, messages, sendMessage, setMessages } = useChatStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioChunks, setAudioChunks] = useState([]);
  const [fileType, setFileType] = useState(null);
  const [user, setUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGiphyPicker, setShowGiphyPicker] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [audioPreview, setAudioPreview] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioChunksRef = useRef([]);
  const emojiPickerRef = useRef(null);
  const giphyPickerRef = useRef(null);
  const inputRef = useRef(null);
  const menuRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    const init = async () => {
      try {
        const me = await currentUser();
        setUser(me);
        connectSocket(me.id);

        const conn = await connectedUsers();
        setConnections(conn);
      } catch (err) {
        console.error("❌ Error initializing chat:", err);
      }
    };
    init();
  }, [connectSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      
      if (giphyPickerRef.current && !giphyPickerRef.current.contains(event.target)) {
        setShowGiphyPicker(false);
      }
      
      if (menuRef.current && !menuRef.current.contains(event.target) && 
          !event.target.closest('.message-actions')) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectChat = async (chatUser) => {
    setSelectedChat(chatUser);
    setActiveMenu(null);
    setEditingMessage(null);
    setReplyingTo(null);
    setShowEmojiPicker(false);
    setShowGiphyPicker(false);
    setIsLoading(true);
    try {
      const msgs = await fetchMessages(chatUser._id);
      setMessages(msgs || []); 
    } catch (err) {
      console.error("❌ Could not fetch chat history", err);
      setMessages([]); 
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
   
    if (file.type.startsWith('image/') && !file.type.includes('gif')) {
      setFileType('image');
    } else if (file.type.startsWith('video/')) {
      setFileType('video');
    } else if (file.type.includes('gif')) {
      setFileType('gif');
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  useDebounce(
    () => setDebouncedSearch(searchTerm),
    500,
    [searchTerm]
  );

  const handleGifSelect = (gif) => {
    setSelectedFile(gif.images.original.url);
    setFilePreview(gif.images.original.url);
    setFileType("gif");
    setShowGiphyPicker(false);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const cancelAudio = () => {
    setAudioPreview(null);
    setSelectedFile(null);
    setFileType(null);
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

const handleSend = async () => {
  setIsLoading(true);
  const fileToSend = selectedFile;
  const typeToSend = fileType;

  if (!newMessage.trim() && !fileToSend) return;

  const formData = new FormData();

  // Text
  if (newMessage.trim()) {
    formData.append("message", newMessage.trim());
  }

  // Media
  if (fileToSend) {
    if (typeof fileToSend === "string" && typeToSend === "gif") {
      // Case: GIF URL
      const response = await fetch(fileToSend);
      const blob = await response.blob();
      const gifFile = new File([blob], "giphy.gif", { type: "image/gif" });
      formData.append("media", gifFile);
      formData.append("mediaType", "gif");
    } else {
      // Case: File object (image, video, audio, etc.)
      formData.append("media", fileToSend);
      formData.append("mediaType", typeToSend);
    }
  }

  formData.append("receiverId", selectedChat._id);

  try {
    const res = await fetch(`${import.meta.env.VITE_BASE_URL}/api/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    });

    const data = await res.json();
    console.log("📩 Sent Message:", data);

    if (data.success) {
      useChatStore.getState().sendMessage(user._id, selectedChat._id, data.message);
      setNewMessage("");
      setSelectedFile(null);
      setFileType(null);
    }
  } catch (err) {
    console.error("❌ Error sending message:", err);
  }finally{
    setIsLoading(false);
  }
};



  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

     recorder.onstop = () => {
  const audioBlob = new Blob(audioChunksRef.current, { 
    type: "audio/webm;codecs=opus" 
  });
  
  // Create a URL for the audio blob for preview
  const audioUrl = URL.createObjectURL(audioBlob);
  setAudioPreview(audioUrl);
  
  // Store the audio blob directly for sending
  setSelectedFile(audioBlob);
  setFileType("audio");
  
  // Stop all tracks in the stream
  stream.getTracks().forEach(track => track.stop());
};

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
 
      setTimeout(() => {
        if (isRecording) {
          stopRecording();
        }
      }, 30000);
      
    } catch (err) {
      console.error("🎤 Error starting recording:", err);
      alert("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  const handleEdit = (message) => {
    setEditingMessage(message);
    setNewMessage(message.content);
    setActiveMenu(null);
    setReplyingTo(null);
    inputRef.current?.focus();
  };

  const handleReply = (message) => {
    setReplyingTo(message);
    setActiveMenu(null);
    setEditingMessage(null);
    inputRef.current?.focus();
  };
const renderMessageContent = (msg) => {
  // Case: Shared post object (from shareModal)
  if (msg.sharedPost) {
    return (
      <div 
        className="border rounded-lg p-2 bg-base-200 cursor-pointer hover:bg-base-300"
        onClick={() => window.open(msg.sharedPost.url, "_blank")}
      >
        <h4 className="font-semibold">{msg.sharedPost.title}</h4>
        {msg.sharedPost.thumbnail && (
          <img 
            src={msg.sharedPost.thumbnail} 
            alt={msg.sharedPost.title} 
            className="mt-1 rounded-md max-h-32 object-cover"
          />
        )}
        <p className="text-xs text-base-content/70 mt-1">
          {msg.sharedPost.description}
        </p>
      </div>
    );
  }

  // Case: Plain link (http/https)
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  if (urlRegex.test(msg.content)) {
    return (
      <p className="text-sm break-words mt-1">
        {msg.content.split(" ").map((part, i) =>
          urlRegex.test(part) ? (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 underline hover:text-blue-700"
            >
              {part}
            </a>
          ) : (
            <span key={i}>{part} </span>
          )
        )}
      </p>
    );
  }


  return <p className="text-sm break-words mt-1">{msg.content}</p>;
};

  const handleDelete = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteMessage(messageId);  
        const msgs = await fetchMessages(selectedChat._id);
        setMessages(msgs || []);
      } catch (err) {
        console.error("❌ Error deleting message:", err);
      }
      setActiveMenu(null);
    }
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setNewMessage("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
  };

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prevMessage => prevMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(prev => !prev);
    setShowGiphyPicker(false);
  };

  const toggleGiphyPicker = () => {
    setShowGiphyPicker(prev => !prev);
    setShowEmojiPicker(false);
  };




  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };




  useEffect(() => {
    return () => {
      if (audioPreview) {
        URL.revokeObjectURL(audioPreview);
      }
    };
  }, [audioPreview]);

  return (
    <div className="min-h-screen bg-base-200" data-theme={theme}>
      <Navbar />
      <div className="flex h-screen bg-base-200">
    
        <div className="w-1/3 border-r border-base-300 flex flex-col max-md:hidden">
          <div className="p-3">
            <input
              type="text"
              placeholder="Search messages"
              className="input input-bordered w-full bg-base-100"
            />
          </div>

          <div className="flex gap-2 px-3 pb-2">
            <button className="btn btn-sm btn-outline">My Connections</button>
          </div>

          <div className="overflow-y-auto flex-1">
            {connections.map((conn) => (
              <div
                key={conn._id}
                className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-base-300 ${
                  selectedChat?._id === conn._id ? "bg-base-300" : ""
                }`}
                onClick={() => handleSelectChat(conn)}
              >
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img src={conn.profilePic} alt={conn.name} />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base-content truncate">{conn.name}</h4>
                  <p className="text-sm text-base-content/70 truncate">
                    {conn.lastMessage || "Start chatting"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col relative">
          {selectedChat ? (
            <>
              <div className="flex items-center gap-3 p-4 border-b border-base-300 bg-base-100">
                <div className="avatar">
                  <div className="w-12 h-12 rounded-full">
                    <img src={selectedChat.profilePic} alt={selectedChat.name} />
                  </div>
                </div>
                <div>
                  <h2 className="font-semibold text-base-content">{selectedChat.name}</h2>
                  <p className="text-sm text-base-content/70">Online</p>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-base-100">
                {isLoading ? (
                  <div className="text-center text-base-content/70 py-8">
                    Loading messages...
                  </div>
                ) : Array.isArray(messages) && messages.length > 0 ?
               (messages.map((msg, idx) => {
  const isOwnMessage = msg.sender._id === user?._id;
  const hasMedia = msg.mediaUrl || msg.gifUrl;

  return (
    <div
      key={msg._id || idx}
      className={`group relative flex flex-col ${
        isOwnMessage ? "items-end" : "items-start"
      }`}
    >
  
      {activeMenu === msg._id && (
        <div className="flex gap-2 mb-1 px-2 py-1 rounded-lg bg-base-200 shadow-md">
          <button
            className="btn btn-xs btn-ghost"
            title="Reply"
            onClick={() => handleReply(msg)}
          >
            <Reply size={14} />
          </button>
          {isOwnMessage && (
            <>
              <button
                className="btn btn-xs btn-ghost"
                title="Edit"
                onClick={() => handleEdit(msg)}
              >
                <Edit size={14} />
              </button>
              <button
                className="btn btn-xs btn-ghost text-error"
                title="Delete"
                onClick={() => handleDelete(msg._id)}
              >
                <Trash2 size={14} />
              </button>
            </>
          )}
          <button
            className="btn btn-xs btn-ghost"
            title="Close"
            onClick={() => setActiveMenu(null)}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        className={`rounded-2xl p-2 shadow-sm cursor-pointer ${
          isOwnMessage
            ? "bg-primary text-primary-content rounded-br-md"
            : "bg-base-200 text-base-content rounded-bl-md"
        }`}
        style={{ maxWidth: hasMedia ? "260px" : "100%" }}
        onClick={() => setActiveMenu(activeMenu === msg._id ? null : msg._id)}
      >
        {msg.replyTo && (
          <div className="text-xs opacity-75 mb-1 border-l-2 pl-2">
            Replying to: {msg.replyTo.content}
          </div>
        )}

        {/* Media rendering */}
        {msg.mediaType === "image" && msg.mediaUrl && (
          <img
            src={msg.mediaUrl}
            alt="Shared"
            className="rounded-lg object-cover max-w-[240px] max-h-[180px]"
          />
        )}
        {msg.mediaType === "video" && msg.mediaUrl && (
          <video
            controls
            className="rounded-lg max-w-[240px] max-h-[180px]"
          >
            <source src={msg.mediaUrl} type="video/mp4" />
          </video>
        )}
        {msg.mediaType === "audio" && msg.mediaUrl && (
          <div className="flex items-center gap-2  p-2 rounded-lg">
            <audio 
              controls 
              className="w-48 max-w-full"
              src={msg.mediaUrl}
            >
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {msg.mediaType === "gif" && (msg.mediaUrl || msg.gifUrl) && (
          <img
            src={msg.mediaUrl || msg.gifUrl}
            alt="GIF"
            className="rounded-lg object-cover max-w-[240px] max-h-[180px]"
          />
        )}

        
        {msg.content && (
          <p className="text-sm break-words mt-1">{msg.content}</p>
        )}

        {/* Time & ticks */}
        <div className="flex justify-between items-center mt-1 text-xs opacity-70">
          <time>{formatTime(msg.createdAt)}</time>
          {isOwnMessage && <span>{msg.isRead ? "✓✓" : "✓"}</span>}
        </div>
      </div>
    </div>
  );
}))
: (
                  <div className="text-center text-base-content/70 py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

            
            {audioPreview && (
  <div className="border-t border-base-300 bg-base-200 p-3 flex justify-between items-center">
    <div className="flex items-center gap-3">
      <button 
        onClick={handlePlayPause}
        className="btn btn-circle btn-sm btn-primary"
      >
        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
      </button>
      <audio
        ref={audioRef}
        src={audioPreview}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
      <span className="text-sm">Voice message</span>
    </div>
    <div className="flex gap-2">
      <button 
        className="btn btn-ghost btn-sm"
        onClick={cancelAudio}
      >
        <X size={16} />
      </button>
  
    </div>
  </div>
)}

              {filePreview && (
                <div className="border-t border-base-300 bg-base-200 p-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    {fileType === 'image' && <ImageIcon size={20} />}
                    {fileType === 'video' && <VideoIcon size={20} />}
                    {fileType === 'gif' && <FileIcon size={20} />}
                    
                    <div className="max-w-xs">
                      {fileType === 'image' || fileType === 'gif' ? (
                        <img 
                          src={filePreview} 
                          alt="Preview" 
                          className="h-14 w-auto rounded-md object-cover"
                        />
                      ) : fileType === 'video' ? (
                        <video 
                          src={filePreview} 
                          className="h-14 w-auto rounded-md object-cover"
                        />
                      ) : null}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={removeFile}>
                    <X size={16} />
                  </button>
                </div>
              )}

              {replyingTo && (
                <div className="border-t border-base-300 bg-base-200 p-3 flex justify-between items-center">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-base-content">
                      Replying to {replyingTo.sender._id === user._id ? "yourself" : replyingTo.sender.name}
                    </div>
                    <div className="text-sm text-base-content/70 truncate">
                      {replyingTo.content}
                    </div>
                  </div>
                  <button className="btn btn-ghost btn-sm" onClick={cancelReply}>
                    <X size={16} />
                  </button>
                </div>
              )}

              {editingMessage && (
                <div className="border-t border-base-300 bg-warning/20 p-3 flex justify-between items-center">
                  <span className="text-warning-content text-sm">Editing message</span>
                  <button className="btn btn-ghost btn-sm" onClick={cancelEdit}>
                    <X size={16} />
                  </button>
                </div>
              )}

              {showEmojiPicker && (
                <div 
                  ref={emojiPickerRef}
                  className="absolute bottom-16 right-4 z-10"
                >
                  <Picker 
                    onEmojiClick={onEmojiClick}
                    width={300}
                    height={350}
                    searchDisabled={false}
                    skinTonesDisabled={true}
                  />
                </div>
              )}

              {showGiphyPicker && (
                <div
                  ref={giphyPickerRef}
                  className="absolute bottom-16 right-4 z-10 bg-base-100 p-4 rounded-lg shadow-lg"
                >
                  <input
                    type="text"
                    placeholder="Search GIFs..."
                    className="input input-bordered w-full mb-2"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <GiphyPicker onGifSelect={handleGifSelect} searchTerm={debouncedSearch} />
                </div>
              )}

              <div className="p-3 border-t border-base-300 flex gap-2 items-center bg-base-100">
                <button
                  onClick={toggleEmojiPicker}
                  className="btn btn-ghost btn-circle"
                  type="button"
                >
                  <Smile className="w-5 h-5 text-base-content" />
                </button>
                
                <button
                  onClick={toggleGiphyPicker}
                  className="btn btn-ghost btn-circle"
                  type="button"
                >
                  <span className="text-xl">GIF</span>
                </button>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  id="media-upload"
                  onChange={handleFileSelect}
                />
                
                <label htmlFor="media-upload" className="btn btn-ghost btn-circle cursor-pointer">
                  <ImageIcon className="w-5 h-5" />
                </label>

                {isRecording ? (
                  <div className="flex-1 flex items-center justify-between bg-base-200 rounded-lg px-4 py-2">
                    <RecordingAnimation />
                    <span className="text-sm text-base-content/70">Recording...</span>
                
                  </div>
                ) : audioPreview ? (
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Add a message (optional)..."
                    className="input input-bordered flex-1 bg-base-200 text-base-content"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                ) : (
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={editingMessage ? "Edit your message..." : replyingTo ? "Type a reply..." : "Type a message..."}
                    className="input input-bordered flex-1 bg-base-200 text-base-content"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  />
                )}
                
                {!audioPreview && (
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`btn btn-circle ${isRecording ? "btn-error" : "btn-ghost"}`}
                    type="button"
                  >
                    {isRecording ? <Square size={16} /> : <Mic size={16} />}
                  </button>
                )}
                
                <button 
                  className="btn btn-primary btn-circle"
                  onClick={handleSend}
                  disabled={isLoading || (!newMessage.trim() && !selectedFile && !audioPreview)}
                >
                  {editingMessage ? <Check className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-base-content/70 bg-base-100">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatPage;