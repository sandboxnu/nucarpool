import { Message, Request } from "./types";

export const getLatestMessageForRequest = (
  request: Request,
  currentUserId: string,
): Message | null => {
  if (!request) return null;

  const initialMessage: Message = {
    conversationId: "",
    id: `request-${request.id}`,
    content: request.message,
    userId: request.fromUserId,
    dateCreated: request.dateCreated || new Date(),
    isRead: request.fromUserId === currentUserId,
  };

  const conversationMessages: Message[] = request.conversation?.messages || [];

  const allMessages = [initialMessage, ...conversationMessages];

  allMessages.sort(
    (a, b) =>
      new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime(),
  );

  return allMessages[0];
};
export const getCardSortingData = (
  userId: string,
  request: Request,
  latestMessage: Message | null,
) => {
  const isUnread = latestMessage
    ? !latestMessage.isRead && userId !== latestMessage.userId
    : false;
  const latestActivityDate = latestMessage
    ? latestMessage.dateCreated
    : request.dateCreated;

  return { isUnread, latestActivityDate };
};
