import express from 'express';

import {
    fetchMessages,
    postMessage,
    reactToMessage,
    fetchUnread,
    markRead
} from '../controllers/buddyChatController.js';

import { authenticateUser } from '../middlewares/authMiddleware.js';


const router = express.Router();


// GET  /api/buddy-chat/:buddyId/messages  — fetch conversation
router.get(
    '/:buddyId/messages',
    authenticateUser,
    fetchMessages
);


// POST /api/buddy-chat/:buddyId/messages  — send a message
router.post(
    '/:buddyId/messages',
    authenticateUser,
    postMessage
);


// POST /api/buddy-chat/messages/:messageId/react  — toggle reaction
router.post(
    '/messages/:messageId/react',
    authenticateUser,
    reactToMessage
);


// GET /api/buddy-chat/unread  — get unread message counts grouped by sender
router.get(
    '/unread',
    authenticateUser,
    fetchUnread
);


// POST /api/buddy-chat/:buddyId/read  — mark all messages from buddy as read
router.post(
    '/:buddyId/read',
    authenticateUser,
    markRead
);


export default router;
