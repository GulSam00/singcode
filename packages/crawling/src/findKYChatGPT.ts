// import dotenv from "dotenv";
// dotenv.config();

// import OpenAI from "openai";
// const client = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export const findKYChatGPT = async (text: string) => {
//   const response = await client.chat.completions.create({
//     model: "gpt-3.5-turbo",
//     messages: [
//       {
//         role: "system",
//         content: `당신은 주어진 제목, 가수를 통해 금영노래방의 곡번호를 찾는 전문가입니다. 다음 규칙을 철저히 따르세요.
//         1. 인터넷으로 주어진 제목, 가수에 해당하는 금영노래방의 곡번호를 찾아서 반환하세요
//         2. 번호만 반환하세요
//         3. 곡 번호가 없다면 null을 반환하세요
//         `,
//       },
//       { role: "user", content: text },
//     ],
//     temperature: 0.3,
//   });
//   const result = response.choices[0].message.content;
//   console.log("response", response);
//   console.log("result", result);
//   return result;
// };

// findKYChatGPT("눈물이되어줄게, 허각");

// 검색 불가 이슈
