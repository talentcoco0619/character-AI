import { StreamingTextResponse, LangChainStream } from "ai";
import { auth, currentUser } from "@clerk/nextjs/server";
import { CallbackManager } from "langchain/callbacks";
import { Replicate } from "langchain/llms/replicate";
import { NextResponse } from "next/server";

import { MemoryManager } from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";

export async function POST(
    request: Request,
    { params }: {params: {chatId: string}}
) {
    try {
        const { prompt } = await request.json();
        const user = await currentUser();

        if(!user || !user.firstName || !user.id) {
            return new NextResponse("Unauthorized", { status: 401});
        }

        const identifier = request.url + "-" + user.id;
        const { success } = await rateLimit(identifier);

        if(!success) {
            return new NextResponse("Rate limit exceeded", { status: 429});
        }

        const character = await prismadb.character.update({
            where: {
                id: params.chatId,
                userId: user.id,
            },
            data: {
                messages: {
                    create: {
                        content: prompt,
                        role: "user",
                        userId: user.id,
                    }
                }
            }
        });

        if(!character) {
            return new NextResponse("Character not found", { status: 404 });
        }

        const  name = character.id;
        const character_file_name = name + ".txt";
        
        const characterKey = {
            characterName: name,
            userId: user.id,
            modelName: "llama2-13b",
        };

        const memoryManager = await MemoryManager.getInstance();

        const records = await memoryManager.readLatestHistory(characterKey);

        if (records.length === 0) {
            await memoryManager.seedChatHistory(character.seed, "\n\n", characterKey)
        }

        await memoryManager.writeToHistory("User:" + prompt + "\n", characterKey);

        const recentChatHistory = await memoryManager.readLatestHistory(characterKey);

        const similarDocs = await memoryManager.vectorSearch(
            recentChatHistory,
            character_file_name,
        );

        let relevantHistory = "";

        if(!!similarDocs && similarDocs.length !== 0) {
            relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
        }

        const { handlers } = LangChainStream();

        const model = new Replicate({
            model: 
        })
    } catch (error) {
        console.log("[CHAT_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}