import prismadb from "@/lib/prismadb";
// import { RedirectToSignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ChatClient } from "./components/client";

interface ChatIdPageProps {
  params: {
    chatId: string;
  }
}

const ChatIdPage = async ({
  params
}: ChatIdPageProps) => {
  const { userId } = auth();

  if(!userId) {
    // <RedirectToSignIn />
    return auth().redirectToSignIn();
  }

  const character = await prismadb.character.findUnique({
    where: {
      id: params.chatId
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
        where: {
          userId,
        }
      },
      _count: {
        select: {
          messages: true
        }
      }
    }
  })

  if(!character) {
    return redirect("/");
  }

  return (
    <ChatClient character={character} />
  );
};

export default ChatIdPage;
