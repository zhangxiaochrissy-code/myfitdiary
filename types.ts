export interface ClothingItem {
  type: string;
  color: string;
  detail: string;
}

export interface HairStyle {
  style: string;
  color: string;
}

export interface AccessoryItem {
  type: string;
  color: string;
  detail: string;
}

export interface WeatherInfo {
  condition?: string;
  temp?: number;
}

export interface OutfitItems {
  top: ClothingItem;
  bottom: ClothingItem;
  hair: HairStyle;
  accessories: AccessoryItem[];
  shoes: ClothingItem;
}

export interface TrendOptimization {
  trendVibe: string;
  colorAdvice: string;
  shoeAdvice: string;
  accAdvice: string;
  trendScore: number;
  hashtags: string[];
}

export interface OOTDRecord {
  id: string;
  date: string;
  imageBase64: string;
  items: OutfitItems;
  scenes: string[];
  weather?: WeatherInfo;
  mood?: string;
  createdAt: string;
  stylingAdvice?: string;
  trendOptimization?: TrendOptimization;
}

export interface StylistQuery {
  scene: string;
  weatherCondition: string;
  temperature: number;
  mood: string;
}
