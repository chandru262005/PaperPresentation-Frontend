export interface Message {
  _id?: string;
  message: string;
  sender_type: 'user' | 'reviewer';
  createdAt: string;
}

export interface ChatRoom {
  _id: string;
  paperId: string;
  userId: string;
  reviewer_id: string;
  status: 'pending' | 'completed' | 'declined';
  paperTitle?: string;
  reviewerName?: string;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
}