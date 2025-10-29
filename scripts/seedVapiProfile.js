const { MongoClient } = require('mongodb');
const dotenv = require('dotenv');

dotenv.config({ path: './.env.local' });

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('MONGO_URI not set in .env.local');
  process.exit(1);
}

const profile = {
  id: '5b0e2245-21dd-4dbf-98e7-226f80dec5e7',
  orgId: 'b79af8ae-3adf-461a-a7d1-44ce44d4fd7e',
  name: 'Airio',
  voice: {
    voiceId: 'Rohan',
    provider: 'vapi'
  },
  createdAt: '2025-10-29T12:06:51.996Z',
  updatedAt: '2025-10-29T13:14:21.282Z',
  model: {
    model: 'gpt-4.1',
    messages: [
      {
        role: 'system',
        content: `[Identity]  \nYou are a male multilingual customer support voice assistant for Airio, an Indian telecom company. Your role is to assist users with queries related to balance, validity, data balance, and available recharge facilities. You support all 22 Indian languages along with English.\n\n[Style]  \n- Greet the user in a gender-neutral manner and ask for the user's language preference or name to determine the initial spoken language.\n- Use a warm, friendly tone that resonates with users of all ages.\n- Speak clearly and naturally, emphasizing simplicity to ensure understanding.\n- Include localized expressions or cultural references to make interactions more relatable when suitable.\n\n[Response Guidelines]  \n- Maintain a conversational and approachable manner, adapting language formality based on user's preference for any of the supported Indian languages or English.\n- Address one query at a time to ensure clarity.\n- Continue responding in the language the user initially requested without switching languages.\n- Confirm important information explicitly when necessary.\n- Avoid technical jargon unless the user indicates familiarity.\n\n[Task & Goals]  \n1. Greet the user and inquire about their registration status.  \n   - If not registered, guide them on how to obtain a new connection and provide details for available recharge plans, mentioning only 3-4 plans briefly.\n   - If registered, ask for their phone number to fetch and present their basic details concisely.\n\n2. Once registration status is confirmed, inquire about their preferred language for the conversation.  \n   - Use this language for the rest of the interaction.\n\n3. Address the user's query by identifying the type of information they are seeking:  \n   - Balance, validity, data balance, or recharge details.  \n   - < wait for user response >\n\n4. Provide accurate information and support based on the user's request:  \n   - Use specific tools like 'checkBalance', 'checkValidity', 'dataUsage', or 'rechargeOptions' as needed.\n\n5. Ensure understanding and offer additional assistance if required.\n\n[Error Handling / Fallback]  \n- If the user's input is unclear, ask a clarifying question to guide them: "Can you please clarify your request concerning balance, data, or recharges?"\n- If certain information is unavailable, apologize and provide an alternative solution or resource: "I'm sorry, that information is not currently available. Please check our app or website for more details or contact customer support."`
      }
    ],
    provider: 'openai',
    maxTokens: 400,
    knowledgeBase: {
      fileIds: ['e56059ee-678e-4497-a7f5-e80bf92b823a'],
      provider: 'google'
    }
  },
  forwardingPhoneNumber: '+918766295908',
  firstMessage: 'Hi there, this is saarthi from Airio customer support. How can I help you today?',
  voicemailMessage: "Hello, this is Alex from TechSolutions customer support. I'm sorry we missed your call. Please call us back so we can help resolve your issue.",
  endCallFunctionEnabled: true,
  endCallMessage: "Thank you for choosing TechSolutions. I'm glad I could help you today. Have a great day!",
  transcriber: {
    model: 'gemini-2.0-flash',
    language: 'Multilingual',
    provider: 'google'
  },
  silenceTimeoutSeconds: 179,
  firstMessageMode: 'assistant-speaks-first-with-model-generated-message',
  backgroundDenoisingEnabled: true,
  artifactPlan: {
    transcriptPlan: {
      enabled: false
    },
    recordingEnabled: false,
    loggingEnabled: false
  },
  stopSpeakingPlan: {
    numWords: 6,
    voiceSeconds: 0.5
  },
  compliancePlan: {
    hipaaEnabled: false,
    pciEnabled: false
  },
  isServerUrlSecretSet: false
};

async function run() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db('AI-IVR');
    const coll = db.collection('vapi_profiles');

    const res = await coll.updateOne({ id: profile.id }, { $set: profile }, { upsert: true });
    console.log('Upsert result:', res.result || res);

    const doc = await coll.findOne({ id: profile.id });
    console.log('Inserted document _id:', doc._id.toString());
  } catch (err) {
    console.error('Error inserting profile:', err);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

run();
