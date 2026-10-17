import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(()=>({
    getCookie:vi.fn(),
    verifyToken:vi.fn()
}))

vi.mock("../utils/cookie.js",()=>({
    CookieUtils:{
      getCookie:mocks.getCookie}
}))
vi.mock("../utils/jwt.js",()=>({
   jwtUtils:{ verifyToken:mocks.verifyToken}
}))

import { checkAuth, optionalAuth } from "./checkAuth.js";
import AppError from "../errorHelpers/AppError.js";
import type { Request, Response, NextFunction } from "express";
import status from "http-status";

function makeReq(overrides: Partial<Request> = {}): Request {
  return {
    headers: {},
    method: "GET",
    originalUrl: "/test",
    path: "/test",
    params: {},
    user: undefined,
    ...overrides,
  } as unknown as Request;
}

const res = {} as Response
const makeNext = ()=> vi.fn() as unknown as NextFunction


beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "log").mockImplementation(() => {});
});

describe("checkAuth", () => {
  it("throws UNAUTHORIZED when no access token cookie exists", async () => {
    mocks.getCookie.mockReturnValueOnce(undefined)

    const req = makeReq()
    const next = makeNext()

    await checkAuth()(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    const err = (next as any).mock.calls[0][0]
    expect(err).toBeInstanceOf(AppError)
    expect(err.statuscode).toBe(401)
    expect(err.message).toBe("Access token undefinedd")
  })})

  it("throws UNAUTHORIZED when token verification fails", async () => {
    mocks.getCookie.mockReturnValueOnce("bad-token")
    mocks.verifyToken.mockReturnValue({success:false})

    const req = makeReq()
    const next = makeNext()

    await checkAuth()(req,res,next)
    const err = (next as any).mock.calls[0][0];
    expect(err).toBeInstanceOf(AppError);
    expect(err.statuscode).toBe(status.UNAUTHORIZED);
    expect(err.message).toMatch(/not logged in/i);
  })
  it("attaches user to req  and calls next() when token is valid", async () => {
    mocks.getCookie.mockReturnValueOnce("good-token")
    mocks.verifyToken.mockReturnValue({
      success: true,
      data: { userId: "u1", role: "USER", email: "a@b.com" },
    });

    const req = makeReq()
    const next = makeNext()

    await checkAuth()(req,res,next)

    expect(req.user).toEqual({
      userId: "u1",
      role: "USER",
      email: "a@b.com",
    });
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith()
  })

  it("allows when user role is in the allowed list", async () => {
    mocks.getCookie.mockReturnValue("good-token");
    mocks.verifyToken.mockReturnValue({
      success: true,
      data: { userId: "u1", role: "USER", email: "a@b.com" },
    });

    const req = makeReq();
    const next = makeNext();

    await checkAuth("SUPERADMIN", "USER")(req, res, next);

    expect(next).toHaveBeenCalledWith(); // no error
    expect(req.user.role).toBe("USER");
  });