import { beforeEach, describe, expect, it, vi } from "vitest";

// Create a mock that can be accessed by Vitest's module mock.
const mocks = vi.hoisted(() => ({
  findFirst: vi.fn(),
  create: vi.fn(),
  hash: vi.fn(),
  compare: vi.fn(),
  getAccessToken: vi.fn(),
  createSession: vi.fn(),
}));

// Mock Prisma before importing the service.
vi.mock("../../lib/prisma.js", () => ({
  prisma: {
    user:{
      findFirst:mocks.findFirst,
      create:mocks.create
    }
  }
}));
vi.mock("../../utils/token.js", () => ({
  tokenUtils: {
    getAccessToken:mocks.getAccessToken
  }
}));
vi.mock("../../utils/session.js", () => ({
  sessionUtils: {
    createSession: mocks.createSession,
  },
}));
vi.mock( "bcrypt", () => ({
  default: {
    compare: mocks.compare,
    hash: mocks.hash
  },
}));






import { AuthServices } from "./auth.services";
import { tokenUtils } from "../../utils/token";

const user = {
  id: "user-1",
  username: "alice",
  email: "alice@example.com",
  password: "hashed-password",
  globalRole: "USER",
};

describe("register", () => {
    beforeEach(() => {
    vi.clearAllMocks(),
        vi.spyOn(console, "log").mockImplementation(() => {});
    });


  it("successful registration ", async() => {
    mocks.findFirst.mockResolvedValueOnce(null);
    mocks.hash.mockResolvedValueOnce("hashed-password");
    mocks.create.mockResolvedValueOnce(user);
    mocks.getAccessToken.mockReturnValue("token");
    mocks.createSession.mockResolvedValueOnce("session");
    const res = await AuthServices.register(
     { 
      email:"alice@example.com",
      password:"password"
    }
    );
    expect(mocks.findFirst).toHaveBeenCalledWith({
      where: { OR: [{ email: "alice@example.com" }, { username: "alice@example.com" }] },
    })
    expect(mocks.hash).toHaveBeenCalledWith("password", 10);
    expect(mocks.create).toHaveBeenCalledWith({
      data: {
        username: "alice",
        email: "alice@example.com",
        password: "hashed-password",
      },
    });
    expect(mocks.getAccessToken).toHaveBeenCalledWith({
      userId: "user-1",
      role: "USER",
      email: "alice@example.com"
    });
    expect(mocks.createSession).toHaveBeenCalledWith("user-1");
    expect(res).toEqual({user: {
        id: "user-1",
        username: "alice",
        email: "alice@example.com",
        globalRole: "USER",
      },accessToken:"token",sessionToken:"session"})

    expect(res.user).not.toHaveProperty("password");
    
  });
});
