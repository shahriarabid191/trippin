import {
    sendMessage,
    getMessages,
    toggleReaction,
    getUnreadMessages,
    markMessagesRead
} from '../models/buddyChatModel.js';

import { getTravelBuddies } from '../models/buddyModel.js';

import { publishEvent } from "../events/eventPublisher.js";
import { EVENT_TYPES } from "../events/eventTypes.js";


/**
 * Helper — verify that buddyId is an accepted buddy of userId.
 */
async function assertBuddyRelationship(userId, buddyId) {

    const buddies = await getTravelBuddies(userId);

    const isBuddy = buddies.some(b => b.buddy_id === parseInt(buddyId, 10));

    if (!isBuddy) {
        const err = new Error('You can only chat with accepted travel buddies');
        err.status = 403;
        throw err;
    }

}


/**
 * GET /api/buddy-chat/:buddyId/messages
 * Fetch the full conversation between the logged-in user and buddyId.
 */
export const fetchMessages = async (req, res) => {

    try {

        const userId = req.user.id;
        const buddyId = parseInt(req.params.buddyId, 10);

        await assertBuddyRelationship(userId, buddyId);

        const messages = await getMessages(userId, buddyId);

        // Mark all messages from this buddy as read (chat is now open)
        await markMessagesRead(userId, buddyId);

        res.json({ messages });

    } catch (error) {

        console.error(error);

        res.status(error.status || 500).json({
            error: error.message || 'Server error'
        });

    }

};


/**
 * POST /api/buddy-chat/:buddyId/messages
 * Send a new message to buddyId.
 * Body: { body: string }
 */
export const postMessage = async (req, res) => {

    try {

        const userId = req.user.id;
        const buddyId = parseInt(req.params.buddyId, 10);
        const { body } = req.body;


        if (!body || !body.trim()) {
            return res.status(400).json({
                error: 'Message body is required'
            });
        }


        await assertBuddyRelationship(
            userId,
            buddyId
        );


        // 1. Save the actual message
        const message = await sendMessage(
            userId,
            buddyId,
            body.trim()
        );


        // 2. Publish an asynchronous event
        await publishEvent({

            type: EVENT_TYPES.CHAT_MESSAGE_SENT,

            // The recipient gets the notification
            userId: buddyId,

            data: {
                messageId: message.id,
                senderId: userId,
                senderUsername: req.user.username,
                receiverId: buddyId,
                body: message.body,
                redirectTo: `/travel-buddies?buddyId=${userId}`
            }



        });


        // 3. Return the created message
        res.status(201).json({
            message
        });


    } catch (error) {

        console.error(error);

        res.status(error.status || 500).json({
            error: error.message || 'Server error'
        });

    }

};


/**
 * POST /api/buddy-chat/messages/:messageId/react
 * Toggle an emoji reaction on a message.
 * Body: { emoji: string }
 */

export const reactToMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const messageId = parseInt(req.params.messageId, 10);
        const { emoji } = req.body;

        const ALLOWED = ['👍', '❤️', '😂', '😮', '😢'];

        if (!emoji || !ALLOWED.includes(emoji)) {
            return res.status(400).json({
                error: `Emoji must be one of: ${ALLOWED.join(' ')}`
            });
        }

        const result = await toggleReaction(messageId, userId, emoji);

        if (
            (result.action === "added" || result.action === "changed") &&
            result.messageOwnerId !== userId
        ) {
            await publishEvent({
                type: EVENT_TYPES.CHAT_MESSAGE_REACTED,
                userId: result.messageOwnerId,
                data: {
                    messageId,
                    reactorId: userId,
                    reactorUsername: req.user.username,
                    emoji,
                    action: result.action,
                    previousEmoji: result.from || null
                }
            });
        }

        res.json(result);

    } catch (error) {
        console.error(error);
        res.status(error.status || 500).json({
            error: error.message || 'Server error'
        });
    }
};




/**
 * GET /api/buddy-chat/unread
 * Returns unread message counts grouped by sender.
 */
export const fetchUnread = async (req, res) => {

    try {

        const userId = req.user.id;
        const unread = await getUnreadMessages(userId);

        res.json({ unread });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message || 'Server error'
        });

    }

};


/**
 * POST /api/buddy-chat/:buddyId/read
 * Mark all messages from buddyId as read.
 */
export const markRead = async (req, res) => {

    try {

        const userId = req.user.id;
        const buddyId = parseInt(req.params.buddyId, 10);

        await markMessagesRead(userId, buddyId);

        res.json({ success: true });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: error.message || 'Server error'
        });

    }

};
