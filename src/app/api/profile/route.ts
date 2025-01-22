import { NextResponse, NextRequest } from "next/server";
import { getAuth } from "@clerk/nextjs/server";
import { z } from "zod";

const profileSchema = z.object({
    fullName: z.string().min(2),
    companyName: z.string().min(2),
});

export async function POST(request: NextRequest) {
    try {
        const { userId } = getAuth(request);

        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const validatedData = profileSchema.parse(body);

        // Here you would typically save this data to your database
        // For now, we'll just return success

        return NextResponse.json(
            { message: "Profile updated successfully" },
            { status: 200 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: "Invalid data", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}