require('dotenv').config({ path: '../../.env' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;

async function updateDates() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('teamboard');
    const tasksCol = db.collection('tasks');

    // Find the 20 tasks we just created
    const cursor = tasksCol.find({ title: { $regex: /^Test Task/ } });
    const tasks = await cursor.toArray();
    console.log(`Found ${tasks.length} test tasks.`);

    let overdueCount = 0;
    let soonDueCount = 0;
    let normalCount = 0;

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      let newDueDate;

      if (i % 3 === 0) {
        // Overdue (3 days ago)
        newDueDate = new Date(Date.now() - 86400000 * 3);
        overdueCount++;
      } else if (i % 3 === 1) {
        // Soon Due (warning) (1 day from now)
        newDueDate = new Date(Date.now() + 86400000 * 1);
        soonDueCount++;
      } else {
        // Normal (10 days from now)
        newDueDate = new Date(Date.now() + 86400000 * 10);
        normalCount++;
      }

      await tasksCol.updateOne(
        { _id: task._id },
        { $set: { dueDate: newDueDate } }
      );
    }

    console.log(`Updated dates! Overdue: ${overdueCount}, Warning/Soon Due: ${soonDueCount}, Normal: ${normalCount}`);
  } catch (error) {
    console.error('Update error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

updateDates();
