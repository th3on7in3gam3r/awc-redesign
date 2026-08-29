// YouTube Data API v3 Service for Anointed Worship Center

interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    thumbnail: string;
    publishedAt: string;
    viewCount?: string;
    duration?: string;
    isLive?: boolean;
    videoUrl: string;
}

interface LiveStreamInfo {
    isLive: boolean;
    videoId?: string;
    title?: string;
    thumbnail?: string;
    viewerCount?: string;
    scheduledStartTime?: string;
}

// Cache configuration
const CACHE_DURATION = {
    VIDEOS: 5 * 60 * 1000, // 5 minutes
    LIVE: 60 * 1000, // 1 minute
};

let videosCache: { data: YouTubeVideo[]; timestamp: number } | null = null;
let liveCache: { data: LiveStreamInfo; timestamp: number } | null = null;

// YouTube API configuration
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID || 'UCkWQ0vGh7eKPXSQddo9fGRw'; // Default to AWC channel

class YouTubeService {
    private baseUrl = 'https://www.googleapis.com/youtube/v3';

    /**
     * Check if the channel is currently live streaming
     */
    async checkLiveStream(): Promise<LiveStreamInfo> {
        // Check cache first
        if (liveCache && Date.now() - liveCache.timestamp < CACHE_DURATION.LIVE) {
            return liveCache.data;
        }

        if (!API_KEY) {
            console.warn('YouTube API key not configured');
            return { isLive: false };
        }

        try {
            // Search for live broadcasts on the channel
            const searchUrl = `${this.baseUrl}/search?part=snippet&channelId=${CHANNEL_ID}&eventType=live&type=video&key=${API_KEY}`;
            const response = await fetch(searchUrl);

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const liveVideo = data.items[0];

                // Get additional details including viewer count
                const videoDetails = await this.getVideoDetails(liveVideo.id.videoId);

                const liveInfo: LiveStreamInfo = {
                    isLive: true,
                    videoId: liveVideo.id.videoId,
                    title: liveVideo.snippet.title,
                    thumbnail: liveVideo.snippet.thumbnails.maxres?.url ||
                        liveVideo.snippet.thumbnails.high?.url ||
                        liveVideo.snippet.thumbnails.medium.url,
                    viewerCount: videoDetails?.viewCount,
                };

                // Cache the result
                liveCache = { data: liveInfo, timestamp: Date.now() };
                return liveInfo;
            }

            // Check for upcoming scheduled streams
            const upcomingUrl = `${this.baseUrl}/search?part=snippet&channelId=${CHANNEL_ID}&eventType=upcoming&type=video&order=date&maxResults=1&key=${API_KEY}`;
            const upcomingResponse = await fetch(upcomingUrl);

            if (upcomingResponse.ok) {
                const upcomingData = await upcomingResponse.json();
                if (upcomingData.items && upcomingData.items.length > 0) {
                    const upcomingVideo = upcomingData.items[0];
                    const liveInfo: LiveStreamInfo = {
                        isLive: false,
                        scheduledStartTime: upcomingVideo.snippet.publishedAt,
                        title: upcomingVideo.snippet.title,
                    };
                    liveCache = { data: liveInfo, timestamp: Date.now() };
                    return liveInfo;
                }
            }

            const notLiveInfo: LiveStreamInfo = { isLive: false };
            liveCache = { data: notLiveInfo, timestamp: Date.now() };
            return notLiveInfo;

        } catch (error) {
            console.error('Error checking live stream:', error);
            return { isLive: false };
        }
    }

    /**
     * Get detailed information about a specific video
     */
    private async getVideoDetails(videoId: string): Promise<YouTubeVideo | null> {
        if (!API_KEY) return null;

        try {
            const url = `${this.baseUrl}/videos?part=snippet,contentDetails,statistics,liveStreamingDetails&id=${videoId}&key=${API_KEY}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();

            if (data.items && data.items.length > 0) {
                const video = data.items[0];
                return {
                    id: video.id,
                    title: video.snippet.title,
                    description: video.snippet.description,
                    thumbnail: video.snippet.thumbnails.maxresdefault?.url ||
                        video.snippet.thumbnails.high?.url ||
                        video.snippet.thumbnails.medium.url,
                    publishedAt: video.snippet.publishedAt,
                    viewCount: video.statistics?.viewCount,
                    duration: this.formatDuration(video.contentDetails.duration),
                    isLive: video.snippet.liveBroadcastContent === 'live',
                    videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
                };
            }

            return null;
        } catch (error) {
            console.error('Error fetching video details:', error);
            return null;
        }
    }

    /**
     * Fetch latest sermon videos from the channel
     */
    async getLatestVideos(maxResults: number = 12): Promise<YouTubeVideo[]> {
        // Check cache first
        if (videosCache && Date.now() - videosCache.timestamp < CACHE_DURATION.VIDEOS) {
            return videosCache.data.slice(0, maxResults);
        }

        if (!API_KEY) {
            console.warn('YouTube API key not configured');
            return [];
        }

        try {
            // Get latest uploads from the channel
            const searchUrl = `${this.baseUrl}/search?part=snippet&channelId=${CHANNEL_ID}&order=date&type=video&maxResults=${maxResults}&key=${API_KEY}`;
            const response = await fetch(searchUrl);

            if (!response.ok) {
                throw new Error(`YouTube API error: ${response.status}`);
            }

            const data = await response.json();

            if (!data.items || data.items.length === 0) {
                return [];
            }

            // Get video IDs to fetch additional details
            const videoIds = data.items.map((item: any) => item.id.videoId).join(',');

            // Fetch detailed information for all videos
            const detailsUrl = `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${API_KEY}`;
            const detailsResponse = await fetch(detailsUrl);

            if (!detailsResponse.ok) {
                throw new Error(`YouTube API error: ${detailsResponse.status}`);
            }

            const detailsData = await detailsResponse.json();

            const videos: YouTubeVideo[] = detailsData.items.map((video: any) => ({
                id: video.id,
                title: video.snippet.title,
                description: video.snippet.description,
                thumbnail: video.snippet.thumbnails.maxresdefault?.url ||
                    video.snippet.thumbnails.high?.url ||
                    video.snippet.thumbnails.medium.url,
                publishedAt: video.snippet.publishedAt,
                viewCount: video.statistics?.viewCount,
                duration: this.formatDuration(video.contentDetails.duration),
                videoUrl: `https://www.youtube.com/watch?v=${video.id}`,
            }));

            // Cache the results
            videosCache = { data: videos, timestamp: Date.now() };

            return videos;
        } catch (error) {
            console.error('Error fetching YouTube videos:', error);
            return [];
        }
    }

    /**
     * Format ISO 8601 duration to readable format (e.g., "1:23:45")
     */
    private formatDuration(isoDuration: string): string {
        const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return '';

        const hours = match[1] ? parseInt(match[1]) : 0;
        const minutes = match[2] ? parseInt(match[2]) : 0;
        const seconds = match[3] ? parseInt(match[3]) : 0;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Format view count to readable format (e.g., "1.2K", "3.4M")
     */
    formatViewCount(count?: string): string {
        if (!count) return '';

        const num = parseInt(count);
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toString();
    }

    /**
     * Clear all caches (useful for testing or manual refresh)
     */
    clearCache(): void {
        videosCache = null;
        liveCache = null;
    }
}

export const youtubeService = new YouTubeService();
export type { YouTubeVideo, LiveStreamInfo };
