export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_user_id: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_user_id?: string | null
        }
        Relationships: []
      }
      admin_permissions: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          permission: Database["public"]["Enums"]["admin_permission"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission: Database["public"]["Enums"]["admin_permission"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["admin_permission"]
          user_id?: string
        }
        Relationships: []
      }
      banned_users: {
        Row: {
          banned_by: string | null
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          banned_by?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          banned_by?: string | null
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      direct_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      group_trade_confirmations: {
        Row: {
          confirmed_at: string
          trade_id: string
          user_id: string
        }
        Insert: {
          confirmed_at?: string
          trade_id: string
          user_id: string
        }
        Update: {
          confirmed_at?: string
          trade_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_trade_confirmations_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "group_trades"
            referencedColumns: ["id"]
          },
        ]
      }
      group_trade_legs: {
        Row: {
          from_user_id: string
          id: string
          sticker_id: string
          to_user_id: string
          trade_id: string
        }
        Insert: {
          from_user_id: string
          id?: string
          sticker_id: string
          to_user_id: string
          trade_id: string
        }
        Update: {
          from_user_id?: string
          id?: string
          sticker_id?: string
          to_user_id?: string
          trade_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_trade_legs_trade_id_fkey"
            columns: ["trade_id"]
            isOneToOne: false
            referencedRelation: "group_trades"
            referencedColumns: ["id"]
          },
        ]
      }
      group_trades: {
        Row: {
          created_at: string
          group_id: string
          id: string
          proposed_by: string
          status: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          proposed_by: string
          status?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          proposed_by?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_trades_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          created_at: string
          created_by: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          created_at: string
          id: string
          name: string
          photo_credit: string | null
          photo_source: string | null
          photo_url: string | null
          position: string | null
          sticker_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          photo_credit?: string | null
          photo_source?: string | null
          photo_url?: string | null
          position?: string | null
          sticker_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          photo_credit?: string | null
          photo_source?: string | null
          photo_url?: string | null
          position?: string | null
          sticker_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          default_latitude: number | null
          default_longitude: number | null
          display_name: string | null
          id: string
          latitude: number | null
          location_mode: string
          location_updated_at: string | null
          longitude: number | null
          pin_hash: string | null
          share_collection: boolean
          share_location: boolean
          show_in_trades: boolean
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          default_latitude?: number | null
          default_longitude?: number | null
          display_name?: string | null
          id?: string
          latitude?: number | null
          location_mode?: string
          location_updated_at?: string | null
          longitude?: number | null
          pin_hash?: string | null
          share_collection?: boolean
          share_location?: boolean
          show_in_trades?: boolean
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          default_latitude?: number | null
          default_longitude?: number | null
          display_name?: string | null
          id?: string
          latitude?: number | null
          location_mode?: string
          location_updated_at?: string | null
          longitude?: number | null
          pin_hash?: string | null
          share_collection?: boolean
          share_location?: boolean
          show_in_trades?: boolean
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trade_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          sender_id: string
          trade_request_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          sender_id: string
          trade_request_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
          trade_request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trade_messages_trade_request_id_fkey"
            columns: ["trade_request_id"]
            isOneToOne: false
            referencedRelation: "trade_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      trade_requests: {
        Row: {
          created_at: string
          from_confirmed: boolean
          from_user_id: string
          id: string
          status: string
          stickers_offered: string[]
          stickers_requested: string[]
          to_confirmed: boolean
          to_user_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          from_confirmed?: boolean
          from_user_id: string
          id?: string
          status?: string
          stickers_offered?: string[]
          stickers_requested?: string[]
          to_confirmed?: boolean
          to_user_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          from_confirmed?: boolean
          from_user_id?: string
          id?: string
          status?: string
          stickers_offered?: string[]
          stickers_requested?: string[]
          to_confirmed?: boolean
          to_user_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_stickers: {
        Row: {
          collected: boolean
          duplicates: number
          id: string
          sticker_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collected?: boolean
          duplicates?: number
          id?: string
          sticker_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collected?: boolean
          duplicates?: number
          id?: string
          sticker_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_group: {
        Args: { p_member_ids: string[]; p_name: string }
        Returns: string
      }
      execute_group_trade: { Args: { p_trade_id: string }; Returns: undefined }
      execute_trade: { Args: { trade_id: string }; Returns: undefined }
      get_all_trade_matches: {
        Args: never
        Returns: {
          avatar_url: string
          display_name: string
          i_can_give: number
          other_user_id: string
          they_can_give: number
          trade_score: number
        }[]
      }
      has_admin_permission: {
        Args: {
          _permission: Database["public"]["Enums"]["admin_permission"]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_group_member: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      admin_permission:
        | "list_users"
        | "reset_password"
        | "ban_user"
        | "delete_user"
        | "edit_profile"
        | "manage_admins"
      app_role: "admin" | "user" | "super_admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      admin_permission: [
        "list_users",
        "reset_password",
        "ban_user",
        "delete_user",
        "edit_profile",
        "manage_admins",
      ],
      app_role: ["admin", "user", "super_admin"],
    },
  },
} as const
