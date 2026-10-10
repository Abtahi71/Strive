import { Server, Socket } from "socket.io";
import { conversationService } from "../modules/conversation/conversation.service";

const getRoomName = (activityId: string) => {
  return `activity:${activityId}`;
};

export const registerSocketHandlers = (io: Server, socket: Socket) => {
  const userId = socket.data.userId;

  /*
   * JOIN ACTIVITY CHAT
   */
  socket.on("activity:join", async (activityId: string) => {
    try {
      if (!activityId) {
        socket.emit("activity:error", {
          message: "Activity ID is required",
        });

        return;
      }

      /*
       * getMessages() internally
       * checks Activity membership.
       *
       * We don't actually need
       * the messages here.
       */
      await conversationService.getMessages(activityId, userId);

      const room = getRoomName(activityId);

      socket.join(room);

      socket.emit("activity:joined", {
        activityId,
      });

      console.log(`User ${userId} joined ${room}`);
    } catch (error: any) {
      socket.emit("activity:error", {
        message: error.message || "Unable to join activity",
      });
    }
  });

  /*
   * LEAVE ACTIVITY CHAT
   */
  socket.on("activity:leave", (activityId: string) => {
    if (!activityId) {
      return;
    }

    const room = getRoomName(activityId);

    socket.leave(room);

    console.log(`User ${userId} left ${room}`);
  });

  /*
   * SEND MESSAGE
   */
  socket.on(
    "message:send",
    async (data: { activityId: string; content: string }) => {
      try {
        const { activityId, content } = data;

        if (!activityId) {
          socket.emit("message:error", {
            message: "Activity ID is required",
          });

          return;
        }

        if (!content || !content.trim()) {
          socket.emit("message:error", {
            message: "Message cannot be empty",
          });

          return;
        }

        /*
         * Service:
         *
         * 1. checks membership
         * 2. finds conversation group
         * 3. saves message
         */
        const message = await conversationService.sendMessage(
          activityId,
          userId,
          content
        );

        const room = getRoomName(activityId);

        /*
         * Send to EVERYONE
         * in this Activity.
         */
        io.to(room).emit("message:new", message);
      } catch (error: any) {
        socket.emit("message:error", {
          message: error.message || "Failed to send message",
        });
      }
    }
  );

  /*
   * EDIT MESSAGE
   */
  socket.on(
    "message:edit",
    async (data: {
      messageId: string;
      content: string;
      activityId: string;
    }) => {
      try {
        const { messageId, content, activityId } = data;

        const message = await conversationService.editMessage(
          messageId,
          userId,
          content
        );

        io.to(getRoomName(activityId)).emit("message:updated", message);
      } catch (error: any) {
        socket.emit("message:error", {
          message: error.message || "Failed to edit message",
        });
      }
    }
  );

  /*
   * DELETE MESSAGE
   */
  socket.on(
    "message:delete",
    async (data: { messageId: string; activityId: string }) => {
      try {
        const { messageId, activityId } = data;

        const message = await conversationService.deleteMessage(
          messageId,
          userId
        );

        io.to(getRoomName(activityId)).emit("message:deleted", message);
      } catch (error: any) {
        socket.emit("message:error", {
          message: error.message || "Failed to delete message",
        });
      }
    }
  );
};
