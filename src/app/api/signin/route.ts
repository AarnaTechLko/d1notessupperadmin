import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    
    // Check if user exists
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user.length) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user[0].password);
    if (!isValidPassword) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    // Generate JWT Token
    const token = jwt.sign({ id: user[0].id, email: user[0].email }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    return NextResponse.json({
      token,
      user: { 
        name: `${user[0].firstName} ${user[0].lastName}`,  // ✅ Correct way to get full name
        email: user[0].email 
      },
    });
    
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
