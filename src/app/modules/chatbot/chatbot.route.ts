import { checkAuth } from './../../middleware/checkAuth';
import express from "express"
import { chatbotController } from "./chatbot.controller"
const router = express.Router()

export type ChatIntent = 'KNOWLEDGE' | 'USER' | 'BOTH' | 'UNKNOWN'

export function detectIntent(message:string):ChatIntent{
     const text = message.toLowerCase()

  const userdata = [
    "my ",
    "myself",
    "i ",
    "i'm",
    "ive ",
    "i've ",
    "for me",
    "mine",
  ];

  const knowledge = [
    "what is",
    "what are",
    "what does",
    "how does",
    "how do",
    "how can",
    "explain",
    "what happens",
  ];

     const needUser = userdata.some((word)=>text.includes(word))
     const needKnowledge = knowledge.some((word)=>text.includes(word))

     if(needUser && needKnowledge){
          return 'BOTH'
     }

     if(needUser){
          return 'USER'
     }

     if(needKnowledge){
          return 'KNOWLEDGE'
     }

     return 'UNKNOWN'

}

router.post("/chat",checkAuth(),chatbotController.chatWithStrive)

export const chatbotRoutes = router