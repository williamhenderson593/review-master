import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviews, reviewProfiles, clients } from "@/lib/schema";
import { requireAuth } from "@/lib/auth-utils";
import { eq, and } from "drizzle-orm";

// Synthetic TripAdvisor reviews based on real data structure
const TRIPADVISOR_REVIEWS = [
  {
    externalId: "1011625097",
    rating: 3,
    title: "Nice Hotel but design flaws and unnecessary wait to get a table at the restaurant when it is only a third full",
    body: "It's a nice hotel, great location if you want to be right in the middle of Times Square, very clean and a fun concept but several design issues. Room was too cold and hard to turn off the ac or lower the temperature. Otherwise a very nice room with free coffee and water. Elevators are way too slow. They definitely need more than 4. Very annoying at the Margarittaville restaurant where there are tons of empty tables but they pretend there's a 20 minute wait probably to make it seem more popular. It actually has the opposite effect and people leave. Also annoying that the rooftop bar closes at 8pm. Otherwise food and drink at the restaurants is great. Staff is friendly and it's a really fun vibe.",
    authorName: "Camper65469451318",
    authorAvatar: "https://media-cdn.tripadvisor.com/media/photo-o/1a/f6/eb/e3/default-avatar-2020-59.jpg",
    reviewUrl: "https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r1011625097",
    reviewedAt: new Date("2025-06-08"),
    language: "en",
    sentiment: "neutral",
    topics: ["location", "rooms", "service", "restaurant"],
    metadata: {
      highlights: [
        { feature: "Value", assessment: "1" },
        { feature: "Rooms", assessment: "3" },
        { feature: "Location", assessment: "4" },
        { feature: "Cleanliness", assessment: "4" },
        { feature: "Service", assessment: "4" },
        { feature: "Sleep Quality", assessment: "2" }
      ]
    }
  },
  {
    externalId: "1011196323",
    rating: 1,
    title: "What a terrible turn-off!",
    body: "What a terrible turn-off! Afterwards, we were charged on our credit card for 500 dollars for supposedly smoking in our room. We've just never smoked in our lives. The communication afterwards with the hotel is worthless, the horn was simply thrown at it and also by mail it is impossible to get through. Also read the English reviews that already mention this. It's just become a revenue model of theirs so be warned about this! Book another hotel in this great city.",
    authorName: "Kees J",
    authorAvatar: "https://media-cdn.tripadvisor.com/media/photo-o/1a/f6/e2/e6/default-avatar-2020-45.jpg",
    reviewUrl: "https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r1011196323",
    reviewedAt: new Date("2025-06-05"),
    language: "en",
    sentiment: "negative",
    topics: ["billing", "service", "communication"],
    needsAction: true,
    metadata: {
      originalLanguage: "nl",
      highlights: [
        { feature: "Value", assessment: "3" },
        { feature: "Rooms", assessment: "3" },
        { feature: "Location", assessment: "4" },
        { feature: "Cleanliness", assessment: "3" },
        { feature: "Service", assessment: "1" },
        { feature: "Sleep Quality", assessment: "3" }
      ]
    }
  },
  {
    externalId: "1011092611",
    rating: 1,
    title: "Be aware, abuse creditcard",
    body: "Do not book here!!!! They use your creditcard to take extra money. In our case three amounts $500, $180 and $500. When you ask for the reason they say you smoked in the room. We have never smoked in our lives. Terrible. And so unfair. So be aware and book another hotel!",
    authorName: "Roving34291503545",
    authorAvatar: "https://media-cdn.tripadvisor.com/media/photo-o/1a/f6/f2/b8/default-avatar-2020-26.jpg",
    reviewUrl: "https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r1011092611",
    reviewedAt: new Date("2025-06-04"),
    language: "en",
    sentiment: "negative",
    topics: ["billing", "fraud"],
    needsAction: true,
    metadata: {
      highlights: [
        { feature: "Value", assessment: "1" },
        { feature: "Rooms", assessment: "3" },
        { feature: "Location", assessment: "4" },
        { feature: "Cleanliness", assessment: "2" },
        { feature: "Service", assessment: "1" },
        { feature: "Sleep Quality", assessment: "1" }
      ]
    }
  },
  {
    externalId: "1010837464",
    rating: 5,
    title: "A nice place to enjoy food!",
    body: "Me & my wife decided to have my birthday lunch in here. Long story short, the food was great, the service was friendly & I didn't realize that there's a hotel inside the restaurant where you can stay for a night or two. Highly recommended, give it a try.",
    authorName: "elvis4life",
    authorAvatar: "https://media-cdn.tripadvisor.com/media/photo-o/1a/f6/f1/42/default-avatar-2020-20.jpg",
    reviewUrl: "https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r1010837464",
    reviewedAt: new Date("2025-06-02"),
    language: "en",
    sentiment: "positive",
    topics: ["food", "service", "experience"],
    metadata: {
      highlights: [
        { feature: "Value", assessment: "5" },
        { feature: "Rooms", assessment: "5" },
        { feature: "Location", assessment: "5" },
        { feature: "Cleanliness", assessment: "5" },
        { feature: "Service", assessment: "5" },
        { feature: "Sleep Quality", assessment: "5" }
      ]
    }
  },
  {
    externalId: "1010810427",
    rating: 1,
    title: "BEWARE: $500 Smoking Fee with No Warning or Proof – Appalling Experience",
    body: "I recently stayed at Margaritaville Resort Times Square with a friend. While the hotel itself is nice and the rooms are comfortable, I'm compelled to share my appalling experience that may affect your stay — and your wallet. Upon checkout, I was told that the $500 charge on my credit card was only a hold for incidentals. Weeks later, that amount appeared as a finalized charge. I called the hotel and was informed it was due to a smoking violation. The issue? Neither I nor my friend smoke. The manager was conveniently always 'in a meeting' or 'not in yet.' I disputed the charge with my credit card company, but they couldn't assist because the hotel submitted a report.",
    authorName: "Jen",
    authorAvatar: "https://media-cdn.tripadvisor.com/media/photo-o/1a/f6/f3/23/default-avatar-2020-28.jpg",
    reviewUrl: "https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r1010810427",
    reviewedAt: new Date("2025-06-02"),
    language: "en",
    sentiment: "negative",
    topics: ["billing", "service", "management", "fraud"],
    needsAction: true,
    metadata: {
      highlights: [
        { feature: "Value", assessment: "1" },
        { feature: "Rooms", assessment: "3" },
        { feature: "Location", assessment: "5" },
        { feature: "Cleanliness", assessment: "4" },
        { feature: "Service", assessment: "1" },
        { feature: "Sleep Quality", assessment: "3" }
      ]
    }
  },
  {
    externalId: "1010518716",
    rating: 5,
    title: "Quick trip to meet family from CT. Every detail of the hotel was excellent. Great staff, nice pool, options to dine.",
    body: "This was the most convenient, friendliest spot ever. Love the endless free water, the gift shop, the ambience. Breakfast was good. Two other options for lunch, dinner or snack. Close to Times Square and subway. Would definitely stay here again. They hold your luggage if your transportation is hours after checkout or if you arrive early.",
    authorName: "Maureen Haislett",
    authorAvatar: "https://media-cdn.tripadvisor.com/media/photo-o/1a/f6/e8/91/default-avatar-2020-62.jpg",
    reviewUrl: "https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r1010518716",
    reviewedAt: new Date("2025-05-31"),
    language: "en",
    sentiment: "positive",
    topics: ["location", "service", "amenities", "food"],
    metadata: {
      highlights: [
        { feature: "Value", assessment: "5" },
        { feature: "Rooms", assessment: "5" },
        { feature: "Location", assessment: "5" },
        { feature: "Cleanliness", assessment: "5" },
        { feature: "Service", assessment: "5" },
        { feature: "Sleep Quality", assessment: "5" }
      ]
    }
  },
  {
    externalId: "1010476132",
    rating: 5,
    title: "Ideal location, well equipped room",
    body: "If we have to return to New York, we will probably return to this hotel! Infrastructure: Hotel with nice beach decoration, with reminder of the city in which we are located. Bar, restaurant, café, ATM, souvenir shop, gym, swimming pool. Location: The location of this hotel is simply exceptional: it is just a few meters from Times Square. The location could not have been better. PMR Room: Large enough to circulate with a wheelchair, and well adapted bathroom. The room has a large bay window that face street, so it's really nice.",
    authorName: "Hellywo",
    authorAvatar: "https://media-cdn.tripadvisor.com/media/photo-o/1a/f6/f1/42/default-avatar-2020-20.jpg",
    reviewUrl: "https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r1010476132",
    reviewedAt: new Date("2025-05-31"),
    language: "en",
    sentiment: "positive",
    topics: ["location", "rooms", "accessibility", "amenities"],
    replyText: "Un grand merci pour votre retour si complet et détaillé. Nous sommes ravis que vous ayez apprécié notre emplacement exceptionnel au cœur de Times Square ainsi que les équipements adaptés de votre chambre PMR.",
    repliedAt: new Date("2025-06-05"),
    metadata: {
      originalLanguage: "fr",
      highlights: null
    }
  },
  {
    externalId: "1010337160",
    rating: 5,
    title: "A little piece of paradise in the jungle of Times Square",
    body: "This hotel is worth a visit! It is located in Times Square next to the subway and many attractions such as Bryant Park, Central Station, the must-see library. It is almost new with small rooms very well equipped, beautiful, bright, super clean and with extra soft bedding. A large bay window, if you are on the upper floors, offers you a breathtaking view. The hotel immerses you in a Hawaiian atmosphere. The staff is very helpful.",
    authorName: "Jessica J",
    authorAvatar: "https://media-cdn.tripadvisor.com/media/photo-o/1f/8a/63/3c/jessica-j.jpg",
    reviewUrl: "https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r1010337160",
    reviewedAt: new Date("2025-05-30"),
    language: "en",
    sentiment: "positive",
    topics: ["location", "rooms", "cleanliness", "service"],
    replyText: "Un grand merci pour votre magnifique avis ! Nous sommes ravis que vous ayez apprécié notre emplacement au cœur de Times Square, ainsi que la qualité et la propreté de nos chambres.",
    repliedAt: new Date("2025-06-05"),
    metadata: {
      originalLanguage: "fr",
      highlights: [
        { feature: "Value", assessment: "5" },
        { feature: "Rooms", assessment: "5" },
        { feature: "Location", assessment: "5" },
        { feature: "Cleanliness", assessment: "5" },
        { feature: "Service", assessment: "5" },
        { feature: "Sleep Quality", assessment: "5" }
      ]
    }
  },
  {
    externalId: "1009925135",
    rating: 5,
    title: "GREAT STAY",
    body: "The hotel is in a great location. We were greeted very friendly at the reception. The rooms are very clean. The staff in the restaurant and bar also worked on the bench. Staff are very friendly and accommodating. We have nothing to complain about!",
    authorName: "reinijossen",
    authorAvatar: "https://media-cdn.tripadvisor.com/media/photo-o/1a/f6/e9/bb/default-avatar-2020-65.jpg",
    reviewUrl: "https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r1009925135",
    reviewedAt: new Date("2025-05-27"),
    language: "en",
    sentiment: "positive",
    topics: ["location", "service", "cleanliness"],
    replyText: "vielen Dank für Ihre tolle Bewertung! Es freut uns sehr, dass Ihnen unsere zentrale Lage gefallen hat und Sie sich von unserem Empfangsteam herzlich willkommen geheißen fühlten.",
    repliedAt: new Date("2025-06-05"),
    metadata: {
      originalLanguage: "de",
      highlights: [
        { feature: "Value", assessment: "5" },
        { feature: "Rooms", assessment: "5" },
        { feature: "Location", assessment: "5" },
        { feature: "Cleanliness", assessment: "5" },
        { feature: "Service", assessment: "5" },
        { feature: "Sleep Quality", assessment: "5" }
      ]
    }
  },
  {
    externalId: "1008482206",
    rating: 1,
    title: "SMALL, MUSTY AND LEAVING PRECO FOR A NO-ALCOHOLIC GUEST ISN'T COOL OR $1,000 SMOKING CHARGE FOR A NON-SMOKER",
    body: "The water was always cold, the rooms smell MOLDY, the pool was not heated and at check out I paid 295 which was expected. When reviewing my credit card statement they added a 1,000 extra. THEY SAID THE DAY BEFORE I CHECK OUT I HAD 2 SMOKING CHARGES TO MY ROOM. I CALLED SEVERAL TIMES, ASKED FOR MANAGER THEY SAID CALL BACK HE'S IN A MEETING, HE WENT HOME, HE'S NOT HERE YET, ETC. SCAM SCAM SCAM. I DO NOT RECOMMEND.",
    authorName: "Eugene R",
    authorAvatar: "https://media-cdn.tripadvisor.com/media/photo-o/1a/f6/e7/7b/default-avatar-2020-56.jpg",
    reviewUrl: "https://www.tripadvisor.com/ShowUserReviews-g60763-d23462501-r1008482206",
    reviewedAt: new Date("2025-05-20"),
    language: "en",
    sentiment: "negative",
    topics: ["billing", "rooms", "service", "fraud"],
    needsAction: true,
    metadata: {
      highlights: [
        { feature: "Value", assessment: "1" },
        { feature: "Rooms", assessment: "1" },
        { feature: "Location", assessment: "4" },
        { feature: "Cleanliness", assessment: "3" },
        { feature: "Service", assessment: "2" },
        { feature: "Sleep Quality", assessment: "1" }
      ]
    }
  }
];

// POST - Seed synthetic TripAdvisor reviews for a review profile
export async function POST(request: NextRequest) {
  try {
    const currentUser = await requireAuth();
    if (!currentUser.clientId) {
      return NextResponse.json({ error: "No organization found" }, { status: 400 });
    }

    const body = await request.json();
    const { profileId } = body;

    // If profileId provided, use it; otherwise find or create a TripAdvisor profile
    let targetProfileId = profileId;

    if (!targetProfileId) {
      // Find existing TripAdvisor profile
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
        // Create a new TripAdvisor profile
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

    // Insert synthetic reviews
    const insertedReviews = [];
    for (const reviewData of TRIPADVISOR_REVIEWS) {
      // Check if review already exists
      const [existing] = await db
        .select({ id: reviews.id })
        .from(reviews)
        .where(
          and(
            eq(reviews.profileId, targetProfileId),
            eq(reviews.externalId, reviewData.externalId)
          )
        );

      if (!existing) {
        const [inserted] = await db
          .insert(reviews)
          .values({
            clientId: currentUser.clientId,
            profileId: targetProfileId,
            platform: "tripadvisor",
            externalId: reviewData.externalId,
            rating: reviewData.rating,
            title: reviewData.title,
            body: reviewData.body,
            authorName: reviewData.authorName,
            authorAvatar: reviewData.authorAvatar,
            reviewUrl: reviewData.reviewUrl,
            reviewedAt: reviewData.reviewedAt,
            language: reviewData.language,
            sentiment: reviewData.sentiment,
            topics: reviewData.topics,
            tags: [],
            needsAction: (reviewData as any).needsAction || false,
            replyText: (reviewData as any).replyText || null,
            repliedAt: (reviewData as any).repliedAt || null,
            isPublic: true,
            metadata: reviewData.metadata,
          })
          .returning();
        insertedReviews.push(inserted);
      }
    }

    // Update profile sync status
    await db
      .update(reviewProfiles)
      .set({ syncStatus: "synced", lastSyncedAt: new Date(), updatedAt: new Date() })
      .where(eq(reviewProfiles.id, targetProfileId));

    return NextResponse.json({
      success: true,
      profileId: targetProfileId,
      inserted: insertedReviews.length,
      skipped: TRIPADVISOR_REVIEWS.length - insertedReviews.length,
      total: TRIPADVISOR_REVIEWS.length,
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("Seed reviews error:", error);
    return NextResponse.json({ error: "Failed to seed reviews" }, { status: 500 });
  }
}
