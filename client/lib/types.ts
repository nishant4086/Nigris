export type FieldValue = string | number | boolean | null | undefined | Record<string, unknown>;

export type ReferenceOption = Record<string, FieldValue> & { _id: string };

export interface CollectionField {
  name: string;
  type: string;
  required: boolean;
  unique?: boolean;
  ref?: string;
}

export interface CollectionData {
  _id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: FieldValue;
}
