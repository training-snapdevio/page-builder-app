export interface LibraryItem {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  preview: string;
  category: string;
  tags: string[];
  isPremium: boolean;
  difficulty: "beginner" | "intermediate" | "advanced";
  usageCount: number;
  rating: number;
  data: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface LibraryCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  blocks?: LibraryItem[];
  pages?: LibraryItem[];
}

export interface LibrarySection {
  categories: Record<string, LibraryCategory>;
}

export interface LibraryData {
  blocks: LibrarySection;
  pages: LibrarySection;
  userTemplates: {
    templates: LibraryItem[];
  };
  favorites: {
    blocks: string[];
    pages: string[];
  };
}

export type LibraryTab = "blocks" | "pages" | "myTemplates";

export interface LibraryFilters {
  category: string;
  search: string;
  favoritesOnly: boolean;
}
