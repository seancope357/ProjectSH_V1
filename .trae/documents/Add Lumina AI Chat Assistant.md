## Implement Lumina: The AI Sequence Specialist

I will add a comprehensive AI assistant named **Lumina** that serves both sellers (for optimization) and buyers (for discovery).

### **1. AI Backend & Logic**
- **AI Service**: Create `src/lib/ai/lumina.ts` to define Lumina's persona and context-building logic.
  - **Persona**: Warm, knowledgeable specialist in LED sequences and marketplace SEO.
  - **Contextual Intelligence**: Logic to inject seller data (their sequences, sales) or buyer data (categories, search intent) into the AI prompt.
- **API Route**: Implement `src/app/api/ai/chat/route.ts` to handle streaming chat interactions using OpenAI's `gpt-4o`.

### **2. UI Components**
- **LuminaChat**: A floating, interactive chat assistant component in `src/components/ui/lumina-chat.tsx`.
  - **Avatar**: A friendly, glowing "warm" orb icon with a pulse animation.
  - **Chat Interface**: Clean, modern bubble that expands into a full chat window.
  - **Quick Actions**: Context-aware buttons (e.g., "Optimize my tags" for sellers, "Help me find a sequence" for buyers).
- **Global Integration**: Add the assistant to the root layout so she is available across the entire platform.

### **3. Role-Based Features**
- **For Sellers**: Access to sequence titles, descriptions, and performance data to assist with writing metadata and SEO tagging.
- **For Buyers**: Knowledge of the marketplace categories and general Q&A about LED sequencing to aid in purchasing decisions.

### **4. Dependencies**
- I will install `openai` and `ai` (Vercel AI SDK) for robust streaming support.

**Lumina** will be the "pro top of the line" AI experience you described, with a warm tone and deep integration into the SequenceHUB ecosystem.

*Note: You will need to add an `OPENAI_API_KEY` to your `.env.local` for the AI to function.*

Please confirm if you'd like me to proceed with the implementation!