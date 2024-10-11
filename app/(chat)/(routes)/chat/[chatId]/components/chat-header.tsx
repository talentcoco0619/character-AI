"use client";

import BotAvatar from "@/components/bot-avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@clerk/nextjs";
import { Character, Message } from "@prisma/client";
import axios from "axios";
import { ChevronLeft, Edit, MessageSquare, MoreVertical, Trash } from "lucide-react";
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
    const { user } = useUser();
    const { toast } = useToast();

    const onDelete = async () => {
        try {
            await axios.delete(`/api/character/${character.id}`)

            toast ({
                description: "Success."
            })

            router.refresh();
            router.push("/");
        } catch (error) {
            toast({
                variant: "destructive",
                description: "Something went wrong",
              })
        }
    }

    return (
        <div className="flex w-full justify-between items-center border-b border-primary/10 pb-4">
            <div className="flex gap-x-2 items-center">
                <Button onClick={() => router.back()} size="icon" variant="ghost">
                    <ChevronLeft className="h-8 w-8"/>
                </Button>
                <BotAvatar src={character.src}/>
                <div className="flex flex-col gap-y-1">
                    <div className="flex items-center gap-x-2">
                        <p className="font-bold">
                            {character.name}
                        </p>
                        <div className="flex items-center text-xs text-muted-forground">
                            <MessageSquare className="w-3 h-3 mr-1"/>
                            {character._count.messages}
                        </div>
                    </div>
                    <p className="text-s text-muted-foreground">
                        Created by {character.userName}
                    </p>
                </div>
            </div>
            {user?.id === character.userId && (
                <DropdownMenu>
                    <DropdownMenuTrigger >
                        <Button variant="secondary" size="icon">
                            <MoreVertical />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => router.push(`/character/${character.id}`)}>
                            <Edit className="w-4 h-4 mr-2"/>Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onDelete}>
                            <Trash className="w-4 h-4 mr-2"/>Delete
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
        </div>
    )
}