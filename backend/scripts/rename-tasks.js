require('dotenv').config({ path: '../../.env' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

const realisticTitles = [
  "Setup Production Vercel Deployment",
  "Design Figma Mockups for Mobile App",
  "Refactor Redux State for Performance",
  "Write Unit Tests for Authentication",
  "Fix iOS Safari Scrolling Bug",
  "Audit NPM Dependencies for Security",
  "Create Onboarding Flow for New Users",
  "Optimize Database Indexes in MongoDB",
  "Integrate Stripe Payment Gateway",
  "Update Privacy Policy Document",
  "Draft API Documentation in Swagger",
  "Implement Infinite Scroll on Dashboard",
  "Review Pull Request #402",
  "Configure CI/CD GitHub Actions",
  "Fix Memory Leak in Node.js Worker",
  "Design Email Templates for Password Reset",
  "Conduct User Research Interviews",
  "Migrate Legacy CSS to Tailwind",
  "Setup WebSocket for Real-time Chat",
  "Optimize Image Assets for WebP"
];

const extraTitles = [
  "Implement Role-Based Access Control",
  "Add OAuth2 Google Login",
  "Monitor Production Logs in Datadog",
  "Fix Navigation Routing Bug on Android",
  "Create Marketing Landing Page",
  "Update Node to v20 LTS",
  "Perform Accessibility (a11y) Audit",
  "Design Custom 404 Error Page",
  "Setup E2E Testing with Playwright",
  "Refactor Database Schemas for Speed"
];

async function updateAndAddMore() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('teamboard');
    const tasksCol = db.collection('tasks');
    
    // Find all test tasks
    const cursor = tasksCol.find({ title: { $regex: /^Test Task/ } });
    const tasks = await cursor.toArray();
    
    console.log(`Found ${tasks.length} test tasks to rename.`);

    // Rename the existing tasks
    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      const newTitle = realisticTitles[i % realisticTitles.length];
      
      await tasksCol.updateOne(
        { _id: task._id },
        { 
          $set: { 
            title: newTitle,
            description: `This is a realistic task to simulate actual project workflows. Ensure all acceptance criteria for "${newTitle}" are met.`
          } 
        }
      );
    }
    
    console.log('Successfully renamed existing tasks!');
    
    if (tasks.length > 0) {
      const project = tasks[0];
      
      // Add 10 more tasks so the total is 30. (20 limit per page -> guarantees Page 2 exists for infinite scroll)
      const tasksToInsert = [];
      for (let i = 0; i < extraTitles.length; i++) {
        tasksToInsert.push({
          title: extraTitles[i],
          description: `This task was added to push the total count over 20, guaranteeing the infinite scroll activates on Page 2.`,
          status: 'todo',
          priority: 'high',
          projectId: project.projectId,
          ownerId: project.ownerId,
          dueDate: new Date(Date.now() + 86400000 * 2), // 2 days from now
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      const result = await tasksCol.insertMany(tasksToInsert);
      console.log(`Inserted ${result.insertedCount} EXTRA realistic tasks to ensure pagination triggers!`);
    }

  } catch (error) {
    console.error('Update error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateAndAddMore();
