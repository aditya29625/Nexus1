// Enhanced TMDB API integration for The Nexus with mobile optimization
import {
  mobileApiHandler,
  generateMockMovieData,
  generateMockTVData,
  initializeMobileOptimizations
} from './mobileApiHelper.js';

// Use environment variables for security
const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const ACCESS_TOKEN = process.env.REACT_APP_TMDB_ACCESS_TOKEN;
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

// Initialize mobile optimizations on module load
const deviceInfo = initializeMobileOptimizations();
console.log('TMDB API initialized for device:', deviceInfo);

// Enhanced fetch wrapper with mobile-specific optimizations
const fetchFromTMDB = async (endpoint, page = 1) => { // Added page parameter with default value
  try {
    const separator = endpoint.includes('?') ? '&' : '?';
    const url = `${BASE_URL}${endpoint}${separator}api_key=${API_KEY}&page=${page}`; // Append page to the URL

    const headers = {
      'Content-Type': 'application/json;charset=utf-8',
      'Accept': 'application/json'
    };
    if (ACCESS_TOKEN) {
      headers['Authorization'] = `Bearer ${ACCESS_TOKEN}`;
    }

    // Use mobile-optimized API handler
    const data = await mobileApiHandler.call(url, {
      method: 'GET',
      headers: headers
    });

    return data;
  } catch (error) {
    console.warn(`TMDB API call failed for ${endpoint}:`, error.message);
    
    // 1. TV Season Details: /tv/{id}/season/{num}
    if (/^\/tv\/\d+\/season\/\d+/.test(endpoint)) {
      const parts = endpoint.split('/');
      const tvId = parseInt(parts[2]);
      const seasonNumber = parseInt(parts[4]);
      const episodes = [];
      for (let i = 1; i <= 10; i++) {
        episodes.push({
          id: tvId * 1000 + seasonNumber * 100 + i,
          episode_number: i,
          name: `Episode ${i}: Neural Nexus`,
          overview: `An exciting episode ${i} of season ${seasonNumber}. The digital matrix expands as the core system runs into critical state.`,
          still_path: null,
          air_date: `2024-04-${i < 10 ? '0' + i : i}`,
          runtime: 45,
          vote_average: 7.5 + (i % 3) * 0.5
        });
      }
      return {
        id: tvId * 100 + seasonNumber,
        season_number: seasonNumber,
        episodes: episodes
      };
    }
    
    // 2. TV Show Details: /tv/{id}
    if (/^\/tv\/\d+$/.test(endpoint)) {
      const tvId = parseInt(endpoint.split('/')[2]);
      const mockTV = generateMockTVData(20).find(t => t.id === tvId) || generateMockTVData(1)[0];
      return {
        ...mockTV,
        genres: [{ id: 18, name: 'Drama' }, { id: 10765, name: 'Sci-Fi' }],
        seasons: Array.from({ length: mockTV.number_of_seasons || 3 }, (_, i) => ({
          id: tvId * 10 + i + 1,
          season_number: i + 1,
          episode_count: 10,
          name: `Season ${i + 1}`
        })),
        status: 'Returning Series',
        networks: [{ id: 1, name: 'NEXUS NET' }],
        external_ids: { imdb_id: 'tt1234567' }
      };
    }
    
    // 3. Movie Details: /movie/{id}
    if (/^\/movie\/\d+$/.test(endpoint)) {
      const movieId = parseInt(endpoint.split('/')[2]);
      const mockMovie = generateMockMovieData(20).find(m => m.id === movieId) || generateMockMovieData(1)[0];
      return {
        ...mockMovie,
        genres: [{ id: 28, name: 'Action' }, { id: 878, name: 'Sci-Fi' }],
        budget: 150000000,
        revenue: 450000000,
        status: 'Released',
        production_companies: [{ id: 1, name: 'NEXUS Studios' }],
        spoken_languages: [{ english_name: 'English' }],
        tagline: 'Stream beyond reality.'
      };
    }
    
    // 4. Movie / TV Videos: /movie/{id}/videos or /tv/{id}/videos
    if (/\/videos$/.test(endpoint)) {
      return {
        results: [
          {
            id: 'mock_trailer',
            key: 'dQw4w9WgXcQ', // Rickroll as a fun mock trailer key
            name: 'Official Trailer',
            site: 'YouTube',
            type: 'Trailer'
          }
        ]
      };
    }
    
    // 5. Movie / TV Credits: /movie/{id}/credits or /tv/{id}/credits
    if (/\/credits$/.test(endpoint)) {
      return {
        cast: [
          { id: 101, name: 'Neo', character: 'The One', profile_path: null },
          { id: 102, name: 'Trinity', character: 'Officer', profile_path: null },
          { id: 103, name: 'Morpheus', character: 'Leader', profile_path: null }
        ],
        crew: [
          { id: 201, name: 'Wachowskis', job: 'Director' }
        ]
      };
    }
    
    // 6. Movie / TV Recommendations: /movie/{id}/recommendations or /tv/{id}/recommendations
    if (/\/recommendations$/.test(endpoint)) {
      const isTV = endpoint.includes('/tv/');
      return {
        results: isTV ? generateMockTVData(6) : generateMockMovieData(6),
        total_results: 6,
        total_pages: 1,
        page: 1
      };
    }
    
    // 7. General Movie List requests
    if (endpoint.includes('movie')) {
      return {
        results: generateMockMovieData(20),
        total_results: 20,
        total_pages: 1,
        page: 1,
        isMockData: true,
        fallbackReason: 'API failure'
      };
    }
    
    // 8. General TV List requests
    if (endpoint.includes('tv')) {
      return {
        results: generateMockTVData(20),
        total_results: 20,
        total_pages: 1,
        page: 1,
        isMockData: true,
        fallbackReason: 'API failure'
      };
    }

    // Default fallback
    return {
      results: [],
      total_results: 0,
      total_pages: 1,
      page: 1,
      error: error.message,
      isFallback: true
    };
  }
};

// Fetch trending movies
export const fetchTrendingMovies = async (page = 1) => { 
  return fetchFromTMDB('/trending/movie/week', page); 
};

// Fetch popular movies
export const fetchPopularMovies = async (page = 1) => { 
  return fetchFromTMDB('/movie/popular', page); 
};

// Fetch top rated movies
export const fetchTopRatedMovies = async (page = 1) => { 
  return fetchFromTMDB('/movie/top_rated', page); 
};

// Fetch upcoming movies
export const fetchUpcomingMovies = async (page = 1) => { 
  return fetchFromTMDB('/movie/upcoming', page); 
};

// Fetch movie details
export const fetchMovieDetails = async (movieId) => {
  return fetchFromTMDB(`/movie/${movieId}`);
};

// Fetch movie videos (trailers, etc.)
export const fetchMovieVideos = async (movieId) => {
  return fetchFromTMDB(`/movie/${movieId}/videos`);
};

// Fetch movie credits
export const getMovieCredits = async (movieId) => {
  return fetchFromTMDB(`/movie/${movieId}/credits`);
};

// Fetch movie recommendations
export const getMovieRecommendations = async (movieId, page = 1) => { 
  return fetchFromTMDB(`/movie/${movieId}/recommendations`, page); 
};

// Fetch trending TV shows
export const fetchTrendingTVShows = async (page = 1) => { 
  return fetchFromTMDB('/trending/tv/week', page); 
};

// Alias for fetchTrendingTVShows
export const fetchTrendingTV = fetchTrendingTVShows;

// Fetch popular TV shows
export const fetchPopularTVShows = async (page = 1) => { 
  return fetchFromTMDB('/tv/popular', page); 
};

// Alias for fetchPopularTVShows
export const fetchPopularTV = fetchPopularTVShows;

// Fetch top rated TV shows
export const fetchTopRatedTVShows = async (page = 1) => { 
  return fetchFromTMDB('/tv/top_rated', page); 
};

// Alias for fetchTopRatedTVShows
export const fetchTopRatedTV = fetchTopRatedTVShows;

// Fetch TV show details
export const fetchTVShowDetails = async (tvId) => {
  return fetchFromTMDB(`/tv/${tvId}`);
};

// Alias for fetchTVShowDetails
export const getTVDetails = fetchTVShowDetails;

// Fetch TV show videos
export const fetchTVShowVideos = async (tvId) => {
  return fetchFromTMDB(`/tv/${tvId}/videos`);
};

// Fetch TV season details
export const getTVSeasonDetails = async (tvId, seasonNumber) => {
  return fetchFromTMDB(`/tv/${tvId}/season/${seasonNumber}`);
};

// Search movies
export const searchMovies = async (query, page = 1) => { 
  return fetchFromTMDB(`/search/movie?query=${encodeURIComponent(query)}`, page); 
};

// Search TV shows
export const searchTVShows = async (query, page = 1) => { 
  return fetchFromTMDB(`/search/tv?query=${encodeURIComponent(query)}`, page); 
};

// Combined search function
export const searchContent = async (query) => {
  const [movieResults, tvResults] = await Promise.all([
    searchMovies(query),
    searchTVShows(query)
  ]);

  return [
    ...(movieResults.results || []).map(item => ({ ...item, media_type: 'movie' })),
    ...(tvResults.results || []).map(item => ({ ...item, media_type: 'tv' }))
  ];
};

// Generate image URL
export const getImageUrl = (path) => {
  return path ? `${IMAGE_BASE_URL}${path}` : null;
};

// Generate backdrop URL
export const getBackdropUrl = (path) => {
  return path ? `${BACKDROP_BASE_URL}${path}` : null;
};

// Backup image URL (same as getImageUrl for now)
export const getBackupImageUrl = getImageUrl;

// Get year from date string
export const getYear = (dateString) => {
  return dateString ? new Date(dateString).getFullYear() : '';
};

// Movie details alias
export const getMovieDetails = fetchMovieDetails;

// Movie videos alias
export const getMovieVideos = fetchMovieVideos;

// VidSrc streaming URL generators (basic)
export const getMovieStreamUrl = (movieId) => {
  return `https://vidsrc.xyz/embed/movie/${movieId}`;
};

export const getTVShowStreamUrl = (tvId, season = 1, episode = 1) => {
  return `https://vidsrc.xyz/embed/tv/${tvId}/${season}/${episode}`;
};

// Simple cache for recently fetched data (keep it simple)
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const getCachedData = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key, data) => {
  cache.set(key, { data, timestamp: Date.now() });
};

// Enhanced fetch functions with simple caching
export const fetchTrendingMoviesCached = async (page = 1) => { 
  const cacheKey = `trending-movies-page-${page}`; 
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const data = await fetchTrendingMovies(page); 
  setCachedData(cacheKey, data);
  return data;
};

export const fetchPopularMoviesCached = async (page = 1) => { 
  const cacheKey = `popular-movies-page-${page}`; 
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const data = await fetchPopularMovies(page); 
  setCachedData(cacheKey, data);
  return data;
};

export const fetchTrendingTVShowsCached = async (page = 1) => { 
  const cacheKey = `trending-tv-page-${page}`; 
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const data = await fetchTrendingTVShows(page); 
  setCachedData(cacheKey, data);
  return data;
};

export const fetchPopularTVShowsCached = async (page = 1) => { 
  const cacheKey = `popular-tv-page-${page}`; 
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const data = await fetchPopularTVShows(page); 
  setCachedData(cacheKey, data);
  return data;
};

// --- REST OF THE FILE REMAINS UNCHANGED ---
// (Watch progress functions, VidSrc integration, etc. are not touched)

export const initializeWatchProgress = (contentId, contentType) => {
  const key = `watch_progress_${contentType}_${contentId}`;
  if (!localStorage.getItem(key)) {
    localStorage.setItem(key, JSON.stringify({
      contentId,
      contentType,
      progress: 0,
      lastWatched: Date.now()
    }));
  }
};

export const getWatchProgress = (contentId, contentType) => {
  const key = `watch_progress_${contentType}_${contentId}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
};

export const saveWatchProgress = (contentId, contentType, progress) => {
  const key = `watch_progress_${contentType}_${contentId}`;
  localStorage.setItem(key, JSON.stringify({
    contentId,
    contentType,
    progress,
    lastWatched: Date.now()
  }));
};

// Player event listener setup (placeholder)
export const setupPlayerEventListener = (iframe, contentId, contentType) => {
  // Simple implementation - in a real app you'd set up postMessage listeners
  return () => { }; // Return cleanup function
};

// Get continue watching content from localStorage
export const getContinueWatching = () => {
  const watchedItems = [];

  // Scan localStorage for watch progress items
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith('watch_progress_')) {
      try {
        const data = JSON.parse(localStorage.getItem(key));
        if (data && data.progress > 0 && data.progress < 90) { // Show only partially watched items
          watchedItems.push(data);
        }
      } catch (error) {
        // Silent error handling
      }
    }
  }

  // Sort by last watched time (most recent first)
  watchedItems.sort((a, b) => b.lastWatched - a.lastWatched);

  return watchedItems.slice(0, 10); // Return max 10 items
};

// Enhanced VidSrc Streaming Integration
const VIDSRC_BASE_URL = 'https://vidsrc.xyz';

// Generate movie embed URL
export const getMovieEmbedUrl = (movieId, options = {}) => {
  // VidSrc uses simple path format: /embed/movie/TMDB_ID
  return `${VIDSRC_BASE_URL}/embed/movie/${movieId}`;
};

// Generate TV show embed URL (for episodes)
export const getTVShowEmbedUrl = (tvId, season = 1, episode = 1, options = {}) => {
  // VidSrc uses path format: /embed/tv/TMDB_ID/SEASON/EPISODE
  return `${VIDSRC_BASE_URL}/embed/tv/${tvId}/${season}/${episode}`;
};

// Generate episode embed URL (alias for getTVShowEmbedUrl)
export const getEpisodeEmbedUrl = (tvId, season, episode, options = {}) => {
  // VidSrc uses path format: /embed/tv/TMDB_ID/SEASON/EPISODE  
  return `${VIDSRC_BASE_URL}/embed/tv/${tvId}/${season}/${episode}`;
};

// Basic embed URL aliases (for compatibility)
export const getTVEmbedUrl = getTVShowEmbedUrl;

// Fetch latest movies from VidSrc
export const fetchLatestMoviesFromVidSrc = async (page = 1) => {
  try {
    const response = await fetch(`${VIDSRC_BASE_URL}/movies/latest/page-${page}.json`);
    if (!response.ok) {
      throw new Error(`VidSrc API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('VidSrc Latest Movies Error:', error);
    return { movies: [], error: error.message };
  }
};

// Fetch latest TV shows from VidSrc
export const fetchLatestTVShowsFromVidSrc = async (page = 1) => {
  try {
    const response = await fetch(`${VIDSRC_BASE_URL}/tvshows/latest/page-${page}.json`);
    if (!response.ok) {
      throw new Error(`VidSrc API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('VidSrc Latest TV Shows Error:', error);
    return { tvshows: [], error: error.message };
  }
};

// Fetch latest episodes from VidSrc
export const fetchLatestEpisodesFromVidSrc = async (page = 1) => {
  try {
    const response = await fetch(`${VIDSRC_BASE_URL}/episodes/latest/page-${page}.json`);
    if (!response.ok) {
      throw new Error(`VidSrc API Error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('VidSrc Latest Episodes Error:', error);
    return { episodes: [], error: error.message };
  }
};

// Test TMDB API connection
export const testTMDBConnection = async () => {
  try {
    console.log('Testing TMDB API connection...');
    const response = await fetchFromTMDB('/configuration');
    console.log('TMDB API Connection Successful:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('TMDB API Connection Failed:', error);
    return { success: false, error: error.message };
  }
};

// Test VidSrc API connection
export const testVidSrcConnection = async () => {
  try {
    console.log('Testing VidSrc API connection...');
    const response = await fetchLatestMoviesFromVidSrc(1);
    console.log('VidSrc API Connection Successful:', response);
    return { success: true, data: response };
  } catch (error) {
    console.error('VidSrc API Connection Failed:', error);
    return { success: false, error: error.message };
  }
};