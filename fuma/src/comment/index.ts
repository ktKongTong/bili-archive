import { NextComment } from "@fuma-comment/server/next";
import { storage, auth } from './config'

export const commentRoute = NextComment({
  auth: auth,
  storage,
});