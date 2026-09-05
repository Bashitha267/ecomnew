"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Video,
  Upload,
  Play,
  Pause,
  Volume2,
  VolumeX,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Edit2,
  Sparkles,
  Info,
} from "lucide-react";
import { homepageVideosApi, HomepageVideoItem, getApiError } from "../../lib/api";

const DEFAULT_SECTIONS: HomepageVideoItem[] = [
  {
    id: "vid-hero",
    sectionKey: "hero",
    title: "Hero Background Video",
    subtitle: "Autumn / Winter 2026 Collection · Header Hero",
    description: "Main fullscreen loop background video displayed across the top hero section.",
    videoUrl: "/hero1.mp4",
    isActive: 1,
  },
  {
    id: "vid-featured",
    sectionKey: "featured",
    title: "Featured Editorial Video",
    subtitle: "EDITORIAL // VOL. 01 · Brand Story Section",
    description: "Portrait aspect ratio editorial story video showcasing luxury tailoring and natural textiles.",
    videoUrl: "/hero2.mp4",
    isActive: 1,
  },
];

export const HomepageVideoManager: React.FC = () => {
  const [videos, setVideos] = useState<HomepageVideoItem[]>(DEFAULT_SECTIONS);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUploadKey, setActiveUploadKey] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Per-section video player state
  const [playingState, setPlayingState] = useState<{ [key: string]: boolean }>({
    hero: true,
    featured: true,
  });
  const [mutedState, setMutedState] = useState<{ [key: string]: boolean }>({
    hero: true,
    featured: true,
  });

  // Edit modal / inline edit state
  const [editingSection, setEditingSection] = useState<HomepageVideoItem | null>(null);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // File input refs
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});

  const fetchVideos = async () => {
    setIsLoading(true);
    try {
      const res = await homepageVideosApi.list();
      if (res.data?.videos && res.data.videos.length > 0) {
        setVideos(res.data.videos);
      }
    } catch (err) {
      console.warn("Could not fetch remote videos, using fallback:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleVideoFileChange = async (section: HomepageVideoItem, file: File) => {
    if (!file) return;

    // Validate type
    const validExtensions = [".mp4", ".webm", ".mov", ".ogg"];
    const fileExt = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExtensions.includes(fileExt) && !file.type.startsWith("video/")) {
      setFeedback({
        type: "error",
        message: `Invalid file format (${file.type || fileExt}). Please upload an MP4, WebM, or MOV video file.`,
      });
      return;
    }

    // Validate size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      setFeedback({
        type: "error",
        message: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)}MB). Maximum allowed video size is 100MB.`,
      });
      return;
    }

    setActiveUploadKey(section.sectionKey);
    setUploadProgress(20);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("video", file);
      formData.append("sectionKey", section.sectionKey);
      formData.append("title", section.title);
      if (section.subtitle) formData.append("subtitle", section.subtitle);
      if (section.description) formData.append("description", section.description);

      setUploadProgress(50);
      const res = await homepageVideosApi.update(section.id || section.sectionKey, formData);
      setUploadProgress(100);

      const updated = res.data?.video;
      if (updated) {
        setVideos((prev) =>
          prev.map((v) => (v.sectionKey === section.sectionKey || v.id === section.id ? updated : v))
        );
      } else {
        await fetchVideos();
      }

      setFeedback({
        type: "success",
        message: `Successfully uploaded and updated video for "${section.title}"! File saved to server uploads/ folder.`,
      });

      // Reload player
      setTimeout(() => {
        const vidElem = videoRefs.current[section.sectionKey];
        if (vidElem) {
          vidElem.load();
          vidElem.play().catch(() => {});
        }
      }, 300);
    } catch (err) {
      setFeedback({
        type: "error",
        message: `Upload failed: ${getApiError(err)}`,
      });
    } finally {
      setActiveUploadKey(null);
      setUploadProgress(0);
    }
  };

  const handleSaveMetadata = async (section: HomepageVideoItem) => {
    setSavingKey(section.sectionKey);
    setFeedback(null);
    try {
      const res = await homepageVideosApi.update(section.id || section.sectionKey, {
        title: section.title,
        subtitle: section.subtitle,
        description: section.description,
        videoUrl: section.videoUrl,
        isActive: section.isActive ? 1 : 0,
      });

      if (res.data?.video) {
        setVideos((prev) =>
          prev.map((v) => (v.sectionKey === section.sectionKey || v.id === section.id ? res.data.video : v))
        );
      }

      setEditingSection(null);
      setFeedback({
        type: "success",
        message: `Saved changes for "${section.title}".`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: `Failed to save: ${getApiError(err)}`,
      });
    } finally {
      setSavingKey(null);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all homepage videos back to default /hero1.mp4 and /hero2.mp4?")) return;
    setIsLoading(true);
    try {
      await homepageVideosApi.reset();
      await fetchVideos();
      setFeedback({
        type: "success",
        message: "Homepage videos reset to default /hero1.mp4 and /hero2.mp4.",
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: `Reset failed: ${getApiError(err)}`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlay = (key: string) => {
    const vid = videoRefs.current[key];
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
      setPlayingState((prev) => ({ ...prev, [key]: true }));
    } else {
      vid.pause();
      setPlayingState((prev) => ({ ...prev, [key]: false }));
    }
  };

  const toggleMute = (key: string) => {
    const vid = videoRefs.current[key];
    if (!vid) return;
    vid.muted = !vid.muted;
    setMutedState((prev) => ({ ...prev, [key]: vid.muted }));
  };

  return (
    <div className="space-y-8">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Video className="w-5 h-5 text-neutral-300" />
            <h2 className="text-xl font-serif tracking-wider uppercase text-white font-medium">
              Homepage Video Manager
            </h2>
          </div>
          <p className="text-xs text-neutral-400 max-w-2xl font-light">
            Manage, upload, or replace videos featured across the homepage sections. Click any video card to select and upload a new MP4/WebM video saved directly to the server&apos;s <code className="text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded">uploads/</code> folder.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={fetchVideos}
            disabled={isLoading}
            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs rounded transition-colors flex items-center space-x-1.5"
            title="Refresh videos from server"
          >
            <RefreshCw size={13} className={isLoading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleReset}
            className="px-3 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-red-400 border border-neutral-700 text-xs rounded transition-colors"
          >
            Reset Defaults
          </button>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs tracking-wider uppercase font-medium rounded transition-colors flex items-center space-x-1.5 shadow"
          >
            <span>Live Home</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </div>

      {/* Feedback Toast Banner */}
      {feedback && (
        <div
          className={`p-4 rounded border flex items-start justify-between text-xs transition-all duration-300 ${
            feedback.type === "success"
              ? "bg-emerald-950/40 border-emerald-800/80 text-emerald-200"
              : "bg-red-950/40 border-red-800/80 text-red-200"
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === "success" ? (
              <CheckCircle size={16} className="text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle size={16} className="text-red-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-neutral-400 hover:text-white text-xs ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Info Notice */}
      <div className="bg-neutral-900/60 border border-neutral-800 p-4 rounded-xs flex items-start space-x-3 text-xs text-neutral-400">
        <Info size={16} className="text-neutral-300 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-neutral-200 block mb-0.5">
            Click-to-Change Feature Enabled
          </span>
          Click on any video display box below to instantly open the file selector and replace the current video. Files are permanently saved into the Hostinger server <span className="text-neutral-200 font-mono">uploads/videos/</span> directory.
        </div>
      </div>

      {/* Video Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {videos.map((section) => {
          const isUploading = activeUploadKey === section.sectionKey;
          const isHero = section.sectionKey === "hero";

          return (
            <div
              key={section.sectionKey || section.id}
              className="bg-neutral-900/80 border border-neutral-800 rounded-sm overflow-hidden flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-neutral-700"
            >
              {/* Section Header with Title */}
              <div className="p-5 border-b border-neutral-800 bg-neutral-900/40 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono tracking-[0.25em] uppercase text-neutral-400 bg-neutral-800 px-2 py-0.5 rounded">
                      {isHero ? "HERO BANNER" : "EDITORIAL STORY"}
                    </span>
                    <span className="text-[10px] font-sans text-emerald-400 font-medium flex items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1 animate-pulse" />
                      Active
                    </span>
                  </div>

                  {/* Section Title */}
                  <h3 className="text-lg font-serif tracking-wider uppercase text-white font-medium">
                    {section.title}
                  </h3>

                  {section.subtitle && (
                    <p className="text-xs text-neutral-400 font-light font-sans">
                      {section.subtitle}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => setEditingSection({ ...section })}
                  className="p-1.5 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded transition-colors"
                  title="Edit title and details"
                >
                  <Edit2 size={15} />
                </button>
              </div>

              {/* Video Preview Container with Click-to-Change */}
              <div className="p-5 flex-1 flex flex-col justify-center">
                <div className="relative group w-full overflow-hidden rounded bg-black border border-neutral-800 flex items-center justify-center">
                  
                  {/* Hidden native file input for this section */}
                  <input
                    ref={(el) => {
                      fileInputRefs.current[section.sectionKey] = el;
                    }}
                    type="file"
                    accept="video/mp4,video/webm,video/ogg,video/quicktime"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoFileChange(section, file);
                      // reset input value so re-selecting the same file works
                      e.target.value = "";
                    }}
                  />

                  {/* Video Player */}
                  <div
                    className={`w-full relative flex items-center justify-center cursor-pointer ${
                      isHero ? "aspect-video" : "aspect-[3/4] max-h-[460px]"
                    }`}
                    onClick={() => {
                      // Trigger file chooser when video is clicked
                      fileInputRefs.current[section.sectionKey]?.click();
                    }}
                  >
                    <video
                      ref={(el) => {
                        videoRefs.current[section.sectionKey] = el;
                      }}
                      key={section.videoUrl}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted={mutedState[section.sectionKey] ?? true}
                      playsInline
                    >
                      <source src={section.videoUrl} type="video/mp4" />
                      Your browser does not support HTML5 video.
                    </video>

                    {/* Dark Vignette Overlay */}
                    <div className="absolute inset-0 bg-black/30 pointer-events-none group-hover:bg-black/50 transition-colors" />

                    {/* Click To Change Overlay Badge (Shows on hover) */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none bg-black/40 backdrop-blur-[2px]">
                      <div className="w-14 h-14 rounded-full bg-white/20 border border-white/60 flex items-center justify-center text-white mb-2 shadow-2xl transform group-hover:scale-110 transition-transform">
                        <Upload size={22} className="text-white" />
                      </div>
                      <span className="text-xs uppercase font-sans tracking-[0.2em] font-semibold text-white bg-black/70 px-3 py-1 rounded">
                        Click to Change Video
                      </span>
                      <span className="text-[10px] text-neutral-300 tracking-wider mt-1 font-mono">
                        MP4, WebM, MOV up to 100MB
                      </span>
                    </div>

                    {/* Uploading Spinner / Progress Overlay */}
                    {isUploading && (
                      <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center text-white z-20 pointer-events-auto">
                        <RefreshCw size={28} className="animate-spin text-white mb-3" />
                        <span className="text-xs font-semibold uppercase tracking-wider mb-2">
                          Uploading & Saving to uploads/...
                        </span>
                        <div className="w-48 bg-neutral-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-white h-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Player Controls Bar (Bottom) */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-3 py-1.5 bg-black/70 backdrop-blur-md rounded text-neutral-300 text-xs pointer-events-auto">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          togglePlay(section.sectionKey);
                        }}
                        className="hover:text-white transition-colors"
                        title="Play / Pause"
                      >
                        {playingState[section.sectionKey] ? <Pause size={14} /> : <Play size={14} />}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMute(section.sectionKey);
                        }}
                        className="hover:text-white transition-colors"
                        title="Mute / Unmute"
                      >
                        {mutedState[section.sectionKey] ? <VolumeX size={14} /> : <Volume2 size={14} />}
                      </button>
                    </div>

                    <span className="text-[11px] font-mono text-neutral-400 truncate max-w-[200px]" title={section.videoUrl}>
                      {section.videoUrl.split("/").pop()}
                    </span>
                  </div>
                </div>

                {/* Section Description */}
                {section.description && (
                  <p className="text-[11px] text-neutral-400 mt-3 font-light leading-relaxed">
                    {section.description}
                  </p>
                )}
              </div>

              {/* Bottom Action Footer */}
              <div className="p-4 bg-neutral-900/90 border-t border-neutral-800 flex items-center justify-between gap-3">
                <div className="text-[11px] text-neutral-400 truncate max-w-[220px]">
                  <span className="text-neutral-500 mr-1">Path:</span>
                  <span className="font-mono text-neutral-300">{section.videoUrl}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => fileInputRefs.current[section.sectionKey]?.click()}
                    disabled={isUploading}
                    className="px-3.5 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-white text-xs rounded transition-colors flex items-center space-x-1.5 shadow-sm"
                  >
                    <Upload size={12} />
                    <span>Upload Video</span>
                  </button>

                  <button
                    onClick={() => setEditingSection({ ...section })}
                    className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 text-xs rounded transition-colors"
                  >
                    Settings
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded max-w-lg w-full p-6 space-y-5 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center space-x-2">
                <Edit2 size={16} className="text-neutral-300" />
                <h3 className="text-sm font-serif uppercase tracking-wider font-semibold">
                  Edit Section Details
                </h3>
              </div>
              <button
                onClick={() => setEditingSection(null)}
                className="text-neutral-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] mb-1">
                  Section Title (Displays on Homepage)
                </label>
                <input
                  type="text"
                  value={editingSection.title}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, title: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-white font-serif tracking-wider"
                  placeholder="e.g. Hero Background Video"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] mb-1">
                  Subtitle / Placement
                </label>
                <input
                  type="text"
                  value={editingSection.subtitle || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, subtitle: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  placeholder="e.g. Autumn / Winter 2026 Collection"
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] mb-1">
                  Video URL (Or Upload above)
                </label>
                <input
                  type="text"
                  value={editingSection.videoUrl}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, videoUrl: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-white font-mono text-[11px]"
                  placeholder="e.g. /hero1.mp4 or /api/uploads/videos/..."
                />
              </div>

              <div>
                <label className="block text-neutral-400 uppercase tracking-wider text-[10px] mb-1">
                  Description / Notes
                </label>
                <textarea
                  rows={3}
                  value={editingSection.description || ""}
                  onChange={(e) =>
                    setEditingSection({ ...editingSection, description: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-700 rounded px-3 py-2 text-white focus:outline-none focus:border-white"
                  placeholder="Optional notes or details about this video section..."
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-neutral-800">
              <button
                onClick={() => setEditingSection(null)}
                className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs rounded transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSaveMetadata(editingSection)}
                disabled={savingKey === editingSection.sectionKey}
                className="px-5 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold uppercase tracking-wider rounded transition-colors flex items-center space-x-1.5 shadow"
              >
                {savingKey === editingSection.sectionKey ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
