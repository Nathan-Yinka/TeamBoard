require('dotenv').config({ path: '../../.env' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function addMore() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('teamboard');
    const tasksCol = db.collection('tasks');
    
    // Find an existing task to grab the projectId and ownerId
    const existingTask = await tasksCol.findOne({});
    if (!existingTask) return;
    
    const tasksToInsert = [];
    for (let i = 1; i <= 30; i++) {
      tasksToInsert.push({
        title: `Extra Pagination Task #${i}`,
        description: `This task was added to push the total count over 50 (since the frontend fetches 50 at a time), guaranteeing the infinite scroll activates on Page 2.`,
        status: 'todo',
        priority: 'medium',
        projectId: existingTask.projectId,
        ownerId: existingTask.ownerId,
        dueDate: new Date(Date.now() + 86400000 * 2),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    const result = await tasksCol.insertMany(tasksToInsert);
    console.log(`Inserted ${result.insertedCount} MORE realistic tasks to ensure pagination triggers past the 50 limit!`);

  } catch (error) {
    console.error('Update error:', error);
  } finally {
    await client.close();
  }
}

addMore();
