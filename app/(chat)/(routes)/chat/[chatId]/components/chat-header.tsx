"use client";

import BotAvatar from "@/components/bot-avatar";
import { Button } from "@/components/ui/button";
import { Character, Message } from "@prisma/client";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface ChatHeaderProps {
    character: Character & {
        messages: Message[];
        _count: {
            messages: number;
        }
    }
}

export const ChatHeader = ({
    character
}: ChatHeaderProps) => {
    const router = useRouter();

    return (
        <div className="flex w-full justify-between items-center border-b border-primary/10 pb-4">
            <div className="flex gap-x-2 items-center">
                <Button onClick={() => router.back()} size="icon" variant="ghost">
                    <ChevronLeft className="h-8 w-8"/>
                </Button>
                <BotAvatar src={character.src}/>
            </div>
        </div>
    )
}