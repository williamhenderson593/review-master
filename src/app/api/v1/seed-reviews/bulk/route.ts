import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewProfiles } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and } from "drizzle-orm";

// ─── Deterministic seeded random ────────────────────────────────────────────
function mulberry32(seed: number) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(42);
function pick<T>(arr: T[]): T { return arr[Math.floor(rand() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}
function randInt(min: number, max: number) { return Math.floor(rand() * (max - min + 1)) + min; }

// ─── Name pools ─────────────────────────────────────────────────────────────
const FIRST = ["James","Mary","Robert","Patricia","John","Jennifer","Michael","Linda","David","Elizabeth","William","Barbara","Richard","Susan","Joseph","Jessica","Thomas","Sarah","Christopher","Karen","Charles","Lisa","Daniel","Nancy","Matthew","Betty","Anthony","Margaret","Mark","Sandra","Steven","Ashley","Paul","Dorothy","Andrew","Emily","Joshua","Donna","Kenneth","Michelle","Kevin","Carol","Brian","Amanda","George","Melissa","Timothy","Deborah","Ronald","Stephanie","Edward","Rebecca","Jason","Sharon","Jeffrey","Laura","Ryan","Cynthia","Jacob","Kathleen","Gary","Amy","Nicholas","Angela","Eric","Shirley","Jonathan","Anna","Stephen","Brenda","Larry","Pamela","Justin","Emma","Scott","Nicole","Brandon","Helen","Benjamin","Samantha","Samuel","Katherine","Raymond","Christine","Gregory","Debra","Frank","Rachel","Alexander","Carolyn","Patrick","Janet","Jack","Catherine","Dennis","Maria","Jerry","Heather","Tyler","Diane","Aaron","Ruth","Jose","Julie","Adam","Olivia","Nathan","Joyce","Henry","Virginia","Peter","Victoria","Zachary","Kelly","Douglas","Lauren","Harold","Christina","Carl","Joan","Arthur","Evelyn","Gerald","Judith","Roger","Megan","Keith","Andrea","Jeremy","Cheryl","Terry","Hannah","Lawrence","Jacqueline","Sean","Martha","Christian","Gloria","Albert","Teresa","Joe","Ann","Ethan","Sara","Austin","Madison","Jesse","Frances","Willie","Kathryn","Billy","Janice","Bryan","Jean","Bruce","Abigail","Jordan","Alice","Ralph","Judy","Roy","Sophia","Noah","Grace","Dylan","Denise","Eugene","Amber","Philip","Doris","Russell","Marilyn","Bobby","Danielle","Harry","Beverly","Vincent","Isabella","Louis","Theresa","Martin","Diana","Hans","Ingrid","Pierre","Marie","Giovanni","Francesca","Carlos","Elena","Hiroshi","Yuki","Wei","Mei","Raj","Priya","Dmitri","Natasha","Lars","Astrid","Sven","Kirsten","Marco","Lucia","Andrei","Olga","Klaus","Heidi","Ravi","Anita","Kenji","Sakura","Ahmed","Fatima","Lukas","Sophie","Matteo","Giulia","Hugo","Camille","Felix","Lena"];
const LAST = ["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Rodriguez","Martinez","Hernandez","Lopez","Gonzalez","Wilson","Anderson","Thomas","Taylor","Moore","Jackson","Martin","Lee","Perez","Thompson","White","Harris","Sanchez","Clark","Ramirez","Lewis","Robinson","Walker","Young","Allen","King","Wright","Scott","Torres","Nguyen","Hill","Flores","Green","Adams","Nelson","Baker","Hall","Rivera","Campbell","Mitchell","Carter","Roberts","Gomez","Phillips","Evans","Turner","Diaz","Parker","Cruz","Edwards","Collins","Reyes","Stewart","Morris","Morales","Murphy","Cook","Rogers","Gutierrez","Ortiz","Morgan","Cooper","Peterson","Bailey","Reed","Kelly","Howard","Ramos","Kim","Cox","Ward","Richardson","Watson","Brooks","Chavez","Wood","Bennett","Gray","Mendoza","Ruiz","Hughes","Price","Alvarez","Castillo","Sanders","Patel","Myers","Long","Ross","Foster","Jimenez","Powell","Jenkins","Perry","Russell","Sullivan","Bell","Coleman","Butler","Henderson","Barnes","Fisher","Vasquez","Simmons","Griffin","Müller","Schmidt","Schneider","Fischer","Weber","Meyer","Wagner","Becker","Rossi","Russo","Ferrari","Esposito","Bianchi","Romano","Dupont","Leroy","Moreau","Laurent","Simon","Tanaka","Yamamoto","Suzuki","Chen","Wang","Li","Zhang","Kumar","Singh","Sharma","Gupta","Johansson","Andersson","Nilsson","Petrov"];

// ─── Topic pools ────────────────────────────────────────────────────────────
const ALL_TOPICS = ["location","rooms","service","food","cleanliness","amenities","pool","bar","gym","spa","wifi","view","noise","check-in","check-out","parking","bathroom","bed","elevator","ac","value","restaurant","staff","breakfast","housekeeping","safety","accessibility","decor","maintenance","billing"];

// ─── Review text fragments by rating/sentiment ──────────────────────────────

const TITLES: Record<number, string[]> = {
  5: [
    "Absolutely fantastic stay!","Best hotel experience ever","Will definitely be back!","Exceeded all expectations","A gem in the heart of the city","Perfect in every way","Outstanding hotel","What a wonderful experience!","Five stars all the way","Incredible from check-in to checkout","Truly world-class","Can't say enough good things","The perfect getaway","Luxury at its finest","Made our trip unforgettable","Top-notch in every regard","Pure bliss","A masterclass in hospitality","Best decision for our trip","Flawless experience","Heavenly stay","Superb hotel, loved it","Everything was perfect","Dream hotel found","Unbelievable quality",
  ],
  4: [
    "Great stay with minor issues","Really enjoyed our time","Very good, almost perfect","Solid choice, would return","Impressive with a few nitpicks","Lovely stay overall","Very pleasant experience","Good value for the price","Nice hotel, great location","Enjoyable, small things to improve","Mostly excellent","Comfortable and convenient","Happy with our choice","Would recommend","Nearly perfect stay","Great hotel, minor gripes","Pleasantly surprised","Very good experience","Reliable and comfortable","Solid 4-star stay",
  ],
  3: [
    "Decent stay, nothing special","Average hotel experience","Mixed feelings","OK for the price","Middle of the road","Not bad, not great","Adequate but underwhelming","Fine for a short stay","Has potential but needs work","Some hits, some misses","Acceptable, won't rush back","Standard experience","Room for improvement","Just okay","Met expectations, nothing more","Could be better","Average at best","Mediocre overall","Fair enough","Nothing to write home about",
  ],
  2: [
    "Disappointing experience","Would not stay again","Not worth the money","Below expectations","Save your money","Left much to be desired","Frustrating stay","Not as advertised","Needs major improvements","Overpriced and underwhelming","Couldn't wait to leave","Very disappointing","Won't be returning","Expected much better","Not recommended","Regret booking here","Poor value","Subpar experience","Let down badly","Wouldn't recommend",
  ],
  1: [
    "Terrible experience - avoid!","Worst hotel stay ever","Complete disaster","Ruined our vacation","Absolutely dreadful","Zero stars if I could","Nightmare hotel","Do NOT book here","Horrific experience","Waste of money","Disgraceful","Appalling in every way","Never again","Health hazard hotel","Scam alert - stay away","Unacceptable","Beyond disappointed","The worst","Horrible, just horrible","Total rip-off",
  ],
};

// Body fragments that get composed together
const OPENERS: Record<number, string[]> = {
  5: [
    "From the moment we walked in, we were blown away.",
    "This hotel sets the standard for hospitality.",
    "We had an absolutely magical stay here.",
    "I can't praise this hotel enough.",
    "What an incredible experience from start to finish.",
    "This was hands down the best hotel we've ever stayed at.",
    "Everything about this place screamed excellence.",
    "We were immediately impressed upon arrival.",
    "Wow - just wow. This hotel is something special.",
    "Perfection. That's the word that comes to mind.",
  ],
  4: [
    "Really enjoyed our stay here overall.",
    "A very pleasant experience with just a few minor things.",
    "We had a great time at this hotel.",
    "This is a solid hotel that does most things right.",
    "Overall a very good experience.",
    "Happy we chose this hotel for our trip.",
    "A lovely hotel that's almost perfect.",
    "We had a genuinely enjoyable stay.",
    "Good hotel with a few areas for improvement.",
    "Pleasantly surprised by the quality here.",
  ],
  3: [
    "It was an okay stay - not bad, not great.",
    "Mixed feelings about this hotel honestly.",
    "Some things were good, others not so much.",
    "An average experience that met basic expectations.",
    "The hotel has potential but falls short in some areas.",
    "Decent enough for a short stay.",
    "It's fine if you don't expect too much.",
    "Had higher hopes based on the photos online.",
    "A standard hotel experience, nothing memorable.",
    "Not terrible but definitely room for improvement.",
  ],
  2: [
    "Pretty disappointed with this hotel.",
    "Not the experience we were hoping for.",
    "This hotel really let us down.",
    "Struggled to find positives during our stay.",
    "For the price we paid, this was unacceptable.",
    "I've stayed at much better hotels for less money.",
    "Wouldn't stay here again given other options.",
    "The hotel clearly doesn't live up to its marketing.",
    "A frustrating experience overall.",
    "Below average in almost every way.",
  ],
  1: [
    "This was an absolute nightmare from start to finish.",
    "I cannot believe this hotel is still operating.",
    "The worst hotel experience of my life.",
    "Do yourself a favor and avoid this place.",
    "I'm shocked by how terrible this hotel is.",
    "Where do I even begin with the problems?",
    "Absolutely disgusting and unacceptable.",
    "I want my money back. This was a scam.",
    "Ruined our entire trip. Completely unacceptable.",
    "I'm writing this review as a public service warning.",
  ],
};

// Topic-specific body sentences (positive)
const POSITIVE_SENTENCES: Record<string, string[]> = {
  location: [
    "The location is unbeatable - right in the heart of everything.",
    "Steps away from all major attractions and public transport.",
    "Perfectly situated for exploring the city on foot.",
    "You couldn't ask for a better location than this.",
    "Central location made our sightseeing incredibly convenient.",
  ],
  rooms: [
    "The room was spacious, modern, and immaculately clean.",
    "Our room was beautifully appointed with premium furnishings.",
    "The bed was incredibly comfortable with luxury linens.",
    "Room exceeded expectations - well designed and spotless.",
    "Loved the room - great layout, comfy bed, everything worked perfectly.",
  ],
  service: [
    "Staff went above and beyond at every interaction.",
    "The service here is truly exceptional - every staff member was wonderful.",
    "Concierge was incredibly helpful with restaurant recommendations and bookings.",
    "Staff remembered our names and preferences after the first day.",
    "Outstanding service from check-in to checkout.",
  ],
  food: [
    "The restaurant serves absolutely phenomenal food.",
    "Breakfast buffet was one of the best I've experienced - huge variety.",
    "The on-site dining exceeded our expectations completely.",
    "Food quality was restaurant-grade, not typical hotel fare.",
    "Every meal we had at the hotel was delicious.",
  ],
  cleanliness: [
    "Everything was spotlessly clean throughout our stay.",
    "Housekeeping did an impeccable job every single day.",
    "The level of cleanliness was truly impressive.",
    "Not a speck of dust anywhere - immaculate.",
    "Cleanliness standards here are top-notch.",
  ],
  amenities: [
    "The amenities are top-tier - pool, gym, spa, everything you need.",
    "Loved all the extra amenities - complimentary water, coffee machine, robes.",
    "Great facilities throughout the hotel.",
    "The amenity package is excellent for the price.",
    "Well-equipped with everything a guest could want.",
  ],
  pool: [
    "The pool area is gorgeous with amazing views.",
    "Spent wonderful afternoons at the pool - well maintained and not overcrowded.",
    "The rooftop pool was the highlight of our stay.",
    "Pool was clean, warm, and had a great atmosphere.",
    "Kids loved the pool - great for families.",
  ],
  bar: [
    "The hotel bar makes incredible cocktails.",
    "Rooftop bar has stunning views and great drinks.",
    "The bar is the perfect spot for evening relaxation.",
    "Bartenders are skilled and the drink menu is creative.",
    "Happy hour at the bar was a daily highlight.",
  ],
  spa: [
    "The spa treatment was absolutely heavenly.",
    "Best hotel spa experience I've had - truly relaxing.",
    "The wellness area is a wonderful addition to the hotel.",
    "Spa staff were professional and the facilities were beautiful.",
    "Left the spa feeling completely rejuvenated.",
  ],
  gym: [
    "The gym is well-equipped with modern machines.",
    "Great fitness center - had everything I needed for my workouts.",
    "The gym was clean, spacious, and never crowded.",
    "Impressed by the quality of the gym equipment.",
    "Nice gym with good hours and complimentary water.",
  ],
  wifi: [
    "Fast and reliable WiFi throughout the entire hotel.",
    "WiFi was excellent - could work remotely without issues.",
    "Internet was fast and free, which we appreciated.",
    "Great connectivity - streamed movies without buffering.",
    "WiFi worked perfectly everywhere including the pool area.",
  ],
  view: [
    "The view from our room was absolutely breathtaking.",
    "Waking up to that stunning city panorama was magical.",
    "The views alone are worth the stay.",
    "Our room had an incredible view of the skyline.",
    "Gorgeous views from the upper floors.",
  ],
  breakfast: [
    "Breakfast spread was extensive with something for everyone.",
    "The morning breakfast was a real treat - fresh and varied.",
    "Best hotel breakfast I've had in years.",
    "Great coffee and fresh pastries every morning.",
    "Breakfast buffet was worth waking up early for.",
  ],
  staff: [
    "The staff here are genuinely warm and caring.",
    "Every staff member we interacted with was professional and friendly.",
    "Hotel staff made us feel like VIPs.",
    "The team here clearly takes pride in their work.",
    "Staff were attentive without being intrusive - perfect balance.",
  ],
  value: [
    "Excellent value for money - you get a lot for what you pay.",
    "Very fairly priced for the quality offered.",
    "One of the best value hotels I've stayed at.",
    "Worth every penny and then some.",
    "Great price-to-quality ratio.",
  ],
  bathroom: [
    "Bathroom was spacious with a wonderful rainfall shower.",
    "Loved the bathroom - heated floors, great water pressure, luxury toiletries.",
    "The bathroom was modern and beautifully designed.",
    "Excellent bathroom with quality fixtures throughout.",
    "The shower experience was truly premium.",
  ],
  bed: [
    "The bed was like sleeping on a cloud.",
    "Best hotel bed I've ever slept in - unbelievably comfortable.",
    "Premium mattress and linens made for perfect sleep.",
    "Slept amazingly well every night thanks to the quality bedding.",
    "The pillow menu was a nice touch - found my perfect pillow.",
  ],
  "check-in": [
    "Check-in was seamless and took only a few minutes.",
    "Smooth, efficient check-in with a warm welcome.",
    "Express check-in made our arrival stress-free.",
    "The check-in experience set the tone for a wonderful stay.",
    "Arrived early and they still got us into our room quickly.",
  ],
  decor: [
    "The hotel's decor is stunning and Instagram-worthy.",
    "Beautiful interior design throughout the property.",
    "The aesthetic of this hotel is just gorgeous.",
    "Loved the modern yet warm design of the spaces.",
    "Every corner of this hotel is beautifully decorated.",
  ],
  safety: [
    "Felt completely safe throughout our stay.",
    "Excellent security measures without being overbearing.",
    "The hotel takes guest safety seriously - very reassuring.",
    "Well-lit, secure, and we never felt unsafe.",
    "Key card access and security presence made us feel comfortable.",
  ],
  parking: [
    "Convenient parking right at the hotel.",
    "Valet parking was efficient and reasonably priced.",
    "Appreciated having secure on-site parking.",
    "Easy parking situation, which is rare in this area.",
    "Underground parking was a great convenience.",
  ],
  restaurant: [
    "The on-site restaurant is genuinely excellent.",
    "Hotel restaurant rivals the best standalone restaurants in the area.",
    "Multiple dining options all of high quality.",
    "The restaurant ambiance was lovely for evening dining.",
    "Great menu variety at the hotel restaurant.",
  ],
  elevator: [
    "Modern, fast elevators - never had to wait long.",
    "Elevators were efficient even during busy times.",
    "Quick elevator access to all floors.",
    "The elevators were fast and well-maintained.",
    "Smooth elevator experience throughout.",
  ],
  ac: [
    "Air conditioning worked perfectly and was easy to control.",
    "Room temperature was easy to adjust to our liking.",
    "Great climate control in the room.",
    "AC was quiet and effective.",
    "Loved having individual climate control in our room.",
  ],
  accessibility: [
    "Great accessibility features throughout the hotel.",
    "Wheelchair accessible with well-designed adapted rooms.",
    "The hotel clearly prioritizes accessibility for all guests.",
    "Accessible facilities were excellent.",
    "Impressed by the thought put into accessibility.",
  ],
  housekeeping: [
    "Housekeeping was thorough and consistent every day.",
    "Room was always pristine when we returned.",
    "Excellent housekeeping service.",
    "The daily housekeeping was immaculate.",
    "Housekeeping went above and beyond.",
  ],
  maintenance: [
    "Everything in the room was in perfect working order.",
    "The hotel is clearly well-maintained.",
    "No issues with any fixtures or facilities.",
    "Everything worked flawlessly throughout our stay.",
    "Well-maintained property top to bottom.",
  ],
  noise: [
    "Surprisingly quiet despite the central location.",
    "Excellent soundproofing - slept perfectly.",
    "Very quiet room, couldn't hear any outside noise.",
    "The room was a peaceful oasis in the busy city.",
    "Great noise insulation - slept like a baby.",
  ],
  "check-out": [
    "Check-out was quick and easy.",
    "Express checkout made departure hassle-free.",
    "Smooth checkout experience.",
    "Check-out was efficient and friendly.",
    "Easy checkout with a nice farewell from staff.",
  ],
  billing: [
    "No billing surprises - everything was transparent.",
    "Clear and accurate billing throughout.",
    "Appreciated the transparent pricing with no hidden fees.",
    "Bill was exactly as expected - no extra charges.",
    "Honest and straightforward billing.",
  ],
};

// Topic-specific body sentences (negative)
const NEGATIVE_SENTENCES: Record<string, string[]> = {
  location: [
    "The area around the hotel felt sketchy, especially at night.",
    "Location is misleading - not as central as advertised.",
    "Noisy street location made it hard to sleep.",
    "The neighborhood felt unsafe for walking.",
    "Far from what we wanted to see despite the description.",
  ],
  rooms: [
    "The room was tiny, dated, and nothing like the photos.",
    "Room was clearly in need of renovation - peeling wallpaper and stained carpet.",
    "Our room smelled musty and the furniture was worn out.",
    "Room was far too small for the price we paid.",
    "The room was a huge disappointment - cramped and outdated.",
  ],
  service: [
    "Staff seemed completely indifferent to guest needs.",
    "Asked for help multiple times and was either ignored or brushed off.",
    "The front desk staff were rude and unhelpful.",
    "Service was nonexistent - had to chase staff for basic requests.",
    "Worst customer service I've encountered at any hotel.",
  ],
  food: [
    "The food at the restaurant was overpriced and terrible.",
    "Breakfast was stale, cold, and limited in options.",
    "Don't bother with the hotel restaurant - go literally anywhere else.",
    "Food quality was awful - clearly pre-made and reheated.",
    "The restaurant was a huge letdown - tasteless food at ridiculous prices.",
  ],
  cleanliness: [
    "The room was not properly cleaned - found hair on the sheets.",
    "Disgusting bathroom with mold in the grout and stained tiles.",
    "Cleanliness was seriously lacking - I've seen cleaner budget motels.",
    "Found dust bunnies under the bed and stains on the carpet.",
    "The room clearly hadn't been deep cleaned in months.",
  ],
  amenities: [
    "The advertised amenities were either closed or in poor condition.",
    "Amenities were a joke - half of them were out of order.",
    "Don't be fooled by the amenity list - most things don't work.",
    "Very few working amenities for the price charged.",
    "The amenities were outdated and poorly maintained.",
  ],
  pool: [
    "The pool was dirty and the area was unkempt.",
    "Pool was closed for 'maintenance' during our entire stay.",
    "The pool water looked questionable and the deck chairs were broken.",
    "Tiny, overcrowded pool that's nothing like the website photos.",
    "Pool area was unsanitary and uncomfortable.",
  ],
  bar: [
    "The bar was overpriced with poorly made drinks.",
    "Bar closed absurdly early - what's the point?",
    "Drinks were watered down and the bartender was unfriendly.",
    "The bar was dirty and the drink selection was limited.",
    "Terrible bar experience - slow service and bad cocktails.",
  ],
  spa: [
    "The spa was a disappointment - cramped and not clean.",
    "Booked a spa treatment that was rushed and impersonal.",
    "The spa facilities were outdated and overpriced.",
    "Not a relaxing spa experience at all.",
    "Spa was nothing like advertised - very disappointing.",
  ],
  gym: [
    "The gym had broken equipment and was cramped.",
    "So-called gym was a closet with two rusty treadmills.",
    "Gym equipment was outdated and some machines didn't work.",
    "Tiny, poorly ventilated gym - barely usable.",
    "The fitness center was a massive disappointment.",
  ],
  wifi: [
    "WiFi was painfully slow and kept disconnecting.",
    "They charge extra for WiFi - outrageous in this day and age.",
    "Internet barely worked - couldn't even load basic web pages.",
    "WiFi dropped constantly. Useless for any work.",
    "The worst hotel WiFi I've ever experienced.",
  ],
  view: [
    "Our 'city view' room faced a brick wall.",
    "The view was of a dumpster in the alley.",
    "Don't believe the view photos - ours was terrible.",
    "Paid extra for a view room and got a parking lot.",
    "No view whatsoever despite booking a premium room.",
  ],
  breakfast: [
    "Breakfast was terrible - stale bread, cold eggs, weak coffee.",
    "The breakfast 'buffet' was barely three items.",
    "Worst hotel breakfast ever - inedible.",
    "Breakfast was the same sad selection every day.",
    "Skip the breakfast - go to a nearby cafe instead.",
  ],
  staff: [
    "Staff were unfriendly and seemed annoyed by guests.",
    "Unhelpful, rude staff who clearly don't enjoy their jobs.",
    "Staff couldn't care less about guest satisfaction.",
    "Multiple interactions with dismissive, impolite staff.",
    "The staff attitude ruined what could have been okay stay.",
  ],
  value: [
    "Grossly overpriced for what you get.",
    "Terrible value - you can find much better for half the price.",
    "One of the worst value hotels I've ever stayed at.",
    "Complete waste of money.",
    "Cannot justify the price for this level of quality.",
  ],
  bathroom: [
    "Bathroom was disgusting - mold, hair, and poor water pressure.",
    "The shower barely worked and the bathroom smelled.",
    "Bathroom was tiny, dirty, and the toilet ran all night.",
    "Mold in the shower and the drain was clogged.",
    "Worst bathroom I've seen in a hotel at this price point.",
  ],
  bed: [
    "The bed was rock hard and the pillows were flat as pancakes.",
    "Mattress was lumpy and clearly ancient - terrible sleep.",
    "Could feel every spring in the mattress. Awful.",
    "The bed was so uncomfortable I considered sleeping in the car.",
    "Stained mattress and threadbare sheets. Unacceptable.",
  ],
  "check-in": [
    "Check-in was a 45-minute ordeal despite having a reservation.",
    "Chaotic check-in process with untrained staff.",
    "Had to wait forever to check in while staff chatted amongst themselves.",
    "Check-in was disorganized and frustrating.",
    "Worst check-in experience - our reservation was lost.",
  ],
  noise: [
    "Paper-thin walls - heard everything from neighboring rooms.",
    "Street noise was unbearable. No soundproofing at all.",
    "Couldn't sleep due to constant noise from the hallway.",
    "The room was incredibly noisy - no peace at all.",
    "Noise levels were unacceptable for a hotel at this price.",
  ],
  elevator: [
    "Elevators were painfully slow and frequently broken.",
    "Only 2 working elevators for 20+ floors - absurd wait times.",
    "The elevator smelled terrible and took ages.",
    "Had to wait 15+ minutes for an elevator during peak times.",
    "Elevator was out of service, had to climb 10 flights of stairs.",
  ],
  ac: [
    "AC was either freezing or broken - no middle ground.",
    "The air conditioning unit was incredibly loud.",
    "Room was sweltering because the AC didn't work.",
    "AC made a horrible rattling noise all night.",
    "Couldn't control the room temperature at all.",
  ],
  parking: [
    "Parking was $60/night on top of the room rate. Highway robbery.",
    "No parking available despite being listed as an amenity.",
    "The parking garage was dark, cramped, and felt unsafe.",
    "Outrageous parking fees with no in-and-out privileges.",
    "Valet scratched our car and denied responsibility.",
  ],
  housekeeping: [
    "Housekeeping never came unless we called three times.",
    "Room was not cleaned properly - dirty towels left behind.",
    "Housekeeping missed our room entirely on two days.",
    "Had to request basic supplies that should have been restocked.",
    "Housekeeping quality was inconsistent and unreliable.",
  ],
  billing: [
    "Found mysterious charges on our bill at checkout.",
    "They charged our card extra after we left without explanation.",
    "Billing was a nightmare - hidden fees everywhere.",
    "Disputed a fraudulent charge and the hotel was unhelpful.",
    "Watch your bill carefully - they sneak in extra charges.",
  ],
  maintenance: [
    "Multiple things in the room were broken and never fixed.",
    "Called maintenance about a leaking faucet - they never came.",
    "The room had clearly not been maintained in years.",
    "Light fixtures broken, drawer handles missing, paint peeling.",
    "This hotel desperately needs renovation and maintenance.",
  ],
  restaurant: [
    "Hotel restaurant was terrible - avoid at all costs.",
    "Overpriced, undersized portions of mediocre food.",
    "The restaurant had a 20-min wait despite empty tables.",
    "Restaurant food was bland and the service was slow.",
    "Don't waste your money at the hotel restaurant.",
  ],
  "check-out": [
    "Check-out was chaotic with a long queue.",
    "They tried to charge us for damages we didn't cause at checkout.",
    "Check-out process took forever.",
    "Couldn't do express checkout because the system was down.",
    "Check-out was the final frustrating interaction in a bad stay.",
  ],
  safety: [
    "Didn't feel safe - our room door lock was flimsy.",
    "No security presence and poorly lit hallways at night.",
    "Found our door unlocked after housekeeping left. Unacceptable.",
    "Safety doesn't seem to be a priority here.",
    "The fire exit was blocked with furniture. Dangerous.",
  ],
  decor: [
    "The decor is stuck in the 1990s and not in a charming way.",
    "Outdated, worn furnishings throughout the hotel.",
    "The lobby looks nice but the rooms are dated and tired.",
    "Decor was depressing - dark colors and worn furniture.",
    "The whole hotel needs a major style update.",
  ],
  accessibility: [
    "Accessibility was very poor despite claiming to be accessible.",
    "The 'accessible' room barely met basic standards.",
    "Wheelchair access was difficult with narrow doorways.",
    "Accessibility features were inadequate and poorly maintained.",
    "Not truly accessible - a problem for guests with mobility issues.",
  ],
};

const CLOSERS: Record<number, string[]> = {
  5: [
    "Already booked our next stay!",
    "Highest recommendation possible.",
    "Truly a five-star experience in every way.",
    "We will absolutely be returning.",
    "If you're looking for the best, this is it.",
    "Worth every single penny.",
    "This hotel has set a new standard for us.",
    "Couldn't have asked for anything more.",
    "Run, don't walk, to book this hotel.",
    "Perfection exists and it's this hotel.",
  ],
  4: [
    "Would definitely stay again.",
    "A great choice that I'd recommend to friends.",
    "Minor things aside, it's a really good hotel.",
    "We'd happily return on our next trip.",
    "Solid hotel that delivers on its promises.",
    "Would book again without hesitation.",
    "Very good hotel that's close to being perfect.",
    "Recommended with minor caveats.",
    "A reliable choice for your stay.",
    "Happy to give 4 stars - well earned.",
  ],
  3: [
    "It's fine if your expectations aren't too high.",
    "An average stay - nothing more, nothing less.",
    "Would only return if the price was right.",
    "There are better options in the area for the same price.",
    "Take the online photos with a grain of salt.",
    "It serves its purpose for a short stay.",
    "Not bad enough to complain about, not good enough to rave about.",
    "Middling experience that was just okay.",
    "You get what you pay for here.",
    "Adequate but unmemorable.",
  ],
  2: [
    "Would not return or recommend.",
    "Plenty of better options in the area.",
    "Save your money for a different hotel.",
    "Disappointed and let down. Will look elsewhere next time.",
    "Can't recommend based on our experience.",
    "Overpriced for what you actually get.",
    "I'd suggest looking at alternatives.",
    "Not worth the money at all.",
    "Left feeling very unsatisfied.",
    "Regret not reading more reviews before booking.",
  ],
  1: [
    "Avoid at all costs. You've been warned.",
    "I'll be filing a formal complaint.",
    "This hotel should be shut down.",
    "The worst money I've ever spent on accommodation.",
    "Booking this was the biggest mistake of our trip.",
    "Please save yourself the misery and stay elsewhere.",
    "I cannot stress enough how bad this was.",
    "Zero stars if it were possible.",
    "Run as far away from this hotel as you can.",
    "An absolute disgrace to the hospitality industry.",
  ],
};

// ─── Highlights by rating ───────────────────────────────────────────────────
const FEATURES = ["Value", "Rooms", "Location", "Cleanliness", "Service", "Sleep Quality"];

function generateHighlights(rating: number): { feature: string; assessment: string }[] {
  return FEATURES.map(f => {
    let base = rating;
    const variance = randInt(-1, 1);
    let score = Math.max(1, Math.min(5, base + variance));
    if (f === "Location") score = Math.max(score, 3); // location usually rates higher
    return { feature: f, assessment: String(score) };
  });
}

// ─── Generate a single review ───────────────────────────────────────────────

function generateReview(index: number, date: Date) {
  // Rating distribution: 5★ 35%, 4★ 25%, 3★ 18%, 2★ 12%, 1★ 10%
  const r = rand();
  let rating: number;
  if (r < 0.10) rating = 1;
  else if (r < 0.22) rating = 2;
  else if (r < 0.40) rating = 3;
  else if (r < 0.65) rating = 4;
  else rating = 5;

  // Sentiment correlated with rating
  let sentiment: string;
  if (rating >= 4) sentiment = "positive";
  else if (rating === 3) sentiment = rand() < 0.6 ? "neutral" : (rand() < 0.5 ? "positive" : "negative");
  else sentiment = "negative";

  // Pick topics (2-4)
  const numTopics = randInt(2, 4);
  const topics = pickN(ALL_TOPICS, numTopics);

  // Build body from fragments
  const opener = pick(OPENERS[rating]);
  const topicSentences = topics.map(t => {
    const pool = (rating >= 4) ? POSITIVE_SENTENCES : (rating <= 2) ? NEGATIVE_SENTENCES : (rand() < 0.5 ? POSITIVE_SENTENCES : NEGATIVE_SENTENCES);
    const sentences = pool[t];
    return sentences ? pick(sentences) : "";
  }).filter(Boolean);
  const closer = pick(CLOSERS[rating]);
  const body = [opener, ...topicSentences, closer].join(" ");

  const title = pick(TITLES[rating]);
  const authorName = `${pick(FIRST)} ${pick(LAST)}`;
  const needsAction = rating <= 2 && rand() < 0.7;

  // Some reviews have replies (more likely for recent ones, positive, or negative needing action)
  let replyText: string | null = null;
  let repliedAt: Date | null = null;
  const replyChance = rating === 5 ? 0.3 : rating === 4 ? 0.2 : rating === 1 ? 0.4 : rating === 2 ? 0.35 : 0.15;
  if (rand() < replyChance) {
    const replyDays = randInt(1, 14);
    repliedAt = new Date(date.getTime() + replyDays * 24 * 60 * 60 * 1000);
    if (rating >= 4) {
      replyText = pick([
        "Thank you so much for your wonderful review! We're thrilled you enjoyed your stay and hope to welcome you back soon.",
        "We truly appreciate your kind words! Our team works hard to provide the best experience possible.",
        "Thank you for taking the time to share your experience. We're so glad you had a great stay!",
        "What a lovely review! Thank you for choosing our hotel. We look forward to your next visit.",
        "We're delighted to hear about your positive experience. Thank you for your recommendation!",
      ]);
    } else {
      replyText = pick([
        "We sincerely apologize for the issues you experienced. Your feedback has been shared with our management team and we are taking steps to address these concerns.",
        "Thank you for your honest feedback. We're sorry your stay didn't meet expectations. We'd love the opportunity to make things right.",
        "We're very sorry to hear about your experience. This is not the standard we hold ourselves to and we are investigating the issues you've raised.",
        "We apologize for the inconvenience. Your concerns are being addressed directly by our general manager. Please contact us so we can resolve this.",
        "We take your feedback very seriously and apologize for falling short. We are making changes to ensure this doesn't happen again.",
      ]);
    }
  }

  const languages = ["en", "en", "en", "en", "en", "en", "en", "fr", "de", "es", "it", "nl", "ja", "pt"];

  return {
    externalId: `sim-${1000000 + index}`,
    rating,
    title,
    body,
    authorName,
    authorAvatar: null,
    reviewUrl: `https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r${1000000 + index}`,
    reviewedAt: date,
    language: pick(languages),
    sentiment,
    topics,
    tags: [] as string[],
    needsAction,
    replyText,
    repliedAt,
    isPublic: true,
    metadata: {
      highlights: generateHighlights(rating),
      simulated: true,
    },
  };
}

// ─── Generate all dates spread across 2023-01-01 to 2026-03-01 ─────────────

function generateDates(count: number): Date[] {
  const start = new Date("2023-01-01T00:00:00Z");
  const end = new Date("2026-03-01T00:00:00Z");
  const range = end.getTime() - start.getTime();

  // Weight distribution: gradually increasing over time (hotel gets more popular)
  // 2023: ~20%, 2024: ~25%, 2025: ~35%, 2026 Jan-Feb: ~20%
  const dates: Date[] = [];
  for (let i = 0; i < count; i++) {
    // Use a power curve to skew dates toward more recent
    const t = rand();
    const skewed = Math.pow(t, 0.75); // slight bias toward recent dates
    const ms = start.getTime() + skewed * range;
    const date = new Date(ms);
    // Add random hour/minute for realism
    date.setUTCHours(randInt(6, 23), randInt(0, 59), randInt(0, 59));
    dates.push(date);
  }
  return dates.sort((a, b) => a.getTime() - b.getTime());
}

// ─── API Route ──────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const count = Math.min(body.count || 4000, 5000);
    const profileId = body.profileId;

    // Find or create TripAdvisor profile
    let targetProfileId = profileId;
    if (!targetProfileId) {
      const [existingProfile] = await db
        .select()
        .from(reviewProfiles)
        .where(
          and(
            eq(reviewProfiles.clientId, currentUser.clientId),
            eq(reviewProfiles.platform, "tripadvisor")
          )
        );

      if (existingProfile) {
        targetProfileId = existingProfile.id;
      } else {
        const [newProfile] = await db
          .insert(reviewProfiles)
          .values({
            clientId: currentUser.clientId,
            name: "Margaritaville Resort Times Square - TripAdvisor",
            platform: "tripadvisor",
            platformProfileId: "d23462501",
            profileUrl: "https://www.tripadvisor.com/Hotel_Review-g60763-d23462501-Reviews-Margaritaville_Times_Square-New_York_City_New_York.html",
            syncStatus: "synced",
            lastSyncedAt: new Date(),
          })
          .returning();
        targetProfileId = newProfile.id;
      }
    }

    // Generate all reviews
    const dates = generateDates(count);
    const allReviews = dates.map((date, i) => generateReview(i, date));

    // Batch insert in chunks of 100
    const BATCH_SIZE = 100;
    let inserted = 0;
    let skipped = 0;

    for (let i = 0; i < allReviews.length; i += BATCH_SIZE) {
      const batch = allReviews.slice(i, i + BATCH_SIZE);
      const values = batch.map(r => ({
        clientId: currentUser.clientId!,
        profileId: targetProfileId,
        platform: "tripadvisor" as const,
        externalId: r.externalId,
        rating: r.rating,
        title: r.title,
        body: r.body,
        authorName: r.authorName,
        authorAvatar: r.authorAvatar,
        reviewUrl: r.reviewUrl,
        reviewedAt: r.reviewedAt,
        language: r.language,
        sentiment: r.sentiment,
        topics: r.topics,
        tags: r.tags,
        needsAction: r.needsAction,
        replyText: r.replyText,
        repliedAt: r.repliedAt,
        isPublic: r.isPublic,
        metadata: r.metadata,
      }));

      try {
        const result = await db.insert(reviews).values(values).onConflictDoNothing().returning({ id: reviews.id });
        inserted += result.length;
        skipped += batch.length - result.length;
      } catch (err) {
        // If batch fails, try individual inserts
        for (const val of values) {
          try {
            await db.insert(reviews).values(val).onConflictDoNothing();
            inserted++;
          } catch {
            skipped++;
          }
        }
      }
    }

    // Update profile sync status
    await db
      .update(reviewProfiles)
      .set({ syncStatus: "synced", lastSyncedAt: new Date(), updatedAt: new Date() })
      .where(eq(reviewProfiles.id, targetProfileId));

    // Compute stats
    const ratingCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    const sentimentCounts = { positive: 0, neutral: 0, negative: 0 };
    const yearCounts: Record<string, number> = {};
    for (const r of allReviews) {
      ratingCounts[r.rating as keyof typeof ratingCounts]++;
      sentimentCounts[r.sentiment as keyof typeof sentimentCounts]++;
      const year = r.reviewedAt.getFullYear();
      const key = year === 2026 ? "2026 (Jan-Feb)" : String(year);
      yearCounts[key] = (yearCounts[key] || 0) + 1;
    }

    return NextResponse.json({
      success: true,
      profileId: targetProfileId,
      inserted,
      skipped,
      total: allReviews.length,
      distribution: {
        byRating: ratingCounts,
        bySentiment: sentimentCounts,
        byYear: yearCounts,
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Bulk seed reviews error:", error);
    return NextResponse.json({ error: "Failed to seed reviews", details: error.message }, { status: 500 });
  }
}
