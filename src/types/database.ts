export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          display_name: string | null;
          avatar_seed: string | null;
          class_name: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          display_name?: string | null;
          avatar_seed?: string | null;
          class_name?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          display_name?: string | null;
          avatar_seed?: string | null;
          class_name?: string | null;
          created_at?: string;
        };
      };
      modules: {
        Row: {
          id: string;
          name: string;
          type: string;
          description: string | null;
          icon_name: string | null;
          display_order: number | null;
        };
        Insert: {
          id: string;
          name: string;
          type: string;
          description?: string | null;
          icon_name?: string | null;
          display_order?: number | null;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          description?: string | null;
          icon_name?: string | null;
          display_order?: number | null;
        };
      };
    };
  };
}
