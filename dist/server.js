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
var isProd = process.env.NODE_ENV === "production";
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
  "inlineSchema": 'model ChatConversation {\n  id        String        @id @default(uuid())\n  userId    String\n  user      User          @relation(fields: [userId], references: [id], onDelete: Cascade)\n  createdAt DateTime      @default(now())\n  updatedAt DateTime      @updatedAt\n  messages  ChatMessage[]\n\n  @@index([userId])\n}\n\nmodel ChatMessage {\n  id             String           @id @default(uuid())\n  conversationId String\n  conversation   ChatConversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)\n\n  role       ChatMessageRole\n  content    String?\n  toolCalls  Json?\n  toolCallId String?\n\n  createdAt DateTime @default(now())\n\n  @@index([conversationId, createdAt])\n}\n\nenum ChatMessageRole {\n  USER\n  ASSISTANT\n  TOOL\n}\n\nmodel TaskAchievement {\n  id          String                @id @default(uuid())\n  taskId      String\n  title       String\n  description String\n  iconUrl     String?\n  totalValue  Int\n  unit        String?\n  createdAt   DateTime              @default(now())\n  iconType    IconType?             @default(DEFAULT)\n  iconValue   String?\n  task        ActivityTask          @relation(fields: [taskId], references: [id], onDelete: Cascade)\n  users       UserTaskAchievement[]\n}\n\nmodel UserTaskAchievement {\n  id              String          @id @default(uuid())\n  userId          String\n  achievementId   String\n  isEarned        Boolean\n  completedValue  Int             @default(0)\n  completedStreak Int             @default(0)\n  achievement     TaskAchievement @relation(fields: [achievementId], references: [id], onDelete: Cascade)\n  user            User            @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([userId, achievementId])\n  @@index([userId])\n  @@index([achievementId])\n}\n\nenum IconType {\n  DEFAULT\n  ICON\n  PREBUILT\n  CUSTOM\n  EMOJI\n}\n\nmodel Activity {\n  id            String                  @id @default(uuid())\n  name          String\n  description   String\n  imageUrl      String\n  memberCount   Int                     @default(0)\n  taskCount     Int                     @default(0)\n  creatorId     String\n  createdAt     DateTime                @default(now())\n  updatedAt     DateTime                @updatedAt\n  visibility    Visibility\n  creator       User                    @relation("ActivityCreator", fields: [creatorId], references: [id], onDelete: Cascade)\n  dailyProgress ActivityDailyProgress[]\n  invitations   ActivityInvitation[]\n  members       ActivityMember[]\n  task          ActivityTask[]\n  group         ConversationGroup?\n\n  @@index([visibility])\n  @@index([creatorId])\n}\n\nmodel ActivityMember {\n  id             String       @id @default(uuid())\n  userId         String\n  activityId     String\n  role           ActivityRole\n  joinedAt       DateTime\n  leftAt         DateTime?\n  isActive       Boolean      @default(true)\n  currentStreak  Int          @default(0)\n  longestStreak  Int          @default(0)\n  completionRate Float        @default(0)\n  activity       Activity     @relation(fields: [activityId], references: [id], onDelete: Cascade)\n  user           User         @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([activityId, userId])\n  @@index([activityId])\n  @@index([userId])\n}\n\nmodel ActivityInvitation {\n  id         String    @id @default(uuid())\n  activityId String\n  senderId   String\n  receiverId String\n  expiresAt  DateTime?\n  acceptedAt DateTime?\n  createdAt  DateTime  @default(now())\n  activity   Activity  @relation(fields: [activityId], references: [id], onDelete: Cascade)\n  receiver   User      @relation("InvitationReceiver", fields: [receiverId], references: [id], onDelete: Cascade)\n  sender     User      @relation("InvitationSender", fields: [senderId], references: [id], onDelete: Cascade)\n\n  @@index([receiverId, activityId, senderId])\n}\n\nmodel Quiz {\n  id       String   @id @default(uuid())\n  question String\n  answer   String?\n  options  String[]\n}\n\nmodel ActivityTask {\n  id           String            @id @default(uuid())\n  activityId   String\n  unit         String\n  targetValue  Float\n  scheduleType ScheduleType      @default(DAILY)\n  name         String\n  description  String\n  imageUrl     String?\n  creatorId    String\n  createdAt    DateTime          @default(now())\n  updatedAt    DateTime          @updatedAt\n  taskType     TaskType          @default(VALUE)\n  activity     Activity          @relation(fields: [activityId], references: [id], onDelete: Cascade)\n  creator      User              @relation("TaskCreator", fields: [creatorId], references: [id], onDelete: Cascade)\n  acheivements TaskAchievement[]\n  progress     TaskProgress[]\n  schedules    TaskSchedule[]\n\n  @@index([activityId])\n  @@index([creatorId])\n}\n\nmodel TaskSchedule {\n  id     String       @id @default(uuid())\n  taskId String\n  day    DayOfWeek\n  task   ActivityTask @relation(fields: [taskId], references: [id], onDelete: Cascade)\n\n  @@unique([taskId, day])\n}\n\nmodel TaskProgress {\n  id             String              @id @default(uuid())\n  activityId     String\n  taskId         String\n  userId         String\n  date           DateTime\n  completedValue Decimal             @db.Decimal(10, 2)\n  targetSnapshot Decimal             @db.Decimal(10, 2)\n  isCompleted    Boolean             @default(false)\n  createdAt      DateTime            @default(now())\n  updatedAt      DateTime            @updatedAt\n  currentStreak  Int                 @default(0)\n  longestStreak  Int                 @default(0)\n  task           ActivityTask        @relation(fields: [taskId], references: [id], onDelete: Cascade)\n  user           User                @relation(fields: [userId], references: [id], onDelete: Cascade)\n  entries        TaskProgressEntry[]\n\n  @@unique([taskId, userId, date])\n  @@index([taskId])\n  @@index([userId])\n}\n\nmodel TaskProgressEntry {\n  id         String       @id @default(uuid())\n  progressId String\n  value      Decimal      @db.Decimal(10, 2)\n  note       String?\n  createdAt  DateTime     @default(now())\n  progress   TaskProgress @relation(fields: [progressId], references: [id], onDelete: Cascade)\n\n  @@index([progressId])\n}\n\nmodel ActivityDailyProgress {\n  id                   String   @id @default(uuid())\n  activityId           String\n  userId               String\n  date                 DateTime\n  completedTasks       Int\n  totalTasks           Int\n  completionPercentage Decimal  @db.Decimal(5, 2)\n  completed            Boolean\n  createdAt            DateTime @default(now())\n  updatedAt            DateTime @updatedAt\n  task                 Activity @relation(fields: [activityId], references: [id], onDelete: Cascade)\n  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([activityId, userId, date])\n  @@index([activityId])\n  @@index([userId])\n}\n\nenum TaskType {\n  VALUE\n  CHECKLIST\n  DOWN\n  QUIZ\n}\n\nmodel User {\n  id         String     @id @default(uuid())\n  name       String?\n  username   String?    @unique\n  email      String?    @unique\n  password   String?\n  avatar     String?\n  createdAt  DateTime   @default(now())\n  updatedAt  DateTime   @updatedAt\n  globalRole GlobalRole @default(USER)\n  isActive   Boolean    @default(true)\n  googleId   String?    @unique\n\n  createdActivities     Activity[]              @relation("ActivityCreator")\n  ActivityDailyProgress ActivityDailyProgress[]\n  receivedInvitations   ActivityInvitation[]    @relation("InvitationReceiver")\n  sentInvitations       ActivityInvitation[]    @relation("InvitationSender")\n  activity              ActivityMember[]\n  createdTasks          ActivityTask[]          @relation("TaskCreator")\n  receivedRequests      Friendship[]            @relation("FriendReceiver")\n  sentRequests          Friendship[]            @relation("FriendRequester")\n  messages              Message[]\n  notification          Notification[]\n  passwordResets        PasswordReset[]\n  sessions              Session[]\n  progress              TaskProgress[]\n  profile               UserProfile?\n  achievements          UserTaskAchievement[]\n  chats                 ChatConversation[]\n  websiteUsage          WebsiteUsage[]\n  googleLoginCodes      GoogleLoginCode[]\n\n  @@index([email])\n  @@index([username])\n}\n\nmodel Session {\n  id               String         @id @default(uuid())\n  userId           String\n  refreshTokenHash String         @unique\n  expiresAt        DateTime\n  deviceName       String?\n  ipAdress         String?\n  userAgent        String?\n  revokedAt        DateTime?\n  createdAt        DateTime       @default(now())\n  lastUsedAt       DateTime       @updatedAt\n  user             User           @relation(fields: [userId], references: [id], onDelete: Cascade)\n  websiteUsage     WebsiteUsage[]\n\n  @@index([userId])\n}\n\nmodel UserProfile {\n  id        String    @id @default(uuid())\n  userId    String    @unique\n  firstName String?\n  lastName  String?\n  bio       String?\n  avatarUrl String?\n  birthDate DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n}\n\nmodel Friendship {\n  id          String           @id @default(uuid())\n  requesterId String\n  receiverId  String\n  status      FriendshipStatus\n  createdAt   DateTime         @default(now())\n  updatedAt   DateTime         @updatedAt\n  receiver    User             @relation("FriendReceiver", fields: [receiverId], references: [id], onDelete: Cascade)\n  requester   User             @relation("FriendRequester", fields: [requesterId], references: [id], onDelete: Cascade)\n\n  @@unique([requesterId, receiverId])\n  @@index([requesterId])\n  @@index([receiverId])\n  @@index([status])\n}\n\nmodel PasswordReset {\n  id        String    @id @default(uuid())\n  userId    String\n  tokenHash String\n  usedAt    DateTime?\n  createdAt DateTime  @default(now())\n  expiresAt DateTime\n  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([expiresAt])\n}\n\nmodel GoogleLoginCode {\n  id        String   @id @default(cuid())\n  codeHash  String   @unique\n  userId    String\n  expiresAt DateTime\n  createdAt DateTime @default(now())\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([expiresAt])\n}\n\nmodel ConversationGroup {\n  id         String    @id @default(uuid())\n  activityId String    @unique\n  createdAt  DateTime  @default(now())\n  activity   Activity  @relation(fields: [activityId], references: [id], onDelete: Cascade)\n  messages   Message[]\n}\n\nmodel Message {\n  id                  String            @id @default(uuid())\n  conversationGroupId String\n  senderId            String\n  type                MessageType       @default(TEXT)\n  content             String?\n  edited              Boolean           @default(false)\n  deletedAt           DateTime?\n  createdAt           DateTime          @default(now())\n  updatedAt           DateTime          @updatedAt\n  attachments         Attachment[]\n  conversationGroup   ConversationGroup @relation(fields: [conversationGroupId], references: [id], onDelete: Cascade)\n  sender              User              @relation(fields: [senderId], references: [id], onDelete: Cascade)\n\n  @@index([conversationGroupId])\n  @@index([senderId])\n  @@index([createdAt])\n}\n\nmodel Attachment {\n  id        String   @id @default(uuid())\n  messageId String\n  url       String\n  fileName  String\n  mimeType  String\n  size      Int\n  createdAt DateTime @default(now())\n  message   Message  @relation(fields: [messageId], references: [id], onDelete: Cascade)\n\n  @@index([messageId])\n}\n\nenum GlobalRole {\n  SUPERADMIN\n  USER\n}\n\nenum FriendshipStatus {\n  ACCEPTED\n  PENDING\n  DECLINED\n}\n\nenum NotificationType {\n  FRIEND_REQUEST\n  ACTIVITY_INVITATION\n  TASK_REMINDER\n  NEW_MESSAGE\n  PROMOTED_TO_ADMIN\n  STREAK\n  LEADERBOARD\n  ACHIEVEMENT\n}\n\nenum ActivityRole {\n  MEMBER\n  ADMIN\n}\n\nenum Visibility {\n  PUBLIC\n  INVITE_ONLY\n}\n\nenum ScheduleType {\n  DAILY\n  CUSTOM\n}\n\nenum DayOfWeek {\n  MONDAY\n  TUESDAY\n  WEDNESDAY\n  THURSDAY\n  FRIDAY\n  SATURDAY\n  SUNDAY\n}\n\nenum MessageType {\n  TEXT\n  IMAGE\n  FILE\n  SYSTEM\n}\n\nmodel knowledge_chunks {\n  id         String                 @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid\n  source     String\n  content    String\n  embedding  Unsupported("vector")?\n  created_at DateTime?              @default(now()) @db.Timestamp(6)\n}\n\nmodel Notification {\n  id        String           @id @default(uuid())\n  title     String\n  content   String\n  userId    String\n  createdAt DateTime\n  type      NotificationType\n  isRead    Boolean          @default(false)\n  data      Json?\n  user      User             @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([userId])\n  @@index([isRead])\n  @@index([type])\n  @@index([createdAt])\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel WebsiteUsage {\n  id        String @id @default(uuid())\n  userId    String\n  sessionId String\n\n  domain      String\n  startedAt   DateTime\n  endedAt     DateTime?\n  durationSec Int\n\n  createdAt DateTime @default(now())\n\n  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)\n  session Session @relation(fields: [sessionId], references: [id], onDelete: Cascade)\n\n  @@index([userId, startedAt])\n  @@index([userId, domain])\n  @@index([sessionId])\n  @@index([domain])\n}\n',
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
config.runtimeDataModel = JSON.parse('{"models":{"ChatConversation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"ChatConversationToUser"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"messages","kind":"object","type":"ChatMessage","relationName":"ChatConversationToChatMessage"}],"dbName":null},"ChatMessage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"conversationId","kind":"scalar","type":"String"},{"name":"conversation","kind":"object","type":"ChatConversation","relationName":"ChatConversationToChatMessage"},{"name":"role","kind":"enum","type":"ChatMessageRole"},{"name":"content","kind":"scalar","type":"String"},{"name":"toolCalls","kind":"scalar","type":"Json"},{"name":"toolCallId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"}],"dbName":null},"TaskAchievement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"taskId","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"iconUrl","kind":"scalar","type":"String"},{"name":"totalValue","kind":"scalar","type":"Int"},{"name":"unit","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"iconType","kind":"enum","type":"IconType"},{"name":"iconValue","kind":"scalar","type":"String"},{"name":"task","kind":"object","type":"ActivityTask","relationName":"ActivityTaskToTaskAchievement"},{"name":"users","kind":"object","type":"UserTaskAchievement","relationName":"TaskAchievementToUserTaskAchievement"}],"dbName":null},"UserTaskAchievement":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"achievementId","kind":"scalar","type":"String"},{"name":"isEarned","kind":"scalar","type":"Boolean"},{"name":"completedValue","kind":"scalar","type":"Int"},{"name":"completedStreak","kind":"scalar","type":"Int"},{"name":"achievement","kind":"object","type":"TaskAchievement","relationName":"TaskAchievementToUserTaskAchievement"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserTaskAchievement"}],"dbName":null},"Activity":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"memberCount","kind":"scalar","type":"Int"},{"name":"taskCount","kind":"scalar","type":"Int"},{"name":"creatorId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"visibility","kind":"enum","type":"Visibility"},{"name":"creator","kind":"object","type":"User","relationName":"ActivityCreator"},{"name":"dailyProgress","kind":"object","type":"ActivityDailyProgress","relationName":"ActivityToActivityDailyProgress"},{"name":"invitations","kind":"object","type":"ActivityInvitation","relationName":"ActivityToActivityInvitation"},{"name":"members","kind":"object","type":"ActivityMember","relationName":"ActivityToActivityMember"},{"name":"task","kind":"object","type":"ActivityTask","relationName":"ActivityToActivityTask"},{"name":"group","kind":"object","type":"ConversationGroup","relationName":"ActivityToConversationGroup"}],"dbName":null},"ActivityMember":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"ActivityRole"},{"name":"joinedAt","kind":"scalar","type":"DateTime"},{"name":"leftAt","kind":"scalar","type":"DateTime"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"currentStreak","kind":"scalar","type":"Int"},{"name":"longestStreak","kind":"scalar","type":"Int"},{"name":"completionRate","kind":"scalar","type":"Float"},{"name":"activity","kind":"object","type":"Activity","relationName":"ActivityToActivityMember"},{"name":"user","kind":"object","type":"User","relationName":"ActivityMemberToUser"}],"dbName":null},"ActivityInvitation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"senderId","kind":"scalar","type":"String"},{"name":"receiverId","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"acceptedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"activity","kind":"object","type":"Activity","relationName":"ActivityToActivityInvitation"},{"name":"receiver","kind":"object","type":"User","relationName":"InvitationReceiver"},{"name":"sender","kind":"object","type":"User","relationName":"InvitationSender"}],"dbName":null},"Quiz":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"question","kind":"scalar","type":"String"},{"name":"answer","kind":"scalar","type":"String"},{"name":"options","kind":"scalar","type":"String"}],"dbName":null},"ActivityTask":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"unit","kind":"scalar","type":"String"},{"name":"targetValue","kind":"scalar","type":"Float"},{"name":"scheduleType","kind":"enum","type":"ScheduleType"},{"name":"name","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"imageUrl","kind":"scalar","type":"String"},{"name":"creatorId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"taskType","kind":"enum","type":"TaskType"},{"name":"activity","kind":"object","type":"Activity","relationName":"ActivityToActivityTask"},{"name":"creator","kind":"object","type":"User","relationName":"TaskCreator"},{"name":"acheivements","kind":"object","type":"TaskAchievement","relationName":"ActivityTaskToTaskAchievement"},{"name":"progress","kind":"object","type":"TaskProgress","relationName":"ActivityTaskToTaskProgress"},{"name":"schedules","kind":"object","type":"TaskSchedule","relationName":"ActivityTaskToTaskSchedule"}],"dbName":null},"TaskSchedule":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"taskId","kind":"scalar","type":"String"},{"name":"day","kind":"enum","type":"DayOfWeek"},{"name":"task","kind":"object","type":"ActivityTask","relationName":"ActivityTaskToTaskSchedule"}],"dbName":null},"TaskProgress":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"taskId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"completedValue","kind":"scalar","type":"Decimal"},{"name":"targetSnapshot","kind":"scalar","type":"Decimal"},{"name":"isCompleted","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"currentStreak","kind":"scalar","type":"Int"},{"name":"longestStreak","kind":"scalar","type":"Int"},{"name":"task","kind":"object","type":"ActivityTask","relationName":"ActivityTaskToTaskProgress"},{"name":"user","kind":"object","type":"User","relationName":"TaskProgressToUser"},{"name":"entries","kind":"object","type":"TaskProgressEntry","relationName":"TaskProgressToTaskProgressEntry"}],"dbName":null},"TaskProgressEntry":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"progressId","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"Decimal"},{"name":"note","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"progress","kind":"object","type":"TaskProgress","relationName":"TaskProgressToTaskProgressEntry"}],"dbName":null},"ActivityDailyProgress":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"completedTasks","kind":"scalar","type":"Int"},{"name":"totalTasks","kind":"scalar","type":"Int"},{"name":"completionPercentage","kind":"scalar","type":"Decimal"},{"name":"completed","kind":"scalar","type":"Boolean"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"task","kind":"object","type":"Activity","relationName":"ActivityToActivityDailyProgress"},{"name":"user","kind":"object","type":"User","relationName":"ActivityDailyProgressToUser"}],"dbName":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"username","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"avatar","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"globalRole","kind":"enum","type":"GlobalRole"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"googleId","kind":"scalar","type":"String"},{"name":"createdActivities","kind":"object","type":"Activity","relationName":"ActivityCreator"},{"name":"ActivityDailyProgress","kind":"object","type":"ActivityDailyProgress","relationName":"ActivityDailyProgressToUser"},{"name":"receivedInvitations","kind":"object","type":"ActivityInvitation","relationName":"InvitationReceiver"},{"name":"sentInvitations","kind":"object","type":"ActivityInvitation","relationName":"InvitationSender"},{"name":"activity","kind":"object","type":"ActivityMember","relationName":"ActivityMemberToUser"},{"name":"createdTasks","kind":"object","type":"ActivityTask","relationName":"TaskCreator"},{"name":"receivedRequests","kind":"object","type":"Friendship","relationName":"FriendReceiver"},{"name":"sentRequests","kind":"object","type":"Friendship","relationName":"FriendRequester"},{"name":"messages","kind":"object","type":"Message","relationName":"MessageToUser"},{"name":"notification","kind":"object","type":"Notification","relationName":"NotificationToUser"},{"name":"passwordResets","kind":"object","type":"PasswordReset","relationName":"PasswordResetToUser"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"progress","kind":"object","type":"TaskProgress","relationName":"TaskProgressToUser"},{"name":"profile","kind":"object","type":"UserProfile","relationName":"UserToUserProfile"},{"name":"achievements","kind":"object","type":"UserTaskAchievement","relationName":"UserToUserTaskAchievement"},{"name":"chats","kind":"object","type":"ChatConversation","relationName":"ChatConversationToUser"},{"name":"websiteUsage","kind":"object","type":"WebsiteUsage","relationName":"UserToWebsiteUsage"},{"name":"googleLoginCodes","kind":"object","type":"GoogleLoginCode","relationName":"GoogleLoginCodeToUser"}],"dbName":null},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"refreshTokenHash","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"deviceName","kind":"scalar","type":"String"},{"name":"ipAdress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"revokedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"lastUsedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"},{"name":"websiteUsage","kind":"object","type":"WebsiteUsage","relationName":"SessionToWebsiteUsage"}],"dbName":null},"UserProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"firstName","kind":"scalar","type":"String"},{"name":"lastName","kind":"scalar","type":"String"},{"name":"bio","kind":"scalar","type":"String"},{"name":"avatarUrl","kind":"scalar","type":"String"},{"name":"birthDate","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"UserToUserProfile"}],"dbName":null},"Friendship":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requesterId","kind":"scalar","type":"String"},{"name":"receiverId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"FriendshipStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"receiver","kind":"object","type":"User","relationName":"FriendReceiver"},{"name":"requester","kind":"object","type":"User","relationName":"FriendRequester"}],"dbName":null},"PasswordReset":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"tokenHash","kind":"scalar","type":"String"},{"name":"usedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"PasswordResetToUser"}],"dbName":null},"GoogleLoginCode":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"codeHash","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"GoogleLoginCodeToUser"}],"dbName":null},"ConversationGroup":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"activityId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"activity","kind":"object","type":"Activity","relationName":"ActivityToConversationGroup"},{"name":"messages","kind":"object","type":"Message","relationName":"ConversationGroupToMessage"}],"dbName":null},"Message":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"conversationGroupId","kind":"scalar","type":"String"},{"name":"senderId","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"MessageType"},{"name":"content","kind":"scalar","type":"String"},{"name":"edited","kind":"scalar","type":"Boolean"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"attachments","kind":"object","type":"Attachment","relationName":"AttachmentToMessage"},{"name":"conversationGroup","kind":"object","type":"ConversationGroup","relationName":"ConversationGroupToMessage"},{"name":"sender","kind":"object","type":"User","relationName":"MessageToUser"}],"dbName":null},"Attachment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"messageId","kind":"scalar","type":"String"},{"name":"url","kind":"scalar","type":"String"},{"name":"fileName","kind":"scalar","type":"String"},{"name":"mimeType","kind":"scalar","type":"String"},{"name":"size","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"message","kind":"object","type":"Message","relationName":"AttachmentToMessage"}],"dbName":null},"knowledge_chunks":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"source","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"created_at","kind":"scalar","type":"DateTime"}],"dbName":null},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"content","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"type","kind":"enum","type":"NotificationType"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"data","kind":"scalar","type":"Json"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"}],"dbName":null},"WebsiteUsage":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"sessionId","kind":"scalar","type":"String"},{"name":"domain","kind":"scalar","type":"String"},{"name":"startedAt","kind":"scalar","type":"DateTime"},{"name":"endedAt","kind":"scalar","type":"DateTime"},{"name":"durationSec","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"UserToWebsiteUsage"},{"name":"session","kind":"object","type":"Session","relationName":"SessionToWebsiteUsage"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","creator","task","user","dailyProgress","activity","receiver","sender","invitations","members","achievement","users","_count","acheivements","progress","entries","schedules","message","attachments","conversationGroup","messages","group","createdActivities","ActivityDailyProgress","receivedInvitations","sentInvitations","createdTasks","requester","receivedRequests","sentRequests","notification","passwordResets","session","websiteUsage","sessions","profile","achievements","chats","googleLoginCodes","conversation","ChatConversation.findUnique","ChatConversation.findUniqueOrThrow","ChatConversation.findFirst","ChatConversation.findFirstOrThrow","ChatConversation.findMany","data","ChatConversation.createOne","ChatConversation.createMany","ChatConversation.createManyAndReturn","ChatConversation.updateOne","ChatConversation.updateMany","ChatConversation.updateManyAndReturn","create","update","ChatConversation.upsertOne","ChatConversation.deleteOne","ChatConversation.deleteMany","having","_min","_max","ChatConversation.groupBy","ChatConversation.aggregate","ChatMessage.findUnique","ChatMessage.findUniqueOrThrow","ChatMessage.findFirst","ChatMessage.findFirstOrThrow","ChatMessage.findMany","ChatMessage.createOne","ChatMessage.createMany","ChatMessage.createManyAndReturn","ChatMessage.updateOne","ChatMessage.updateMany","ChatMessage.updateManyAndReturn","ChatMessage.upsertOne","ChatMessage.deleteOne","ChatMessage.deleteMany","ChatMessage.groupBy","ChatMessage.aggregate","TaskAchievement.findUnique","TaskAchievement.findUniqueOrThrow","TaskAchievement.findFirst","TaskAchievement.findFirstOrThrow","TaskAchievement.findMany","TaskAchievement.createOne","TaskAchievement.createMany","TaskAchievement.createManyAndReturn","TaskAchievement.updateOne","TaskAchievement.updateMany","TaskAchievement.updateManyAndReturn","TaskAchievement.upsertOne","TaskAchievement.deleteOne","TaskAchievement.deleteMany","_avg","_sum","TaskAchievement.groupBy","TaskAchievement.aggregate","UserTaskAchievement.findUnique","UserTaskAchievement.findUniqueOrThrow","UserTaskAchievement.findFirst","UserTaskAchievement.findFirstOrThrow","UserTaskAchievement.findMany","UserTaskAchievement.createOne","UserTaskAchievement.createMany","UserTaskAchievement.createManyAndReturn","UserTaskAchievement.updateOne","UserTaskAchievement.updateMany","UserTaskAchievement.updateManyAndReturn","UserTaskAchievement.upsertOne","UserTaskAchievement.deleteOne","UserTaskAchievement.deleteMany","UserTaskAchievement.groupBy","UserTaskAchievement.aggregate","Activity.findUnique","Activity.findUniqueOrThrow","Activity.findFirst","Activity.findFirstOrThrow","Activity.findMany","Activity.createOne","Activity.createMany","Activity.createManyAndReturn","Activity.updateOne","Activity.updateMany","Activity.updateManyAndReturn","Activity.upsertOne","Activity.deleteOne","Activity.deleteMany","Activity.groupBy","Activity.aggregate","ActivityMember.findUnique","ActivityMember.findUniqueOrThrow","ActivityMember.findFirst","ActivityMember.findFirstOrThrow","ActivityMember.findMany","ActivityMember.createOne","ActivityMember.createMany","ActivityMember.createManyAndReturn","ActivityMember.updateOne","ActivityMember.updateMany","ActivityMember.updateManyAndReturn","ActivityMember.upsertOne","ActivityMember.deleteOne","ActivityMember.deleteMany","ActivityMember.groupBy","ActivityMember.aggregate","ActivityInvitation.findUnique","ActivityInvitation.findUniqueOrThrow","ActivityInvitation.findFirst","ActivityInvitation.findFirstOrThrow","ActivityInvitation.findMany","ActivityInvitation.createOne","ActivityInvitation.createMany","ActivityInvitation.createManyAndReturn","ActivityInvitation.updateOne","ActivityInvitation.updateMany","ActivityInvitation.updateManyAndReturn","ActivityInvitation.upsertOne","ActivityInvitation.deleteOne","ActivityInvitation.deleteMany","ActivityInvitation.groupBy","ActivityInvitation.aggregate","Quiz.findUnique","Quiz.findUniqueOrThrow","Quiz.findFirst","Quiz.findFirstOrThrow","Quiz.findMany","Quiz.createOne","Quiz.createMany","Quiz.createManyAndReturn","Quiz.updateOne","Quiz.updateMany","Quiz.updateManyAndReturn","Quiz.upsertOne","Quiz.deleteOne","Quiz.deleteMany","Quiz.groupBy","Quiz.aggregate","ActivityTask.findUnique","ActivityTask.findUniqueOrThrow","ActivityTask.findFirst","ActivityTask.findFirstOrThrow","ActivityTask.findMany","ActivityTask.createOne","ActivityTask.createMany","ActivityTask.createManyAndReturn","ActivityTask.updateOne","ActivityTask.updateMany","ActivityTask.updateManyAndReturn","ActivityTask.upsertOne","ActivityTask.deleteOne","ActivityTask.deleteMany","ActivityTask.groupBy","ActivityTask.aggregate","TaskSchedule.findUnique","TaskSchedule.findUniqueOrThrow","TaskSchedule.findFirst","TaskSchedule.findFirstOrThrow","TaskSchedule.findMany","TaskSchedule.createOne","TaskSchedule.createMany","TaskSchedule.createManyAndReturn","TaskSchedule.updateOne","TaskSchedule.updateMany","TaskSchedule.updateManyAndReturn","TaskSchedule.upsertOne","TaskSchedule.deleteOne","TaskSchedule.deleteMany","TaskSchedule.groupBy","TaskSchedule.aggregate","TaskProgress.findUnique","TaskProgress.findUniqueOrThrow","TaskProgress.findFirst","TaskProgress.findFirstOrThrow","TaskProgress.findMany","TaskProgress.createOne","TaskProgress.createMany","TaskProgress.createManyAndReturn","TaskProgress.updateOne","TaskProgress.updateMany","TaskProgress.updateManyAndReturn","TaskProgress.upsertOne","TaskProgress.deleteOne","TaskProgress.deleteMany","TaskProgress.groupBy","TaskProgress.aggregate","TaskProgressEntry.findUnique","TaskProgressEntry.findUniqueOrThrow","TaskProgressEntry.findFirst","TaskProgressEntry.findFirstOrThrow","TaskProgressEntry.findMany","TaskProgressEntry.createOne","TaskProgressEntry.createMany","TaskProgressEntry.createManyAndReturn","TaskProgressEntry.updateOne","TaskProgressEntry.updateMany","TaskProgressEntry.updateManyAndReturn","TaskProgressEntry.upsertOne","TaskProgressEntry.deleteOne","TaskProgressEntry.deleteMany","TaskProgressEntry.groupBy","TaskProgressEntry.aggregate","ActivityDailyProgress.findUnique","ActivityDailyProgress.findUniqueOrThrow","ActivityDailyProgress.findFirst","ActivityDailyProgress.findFirstOrThrow","ActivityDailyProgress.findMany","ActivityDailyProgress.createOne","ActivityDailyProgress.createMany","ActivityDailyProgress.createManyAndReturn","ActivityDailyProgress.updateOne","ActivityDailyProgress.updateMany","ActivityDailyProgress.updateManyAndReturn","ActivityDailyProgress.upsertOne","ActivityDailyProgress.deleteOne","ActivityDailyProgress.deleteMany","ActivityDailyProgress.groupBy","ActivityDailyProgress.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","UserProfile.findUnique","UserProfile.findUniqueOrThrow","UserProfile.findFirst","UserProfile.findFirstOrThrow","UserProfile.findMany","UserProfile.createOne","UserProfile.createMany","UserProfile.createManyAndReturn","UserProfile.updateOne","UserProfile.updateMany","UserProfile.updateManyAndReturn","UserProfile.upsertOne","UserProfile.deleteOne","UserProfile.deleteMany","UserProfile.groupBy","UserProfile.aggregate","Friendship.findUnique","Friendship.findUniqueOrThrow","Friendship.findFirst","Friendship.findFirstOrThrow","Friendship.findMany","Friendship.createOne","Friendship.createMany","Friendship.createManyAndReturn","Friendship.updateOne","Friendship.updateMany","Friendship.updateManyAndReturn","Friendship.upsertOne","Friendship.deleteOne","Friendship.deleteMany","Friendship.groupBy","Friendship.aggregate","PasswordReset.findUnique","PasswordReset.findUniqueOrThrow","PasswordReset.findFirst","PasswordReset.findFirstOrThrow","PasswordReset.findMany","PasswordReset.createOne","PasswordReset.createMany","PasswordReset.createManyAndReturn","PasswordReset.updateOne","PasswordReset.updateMany","PasswordReset.updateManyAndReturn","PasswordReset.upsertOne","PasswordReset.deleteOne","PasswordReset.deleteMany","PasswordReset.groupBy","PasswordReset.aggregate","GoogleLoginCode.findUnique","GoogleLoginCode.findUniqueOrThrow","GoogleLoginCode.findFirst","GoogleLoginCode.findFirstOrThrow","GoogleLoginCode.findMany","GoogleLoginCode.createOne","GoogleLoginCode.createMany","GoogleLoginCode.createManyAndReturn","GoogleLoginCode.updateOne","GoogleLoginCode.updateMany","GoogleLoginCode.updateManyAndReturn","GoogleLoginCode.upsertOne","GoogleLoginCode.deleteOne","GoogleLoginCode.deleteMany","GoogleLoginCode.groupBy","GoogleLoginCode.aggregate","ConversationGroup.findUnique","ConversationGroup.findUniqueOrThrow","ConversationGroup.findFirst","ConversationGroup.findFirstOrThrow","ConversationGroup.findMany","ConversationGroup.createOne","ConversationGroup.createMany","ConversationGroup.createManyAndReturn","ConversationGroup.updateOne","ConversationGroup.updateMany","ConversationGroup.updateManyAndReturn","ConversationGroup.upsertOne","ConversationGroup.deleteOne","ConversationGroup.deleteMany","ConversationGroup.groupBy","ConversationGroup.aggregate","Message.findUnique","Message.findUniqueOrThrow","Message.findFirst","Message.findFirstOrThrow","Message.findMany","Message.createOne","Message.createMany","Message.createManyAndReturn","Message.updateOne","Message.updateMany","Message.updateManyAndReturn","Message.upsertOne","Message.deleteOne","Message.deleteMany","Message.groupBy","Message.aggregate","Attachment.findUnique","Attachment.findUniqueOrThrow","Attachment.findFirst","Attachment.findFirstOrThrow","Attachment.findMany","Attachment.createOne","Attachment.createMany","Attachment.createManyAndReturn","Attachment.updateOne","Attachment.updateMany","Attachment.updateManyAndReturn","Attachment.upsertOne","Attachment.deleteOne","Attachment.deleteMany","Attachment.groupBy","Attachment.aggregate","knowledge_chunks.findUnique","knowledge_chunks.findUniqueOrThrow","knowledge_chunks.findFirst","knowledge_chunks.findFirstOrThrow","knowledge_chunks.findMany","knowledge_chunks.createOne","knowledge_chunks.createMany","knowledge_chunks.createManyAndReturn","knowledge_chunks.updateOne","knowledge_chunks.updateMany","knowledge_chunks.updateManyAndReturn","knowledge_chunks.upsertOne","knowledge_chunks.deleteOne","knowledge_chunks.deleteMany","knowledge_chunks.groupBy","knowledge_chunks.aggregate","Notification.findUnique","Notification.findUniqueOrThrow","Notification.findFirst","Notification.findFirstOrThrow","Notification.findMany","Notification.createOne","Notification.createMany","Notification.createManyAndReturn","Notification.updateOne","Notification.updateMany","Notification.updateManyAndReturn","Notification.upsertOne","Notification.deleteOne","Notification.deleteMany","Notification.groupBy","Notification.aggregate","WebsiteUsage.findUnique","WebsiteUsage.findUniqueOrThrow","WebsiteUsage.findFirst","WebsiteUsage.findFirstOrThrow","WebsiteUsage.findMany","WebsiteUsage.createOne","WebsiteUsage.createMany","WebsiteUsage.createManyAndReturn","WebsiteUsage.updateOne","WebsiteUsage.updateMany","WebsiteUsage.updateManyAndReturn","WebsiteUsage.upsertOne","WebsiteUsage.deleteOne","WebsiteUsage.deleteMany","WebsiteUsage.groupBy","WebsiteUsage.aggregate","AND","OR","NOT","id","userId","sessionId","domain","startedAt","endedAt","durationSec","createdAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","title","content","NotificationType","type","isRead","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","source","created_at","messageId","url","fileName","mimeType","size","conversationGroupId","senderId","MessageType","edited","deletedAt","updatedAt","activityId","every","some","none","codeHash","expiresAt","tokenHash","usedAt","requesterId","receiverId","FriendshipStatus","status","firstName","lastName","bio","avatarUrl","birthDate","refreshTokenHash","deviceName","ipAdress","userAgent","revokedAt","lastUsedAt","name","username","email","password","avatar","GlobalRole","globalRole","isActive","googleId","date","completedTasks","totalTasks","completionPercentage","completed","progressId","value","note","taskId","completedValue","targetSnapshot","isCompleted","currentStreak","longestStreak","DayOfWeek","day","unit","targetValue","ScheduleType","scheduleType","description","imageUrl","creatorId","TaskType","taskType","question","answer","options","has","hasEvery","hasSome","acceptedAt","ActivityRole","role","joinedAt","leftAt","completionRate","memberCount","taskCount","Visibility","visibility","achievementId","isEarned","completedStreak","iconUrl","totalValue","IconType","iconType","iconValue","conversationId","ChatMessageRole","toolCalls","toolCallId","requesterId_receiverId","taskId_day","taskId_userId_date","userId_achievementId","activityId_userId","activityId_userId_date","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","push","increment","decrement","multiply","divide"]'),
  graph: "gA3mAZADCQUAAOYFACAWAACtBgAgwgMAAKwGADDDAwAAYAAQxAMAAKwGADDFAwEAAAABxgMBAM0FACHMA0AA2gUAIe8DQADaBQAhAQAAAAEAIBMDAADmBQAgBAAA8wUAIAYAAPAFACAKAADxBQAgCwAA8gUAIBcAANsGACDCAwAA2QYAMMMDAAADABDEAwAA2QYAMMUDAQDNBQAhzANAANoFACHvA0AA2gUAIYcEAQDNBQAhpAQBAM0FACGlBAEAzQUAIaYEAQDNBQAhtQQCAK8GACG2BAIArwYAIbgEAADaBrgEIgYDAAC-BwAgBAAA5woAIAYAAOQKACAKAADlCgAgCwAA5goAIBcAALwLACATAwAA5gUAIAQAAPMFACAGAADwBQAgCgAA8QUAIAsAAPIFACAXAADbBgAgwgMAANkGADDDAwAAAwAQxAMAANkGADDFAwEAAAABzANAANoFACHvA0AA2gUAIYcEAQDNBQAhpAQBAM0FACGlBAEAzQUAIaYEAQDNBQAhtQQCAK8GACG2BAIArwYAIbgEAADaBrgEIgMAAAADACABAAAEADACAAAFACAPBAAA2wUAIAUAAOYFACDCAwAA2AYAMMMDAAAHABDEAwAA2AYAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIe8DQADaBQAh8AMBAM0FACGQBEAA2gUAIZEEAgCvBgAhkgQCAK8GACGTBBAAwwYAIZQEIADuBQAhAgQAAKUHACAFAAC-BwAgEAQAANsFACAFAADmBQAgwgMAANgGADDDAwAABwAQxAMAANgGADDFAwEAAAABxgMBAM0FACHMA0AA2gUAIe8DQADaBQAh8AMBAM0FACGQBEAA2gUAIZEEAgCvBgAhkgQCAK8GACGTBBAAwwYAIZQEIADuBQAhygQAANcGACADAAAABwAgAQAACAAwAgAACQAgDQcAANsFACAIAADmBQAgCQAA5gUAIMIDAADWBgAwwwMAAAsAEMQDAADWBgAwxQMBAM0FACHMA0AA2gUAIesDAQDNBQAh8AMBAM0FACH1A0AAzgUAIfkDAQDNBQAhrwRAAM4FACEFBwAApQcAIAgAAL4HACAJAAC-BwAg9QMAANwGACCvBAAA3AYAIA0HAADbBQAgCAAA5gUAIAkAAOYFACDCAwAA1gYAMMMDAAALABDEAwAA1gYAMMUDAQAAAAHMA0AA2gUAIesDAQDNBQAh8AMBAM0FACH1A0AAzgUAIfkDAQDNBQAhrwRAAM4FACEDAAAACwAgAQAADAAwAgAADQAgDwUAAOYFACAHAADbBQAgwgMAANQGADDDAwAADwAQxAMAANQGADDFAwEAzQUAIcYDAQDNBQAh8AMBAM0FACGOBCAA7gUAIZwEAgCvBgAhnQQCAK8GACGxBAAA1QaxBCKyBEAA2gUAIbMEQADOBQAhtAQIAM4GACEDBQAAvgcAIAcAAKUHACCzBAAA3AYAIBAFAADmBQAgBwAA2wUAIMIDAADUBgAwwwMAAA8AEMQDAADUBgAwxQMBAAAAAcYDAQDNBQAh8AMBAM0FACGOBCAA7gUAIZwEAgCvBgAhnQQCAK8GACGxBAAA1QaxBCKyBEAA2gUAIbMEQADOBQAhtAQIAM4GACHJBAAA0wYAIAMAAAAPACABAAAQADACAAARACAUAwAA5gUAIAcAANsFACAPAADRBgAgEAAA-AUAIBIAANIGACDCAwAAzQYAMMMDAAATABDEAwAAzQYAMMUDAQDNBQAhzANAANoFACHvA0AA2gUAIfADAQDNBQAhhwQBAM0FACGgBAEAzQUAIaEECADOBgAhowQAAM8GowQipAQBAM0FACGlBAEA5QUAIaYEAQDNBQAhqAQAANAGqAQiBgMAAL4HACAHAAClBwAgDwAAwQsAIBAAAOwKACASAADCCwAgpQQAANwGACAUAwAA5gUAIAcAANsFACAPAADRBgAgEAAA-AUAIBIAANIGACDCAwAAzQYAMMMDAAATABDEAwAAzQYAMMUDAQAAAAHMA0AA2gUAIe8DQADaBQAh8AMBAM0FACGHBAEAzQUAIaAEAQDNBQAhoQQIAM4GACGjBAAAzwajBCKkBAEAzQUAIaUEAQDlBQAhpgQBAM0FACGoBAAA0AaoBCIDAAAAEwAgAQAAFAAwAgAAFQAgDwQAAMEGACANAAD6BQAgwgMAAMsGADDDAwAAFwAQxAMAAMsGADDFAwEAzQUAIcwDQADaBQAh2AMBAM0FACGYBAEAzQUAIaAEAQDlBQAhpAQBAM0FACG8BAEA5QUAIb0EAgCvBgAhvwQAAMwGvwQjwAQBAOUFACEGBAAAvQsAIA0AAO4KACCgBAAA3AYAILwEAADcBgAgvwQAANwGACDABAAA3AYAIA8EAADBBgAgDQAA-gUAIMIDAADLBgAwwwMAABcAEMQDAADLBgAwxQMBAAAAAcwDQADaBQAh2AMBAM0FACGYBAEAzQUAIaAEAQDlBQAhpAQBAM0FACG8BAEA5QUAIb0EAgCvBgAhvwQAAMwGvwQjwAQBAOUFACEDAAAAFwAgAQAAGAAwAgAAGQAgCwUAAOYFACAMAADKBgAgwgMAAMkGADDDAwAAGwAQxAMAAMkGADDFAwEAzQUAIcYDAQDNBQAhmQQCAK8GACG5BAEAzQUAIboEIADuBQAhuwQCAK8GACECBQAAvgcAIAwAAMALACAMBQAA5gUAIAwAAMoGACDCAwAAyQYAMMMDAAAbABDEAwAAyQYAMMUDAQAAAAHGAwEAzQUAIZkEAgCvBgAhuQQBAM0FACG6BCAA7gUAIbsEAgCvBgAhyAQAAMgGACADAAAAGwAgAQAAHAAwAgAAHQAgAQAAABsAIBIEAADBBgAgBQAA5gUAIBEAAMcGACDCAwAAxgYAMMMDAAAgABDEAwAAxgYAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIe8DQADaBQAh8AMBAM0FACGQBEAA2gUAIZgEAQDNBQAhmQQQAMMGACGaBBAAwwYAIZsEIADuBQAhnAQCAK8GACGdBAIArwYAIQMEAAC9CwAgBQAAvgcAIBEAAL8LACATBAAAwQYAIAUAAOYFACARAADHBgAgwgMAAMYGADDDAwAAIAAQxAMAAMYGADDFAwEAAAABxgMBAM0FACHMA0AA2gUAIe8DQADaBQAh8AMBAM0FACGQBEAA2gUAIZgEAQDNBQAhmQQQAMMGACGaBBAAwwYAIZsEIADuBQAhnAQCAK8GACGdBAIArwYAIccEAADFBgAgAwAAACAAIAEAACEAMAIAACIAIAkQAADEBgAgwgMAAMIGADDDAwAAJAAQxAMAAMIGADDFAwEAzQUAIcwDQADaBQAhlQQBAM0FACGWBBAAwwYAIZcEAQDlBQAhAhAAAL4LACCXBAAA3AYAIAkQAADEBgAgwgMAAMIGADDDAwAAJAAQxAMAAMIGADDFAwEAAAABzANAANoFACGVBAEAzQUAIZYEEADDBgAhlwQBAOUFACEDAAAAJAAgAQAAJQAwAgAAJgAgAQAAACQAIAcEAADBBgAgwgMAAL8GADDDAwAAKQAQxAMAAL8GADDFAwEAzQUAIZgEAQDNBQAhnwQAAMAGnwQiAQQAAL0LACAIBAAAwQYAIMIDAAC_BgAwwwMAACkAEMQDAAC_BgAwxQMBAAAAAZgEAQDNBQAhnwQAAMAGnwQixgQAAL4GACADAAAAKQAgAQAAKgAwAgAAKwAgAQAAABcAIAEAAAAgACABAAAAKQAgCAcAANsFACAWAADcBQAgwgMAANkFADDDAwAAMAAQxAMAANkFADDFAwEAzQUAIcwDQADaBQAh8AMBAM0FACEBAAAAMAAgDwkAAOYFACAUAAC8BgAgFQAAvQYAIMIDAAC6BgAwwwMAADIAEMQDAAC6BgAwxQMBAM0FACHMA0AA2gUAIdkDAQDlBQAh2wMAALsG7QMi6gMBAM0FACHrAwEAzQUAIe0DIADuBQAh7gNAAM4FACHvA0AA2gUAIQUJAAC-BwAgFAAAuwsAIBUAALwLACDZAwAA3AYAIO4DAADcBgAgDwkAAOYFACAUAAC8BgAgFQAAvQYAIMIDAAC6BgAwwwMAADIAEMQDAAC6BgAwxQMBAAAAAcwDQADaBQAh2QMBAOUFACHbAwAAuwbtAyLqAwEAzQUAIesDAQDNBQAh7QMgAO4FACHuA0AAzgUAIe8DQADaBQAhAwAAADIAIAEAADMAMAIAADQAIAsTAAC5BgAgwgMAALgGADDDAwAANgAQxAMAALgGADDFAwEAzQUAIcwDQADaBQAh5QMBAM0FACHmAwEAzQUAIecDAQDNBQAh6AMBAM0FACHpAwIArwYAIQETAAC6CwAgCxMAALkGACDCAwAAuAYAMMMDAAA2ABDEAwAAuAYAMMUDAQAAAAHMA0AA2gUAIeUDAQDNBQAh5gMBAM0FACHnAwEAzQUAIegDAQDNBQAh6QMCAK8GACEDAAAANgAgAQAANwAwAgAAOAAgAQAAADYAIAEAAAAyACABAAAABwAgAQAAAAsAIAEAAAAPACABAAAAEwAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAALACABAAAMADACAAANACADAAAACwAgAQAADAAwAgAADQAgAwAAAA8AIAEAABAAMAIAABEAIAMAAAATACABAAAUADACAAAVACALCAAA5gUAIB0AAOYFACDCAwAAtgYAMMMDAABFABDEAwAAtgYAMMUDAQDNBQAhzANAANoFACHvA0AA2gUAIfgDAQDNBQAh-QMBAM0FACH7AwAAtwb7AyICCAAAvgcAIB0AAL4HACAMCAAA5gUAIB0AAOYFACDCAwAAtgYAMMMDAABFABDEAwAAtgYAMMUDAQAAAAHMA0AA2gUAIe8DQADaBQAh-AMBAM0FACH5AwEAzQUAIfsDAAC3BvsDIsUEAAC1BgAgAwAAAEUAIAEAAEYAMAIAAEcAIAMAAABFACABAABGADACAABHACADAAAAMgAgAQAAMwAwAgAANAAgDAUAAOYFACAvAACpBgAgwgMAALMGADDDAwAASwAQxAMAALMGADDFAwEAzQUAIcYDAQDNBQAhzANAANoFACHYAwEAzQUAIdkDAQDNBQAh2wMAALQG2wMi3AMgAO4FACECBQAAvgcAIC8AANwGACAMBQAA5gUAIC8AAKkGACDCAwAAswYAMMMDAABLABDEAwAAswYAMMUDAQAAAAHGAwEAzQUAIcwDQADaBQAh2AMBAM0FACHZAwEAzQUAIdsDAAC0BtsDItwDIADuBQAhAwAAAEsAIAEAAEwAMAIAAE0AIAoFAADmBQAgwgMAALIGADDDAwAATwAQxAMAALIGADDFAwEAzQUAIcYDAQDNBQAhzANAANoFACH1A0AA2gUAIfYDAQDNBQAh9wNAAM4FACECBQAAvgcAIPcDAADcBgAgCgUAAOYFACDCAwAAsgYAMMMDAABPABDEAwAAsgYAMMUDAQAAAAHGAwEAzQUAIcwDQADaBQAh9QNAANoFACH2AwEAzQUAIfcDQADOBQAhAwAAAE8AIAEAAFAAMAIAAFEAIA8FAADmBQAgIwAA_AUAIMIDAACxBgAwwwMAAFMAEMQDAACxBgAwxQMBAM0FACHGAwEAzQUAIcwDQADaBQAh9QNAANoFACGBBAEAzQUAIYIEAQDlBQAhgwQBAOUFACGEBAEA5QUAIYUEQADOBQAhhgRAANoFACEGBQAAvgcAICMAAPAKACCCBAAA3AYAIIMEAADcBgAghAQAANwGACCFBAAA3AYAIA8FAADmBQAgIwAA_AUAIMIDAACxBgAwwwMAAFMAEMQDAACxBgAwxQMBAAAAAcYDAQDNBQAhzANAANoFACH1A0AA2gUAIYEEAQAAAAGCBAEA5QUAIYMEAQDlBQAhhAQBAOUFACGFBEAAzgUAIYYEQADaBQAhAwAAAFMAIAEAAFQAMAIAAFUAIA0FAADmBQAgIgAAsAYAIMIDAACuBgAwwwMAAFcAEMQDAACuBgAwxQMBAM0FACHGAwEAzQUAIccDAQDNBQAhyAMBAM0FACHJA0AA2gUAIcoDQADOBQAhywMCAK8GACHMA0AA2gUAIQMFAAC-BwAgIgAAuQsAIMoDAADcBgAgDQUAAOYFACAiAACwBgAgwgMAAK4GADDDAwAAVwAQxAMAAK4GADDFAwEAAAABxgMBAM0FACHHAwEAzQUAIcgDAQDNBQAhyQNAANoFACHKA0AAzgUAIcsDAgCvBgAhzANAANoFACEDAAAAVwAgAQAAWAAwAgAAWQAgAQAAAFcAIAMAAAAgACABAAAhADACAAAiACANBQAA5gUAIMIDAADkBQAwwwMAAF0AEMQDAADkBQAwxQMBAM0FACHGAwEAzQUAIcwDQADaBQAh7wNAANoFACH8AwEA5QUAIf0DAQDlBQAh_gMBAOUFACH_AwEA5QUAIYAEQADOBQAhAQAAAF0AIAMAAAAbACABAAAcADACAAAdACAJBQAA5gUAIBYAAK0GACDCAwAArAYAMMMDAABgABDEAwAArAYAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIe8DQADaBQAhAgUAAL4HACAWAAC4CwAgAwAAAGAAIAEAAGEAMAIAAAEAIAMAAABXACABAABYADACAABZACAJBQAA5gUAIMIDAACrBgAwwwMAAGQAEMQDAACrBgAwxQMBAM0FACHGAwEAzQUAIcwDQADaBQAh9AMBAM0FACH1A0AA2gUAIQEFAAC-BwAgCQUAAOYFACDCAwAAqwYAMMMDAABkABDEAwAAqwYAMMUDAQAAAAHGAwEAzQUAIcwDQADaBQAh9AMBAAAAAfUDQADaBQAhAwAAAGQAIAEAAGUAMAIAAGYAIAEAAAADACABAAAABwAgAQAAAAsAIAEAAAALACABAAAADwAgAQAAABMAIAEAAABFACABAAAARQAgAQAAADIAIAEAAABLACABAAAATwAgAQAAAFMAIAEAAAAgACABAAAAGwAgAQAAAGAAIAEAAABXACABAAAAZAAgCykAAKoGACDCAwAApwYAMMMDAAB5ABDEAwAApwYAMMUDAQDNBQAhzANAANoFACHZAwEA5QUAIbEEAACoBsMEIsEEAQDNBQAhwwQAAKkGACDEBAEA5QUAIQQpAAC3CwAg2QMAANwGACDDBAAA3AYAIMQEAADcBgAgCykAAKoGACDCAwAApwYAMMMDAAB5ABDEAwAApwYAMMUDAQAAAAHMA0AA2gUAIdkDAQDlBQAhsQQAAKgGwwQiwQQBAM0FACHDBAAAqQYAIMQEAQDlBQAhAwAAAHkAIAEAAHoAMAIAAHsAIAEAAAB5ACABAAAAAQAgAwAAAGAAIAEAAGEAMAIAAAEAIAMAAABgACABAABhADACAAABACADAAAAYAAgAQAAYQAwAgAAAQAgBgUAALYLACAWAACXCAAgxQMBAAAAAcYDAQAAAAHMA0AAAAAB7wNAAAAAAQEvAACCAQAgBMUDAQAAAAHGAwEAAAABzANAAAAAAe8DQAAAAAEBLwAAhAEAMAEvAACEAQAwBgUAALULACAWAACICAAgxQMBAOIGACHGAwEA4gYAIcwDQADjBgAh7wNAAOMGACECAAAAAQAgLwAAhwEAIATFAwEA4gYAIcYDAQDiBgAhzANAAOMGACHvA0AA4wYAIQIAAABgACAvAACJAQAgAgAAAGAAIC8AAIkBACADAAAAAQAgNgAAggEAIDcAAIcBACABAAAAAQAgAQAAAGAAIAMOAACyCwAgPAAAtAsAID0AALMLACAHwgMAAKYGADDDAwAAkAEAEMQDAACmBgAwxQMBALEFACHGAwEAsQUAIcwDQACyBQAh7wNAALIFACEDAAAAYAAgAQAAjwEAMDsAAJABACADAAAAYAAgAQAAYQAwAgAAAQAgAQAAAHsAIAEAAAB7ACADAAAAeQAgAQAAegAwAgAAewAgAwAAAHkAIAEAAHoAMAIAAHsAIAMAAAB5ACABAAB6ADACAAB7ACAIKQAAsQsAIMUDAQAAAAHMA0AAAAAB2QMBAAAAAbEEAAAAwwQCwQQBAAAAAcMEgAAAAAHEBAEAAAABAS8AAJgBACAHxQMBAAAAAcwDQAAAAAHZAwEAAAABsQQAAADDBALBBAEAAAABwwSAAAAAAcQEAQAAAAEBLwAAmgEAMAEvAACaAQAwCCkAALALACDFAwEA4gYAIcwDQADjBgAh2QMBAP8GACGxBAAAkwjDBCLBBAEA4gYAIcMEgAAAAAHEBAEA_wYAIQIAAAB7ACAvAACdAQAgB8UDAQDiBgAhzANAAOMGACHZAwEA_wYAIbEEAACTCMMEIsEEAQDiBgAhwwSAAAAAAcQEAQD_BgAhAgAAAHkAIC8AAJ8BACACAAAAeQAgLwAAnwEAIAMAAAB7ACA2AACYAQAgNwAAnQEAIAEAAAB7ACABAAAAeQAgBg4AAK0LACA8AACvCwAgPQAArgsAINkDAADcBgAgwwQAANwGACDEBAAA3AYAIArCAwAAogYAMMMDAACmAQAQxAMAAKIGADDFAwEAsQUAIcwDQACyBQAh2QMBANMFACGxBAAAowbDBCLBBAEAsQUAIcMEAADCBQAgxAQBANMFACEDAAAAeQAgAQAApQEAMDsAAKYBACADAAAAeQAgAQAAegAwAgAAewAgAQAAABkAIAEAAAAZACADAAAAFwAgAQAAGAAwAgAAGQAgAwAAABcAIAEAABgAMAIAABkAIAMAAAAXACABAAAYADACAAAZACAMBAAArAsAIA0AAM0JACDFAwEAAAABzANAAAAAAdgDAQAAAAGYBAEAAAABoAQBAAAAAaQEAQAAAAG8BAEAAAABvQQCAAAAAb8EAAAAvwQDwAQBAAAAAQEvAACuAQAgCsUDAQAAAAHMA0AAAAAB2AMBAAAAAZgEAQAAAAGgBAEAAAABpAQBAAAAAbwEAQAAAAG9BAIAAAABvwQAAAC_BAPABAEAAAABAS8AALABADABLwAAsAEAMAwEAACrCwAgDQAAwAkAIMUDAQDiBgAhzANAAOMGACHYAwEA4gYAIZgEAQDiBgAhoAQBAP8GACGkBAEA4gYAIbwEAQD_BgAhvQQCAOUGACG_BAAAvgm_BCPABAEA_wYAIQIAAAAZACAvAACzAQAgCsUDAQDiBgAhzANAAOMGACHYAwEA4gYAIZgEAQDiBgAhoAQBAP8GACGkBAEA4gYAIbwEAQD_BgAhvQQCAOUGACG_BAAAvgm_BCPABAEA_wYAIQIAAAAXACAvAAC1AQAgAgAAABcAIC8AALUBACADAAAAGQAgNgAArgEAIDcAALMBACABAAAAGQAgAQAAABcAIAkOAACmCwAgPAAAqQsAID0AAKgLACBeAACnCwAgXwAAqgsAIKAEAADcBgAgvAQAANwGACC_BAAA3AYAIMAEAADcBgAgDcIDAACeBgAwwwMAALwBABDEAwAAngYAMMUDAQCxBQAhzANAALIFACHYAwEAsQUAIZgEAQCxBQAhoAQBANMFACGkBAEAsQUAIbwEAQDTBQAhvQQCALQFACG_BAAAnwa_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_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_BgAhpgQBAOIGACGoBAAAlgmoBCICAAAAFQAgLwAAugIAIAzFAwEA4gYAIcwDQADjBgAh7wNAAOMGACHwAwEA4gYAIYcEAQDiBgAhoAQBAOIGACGhBAgAlAkAIaMEAACVCaMEIqQEAQDiBgAhpQQBAP8GACGmBAEA4gYAIagEAACWCagEIgIAAAATACAvAAC8AgAgAgAAABMAIC8AALwCACADAAAAFQAgNgAAtQIAIDcAALoCACABAAAAFQAgAQAAABMAIAYOAACICwAgPAAAiwsAID0AAIoLACBeAACJCwAgXwAAjAsAIKUEAADcBgAgD8IDAACIBgAwwwMAAMMCABDEAwAAiAYAMMUDAQCxBQAhzANAALIFACHvA0AAsgUAIfADAQCxBQAhhwQBALEFACGgBAEAsQUAIaEECACJBgAhowQAAIoGowQipAQBALEFACGlBAEA0wUAIaYEAQCxBQAhqAQAAIsGqAQiAwAAABMAIAEAAMICADA7AADDAgAgAwAAABMAIAEAABQAMAIAABUAIAEAAAArACABAAAAKwAgAwAAACkAIAEAACoAMAIAACsAIAMAAAApACABAAAqADACAAArACADAAAAKQAgAQAAKgAwAgAAKwAgBAQAAIcLACDFAwEAAAABmAQBAAAAAZ8EAAAAnwQCAS8AAMsCACADxQMBAAAAAZgEAQAAAAGfBAAAAJ8EAgEvAADNAgAwAS8AAM0CADAEBAAAhgsAIMUDAQDiBgAhmAQBAOIGACGfBAAApgmfBCICAAAAKwAgLwAA0AIAIAPFAwEA4gYAIZgEAQDiBgAhnwQAAKYJnwQiAgAAACkAIC8AANICACACAAAAKQAgLwAA0gIAIAMAAAArACA2AADLAgAgNwAA0AIAIAEAAAArACABAAAAKQAgAw4AAIMLACA8AACFCwAgPQAAhAsAIAbCAwAAhAYAMMMDAADZAgAQxAMAAIQGADDFAwEAsQUAIZgEAQCxBQAhnwQAAIUGnwQiAwAAACkAIAEAANgCADA7AADZAgAgAwAAACkAIAEAACoAMAIAACsAIAEAAAAiACABAAAAIgAgAwAAACAAIAEAACEAMAIAACIAIAMAAAAgACABAAAhADACAAAiACADAAAAIAAgAQAAIQAwAgAAIgAgDwQAAMYIACAFAACzCQAgEQAAxwgAIMUDAQAAAAHGAwEAAAABzANAAAAAAe8DQAAAAAHwAwEAAAABkARAAAAAAZgEAQAAAAGZBBAAAAABmgQQAAAAAZsEIAAAAAGcBAIAAAABnQQCAAAAAQEvAADhAgAgDMUDAQAAAAHGAwEAAAABzANAAAAAAe8DQAAAAAHwAwEAAAABkARAAAAAAZgEAQAAAAGZBBAAAAABmgQQAAAAAZsEIAAAAAGcBAIAAAABnQQCAAAAAQEvAADjAgAwAS8AAOMCADAPBAAAtwgAIAUAALEJACARAAC4CAAgxQMBAOIGACHGAwEA4gYAIcwDQADjBgAh7wNAAOMGACHwAwEA4gYAIZAEQADjBgAhmAQBAOIGACGZBBAAtQgAIZoEEAC1CAAhmwQgAO4GACGcBAIA5QYAIZ0EAgDlBgAhAgAAACIAIC8AAOYCACAMxQMBAOIGACHGAwEA4gYAIcwDQADjBgAh7wNAAOMGACHwAwEA4gYAIZAEQADjBgAhmAQBAOIGACGZBBAAtQgAIZoEEAC1CAAhmwQgAO4GACGcBAIA5QYAIZ0EAgDlBgAhAgAAACAAIC8AAOgCACACAAAAIAAgLwAA6AIAIAMAAAAiACA2AADhAgAgNwAA5gIAIAEAAAAiACABAAAAIAAgBQ4AAP4KACA8AACBCwAgPQAAgAsAIF4AAP8KACBfAACCCwAgD8IDAACDBgAwwwMAAO8CABDEAwAAgwYAMMUDAQCxBQAhxgMBALEFACHMA0AAsgUAIe8DQACyBQAh8AMBALEFACGQBEAAsgUAIZgEAQCxBQAhmQQQAP8FACGaBBAA_wUAIZsEIADBBQAhnAQCALQFACGdBAIAtAUAIQMAAAAgACABAADuAgAwOwAA7wIAIAMAAAAgACABAAAhADACAAAiACABAAAAJgAgAQAAACYAIAMAAAAkACABAAAlADACAAAmACADAAAAJAAgAQAAJQAwAgAAJgAgAwAAACQAIAEAACUAMAIAACYAIAYQAAD9CgAgxQMBAAAAAcwDQAAAAAGVBAEAAAABlgQQAAAAAZcEAQAAAAEBLwAA9wIAIAXFAwEAAAABzANAAAAAAZUEAQAAAAGWBBAAAAABlwQBAAAAAQEvAAD5AgAwAS8AAPkCADAGEAAA_AoAIMUDAQDiBgAhzANAAOMGACGVBAEA4gYAIZYEEAC1CAAhlwQBAP8GACECAAAAJgAgLwAA_AIAIAXFAwEA4gYAIcwDQADjBgAhlQQBAOIGACGWBBAAtQgAIZcEAQD_BgAhAgAAACQAIC8AAP4CACACAAAAJAAgLwAA_gIAIAMAAAAmACA2AAD3AgAgNwAA_AIAIAEAAAAmACABAAAAJAAgBg4AAPcKACA8AAD6CgAgPQAA-QoAIF4AAPgKACBfAAD7CgAglwQAANwGACAIwgMAAIIGADDDAwAAhQMAEMQDAACCBgAwxQMBALEFACHMA0AAsgUAIZUEAQCxBQAhlgQQAP8FACGXBAEA0wUAIQMAAAAkACABAACEAwAwOwAAhQMAIAMAAAAkACABAAAlADACAAAmACABAAAACQAgAQAAAAkAIAMAAAAHACABAAAIADACAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAwEAACKCgAgBQAAygoAIMUDAQAAAAHGAwEAAAABzANAAAAAAe8DQAAAAAHwAwEAAAABkARAAAAAAZEEAgAAAAGSBAIAAAABkwQQAAAAAZQEIAAAAAEBLwAAjQMAIArFAwEAAAABxgMBAAAAAcwDQAAAAAHvA0AAAAAB8AMBAAAAAZAEQAAAAAGRBAIAAAABkgQCAAAAAZMEEAAAAAGUBCAAAAABAS8AAI8DADABLwAAjwMAMAwEAACICgAgBQAAyAoAIMUDAQDiBgAhxgMBAOIGACHMA0AA4wYAIe8DQADjBgAh8AMBAOIGACGQBEAA4wYAIZEEAgDlBgAhkgQCAOUGACGTBBAAtQgAIZQEIADuBgAhAgAAAAkAIC8AAJIDACAKxQMBAOIGACHGAwEA4gYAIcwDQADjBgAh7wNAAOMGACHwAwEA4gYAIZAEQADjBgAhkQQCAOUGACGSBAIA5QYAIZMEEAC1CAAhlAQgAO4GACECAAAABwAgLwAAlAMAIAIAAAAHACAvAACUAwAgAwAAAAkAIDYAAI0DACA3AACSAwAgAQAAAAkAIAEAAAAHACAFDgAA8goAIDwAAPUKACA9AAD0CgAgXgAA8woAIF8AAPYKACANwgMAAP4FADDDAwAAmwMAEMQDAAD-BQAwxQMBALEFACHGAwEAsQUAIcwDQACyBQAh7wNAALIFACHwAwEAsQUAIZAEQACyBQAhkQQCALQFACGSBAIAtAUAIZMEEAD_BQAhlAQgAMEFACEDAAAABwAgAQAAmgMAMDsAAJsDACADAAAABwAgAQAACAAwAgAACQAgIAcAAPIFACAQAAD4BQAgFgAA3AUAIBgAAO8FACAZAADwBQAgGgAA8QUAIBsAAPEFACAcAADzBQAgHgAA9AUAIB8AAPQFACAgAAD1BQAgIQAA9gUAICMAAPwFACAkAAD3BQAgJQAA-QUAICYAAPoFACAnAAD7BQAgKAAA_QUAIMIDAADsBQAwwwMAAKEDABDEAwAA7AUAMMUDAQAAAAHMA0AA2gUAIe8DQADaBQAhhwQBAOUFACGIBAEAAAABiQQBAAAAAYoEAQDlBQAhiwQBAOUFACGNBAAA7QWNBCKOBCAA7gUAIY8EAQAAAAEBAAAAngMAIAEAAACeAwAgIAcAAPIFACAQAAD4BQAgFgAA3AUAIBgAAO8FACAZAADwBQAgGgAA8QUAIBsAAPEFACAcAADzBQAgHgAA9AUAIB8AAPQFACAgAAD1BQAgIQAA9gUAICMAAPwFACAkAAD3BQAgJQAA-QUAICYAAPoFACAnAAD7BQAgKAAA_QUAIMIDAADsBQAwwwMAAKEDABDEAwAA7AUAMMUDAQDNBQAhzANAANoFACHvA0AA2gUAIYcEAQDlBQAhiAQBAOUFACGJBAEA5QUAIYoEAQDlBQAhiwQBAOUFACGNBAAA7QWNBCKOBCAA7gUAIY8EAQDlBQAhGAcAAOYKACAQAADsCgAgFgAApgcAIBgAAOMKACAZAADkCgAgGgAA5QoAIBsAAOUKACAcAADnCgAgHgAA6AoAIB8AAOgKACAgAADpCgAgIQAA6goAICMAAPAKACAkAADrCgAgJQAA7QoAICYAAO4KACAnAADvCgAgKAAA8QoAIIcEAADcBgAgiAQAANwGACCJBAAA3AYAIIoEAADcBgAgiwQAANwGACCPBAAA3AYAIAMAAAChAwAgAQAAogMAMAIAAJ4DACADAAAAoQMAIAEAAKIDADACAACeAwAgAwAAAKEDACABAACiAwAwAgAAngMAIB0HAADVCgAgEAAA3QoAIBYAANkKACAYAADRCgAgGQAA0goAIBoAANMKACAbAADUCgAgHAAA1goAIB4AANcKACAfAADYCgAgIAAA2goAICEAANsKACAjAADhCgAgJAAA3AoAICUAAN4KACAmAADfCgAgJwAA4AoAICgAAOIKACDFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAAAABiwQBAAAAAY0EAAAAjQQCjgQgAAAAAY8EAQAAAAEBLwAApgMAIAvFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAAAABiwQBAAAAAY0EAAAAjQQCjgQgAAAAAY8EAQAAAAEBLwAAqAMAMAEvAACoAwAwHQcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAkAADhBwAgJQAA4wcAICYAAOQHACAnAADlBwAgKAAA5wcAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhAgAAAJ4DACAvAACrAwAgC8UDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhAgAAAKEDACAvAACtAwAgAgAAAKEDACAvAACtAwAgAwAAAJ4DACA2AACmAwAgNwAAqwMAIAEAAACeAwAgAQAAAKEDACAJDgAA0gcAIDwAANQHACA9AADTBwAghwQAANwGACCIBAAA3AYAIIkEAADcBgAgigQAANwGACCLBAAA3AYAII8EAADcBgAgDsIDAADoBQAwwwMAALQDABDEAwAA6AUAMMUDAQCxBQAhzANAALIFACHvA0AAsgUAIYcEAQDTBQAhiAQBANMFACGJBAEA0wUAIYoEAQDTBQAhiwQBANMFACGNBAAA6QWNBCKOBCAAwQUAIY8EAQDTBQAhAwAAAKEDACABAACzAwAwOwAAtAMAIAMAAAChAwAgAQAAogMAMAIAAJ4DACABAAAAVQAgAQAAAFUAIAMAAABTACABAABUADACAABVACADAAAAUwAgAQAAVAAwAgAAVQAgAwAAAFMAIAEAAFQAMAIAAFUAIAwFAADQBwAgIwAA0QcAIMUDAQAAAAHGAwEAAAABzANAAAAAAfUDQAAAAAGBBAEAAAABggQBAAAAAYMEAQAAAAGEBAEAAAABhQRAAAAAAYYEQAAAAAEBLwAAvAMAIArFAwEAAAABxgMBAAAAAcwDQAAAAAH1A0AAAAABgQQBAAAAAYIEAQAAAAGDBAEAAAABhAQBAAAAAYUEQAAAAAGGBEAAAAABAS8AAL4DADABLwAAvgMAMAwFAADCBwAgIwAAwwcAIMUDAQDiBgAhxgMBAOIGACHMA0AA4wYAIfUDQADjBgAhgQQBAOIGACGCBAEA_wYAIYMEAQD_BgAhhAQBAP8GACGFBEAA5AYAIYYEQADjBgAhAgAAAFUAIC8AAMEDACAKxQMBAOIGACHGAwEA4gYAIcwDQADjBgAh9QNAAOMGACGBBAEA4gYAIYIEAQD_BgAhgwQBAP8GACGEBAEA_wYAIYUEQADkBgAhhgRAAOMGACECAAAAUwAgLwAAwwMAIAIAAABTACAvAADDAwAgAwAAAFUAIDYAALwDACA3AADBAwAgAQAAAFUAIAEAAABTACAHDgAAvwcAIDwAAMEHACA9AADABwAgggQAANwGACCDBAAA3AYAIIQEAADcBgAghQQAANwGACANwgMAAOcFADDDAwAAygMAEMQDAADnBQAwxQMBALEFACHGAwEAsQUAIcwDQACyBQAh9QNAALIFACGBBAEAsQUAIYIEAQDTBQAhgwQBANMFACGEBAEA0wUAIYUEQACzBQAhhgRAALIFACEDAAAAUwAgAQAAyQMAMDsAAMoDACADAAAAUwAgAQAAVAAwAgAAVQAgDQUAAOYFACDCAwAA5AUAMMMDAABdABDEAwAA5AUAMMUDAQAAAAHGAwEAAAABzANAANoFACHvA0AA2gUAIfwDAQDlBQAh_QMBAOUFACH-AwEA5QUAIf8DAQDlBQAhgARAAM4FACEBAAAAzQMAIAEAAADNAwAgBgUAAL4HACD8AwAA3AYAIP0DAADcBgAg_gMAANwGACD_AwAA3AYAIIAEAADcBgAgAwAAAF0AIAEAANADADACAADNAwAgAwAAAF0AIAEAANADADACAADNAwAgAwAAAF0AIAEAANADADACAADNAwAgCgUAAL0HACDFAwEAAAABxgMBAAAAAcwDQAAAAAHvA0AAAAAB_AMBAAAAAf0DAQAAAAH-AwEAAAAB_wMBAAAAAYAEQAAAAAEBLwAA1AMAIAnFAwEAAAABxgMBAAAAAcwDQAAAAAHvA0AAAAAB_AMBAAAAAf0DAQAAAAH-AwEAAAAB_wMBAAAAAYAEQAAAAAEBLwAA1gMAMAEvAADWAwAwCgUAALwHACDFAwEA4gYAIcYDAQDiBgAhzANAAOMGACHvA0AA4wYAIfwDAQD_BgAh_QMBAP8GACH-AwEA_wYAIf8DAQD_BgAhgARAAOQGACECAAAAzQMAIC8AANkDACAJxQMBAOIGACHGAwEA4gYAIcwDQADjBgAh7wNAAOMGACH8AwEA_wYAIf0DAQD_BgAh_gMBAP8GACH_AwEA_wYAIYAEQADkBgAhAgAAAF0AIC8AANsDACACAAAAXQAgLwAA2wMAIAMAAADNAwAgNgAA1AMAIDcAANkDACABAAAAzQMAIAEAAABdACAIDgAAuQcAIDwAALsHACA9AAC6BwAg_AMAANwGACD9AwAA3AYAIP4DAADcBgAg_wMAANwGACCABAAA3AYAIAzCAwAA4wUAMMMDAADiAwAQxAMAAOMFADDFAwEAsQUAIcYDAQCxBQAhzANAALIFACHvA0AAsgUAIfwDAQDTBQAh_QMBANMFACH-AwEA0wUAIf8DAQDTBQAhgARAALMFACEDAAAAXQAgAQAA4QMAMDsAAOIDACADAAAAXQAgAQAA0AMAMAIAAM0DACABAAAARwAgAQAAAEcAIAMAAABFACABAABGADACAABHACADAAAARQAgAQAARgAwAgAARwAgAwAAAEUAIAEAAEYAMAIAAEcAIAgIAAC3BwAgHQAAuAcAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAfgDAQAAAAH5AwEAAAAB-wMAAAD7AwIBLwAA6gMAIAbFAwEAAAABzANAAAAAAe8DQAAAAAH4AwEAAAAB-QMBAAAAAfsDAAAA-wMCAS8AAOwDADABLwAA7AMAMAgIAAC1BwAgHQAAtgcAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIfgDAQDiBgAh-QMBAOIGACH7AwAAtAf7AyICAAAARwAgLwAA7wMAIAbFAwEA4gYAIcwDQADjBgAh7wNAAOMGACH4AwEA4gYAIfkDAQDiBgAh-wMAALQH-wMiAgAAAEUAIC8AAPEDACACAAAARQAgLwAA8QMAIAMAAABHACA2AADqAwAgNwAA7wMAIAEAAABHACABAAAARQAgAw4AALEHACA8AACzBwAgPQAAsgcAIAnCAwAA3wUAMMMDAAD4AwAQxAMAAN8FADDFAwEAsQUAIcwDQACyBQAh7wNAALIFACH4AwEAsQUAIfkDAQCxBQAh-wMAAOAF-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_gbtAyLqAwEA4gYAIesDAQDiBgAh7QMgAO4GACHuA0AA5AYAIe8DQADjBgAhAgAAADQAIC8AAMkEACAJxQMBAOIGACHMA0AA4wYAIdkDAQD_BgAh2wMAAP4G7QMi6gMBAOIGACHrAwEA4gYAIe0DIADuBgAh7gNAAOQGACHvA0AA4wYAIQIAAAAyACAvAADLBAAgAgAAADIAIC8AAMsEACADAAAANAAgNgAAxAQAIDcAAMkEACABAAAANAAgAQAAADIAIAUOAAD7BgAgPAAA_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_BQAwwwMAAJcFABDEAwAAvwUAMMUDAQCxBQAhxgMBALEFACHMA0AAsgUAIdgDAQCxBQAh2QMBALEFACHbAwAAwAXbAyLcAyAAwQUAIQMAAABLACABAACWBQAwOwAAlwUAIAMAAABLACABAABMADACAABNACABAAAAWQAgAQAAAFkAIAMAAABXACABAABYADACAABZACADAAAAVwAgAQAAWAAwAgAAWQAgAwAAAFcAIAEAAFgAMAIAAFkAIAoFAADoBgAgIgAA6QYAIMUDAQAAAAHGAwEAAAABxwMBAAAAAcgDAQAAAAHJA0AAAAABygNAAAAAAcsDAgAAAAHMA0AAAAABAS8AAJ8FACAIxQMBAAAAAcYDAQAAAAHHAwEAAAAByAMBAAAAAckDQAAAAAHKA0AAAAABywMCAAAAAcwDQAAAAAEBLwAAoQUAMAEvAAChBQAwCgUAAOYGACAiAADnBgAgxQMBAOIGACHGAwEA4gYAIccDAQDiBgAhyAMBAOIGACHJA0AA4wYAIcoDQADkBgAhywMCAOUGACHMA0AA4wYAIQIAAABZACAvAACkBQAgCMUDAQDiBgAhxgMBAOIGACHHAwEA4gYAIcgDAQDiBgAhyQNAAOMGACHKA0AA5AYAIcsDAgDlBgAhzANAAOMGACECAAAAVwAgLwAApgUAIAIAAABXACAvAACmBQAgAwAAAFkAIDYAAJ8FACA3AACkBQAgAQAAAFkAIAEAAABXACAGDgAA3QYAIDwAAOAGACA9AADfBgAgXgAA3gYAIF8AAOEGACDKAwAA3AYAIAvCAwAAsAUAMMMDAACtBQAQxAMAALAFADDFAwEAsQUAIcYDAQCxBQAhxwMBALEFACHIAwEAsQUAIckDQACyBQAhygNAALMFACHLAwIAtAUAIcwDQACyBQAhAwAAAFcAIAEAAKwFADA7AACtBQAgAwAAAFcAIAEAAFgAMAIAAFkAIAvCAwAAsAUAMMMDAACtBQAQxAMAALAFADDFAwEAsQUAIcYDAQCxBQAhxwMBALEFACHIAwEAsQUAIckDQACyBQAhygNAALMFACHLAwIAtAUAIcwDQACyBQAhDg4AALYFACA8AAC-BQAgPQAAvgUAIM0DAQAAAAHOAwEAAAAEzwMBAAAABNADAQAAAAHRAwEAAAAB0gMBAAAAAdMDAQAAAAHUAwEAvQUAIdUDAQAAAAHWAwEAAAAB1wMBAAAAAQsOAAC2BQAgPAAAvAUAID0AALwFACDNA0AAAAABzgNAAAAABM8DQAAAAATQA0AAAAAB0QNAAAAAAdIDQAAAAAHTA0AAAAAB1ANAALsFACELDgAAuQUAIDwAALoFACA9AAC6BQAgzQNAAAAAAc4DQAAAAAXPA0AAAAAF0ANAAAAAAdEDQAAAAAHSA0AAAAAB0wNAAAAAAdQDQAC4BQAhDQ4AALYFACA8AAC2BQAgPQAAtgUAIF4AALcFACBfAAC2BQAgzQMCAAAAAc4DAgAAAATPAwIAAAAE0AMCAAAAAdEDAgAAAAHSAwIAAAAB0wMCAAAAAdQDAgC1BQAhDQ4AALYFACA8AAC2BQAgPQAAtgUAIF4AALcFACBfAAC2BQAgzQMCAAAAAc4DAgAAAATPAwIAAAAE0AMCAAAAAdEDAgAAAAHSAwIAAAAB0wMCAAAAAdQDAgC1BQAhCM0DAgAAAAHOAwIAAAAEzwMCAAAABNADAgAAAAHRAwIAAAAB0gMCAAAAAdMDAgAAAAHUAwIAtgUAIQjNAwgAAAABzgMIAAAABM8DCAAAAATQAwgAAAAB0QMIAAAAAdIDCAAAAAHTAwgAAAAB1AMIALcFACELDgAAuQUAIDwAALoFACA9AAC6BQAgzQNAAAAAAc4DQAAAAAXPA0AAAAAF0ANAAAAAAdEDQAAAAAHSA0AAAAAB0wNAAAAAAdQDQAC4BQAhCM0DAgAAAAHOAwIAAAAFzwMCAAAABdADAgAAAAHRAwIAAAAB0gMCAAAAAdMDAgAAAAHUAwIAuQUAIQjNA0AAAAABzgNAAAAABc8DQAAAAAXQA0AAAAAB0QNAAAAAAdIDQAAAAAHTA0AAAAAB1ANAALoFACELDgAAtgUAIDwAALwFACA9AAC8BQAgzQNAAAAAAc4DQAAAAATPA0AAAAAE0ANAAAAAAdEDQAAAAAHSA0AAAAAB0wNAAAAAAdQDQAC7BQAhCM0DQAAAAAHOA0AAAAAEzwNAAAAABNADQAAAAAHRA0AAAAAB0gNAAAAAAdMDQAAAAAHUA0AAvAUAIQ4OAAC2BQAgPAAAvgUAID0AAL4FACDNAwEAAAABzgMBAAAABM8DAQAAAATQAwEAAAAB0QMBAAAAAdIDAQAAAAHTAwEAAAAB1AMBAL0FACHVAwEAAAAB1gMBAAAAAdcDAQAAAAELzQMBAAAAAc4DAQAAAATPAwEAAAAE0AMBAAAAAdEDAQAAAAHSAwEAAAAB0wMBAAAAAdQDAQC-BQAh1QMBAAAAAdYDAQAAAAHXAwEAAAABCy8AAMIFACDCAwAAvwUAMMMDAACXBQAQxAMAAL8FADDFAwEAsQUAIcYDAQCxBQAhzANAALIFACHYAwEAsQUAIdkDAQCxBQAh2wMAAMAF2wMi3AMgAMEFACEHDgAAtgUAIDwAAMcFACA9AADHBQAgzQMAAADbAwLOAwAAANsDCM8DAAAA2wMI1AMAAMYF2wMiBQ4AALYFACA8AADFBQAgPQAAxQUAIM0DIAAAAAHUAyAAxAUAIQ8OAAC5BQAgPAAAwwUAID0AAMMFACDNA4AAAAAB0AOAAAAAAdEDgAAAAAHSA4AAAAAB0wOAAAAAAdQDgAAAAAHdAwEAAAAB3gMBAAAAAd8DAQAAAAHgA4AAAAAB4QOAAAAAAeIDgAAAAAEMzQOAAAAAAdADgAAAAAHRA4AAAAAB0gOAAAAAAdMDgAAAAAHUA4AAAAAB3QMBAAAAAd4DAQAAAAHfAwEAAAAB4AOAAAAAAeEDgAAAAAHiA4AAAAABBQ4AALYFACA8AADFBQAgPQAAxQUAIM0DIAAAAAHUAyAAxAUAIQLNAyAAAAAB1AMgAMUFACEHDgAAtgUAIDwAAMcFACA9AADHBQAgzQMAAADbAwLOAwAAANsDCM8DAAAA2wMI1AMAAMYF2wMiBM0DAAAA2wMCzgMAAADbAwjPAwAAANsDCNQDAADHBdsDIgfCAwAAyAUAMMMDAACBBQAQxAMAAMgFADDFAwEAyQUAIdkDAQCxBQAh4wMBALEFACHkA0AAswUAIQsOAAC2BQAgPAAAvgUAID0AAL4FACDNAwEAAAABzgMBAAAABM8DAQAAAATQAwEAAAAB0QMBAAAAAdIDAQAAAAHTAwEAAAAB1AMBAMoFACELDgAAtgUAIDwAAL4FACA9AAC-BQAgzQMBAAAAAc4DAQAAAATPAwEAAAAE0AMBAAAAAdEDAQAAAAHSAwEAAAAB0wMBAAAAAdQDAQDKBQAhB8IDAADLBQAwwwMAAO4EABDEAwAAywUAMMUDAQDMBQAh2QMBAM0FACHjAwEAzQUAIeQDQADOBQAhCM0DAQAAAAHOAwEAAAAEzwMBAAAABNADAQAAAAHRAwEAAAAB0gMBAAAAAdMDAQAAAAHUAwEAzwUAIQvNAwEAAAABzgMBAAAABM8DAQAAAATQAwEAAAAB0QMBAAAAAdIDAQAAAAHTAwEAAAAB1AMBAL4FACHVAwEAAAAB1gMBAAAAAdcDAQAAAAEIzQNAAAAAAc4DQAAAAAXPA0AAAAAF0ANAAAAAAdEDQAAAAAHSA0AAAAAB0wNAAAAAAdQDQAC6BQAhCM0DAQAAAAHOAwEAAAAEzwMBAAAABNADAQAAAAHRAwEAAAAB0gMBAAAAAdMDAQAAAAHUAwEAzwUAIQrCAwAA0AUAMMMDAADoBAAQxAMAANAFADDFAwEAsQUAIcwDQACyBQAh5QMBALEFACHmAwEAsQUAIecDAQCxBQAh6AMBALEFACHpAwIAtAUAIQzCAwAA0QUAMMMDAADSBAAQxAMAANEFADDFAwEAsQUAIcwDQACyBQAh2QMBANMFACHbAwAA0gXtAyLqAwEAsQUAIesDAQCxBQAh7QMgAMEFACHuA0AAswUAIe8DQACyBQAhBw4AALYFACA8AADXBQAgPQAA1wUAIM0DAAAA7QMCzgMAAADtAwjPAwAAAO0DCNQDAADWBe0DIg4OAAC5BQAgPAAA1QUAID0AANUFACDNAwEAAAABzgMBAAAABc8DAQAAAAXQAwEAAAAB0QMBAAAAAdIDAQAAAAHTAwEAAAAB1AMBANQFACHVAwEAAAAB1gMBAAAAAdcDAQAAAAEODgAAuQUAIDwAANUFACA9AADVBQAgzQMBAAAAAc4DAQAAAAXPAwEAAAAF0AMBAAAAAdEDAQAAAAHSAwEAAAAB0wMBAAAAAdQDAQDUBQAh1QMBAAAAAdYDAQAAAAHXAwEAAAABC80DAQAAAAHOAwEAAAAFzwMBAAAABdADAQAAAAHRAwEAAAAB0gMBAAAAAdMDAQAAAAHUAwEA1QUAIdUDAQAAAAHWAwEAAAAB1wMBAAAAAQcOAAC2BQAgPAAA1wUAID0AANcFACDNAwAAAO0DAs4DAAAA7QMIzwMAAADtAwjUAwAA1gXtAyIEzQMAAADtAwLOAwAAAO0DCM8DAAAA7QMI1AMAANcF7QMiBsIDAADYBQAwwwMAALwEABDEAwAA2AUAMMUDAQCxBQAhzANAALIFACHwAwEAsQUAIQgHAADbBQAgFgAA3AUAIMIDAADZBQAwwwMAADAAEMQDAADZBQAwxQMBAM0FACHMA0AA2gUAIfADAQDNBQAhCM0DQAAAAAHOA0AAAAAEzwNAAAAABNADQAAAAAHRA0AAAAAB0gNAAAAAAdMDQAAAAAHUA0AAvAUAIRUDAADmBQAgBAAA8wUAIAYAAPAFACAKAADxBQAgCwAA8gUAIBcAANsGACDCAwAA2QYAMMMDAAADABDEAwAA2QYAMMUDAQDNBQAhzANAANoFACHvA0AA2gUAIYcEAQDNBQAhpAQBAM0FACGlBAEAzQUAIaYEAQDNBQAhtQQCAK8GACG2BAIArwYAIbgEAADaBrgEIssEAAADACDMBAAAAwAgA_EDAAAyACDyAwAAMgAg8wMAADIAIAjCAwAA3QUAMMMDAACkBAAQxAMAAN0FADDFAwEAsQUAIcYDAQCxBQAhzANAALIFACH0AwEAsQUAIfUDQACyBQAhCcIDAADeBQAwwwMAAI4EABDEAwAA3gUAMMUDAQCxBQAhxgMBALEFACHMA0AAsgUAIfUDQACyBQAh9gMBALEFACH3A0AAswUAIQnCAwAA3wUAMMMDAAD4AwAQxAMAAN8FADDFAwEAsQUAIcwDQACyBQAh7wNAALIFACH4AwEAsQUAIfkDAQCxBQAh-wMAAOAF-wMiBw4AALYFACA8AADiBQAgPQAA4gUAIM0DAAAA-wMCzgMAAAD7AwjPAwAAAPsDCNQDAADhBfsDIgcOAAC2BQAgPAAA4gUAID0AAOIFACDNAwAAAPsDAs4DAAAA-wMIzwMAAAD7AwjUAwAA4QX7AyIEzQMAAAD7AwLOAwAAAPsDCM8DAAAA-wMI1AMAAOIF-wMiDMIDAADjBQAwwwMAAOIDABDEAwAA4wUAMMUDAQCxBQAhxgMBALEFACHMA0AAsgUAIe8DQACyBQAh_AMBANMFACH9AwEA0wUAIf4DAQDTBQAh_wMBANMFACGABEAAswUAIQ0FAADmBQAgwgMAAOQFADDDAwAAXQAQxAMAAOQFADDFAwEAzQUAIcYDAQDNBQAhzANAANoFACHvA0AA2gUAIfwDAQDlBQAh_QMBAOUFACH-AwEA5QUAIf8DAQDlBQAhgARAAM4FACELzQMBAAAAAc4DAQAAAAXPAwEAAAAF0AMBAAAAAdEDAQAAAAHSAwEAAAAB0wMBAAAAAdQDAQDVBQAh1QMBAAAAAdYDAQAAAAHXAwEAAAABIgcAAPIFACAQAAD4BQAgFgAA3AUAIBgAAO8FACAZAADwBQAgGgAA8QUAIBsAAPEFACAcAADzBQAgHgAA9AUAIB8AAPQFACAgAAD1BQAgIQAA9gUAICMAAPwFACAkAAD3BQAgJQAA-QUAICYAAPoFACAnAAD7BQAgKAAA_QUAIMIDAADsBQAwwwMAAKEDABDEAwAA7AUAMMUDAQDNBQAhzANAANoFACHvA0AA2gUAIYcEAQDlBQAhiAQBAOUFACGJBAEA5QUAIYoEAQDlBQAhiwQBAOUFACGNBAAA7QWNBCKOBCAA7gUAIY8EAQDlBQAhywQAAKEDACDMBAAAoQMAIA3CAwAA5wUAMMMDAADKAwAQxAMAAOcFADDFAwEAsQUAIcYDAQCxBQAhzANAALIFACH1A0AAsgUAIYEEAQCxBQAhggQBANMFACGDBAEA0wUAIYQEAQDTBQAhhQRAALMFACGGBEAAsgUAIQ7CAwAA6AUAMMMDAAC0AwAQxAMAAOgFADDFAwEAsQUAIcwDQACyBQAh7wNAALIFACGHBAEA0wUAIYgEAQDTBQAhiQQBANMFACGKBAEA0wUAIYsEAQDTBQAhjQQAAOkFjQQijgQgAMEFACGPBAEA0wUAIQcOAAC2BQAgPAAA6wUAID0AAOsFACDNAwAAAI0EAs4DAAAAjQQIzwMAAACNBAjUAwAA6gWNBCIHDgAAtgUAIDwAAOsFACA9AADrBQAgzQMAAACNBALOAwAAAI0ECM8DAAAAjQQI1AMAAOoFjQQiBM0DAAAAjQQCzgMAAACNBAjPAwAAAI0ECNQDAADrBY0EIiAHAADyBQAgEAAA-AUAIBYAANwFACAYAADvBQAgGQAA8AUAIBoAAPEFACAbAADxBQAgHAAA8wUAIB4AAPQFACAfAAD0BQAgIAAA9QUAICEAAPYFACAjAAD8BQAgJAAA9wUAICUAAPkFACAmAAD6BQAgJwAA-wUAICgAAP0FACDCAwAA7AUAMMMDAAChAwAQxAMAAOwFADDFAwEAzQUAIcwDQADaBQAh7wNAANoFACGHBAEA5QUAIYgEAQDlBQAhiQQBAOUFACGKBAEA5QUAIYsEAQDlBQAhjQQAAO0FjQQijgQgAO4FACGPBAEA5QUAIQTNAwAAAI0EAs4DAAAAjQQIzwMAAACNBAjUAwAA6wWNBCICzQMgAAAAAdQDIADFBQAhA_EDAAADACDyAwAAAwAg8wMAAAMAIAPxAwAABwAg8gMAAAcAIPMDAAAHACAD8QMAAAsAIPIDAAALACDzAwAACwAgA_EDAAAPACDyAwAADwAg8wMAAA8AIAPxAwAAEwAg8gMAABMAIPMDAAATACAD8QMAAEUAIPIDAABFACDzAwAARQAgA_EDAABLACDyAwAASwAg8wMAAEsAIAPxAwAATwAg8gMAAE8AIPMDAABPACAD8QMAAFMAIPIDAABTACDzAwAAUwAgA_EDAAAgACDyAwAAIAAg8wMAACAAIA8FAADmBQAgwgMAAOQFADDDAwAAXQAQxAMAAOQFADDFAwEAzQUAIcYDAQDNBQAhzANAANoFACHvA0AA2gUAIfwDAQDlBQAh_QMBAOUFACH-AwEA5QUAIf8DAQDlBQAhgARAAM4FACHLBAAAXQAgzAQAAF0AIAPxAwAAGwAg8gMAABsAIPMDAAAbACAD8QMAAGAAIPIDAABgACDzAwAAYAAgA_EDAABXACDyAwAAVwAg8wMAAFcAIAPxAwAAZAAg8gMAAGQAIPMDAABkACANwgMAAP4FADDDAwAAmwMAEMQDAAD-BQAwxQMBALEFACHGAwEAsQUAIcwDQACyBQAh7wNAALIFACHwAwEAsQUAIZAEQACyBQAhkQQCALQFACGSBAIAtAUAIZMEEAD_BQAhlAQgAMEFACENDgAAtgUAIDwAAIEGACA9AACBBgAgXgAAgQYAIF8AAIEGACDNAxAAAAABzgMQAAAABM8DEAAAAATQAxAAAAAB0QMQAAAAAdIDEAAAAAHTAxAAAAAB1AMQAIAGACENDgAAtgUAIDwAAIEGACA9AACBBgAgXgAAgQYAIF8AAIEGACDNAxAAAAABzgMQAAAABM8DEAAAAATQAxAAAAAB0QMQAAAAAdIDEAAAAAHTAxAAAAAB1AMQAIAGACEIzQMQAAAAAc4DEAAAAATPAxAAAAAE0AMQAAAAAdEDEAAAAAHSAxAAAAAB0wMQAAAAAdQDEACBBgAhCMIDAACCBgAwwwMAAIUDABDEAwAAggYAMMUDAQCxBQAhzANAALIFACGVBAEAsQUAIZYEEAD_BQAhlwQBANMFACEPwgMAAIMGADDDAwAA7wIAEMQDAACDBgAwxQMBALEFACHGAwEAsQUAIcwDQACyBQAh7wNAALIFACHwAwEAsQUAIZAEQACyBQAhmAQBALEFACGZBBAA_wUAIZoEEAD_BQAhmwQgAMEFACGcBAIAtAUAIZ0EAgC0BQAhBsIDAACEBgAwwwMAANkCABDEAwAAhAYAMMUDAQCxBQAhmAQBALEFACGfBAAAhQafBCIHDgAAtgUAIDwAAIcGACA9AACHBgAgzQMAAACfBALOAwAAAJ8ECM8DAAAAnwQI1AMAAIYGnwQiBw4AALYFACA8AACHBgAgPQAAhwYAIM0DAAAAnwQCzgMAAACfBAjPAwAAAJ8ECNQDAACGBp8EIgTNAwAAAJ8EAs4DAAAAnwQIzwMAAACfBAjUAwAAhwafBCIPwgMAAIgGADDDAwAAwwIAEMQDAACIBgAwxQMBALEFACHMA0AAsgUAIe8DQACyBQAh8AMBALEFACGHBAEAsQUAIaAEAQCxBQAhoQQIAIkGACGjBAAAigajBCKkBAEAsQUAIaUEAQDTBQAhpgQBALEFACGoBAAAiwaoBCINDgAAtgUAIDwAALcFACA9AAC3BQAgXgAAtwUAIF8AALcFACDNAwgAAAABzgMIAAAABM8DCAAAAATQAwgAAAAB0QMIAAAAAdIDCAAAAAHTAwgAAAAB1AMIAJAGACEHDgAAtgUAIDwAAI8GACA9AACPBgAgzQMAAACjBALOAwAAAKMECM8DAAAAowQI1AMAAI4GowQiBw4AALYFACA8AACNBgAgPQAAjQYAIM0DAAAAqAQCzgMAAACoBAjPAwAAAKgECNQDAACMBqgEIgcOAAC2BQAgPAAAjQYAID0AAI0GACDNAwAAAKgEAs4DAAAAqAQIzwMAAACoBAjUAwAAjAaoBCIEzQMAAACoBALOAwAAAKgECM8DAAAAqAQI1AMAAI0GqAQiBw4AALYFACA8AACPBgAgPQAAjwYAIM0DAAAAowQCzgMAAACjBAjPAwAAAKMECNQDAACOBqMEIgTNAwAAAKMEAs4DAAAAowQIzwMAAACjBAjUAwAAjwajBCINDgAAtgUAIDwAALcFACA9AAC3BQAgXgAAtwUAIF8AALcFACDNAwgAAAABzgMIAAAABM8DCAAAAATQAwgAAAAB0QMIAAAAAdIDCAAAAAHTAwgAAAAB1AMIAJAGACEHwgMAAJEGADDDAwAArQIAEMQDAACRBgAwxQMBALEFACGpBAEAsQUAIaoEAQDTBQAhqwQAAJIGACAEzQMBAAAABawEAQAAAAGtBAEAAAAErgQBAAAABAfCAwAAkwYAMMMDAACaAgAQxAMAAJMGADDFAwEAzQUAIakEAQDNBQAhqgQBAOUFACGrBAAAkgYAIArCAwAAlAYAMMMDAACUAgAQxAMAAJQGADDFAwEAsQUAIcwDQACyBQAh6wMBALEFACHwAwEAsQUAIfUDQACzBQAh-QMBALEFACGvBEAAswUAIQ3CAwAAlQYAMMMDAAD-AQAQxAMAAJUGADDFAwEAsQUAIcYDAQCxBQAh8AMBALEFACGOBCAAwQUAIZwEAgC0BQAhnQQCALQFACGxBAAAlgaxBCKyBEAAsgUAIbMEQACzBQAhtAQIAIkGACEHDgAAtgUAIDwAAJgGACA9AACYBgAgzQMAAACxBALOAwAAALEECM8DAAAAsQQI1AMAAJcGsQQiBw4AALYFACA8AACYBgAgPQAAmAYAIM0DAAAAsQQCzgMAAACxBAjPAwAAALEECNQDAACXBrEEIgTNAwAAALEEAs4DAAAAsQQIzwMAAACxBAjUAwAAmAaxBCINwgMAAJkGADDDAwAA6AEAEMQDAACZBgAwxQMBALEFACHMA0AAsgUAIe8DQACyBQAhhwQBALEFACGkBAEAsQUAIaUEAQCxBQAhpgQBALEFACG1BAIAtAUAIbYEAgC0BQAhuAQAAJoGuAQiBw4AALYFACA8AACcBgAgPQAAnAYAIM0DAAAAuAQCzgMAAAC4BAjPAwAAALgECNQDAACbBrgEIgcOAAC2BQAgPAAAnAYAID0AAJwGACDNAwAAALgEAs4DAAAAuAQIzwMAAAC4BAjUAwAAmwa4BCIEzQMAAAC4BALOAwAAALgECM8DAAAAuAQI1AMAAJwGuAQiCcIDAACdBgAwwwMAANIBABDEAwAAnQYAMMUDAQCxBQAhxgMBALEFACGZBAIAtAUAIbkEAQCxBQAhugQgAMEFACG7BAIAtAUAIQ3CAwAAngYAMMMDAAC8AQAQxAMAAJ4GADDFAwEAsQUAIcwDQACyBQAh2AMBALEFACGYBAEAsQUAIaAEAQDTBQAhpAQBALEFACG8BAEA0wUAIb0EAgC0BQAhvwQAAJ8GvwQjwAQBANMFACEHDgAAuQUAIDwAAKEGACA9AAChBgAgzQMAAAC_BAPOAwAAAL8ECc8DAAAAvwQJ1AMAAKAGvwQjBw4AALkFACA8AAChBgAgPQAAoQYAIM0DAAAAvwQDzgMAAAC_BAnPAwAAAL8ECdQDAACgBr8EIwTNAwAAAL8EA84DAAAAvwQJzwMAAAC_BAnUAwAAoQa_BCMKwgMAAKIGADDDAwAApgEAEMQDAACiBgAwxQMBALEFACHMA0AAsgUAIdkDAQDTBQAhsQQAAKMGwwQiwQQBALEFACHDBAAAwgUAIMQEAQDTBQAhBw4AALYFACA8AAClBgAgPQAApQYAIM0DAAAAwwQCzgMAAADDBAjPAwAAAMMECNQDAACkBsMEIgcOAAC2BQAgPAAApQYAID0AAKUGACDNAwAAAMMEAs4DAAAAwwQIzwMAAADDBAjUAwAApAbDBCIEzQMAAADDBALOAwAAAMMECM8DAAAAwwQI1AMAAKUGwwQiB8IDAACmBgAwwwMAAJABABDEAwAApgYAMMUDAQCxBQAhxgMBALEFACHMA0AAsgUAIe8DQACyBQAhCykAAKoGACDCAwAApwYAMMMDAAB5ABDEAwAApwYAMMUDAQDNBQAhzANAANoFACHZAwEA5QUAIbEEAACoBsMEIsEEAQDNBQAhwwQAAKkGACDEBAEA5QUAIQTNAwAAAMMEAs4DAAAAwwQIzwMAAADDBAjUAwAApQbDBCIMzQOAAAAAAdADgAAAAAHRA4AAAAAB0gOAAAAAAdMDgAAAAAHUA4AAAAAB3QMBAAAAAd4DAQAAAAHfAwEAAAAB4AOAAAAAAeEDgAAAAAHiA4AAAAABCwUAAOYFACAWAACtBgAgwgMAAKwGADDDAwAAYAAQxAMAAKwGADDFAwEAzQUAIcYDAQDNBQAhzANAANoFACHvA0AA2gUAIcsEAABgACDMBAAAYAAgCQUAAOYFACDCAwAAqwYAMMMDAABkABDEAwAAqwYAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIfQDAQDNBQAh9QNAANoFACEJBQAA5gUAIBYAAK0GACDCAwAArAYAMMMDAABgABDEAwAArAYAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIe8DQADaBQAhA_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_BAAAzAa_BCPABAEA5QUAIQTNAwAAAL8EA84DAAAAvwQJzwMAAAC_BAnUAwAAoQa_BCMUAwAA5gUAIAcAANsFACAPAADRBgAgEAAA-AUAIBIAANIGACDCAwAAzQYAMMMDAAATABDEAwAAzQYAMMUDAQDNBQAhzANAANoFACHvA0AA2gUAIfADAQDNBQAhhwQBAM0FACGgBAEAzQUAIaEECADOBgAhowQAAM8GowQipAQBAM0FACGlBAEA5QUAIaYEAQDNBQAhqAQAANAGqAQiCM0DCAAAAAHOAwgAAAAEzwMIAAAABNADCAAAAAHRAwgAAAAB0gMIAAAAAdMDCAAAAAHUAwgAtwUAIQTNAwAAAKMEAs4DAAAAowQIzwMAAACjBAjUAwAAjwajBCIEzQMAAACoBALOAwAAAKgECM8DAAAAqAQI1AMAAI0GqAQiA_EDAAAXACDyAwAAFwAg8wMAABcAIAPxAwAAKQAg8gMAACkAIPMDAAApACACxgMBAAAAAfADAQAAAAEPBQAA5gUAIAcAANsFACDCAwAA1AYAMMMDAAAPABDEAwAA1AYAMMUDAQDNBQAhxgMBAM0FACHwAwEAzQUAIY4EIADuBQAhnAQCAK8GACGdBAIArwYAIbEEAADVBrEEIrIEQADaBQAhswRAAM4FACG0BAgAzgYAIQTNAwAAALEEAs4DAAAAsQQIzwMAAACxBAjUAwAAmAaxBCINBwAA2wUAIAgAAOYFACAJAADmBQAgwgMAANYGADDDAwAACwAQxAMAANYGADDFAwEAzQUAIcwDQADaBQAh6wMBAM0FACHwAwEAzQUAIfUDQADOBQAh-QMBAM0FACGvBEAAzgUAIQPGAwEAAAAB8AMBAAAAAZAEQAAAAAEPBAAA2wUAIAUAAOYFACDCAwAA2AYAMMMDAAAHABDEAwAA2AYAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIe8DQADaBQAh8AMBAM0FACGQBEAA2gUAIZEEAgCvBgAhkgQCAK8GACGTBBAAwwYAIZQEIADuBQAhEwMAAOYFACAEAADzBQAgBgAA8AUAIAoAAPEFACALAADyBQAgFwAA2wYAIMIDAADZBgAwwwMAAAMAEMQDAADZBgAwxQMBAM0FACHMA0AA2gUAIe8DQADaBQAhhwQBAM0FACGkBAEAzQUAIaUEAQDNBQAhpgQBAM0FACG1BAIArwYAIbYEAgCvBgAhuAQAANoGuAQiBM0DAAAAuAQCzgMAAAC4BAjPAwAAALgECNQDAACcBrgEIgoHAADbBQAgFgAA3AUAIMIDAADZBQAwwwMAADAAEMQDAADZBQAwxQMBAM0FACHMA0AA2gUAIfADAQDNBQAhywQAADAAIMwEAAAwACAAAAAAAAAB0AQBAAAAAQHQBEAAAAABAdAEQAAAAAEF0AQCAAAAAdcEAgAAAAHYBAIAAAAB2QQCAAAAAdoEAgAAAAEFNgAA-QwAIDcAAP8MACDNBAAA-gwAIM4EAAD-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_wYAIdsDAAD-Bu0DIusDAQDiBgAh7QMgAO4GACHuA0AA5AYAIe8DQADjBgAhCgkAAIIHACAUAACABwAgxQMBAOIGACHMA0AA4wYAIdkDAQD_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_wkAMM8EAACACgAg0AQAAIEKADDRBAAAgQoAMNIEAACBCgAw0wQAAIEKADDUBAAAgwoAMNUEAACECgAwCzYAAPIJADA3AAD2CQAwzQQAAPMJADDOBAAA9AkAMM8EAAD1CQAg0AQAAOYJADDRBAAA5gkAMNIEAADmCQAw0wQAAOYJADDUBAAA9wkAMNUEAADpCQAwCzYAAOIJADA3AADnCQAwzQQAAOMJADDOBAAA5AkAMM8EAADlCQAg0AQAAOYJADDRBAAA5gkAMNIEAADmCQAw0wQAAOYJADDUBAAA6AkAMNUEAADpCQAwCzYAANMJADA3AADYCQAwzQQAANQJADDOBAAA1QkAMM8EAADWCQAg0AQAANcJADDRBAAA1wkAMNIEAADXCQAw0wQAANcJADDUBAAA2QkAMNUEAADaCQAwCzYAAIoJADA3AACPCQAwzQQAAIsJADDOBAAAjAkAMM8EAACNCQAg0AQAAI4JADDRBAAAjgkAMNIEAACOCQAw0wQAAI4JADDUBAAAkAkAMNUEAACRCQAwCzYAAIEJADA3AACFCQAwzQQAAIIJADDOBAAAgwkAMM8EAACECQAg0AQAAPkIADDRBAAA-QgAMNIEAAD5CAAw0wQAAPkIADDUBAAAhgkAMNUEAAD8CAAwCzYAAPUIADA3AAD6CAAwzQQAAPYIADDOBAAA9wgAMM8EAAD4CAAg0AQAAPkIADDRBAAA-QgAMNIEAAD5CAAw0wQAAPkIADDUBAAA-wgAMNUEAAD8CAAwCzYAAOwIADA3AADwCAAwzQQAAO0IADDOBAAA7ggAMM8EAADvCAAg0AQAAJsHADDRBAAAmwcAMNIEAACbBwAw0wQAAJsHADDUBAAA8QgAMNUEAACeBwAwCzYAAOAIADA3AADlCAAwzQQAAOEIADDOBAAA4ggAMM8EAADjCAAg0AQAAOQIADDRBAAA5AgAMNIEAADkCAAw0wQAAOQIADDUBAAA5ggAMNUEAADnCAAwCzYAANQIADA3AADZCAAwzQQAANUIADDOBAAA1ggAMM8EAADXCAAg0AQAANgIADDRBAAA2AgAMNIEAADYCAAw0wQAANgIADDUBAAA2ggAMNUEAADbCAAwCzYAAMgIADA3AADNCAAwzQQAAMkIADDOBAAAyggAMM8EAADLCAAg0AQAAMwIADDRBAAAzAgAMNIEAADMCAAw0wQAAMwIADDUBAAAzggAMNUEAADPCAAwCzYAAKsIADA3AACwCAAwzQQAAKwIADDOBAAArQgAMM8EAACuCAAg0AQAAK8IADDRBAAArwgAMNIEAACvCAAw0wQAAK8IADDUBAAAsQgAMNUEAACyCAAwBzYAAKYIACA3AACpCAAgzQQAAKcIACDOBAAAqAgAINEEAABdACDSBAAAXQAg0wQAAM0DACALNgAAmAgAMDcAAJ0IADDNBAAAmQgAMM4EAACaCAAwzwQAAJsIACDQBAAAnAgAMNEEAACcCAAw0gQAAJwIADDTBAAAnAgAMNQEAACeCAAw1QQAAJ8IADALNgAA_QcAMDcAAIIIADDNBAAA_gcAMM4EAAD_BwAwzwQAAIAIACDQBAAAgQgAMNEEAACBCAAw0gQAAIEIADDTBAAAgQgAMNQEAACDCAAw1QQAAIQIADALNgAA9AcAMDcAAPgHADDNBAAA9QcAMM4EAAD2BwAwzwQAAPcHACDQBAAAyAcAMNEEAADIBwAw0gQAAMgHADDTBAAAyAcAMNQEAAD5BwAw1QQAAMsHADALNgAA6AcAMDcAAO0HADDNBAAA6QcAMM4EAADqBwAwzwQAAOsHACDQBAAA7AcAMNEEAADsBwAw0gQAAOwHADDTBAAA7AcAMNQEAADuBwAw1QQAAO8HADAExQMBAAAAAcwDQAAAAAH0AwEAAAAB9QNAAAAAAQIAAABmACA2AADzBwAgAwAAAGYAIDYAAPMHACA3AADyBwAgAS8AALwMADAJBQAA5gUAIMIDAACrBgAwwwMAAGQAEMQDAACrBgAwxQMBAAAAAcYDAQDNBQAhzANAANoFACH0AwEAAAAB9QNAANoFACECAAAAZgAgLwAA8gcAIAIAAADwBwAgLwAA8QcAIAjCAwAA7wcAMMMDAADwBwAQxAMAAO8HADDFAwEAzQUAIcYDAQDNBQAhzANAANoFACH0AwEAzQUAIfUDQADaBQAhCMIDAADvBwAwwwMAAPAHABDEAwAA7wcAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIfQDAQDNBQAh9QNAANoFACEExQMBAOIGACHMA0AA4wYAIfQDAQDiBgAh9QNAAOMGACEExQMBAOIGACHMA0AA4wYAIfQDAQDiBgAh9QNAAOMGACEExQMBAAAAAcwDQAAAAAH0AwEAAAAB9QNAAAAAAQgiAADpBgAgxQMBAAAAAccDAQAAAAHIAwEAAAAByQNAAAAAAcoDQAAAAAHLAwIAAAABzANAAAAAAQIAAABZACA2AAD8BwAgAwAAAFkAIDYAAPwHACA3AAD7BwAgAS8AALsMADACAAAAWQAgLwAA-wcAIAIAAADMBwAgLwAA-gcAIAfFAwEA4gYAIccDAQDiBgAhyAMBAOIGACHJA0AA4wYAIcoDQADkBgAhywMCAOUGACHMA0AA4wYAIQgiAADnBgAgxQMBAOIGACHHAwEA4gYAIcgDAQDiBgAhyQNAAOMGACHKA0AA5AYAIcsDAgDlBgAhzANAAOMGACEIIgAA6QYAIMUDAQAAAAHHAwEAAAAByAMBAAAAAckDQAAAAAHKA0AAAAABywMCAAAAAcwDQAAAAAEEFgAAlwgAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAQIAAAABACA2AACWCAAgAwAAAAEAIDYAAJYIACA3AACHCAAgAS8AALoMADAJBQAA5gUAIBYAAK0GACDCAwAArAYAMMMDAABgABDEAwAArAYAMMUDAQAAAAHGAwEAzQUAIcwDQADaBQAh7wNAANoFACECAAAAAQAgLwAAhwgAIAIAAACFCAAgLwAAhggAIAfCAwAAhAgAMMMDAACFCAAQxAMAAIQIADDFAwEAzQUAIcYDAQDNBQAhzANAANoFACHvA0AA2gUAIQfCAwAAhAgAMMMDAACFCAAQxAMAAIQIADDFAwEAzQUAIcYDAQDNBQAhzANAANoFACHvA0AA2gUAIQPFAwEA4gYAIcwDQADjBgAh7wNAAOMGACEEFgAAiAgAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIQs2AACJCAAwNwAAjggAMM0EAACKCAAwzgQAAIsIADDPBAAAjAgAINAEAACNCAAw0QQAAI0IADDSBAAAjQgAMNMEAACNCAAw1AQAAI8IADDVBAAAkAgAMAbFAwEAAAABzANAAAAAAdkDAQAAAAGxBAAAAMMEAsMEgAAAAAHEBAEAAAABAgAAAHsAIDYAAJUIACADAAAAewAgNgAAlQgAIDcAAJQIACABLwAAuQwAMAspAACqBgAgwgMAAKcGADDDAwAAeQAQxAMAAKcGADDFAwEAAAABzANAANoFACHZAwEA5QUAIbEEAACoBsMEIsEEAQDNBQAhwwQAAKkGACDEBAEA5QUAIQIAAAB7ACAvAACUCAAgAgAAAJEIACAvAACSCAAgCsIDAACQCAAwwwMAAJEIABDEAwAAkAgAMMUDAQDNBQAhzANAANoFACHZAwEA5QUAIbEEAACoBsMEIsEEAQDNBQAhwwQAAKkGACDEBAEA5QUAIQrCAwAAkAgAMMMDAACRCAAQxAMAAJAIADDFAwEAzQUAIcwDQADaBQAh2QMBAOUFACGxBAAAqAbDBCLBBAEAzQUAIcMEAACpBgAgxAQBAOUFACEGxQMBAOIGACHMA0AA4wYAIdkDAQD_BgAhsQQAAJMIwwQiwwSAAAAAAcQEAQD_BgAhAdAEAAAAwwQCBsUDAQDiBgAhzANAAOMGACHZAwEA_wYAIbEEAACTCMMEIsMEgAAAAAHEBAEA_wYAIQbFAwEAAAABzANAAAAAAdkDAQAAAAGxBAAAAMMEAsMEgAAAAAHEBAEAAAABBBYAAJcIACDFAwEAAAABzANAAAAAAe8DQAAAAAEENgAAiQgAMM0EAACKCAAwzwQAAIwIACDTBAAAjQgAMAYMAAClCAAgxQMBAAAAAZkEAgAAAAG5BAEAAAABugQgAAAAAbsEAgAAAAECAAAAHQAgNgAApAgAIAMAAAAdACA2AACkCAAgNwAAoggAIAEvAAC4DAAwDAUAAOYFACAMAADKBgAgwgMAAMkGADDDAwAAGwAQxAMAAMkGADDFAwEAAAABxgMBAM0FACGZBAIArwYAIbkEAQDNBQAhugQgAO4FACG7BAIArwYAIcgEAADIBgAgAgAAAB0AIC8AAKIIACACAAAAoAgAIC8AAKEIACAJwgMAAJ8IADDDAwAAoAgAEMQDAACfCAAwxQMBAM0FACHGAwEAzQUAIZkEAgCvBgAhuQQBAM0FACG6BCAA7gUAIbsEAgCvBgAhCcIDAACfCAAwwwMAAKAIABDEAwAAnwgAMMUDAQDNBQAhxgMBAM0FACGZBAIArwYAIbkEAQDNBQAhugQgAO4FACG7BAIArwYAIQXFAwEA4gYAIZkEAgDlBgAhuQQBAOIGACG6BCAA7gYAIbsEAgDlBgAhBgwAAKMIACDFAwEA4gYAIZkEAgDlBgAhuQQBAOIGACG6BCAA7gYAIbsEAgDlBgAhBTYAALMMACA3AAC2DAAgzQQAALQMACDOBAAAtQwAINMEAAAZACAGDAAApQgAIMUDAQAAAAGZBAIAAAABuQQBAAAAAboEIAAAAAG7BAIAAAABAzYAALMMACDNBAAAtAwAINMEAAAZACAIxQMBAAAAAcwDQAAAAAHvA0AAAAAB_AMBAAAAAf0DAQAAAAH-AwEAAAAB_wMBAAAAAYAEQAAAAAECAAAAzQMAIDYAAKYIACADAAAAXQAgNgAApggAIDcAAKoIACAKAAAAXQAgLwAAqggAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIfwDAQD_BgAh_QMBAP8GACH-AwEA_wYAIf8DAQD_BgAhgARAAOQGACEIxQMBAOIGACHMA0AA4wYAIe8DQADjBgAh_AMBAP8GACH9AwEA_wYAIf4DAQD_BgAh_wMBAP8GACGABEAA5AYAIQ0EAADGCAAgEQAAxwgAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAfADAQAAAAGQBEAAAAABmAQBAAAAAZkEEAAAAAGaBBAAAAABmwQgAAAAAZwEAgAAAAGdBAIAAAABAgAAACIAIDYAAMUIACADAAAAIgAgNgAAxQgAIDcAALYIACABLwAAsgwAMBMEAADBBgAgBQAA5gUAIBEAAMcGACDCAwAAxgYAMMMDAAAgABDEAwAAxgYAMMUDAQAAAAHGAwEAzQUAIcwDQADaBQAh7wNAANoFACHwAwEAzQUAIZAEQADaBQAhmAQBAM0FACGZBBAAwwYAIZoEEADDBgAhmwQgAO4FACGcBAIArwYAIZ0EAgCvBgAhxwQAAMUGACACAAAAIgAgLwAAtggAIAIAAACzCAAgLwAAtAgAIA_CAwAAsggAMMMDAACzCAAQxAMAALIIADDFAwEAzQUAIcYDAQDNBQAhzANAANoFACHvA0AA2gUAIfADAQDNBQAhkARAANoFACGYBAEAzQUAIZkEEADDBgAhmgQQAMMGACGbBCAA7gUAIZwEAgCvBgAhnQQCAK8GACEPwgMAALIIADDDAwAAswgAEMQDAACyCAAwxQMBAM0FACHGAwEAzQUAIcwDQADaBQAh7wNAANoFACHwAwEAzQUAIZAEQADaBQAhmAQBAM0FACGZBBAAwwYAIZoEEADDBgAhmwQgAO4FACGcBAIArwYAIZ0EAgCvBgAhC8UDAQDiBgAhzANAAOMGACHvA0AA4wYAIfADAQDiBgAhkARAAOMGACGYBAEA4gYAIZkEEAC1CAAhmgQQALUIACGbBCAA7gYAIZwEAgDlBgAhnQQCAOUGACEF0AQQAAAAAdcEEAAAAAHYBBAAAAAB2QQQAAAAAdoEEAAAAAENBAAAtwgAIBEAALgIACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACHwAwEA4gYAIZAEQADjBgAhmAQBAOIGACGZBBAAtQgAIZoEEAC1CAAhmwQgAO4GACGcBAIA5QYAIZ0EAgDlBgAhBTYAAKwMACA3AACwDAAgzQQAAK0MACDOBAAArwwAINMEAAAVACALNgAAuQgAMDcAAL4IADDNBAAAuggAMM4EAAC7CAAwzwQAALwIACDQBAAAvQgAMNEEAAC9CAAw0gQAAL0IADDTBAAAvQgAMNQEAAC_CAAw1QQAAMAIADAExQMBAAAAAcwDQAAAAAGWBBAAAAABlwQBAAAAAQIAAAAmACA2AADECAAgAwAAACYAIDYAAMQIACA3AADDCAAgAS8AAK4MADAJEAAAxAYAIMIDAADCBgAwwwMAACQAEMQDAADCBgAwxQMBAAAAAcwDQADaBQAhlQQBAM0FACGWBBAAwwYAIZcEAQDlBQAhAgAAACYAIC8AAMMIACACAAAAwQgAIC8AAMIIACAIwgMAAMAIADDDAwAAwQgAEMQDAADACAAwxQMBAM0FACHMA0AA2gUAIZUEAQDNBQAhlgQQAMMGACGXBAEA5QUAIQjCAwAAwAgAMMMDAADBCAAQxAMAAMAIADDFAwEAzQUAIcwDQADaBQAhlQQBAM0FACGWBBAAwwYAIZcEAQDlBQAhBMUDAQDiBgAhzANAAOMGACGWBBAAtQgAIZcEAQD_BgAhBMUDAQDiBgAhzANAAOMGACGWBBAAtQgAIZcEAQD_BgAhBMUDAQAAAAHMA0AAAAABlgQQAAAAAZcEAQAAAAENBAAAxggAIBEAAMcIACDFAwEAAAABzANAAAAAAe8DQAAAAAHwAwEAAAABkARAAAAAAZgEAQAAAAGZBBAAAAABmgQQAAAAAZsEIAAAAAGcBAIAAAABnQQCAAAAAQM2AACsDAAgzQQAAK0MACDTBAAAFQAgBDYAALkIADDNBAAAuggAMM8EAAC8CAAg0wQAAL0IADAKIwAA0QcAIMUDAQAAAAHMA0AAAAAB9QNAAAAAAYEEAQAAAAGCBAEAAAABgwQBAAAAAYQEAQAAAAGFBEAAAAABhgRAAAAAAQIAAABVACA2AADTCAAgAwAAAFUAIDYAANMIACA3AADSCAAgAS8AAKsMADAPBQAA5gUAICMAAPwFACDCAwAAsQYAMMMDAABTABDEAwAAsQYAMMUDAQAAAAHGAwEAzQUAIcwDQADaBQAh9QNAANoFACGBBAEAAAABggQBAOUFACGDBAEA5QUAIYQEAQDlBQAhhQRAAM4FACGGBEAA2gUAIQIAAABVACAvAADSCAAgAgAAANAIACAvAADRCAAgDcIDAADPCAAwwwMAANAIABDEAwAAzwgAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIfUDQADaBQAhgQQBAM0FACGCBAEA5QUAIYMEAQDlBQAhhAQBAOUFACGFBEAAzgUAIYYEQADaBQAhDcIDAADPCAAwwwMAANAIABDEAwAAzwgAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIfUDQADaBQAhgQQBAM0FACGCBAEA5QUAIYMEAQDlBQAhhAQBAOUFACGFBEAAzgUAIYYEQADaBQAhCcUDAQDiBgAhzANAAOMGACH1A0AA4wYAIYEEAQDiBgAhggQBAP8GACGDBAEA_wYAIYQEAQD_BgAhhQRAAOQGACGGBEAA4wYAIQojAADDBwAgxQMBAOIGACHMA0AA4wYAIfUDQADjBgAhgQQBAOIGACGCBAEA_wYAIYMEAQD_BgAhhAQBAP8GACGFBEAA5AYAIYYEQADjBgAhCiMAANEHACDFAwEAAAABzANAAAAAAfUDQAAAAAGBBAEAAAABggQBAAAAAYMEAQAAAAGEBAEAAAABhQRAAAAAAYYEQAAAAAEFxQMBAAAAAcwDQAAAAAH1A0AAAAAB9gMBAAAAAfcDQAAAAAECAAAAUQAgNgAA3wgAIAMAAABRACA2AADfCAAgNwAA3ggAIAEvAACqDAAwCgUAAOYFACDCAwAAsgYAMMMDAABPABDEAwAAsgYAMMUDAQAAAAHGAwEAzQUAIcwDQADaBQAh9QNAANoFACH2AwEAzQUAIfcDQADOBQAhAgAAAFEAIC8AAN4IACACAAAA3AgAIC8AAN0IACAJwgMAANsIADDDAwAA3AgAEMQDAADbCAAwxQMBAM0FACHGAwEAzQUAIcwDQADaBQAh9QNAANoFACH2AwEAzQUAIfcDQADOBQAhCcIDAADbCAAwwwMAANwIABDEAwAA2wgAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIfUDQADaBQAh9gMBAM0FACH3A0AAzgUAIQXFAwEA4gYAIcwDQADjBgAh9QNAAOMGACH2AwEA4gYAIfcDQADkBgAhBcUDAQDiBgAhzANAAOMGACH1A0AA4wYAIfYDAQDiBgAh9wNAAOQGACEFxQMBAAAAAcwDQAAAAAH1A0AAAAAB9gMBAAAAAfcDQAAAAAEHL4AAAAABxQMBAAAAAcwDQAAAAAHYAwEAAAAB2QMBAAAAAdsDAAAA2wMC3AMgAAAAAQIAAABNACA2AADrCAAgAwAAAE0AIDYAAOsIACA3AADqCAAgAS8AAKkMADAMBQAA5gUAIC8AAKkGACDCAwAAswYAMMMDAABLABDEAwAAswYAMMUDAQAAAAHGAwEAzQUAIcwDQADaBQAh2AMBAM0FACHZAwEAzQUAIdsDAAC0BtsDItwDIADuBQAhAgAAAE0AIC8AAOoIACACAAAA6AgAIC8AAOkIACALLwAAqQYAIMIDAADnCAAwwwMAAOgIABDEAwAA5wgAMMUDAQDNBQAhxgMBAM0FACHMA0AA2gUAIdgDAQDNBQAh2QMBAM0FACHbAwAAtAbbAyLcAyAA7gUAIQsvAACpBgAgwgMAAOcIADDDAwAA6AgAEMQDAADnCAAwxQMBAM0FACHGAwEAzQUAIcwDQADaBQAh2AMBAM0FACHZAwEAzQUAIdsDAAC0BtsDItwDIADuBQAhBy-AAAAAAcUDAQDiBgAhzANAAOMGACHYAwEA4gYAIdkDAQDiBgAh2wMAAO0G2wMi3AMgAO4GACEHL4AAAAABxQMBAOIGACHMA0AA4wYAIdgDAQDiBgAh2QMBAOIGACHbAwAA7QbbAyLcAyAA7gYAIQcvgAAAAAHFAwEAAAABzANAAAAAAdgDAQAAAAHZAwEAAAAB2wMAAADbAwLcAyAAAAABChQAAI8HACAVAACQBwAgxQMBAAAAAcwDQAAAAAHZAwEAAAAB2wMAAADtAwLqAwEAAAAB7QMgAAAAAe4DQAAAAAHvA0AAAAABAgAAADQAIDYAAPQIACADAAAANAAgNgAA9AgAIDcAAPMIACABLwAAqAwAMAIAAAA0ACAvAADzCAAgAgAAAJ8HACAvAADyCAAgCMUDAQDiBgAhzANAAOMGACHZAwEA_wYAIdsDAAD-Bu0DIuoDAQDiBgAh7QMgAO4GACHuA0AA5AYAIe8DQADjBgAhChQAAIAHACAVAACBBwAgxQMBAOIGACHMA0AA4wYAIdkDAQD_BgAh2wMAAP4G7QMi6gMBAOIGACHtAyAA7gYAIe4DQADkBgAh7wNAAOMGACEKFAAAjwcAIBUAAJAHACDFAwEAAAABzANAAAAAAdkDAQAAAAHbAwAAAO0DAuoDAQAAAAHtAyAAAAAB7gNAAAAAAe8DQAAAAAEGCAAAtwcAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAfkDAQAAAAH7AwAAAPsDAgIAAABHACA2AACACQAgAwAAAEcAIDYAAIAJACA3AAD_CAAgAS8AAKcMADAMCAAA5gUAIB0AAOYFACDCAwAAtgYAMMMDAABFABDEAwAAtgYAMMUDAQAAAAHMA0AA2gUAIe8DQADaBQAh-AMBAM0FACH5AwEAzQUAIfsDAAC3BvsDIsUEAAC1BgAgAgAAAEcAIC8AAP8IACACAAAA_QgAIC8AAP4IACAJwgMAAPwIADDDAwAA_QgAEMQDAAD8CAAwxQMBAM0FACHMA0AA2gUAIe8DQADaBQAh-AMBAM0FACH5AwEAzQUAIfsDAAC3BvsDIgnCAwAA_AgAMMMDAAD9CAAQxAMAAPwIADDFAwEAzQUAIcwDQADaBQAh7wNAANoFACH4AwEAzQUAIfkDAQDNBQAh-wMAALcG-wMiBcUDAQDiBgAhzANAAOMGACHvA0AA4wYAIfkDAQDiBgAh-wMAALQH-wMiBggAALUHACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACH5AwEA4gYAIfsDAAC0B_sDIgYIAAC3BwAgxQMBAAAAAcwDQAAAAAHvA0AAAAAB-QMBAAAAAfsDAAAA-wMCBh0AALgHACDFAwEAAAABzANAAAAAAe8DQAAAAAH4AwEAAAAB-wMAAAD7AwICAAAARwAgNgAAiQkAIAMAAABHACA2AACJCQAgNwAAiAkAIAEvAACmDAAwAgAAAEcAIC8AAIgJACACAAAA_QgAIC8AAIcJACAFxQMBAOIGACHMA0AA4wYAIe8DQADjBgAh-AMBAOIGACH7AwAAtAf7AyIGHQAAtgcAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIfgDAQDiBgAh-wMAALQH-wMiBh0AALgHACDFAwEAAAABzANAAAAAAe8DQAAAAAH4AwEAAAAB-wMAAAD7AwIPBwAAzwkAIA8AANAJACAQAADRCQAgEgAA0gkAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAfADAQAAAAGHBAEAAAABoAQBAAAAAaEECAAAAAGjBAAAAKMEAqQEAQAAAAGlBAEAAAABqAQAAACoBAICAAAAFQAgNgAAzgkAIAMAAAAVACA2AADOCQAgNwAAlwkAIAEvAAClDAAwFAMAAOYFACAHAADbBQAgDwAA0QYAIBAAAPgFACASAADSBgAgwgMAAM0GADDDAwAAEwAQxAMAAM0GADDFAwEAAAABzANAANoFACHvA0AA2gUAIfADAQDNBQAhhwQBAM0FACGgBAEAzQUAIaEECADOBgAhowQAAM8GowQipAQBAM0FACGlBAEA5QUAIaYEAQDNBQAhqAQAANAGqAQiAgAAABUAIC8AAJcJACACAAAAkgkAIC8AAJMJACAPwgMAAJEJADDDAwAAkgkAEMQDAACRCQAwxQMBAM0FACHMA0AA2gUAIe8DQADaBQAh8AMBAM0FACGHBAEAzQUAIaAEAQDNBQAhoQQIAM4GACGjBAAAzwajBCKkBAEAzQUAIaUEAQDlBQAhpgQBAM0FACGoBAAA0AaoBCIPwgMAAJEJADDDAwAAkgkAEMQDAACRCQAwxQMBAM0FACHMA0AA2gUAIe8DQADaBQAh8AMBAM0FACGHBAEAzQUAIaAEAQDNBQAhoQQIAM4GACGjBAAAzwajBCKkBAEAzQUAIaUEAQDlBQAhpgQBAM0FACGoBAAA0AaoBCILxQMBAOIGACHMA0AA4wYAIe8DQADjBgAh8AMBAOIGACGHBAEA4gYAIaAEAQDiBgAhoQQIAJQJACGjBAAAlQmjBCKkBAEA4gYAIaUEAQD_BgAhqAQAAJYJqAQiBdAECAAAAAHXBAgAAAAB2AQIAAAAAdkECAAAAAHaBAgAAAABAdAEAAAAowQCAdAEAAAAqAQCDwcAAJgJACAPAACZCQAgEAAAmgkAIBIAAJsJACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACHwAwEA4gYAIYcEAQDiBgAhoAQBAOIGACGhBAgAlAkAIaMEAACVCaMEIqQEAQDiBgAhpQQBAP8GACGoBAAAlgmoBCIFNgAAkgwAIDcAAKMMACDNBAAAkwwAIM4EAACiDAAg0wQAAAUAIAs2AAC0CQAwNwAAuQkAMM0EAAC1CQAwzgQAALYJADDPBAAAtwkAINAEAAC4CQAw0QQAALgJADDSBAAAuAkAMNMEAAC4CQAw1AQAALoJADDVBAAAuwkAMAs2AACpCQAwNwAArQkAMM0EAACqCQAwzgQAAKsJADDPBAAArAkAINAEAACvCAAw0QQAAK8IADDSBAAArwgAMNMEAACvCAAw1AQAAK4JADDVBAAAsggAMAs2AACcCQAwNwAAoQkAMM0EAACdCQAwzgQAAJ4JADDPBAAAnwkAINAEAACgCQAw0QQAAKAJADDSBAAAoAkAMNMEAACgCQAw1AQAAKIJADDVBAAAowkAMALFAwEAAAABnwQAAACfBAICAAAAKwAgNgAAqAkAIAMAAAArACA2AACoCQAgNwAApwkAIAEvAAChDAAwCAQAAMEGACDCAwAAvwYAMMMDAAApABDEAwAAvwYAMMUDAQAAAAGYBAEAzQUAIZ8EAADABp8EIsYEAAC-BgAgAgAAACsAIC8AAKcJACACAAAApAkAIC8AAKUJACAGwgMAAKMJADDDAwAApAkAEMQDAACjCQAwxQMBAM0FACGYBAEAzQUAIZ8EAADABp8EIgbCAwAAowkAMMMDAACkCQAQxAMAAKMJADDFAwEAzQUAIZgEAQDNBQAhnwQAAMAGnwQiAsUDAQDiBgAhnwQAAKYJnwQiAdAEAAAAnwQCAsUDAQDiBgAhnwQAAKYJnwQiAsUDAQAAAAGfBAAAAJ8EAg0FAACzCQAgEQAAxwgAIMUDAQAAAAHGAwEAAAABzANAAAAAAe8DQAAAAAHwAwEAAAABkARAAAAAAZkEEAAAAAGaBBAAAAABmwQgAAAAAZwEAgAAAAGdBAIAAAABAgAAACIAIDYAALIJACADAAAAIgAgNgAAsgkAIDcAALAJACABLwAAoAwAMAIAAAAiACAvAACwCQAgAgAAALMIACAvAACvCQAgC8UDAQDiBgAhxgMBAOIGACHMA0AA4wYAIe8DQADjBgAh8AMBAOIGACGQBEAA4wYAIZkEEAC1CAAhmgQQALUIACGbBCAA7gYAIZwEAgDlBgAhnQQCAOUGACENBQAAsQkAIBEAALgIACDFAwEA4gYAIcYDAQDiBgAhzANAAOMGACHvA0AA4wYAIfADAQDiBgAhkARAAOMGACGZBBAAtQgAIZoEEAC1CAAhmwQgAO4GACGcBAIA5QYAIZ0EAgDlBgAhBTYAAJsMACA3AACeDAAgzQQAAJwMACDOBAAAnQwAINMEAACeAwAgDQUAALMJACARAADHCAAgxQMBAAAAAcYDAQAAAAHMA0AAAAAB7wNAAAAAAfADAQAAAAGQBEAAAAABmQQQAAAAAZoEEAAAAAGbBCAAAAABnAQCAAAAAZ0EAgAAAAEDNgAAmwwAIM0EAACcDAAg0wQAAJ4DACAKDQAAzQkAIMUDAQAAAAHMA0AAAAAB2AMBAAAAAaAEAQAAAAGkBAEAAAABvAQBAAAAAb0EAgAAAAG_BAAAAL8EA8AEAQAAAAECAAAAGQAgNgAAzAkAIAMAAAAZACA2AADMCQAgNwAAvwkAIAEvAACaDAAwDwQAAMEGACANAAD6BQAgwgMAAMsGADDDAwAAFwAQxAMAAMsGADDFAwEAAAABzANAANoFACHYAwEAzQUAIZgEAQDNBQAhoAQBAOUFACGkBAEAzQUAIbwEAQDlBQAhvQQCAK8GACG_BAAAzAa_BCPABAEA5QUAIQIAAAAZACAvAAC_CQAgAgAAALwJACAvAAC9CQAgDcIDAAC7CQAwwwMAALwJABDEAwAAuwkAMMUDAQDNBQAhzANAANoFACHYAwEAzQUAIZgEAQDNBQAhoAQBAOUFACGkBAEAzQUAIbwEAQDlBQAhvQQCAK8GACG_BAAAzAa_BCPABAEA5QUAIQ3CAwAAuwkAMMMDAAC8CQAQxAMAALsJADDFAwEAzQUAIcwDQADaBQAh2AMBAM0FACGYBAEAzQUAIaAEAQDlBQAhpAQBAM0FACG8BAEA5QUAIb0EAgCvBgAhvwQAAMwGvwQjwAQBAOUFACEJxQMBAOIGACHMA0AA4wYAIdgDAQDiBgAhoAQBAP8GACGkBAEA4gYAIbwEAQD_BgAhvQQCAOUGACG_BAAAvgm_BCPABAEA_wYAIQHQBAAAAL8EAwoNAADACQAgxQMBAOIGACHMA0AA4wYAIdgDAQDiBgAhoAQBAP8GACGkBAEA4gYAIbwEAQD_BgAhvQQCAOUGACG_BAAAvgm_BCPABAEA_wYAIQs2AADBCQAwNwAAxQkAMM0EAADCCQAwzgQAAMMJADDPBAAAxAkAINAEAACcCAAw0QQAAJwIADDSBAAAnAgAMNMEAACcCAAw1AQAAMYJADDVBAAAnwgAMAYFAADLCQAgxQMBAAAAAcYDAQAAAAGZBAIAAAABugQgAAAAAbsEAgAAAAECAAAAHQAgNgAAygkAIAMAAAAdACA2AADKCQAgNwAAyAkAIAEvAACZDAAwAgAAAB0AIC8AAMgJACACAAAAoAgAIC8AAMcJACAFxQMBAOIGACHGAwEA4gYAIZkEAgDlBgAhugQgAO4GACG7BAIA5QYAIQYFAADJCQAgxQMBAOIGACHGAwEA4gYAIZkEAgDlBgAhugQgAO4GACG7BAIA5QYAIQU2AACUDAAgNwAAlwwAIM0EAACVDAAgzgQAAJYMACDTBAAAngMAIAYFAADLCQAgxQMBAAAAAcYDAQAAAAGZBAIAAAABugQgAAAAAbsEAgAAAAEDNgAAlAwAIM0EAACVDAAg0wQAAJ4DACAKDQAAzQkAIMUDAQAAAAHMA0AAAAAB2AMBAAAAAaAEAQAAAAGkBAEAAAABvAQBAAAAAb0EAgAAAAG_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-wkAIAMAAAANACA2AAD7CQAgNwAA-QkAIAEvAACADAAwAgAAAA0AIC8AAPkJACACAAAA6gkAIC8AAPgJACAGxQMBAOIGACHMA0AA4wYAIesDAQDiBgAh8AMBAOIGACH1A0AA5AYAIa8EQADkBgAhCAcAAO0JACAJAAD6CQAgxQMBAOIGACHMA0AA4wYAIesDAQDiBgAh8AMBAOIGACH1A0AA5AYAIa8EQADkBgAhBTYAAPsLACA3AAD-CwAgzQQAAPwLACDOBAAA_QsAINMEAACeAwAgCAcAAPAJACAJAAD8CQAgxQMBAAAAAcwDQAAAAAHrAwEAAAAB8AMBAAAAAfUDQAAAAAGvBEAAAAABAzYAAPsLACDNBAAA_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_BgAhpgQBAOIGACGoBAAAlgmoBCIPAwAAqQoAIA8AAJkJACAQAACaCQAgEgAAmwkAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhoAQBAOIGACGhBAgAlAkAIaMEAACVCaMEIqQEAQDiBgAhpQQBAP8GACGmBAEA4gYAIagEAACWCagEIgU2AADuCwAgNwAA8QsAIM0EAADvCwAgzgQAAPALACDTBAAAngMAIA8DAACrCgAgDwAA0AkAIBAAANEJACASAADSCQAgxQMBAAAAAcwDQAAAAAHvA0AAAAABhwQBAAAAAaAEAQAAAAGhBAgAAAABowQAAACjBAKkBAEAAAABpQQBAAAAAaYEAQAAAAGoBAAAAKgEAgM2AADuCwAgzQQAAO8LACDTBAAAngMAIAoFAAC2CgAgxQMBAAAAAcYDAQAAAAGOBCAAAAABnAQCAAAAAZ0EAgAAAAGxBAAAALEEArIEQAAAAAGzBEAAAAABtAQIAAAAAQIAAAARACA2AAC1CgAgAwAAABEAIDYAALUKACA3AACzCgAgAS8AAO0LADACAAAAEQAgLwAAswoAIAIAAADbCQAgLwAAsgoAIAnFAwEA4gYAIcYDAQDiBgAhjgQgAO4GACGcBAIA5QYAIZ0EAgDlBgAhsQQAAN0JsQQisgRAAOMGACGzBEAA5AYAIbQECACUCQAhCgUAALQKACDFAwEA4gYAIcYDAQDiBgAhjgQgAO4GACGcBAIA5QYAIZ0EAgDlBgAhsQQAAN0JsQQisgRAAOMGACGzBEAA5AYAIbQECACUCQAhBTYAAOgLACA3AADrCwAgzQQAAOkLACDOBAAA6gsAINMEAACeAwAgCgUAALYKACDFAwEAAAABxgMBAAAAAY4EIAAAAAGcBAIAAAABnQQCAAAAAbEEAAAAsQQCsgRAAAAAAbMEQAAAAAG0BAgAAAABAzYAAOgLACDNBAAA6QsAINMEAACeAwAgCAgAAPEJACAJAAD8CQAgxQMBAAAAAcwDQAAAAAHrAwEAAAAB9QNAAAAAAfkDAQAAAAGvBEAAAAABAgAAAA0AIDYAAL8KACADAAAADQAgNgAAvwoAIDcAAL4KACABLwAA5wsAMAIAAAANACAvAAC-CgAgAgAAAOoJACAvAAC9CgAgBsUDAQDiBgAhzANAAOMGACHrAwEA4gYAIfUDQADkBgAh-QMBAOIGACGvBEAA5AYAIQgIAADuCQAgCQAA-gkAIMUDAQDiBgAhzANAAOMGACHrAwEA4gYAIfUDQADkBgAh-QMBAOIGACGvBEAA5AYAIQgIAADxCQAgCQAA_AkAIMUDAQAAAAHMA0AAAAAB6wMBAAAAAfUDQAAAAAH5AwEAAAABrwRAAAAAAQoFAADKCgAgxQMBAAAAAcYDAQAAAAHMA0AAAAAB7wNAAAAAAZAEQAAAAAGRBAIAAAABkgQCAAAAAZMEEAAAAAGUBCAAAAABAgAAAAkAIDYAAMkKACADAAAACQAgNgAAyQoAIDcAAMcKACABLwAA5gsAMAIAAAAJACAvAADHCgAgAgAAAIUKACAvAADGCgAgCcUDAQDiBgAhxgMBAOIGACHMA0AA4wYAIe8DQADjBgAhkARAAOMGACGRBAIA5QYAIZIEAgDlBgAhkwQQALUIACGUBCAA7gYAIQoFAADICgAgxQMBAOIGACHGAwEA4gYAIcwDQADjBgAh7wNAAOMGACGQBEAA4wYAIZEEAgDlBgAhkgQCAOUGACGTBBAAtQgAIZQEIADuBgAhBTYAAOELACA3AADkCwAgzQQAAOILACDOBAAA4wsAINMEAACeAwAgCgUAAMoKACDFAwEAAAABxgMBAAAAAcwDQAAAAAHvA0AAAAABkARAAAAAAZEEAgAAAAGSBAIAAAABkwQQAAAAAZQEIAAAAAEDNgAA4QsAIM0EAADiCwAg0wQAAJ4DACAOBAAAzwoAIAYAAMwKACAKAADNCgAgCwAAzgoAIBcAANAKACDFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABpAQBAAAAAaUEAQAAAAG1BAIAAAABtgQCAAAAAbgEAAAAuAQCBDYAAMAKADDNBAAAwQoAMM8EAADDCgAg0wQAAIEKADAENgAAtwoAMM0EAAC4CgAwzwQAALoKACDTBAAA5gkAMAQ2AACsCgAwzQQAAK0KADDPBAAArwoAINMEAADXCQAwBDYAAKEKADDNBAAAogoAMM8EAACkCgAg0wQAAI4JADADNgAAnAoAIM0EAACdCgAg0wQAAKcEACAENgAAiwoAMM0EAACMCgAwzwQAAI4KACDTBAAAjwoAMAQ2AAD9CQAwzQQAAP4JADDPBAAAgAoAINMEAACBCgAwBDYAAPIJADDNBAAA8wkAMM8EAAD1CQAg0wQAAOYJADAENgAA4gkAMM0EAADjCQAwzwQAAOUJACDTBAAA5gkAMAQ2AADTCQAwzQQAANQJADDPBAAA1gkAINMEAADXCQAwBDYAAIoJADDNBAAAiwkAMM8EAACNCQAg0wQAAI4JADAENgAAgQkAMM0EAACCCQAwzwQAAIQJACDTBAAA-QgAMAQ2AAD1CAAwzQQAAPYIADDPBAAA-AgAINMEAAD5CAAwBDYAAOwIADDNBAAA7QgAMM8EAADvCAAg0wQAAJsHADAENgAA4AgAMM0EAADhCAAwzwQAAOMIACDTBAAA5AgAMAQ2AADUCAAwzQQAANUIADDPBAAA1wgAINMEAADYCAAwBDYAAMgIADDNBAAAyQgAMM8EAADLCAAg0wQAAMwIADAENgAAqwgAMM0EAACsCAAwzwQAAK4IACDTBAAArwgAMAM2AACmCAAgzQQAAKcIACDTBAAAzQMAIAQ2AACYCAAwzQQAAJkIADDPBAAAmwgAINMEAACcCAAwBDYAAP0HADDNBAAA_gcAMM8EAACACAAg0wQAAIEIADAENgAA9AcAMM0EAAD1BwAwzwQAAPcHACDTBAAAyAcAMAQ2AADoBwAwzQQAAOkHADDPBAAA6wcAINMEAADsBwAwAAAAAAAAAAAAAAYFAAC-BwAg_AMAANwGACD9AwAA3AYAIP4DAADcBgAg_wMAANwGACCABAAA3AYAIAAAAAAAAAAAAAAAAAAABTYAANwLACA3AADfCwAgzQQAAN0LACDOBAAA3gsAINMEAAAiACADNgAA3AsAIM0EAADdCwAg0wQAACIAIAAAAAAAAAAABTYAANcLACA3AADaCwAgzQQAANgLACDOBAAA2QsAINMEAAAVACADNgAA1wsAIM0EAADYCwAg0wQAABUAIAAAAAAAAAAAAtAEAQAAAATWBAEAAAAFAdAEAQAAAAQAAAAAAAAAAAAAAAAABTYAANILACA3AADVCwAgzQQAANMLACDOBAAA1AsAINMEAACeAwAgAzYAANILACDNBAAA0wsAINMEAACeAwAgAAAAAAAAAAAAAAU2AADNCwAgNwAA0AsAIM0EAADOCwAgzgQAAM8LACDTBAAAFQAgAzYAAM0LACDNBAAAzgsAINMEAAAVACAAAAAFNgAAyAsAIDcAAMsLACDNBAAAyQsAIM4EAADKCwAg0wQAAAEAIAM2AADICwAgzQQAAMkLACDTBAAAAQAgAAAABTYAAMMLACA3AADGCwAgzQQAAMQLACDOBAAAxQsAINMEAACeAwAgAzYAAMMLACDNBAAAxAsAINMEAACeAwAgAgUAAL4HACAWAAC4CwAgAAYFAAC-BwAgIwAA8AoAIIIEAADcBgAggwQAANwGACCEBAAA3AYAIIUEAADcBgAgBQkAAL4HACAUAAC7CwAgFQAAvAsAINkDAADcBgAg7gMAANwGACAAAgcAAKUHACAWAACmBwAgBgMAAL4HACAHAAClBwAgDwAAwQsAIBAAAOwKACASAADCCwAgpQQAANwGACADBAAAvQsAIAUAAL4HACARAAC_CwAgAAYEAAC9CwAgDQAA7goAIKAEAADcBgAgvAQAANwGACC_BAAA3AYAIMAEAADcBgAgAAAcBwAA1QoAIBAAAN0KACAWAADZCgAgGAAA0QoAIBkAANIKACAaAADTCgAgGwAA1AoAIBwAANYKACAeAADXCgAgHwAA2AoAICAAANoKACAhAADbCgAgIwAA4QoAICQAANwKACAlAADeCgAgJgAA3woAICgAAOIKACDFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAAAABiwQBAAAAAY0EAAAAjQQCjgQgAAAAAY8EAQAAAAECAAAAngMAIDYAAMMLACADAAAAoQMAIDYAAMMLACA3AADHCwAgHgAAAKEDACAHAADaBwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBoAANgHACAbAADZBwAgHAAA2wcAIB4AANwHACAfAADdBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICUAAOMHACAmAADkBwAgKAAA5wcAIC8AAMcLACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIRwHAADaBwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBoAANgHACAbAADZBwAgHAAA2wcAIB4AANwHACAfAADdBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICUAAOMHACAmAADkBwAgKAAA5wcAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhBQUAALYLACDFAwEAAAABxgMBAAAAAcwDQAAAAAHvA0AAAAABAgAAAAEAIDYAAMgLACADAAAAYAAgNgAAyAsAIDcAAMwLACAHAAAAYAAgBQAAtQsAIC8AAMwLACDFAwEA4gYAIcYDAQDiBgAhzANAAOMGACHvA0AA4wYAIQUFAAC1CwAgxQMBAOIGACHGAwEA4gYAIcwDQADjBgAh7wNAAOMGACEQAwAAqwoAIAcAAM8JACAQAADRCQAgEgAA0gkAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAfADAQAAAAGHBAEAAAABoAQBAAAAAaEECAAAAAGjBAAAAKMEAqQEAQAAAAGlBAEAAAABpgQBAAAAAagEAAAAqAQCAgAAABUAIDYAAM0LACADAAAAEwAgNgAAzQsAIDcAANELACASAAAAEwAgAwAAqQoAIAcAAJgJACAQAACaCQAgEgAAmwkAIC8AANELACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACHwAwEA4gYAIYcEAQDiBgAhoAQBAOIGACGhBAgAlAkAIaMEAACVCaMEIqQEAQDiBgAhpQQBAP8GACGmBAEA4gYAIagEAACWCagEIhADAACpCgAgBwAAmAkAIBAAAJoJACASAACbCQAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAh8AMBAOIGACGHBAEA4gYAIaAEAQDiBgAhoQQIAJQJACGjBAAAlQmjBCKkBAEA4gYAIaUEAQD_BgAhpgQBAOIGACGoBAAAlgmoBCIcBwAA1QoAIBAAAN0KACAWAADZCgAgGQAA0goAIBoAANMKACAbAADUCgAgHAAA1goAIB4AANcKACAfAADYCgAgIAAA2goAICEAANsKACAjAADhCgAgJAAA3AoAICUAAN4KACAmAADfCgAgJwAA4AoAICgAAOIKACDFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAAAABiwQBAAAAAY0EAAAAjQQCjgQgAAAAAY8EAQAAAAECAAAAngMAIDYAANILACADAAAAoQMAIDYAANILACA3AADWCwAgHgAAAKEDACAHAADaBwAgEAAA4gcAIBYAAN4HACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAkAADhBwAgJQAA4wcAICYAAOQHACAnAADlBwAgKAAA5wcAIC8AANYLACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIRwHAADaBwAgEAAA4gcAIBYAAN4HACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAkAADhBwAgJQAA4wcAICYAAOQHACAnAADlBwAgKAAA5wcAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhEAMAAKsKACAHAADPCQAgDwAA0AkAIBAAANEJACDFAwEAAAABzANAAAAAAe8DQAAAAAHwAwEAAAABhwQBAAAAAaAEAQAAAAGhBAgAAAABowQAAACjBAKkBAEAAAABpQQBAAAAAaYEAQAAAAGoBAAAAKgEAgIAAAAVACA2AADXCwAgAwAAABMAIDYAANcLACA3AADbCwAgEgAAABMAIAMAAKkKACAHAACYCQAgDwAAmQkAIBAAAJoJACAvAADbCwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAh8AMBAOIGACGHBAEA4gYAIaAEAQDiBgAhoQQIAJQJACGjBAAAlQmjBCKkBAEA4gYAIaUEAQD_BgAhpgQBAOIGACGoBAAAlgmoBCIQAwAAqQoAIAcAAJgJACAPAACZCQAgEAAAmgkAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIfADAQDiBgAhhwQBAOIGACGgBAEA4gYAIaEECACUCQAhowQAAJUJowQipAQBAOIGACGlBAEA_wYAIaYEAQDiBgAhqAQAAJYJqAQiDgQAAMYIACAFAACzCQAgxQMBAAAAAcYDAQAAAAHMA0AAAAAB7wNAAAAAAfADAQAAAAGQBEAAAAABmAQBAAAAAZkEEAAAAAGaBBAAAAABmwQgAAAAAZwEAgAAAAGdBAIAAAABAgAAACIAIDYAANwLACADAAAAIAAgNgAA3AsAIDcAAOALACAQAAAAIAAgBAAAtwgAIAUAALEJACAvAADgCwAgxQMBAOIGACHGAwEA4gYAIcwDQADjBgAh7wNAAOMGACHwAwEA4gYAIZAEQADjBgAhmAQBAOIGACGZBBAAtQgAIZoEEAC1CAAhmwQgAO4GACGcBAIA5QYAIZ0EAgDlBgAhDgQAALcIACAFAACxCQAgxQMBAOIGACHGAwEA4gYAIcwDQADjBgAh7wNAAOMGACHwAwEA4gYAIZAEQADjBgAhmAQBAOIGACGZBBAAtQgAIZoEEAC1CAAhmwQgAO4GACGcBAIA5QYAIZ0EAgDlBgAhHAcAANUKACAQAADdCgAgFgAA2QoAIBgAANEKACAaAADTCgAgGwAA1AoAIBwAANYKACAeAADXCgAgHwAA2AoAICAAANoKACAhAADbCgAgIwAA4QoAICQAANwKACAlAADeCgAgJgAA3woAICcAAOAKACAoAADiCgAgxQMBAAAAAcwDQAAAAAHvA0AAAAABhwQBAAAAAYgEAQAAAAGJBAEAAAABigQBAAAAAYsEAQAAAAGNBAAAAI0EAo4EIAAAAAGPBAEAAAABAgAAAJ4DACA2AADhCwAgAwAAAKEDACA2AADhCwAgNwAA5QsAIB4AAAChAwAgBwAA2gcAIBAAAOIHACAWAADeBwAgGAAA1gcAIBoAANgHACAbAADZBwAgHAAA2wcAIB4AANwHACAfAADdBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICUAAOMHACAmAADkBwAgJwAA5QcAICgAAOcHACAvAADlCwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACEcBwAA2gcAIBAAAOIHACAWAADeBwAgGAAA1gcAIBoAANgHACAbAADZBwAgHAAA2wcAIB4AANwHACAfAADdBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICUAAOMHACAmAADkBwAgJwAA5QcAICgAAOcHACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIQnFAwEAAAABxgMBAAAAAcwDQAAAAAHvA0AAAAABkARAAAAAAZEEAgAAAAGSBAIAAAABkwQQAAAAAZQEIAAAAAEGxQMBAAAAAcwDQAAAAAHrAwEAAAAB9QNAAAAAAfkDAQAAAAGvBEAAAAABHBAAAN0KACAWAADZCgAgGAAA0QoAIBkAANIKACAaAADTCgAgGwAA1AoAIBwAANYKACAeAADXCgAgHwAA2AoAICAAANoKACAhAADbCgAgIwAA4QoAICQAANwKACAlAADeCgAgJgAA3woAICcAAOAKACAoAADiCgAgxQMBAAAAAcwDQAAAAAHvA0AAAAABhwQBAAAAAYgEAQAAAAGJBAEAAAABigQBAAAAAYsEAQAAAAGNBAAAAI0EAo4EIAAAAAGPBAEAAAABAgAAAJ4DACA2AADoCwAgAwAAAKEDACA2AADoCwAgNwAA7AsAIB4AAAChAwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBoAANgHACAbAADZBwAgHAAA2wcAIB4AANwHACAfAADdBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICUAAOMHACAmAADkBwAgJwAA5QcAICgAAOcHACAvAADsCwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACEcEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBoAANgHACAbAADZBwAgHAAA2wcAIB4AANwHACAfAADdBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICUAAOMHACAmAADkBwAgJwAA5QcAICgAAOcHACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIQnFAwEAAAABxgMBAAAAAY4EIAAAAAGcBAIAAAABnQQCAAAAAbEEAAAAsQQCsgRAAAAAAbMEQAAAAAG0BAgAAAABHAcAANUKACAQAADdCgAgFgAA2QoAIBgAANEKACAZAADSCgAgGgAA0woAIBsAANQKACAeAADXCgAgHwAA2AoAICAAANoKACAhAADbCgAgIwAA4QoAICQAANwKACAlAADeCgAgJgAA3woAICcAAOAKACAoAADiCgAgxQMBAAAAAcwDQAAAAAHvA0AAAAABhwQBAAAAAYgEAQAAAAGJBAEAAAABigQBAAAAAYsEAQAAAAGNBAAAAI0EAo4EIAAAAAGPBAEAAAABAgAAAJ4DACA2AADuCwAgAwAAAKEDACA2AADuCwAgNwAA8gsAIB4AAAChAwAgBwAA2gcAIBAAAOIHACAWAADeBwAgGAAA1gcAIBkAANcHACAaAADYBwAgGwAA2QcAIB4AANwHACAfAADdBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICUAAOMHACAmAADkBwAgJwAA5QcAICgAAOcHACAvAADyCwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACEcBwAA2gcAIBAAAOIHACAWAADeBwAgGAAA1gcAIBkAANcHACAaAADYBwAgGwAA2QcAIB4AANwHACAfAADdBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICUAAOMHACAmAADkBwAgJwAA5QcAICgAAOcHACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIQvFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABoAQBAAAAAaEECAAAAAGjBAAAAKMEAqQEAQAAAAGlBAEAAAABpgQBAAAAAagEAAAAqAQCCcUDAQAAAAHMA0AAAAAB7wNAAAAAAYcEAQAAAAGkBAEAAAABpQQBAAAAAbUEAgAAAAG2BAIAAAABuAQAAAC4BAIPAwAAoAsAIAQAAM8KACAKAADNCgAgCwAAzgoAIBcAANAKACDFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABpAQBAAAAAaUEAQAAAAGmBAEAAAABtQQCAAAAAbYEAgAAAAG4BAAAALgEAgIAAAAFACA2AAD1CwAgAwAAAAMAIDYAAPULACA3AAD5CwAgEQAAAAMAIAMAAJ8LACAEAACaCgAgCgAAmAoAIAsAAJkKACAXAACbCgAgLwAA-QsAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhpAQBAOIGACGlBAEA4gYAIaYEAQDiBgAhtQQCAOUGACG2BAIA5QYAIbgEAACVCrgEIg8DAACfCwAgBAAAmgoAIAoAAJgKACALAACZCgAgFwAAmwoAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhpAQBAOIGACGlBAEA4gYAIaYEAQDiBgAhtQQCAOUGACG2BAIA5QYAIbgEAACVCrgEIgnFAwEAAAABzANAAAAAAe8DQAAAAAHwAwEAAAABkARAAAAAAZEEAgAAAAGSBAIAAAABkwQQAAAAAZQEIAAAAAEcBwAA1QoAIBAAAN0KACAWAADZCgAgGAAA0QoAIBkAANIKACAaAADTCgAgHAAA1goAIB4AANcKACAfAADYCgAgIAAA2goAICEAANsKACAjAADhCgAgJAAA3AoAICUAAN4KACAmAADfCgAgJwAA4AoAICgAAOIKACDFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAAAABiwQBAAAAAY0EAAAAjQQCjgQgAAAAAY8EAQAAAAECAAAAngMAIDYAAPsLACADAAAAoQMAIDYAAPsLACA3AAD_CwAgHgAAAKEDACAHAADaBwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBoAANgHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAkAADhBwAgJQAA4wcAICYAAOQHACAnAADlBwAgKAAA5wcAIC8AAP8LACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIRwHAADaBwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBoAANgHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAkAADhBwAgJQAA4wcAICYAAOQHACAnAADlBwAgKAAA5wcAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhBsUDAQAAAAHMA0AAAAAB6wMBAAAAAfADAQAAAAH1A0AAAAABrwRAAAAAARwHAADVCgAgEAAA3QoAIBYAANkKACAYAADRCgAgGQAA0goAIBsAANQKACAcAADWCgAgHgAA1woAIB8AANgKACAgAADaCgAgIQAA2woAICMAAOEKACAkAADcCgAgJQAA3goAICYAAN8KACAnAADgCgAgKAAA4goAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEAQAAAAGLBAEAAAABjQQAAACNBAKOBCAAAAABjwQBAAAAAQIAAACeAwAgNgAAgQwAIA8DAACgCwAgBAAAzwoAIAYAAMwKACALAADOCgAgFwAA0AoAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAYcEAQAAAAGkBAEAAAABpQQBAAAAAaYEAQAAAAG1BAIAAAABtgQCAAAAAbgEAAAAuAQCAgAAAAUAIDYAAIMMACADAAAAoQMAIDYAAIEMACA3AACHDAAgHgAAAKEDACAHAADaBwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAkAADhBwAgJQAA4wcAICYAAOQHACAnAADlBwAgKAAA5wcAIC8AAIcMACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIRwHAADaBwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAkAADhBwAgJQAA4wcAICYAAOQHACAnAADlBwAgKAAA5wcAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhAwAAAAMAIDYAAIMMACA3AACKDAAgEQAAAAMAIAMAAJ8LACAEAACaCgAgBgAAlwoAIAsAAJkKACAXAACbCgAgLwAAigwAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhpAQBAOIGACGlBAEA4gYAIaYEAQDiBgAhtQQCAOUGACG2BAIA5QYAIbgEAACVCrgEIg8DAACfCwAgBAAAmgoAIAYAAJcKACALAACZCgAgFwAAmwoAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhpAQBAOIGACGlBAEA4gYAIaYEAQDiBgAhtQQCAOUGACG2BAIA5QYAIbgEAACVCrgEIgbFAwEAAAABzANAAAAAAfADAQAAAAH1A0AAAAAB-QMBAAAAAa8EQAAAAAEPAwAAoAsAIAQAAM8KACAGAADMCgAgCgAAzQoAIBcAANAKACDFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABpAQBAAAAAaUEAQAAAAGmBAEAAAABtQQCAAAAAbYEAgAAAAG4BAAAALgEAgIAAAAFACA2AACMDAAgAwAAAAMAIDYAAIwMACA3AACQDAAgEQAAAAMAIAMAAJ8LACAEAACaCgAgBgAAlwoAIAoAAJgKACAXAACbCgAgLwAAkAwAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhpAQBAOIGACGlBAEA4gYAIaYEAQDiBgAhtQQCAOUGACG2BAIA5QYAIbgEAACVCrgEIg8DAACfCwAgBAAAmgoAIAYAAJcKACAKAACYCgAgFwAAmwoAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhpAQBAOIGACGlBAEA4gYAIaYEAQDiBgAhtQQCAOUGACG2BAIA5QYAIbgEAACVCrgEIgnFAwEAAAAB8AMBAAAAAY4EIAAAAAGcBAIAAAABnQQCAAAAAbEEAAAAsQQCsgRAAAAAAbMEQAAAAAG0BAgAAAABDwMAAKALACAGAADMCgAgCgAAzQoAIAsAAM4KACAXAADQCgAgxQMBAAAAAcwDQAAAAAHvA0AAAAABhwQBAAAAAaQEAQAAAAGlBAEAAAABpgQBAAAAAbUEAgAAAAG2BAIAAAABuAQAAAC4BAICAAAABQAgNgAAkgwAIBwHAADVCgAgEAAA3QoAIBYAANkKACAYAADRCgAgGQAA0goAIBoAANMKACAbAADUCgAgHAAA1goAIB4AANcKACAfAADYCgAgIAAA2goAICEAANsKACAjAADhCgAgJAAA3AoAICUAAN4KACAnAADgCgAgKAAA4goAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEAQAAAAGLBAEAAAABjQQAAACNBAKOBCAAAAABjwQBAAAAAQIAAACeAwAgNgAAlAwAIAMAAAChAwAgNgAAlAwAIDcAAJgMACAeAAAAoQMAIAcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAkAADhBwAgJQAA4wcAICcAAOUHACAoAADnBwAgLwAAmAwAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhHAcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAkAADhBwAgJQAA4wcAICcAAOUHACAoAADnBwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACEFxQMBAAAAAcYDAQAAAAGZBAIAAAABugQgAAAAAbsEAgAAAAEJxQMBAAAAAcwDQAAAAAHYAwEAAAABoAQBAAAAAaQEAQAAAAG8BAEAAAABvQQCAAAAAb8EAAAAvwQDwAQBAAAAARwHAADVCgAgFgAA2QoAIBgAANEKACAZAADSCgAgGgAA0woAIBsAANQKACAcAADWCgAgHgAA1woAIB8AANgKACAgAADaCgAgIQAA2woAICMAAOEKACAkAADcCgAgJQAA3goAICYAAN8KACAnAADgCgAgKAAA4goAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEAQAAAAGLBAEAAAABjQQAAACNBAKOBCAAAAABjwQBAAAAAQIAAACeAwAgNgAAmwwAIAMAAAChAwAgNgAAmwwAIDcAAJ8MACAeAAAAoQMAIAcAANoHACAWAADeBwAgGAAA1gcAIBkAANcHACAaAADYBwAgGwAA2QcAIBwAANsHACAeAADcBwAgHwAA3QcAICAAAN8HACAhAADgBwAgIwAA5gcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgLwAAnwwAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhHAcAANoHACAWAADeBwAgGAAA1gcAIBkAANcHACAaAADYBwAgGwAA2QcAIBwAANsHACAeAADcBwAgHwAA3QcAICAAAN8HACAhAADgBwAgIwAA5gcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACELxQMBAAAAAcYDAQAAAAHMA0AAAAAB7wNAAAAAAfADAQAAAAGQBEAAAAABmQQQAAAAAZoEEAAAAAGbBCAAAAABnAQCAAAAAZ0EAgAAAAECxQMBAAAAAZ8EAAAAnwQCAwAAAAMAIDYAAJIMACA3AACkDAAgEQAAAAMAIAMAAJ8LACAGAACXCgAgCgAAmAoAIAsAAJkKACAXAACbCgAgLwAApAwAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhpAQBAOIGACGlBAEA4gYAIaYEAQDiBgAhtQQCAOUGACG2BAIA5QYAIbgEAACVCrgEIg8DAACfCwAgBgAAlwoAIAoAAJgKACALAACZCgAgFwAAmwoAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhpAQBAOIGACGlBAEA4gYAIaYEAQDiBgAhtQQCAOUGACG2BAIA5QYAIbgEAACVCrgEIgvFAwEAAAABzANAAAAAAe8DQAAAAAHwAwEAAAABhwQBAAAAAaAEAQAAAAGhBAgAAAABowQAAACjBAKkBAEAAAABpQQBAAAAAagEAAAAqAQCBcUDAQAAAAHMA0AAAAAB7wNAAAAAAfgDAQAAAAH7AwAAAPsDAgXFAwEAAAABzANAAAAAAe8DQAAAAAH5AwEAAAAB-wMAAAD7AwIIxQMBAAAAAcwDQAAAAAHZAwEAAAAB2wMAAADtAwLqAwEAAAAB7QMgAAAAAe4DQAAAAAHvA0AAAAABBy-AAAAAAcUDAQAAAAHMA0AAAAAB2AMBAAAAAdkDAQAAAAHbAwAAANsDAtwDIAAAAAEFxQMBAAAAAcwDQAAAAAH1A0AAAAAB9gMBAAAAAfcDQAAAAAEJxQMBAAAAAcwDQAAAAAH1A0AAAAABgQQBAAAAAYIEAQAAAAGDBAEAAAABhAQBAAAAAYUEQAAAAAGGBEAAAAABEAMAAKsKACAHAADPCQAgDwAA0AkAIBIAANIJACDFAwEAAAABzANAAAAAAe8DQAAAAAHwAwEAAAABhwQBAAAAAaAEAQAAAAGhBAgAAAABowQAAACjBAKkBAEAAAABpQQBAAAAAaYEAQAAAAGoBAAAAKgEAgIAAAAVACA2AACsDAAgBMUDAQAAAAHMA0AAAAABlgQQAAAAAZcEAQAAAAEDAAAAEwAgNgAArAwAIDcAALEMACASAAAAEwAgAwAAqQoAIAcAAJgJACAPAACZCQAgEgAAmwkAIC8AALEMACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACHwAwEA4gYAIYcEAQDiBgAhoAQBAOIGACGhBAgAlAkAIaMEAACVCaMEIqQEAQDiBgAhpQQBAP8GACGmBAEA4gYAIagEAACWCagEIhADAACpCgAgBwAAmAkAIA8AAJkJACASAACbCQAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAh8AMBAOIGACGHBAEA4gYAIaAEAQDiBgAhoQQIAJQJACGjBAAAlQmjBCKkBAEA4gYAIaUEAQD_BgAhpgQBAOIGACGoBAAAlgmoBCILxQMBAAAAAcwDQAAAAAHvA0AAAAAB8AMBAAAAAZAEQAAAAAGYBAEAAAABmQQQAAAAAZoEEAAAAAGbBCAAAAABnAQCAAAAAZ0EAgAAAAELBAAArAsAIMUDAQAAAAHMA0AAAAAB2AMBAAAAAZgEAQAAAAGgBAEAAAABpAQBAAAAAbwEAQAAAAG9BAIAAAABvwQAAAC_BAPABAEAAAABAgAAABkAIDYAALMMACADAAAAFwAgNgAAswwAIDcAALcMACANAAAAFwAgBAAAqwsAIC8AALcMACDFAwEA4gYAIcwDQADjBgAh2AMBAOIGACGYBAEA4gYAIaAEAQD_BgAhpAQBAOIGACG8BAEA_wYAIb0EAgDlBgAhvwQAAL4JvwQjwAQBAP8GACELBAAAqwsAIMUDAQDiBgAhzANAAOMGACHYAwEA4gYAIZgEAQDiBgAhoAQBAP8GACGkBAEA4gYAIbwEAQD_BgAhvQQCAOUGACG_BAAAvgm_BCPABAEA_wYAIQXFAwEAAAABmQQCAAAAAbkEAQAAAAG6BCAAAAABuwQCAAAAAQbFAwEAAAABzANAAAAAAdkDAQAAAAGxBAAAAMMEAsMEgAAAAAHEBAEAAAABA8UDAQAAAAHMA0AAAAAB7wNAAAAAAQfFAwEAAAABxwMBAAAAAcgDAQAAAAHJA0AAAAABygNAAAAAAcsDAgAAAAHMA0AAAAABBMUDAQAAAAHMA0AAAAAB9AMBAAAAAfUDQAAAAAEcBwAA1QoAIBAAAN0KACAWAADZCgAgGAAA0QoAIBkAANIKACAaAADTCgAgGwAA1AoAIBwAANYKACAeAADXCgAgHwAA2AoAICAAANoKACAhAADbCgAgIwAA4QoAICUAAN4KACAmAADfCgAgJwAA4AoAICgAAOIKACDFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAAAABiwQBAAAAAY0EAAAAjQQCjgQgAAAAAY8EAQAAAAECAAAAngMAIDYAAL0MACAHxQMBAAAAAcYDAQAAAAHIAwEAAAAByQNAAAAAAcoDQAAAAAHLAwIAAAABzANAAAAAAQMAAAChAwAgNgAAvQwAIDcAAMIMACAeAAAAoQMAIAcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgLwAAwgwAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhHAcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICMAAOYHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACEcBwAA1QoAIBAAAN0KACAWAADZCgAgGAAA0QoAIBkAANIKACAaAADTCgAgGwAA1AoAIBwAANYKACAeAADXCgAgHwAA2AoAICAAANoKACAhAADbCgAgIwAA4QoAICQAANwKACAmAADfCgAgJwAA4AoAICgAAOIKACDFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAAAABiwQBAAAAAY0EAAAAjQQCjgQgAAAAAY8EAQAAAAECAAAAngMAIDYAAMMMACADAAAAoQMAIDYAAMMMACA3AADHDAAgHgAAAKEDACAHAADaBwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBoAANgHACAbAADZBwAgHAAA2wcAIB4AANwHACAfAADdBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICYAAOQHACAnAADlBwAgKAAA5wcAIC8AAMcMACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIRwHAADaBwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBoAANgHACAbAADZBwAgHAAA2wcAIB4AANwHACAfAADdBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICYAAOQHACAnAADlBwAgKAAA5wcAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhHAcAANUKACAQAADdCgAgFgAA2QoAIBgAANEKACAZAADSCgAgGgAA0woAIBsAANQKACAcAADWCgAgHgAA1woAICAAANoKACAhAADbCgAgIwAA4QoAICQAANwKACAlAADeCgAgJgAA3woAICcAAOAKACAoAADiCgAgxQMBAAAAAcwDQAAAAAHvA0AAAAABhwQBAAAAAYgEAQAAAAGJBAEAAAABigQBAAAAAYsEAQAAAAGNBAAAAI0EAo4EIAAAAAGPBAEAAAABAgAAAJ4DACA2AADIDAAgHAcAANUKACAQAADdCgAgFgAA2QoAIBgAANEKACAZAADSCgAgGgAA0woAIBsAANQKACAcAADWCgAgHwAA2AoAICAAANoKACAhAADbCgAgIwAA4QoAICQAANwKACAlAADeCgAgJgAA3woAICcAAOAKACAoAADiCgAgxQMBAAAAAcwDQAAAAAHvA0AAAAABhwQBAAAAAYgEAQAAAAGJBAEAAAABigQBAAAAAYsEAQAAAAGNBAAAAI0EAo4EIAAAAAGPBAEAAAABAgAAAJ4DACA2AADKDAAgAwAAAKEDACA2AADIDAAgNwAAzgwAIB4AAAChAwAgBwAA2gcAIBAAAOIHACAWAADeBwAgGAAA1gcAIBkAANcHACAaAADYBwAgGwAA2QcAIBwAANsHACAeAADcBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICUAAOMHACAmAADkBwAgJwAA5QcAICgAAOcHACAvAADODAAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACEcBwAA2gcAIBAAAOIHACAWAADeBwAgGAAA1gcAIBkAANcHACAaAADYBwAgGwAA2QcAIBwAANsHACAeAADcBwAgIAAA3wcAICEAAOAHACAjAADmBwAgJAAA4QcAICUAAOMHACAmAADkBwAgJwAA5QcAICgAAOcHACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIQMAAAChAwAgNgAAygwAIDcAANEMACAeAAAAoQMAIAcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHwAA3QcAICAAAN8HACAhAADgBwAgIwAA5gcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgLwAA0QwAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhHAcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHwAA3QcAICAAAN8HACAhAADgBwAgIwAA5gcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACEcBwAA1QoAIBAAAN0KACAWAADZCgAgGAAA0QoAIBkAANIKACAaAADTCgAgGwAA1AoAIBwAANYKACAeAADXCgAgHwAA2AoAICAAANoKACAjAADhCgAgJAAA3AoAICUAAN4KACAmAADfCgAgJwAA4AoAICgAAOIKACDFAwEAAAABzANAAAAAAe8DQAAAAAGHBAEAAAABiAQBAAAAAYkEAQAAAAGKBAEAAAABiwQBAAAAAY0EAAAAjQQCjgQgAAAAAY8EAQAAAAECAAAAngMAIDYAANIMACADAAAAoQMAIDYAANIMACA3AADWDAAgHgAAAKEDACAHAADaBwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBoAANgHACAbAADZBwAgHAAA2wcAIB4AANwHACAfAADdBwAgIAAA3wcAICMAAOYHACAkAADhBwAgJQAA4wcAICYAAOQHACAnAADlBwAgKAAA5wcAIC8AANYMACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIRwHAADaBwAgEAAA4gcAIBYAAN4HACAYAADWBwAgGQAA1wcAIBoAANgHACAbAADZBwAgHAAA2wcAIB4AANwHACAfAADdBwAgIAAA3wcAICMAAOYHACAkAADhBwAgJQAA4wcAICYAAOQHACAnAADlBwAgKAAA5wcAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhHAcAANUKACAQAADdCgAgFgAA2QoAIBgAANEKACAZAADSCgAgGgAA0woAIBsAANQKACAcAADWCgAgHgAA1woAIB8AANgKACAgAADaCgAgIQAA2woAICMAAOEKACAkAADcCgAgJQAA3goAICYAAN8KACAnAADgCgAgxQMBAAAAAcwDQAAAAAHvA0AAAAABhwQBAAAAAYgEAQAAAAGJBAEAAAABigQBAAAAAYsEAQAAAAGNBAAAAI0EAo4EIAAAAAGPBAEAAAABAgAAAJ4DACA2AADXDAAgAwAAAKEDACA2AADXDAAgNwAA2wwAIB4AAAChAwAgBwAA2gcAIBAAAOIHACAWAADeBwAgGAAA1gcAIBkAANcHACAaAADYBwAgGwAA2QcAIBwAANsHACAeAADcBwAgHwAA3QcAICAAAN8HACAhAADgBwAgIwAA5gcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAvAADbDAAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACEcBwAA2gcAIBAAAOIHACAWAADeBwAgGAAA1gcAIBkAANcHACAaAADYBwAgGwAA2QcAIBwAANsHACAeAADcBwAgHwAA3QcAICAAAN8HACAhAADgBwAgIwAA5gcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACDFAwEA4gYAIcwDQADjBgAh7wNAAOMGACGHBAEA_wYAIYgEAQD_BgAhiQQBAP8GACGKBAEA_wYAIYsEAQD_BgAhjQQAANUHjQQijgQgAO4GACGPBAEA_wYAIQ8DAACgCwAgBAAAzwoAIAYAAMwKACAKAADNCgAgCwAAzgoAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAYcEAQAAAAGkBAEAAAABpQQBAAAAAaYEAQAAAAG1BAIAAAABtgQCAAAAAbgEAAAAuAQCAgAAAAUAIDYAANwMACAIxQMBAAAAAcwDQAAAAAHZAwEAAAAB2wMAAADtAwLrAwEAAAAB7QMgAAAAAe4DQAAAAAHvA0AAAAABAwAAAAMAIDYAANwMACA3AADhDAAgEQAAAAMAIAMAAJ8LACAEAACaCgAgBgAAlwoAIAoAAJgKACALAACZCgAgLwAA4QwAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhpAQBAOIGACGlBAEA4gYAIaYEAQDiBgAhtQQCAOUGACG2BAIA5QYAIbgEAACVCrgEIg8DAACfCwAgBAAAmgoAIAYAAJcKACAKAACYCgAgCwAAmQoAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQDiBgAhpAQBAOIGACGlBAEA4gYAIaYEAQDiBgAhtQQCAOUGACG2BAIA5QYAIbgEAACVCrgEIhwHAADVCgAgEAAA3QoAIBgAANEKACAZAADSCgAgGgAA0woAIBsAANQKACAcAADWCgAgHgAA1woAIB8AANgKACAgAADaCgAgIQAA2woAICMAAOEKACAkAADcCgAgJQAA3goAICYAAN8KACAnAADgCgAgKAAA4goAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEAQAAAAGLBAEAAAABjQQAAACNBAKOBCAAAAABjwQBAAAAAQIAAACeAwAgNgAA4gwAIAQHAACjBwAgxQMBAAAAAcwDQAAAAAHwAwEAAAABAgAAAKcEACA2AADkDAAgBsUDAQAAAAHMA0AAAAAB5gMBAAAAAecDAQAAAAHoAwEAAAAB6QMCAAAAAQMAAAChAwAgNgAA4gwAIDcAAOkMACAeAAAAoQMAIAcAANoHACAQAADiBwAgGAAA1gcAIBkAANcHACAaAADYBwAgGwAA2QcAIBwAANsHACAeAADcBwAgHwAA3QcAICAAAN8HACAhAADgBwAgIwAA5gcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgLwAA6QwAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhHAcAANoHACAQAADiBwAgGAAA1gcAIBkAANcHACAaAADYBwAgGwAA2QcAIBwAANsHACAeAADcBwAgHwAA3QcAICAAAN8HACAhAADgBwAgIwAA5gcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACEDAAAAMAAgNgAA5AwAIDcAAOwMACAGAAAAMAAgBwAAlQcAIC8AAOwMACDFAwEA4gYAIcwDQADjBgAh8AMBAOIGACEEBwAAlQcAIMUDAQDiBgAhzANAAOMGACHwAwEA4gYAIQsJAACRBwAgFQAAkAcAIMUDAQAAAAHMA0AAAAAB2QMBAAAAAdsDAAAA7QMC6gMBAAAAAesDAQAAAAHtAyAAAAAB7gNAAAAAAe8DQAAAAAECAAAANAAgNgAA7QwAIAMAAAAyACA2AADtDAAgNwAA8QwAIA0AAAAyACAJAACCBwAgFQAAgQcAIC8AAPEMACDFAwEA4gYAIcwDQADjBgAh2QMBAP8GACHbAwAA_gbtAyLqAwEA4gYAIesDAQDiBgAh7QMgAO4GACHuA0AA5AYAIe8DQADjBgAhCwkAAIIHACAVAACBBwAgxQMBAOIGACHMA0AA4wYAIdkDAQD_BgAh2wMAAP4G7QMi6gMBAOIGACHrAwEA4gYAIe0DIADuBgAh7gNAAOQGACHvA0AA4wYAIRwHAADVCgAgEAAA3QoAIBYAANkKACAYAADRCgAgGQAA0goAIBoAANMKACAbAADUCgAgHAAA1goAIB4AANcKACAfAADYCgAgIQAA2woAICMAAOEKACAkAADcCgAgJQAA3goAICYAAN8KACAnAADgCgAgKAAA4goAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEAQAAAAGLBAEAAAABjQQAAACNBAKOBCAAAAABjwQBAAAAAQIAAACeAwAgNgAA8gwAIAMAAAChAwAgNgAA8gwAIDcAAPYMACAeAAAAoQMAIAcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAhAADgBwAgIwAA5gcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgLwAA9gwAIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhHAcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAhAADgBwAgIwAA5gcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACELBQAA0AcAIMUDAQAAAAHGAwEAAAABzANAAAAAAfUDQAAAAAGBBAEAAAABggQBAAAAAYMEAQAAAAGEBAEAAAABhQRAAAAAAYYEQAAAAAECAAAAVQAgNgAA9wwAIBwHAADVCgAgEAAA3QoAIBYAANkKACAYAADRCgAgGQAA0goAIBoAANMKACAbAADUCgAgHAAA1goAIB4AANcKACAfAADYCgAgIAAA2goAICEAANsKACAkAADcCgAgJQAA3goAICYAAN8KACAnAADgCgAgKAAA4goAIMUDAQAAAAHMA0AAAAAB7wNAAAAAAYcEAQAAAAGIBAEAAAABiQQBAAAAAYoEAQAAAAGLBAEAAAABjQQAAACNBAKOBCAAAAABjwQBAAAAAQIAAACeAwAgNgAA-QwAIAMAAABTACA2AAD3DAAgNwAA_QwAIA0AAABTACAFAADCBwAgLwAA_QwAIMUDAQDiBgAhxgMBAOIGACHMA0AA4wYAIfUDQADjBgAhgQQBAOIGACGCBAEA_wYAIYMEAQD_BgAhhAQBAP8GACGFBEAA5AYAIYYEQADjBgAhCwUAAMIHACDFAwEA4gYAIcYDAQDiBgAhzANAAOMGACH1A0AA4wYAIYEEAQDiBgAhggQBAP8GACGDBAEA_wYAIYQEAQD_BgAhhQRAAOQGACGGBEAA4wYAIQMAAAChAwAgNgAA-QwAIDcAAIANACAeAAAAoQMAIAcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgLwAAgA0AIMUDAQDiBgAhzANAAOMGACHvA0AA4wYAIYcEAQD_BgAhiAQBAP8GACGJBAEA_wYAIYoEAQD_BgAhiwQBAP8GACGNBAAA1QeNBCKOBCAA7gYAIY8EAQD_BgAhHAcAANoHACAQAADiBwAgFgAA3gcAIBgAANYHACAZAADXBwAgGgAA2AcAIBsAANkHACAcAADbBwAgHgAA3AcAIB8AAN0HACAgAADfBwAgIQAA4AcAICQAAOEHACAlAADjBwAgJgAA5AcAICcAAOUHACAoAADnBwAgxQMBAOIGACHMA0AA4wYAIe8DQADjBgAhhwQBAP8GACGIBAEA_wYAIYkEAQD_BgAhigQBAP8GACGLBAEA_wYAIY0EAADVB40EIo4EIADuBgAhjwQBAP8GACEDBQACDgAgFnwfEwdDBg4AHhBcCxZKERgGAxlABBpBBRtCBRxEBx5IFh9JFiBOFyFSGCNjGiRWGSVeHCZfCSdiAShnHQcDAAIEFgcGCgQKDgULEgYOABUXMRACBAADBQACAwcAAwgAAgkAAgIFAAIHAAMGAwACBwADDgAPDxoIECMLEiwOAwQABw0eCQ4ACgIFAAIMAAgBDR8ABAQABwUAAg4ADREnDAEQAAsBESgAAQQABwMPLQAQLgASLwADBwADDgAUFjURBAkAAg4AExQ5EhUAEAETABEBFDoAARY7AAQEPwAGPAAKPQALPgACCAACHQACAQUAAgEFAAIDBQACDgAbI1oaAgUAAiIAGQEjWwABBQACAQUAAhEHbAAQdAAWcAAYaAAZaQAaagAbawAcbQAebgAfbwAgcQAhcgAjdwAkcwAmdQAndgAoeAABKQABARZ9AAABBQACAQUAAgMOACU8ACY9ACcAAAADDgAlPAAmPQAnASkAAQEpAAEDDgAsPAAtPQAuAAAAAw4ALDwALT0ALgEEAAcBBAAHBQ4AMzwANj0AN14ANF8ANQAAAAAABQ4AMzwANj0AN14ANF8ANQIFAAIMAAgCBQACDAAIBQ4APDwAPz0AQF4APV8APgAAAAAABQ4APDwAPz0AQF4APV8APgEDAAIBAwACBQ4ARTwASD0ASV4ARl8ARwAAAAAABQ4ARTwASD0ASV4ARl8ARwIFAAIHAAMCBQACBwADBQ4ATjwAUT0AUl4AT18AUAAAAAAABQ4ATjwAUT0AUl4AT18AUAMHAAMIAAIJAAIDBwADCAACCQACAw4AVzwAWD0AWQAAAAMOAFc8AFg9AFkAAAADDgBfPABgPQBhAAAAAw4AXzwAYD0AYQIDAAIHAAMCAwACBwADBQ4AZjwAaT0Aal4AZ18AaAAAAAAABQ4AZjwAaT0Aal4AZ18AaAEEAAcBBAAHAw4AbzwAcD0AcQAAAAMOAG88AHA9AHECBAAHBQACAgQABwUAAgUOAHY8AHk9AHpeAHdfAHgAAAAAAAUOAHY8AHk9AHpeAHdfAHgBEAALARAACwUOAH88AIIBPQCDAV4AgAFfAIEBAAAAAAAFDgB_PACCAT0AgwFeAIABXwCBAQIEAAMFAAICBAADBQACBQ4AiAE8AIsBPQCMAV4AiQFfAIoBAAAAAAAFDgCIATwAiwE9AIwBXgCJAV8AigEAAAMOAJEBPACSAT0AkwEAAAADDgCRATwAkgE9AJMBAQUAAgEFAAIDDgCYATwAmQE9AJoBAAAAAw4AmAE8AJkBPQCaAQEFAAIBBQACAw4AnwE8AKABPQChAQAAAAMOAJ8BPACgAT0AoQECCAACHQACAggAAh0AAgMOAKYBPACnAT0AqAEAAAADDgCmATwApwE9AKgBAQUAAgEFAAIDDgCtATwArgE9AK8BAAAAAw4ArQE8AK4BPQCvAQEFAAIBBQACAw4AtAE8ALUBPQC2AQAAAAMOALQBPAC1AT0AtgEBBwADAQcAAwMOALsBPAC8AT0AvQEAAAADDgC7ATwAvAE9AL0BAgkAAhUAEAIJAAIVABADDgDCATwAwwE9AMQBAAAAAw4AwgE8AMMBPQDEAQETABEBEwARBQ4AyQE8AMwBPQDNAV4AygFfAMsBAAAAAAAFDgDJATwAzAE9AM0BXgDKAV8AywEAAAADDgDTATwA1AE9ANUBAAAAAw4A0wE8ANQBPQDVAQEFAAIBBQACAw4A2gE8ANsBPQDcAQAAAAMOANoBPADbAT0A3AECBQACIgAZAgUAAiIAGQUOAOEBPADkAT0A5QFeAOIBXwDjAQAAAAAABQ4A4QE8AOQBPQDlAV4A4gFfAOMBKgIBK34BLH8BLYABAS6BAQEwgwEBMYUBITKGASIziAEBNIoBITWLASM4jAEBOY0BATqOASE-kQEkP5IBKECTAR9BlAEfQpUBH0OWAR9ElwEfRZkBH0abASFHnAEpSJ4BH0mgASFKoQEqS6IBH0yjAR9NpAEhTqcBK0-oAS9QqQEIUaoBCFKrAQhTrAEIVK0BCFWvAQhWsQEhV7IBMFi0AQhZtgEhWrcBMVu4AQhcuQEIXboBIWC9ATJhvgE4Yr8BCWPAAQlkwQEJZcIBCWbDAQlnxQEJaMcBIWnIATlqygEJa8wBIWzNATptzgEJbs8BCW_QASFw0wE7cdQBQXLVAQNz1gEDdNcBA3XYAQN22QEDd9sBA3jdASF53gFCeuABA3viASF84wFDfeQBA37lAQN_5gEhgAHpAUSBAeoBSoIB6wEGgwHsAQaEAe0BBoUB7gEGhgHvAQaHAfEBBogB8wEhiQH0AUuKAfYBBosB-AEhjAH5AUyNAfoBBo4B-wEGjwH8ASGQAf8BTZEBgAJTkgGBAgWTAYICBZQBgwIFlQGEAgWWAYUCBZcBhwIFmAGJAiGZAYoCVJoBjAIFmwGOAiGcAY8CVZ0BkAIFngGRAgWfAZICIaABlQJWoQGWAlqiAZgCW6MBmQJbpAGcAlulAZ0CW6YBngJbpwGgAluoAaICIakBowJcqgGlAlurAacCIawBqAJdrQGpAluuAaoCW68BqwIhsAGuAl6xAa8CYrIBsAIHswGxAge0AbICB7UBswIHtgG0Age3AbYCB7gBuAIhuQG5AmO6AbsCB7sBvQIhvAG-AmS9Ab8CB74BwAIHvwHBAiHAAcQCZcEBxQJrwgHGAg7DAccCDsQByAIOxQHJAg7GAcoCDscBzAIOyAHOAiHJAc8CbMoB0QIOywHTAiHMAdQCbc0B1QIOzgHWAg7PAdcCIdAB2gJu0QHbAnLSAdwCC9MB3QIL1AHeAgvVAd8CC9YB4AIL1wHiAgvYAeQCIdkB5QJz2gHnAgvbAekCIdwB6gJ03QHrAgveAewCC98B7QIh4AHwAnXhAfECe-IB8gIM4wHzAgzkAfQCDOUB9QIM5gH2AgznAfgCDOgB-gIh6QH7AnzqAf0CDOsB_wIh7AGAA33tAYEDDO4BggMM7wGDAyHwAYYDfvEBhwOEAfIBiAME8wGJAwT0AYoDBPUBiwME9gGMAwT3AY4DBPgBkAMh-QGRA4UB-gGTAwT7AZUDIfwBlgOGAf0BlwME_gGYAwT_AZkDIYACnAOHAYECnQONAYICnwMCgwKgAwKEAqMDAoUCpAMChgKlAwKHAqcDAogCqQMhiQKqA44BigKsAwKLAq4DIYwCrwOPAY0CsAMCjgKxAwKPArIDIZACtQOQAZECtgOUAZICtwMZkwK4AxmUArkDGZUCugMZlgK7AxmXAr0DGZgCvwMhmQLAA5UBmgLCAxmbAsQDIZwCxQOWAZ0CxgMZngLHAxmfAsgDIaACywOXAaECzAObAaICzgMcowLPAxykAtEDHKUC0gMcpgLTAxynAtUDHKgC1wMhqQLYA5wBqgLaAxyrAtwDIawC3QOdAa0C3gMcrgLfAxyvAuADIbAC4wOeAbEC5AOiAbIC5QMWswLmAxa0AucDFrUC6AMWtgLpAxa3AusDFrgC7QMhuQLuA6MBugLwAxa7AvIDIbwC8wOkAb0C9AMWvgL1Axa_AvYDIcAC-QOlAcEC-gOpAcIC-wMYwwL8AxjEAv0DGMUC_gMYxgL_AxjHAoEEGMgCgwQhyQKEBKoBygKGBBjLAogEIcwCiQSrAc0CigQYzgKLBBjPAowEIdACjwSsAdECkASwAdICkQQd0wKSBB3UApMEHdUClAQd1gKVBB3XApcEHdgCmQQh2QKaBLEB2gKcBB3bAp4EIdwCnwSyAd0CoAQd3gKhBB3fAqIEIeACpQSzAeECpgS3AeICqAQQ4wKpBBDkAqsEEOUCrAQQ5gKtBBDnAq8EEOgCsQQh6QKyBLgB6gK0BBDrArYEIewCtwS5Ae0CuAQQ7gK5BBDvAroEIfACvQS6AfECvgS-AfICvwQR8wLABBH0AsEEEfUCwgQR9gLDBBH3AsUEEfgCxwQh-QLIBL8B-gLKBBH7AswEIfwCzQTAAf0CzgQR_gLPBBH_AtAEIYAD0wTBAYED1ATFAYID1QQSgwPWBBKEA9cEEoUD2AQShgPZBBKHA9sEEogD3QQhiQPeBMYBigPgBBKLA-IEIYwD4wTHAY0D5AQSjgPlBBKPA-YEIZAD6QTIAZED6gTOAZID7ATPAZMD7QTPAZQD8ATPAZUD8QTPAZYD8gTPAZcD9ATPAZgD9gQhmQP3BNABmgP5BM8BmwP7BCGcA_wE0QGdA_0EzwGeA_4EzwGfA_8EIaADggXSAaEDgwXWAaIDhAUXowOFBRekA4YFF6UDhwUXpgOIBRenA4oFF6gDjAUhqQONBdcBqgOPBRerA5EFIawDkgXYAa0DkwUXrgOUBRevA5UFIbADmAXZAbEDmQXdAbIDmgUaswObBRq0A5wFGrUDnQUatgOeBRq3A6AFGrgDogUhuQOjBd4BugOlBRq7A6cFIbwDqAXfAb0DqQUavgOqBRq_A6sFIcADrgXgAcEDrwXmAQ"
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
import crypto2 from "crypto";
var register = async (payload) => {
  const existingUser = await prisma.user.findFirst({ where: { OR: [{ email: payload.email }, { username: payload.email }] } });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  let username, email;
  if (emailRegex.test(payload.email)) {
    username = payload.email.split("@")[0];
    email = payload.email;
  } else {
    username = payload.email;
  }
  if (existingUser) {
    throw new AppError_default(400, "User already exists");
  }
  const hashedPassword = await bcrypt.hash(payload.password, 10);
  const user = await prisma.user.create({
    data: {
      username,
      email,
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
  const { password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword
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
var hashGoogleLoginCode = (code) => crypto2.createHash("sha256").update(code).digest("hex");
var createGoogleLoginCode = async (userId) => {
  const code = crypto2.randomBytes(32).toString("hex");
  const codeHash = hashGoogleLoginCode(code);
  await prisma.googleLoginCode.create({
    data: {
      codeHash,
      userId,
      expiresAt: new Date(Date.now() + 2 * 60 * 1e3)
    }
  });
  return code;
};
var exchangeGoogleLoginCode = async (code) => {
  const codeHash = hashGoogleLoginCode(code);
  const user = await prisma.$transaction(async (tx) => {
    const loginCode = await tx.googleLoginCode.findUnique({
      where: { codeHash }
    });
    if (!loginCode || loginCode.expiresAt <= /* @__PURE__ */ new Date()) {
      throw new AppError_default(401, "Invalid or expired Google login code");
    }
    const consumed = await tx.googleLoginCode.deleteMany({
      where: {
        id: loginCode.id,
        codeHash,
        expiresAt: { gt: /* @__PURE__ */ new Date() }
      }
    });
    if (consumed.count !== 1) {
      throw new AppError_default(401, "Google login code has already been used");
    }
    const foundUser = await tx.user.findUnique({
      where: { id: loginCode.userId }
    });
    if (!foundUser || !foundUser.isActive) {
      throw new AppError_default(401, "Google login is unavailable for this account");
    }
    return foundUser;
  });
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
var AuthServices = { googleLogin, register, login, refreshAccessToken, logOut, logOutAllDevices, getMe, changePassword, createGoogleLoginCode, exchangeGoogleLoginCode };

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
    const { user } = await AuthServices.googleLogin(code);
    const loginCode = await AuthServices.createGoogleLoginCode(user.id);
    return res.redirect(
      `${process.env.FRONTEND_URL}/api/auth/google/callback?code=${encodeURIComponent(loginCode)}`
    );
  } catch (err) {
    next(err);
  }
};
var exchangeGoogleLoginCode2 = async (req, res, next) => {
  try {
    const { code } = req.body;
    if (typeof code !== "string" || !code) {
      throw new AppError_default(400, "Google login code is required");
    }
    const { user, accessToken, sessionToken } = await AuthServices.exchangeGoogleLoginCode(code);
    return res.status(status2.OK).json({
      success: true,
      message: "Google login successful",
      data: user,
      token: accessToken,
      sessionToken
    });
  } catch (err) {
    return next(err);
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
  googleLogin: googleLogin2,
  exchangeGoogleLoginCode: exchangeGoogleLoginCode2
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
var optionalAuth = (...authRoles) => async (req, res, next) => {
  try {
    console.log("========== CHECK AUTH ==========");
    console.log("METHOD:", req.method);
    console.log("(or)ORIGINAL URL:", req.originalUrl);
    console.log("(or)PATH:", req.path);
    console.log("PARAMS:", req.params);
    console.log("COOKIE:", req.headers.cookie);
    console.log("================================");
    const accessToken = CookieUtils.getCookie(req, "accessToken");
    if (!accessToken) {
      console.log("NO ACCESSTOKEN");
      return next();
    }
    const verifiedToken = jwtUtils.verifyToken(accessToken, process.env.ACCESS_SECRET);
    if (!verifiedToken.success) {
      throw new AppError_default(
        status3.UNAUTHORIZED,
        "You are not logged in or your access token is invalid in optional Auth"
      );
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
    console.log("METHOD:", req.method);
    console.log("(or)ORIGINAL URL:", req.originalUrl);
    console.log("(or)PATH:", req.path);
    console.log("PARAMS:", req.params);
    console.log("COOKIE:", req.headers.cookie);
    console.log("================================");
    console.log(err.message);
    next(err);
  }
};

// src/app/modules/auth/auth.routes.ts
var router = Router();
router.post("/register", AuthControllers.register);
router.post("/login", AuthControllers.login);
router.post("/refresh", AuthControllers.refresh);
router.get("/google/callback", AuthControllers.googleLogin);
router.post("/google/exchange", AuthControllers.exchangeGoogleLoginCode);
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
    where: { visibility: "PUBLIC" },
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      createdAt: true,
      memberCount: true,
      taskCount: true,
      creator: {
        select: { username: true }
      }
    }
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
  optionalAuth(GlobalRole.USER),
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
  const [ownProgressAnalytics, membersProgressAnalytics] = await Promise.all([
    // Your own progress history
    prisma.activityDailyProgress.findMany({
      where: {
        activityId,
        userId
      },
      orderBy: {
        date: "asc"
      }
    }),
    // All other members' progress histories
    prisma.activityDailyProgress.findMany({
      where: {
        activityId,
        userId: { not: userId }
      },
      include: {
        user: {
          select: { name: true, username: true, id: true }
        }
      },
      orderBy: [{ userId: "asc" }, { date: "asc" }]
    })
  ]);
  const groupedMembersProgress = membersProgressAnalytics.reduce((groups, record) => {
    const { userId: userId2, user } = record;
    if (!groups[userId2]) {
      groups[userId2] = {
        username: user.name,
        progress: []
      };
    }
    groups[userId2].progress.push(record);
    return groups;
  }, {});
  return {
    ownProgressAnalytics,
    membersProgressAnalytics: groupedMembersProgress
  };
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
      message: "Daily progress analytics retrieved successfullyyyyyyy",
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
var allowedOrigins = ["http://localhost:3000", "http://127.0.0.1:3000", process.env.FRONTEND_URL];
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
    const token = socket.handshake.auth?.token || getAccessToken2(cookieHeader);
    console.log("this is the token in socket", token);
    if (!token) {
      return next(new Error("Unauthorized hehehe: no token"));
    }
    const decoded = jwt2.verify(token, process.env.ACCESS_SECRET);
    console.log("this is decoded in socket", decoded);
    if (!decoded.userId) {
      return next(new Error("Unauthorized hahaha: invalid payload"));
    }
    socket.data.userId = decoded.userId;
    next();
  } catch (error) {
    console.log("THIS IS ERROR MESSAGE", error.message);
    next(error.message);
  }
};

// src/app/socket/socket.server.ts
var allowedOrigins2 = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  process.env.FRONTEND_URL
].filter((origin) => Boolean(origin));
var initializeSocket = (httpServer2) => {
  const io2 = new Server(httpServer2, {
    cors: {
      origin: allowedOrigins2,
      credentials: true,
      methods: ["GET", "POST"]
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
