import mongoose from "mongoose";


// const database=
// console.log("dewjnbdhujb j",mongoose.connection)
export const findByColl = async (collName, query, project = null) => {
  console.log(collName)
  const collection = mongoose.connection.db.collection(collName);
  // console.log(collection.find(query))
  return collection.find(query, project)?.toArray((err, docs) => {
    if (err) {
      console.error('Error retrieving documents:', err);
      return;
    }
    console.log('Documents:', docs);
    return docs
  });
}


export async function updateDocument(collName,filter,data,upsert=false) {
  try {
    const collection = mongoose.connection.db.collection(collName);; // Collection name

    const update = [
      {
        $set: data
      },
     
    ]; // Update data

    const result = await collection.updateOne(filter, update, { upsert });

    console.log("Matched Count:", result.matchedCount);
    console.log("Modified Count:", result.modifiedCount);
  } catch (error) {
    console.error("Error updating document:", error);
  }
}
export async function universalUpdate(collName,filter,update,upsert=false) {
  try {
    const collection = mongoose.connection.db.collection(collName);; // Collection name

     // Update data

    const result = await collection.updateOne(filter, update, { upsert });

    console.log("Matched Count:", result.matchedCount);
    console.log("Modified Count:", result.modifiedCount);
  } catch (error) {
    console.error("Error updating document:", error);
  }
}
// console.log("dewjnbdhujb j",mongoose.connection)
export const deleteReocrd = async (collName, query) => {
  console.log(collName)
  const collection = mongoose.connection.db.collection(collName);
  // console.log(collection.find(query))
  return await  collection.deleteMany(query)
}

export const simpleFinding = async (collName,query) => {
  console.log(collName)
  const collection = mongoose.connection.db.collection(collName);
  // console.log()
  let data=await collection.find(query)
  return data
}

export const findByAggregate = async (collName, query) => {
  // console.log(collName)
  // console.log(mongoose.connection.db)
  const collection = mongoose.connection.db.collection(collName);
  // console.log(collection.find(query))
  return await collection.aggregate(query)
    .toArray((err, docs) => {
      if (err) {
        console.error('Error retrieving documents:', err);
        return;
      }
      console.log('Documents:', docs);
      return docs
    });
}

export const singleInsert=async(collectionName,data)=>{
  const insertedId=await mongoose.connection.collection(collectionName).insertOne(data)
  return insertedId
}



// export const findByColl=  (collName, query)=>{
// console.log(findByColl("users",{}))

// findByAggregate("agentinfos",ab)

