import { Router } from 'express';
import { sql, gte } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { authenticateJWT } from '../middleware/auth.js';
const router = Router();
// Endpoint for AI chat assistant
router.post('/', authenticateJWT, async (req, res) => {
    try {
        const { message } = req.body;
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ message: 'Invalid or missing message' });
        }
        // 1. Query live database stats for the AI prompt context
        const [benCount] = await db.select({ count: sql `count(*)::int` }).from(schema.beneficiaries);
        const [volCount] = await db.select({ count: sql `count(*)::int` }).from(schema.volunteers);
        const [donationsSummary] = await db
            .select({
            totalAmount: sql `coalesce(sum(amount), 0)`,
            count: sql `count(*)::int`,
        })
            .from(schema.donations);
        const upcomingEvents = await db
            .select({ title: schema.events.title, location: schema.events.location, startTime: schema.events.startTime })
            .from(schema.events)
            .where(gte(schema.events.startTime, new Date()))
            .limit(3);
        const lowStockInventory = await db
            .select({ itemName: schema.inventory.itemName, quantity: schema.inventory.quantity })
            .from(schema.inventory)
            .where(sql `${schema.inventory.status} = 'low-stock' OR ${schema.inventory.status} = 'out-of-stock'`)
            .limit(3);
        const formattedAmount = new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(parseFloat(donationsSummary.totalAmount));
        const eventsList = upcomingEvents.length > 0
            ? upcomingEvents.map(e => `"${e.title}" at ${e.location} on ${new Date(e.startTime).toLocaleDateString()}`).join(', ')
            : 'None scheduled';
        const lowStockList = lowStockInventory.length > 0
            ? lowStockInventory.map(i => `${i.itemName} (${i.quantity} left)`).join(', ')
            : 'All items are fully stocked';
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (GEMINI_API_KEY) {
            // 2. Gemini API mode
            const systemPrompt = `You are AKila (அகிலா), the futuristic holographic AI assistant for the A K Social Welfare Trust NGO. 
Answer the user's queries in the language they used (Tamil, English, or Tanglish). If they speak Tamil or ask in Tamil, you MUST respond in fluent, grammatically correct and elegant Tamil script.
You have access to the following live metrics from our database:
- Total Beneficiaries supported: ${benCount.count}
- Total Active Volunteers: ${volCount.count}
- Total Funds/Donations raised: ${formattedAmount} (${donationsSummary.count} contributions)
- Upcoming events: ${eventsList}
- Low/out-of-stock items in inventory: ${lowStockList}

Use these real database numbers when answering queries about statistics, volunteers, donations, inventory, or upcoming events. Do not fabricate or hallucinate any statistics. Keep your response helpful, concise, engaging, and under 150 words. Be conversational, polite, and representative of a social trust.`;
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: 'user',
                                parts: [{ text: `${systemPrompt}\n\nUser Query: ${message}` }],
                            },
                        ],
                    }),
                });
                if (!response.ok) {
                    throw new Error(`Gemini API responded with status ${response.status}`);
                }
                const data = await response.json();
                const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (aiText) {
                    return res.json({ reply: aiText.trim() });
                }
            }
            catch (geminiError) {
                console.error('Gemini API call failed, falling back to local handler:', geminiError);
            }
        }
        // 3. High-quality local rule-based response handler (fallback or default mode)
        const lowerMessage = message.toLowerCase();
        // Check query language / keywords
        const isTamil = /[\u0b80-\u0bff]/g.test(message) || lowerMessage.includes('tamil') || lowerMessage.includes('வணக்கம்');
        let reply = '';
        if (isTamil) {
            // Tamil Fallbacks
            if (lowerMessage.includes('வணக்கம்') || lowerMessage.includes('ஹலோ') || lowerMessage.includes('நலம்') || lowerMessage.includes('எப்படி இருக்கிறீர்கள்')) {
                reply = 'வணக்கம்! நான் அகிலா, A K சமூக நல அறக்கட்டளையின் AI உதவியாளர். உங்களுக்கு நான் எவ்வாறு உதவ முடியும்?';
            }
            else if (lowerMessage.includes('நன்கொடை') || lowerMessage.includes('பணம்') || lowerMessage.includes('நிதி') || lowerMessage.includes('donat') || lowerMessage.includes('fund')) {
                reply = `நமது அறக்கட்டளை இதுவரை மொத்தம் ${formattedAmount} நிதியுதவி பெற்றுள்ளது (${donationsSummary.count} பங்களிப்புகள்). இந்த நிதி எங்களின் பல்வேறு சமூக நலத் திட்டங்களுக்குப் பயன்படுத்தப்படுகிறது. நன்கொடை வழங்க விரும்பினால் மேல் மெனுவில் உள்ள 'நன்கொடைகள்' பக்கத்திற்குச் செல்லவும்!`;
            }
            else if (lowerMessage.includes('பயனாளி') || lowerMessage.includes('உதவிபெறுவோர்') || lowerMessage.includes('people') || lowerMessage.includes('beneficiar')) {
                reply = `A K சமூக நல அறக்கட்டளை இதுவரை ${benCount.count} பயனாளிகளுக்கு ஆதரவளித்துள்ளது. எங்களின் டிஜிட்டல் QR அட்டை முறை மூலம் அவர்களுக்கு கல்வி, மருத்துவம் மற்றும் உணவுப் பொருட்கள் வழங்கப்படுகின்றன.`;
            }
            else if (lowerMessage.includes('தன்னார்வலர்') || lowerMessage.includes('volunteer')) {
                reply = `தற்போது நமது அமைப்பில் ${volCount.count} தன்னார்வலர்கள் செயலில் உள்ளனர். நீங்களும் ஒரு தன்னார்வலராக இணைந்து சமூகப் பணியாற்ற விரும்பினால், தன்னார்வலர்கள் பகுதிக்குச் சென்று பதிவு செய்யுமாறு கேட்டுக்கொள்கிறோம்!`;
            }
            else if (lowerMessage.includes('நிகழ்வு') || lowerMessage.includes('நிகழ்ச்சி') || lowerMessage.includes('கூட்டம்') || lowerMessage.includes('event')) {
                reply = `வரவிருக்கும் நிகழ்வுகள்: ${eventsList}. இவற்றில் கலந்துகொண்டு ஆதரவளிக்குமாறு கேட்டுக்கொள்கிறோம்!`;
            }
            else if (lowerMessage.includes('சரக்கு') || lowerMessage.includes('பொருள்') || lowerMessage.includes('இருப்பு') || lowerMessage.includes('inventory') || lowerMessage.includes('stock')) {
                reply = `தற்போது குறைந்த இருப்பில் உள்ள பொருட்கள்: ${lowStockList}. சரக்கு இருப்பை மேம்படுத்த மற்றும் உதவ, சரக்கு இருப்பு பக்கத்தை அணுகவும்.`;
            }
            else if (lowerMessage.includes('நன்றி') || lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
                reply = 'மிக்க நன்றி! உங்களோடு உரையாடியதில் மகிழ்ச்சி. வேறு ஏதேனும் உதவி தேவையா?';
            }
            else {
                reply = `வணக்கம்! நான் அகிலா AI உதவியாளர். 
நமது தொண்டு நிறுவனத்தில் தற்போது:
- ${benCount.count} பயனாளிகள் உள்ளனர்.
- ${volCount.count} தன்னார்வலர்கள் பணியாற்றுகின்றனர்.
- மொத்தம் ${formattedAmount} நன்கொடைகள் திரட்டப்பட்டுள்ளன.
- வரவிருக்கும் நிகழ்வுகள்: ${eventsList}.

ஏதேனும் குறிப்பிட்ட விவரம் தேவையா? என்னிடம் கேளுங்கள், நான் உதவத் தயாராக இருக்கிறேன்!`;
            }
        }
        else {
            // English Fallbacks
            if (lowerMessage.includes('hello') || lowerMessage.includes('hi ') || lowerMessage.includes('hey') || lowerMessage.includes('greetings')) {
                reply = 'Hello! I am AKila, the AI assistant for A K Social Welfare Trust. How can I help you today?';
            }
            else if (lowerMessage.includes('donation') || lowerMessage.includes('fund') || lowerMessage.includes('money') || lowerMessage.includes('raised')) {
                reply = `We have successfully raised ${formattedAmount} across ${donationsSummary.count} contributions. This supports our various welfare activities. If you want to contribute, please navigate to the Donations section.`;
            }
            else if (lowerMessage.includes('beneficiary') || lowerMessage.includes('beneficiaries') || lowerMessage.includes('people') || lowerMessage.includes('supported')) {
                reply = `We are proud to support ${benCount.count} active beneficiaries. They receive streamlined support in education, medicine, and nutrition via our digital QR ID program.`;
            }
            else if (lowerMessage.includes('volunteer') || lowerMessage.includes('volunteers')) {
                reply = `We have ${volCount.count} active volunteers working with us. If you wish to join us, feel free to sign up in the Volunteers section!`;
            }
            else if (lowerMessage.includes('event') || lowerMessage.includes('events') || lowerMessage.includes('upcoming')) {
                reply = `Our upcoming events include: ${eventsList}. Join us to make a difference!`;
            }
            else if (lowerMessage.includes('inventory') || lowerMessage.includes('stock') || lowerMessage.includes('item')) {
                reply = `Inventory Alerts: ${lowStockList}. You can check and manage all resources under the Inventory tab.`;
            }
            else if (lowerMessage.includes('thanks') || lowerMessage.includes('thank you')) {
                reply = 'You are very welcome! Let me know if you need any other information.';
            }
            else {
                reply = `Hello! I am AKila, your NGO AI Assistant. 
Here is a quick snapshot:
- Supported Beneficiaries: ${benCount.count}
- Active Volunteers: ${volCount.count}
- Total Funds Raised: ${formattedAmount}
- Next Event: ${eventsList}

How else can I assist you today?`;
            }
        }
        return res.json({ reply });
    }
    catch (error) {
        console.error('Chat endpoint error:', error);
        return res.status(500).json({ message: 'Error processing chat query' });
    }
});
export default router;
