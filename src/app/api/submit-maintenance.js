import { db } from '../../firebase'; // Adjust path based on your Firebase setup
import { collection, addDoc } from 'firebase/firestore';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { description, issueType, date } = req.body;

      const docRef = await addDoc(collection(db, 'maintenance_requests'), {
        description,
        issueType,
        date,
        createdAt: new Date(),
      });

      res.status(200).json({ message: 'Maintenance request submitted successfully', id: docRef.id });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error submitting the request' });
    }
  } else {
    res.status(405).json({ message: 'Method Not Allowed' });
  }
}
