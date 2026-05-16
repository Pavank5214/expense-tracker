const { GoogleGenerativeAI } = require('@google/generative-ai');

// @desc    Parse raw text into structured JSON using Gemini
// @route   POST /api/ai/parse
// @access  Private
const parseLedgerText = async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Please provide text to parse.' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'Gemini API key is not configured on the server.' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const prompt = `
      You are an intelligent financial ledger parser.
      Extract transactions from the following raw text.
      Return ONLY a pure JSON array (no markdown block, no markdown formatting like \`\`\`json).
      
      Schema for each object in the array:
      If it's a personal expense:
      {
        "type": "expense",
        "title": "description of expense",
        "amount": number (positive),
        "category": "Food" | "Travel" | "Fuel" | "Shopping" | "Bills" | "EMI" | "Rent" | "Miscellaneous"
      }

      If it's an income (salary, freelance, gift, etc.):
      {
        "type": "income",
        "title": "description of income",
        "amount": number (positive),
        "category": "Salary" | "Freelance" | "Gift" | "Investment" | "Business" | "Other"
      }

      If it's lending or borrowing money to/from a person:
      {
        "type": "lending",
        "personName": "Name of the person",
        "amount": number (positive),
        "description": "context if any",
        "lendingType": "Lent" | "Borrowed" | "Repayment_Received" | "Repayment_Sent"
      }

      CRITICAL: Always use "personName" for the person's name in lending entries.

      Example text: "Spent 500 on swiggy, salary 20000, and lent 2k to Rahul for movie. Also received 500 back from Amit."
      Example output:
      [
        { "type": "expense", "title": "Swiggy", "amount": 500, "category": "Food" },
        { "type": "income", "title": "Salary", "amount": 20000, "category": "Salary" },
        { "type": "lending", "personName": "Rahul", "amount": 2000, "description": "movie", "lendingType": "Lent" },
        { "type": "lending", "personName": "Amit", "amount": 500, "description": "received back", "lendingType": "Repayment_Received" }
      ]
      Example output:
      [
        { "type": "expense", "title": "Swiggy", "amount": 500, "category": "Food" },
        { "type": "lending", "personName": "Rahul", "amount": 2000, "description": "movie", "lendingType": "Lent" },
        { "type": "lending", "personName": "Amit", "amount": 500, "description": "received back", "lendingType": "Repayment_Received" }
      ]

      Raw text to parse:
      "${text}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const responseText = response.text().trim();
    
    // Strip markdown formatting if the model still outputs it despite instructions
    let jsonString = responseText;
    if (jsonString.startsWith('\`\`\`json')) {
      jsonString = jsonString.slice(7, -3).trim();
    } else if (jsonString.startsWith('\`\`\`')) {
      jsonString = jsonString.slice(3, -3).trim();
    }

    let parsedArray = JSON.parse(jsonString);

    // Clean up names (remove "to ", "from ", etc if AI included them)
    parsedArray = parsedArray.map(item => {
      if (item.type === 'lending' && item.personName) {
        item.personName = item.personName.replace(/^(to|from|gave|got|received)\s+/i, '').trim();
      }
      return item;
    });

    res.status(200).json(parsedArray);
  } catch (error) {
    console.error('--- GEMINI API ERROR ---');
    console.error('Message:', error.message);
    if (error.stack) console.error('Stack:', error.stack);
    res.status(500).json({ 
      message: 'Failed to process AI request', 
      error: error.message || 'Unknown error occurred'
    });
  }
};

module.exports = {
  parseLedgerText,
};
