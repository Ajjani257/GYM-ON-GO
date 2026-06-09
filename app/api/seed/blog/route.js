import dbConnect from '@/lib/mongodb';
import Blog from '@/models/Blog';
import { NextResponse } from 'next/server';

const SEED_BLOGS = [
  // ── 1 ─────────────────────────────────────────────────────────────
  {
    title: 'How to Maximize Your 1-Hour Gym Session',
    slug: 'maximize-1-hour-gym-session',
    excerpt: 'Pressed for time? A laser-focused 60-minute session beats a sloppy two-hour workout every time. Here\'s the exact framework used by strength coaches.',
    content: `### The 60-Minute Efficiency Rule

Most people waste 40–50% of their gym time: scrolling phones between sets, wandering between machines, or running through 12 isolation exercises nobody needs. A smart hourly approach flips this completely.

### Phase 1 — Warm-up (8 minutes)

Start with 3–5 minutes of light cardio (row, skip, or brisk walk) to raise your core body temperature. Follow with dynamic mobility drills matched to your day's lift — hip circles before squats, band pull-aparts before pressing, leg swings before deadlifts.

### Phase 2 — Compound Work (30 minutes)

Pick one or two heavy compound movements: Squat, Deadlift, Bench Press, Overhead Press, or Pull-up. Perform 4–5 working sets. Rest 90 seconds for hypertrophy, up to 3 minutes for maximum strength.

Why compound first? Cortisol and testosterone peak in the first 30–45 minutes of a session. Heavy compound lifts during this window produce the greatest anabolic hormonal response.

### Phase 3 — Accessory Work (17 minutes)

Use supersets to hit smaller muscle groups with maximum density. Pair:

* Bicep curls ↔ Tricep pushdowns
* Lateral raises ↔ Face pulls
* Cable rows ↔ Chest flyes

Rest only 30–45 seconds between each superset.

### Phase 4 — Cooldown (5 minutes)

Static stretching now makes sense — muscles are warm and pliable. Hold each position for 30–60 seconds. This is also your mental decompression window.

### The One Rule That Changes Everything

Never add an exercise without removing one. Most gym sessions fail because they grow beyond 60 minutes through addition. A 60-minute session with high intensity and zero wasted time will consistently outperform a 2-hour drift.`,
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    author: 'Arjun Mehta, CSCS',
    tags: ['Workouts', 'Efficiency', 'Guides'],
    readTime: '5 min',
  },

  // ── 2 ─────────────────────────────────────────────────────────────
  {
    title: 'Hourly Gym Booking vs Monthly Contracts: The Real Math',
    slug: 'hourly-vs-monthly-gyms-india',
    excerpt: 'With India\'s gym membership penetration under 1%, flexible hourly booking is changing who gets to train — and saving serious money for those who do.',
    content: `### The Subscription Trap

Gym contracts are engineered around a predictable pattern: most members stop attending within 6 weeks, yet continue paying for 10 more months out of guilt or forgetfulness. This is not an accident — it is the business model.

### The Financial Reality

Consider a busy professional who realistically visits the gym 6 times a month. On a ₹2,500 monthly contract, each session effectively costs ₹416. With hourly booking at ₹120 per session, the same 6 sessions cost ₹720. Annual savings: over ₹21,000 — without any sacrifice in training quality.

Across a year, the typical monthly-contract gym-goer pays for roughly 48 sessions they never take.

### Who Benefits Most from Hourly Access?

Corporate professionals in Bengaluru, Mumbai, or Gurugram often work unpredictable 10–12 hour days. A monthly membership signed in January becomes a burden by March as project deadlines compound.

Frequent travelers — whether sales professionals or startup founders — spend up to 12 days a month away from home. An hourly model lets them book gyms in whichever city they land in, paying only for sessions they actually use.

Students preparing for competitive exams train hard in phases. Paying per session perfectly matches their sporadic but intense training windows.

### The Hidden Costs of Monthly Contracts

* Enrollment fee: ₹500–₹2,000 (often waived, then quietly added back)
* Annual maintenance charge: ₹500–₹1,000
* Lock-in clauses with no pause or transfer options
* Overcrowded equipment during peak hours (6–9 AM and 6–9 PM)

### The Bigger Picture

India's fitness penetration is below 1% compared to 17% in the US. The barrier is not desire — it is commitment anxiety. Hourly booking removes that barrier entirely. You book when you are ready. You pay for what you use.`,
    image: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&q=80',
    author: 'Priya Sharma, Finance & Wellness Writer',
    tags: ['Finance', 'Flexibility', 'India Fitness'],
    readTime: '6 min',
  },

  // ── 3 ─────────────────────────────────────────────────────────────
  {
    title: 'The Indian Protein Problem: Getting Enough Without Supplements',
    slug: 'indian-protein-guide-no-supplements',
    excerpt: 'Most Indians are protein-deficient without knowing it. Here\'s how to hit your daily target using everyday Indian food — dal, paneer, sprouts, eggs, and more.',
    content: `### Why Protein Deficiency Is India's Biggest Fitness Barrier

The National Nutrition Monitoring Bureau estimates that 73% of urban Indians consume less than the recommended daily protein intake. For active individuals trying to build muscle or recover from training, this deficit is significant.

### How Much Protein Do You Actually Need?

* Sedentary adult: 0.8g per kg of bodyweight
* Recreational gym-goer: 1.2–1.6g per kg
* Serious strength athlete: 1.6–2.2g per kg

For a 70 kg person training 4 times a week, that works out to 112–154g of protein daily.

### High-Protein Indian Foods — A Practical Reference

Paneer (100g) delivers 18g of protein. One cup of cooked rajma gives 15g. Chana dal offers 14g per cup. Two whole eggs provide 12g. Chicken breast at 100g yields 31g. Greek-style hung curd (150g) gives 15g. A cup of moong sprouts provides 14g. Soya chunks — just 50g dry — pack 25g.

### A Sample High-Protein Indian Day

Breakfast: 3 whole eggs scrambled with 2 multigrain rotis and a cup of low-fat dahi — roughly 35g protein.

Mid-morning: A cup of moong sprouts chaat with roasted chana — around 20g protein.

Lunch: 2 rotis with rajma or dal, 100g paneer sabzi, and salad — approximately 40g protein.

Post-workout: 200ml full-fat milk with a banana — about 10g protein.

Dinner: Grilled chicken or soya chunks sabzi with rice or roti and curd — around 35g protein.

Total: approximately 140g protein — without a single scoop of whey.

### The Vegetarian Advantage

Legumes, dairy, and soy are India's hidden protein powerhouses. The key is combination — pairing incomplete proteins (like rice with dal) creates a complete amino acid profile. This is exactly what traditional Indian cuisine evolved to do naturally.`,
    image: 'https://images.unsplash.com/photo-1536305030588-45dc07a2a372?w=800&q=80',
    author: 'Dr. Neha Agarwal, Clinical Nutritionist',
    tags: ['Nutrition', 'India Fitness', 'Guides'],
    readTime: '7 min',
  },

  // ── 4 ─────────────────────────────────────────────────────────────
  {
    title: 'Strength Training for Women: Busting the Myths That Are Holding You Back',
    slug: 'strength-training-women-myths-india',
    excerpt: '"Lifting will make me bulky." This single fear is costing Indian women their metabolism, bone density, and long-term health. Let\'s fix that with science.',
    content: `### The Most Expensive Fitness Myth in India

Walk into any Indian gym and you will find a predictable split: men on the floor with barbells, women on cardio machines. This segregation is not about biology — it is about a deeply embedded myth that strength training masculinises women's bodies.

### Myth 1: Lifting Makes Women Bulky

Women have 10–20x less testosterone than men. This hormone is the primary driver of significant muscle growth. Even men who train seriously for years struggle to add 2kg of muscle in a month. For women, noticeable bulk requires years of dedicated effort, a sustained caloric surplus, and often hormonal assistance.

What strength training actually does for women:

* Increases resting metabolic rate — meaning more fat burned at rest
* Improves insulin sensitivity and blood sugar stability
* Builds lean, dense muscle that creates a toned appearance
* Dramatically reduces osteoporosis risk (India carries one of the world's highest osteoporosis burdens)

### Myth 2: Cardio Is Better for Fat Loss

A 45-minute treadmill session burns calories during the session. A 45-minute strength session creates an elevated metabolic state for 24–48 hours afterward — a phenomenon known as EPOC, or Excess Post-exercise Oxygen Consumption. Over weeks and months, strength training creates a compounding metabolic advantage that cardio alone cannot replicate.

### Myth 3: Women Should Only Use Light Weights

Your muscles do not know what the weight looks like. They respond to mechanical tension and progressive overload. If you can comfortably perform 15 or more reps without effort, the weight is too light to produce meaningful adaptation.

### A Beginner's Strength Template for Women

Three days per week, 45–60 minutes per session.

Day 1 — Push: Goblet Squat 4 sets of 10, Dumbbell Press 3 sets of 12, Lateral Raises 3 sets of 15.

Day 2 — Pull: Romanian Deadlift 4 sets of 10, Seated Row 3 sets of 12, Face Pulls 3 sets of 15.

Day 3 — Full Body: Barbell Squat 4 sets of 8, Push-ups 3 sets to max effort, Hip Thrusts 4 sets of 12.

Add 2.5kg to any exercise once you complete all reps with perfect form across two consecutive sessions.`,
    image: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800&q=80',
    author: 'Kavya Reddy, Certified Strength Coach',
    tags: ['Workouts', 'Women', 'Strength'],
    readTime: '7 min',
  },

  // ── 5 ─────────────────────────────────────────────────────────────
  {
    title: 'Recovery is Training: Why Rest Days Are Your Biggest Gains',
    slug: 'recovery-training-rest-days-science',
    excerpt: 'Muscle is not built in the gym — it\'s built during recovery. Here\'s the science of sleep, active recovery, and why skipping rest days is quietly sabotaging your progress.',
    content: `### The Construction Crew Analogy

Think of your workout as hiring a demolition crew. They break things down. Your rest days are when the construction crew arrives to rebuild — stronger than before. Skip the construction crew, and you are simply demolishing an already broken structure.

### What Actually Happens During Recovery

Muscle Protein Synthesis peaks 24–36 hours after a training session. This is the window during which your body lays down new contractile proteins, increasing muscle fiber size and strength.

Glycogen replenishment takes 24–48 hours after a depleting session. Training on empty glycogen stores shifts your body into a catabolic state, breaking down muscle tissue for fuel.

Central Nervous System recovery is frequently overlooked. Heavy compound lifts — squats, deadlifts, heavy presses — tax your CNS significantly. Chronic CNS fatigue presents as decreased strength, poor coordination, and mental fog.

### Sleep: The Non-Negotiable Recovery Tool

Growth Hormone is primarily released during deep sleep. Sleeping less than 7 hours reduces the muscle protein synthesis response to training by up to 30%.

Practical sleep optimisation:

* Set a consistent sleep time, including weekends
* Keep your bedroom below 20°C — cool rooms improve deep sleep quality meaningfully
* Avoid screens 45 minutes before bed, as blue light delays melatonin release
* Ashwagandha at 300mg has shown clinically significant improvements in sleep quality in Indian adults

### Active Recovery: The Middle Ground

A complete rest day does not mean sitting on the couch. Active recovery — light movement at 40–60% of max effort — increases blood flow to sore muscles, accelerating waste product removal without adding further stress.

Good active recovery options include a 20-minute walk, yoga or mobility work, easy swimming, or light cycling.

### Signs You Are Not Recovering Enough

* Strength has plateaued or declined across two or more weeks
* Resting heart rate is elevated by 5 or more BPM above your normal baseline
* You are experiencing persistent joint soreness rather than typical muscle soreness
* Mood irritability and poor concentration during the day
* Frequent minor illnesses, which signal suppressed immune function

The goal is to train hard enough to stimulate growth, then recover completely enough to express it. These are not separate phases — they are the same process.`,
    image: 'https://images.unsplash.com/photo-1579758629938-03607ccdbaba?w=800&q=80',
    author: 'Dr. Rohan Kapoor, Sports Medicine Physician',
    tags: ['Recovery', 'Science', 'Guides'],
    readTime: '6 min',
  },

  // ── 6 ─────────────────────────────────────────────────────────────
  {
    title: "The Urban Indian's Guide to Fitness: Beating Traffic, Hours & Stress",
    slug: 'urban-india-fitness-guide-corporate',
    excerpt: '12-hour workdays, 2-hour commutes, and back-to-back client calls. Here\'s how professionals in Bengaluru, Mumbai, and Delhi are staying fit without sacrificing their careers.',
    content: `### The Urban Indian Fitness Crisis

Professionals in Indian Tier-1 cities average over 11 working hours per day, with an additional 90-minute commute. Gym attendance drops 60% within 3 months of joining for this demographic — not because of laziness, but because rigid gym timetables simply do not fit irregular hours.

### Strategy 1: Micro-Workout Accumulation

Research shows that three 20-minute sessions provide nearly equivalent cardiovascular and metabolic benefits as one 60-minute session. This is the foundation of the exercise snack model.

Practical implementation: a 20-minute lunchtime walk combined with 10 bodyweight exercises. A 20-minute morning mobility and strength routine requiring no gym at all. A 20-minute evening session at a nearby bookable gym.

Weekly total: 60 minutes of structured movement, zero wasted commute time to a fixed location.

### Strategy 2: The Non-Negotiable Block Calendar Method

Schedule your gym sessions exactly like client meetings. Block 60-minute slots in your calendar two weeks in advance and book the gym slot at the same time. Hourly booking means you can reserve a slot the same day, or even the same morning.

The psychology matters enormously: a booked gym slot with ₹120 already committed has a dramatically higher completion rate than a vague intention to "go to the gym later."

### Strategy 3: The Minimum Effective Dose Program

If you can only commit to 3 sessions per week, this program maximises the return on that time.

Monday — Push and Legs: Squat 4 sets of 6, Bench Press 4 sets of 6, Overhead Press 3 sets of 10, Lateral Raises 3 sets of 15.

Wednesday — Pull and Core: Deadlift 4 sets of 5, Pull-ups 4 sets to max, Cable Row 3 sets of 12, Plank 3 sets of 60 seconds.

Friday or Saturday — Full Body and Conditioning: Romanian Deadlift 3 sets of 10, Dumbbell Press 3 sets of 12, Goblet Squat 3 sets of 15, followed by a 15-minute AMRAP cardio finisher.

### Navigating the Corporate Dinner Problem

* Choose protein-first: grilled meats, paneer dishes, or egg preparations
* Skip the bread basket and request raita or a salad starter instead
* Drink sparkling water or nimbu soda rather than alcohol, or limit yourself to one drink
* Eat a protein-rich snack 30 minutes before the dinner to blunt overeating

### The Mental Health Dimension

Exercise is dose-dependent medicine for occupational stress. A 45-minute moderate-intensity session reduces cortisol, increases BDNF (brain-derived neurotrophic factor), and improves working memory for up to 2 hours afterward. Morning sessions scheduled before high-stakes meetings are particularly effective.`,
    image: 'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?w=800&q=80',
    author: 'Priya Sharma, Finance & Wellness Writer',
    tags: ['Lifestyle', 'Corporate', 'India Fitness'],
    readTime: '7 min',
  },
];

export async function POST() {
  try {
    await dbConnect();
    await Blog.deleteMany({});
    const blogs = await Blog.insertMany(SEED_BLOGS);
    return NextResponse.json({
      message: `Seeded ${blogs.length} blogs successfully`,
      blogs: blogs.map(b => ({ title: b.title, slug: b.slug })),
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
