import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { 
  Sparkles, Heart, MessageCircle, Share2, Bookmark, Plus, 
  X, Camera, Search, User, Award, CheckCircle2, ChevronRight,
  TrendingUp, Calendar, AlertCircle, Trash2, ShieldAlert
} from "lucide-react";
import { glowFeedService, serviceService, uploadService } from "../../services";
import { useAuthStore } from "../../store/authStore";
import { getMembershipColor, getInitials } from "../../utils";
import { toast } from "sonner";

// ── Before/After Interactive Slider ──
function BeforeAfterSlider({ before, after }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percentage);
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (e.buttons === 1) {
      handleMove(e.clientX);
    }
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden select-none border border-white/10 group cursor-ew-resize bg-gray-950"
    >
      {/* Before Image */}
      <img 
        src={before} 
        alt="Before" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
      />
      <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md text-xs font-semibold text-white/90">
        Before
      </div>

      {/* After Image Container (clipped width) */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
        style={{ width: `${position}%` }}
      >
        <img 
          src={after} 
          alt="After" 
          className="absolute inset-0 w-full h-full object-cover"
          style={{ width: containerRef.current ? containerRef.current.offsetWidth : "100%" }}
        />
        <div className="absolute bottom-4 left-4 px-3 py-1.5 rounded-lg bg-[var(--color-rose-600)]/80 backdrop-blur-md text-xs font-semibold text-white">
          After
        </div>
      </div>

      {/* Interactive slider line and handle */}
      <div 
        className="absolute inset-y-0 w-1 bg-white hover:bg-[var(--color-rose-300)] shadow-lg transition-colors pointer-events-none"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-gray-800 shadow-xl border border-gray-200 flex items-center justify-center text-sm font-bold">
          ↔
        </div>
      </div>
    </div>
  );
}

// ── Client Side Image Compression Utility ──
const compressImage = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = document.createElement("img");
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Resize down to max 1080px width/height while maintaining aspect ratio
        const maxSize = 1080;
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          } else {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob WebP with 0.8 quality for maximum compression (~250KB target)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: "image/webp",
                lastModified: Date.now()
              });
              resolve(compressedFile);
            } else {
              resolve(file); // fallback
            }
          },
          "image/webp",
          0.8
        );
      };
    };
    reader.onerror = (e) => reject(e);
  });
};

export default function GlowFeedHome() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTag, setActiveTag] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [commentsPostId, setCommentsPostId] = useState(null);
  const [commentInput, setCommentInput] = useState("");
  const [aiRec, setAiRec] = useState(null);

  // Create Post Form States
  const [caption, setCaption] = useState("");
  const [isBeforeAfter, setIsBeforeAfter] = useState(true);
  const [images, setImages] = useState([]);
  const [beforeImage, setBeforeImage] = useState("");
  const [afterImage, setAfterImage] = useState("");
  const [selectedServices, setSelectedServices] = useState([]);
  const [customServicesInput, setCustomServicesInput] = useState("");
  const [customServices, setCustomServices] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  // Queries
  const { data: postsData, isLoading: postsLoading } = useQuery({
    queryKey: ["glowfeed", "posts", searchQuery, activeTag],
    queryFn: () => glowFeedService.getPosts({ search: searchQuery, tag: activeTag })
  });
  const posts = postsData?.data || [];

  const { data: trendingData } = useQuery({
    queryKey: ["glowfeed", "trending"],
    queryFn: glowFeedService.getTrending
  });
  const trendingInfo = trendingData?.data || { trending: [], challenge: null, topStars: [] };

  const { data: servicesData } = useQuery({
    queryKey: ["services", "all"],
    queryFn: serviceService.getAll
  });
  const services = servicesData?.data || [];

  const { data: commentsData } = useQuery({
    queryKey: ["glowfeed", "comments", commentsPostId],
    queryFn: () => glowFeedService.getComments(commentsPostId),
    enabled: !!commentsPostId
  });
  const comments = commentsData?.data || [];

  // Mutations
  const likeMutation = useMutation({
    mutationFn: glowFeedService.toggleLike,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["glowfeed", "posts"] });
    }
  });

  const createPostMutation = useMutation({
    mutationFn: glowFeedService.createPost,
    onSuccess: (res) => {
      toast.success(res.data.post.status === "Approved" ? "Transformation shared successfully! ✨" : "Post submitted for approval");
      if (res.data.aiRec) {
        setAiRec(res.data.aiRec);
      } else {
        setCreateOpen(false);
        resetForm();
      }
      queryClient.invalidateQueries({ queryKey: ["glowfeed", "posts"] });
      queryClient.invalidateQueries({ queryKey: ["glowfeed", "trending"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to share post");
    }
  });

  const commentMutation = useMutation({
    mutationFn: ({ id, text }) => glowFeedService.createComment(id, { text }),
    onSuccess: () => {
      setCommentInput("");
      queryClient.invalidateQueries({ queryKey: ["glowfeed", "comments", commentsPostId] });
      queryClient.invalidateQueries({ queryKey: ["glowfeed", "posts"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: glowFeedService.deletePost,
    onSuccess: () => {
      toast.success("Post deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["glowfeed", "posts"] });
    }
  });

  // Helpers
  const resetForm = () => {
    setCaption("");
    setIsBeforeAfter(false);
    setImages([]);
    setBeforeImage("");
    setAfterImage("");
    setSelectedServices([]);
    setCustomServices([]);
    setAiRec(null);
  };

  const handleImageUpload = async (e, type = "normal") => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setIsUploading(true);
    try {
      for (const file of files) {
        // Client side WebP compression under 250KB
        const compressed = await compressImage(file);
        const res = await uploadService.uploadImage(compressed);
        const url = res.data.url;

        if (type === "before") {
          setBeforeImage(url);
        } else if (type === "after") {
          setAfterImage(url);
        } else {
          setImages(prev => [...prev, url].slice(0, 10));
        }
      }
      toast.success("Image uploaded & WebP compressed to <250KB! 📸");
    } catch (err) {
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddCustomService = () => {
    const val = customServicesInput.trim();
    if (val && !customServices.includes(val)) {
      setCustomServices(prev => [...prev, val]);
      setCustomServicesInput("");
    }
  };

  const handleCreatePostSubmit = (e) => {
    e.preventDefault();
    createPostMutation.mutate({
      caption,
      isBeforeAfter,
      images: isBeforeAfter ? [] : images,
      beforeImage: isBeforeAfter ? beforeImage : "",
      afterImage: isBeforeAfter ? afterImage : "",
      services: selectedServices,
      customServices,
    });
  };

  const handleBookThisLook = (post) => {
    const serviceIds = post.services.map(s => s._id).join(",");
    if (serviceIds) {
      navigate(`/book?services=${serviceIds}`);
      toast.success("Let's book this look! Tagged services preselected ✨");
    } else {
      navigate("/book");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto px-1 sm:px-2 pb-16">
      
      {/* ── Main Community Feed (Left 3 Columns) ── */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* GlowFeed Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-gradient-to-r from-[var(--color-rose-50)] to-white border border-[var(--color-border)] p-4 sm:p-6 rounded-2xl shadow-sm">
          <div>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--color-rose-600)] flex items-center gap-2">
              GlowFeed <Sparkles className="w-6 h-6 text-[var(--color-rose-400)] animate-pulse" />
            </h1>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">Your beauty. Your style. Your community.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 sm:w-64">
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search community..."
                className="w-full pl-9 pr-4 py-2 text-sm bg-white rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-rose-400)]"
              />
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--color-text-muted)]" />
            </div>

            <button 
              onClick={() => setCreateOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[var(--color-rose-500)] to-[var(--color-rose-600)] hover:opacity-90 text-white font-semibold rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5 flex-shrink-0"
            >
              <Plus className="w-4 h-4" /> Create Post
            </button>
          </div>
        </div>

        {/* Stories / Categories Bar */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
          {[
            { label: "Your Story", img: user?.avatar || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
            { label: "Hair Looks", img: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=100" },
            { label: "Nail Art", img: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=100" },
            { label: "Makeup", img: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100" },
            { label: "Skin Care", img: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=100" },
            { label: "Bridal", img: "https://images.unsplash.com/photo-1591551910796-359f40c749b7?w=100" },
            { label: "Spa & Wellness", img: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=100" },
          ].map((story, i) => (
            <button 
              key={story.label} 
              onClick={() => setActiveTag(story.label === "Your Story" ? null : story.label)}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 focus:outline-none group"
            >
              <div className={`w-14 h-14 rounded-full p-[2px] border-2 ${activeTag === story.label ? "border-[var(--color-rose-500)]" : "border-pink-200 group-hover:border-[var(--color-rose-400)]"} transition-all`}>
                <img src={story.img} alt={story.label} className="w-full h-full object-cover rounded-full" />
              </div>
              <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">{story.label}</span>
            </button>
          ))}
        </div>

        {/* Quick Share Trigger */}
        <div className="bg-white border border-[var(--color-border)] p-4 rounded-2xl flex items-center gap-3">
          <img src={user?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100"} alt="You" className="w-10 h-10 object-cover rounded-full" />
          <button 
            onClick={() => setCreateOpen(true)}
            className="flex-1 text-left px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm text-[var(--color-text-muted)] hover:bg-gray-100/50 transition-colors"
          >
            What's your new look today? ✨ Share a photo...
          </button>
        </div>

        {/* Posts Feed */}
        {postsLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white h-96 rounded-2xl animate-pulse border border-pink-100" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-[var(--color-border)]">
            <Award className="w-16 h-16 text-[var(--color-rose-200)] mx-auto mb-3" />
            <p className="text-[var(--color-text-secondary)] font-medium">No posts in this category yet</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Be the first to share your new style!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.filter(post => post.user).map(post => {
              const liked = post.likes.includes(user?._id);
              return (
                <motion.article 
                  key={post._id}
                  layout
                  className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Card Header */}
                  <div className="p-4 flex items-center justify-between border-b border-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-rose-500)] text-white font-bold flex items-center justify-center overflow-hidden">
                        {post.user?.avatar ? (
                          <img src={post.user.avatar} alt={post.user?.firstName} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(post.user?.firstName, post.user?.lastName)
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-sm text-[var(--color-text-primary)]">
                            {post.user?.firstName || 'Unknown'} {post.user?.lastName || 'User'}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full" style={{
                            color: getMembershipColor(post.user?.membership),
                            background: `${getMembershipColor(post.user?.membership)}15`
                          }}>
                            {post.user?.membership}
                          </span>
                        </div>
                        <span className="text-xs text-[var(--color-text-muted)]">
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {(post.user?._id === user?._id || user?.role === "admin") && (
                      <button 
                        onClick={() => deleteMutation.mutate(post._id)}
                        className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Caption & Service Tags */}
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-[var(--color-text-secondary)] whitespace-pre-wrap">
                      {post.caption}
                    </p>

                    {(post.services.length > 0 || post.customServices.length > 0) && (
                      <div className="flex flex-wrap gap-1.5">
                        {post.services.map(s => (
                          <span key={s._id} className="text-xs px-2.5 py-1 bg-[var(--color-rose-50)] text-[var(--color-rose-600)] rounded-full font-medium">
                            #{s.name}
                          </span>
                        ))}
                        {post.customServices.map((cs, i) => (
                          <span key={i} className="text-xs px-2.5 py-1 bg-pink-50 text-[var(--color-rose-600)] rounded-full font-medium">
                            #{cs}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Post Media / Before-After Slider */}
                  <div className="px-4 pb-4">
                    {post.isBeforeAfter && post.beforeImage && post.afterImage ? (
                      <BeforeAfterSlider before={post.beforeImage} after={post.afterImage} />
                    ) : post.images && post.images.length > 0 ? (
                      <div className={`grid gap-2 ${post.images.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
                        {post.images.map((img, i) => (
                          <img 
                            key={i} 
                            src={img} 
                            alt={`Post attachment ${i + 1}`} 
                            loading="lazy"
                            className="w-full aspect-[4/3] object-cover rounded-xl border border-gray-100" 
                          />
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {/* Actions / Upvotes */}
                  <div className="px-4 py-3 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => likeMutation.mutate(post._id)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${liked ? "text-[var(--color-rose-600)]" : "text-[var(--color-text-secondary)] hover:text-[var(--color-rose-600)]"}`}
                      >
                        <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
                        <span>Upvote ({post.likes.length})</span>
                      </button>

                      <button 
                        onClick={() => setCommentsPostId(post._id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-blue-500 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Comments</span>
                      </button>
                    </div>

                    {post.services && post.services.length > 0 && (
                      <button 
                        onClick={() => handleBookThisLook(post)}
                        className="px-3.5 py-1.5 bg-[var(--color-rose-600)] hover:bg-[var(--color-rose-700)] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1"
                      >
                        <Calendar className="w-3.5 h-3.5" /> Book This Look
                      </button>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Dynamic Right Sidebar (1 Column) ── */}
      <div className="hidden lg:block space-y-6">
        
        {/* Trending Now */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-display font-semibold text-lg text-[var(--color-text-primary)] flex items-center gap-2">
            Trending Now <TrendingUp className="w-5 h-5 text-[var(--color-rose-500)]" />
          </h3>
          <div className="space-y-3">
            {trendingInfo.trending.map((trend, i) => (
              <div 
                key={trend.name} 
                onClick={() => setSearchQuery(trend.name)}
                className="flex items-start gap-3 p-2 rounded-xl hover:bg-rose-50/40 cursor-pointer transition-colors"
              >
                <span className="font-display font-bold text-[var(--color-rose-600)] text-lg w-5">{i + 1}</span>
                <div>
                  <p className="text-sm font-semibold text-[var(--color-text-primary)]">{trend.name}</p>
                  <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{trend.posts} posts</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Challenge Card */}
        {trendingInfo.challenge && (
          <div className="bg-gradient-to-br from-[var(--color-rose-500)] to-[var(--color-rose-600)] rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4">
              <Sparkles className="w-36 h-36" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 px-2 py-1 rounded-md">
              Monthly Challenge
            </span>
            <h4 className="font-display font-bold text-xl mt-3">{trendingInfo.challenge.title}</h4>
            <p className="text-xs text-rose-50 mt-1.5">{trendingInfo.challenge.description}</p>
            <button 
              onClick={() => {
                setCaption(`#${trendingInfo.challenge.title} Challenge submission: `);
                setCreateOpen(true);
              }}
              className="mt-4 w-full py-2 bg-white text-[var(--color-rose-600)] font-bold text-xs rounded-xl shadow hover:bg-rose-50 transition-colors"
            >
              Submit Post
            </button>
          </div>
        )}

        {/* Top Glow Stars */}
        <div className="bg-white border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-display font-semibold text-lg text-[var(--color-text-primary)]">Top Glow Stars ✨</h3>
          <div className="space-y-3">
            {trendingInfo.topStars.filter(Boolean).map(star => (
              <div key={star._id} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-pink-100 flex items-center justify-center overflow-hidden">
                  {star.avatar ? (
                    <img src={star.avatar} alt={star.firstName} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(star.firstName, star.lastName)
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                    {star.firstName} {star.lastName}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)] truncate">{star.glowPoints} Glow Points</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Comments Drawer / Modal ── */}
      <AnimatePresence>
        {commentsPostId && (
          <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-full max-w-md h-full bg-white flex flex-col shadow-2xl p-6"
            >
              <div className="flex items-center justify-between border-b pb-4 mb-4">
                <h3 className="font-semibold text-lg text-[var(--color-text-primary)]">Comments</h3>
                <button onClick={() => setCommentsPostId(null)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {comments.length === 0 ? (
                  <p className="text-center py-12 text-sm text-[var(--color-text-muted)]">No comments yet. Write the first reply!</p>
                ) : (
                  comments.filter(c => c.user).map(c => (
                    <div key={c._id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-xs font-bold overflow-hidden">
                        {c.user?.avatar ? (
                          <img src={c.user.avatar} alt={c.user?.firstName} className="w-full h-full object-cover" />
                        ) : (
                          getInitials(c.user?.firstName, c.user?.lastName)
                        )}
                      </div>
                      <div className="flex-1 bg-gray-50 p-3 rounded-2xl text-sm">
                        <p className="font-semibold text-xs text-[var(--color-text-primary)]">
                          {c.user?.firstName || 'Unknown'} {c.user?.lastName || 'User'}
                        </p>
                        <p className="text-[var(--color-text-secondary)] mt-1">{c.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form 
                onSubmit={e => { e.preventDefault(); if (commentInput.trim()) commentMutation.mutate({ id: commentsPostId, text: commentInput }); }}
                className="mt-4 pt-4 border-t flex gap-2"
              >
                <input
                  value={commentInput}
                  onChange={e => setCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 border text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-rose-500)]"
                />
                <button 
                  type="submit" 
                  disabled={!commentInput.trim() || commentMutation.isPending}
                  className="px-4 py-2.5 bg-[var(--color-rose-600)] text-white text-xs font-bold rounded-xl transition-opacity disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Create Post Modal ── */}
      <AnimatePresence>
        {createOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6"
            >
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-display font-bold text-xl text-[var(--color-rose-600)] flex items-center gap-1.5">
                  Share Your Transformation <Sparkles className="w-5 h-5 text-[var(--color-rose-400)]" />
                </h3>
                <button onClick={() => { setCreateOpen(false); resetForm(); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {aiRec ? (
                <div className="space-y-4">
                  <div className="p-4 bg-rose-50/60 border border-[var(--color-border)] rounded-2xl text-center space-y-3">
                    <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                    <h4 className="font-display font-semibold text-lg text-[var(--color-rose-600)]">Post Approved!</h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">Your look has been published to the community board. We generated custom recommendations for you!</p>
                  </div>

                  <div className="p-4 bg-white border rounded-2xl space-y-3">
                    <h5 className="font-semibold text-sm text-[var(--color-text-primary)] flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-yellow-500" /> AI Recommended Beauty Routine:
                    </h5>
                    <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
                      {aiRec.routineAdvice}
                    </p>
                  </div>

                  <button 
                    onClick={() => { setCreateOpen(false); resetForm(); }}
                    className="w-full py-3 bg-[var(--color-rose-600)] hover:bg-[var(--color-rose-700)] text-white font-bold rounded-xl text-sm transition-colors"
                  >
                    Awesome, Go back
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCreatePostSubmit} className="space-y-4">
                  
                  {/* Daily post limit warning */}
                  <div className="p-3 bg-rose-50/60 border border-[var(--color-border)] rounded-xl flex items-center gap-2 text-xs text-[var(--color-rose-600)] font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    Enforced limit: Maximum 3 posts/images upload allowed per day.
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1">Caption / Experience *</label>
                    <textarea
                      value={caption}
                      onChange={e => setCaption(e.target.value)}
                      required
                      placeholder="Tell the community about your look or styling routine..."
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border rounded-xl text-sm focus:outline-none focus:border-[var(--color-rose-500)] resize-none"
                    />
                  </div>

                  {/* Before / After Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-2">Before / After Photos</label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Before Image */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500">Before Photo</label>
                        {beforeImage ? (
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border">
                            <img src={beforeImage} alt="Before" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setBeforeImage("")} className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <label className="aspect-[4/3] rounded-xl border border-dashed hover:border-[var(--color-rose-400)] transition-colors flex flex-col items-center justify-center cursor-pointer bg-gray-50 text-gray-400">
                            <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "before")} />
                            <Camera className="w-6 h-6 mb-1" />
                            <span className="text-[10px]">Upload Before</span>
                          </label>
                        )}
                      </div>

                      {/* After Image */}
                      <div className="space-y-1">
                        <label className="block text-xs font-semibold text-gray-500">After Photo</label>
                        {afterImage ? (
                          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border">
                            <img src={afterImage} alt="After" className="w-full h-full object-cover" />
                            <button type="button" onClick={() => setAfterImage("")} className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-full"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <label className="aspect-[4/3] rounded-xl border border-dashed hover:border-[var(--color-rose-400)] transition-colors flex flex-col items-center justify-center cursor-pointer bg-gray-50 text-gray-400">
                            <input type="file" accept="image/*" className="hidden" onChange={e => handleImageUpload(e, "after")} />
                            <Camera className="w-6 h-6 mb-1" />
                            <span className="text-[10px]">Upload After</span>
                          </label>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Services Tagging */}
                  <div>
                    <label className="block text-sm font-semibold text-[var(--color-text-secondary)] mb-1.5">Tag Services Received</label>
                    <div className="flex flex-wrap gap-1.5 mb-2 max-h-24 overflow-y-auto p-1 border rounded-xl bg-gray-50">
                      {services.map(s => {
                        const sel = selectedServices.includes(s._id);
                        return (
                          <button
                            key={s._id}
                            type="button"
                            onClick={() => setSelectedServices(prev => sel ? prev.filter(id => id !== s._id) : [...prev, s._id])}
                            className={`text-xs px-2.5 py-1 rounded-full transition-colors border ${sel ? "bg-[var(--color-rose-500)] text-white border-transparent" : "bg-white text-[var(--color-text-secondary)] border-gray-200"}`}
                          >
                            {s.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={createPostMutation.isPending || isUploading}
                    className="w-full py-3 bg-[var(--color-rose-600)] hover:bg-[var(--color-rose-700)] text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    {createPostMutation.isPending ? "Posting..." : "Share Look & Earn XP ✨"}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
