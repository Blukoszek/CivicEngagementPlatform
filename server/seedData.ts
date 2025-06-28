import { storage } from "./storage";

export async function seedDatabase() {
  try {
    console.log("Seeding database with sample data...");

    // Create sample forums
    const forums = [
      {
        name: "Downtown Community",
        description: "Discussions about downtown development, events, and local business",
        type: "location",
        location: "Downtown"
      },
      {
        name: "Riverside District", 
        description: "Community updates and discussions for the Riverside neighborhood",
        type: "location",
        location: "Riverside"
      },
      {
        name: "Education & Schools",
        description: "Share thoughts on local education policies and school board decisions",
        type: "topic",
        location: null
      },
      {
        name: "Transportation",
        description: "Discuss public transit, bike lanes, and traffic improvements",
        type: "topic", 
        location: null
      }
    ];

    const createdForums = [];
    for (const forum of forums) {
      try {
        const created = await storage.createForum(forum);
        createdForums.push(created);
      } catch (error) {
        // Skip if already exists
      }
    }

    // Create sample events
    const events = [
      {
        title: "Town Hall Meeting - Infrastructure Updates",
        description: "Join us for an important discussion about upcoming infrastructure improvements including road repairs and new bike lanes.",
        location: "City Hall, Main Auditorium",
        startTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // 2 hours later
        organizerId: "sample-user",
        category: "town_hall",
        attendeeCount: 23,
        isVirtual: false,
        meetingUrl: null
      },
      {
        title: "Community Clean-up Day",
        description: "Volunteer to help clean up our local parks and waterways. Supplies provided!",
        location: "Riverside Park",
        startTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
        endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), // 4 hours later
        organizerId: "sample-user",
        category: "volunteer",
        attendeeCount: 45,
        isVirtual: false,
        meetingUrl: null
      },
      {
        title: "Budget Planning Workshop",
        description: "Learn about the city budget process and provide input on spending priorities.",
        location: null,
        startTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000 + 90 * 60 * 1000), // 1.5 hours later
        organizerId: "sample-user",
        category: "workshop",
        attendeeCount: 12,
        isVirtual: true,
        meetingUrl: "https://meet.example.com/budget-workshop"
      }
    ];

    for (const event of events) {
      try {
        await storage.createEvent(event);
      } catch (error) {
        // Skip if already exists
      }
    }

    // Create sample petitions
    const petitions = [
      {
        title: "Install Better Lighting in Central Park",
        description: "Central Park needs improved lighting for safety during evening hours. Many residents avoid the park after dark due to poor visibility. Installing LED lighting would make the park safer and more accessible to all community members.",
        targetSignatures: 500,
        currentSignatures: 127,
        creatorId: "sample-user",
        category: "safety",
        externalUrl: null,
        status: "active",
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      },
      {
        title: "Support Local Business Recovery Program",
        description: "Our local businesses need support to recover from recent economic challenges. This petition calls for the city to create a small business recovery grant program to help our community's economic backbone.",
        targetSignatures: 1000,
        currentSignatures: 342,
        creatorId: "sample-user",
        category: "other",
        externalUrl: null,
        status: "active",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) // 45 days from now
      },
      {
        title: "Create More Bike-Friendly Streets",
        description: "We need protected bike lanes and better cycling infrastructure to encourage eco-friendly transportation and improve air quality in our community.",
        targetSignatures: 750,
        currentSignatures: 456,
        creatorId: "sample-user",
        category: "transportation",
        externalUrl: null,
        status: "active",
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000) // 60 days from now
      }
    ];

    for (const petition of petitions) {
      try {
        await storage.createPetition(petition);
      } catch (error) {
        // Skip if already exists
      }
    }

    // Create sample representatives
    const representatives = [
      {
        name: "Maria Rodriguez",
        title: "Mayor",
        level: "local",
        email: "mayor@cityexample.gov",
        phone: "(555) 123-4567",
        officeAddress: "123 City Hall Plaza, Suite 200",
        bio: "Mayor Rodriguez has served our community for over 8 years, focusing on sustainable development and community engagement.",
        party: "Independent",
        website: "https://www.cityexample.gov/mayor"
      },
      {
        name: "James Thompson",
        title: "City Council Member - District 3",
        level: "local",
        email: "jthompson@citycouncil.gov",
        phone: "(555) 234-5678",
        officeAddress: "123 City Hall Plaza, Suite 150",
        bio: "Council Member Thompson represents District 3 and chairs the Transportation Committee.",
        party: null,
        website: "https://www.cityexample.gov/council/thompson"
      },
      {
        name: "Sarah Chen",
        title: "State Representative - District 42",
        level: "state",
        email: "sarah.chen@statehouse.gov",
        phone: "(555) 345-6789",
        officeAddress: "State Capitol Building, Room 425",
        bio: "Representative Chen focuses on education funding and environmental protection at the state level.",
        party: "Democrat",
        website: "https://statehouse.gov/representatives/chen"
      }
    ];

    for (const rep of representatives) {
      try {
        await storage.createRepresentative(rep);
      } catch (error) {
        // Skip if already exists
      }
    }

    console.log("Database seeded successfully with sample data");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}