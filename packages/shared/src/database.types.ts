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
    PostgrestVersion: "14.15"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      entries: {
        Row: {
          amount_minor: number
          created_at: string
          created_by: string
          creditor_id: string
          debtor_id: string
          deleted_at: string | null
          id: string
          note: string | null
          raw_input: string | null
          settlement_id: string | null
          source: string
          tally_id: string
          updated_at: string | null
        }
        Insert: {
          amount_minor: number
          created_at?: string
          created_by: string
          creditor_id: string
          debtor_id: string
          deleted_at?: string | null
          id?: string
          note?: string | null
          raw_input?: string | null
          settlement_id?: string | null
          source?: string
          tally_id: string
          updated_at?: string | null
        }
        Update: {
          amount_minor?: number
          created_at?: string
          created_by?: string
          creditor_id?: string
          debtor_id?: string
          deleted_at?: string | null
          id?: string
          note?: string | null
          raw_input?: string | null
          settlement_id?: string | null
          source?: string
          tally_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entries_settlement_id_fkey"
            columns: ["settlement_id"]
            isOneToOne: false
            referencedRelation: "settlements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entries_tally_id_fkey"
            columns: ["tally_id"]
            isOneToOne: false
            referencedRelation: "tallies"
            referencedColumns: ["id"]
          },
        ]
      }
      invites: {
        Row: {
          accepted_by: string | null
          created_at: string
          created_by: string
          expires_at: string
          id: string
          invitee_label: string | null
          status: string
          tally_id: string
          token: string
        }
        Insert: {
          accepted_by?: string | null
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          invitee_label?: string | null
          status?: string
          tally_id: string
          token?: string
        }
        Update: {
          accepted_by?: string | null
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          invitee_label?: string | null
          status?: string
          tally_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invites_tally_id_fkey"
            columns: ["tally_id"]
            isOneToOne: false
            referencedRelation: "tallies"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json | null
          id: string
          read_at: string | null
          tally_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          tally_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json | null
          id?: string
          read_at?: string | null
          tally_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_tally_id_fkey"
            columns: ["tally_id"]
            isOneToOne: false
            referencedRelation: "tallies"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name: string
          id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          device_info: string | null
          expo_push_token: string
          id: string
          last_seen_at: string
          user_id: string
        }
        Insert: {
          device_info?: string | null
          expo_push_token: string
          id?: string
          last_seen_at?: string
          user_id: string
        }
        Update: {
          device_info?: string | null
          expo_push_token?: string
          id?: string
          last_seen_at?: string
          user_id?: string
        }
        Relationships: []
      }
      settlements: {
        Row: {
          amount_minor: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          creditor_id: string
          debtor_id: string
          id: string
          initiated_by: string
          status: string
          tally_id: string
        }
        Insert: {
          amount_minor: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          creditor_id: string
          debtor_id: string
          id?: string
          initiated_by: string
          status?: string
          tally_id: string
        }
        Update: {
          amount_minor?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          creditor_id?: string
          debtor_id?: string
          id?: string
          initiated_by?: string
          status?: string
          tally_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settlements_tally_id_fkey"
            columns: ["tally_id"]
            isOneToOne: false
            referencedRelation: "tallies"
            referencedColumns: ["id"]
          },
        ]
      }
      tallies: {
        Row: {
          archived_at: string | null
          created_at: string
          created_by: string
          currency: string
          id: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          created_by: string
          currency?: string
          id?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          created_by?: string
          currency?: string
          id?: string
        }
        Relationships: []
      }
      tally_members: {
        Row: {
          joined_at: string
          role: string
          tally_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          role: string
          tally_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          role?: string
          tally_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tally_members_tally_id_fkey"
            columns: ["tally_id"]
            isOneToOne: false
            referencedRelation: "tallies"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_tally_with_owner: {
        Args: { p_currency?: string }
        Returns: {
          archived_at: string | null
          created_at: string
          created_by: string
          currency: string
          id: string
        }
        SetofOptions: {
          from: "*"
          to: "tallies"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_tally_member: { Args: { check_tally_id: string }; Returns: boolean }
      notify_other_tally_member: {
        Args: {
          p_actor: string
          p_body: string
          p_data?: Json
          p_tally_id: string
          p_title: string
          p_type: string
        }
        Returns: undefined
      }
      propose_settlement: {
        Args: { p_tally_id: string }
        Returns: {
          amount_minor: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          creditor_id: string
          debtor_id: string
          id: string
          initiated_by: string
          status: string
          tally_id: string
        }
        SetofOptions: {
          from: "*"
          to: "settlements"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      tally_balance_minor: {
        Args: { p_from: string; p_tally_id: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
