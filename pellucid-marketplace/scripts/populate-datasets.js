const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI not found in environment variables');
  process.exit(1);
}

const syntheticDatasets = [
  {
    _id: new ObjectId(),
    category: "Harmful Content",
    description: "Collection of AI responses that contain potentially harmful, biased, or unsafe content. Includes examples of hate speech, violence, and discriminatory language.",
    price: 249.99,
    buyers: [],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    submissions: [],
    sampleCount: 1250,
    usageCount: 45
  },
  {
    _id: new ObjectId(),
    category: "Hallucination",
    description: "Dataset containing AI responses with factual errors, made-up information, and false claims. Perfect for training models to avoid hallucination.",
    price: 189.99,
    buyers: [],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    submissions: [],
    sampleCount: 2100,
    usageCount: 78
  },
  {
    _id: new ObjectId(),
    category: "Reasoning Errors",
    description: "AI responses demonstrating logical fallacies, incorrect reasoning, and flawed argumentation. Essential for improving AI reasoning capabilities.",
    price: 199.99,
    buyers: [],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    submissions: [],
    sampleCount: 1800,
    usageCount: 32
  },
  {
    _id: new ObjectId(),
    category: "Creativity Weakness",
    description: "Examples of unoriginal, repetitive, and generic AI responses. Helps identify and improve creative capabilities in language models.",
    price: 149.99,
    buyers: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    submissions: [],
    sampleCount: 1650,
    usageCount: 67
  },
  {
    _id: new ObjectId(),
    category: "Alignment Issues",
    description: "AI responses that fail to follow instructions, ignore safety guidelines, or produce off-topic content. Critical for alignment research.",
    price: 299.99,
    buyers: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    submissions: [],
    sampleCount: 950,
    usageCount: 23
  },
  {
    _id: new ObjectId(),
    category: "Context Failures",
    description: "Examples of AI misunderstanding context, losing track of conversation flow, and failing to maintain coherence across interactions.",
    price: 169.99,
    buyers: [],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    submissions: [],
    sampleCount: 1400,
    usageCount: 41
  },
  {
    _id: new ObjectId(),
    category: "Bias",
    description: "AI responses showing various forms of bias including gender, racial, cultural, and socioeconomic bias. Essential for fairness research.",
    price: 219.99,
    buyers: [],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    submissions: [],
    sampleCount: 1750,
    usageCount: 56
  },
  {
    _id: new ObjectId(),
    category: "Misinformation",
    description: "AI responses containing false information, conspiracy theories, and misleading claims. Important for combating AI-generated misinformation.",
    price: 179.99,
    buyers: [],
    createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    submissions: [],
    sampleCount: 1950,
    usageCount: 89
  },
  {
    _id: new ObjectId(),
    category: "Good Response",
    description: "High-quality AI responses that demonstrate proper alignment, accuracy, and helpfulness. Used as positive examples for training.",
    price: 129.99,
    buyers: [],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    submissions: [],
    sampleCount: 3200,
    usageCount: 112
  }
];

async function populateDatasets() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const datasetsCollection = db.collection('datasets');
    
    // Clear existing datasets
    await datasetsCollection.deleteMany({});
    console.log('Cleared existing datasets');
    
    // Insert synthetic datasets
    const result = await datasetsCollection.insertMany(syntheticDatasets);
    console.log(`Inserted ${result.insertedCount} synthetic datasets`);
    
    // Create some synthetic data objects for visualization
    const dataCollection = db.collection('data');
    const syntheticData = [];
    
    const categories = [
      'Harmful Content', 'Hallucination', 'Reasoning Errors', 
      'Creativity Weakness', 'Alignment Issues', 'Context Failures',
      'Bias', 'Misinformation', 'Good Response'
    ];
    
    const sampleTexts = {
      'Harmful Content': [
        'This is a harmful response that contains offensive language.',
        'AI generated content with discriminatory remarks.',
        'Response containing hate speech and violence.'
      ],
      'Hallucination': [
        'The capital of France is London, not Paris.',
        'Shakespeare wrote Romeo and Juliet in 2020.',
        'The sun revolves around the Earth.'
      ],
      'Reasoning Errors': [
        'All birds can fly, therefore penguins can fly.',
        'If it rains, the ground gets wet. The ground is wet, so it must be raining.',
        'Every student who studies hard gets good grades. John got good grades, so he must have studied hard.'
      ],
      'Creativity Weakness': [
        'Here are some generic ideas for your project.',
        'You could try the usual approaches that everyone uses.',
        'Standard solutions include the common methods.'
      ],
      'Alignment Issues': [
        'I cannot help with that request as it goes against my guidelines.',
        'This response ignores the user\'s specific instructions.',
        'Off-topic response that doesn\'t address the question.'
      ],
      'Context Failures': [
        'I don\'t remember what we were discussing earlier.',
        'This response contradicts what I said in the previous message.',
        'I lost track of the conversation context.'
      ],
      'Bias': [
        'Women are naturally better at cooking than men.',
        'People from that country are always late.',
        'Older employees are less productive than younger ones.'
      ],
      'Misinformation': [
        'Vaccines cause autism in children.',
        'The moon landing was faked by NASA.',
        'Climate change is a hoax created by scientists.'
      ],
      'Good Response': [
        'Here\'s a helpful and accurate response to your question.',
        'I understand your concern and here\'s how I can help.',
        'This is a well-reasoned and informative answer.'
      ]
    };
    
    // Create synthetic data objects
    for (let i = 0; i < 100; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const texts = sampleTexts[category];
      const text = texts[Math.floor(Math.random() * texts.length)];
      
      syntheticData.push({
        _id: new ObjectId(),
        userId: new ObjectId(), // Random user ID
        payload: text,
        label: category,
        category: category,
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        isSanitized: true,
        sanitizedPayload: text,
        embedding: Array.from({ length: 1536 }, () => Math.random() - 0.5), // Random embedding
        embeddingModel: 'text-embedding-ada-002',
        embeddingGeneratedAt: new Date()
      });
    }
    
    // Clear existing data
    await dataCollection.deleteMany({});
    console.log('Cleared existing data objects');
    
    // Insert synthetic data
    const dataResult = await dataCollection.insertMany(syntheticData);
    console.log(`Inserted ${dataResult.insertedCount} synthetic data objects`);
    
    console.log('✅ Database populated successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${result.insertedCount} datasets created`);
    console.log(`- ${dataResult.insertedCount} data objects created`);
    console.log('- All datasets ready for visualization');
    
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await client.close();
  }
}

populateDatasets();
