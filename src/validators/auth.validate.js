import * as z from "zod";

const authValidate = z.object({
  email: z
    .email()
    .min(5, "email minimal 5 huruf")
    .max(30, "email maksimal 30 huruf"),
  password: z
    .string()
    .min(5, "password minimal 5 huruf")
    .max(30, "password maksimal 30 huruf"),
});

export default authValidate;
