import {
    getNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from "../models/notificationModel.js";


// Get my notifications
export const getMyNotifications = async (req, res) => {

    try {

        const userId = req.user.id;

        const notifications = await getNotifications(userId);

        res.json({
            notifications
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });

    }

};


// Get unread notification count
export const getMyUnreadCount = async (req, res) => {

    try {

        const userId = req.user.id;

        const count = await getUnreadCount(userId);

        res.json({
            count
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });

    }

};


// Mark one notification as read
export const readNotification = async (req, res) => {

    try {

        const userId = req.user.id;
        const { id } = req.params;

        const notification = await markAsRead(
            id,
            userId
        );

        if (!notification) {

            return res.status(404).json({
                error: "Notification not found"
            });

        }

        res.json({
            message: "Notification marked as read",
            notification
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });

    }

};


// Mark all notifications as read
export const readAllNotifications = async (req, res) => {

    try {

        const userId = req.user.id;

        const count = await markAllAsRead(userId);

        res.json({
            message: "All notifications marked as read",
            count
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            error: "Server error"
        });

    }

};