import * as z from "zod";

const registerValidate = z.object({
  username: z
    .string()
    .min(5, "username minimal 5 huruf")
    .max(30, "username maksimal 30 huruf"),
  email: z
    .email()
    .min(5, "email minimal 5 huruf")
    .max(30, "email maksimal 30 huruf"),
  password: z
    .string()
    .min(5, "password minimal 5 huruf")
    .max(30, "password maksimal 30 huruf"),
  verify_password: z.string(),
});

export default registerValidate;
