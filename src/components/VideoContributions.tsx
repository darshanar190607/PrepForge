import React, { useState } from 'react';
import { Contribution } from '../types';
import { 
  Play, 
  Plus, 
  Search, 
  ExternalLink, 
  Video, 
  User, 
  Calendar, 
  Sparkles,
  CheckCircle,
  X,
  FileVideo
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VideoContributionsProps {
  contributions: Contribution[];
  currentUserId: string;
  onPostContribution: (contrib: {
    topic: string;
    title: string;
    videoUrl: string;
    description: string;
  }) => Promise<void>;
}

const COMMON_TOPICS = [
  'Arrays & Hashing',
  'Two Pointers',
  'Sliding Window',
  'Stack',
  'Binary Search',
  'Linked List',
  'Trees',
  'Tries',
  'Heap / Priority Queue',
  'Backtracking',
  'Graphs',
  'Advanced Graphs',
  'Dynamic Programming',
  'Greedy',
  'Intervals',
  'Math & Geometry',
  'Bit Manipulation'
];

export default function VideoContributions({
  contributions,
  currentUserId,
  onPostContribution
}: VideoContributionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Form State
  const [topic, setTopic] = useState('Arrays & Hashing');
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');

  // Filter contributions
  const filteredContribs = contributions.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (c.description && c.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesTopic = selectedTopicFilter === 'All' || c.topic === selectedTopicFilter;
    return matchesSearch && matchesTopic;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setSubmitError('Title and Video URL are strictly required.');
      return;
    }

    // Basic URL validation
    if (!videoUrl.startsWith('http://') && !videoUrl.startsWith('https://')) {
      setSubmitError('Please enter a valid website URL (starting with http:// or https://).');
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError('');
      await onPostContribution({ topic, title, videoUrl, description });
      
      // Reset form
      setTitle('');
      setVideoUrl('');
      setDescription('');
      setShowUploadModal(false);
      
      // Toast notification
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit contribution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6" id="video-contributions-root">
      {/* Header and Action Button */}
      <div className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E2E2E2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-display font-bold text-[#111111] flex items-center gap-2">
            <Video className="text-[#5C6FFF]" size={22} />
            Peer Learning Video Vault
          </h2>
          <p className="text-[#888888] text-xs mt-1">
            Voluntary video explanations contributed by cohort members. Synced directly to personal GitHub branches. Excluded from leaderboard points.
          </p>
        </div>
        <button
          onClick={() => {
            setSubmitError('');
            setShowUploadModal(true);
          }}
          className="bg-[#5C6FFF] hover:bg-[#5C6FFF]/90 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer self-start sm:self-center shadow-sm"
          id="open-upload-modal-btn"
        >
          <Plus size={15} />
          <span>Contribute Video</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E2E2E2] shadow-sm flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 text-[#888888]" size={16} />
          <input
            type="text"
            placeholder="Search videos by title, contributor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-[#111111] pl-9 pr-4 py-2 rounded-lg text-xs outline-none placeholder-slate-400 focus:border-[#5C6FFF] focus:bg-white transition"
            id="search-contrib-input"
          />
        </div>

        <div className="w-full md:w-60">
          <select
            value={selectedTopicFilter}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-slate-700 py-2 px-3 rounded-lg text-xs outline-none focus:border-[#5C6FFF] cursor-pointer focus:bg-white transition"
            id="topic-filter-contrib"
          >
            <option value="All">All Topics</option>
            {COMMON_TOPICS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Contributions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="contributions-grid">
        {filteredContribs.length === 0 ? (
          <div className="col-span-full bg-[#FFFFFF] border border-[#E2E2E2] rounded-xl p-12 text-center text-[#888888]" id="no-contribs-fallback">
            <FileVideo size={40} className="text-slate-350 mx-auto mb-3" />
            <h3 className="text-[#111111] font-semibold text-sm">No Video Explanations</h3>
            <p className="text-xs text-[#888888] mt-1 max-w-sm mx-auto">
              Be the first to upload a video explanation! Click "Contribute Video" above to document your solution.
            </p>
          </div>
        ) : (
          filteredContribs.map(contrib => (
            <div 
              key={contrib.id} 
              className="bg-[#FFFFFF] border border-[#E2E2E2] rounded-lg p-5 flex flex-col justify-between hover:shadow-md transition duration-200"
              id={`contrib-card-${contrib.id}`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-3">
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 text-[9px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                    {contrib.topic}
                  </span>
                  <span className="text-[9px] text-[#888888] font-mono flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(contrib.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-slate-800 font-bold text-sm leading-snug line-clamp-1 mb-2">{contrib.title}</h3>
                
                {contrib.description ? (
                  <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 bg-slate-50/50 p-2.5 rounded border border-slate-100 mb-4">
                    {contrib.description}
                  </p>
                ) : (
                  <div className="h-6" />
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#111111] text-[#F5F5F5] rounded-full flex items-center justify-center font-bold text-[10px] font-mono border border-slate-800">
                    {contrib.userName.charAt(0)}
                  </div>
                  <span className="text-slate-700 text-xs font-semibold">{contrib.userName}</span>
                </div>

                <a
                  href={contrib.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-[#F7F7F7] hover:bg-[#E2E2E2]/60 text-[#111111] hover:text-[#5C6FFF] border border-[#E2E2E2] p-1.5 rounded-lg transition flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                  title="Watch Video"
                >
                  <Play size={12} className="fill-[#111111] hover:fill-[#5C6FFF]" />
                  <span>Watch</span>
                  <ExternalLink size={10} className="text-[#888888]" />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Video Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
              id="upload-modal-overlay"
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-200 rounded-xl max-w-md w-full p-6 shadow-xl relative z-10 text-slate-800"
              id="upload-modal-box"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-bold text-slate-850 flex items-center gap-2">
                  <Video className="text-[#5C6FFF]" size={18} />
                  Contribute Video Explanation
                </h3>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="text-slate-400 hover:text-slate-650 p-1"
                >
                  <X size={18} />
                </button>
              </div>

              {submitError && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-[#EF4444] text-xs font-mono rounded">
                  ⚠️ {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block font-mono">Select Topic</label>
                  <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-slate-800 py-2 px-3 rounded text-xs outline-none focus:border-[#5C6FFF] focus:bg-white transition"
                    id="contrib-form-topic"
                  >
                    {COMMON_TOPICS.map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block font-mono">Explanation Title</label>
                  <input
                    type="text"
                    placeholder="e.g., Two Sum - Linear Hash Map Python Solution"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-slate-800 px-3 py-2 text-xs rounded outline-none focus:border-[#5C6FFF] focus:bg-white transition"
                    id="contrib-form-title"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block font-mono">Video Link (YouTube, Drive, etc.)</label>
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-slate-800 px-3 py-2 text-xs rounded outline-none focus:border-[#5C6FFF] focus:bg-white transition"
                    id="contrib-form-videourl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#111111] uppercase tracking-wider block font-mono">Short Description / Approach Notes</label>
                  <textarea
                    placeholder="Briefly explain what you cover in the video (e.g., sorting, sliding window steps, space optimization)..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-[#F7F7F7] border border-[#E2E2E2] text-slate-800 p-2.5 text-xs rounded outline-none focus:border-[#5C6FFF] focus:bg-white transition"
                    rows={3}
                    id="contrib-form-desc"
                  />
                </div>

                <div className="bg-indigo-50 p-3.5 rounded border border-indigo-100 flex items-start gap-2 text-slate-800 mb-2">
                  <Sparkles size={14} className="text-indigo-600 mt-0.5 flex-shrink-0" />
                  <p className="text-[10px] leading-relaxed text-indigo-950">
                    Pushed automatically as a markdown log under <code className="bg-indigo-100 px-1 rounded font-mono font-bold">contributions/</code> in your GitHub branch. <strong>No leaderboard score count added.</strong>
                  </p>
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-4 py-2 text-[#111111] bg-[#F7F7F7] hover:bg-[#E2E2E2]/60 border border-[#E2E2E2] rounded text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !title.trim() || !videoUrl.trim()}
                    className="px-5 py-2 bg-[#5C6FFF] hover:bg-[#5C6FFF]/90 disabled:opacity-50 text-white rounded text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                    id="contrib-form-submit-btn"
                  >
                    {isSubmitting ? 'Syncing to GitHub...' : 'Post Contribution'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Success Toast Notification */}
      <AnimatePresence>
        {showSuccessToast && (
          <div className="fixed bottom-6 right-6 z-50">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="bg-[#22C55E] text-[#FFFFFF] border border-[#22C55E]/20 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 text-xs font-bold font-sans"
              id="contrib-success-toast"
            >
              <CheckCircle size={16} />
              <span>Video explanations updated and pushed to your GitHub branch!</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
