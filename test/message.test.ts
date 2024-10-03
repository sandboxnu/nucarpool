// import { createCallerFactory } from '@trpc/server';
// import { router } from '../src/server/router/createRouter.ts;
// import { createContext } from '../src/server/context';
// import { PrismaClient } from '@prisma/client';

// const prisma = new PrismaClient();

// const createCaller = createCallerFactory(router);

// async function main() {
//   const caller = createCaller({
//     session: {
//       user: { id: 'test-user-id' }, // Replace with a valid user ID from your database
//     },
//     prisma,
//   });

//   try {
//     // Test getUnreadMessageCount
//     const unreadCount = await caller.message.getUnreadMessageCount();
//     console.log('Unread message count:', unreadCount);

//     // Test getRequests
//     const requests = await caller.message.getRequests();
//     console.log('Requests:', JSON.stringify(requests, null, 2));

//     // Test getMessages
//     // Replace 'conversation-id' with a valid conversation ID from your database
//     const messages = await caller.message.getMessages('conversation-id');
//     console.log('Messages:', JSON.stringify(messages, null, 2));

//     // Test sendMessage
//     // Replace 'request-id' with a valid request ID from your database
//     const newMessage = await caller.message.sendMessage({
//       requestId: 'request-id',
//       content: 'Test message from command line',
//     });
//     console.log('New message:', newMessage);

//     // Test markMessagesAsRead
//     // Replace ['message-id-1', 'message-id-2'] with valid message IDs from your database
//     const markedMessages = await caller.message.markMessagesAsRead({
//       messageIds: ['message-id-1', 'message-id-2'],
//     });
//     console.log('Marked messages:', markedMessages);

//   } catch (error) {
//     console.error('Error:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();