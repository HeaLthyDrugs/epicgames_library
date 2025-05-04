const API_KEY = "74141a61b1f2487d95045f4a9816c421";
const API_BASE_URL = "https://api.rawg.io/api";

export type Game = {
  id: number;
  name: string;
  background_image: string;
  description_raw?: string;
  released?: string;
  metacritic?: number;
  genres?: { id: number; name: string }[];
  slug: string;
  platforms?: { platform: { id: number; name: string } }[];
  rating?: number;
  ratings_count?: number;
  tags?: { id: number; name: string }[];
  stores?: { store: { id: number; name: string } }[];
  short_screenshots?: { id: number; image: string }[];
  esrb_rating?: {
    id: number;
    slug: string;
    name: string;
  };
}

export type ApiResponse<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const fetchWithKey = async (endpoint: string, params: Record<string, string> = {}) => {
  const searchParams = new URLSearchParams({
    key: API_KEY,
    ...params
  });
  
  const response = await fetch(`${API_BASE_URL}${endpoint}?${searchParams}`);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return await response.json();
};

export const getRawgApi = () => {
  return {
    getTopRatedGames: async (pageSize = 6): Promise<Game[]> => {
      const data = await fetchWithKey('/games', {
        ordering: '-metacritic',
        page_size: pageSize.toString()
      }) as ApiResponse<Game>;
      return data.results;
    },
    
    getGameDetails: async (id: string | number): Promise<Game> => {
      return await fetchWithKey(`/games/${id}`);
    },
    
    searchGames: async (query: string, pageSize = 10): Promise<Game[]> => {
      const data = await fetchWithKey('/games', {
        search: query,
        page_size: pageSize.toString()
      }) as ApiResponse<Game>;
      return data.results;
    },
    
    getNewGames: async (pageSize = 6): Promise<Game[]> => {
      const currentDate = new Date();
      const lastMonth = new Date(currentDate);
      lastMonth.setMonth(currentDate.getMonth() - 1);
      
      const from = lastMonth.toISOString().split('T')[0];
      const to = currentDate.toISOString().split('T')[0];
      
      const data = await fetchWithKey('/games', {
        dates: `${from},${to}`,
        ordering: '-added',
        page_size: pageSize.toString()
      }) as ApiResponse<Game>;
      return data.results;
    },
    
    getUpcomingGames: async (pageSize = 6): Promise<Game[]> => {
      const currentDate = new Date();
      const nextYear = new Date(currentDate);
      nextYear.setFullYear(currentDate.getFullYear() + 1);
      
      const from = currentDate.toISOString().split('T')[0];
      const to = nextYear.toISOString().split('T')[0];
      
      const data = await fetchWithKey('/games', {
        dates: `${from},${to}`,
        ordering: '-added',
        page_size: pageSize.toString()
      }) as ApiResponse<Game>;
      return data.results;
    },
    
    getGamesByGenre: async (genreId: number, pageSize = 6): Promise<Game[]> => {
      const data = await fetchWithKey('/games', {
        genres: genreId.toString(),
        ordering: '-metacritic',
        page_size: pageSize.toString()
      }) as ApiResponse<Game>;
      return data.results;
    },
    
    getGenres: async (): Promise<{ id: number; name: string; image_background: string }[]> => {
      const data = await fetchWithKey('/genres') as ApiResponse<{ id: number; name: string; image_background: string }>;
      return data.results;
    },
    
    getGameScreenshots: async (gameId: number | string): Promise<{ id: number; image: string }[]> => {
      const data = await fetchWithKey(`/games/${gameId}/screenshots`) as ApiResponse<{ id: number; image: string }>;
      return data.results;
    },
    
    getGameTrailers: async (gameId: number | string): Promise<{ id: number; name: string; preview: string; data: { 480: string; max: string } }[]> => {
      const data = await fetchWithKey(`/games/${gameId}/movies`) as ApiResponse<{ id: number; name: string; preview: string; data: { 480: string; max: string } }>;
      return data.results;
    }
  };
}; 