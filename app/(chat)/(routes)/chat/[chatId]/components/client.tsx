"use client";

import { Character, Message } from "@prisma/client";
import { ChatHeader } from "./chat-header";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useCompletion } from "ai/react";
import ChatForm from "@/components/chat-form";
import ChatMessages from "@/components/chat-messages";
import { ChatMessageProps } from "@/components/chat-message";

interface ChatClientProps {
  character: Character & {
    messages: Message[];
    _count: {
      messages: number;
    };
  };
}

export const ChatClient = ({ character }: ChatClientProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessageProps[]>(character.messages);

  const { input, isLoading, handleInputChange, handleSubmit, setInput } =
    useCompletion({
      api: `/api/chat/${character.id}`,
      onFinish(prompt, complettion) {
        const systemMessage: ChatMessageProps = {
          role: "system",
          content: complettion,
        };

        setMessages((current) => [...current, systemMessage]);
        setInput("");

        router.refresh();
      },
    });

    const onSubmit = (e: FormEvent<HTMLFormElement>) => {
        const userMessage: ChatMessageProps = {
            role: "user",
            content: input,
        };

        setMessages((current) => [...current, userMessage]);

        handleSubmit(e);
    }

  return (
    <div className="flex flex-col h-full w-full p-4 space-y-2">
      <ChatHeader character={character} />
      <ChatMessages
      character={character}
      isLoading={isLoading}
      messages={messages} 
      />
      <ChatForm
        isLoading={isLoading}
        input={input}
        handleInputChange={handleInputChange}
        onSubmit={onSubmit}
      />
    </div>
  );
};
