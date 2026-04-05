import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import FloatingPanel from '@/components/ui/FloatingPanel';
import GlowButton from '@/components/ui/GlowButton';
import HexBadge from '@/components/ui/HexBadge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { motion } from 'framer-motion';
import { AppSettings } from '@/api/heruClient'

import {
  Heart, MessageCircle, Share2, User, Image, Video, Link as LinkIcon, 
  Send, MoreHorizontal, Bookmark, Gamepad2, Filter
} from 'lucide-react';

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600',
  'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=600',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600',
  'https://images.unsplash.com/photo-1493711662062-fa541f7f55a4?w=600',
  'https://images.unsplash.com/photo-1560253023-3ec5d502959f?w=600',
];

export default function SocialFeed({ 
  posts = [], 
  spaces = [],
  user, 
  profile,
  onLike,
  onComment 
}) {
  const [showPostModal, setShowPostModal] = useState(false);
  const [newPost, setNewPost] = useState({ content: '', media_type: 'none', media_url: '' });
  const [selectedSpaces, setSelectedSpaces] = useState([]);
  const [filterSpaces, setFilterSpaces] = useState([]);
  const [commentInputs, setCommentInputs] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const queryClient = useQueryClient();

  const joinedSpaces = spaces.filter(s => s.members?.includes(user?.id));

  const createPostMutation = useMutation({
    mutationFn: async () => {
      for (const spaceId of selectedSpaces) {
        const space = spaces.find(s => s.id === spaceId);
        if (space) {
          const posts = space.posts || [];
          posts.unshift({
            id: Date.now().toString() + spaceId,
            author_id: user?.id,
            author_name: profile?.username || user?.full_name,
            author_avatar: profile?.avatar,
            content: newPost.content,
            media_type: newPost.media_type,
            media_url: newPost.media_url || (newPost.media_type === 'image' ? PLACEHOLDER_IMAGES[Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)] : ''),
            likes: [],
            comments: [],
            timestamp: new Date().toISOString()
          });
          await AppSettings.update(spaceId, { posts });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['spaces-public']);
      queryClient.invalidateQueries(['feed-posts']);
      setShowPostModal(false);
      setNewPost({ content: '', media_type: 'none', media_url: '' });
      setSelectedSpaces([]);
    }
  });

  const filteredPosts = filterSpaces.length > 0
    ? posts.filter(p => filterSpaces.includes(p.spaceId))
    : posts;

  const toggleSpaceSelection = (spaceId) => {
    setSelectedSpaces(prev => 
      prev.includes(spaceId) 
        ? prev.filter(id => id !== spaceId)
        : [...prev, spaceId]
    );
  };

  const toggleFilterSpace = (spaceId) => {
    setFilterSpaces(prev =>
      prev.includes(spaceId)
        ? prev.filter(id => id !== spaceId)
        : [...prev, spaceId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Create Post Card */}
      <FloatingPanel className="p-4">
        <div 
          className="flex items-center gap-4 cursor-pointer"
          onClick={() => setShowPostModal(true)}
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden">
            {profile?.avatar ? (
              <img src={profile.avatar} className="w-full h-full object-cover" alt="" />
            ) : (
              <User className="w-6 h-6 text-red-500" />
            )}
          </div>
          <div className="flex-1 bg-zinc-800/50 rounded-full px-5 py-3 text-gray-400 hover:bg-zinc-800 transition-colors">
            What's happening in the gaming world?
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-800">
          <button 
            onClick={() => { setNewPost({ ...newPost, media_type: 'image' }); setShowPostModal(true); }}
            className="flex items-center gap-2 text-green-400 hover:bg-green-500/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Image className="w-5 h-5" /> Photo
          </button>
          <button 
            onClick={() => { setNewPost({ ...newPost, media_type: 'video' }); setShowPostModal(true); }}
            className="flex items-center gap-2 text-blue-400 hover:bg-blue-500/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Video className="w-5 h-5" /> Video
          </button>
          <button 
            onClick={() => { setNewPost({ ...newPost, media_type: 'link' }); setShowPostModal(true); }}
            className="flex items-center gap-2 text-purple-400 hover:bg-purple-500/10 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LinkIcon className="w-5 h-5" /> Link
          </button>
        </div>
      </FloatingPanel>

      {/* Filter */}
      {joinedSpaces.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-gray-500 text-sm flex items-center gap-2">
            <Filter className="w-4 h-4" /> Filter:
          </span>
          <button
            onClick={() => setFilterSpaces([])}
            className={`px-3 py-1 rounded-full text-xs ${
              filterSpaces.length === 0 ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-gray-400'
            }`}
          >
            All Spaces
          </button>
          {joinedSpaces.slice(0, 5).map(space => (
            <button
              key={space.id}
              onClick={() => toggleFilterSpace(space.id)}
              className={`px-3 py-1 rounded-full text-xs ${
                filterSpaces.includes(space.id) ? 'bg-red-500/20 text-red-400' : 'bg-zinc-800 text-gray-400'
              }`}
            >
              {space.name}
            </button>
          ))}
        </div>
      )}

      {/* Posts */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredPosts.slice(0, 8).map((post, i) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <FloatingPanel className="overflow-hidden">
              {/* Post Header */}
              <div className="flex items-center gap-3 p-4">
                <Link to={`/gamer/${post.author_id}`}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600/30 to-zinc-800 flex items-center justify-center overflow-hidden">
                    {post.author_avatar ? (
                      <img src={post.author_avatar} className="w-full h-full object-cover" alt="" />
                    ) : (
                      <User className="w-6 h-6 text-red-500" />
                    )}
                  </div>
                </Link>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Link to={`/gamer/${post.author_id}`}>
                      <p className="text-white font-bold hover:text-red-400">{post.author_name}</p>
                    </Link>
                    <span className="text-gray-600">•</span>
                    <Link to={`/teams/${post.spaceId}`}>
                      <span className="text-red-400 text-sm hover:underline">{post.spaceName}</span>
                    </Link>
                  </div>
                  <p className="text-gray-500 text-xs">
                    {new Date(post.timestamp).toLocaleDateString()} at {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="px-4 pb-3">
                <p className="text-gray-200 leading-relaxed">{post.content}</p>
              </div>

              {/* Media */}
              {post.media_type !== 'none' && post.media_url && (
                <div className="bg-zinc-800">
                  {post.media_type === 'image' && (
                    <img src={post.media_url} alt="" className="w-full max-h-96 object-cover" />
                  )}
                  {post.media_type === 'video' && (
                    <video src={post.media_url} controls className="w-full max-h-96" />
                  )}
                  {post.media_type === 'link' && (
                    <a 
                      href={post.media_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-4 text-blue-400 hover:text-blue-300"
                    >
                      <LinkIcon className="w-4 h-4 inline mr-2" />
                      {post.media_url}
                    </a>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between p-4 border-t border-zinc-800">
                <button
                  onClick={() => onLike?.(post.spaceId, post.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                    post.likes?.includes(user?.id) 
                      ? 'text-red-400 bg-red-500/10' 
                      : 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${post.likes?.includes(user?.id) ? 'fill-current' : ''}`} />
                  <span className="font-medium">{post.likes?.length || 0}</span>
                </button>
                <button
                  onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span className="font-medium">{post.comments?.length || 0}</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-zinc-800 transition-colors">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Comments Section */}
              {expandedComments[post.id] && (
                <div className="border-t border-zinc-800 p-4">
                  {post.comments?.slice(0, 3).map((comment) => (
                    <div key={comment.id} className="flex gap-3 mb-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                        <User className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="flex-1 bg-zinc-800/50 rounded-xl p-3">
                        <Link to={`/gamer/${comment.author_id}`}>
                          <p className="text-white text-sm font-medium hover:text-red-400">{comment.author_name}</p>
                        </Link>
                        <p className="text-gray-400 text-sm">{comment.content}</p>
                      </div>
                    </div>
                  ))}

                  <div className="flex gap-2 mt-3">
                    <Input
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Write a comment..."
                      className="bg-zinc-800 border-zinc-700 text-white text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && commentInputs[post.id]) {
                          onComment?.(post.spaceId, post.id, commentInputs[post.id]);
                          setCommentInputs({ ...commentInputs, [post.id]: '' });
                        }
                      }}
                    />
                    <GlowButton 
                      size="sm"
                      onClick={() => {
                        if (commentInputs[post.id]) {
                          onComment?.(post.spaceId, post.id, commentInputs[post.id]);
                          setCommentInputs({ ...commentInputs, [post.id]: '' });
                        }
                      }}
                    >
                      <Send className="w-4 h-4" />
                    </GlowButton>
                  </div>
                </div>
              )}
            </FloatingPanel>
          </motion.div>
        ))}
      </div>

      {filteredPosts.length === 0 && (
        <FloatingPanel className="p-12 text-center">
          <Gamepad2 className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl text-white font-bold mb-2">No Posts Yet</h3>
          <p className="text-gray-400 mb-4">Join some spaces to see posts in your feed!</p>
          <Link to={'/spaces'}>
            <GlowButton>Explore Spaces</GlowButton>
          </Link>
        </FloatingPanel>
      )}

      {/* Create Post Modal */}
      <Dialog open={showPostModal} onOpenChange={setShowPostModal}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Textarea
              value={newPost.content}
              onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
              placeholder="What's on your mind?"
              className="bg-zinc-800 border-zinc-700 text-white min-h-[120px]"
            />

            <div>
              <label className="text-sm text-gray-400 block mb-2">Add Media (optional)</label>
              <Select 
                value={newPost.media_type} 
                onValueChange={(v) => setNewPost({ ...newPost, media_type: v })}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  <SelectItem value="none">No media</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newPost.media_type !== 'none' && (
              <Input
                value={newPost.media_url}
                onChange={(e) => setNewPost({ ...newPost, media_url: e.target.value })}
                placeholder={newPost.media_type === 'image' ? 'Image URL (leave empty for random gaming image)' : `Enter ${newPost.media_type} URL`}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            )}

            <div>
              <label className="text-sm text-gray-400 block mb-2">Share to Spaces *</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {joinedSpaces.map(space => (
                  <label key={space.id} className="flex items-center gap-3 p-2 hover:bg-zinc-800 rounded-lg cursor-pointer">
                    <Checkbox
                      checked={selectedSpaces.includes(space.id)}
                      onCheckedChange={() => toggleSpaceSelection(space.id)}
                    />
                    <span className="text-white">{space.name}</span>
                  </label>
                ))}
                {joinedSpaces.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Join a space first to post</p>
                )}
              </div>
            </div>

            <GlowButton 
              className="w-full"
              onClick={() => createPostMutation.mutate()}
              disabled={!newPost.content || selectedSpaces.length === 0}
            >
              <Send className="w-4 h-4" /> Post
            </GlowButton>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}