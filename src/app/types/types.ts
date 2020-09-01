export interface UserProfile {
  id?: string;
  displayName: null | string;
  photoURL: null | string;
  createdAt: number;
}

export interface UserDocument {
  id?: string,
  userId: string,
  text: string,
}
