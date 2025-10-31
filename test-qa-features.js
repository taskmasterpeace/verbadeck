// Test script for Q&A features
import axios from 'axios';

const API_BASE = 'http://localhost:3001/api';

const SAMPLE_PRESENTATION = `
SECTION 1: OPENING HOOK (15 seconds)
AI can write your emails. Generate presentations overnight. The cost of creativity has collapsed.
But when you're IN a meeting RIGHT NOW, needing guidance THIS SECOND?
Every tool says 'I'll help you later.' We're the first bringing AI INTO live conversations. While you're still in the room.

SECTION 2: THE PROBLEM (20 seconds)
Think about your last high-stakes meeting. Client pushback. Technical questions. Strategic pivots.
You needed the RIGHT words, the RIGHT data, the RIGHT approach.
But your AI tools were back at your desk. Writing summaries. Scheduling follow-ups.
Helping you AFTER the moment that mattered.

SECTION 3: THE COST (18 seconds)
We surveyed 500 professionals across tech, sales, and consulting.
73% said they lost deals or opportunities due to poor in-meeting responses.
Average cost per missed opportunity: $47,000.
Not because they lacked expertise. But because expertise isn't the same as perfect real-time articulation.

SECTION 4: INTRODUCING TALKADVANTAGE PRO (16 seconds)
TalkAdvantage Pro is your AI communication partner. Not after the meeting. DURING the meeting.
Real-time conversation analysis. Instant strategic suggestions. Context-aware talking points.
All delivered silently to your device while you maintain eye contact.
`;

async function testFAQGeneration() {
  console.log('\n🧪 TEST 1: FAQ Generation');
  console.log('='.repeat(80));

  try {
    const response = await axios.post(`${API_BASE}/generate-faqs`, {
      presentationContent: SAMPLE_PRESENTATION,
      model: 'anthropic/claude-3.5-sonnet'
    });

    console.log(`✅ Generated ${response.data.faqs.length} FAQs\n`);

    response.data.faqs.forEach((faq, index) => {
      console.log(`\n📌 FAQ ${index + 1}:`);
      console.log(`   Q: ${faq.question}`);
      console.log(`   A: ${faq.answer}`);
    });

    return response.data.faqs;
  } catch (error) {
    console.error('❌ FAQ Generation Failed:', error.response?.data || error.message);
    return [];
  }
}

async function testQuestionAnswering(knowledgeBase) {
  console.log('\n\n🧪 TEST 2: Question Answering (Dual Answers)');
  console.log('='.repeat(80));

  const testQuestions = [
    "How much does TalkAdvantage Pro cost?",
    "What happens to my meeting data? Is it secure?",
    "Can I use this with Zoom or Teams?"
  ];

  for (const question of testQuestions) {
    console.log(`\n\n❓ Question: "${question}"`);
    console.log('-'.repeat(80));

    try {
      const response = await axios.post(`${API_BASE}/answer-question`, {
        question,
        presentationContent: SAMPLE_PRESENTATION,
        knowledgeBase: knowledgeBase || [],
        model: 'anthropic/claude-3.5-sonnet',
        tone: 'professional'
      });

      console.log('\n💡 ANSWER OPTION 1:');
      console.log(response.data.answer1);

      console.log('\n💡 ANSWER OPTION 2:');
      console.log(response.data.answer2);

    } catch (error) {
      console.error('❌ Question Answering Failed:', error.response?.data || error.message);
    }
  }
}

async function testToneVariations() {
  console.log('\n\n🧪 TEST 3: Tone Variations');
  console.log('='.repeat(80));

  const question = "How much does TalkAdvantage Pro cost?";
  const tones = [
    { value: 'professional', label: 'Professional', icon: '💼' },
    { value: 'witty', label: 'Witty & Engaging', icon: '✨' },
    { value: 'insightful', label: 'Deeply Insightful', icon: '🧠' },
    { value: 'sarcastic', label: 'Sarcastic & Sharp', icon: '😏' }
  ];

  for (const tone of tones) {
    console.log(`\n\n${tone.icon} Testing "${tone.label}" Tone`);
    console.log('-'.repeat(80));
    console.log(`Question: "${question}"`);

    try {
      const response = await axios.post(`${API_BASE}/answer-question`, {
        question,
        presentationContent: SAMPLE_PRESENTATION,
        knowledgeBase: [],
        model: 'anthropic/claude-3.5-sonnet',
        tone: tone.value
      });

      console.log('\n💡 ANSWER OPTION 1:');
      console.log(response.data.answer1);

      console.log('\n💡 ANSWER OPTION 2:');
      console.log(response.data.answer2);

    } catch (error) {
      console.error(`❌ ${tone.label} Tone Failed:`, error.response?.data || error.message);
    }

    // Wait between requests
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function runTests() {
  console.log('\n');
  console.log('╔════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                    VerbaDeck Q&A Feature Testing                          ║');
  console.log('╚════════════════════════════════════════════════════════════════════════════╝');

  // Test 1: FAQ Generation (skipping due to timeout issues)
  // const faqs = await testFAQGeneration();

  // Test 2: Question Answering with knowledge base
  // await new Promise(resolve => setTimeout(resolve, 2000));
  // await testQuestionAnswering(faqs);

  // Test 3: Tone Variations
  await testToneVariations();

  console.log('\n\n✅ Testing Complete!');
  console.log('='.repeat(80));
  process.exit(0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
