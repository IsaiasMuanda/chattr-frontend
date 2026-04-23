export interface User {
  _id: string;
  fullName: string;
  email: string;
  profilePic?: string;
  bio?: string;
  createdAt?: string;
}

export interface Message {
  _id: string;
  senderId: string;
  receiverId: string;
  text?: string;
  image?: string;
  readAt?: string | null;
  createdAt: string;
}
