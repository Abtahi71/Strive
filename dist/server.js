// src/server.ts
import http from "http";

// src/app.ts
import express6 from "express";

// src/app/routes/index.ts
import express5 from "express";

// prisma/generated/prisma/enums.ts
var GlobalRole = {
  SUPERADMIN: "SUPERADMIN",
  USER: "USER"
};
var FriendshipStatus = {
  ACCEPTED: "ACCEPTED",
  PENDING: "PENDING",
  DECLINED: "DECLINED"
};
var ActivityRole = {
  MEMBER: "MEMBER",
  ADMIN: "ADMIN"
};
var Visibility = {
  PUBLIC: "PUBLIC",
  INVITE_ONLY: "INVITE_ONLY"
};
var DayOfWeek = {
  MONDAY: "MONDAY",
  TUESDAY: "TUESDAY",
  WEDNESDAY: "WEDNESDAY",
  THURSDAY: "THURSDAY",
  FRIDAY: "FRIDAY",
  SATURDAY: "SATURDAY",
  SUNDAY: "SUNDAY"
};

// src/app/modules/auth/auth.routes.ts
import { Router } from "express";

// src/app/modules/auth/auth.controller.ts
import status2 from "http-status";

// src/app/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = { setCookie, getCookie, clearCookie };

// src/app/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, options) => {
  const expiresIn = options?.expiresIn ?? "1d";
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (err) {
    return {
      success: false,
      message: "Invalid Token"
    };
  }
};
var decodeToken = (token) => {
  try {
    const decoded = jwt.decode(token);
    return {
      success: true,
      data: decoded
    };
  } catch (err) {
    return {
      success: false,
      message: "Invalid Token"
    };
  }
};
var jwtUtils = { createToken, verifyToken, decodeToken };

// src/app/utils/token.ts
var isProd = process.env.NODE_ENV === "prod";
var ACCESS_TOKEN_TTL_MS = 2 * 60 * 1e3;
var SESSION_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1e3;
var getAccessToken = (payload) => {
  const accessToken = jwtUtils.createToken(
    payload,
    process.env.ACCESS_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
  return accessToken;
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 20 * 60 * 1e3
  });
  console.log("cookie set");
};
var setSessionTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "sessionToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 1e3 * 7
  });
};
var tokenUtils = { getAccessToken, setAccessTokenCookie, setSessionTokenCookie };

// src/app/errorHelpers/AppError.ts
var AppError = class extends Error {
  statuscode;
  constructor(statusCode, message, stack = "") {
    super(message);
    this.statuscode = statusCode;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/app/lib/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";

// prisma/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// prisma/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.9.1",
  "engineVersion": "e922089b7d7502aff4249d5da3420f6fa55fc6ad",
  "activeProvider": "postgresql",
  "inlineSchema": 'model ChatConversation {\n  id        String        @id @default(uuid())\n  userId    String\n  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt DateTime      @default(now())\n  updatedAt DateTime      @updatedAt\n  messages  ChatMessage[]\n\n  @@index([userId])\n}\n\nmodel ChatMessage {\n  id             String           @id @default(uuid())\n  conversationId String\n  conversation   ChatConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)\n\n  role       ChatMessageRole\n  content    String?\n  toolCalls  Json?\n  toolCallId String?\n\n  createdAt DateTime @default(now())\n\n  @@index([conversationId, createdAt])\n}\n\nenum ChatMessageRole {\n  USER\n  ASSISTANT\n  TOOL\n}\n\nmodel TaskAchievement {\n  id          String                @id @default(uuid())\n  taskId      String\n  title       String\n  description String\n  iconUrl     String?\n  totalValue  Int\n  unit        String?\n  createdAt   DateTime              @default(now())\n  iconType    IconType?             @default(DEFAULT)\n  iconValue   String?\n  task        ActivityTask          @relation(fields: [taskId], references: [id], onDelete: Cascade)\n  users       UserTaskAchievement[]\n}\n\nmodel UserTaskAchievement {\n  id              String          @id @default(uuid())\n  userId          String\n  achievementId   String\n  isEarned        Boolean\n  completedValue  Int             @default(0)\n  completedStreak Int             @default(0)\n  achievement     TaskAchievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)\n  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, achievementId])\n  @@index([userId])\n  @@index([achievementId])\n}\n\nenum IconType {\n  DEFAULT\n  ICON\n  PREBUILT\n  CUSTOM\n  EMOJI\n}\n\nmodel Activity {\n  id            String                  @id @default(uuid())\n  name          String\n  description   String\n  imageUrl      String\n  memberCount   Int                     @default(0)\n  taskCount     Int                     @default(0)\n  creatorId     String\n  createdAt     DateTime                @default(now())\n  updatedAt     DateTime                @updatedAt\n  visibility    Visibility\n  creator       User                    @relation("ActivityCreator", fields: [creatorId], references: [id], onDelete: Cascade)\n  dailyProgress ActivityDailyProgress[]\n  invitations   ActivityInvitation[]\n  members       ActivityMember[]\n  task          ActivityTask[]\n  group         ConversationGroup?\n\n  @@index([visibility])\n  @@index([creatorId])\n}\n\nmodel ActivityMember {\n  id             String       @id @default(uuid())\n  userId         String\n  activityId     String\n  role           ActivityRole\n  joinedAt       DateTime\n  leftAt         DateTime?\n  isActive       Boolean      @default(true)\n  currentStreak  Int          @default(0)\n  longestStreak  Int          @default(0)\n  completionRate Float        @default(0)\n  activity       Activity     @relation(fields: [activityId], references: [id], onDelete: Cascade)\n  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([activityId, userId])\n  @@index([activityId])\n  @@index([userId])\n}\n\nmodel ActivityInvitation {\n  id         String    @id @default(uuid())\n  activityId String\n  senderId   String\n  receiverId String\n  expiresAt  DateTime?\n  acceptedAt DateTime?\n  createdAt  DateTime  @default(now())\n  activity   Activity  @relation(fields: [activityId], references: [id], onDelete: Cascade)\n  receiver   User      @relation("InvitationReceiver", fields: [receiverId], references: [id], onDelete: Cascade)\n  sender     User      @relation("InvitationSender", fields: [senderId], references: [id], onDelete: Cascade)\n\n  @@index([receiverId, activityId, senderId])\n}\n\nmodel Quiz {\n  id       String   @id @default(uuid())\n  question String\n  answer   String?\n  options  String[]\n}\n\nmodel ActivityTask {\n  id           String            @id @default(uuid())\n  activityId   String\n  unit         String\n  targetValue  Float\n  scheduleType ScheduleType      @default(DAILY)\n  name         String\n  description  String\n  imageUrl     String?\n  creatorId    String\n  createdAt    DateTime          @default(now())\n  updatedAt    DateTime          @updatedAt\n  taskType     TaskType          @default(VALUE)\n  activity     Activity          @relation(fields: [activityId], references: [id], onDelete: Cascade)\n  creator      User              @relation("TaskCreator", fields: [creatorId], references: [id], onDelete: Cascade)\n  acheivements TaskAchievement[]\n  progress     TaskProgress[]\n  schedules    TaskSchedule[]\n\n  @@index([activityId])\n  @@index([creatorId])\n}\n\nmodel TaskSchedule {\n  id     String       @id @default(uuid())\n  taskId String\n  day    DayOfWeek\n  task   ActivityTask @relation(fields: [taskId], references: [id], onDelete: Cascade)\n\n  @@unique([taskId, day])\n}\n\nmodel TaskProgress {\n  id             String              @id @default(uuid())\n  activityId     String\n  taskId         String\n  userId         String\n  date           DateTime\n  completedValue Decimal             @db.Decimal(10, 2)\n  targetSnapshot Decimal             @db.Decimal(10, 2)\n  isCompleted    Boolean             @default(false)\n  createdAt      DateTime            @default(now())\n  updatedAt      DateTime            @updatedAt\n  currentStreak  Int                 @default(0)\n  longestStreak  Int                 @default(0)\n  task           ActivityTask        @relation(fields: [taskId], references: [id], onDelete: Cascade)\n  user           User                @relation(fields: [userId], references: [id], onDelete: Cascade)\n  entries        TaskProgressEntry[]\n\n  @@unique([taskId, userId, date])\n  @@index([taskId])\n  @@index([userId])\n}\n\nmodel TaskProgressEntry {\n  id         String       @id @default(uuid())\n  progressId String\n  value      Decimal      @db.Decimal(10, 2)\n  note       String?\n  createdAt  DateTime     @default(now())\n  progress   TaskProgress @relation(fields: [progressId], references: [id], onDelete: Cascade)\n\n  @@index([progressId])\n}\n\nmodel ActivityDailyProgress {\n  id                   String   @id @default(uuid())\n  activityId           String\n  userId               String\n  date                 DateTime\n  completedTasks       Int\n  totalTasks           Int\n  completionPercentage Decimal  @db.Decimal(5, 2)\n  completed            Boolean\n  createdAt            DateTime @default(now())\n  updatedAt            DateTime @updatedAt\n  task                 Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)\n  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([activityId, userId, date])\n  @@index([activityId])\n  @@index([userId])\n}\n\nenum TaskType {\n  VALUE\n  CHECKLIST\n  DOWN\n  QUIZ\n}\n\nmodel User {\n  id         String     @id @default(uuid())\n  name       String?\n  username   String?    @unique\n  email      String?    @unique\n  password   String?\n  avatar     String?\n  createdAt  DateTime   @default(now())\n  updatedAt  DateTime   @updatedAt\n  globalRole GlobalRole @default(USER)\n  isActive   Boolean    @default(true)\n  googleId   String?    @unique\n\n  createdActivities     Activity[]              @relation("ActivityCreator")\n  ActivityDailyProgress ActivityDailyProgress[]\n  receivedInvitations   ActivityInvitation[]    @relation("InvitationReceiver")\n  sentInvitations       ActivityInvitation[]    @relation("InvitationSender")\n  activity              ActivityMember[]\n  createdTasks          ActivityTask[]          @relation("TaskCreator")\n  receivedRequests      Friendship[]            @relation("FriendReceiver")\n  sentRequests          Friendship[]            @relation("FriendRequester")\n  messages              Message[]\n  notification          Notification[]\n  passwordResets        PasswordReset[]\n  sessions              Session[]\n  progress              TaskProgress[]\n  profile               UserProfile?\n  achievements          UserTaskAchievement[]\n  chats                 ChatConversation[]\n  websiteUsage          WebsiteUsage[]\n\n  @@index([email])\n  @@index([username])\n}\n\nmodel Session {\n  id               String         @id @default(uuid())\n  userId           String\n  refreshTokenHash String         @unique\n  expiresAt        DateTime\n  deviceName       String?\n  ipAdress         String?\n  userAgent        String?\n  revokedAt        DateTime?\n  createdAt        DateTime       @default(now())\n  lastUsedAt       DateTime       @updatedAt\n  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  websiteUsage     WebsiteUsage[]\n\n  @@index([userId])\n}\n\nmodel UserProfile {\n  id        String    @id @default(uuid())\n  userId    String    @unique\n  firstName String?\n  lastName  String?\n  bio       String?\n  avatarUrl String?\n  birthDate DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel Friendship {\n  id          String           @id @default(uuid())\n  requesterId String\n  receiverId  String\n  status      FriendshipStatus\n  createdAt   DateTime         @default(now())\n  updatedAt   DateTime         @updatedAt\n  receiver    User             @relation("FriendReceiver", fields: [receiverId], references: [id], onDelete: Cascade)\n  requester   User             @relation("FriendRequester", fields: [requesterId], references: [id], onDelete: Cascade)\n\n  @@unique([requesterId, receiverId])\n  @@index([requesterId])\n  @@index([receiverId])\n  @@index([status])\n}\n\nmodel PasswordReset {\n  id        String    @id @default(uuid())\n  userId    String\n  tokenHash String\n  usedAt    DateTime?\n  createdAt DateTime  @default(now())\n  expiresAt DateTime\n  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([expiresAt])\n}\n\nmodel ConversationGroup {\n  id         String    @id @default(uuid())\n  activityId String    @unique\n  createdAt  DateTime  @default(now())\n  activity   Activity  @relation(fields: [activityId], references: [id], onDelete: Cascade)\n  messages   Message[]\n}\n\nmodel Message {\n  id                  String            @id @default(uuid())\n  conversationGroupId String\n  senderId            String\n  type                MessageType       @default(TEXT)\n  content             String?\n  edited              Boolean           @default(false)\n  deletedAt           DateTime?\n  createdAt           DateTime          @default(now())\n  updatedAt           DateTime          @updatedAt\n  attachments         Attachment[]\n  conversationGroup   ConversationGroup @relation(fields: [conversationGroupId], references: [id], onDelete: Cascade)\n  sender              User              @relation(fields: [senderId], references: [id], onDelete: Cascade)\n\n  @@index([conversationGroupId])\n  @@index([senderId])\n  @@index([createdAt])\n}\n\nmodel Attachment {\n  id        String   @id @default(uuid())\n  messageId String\n  url       String\n  fileName  String\n  mimeType  String\n  size      Int\n  createdAt DateTime @default(now())\n  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)\n\n  @@index([messageId])\n}\n\nenum GlobalRole {\n  SUPERADMIN\n  USER\n}\n\nenum FriendshipStatus {\n  ACCEPTED\n  PENDING\n  DECLINED\n}\n\nenum NotificationType {\n  FRIEND_REQUEST\n  ACTIVITY_INVITATION\n  TASK_REMINDER\n  NEW_MESSAGE\n  PROMOTED_TO_ADMIN\n  STREAK\n  LEADERBOARD\n  ACHIEVEMENT\n}\n\nenum ActivityRole {\n  MEMBER\n  ADMIN\n}\n\nenum Visibility {\n  PUBLIC\n  INVITE_ONLY\n}\n\nenum ScheduleType {\n  DAILY\n  CUSTOM\n}\n\nenum DayOfWeek {\n  MONDAY\n  TUESDAY\n  WEDNESDAY\n  THURSDAY\n  FRIDAY\n  SATURDAY\n  SUNDAY\n}\n\nenum MessageType {\n  TEXT\n  IMAGE\n  FILE\n  SYSTEM\n}\n\nmodel knowledge_chunks {\n  id         String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  source     String\n  content    String\n  embedding  Unsupported("vector")?\n  created_at DateTime?              @default(now()) @db.Timestamp(6)\n}\n\nmodel Notification {\n  id        String           @id @default(uuid())\n  title     String\n  content   String\n  userId    String\n  createdAt DateTime\n  type      NotificationType\n  isRead    Boolean          @default(false)\n  data      Json?\n  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([isRead])\n  @@index([type])\n  @@index([createdAt])\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel WebsiteUsage {\n  id        String @id @default(uuid())\n  userId    String\n  sessionId String\n\n  domain      String\n  startedAt   DateTime\n  endedAt     DateTime?\n  durationSec Int\n\n  createdAt DateTime @default(now())\n\n  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)\n\n  @@index([userId, startedAt])\n  @@index([userId, domain])\n  @@index([sessionId])\n  @@index([domain])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"ChatConversation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ChatConversationToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"messages","kind":"object","type":"ChatMessage","relationName":"ChatConversationToChatMessage"}],"dbName":null},"ChatMessage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"conversationId","kind":"scalar","type":"String"},{"name":"conversation","kind":"object","type":"ChatConversation","relationName":"ChatConversationToChatMessage"},{"name":"role","kind":"enum","type":"ChatMessageRole"},{"name":"content","kind":"scalar","type":"String"},{"name":"toolCalls","kind":"scalar","type":"Json"},{"name":"toolCallId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"TaskAchievement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"taskId","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"iconUrl","kind":"scalar","type":"String"},{"name":"totalValue","kind":"scalar","type":"Int"},{"name":"unit","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"iconType","kind":"enum","type":"IconType"},{"name":"iconValue","kind":"scalar","type":"String"},{"name":"task","kind":"object","type":"ActivityTask","relationName":"ActivityTaskToTaskAchievement"},{"name":"users","kind":"object","type":"UserTaskAchievement","relationName":"TaskAchievementToUserTaskAchievement"}],"dbName":null},"UserTaskAchievement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"achievementId","kind":"scalar","type":"String"},{"name":"isEarned","kind":"scalar","type":"Boolean"},{"name":"completedValue","kind":"scalar","type":"Int"},{"name":"completedStreak","kind":"scalar","type":"Int"},{"name":"achievement","kind":"object","type":"TaskAchievement","relationName":"TaskAchievementToUserTaskAchievement"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserTaskAchievement"}],"dbName":null},"Activity":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"memberCount","kind":"scalar","type":"Int"},{"name":"taskCount","kind":"scalar","type":"Int"},{"name":"creatorId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"visibility","kind":"enum","type":"Visibility"},{"name":"creator","kind":"object","type":"User","relationName":"ActivityCreator"},{"name":"dailyProgress","kind":"object","type":"ActivityDailyProgress","relationName":"ActivityToActivityDailyProgress"},{"name":"invitations","kind":"object","type":"ActivityInvitation","relationName":"ActivityToActivityInvitation"},{"name":"members","kind":"object","type":"ActivityMember","relationName":"ActivityToActivityMember"},{"name":"task","kind":"object","type":"ActivityTask","relationName":"ActivityToActivityTask"},{"name":"group","kind":"object","type":"ConversationGroup","relationName":"ActivityToConversationGroup"}],"dbName":null},"ActivityMember":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"ActivityRole"},{"name":"joinedAt","kind":"scalar","type":"DateTime"},{"name":"leftAt","kind":"scalar","type":"DateTime"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"currentStreak","kind":"scalar","type":"Int"},{"name":"longestStreak","kind":"scalar","type":"Int"},{"name":"completionRate","kind":"scalar","type":"Float"},{"name":"activity","kind":"object","type":"Activity","relationName":"ActivityToActivityMember"},{"name":"user","kind":"object","type":"User","relationName":"ActivityMemberToUser"}],"dbName":null},"ActivityInvitation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"senderId","kind":"scalar","type":"String"},{"name":"receiverId","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"acceptedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"activity","kind":"object","type":"Activity","relationName":"ActivityToActivityInvitation"},{"name":"receiver","kind":"object","type":"User","relationName":"InvitationReceiver"},{"name":"sender","kind":"object","type":"User","relationName":"InvitationSender"}],"dbName":null},"Quiz":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"question","kind":"scalar","type":"String"},{"name":"answer","kind":"scalar","type":"String"},{"name":"options","kind":"scalar","type":"String"}],"dbName":null},"ActivityTask":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"unit","kind":"scalar","type":"String"},{"name":"targetValue","kind":"scalar","type":"Float"},{"name":"scheduleType","kind":"enum","type":"ScheduleType"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"creatorId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"taskType","kind":"enum","type":"TaskType"},{"name":"activity","kind":"object","type":"Activity","relationName":"ActivityToActivityTask"},{"name":"creator","kind":"object","type":"User","relationName":"TaskCreator"},{"name":"acheivements","kind":"object","type":"TaskAchievement","relationName":"ActivityTaskToTaskAchievement"},{"name":"progress","kind":"object","type":"TaskProgress","relationName":"ActivityTaskToTaskProgress"},{"name":"schedules","kind":"object","type":"TaskSchedule","relationName":"ActivityTaskToTaskSchedule"}],"dbName":null},"TaskSchedule":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"taskId","kind":"scalar","type":"String"},{"name":"day","kind":"enum","type":"DayOfWeek"},{"name":"task","kind":"object","type":"ActivityTask","relationName":"ActivityTaskToTaskSchedule"}],"dbName":null},"TaskProgress":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"taskId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"completedValue","kind":"scalar","type":"Decimal"},{"name":"targetSnapshot","kind":"scalar","type":"Decimal"},{"name":"isCompleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"currentStreak","kind":"scalar","type":"Int"},{"name":"longestStreak","kind":"scalar","type":"Int"},{"name":"task","kind":"object","type":"ActivityTask","relationName":"ActivityTaskToTaskProgress"},{"name":"user","kind":"object","type":"User","relationName":"TaskProgressToUser"},{"name":"entries","kind":"object","type":"TaskProgressEntry","relationName":"TaskProgressToTaskProgressEntry"}],"dbName":null},"TaskProgressEntry":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"progressId","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"Decimal"},{"name":"note","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"progress","kind":"object","type":"TaskProgress","relationName":"TaskProgressToTaskProgressEntry"}],"dbName":null},"ActivityDailyProgress":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"completedTasks","kind":"scalar","type":"Int"},{"name":"totalTasks","kind":"scalar","type":"Int"},{"name":"completionPercentage","kind":"scalar","type":"Decimal"},{"name":"completed","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"task","kind":"object","type":"Activity","relationName":"ActivityToActivityDailyProgress"},{"name":"user","kind":"object","type":"User","relationName":"ActivityDailyProgressToUser"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"username","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"avatar","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"globalRole","kind":"enum","type":"GlobalRole"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"googleId","kind":"scalar","type":"String"},{"name":"createdActivities","kind":"object","type":"Activity","relationName":"ActivityCreator"},{"name":"ActivityDailyProgress","kind":"object","type":"ActivityDailyProgress","relationName":"ActivityDailyProgressToUser"},{"name":"receivedInvitations","kind":"object","type":"ActivityInvitation","relationName":"InvitationReceiver"},{"name":"sentInvitations","kind":"object","type":"ActivityInvitation","relationName":"InvitationSender"},{"name":"activity","kind":"object","type":"ActivityMember","relationName":"ActivityMemberToUser"},{"name":"createdTasks","kind":"object","type":"ActivityTask","relationName":"TaskCreator"},{"name":"receivedRequests","kind":"object","type":"Friendship","relationName":"FriendReceiver"},{"name":"sentRequests","kind":"object","type":"Friendship","relationName":"FriendRequester"},{"name":"messages","kind":"object","type":"Message","relationName":"MessageToUser"},{"name":"notification","kind":"object","type":"Notification","relationName":"NotificationToUser"},{"name":"passwordResets","kind":"object","type":"PasswordReset","relationName":"PasswordResetToUser"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"progress","kind":"object","type":"TaskProgress","relationName":"TaskProgressToUser"},{"name":"profile","kind":"object","type":"UserProfile","relationName":"UserToUserProfile"},{"name":"achievements","kind":"object","type":"UserTaskAchievement","relationName":"UserToUserTaskAchievement"},{"name":"chats","kind":"object","type":"ChatConversation","relationName":"ChatConversationToUser"},{"name":"websiteUsage","kind":"object","type":"WebsiteUsage","relationName":"UserToWebsiteUsage"}],"dbName":null},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"refreshTokenHash","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"deviceName","kind":"scalar","type":"String"},{"name":"ipAdress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"revokedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"lastUsedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"},{"name":"websiteUsage","kind":"object","type":"WebsiteUsage","relationName":"SessionToWebsiteUsage"}],"dbName":null},"UserProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"firstName","kind":"scalar","type":"String"},{"name":"lastName","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"avatarUrl","kind":"scalar","type":"String"},{"name":"birthDate","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserProfile"}],"dbName":null},"Friendship":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requesterId","kind":"scalar","type":"String"},{"name":"receiverId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"FriendshipStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"receiver","kind":"object","type":"User","relationName":"FriendReceiver"},{"name":"requester","kind":"object","type":"User","relationName":"FriendRequester"}],"dbName":null},"PasswordReset":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"tokenHash","kind":"scalar","type":"String"},{"name":"usedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"PasswordResetToUser"}],"dbName":null},"ConversationGroup":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"activity","kind":"object","type":"Activity","relationName":"ActivityToConversationGroup"},{"name":"messages","kind":"object","type":"Message","relationName":"ConversationGroupToMessage"}],"dbName":null},"Message":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"conversationGroupId","kind":"scalar","type":"String"},{"name":"senderId","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"MessageType"},{"name":"content","kind":"scalar","type":"String"},{"name":"edited","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"attachments","kind":"object","type":"Attachment","relationName":"AttachmentToMessage"},{"name":"conversationGroup","kind":"object","type":"ConversationGroup","relationName":"ConversationGroupToMessage"},{"name":"sender","kind":"object","type":"User","relationName":"MessageToUser"}],"dbName":null},"Attachment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"messageId","kind":"scalar","type":"String"},{"name":"url","kind":"scalar","type":"String"},{"name":"fileName","kind":"scalar","type":"String"},{"name":"mimeType","kind":"scalar","type":"String"},{"name":"size","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"message","kind":"object","type":"Message","relationName":"AttachmentToMessage"}],"dbName":null},"knowledge_chunks":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"source","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"}],"dbName":null},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"type","kind":"enum","type":"NotificationType"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"data","kind":"scalar","type":"Json"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"}],"dbName":null},"WebsiteUsage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"sessionId","kind":"scalar","type":"String"},{"name":"domain","kind":"scalar","type":"String"},{"name":"startedAt","kind":"scalar","type":"DateTime"},{"name":"endedAt","kind":"scalar","type":"DateTime"},{"name":"durationSec","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"UserToWebsiteUsage"},{"name":"session","kind":"object","type":"Session","relationName":"SessionToWebsiteUsage"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","creator","task","user","dailyProgress","activity","receiver","sender","invitations","members","achievement","users","_count","acheivements","progress","entries","schedules","message","attachments","conversationGroup","messages","group","createdActivities","ActivityDailyProgress","receivedInvitations","sentInvitations","createdTasks","requester","receivedRequests","sentRequests","notification","passwordResets","session","websiteUsage","sessions","profile","achievements","chats","conversation","ChatConversation.findUnique","ChatConversation.findUniqueOrThrow","ChatConversation.findFirst","ChatConversation.findFirstOrThrow","ChatConversation.findMany","data","ChatConversation.createOne","ChatConversation.createMany","ChatConversation.createManyAndReturn","ChatConversation.updateOne","ChatConversation.updateMany","ChatConversation.updateManyAndReturn","create","update","ChatConversation.upsertOne","ChatConversation.deleteOne","ChatConversation.deleteMany","having","_min","_max","ChatConversation.groupBy","ChatConversation.aggregate","ChatMessage.findUnique","ChatMessage.findUniqueOrThrow","ChatMessage.findFirst","ChatMessage.findFirstOrThrow","ChatMessage.findMany","ChatMessage.createOne","ChatMessage.createMany","ChatMessage.createManyAndReturn","ChatMessage.updateOne","ChatMessage.updateMany","ChatMessage.updateManyAndReturn","ChatMessage.upsertOne","ChatMessage.deleteOne","ChatMessage.deleteMany","ChatMessage.groupBy","ChatMessage.aggregate","TaskAchievement.findUnique","TaskAchievement.findUniqueOrThrow","TaskAchievement.findFirst","TaskAchievement.findFirstOrThrow","TaskAchievement.findMany","TaskAchievement.createOne","TaskAchievement.createMany","TaskAchievement.createManyAndReturn","TaskAchievement.updateOne","TaskAchievement.updateMany","TaskAchievement.updateManyAndReturn","TaskAchievement.upsertOne","TaskAchievement.deleteOne","TaskAchievement.deleteMany","_avg","_sum","TaskAchievement.groupBy","TaskAchievement.aggregate","UserTaskAchievement.findUnique","UserTaskAchievement.findUniqueOrThrow","UserTaskAchievement.findFirst","UserTaskAchievement.findFirstOrThrow","UserTaskAchievement.findMany","UserTaskAchievement.createOne","UserTaskAchievement.createMany","UserTaskAchievement.createManyAndReturn","UserTaskAchievement.updateOne","UserTaskAchievement.updateMany","UserTaskAchievement.updateManyAndReturn","UserTaskAchievement.upsertOne","UserTaskAchievement.deleteOne","UserTaskAchievement.deleteMany","UserTaskAchievement.groupBy","UserTaskAchievement.aggregate","Activity.findUnique","Activity.findUniqueOrThrow","Activity.findFirst","Activity.findFirstOrThrow","Activity.findMany","Activity.createOne","Activity.createMany","Activity.createManyAndReturn","Activity.updateOne","Activity.updateMany","Activity.updateManyAndReturn","Activity.upsertOne","Activity.deleteOne","Activity.deleteMany","Activity.groupBy","Activity.aggregate","ActivityMember.findUnique","ActivityMember.findUniqueOrThrow","ActivityMember.findFirst","ActivityMember.findFirstOrThrow","ActivityMember.findMany","ActivityMember.createOne","ActivityMember.createMany","ActivityMember.createManyAndReturn","ActivityMember.updateOne","ActivityMember.updateMany","ActivityMember.updateManyAndReturn","ActivityMember.upsertOne","ActivityMember.deleteOne","ActivityMember.deleteMany","ActivityMember.groupBy","ActivityMember.aggregate","ActivityInvitation.findUnique","ActivityInvitation.findUniqueOrThrow","ActivityInvitation.findFirst","ActivityInvitation.findFirstOrThrow","ActivityInvitation.findMany","ActivityInvitation.createOne","ActivityInvitation.createMany","ActivityInvitation.createManyAndReturn","ActivityInvitation.updateOne","ActivityInvitation.updateMany","ActivityInvitation.updateManyAndReturn","ActivityInvitation.upsertOne","ActivityInvitation.deleteOne","ActivityInvitation.deleteMany","ActivityInvitation.groupBy","ActivityInvitation.aggregate","Quiz.findUnique","Quiz.findUniqueOrThrow","Quiz.findFirst","Quiz.findFirstOrThrow","Quiz.findMany","Quiz.createOne","Quiz.createMany","Quiz.createManyAndReturn","Quiz.updateOne","Quiz.updateMany","Quiz.updateManyAndReturn","Quiz.upsertOne","Quiz.deleteOne","Quiz.deleteMany","Quiz.groupBy","Quiz.aggregate","ActivityTask.findUnique","ActivityTask.findUniqueOrThrow","ActivityTask.findFirst","ActivityTask.findFirstOrThrow","ActivityTask.findMany","ActivityTask.createOne","ActivityTask.createMany","ActivityTask.createManyAndReturn","ActivityTask.updateOne","ActivityTask.updateMany","ActivityTask.updateManyAndReturn","ActivityTask.upsertOne","ActivityTask.deleteOne","ActivityTask.deleteMany","ActivityTask.groupBy","ActivityTask.aggregate","TaskSchedule.findUnique","TaskSchedule.findUniqueOrThrow","TaskSchedule.findFirst","TaskSchedule.findFirstOrThrow","TaskSchedule.findMany","TaskSchedule.createOne","TaskSchedule.createMany","TaskSchedule.createManyAndReturn","TaskSchedule.updateOne","TaskSchedule.updateMany","TaskSchedule.updateManyAndReturn","TaskSchedule.upsertOne","TaskSchedule.deleteOne","TaskSchedule.deleteMany","TaskSchedule.groupBy","TaskSchedule.aggregate","TaskProgress.findUnique","TaskProgress.findUniqueOrThrow","TaskProgress.findFirst","TaskProgress.findFirstOrThrow","TaskProgress.findMany","TaskProgress.createOne","TaskProgress.createMany","TaskProgress.createManyAndReturn","TaskProgress.updateOne","TaskProgress.updateMany","TaskProgress.updateManyAndReturn","TaskProgress.upsertOne","TaskProgress.deleteOne","TaskProgress.deleteMany","TaskProgress.groupBy","TaskProgress.aggregate","TaskProgressEntry.findUnique","TaskProgressEntry.findUniqueOrThrow","TaskProgressEntry.findFirst","TaskProgressEntry.findFirstOrThrow","TaskProgressEntry.findMany","TaskProgressEntry.createOne","TaskProgressEntry.createMany","TaskProgressEntry.createManyAndReturn","TaskProgressEntry.updateOne","TaskProgressEntry.updateMany","TaskProgressEntry.updateManyAndReturn","TaskProgressEntry.upsertOne","TaskProgressEntry.deleteOne","TaskProgressEntry.deleteMany","TaskProgressEntry.groupBy","TaskProgressEntry.aggregate","ActivityDailyProgress.findUnique","ActivityDailyProgress.findUniqueOrThrow","ActivityDailyProgress.findFirst","ActivityDailyProgress.findFirstOrThrow","ActivityDailyProgress.findMany","ActivityDailyProgress.createOne","ActivityDailyProgress.createMany","ActivityDailyProgress.createManyAndReturn","ActivityDailyProgress.updateOne","ActivityDailyProgress.updateMany","ActivityDailyProgress.updateManyAndReturn","ActivityDailyProgress.upsertOne","ActivityDailyProgress.deleteOne","ActivityDailyProgress.deleteMany","ActivityDailyProgress.groupBy","ActivityDailyProgress.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","UserProfile.findUnique","UserProfile.findUniqueOrThrow","UserProfile.findFirst","UserProfile.findFirstOrThrow","UserProfile.findMany","UserProfile.createOne","UserProfile.createMany","UserProfile.createManyAndReturn","UserProfile.updateOne","UserProfile.updateMany","UserProfile.updateManyAndReturn","UserProfile.upsertOne","UserProfile.deleteOne","UserProfile.deleteMany","UserProfile.groupBy","UserProfile.aggregate","Friendship.findUnique","Friendship.findUniqueOrThrow","Friendship.findFirst","Friendship.findFirstOrThrow","Friendship.findMany","Friendship.createOne","Friendship.createMany","Friendship.createManyAndReturn","Friendship.updateOne","Friendship.updateMany","Friendship.updateManyAndReturn","Friendship.upsertOne","Friendship.deleteOne","Friendship.deleteMany","Friendship.groupBy","Friendship.aggregate","PasswordReset.findUnique","PasswordReset.findUniqueOrThrow","PasswordReset.findFirst","PasswordReset.findFirstOrThrow","PasswordReset.findMany","PasswordReset.createOne","PasswordReset.createMany","PasswordReset.createManyAndReturn","PasswordReset.updateOne","PasswordReset.updateMany","PasswordReset.updateManyAndReturn","PasswordReset.upsertOne","PasswordReset.deleteOne","PasswordReset.deleteMany","PasswordReset.groupBy","PasswordReset.aggregate","ConversationGroup.findUnique","ConversationGroup.findUniqueOrThrow","ConversationGroup.findFirst","ConversationGroup.findFirstOrThrow","ConversationGroup.findMany","ConversationGroup.createOne","ConversationGroup.createMany","ConversationGroup.createManyAndReturn","ConversationGroup.updateOne","ConversationGroup.updateMany","ConversationGroup.updateManyAndReturn","ConversationGroup.upsertOne","ConversationGroup.deleteOne","ConversationGroup.deleteMany","ConversationGroup.groupBy","ConversationGroup.aggregate","Message.findUnique","Message.findUniqueOrThrow","Message.findFirst","Message.findFirstOrThrow","Message.findMany","Message.createOne","Message.createMany","Message.createManyAndReturn","Message.updateOne","Message.updateMany","Message.updateManyAndReturn","Message.upsertOne","Message.deleteOne","Message.deleteMany","Message.groupBy","Message.aggregate","Attachment.findUnique","Attachment.findUniqueOrThrow","Attachment.findFirst","Attachment.findFirstOrThrow","Attachment.findMany","Attachment.createOne","Attachment.createMany","Attachment.createManyAndReturn","Attachment.updateOne","Attachment.updateMany","Attachment.updateManyAndReturn","Attachment.upsertOne","Attachment.deleteOne","Attachment.deleteMany","Attachment.groupBy","Attachment.aggregate","knowledge_chunks.findUnique","knowledge_chunks.findUniqueOrThrow","knowledge_chunks.findFirst","knowledge_chunks.findFirstOrThrow","knowledge_chunks.findMany","knowledge_chunks.createOne","knowledge_chunks.createMany","knowledge_chunks.createManyAndReturn","knowledge_chunks.updateOne","knowledge_chunks.updateMany","knowledge_chunks.updateManyAndReturn","knowledge_chunks.upsertOne","knowledge_chunks.deleteOne","knowledge_chunks.deleteMany","knowledge_chunks.groupBy","knowledge_chunks.aggregate","Notification.findUnique","Notification.findUniqueOrThrow","Notification.findFirst","Notification.findFirstOrThrow","Notification.findMany","Notification.createOne","Notification.createMany","Notification.createManyAndReturn","Notification.updateOne","Notification.updateMany","Notification.updateManyAndReturn","Notification.upsertOne","Notification.deleteOne","Notification.deleteMany","Notification.groupBy","Notification.aggregate","WebsiteUsage.findUnique","WebsiteUsage.findUniqueOrThrow","WebsiteUsage.findFirst","WebsiteUsage.findFirstOrThrow","WebsiteUsage.findMany","WebsiteUsage.createOne","WebsiteUsage.createMany","WebsiteUsage.createManyAndReturn","WebsiteUsage.updateOne","WebsiteUsage.updateMany","WebsiteUsage.updateManyAndReturn","WebsiteUsage.upsertOne","WebsiteUsage.deleteOne","WebsiteUsage.deleteMany","WebsiteUsage.groupBy","WebsiteUsage.aggregate","AND","OR","NOT","id","userId","sessionId","domain","startedAt","endedAt","durationSec","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","title","content","NotificationType","type","isRead","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","source","created_at","messageId","url","fileName","mimeType","size","conversationGroupId","senderId","MessageType","edited","deletedAt","updatedAt","activityId","every","some","none","tokenHash","usedAt","expiresAt","requesterId","receiverId","FriendshipStatus","status","firstName","lastName","bio","avatarUrl","birthDate","refreshTokenHash","deviceName","ipAdress","userAgent","revokedAt","lastUsedAt","name","username","email","password","avatar","GlobalRole","globalRole","isActive","googleId","date","completedTasks","totalTasks","completionPercentage","completed","progressId","value","note","taskId","completedValue","targetSnapshot","isCompleted","currentStreak","longestStreak","DayOfWeek","day","unit","targetValue","ScheduleType","scheduleType","description","imageUrl","creatorId","TaskType","taskType","question","answer","options","has","hasEvery","hasSome","acceptedAt","ActivityRole","role","joinedAt","leftAt","completionRate","memberCount","taskCount","Visibility","visibility","achievementId","isEarned","completedStreak","iconUrl","totalValue","IconType","iconType","iconValue","conversationId","ChatMessageRole","toolCalls","toolCallId","requesterId_receiverId","taskId_day","taskId_userId_date","userId_achievementId","activityId_userId","activityId_userId_date","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "yAzeAYADCQUAAMoFACAWAACPBgAgsQMAAI4GADCyAwAAYAAQswMAAI4GADC0AwEAAAABtQMBALIFACG7A0AAvwUAId4DQAC_BQAhAQAAAAEAIBMDAADKBQAgBAAA1wUAIAYAANQFACAKAADVBQAgCwAA1gUAIBcAAL0GACCxAwAAuwYAMLIDAAADABCzAwAAuwYAMLQDAQCyBQAhuwNAAL8FACHeA0AAvwUAIfUDAQCyBQAhkgQBALIFACGTBAEAsgUAIZQEAQCyBQAhowQCAJEGACGkBAIAkQYAIaYEAAC8BqYEIgYDAACbBwAgBAAAtgoAIAYAALMKACAKAAC0CgAgCwAAtQoAIBcAAIoLACATAwAAygUAIAQAANcFACAGAADUBQAgCgAA1QUAIAsAANYFACAXAAC9BgAgsQMAALsGADCyAwAAAwAQswMAALsGADC0AwEAAAABuwNAAL8FACHeA0AAvwUAIfUDAQCyBQAhkgQBALIFACGTBAEAsgUAIZQEAQCyBQAhowQCAJEGACGkBAIAkQYAIaYEAAC8BqYEIgMAAAADACABAAAEADACAAAFACAPBAAAwAUAIAUAAMoFACCxAwAAugYAMLIDAAAHABCzAwAAugYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH-A0AAvwUAIf8DAgCRBgAhgAQCAJEGACGBBBAApQYAIYIEIADSBQAhAgQAAIcHACAFAACbBwAgEAQAAMAFACAFAADKBQAgsQMAALoGADCyAwAABwAQswMAALoGADC0AwEAAAABtQMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH-A0AAvwUAIf8DAgCRBgAhgAQCAJEGACGBBBAApQYAIYIEIADSBQAhuAQAALkGACADAAAABwAgAQAACAAwAgAACQAgDQcAAMAFACAIAADKBQAgCQAAygUAILEDAAC4BgAwsgMAAAsAELMDAAC4BgAwtAMBALIFACG7A0AAvwUAIdoDAQCyBQAh3wMBALIFACHlA0AAswUAIecDAQCyBQAhnQRAALMFACEFBwAAhwcAIAgAAJsHACAJAACbBwAg5QMAAL4GACCdBAAAvgYAIA0HAADABQAgCAAAygUAIAkAAMoFACCxAwAAuAYAMLIDAAALABCzAwAAuAYAMLQDAQAAAAG7A0AAvwUAIdoDAQCyBQAh3wMBALIFACHlA0AAswUAIecDAQCyBQAhnQRAALMFACEDAAAACwAgAQAADAAwAgAADQAgDwUAAMoFACAHAADABQAgsQMAALYGADCyAwAADwAQswMAALYGADC0AwEAsgUAIbUDAQCyBQAh3wMBALIFACH8AyAA0gUAIYoEAgCRBgAhiwQCAJEGACGfBAAAtwafBCKgBEAAvwUAIaEEQACzBQAhogQIALAGACEDBQAAmwcAIAcAAIcHACChBAAAvgYAIBAFAADKBQAgBwAAwAUAILEDAAC2BgAwsgMAAA8AELMDAAC2BgAwtAMBAAAAAbUDAQCyBQAh3wMBALIFACH8AyAA0gUAIYoEAgCRBgAhiwQCAJEGACGfBAAAtwafBCKgBEAAvwUAIaEEQACzBQAhogQIALAGACG3BAAAtQYAIAMAAAAPACABAAAQADACAAARACAUAwAAygUAIAcAAMAFACAPAACzBgAgEAAA3AUAIBIAALQGACCxAwAArwYAMLIDAAATABCzAwAArwYAMLQDAQCyBQAhuwNAAL8FACHeA0AAvwUAId8DAQCyBQAh9QMBALIFACGOBAEAsgUAIY8ECACwBgAhkQQAALEGkQQikgQBALIFACGTBAEAyQUAIZQEAQCyBQAhlgQAALIGlgQiBgMAAJsHACAHAACHBwAgDwAAjwsAIBAAALsKACASAACQCwAgkwQAAL4GACAUAwAAygUAIAcAAMAFACAPAACzBgAgEAAA3AUAIBIAALQGACCxAwAArwYAMLIDAAATABCzAwAArwYAMLQDAQAAAAG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH1AwEAsgUAIY4EAQCyBQAhjwQIALAGACGRBAAAsQaRBCKSBAEAsgUAIZMEAQDJBQAhlAQBALIFACGWBAAAsgaWBCIDAAAAEwAgAQAAFAAwAgAAFQAgDwQAAKMGACANAADeBQAgsQMAAK0GADCyAwAAFwAQswMAAK0GADC0AwEAsgUAIbsDQAC_BQAhxwMBALIFACGGBAEAsgUAIY4EAQDJBQAhkgQBALIFACGqBAEAyQUAIasEAgCRBgAhrQQAAK4GrQQjrgQBAMkFACEGBAAAiwsAIA0AAL0KACCOBAAAvgYAIKoEAAC-BgAgrQQAAL4GACCuBAAAvgYAIA8EAACjBgAgDQAA3gUAILEDAACtBgAwsgMAABcAELMDAACtBgAwtAMBAAAAAbsDQAC_BQAhxwMBALIFACGGBAEAsgUAIY4EAQDJBQAhkgQBALIFACGqBAEAyQUAIasEAgCRBgAhrQQAAK4GrQQjrgQBAMkFACEDAAAAFwAgAQAAGAAwAgAAGQAgCwUAAMoFACAMAACsBgAgsQMAAKsGADCyAwAAGwAQswMAAKsGADC0AwEAsgUAIbUDAQCyBQAhhwQCAJEGACGnBAEAsgUAIagEIADSBQAhqQQCAJEGACECBQAAmwcAIAwAAI4LACAMBQAAygUAIAwAAKwGACCxAwAAqwYAMLIDAAAbABCzAwAAqwYAMLQDAQAAAAG1AwEAsgUAIYcEAgCRBgAhpwQBALIFACGoBCAA0gUAIakEAgCRBgAhtgQAAKoGACADAAAAGwAgAQAAHAAwAgAAHQAgAQAAABsAIBIEAACjBgAgBQAAygUAIBEAAKkGACCxAwAAqAYAMLIDAAAgABCzAwAAqAYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH-A0AAvwUAIYYEAQCyBQAhhwQQAKUGACGIBBAApQYAIYkEIADSBQAhigQCAJEGACGLBAIAkQYAIQMEAACLCwAgBQAAmwcAIBEAAI0LACATBAAAowYAIAUAAMoFACARAACpBgAgsQMAAKgGADCyAwAAIAAQswMAAKgGADC0AwEAAAABtQMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH-A0AAvwUAIYYEAQCyBQAhhwQQAKUGACGIBBAApQYAIYkEIADSBQAhigQCAJEGACGLBAIAkQYAIbUEAACnBgAgAwAAACAAIAEAACEAMAIAACIAIAkQAACmBgAgsQMAAKQGADCyAwAAJAAQswMAAKQGADC0AwEAsgUAIbsDQAC_BQAhgwQBALIFACGEBBAApQYAIYUEAQDJBQAhAhAAAIwLACCFBAAAvgYAIAkQAACmBgAgsQMAAKQGADCyAwAAJAAQswMAAKQGADC0AwEAAAABuwNAAL8FACGDBAEAsgUAIYQEEAClBgAhhQQBAMkFACEDAAAAJAAgAQAAJQAwAgAAJgAgAQAAACQAIAcEAACjBgAgsQMAAKEGADCyAwAAKQAQswMAAKEGADC0AwEAsgUAIYYEAQCyBQAhjQQAAKIGjQQiAQQAAIsLACAIBAAAowYAILEDAAChBgAwsgMAACkAELMDAAChBgAwtAMBAAAAAYYEAQCyBQAhjQQAAKIGjQQitAQAAKAGACADAAAAKQAgAQAAKgAwAgAAKwAgAQAAABcAIAEAAAAgACABAAAAKQAgCAcAAMAFACAWAADBBQAgsQMAAL4FADCyAwAAMAAQswMAAL4FADC0AwEAsgUAIbsDQAC_BQAh3wMBALIFACEBAAAAMAAgDwkAAMoFACAUAACeBgAgFQAAnwYAILEDAACcBgAwsgMAADIAELMDAACcBgAwtAMBALIFACG7A0AAvwUAIcgDAQDJBQAhygMAAJ0G3AMi2QMBALIFACHaAwEAsgUAIdwDIADSBQAh3QNAALMFACHeA0AAvwUAIQUJAACbBwAgFAAAiQsAIBUAAIoLACDIAwAAvgYAIN0DAAC-BgAgDwkAAMoFACAUAACeBgAgFQAAnwYAILEDAACcBgAwsgMAADIAELMDAACcBgAwtAMBAAAAAbsDQAC_BQAhyAMBAMkFACHKAwAAnQbcAyLZAwEAsgUAIdoDAQCyBQAh3AMgANIFACHdA0AAswUAId4DQAC_BQAhAwAAADIAIAEAADMAMAIAADQAIAsTAACbBgAgsQMAAJoGADCyAwAANgAQswMAAJoGADC0AwEAsgUAIbsDQAC_BQAh1AMBALIFACHVAwEAsgUAIdYDAQCyBQAh1wMBALIFACHYAwIAkQYAIQETAACICwAgCxMAAJsGACCxAwAAmgYAMLIDAAA2ABCzAwAAmgYAMLQDAQAAAAG7A0AAvwUAIdQDAQCyBQAh1QMBALIFACHWAwEAsgUAIdcDAQCyBQAh2AMCAJEGACEDAAAANgAgAQAANwAwAgAAOAAgAQAAADYAIAEAAAAyACABAAAABwAgAQAAAAsAIAEAAAAPACABAAAAEwAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAALACABAAAMADACAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAA8AIAEAABAAMAIAABEAIAMAAAATACABAAAUADACAAAVACALCAAAygUAIB0AAMoFACCxAwAAmAYAMLIDAABFABCzAwAAmAYAMLQDAQCyBQAhuwNAAL8FACHeA0AAvwUAIeYDAQCyBQAh5wMBALIFACHpAwAAmQbpAyICCAAAmwcAIB0AAJsHACAMCAAAygUAIB0AAMoFACCxAwAAmAYAMLIDAABFABCzAwAAmAYAMLQDAQAAAAG7A0AAvwUAId4DQAC_BQAh5gMBALIFACHnAwEAsgUAIekDAACZBukDIrMEAACXBgAgAwAAAEUAIAEAAEYAMAIAAEcAIAMAAABFACABAABGADACAABHACADAAAAMgAgAQAAMwAwAgAANAAgDAUAAMoFACAuAACMBgAgsQMAAJUGADCyAwAASwAQswMAAJUGADC0AwEAsgUAIbUDAQCyBQAhuwNAAL8FACHHAwEAsgUAIcgDAQCyBQAhygMAAJYGygMiywMgANIFACECBQAAmwcAIC4AAL4GACAMBQAAygUAIC4AAIwGACCxAwAAlQYAMLIDAABLABCzAwAAlQYAMLQDAQAAAAG1AwEAsgUAIbsDQAC_BQAhxwMBALIFACHIAwEAsgUAIcoDAACWBsoDIssDIADSBQAhAwAAAEsAIAEAAEwAMAIAAE0AIAoFAADKBQAgsQMAAJQGADCyAwAATwAQswMAAJQGADC0AwEAsgUAIbUDAQCyBQAhuwNAAL8FACHjAwEAsgUAIeQDQACzBQAh5QNAAL8FACECBQAAmwcAIOQDAAC-BgAgCgUAAMoFACCxAwAAlAYAMLIDAABPABCzAwAAlAYAMLQDAQAAAAG1AwEAsgUAIbsDQAC_BQAh4wMBALIFACHkA0AAswUAIeUDQAC_BQAhAwAAAE8AIAEAAFAAMAIAAFEAIA8FAADKBQAgIwAA4AUAILEDAACTBgAwsgMAAFMAELMDAACTBgAwtAMBALIFACG1AwEAsgUAIbsDQAC_BQAh5QNAAL8FACHvAwEAsgUAIfADAQDJBQAh8QMBAMkFACHyAwEAyQUAIfMDQACzBQAh9ANAAL8FACEGBQAAmwcAICMAAL8KACDwAwAAvgYAIPEDAAC-BgAg8gMAAL4GACDzAwAAvgYAIA8FAADKBQAgIwAA4AUAILEDAACTBgAwsgMAAFMAELMDAACTBgAwtAMBAAAAAbUDAQCyBQAhuwNAAL8FACHlA0AAvwUAIe8DAQAAAAHwAwEAyQUAIfEDAQDJBQAh8gMBAMkFACHzA0AAswUAIfQDQAC_BQAhAwAAAFMAIAEAAFQAMAIAAFUAIA0FAADKBQAgIgAAkgYAILEDAACQBgAwsgMAAFcAELMDAACQBgAwtAMBALIFACG1AwEAsgUAIbYDAQCyBQAhtwMBALIFACG4A0AAvwUAIbkDQACzBQAhugMCAJEGACG7A0AAvwUAIQMFAACbBwAgIgAAhwsAILkDAAC-BgAgDQUAAMoFACAiAACSBgAgsQMAAJAGADCyAwAAVwAQswMAAJAGADC0AwEAAAABtQMBALIFACG2AwEAsgUAIbcDAQCyBQAhuANAAL8FACG5A0AAswUAIboDAgCRBgAhuwNAAL8FACEDAAAAVwAgAQAAWAAwAgAAWQAgAQAAAFcAIAMAAAAgACABAAAhADACAAAiACANBQAAygUAILEDAADIBQAwsgMAAF0AELMDAADIBQAwtAMBALIFACG1AwEAsgUAIbsDQAC_BQAh3gNAAL8FACHqAwEAyQUAIesDAQDJBQAh7AMBAMkFACHtAwEAyQUAIe4DQACzBQAhAQAAAF0AIAMAAAAbACABAAAcADACAAAdACAJBQAAygUAIBYAAI8GACCxAwAAjgYAMLIDAABgABCzAwAAjgYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAId4DQAC_BQAhAgUAAJsHACAWAACGCwAgAwAAAGAAIAEAAGEAMAIAAAEAIAMAAABXACABAABYADACAABZACABAAAAAwAgAQAAAAcAIAEAAAALACABAAAACwAgAQAAAA8AIAEAAAATACABAAAARQAgAQAAAEUAIAEAAAAyACABAAAASwAgAQAAAE8AIAEAAABTACABAAAAIAAgAQAAABsAIAEAAABgACABAAAAVwAgCygAAI0GACCxAwAAigYAMLIDAAB0ABCzAwAAigYAMLQDAQCyBQAhuwNAAL8FACHIAwEAyQUAIZ8EAACLBrEEIq8EAQCyBQAhsQQAAIwGACCyBAEAyQUAIQQoAACFCwAgyAMAAL4GACCxBAAAvgYAILIEAAC-BgAgCygAAI0GACCxAwAAigYAMLIDAAB0ABCzAwAAigYAMLQDAQAAAAG7A0AAvwUAIcgDAQDJBQAhnwQAAIsGsQQirwQBALIFACGxBAAAjAYAILIEAQDJBQAhAwAAAHQAIAEAAHUAMAIAAHYAIAEAAAB0ACABAAAAAQAgAwAAAGAAIAEAAGEAMAIAAAEAIAMAAABgACABAABhADACAAABACADAAAAYAAgAQAAYQAwAgAAAQAgBgUAAIQLACAWAADnBwAgtAMBAAAAAbUDAQAAAAG7A0AAAAAB3gNAAAAAAQEuAAB9ACAEtAMBAAAAAbUDAQAAAAG7A0AAAAAB3gNAAAAAAQEuAAB_ADABLgAAfwAwBgUAAIMLACAWAADYBwAgtAMBAMQGACG1AwEAxAYAIbsDQADFBgAh3gNAAMUGACECAAAAAQAgLgAAggEAIAS0AwEAxAYAIbUDAQDEBgAhuwNAAMUGACHeA0AAxQYAIQIAAABgACAuAACEAQAgAgAAAGAAIC4AAIQBACADAAAAAQAgNQAAfQAgNgAAggEAIAEAAAABACABAAAAYAAgAw4AAIALACA7AACCCwAgPAAAgQsAIAexAwAAiQYAMLIDAACLAQAQswMAAIkGADC0AwEAlgUAIbUDAQCWBQAhuwNAAJcFACHeA0AAlwUAIQMAAABgACABAACKAQAwOgAAiwEAIAMAAABgACABAABhADACAAABACABAAAAdgAgAQAAAHYAIAMAAAB0ACABAAB1ADACAAB2ACADAAAAdAAgAQAAdQAwAgAAdgAgAwAAAHQAIAEAAHUAMAIAAHYAIAgoAAD_CgAgtAMBAAAAAbsDQAAAAAHIAwEAAAABnwQAAACxBAKvBAEAAAABsQSAAAAAAbIEAQAAAAEBLgAAkwEAIAe0AwEAAAABuwNAAAAAAcgDAQAAAAGfBAAAALEEAq8EAQAAAAGxBIAAAAABsgQBAAAAAQEuAACVAQAwAS4AAJUBADAIKAAA_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_AUAMLQDAQCWBQAhuwNAAJcFACHeA0AAlwUAIfUDAQCWBQAhkgQBAJYFACGTBAEAlgUAIZQEAQCWBQAhowQCAJkFACGkBAIAmQUAIaYEAAD9BaYEIgMAAAADACABAADiAQAwOgAA4wEAIAMAAAADACABAAAEADACAAAFACABAAAAEQAgAQAAABEAIAMAAAAPACABAAAQADACAAARACADAAAADwAgAQAAEAAwAgAAEQAgAwAAAA8AIAEAABAAMAIAABEAIAwFAACGCgAgBwAAsQkAILQDAQAAAAG1AwEAAAAB3wMBAAAAAfwDIAAAAAGKBAIAAAABiwQCAAAAAZ8EAAAAnwQCoARAAAAAAaEEQAAAAAGiBAgAAAABAS4AAOsBACAKtAMBAAAAAbUDAQAAAAHfAwEAAAAB_AMgAAAAAYoEAgAAAAGLBAIAAAABnwQAAACfBAKgBEAAAAABoQRAAAAAAaIECAAAAAEBLgAA7QEAMAEuAADtAQAwDAUAAIQKACAHAACvCQAgtAMBAMQGACG1AwEAxAYAId8DAQDEBgAh_AMgANAGACGKBAIAxwYAIYsEAgDHBgAhnwQAAK0JnwQioARAAMUGACGhBEAAxgYAIaIECADkCAAhAgAAABEAIC4AAPABACAKtAMBAMQGACG1AwEAxAYAId8DAQDEBgAh_AMgANAGACGKBAIAxwYAIYsEAgDHBgAhnwQAAK0JnwQioARAAMUGACGhBEAAxgYAIaIECADkCAAhAgAAAA8AIC4AAPIBACACAAAADwAgLgAA8gEAIAMAAAARACA1AADrAQAgNgAA8AEAIAEAAAARACABAAAADwAgBg4AAOMKACA7AADmCgAgPAAA5QoAIF0AAOQKACBeAADnCgAgoQQAAL4GACANsQMAAPgFADCyAwAA-QEAELMDAAD4BQAwtAMBAJYFACG1AwEAlgUAId8DAQCWBQAh_AMgAKYFACGKBAIAmQUAIYsEAgCZBQAhnwQAAPkFnwQioARAAJcFACGhBEAAmAUAIaIECADsBQAhAwAAAA8AIAEAAPgBADA6AAD5AQAgAwAAAA8AIAEAABAAMAIAABEAIAEAAAANACABAAAADQAgAwAAAAsAIAEAAAwAMAIAAA0AIAMAAAALACABAAAMADACAAANACADAAAACwAgAQAADAAwAgAADQAgCgcAAMAJACAIAADBCQAgCQAAzAkAILQDAQAAAAG7A0AAAAAB2gMBAAAAAd8DAQAAAAHlA0AAAAAB5wMBAAAAAZ0EQAAAAAEBLgAAgQIAIAe0AwEAAAABuwNAAAAAAdoDAQAAAAHfAwEAAAAB5QNAAAAAAecDAQAAAAGdBEAAAAABAS4AAIMCADABLgAAgwIAMAoHAAC9CQAgCAAAvgkAIAkAAMoJACC0AwEAxAYAIbsDQADFBgAh2gMBAMQGACHfAwEAxAYAIeUDQADGBgAh5wMBAMQGACGdBEAAxgYAIQIAAAANACAuAACGAgAgB7QDAQDEBgAhuwNAAMUGACHaAwEAxAYAId8DAQDEBgAh5QNAAMYGACHnAwEAxAYAIZ0EQADGBgAhAgAAAAsAIC4AAIgCACACAAAACwAgLgAAiAIAIAMAAAANACA1AACBAgAgNgAAhgIAIAEAAAANACABAAAACwAgBQ4AAOAKACA7AADiCgAgPAAA4QoAIOUDAAC-BgAgnQQAAL4GACAKsQMAAPcFADCyAwAAjwIAELMDAAD3BQAwtAMBAJYFACG7A0AAlwUAIdoDAQCWBQAh3wMBAJYFACHlA0AAmAUAIecDAQCWBQAhnQRAAJgFACEDAAAACwAgAQAAjgIAMDoAAI8CACADAAAACwAgAQAADAAwAgAADQAgB7EDAAD2BQAwsgMAAJUCABCzAwAA9gUAMLQDAQAAAAGXBAEAsgUAIZgEAQDJBQAhmQQAAPUFACABAAAAkgIAIAEAAACSAgAgB7EDAAD2BQAwsgMAAJUCABCzAwAA9gUAMLQDAQCyBQAhlwQBALIFACGYBAEAyQUAIZkEAAD1BQAgAZgEAAC-BgAgAwAAAJUCACABAACWAgAwAgAAkgIAIAMAAACVAgAgAQAAlgIAMAIAAJICACADAAAAlQIAIAEAAJYCADACAACSAgAgBLQDAQAAAAGXBAEAAAABmAQBAAAAAZkEAADfCgAgAS4AAJoCACAEtAMBAAAAAZcEAQAAAAGYBAEAAAABmQQAAN8KACABLgAAnAIAMAEuAACcAgAwBLQDAQDEBgAhlwQBAMQGACGYBAEA4QYAIZkEAADeCgAgAgAAAJICACAuAACfAgAgBLQDAQDEBgAhlwQBAMQGACGYBAEA4QYAIZkEAADeCgAgAgAAAJUCACAuAAChAgAgAgAAAJUCACAuAAChAgAgAwAAAJICACA1AACaAgAgNgAAnwIAIAEAAACSAgAgAQAAAJUCACAEDgAA2woAIDsAAN0KACA8AADcCgAgmAQAAL4GACAHsQMAAPQFADCyAwAAqAIAELMDAAD0BQAwtAMBAJYFACGXBAEAlgUAIZgEAQC4BQAhmQQAAPUFACADAAAAlQIAIAEAAKcCADA6AACoAgAgAwAAAJUCACABAACWAgAwAgAAkgIAIAEAAAAVACABAAAAFQAgAwAAABMAIAEAABQAMAIAABUAIAMAAAATACABAAAUADACAAAVACADAAAAEwAgAQAAFAAwAgAAFQAgEQMAAPsJACAHAACfCQAgDwAAoAkAIBAAAKEJACASAACiCQAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB3wMBAAAAAfUDAQAAAAGOBAEAAAABjwQIAAAAAZEEAAAAkQQCkgQBAAAAAZMEAQAAAAGUBAEAAAABlgQAAACWBAIBLgAAsAIAIAy0AwEAAAABuwNAAAAAAd4DQAAAAAHfAwEAAAAB9QMBAAAAAY4EAQAAAAGPBAgAAAABkQQAAACRBAKSBAEAAAABkwQBAAAAAZQEAQAAAAGWBAAAAJYEAgEuAACyAgAwAS4AALICADARAwAA-QkAIAcAAOgIACAPAADpCAAgEAAA6ggAIBIAAOsIACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACHfAwEAxAYAIfUDAQDEBgAhjgQBAMQGACGPBAgA5AgAIZEEAADlCJEEIpIEAQDEBgAhkwQBAOEGACGUBAEAxAYAIZYEAADmCJYEIgIAAAAVACAuAAC1AgAgDLQDAQDEBgAhuwNAAMUGACHeA0AAxQYAId8DAQDEBgAh9QMBAMQGACGOBAEAxAYAIY8ECADkCAAhkQQAAOUIkQQikgQBAMQGACGTBAEA4QYAIZQEAQDEBgAhlgQAAOYIlgQiAgAAABMAIC4AALcCACACAAAAEwAgLgAAtwIAIAMAAAAVACA1AACwAgAgNgAAtQIAIAEAAAAVACABAAAAEwAgBg4AANYKACA7AADZCgAgPAAA2AoAIF0AANcKACBeAADaCgAgkwQAAL4GACAPsQMAAOsFADCyAwAAvgIAELMDAADrBQAwtAMBAJYFACG7A0AAlwUAId4DQACXBQAh3wMBAJYFACH1AwEAlgUAIY4EAQCWBQAhjwQIAOwFACGRBAAA7QWRBCKSBAEAlgUAIZMEAQC4BQAhlAQBAJYFACGWBAAA7gWWBCIDAAAAEwAgAQAAvQIAMDoAAL4CACADAAAAEwAgAQAAFAAwAgAAFQAgAQAAACsAIAEAAAArACADAAAAKQAgAQAAKgAwAgAAKwAgAwAAACkAIAEAACoAMAIAACsAIAMAAAApACABAAAqADACAAArACAEBAAA1QoAILQDAQAAAAGGBAEAAAABjQQAAACNBAIBLgAAxgIAIAO0AwEAAAABhgQBAAAAAY0EAAAAjQQCAS4AAMgCADABLgAAyAIAMAQEAADUCgAgtAMBAMQGACGGBAEAxAYAIY0EAAD2CI0EIgIAAAArACAuAADLAgAgA7QDAQDEBgAhhgQBAMQGACGNBAAA9giNBCICAAAAKQAgLgAAzQIAIAIAAAApACAuAADNAgAgAwAAACsAIDUAAMYCACA2AADLAgAgAQAAACsAIAEAAAApACADDgAA0QoAIDsAANMKACA8AADSCgAgBrEDAADnBQAwsgMAANQCABCzAwAA5wUAMLQDAQCWBQAhhgQBAJYFACGNBAAA6AWNBCIDAAAAKQAgAQAA0wIAMDoAANQCACADAAAAKQAgAQAAKgAwAgAAKwAgAQAAACIAIAEAAAAiACADAAAAIAAgAQAAIQAwAgAAIgAgAwAAACAAIAEAACEAMAIAACIAIAMAAAAgACABAAAhADACAAAiACAPBAAAlggAIAUAAIMJACARAACXCAAgtAMBAAAAAbUDAQAAAAG7A0AAAAAB3gNAAAAAAd8DAQAAAAH-A0AAAAABhgQBAAAAAYcEEAAAAAGIBBAAAAABiQQgAAAAAYoEAgAAAAGLBAIAAAABAS4AANwCACAMtAMBAAAAAbUDAQAAAAG7A0AAAAAB3gNAAAAAAd8DAQAAAAH-A0AAAAABhgQBAAAAAYcEEAAAAAGIBBAAAAABiQQgAAAAAYoEAgAAAAGLBAIAAAABAS4AAN4CADABLgAA3gIAMA8EAACHCAAgBQAAgQkAIBEAAIgIACC0AwEAxAYAIbUDAQDEBgAhuwNAAMUGACHeA0AAxQYAId8DAQDEBgAh_gNAAMUGACGGBAEAxAYAIYcEEACFCAAhiAQQAIUIACGJBCAA0AYAIYoEAgDHBgAhiwQCAMcGACECAAAAIgAgLgAA4QIAIAy0AwEAxAYAIbUDAQDEBgAhuwNAAMUGACHeA0AAxQYAId8DAQDEBgAh_gNAAMUGACGGBAEAxAYAIYcEEACFCAAhiAQQAIUIACGJBCAA0AYAIYoEAgDHBgAhiwQCAMcGACECAAAAIAAgLgAA4wIAIAIAAAAgACAuAADjAgAgAwAAACIAIDUAANwCACA2AADhAgAgAQAAACIAIAEAAAAgACAFDgAAzAoAIDsAAM8KACA8AADOCgAgXQAAzQoAIF4AANAKACAPsQMAAOYFADCyAwAA6gIAELMDAADmBQAwtAMBAJYFACG1AwEAlgUAIbsDQACXBQAh3gNAAJcFACHfAwEAlgUAIf4DQACXBQAhhgQBAJYFACGHBBAA4gUAIYgEEADiBQAhiQQgAKYFACGKBAIAmQUAIYsEAgCZBQAhAwAAACAAIAEAAOkCADA6AADqAgAgAwAAACAAIAEAACEAMAIAACIAIAEAAAAmACABAAAAJgAgAwAAACQAIAEAACUAMAIAACYAIAMAAAAkACABAAAlADACAAAmACADAAAAJAAgAQAAJQAwAgAAJgAgBhAAAMsKACC0AwEAAAABuwNAAAAAAYMEAQAAAAGEBBAAAAABhQQBAAAAAQEuAADyAgAgBbQDAQAAAAG7A0AAAAABgwQBAAAAAYQEEAAAAAGFBAEAAAABAS4AAPQCADABLgAA9AIAMAYQAADKCgAgtAMBAMQGACG7A0AAxQYAIYMEAQDEBgAhhAQQAIUIACGFBAEA4QYAIQIAAAAmACAuAAD3AgAgBbQDAQDEBgAhuwNAAMUGACGDBAEAxAYAIYQEEACFCAAhhQQBAOEGACECAAAAJAAgLgAA-QIAIAIAAAAkACAuAAD5AgAgAwAAACYAIDUAAPICACA2AAD3AgAgAQAAACYAIAEAAAAkACAGDgAAxQoAIDsAAMgKACA8AADHCgAgXQAAxgoAIF4AAMkKACCFBAAAvgYAIAixAwAA5QUAMLIDAACAAwAQswMAAOUFADC0AwEAlgUAIbsDQACXBQAhgwQBAJYFACGEBBAA4gUAIYUEAQC4BQAhAwAAACQAIAEAAP8CADA6AACAAwAgAwAAACQAIAEAACUAMAIAACYAIAEAAAAJACABAAAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgDAQAANoJACAFAACaCgAgtAMBAAAAAbUDAQAAAAG7A0AAAAAB3gNAAAAAAd8DAQAAAAH-A0AAAAAB_wMCAAAAAYAEAgAAAAGBBBAAAAABggQgAAAAAQEuAACIAwAgCrQDAQAAAAG1AwEAAAABuwNAAAAAAd4DQAAAAAHfAwEAAAAB_gNAAAAAAf8DAgAAAAGABAIAAAABgQQQAAAAAYIEIAAAAAEBLgAAigMAMAEuAACKAwAwDAQAANgJACAFAACYCgAgtAMBAMQGACG1AwEAxAYAIbsDQADFBgAh3gNAAMUGACHfAwEAxAYAIf4DQADFBgAh_wMCAMcGACGABAIAxwYAIYEEEACFCAAhggQgANAGACECAAAACQAgLgAAjQMAIAq0AwEAxAYAIbUDAQDEBgAhuwNAAMUGACHeA0AAxQYAId8DAQDEBgAh_gNAAMUGACH_AwIAxwYAIYAEAgDHBgAhgQQQAIUIACGCBCAA0AYAIQIAAAAHACAuAACPAwAgAgAAAAcAIC4AAI8DACADAAAACQAgNQAAiAMAIDYAAI0DACABAAAACQAgAQAAAAcAIAUOAADACgAgOwAAwwoAIDwAAMIKACBdAADBCgAgXgAAxAoAIA2xAwAA4QUAMLIDAACWAwAQswMAAOEFADC0AwEAlgUAIbUDAQCWBQAhuwNAAJcFACHeA0AAlwUAId8DAQCWBQAh_gNAAJcFACH_AwIAmQUAIYAEAgCZBQAhgQQQAOIFACGCBCAApgUAIQMAAAAHACABAACVAwAwOgAAlgMAIAMAAAAHACABAAAIADACAAAJACAfBwAA1gUAIBAAANwFACAWAADBBQAgGAAA0wUAIBkAANQFACAaAADVBQAgGwAA1QUAIBwAANcFACAeAADYBQAgHwAA2AUAICAAANkFACAhAADaBQAgIwAA4AUAICQAANsFACAlAADdBQAgJgAA3gUAICcAAN8FACCxAwAA0AUAMLIDAACcAwAQswMAANAFADC0AwEAAAABuwNAAL8FACHeA0AAvwUAIfUDAQDJBQAh9gMBAAAAAfcDAQAAAAH4AwEAyQUAIfkDAQDJBQAh-wMAANEF-wMi_AMgANIFACH9AwEAAAABAQAAAJkDACABAAAAmQMAIB8HAADWBQAgEAAA3AUAIBYAAMEFACAYAADTBQAgGQAA1AUAIBoAANUFACAbAADVBQAgHAAA1wUAIB4AANgFACAfAADYBQAgIAAA2QUAICEAANoFACAjAADgBQAgJAAA2wUAICUAAN0FACAmAADeBQAgJwAA3wUAILEDAADQBQAwsgMAAJwDABCzAwAA0AUAMLQDAQCyBQAhuwNAAL8FACHeA0AAvwUAIfUDAQDJBQAh9gMBAMkFACH3AwEAyQUAIfgDAQDJBQAh-QMBAMkFACH7AwAA0QX7AyL8AyAA0gUAIf0DAQDJBQAhFwcAALUKACAQAAC7CgAgFgAAiAcAIBgAALIKACAZAACzCgAgGgAAtAoAIBsAALQKACAcAAC2CgAgHgAAtwoAIB8AALcKACAgAAC4CgAgIQAAuQoAICMAAL8KACAkAAC6CgAgJQAAvAoAICYAAL0KACAnAAC-CgAg9QMAAL4GACD2AwAAvgYAIPcDAAC-BgAg-AMAAL4GACD5AwAAvgYAIP0DAAC-BgAgAwAAAJwDACABAACdAwAwAgAAmQMAIAMAAACcAwAgAQAAnQMAMAIAAJkDACADAAAAnAMAIAEAAJ0DADACAACZAwAgHAcAAKUKACAQAACtCgAgFgAAqQoAIBgAAKEKACAZAACiCgAgGgAAowoAIBsAAKQKACAcAACmCgAgHgAApwoAIB8AAKgKACAgAACqCgAgIQAAqwoAICMAALEKACAkAACsCgAgJQAArgoAICYAAK8KACAnAACwCgAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAfYDAQAAAAH3AwEAAAAB-AMBAAAAAfkDAQAAAAH7AwAAAPsDAvwDIAAAAAH9AwEAAAABAS4AAKEDACALtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAfYDAQAAAAH3AwEAAAAB-AMBAAAAAfkDAQAAAAH7AwAAAPsDAvwDIAAAAAH9AwEAAAABAS4AAKMDADABLgAAowMAMBwHAAC3BwAgEAAAvwcAIBYAALsHACAYAACzBwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHAAAuAcAIB4AALkHACAfAAC6BwAgIAAAvAcAICEAAL0HACAjAADDBwAgJAAAvgcAICUAAMAHACAmAADBBwAgJwAAwgcAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhAgAAAJkDACAuAACmAwAgC7QDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhAgAAAJwDACAuAACoAwAgAgAAAJwDACAuAACoAwAgAwAAAJkDACA1AAChAwAgNgAApgMAIAEAAACZAwAgAQAAAJwDACAJDgAArwcAIDsAALEHACA8AACwBwAg9QMAAL4GACD2AwAAvgYAIPcDAAC-BgAg-AMAAL4GACD5AwAAvgYAIP0DAAC-BgAgDrEDAADMBQAwsgMAAK8DABCzAwAAzAUAMLQDAQCWBQAhuwNAAJcFACHeA0AAlwUAIfUDAQC4BQAh9gMBALgFACH3AwEAuAUAIfgDAQC4BQAh-QMBALgFACH7AwAAzQX7AyL8AyAApgUAIf0DAQC4BQAhAwAAAJwDACABAACuAwAwOgAArwMAIAMAAACcAwAgAQAAnQMAMAIAAJkDACABAAAAVQAgAQAAAFUAIAMAAABTACABAABUADACAABVACADAAAAUwAgAQAAVAAwAgAAVQAgAwAAAFMAIAEAAFQAMAIAAFUAIAwFAACtBwAgIwAArgcAILQDAQAAAAG1AwEAAAABuwNAAAAAAeUDQAAAAAHvAwEAAAAB8AMBAAAAAfEDAQAAAAHyAwEAAAAB8wNAAAAAAfQDQAAAAAEBLgAAtwMAIAq0AwEAAAABtQMBAAAAAbsDQAAAAAHlA0AAAAAB7wMBAAAAAfADAQAAAAHxAwEAAAAB8gMBAAAAAfMDQAAAAAH0A0AAAAABAS4AALkDADABLgAAuQMAMAwFAACfBwAgIwAAoAcAILQDAQDEBgAhtQMBAMQGACG7A0AAxQYAIeUDQADFBgAh7wMBAMQGACHwAwEA4QYAIfEDAQDhBgAh8gMBAOEGACHzA0AAxgYAIfQDQADFBgAhAgAAAFUAIC4AALwDACAKtAMBAMQGACG1AwEAxAYAIbsDQADFBgAh5QNAAMUGACHvAwEAxAYAIfADAQDhBgAh8QMBAOEGACHyAwEA4QYAIfMDQADGBgAh9ANAAMUGACECAAAAUwAgLgAAvgMAIAIAAABTACAuAAC-AwAgAwAAAFUAIDUAALcDACA2AAC8AwAgAQAAAFUAIAEAAABTACAHDgAAnAcAIDsAAJ4HACA8AACdBwAg8AMAAL4GACDxAwAAvgYAIPIDAAC-BgAg8wMAAL4GACANsQMAAMsFADCyAwAAxQMAELMDAADLBQAwtAMBAJYFACG1AwEAlgUAIbsDQACXBQAh5QNAAJcFACHvAwEAlgUAIfADAQC4BQAh8QMBALgFACHyAwEAuAUAIfMDQACYBQAh9ANAAJcFACEDAAAAUwAgAQAAxAMAMDoAAMUDACADAAAAUwAgAQAAVAAwAgAAVQAgDQUAAMoFACCxAwAAyAUAMLIDAABdABCzAwAAyAUAMLQDAQAAAAG1AwEAAAABuwNAAL8FACHeA0AAvwUAIeoDAQDJBQAh6wMBAMkFACHsAwEAyQUAIe0DAQDJBQAh7gNAALMFACEBAAAAyAMAIAEAAADIAwAgBgUAAJsHACDqAwAAvgYAIOsDAAC-BgAg7AMAAL4GACDtAwAAvgYAIO4DAAC-BgAgAwAAAF0AIAEAAMsDADACAADIAwAgAwAAAF0AIAEAAMsDADACAADIAwAgAwAAAF0AIAEAAMsDADACAADIAwAgCgUAAJoHACC0AwEAAAABtQMBAAAAAbsDQAAAAAHeA0AAAAAB6gMBAAAAAesDAQAAAAHsAwEAAAAB7QMBAAAAAe4DQAAAAAEBLgAAzwMAIAm0AwEAAAABtQMBAAAAAbsDQAAAAAHeA0AAAAAB6gMBAAAAAesDAQAAAAHsAwEAAAAB7QMBAAAAAe4DQAAAAAEBLgAA0QMAMAEuAADRAwAwCgUAAJkHACC0AwEAxAYAIbUDAQDEBgAhuwNAAMUGACHeA0AAxQYAIeoDAQDhBgAh6wMBAOEGACHsAwEA4QYAIe0DAQDhBgAh7gNAAMYGACECAAAAyAMAIC4AANQDACAJtAMBAMQGACG1AwEAxAYAIbsDQADFBgAh3gNAAMUGACHqAwEA4QYAIesDAQDhBgAh7AMBAOEGACHtAwEA4QYAIe4DQADGBgAhAgAAAF0AIC4AANYDACACAAAAXQAgLgAA1gMAIAMAAADIAwAgNQAAzwMAIDYAANQDACABAAAAyAMAIAEAAABdACAIDgAAlgcAIDsAAJgHACA8AACXBwAg6gMAAL4GACDrAwAAvgYAIOwDAAC-BgAg7QMAAL4GACDuAwAAvgYAIAyxAwAAxwUAMLIDAADdAwAQswMAAMcFADC0AwEAlgUAIbUDAQCWBQAhuwNAAJcFACHeA0AAlwUAIeoDAQC4BQAh6wMBALgFACHsAwEAuAUAIe0DAQC4BQAh7gNAAJgFACEDAAAAXQAgAQAA3AMAMDoAAN0DACADAAAAXQAgAQAAywMAMAIAAMgDACABAAAARwAgAQAAAEcAIAMAAABFACABAABGADACAABHACADAAAARQAgAQAARgAwAgAARwAgAwAAAEUAIAEAAEYAMAIAAEcAIAgIAACUBwAgHQAAlQcAILQDAQAAAAG7A0AAAAAB3gNAAAAAAeYDAQAAAAHnAwEAAAAB6QMAAADpAwIBLgAA5QMAIAa0AwEAAAABuwNAAAAAAd4DQAAAAAHmAwEAAAAB5wMBAAAAAekDAAAA6QMCAS4AAOcDADABLgAA5wMAMAgIAACSBwAgHQAAkwcAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIeYDAQDEBgAh5wMBAMQGACHpAwAAkQfpAyICAAAARwAgLgAA6gMAIAa0AwEAxAYAIbsDQADFBgAh3gNAAMUGACHmAwEAxAYAIecDAQDEBgAh6QMAAJEH6QMiAgAAAEUAIC4AAOwDACACAAAARQAgLgAA7AMAIAMAAABHACA1AADlAwAgNgAA6gMAIAEAAABHACABAAAARQAgAw4AAI4HACA7AACQBwAgPAAAjwcAIAmxAwAAwwUAMLIDAADzAwAQswMAAMMFADC0AwEAlgUAIbsDQACXBQAh3gNAAJcFACHmAwEAlgUAIecDAQCWBQAh6QMAAMQF6QMiAwAAAEUAIAEAAPIDADA6AADzAwAgAwAAAEUAIAEAAEYAMAIAAEcAIAEAAABRACABAAAAUQAgAwAAAE8AIAEAAFAAMAIAAFEAIAMAAABPACABAABQADACAABRACADAAAATwAgAQAAUAAwAgAAUQAgBwUAAI0HACC0AwEAAAABtQMBAAAAAbsDQAAAAAHjAwEAAAAB5ANAAAAAAeUDQAAAAAEBLgAA-wMAIAa0AwEAAAABtQMBAAAAAbsDQAAAAAHjAwEAAAAB5ANAAAAAAeUDQAAAAAEBLgAA_QMAMAEuAAD9AwAwBwUAAIwHACC0AwEAxAYAIbUDAQDEBgAhuwNAAMUGACHjAwEAxAYAIeQDQADGBgAh5QNAAMUGACECAAAAUQAgLgAAgAQAIAa0AwEAxAYAIbUDAQDEBgAhuwNAAMUGACHjAwEAxAYAIeQDQADGBgAh5QNAAMUGACECAAAATwAgLgAAggQAIAIAAABPACAuAACCBAAgAwAAAFEAIDUAAPsDACA2AACABAAgAQAAAFEAIAEAAABPACAEDgAAiQcAIDsAAIsHACA8AACKBwAg5AMAAL4GACAJsQMAAMIFADCyAwAAiQQAELMDAADCBQAwtAMBAJYFACG1AwEAlgUAIbsDQACXBQAh4wMBAJYFACHkA0AAmAUAIeUDQACXBQAhAwAAAE8AIAEAAIgEADA6AACJBAAgAwAAAE8AIAEAAFAAMAIAAFEAIAgHAADABQAgFgAAwQUAILEDAAC-BQAwsgMAADAAELMDAAC-BQAwtAMBAAAAAbsDQAC_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_AwEAAAABwAMBAAAAAcEDAQAAAAHCAwEAAAABwwMBAKIFACHEAwEAAAABxQMBAAAAAcYDAQAAAAELDgAAmwUAIDsAAKEFACA8AAChBQAgvANAAAAAAb0DQAAAAAS-A0AAAAAEvwNAAAAAAcADQAAAAAHBA0AAAAABwgNAAAAAAcMDQACgBQAhCw4AAJ4FACA7AACfBQAgPAAAnwUAILwDQAAAAAG9A0AAAAAFvgNAAAAABb8DQAAAAAHAA0AAAAABwQNAAAAAAcIDQAAAAAHDA0AAnQUAIQ0OAACbBQAgOwAAmwUAIDwAAJsFACBdAACcBQAgXgAAmwUAILwDAgAAAAG9AwIAAAAEvgMCAAAABL8DAgAAAAHAAwIAAAABwQMCAAAAAcIDAgAAAAHDAwIAmgUAIQ0OAACbBQAgOwAAmwUAIDwAAJsFACBdAACcBQAgXgAAmwUAILwDAgAAAAG9AwIAAAAEvgMCAAAABL8DAgAAAAHAAwIAAAABwQMCAAAAAcIDAgAAAAHDAwIAmgUAIQi8AwIAAAABvQMCAAAABL4DAgAAAAS_AwIAAAABwAMCAAAAAcEDAgAAAAHCAwIAAAABwwMCAJsFACEIvAMIAAAAAb0DCAAAAAS-AwgAAAAEvwMIAAAAAcADCAAAAAHBAwgAAAABwgMIAAAAAcMDCACcBQAhCw4AAJ4FACA7AACfBQAgPAAAnwUAILwDQAAAAAG9A0AAAAAFvgNAAAAABb8DQAAAAAHAA0AAAAABwQNAAAAAAcIDQAAAAAHDA0AAnQUAIQi8AwIAAAABvQMCAAAABb4DAgAAAAW_AwIAAAABwAMCAAAAAcEDAgAAAAHCAwIAAAABwwMCAJ4FACEIvANAAAAAAb0DQAAAAAW-A0AAAAAFvwNAAAAAAcADQAAAAAHBA0AAAAABwgNAAAAAAcMDQACfBQAhCw4AAJsFACA7AAChBQAgPAAAoQUAILwDQAAAAAG9A0AAAAAEvgNAAAAABL8DQAAAAAHAA0AAAAABwQNAAAAAAcIDQAAAAAHDA0AAoAUAIQi8A0AAAAABvQNAAAAABL4DQAAAAAS_A0AAAAABwANAAAAAAcEDQAAAAAHCA0AAAAABwwNAAKEFACEODgAAmwUAIDsAAKMFACA8AACjBQAgvAMBAAAAAb0DAQAAAAS-AwEAAAAEvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAcMDAQCiBQAhxAMBAAAAAcUDAQAAAAHGAwEAAAABC7wDAQAAAAG9AwEAAAAEvgMBAAAABL8DAQAAAAHAAwEAAAABwQMBAAAAAcIDAQAAAAHDAwEAowUAIcQDAQAAAAHFAwEAAAABxgMBAAAAAQsuAACnBQAgsQMAAKQFADCyAwAA_AQAELMDAACkBQAwtAMBAJYFACG1AwEAlgUAIbsDQACXBQAhxwMBAJYFACHIAwEAlgUAIcoDAAClBcoDIssDIACmBQAhBw4AAJsFACA7AACsBQAgPAAArAUAILwDAAAAygMCvQMAAADKAwi-AwAAAMoDCMMDAACrBcoDIgUOAACbBQAgOwAAqgUAIDwAAKoFACC8AyAAAAABwwMgAKkFACEPDgAAngUAIDsAAKgFACA8AACoBQAgvAOAAAAAAb8DgAAAAAHAA4AAAAABwQOAAAAAAcIDgAAAAAHDA4AAAAABzAMBAAAAAc0DAQAAAAHOAwEAAAABzwOAAAAAAdADgAAAAAHRA4AAAAABDLwDgAAAAAG_A4AAAAABwAOAAAAAAcEDgAAAAAHCA4AAAAABwwOAAAAAAcwDAQAAAAHNAwEAAAABzgMBAAAAAc8DgAAAAAHQA4AAAAAB0QOAAAAAAQUOAACbBQAgOwAAqgUAIDwAAKoFACC8AyAAAAABwwMgAKkFACECvAMgAAAAAcMDIACqBQAhBw4AAJsFACA7AACsBQAgPAAArAUAILwDAAAAygMCvQMAAADKAwi-AwAAAMoDCMMDAACrBcoDIgS8AwAAAMoDAr0DAAAAygMIvgMAAADKAwjDAwAArAXKAyIHsQMAAK0FADCyAwAA5gQAELMDAACtBQAwtAMBAK4FACHIAwEAlgUAIdIDAQCWBQAh0wNAAJgFACELDgAAmwUAIDsAAKMFACA8AACjBQAgvAMBAAAAAb0DAQAAAAS-AwEAAAAEvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAcMDAQCvBQAhCw4AAJsFACA7AACjBQAgPAAAowUAILwDAQAAAAG9AwEAAAAEvgMBAAAABL8DAQAAAAHAAwEAAAABwQMBAAAAAcIDAQAAAAHDAwEArwUAIQexAwAAsAUAMLIDAADTBAAQswMAALAFADC0AwEAsQUAIcgDAQCyBQAh0gMBALIFACHTA0AAswUAIQi8AwEAAAABvQMBAAAABL4DAQAAAAS_AwEAAAABwAMBAAAAAcEDAQAAAAHCAwEAAAABwwMBALQFACELvAMBAAAAAb0DAQAAAAS-AwEAAAAEvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAcMDAQCjBQAhxAMBAAAAAcUDAQAAAAHGAwEAAAABCLwDQAAAAAG9A0AAAAAFvgNAAAAABb8DQAAAAAHAA0AAAAABwQNAAAAAAcIDQAAAAAHDA0AAnwUAIQi8AwEAAAABvQMBAAAABL4DAQAAAAS_AwEAAAABwAMBAAAAAcEDAQAAAAHCAwEAAAABwwMBALQFACEKsQMAALUFADCyAwAAzQQAELMDAAC1BQAwtAMBAJYFACG7A0AAlwUAIdQDAQCWBQAh1QMBAJYFACHWAwEAlgUAIdcDAQCWBQAh2AMCAJkFACEMsQMAALYFADCyAwAAtwQAELMDAAC2BQAwtAMBAJYFACG7A0AAlwUAIcgDAQC4BQAhygMAALcF3AMi2QMBAJYFACHaAwEAlgUAIdwDIACmBQAh3QNAAJgFACHeA0AAlwUAIQcOAACbBQAgOwAAvAUAIDwAALwFACC8AwAAANwDAr0DAAAA3AMIvgMAAADcAwjDAwAAuwXcAyIODgAAngUAIDsAALoFACA8AAC6BQAgvAMBAAAAAb0DAQAAAAW-AwEAAAAFvwMBAAAAAcADAQAAAAHBAwEAAAABwgMBAAAAAcMDAQC5BQAhxAMBAAAAAcUDAQAAAAHGAwEAAAABDg4AAJ4FACA7AAC6BQAgPAAAugUAILwDAQAAAAG9AwEAAAAFvgMBAAAABb8DAQAAAAHAAwEAAAABwQMBAAAAAcIDAQAAAAHDAwEAuQUAIcQDAQAAAAHFAwEAAAABxgMBAAAAAQu8AwEAAAABvQMBAAAABb4DAQAAAAW_AwEAAAABwAMBAAAAAcEDAQAAAAHCAwEAAAABwwMBALoFACHEAwEAAAABxQMBAAAAAcYDAQAAAAEHDgAAmwUAIDsAALwFACA8AAC8BQAgvAMAAADcAwK9AwAAANwDCL4DAAAA3AMIwwMAALsF3AMiBLwDAAAA3AMCvQMAAADcAwi-AwAAANwDCMMDAAC8BdwDIgaxAwAAvQUAMLIDAAChBAAQswMAAL0FADC0AwEAlgUAIbsDQACXBQAh3wMBAJYFACEIBwAAwAUAIBYAAMEFACCxAwAAvgUAMLIDAAAwABCzAwAAvgUAMLQDAQCyBQAhuwNAAL8FACHfAwEAsgUAIQi8A0AAAAABvQNAAAAABL4DQAAAAAS_A0AAAAABwANAAAAAAcEDQAAAAAHCA0AAAAABwwNAAKEFACEVAwAAygUAIAQAANcFACAGAADUBQAgCgAA1QUAIAsAANYFACAXAAC9BgAgsQMAALsGADCyAwAAAwAQswMAALsGADC0AwEAsgUAIbsDQAC_BQAh3gNAAL8FACH1AwEAsgUAIZIEAQCyBQAhkwQBALIFACGUBAEAsgUAIaMEAgCRBgAhpAQCAJEGACGmBAAAvAamBCK5BAAAAwAgugQAAAMAIAPgAwAAMgAg4QMAADIAIOIDAAAyACAJsQMAAMIFADCyAwAAiQQAELMDAADCBQAwtAMBAJYFACG1AwEAlgUAIbsDQACXBQAh4wMBAJYFACHkA0AAmAUAIeUDQACXBQAhCbEDAADDBQAwsgMAAPMDABCzAwAAwwUAMLQDAQCWBQAhuwNAAJcFACHeA0AAlwUAIeYDAQCWBQAh5wMBAJYFACHpAwAAxAXpAyIHDgAAmwUAIDsAAMYFACA8AADGBQAgvAMAAADpAwK9AwAAAOkDCL4DAAAA6QMIwwMAAMUF6QMiBw4AAJsFACA7AADGBQAgPAAAxgUAILwDAAAA6QMCvQMAAADpAwi-AwAAAOkDCMMDAADFBekDIgS8AwAAAOkDAr0DAAAA6QMIvgMAAADpAwjDAwAAxgXpAyIMsQMAAMcFADCyAwAA3QMAELMDAADHBQAwtAMBAJYFACG1AwEAlgUAIbsDQACXBQAh3gNAAJcFACHqAwEAuAUAIesDAQC4BQAh7AMBALgFACHtAwEAuAUAIe4DQACYBQAhDQUAAMoFACCxAwAAyAUAMLIDAABdABCzAwAAyAUAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAId4DQAC_BQAh6gMBAMkFACHrAwEAyQUAIewDAQDJBQAh7QMBAMkFACHuA0AAswUAIQu8AwEAAAABvQMBAAAABb4DAQAAAAW_AwEAAAABwAMBAAAAAcEDAQAAAAHCAwEAAAABwwMBALoFACHEAwEAAAABxQMBAAAAAcYDAQAAAAEhBwAA1gUAIBAAANwFACAWAADBBQAgGAAA0wUAIBkAANQFACAaAADVBQAgGwAA1QUAIBwAANcFACAeAADYBQAgHwAA2AUAICAAANkFACAhAADaBQAgIwAA4AUAICQAANsFACAlAADdBQAgJgAA3gUAICcAAN8FACCxAwAA0AUAMLIDAACcAwAQswMAANAFADC0AwEAsgUAIbsDQAC_BQAh3gNAAL8FACH1AwEAyQUAIfYDAQDJBQAh9wMBAMkFACH4AwEAyQUAIfkDAQDJBQAh-wMAANEF-wMi_AMgANIFACH9AwEAyQUAIbkEAACcAwAgugQAAJwDACANsQMAAMsFADCyAwAAxQMAELMDAADLBQAwtAMBAJYFACG1AwEAlgUAIbsDQACXBQAh5QNAAJcFACHvAwEAlgUAIfADAQC4BQAh8QMBALgFACHyAwEAuAUAIfMDQACYBQAh9ANAAJcFACEOsQMAAMwFADCyAwAArwMAELMDAADMBQAwtAMBAJYFACG7A0AAlwUAId4DQACXBQAh9QMBALgFACH2AwEAuAUAIfcDAQC4BQAh-AMBALgFACH5AwEAuAUAIfsDAADNBfsDIvwDIACmBQAh_QMBALgFACEHDgAAmwUAIDsAAM8FACA8AADPBQAgvAMAAAD7AwK9AwAAAPsDCL4DAAAA-wMIwwMAAM4F-wMiBw4AAJsFACA7AADPBQAgPAAAzwUAILwDAAAA-wMCvQMAAAD7Awi-AwAAAPsDCMMDAADOBfsDIgS8AwAAAPsDAr0DAAAA-wMIvgMAAAD7AwjDAwAAzwX7AyIfBwAA1gUAIBAAANwFACAWAADBBQAgGAAA0wUAIBkAANQFACAaAADVBQAgGwAA1QUAIBwAANcFACAeAADYBQAgHwAA2AUAICAAANkFACAhAADaBQAgIwAA4AUAICQAANsFACAlAADdBQAgJgAA3gUAICcAAN8FACCxAwAA0AUAMLIDAACcAwAQswMAANAFADC0AwEAsgUAIbsDQAC_BQAh3gNAAL8FACH1AwEAyQUAIfYDAQDJBQAh9wMBAMkFACH4AwEAyQUAIfkDAQDJBQAh-wMAANEF-wMi_AMgANIFACH9AwEAyQUAIQS8AwAAAPsDAr0DAAAA-wMIvgMAAAD7AwjDAwAAzwX7AyICvAMgAAAAAcMDIACqBQAhA-ADAAADACDhAwAAAwAg4gMAAAMAIAPgAwAABwAg4QMAAAcAIOIDAAAHACAD4AMAAAsAIOEDAAALACDiAwAACwAgA-ADAAAPACDhAwAADwAg4gMAAA8AIAPgAwAAEwAg4QMAABMAIOIDAAATACAD4AMAAEUAIOEDAABFACDiAwAARQAgA-ADAABLACDhAwAASwAg4gMAAEsAIAPgAwAATwAg4QMAAE8AIOIDAABPACAD4AMAAFMAIOEDAABTACDiAwAAUwAgA-ADAAAgACDhAwAAIAAg4gMAACAAIA8FAADKBQAgsQMAAMgFADCyAwAAXQAQswMAAMgFADC0AwEAsgUAIbUDAQCyBQAhuwNAAL8FACHeA0AAvwUAIeoDAQDJBQAh6wMBAMkFACHsAwEAyQUAIe0DAQDJBQAh7gNAALMFACG5BAAAXQAgugQAAF0AIAPgAwAAGwAg4QMAABsAIOIDAAAbACAD4AMAAGAAIOEDAABgACDiAwAAYAAgA-ADAABXACDhAwAAVwAg4gMAAFcAIA2xAwAA4QUAMLIDAACWAwAQswMAAOEFADC0AwEAlgUAIbUDAQCWBQAhuwNAAJcFACHeA0AAlwUAId8DAQCWBQAh_gNAAJcFACH_AwIAmQUAIYAEAgCZBQAhgQQQAOIFACGCBCAApgUAIQ0OAACbBQAgOwAA5AUAIDwAAOQFACBdAADkBQAgXgAA5AUAILwDEAAAAAG9AxAAAAAEvgMQAAAABL8DEAAAAAHAAxAAAAABwQMQAAAAAcIDEAAAAAHDAxAA4wUAIQ0OAACbBQAgOwAA5AUAIDwAAOQFACBdAADkBQAgXgAA5AUAILwDEAAAAAG9AxAAAAAEvgMQAAAABL8DEAAAAAHAAxAAAAABwQMQAAAAAcIDEAAAAAHDAxAA4wUAIQi8AxAAAAABvQMQAAAABL4DEAAAAAS_AxAAAAABwAMQAAAAAcEDEAAAAAHCAxAAAAABwwMQAOQFACEIsQMAAOUFADCyAwAAgAMAELMDAADlBQAwtAMBAJYFACG7A0AAlwUAIYMEAQCWBQAhhAQQAOIFACGFBAEAuAUAIQ-xAwAA5gUAMLIDAADqAgAQswMAAOYFADC0AwEAlgUAIbUDAQCWBQAhuwNAAJcFACHeA0AAlwUAId8DAQCWBQAh_gNAAJcFACGGBAEAlgUAIYcEEADiBQAhiAQQAOIFACGJBCAApgUAIYoEAgCZBQAhiwQCAJkFACEGsQMAAOcFADCyAwAA1AIAELMDAADnBQAwtAMBAJYFACGGBAEAlgUAIY0EAADoBY0EIgcOAACbBQAgOwAA6gUAIDwAAOoFACC8AwAAAI0EAr0DAAAAjQQIvgMAAACNBAjDAwAA6QWNBCIHDgAAmwUAIDsAAOoFACA8AADqBQAgvAMAAACNBAK9AwAAAI0ECL4DAAAAjQQIwwMAAOkFjQQiBLwDAAAAjQQCvQMAAACNBAi-AwAAAI0ECMMDAADqBY0EIg-xAwAA6wUAMLIDAAC-AgAQswMAAOsFADC0AwEAlgUAIbsDQACXBQAh3gNAAJcFACHfAwEAlgUAIfUDAQCWBQAhjgQBAJYFACGPBAgA7AUAIZEEAADtBZEEIpIEAQCWBQAhkwQBALgFACGUBAEAlgUAIZYEAADuBZYEIg0OAACbBQAgOwAAnAUAIDwAAJwFACBdAACcBQAgXgAAnAUAILwDCAAAAAG9AwgAAAAEvgMIAAAABL8DCAAAAAHAAwgAAAABwQMIAAAAAcIDCAAAAAHDAwgA8wUAIQcOAACbBQAgOwAA8gUAIDwAAPIFACC8AwAAAJEEAr0DAAAAkQQIvgMAAACRBAjDAwAA8QWRBCIHDgAAmwUAIDsAAPAFACA8AADwBQAgvAMAAACWBAK9AwAAAJYECL4DAAAAlgQIwwMAAO8FlgQiBw4AAJsFACA7AADwBQAgPAAA8AUAILwDAAAAlgQCvQMAAACWBAi-AwAAAJYECMMDAADvBZYEIgS8AwAAAJYEAr0DAAAAlgQIvgMAAACWBAjDAwAA8AWWBCIHDgAAmwUAIDsAAPIFACA8AADyBQAgvAMAAACRBAK9AwAAAJEECL4DAAAAkQQIwwMAAPEFkQQiBLwDAAAAkQQCvQMAAACRBAi-AwAAAJEECMMDAADyBZEEIg0OAACbBQAgOwAAnAUAIDwAAJwFACBdAACcBQAgXgAAnAUAILwDCAAAAAG9AwgAAAAEvgMIAAAABL8DCAAAAAHAAwgAAAABwQMIAAAAAcIDCAAAAAHDAwgA8wUAIQexAwAA9AUAMLIDAACoAgAQswMAAPQFADC0AwEAlgUAIZcEAQCWBQAhmAQBALgFACGZBAAA9QUAIAS8AwEAAAAFmgQBAAAAAZsEAQAAAAScBAEAAAAEB7EDAAD2BQAwsgMAAJUCABCzAwAA9gUAMLQDAQCyBQAhlwQBALIFACGYBAEAyQUAIZkEAAD1BQAgCrEDAAD3BQAwsgMAAI8CABCzAwAA9wUAMLQDAQCWBQAhuwNAAJcFACHaAwEAlgUAId8DAQCWBQAh5QNAAJgFACHnAwEAlgUAIZ0EQACYBQAhDbEDAAD4BQAwsgMAAPkBABCzAwAA-AUAMLQDAQCWBQAhtQMBAJYFACHfAwEAlgUAIfwDIACmBQAhigQCAJkFACGLBAIAmQUAIZ8EAAD5BZ8EIqAEQACXBQAhoQRAAJgFACGiBAgA7AUAIQcOAACbBQAgOwAA-wUAIDwAAPsFACC8AwAAAJ8EAr0DAAAAnwQIvgMAAACfBAjDAwAA-gWfBCIHDgAAmwUAIDsAAPsFACA8AAD7BQAgvAMAAACfBAK9AwAAAJ8ECL4DAAAAnwQIwwMAAPoFnwQiBLwDAAAAnwQCvQMAAACfBAi-AwAAAJ8ECMMDAAD7BZ8EIg2xAwAA_AUAMLIDAADjAQAQswMAAPwFADC0AwEAlgUAIbsDQACXBQAh3gNAAJcFACH1AwEAlgUAIZIEAQCWBQAhkwQBAJYFACGUBAEAlgUAIaMEAgCZBQAhpAQCAJkFACGmBAAA_QWmBCIHDgAAmwUAIDsAAP8FACA8AAD_BQAgvAMAAACmBAK9AwAAAKYECL4DAAAApgQIwwMAAP4FpgQiBw4AAJsFACA7AAD_BQAgPAAA_wUAILwDAAAApgQCvQMAAACmBAi-AwAAAKYECMMDAAD-BaYEIgS8AwAAAKYEAr0DAAAApgQIvgMAAACmBAjDAwAA_wWmBCIJsQMAAIAGADCyAwAAzQEAELMDAACABgAwtAMBAJYFACG1AwEAlgUAIYcEAgCZBQAhpwQBAJYFACGoBCAApgUAIakEAgCZBQAhDbEDAACBBgAwsgMAALcBABCzAwAAgQYAMLQDAQCWBQAhuwNAAJcFACHHAwEAlgUAIYYEAQCWBQAhjgQBALgFACGSBAEAlgUAIaoEAQC4BQAhqwQCAJkFACGtBAAAggatBCOuBAEAuAUAIQcOAACeBQAgOwAAhAYAIDwAAIQGACC8AwAAAK0EA70DAAAArQQJvgMAAACtBAnDAwAAgwatBCMHDgAAngUAIDsAAIQGACA8AACEBgAgvAMAAACtBAO9AwAAAK0ECb4DAAAArQQJwwMAAIMGrQQjBLwDAAAArQQDvQMAAACtBAm-AwAAAK0ECcMDAACEBq0EIwqxAwAAhQYAMLIDAAChAQAQswMAAIUGADC0AwEAlgUAIbsDQACXBQAhyAMBALgFACGfBAAAhgaxBCKvBAEAlgUAIbEEAACnBQAgsgQBALgFACEHDgAAmwUAIDsAAIgGACA8AACIBgAgvAMAAACxBAK9AwAAALEECL4DAAAAsQQIwwMAAIcGsQQiBw4AAJsFACA7AACIBgAgPAAAiAYAILwDAAAAsQQCvQMAAACxBAi-AwAAALEECMMDAACHBrEEIgS8AwAAALEEAr0DAAAAsQQIvgMAAACxBAjDAwAAiAaxBCIHsQMAAIkGADCyAwAAiwEAELMDAACJBgAwtAMBAJYFACG1AwEAlgUAIbsDQACXBQAh3gNAAJcFACELKAAAjQYAILEDAACKBgAwsgMAAHQAELMDAACKBgAwtAMBALIFACG7A0AAvwUAIcgDAQDJBQAhnwQAAIsGsQQirwQBALIFACGxBAAAjAYAILIEAQDJBQAhBLwDAAAAsQQCvQMAAACxBAi-AwAAALEECMMDAACIBrEEIgy8A4AAAAABvwOAAAAAAcADgAAAAAHBA4AAAAABwgOAAAAAAcMDgAAAAAHMAwEAAAABzQMBAAAAAc4DAQAAAAHPA4AAAAAB0AOAAAAAAdEDgAAAAAELBQAAygUAIBYAAI8GACCxAwAAjgYAMLIDAABgABCzAwAAjgYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAId4DQAC_BQAhuQQAAGAAILoEAABgACAJBQAAygUAIBYAAI8GACCxAwAAjgYAMLIDAABgABCzAwAAjgYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAId4DQAC_BQAhA-ADAAB0ACDhAwAAdAAg4gMAAHQAIA0FAADKBQAgIgAAkgYAILEDAACQBgAwsgMAAFcAELMDAACQBgAwtAMBALIFACG1AwEAsgUAIbYDAQCyBQAhtwMBALIFACG4A0AAvwUAIbkDQACzBQAhugMCAJEGACG7A0AAvwUAIQi8AwIAAAABvQMCAAAABL4DAgAAAAS_AwIAAAABwAMCAAAAAcEDAgAAAAHCAwIAAAABwwMCAJsFACERBQAAygUAICMAAOAFACCxAwAAkwYAMLIDAABTABCzAwAAkwYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAIeUDQAC_BQAh7wMBALIFACHwAwEAyQUAIfEDAQDJBQAh8gMBAMkFACHzA0AAswUAIfQDQAC_BQAhuQQAAFMAILoEAABTACAPBQAAygUAICMAAOAFACCxAwAAkwYAMLIDAABTABCzAwAAkwYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAIeUDQAC_BQAh7wMBALIFACHwAwEAyQUAIfEDAQDJBQAh8gMBAMkFACHzA0AAswUAIfQDQAC_BQAhCgUAAMoFACCxAwAAlAYAMLIDAABPABCzAwAAlAYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAIeMDAQCyBQAh5ANAALMFACHlA0AAvwUAIQwFAADKBQAgLgAAjAYAILEDAACVBgAwsgMAAEsAELMDAACVBgAwtAMBALIFACG1AwEAsgUAIbsDQAC_BQAhxwMBALIFACHIAwEAsgUAIcoDAACWBsoDIssDIADSBQAhBLwDAAAAygMCvQMAAADKAwi-AwAAAMoDCMMDAACsBcoDIgLmAwEAAAAB5wMBAAAAAQsIAADKBQAgHQAAygUAILEDAACYBgAwsgMAAEUAELMDAACYBgAwtAMBALIFACG7A0AAvwUAId4DQAC_BQAh5gMBALIFACHnAwEAsgUAIekDAACZBukDIgS8AwAAAOkDAr0DAAAA6QMIvgMAAADpAwjDAwAAxgXpAyILEwAAmwYAILEDAACaBgAwsgMAADYAELMDAACaBgAwtAMBALIFACG7A0AAvwUAIdQDAQCyBQAh1QMBALIFACHWAwEAsgUAIdcDAQCyBQAh2AMCAJEGACERCQAAygUAIBQAAJ4GACAVAACfBgAgsQMAAJwGADCyAwAAMgAQswMAAJwGADC0AwEAsgUAIbsDQAC_BQAhyAMBAMkFACHKAwAAnQbcAyLZAwEAsgUAIdoDAQCyBQAh3AMgANIFACHdA0AAswUAId4DQAC_BQAhuQQAADIAILoEAAAyACAPCQAAygUAIBQAAJ4GACAVAACfBgAgsQMAAJwGADCyAwAAMgAQswMAAJwGADC0AwEAsgUAIbsDQAC_BQAhyAMBAMkFACHKAwAAnQbcAyLZAwEAsgUAIdoDAQCyBQAh3AMgANIFACHdA0AAswUAId4DQAC_BQAhBLwDAAAA3AMCvQMAAADcAwi-AwAAANwDCMMDAAC8BdwDIgPgAwAANgAg4QMAADYAIOIDAAA2ACAKBwAAwAUAIBYAAMEFACCxAwAAvgUAMLIDAAAwABCzAwAAvgUAMLQDAQCyBQAhuwNAAL8FACHfAwEAsgUAIbkEAAAwACC6BAAAMAAgAoYEAQAAAAGNBAAAAI0EAgcEAACjBgAgsQMAAKEGADCyAwAAKQAQswMAAKEGADC0AwEAsgUAIYYEAQCyBQAhjQQAAKIGjQQiBLwDAAAAjQQCvQMAAACNBAi-AwAAAI0ECMMDAADqBY0EIhYDAADKBQAgBwAAwAUAIA8AALMGACAQAADcBQAgEgAAtAYAILEDAACvBgAwsgMAABMAELMDAACvBgAwtAMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH1AwEAsgUAIY4EAQCyBQAhjwQIALAGACGRBAAAsQaRBCKSBAEAsgUAIZMEAQDJBQAhlAQBALIFACGWBAAAsgaWBCK5BAAAEwAgugQAABMAIAkQAACmBgAgsQMAAKQGADCyAwAAJAAQswMAAKQGADC0AwEAsgUAIbsDQAC_BQAhgwQBALIFACGEBBAApQYAIYUEAQDJBQAhCLwDEAAAAAG9AxAAAAAEvgMQAAAABL8DEAAAAAHAAxAAAAABwQMQAAAAAcIDEAAAAAHDAxAA5AUAIRQEAACjBgAgBQAAygUAIBEAAKkGACCxAwAAqAYAMLIDAAAgABCzAwAAqAYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH-A0AAvwUAIYYEAQCyBQAhhwQQAKUGACGIBBAApQYAIYkEIADSBQAhigQCAJEGACGLBAIAkQYAIbkEAAAgACC6BAAAIAAgA7UDAQAAAAH-A0AAAAABhgQBAAAAARIEAACjBgAgBQAAygUAIBEAAKkGACCxAwAAqAYAMLIDAAAgABCzAwAAqAYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH-A0AAvwUAIYYEAQCyBQAhhwQQAKUGACGIBBAApQYAIYkEIADSBQAhigQCAJEGACGLBAIAkQYAIQPgAwAAJAAg4QMAACQAIOIDAAAkACACtQMBAAAAAacEAQAAAAELBQAAygUAIAwAAKwGACCxAwAAqwYAMLIDAAAbABCzAwAAqwYAMLQDAQCyBQAhtQMBALIFACGHBAIAkQYAIacEAQCyBQAhqAQgANIFACGpBAIAkQYAIREEAACjBgAgDQAA3gUAILEDAACtBgAwsgMAABcAELMDAACtBgAwtAMBALIFACG7A0AAvwUAIccDAQCyBQAhhgQBALIFACGOBAEAyQUAIZIEAQCyBQAhqgQBAMkFACGrBAIAkQYAIa0EAACuBq0EI64EAQDJBQAhuQQAABcAILoEAAAXACAPBAAAowYAIA0AAN4FACCxAwAArQYAMLIDAAAXABCzAwAArQYAMLQDAQCyBQAhuwNAAL8FACHHAwEAsgUAIYYEAQCyBQAhjgQBAMkFACGSBAEAsgUAIaoEAQDJBQAhqwQCAJEGACGtBAAArgatBCOuBAEAyQUAIQS8AwAAAK0EA70DAAAArQQJvgMAAACtBAnDAwAAhAatBCMUAwAAygUAIAcAAMAFACAPAACzBgAgEAAA3AUAIBIAALQGACCxAwAArwYAMLIDAAATABCzAwAArwYAMLQDAQCyBQAhuwNAAL8FACHeA0AAvwUAId8DAQCyBQAh9QMBALIFACGOBAEAsgUAIY8ECACwBgAhkQQAALEGkQQikgQBALIFACGTBAEAyQUAIZQEAQCyBQAhlgQAALIGlgQiCLwDCAAAAAG9AwgAAAAEvgMIAAAABL8DCAAAAAHAAwgAAAABwQMIAAAAAcIDCAAAAAHDAwgAnAUAIQS8AwAAAJEEAr0DAAAAkQQIvgMAAACRBAjDAwAA8gWRBCIEvAMAAACWBAK9AwAAAJYECL4DAAAAlgQIwwMAAPAFlgQiA-ADAAAXACDhAwAAFwAg4gMAABcAIAPgAwAAKQAg4QMAACkAIOIDAAApACACtQMBAAAAAd8DAQAAAAEPBQAAygUAIAcAAMAFACCxAwAAtgYAMLIDAAAPABCzAwAAtgYAMLQDAQCyBQAhtQMBALIFACHfAwEAsgUAIfwDIADSBQAhigQCAJEGACGLBAIAkQYAIZ8EAAC3Bp8EIqAEQAC_BQAhoQRAALMFACGiBAgAsAYAIQS8AwAAAJ8EAr0DAAAAnwQIvgMAAACfBAjDAwAA-wWfBCINBwAAwAUAIAgAAMoFACAJAADKBQAgsQMAALgGADCyAwAACwAQswMAALgGADC0AwEAsgUAIbsDQAC_BQAh2gMBALIFACHfAwEAsgUAIeUDQACzBQAh5wMBALIFACGdBEAAswUAIQO1AwEAAAAB3wMBAAAAAf4DQAAAAAEPBAAAwAUAIAUAAMoFACCxAwAAugYAMLIDAAAHABCzAwAAugYAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH-A0AAvwUAIf8DAgCRBgAhgAQCAJEGACGBBBAApQYAIYIEIADSBQAhEwMAAMoFACAEAADXBQAgBgAA1AUAIAoAANUFACALAADWBQAgFwAAvQYAILEDAAC7BgAwsgMAAAMAELMDAAC7BgAwtAMBALIFACG7A0AAvwUAId4DQAC_BQAh9QMBALIFACGSBAEAsgUAIZMEAQCyBQAhlAQBALIFACGjBAIAkQYAIaQEAgCRBgAhpgQAALwGpgQiBLwDAAAApgQCvQMAAACmBAi-AwAAAKYECMMDAAD_BaYEIgoHAADABQAgFgAAwQUAILEDAAC-BQAwsgMAADAAELMDAAC-BQAwtAMBALIFACG7A0AAvwUAId8DAQCyBQAhuQQAADAAILoEAAAwACAAAAAAAAABvgQBAAAAAQG-BEAAAAABAb4EQAAAAAEFvgQCAAAAAcUEAgAAAAHGBAIAAAABxwQCAAAAAcgEAgAAAAEFNQAAwQwAIDYAAMcMACC7BAAAwgwAILwEAADGDAAgwQQAAJkDACAFNQAAvwwAIDYAAMQMACC7BAAAwAwAILwEAADDDAAgwQQAAFUAIAM1AADBDAAguwQAAMIMACDBBAAAmQMAIAM1AAC_DAAguwQAAMAMACDBBAAAVQAgAAAAAb4EAAAAygMCAb4EIAAAAAEFNQAAugwAIDYAAL0MACC7BAAAuwwAILwEAAC8DAAgwQQAAJkDACADNQAAugwAILsEAAC7DAAgwQQAAJkDACAAAAAAAAAAAAU1AAC1DAAgNgAAuAwAILsEAAC2DAAgvAQAALcMACDBBAAANAAgAzUAALUMACC7BAAAtgwAIMEEAAA0ACAAAAABvgQAAADcAwIBvgQBAAAAAQs1AADlBgAwNgAA6gYAMLsEAADmBgAwvAQAAOcGADC9BAAA6AYAIL4EAADpBgAwvwQAAOkGADDABAAA6QYAMMEEAADpBgAwwgQAAOsGADDDBAAA7AYAMAU1AACsDAAgNgAAswwAILsEAACtDAAgvAQAALIMACDBBAAAjAQAIAU1AACqDAAgNgAAsAwAILsEAACrDAAgvAQAAK8MACDBBAAAmQMAIAa0AwEAAAABuwNAAAAAAdUDAQAAAAHWAwEAAAAB1wMBAAAAAdgDAgAAAAECAAAAOAAgNQAA8AYAIAMAAAA4ACA1AADwBgAgNgAA7wYAIAEuAACuDAAwCxMAAJsGACCxAwAAmgYAMLIDAAA2ABCzAwAAmgYAMLQDAQAAAAG7A0AAvwUAIdQDAQCyBQAh1QMBALIFACHWAwEAsgUAIdcDAQCyBQAh2AMCAJEGACECAAAAOAAgLgAA7wYAIAIAAADtBgAgLgAA7gYAIAqxAwAA7AYAMLIDAADtBgAQswMAAOwGADC0AwEAsgUAIbsDQAC_BQAh1AMBALIFACHVAwEAsgUAIdYDAQCyBQAh1wMBALIFACHYAwIAkQYAIQqxAwAA7AYAMLIDAADtBgAQswMAAOwGADC0AwEAsgUAIbsDQAC_BQAh1AMBALIFACHVAwEAsgUAIdYDAQCyBQAh1wMBALIFACHYAwIAkQYAIQa0AwEAxAYAIbsDQADFBgAh1QMBAMQGACHWAwEAxAYAIdcDAQDEBgAh2AMCAMcGACEGtAMBAMQGACG7A0AAxQYAIdUDAQDEBgAh1gMBAMQGACHXAwEAxAYAIdgDAgDHBgAhBrQDAQAAAAG7A0AAAAAB1QMBAAAAAdYDAQAAAAHXAwEAAAAB2AMCAAAAAQQ1AADlBgAwuwQAAOYGADC9BAAA6AYAIMEEAADpBgAwAzUAAKwMACC7BAAArQwAIMEEAACMBAAgAzUAAKoMACC7BAAAqwwAIMEEAACZAwAgAAAABTUAAKQMACA2AACoDAAguwQAAKUMACC8BAAApwwAIMEEAAAFACALNQAA-QYAMDYAAP4GADC7BAAA-gYAMLwEAAD7BgAwvQQAAPwGACC-BAAA_QYAML8EAAD9BgAwwAQAAP0GADDBBAAA_QYAMMIEAAD_BgAwwwQAAIAHADAKCQAA8wYAIBQAAPEGACC0AwEAAAABuwNAAAAAAcgDAQAAAAHKAwAAANwDAtoDAQAAAAHcAyAAAAAB3QNAAAAAAd4DQAAAAAECAAAANAAgNQAAhAcAIAMAAAA0ACA1AACEBwAgNgAAgwcAIAEuAACmDAAwDwkAAMoFACAUAACeBgAgFQAAnwYAILEDAACcBgAwsgMAADIAELMDAACcBgAwtAMBAAAAAbsDQAC_BQAhyAMBAMkFACHKAwAAnQbcAyLZAwEAsgUAIdoDAQCyBQAh3AMgANIFACHdA0AAswUAId4DQAC_BQAhAgAAADQAIC4AAIMHACACAAAAgQcAIC4AAIIHACAMsQMAAIAHADCyAwAAgQcAELMDAACABwAwtAMBALIFACG7A0AAvwUAIcgDAQDJBQAhygMAAJ0G3AMi2QMBALIFACHaAwEAsgUAIdwDIADSBQAh3QNAALMFACHeA0AAvwUAIQyxAwAAgAcAMLIDAACBBwAQswMAAIAHADC0AwEAsgUAIbsDQAC_BQAhyAMBAMkFACHKAwAAnQbcAyLZAwEAsgUAIdoDAQCyBQAh3AMgANIFACHdA0AAswUAId4DQAC_BQAhCLQDAQDEBgAhuwNAAMUGACHIAwEA4QYAIcoDAADgBtwDItoDAQDEBgAh3AMgANAGACHdA0AAxgYAId4DQADFBgAhCgkAAOQGACAUAADiBgAgtAMBAMQGACG7A0AAxQYAIcgDAQDhBgAhygMAAOAG3AMi2gMBAMQGACHcAyAA0AYAId0DQADGBgAh3gNAAMUGACEKCQAA8wYAIBQAAPEGACC0AwEAAAABuwNAAAAAAcgDAQAAAAHKAwAAANwDAtoDAQAAAAHcAyAAAAAB3QNAAAAAAd4DQAAAAAEDNQAApAwAILsEAAClDAAgwQQAAAUAIAQ1AAD5BgAwuwQAAPoGADC9BAAA_AYAIMEEAAD9BgAwBgMAAJsHACAEAAC2CgAgBgAAswoAIAoAALQKACALAAC1CgAgFwAAigsAIAAAAAAFNQAAnwwAIDYAAKIMACC7BAAAoAwAILwEAAChDAAgwQQAAJkDACADNQAAnwwAILsEAACgDAAgwQQAAJkDACAAAAABvgQAAADpAwIFNQAAlwwAIDYAAJ0MACC7BAAAmAwAILwEAACcDAAgwQQAAJkDACAFNQAAlQwAIDYAAJoMACC7BAAAlgwAILwEAACZDAAgwQQAAJkDACADNQAAlwwAILsEAACYDAAgwQQAAJkDACADNQAAlQwAILsEAACWDAAgwQQAAJkDACAAAAAFNQAAkAwAIDYAAJMMACC7BAAAkQwAILwEAACSDAAgwQQAAJkDACADNQAAkAwAILsEAACRDAAgwQQAAJkDACAXBwAAtQoAIBAAALsKACAWAACIBwAgGAAAsgoAIBkAALMKACAaAAC0CgAgGwAAtAoAIBwAALYKACAeAAC3CgAgHwAAtwoAICAAALgKACAhAAC5CgAgIwAAvwoAICQAALoKACAlAAC8CgAgJgAAvQoAICcAAL4KACD1AwAAvgYAIPYDAAC-BgAg9wMAAL4GACD4AwAAvgYAIPkDAAC-BgAg_QMAAL4GACAAAAAFNQAAigwAIDYAAI4MACC7BAAAiwwAILwEAACNDAAgwQQAAJkDACALNQAAoQcAMDYAAKYHADC7BAAAogcAMLwEAACjBwAwvQQAAKQHACC-BAAApQcAML8EAAClBwAwwAQAAKUHADDBBAAApQcAMMIEAACnBwAwwwQAAKgHADAIBQAAygYAILQDAQAAAAG1AwEAAAABtwMBAAAAAbgDQAAAAAG5A0AAAAABugMCAAAAAbsDQAAAAAECAAAAWQAgNQAArAcAIAMAAABZACA1AACsBwAgNgAAqwcAIAEuAACMDAAwDQUAAMoFACAiAACSBgAgsQMAAJAGADCyAwAAVwAQswMAAJAGADC0AwEAAAABtQMBALIFACG2AwEAsgUAIbcDAQCyBQAhuANAAL8FACG5A0AAswUAIboDAgCRBgAhuwNAAL8FACECAAAAWQAgLgAAqwcAIAIAAACpBwAgLgAAqgcAIAuxAwAAqAcAMLIDAACpBwAQswMAAKgHADC0AwEAsgUAIbUDAQCyBQAhtgMBALIFACG3AwEAsgUAIbgDQAC_BQAhuQNAALMFACG6AwIAkQYAIbsDQAC_BQAhC7EDAACoBwAwsgMAAKkHABCzAwAAqAcAMLQDAQCyBQAhtQMBALIFACG2AwEAsgUAIbcDAQCyBQAhuANAAL8FACG5A0AAswUAIboDAgCRBgAhuwNAAL8FACEHtAMBAMQGACG1AwEAxAYAIbcDAQDEBgAhuANAAMUGACG5A0AAxgYAIboDAgDHBgAhuwNAAMUGACEIBQAAyAYAILQDAQDEBgAhtQMBAMQGACG3AwEAxAYAIbgDQADFBgAhuQNAAMYGACG6AwIAxwYAIbsDQADFBgAhCAUAAMoGACC0AwEAAAABtQMBAAAAAbcDAQAAAAG4A0AAAAABuQNAAAAAAboDAgAAAAG7A0AAAAABAzUAAIoMACC7BAAAiwwAIMEEAACZAwAgBDUAAKEHADC7BAAAogcAML0EAACkBwAgwQQAAKUHADAAAAABvgQAAAD7AwILNQAA2wkAMDYAAOAJADC7BAAA3AkAMLwEAADdCQAwvQQAAN4JACC-BAAA3wkAML8EAADfCQAwwAQAAN8JADDBBAAA3wkAMMIEAADhCQAwwwQAAOIJADALNQAAzQkAMDYAANIJADC7BAAAzgkAMLwEAADPCQAwvQQAANAJACC-BAAA0QkAML8EAADRCQAwwAQAANEJADDBBAAA0QkAMMIEAADTCQAwwwQAANQJADALNQAAwgkAMDYAAMYJADC7BAAAwwkAMLwEAADECQAwvQQAAMUJACC-BAAAtgkAML8EAAC2CQAwwAQAALYJADDBBAAAtgkAMMIEAADHCQAwwwQAALkJADALNQAAsgkAMDYAALcJADC7BAAAswkAMLwEAAC0CQAwvQQAALUJACC-BAAAtgkAML8EAAC2CQAwwAQAALYJADDBBAAAtgkAMMIEAAC4CQAwwwQAALkJADALNQAAowkAMDYAAKgJADC7BAAApAkAMLwEAAClCQAwvQQAAKYJACC-BAAApwkAML8EAACnCQAwwAQAAKcJADDBBAAApwkAMMIEAACpCQAwwwQAAKoJADALNQAA2ggAMDYAAN8IADC7BAAA2wgAMLwEAADcCAAwvQQAAN0IACC-BAAA3ggAML8EAADeCAAwwAQAAN4IADDBBAAA3ggAMMIEAADgCAAwwwQAAOEIADALNQAA0QgAMDYAANUIADC7BAAA0ggAMLwEAADTCAAwvQQAANQIACC-BAAAyQgAML8EAADJCAAwwAQAAMkIADDBBAAAyQgAMMIEAADWCAAwwwQAAMwIADALNQAAxQgAMDYAAMoIADC7BAAAxggAMLwEAADHCAAwvQQAAMgIACC-BAAAyQgAML8EAADJCAAwwAQAAMkIADDBBAAAyQgAMMIEAADLCAAwwwQAAMwIADALNQAAvAgAMDYAAMAIADC7BAAAvQgAMLwEAAC-CAAwvQQAAL8IACC-BAAA_QYAML8EAAD9BgAwwAQAAP0GADDBBAAA_QYAMMIEAADBCAAwwwQAAIAHADALNQAAsAgAMDYAALUIADC7BAAAsQgAMLwEAACyCAAwvQQAALMIACC-BAAAtAgAML8EAAC0CAAwwAQAALQIADDBBAAAtAgAMMIEAAC2CAAwwwQAALcIADALNQAApAgAMDYAAKkIADC7BAAApQgAMLwEAACmCAAwvQQAAKcIACC-BAAAqAgAML8EAACoCAAwwAQAAKgIADDBBAAAqAgAMMIEAACqCAAwwwQAAKsIADALNQAAmAgAMDYAAJ0IADC7BAAAmQgAMLwEAACaCAAwvQQAAJsIACC-BAAAnAgAML8EAACcCAAwwAQAAJwIADDBBAAAnAgAMMIEAACeCAAwwwQAAJ8IADALNQAA-wcAMDYAAIAIADC7BAAA_AcAMLwEAAD9BwAwvQQAAP4HACC-BAAA_wcAML8EAAD_BwAwwAQAAP8HADDBBAAA_wcAMMIEAACBCAAwwwQAAIIIADAHNQAA9gcAIDYAAPkHACC7BAAA9wcAILwEAAD4BwAgvwQAAF0AIMAEAABdACDBBAAAyAMAIAs1AADoBwAwNgAA7QcAMLsEAADpBwAwvAQAAOoHADC9BAAA6wcAIL4EAADsBwAwvwQAAOwHADDABAAA7AcAMMEEAADsBwAwwgQAAO4HADDDBAAA7wcAMAs1AADNBwAwNgAA0gcAMLsEAADOBwAwvAQAAM8HADC9BAAA0AcAIL4EAADRBwAwvwQAANEHADDABAAA0QcAMMEEAADRBwAwwgQAANMHADDDBAAA1AcAMAs1AADEBwAwNgAAyAcAMLsEAADFBwAwvAQAAMYHADC9BAAAxwcAIL4EAAClBwAwvwQAAKUHADDABAAApQcAMMEEAAClBwAwwgQAAMkHADDDBAAAqAcAMAgiAADLBgAgtAMBAAAAAbYDAQAAAAG3AwEAAAABuANAAAAAAbkDQAAAAAG6AwIAAAABuwNAAAAAAQIAAABZACA1AADMBwAgAwAAAFkAIDUAAMwHACA2AADLBwAgAS4AAIkMADACAAAAWQAgLgAAywcAIAIAAACpBwAgLgAAygcAIAe0AwEAxAYAIbYDAQDEBgAhtwMBAMQGACG4A0AAxQYAIbkDQADGBgAhugMCAMcGACG7A0AAxQYAIQgiAADJBgAgtAMBAMQGACG2AwEAxAYAIbcDAQDEBgAhuANAAMUGACG5A0AAxgYAIboDAgDHBgAhuwNAAMUGACEIIgAAywYAILQDAQAAAAG2AwEAAAABtwMBAAAAAbgDQAAAAAG5A0AAAAABugMCAAAAAbsDQAAAAAEEFgAA5wcAILQDAQAAAAG7A0AAAAAB3gNAAAAAAQIAAAABACA1AADmBwAgAwAAAAEAIDUAAOYHACA2AADXBwAgAS4AAIgMADAJBQAAygUAIBYAAI8GACCxAwAAjgYAMLIDAABgABCzAwAAjgYAMLQDAQAAAAG1AwEAsgUAIbsDQAC_BQAh3gNAAL8FACECAAAAAQAgLgAA1wcAIAIAAADVBwAgLgAA1gcAIAexAwAA1AcAMLIDAADVBwAQswMAANQHADC0AwEAsgUAIbUDAQCyBQAhuwNAAL8FACHeA0AAvwUAIQexAwAA1AcAMLIDAADVBwAQswMAANQHADC0AwEAsgUAIbUDAQCyBQAhuwNAAL8FACHeA0AAvwUAIQO0AwEAxAYAIbsDQADFBgAh3gNAAMUGACEEFgAA2AcAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIQs1AADZBwAwNgAA3gcAMLsEAADaBwAwvAQAANsHADC9BAAA3AcAIL4EAADdBwAwvwQAAN0HADDABAAA3QcAMMEEAADdBwAwwgQAAN8HADDDBAAA4AcAMAa0AwEAAAABuwNAAAAAAcgDAQAAAAGfBAAAALEEArEEgAAAAAGyBAEAAAABAgAAAHYAIDUAAOUHACADAAAAdgAgNQAA5QcAIDYAAOQHACABLgAAhwwAMAsoAACNBgAgsQMAAIoGADCyAwAAdAAQswMAAIoGADC0AwEAAAABuwNAAL8FACHIAwEAyQUAIZ8EAACLBrEEIq8EAQCyBQAhsQQAAIwGACCyBAEAyQUAIQIAAAB2ACAuAADkBwAgAgAAAOEHACAuAADiBwAgCrEDAADgBwAwsgMAAOEHABCzAwAA4AcAMLQDAQCyBQAhuwNAAL8FACHIAwEAyQUAIZ8EAACLBrEEIq8EAQCyBQAhsQQAAIwGACCyBAEAyQUAIQqxAwAA4AcAMLIDAADhBwAQswMAAOAHADC0AwEAsgUAIbsDQAC_BQAhyAMBAMkFACGfBAAAiwaxBCKvBAEAsgUAIbEEAACMBgAgsgQBAMkFACEGtAMBAMQGACG7A0AAxQYAIcgDAQDhBgAhnwQAAOMHsQQisQSAAAAAAbIEAQDhBgAhAb4EAAAAsQQCBrQDAQDEBgAhuwNAAMUGACHIAwEA4QYAIZ8EAADjB7EEIrEEgAAAAAGyBAEA4QYAIQa0AwEAAAABuwNAAAAAAcgDAQAAAAGfBAAAALEEArEEgAAAAAGyBAEAAAABBBYAAOcHACC0AwEAAAABuwNAAAAAAd4DQAAAAAEENQAA2QcAMLsEAADaBwAwvQQAANwHACDBBAAA3QcAMAYMAAD1BwAgtAMBAAAAAYcEAgAAAAGnBAEAAAABqAQgAAAAAakEAgAAAAECAAAAHQAgNQAA9AcAIAMAAAAdACA1AAD0BwAgNgAA8gcAIAEuAACGDAAwDAUAAMoFACAMAACsBgAgsQMAAKsGADCyAwAAGwAQswMAAKsGADC0AwEAAAABtQMBALIFACGHBAIAkQYAIacEAQCyBQAhqAQgANIFACGpBAIAkQYAIbYEAACqBgAgAgAAAB0AIC4AAPIHACACAAAA8AcAIC4AAPEHACAJsQMAAO8HADCyAwAA8AcAELMDAADvBwAwtAMBALIFACG1AwEAsgUAIYcEAgCRBgAhpwQBALIFACGoBCAA0gUAIakEAgCRBgAhCbEDAADvBwAwsgMAAPAHABCzAwAA7wcAMLQDAQCyBQAhtQMBALIFACGHBAIAkQYAIacEAQCyBQAhqAQgANIFACGpBAIAkQYAIQW0AwEAxAYAIYcEAgDHBgAhpwQBAMQGACGoBCAA0AYAIakEAgDHBgAhBgwAAPMHACC0AwEAxAYAIYcEAgDHBgAhpwQBAMQGACGoBCAA0AYAIakEAgDHBgAhBTUAAIEMACA2AACEDAAguwQAAIIMACC8BAAAgwwAIMEEAAAZACAGDAAA9QcAILQDAQAAAAGHBAIAAAABpwQBAAAAAagEIAAAAAGpBAIAAAABAzUAAIEMACC7BAAAggwAIMEEAAAZACAItAMBAAAAAbsDQAAAAAHeA0AAAAAB6gMBAAAAAesDAQAAAAHsAwEAAAAB7QMBAAAAAe4DQAAAAAECAAAAyAMAIDUAAPYHACADAAAAXQAgNQAA9gcAIDYAAPoHACAKAAAAXQAgLgAA-gcAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIeoDAQDhBgAh6wMBAOEGACHsAwEA4QYAIe0DAQDhBgAh7gNAAMYGACEItAMBAMQGACG7A0AAxQYAId4DQADFBgAh6gMBAOEGACHrAwEA4QYAIewDAQDhBgAh7QMBAOEGACHuA0AAxgYAIQ0EAACWCAAgEQAAlwgAILQDAQAAAAG7A0AAAAAB3gNAAAAAAd8DAQAAAAH-A0AAAAABhgQBAAAAAYcEEAAAAAGIBBAAAAABiQQgAAAAAYoEAgAAAAGLBAIAAAABAgAAACIAIDUAAJUIACADAAAAIgAgNQAAlQgAIDYAAIYIACABLgAAgAwAMBMEAACjBgAgBQAAygUAIBEAAKkGACCxAwAAqAYAMLIDAAAgABCzAwAAqAYAMLQDAQAAAAG1AwEAsgUAIbsDQAC_BQAh3gNAAL8FACHfAwEAsgUAIf4DQAC_BQAhhgQBALIFACGHBBAApQYAIYgEEAClBgAhiQQgANIFACGKBAIAkQYAIYsEAgCRBgAhtQQAAKcGACACAAAAIgAgLgAAhggAIAIAAACDCAAgLgAAhAgAIA-xAwAAgggAMLIDAACDCAAQswMAAIIIADC0AwEAsgUAIbUDAQCyBQAhuwNAAL8FACHeA0AAvwUAId8DAQCyBQAh_gNAAL8FACGGBAEAsgUAIYcEEAClBgAhiAQQAKUGACGJBCAA0gUAIYoEAgCRBgAhiwQCAJEGACEPsQMAAIIIADCyAwAAgwgAELMDAACCCAAwtAMBALIFACG1AwEAsgUAIbsDQAC_BQAh3gNAAL8FACHfAwEAsgUAIf4DQAC_BQAhhgQBALIFACGHBBAApQYAIYgEEAClBgAhiQQgANIFACGKBAIAkQYAIYsEAgCRBgAhC7QDAQDEBgAhuwNAAMUGACHeA0AAxQYAId8DAQDEBgAh_gNAAMUGACGGBAEAxAYAIYcEEACFCAAhiAQQAIUIACGJBCAA0AYAIYoEAgDHBgAhiwQCAMcGACEFvgQQAAAAAcUEEAAAAAHGBBAAAAABxwQQAAAAAcgEEAAAAAENBAAAhwgAIBEAAIgIACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACHfAwEAxAYAIf4DQADFBgAhhgQBAMQGACGHBBAAhQgAIYgEEACFCAAhiQQgANAGACGKBAIAxwYAIYsEAgDHBgAhBTUAAPoLACA2AAD-CwAguwQAAPsLACC8BAAA_QsAIMEEAAAVACALNQAAiQgAMDYAAI4IADC7BAAAiggAMLwEAACLCAAwvQQAAIwIACC-BAAAjQgAML8EAACNCAAwwAQAAI0IADDBBAAAjQgAMMIEAACPCAAwwwQAAJAIADAEtAMBAAAAAbsDQAAAAAGEBBAAAAABhQQBAAAAAQIAAAAmACA1AACUCAAgAwAAACYAIDUAAJQIACA2AACTCAAgAS4AAPwLADAJEAAApgYAILEDAACkBgAwsgMAACQAELMDAACkBgAwtAMBAAAAAbsDQAC_BQAhgwQBALIFACGEBBAApQYAIYUEAQDJBQAhAgAAACYAIC4AAJMIACACAAAAkQgAIC4AAJIIACAIsQMAAJAIADCyAwAAkQgAELMDAACQCAAwtAMBALIFACG7A0AAvwUAIYMEAQCyBQAhhAQQAKUGACGFBAEAyQUAIQixAwAAkAgAMLIDAACRCAAQswMAAJAIADC0AwEAsgUAIbsDQAC_BQAhgwQBALIFACGEBBAApQYAIYUEAQDJBQAhBLQDAQDEBgAhuwNAAMUGACGEBBAAhQgAIYUEAQDhBgAhBLQDAQDEBgAhuwNAAMUGACGEBBAAhQgAIYUEAQDhBgAhBLQDAQAAAAG7A0AAAAABhAQQAAAAAYUEAQAAAAENBAAAlggAIBEAAJcIACC0AwEAAAABuwNAAAAAAd4DQAAAAAHfAwEAAAAB_gNAAAAAAYYEAQAAAAGHBBAAAAABiAQQAAAAAYkEIAAAAAGKBAIAAAABiwQCAAAAAQM1AAD6CwAguwQAAPsLACDBBAAAFQAgBDUAAIkIADC7BAAAiggAML0EAACMCAAgwQQAAI0IADAKIwAArgcAILQDAQAAAAG7A0AAAAAB5QNAAAAAAe8DAQAAAAHwAwEAAAAB8QMBAAAAAfIDAQAAAAHzA0AAAAAB9ANAAAAAAQIAAABVACA1AACjCAAgAwAAAFUAIDUAAKMIACA2AACiCAAgAS4AAPkLADAPBQAAygUAICMAAOAFACCxAwAAkwYAMLIDAABTABCzAwAAkwYAMLQDAQAAAAG1AwEAsgUAIbsDQAC_BQAh5QNAAL8FACHvAwEAAAAB8AMBAMkFACHxAwEAyQUAIfIDAQDJBQAh8wNAALMFACH0A0AAvwUAIQIAAABVACAuAACiCAAgAgAAAKAIACAuAAChCAAgDbEDAACfCAAwsgMAAKAIABCzAwAAnwgAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAIeUDQAC_BQAh7wMBALIFACHwAwEAyQUAIfEDAQDJBQAh8gMBAMkFACHzA0AAswUAIfQDQAC_BQAhDbEDAACfCAAwsgMAAKAIABCzAwAAnwgAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAIeUDQAC_BQAh7wMBALIFACHwAwEAyQUAIfEDAQDJBQAh8gMBAMkFACHzA0AAswUAIfQDQAC_BQAhCbQDAQDEBgAhuwNAAMUGACHlA0AAxQYAIe8DAQDEBgAh8AMBAOEGACHxAwEA4QYAIfIDAQDhBgAh8wNAAMYGACH0A0AAxQYAIQojAACgBwAgtAMBAMQGACG7A0AAxQYAIeUDQADFBgAh7wMBAMQGACHwAwEA4QYAIfEDAQDhBgAh8gMBAOEGACHzA0AAxgYAIfQDQADFBgAhCiMAAK4HACC0AwEAAAABuwNAAAAAAeUDQAAAAAHvAwEAAAAB8AMBAAAAAfEDAQAAAAHyAwEAAAAB8wNAAAAAAfQDQAAAAAEFtAMBAAAAAbsDQAAAAAHjAwEAAAAB5ANAAAAAAeUDQAAAAAECAAAAUQAgNQAArwgAIAMAAABRACA1AACvCAAgNgAArggAIAEuAAD4CwAwCgUAAMoFACCxAwAAlAYAMLIDAABPABCzAwAAlAYAMLQDAQAAAAG1AwEAsgUAIbsDQAC_BQAh4wMBALIFACHkA0AAswUAIeUDQAC_BQAhAgAAAFEAIC4AAK4IACACAAAArAgAIC4AAK0IACAJsQMAAKsIADCyAwAArAgAELMDAACrCAAwtAMBALIFACG1AwEAsgUAIbsDQAC_BQAh4wMBALIFACHkA0AAswUAIeUDQAC_BQAhCbEDAACrCAAwsgMAAKwIABCzAwAAqwgAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAIeMDAQCyBQAh5ANAALMFACHlA0AAvwUAIQW0AwEAxAYAIbsDQADFBgAh4wMBAMQGACHkA0AAxgYAIeUDQADFBgAhBbQDAQDEBgAhuwNAAMUGACHjAwEAxAYAIeQDQADGBgAh5QNAAMUGACEFtAMBAAAAAbsDQAAAAAHjAwEAAAAB5ANAAAAAAeUDQAAAAAEHLoAAAAABtAMBAAAAAbsDQAAAAAHHAwEAAAAByAMBAAAAAcoDAAAAygMCywMgAAAAAQIAAABNACA1AAC7CAAgAwAAAE0AIDUAALsIACA2AAC6CAAgAS4AAPcLADAMBQAAygUAIC4AAIwGACCxAwAAlQYAMLIDAABLABCzAwAAlQYAMLQDAQAAAAG1AwEAsgUAIbsDQAC_BQAhxwMBALIFACHIAwEAsgUAIcoDAACWBsoDIssDIADSBQAhAgAAAE0AIC4AALoIACACAAAAuAgAIC4AALkIACALLgAAjAYAILEDAAC3CAAwsgMAALgIABCzAwAAtwgAMLQDAQCyBQAhtQMBALIFACG7A0AAvwUAIccDAQCyBQAhyAMBALIFACHKAwAAlgbKAyLLAyAA0gUAIQsuAACMBgAgsQMAALcIADCyAwAAuAgAELMDAAC3CAAwtAMBALIFACG1AwEAsgUAIbsDQAC_BQAhxwMBALIFACHIAwEAsgUAIcoDAACWBsoDIssDIADSBQAhBy6AAAAAAbQDAQDEBgAhuwNAAMUGACHHAwEAxAYAIcgDAQDEBgAhygMAAM8GygMiywMgANAGACEHLoAAAAABtAMBAMQGACG7A0AAxQYAIccDAQDEBgAhyAMBAMQGACHKAwAAzwbKAyLLAyAA0AYAIQcugAAAAAG0AwEAAAABuwNAAAAAAccDAQAAAAHIAwEAAAABygMAAADKAwLLAyAAAAABChQAAPEGACAVAADyBgAgtAMBAAAAAbsDQAAAAAHIAwEAAAABygMAAADcAwLZAwEAAAAB3AMgAAAAAd0DQAAAAAHeA0AAAAABAgAAADQAIDUAAMQIACADAAAANAAgNQAAxAgAIDYAAMMIACABLgAA9gsAMAIAAAA0ACAuAADDCAAgAgAAAIEHACAuAADCCAAgCLQDAQDEBgAhuwNAAMUGACHIAwEA4QYAIcoDAADgBtwDItkDAQDEBgAh3AMgANAGACHdA0AAxgYAId4DQADFBgAhChQAAOIGACAVAADjBgAgtAMBAMQGACG7A0AAxQYAIcgDAQDhBgAhygMAAOAG3AMi2QMBAMQGACHcAyAA0AYAId0DQADGBgAh3gNAAMUGACEKFAAA8QYAIBUAAPIGACC0AwEAAAABuwNAAAAAAcgDAQAAAAHKAwAAANwDAtkDAQAAAAHcAyAAAAAB3QNAAAAAAd4DQAAAAAEGCAAAlAcAILQDAQAAAAG7A0AAAAAB3gNAAAAAAecDAQAAAAHpAwAAAOkDAgIAAABHACA1AADQCAAgAwAAAEcAIDUAANAIACA2AADPCAAgAS4AAPULADAMCAAAygUAIB0AAMoFACCxAwAAmAYAMLIDAABFABCzAwAAmAYAMLQDAQAAAAG7A0AAvwUAId4DQAC_BQAh5gMBALIFACHnAwEAsgUAIekDAACZBukDIrMEAACXBgAgAgAAAEcAIC4AAM8IACACAAAAzQgAIC4AAM4IACAJsQMAAMwIADCyAwAAzQgAELMDAADMCAAwtAMBALIFACG7A0AAvwUAId4DQAC_BQAh5gMBALIFACHnAwEAsgUAIekDAACZBukDIgmxAwAAzAgAMLIDAADNCAAQswMAAMwIADC0AwEAsgUAIbsDQAC_BQAh3gNAAL8FACHmAwEAsgUAIecDAQCyBQAh6QMAAJkG6QMiBbQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIecDAQDEBgAh6QMAAJEH6QMiBggAAJIHACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACHnAwEAxAYAIekDAACRB-kDIgYIAACUBwAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB5wMBAAAAAekDAAAA6QMCBh0AAJUHACC0AwEAAAABuwNAAAAAAd4DQAAAAAHmAwEAAAAB6QMAAADpAwICAAAARwAgNQAA2QgAIAMAAABHACA1AADZCAAgNgAA2AgAIAEuAAD0CwAwAgAAAEcAIC4AANgIACACAAAAzQgAIC4AANcIACAFtAMBAMQGACG7A0AAxQYAId4DQADFBgAh5gMBAMQGACHpAwAAkQfpAyIGHQAAkwcAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIeYDAQDEBgAh6QMAAJEH6QMiBh0AAJUHACC0AwEAAAABuwNAAAAAAd4DQAAAAAHmAwEAAAAB6QMAAADpAwIPBwAAnwkAIA8AAKAJACAQAAChCQAgEgAAogkAILQDAQAAAAG7A0AAAAAB3gNAAAAAAd8DAQAAAAH1AwEAAAABjgQBAAAAAY8ECAAAAAGRBAAAAJEEApIEAQAAAAGTBAEAAAABlgQAAACWBAICAAAAFQAgNQAAngkAIAMAAAAVACA1AACeCQAgNgAA5wgAIAEuAADzCwAwFAMAAMoFACAHAADABQAgDwAAswYAIBAAANwFACASAAC0BgAgsQMAAK8GADCyAwAAEwAQswMAAK8GADC0AwEAAAABuwNAAL8FACHeA0AAvwUAId8DAQCyBQAh9QMBALIFACGOBAEAsgUAIY8ECACwBgAhkQQAALEGkQQikgQBALIFACGTBAEAyQUAIZQEAQCyBQAhlgQAALIGlgQiAgAAABUAIC4AAOcIACACAAAA4ggAIC4AAOMIACAPsQMAAOEIADCyAwAA4ggAELMDAADhCAAwtAMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH1AwEAsgUAIY4EAQCyBQAhjwQIALAGACGRBAAAsQaRBCKSBAEAsgUAIZMEAQDJBQAhlAQBALIFACGWBAAAsgaWBCIPsQMAAOEIADCyAwAA4ggAELMDAADhCAAwtAMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH1AwEAsgUAIY4EAQCyBQAhjwQIALAGACGRBAAAsQaRBCKSBAEAsgUAIZMEAQDJBQAhlAQBALIFACGWBAAAsgaWBCILtAMBAMQGACG7A0AAxQYAId4DQADFBgAh3wMBAMQGACH1AwEAxAYAIY4EAQDEBgAhjwQIAOQIACGRBAAA5QiRBCKSBAEAxAYAIZMEAQDhBgAhlgQAAOYIlgQiBb4ECAAAAAHFBAgAAAABxgQIAAAAAccECAAAAAHIBAgAAAABAb4EAAAAkQQCAb4EAAAAlgQCDwcAAOgIACAPAADpCAAgEAAA6ggAIBIAAOsIACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACHfAwEAxAYAIfUDAQDEBgAhjgQBAMQGACGPBAgA5AgAIZEEAADlCJEEIpIEAQDEBgAhkwQBAOEGACGWBAAA5giWBCIFNQAA4AsAIDYAAPELACC7BAAA4QsAILwEAADwCwAgwQQAAAUAIAs1AACECQAwNgAAiQkAMLsEAACFCQAwvAQAAIYJADC9BAAAhwkAIL4EAACICQAwvwQAAIgJADDABAAAiAkAMMEEAACICQAwwgQAAIoJADDDBAAAiwkAMAs1AAD5CAAwNgAA_QgAMLsEAAD6CAAwvAQAAPsIADC9BAAA_AgAIL4EAAD_BwAwvwQAAP8HADDABAAA_wcAMMEEAAD_BwAwwgQAAP4IADDDBAAAgggAMAs1AADsCAAwNgAA8QgAMLsEAADtCAAwvAQAAO4IADC9BAAA7wgAIL4EAADwCAAwvwQAAPAIADDABAAA8AgAMMEEAADwCAAwwgQAAPIIADDDBAAA8wgAMAK0AwEAAAABjQQAAACNBAICAAAAKwAgNQAA-AgAIAMAAAArACA1AAD4CAAgNgAA9wgAIAEuAADvCwAwCAQAAKMGACCxAwAAoQYAMLIDAAApABCzAwAAoQYAMLQDAQAAAAGGBAEAsgUAIY0EAACiBo0EIrQEAACgBgAgAgAAACsAIC4AAPcIACACAAAA9AgAIC4AAPUIACAGsQMAAPMIADCyAwAA9AgAELMDAADzCAAwtAMBALIFACGGBAEAsgUAIY0EAACiBo0EIgaxAwAA8wgAMLIDAAD0CAAQswMAAPMIADC0AwEAsgUAIYYEAQCyBQAhjQQAAKIGjQQiArQDAQDEBgAhjQQAAPYIjQQiAb4EAAAAjQQCArQDAQDEBgAhjQQAAPYIjQQiArQDAQAAAAGNBAAAAI0EAg0FAACDCQAgEQAAlwgAILQDAQAAAAG1AwEAAAABuwNAAAAAAd4DQAAAAAHfAwEAAAAB_gNAAAAAAYcEEAAAAAGIBBAAAAABiQQgAAAAAYoEAgAAAAGLBAIAAAABAgAAACIAIDUAAIIJACADAAAAIgAgNQAAggkAIDYAAIAJACABLgAA7gsAMAIAAAAiACAuAACACQAgAgAAAIMIACAuAAD_CAAgC7QDAQDEBgAhtQMBAMQGACG7A0AAxQYAId4DQADFBgAh3wMBAMQGACH-A0AAxQYAIYcEEACFCAAhiAQQAIUIACGJBCAA0AYAIYoEAgDHBgAhiwQCAMcGACENBQAAgQkAIBEAAIgIACC0AwEAxAYAIbUDAQDEBgAhuwNAAMUGACHeA0AAxQYAId8DAQDEBgAh_gNAAMUGACGHBBAAhQgAIYgEEACFCAAhiQQgANAGACGKBAIAxwYAIYsEAgDHBgAhBTUAAOkLACA2AADsCwAguwQAAOoLACC8BAAA6wsAIMEEAACZAwAgDQUAAIMJACARAACXCAAgtAMBAAAAAbUDAQAAAAG7A0AAAAAB3gNAAAAAAd8DAQAAAAH-A0AAAAABhwQQAAAAAYgEEAAAAAGJBCAAAAABigQCAAAAAYsEAgAAAAEDNQAA6QsAILsEAADqCwAgwQQAAJkDACAKDQAAnQkAILQDAQAAAAG7A0AAAAABxwMBAAAAAY4EAQAAAAGSBAEAAAABqgQBAAAAAasEAgAAAAGtBAAAAK0EA64EAQAAAAECAAAAGQAgNQAAnAkAIAMAAAAZACA1AACcCQAgNgAAjwkAIAEuAADoCwAwDwQAAKMGACANAADeBQAgsQMAAK0GADCyAwAAFwAQswMAAK0GADC0AwEAAAABuwNAAL8FACHHAwEAsgUAIYYEAQCyBQAhjgQBAMkFACGSBAEAsgUAIaoEAQDJBQAhqwQCAJEGACGtBAAArgatBCOuBAEAyQUAIQIAAAAZACAuAACPCQAgAgAAAIwJACAuAACNCQAgDbEDAACLCQAwsgMAAIwJABCzAwAAiwkAMLQDAQCyBQAhuwNAAL8FACHHAwEAsgUAIYYEAQCyBQAhjgQBAMkFACGSBAEAsgUAIaoEAQDJBQAhqwQCAJEGACGtBAAArgatBCOuBAEAyQUAIQ2xAwAAiwkAMLIDAACMCQAQswMAAIsJADC0AwEAsgUAIbsDQAC_BQAhxwMBALIFACGGBAEAsgUAIY4EAQDJBQAhkgQBALIFACGqBAEAyQUAIasEAgCRBgAhrQQAAK4GrQQjrgQBAMkFACEJtAMBAMQGACG7A0AAxQYAIccDAQDEBgAhjgQBAOEGACGSBAEAxAYAIaoEAQDhBgAhqwQCAMcGACGtBAAAjgmtBCOuBAEA4QYAIQG-BAAAAK0EAwoNAACQCQAgtAMBAMQGACG7A0AAxQYAIccDAQDEBgAhjgQBAOEGACGSBAEAxAYAIaoEAQDhBgAhqwQCAMcGACGtBAAAjgmtBCOuBAEA4QYAIQs1AACRCQAwNgAAlQkAMLsEAACSCQAwvAQAAJMJADC9BAAAlAkAIL4EAADsBwAwvwQAAOwHADDABAAA7AcAMMEEAADsBwAwwgQAAJYJADDDBAAA7wcAMAYFAACbCQAgtAMBAAAAAbUDAQAAAAGHBAIAAAABqAQgAAAAAakEAgAAAAECAAAAHQAgNQAAmgkAIAMAAAAdACA1AACaCQAgNgAAmAkAIAEuAADnCwAwAgAAAB0AIC4AAJgJACACAAAA8AcAIC4AAJcJACAFtAMBAMQGACG1AwEAxAYAIYcEAgDHBgAhqAQgANAGACGpBAIAxwYAIQYFAACZCQAgtAMBAMQGACG1AwEAxAYAIYcEAgDHBgAhqAQgANAGACGpBAIAxwYAIQU1AADiCwAgNgAA5QsAILsEAADjCwAgvAQAAOQLACDBBAAAmQMAIAYFAACbCQAgtAMBAAAAAbUDAQAAAAGHBAIAAAABqAQgAAAAAakEAgAAAAEDNQAA4gsAILsEAADjCwAgwQQAAJkDACAKDQAAnQkAILQDAQAAAAG7A0AAAAABxwMBAAAAAY4EAQAAAAGSBAEAAAABqgQBAAAAAasEAgAAAAGtBAAAAK0EA64EAQAAAAEENQAAkQkAMLsEAACSCQAwvQQAAJQJACDBBAAA7AcAMA8HAACfCQAgDwAAoAkAIBAAAKEJACASAACiCQAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB3wMBAAAAAfUDAQAAAAGOBAEAAAABjwQIAAAAAZEEAAAAkQQCkgQBAAAAAZMEAQAAAAGWBAAAAJYEAgM1AADgCwAguwQAAOELACDBBAAABQAgBDUAAIQJADC7BAAAhQkAML0EAACHCQAgwQQAAIgJADAENQAA-QgAMLsEAAD6CAAwvQQAAPwIACDBBAAA_wcAMAQ1AADsCAAwuwQAAO0IADC9BAAA7wgAIMEEAADwCAAwCgcAALEJACC0AwEAAAAB3wMBAAAAAfwDIAAAAAGKBAIAAAABiwQCAAAAAZ8EAAAAnwQCoARAAAAAAaEEQAAAAAGiBAgAAAABAgAAABEAIDUAALAJACADAAAAEQAgNQAAsAkAIDYAAK4JACABLgAA3wsAMBAFAADKBQAgBwAAwAUAILEDAAC2BgAwsgMAAA8AELMDAAC2BgAwtAMBAAAAAbUDAQCyBQAh3wMBALIFACH8AyAA0gUAIYoEAgCRBgAhiwQCAJEGACGfBAAAtwafBCKgBEAAvwUAIaEEQACzBQAhogQIALAGACG3BAAAtQYAIAIAAAARACAuAACuCQAgAgAAAKsJACAuAACsCQAgDbEDAACqCQAwsgMAAKsJABCzAwAAqgkAMLQDAQCyBQAhtQMBALIFACHfAwEAsgUAIfwDIADSBQAhigQCAJEGACGLBAIAkQYAIZ8EAAC3Bp8EIqAEQAC_BQAhoQRAALMFACGiBAgAsAYAIQ2xAwAAqgkAMLIDAACrCQAQswMAAKoJADC0AwEAsgUAIbUDAQCyBQAh3wMBALIFACH8AyAA0gUAIYoEAgCRBgAhiwQCAJEGACGfBAAAtwafBCKgBEAAvwUAIaEEQACzBQAhogQIALAGACEJtAMBAMQGACHfAwEAxAYAIfwDIADQBgAhigQCAMcGACGLBAIAxwYAIZ8EAACtCZ8EIqAEQADFBgAhoQRAAMYGACGiBAgA5AgAIQG-BAAAAJ8EAgoHAACvCQAgtAMBAMQGACHfAwEAxAYAIfwDIADQBgAhigQCAMcGACGLBAIAxwYAIZ8EAACtCZ8EIqAEQADFBgAhoQRAAMYGACGiBAgA5AgAIQU1AADaCwAgNgAA3QsAILsEAADbCwAgvAQAANwLACDBBAAABQAgCgcAALEJACC0AwEAAAAB3wMBAAAAAfwDIAAAAAGKBAIAAAABiwQCAAAAAZ8EAAAAnwQCoARAAAAAAaEEQAAAAAGiBAgAAAABAzUAANoLACC7BAAA2wsAIMEEAAAFACAIBwAAwAkAIAgAAMEJACC0AwEAAAABuwNAAAAAAd8DAQAAAAHlA0AAAAAB5wMBAAAAAZ0EQAAAAAECAAAADQAgNQAAvwkAIAMAAAANACA1AAC_CQAgNgAAvAkAIAEuAADZCwAwDQcAAMAFACAIAADKBQAgCQAAygUAILEDAAC4BgAwsgMAAAsAELMDAAC4BgAwtAMBAAAAAbsDQAC_BQAh2gMBALIFACHfAwEAsgUAIeUDQACzBQAh5wMBALIFACGdBEAAswUAIQIAAAANACAuAAC8CQAgAgAAALoJACAuAAC7CQAgCrEDAAC5CQAwsgMAALoJABCzAwAAuQkAMLQDAQCyBQAhuwNAAL8FACHaAwEAsgUAId8DAQCyBQAh5QNAALMFACHnAwEAsgUAIZ0EQACzBQAhCrEDAAC5CQAwsgMAALoJABCzAwAAuQkAMLQDAQCyBQAhuwNAAL8FACHaAwEAsgUAId8DAQCyBQAh5QNAALMFACHnAwEAsgUAIZ0EQACzBQAhBrQDAQDEBgAhuwNAAMUGACHfAwEAxAYAIeUDQADGBgAh5wMBAMQGACGdBEAAxgYAIQgHAAC9CQAgCAAAvgkAILQDAQDEBgAhuwNAAMUGACHfAwEAxAYAIeUDQADGBgAh5wMBAMQGACGdBEAAxgYAIQU1AADRCwAgNgAA1wsAILsEAADSCwAgvAQAANYLACDBBAAABQAgBTUAAM8LACA2AADUCwAguwQAANALACC8BAAA0wsAIMEEAACZAwAgCAcAAMAJACAIAADBCQAgtAMBAAAAAbsDQAAAAAHfAwEAAAAB5QNAAAAAAecDAQAAAAGdBEAAAAABAzUAANELACC7BAAA0gsAIMEEAAAFACADNQAAzwsAILsEAADQCwAgwQQAAJkDACAIBwAAwAkAIAkAAMwJACC0AwEAAAABuwNAAAAAAdoDAQAAAAHfAwEAAAAB5QNAAAAAAZ0EQAAAAAECAAAADQAgNQAAywkAIAMAAAANACA1AADLCQAgNgAAyQkAIAEuAADOCwAwAgAAAA0AIC4AAMkJACACAAAAugkAIC4AAMgJACAGtAMBAMQGACG7A0AAxQYAIdoDAQDEBgAh3wMBAMQGACHlA0AAxgYAIZ0EQADGBgAhCAcAAL0JACAJAADKCQAgtAMBAMQGACG7A0AAxQYAIdoDAQDEBgAh3wMBAMQGACHlA0AAxgYAIZ0EQADGBgAhBTUAAMkLACA2AADMCwAguwQAAMoLACC8BAAAywsAIMEEAACZAwAgCAcAAMAJACAJAADMCQAgtAMBAAAAAbsDQAAAAAHaAwEAAAAB3wMBAAAAAeUDQAAAAAGdBEAAAAABAzUAAMkLACC7BAAAygsAIMEEAACZAwAgCgQAANoJACC0AwEAAAABuwNAAAAAAd4DQAAAAAHfAwEAAAAB_gNAAAAAAf8DAgAAAAGABAIAAAABgQQQAAAAAYIEIAAAAAECAAAACQAgNQAA2QkAIAMAAAAJACA1AADZCQAgNgAA1wkAIAEuAADICwAwEAQAAMAFACAFAADKBQAgsQMAALoGADCyAwAABwAQswMAALoGADC0AwEAAAABtQMBALIFACG7A0AAvwUAId4DQAC_BQAh3wMBALIFACH-A0AAvwUAIf8DAgCRBgAhgAQCAJEGACGBBBAApQYAIYIEIADSBQAhuAQAALkGACACAAAACQAgLgAA1wkAIAIAAADVCQAgLgAA1gkAIA2xAwAA1AkAMLIDAADVCQAQswMAANQJADC0AwEAsgUAIbUDAQCyBQAhuwNAAL8FACHeA0AAvwUAId8DAQCyBQAh_gNAAL8FACH_AwIAkQYAIYAEAgCRBgAhgQQQAKUGACGCBCAA0gUAIQ2xAwAA1AkAMLIDAADVCQAQswMAANQJADC0AwEAsgUAIbUDAQCyBQAhuwNAAL8FACHeA0AAvwUAId8DAQCyBQAh_gNAAL8FACH_AwIAkQYAIYAEAgCRBgAhgQQQAKUGACGCBCAA0gUAIQm0AwEAxAYAIbsDQADFBgAh3gNAAMUGACHfAwEAxAYAIf4DQADFBgAh_wMCAMcGACGABAIAxwYAIYEEEACFCAAhggQgANAGACEKBAAA2AkAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAId8DAQDEBgAh_gNAAMUGACH_AwIAxwYAIYAEAgDHBgAhgQQQAIUIACGCBCAA0AYAIQU1AADDCwAgNgAAxgsAILsEAADECwAgvAQAAMULACDBBAAABQAgCgQAANoJACC0AwEAAAABuwNAAAAAAd4DQAAAAAHfAwEAAAAB_gNAAAAAAf8DAgAAAAGABAIAAAABgQQQAAAAAYIEIAAAAAEDNQAAwwsAILsEAADECwAgwQQAAAUAIA4EAACfCgAgBgAAnAoAIAoAAJ0KACALAACeCgAgFwAAoAoAILQDAQAAAAG7A0AAAAAB3gNAAAAAAfUDAQAAAAGSBAEAAAABkwQBAAAAAaMEAgAAAAGkBAIAAAABpgQAAACmBAICAAAABQAgNQAAmwoAIAMAAAAFACA1AACbCgAgNgAA5gkAIAEuAADCCwAwEwMAAMoFACAEAADXBQAgBgAA1AUAIAoAANUFACALAADWBQAgFwAAvQYAILEDAAC7BgAwsgMAAAMAELMDAAC7BgAwtAMBAAAAAbsDQAC_BQAh3gNAAL8FACH1AwEAsgUAIZIEAQCyBQAhkwQBALIFACGUBAEAsgUAIaMEAgCRBgAhpAQCAJEGACGmBAAAvAamBCICAAAABQAgLgAA5gkAIAIAAADjCQAgLgAA5AkAIA2xAwAA4gkAMLIDAADjCQAQswMAAOIJADC0AwEAsgUAIbsDQAC_BQAh3gNAAL8FACH1AwEAsgUAIZIEAQCyBQAhkwQBALIFACGUBAEAsgUAIaMEAgCRBgAhpAQCAJEGACGmBAAAvAamBCINsQMAAOIJADCyAwAA4wkAELMDAADiCQAwtAMBALIFACG7A0AAvwUAId4DQAC_BQAh9QMBALIFACGSBAEAsgUAIZMEAQCyBQAhlAQBALIFACGjBAIAkQYAIaQEAgCRBgAhpgQAALwGpgQiCbQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDEBgAhkgQBAMQGACGTBAEAxAYAIaMEAgDHBgAhpAQCAMcGACGmBAAA5QmmBCIBvgQAAACmBAIOBAAA6gkAIAYAAOcJACAKAADoCQAgCwAA6QkAIBcAAOsJACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEAxAYAIZIEAQDEBgAhkwQBAMQGACGjBAIAxwYAIaQEAgDHBgAhpgQAAOUJpgQiCzUAAJAKADA2AACUCgAwuwQAAJEKADC8BAAAkgoAML0EAACTCgAgvgQAANEJADC_BAAA0QkAMMAEAADRCQAwwQQAANEJADDCBAAAlQoAMMMEAADUCQAwCzUAAIcKADA2AACLCgAwuwQAAIgKADC8BAAAiQoAML0EAACKCgAgvgQAALYJADC_BAAAtgkAMMAEAAC2CQAwwQQAALYJADDCBAAAjAoAMMMEAAC5CQAwCzUAAPwJADA2AACACgAwuwQAAP0JADC8BAAA_gkAML0EAAD_CQAgvgQAAKcJADC_BAAApwkAMMAEAACnCQAwwQQAAKcJADDCBAAAgQoAMMMEAACqCQAwCzUAAPEJADA2AAD1CQAwuwQAAPIJADC8BAAA8wkAML0EAAD0CQAgvgQAAN4IADC_BAAA3ggAMMAEAADeCAAwwQQAAN4IADDCBAAA9gkAMMMEAADhCAAwBzUAAOwJACA2AADvCQAguwQAAO0JACC8BAAA7gkAIL8EAAAwACDABAAAMAAgwQQAAIwEACADFgAAhgcAILQDAQAAAAG7A0AAAAABAgAAAIwEACA1AADsCQAgAwAAADAAIDUAAOwJACA2AADwCQAgBQAAADAAIBYAAPgGACAuAADwCQAgtAMBAMQGACG7A0AAxQYAIQMWAAD4BgAgtAMBAMQGACG7A0AAxQYAIQ8DAAD7CQAgDwAAoAkAIBAAAKEJACASAACiCQAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAY4EAQAAAAGPBAgAAAABkQQAAACRBAKSBAEAAAABkwQBAAAAAZQEAQAAAAGWBAAAAJYEAgIAAAAVACA1AAD6CQAgAwAAABUAIDUAAPoJACA2AAD4CQAgAS4AAMELADACAAAAFQAgLgAA-AkAIAIAAADiCAAgLgAA9wkAIAu0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEAxAYAIY4EAQDEBgAhjwQIAOQIACGRBAAA5QiRBCKSBAEAxAYAIZMEAQDhBgAhlAQBAMQGACGWBAAA5giWBCIPAwAA-QkAIA8AAOkIACAQAADqCAAgEgAA6wgAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDEBgAhjgQBAMQGACGPBAgA5AgAIZEEAADlCJEEIpIEAQDEBgAhkwQBAOEGACGUBAEAxAYAIZYEAADmCJYEIgU1AAC8CwAgNgAAvwsAILsEAAC9CwAgvAQAAL4LACDBBAAAmQMAIA8DAAD7CQAgDwAAoAkAIBAAAKEJACASAACiCQAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAY4EAQAAAAGPBAgAAAABkQQAAACRBAKSBAEAAAABkwQBAAAAAZQEAQAAAAGWBAAAAJYEAgM1AAC8CwAguwQAAL0LACDBBAAAmQMAIAoFAACGCgAgtAMBAAAAAbUDAQAAAAH8AyAAAAABigQCAAAAAYsEAgAAAAGfBAAAAJ8EAqAEQAAAAAGhBEAAAAABogQIAAAAAQIAAAARACA1AACFCgAgAwAAABEAIDUAAIUKACA2AACDCgAgAS4AALsLADACAAAAEQAgLgAAgwoAIAIAAACrCQAgLgAAggoAIAm0AwEAxAYAIbUDAQDEBgAh_AMgANAGACGKBAIAxwYAIYsEAgDHBgAhnwQAAK0JnwQioARAAMUGACGhBEAAxgYAIaIECADkCAAhCgUAAIQKACC0AwEAxAYAIbUDAQDEBgAh_AMgANAGACGKBAIAxwYAIYsEAgDHBgAhnwQAAK0JnwQioARAAMUGACGhBEAAxgYAIaIECADkCAAhBTUAALYLACA2AAC5CwAguwQAALcLACC8BAAAuAsAIMEEAACZAwAgCgUAAIYKACC0AwEAAAABtQMBAAAAAfwDIAAAAAGKBAIAAAABiwQCAAAAAZ8EAAAAnwQCoARAAAAAAaEEQAAAAAGiBAgAAAABAzUAALYLACC7BAAAtwsAIMEEAACZAwAgCAgAAMEJACAJAADMCQAgtAMBAAAAAbsDQAAAAAHaAwEAAAAB5QNAAAAAAecDAQAAAAGdBEAAAAABAgAAAA0AIDUAAI8KACADAAAADQAgNQAAjwoAIDYAAI4KACABLgAAtQsAMAIAAAANACAuAACOCgAgAgAAALoJACAuAACNCgAgBrQDAQDEBgAhuwNAAMUGACHaAwEAxAYAIeUDQADGBgAh5wMBAMQGACGdBEAAxgYAIQgIAAC-CQAgCQAAygkAILQDAQDEBgAhuwNAAMUGACHaAwEAxAYAIeUDQADGBgAh5wMBAMQGACGdBEAAxgYAIQgIAADBCQAgCQAAzAkAILQDAQAAAAG7A0AAAAAB2gMBAAAAAeUDQAAAAAHnAwEAAAABnQRAAAAAAQoFAACaCgAgtAMBAAAAAbUDAQAAAAG7A0AAAAAB3gNAAAAAAf4DQAAAAAH_AwIAAAABgAQCAAAAAYEEEAAAAAGCBCAAAAABAgAAAAkAIDUAAJkKACADAAAACQAgNQAAmQoAIDYAAJcKACABLgAAtAsAMAIAAAAJACAuAACXCgAgAgAAANUJACAuAACWCgAgCbQDAQDEBgAhtQMBAMQGACG7A0AAxQYAId4DQADFBgAh_gNAAMUGACH_AwIAxwYAIYAEAgDHBgAhgQQQAIUIACGCBCAA0AYAIQoFAACYCgAgtAMBAMQGACG1AwEAxAYAIbsDQADFBgAh3gNAAMUGACH-A0AAxQYAIf8DAgDHBgAhgAQCAMcGACGBBBAAhQgAIYIEIADQBgAhBTUAAK8LACA2AACyCwAguwQAALALACC8BAAAsQsAIMEEAACZAwAgCgUAAJoKACC0AwEAAAABtQMBAAAAAbsDQAAAAAHeA0AAAAAB_gNAAAAAAf8DAgAAAAGABAIAAAABgQQQAAAAAYIEIAAAAAEDNQAArwsAILsEAACwCwAgwQQAAJkDACAOBAAAnwoAIAYAAJwKACAKAACdCgAgCwAAngoAIBcAAKAKACC0AwEAAAABuwNAAAAAAd4DQAAAAAH1AwEAAAABkgQBAAAAAZMEAQAAAAGjBAIAAAABpAQCAAAAAaYEAAAApgQCBDUAAJAKADC7BAAAkQoAML0EAACTCgAgwQQAANEJADAENQAAhwoAMLsEAACICgAwvQQAAIoKACDBBAAAtgkAMAQ1AAD8CQAwuwQAAP0JADC9BAAA_wkAIMEEAACnCQAwBDUAAPEJADC7BAAA8gkAML0EAAD0CQAgwQQAAN4IADADNQAA7AkAILsEAADtCQAgwQQAAIwEACAENQAA2wkAMLsEAADcCQAwvQQAAN4JACDBBAAA3wkAMAQ1AADNCQAwuwQAAM4JADC9BAAA0AkAIMEEAADRCQAwBDUAAMIJADC7BAAAwwkAML0EAADFCQAgwQQAALYJADAENQAAsgkAMLsEAACzCQAwvQQAALUJACDBBAAAtgkAMAQ1AACjCQAwuwQAAKQJADC9BAAApgkAIMEEAACnCQAwBDUAANoIADC7BAAA2wgAML0EAADdCAAgwQQAAN4IADAENQAA0QgAMLsEAADSCAAwvQQAANQIACDBBAAAyQgAMAQ1AADFCAAwuwQAAMYIADC9BAAAyAgAIMEEAADJCAAwBDUAALwIADC7BAAAvQgAML0EAAC_CAAgwQQAAP0GADAENQAAsAgAMLsEAACxCAAwvQQAALMIACDBBAAAtAgAMAQ1AACkCAAwuwQAAKUIADC9BAAApwgAIMEEAACoCAAwBDUAAJgIADC7BAAAmQgAML0EAACbCAAgwQQAAJwIADAENQAA-wcAMLsEAAD8BwAwvQQAAP4HACDBBAAA_wcAMAM1AAD2BwAguwQAAPcHACDBBAAAyAMAIAQ1AADoBwAwuwQAAOkHADC9BAAA6wcAIMEEAADsBwAwBDUAAM0HADC7BAAAzgcAML0EAADQBwAgwQQAANEHADAENQAAxAcAMLsEAADFBwAwvQQAAMcHACDBBAAApQcAMAAAAAAAAAAAAAAGBQAAmwcAIOoDAAC-BgAg6wMAAL4GACDsAwAAvgYAIO0DAAC-BgAg7gMAAL4GACAAAAAAAAAAAAAAAAAABTUAAKoLACA2AACtCwAguwQAAKsLACC8BAAArAsAIMEEAAAiACADNQAAqgsAILsEAACrCwAgwQQAACIAIAAAAAAAAAAABTUAAKULACA2AACoCwAguwQAAKYLACC8BAAApwsAIMEEAAAVACADNQAApQsAILsEAACmCwAgwQQAABUAIAAAAAAAAAAAAr4EAQAAAATEBAEAAAAFAb4EAQAAAAQAAAAAAAAAAAAAAAAABTUAAKALACA2AACjCwAguwQAAKELACC8BAAAogsAIMEEAACZAwAgAzUAAKALACC7BAAAoQsAIMEEAACZAwAgAAAAAAAAAAAAAAU1AACbCwAgNgAAngsAILsEAACcCwAgvAQAAJ0LACDBBAAAFQAgAzUAAJsLACC7BAAAnAsAIMEEAAAVACAAAAAFNQAAlgsAIDYAAJkLACC7BAAAlwsAILwEAACYCwAgwQQAAAEAIAM1AACWCwAguwQAAJcLACDBBAAAAQAgAAAABTUAAJELACA2AACUCwAguwQAAJILACC8BAAAkwsAIMEEAACZAwAgAzUAAJELACC7BAAAkgsAIMEEAACZAwAgAgUAAJsHACAWAACGCwAgAAYFAACbBwAgIwAAvwoAIPADAAC-BgAg8QMAAL4GACDyAwAAvgYAIPMDAAC-BgAgBQkAAJsHACAUAACJCwAgFQAAigsAIMgDAAC-BgAg3QMAAL4GACAAAgcAAIcHACAWAACIBwAgBgMAAJsHACAHAACHBwAgDwAAjwsAIBAAALsKACASAACQCwAgkwQAAL4GACADBAAAiwsAIAUAAJsHACARAACNCwAgAAYEAACLCwAgDQAAvQoAII4EAAC-BgAgqgQAAL4GACCtBAAAvgYAIK4EAAC-BgAgAAAbBwAApQoAIBAAAK0KACAWAACpCgAgGAAAoQoAIBkAAKIKACAaAACjCgAgGwAApAoAIBwAAKYKACAeAACnCgAgHwAAqAoAICAAAKoKACAhAACrCgAgIwAAsQoAICQAAKwKACAlAACuCgAgJgAArwoAILQDAQAAAAG7A0AAAAAB3gNAAAAAAfUDAQAAAAH2AwEAAAAB9wMBAAAAAfgDAQAAAAH5AwEAAAAB-wMAAAD7AwL8AyAAAAAB_QMBAAAAAQIAAACZAwAgNQAAkQsAIAMAAACcAwAgNQAAkQsAIDYAAJULACAdAAAAnAMAIAcAALcHACAQAAC_BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBsAALYHACAcAAC4BwAgHgAAuQcAIB8AALoHACAgAAC8BwAgIQAAvQcAICMAAMMHACAkAAC-BwAgJQAAwAcAICYAAMEHACAuAACVCwAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_QMBAOEGACEbBwAAtwcAIBAAAL8HACAWAAC7BwAgGAAAswcAIBkAALQHACAaAAC1BwAgGwAAtgcAIBwAALgHACAeAAC5BwAgHwAAugcAICAAALwHACAhAAC9BwAgIwAAwwcAICQAAL4HACAlAADABwAgJgAAwQcAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhBQUAAIQLACC0AwEAAAABtQMBAAAAAbsDQAAAAAHeA0AAAAABAgAAAAEAIDUAAJYLACADAAAAYAAgNQAAlgsAIDYAAJoLACAHAAAAYAAgBQAAgwsAIC4AAJoLACC0AwEAxAYAIbUDAQDEBgAhuwNAAMUGACHeA0AAxQYAIQUFAACDCwAgtAMBAMQGACG1AwEAxAYAIbsDQADFBgAh3gNAAMUGACEQAwAA-wkAIAcAAJ8JACAQAAChCQAgEgAAogkAILQDAQAAAAG7A0AAAAAB3gNAAAAAAd8DAQAAAAH1AwEAAAABjgQBAAAAAY8ECAAAAAGRBAAAAJEEApIEAQAAAAGTBAEAAAABlAQBAAAAAZYEAAAAlgQCAgAAABUAIDUAAJsLACADAAAAEwAgNQAAmwsAIDYAAJ8LACASAAAAEwAgAwAA-QkAIAcAAOgIACAQAADqCAAgEgAA6wgAIC4AAJ8LACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACHfAwEAxAYAIfUDAQDEBgAhjgQBAMQGACGPBAgA5AgAIZEEAADlCJEEIpIEAQDEBgAhkwQBAOEGACGUBAEAxAYAIZYEAADmCJYEIhADAAD5CQAgBwAA6AgAIBAAAOoIACASAADrCAAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh3wMBAMQGACH1AwEAxAYAIY4EAQDEBgAhjwQIAOQIACGRBAAA5QiRBCKSBAEAxAYAIZMEAQDhBgAhlAQBAMQGACGWBAAA5giWBCIbBwAApQoAIBAAAK0KACAWAACpCgAgGQAAogoAIBoAAKMKACAbAACkCgAgHAAApgoAIB4AAKcKACAfAACoCgAgIAAAqgoAICEAAKsKACAjAACxCgAgJAAArAoAICUAAK4KACAmAACvCgAgJwAAsAoAILQDAQAAAAG7A0AAAAAB3gNAAAAAAfUDAQAAAAH2AwEAAAAB9wMBAAAAAfgDAQAAAAH5AwEAAAAB-wMAAAD7AwL8AyAAAAAB_QMBAAAAAQIAAACZAwAgNQAAoAsAIAMAAACcAwAgNQAAoAsAIDYAAKQLACAdAAAAnAMAIAcAALcHACAQAAC_BwAgFgAAuwcAIBkAALQHACAaAAC1BwAgGwAAtgcAIBwAALgHACAeAAC5BwAgHwAAugcAICAAALwHACAhAAC9BwAgIwAAwwcAICQAAL4HACAlAADABwAgJgAAwQcAICcAAMIHACAuAACkCwAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_QMBAOEGACEbBwAAtwcAIBAAAL8HACAWAAC7BwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHAAAuAcAIB4AALkHACAfAAC6BwAgIAAAvAcAICEAAL0HACAjAADDBwAgJAAAvgcAICUAAMAHACAmAADBBwAgJwAAwgcAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhEAMAAPsJACAHAACfCQAgDwAAoAkAIBAAAKEJACC0AwEAAAABuwNAAAAAAd4DQAAAAAHfAwEAAAAB9QMBAAAAAY4EAQAAAAGPBAgAAAABkQQAAACRBAKSBAEAAAABkwQBAAAAAZQEAQAAAAGWBAAAAJYEAgIAAAAVACA1AAClCwAgAwAAABMAIDUAAKULACA2AACpCwAgEgAAABMAIAMAAPkJACAHAADoCAAgDwAA6QgAIBAAAOoIACAuAACpCwAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh3wMBAMQGACH1AwEAxAYAIY4EAQDEBgAhjwQIAOQIACGRBAAA5QiRBCKSBAEAxAYAIZMEAQDhBgAhlAQBAMQGACGWBAAA5giWBCIQAwAA-QkAIAcAAOgIACAPAADpCAAgEAAA6ggAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAId8DAQDEBgAh9QMBAMQGACGOBAEAxAYAIY8ECADkCAAhkQQAAOUIkQQikgQBAMQGACGTBAEA4QYAIZQEAQDEBgAhlgQAAOYIlgQiDgQAAJYIACAFAACDCQAgtAMBAAAAAbUDAQAAAAG7A0AAAAAB3gNAAAAAAd8DAQAAAAH-A0AAAAABhgQBAAAAAYcEEAAAAAGIBBAAAAABiQQgAAAAAYoEAgAAAAGLBAIAAAABAgAAACIAIDUAAKoLACADAAAAIAAgNQAAqgsAIDYAAK4LACAQAAAAIAAgBAAAhwgAIAUAAIEJACAuAACuCwAgtAMBAMQGACG1AwEAxAYAIbsDQADFBgAh3gNAAMUGACHfAwEAxAYAIf4DQADFBgAhhgQBAMQGACGHBBAAhQgAIYgEEACFCAAhiQQgANAGACGKBAIAxwYAIYsEAgDHBgAhDgQAAIcIACAFAACBCQAgtAMBAMQGACG1AwEAxAYAIbsDQADFBgAh3gNAAMUGACHfAwEAxAYAIf4DQADFBgAhhgQBAMQGACGHBBAAhQgAIYgEEACFCAAhiQQgANAGACGKBAIAxwYAIYsEAgDHBgAhGwcAAKUKACAQAACtCgAgFgAAqQoAIBgAAKEKACAaAACjCgAgGwAApAoAIBwAAKYKACAeAACnCgAgHwAAqAoAICAAAKoKACAhAACrCgAgIwAAsQoAICQAAKwKACAlAACuCgAgJgAArwoAICcAALAKACC0AwEAAAABuwNAAAAAAd4DQAAAAAH1AwEAAAAB9gMBAAAAAfcDAQAAAAH4AwEAAAAB-QMBAAAAAfsDAAAA-wMC_AMgAAAAAf0DAQAAAAECAAAAmQMAIDUAAK8LACADAAAAnAMAIDUAAK8LACA2AACzCwAgHQAAAJwDACAHAAC3BwAgEAAAvwcAIBYAALsHACAYAACzBwAgGgAAtQcAIBsAALYHACAcAAC4BwAgHgAAuQcAIB8AALoHACAgAAC8BwAgIQAAvQcAICMAAMMHACAkAAC-BwAgJQAAwAcAICYAAMEHACAnAADCBwAgLgAAswsAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhGwcAALcHACAQAAC_BwAgFgAAuwcAIBgAALMHACAaAAC1BwAgGwAAtgcAIBwAALgHACAeAAC5BwAgHwAAugcAICAAALwHACAhAAC9BwAgIwAAwwcAICQAAL4HACAlAADABwAgJgAAwQcAICcAAMIHACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEA4QYAIfYDAQDhBgAh9wMBAOEGACH4AwEA4QYAIfkDAQDhBgAh-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIQm0AwEAAAABtQMBAAAAAbsDQAAAAAHeA0AAAAAB_gNAAAAAAf8DAgAAAAGABAIAAAABgQQQAAAAAYIEIAAAAAEGtAMBAAAAAbsDQAAAAAHaAwEAAAAB5QNAAAAAAecDAQAAAAGdBEAAAAABGxAAAK0KACAWAACpCgAgGAAAoQoAIBkAAKIKACAaAACjCgAgGwAApAoAIBwAAKYKACAeAACnCgAgHwAAqAoAICAAAKoKACAhAACrCgAgIwAAsQoAICQAAKwKACAlAACuCgAgJgAArwoAICcAALAKACC0AwEAAAABuwNAAAAAAd4DQAAAAAH1AwEAAAAB9gMBAAAAAfcDAQAAAAH4AwEAAAAB-QMBAAAAAfsDAAAA-wMC_AMgAAAAAf0DAQAAAAECAAAAmQMAIDUAALYLACADAAAAnAMAIDUAALYLACA2AAC6CwAgHQAAAJwDACAQAAC_BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBsAALYHACAcAAC4BwAgHgAAuQcAIB8AALoHACAgAAC8BwAgIQAAvQcAICMAAMMHACAkAAC-BwAgJQAAwAcAICYAAMEHACAnAADCBwAgLgAAugsAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhGxAAAL8HACAWAAC7BwAgGAAAswcAIBkAALQHACAaAAC1BwAgGwAAtgcAIBwAALgHACAeAAC5BwAgHwAAugcAICAAALwHACAhAAC9BwAgIwAAwwcAICQAAL4HACAlAADABwAgJgAAwQcAICcAAMIHACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEA4QYAIfYDAQDhBgAh9wMBAOEGACH4AwEA4QYAIfkDAQDhBgAh-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIQm0AwEAAAABtQMBAAAAAfwDIAAAAAGKBAIAAAABiwQCAAAAAZ8EAAAAnwQCoARAAAAAAaEEQAAAAAGiBAgAAAABGwcAAKUKACAQAACtCgAgFgAAqQoAIBgAAKEKACAZAACiCgAgGgAAowoAIBsAAKQKACAeAACnCgAgHwAAqAoAICAAAKoKACAhAACrCgAgIwAAsQoAICQAAKwKACAlAACuCgAgJgAArwoAICcAALAKACC0AwEAAAABuwNAAAAAAd4DQAAAAAH1AwEAAAAB9gMBAAAAAfcDAQAAAAH4AwEAAAAB-QMBAAAAAfsDAAAA-wMC_AMgAAAAAf0DAQAAAAECAAAAmQMAIDUAALwLACADAAAAnAMAIDUAALwLACA2AADACwAgHQAAAJwDACAHAAC3BwAgEAAAvwcAIBYAALsHACAYAACzBwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHgAAuQcAIB8AALoHACAgAAC8BwAgIQAAvQcAICMAAMMHACAkAAC-BwAgJQAAwAcAICYAAMEHACAnAADCBwAgLgAAwAsAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhGwcAALcHACAQAAC_BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBsAALYHACAeAAC5BwAgHwAAugcAICAAALwHACAhAAC9BwAgIwAAwwcAICQAAL4HACAlAADABwAgJgAAwQcAICcAAMIHACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEA4QYAIfYDAQDhBgAh9wMBAOEGACH4AwEA4QYAIfkDAQDhBgAh-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIQu0AwEAAAABuwNAAAAAAd4DQAAAAAH1AwEAAAABjgQBAAAAAY8ECAAAAAGRBAAAAJEEApIEAQAAAAGTBAEAAAABlAQBAAAAAZYEAAAAlgQCCbQDAQAAAAG7A0AAAAAB3gNAAAAAAfUDAQAAAAGSBAEAAAABkwQBAAAAAaMEAgAAAAGkBAIAAAABpgQAAACmBAIPAwAA7goAIAQAAJ8KACAKAACdCgAgCwAAngoAIBcAAKAKACC0AwEAAAABuwNAAAAAAd4DQAAAAAH1AwEAAAABkgQBAAAAAZMEAQAAAAGUBAEAAAABowQCAAAAAaQEAgAAAAGmBAAAAKYEAgIAAAAFACA1AADDCwAgAwAAAAMAIDUAAMMLACA2AADHCwAgEQAAAAMAIAMAAO0KACAEAADqCQAgCgAA6AkAIAsAAOkJACAXAADrCQAgLgAAxwsAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDEBgAhkgQBAMQGACGTBAEAxAYAIZQEAQDEBgAhowQCAMcGACGkBAIAxwYAIaYEAADlCaYEIg8DAADtCgAgBAAA6gkAIAoAAOgJACALAADpCQAgFwAA6wkAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDEBgAhkgQBAMQGACGTBAEAxAYAIZQEAQDEBgAhowQCAMcGACGkBAIAxwYAIaYEAADlCaYEIgm0AwEAAAABuwNAAAAAAd4DQAAAAAHfAwEAAAAB_gNAAAAAAf8DAgAAAAGABAIAAAABgQQQAAAAAYIEIAAAAAEbBwAApQoAIBAAAK0KACAWAACpCgAgGAAAoQoAIBkAAKIKACAaAACjCgAgHAAApgoAIB4AAKcKACAfAACoCgAgIAAAqgoAICEAAKsKACAjAACxCgAgJAAArAoAICUAAK4KACAmAACvCgAgJwAAsAoAILQDAQAAAAG7A0AAAAAB3gNAAAAAAfUDAQAAAAH2AwEAAAAB9wMBAAAAAfgDAQAAAAH5AwEAAAAB-wMAAAD7AwL8AyAAAAAB_QMBAAAAAQIAAACZAwAgNQAAyQsAIAMAAACcAwAgNQAAyQsAIDYAAM0LACAdAAAAnAMAIAcAALcHACAQAAC_BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBwAALgHACAeAAC5BwAgHwAAugcAICAAALwHACAhAAC9BwAgIwAAwwcAICQAAL4HACAlAADABwAgJgAAwQcAICcAAMIHACAuAADNCwAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_QMBAOEGACEbBwAAtwcAIBAAAL8HACAWAAC7BwAgGAAAswcAIBkAALQHACAaAAC1BwAgHAAAuAcAIB4AALkHACAfAAC6BwAgIAAAvAcAICEAAL0HACAjAADDBwAgJAAAvgcAICUAAMAHACAmAADBBwAgJwAAwgcAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhBrQDAQAAAAG7A0AAAAAB2gMBAAAAAd8DAQAAAAHlA0AAAAABnQRAAAAAARsHAAClCgAgEAAArQoAIBYAAKkKACAYAAChCgAgGQAAogoAIBsAAKQKACAcAACmCgAgHgAApwoAIB8AAKgKACAgAACqCgAgIQAAqwoAICMAALEKACAkAACsCgAgJQAArgoAICYAAK8KACAnAACwCgAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAfYDAQAAAAH3AwEAAAAB-AMBAAAAAfkDAQAAAAH7AwAAAPsDAvwDIAAAAAH9AwEAAAABAgAAAJkDACA1AADPCwAgDwMAAO4KACAEAACfCgAgBgAAnAoAIAsAAJ4KACAXAACgCgAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAZIEAQAAAAGTBAEAAAABlAQBAAAAAaMEAgAAAAGkBAIAAAABpgQAAACmBAICAAAABQAgNQAA0QsAIAMAAACcAwAgNQAAzwsAIDYAANULACAdAAAAnAMAIAcAALcHACAQAAC_BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGwAAtgcAIBwAALgHACAeAAC5BwAgHwAAugcAICAAALwHACAhAAC9BwAgIwAAwwcAICQAAL4HACAlAADABwAgJgAAwQcAICcAAMIHACAuAADVCwAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_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-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIRsHAAC3BwAgEAAAvwcAIBYAALsHACAYAACzBwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHAAAuAcAIB4AALkHACAfAAC6BwAgIAAAvAcAICEAAL0HACAjAADDBwAgJAAAvgcAICUAAMAHACAnAADCBwAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_QMBAOEGACEFtAMBAAAAAbUDAQAAAAGHBAIAAAABqAQgAAAAAakEAgAAAAEJtAMBAAAAAbsDQAAAAAHHAwEAAAABjgQBAAAAAZIEAQAAAAGqBAEAAAABqwQCAAAAAa0EAAAArQQDrgQBAAAAARsHAAClCgAgFgAAqQoAIBgAAKEKACAZAACiCgAgGgAAowoAIBsAAKQKACAcAACmCgAgHgAApwoAIB8AAKgKACAgAACqCgAgIQAAqwoAICMAALEKACAkAACsCgAgJQAArgoAICYAAK8KACAnAACwCgAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAfYDAQAAAAH3AwEAAAAB-AMBAAAAAfkDAQAAAAH7AwAAAPsDAvwDIAAAAAH9AwEAAAABAgAAAJkDACA1AADpCwAgAwAAAJwDACA1AADpCwAgNgAA7QsAIB0AAACcAwAgBwAAtwcAIBYAALsHACAYAACzBwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHAAAuAcAIB4AALkHACAfAAC6BwAgIAAAvAcAICEAAL0HACAjAADDBwAgJAAAvgcAICUAAMAHACAmAADBBwAgJwAAwgcAIC4AAO0LACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEA4QYAIfYDAQDhBgAh9wMBAOEGACH4AwEA4QYAIfkDAQDhBgAh-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIRsHAAC3BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBsAALYHACAcAAC4BwAgHgAAuQcAIB8AALoHACAgAAC8BwAgIQAAvQcAICMAAMMHACAkAAC-BwAgJQAAwAcAICYAAMEHACAnAADCBwAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_QMBAOEGACELtAMBAAAAAbUDAQAAAAG7A0AAAAAB3gNAAAAAAd8DAQAAAAH-A0AAAAABhwQQAAAAAYgEEAAAAAGJBCAAAAABigQCAAAAAYsEAgAAAAECtAMBAAAAAY0EAAAAjQQCAwAAAAMAIDUAAOALACA2AADyCwAgEQAAAAMAIAMAAO0KACAGAADnCQAgCgAA6AkAIAsAAOkJACAXAADrCQAgLgAA8gsAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDEBgAhkgQBAMQGACGTBAEAxAYAIZQEAQDEBgAhowQCAMcGACGkBAIAxwYAIaYEAADlCaYEIg8DAADtCgAgBgAA5wkAIAoAAOgJACALAADpCQAgFwAA6wkAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDEBgAhkgQBAMQGACGTBAEAxAYAIZQEAQDEBgAhowQCAMcGACGkBAIAxwYAIaYEAADlCaYEIgu0AwEAAAABuwNAAAAAAd4DQAAAAAHfAwEAAAAB9QMBAAAAAY4EAQAAAAGPBAgAAAABkQQAAACRBAKSBAEAAAABkwQBAAAAAZYEAAAAlgQCBbQDAQAAAAG7A0AAAAAB3gNAAAAAAeYDAQAAAAHpAwAAAOkDAgW0AwEAAAABuwNAAAAAAd4DQAAAAAHnAwEAAAAB6QMAAADpAwIItAMBAAAAAbsDQAAAAAHIAwEAAAABygMAAADcAwLZAwEAAAAB3AMgAAAAAd0DQAAAAAHeA0AAAAABBy6AAAAAAbQDAQAAAAG7A0AAAAABxwMBAAAAAcgDAQAAAAHKAwAAAMoDAssDIAAAAAEFtAMBAAAAAbsDQAAAAAHjAwEAAAAB5ANAAAAAAeUDQAAAAAEJtAMBAAAAAbsDQAAAAAHlA0AAAAAB7wMBAAAAAfADAQAAAAHxAwEAAAAB8gMBAAAAAfMDQAAAAAH0A0AAAAABEAMAAPsJACAHAACfCQAgDwAAoAkAIBIAAKIJACC0AwEAAAABuwNAAAAAAd4DQAAAAAHfAwEAAAAB9QMBAAAAAY4EAQAAAAGPBAgAAAABkQQAAACRBAKSBAEAAAABkwQBAAAAAZQEAQAAAAGWBAAAAJYEAgIAAAAVACA1AAD6CwAgBLQDAQAAAAG7A0AAAAABhAQQAAAAAYUEAQAAAAEDAAAAEwAgNQAA-gsAIDYAAP8LACASAAAAEwAgAwAA-QkAIAcAAOgIACAPAADpCAAgEgAA6wgAIC4AAP8LACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACHfAwEAxAYAIfUDAQDEBgAhjgQBAMQGACGPBAgA5AgAIZEEAADlCJEEIpIEAQDEBgAhkwQBAOEGACGUBAEAxAYAIZYEAADmCJYEIhADAAD5CQAgBwAA6AgAIA8AAOkIACASAADrCAAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh3wMBAMQGACH1AwEAxAYAIY4EAQDEBgAhjwQIAOQIACGRBAAA5QiRBCKSBAEAxAYAIZMEAQDhBgAhlAQBAMQGACGWBAAA5giWBCILtAMBAAAAAbsDQAAAAAHeA0AAAAAB3wMBAAAAAf4DQAAAAAGGBAEAAAABhwQQAAAAAYgEEAAAAAGJBCAAAAABigQCAAAAAYsEAgAAAAELBAAA-goAILQDAQAAAAG7A0AAAAABxwMBAAAAAYYEAQAAAAGOBAEAAAABkgQBAAAAAaoEAQAAAAGrBAIAAAABrQQAAACtBAOuBAEAAAABAgAAABkAIDUAAIEMACADAAAAFwAgNQAAgQwAIDYAAIUMACANAAAAFwAgBAAA-QoAIC4AAIUMACC0AwEAxAYAIbsDQADFBgAhxwMBAMQGACGGBAEAxAYAIY4EAQDhBgAhkgQBAMQGACGqBAEA4QYAIasEAgDHBgAhrQQAAI4JrQQjrgQBAOEGACELBAAA-QoAILQDAQDEBgAhuwNAAMUGACHHAwEAxAYAIYYEAQDEBgAhjgQBAOEGACGSBAEAxAYAIaoEAQDhBgAhqwQCAMcGACGtBAAAjgmtBCOuBAEA4QYAIQW0AwEAAAABhwQCAAAAAacEAQAAAAGoBCAAAAABqQQCAAAAAQa0AwEAAAABuwNAAAAAAcgDAQAAAAGfBAAAALEEArEEgAAAAAGyBAEAAAABA7QDAQAAAAG7A0AAAAAB3gNAAAAAAQe0AwEAAAABtgMBAAAAAbcDAQAAAAG4A0AAAAABuQNAAAAAAboDAgAAAAG7A0AAAAABGwcAAKUKACAQAACtCgAgFgAAqQoAIBgAAKEKACAZAACiCgAgGgAAowoAIBsAAKQKACAcAACmCgAgHgAApwoAIB8AAKgKACAgAACqCgAgIQAAqwoAICMAALEKACAlAACuCgAgJgAArwoAICcAALAKACC0AwEAAAABuwNAAAAAAd4DQAAAAAH1AwEAAAAB9gMBAAAAAfcDAQAAAAH4AwEAAAAB-QMBAAAAAfsDAAAA-wMC_AMgAAAAAf0DAQAAAAECAAAAmQMAIDUAAIoMACAHtAMBAAAAAbUDAQAAAAG3AwEAAAABuANAAAAAAbkDQAAAAAG6AwIAAAABuwNAAAAAAQMAAACcAwAgNQAAigwAIDYAAI8MACAdAAAAnAMAIAcAALcHACAQAAC_BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBsAALYHACAcAAC4BwAgHgAAuQcAIB8AALoHACAgAAC8BwAgIQAAvQcAICMAAMMHACAlAADABwAgJgAAwQcAICcAAMIHACAuAACPDAAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_QMBAOEGACEbBwAAtwcAIBAAAL8HACAWAAC7BwAgGAAAswcAIBkAALQHACAaAAC1BwAgGwAAtgcAIBwAALgHACAeAAC5BwAgHwAAugcAICAAALwHACAhAAC9BwAgIwAAwwcAICUAAMAHACAmAADBBwAgJwAAwgcAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhGwcAAKUKACAQAACtCgAgFgAAqQoAIBgAAKEKACAZAACiCgAgGgAAowoAIBsAAKQKACAcAACmCgAgHgAApwoAIB8AAKgKACAgAACqCgAgIQAAqwoAICMAALEKACAkAACsCgAgJgAArwoAICcAALAKACC0AwEAAAABuwNAAAAAAd4DQAAAAAH1AwEAAAAB9gMBAAAAAfcDAQAAAAH4AwEAAAAB-QMBAAAAAfsDAAAA-wMC_AMgAAAAAf0DAQAAAAECAAAAmQMAIDUAAJAMACADAAAAnAMAIDUAAJAMACA2AACUDAAgHQAAAJwDACAHAAC3BwAgEAAAvwcAIBYAALsHACAYAACzBwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHAAAuAcAIB4AALkHACAfAAC6BwAgIAAAvAcAICEAAL0HACAjAADDBwAgJAAAvgcAICYAAMEHACAnAADCBwAgLgAAlAwAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhGwcAALcHACAQAAC_BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBsAALYHACAcAAC4BwAgHgAAuQcAIB8AALoHACAgAAC8BwAgIQAAvQcAICMAAMMHACAkAAC-BwAgJgAAwQcAICcAAMIHACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEA4QYAIfYDAQDhBgAh9wMBAOEGACH4AwEA4QYAIfkDAQDhBgAh-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIRsHAAClCgAgEAAArQoAIBYAAKkKACAYAAChCgAgGQAAogoAIBoAAKMKACAbAACkCgAgHAAApgoAIB4AAKcKACAgAACqCgAgIQAAqwoAICMAALEKACAkAACsCgAgJQAArgoAICYAAK8KACAnAACwCgAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAfYDAQAAAAH3AwEAAAAB-AMBAAAAAfkDAQAAAAH7AwAAAPsDAvwDIAAAAAH9AwEAAAABAgAAAJkDACA1AACVDAAgGwcAAKUKACAQAACtCgAgFgAAqQoAIBgAAKEKACAZAACiCgAgGgAAowoAIBsAAKQKACAcAACmCgAgHwAAqAoAICAAAKoKACAhAACrCgAgIwAAsQoAICQAAKwKACAlAACuCgAgJgAArwoAICcAALAKACC0AwEAAAABuwNAAAAAAd4DQAAAAAH1AwEAAAAB9gMBAAAAAfcDAQAAAAH4AwEAAAAB-QMBAAAAAfsDAAAA-wMC_AMgAAAAAf0DAQAAAAECAAAAmQMAIDUAAJcMACADAAAAnAMAIDUAAJUMACA2AACbDAAgHQAAAJwDACAHAAC3BwAgEAAAvwcAIBYAALsHACAYAACzBwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHAAAuAcAIB4AALkHACAgAAC8BwAgIQAAvQcAICMAAMMHACAkAAC-BwAgJQAAwAcAICYAAMEHACAnAADCBwAgLgAAmwwAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhGwcAALcHACAQAAC_BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBsAALYHACAcAAC4BwAgHgAAuQcAICAAALwHACAhAAC9BwAgIwAAwwcAICQAAL4HACAlAADABwAgJgAAwQcAICcAAMIHACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEA4QYAIfYDAQDhBgAh9wMBAOEGACH4AwEA4QYAIfkDAQDhBgAh-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIQMAAACcAwAgNQAAlwwAIDYAAJ4MACAdAAAAnAMAIAcAALcHACAQAAC_BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBsAALYHACAcAAC4BwAgHwAAugcAICAAALwHACAhAAC9BwAgIwAAwwcAICQAAL4HACAlAADABwAgJgAAwQcAICcAAMIHACAuAACeDAAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_QMBAOEGACEbBwAAtwcAIBAAAL8HACAWAAC7BwAgGAAAswcAIBkAALQHACAaAAC1BwAgGwAAtgcAIBwAALgHACAfAAC6BwAgIAAAvAcAICEAAL0HACAjAADDBwAgJAAAvgcAICUAAMAHACAmAADBBwAgJwAAwgcAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhGwcAAKUKACAQAACtCgAgFgAAqQoAIBgAAKEKACAZAACiCgAgGgAAowoAIBsAAKQKACAcAACmCgAgHgAApwoAIB8AAKgKACAgAACqCgAgIwAAsQoAICQAAKwKACAlAACuCgAgJgAArwoAICcAALAKACC0AwEAAAABuwNAAAAAAd4DQAAAAAH1AwEAAAAB9gMBAAAAAfcDAQAAAAH4AwEAAAAB-QMBAAAAAfsDAAAA-wMC_AMgAAAAAf0DAQAAAAECAAAAmQMAIDUAAJ8MACADAAAAnAMAIDUAAJ8MACA2AACjDAAgHQAAAJwDACAHAAC3BwAgEAAAvwcAIBYAALsHACAYAACzBwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHAAAuAcAIB4AALkHACAfAAC6BwAgIAAAvAcAICMAAMMHACAkAAC-BwAgJQAAwAcAICYAAMEHACAnAADCBwAgLgAAowwAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDhBgAh9gMBAOEGACH3AwEA4QYAIfgDAQDhBgAh-QMBAOEGACH7AwAAsgf7AyL8AyAA0AYAIf0DAQDhBgAhGwcAALcHACAQAAC_BwAgFgAAuwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBsAALYHACAcAAC4BwAgHgAAuQcAIB8AALoHACAgAAC8BwAgIwAAwwcAICQAAL4HACAlAADABwAgJgAAwQcAICcAAMIHACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEA4QYAIfYDAQDhBgAh9wMBAOEGACH4AwEA4QYAIfkDAQDhBgAh-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIQ8DAADuCgAgBAAAnwoAIAYAAJwKACAKAACdCgAgCwAAngoAILQDAQAAAAG7A0AAAAAB3gNAAAAAAfUDAQAAAAGSBAEAAAABkwQBAAAAAZQEAQAAAAGjBAIAAAABpAQCAAAAAaYEAAAApgQCAgAAAAUAIDUAAKQMACAItAMBAAAAAbsDQAAAAAHIAwEAAAABygMAAADcAwLaAwEAAAAB3AMgAAAAAd0DQAAAAAHeA0AAAAABAwAAAAMAIDUAAKQMACA2AACpDAAgEQAAAAMAIAMAAO0KACAEAADqCQAgBgAA5wkAIAoAAOgJACALAADpCQAgLgAAqQwAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDEBgAhkgQBAMQGACGTBAEAxAYAIZQEAQDEBgAhowQCAMcGACGkBAIAxwYAIaYEAADlCaYEIg8DAADtCgAgBAAA6gkAIAYAAOcJACAKAADoCQAgCwAA6QkAILQDAQDEBgAhuwNAAMUGACHeA0AAxQYAIfUDAQDEBgAhkgQBAMQGACGTBAEAxAYAIZQEAQDEBgAhowQCAMcGACGkBAIAxwYAIaYEAADlCaYEIhsHAAClCgAgEAAArQoAIBgAAKEKACAZAACiCgAgGgAAowoAIBsAAKQKACAcAACmCgAgHgAApwoAIB8AAKgKACAgAACqCgAgIQAAqwoAICMAALEKACAkAACsCgAgJQAArgoAICYAAK8KACAnAACwCgAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAfYDAQAAAAH3AwEAAAAB-AMBAAAAAfkDAQAAAAH7AwAAAPsDAvwDIAAAAAH9AwEAAAABAgAAAJkDACA1AACqDAAgBAcAAIUHACC0AwEAAAABuwNAAAAAAd8DAQAAAAECAAAAjAQAIDUAAKwMACAGtAMBAAAAAbsDQAAAAAHVAwEAAAAB1gMBAAAAAdcDAQAAAAHYAwIAAAABAwAAAJwDACA1AACqDAAgNgAAsQwAIB0AAACcAwAgBwAAtwcAIBAAAL8HACAYAACzBwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHAAAuAcAIB4AALkHACAfAAC6BwAgIAAAvAcAICEAAL0HACAjAADDBwAgJAAAvgcAICUAAMAHACAmAADBBwAgJwAAwgcAIC4AALEMACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEA4QYAIfYDAQDhBgAh9wMBAOEGACH4AwEA4QYAIfkDAQDhBgAh-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIRsHAAC3BwAgEAAAvwcAIBgAALMHACAZAAC0BwAgGgAAtQcAIBsAALYHACAcAAC4BwAgHgAAuQcAIB8AALoHACAgAAC8BwAgIQAAvQcAICMAAMMHACAkAAC-BwAgJQAAwAcAICYAAMEHACAnAADCBwAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_QMBAOEGACEDAAAAMAAgNQAArAwAIDYAALQMACAGAAAAMAAgBwAA9wYAIC4AALQMACC0AwEAxAYAIbsDQADFBgAh3wMBAMQGACEEBwAA9wYAILQDAQDEBgAhuwNAAMUGACHfAwEAxAYAIQsJAADzBgAgFQAA8gYAILQDAQAAAAG7A0AAAAAByAMBAAAAAcoDAAAA3AMC2QMBAAAAAdoDAQAAAAHcAyAAAAAB3QNAAAAAAd4DQAAAAAECAAAANAAgNQAAtQwAIAMAAAAyACA1AAC1DAAgNgAAuQwAIA0AAAAyACAJAADkBgAgFQAA4wYAIC4AALkMACC0AwEAxAYAIbsDQADFBgAhyAMBAOEGACHKAwAA4AbcAyLZAwEAxAYAIdoDAQDEBgAh3AMgANAGACHdA0AAxgYAId4DQADFBgAhCwkAAOQGACAVAADjBgAgtAMBAMQGACG7A0AAxQYAIcgDAQDhBgAhygMAAOAG3AMi2QMBAMQGACHaAwEAxAYAIdwDIADQBgAh3QNAAMYGACHeA0AAxQYAIRsHAAClCgAgEAAArQoAIBYAAKkKACAYAAChCgAgGQAAogoAIBoAAKMKACAbAACkCgAgHAAApgoAIB4AAKcKACAfAACoCgAgIQAAqwoAICMAALEKACAkAACsCgAgJQAArgoAICYAAK8KACAnAACwCgAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAfYDAQAAAAH3AwEAAAAB-AMBAAAAAfkDAQAAAAH7AwAAAPsDAvwDIAAAAAH9AwEAAAABAgAAAJkDACA1AAC6DAAgAwAAAJwDACA1AAC6DAAgNgAAvgwAIB0AAACcAwAgBwAAtwcAIBAAAL8HACAWAAC7BwAgGAAAswcAIBkAALQHACAaAAC1BwAgGwAAtgcAIBwAALgHACAeAAC5BwAgHwAAugcAICEAAL0HACAjAADDBwAgJAAAvgcAICUAAMAHACAmAADBBwAgJwAAwgcAIC4AAL4MACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEA4QYAIfYDAQDhBgAh9wMBAOEGACH4AwEA4QYAIfkDAQDhBgAh-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIRsHAAC3BwAgEAAAvwcAIBYAALsHACAYAACzBwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHAAAuAcAIB4AALkHACAfAAC6BwAgIQAAvQcAICMAAMMHACAkAAC-BwAgJQAAwAcAICYAAMEHACAnAADCBwAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_QMBAOEGACELBQAArQcAILQDAQAAAAG1AwEAAAABuwNAAAAAAeUDQAAAAAHvAwEAAAAB8AMBAAAAAfEDAQAAAAHyAwEAAAAB8wNAAAAAAfQDQAAAAAECAAAAVQAgNQAAvwwAIBsHAAClCgAgEAAArQoAIBYAAKkKACAYAAChCgAgGQAAogoAIBoAAKMKACAbAACkCgAgHAAApgoAIB4AAKcKACAfAACoCgAgIAAAqgoAICEAAKsKACAkAACsCgAgJQAArgoAICYAAK8KACAnAACwCgAgtAMBAAAAAbsDQAAAAAHeA0AAAAAB9QMBAAAAAfYDAQAAAAH3AwEAAAAB-AMBAAAAAfkDAQAAAAH7AwAAAPsDAvwDIAAAAAH9AwEAAAABAgAAAJkDACA1AADBDAAgAwAAAFMAIDUAAL8MACA2AADFDAAgDQAAAFMAIAUAAJ8HACAuAADFDAAgtAMBAMQGACG1AwEAxAYAIbsDQADFBgAh5QNAAMUGACHvAwEAxAYAIfADAQDhBgAh8QMBAOEGACHyAwEA4QYAIfMDQADGBgAh9ANAAMUGACELBQAAnwcAILQDAQDEBgAhtQMBAMQGACG7A0AAxQYAIeUDQADFBgAh7wMBAMQGACHwAwEA4QYAIfEDAQDhBgAh8gMBAOEGACHzA0AAxgYAIfQDQADFBgAhAwAAAJwDACA1AADBDAAgNgAAyAwAIB0AAACcAwAgBwAAtwcAIBAAAL8HACAWAAC7BwAgGAAAswcAIBkAALQHACAaAAC1BwAgGwAAtgcAIBwAALgHACAeAAC5BwAgHwAAugcAICAAALwHACAhAAC9BwAgJAAAvgcAICUAAMAHACAmAADBBwAgJwAAwgcAIC4AAMgMACC0AwEAxAYAIbsDQADFBgAh3gNAAMUGACH1AwEA4QYAIfYDAQDhBgAh9wMBAOEGACH4AwEA4QYAIfkDAQDhBgAh-wMAALIH-wMi_AMgANAGACH9AwEA4QYAIRsHAAC3BwAgEAAAvwcAIBYAALsHACAYAACzBwAgGQAAtAcAIBoAALUHACAbAAC2BwAgHAAAuAcAIB4AALkHACAfAAC6BwAgIAAAvAcAICEAAL0HACAkAAC-BwAgJQAAwAcAICYAAMEHACAnAADCBwAgtAMBAMQGACG7A0AAxQYAId4DQADFBgAh9QMBAOEGACH2AwEA4QYAIfcDAQDhBgAh-AMBAOEGACH5AwEA4QYAIfsDAACyB_sDIvwDIADQBgAh_QMBAOEGACEDBQACDgAfFnceEgdDBg4AHRBcCxZKERgGAxlABBpBBRtCBRxEBx5IFh9JFiBOFyFSGCNjGiRWGSVeHCZfCSdiAQcDAAIEFgcGCgQKDgULEgYOABUXMRACBAADBQACAwcAAwgAAgkAAgIFAAIHAAMGAwACBwADDgAPDxoIECMLEiwOAwQABw0eCQ4ACgIFAAIMAAgBDR8ABAQABwUAAg4ADREnDAEQAAsBESgAAQQABwMPLQAQLgASLwADBwADDgAUFjURBAkAAg4AExQ5EhUAEAETABEBFDoAARY7AAQEPwAGPAAKPQALPgACCAACHQACAQUAAgEFAAIDBQACDgAbI1oaAgUAAiIAGQEjWwABBQACEAdoABBwABZsABhkABllABpmABtnABxpAB5qAB9rACBtACFuACNzACRvACZxACdyAAEoAAEBFngAAAEFAAIBBQACAw4AJDsAJTwAJgAAAAMOACQ7ACU8ACYBKAABASgAAQMOACs7ACw8AC0AAAADDgArOwAsPAAtAQQABwEEAAcFDgAyOwA1PAA2XQAzXgA0AAAAAAAFDgAyOwA1PAA2XQAzXgA0AgUAAgwACAIFAAIMAAgFDgA7OwA-PAA_XQA8XgA9AAAAAAAFDgA7OwA-PAA_XQA8XgA9AQMAAgEDAAIFDgBEOwBHPABIXQBFXgBGAAAAAAAFDgBEOwBHPABIXQBFXgBGAgUAAgcAAwIFAAIHAAMFDgBNOwBQPABRXQBOXgBPAAAAAAAFDgBNOwBQPABRXQBOXgBPAwcAAwgAAgkAAgMHAAMIAAIJAAIDDgBWOwBXPABYAAAAAw4AVjsAVzwAWAAAAAMOAF47AF88AGAAAAADDgBeOwBfPABgAgMAAgcAAwIDAAIHAAMFDgBlOwBoPABpXQBmXgBnAAAAAAAFDgBlOwBoPABpXQBmXgBnAQQABwEEAAcDDgBuOwBvPABwAAAAAw4AbjsAbzwAcAIEAAcFAAICBAAHBQACBQ4AdTsAeDwAeV0Adl4AdwAAAAAABQ4AdTsAeDwAeV0Adl4AdwEQAAsBEAALBQ4AfjsAgQE8AIIBXQB_XgCAAQAAAAAABQ4AfjsAgQE8AIIBXQB_XgCAAQIEAAMFAAICBAADBQACBQ4AhwE7AIoBPACLAV0AiAFeAIkBAAAAAAAFDgCHATsAigE8AIsBXQCIAV4AiQEAAAMOAJABOwCRATwAkgEAAAADDgCQATsAkQE8AJIBAQUAAgEFAAIDDgCXATsAmAE8AJkBAAAAAw4AlwE7AJgBPACZAQEFAAIBBQACAw4AngE7AJ8BPACgAQAAAAMOAJ4BOwCfATwAoAECCAACHQACAggAAh0AAgMOAKUBOwCmATwApwEAAAADDgClATsApgE8AKcBAQUAAgEFAAIDDgCsATsArQE8AK4BAAAAAw4ArAE7AK0BPACuAQEHAAMBBwADAw4AswE7ALQBPAC1AQAAAAMOALMBOwC0ATwAtQECCQACFQAQAgkAAhUAEAMOALoBOwC7ATwAvAEAAAADDgC6ATsAuwE8ALwBARMAEQETABEFDgDBATsAxAE8AMUBXQDCAV4AwwEAAAAAAAUOAMEBOwDEATwAxQFdAMIBXgDDAQAAAAMOAMsBOwDMATwAzQEAAAADDgDLATsAzAE8AM0BAQUAAgEFAAIDDgDSATsA0wE8ANQBAAAAAw4A0gE7ANMBPADUAQIFAAIiABkCBQACIgAZBQ4A2QE7ANwBPADdAV0A2gFeANsBAAAAAAAFDgDZATsA3AE8AN0BXQDaAV4A2wEpAgEqeQEregEsewEtfAEvfgEwgAEgMYEBITKDAQEzhQEgNIYBIjeHAQE4iAEBOYkBID2MASM-jQEnP44BHkCPAR5BkAEeQpEBHkOSAR5ElAEeRZYBIEaXAShHmQEeSJsBIEmcASlKnQEeS54BHkyfASBNogEqTqMBLk-kAQhQpQEIUaYBCFKnAQhTqAEIVKoBCFWsASBWrQEvV68BCFixASBZsgEwWrMBCFu0AQhctQEgX7gBMWC5ATdhugEJYrsBCWO8AQlkvQEJZb4BCWbAAQlnwgEgaMMBOGnFAQlqxwEga8gBOWzJAQltygEJbssBIG_OATpwzwFAcdABA3LRAQNz0gEDdNMBA3XUAQN21gEDd9gBIHjZAUF52wEDet0BIHveAUJ83wEDfeABA37hASB_5AFDgAHlAUmBAeYBBoIB5wEGgwHoAQaEAekBBoUB6gEGhgHsAQaHAe4BIIgB7wFKiQHxAQaKAfMBIIsB9AFLjAH1AQaNAfYBBo4B9wEgjwH6AUyQAfsBUpEB_AEFkgH9AQWTAf4BBZQB_wEFlQGAAgWWAYICBZcBhAIgmAGFAlOZAYcCBZoBiQIgmwGKAlScAYsCBZ0BjAIFngGNAiCfAZACVaABkQJZoQGTAlqiAZQCWqMBlwJapAGYAlqlAZkCWqYBmwJapwGdAiCoAZ4CW6kBoAJaqgGiAiCrAaMCXKwBpAJarQGlAlquAaYCIK8BqQJdsAGqAmGxAasCB7IBrAIHswGtAge0Aa4CB7UBrwIHtgGxAge3AbMCILgBtAJiuQG2Age6AbgCILsBuQJjvAG6Age9AbsCB74BvAIgvwG_AmTAAcACasEBwQIOwgHCAg7DAcMCDsQBxAIOxQHFAg7GAccCDscByQIgyAHKAmvJAcwCDsoBzgIgywHPAmzMAdACDs0B0QIOzgHSAiDPAdUCbdAB1gJx0QHXAgvSAdgCC9MB2QIL1AHaAgvVAdsCC9YB3QIL1wHfAiDYAeACctkB4gIL2gHkAiDbAeUCc9wB5gIL3QHnAgveAegCIN8B6wJ04AHsAnrhAe0CDOIB7gIM4wHvAgzkAfACDOUB8QIM5gHzAgznAfUCIOgB9gJ76QH4AgzqAfoCIOsB-wJ87AH8AgztAf0CDO4B_gIg7wGBA33wAYIDgwHxAYMDBPIBhAME8wGFAwT0AYYDBPUBhwME9gGJAwT3AYsDIPgBjAOEAfkBjgME-gGQAyD7AZEDhQH8AZIDBP0BkwME_gGUAyD_AZcDhgGAApgDjAGBApoDAoICmwMCgwKeAwKEAp8DAoUCoAMChgKiAwKHAqQDIIgCpQONAYkCpwMCigKpAyCLAqoDjgGMAqsDAo0CrAMCjgKtAyCPArADjwGQArEDkwGRArIDGZICswMZkwK0AxmUArUDGZUCtgMZlgK4AxmXAroDIJgCuwOUAZkCvQMZmgK_AyCbAsADlQGcAsEDGZ0CwgMZngLDAyCfAsYDlgGgAscDmgGhAskDHKICygMcowLMAxykAs0DHKUCzgMcpgLQAxynAtIDIKgC0wObAakC1QMcqgLXAyCrAtgDnAGsAtkDHK0C2gMcrgLbAyCvAt4DnQGwAt8DoQGxAuADFrIC4QMWswLiAxa0AuMDFrUC5AMWtgLmAxa3AugDILgC6QOiAbkC6wMWugLtAyC7Au4DowG8Au8DFr0C8AMWvgLxAyC_AvQDpAHAAvUDqAHBAvYDGMIC9wMYwwL4AxjEAvkDGMUC-gMYxgL8AxjHAv4DIMgC_wOpAckCgQQYygKDBCDLAoQEqgHMAoUEGM0ChgQYzgKHBCDPAooEqwHQAosErwHRAo0EENICjgQQ0wKQBBDUApEEENUCkgQQ1gKUBBDXApYEINgClwSwAdkCmQQQ2gKbBCDbApwEsQHcAp0EEN0CngQQ3gKfBCDfAqIEsgHgAqMEtgHhAqQEEeICpQQR4wKmBBHkAqcEEeUCqAQR5gKqBBHnAqwEIOgCrQS3AekCrwQR6gKxBCDrArIEuAHsArMEEe0CtAQR7gK1BCDvArgEuQHwArkEvQHxAroEEvICuwQS8wK8BBL0Ar0EEvUCvgQS9gLABBL3AsIEIPgCwwS-AfkCxQQS-gLHBCD7AsgEvwH8AskEEv0CygQS_gLLBCD_As4EwAGAA88ExgGBA9EExwGCA9IExwGDA9UExwGEA9YExwGFA9cExwGGA9kExwGHA9sEIIgD3ATIAYkD3gTHAYoD4AQgiwPhBMkBjAPiBMcBjQPjBMcBjgPkBCCPA-cEygGQA-gEzgGRA-kEF5ID6gQXkwPrBBeUA-wEF5UD7QQXlgPvBBeXA_EEIJgD8gTPAZkD9AQXmgP2BCCbA_cE0AGcA_gEF50D-QQXngP6BCCfA_0E0QGgA_4E1QGhA_8EGqIDgAUaowOBBRqkA4IFGqUDgwUapgOFBRqnA4cFIKgDiAXWAakDigUaqgOMBSCrA40F1wGsA44FGq0DjwUargOQBSCvA5MF2AGwA5QF3gE"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// prisma/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// prisma/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/app/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString });
var prisma = new PrismaClient({ adapter });

// src/app/modules/auth/auth.services.ts
import bcrypt from "bcrypt";

// src/app/utils/session.ts
import crypto from "crypto";
var SESSION_TTL_MS = 1e3 * 60 * 60 * 24 * 7;
var hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
var generateSessionToken = () => {
  return crypto.randomBytes(32).toString("hex");
};
var createSession = async (userId) => {
  const token = crypto.randomBytes(40).toString("hex");
  const hashedToken = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const session = await prisma.session.create({
    data: {
      refreshTokenHash: hashedToken,
      expiresAt,
      userId
    }
  });
  return token;
};
var validateSession = async (token) => {
  const tokenHash = hashToken(token);
  const session = await prisma.session.findFirst({
    where: { refreshTokenHash: tokenHash, expiresAt: { gt: /* @__PURE__ */ new Date() } },
    include: { user: true }
  });
  if (!session) {
    return null;
  }
  const newToken = generateSessionToken();
  const newTokenHash = hashToken(newToken);
  const newExpiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const newSession = await prisma.session.update({ where: { id: session.id }, data: { refreshTokenHash: newTokenHash, expiresAt: newExpiresAt }, include: { user: true } });
  return { session: newSession, newToken };
};
var getSessionByToken = async (token) => {
  console.log("========== GET SESSION BY TOKEN ==========");
  console.log("RAW TOKEN:", token);
  const tokenHash = hashToken(token);
  const session = await prisma.session.findFirst({
    where: {
      refreshTokenHash: tokenHash,
      expiresAt: {
        gt: /* @__PURE__ */ new Date()
      }
    },
    include: {
      user: true
    }
  });
  console.log("SESSION FOUND:", session);
  return session;
};
var revokeSession = async (token) => {
  const hashedToken = hashToken(token);
  await prisma.session.deleteMany({ where: { refreshTokenHash: hashedToken } });
};
var revokeAllSessions = async (userId) => {
  await prisma.session.deleteMany({ where: { userId } });
};
var sessionUtils = { createSession, validateSession, revokeSession, revokeAllSessions, getSessionByToken };

// src/app/modules/auth/auth.services.ts
import status from "http-status";

// src/app/config/google.ts
import { OAuth2Client } from "google-auth-library";
var googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// src/app/modules/auth/auth.services.ts
var register = async (payload) => {
  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email: payload.email }, { username: payload.email }] } });
  if (existingUser) {
    throw new AppError_default(400, "User already exists");
  }
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      ...payload,
      password: hashedPassword
    }
  });
  const { password, ...userWithoutPassword } = user;
  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.globalRole,
    email: user.email
  });
  const sessionToken = await sessionUtils.createSession(user.id);
  return { user: userWithoutPassword, accessToken, sessionToken };
};
var login = async (payload) => {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: payload.email }, { username: payload.email }] }
  });
  if (!user) {
    throw new AppError_default(400, "User does not exist");
  }
  const isPasswordCorrect = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordCorrect) {
    throw new AppError_default(400, "Incorrect password");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.globalRole,
    email: user.email
  });
  const sessionToken = await sessionUtils.createSession(user.id);
  const { password, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, accessToken, sessionToken };
};
var refreshAccessToken = async (sessionToken) => {
  if (!sessionToken) {
    throw new AppError_default(400, "No session found, Please login again");
  }
  const result = await sessionUtils.validateSession(sessionToken);
  if (!result) {
    throw new AppError_default(400, "No session found, Please login again");
  }
  const { session, newToken } = result;
  const { user } = session;
  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.globalRole,
    email: user.email
  });
  return { accessToken, newToken };
};
var logOut = async (sessionToken) => {
  await sessionUtils.revokeSession(sessionToken);
};
var logOutAllDevices = async (userId) => {
  await sessionUtils.revokeAllSessions(userId);
};
var getMe = async (userId, activityId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError_default(status.NOT_FOUND, "User not found.");
  }
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
var googleLogin = async (code) => {
  const { tokens } = await googleClient.getToken(code);
  if (!tokens.id_token) {
    throw new AppError_default(400, "Google authentication failed");
  }
  const ticket = await googleClient.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  if (!payload) {
    throw new AppError_default(400, "Invalid Google account");
  }
  const { sub: googleId, email, name, picture, email_verified } = payload;
  if (!email || !email_verified || !googleId) {
    throw new AppError_default(400, "Unable to verify Google account");
  }
  let user = await prisma.user.findUnique({
    where: {
      googleId
    }
  });
  if (!user) {
    user = await prisma.user.findUnique({
      where: {
        email
      }
    });
    if (user) {
      user = await prisma.user.update({
        where: {
          id: user.id
        },
        data: {
          googleId,
          avatar: user.avatar ?? picture ?? null
        }
      });
    } else {
      let username = email.split("@")[0];
      const existingUsername = await prisma.user.findUnique({
        where: {
          username
        }
      });
      if (existingUsername) {
        username = `${username}_${Date.now()}`;
      }
      user = await prisma.user.create({
        data: {
          name: name ?? username,
          username,
          email,
          googleId,
          avatar: picture ?? null,
          password: null
        }
      });
    }
  }
  if (!user.isActive) {
    throw new AppError_default(403, "Your account is inactive");
  }
  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.globalRole,
    email: user.email
  });
  const sessionToken = await sessionUtils.createSession(user.id);
  const { password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    accessToken,
    sessionToken
  };
};
var changePassword = async (payload, userId) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AppError_default(400, "User does not exist");
  }
  const isPasswordCorrect = await bcrypt.compare(payload.oldPassword, user.password);
  if (!isPasswordCorrect) {
    throw new AppError_default(400, "Incorrect password");
  }
  const hashedPassword = await bcrypt.hash(payload.newPassword, 10);
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
  await sessionUtils.revokeAllSessions(userId);
};
var AuthServices = { googleLogin, register, login, refreshAccessToken, logOut, logOutAllDevices, getMe, changePassword };

// src/app/modules/auth/auth.controller.ts
var register2 = async (req, res, next) => {
  try {
    const { user, accessToken, sessionToken } = await AuthServices.register(
      req.body
    );
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setSessionTokenCookie(res, sessionToken);
    res.status(status2.CREATED).json({
      success: true,
      message: "User registered successfully.",
      data: user,
      token: accessToken,
      sessionToken
    });
  } catch (err) {
    next(err);
  }
};
var login2 = async (req, res, next) => {
  try {
    const { user, accessToken, sessionToken } = await AuthServices.login(
      req.body
    );
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setSessionTokenCookie(res, sessionToken);
    res.status(status2.OK).json({
      success: true,
      message: "Logged in very successfully.",
      data: user,
      token: accessToken,
      sessionToken
    });
  } catch (err) {
    next(err);
  }
};
var verifyToken2 = async (req, res) => {
  const accessToken = CookieUtils.getCookie(req, "accessToken");
  const verifiedToken = jwtUtils.verifyToken(accessToken, process.env.ACCESS_SECRET);
  if (!verifiedToken.success) {
    return res.status(status2.UNAUTHORIZED).json({ success: false, message: "You are not logged in" });
  }
  return res.status(status2.OK).json({ success: true, data: verifiedToken.data });
};
var refresh = async (req, res, next) => {
  try {
    console.log("REEEEEEFFFFFFREEEEESSSHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHHH");
    const sessionToken = CookieUtils.getCookie(req, "sessionToken");
    const { accessToken, newToken } = await AuthServices.refreshAccessToken(sessionToken);
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setSessionTokenCookie(res, newToken);
    res.status(status2.OK).json({
      success: true,
      message: "Access token refreshed."
    });
  } catch (err) {
    next(err);
  }
};
var logout = async (req, res, next) => {
  try {
    const sessionToken = CookieUtils.getCookie(req, "sessionToken");
    await AuthServices.logOut(sessionToken);
    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });
    CookieUtils.clearCookie(res, "sessionToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });
    res.status(status2.OK).json({
      success: true,
      message: "Logged out successfully."
    });
  } catch (err) {
    next(err);
  }
};
var logoutAllDevices = async (req, res, next) => {
  try {
    await AuthServices.logOutAllDevices(req.user.userId);
    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });
    CookieUtils.clearCookie(res, "sessionToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });
    res.status(status2.OK).json({
      success: true,
      message: "Logged out from all devices."
    });
  } catch (err) {
    next(err);
  }
};
var getMe2 = async (req, res, next) => {
  try {
    console.log("I am in getMe");
    const { id } = req.query;
    if (!req.user?.userId) {
      return res.status(200).json({ success: true, data: null });
    }
    let activityId;
    if (id) {
      const activityId2 = id;
    }
    const user = await AuthServices.getMe(req.user.userId, activityId);
    res.status(status2.OK).json({
      success: true,
      message: "User fetched successfully.",
      data: user
    });
  } catch (err) {
    next(err);
  }
};
var changePassword2 = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await AuthServices.changePassword(
      req.body,
      req.user.userId
    );
    CookieUtils.clearCookie(res, "accessToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });
    CookieUtils.clearCookie(res, "sessionToken", {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });
    res.status(status2.OK).json({
      success: true,
      message: "Password changed successfully. Please log in again."
    });
  } catch (err) {
    next(err);
  }
};
var googleLogin2 = async (req, res, next) => {
  try {
    const { code } = req.query;
    if (!code || typeof code !== "string") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=google_auth_failed`
      );
    }
    const { user, accessToken, sessionToken } = await AuthServices.googleLogin(
      code
    );
    tokenUtils.setAccessTokenCookie(res, accessToken);
    tokenUtils.setSessionTokenCookie(res, sessionToken);
    return res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
    ;
  } catch (err) {
    next(err);
  }
};
var AuthControllers = {
  register: register2,
  login: login2,
  refresh,
  logout,
  logoutAllDevices,
  getMe: getMe2,
  changePassword: changePassword2,
  verifyToken: verifyToken2,
  googleLogin: googleLogin2
};

// src/app/middleware/checkAuth.ts
import status3 from "http-status";
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    const accessToken = CookieUtils.getCookie(req, "accessToken");
    if (!accessToken) {
      throw new AppError_default(status3.UNAUTHORIZED, "Access token undefinedd");
    }
    const verifiedToken = jwtUtils.verifyToken(accessToken, process.env.ACCESS_SECRET);
    if (!verifiedToken.success) {
      throw new AppError_default(status3.UNAUTHORIZED, "You are not logged in or your access token is invalid");
    }
    const payload = verifiedToken.data;
    req.user = {
      userId: payload.userId,
      role: payload.role,
      email: payload.email
    };
    if (authRoles.length > 0 && !authRoles.includes(payload.role)) {
      throw new AppError_default(status3.FORBIDDEN, "You are not authorized to access this route");
    }
    next();
  } catch (err) {
    console.log("========== CHECK AUTH ==========");
    console.log("ERROR:", err);
    console.log("ERROR NAME:", err.name);
    console.log("ERROR MESSAGE:", err.message);
    console.log("INSTANCEOF AppError:", err instanceof AppError_default);
    console.log("STATUSCODE:", err.statuscode);
    console.log("METHOD:", req.method);
    console.log("ORIGINAL URL:", req.originalUrl);
    console.log("PATH:", req.path);
    console.log("PARAMS:", req.params);
    console.log("COOKIE:", req.headers.cookie);
    console.log("================================");
    next(err);
  }
};

// src/app/modules/auth/auth.routes.ts
var router = Router();
router.post("/register", AuthControllers.register);
router.post("/login", AuthControllers.login);
router.post("/refresh", AuthControllers.refresh);
router.get("/google/callback", AuthControllers.googleLogin);
router.post("/logout", checkAuth(), AuthControllers.logout);
router.post("/logout-all", checkAuth(), AuthControllers.logoutAllDevices);
router.get(
  "/me",
  checkAuth(GlobalRole.USER),
  //optionalAuth(),
  AuthControllers.getMe
);
router.patch("/change-password", checkAuth(), AuthControllers.changePassword);
router.get("/verify", checkAuth(), AuthControllers.verifyToken);
var AuthRoutes = router;

// src/app/modules/activities/activities.route.ts
import express from "express";

// src/app/modules/activities/activites.service.ts
var createActivity = async (activityPayload, taskPayload, creatorId) => {
  const { name, description, imageUrl, visibility } = activityPayload;
  const { unit, targetValue, scheduleType, taskName, taskDescription, taskImage, days } = taskPayload;
  let vis;
  if (visibility == "PUBLIC") {
    vis = Visibility.PUBLIC;
  } else if (visibility == "PRIVATE") {
    vis = Visibility.INVITE_ONLY;
  }
  const result = await prisma.$transaction(async (tx) => {
    console.log("tx.activity", tx.activity);
    const activity = await tx.activity.create({
      data: {
        name,
        description,
        imageUrl,
        creatorId,
        visibility: vis,
        memberCount: 1,
        taskCount: 1
      }
    });
    console.log("tx.conversation", tx.conversation);
    const convo = await tx.conversationGroup.create({
      data: {
        activityId: activity.id
      }
    });
    console.log("tx.activityTask", tx.activityTask);
    const activityTask = await tx.activityTask.create({
      data: {
        activityId: activity.id,
        unit,
        targetValue,
        scheduleType,
        name: taskName,
        description: taskDescription,
        imageUrl: taskImage,
        creatorId
      }
    });
    console.log("tx.activityMember", tx.activityMember);
    const member = await tx.activityMember.create({
      data: {
        activityId: activity.id,
        userId: creatorId,
        role: ActivityRole.ADMIN,
        joinedAt: /* @__PURE__ */ new Date()
      }
    });
    if (days.length > 0) {
      for (let i = 0; i < days.length; i++) {
        await tx.taskSchedule.create({
          data: {
            taskId: activityTask.id,
            day: days[i]
          }
        });
      }
    }
    return { activity, activityTask };
  });
  return result;
};
var createTask = async (activityId, taskPayload, creatorId) => {
  const { unit, targetValue, scheduleType, taskName, taskDescription, taskImage, days } = taskPayload;
  const result = await prisma.$transaction(async (tx) => {
    const activityTask = await tx.activityTask.create({
      data: {
        activityId,
        unit,
        targetValue,
        scheduleType,
        name: taskName,
        description: taskDescription,
        imageUrl: taskImage,
        creatorId
      }
    });
    await prisma.activity.update({
      where: { id: activityId },
      data: { taskCount: { increment: 1 } }
    });
    if (days.length > 0) {
      for (let i = 0; i < days.length; i++) {
        await tx.taskSchedule.create({
          data: {
            taskId: activityTask.id,
            day: days[i]
          }
        });
      }
    }
    return { activityTask };
  });
  return result;
};
var getMyActivity = async (userId) => {
  const result = await prisma.activityMember.findMany({
    where: { userId },
    include: { activity: true }
  });
  return result;
};
var getMyCreatedActivity = async (userId) => {
  const result = await prisma.activityMember.findMany({
    where: { userId, role: ActivityRole.ADMIN },
    include: { activity: true }
  });
  return result;
};
var getPublicActivites = async () => {
  const result = await prisma.activity.findMany({
    where: { visibility: "PUBLIC" }
  });
  return result;
};
var joinActivity = async (activityId, userId) => {
  const activity = await prisma.activity.findUnique({
    where: { id: activityId }
  });
  if (!activity || activity.visibility === Visibility.INVITE_ONLY) {
    throw new Error("Activity not found");
  }
  const result = await prisma.activityMember.create({
    data: {
      activityId,
      userId,
      role: ActivityRole.MEMBER,
      joinedAt: /* @__PURE__ */ new Date()
    }
  });
  return result;
};
var leaveActivity = async (activityId, userId) => {
  const result = await prisma.activityMember.update({
    where: { activityId_userId: { activityId, userId } },
    data: { leftAt: /* @__PURE__ */ new Date() }
  });
  return result;
};
var getActivityMembers = async (activityId) => {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const result = await prisma.activityMember.findMany({
    where: { activityId },
    include: { user: true }
  });
  await Promise.all(result.map(async (member) => {
    const isDone = await prisma.activityDailyProgress.findUnique({
      where: {
        activityId_userId_date: {
          activityId,
          userId: member.userId,
          date: yesterday
        },
        completed: true
      }
    });
    if (!isDone) {
      await prisma.activityMember.update({
        where: { activityId_userId: { activityId, userId: member.userId } },
        data: {
          currentStreak: 0,
          longestStreak: member.currentStreak > member.longestStreak ? member.currentStreak : member.longestStreak
        }
      });
    }
  }));
  return await prisma.activityMember.findMany({
    where: { activityId },
    include: { user: true }
  });
};
var sendInvite = async (activityName, senderId, receiverId, activityId) => {
  const result = await prisma.$transaction(async (tx) => {
    const invitation = await tx.activityInvitation.create({
      data: {
        activityId,
        senderId,
        receiverId
      }
    });
    const notification = await tx.notification.create({
      data: {
        title: "Invitation",
        content: `You have been invited to join ${activityName}`,
        userId: receiverId,
        type: "ACTIVITY_INVITATION",
        data: { activityId },
        createdAt: /* @__PURE__ */ new Date()
      }
    });
    return { invitation, notification };
  });
  return result;
};
var getActivityInfo = async (activityId, userId) => {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  console.log("I am 1");
  const result = await prisma.activity.findUnique({
    where: {
      id: activityId
    },
    select: {
      creator: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true
        }
      },
      task: {
        select: {
          id: true,
          unit: true,
          targetValue: true,
          scheduleType: true,
          name: true,
          description: true,
          imageUrl: true,
          creatorId: true,
          createdAt: true,
          taskType: true,
          schedules: true
        }
      },
      id: true,
      memberCount: true,
      taskCount: true,
      visibility: true,
      name: true,
      description: true,
      imageUrl: true,
      createdAt: true
    }
  });
  console.log("I am 2");
  if (!result) {
    return null;
  }
  console.log("I am 3");
  let tasks = null;
  if (!userId) {
    return { ...result };
  }
  console.log("I am 4");
  tasks = await Promise.all(
    result.task.map(async (task) => {
      const progress = await prisma.taskProgress.findUnique({
        where: {
          taskId_userId_date: {
            taskId: task.id,
            userId,
            date: today
          }
        },
        select: {
          isCompleted: true,
          completedValue: true
        }
      });
      return {
        ...task,
        isCompleted: progress?.isCompleted ?? false,
        completedValue: progress?.completedValue ?? 0
      };
    })
  );
  console.log("I am 5");
  return {
    ...result,
    task: tasks
  };
};
var messages = async (conversationGroupId) => {
  const result = await prisma.message.findMany({
    where: { conversationGroupId },
    select: {
      id: true,
      senderId: true,
      content: true,
      createdAt: true
    }
  });
  return result;
};
var totalCompletedTask = async (userId) => {
  const now = /* @__PURE__ */ new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfNextMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    1
  );
  console.log("THIS IS THE START OF MONTH", startOfMonth);
  console.log("THIS IS THE START OF NEXT MONTH", startOfNextMonth);
  const result = await prisma.taskProgress.groupBy({
    by: ["date"],
    _count: {
      taskId: true
    },
    where: {
      userId,
      isCompleted: true,
      date: {
        gte: startOfMonth,
        lt: startOfNextMonth
      }
    },
    orderBy: {
      date: "asc"
    }
  });
  const result2 = result.map((item) => {
    return {
      date: item.date,
      completedTask: item._count.taskId
    };
  });
  console.log("THIS IS THE RESULT FROM TOTAL COMPLETED TASK", result2);
  return result2;
};
var getAllActivities = async () => {
  const result = await prisma.activity.findMany({
    where: {
      visibility: Visibility.PUBLIC
    },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      createdAt: true
    }
  });
  return result;
};
var getSchedules = async (taskId) => {
  const result = await prisma.taskSchedule.findMany({
    where: {
      taskId
    },
    select: {
      day: true
    }
  });
  return result;
};
var activityService = {
  getActivityInfo,
  createActivity,
  createTask,
  getMyActivity,
  getPublicActivites,
  joinActivity,
  leaveActivity,
  getActivityMembers,
  sendInvite,
  getMyCreatedActivity,
  messages,
  totalCompletedTask,
  getAllActivities,
  getSchedules
};

// src/app/shared/cathAsync.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/app/modules/activities/activities.controller.ts
var createActivity2 = async (req, res) => {
  try {
    console.log("THE REQUEST REACHED HERE");
    const { name, description, imageUrl, visibility } = req.body;
    const {
      unit,
      targetValue,
      scheduleType,
      taskName,
      taskDescription,
      taskImage,
      days
    } = req.body;
    const taskPayload = {
      unit,
      targetValue,
      scheduleType,
      taskName,
      taskDescription,
      taskImage,
      days
    };
    const activityPayload = {
      name,
      description,
      imageUrl,
      visibility
    };
    console.log(req.user);
    const activity = await activityService.createActivity(
      activityPayload,
      taskPayload,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      message: "Activity created successfully",
      data: activity
    });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create activity",
      error: error.message
    });
  }
};
var createTask2 = async (req, res) => {
  try {
    const { activityId } = req.params;
    console.log(req.body);
    const {
      unit,
      targetValue,
      scheduleType,
      name: taskName,
      description: taskDescription,
      imageUrl: taskImage,
      days
    } = req.body;
    const taskPayload = {
      unit,
      targetValue,
      scheduleType,
      taskName,
      taskDescription,
      taskImage,
      days
    };
    const task = await activityService.createTask(
      activityId,
      taskPayload,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      message: "Task created successfully",
      data: task
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to create task",
      error: error.message
    });
  }
};
var getMyCreatedActivity2 = async (req, res) => {
  try {
    const activities = await activityService.getMyCreatedActivity(req.user.userId);
    res.status(200).json({
      success: true,
      message: "Activities retrieved successfully",
      data: activities
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve activities",
      error: error.message
    });
  }
};
var getMyActivity2 = async (req, res) => {
  try {
    const activities = await activityService.getMyActivity(req.user.userId);
    res.status(200).json({
      success: true,
      message: "Activities retrieved successfully",
      data: activities
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve activities",
      error: error.message
    });
  }
};
var getPublicActivities = async (req, res) => {
  try {
    const activities = await activityService.getPublicActivites();
    res.status(200).json({
      success: true,
      message: "Public activities retrieved successfully",
      data: activities
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve public activities",
      error: error.message
    });
  }
};
var joinActivity2 = async (req, res) => {
  try {
    const { activityId } = req.params;
    const result = await activityService.joinActivity(
      activityId,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      message: "Joined activity successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to join activity",
      error: error.message
    });
  }
};
var leaveActivity2 = async (req, res) => {
  try {
    const { activityId } = req.params;
    const result = await activityService.leaveActivity(
      activityId,
      req.user.userId
    );
    res.status(200).json({
      success: true,
      message: "Left activity successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to leave activity",
      error: error.message
    });
  }
};
var getActivityMembers2 = async (req, res) => {
  try {
    const { activityId } = req.params;
    const members = await activityService.getActivityMembers(activityId);
    res.status(200).json({
      success: true,
      message: "Activity members retrieved successfully",
      data: members
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to retrieve activity members",
      error: error.message
    });
  }
};
var sendInvite2 = async (req, res) => {
  console.log("the request reached here", req.user);
  try {
    const { activityId, receiverId, activityName } = req.body;
    const result = await activityService.sendInvite(
      activityName,
      req.user.userId,
      receiverId,
      activityId
    );
    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message || "Failed to send invitation",
      error: error.message
    });
  }
};
var getActivityInfo2 = async (req, res) => {
  try {
    console.log("the request reached hereeeeeeeeee", req.user);
    const { activityId } = req.params;
    const userId = req.user?.userId;
    console.log("this is the user Id", userId);
    const activity = await activityService.getActivityInfo(activityId, userId);
    res.status(200).json({
      success: true,
      message: "Activity info retrieved successfully",
      data: activity
    });
  } catch (error) {
    console.log(error.message);
    res.status(501).json({
      success: false,
      message: error.message || "Failed to retrieve activity info",
      error: error.message
    });
  }
};
var totalCompletedTask2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const result = await activityService.totalCompletedTask(userId);
  res.status(200).json({
    success: true,
    message: "Total completed task retrieved successfully",
    data: result
  });
});
var getSchedules2 = catchAsync(async (req, res) => {
  const taskId = req.params.taskId;
  const result = await activityService.getSchedules(taskId);
  res.status(200).json({
    success: true,
    message: "Schedules retrieved successfully",
    data: result
  });
});
var activityController = {
  getActivityInfo: getActivityInfo2,
  createActivity: createActivity2,
  createTask: createTask2,
  getMyActivity: getMyActivity2,
  getPublicActivities,
  joinActivity: joinActivity2,
  leaveActivity: leaveActivity2,
  getActivityMembers: getActivityMembers2,
  sendInvite: sendInvite2,
  getMyCreatedActivity: getMyCreatedActivity2,
  totalCompletedTask: totalCompletedTask2,
  //getAllActivities,
  getSchedules: getSchedules2
};

// src/app/modules/activities/activities.route.ts
var router2 = express.Router();
router2.post("/create", checkAuth(GlobalRole.USER), activityController.createActivity);
router2.get(
  "/my-activities",
  checkAuth(GlobalRole.USER),
  activityController.getMyActivity
);
router2.get(
  "/created-activities",
  checkAuth(GlobalRole.USER),
  activityController.getMyCreatedActivity
);
router2.get("/public-activities", activityController.getPublicActivities);
router2.post("/join-activity", activityController.joinActivity);
router2.post("/leave-activity", activityController.leaveActivity);
router2.post(
  "/send-invite",
  checkAuth(GlobalRole.USER),
  activityController.sendInvite
);
router2.get("/totalCompletedTask", checkAuth(GlobalRole.USER), activityController.totalCompletedTask);
router2.post("/create-task/:activityId", checkAuth(GlobalRole.USER), activityController.createTask);
router2.get(
  "/activity-info/:activityId",
  checkAuth(GlobalRole.USER),
  //optionalAuth(GlobalRole.USER),
  activityController.getActivityInfo
);
router2.get("/schedule/:taskId", activityController.getSchedules);
router2.get("/activity-members/:activityId", activityController.getActivityMembers);
var activityRoutes = router2;

// src/app/modules/achievements/achievement.route.ts
import express2 from "express";

// src/app/modules/achievements/achievement.service.ts
var createTaskAchievement = async (payload, taskId) => {
  console.log("this is the payload", payload);
  const achievments = await prisma.taskAchievement.create({
    data: {
      ...payload,
      taskId
    }
  });
  return achievments;
};
var getAchievement = async (taskId) => {
  const achievments = await prisma.taskAchievement.findMany({
    where: { taskId }
  });
  return achievments;
};
var getMyAchievements = async (userId) => {
  const achievments = await prisma.userTaskAchievement.findMany({
    where: { userId },
    include: {
      achievement: true
    }
  });
  return achievments;
};
var achievementServices = {
  createTaskAchievement,
  getAchievement,
  getMyAchievements
};

// src/app/modules/achievements/activities.controller.ts
var createTaskAchievement2 = catchAsync(
  async (req, res) => {
    const { taskId } = req.params;
    const payload = req.body;
    const achievement = await achievementServices.createTaskAchievement(
      payload,
      taskId
    );
    res.status(201).json({
      success: true,
      message: "Task achievement created successfully",
      data: achievement
    });
  }
);
var getAchievement2 = catchAsync(async (req, res) => {
  const { taskId } = req.params;
  const achievements = await achievementServices.getAchievement(taskId);
  res.status(200).json({
    success: true,
    message: "Task achievements retrieved successfully",
    data: achievements
  });
});
var getMyAchievements2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Unauthorized: User ID is required. Please ensure you are authenticated."
    });
    return;
  }
  const achievements = await achievementServices.getMyAchievements(userId);
  res.status(200).json({
    success: true,
    message: "My task achievements retrieved successfully",
    data: achievements
  });
});
var achievementControllers = {
  createTaskAchievement: createTaskAchievement2,
  getAchievement: getAchievement2,
  getMyAchievements: getMyAchievements2
};

// src/app/modules/achievements/achievement.route.ts
var router3 = express2.Router();
router3.post(
  "/create/:taskId",
  checkAuth(GlobalRole.USER),
  achievementControllers.createTaskAchievement
);
router3.get(
  "/task/:taskId",
  checkAuth(GlobalRole.USER),
  achievementControllers.getAchievement
);
router3.get(
  "/my-achievements",
  checkAuth(GlobalRole.USER),
  achievementControllers.getMyAchievements
);
var achievementRoutes = router3;

// src/app/modules/users/users.service.ts
var sendFriendRequest = async (senderId, receiverId) => {
  const result = await prisma.$transaction(async (tx) => {
    const existing = await tx.friendship.findFirst({
      where: {
        OR: [
          {
            requesterId: senderId,
            receiverId
          },
          {
            requesterId: receiverId,
            receiverId: senderId
          }
        ]
      }
    });
    if (existing) {
      throw new AppError_default(
        400,
        "A friendship or friend request already exists"
      );
    }
    const request2 = await tx.friendship.create({
      data: {
        requesterId: senderId,
        receiverId,
        status: "PENDING"
      }
    });
    const notification = await tx.notification.create({
      data: {
        title: "Friend Request",
        content: `You have a friend request from ${senderId}`,
        userId: receiverId,
        type: "FRIEND_REQUEST",
        data: { requestId: request2.id },
        createdAt: /* @__PURE__ */ new Date()
      }
    });
    return { request: request2, notification };
  });
};
var acceptFriendRequest = async (requesterId, receiverId) => {
  const result = await prisma.$transaction(async (tx) => {
    const request2 = await tx.friendship.findUnique({
      where: { requesterId_receiverId: { requesterId, receiverId } }
      //data:{status:"ACCEPTED"}
    });
    if (!request2) {
      throw new AppError_default(404, "Friend request not found");
    }
    if (request2.status !== "PENDING") {
      throw new AppError_default(400, "Friend request is not pending");
    }
    const updatedRequest = await tx.friendship.update({
      where: {
        requesterId_receiverId: {
          requesterId,
          receiverId
        }
      },
      data: {
        status: "ACCEPTED"
      }
    });
    const notification = await tx.notification.create({
      data: {
        title: "Friend Request",
        content: `Your friend request to ${receiverId} has been accepted`,
        userId: requesterId,
        type: "FRIEND_REQUEST",
        data: { requestId: request2.id },
        createdAt: /* @__PURE__ */ new Date()
      }
    });
    return { request: request2, notification };
  });
};
var sendInvite3 = async (activityName, senderId, receiverId, activityId) => {
  const sender = await prisma.activity.findUnique({
    where: { id: activityId },
    select: { creatorId: true }
  });
  if (!sender || sender?.creatorId !== senderId) {
    throw new AppError_default(
      403,
      "You are not authorized to send invites for this activity"
    );
  }
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1e3);
  const result = await prisma.$transaction(async (tx) => {
    const invitation = await tx.activityInvitation.create({
      data: {
        activityId,
        senderId,
        receiverId,
        expiresAt
      }
    });
    const notification = await tx.notification.create({
      data: {
        title: "Invitation",
        content: `You have been invited to join ${activityName}`,
        userId: receiverId,
        type: "ACTIVITY_INVITATION",
        data: { activityId },
        createdAt: /* @__PURE__ */ new Date()
      }
    });
    return { invitation, notification };
  });
  return result;
};
var acceptInvite = async (id, activityName, senderId, receiverId, activityId) => {
  console.log("I AM IN SERVICE");
  const result = await prisma.$transaction(async (tx) => {
    const invitation = await tx.activityInvitation.update({
      where: { id },
      data: { acceptedAt: /* @__PURE__ */ new Date() }
    });
    console.log("invitation", invitation);
    const member = await tx.activityMember.create({
      data: {
        activityId,
        userId: receiverId,
        joinedAt: /* @__PURE__ */ new Date(),
        role: ActivityRole.MEMBER
        //createdAt:new Date()
      }
    });
    const notification = await tx.notification.create({
      data: {
        title: "Invitation",
        content: `${receiverId} has joined the activity ${activityName}`,
        userId: senderId,
        type: "ACTIVITY_INVITATION",
        data: { activityId },
        createdAt: /* @__PURE__ */ new Date()
      }
    });
    return { invitation, notification };
  });
  return result;
};
var getInvites = async (activityId, userId) => {
  const result = await prisma.activityInvitation.findMany({
    where: { senderId: userId },
    select: { id: true, receiverId: true, activityId: true, expiresAt: true }
    // include:{activity:true}
  });
  return result;
};
var createProgress = async (completedValue, activityId, taskId, userId, note) => {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const acheivements = await prisma.taskAchievement.findMany({
    where: { taskId },
    select: {
      id: true,
      totalValue: true,
      unit: true,
      iconType: true,
      iconValue: true
    },
    orderBy: { totalValue: "asc" }
  });
  const totalAchievements = [];
  const streakAchievements = [];
  for (let i = 0; i < acheivements.length; i++) {
    totalAchievements.push(acheivements[i].totalValue);
  }
  const progress = await prisma.$transaction(async (tx) => {
    const task = await tx.activityTask.findUniqueOrThrow({ where: { id: taskId } });
    const targetValue = Number(task.targetValue);
    const todayProgress = await tx.taskProgress.findUnique({
      where: { taskId_userId_date: { taskId, userId, date: today } },
      select: { completedValue: true, isCompleted: true }
    });
    const wasCompletedToday = todayProgress?.isCompleted ?? false;
    const yesterdayProgress = await tx.taskProgress.findUnique({
      where: { taskId_userId_date: { taskId, userId, date: yesterday } },
      select: { completedValue: true, isCompleted: true, currentStreak: true }
    });
    const progress2 = await tx.taskProgress.upsert({
      where: { taskId_userId_date: { taskId, userId, date: today } },
      create: {
        taskId,
        userId,
        date: today,
        activityId: task.activityId,
        completedValue,
        targetSnapshot: targetValue,
        isCompleted: completedValue >= targetValue
      },
      update: {
        activityId: task.activityId,
        completedValue: { increment: completedValue },
        updatedAt: /* @__PURE__ */ new Date()
      }
    });
    const totalCompletedResult = await tx.taskProgress.aggregate({
      //lifetime total for achievement calculation
      where: { userId, taskId },
      _sum: { completedValue: true }
    });
    const totalCompleted = Number(totalCompletedResult._sum.completedValue) || 0;
    const achieved = [];
    for (let i = 0; i < acheivements.length; i++) {
      if (totalCompleted >= totalAchievements[i]) {
        const existingAchievement = await tx.userTaskAchievement.findUnique({
          where: {
            userId_achievementId: {
              userId,
              achievementId: acheivements[i].id
            }
          },
          select: {
            isEarned: true
          }
        });
        if (existingAchievement?.isEarned) continue;
        await tx.userTaskAchievement.upsert({
          where: {
            userId_achievementId: {
              userId,
              achievementId: acheivements[i].id
            }
          },
          update: {
            isEarned: true,
            completedValue: Number(totalCompleted)
          },
          create: {
            user: {
              connect: {
                id: userId
              }
            },
            achievement: {
              connect: {
                id: acheivements[i].id
              }
            },
            isEarned: true,
            completedValue: Number(totalCompleted)
          }
        });
        achieved.push({ id: acheivements[i].id, totalValue: acheivements[i].totalValue, unit: acheivements[i].unit, iconType: acheivements[i].iconType, iconValue: acheivements[i].iconValue });
      } else break;
    }
    const newTotal = Number(progress2.completedValue);
    const isCompleted = newTotal >= Number(task.targetValue);
    if (isCompleted && !wasCompletedToday) {
      const newStreak = yesterdayProgress?.isCompleted ? (yesterdayProgress.currentStreak ?? 0) + 1 : 1;
      await tx.taskProgress.update({
        where: { id: progress2.id },
        data: {
          isCompleted: true,
          currentStreak: newStreak
        }
      });
    }
    const completed = await tx.taskProgress.count({
      //total how many completed all over
      where: { userId, taskId },
      select: { isCompleted: true }
    });
    const entry = await tx.taskProgressEntry.create({
      data: {
        progressId: progress2.id,
        value: completedValue,
        note
      }
    });
    const totalTasks = await tx.activityTask.count({
      where: { activityId: task.activityId }
    });
    const completedTasks = await tx.taskProgress.count({
      where: { activityId: task.activityId, userId, date: today, isCompleted: true }
    });
    const percentage = completedTasks / totalTasks * 100;
    const todayDailyProgress = await tx.activityDailyProgress.findUnique({
      where: {
        activityId_userId_date: {
          activityId: task.activityId,
          userId,
          date: today
        }
      },
      select: {
        completed: true
      }
    });
    const wasActivityCompletedToday = todayDailyProgress?.completed ?? false;
    if (percentage >= 100 && !wasActivityCompletedToday) {
      const previousDay = await tx.activityDailyProgress.findUnique(
        {
          where: {
            activityId_userId_date: {
              activityId: task.activityId,
              userId,
              date: yesterday
            }
          },
          select: {
            completed: true
          }
        }
      );
      const member = await tx.activityMember.findUniqueOrThrow({
        where: {
          activityId_userId: {
            activityId: task.activityId,
            userId
          }
        },
        select: {
          currentStreak: true,
          longestStreak: true
        }
      });
      const newStreak = previousDay?.completed ? member.currentStreak + 1 : 1;
      await tx.activityMember.update({
        where: {
          activityId_userId: {
            activityId: task.activityId,
            userId
          }
        },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(member.longestStreak, newStreak)
        }
      });
    }
    await tx.activityDailyProgress.upsert({
      where: { activityId_userId_date: { activityId: task.activityId, userId, date: today } },
      create: {
        activityId: task.activityId,
        userId,
        date: today,
        totalTasks,
        completionPercentage: percentage,
        completed: completedTasks >= totalTasks,
        completedTasks
      },
      update: {
        totalTasks,
        completionPercentage: percentage,
        completed: completedTasks >= totalTasks,
        completedTasks
      }
    });
    return { progress: progress2, entry, achieved };
  });
  return progress;
};
var isTaskCompleted = async (activityId, userId) => {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const tasks = await prisma.activityTask.findMany({
    where: { activityId },
    select: { id: true }
  });
  const taskIds = tasks.map((task) => task.id);
  let progress = [];
  for (let i = 0; i < taskIds.length; i++) {
    const task = await prisma.taskProgress.findUnique({
      where: { taskId_userId_date: { taskId: taskIds[i], userId, date: today } },
      select: { id: true, isCompleted: true, completedValue: true }
    });
    progress.push(task);
  }
  return progress;
};
var getdailyLeadership = async (taskId) => {
  const today = /* @__PURE__ */ new Date();
  today.setHours(0, 0, 0, 0);
  const leaderShip = await prisma.taskProgress.findMany({
    where: { taskId, date: today },
    select: {
      completedValue: true,
      userId: true,
      isCompleted: true,
      user: {
        select: {
          username: true,
          createdAt: true
          // achievements: {
          //   select: {
          //     id: true,
          //     completedValue: true,
          //     achievement: {
          //       select: {
          //         title: true,
          //         description: true,
          //         totalValue: true,
          //         unit: true,
          //       },
          //     },
          //   },
          // },
        }
      }
    },
    orderBy: { completedValue: "desc" }
  });
  return leaderShip;
};
var getTaskLeadership = async (taskId) => {
  const progress = await prisma.taskProgress.groupBy({
    by: ["userId"],
    where: { taskId },
    _sum: {
      completedValue: true
    },
    orderBy: {
      _sum: {
        completedValue: "desc"
      }
    }
  });
  const userIds = progress.map((item) => item.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, username: true, createdAt: true }
  });
  const userMap = new Map(users.map((user) => [user.id, user]));
  return progress.map((item) => ({
    userId: item.userId,
    username: userMap.get(item.userId)?.username,
    createdAt: userMap.get(item.userId)?.createdAt,
    completedValue: item._sum.completedValue ?? 0
  }));
};
var getActivityLeadership = async (activityId) => {
  const progress = await prisma.activityDailyProgress.findMany({
    where: {
      activityId
    },
    select: {
      userId: true,
      completedTasks: true,
      totalTasks: true,
      user: {
        select: {
          username: true,
          createdAt: true
        }
      }
    }
  });
  const aggregated = Object.values(
    progress.reduce((acc, row) => {
      if (!acc[row.userId]) {
        acc[row.userId] = {
          userId: row.userId,
          username: row.user.username,
          createdAt: row.user.createdAt,
          completedTasks: 0,
          totalTasks: 0
        };
      }
      acc[row.userId].completedTasks += row.completedTasks;
      acc[row.userId].totalTasks += row.totalTasks;
      return acc;
    }, {})
  );
  return aggregated.map((user) => ({
    ...user,
    completionPercentage: user.totalTasks > 0 ? user.completedTasks : 0
  })).sort(
    (a, b) => b.completionPercentage - a.completionPercentage
  );
};
var viewTaskProgress = async (userId, taskId) => {
  const progress = await prisma.taskProgress.findMany({
    where: { taskId, userId },
    include: { entries: {
      orderBy: {
        createdAt: "desc"
      }
    } },
    orderBy: { createdAt: "desc" }
  });
  return progress;
};
var getTodaysTasks = async (activityId) => {
  const days = [
    DayOfWeek.SUNDAY,
    DayOfWeek.MONDAY,
    DayOfWeek.TUESDAY,
    DayOfWeek.WEDNESDAY,
    DayOfWeek.THURSDAY,
    DayOfWeek.FRIDAY,
    DayOfWeek.SATURDAY
  ];
  const today = /* @__PURE__ */ new Date();
  const dayName = days[today.getDay()];
  const tasks = await prisma.activityTask.findMany({
    where: { activityId, schedules: { some: { day: dayName } } },
    include: { schedules: true, activity: true }
  });
  return tasks;
};
var dailyProgressAnalytics = async (activityId, userId) => {
  const hasAccess = await prisma.activityMember.findFirst({
    where: { activityId, userId }
  });
  if (!hasAccess) {
    throw new AppError_default(403, "You don't have access to this activity");
  }
  const progressAnalytics = await prisma.activityDailyProgress.findMany({
    where: { activityId, userId }
  });
  return progressAnalytics;
};
var getFriendRequests = async (userId, status8) => {
  let fstatus;
  if (status8) {
    fstatus = status8 === "PENDING" ? FriendshipStatus.PENDING : FriendshipStatus.ACCEPTED;
  }
  const requests = await prisma.friendship.findMany({
    where: {
      receiverId: userId,
      status: status8 ? fstatus : FriendshipStatus.PENDING
    },
    include: {
      requester: {
        select: {
          id: true,
          username: true,
          createdAt: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });
  return requests;
};
var getFriendList = async (userId) => {
  const friends = await prisma.friendship.findMany({
    where: {
      //status: FriendshipStatus.ACCEPTED,
      OR: [{ requesterId: userId }, { receiverId: userId }]
    },
    select: {
      id: true,
      requesterId: true,
      receiverId: true,
      status: true,
      requester: {
        select: {
          id: true,
          username: true,
          createdAt: true
        }
      },
      receiver: {
        select: {
          id: true,
          username: true,
          createdAt: true
        }
      }
    }
  });
  return friends.map((friend) => {
    const user = friend.requesterId === userId ? friend.receiver : friend.requester;
    return {
      friendId: friend.id,
      userid: user.id,
      username: user.username,
      createdAt: user.createdAt,
      status: friend.status
    };
  });
};
var getUserInvitations = async (userId, status8) => {
  const now = /* @__PURE__ */ new Date();
  console.log("SERVER NOW:", now);
  const invites = await prisma.activityInvitation.findMany({
    where: { receiverId: userId, expiresAt: { gt: /* @__PURE__ */ new Date() } },
    select: {
      id: true,
      activityId: true,
      senderId: true,
      acceptedAt: true,
      activity: {
        select: { id: true, name: true, description: true }
      },
      createdAt: true,
      sender: {
        select: {
          id: true,
          name: true,
          username: true,
          avatar: true,
          email: true,
          activity: {
            select: { activityId: true }
          }
        }
      }
    }
  });
  const invitations = await Promise.all(
    invites.map(async (invitation) => {
      const member = await prisma.activityMember.findFirst({
        where: { activityId: invitation.activityId, userId },
        select: { id: true }
      });
      return {
        ...invitation,
        member: member ? true : false
      };
    })
  );
  return {
    invitations
  };
};
var getUserWithUsername = async (search, userId) => {
  const user = await prisma.user.findMany({
    where: {
      OR: [
        {
          username: {
            startsWith: search,
            mode: "insensitive"
          }
        },
        {
          email: {
            startsWith: search,
            mode: "insensitive"
          }
        }
      ]
    },
    select: {
      id: true,
      username: true,
      avatar: true,
      email: true,
      activity: {
        select: {
          activityId: true
        }
      }
    },
    take: 5
  });
  const friends = await prisma.friendship.findMany({
    where: {
      OR: [
        {
          requesterId: userId
        },
        {
          receiverId: userId
        }
      ]
    },
    select: {
      requesterId: true,
      receiverId: true,
      status: true
    }
  });
  return { user, friends };
};
var userService = {
  getUserWithUsername,
  getTodaysTasks,
  dailyProgressAnalytics,
  getdailyLeadership,
  getTaskLeadership,
  getActivityLeadership,
  sendInvite: sendInvite3,
  sendFriendRequest,
  acceptFriendRequest,
  acceptInvite,
  createProgress,
  viewTaskProgress,
  getFriendRequests,
  getFriendList,
  getUserInvitations,
  isTaskCompleted,
  getInvites
};

// src/app/modules/users/users.controller.ts
var sendFriendRequest2 = catchAsync(
  async (req, res) => {
    const senderId = req.user.userId;
    const receiverId = req.params.id;
    if (!receiverId) {
      throw new AppError_default(400, "Receiver ID is required");
    }
    if (senderId === receiverId) {
      throw new AppError_default(400, "You cannot send a friend request to yourself");
    }
    const result = await userService.sendFriendRequest(
      senderId,
      receiverId
    );
    res.status(200).json({
      success: true,
      message: "Friend request sent successfully",
      data: result
    });
  }
);
var acceptFriendRequest2 = catchAsync(
  async (req, res) => {
    const receiverId = req.user.userId;
    const requesterId = req.params.id;
    if (!requesterId) {
      throw new AppError_default(400, "Requester ID is required");
    }
    const result = await userService.acceptFriendRequest(
      requesterId,
      receiverId
    );
    res.status(200).json({
      success: true,
      message: "Friend request accepted successfully",
      data: result
    });
  }
);
var sendInvite4 = catchAsync(
  async (req, res) => {
    const senderId = req.user.userId;
    const { activityId, receiverId, activityName } = req.body;
    if (!activityId || !receiverId || !activityName) {
      throw new AppError_default(400, "Activity ID, receiver ID, and activity name are required");
    }
    const result = await userService.sendInvite(
      activityName,
      senderId,
      receiverId,
      activityId
    );
    res.status(200).json({
      success: true,
      message: "Invitation sent successfully",
      data: result
    });
  }
);
var acceptInvite2 = catchAsync(
  async (req, res) => {
    console.log("I HAVE REACHED HERE WHICH IS ACCEPT INVITE");
    const receiverId = req.user.userId;
    const { id, activityId, senderId, activityName } = req.body;
    console.log(req.body);
    if (!activityId || !senderId || !activityName) {
      throw new AppError_default(400, "Activity ID, sender ID, and activity name are required");
    }
    const result = await userService.acceptInvite(
      id,
      activityName,
      senderId,
      receiverId,
      activityId
    );
    res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data: result
    });
  }
);
var createProgress2 = catchAsync(
  async (req, res) => {
    const userId = req.user.userId;
    const { completedValue, activityId, taskId, note } = req.body;
    if (!completedValue || !activityId || !taskId) {
      throw new AppError_default(400, "Completed value, activity ID, and task ID are required");
    }
    const result = await userService.createProgress(
      completedValue,
      activityId,
      taskId,
      userId,
      note
    );
    console.log("THIS IS THE RESULT", result);
    res.status(200).json({
      success: true,
      message: "Progress created successfully",
      data: result
    });
  }
);
var getDailyLeadership = catchAsync(
  async (req, res) => {
    const { taskId } = req.params;
    if (!taskId) {
      throw new AppError_default(400, "Task ID is required");
    }
    const result = await userService.getdailyLeadership(taskId);
    res.status(200).json({
      success: true,
      message: "Daily leadership retrieved successfully",
      data: result
    });
  }
);
var getTaskLeadership2 = catchAsync(
  async (req, res) => {
    const { taskId } = req.params;
    console.log("I HAVE REached the task leadership and this is the id", taskId);
    if (!taskId) {
      throw new AppError_default(400, "Task ID is required");
    }
    const result = await userService.getTaskLeadership(taskId);
    console.log("I HAVE REached the task leadership and this is the result", result);
    res.status(200).json({
      success: true,
      message: "Task leadership retrieved successfully",
      data: result
    });
  }
);
var getActivityLeadership2 = catchAsync(
  async (req, res) => {
    const { activityId } = req.params;
    if (!activityId) {
      throw new AppError_default(400, "Activity ID is required");
    }
    const result = await userService.getActivityLeadership(activityId);
    res.status(200).json({
      success: true,
      message: "Activity leadership retrieved successfully",
      data: result
    });
  }
);
var viewTaskProgress2 = catchAsync(
  async (req, res) => {
    const userId = req.user.userId;
    const { taskId } = req.params;
    if (!taskId) {
      throw new AppError_default(400, "Task ID is required");
    }
    const result = await userService.viewTaskProgress(userId, taskId);
    res.status(200).json({
      success: true,
      message: "Task progress retrieved successfully",
      data: result
    });
  }
);
var getTodaysTasks2 = catchAsync(
  async (req, res) => {
    const { activityId } = req.params;
    if (!activityId) {
      throw new AppError_default(400, "Activity ID is required");
    }
    const result = await userService.getTodaysTasks(activityId);
    res.status(200).json({
      success: true,
      message: "Today's tasks retrieved successfully",
      data: result
    });
  }
);
var dailyProgressAnalytics2 = catchAsync(
  async (req, res) => {
    const userId = req.user.userId;
    const { activityId } = req.params;
    if (!activityId) {
      throw new AppError_default(400, "Activity ID is required");
    }
    const result = await userService.dailyProgressAnalytics(activityId, userId);
    res.status(200).json({
      success: true,
      message: "Daily progress analytics retrieved successfully",
      data: result
    });
  }
);
var getFriendRequests2 = catchAsync(
  async (req, res) => {
    const userId = req.user.userId;
    const { status: status8 } = req.query;
    const result = await userService.getFriendRequests(
      userId,
      status8
    );
    res.status(200).json({
      success: true,
      message: "Friend requests retrieved successfully",
      data: result
    });
  }
);
var getFriendList2 = catchAsync(
  async (req, res) => {
    const userId = req.user.userId;
    const result = await userService.getFriendList(userId);
    res.status(200).json({
      success: true,
      message: "Friend list retrieved successfully",
      data: result
    });
  }
);
var getUserInvitations2 = catchAsync(
  async (req, res) => {
    const userId = req.user.userId;
    const { status: status8 } = req.query;
    const result = await userService.getUserInvitations(
      userId,
      status8
    );
    res.status(200).json({
      success: true,
      message: "User invitations retrieved successfully",
      data: result
    });
  }
);
var getInvites2 = catchAsync(
  async (req, res) => {
    const userId = req.user.userId;
    const { activityId } = req.params;
    const result = await userService.getInvites(
      activityId,
      userId
    );
    res.status(200).json({
      success: true,
      message: "User invitations retrieved successfully",
      data: result
    });
  }
);
var getUserWithUsername2 = catchAsync(
  async (req, res) => {
    const { search } = req.query;
    const userId = req.user.userId;
    if (!search || typeof search !== "string") {
      throw new AppError_default(400, "Username is required");
    }
    const result = await userService.getUserWithUsername(search, userId);
    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: result
    });
  }
);
var isTaskCompleted2 = catchAsync(
  async (req, res) => {
    const { activityId } = req.params;
    const userId = req.user.userId;
    if (!activityId) {
      throw new AppError_default(400, "Task ID is required");
    }
    const result = await userService.isTaskCompleted(activityId, userId);
    res.status(200).json({
      success: true,
      message: "Task completion status retrieved successfully",
      data: result
    });
  }
);
var UserController = {
  getUserWithUsername: getUserWithUsername2,
  getDailyLeadership,
  createProgress: createProgress2,
  sendInvite: sendInvite4,
  sendFriendRequest: sendFriendRequest2,
  acceptFriendRequest: acceptFriendRequest2,
  acceptInvite: acceptInvite2,
  getTaskLeadership: getTaskLeadership2,
  getActivityLeadership: getActivityLeadership2,
  viewTaskProgress: viewTaskProgress2,
  getTodaysTasks: getTodaysTasks2,
  dailyProgressAnalytics: dailyProgressAnalytics2,
  getFriendRequests: getFriendRequests2,
  getFriendList: getFriendList2,
  getUserInvitations: getUserInvitations2,
  isTaskCompleted: isTaskCompleted2,
  getInvites: getInvites2
};

// src/app/modules/users/users.routes.ts
import express3 from "express";
var router4 = express3.Router();
router4.get("/friend-requests", checkAuth(GlobalRole.USER), UserController.getFriendRequests);
router4.get("/username", checkAuth(GlobalRole.USER), UserController.getUserWithUsername);
router4.get("/friends", checkAuth(GlobalRole.USER), UserController.getFriendList);
router4.post("/friend-request/:id", checkAuth(GlobalRole.USER), UserController.sendFriendRequest);
router4.put("/friend-request/accept/:id", checkAuth(GlobalRole.USER), UserController.acceptFriendRequest);
router4.get("/invitations", checkAuth(GlobalRole.USER), UserController.getUserInvitations);
router4.get("/invitations/:activityId", checkAuth(GlobalRole.USER), UserController.getInvites);
router4.post("/invitations/send", UserController.sendInvite);
router4.post("/invitations/accept", checkAuth(GlobalRole.USER), UserController.acceptInvite);
router4.post("/progress", checkAuth(GlobalRole.USER), UserController.createProgress);
router4.get("/progress/task/:taskId", checkAuth(GlobalRole.USER), UserController.viewTaskProgress);
router4.get("/leadership/daily/:taskId", UserController.getDailyLeadership);
router4.get("/leadership/task/:taskId", UserController.getTaskLeadership);
router4.get(
  "/leadership/activity/:activityId",
  UserController.getActivityLeadership
);
router4.get("/isCompleted/:activityId", checkAuth(GlobalRole.USER), UserController.isTaskCompleted);
router4.get("/tasks/today/:activityId", checkAuth(GlobalRole.USER), UserController.getTodaysTasks);
router4.get(
  "/analytics/daily/:activityId",
  checkAuth(GlobalRole.USER),
  UserController.dailyProgressAnalytics
);
var userRoutes = router4;

// src/app/modules/conversation/conversation.route.ts
import { Router as Router2 } from "express";

// src/app/modules/conversation/conversation.service.ts
var getConversationGroup = async (activityId) => {
  const conversationGroup = await prisma.conversationGroup.findUnique({
    where: {
      activityId
    }
  });
  if (!conversationGroup) {
    throw new AppError_default(404, "Conversation group not found");
  }
  return conversationGroup;
};
var checkActivityMember = async (activityId, userId) => {
  const member = await prisma.activityMember.findUnique({
    where: {
      activityId_userId: {
        activityId,
        userId
      }
    }
  });
  if (!member || !member.isActive) {
    throw new AppError_default(403, "You are not an active member of this activity");
  }
  return member;
};
var getMessages = async (activityId, userId) => {
  await checkActivityMember(activityId, userId);
  const conversationGroup = await getConversationGroup(activityId);
  const messages2 = await prisma.message.findMany({
    where: {
      conversationGroupId: conversationGroup.id,
      deletedAt: null
    },
    select: {
      id: true,
      senderId: true,
      type: true,
      content: true,
      edited: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          username: true
        }
      },
      attachments: {
        select: {
          id: true,
          url: true,
          fileName: true,
          mimeType: true,
          size: true
        }
      }
    },
    orderBy: {
      createdAt: "asc"
    }
  });
  return messages2;
};
var sendMessage = async (activityId, senderId, content) => {
  await checkActivityMember(activityId, senderId);
  const conversationGroup = await getConversationGroup(activityId);
  if (!content || !content.trim()) {
    throw new AppError_default(400, "Message content cannot be empty");
  }
  const message = await prisma.message.create({
    data: {
      conversationGroupId: conversationGroup.id,
      senderId,
      type: "TEXT",
      content: content.trim()
    },
    select: {
      id: true,
      senderId: true,
      type: true,
      content: true,
      edited: true,
      createdAt: true,
      sender: {
        select: {
          id: true,
          username: true
        }
      },
      attachments: true
    }
  });
  return message;
};
var editMessage = async (messageId, userId, content) => {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId
    }
  });
  if (!message) {
    throw new AppError_default(404, "Message not found");
  }
  if (message.senderId !== userId) {
    throw new AppError_default(403, "You can only edit your own messages");
  }
  if (!content.trim()) {
    throw new AppError_default(400, "Message content cannot be empty");
  }
  return prisma.message.update({
    where: {
      id: messageId
    },
    data: {
      content: content.trim(),
      edited: true
    },
    select: {
      id: true,
      senderId: true,
      content: true,
      edited: true,
      createdAt: true,
      updatedAt: true
    }
  });
};
var deleteMessage = async (messageId, userId) => {
  const message = await prisma.message.findUnique({
    where: {
      id: messageId
    }
  });
  if (!message) {
    throw new AppError_default(404, "Message not found");
  }
  if (message.senderId !== userId) {
    throw new AppError_default(403, "You can only delete your own messages");
  }
  return prisma.message.update({
    where: {
      id: messageId
    },
    data: {
      deletedAt: /* @__PURE__ */ new Date(),
      content: null
    },
    select: {
      id: true,
      senderId: true,
      deletedAt: true
    }
  });
};
var conversationService = {
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage
};

// src/app/modules/conversation/conversation.controller.ts
var getMessages2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { activityId } = req.params;
  if (!activityId) {
    throw new AppError_default(400, "Activity ID is required");
  }
  const messages2 = await conversationService.getMessages(activityId, userId);
  res.status(200).json({
    success: true,
    message: "Messages retrieved successfully",
    data: messages2
  });
});
var editMessage2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { messageId } = req.params;
  const { content } = req.body;
  if (!messageId) {
    throw new AppError_default(400, "Message ID is required");
  }
  if (!content) {
    throw new AppError_default(400, "Message content is required");
  }
  const message = await conversationService.editMessage(
    messageId,
    userId,
    content
  );
  res.status(200).json({
    success: true,
    message: "Message updated successfully",
    data: message
  });
});
var deleteMessage2 = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const { messageId } = req.params;
  if (!messageId) {
    throw new AppError_default(400, "Message ID is required");
  }
  const message = await conversationService.deleteMessage(messageId, userId);
  res.status(200).json({
    success: true,
    message: "Message deleted successfully",
    data: message
  });
});
var conversationController = {
  getMessages: getMessages2,
  editMessage: editMessage2,
  deleteMessage: deleteMessage2
};

// src/app/modules/conversation/conversation.route.ts
var router5 = Router2();
router5.get(
  "/:activityId/messages",
  checkAuth(GlobalRole.USER),
  conversationController.getMessages
);
router5.patch(
  "/messages/:messageId",
  checkAuth(GlobalRole.USER),
  conversationController.editMessage
);
router5.delete(
  "/messages/:messageId",
  checkAuth(GlobalRole.USER),
  conversationController.deleteMessage
);
var conversationRouter = router5;

// src/app/modules/chatbot/chatbot.route.ts
import express4 from "express";

// src/app/modules/chatbot/chatbot.services.ts
var EMBEDDING_URL = "https://openrouter.ai/api/v1/embeddings";
async function createEmbedding(text) {
  const response = await fetch(EMBEDDING_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_EMBEDDING_MODEL,
      input: text
    })
  });
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding failed: ${error}`);
  }
  const data = await response.json();
  return data.data[0].embedding;
}
async function searchKnowledge(query, limit = 5) {
  const queryEmbedding = await createEmbedding(query);
  const vector = `[${queryEmbedding.join(",")}]`;
  const result = await prisma.$queryRawUnsafe(
    `
    SELECT 
    id,
    source,
    content,
    1-(embedding <=> $1::vector) AS score
    FROM knowledge_chunks
    ORDER BY embedding <=> $1::vector
    LIMIT $2
    `,
    vector,
    limit
  );
  return result;
}
async function getActivityStreak(userId, activityName) {
  const member = await prisma.activityMember.findFirst({
    where: {
      userId,
      isActive: true,
      activity: {
        name: {
          equals: activityName,
          mode: "insensitive"
        }
      }
    },
    include: {
      activity: true
    }
  });
  if (!member) {
    return {
      found: false,
      activityName
    };
  }
  return {
    found: true,
    activityId: member.activityId,
    activityName: member.activity.name,
    currentStreak: member.currentStreak,
    longestStreak: member.longestStreak
  };
}
async function getActivityMembership(userId, activityName) {
  const member = await prisma.activityMember.findFirst({
    where: {
      userId,
      isActive: true,
      activity: {
        name: {
          equals: activityName,
          mode: "insensitive"
        }
      }
    },
    include: {
      activity: true
    }
  });
  if (!member) {
    return {
      found: false,
      activityName
    };
  }
  return {
    found: true,
    activityId: member.activityId,
    activityName: member.activity.name,
    joinedAt: member.joinedAt,
    role: member.role,
    completionRate: member.completionRate,
    currentStreak: member.currentStreak,
    longestStreak: member.longestStreak
  };
}
async function createConversation(userId) {
  return prisma.chatConversation.create({
    data: {
      userId
    }
  });
}
async function getConversation(conversationId, userId) {
  return prisma.chatConversation.findFirst({
    where: {
      id: conversationId,
      userId
    }
  });
}
async function getConversationMessages(conversationId) {
  return prisma.chatMessage.findMany({
    where: {
      conversationId
    },
    orderBy: {
      createdAt: "asc"
    },
    take: 20
  });
}
async function saveUserMessage(conversationId, content) {
  return prisma.chatMessage.create({
    data: {
      conversationId,
      role: "USER",
      content
    }
  });
}
async function saveAssistantMessage(conversationId, content, toolCalls) {
  return prisma.chatMessage.create({
    data: {
      conversationId,
      role: "ASSISTANT",
      content,
      toolCalls: toolCalls ?? void 0
    }
  });
}
async function saveToolMessage(conversationId, toolCallId, content) {
  return prisma.chatMessage.create({
    data: {
      conversationId,
      role: "TOOL",
      toolCallId,
      content
    }
  });
}
function convertMessagesToLLM(dbMessages) {
  return dbMessages.map((message) => {
    if (message.role === "USER") {
      return {
        role: "user",
        content: message.content
      };
    }
    if (message.role === "ASSISTANT") {
      return {
        role: "assistant",
        content: message.content,
        ...message.toolCalls ? {
          tool_calls: message.toolCalls
        } : {}
      };
    }
    if (message.role === "TOOL") {
      return {
        role: "tool",
        tool_call_id: message.toolCallId,
        content: message.content
      };
    }
    return null;
  }).filter(Boolean);
}

// src/app/modules/chatbot/chatbot.tools.ts
var chatbotTools = [
  {
    type: "function",
    function: {
      name: "get_activity_streak",
      description: "Get the authenticated user's current and longest streak for a specific Strive activity. Use this when the user asks about their streak in an activity.",
      parameters: {
        type: "object",
        properties: {
          activityName: {
            type: "string",
            description: "The name of the Strive activity mentioned by the user, for example 'Workout'."
          }
        },
        required: ["activityName"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_activity_membership",
      description: "Get the authenticated user's membership information for a specific Strive activity, including when they joined, their role, completion rate, and streaks.",
      parameters: {
        type: "object",
        properties: {
          activityName: {
            type: "string",
            description: "The name of the Strive activity, for example 'Workout'."
          }
        },
        required: ["activityName"],
        additionalProperties: false
      }
    }
  }
];
async function executeChatbotTool(toolName, args, userId) {
  switch (toolName) {
    case "get_activity_streak": {
      const result = await getActivityStreak(userId, args.activityName);
      return result;
    }
    case "get_activity_membership": {
      return getActivityMembership(userId, args.activityName);
    }
    default:
      throw new Error(`Tool not found ${toolName}`);
  }
}

// src/app/modules/chatbot/chatbot.controller.ts
var OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
var MODEL = process.env.OPENROUTER_LLM_MODEL;
async function callLLM(messages2, tools) {
  const body = {
    model: MODEL,
    messages: messages2,
    max_tokens: 300
  };
  if (tools) {
    body.tools = tools;
    body.tool_choice = "auto";
  }
  console.log("========== LLM REQUEST ==========");
  console.log(JSON.stringify(body, null, 2));
  const response = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`
    },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  console.log("========== LLM RESPONSE ==========");
  console.log(JSON.stringify(data, null, 2));
  if (!response.ok) {
    console.log("OPENROUTER error", data);
    throw new Error(
      data?.error?.message || "Request failed"
    );
  }
  if (!data.choices?.[0]?.message) {
    throw new Error(
      `OpenRouter returned no assistant message: ${JSON.stringify(data)}`
    );
  }
  return data;
}
var chatWithStrive = catchAsync(
  async (req, res) => {
    const message = req.body.message;
    const conversationId = req.body.conversationId;
    const userId = req.user.userId;
    console.log("THIS IS THE CONVESATION ID", conversationId);
    let conversation;
    if (conversationId) {
      conversation = await getConversation(conversationId, userId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found"
        });
      }
    } else {
      conversation = await createConversation(userId);
    }
    console.log("conversation", conversation);
    const dbMessages = await getConversationMessages(conversation.id);
    const history = convertMessagesToLLM(dbMessages);
    await saveUserMessage(conversation.id, message);
    history.push({
      role: "user",
      content: message
    });
    const intent = detectIntent(message);
    let knowledgeContext = "";
    if (intent === "BOTH" || intent === "KNOWLEDGE") {
      const knowledge = await searchKnowledge(message, 5);
      knowledgeContext = knowledge.map((item) => `SOURCE:${item.source}
CONTENT:${item.content}`).join("\n\n---------\n\n");
    }
    const systemPrompt = `
      You are the Strive application assistant.

      Your job is to answer questions about the Strive application.

      IMPORTANT RULES:

      1. For Strive application behavior, use the provided documentation
        as the source of truth.

      2. Never invent Strive features, rules, values, statistics, or
        user information.

      3. When the user asks about their personal Strive data,
        use the available tools.

      4. Never assume or invent a user's personal data.

      5. The authenticated user's identity is controlled by the backend.
        Never ask the user for their user ID.

      6. If a tool returns found=false, explain that the requested
        activity could not be found.

      7. If the documentation does not contain enough information,
        say that you do not have enough information.

      8. Keep answers clear and concise.

      9. If the user asks a general question unrelated to Strive,
        answer normally.

      STRIVE DOCUMENTATION:
      ${knowledgeContext || "No documentation was retrieved for this question."}
      `;
    const messages2 = [
      {
        role: "system",
        content: systemPrompt
      },
      ...history
    ];
    console.log("========== CONVERSATION HISTORY ==========");
    console.log("ABCDEFGH", JSON.stringify(history, null, 2));
    const firstResponse = await callLLM(
      messages2,
      chatbotTools
    );
    const assistantMessage = firstResponse.choices[0].message;
    await saveAssistantMessage(
      conversation.id,
      assistantMessage.content ?? null,
      assistantMessage.tool_calls
    );
    if (!assistantMessage.tool_calls?.length) {
      return res.json({
        response: assistantMessage.content,
        conversationId: conversation.id
      });
    }
    messages2.push(assistantMessage);
    for (const toolCall of assistantMessage.tool_calls) {
      const toolName = toolCall.function.name;
      let args;
      try {
        args = JSON.parse(toolCall.function.arguments);
      } catch {
        throw new Error(
          `Invalid tool arguments from model: ${toolCall.function.arguments}`
        );
      }
      console.log("TOOL:", toolName);
      console.log("TOOL ARGS:", args);
      const toolResult = await executeChatbotTool(toolName, args, userId);
      await saveToolMessage(
        conversation.id,
        toolCall.id,
        JSON.stringify(toolResult)
      );
      console.log("TOOL RESULT:", toolResult);
      messages2.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: JSON.stringify(toolResult)
      });
    }
    const finalResponse = await callLLM(
      messages2,
      chatbotTools
    );
    console.log(
      "FINAL OPENROUTER RESPONSE:",
      JSON.stringify(finalResponse, null, 2)
    );
    if (!finalResponse.choices?.[0]?.message) {
      throw new Error(
        `Invalid final LLM response: ${JSON.stringify(finalResponse)}`
      );
    }
    const finalMessage = finalResponse.choices[0].message;
    await saveAssistantMessage(
      conversation.id,
      finalMessage.content ?? null
    );
    res.json({
      response: finalMessage.content,
      conversationId: conversation.id
    });
  }
);
var chatbotController = { chatWithStrive };

// src/app/modules/chatbot/chatbot.route.ts
var router6 = express4.Router();
function detectIntent(message) {
  const text = message.toLowerCase();
  const userdata = [
    "my ",
    "myself",
    "i ",
    "i'm",
    "ive ",
    "i've ",
    "for me",
    "mine"
  ];
  const knowledge = [
    "what is",
    "what are",
    "what does",
    "how does",
    "how do",
    "how can",
    "explain",
    "what happens"
  ];
  const needUser = userdata.some((word) => text.includes(word));
  const needKnowledge = knowledge.some((word) => text.includes(word));
  if (needUser && needKnowledge) {
    return "BOTH";
  }
  if (needUser) {
    return "USER";
  }
  if (needKnowledge) {
    return "KNOWLEDGE";
  }
  return "UNKNOWN";
}
router6.post("/chat", checkAuth(), chatbotController.chatWithStrive);
var chatbotRoutes = router6;

// src/app/modules/usage/usage.route.ts
import { Router as Router3 } from "express";

// src/app/modules/usage/usage.controller.ts
import status4 from "http-status";

// src/app/modules/usage/usage.services.ts
var startUsage = async (payload) => {
  const startedAt = payload.startedAt ?? /* @__PURE__ */ new Date();
  const usage = await prisma.websiteUsage.create({
    data: {
      userId: payload.userId,
      sessionId: payload.sessionId,
      domain: payload.domain,
      startedAt,
      endedAt: null,
      durationSec: 0
    }
  });
  return usage;
};
var stopUsage = async (payload) => {
  const usage = await prisma.websiteUsage.findFirst({
    where: {
      id: payload.usageId,
      userId: payload.userId,
      endedAt: null
    }
  });
  if (!usage) {
    throw new AppError_default(404, "Usage not found");
  }
  const endedAt = payload.endedAt ?? /* @__PURE__ */ new Date();
  const durationSec = Math.max(0, endedAt.getTime() - usage.startedAt.getTime()) / 1e3;
  const updpatedUsage = await prisma.websiteUsage.update({
    where: {
      id: usage.id
    },
    data: {
      endedAt,
      durationSec
    }
  });
  return updpatedUsage;
};
var getTodayUsage = async (userId) => {
  const now = /* @__PURE__ */ new Date();
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const usage = await prisma.websiteUsage.groupBy({
    by: ["domain"],
    where: {
      userId,
      startedAt: {
        gte: startOfDay
      }
    },
    _sum: {
      durationSec: true
    },
    orderBy: {
      _sum: {
        durationSec: "desc"
      }
    }
  });
  const usage3 = await prisma.websiteUsage.findMany({
    where: {
      userId
    },
    orderBy: {
      startedAt: "desc"
    },
    take: 10
  });
  return usage.map((item) => ({
    domain: item.domain,
    durationSec: item._sum.durationSec
  }));
};
var getWebsiteSummary = async (userId) => {
  const usage = await prisma.websiteUsage.groupBy({
    by: ["domain"],
    where: {
      userId
    },
    _sum: {
      durationSec: true
    },
    orderBy: {
      _sum: {
        durationSec: "desc"
      }
    }
  });
  return usage;
};
var WebsiteUsageServices = {
  startUsage,
  stopUsage,
  getTodayUsage,
  getWebsiteSummary
};

// src/app/modules/usage/usage.controller.ts
var startUsage2 = async (req, res, next) => {
  try {
    const { domain, startedAt } = req.body;
    if (!domain) {
      return res.status(status4.BAD_REQUEST).json({
        success: false,
        message: "Domain is required"
      });
    }
    const usage = await WebsiteUsageServices.startUsage({
      userId: req.user.userId,
      sessionId: req.sessionId,
      domain,
      startedAt: startedAt ? new Date(startedAt) : /* @__PURE__ */ new Date()
    });
    res.status(status4.CREATED).json({
      success: true,
      message: "Website tracking started",
      data: usage
    });
  } catch (error) {
    next(error);
  }
};
var stopUsage2 = async (req, res, next) => {
  try {
    const { usageId, endedAt } = req.body;
    if (!usageId) {
      return res.status(status4.BAD_REQUEST).json({
        success: false,
        message: "Usage ID is required"
      });
    }
    const usage = await WebsiteUsageServices.stopUsage({
      userId: req.user.userId,
      usageId,
      endedAt: endedAt ? new Date(endedAt) : /* @__PURE__ */ new Date()
    });
    res.status(status4.OK).json({
      success: true,
      message: "Website tracking stopped",
      data: usage
    });
  } catch (error) {
    next(error);
  }
};
var getTodayUsage2 = async (req, res, next) => {
  console.log("I AM IN GET TODAY USAGE");
  try {
    console.log("I AM IN GET TODAY USAGE2");
    const usage = await WebsiteUsageServices.getTodayUsage(req.user.userId);
    res.status(status4.OK).json({
      success: true,
      data: usage
    });
  } catch (error) {
    next(error);
  }
};
var getWebsiteSummary2 = async (req, res, next) => {
  try {
    const data = await WebsiteUsageServices.getWebsiteSummary(req.user.userId);
    res.status(status4.OK).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
var getCurrentSession = async (req, res) => {
  console.log("CURRENT user", req.user.userId);
  console.log("CURRENT session", req.sessionId);
  res.status(200).json({
    success: true,
    data: {
      userId: req.user.userId,
      sessionId: req.sessionId
    }
  });
};
var WebsiteUsageControllers = {
  startUsage: startUsage2,
  stopUsage: stopUsage2,
  getTodayUsage: getTodayUsage2,
  getWebsiteSummary: getWebsiteSummary2,
  getCurrentSession
};

// src/app/middleware/checkUsageAuth.ts
import status5 from "http-status";
var checkUsageAuth = async (req, res, next) => {
  console.log("GETTING TODAY USAGE");
  try {
    const sessionToken = req.headers["x-session-token"];
    console.log("SESSION TOKEN:", req.headers["x-session-token"]);
    if (!sessionToken || typeof sessionToken !== "string") {
      throw new AppError_default(status5.UNAUTHORIZED, "Usage session token missing");
    }
    const session = await sessionUtils.getSessionByToken(sessionToken);
    if (!session) {
      throw new AppError_default(
        status5.UNAUTHORIZED,
        "Usage session is invalid or expired"
      );
    }
    req.user = {
      userId: session.userId,
      role: session.user.globalRole,
      email: session.user.email
    };
    req.sessionId = session.id;
    next();
  } catch (error) {
    next(error);
  }
};

// src/app/modules/usage/usage.route.ts
var router7 = Router3();
router7.post("/start", checkUsageAuth, WebsiteUsageControllers.startUsage);
router7.post("/stop", checkUsageAuth, WebsiteUsageControllers.stopUsage);
router7.get("/today", checkAuth(), WebsiteUsageControllers.getTodayUsage);
router7.get("/summary", WebsiteUsageControllers.getWebsiteSummary);
router7.get("/session", checkUsageAuth, WebsiteUsageControllers.getCurrentSession);
var WebsiteUsageRoutes = router7;

// src/app/routes/index.ts
var router8 = express5.Router();
router8.use("/auth", AuthRoutes);
router8.use("/activity", activityRoutes);
router8.use("/achievement", achievementRoutes);
router8.use("/user", userRoutes);
router8.use("/conversation", conversationRouter);
router8.use("/chatbot", chatbotRoutes);
router8.use("/usage", WebsiteUsageRoutes);
var IndexRoutes = router8;

// src/app.ts
import cors from "cors";
import cookieParser from "cookie-parser";

// src/app/middleware/globalErrorHandler.ts
import status7 from "http-status";
import z from "zod";

// src/app/errorHelpers/handleZodError.ts
import status6 from "http-status";
var handleZodError = (error) => {
  const errorSources = [];
  const message = "Validation Error";
  const statusCode = status6.BAD_REQUEST;
  error.issues.forEach((issue) => {
    errorSources.push({
      path: issue.path.join("=>"),
      message: issue.message
    });
  });
  return {
    success: false,
    message,
    statusCode,
    errorSources
  };
};

// src/app/middleware/globalErrorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  console.log("========== GLOBAL ERROR HANDLER ==========");
  console.log("ERROR:", err.message);
  console.log("IS APP ERROR:", err instanceof AppError_default);
  console.log(
    "STATUSCODE:",
    err instanceof AppError_default ? err.statuscode : "NOT APP ERROR"
  );
  console.error("Error Stack:\n", err.stack);
  console.log("THE path:", req.path);
  let statusCode = status7.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong";
  let stack = "";
  let errorSources = [];
  if (err instanceof z.ZodError) {
    const zodError = handleZodError(err);
    statusCode = zodError.statusCode;
    message = zodError.message;
    errorSources = zodError.errorSources;
  } else if (err instanceof AppError_default) {
    statusCode = err.statuscode;
    message = err.message;
    stack = err.stack;
    errorSources = [{ path: "", message: err.message }];
  } else if (err instanceof Error) {
    statusCode = status7.BAD_REQUEST;
    message = err.message;
    stack = err.stack;
    errorSources = [{ path: "", message: err.message }];
  }
  console.log("FINAL STATUS CODE:", statusCode);
  console.log("FINAL MESSAGE:", message);
  console.log("HEADERS SENT:", res.headersSent);
  res.status(statusCode).json({
    success: false,
    message,
    statusCode,
    errorSources,
    error: err
  });
};

// src/app.ts
var app = express6();
var allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      if (origin.startsWith("chrome-extension://")) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"), false);
    },
    credentials: true
  })
);
app.use(express6.urlencoded({ extended: true }));
app.use(express6.json());
app.use(cookieParser());
app.use("/", IndexRoutes);
app.get("/", (req, res) => {
  res.json({
    message: "Hello World FROM DOCKER"
  });
});
app.use(globalErrorHandler);
console.log("I am BATMAN");
var app_default = app;

// src/app/socket/socket.server.ts
import { Server } from "socket.io";

// src/app/socket/socket.handlers.ts
var getRoomName = (activityId) => {
  return `activity:${activityId}`;
};
var registerSocketHandlers = (io2, socket) => {
  const userId = socket.data.userId;
  socket.on("activity:join", async (activityId) => {
    try {
      if (!activityId) {
        socket.emit("activity:error", {
          message: "Activity ID is required"
        });
        return;
      }
      await conversationService.getMessages(activityId, userId);
      const room = getRoomName(activityId);
      socket.join(room);
      socket.emit("activity:joined", {
        activityId
      });
      console.log(`User ${userId} joined ${room}`);
    } catch (error) {
      socket.emit("activity:error", {
        message: error.message || "Unable to join activity"
      });
    }
  });
  socket.on("activity:leave", (activityId) => {
    if (!activityId) {
      return;
    }
    const room = getRoomName(activityId);
    socket.leave(room);
    console.log(`User ${userId} left ${room}`);
  });
  socket.on(
    "message:send",
    async (data) => {
      try {
        const { activityId, content } = data;
        if (!activityId) {
          socket.emit("message:error", {
            message: "Activity ID is required"
          });
          return;
        }
        if (!content || !content.trim()) {
          socket.emit("message:error", {
            message: "Message cannot be empty"
          });
          return;
        }
        const message = await conversationService.sendMessage(
          activityId,
          userId,
          content
        );
        const room = getRoomName(activityId);
        io2.to(room).emit("message:new", message);
      } catch (error) {
        socket.emit("message:error", {
          message: error.message || "Failed to send message"
        });
      }
    }
  );
  socket.on(
    "message:edit",
    async (data) => {
      try {
        const { messageId, content, activityId } = data;
        const message = await conversationService.editMessage(
          messageId,
          userId,
          content
        );
        io2.to(getRoomName(activityId)).emit("message:updated", message);
      } catch (error) {
        socket.emit("message:error", {
          message: error.message || "Failed to edit message"
        });
      }
    }
  );
  socket.on(
    "message:delete",
    async (data) => {
      try {
        const { messageId, activityId } = data;
        const message = await conversationService.deleteMessage(
          messageId,
          userId
        );
        io2.to(getRoomName(activityId)).emit("message:deleted", message);
      } catch (error) {
        socket.emit("message:error", {
          message: error.message || "Failed to delete message"
        });
      }
    }
  );
};

// src/app/socket/socket.auth.ts
import jwt2 from "jsonwebtoken";
var getAccessToken2 = (cookieHeader) => {
  if (!cookieHeader) {
    return null;
  }
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());
  const accessTokenCookie = cookies.find(
    (cookie) => cookie.startsWith("accessToken=")
  );
  if (!accessTokenCookie) {
    return null;
  }
  return accessTokenCookie.substring("accessToken=".length);
};
var socketAuth = (socket, next) => {
  try {
    const cookieHeader = socket.handshake.headers.cookie;
    const token = getAccessToken2(cookieHeader);
    console.log("this is the token", token);
    if (!token) {
      return next(new Error("Unauthorized hehehe"));
    }
    const decoded = jwt2.verify(token, process.env.ACCESS_SECRET);
    console.log("this is decoded", decoded);
    if (!decoded.userId) {
      return next(new Error("Unauthorized hahaha"));
    }
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("THIS IS ERROR MESSAGE", error.message);
    next(error.message);
  }
};

// src/app/socket/socket.server.ts
var initializeSocket = (httpServer2) => {
  const io2 = new Server(httpServer2, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true
    }
  });
  io2.use(socketAuth);
  io2.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.data.userId}`);
    registerSocketHandlers(io2, socket);
    socket.on("disconnect", (reason) => {
      console.log(`Socket disconnected: ${socket.data.userId}`, reason);
    });
  });
  return io2;
};

// src/server.ts
var PORT = process.env.PORT || 5e3;
var httpServer = http.createServer(app_default);
var io = initializeSocket(httpServer);
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
