require('dotenv').config({ path: '../../.env' });
const { MongoClient, ObjectId } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function seed() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('teamboard');
    const projectsCol = db.collection('projects');
    const tasksCol = db.collection('tasks');
    const auditCol = db.collection('auditLogs');

    // Find a project
    const project = await projectsCol.findOne({});
    if (!project) {
      console.log('No project found. Please create a project first.');
      return;
    }

    console.log(`Found project: ${project.name} (${project._id})`);
    
    // Determine the owner
    const ownerId = project.ownerId || new ObjectId();

    // Create 20 tasks
    const tasksToInsert = [];
    for (let i = 1; i <= 20; i++) {
      tasksToInsert.push({
        title: `Test Task ${i} for Infinite Scroll`,
        description: `This is a randomly generated task (#${i}) to test the pagination and infinite scrolling functionality in the UI.`,
        status: 'todo',
        priority: 'medium',
        projectId: project._id,
        ownerId: ownerId,
        dueDate: new Date(Date.now() + 86400000 * 5), // 5 days from now
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    const result = await tasksCol.insertMany(tasksToInsert);
    console.log(`Successfully inserted ${result.insertedCount} tasks into project!`);

    // Add a single audit log
    await auditCol.insertOne({
      projectId: project._id,
      userEmail: 'system@seeder',
      action: 'TASKS_SEEDED',
      details: 'Seeded 20 tasks for infinite scroll testing.',
      createdAt: new Date()
    });
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

seed();
