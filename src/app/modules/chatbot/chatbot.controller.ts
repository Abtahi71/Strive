import { Request, Response } from "express"
import { catchAsync } from "../../shared/cathAsync"
import { convertMessagesToLLM, createConversation, getConversation, getConversationMessages, saveAssistantMessage, saveToolMessage, saveUserMessage, searchKnowledge } from "./chatbot.services";
import { detectIntent } from "./chatbot.route";
import { activityService } from "../activities/activites.service";
import { chatbotTools, executeChatbotTool } from "./chatbot.tools";

const OPENROUTER_URL =
  "https://openrouter.ai/api/v1/chat/completions";

const MODEL = process.env.OPENROUTER_LLM_MODEL!;


async function callLLM(messages:any[],tools?:any[]){
  const body:any = {
    model:MODEL,
    messages,
    max_tokens:300
  }

  if(tools){
    body.tools = tools
    body.tool_choice = "auto"
  }

    console.log("========== LLM REQUEST ==========");

    console.log(JSON.stringify(body, null, 2));

  const response = await fetch(OPENROUTER_URL,{
    method:"POST",
    headers:{
      "Content-Type":"application/json",
      Authorization:`Bearer ${process.env.OPENROUTER_API_KEY}`
    },
    body:JSON.stringify(body)
  })

  const data = await response.json();

    console.log("========== LLM RESPONSE ==========");

    console.log(JSON.stringify(data, null, 2));

  if(!response.ok){
    console.log("OPENROUTER error",data)

    throw new Error(
      data?.error?.message || "Request failed"
    )
  }

    if (!data.choices?.[0]?.message) {
      throw new Error(
        `OpenRouter returned no assistant message: ${JSON.stringify(data)}`
      );
    }

  return data
}




const chatWithStrive = catchAsync(async(req:Request,res:Response)=>{
    const message = req.body.message
    const conversationId = req.body.conversationId
    const userId = req.user.userId;

    console.log("THIS IS THE CONVESATION ID",conversationId)

    let conversation

    if(conversationId){
      conversation = await getConversation(conversationId,userId)
      if(!conversation){
      return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
    }
    } else {
      conversation = await createConversation(userId);
      }

    console.log("conversation",conversation)

    const dbMessages = await getConversationMessages(conversation.id);

    const history = convertMessagesToLLM(dbMessages);

    await saveUserMessage(conversation.id,message);

    history.push({
      role:"user",
      content:message
    })

    const intent = detectIntent(message);

    let knowledgeContext = ""

    if(intent === "BOTH" || intent === "KNOWLEDGE"){
        const knowledge = await searchKnowledge(message,5)
        knowledgeContext = knowledge.map((item:any)=>`SOURCE:${item.source}\nCONTENT:${item.content}`).join("\n\n---------\n\n");
    }

      const systemPrompt = `
      You are the Strive application assistant.

      Your job is to answer questions about the Strive application.

      IMPORTANT RULES:

      1. For Strive application behavior, use the provided documentation
        as the source of truth.

      2. Never invent Strive features, rules, values, statistics, or
        user information.

      3. When the user asks about their personal Strive data,
        use the available tools.

      4. Never assume or invent a user's personal data.

      5. The authenticated user's identity is controlled by the backend.
        Never ask the user for their user ID.

      6. If a tool returns found=false, explain that the requested
        activity could not be found.

      7. If the documentation does not contain enough information,
        say that you do not have enough information.

      8. Keep answers clear and concise.

      9. If the user asks a general question unrelated to Strive,
        answer normally.

      STRIVE DOCUMENTATION:
      ${knowledgeContext || "No documentation was retrieved for this question."}
      `;

      const messages:any[] = [
        {
          role: "system",
          content: systemPrompt
        },
        ...history
      ]

      console.log("========== CONVERSATION HISTORY ==========");

      console.log("ABCDEFGH",JSON.stringify(history, null, 2));

      const firstResponse = await callLLM(
        messages,chatbotTools
      )

      const assistantMessage = firstResponse.choices[0].message;

      await saveAssistantMessage(
        conversation.id,
        assistantMessage.content ?? null,
        assistantMessage.tool_calls
      );

      if (!assistantMessage.tool_calls?.length) {
        return res.json({
          response: assistantMessage.content,
          conversationId: conversation.id
        });
      }
      


      messages.push(assistantMessage);


      for (const toolCall of assistantMessage.tool_calls) {
        const toolName = toolCall.function.name;

        let args: any;

        try {
          args = JSON.parse(toolCall.function.arguments);
        } catch {
          throw new Error(
            `Invalid tool arguments from model: ${toolCall.function.arguments}`
          );
        }

        console.log("TOOL:", toolName);
        console.log("TOOL ARGS:", args);

        /*
            IMPORTANT:

            userId comes from req.user.

            It does NOT come from the LLM.
            */

        const toolResult = await executeChatbotTool(toolName, args, userId);

        await saveToolMessage(
          conversation.id,
          toolCall.id,
          JSON.stringify(toolResult)
        );



        console.log("TOOL RESULT:", toolResult);

        /*
            Add the database result back into the conversation.
            */

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify(toolResult),
        });
      }
      const finalResponse = await callLLM(
            messages,
            chatbotTools
          );


            console.log(
              "FINAL OPENROUTER RESPONSE:",
              JSON.stringify(finalResponse, null, 2)
            );

            if (!finalResponse.choices?.[0]?.message) {
              throw new Error(
                `Invalid final LLM response: ${JSON.stringify(finalResponse)}`
              );
            }

          const finalMessage =
            finalResponse.choices[0].message;

          await saveAssistantMessage(
            conversation.id,
            finalMessage.content ?? null
          );


        

          /*
          ============================================================
          9. RETURN FINAL NATURAL-LANGUAGE ANSWER
          ============================================================
          */

          res.json({
            response: finalMessage.content,
            conversationId: conversation.id,
          });
        }
      );
            

      export const chatbotController = {chatWithStrive}