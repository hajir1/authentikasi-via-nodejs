import request   from "supertest";
import jwt from "jsonwebtoken";
import app from "../../server.js"; // sesuaikan path ke Express instance kamu
import prisma from "../config/prisma";

describe("Login with old refresh token", () => {
  const testUser = {
    email: "hajir123@gmail.com",
    password: "hajir123",
  };

  let oldRefreshToken;

  beforeAll(async () => {
    // Kosongkan seluruh refresh token dulu
    await prisma.refresh_tokens.deleteMany({});

    // Pastikan user test ada
    const user = await prisma.users.findFirst({
      where: { email: testUser.email },
    });

    if (!user) throw new Error("User test tidak ditemukan");

    // Generate refresh token lama (yang tidak akan ada di DB)
    oldRefreshToken = jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN, {
      expiresIn: "7d",
    });
  });

  it("harus berhasil login dan anggap token lama sebagai reuse", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", [`jwt=${oldRefreshToken}`])
      .send(testUser);

    // Debug respons
    console.log(res.body);

    // Cek respons
    expect(res.statusCode).toBe(200);
    expect(res.body.accessToken).toBeDefined();

    // Cek cookie baru dikirim
    const setCookie = res.headers["set-cookie"];
    expect(setCookie).toBeDefined();
    expect(setCookie[0]).toMatch(/jwt=.*HttpOnly/);

    // Cek bahwa refresh token baru disimpan di DB
    const user = await prisma.users.findFirst({
      where: { email: testUser.email },
      include: { refresh_token: true },
    });
    expect(user.refresh_token.length).toBe(1); // hanya 1 token baru
  });
});
