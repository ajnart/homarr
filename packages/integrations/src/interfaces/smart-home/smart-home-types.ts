interface EntityState {
  attributes: Record<string, string | number | boolean | null | (string | number)[]>;
  entity_id: string;
  last_changed: Date;
  last_updated: Date;
  state: string;
}

export type EntityStateResult =
  | {
      success: true;
      data: EntityState;
    }
  | {
      success: false;
      error: unknown;
    };
