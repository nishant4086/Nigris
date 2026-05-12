export type FieldValue = string | number | boolean | null | undefined | Record<string, unknown>;

export interface CollectionField {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  ref?: string;
}

export interface CollectionData {
  _id: string;
  [key: string]: FieldValue;
}
