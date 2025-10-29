import clientPromise from '../../../../src/utils/mongodb';

export default async function handler(req, res) {
  try {
    const client = await clientPromise;
    const db = client.db('AI-IVR');

    // find the most recently updated vapi profile
    const doc = await db
      .collection('vapi_profiles')
      .findOne({}, { sort: { updatedAt: -1 } });

    if (!doc) {
      return res.status(404).json({ message: 'No vapi profile found' });
    }

    // remove internal _id before returning
    const { _id, ...payload } = doc;

    return res.status(200).json(payload);
  } catch (err) {
    console.error('Error fetching vapi profile:', err);
    
return res.status(500).json({ message: 'Internal server error' });
  }
}
