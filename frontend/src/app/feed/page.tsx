"use client";

import React, { useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useStore } from "@/store/useStore";
import { formatDate } from "@/lib/utils";
import { Image, Megaphone, Calendar as CalendarIcon, Newspaper, Pin, Trophy, Camera } from "lucide-react";

const typeIcons: Record<string, React.ReactNode> = {
  NEWS: <Newspaper className="h-4 w-4" />,
  EVENT: <Trophy className="h-4 w-4" />,
  ANNOUNCEMENT: <Megaphone className="h-4 w-4" />,
  VIDEO: <Camera className="h-4 w-4" />,
  PHOTO: <Image className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  NEWS: 'Новина',
  EVENT: 'Подія',
  ANNOUNCEMENT: 'Оголошення',
  VIDEO: 'Відео',
  PHOTO: 'Фото',
};

export default function FeedPage() {
  const { feed, fetchFeed } = useStore();

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  const pinnedPosts = feed.filter(p => p.isPinned);
  const regularPosts = feed.filter(p => !p.isPinned);

  const filterPosts = (type?: string) => {
    if (!type) return [...pinnedPosts, ...regularPosts];
    return feed.filter(p => p.type === type);
  };

  return (
    <div className="min-h-screen bg-white" data-testid="feed-page">
      <Header title="Стрічка" />
      
      <div className="pt-16 pb-28 px-4 space-y-6">
        <Tabs defaultValue="all" className="pt-4">
          <TabsList className="w-full bg-gray-100 p-1 rounded-xl">
            <TabsTrigger 
              value="all" 
              className="flex-1 data-[state=active]:bg-[#E30613] data-[state=active]:text-white rounded-lg text-sm"
              data-testid="feed-tab-all"
            >
              Усі
            </TabsTrigger>
            <TabsTrigger 
              value="news" 
              className="flex-1 data-[state=active]:bg-[#E30613] data-[state=active]:text-white rounded-lg text-sm"
              data-testid="feed-tab-news"
            >
              Новини
            </TabsTrigger>
            <TabsTrigger 
              value="events" 
              className="flex-1 data-[state=active]:bg-[#E30613] data-[state=active]:text-white rounded-lg text-sm"
              data-testid="feed-tab-events"
            >
              Події
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4 mt-4">
            {filterPosts().length > 0 ? (
              filterPosts().map((post) => (
                <PostCard key={post.id} post={post} />
              ))
            ) : (
              <div className="ataka-card p-8 text-center" data-testid="no-posts">
                <Newspaper className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">Поки що немає публікацій</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="news" className="space-y-4 mt-4">
            {filterPosts('NEWS').map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>

          <TabsContent value="events" className="space-y-4 mt-4">
            {filterPosts('EVENT').map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: any }) {
  return (
    <div 
      className={`ataka-card overflow-hidden ${post.isPinned ? 'border-l-4 border-l-[#E30613]' : ''}`}
      data-testid={`post-card-${post.id}`}
    >
      {post.mediaUrl && (
        <div className="relative h-48 overflow-hidden">
          <img 
            src={post.mediaUrl} 
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          {post.isPinned && (
            <div className="shrink-0 flex items-center gap-1">
              <Pin className="h-4 w-4 text-[#E30613]" />
            </div>
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge 
                variant="secondary" 
                className={`text-xs ${post.isPinned ? 'bg-[#E30613]/10 text-[#E30613]' : 'bg-gray-100'}`}
              >
                {typeIcons[post.type]}
                <span className="ml-1">{typeLabels[post.type]}</span>
              </Badge>
              {post.visibility === 'GROUP' && (
                <Badge variant="outline" className="text-xs border-[#E30613]/30 text-[#E30613]">
                  Моя група
                </Badge>
              )}
            </div>
            <h3 className="font-heading font-bold text-[#0F0F10] mb-2">{post.title}</h3>
            {post.body && (
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                {post.body}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
          {post.author && (
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gray-100">
                  {post.author.firstName[0]}
                </AvatarFallback>
              </Avatar>
              <span>{post.author.firstName}</span>
            </div>
          )}
          <span>{formatDate(post.publishedAt, 'long')}</span>
        </div>
      </div>
    </div>
  );
}
