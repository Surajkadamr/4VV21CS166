const WINDOW_SIZE = 10;
const TEST_SERVER_URL = 'http://20.244.56.144/test';
const TIMEOUT = 500;
const BEARER_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiZXhwIjoxNzIwMjQ1NjAzLCJpYXQiOjE3MjAyNDUzMDMsImlzcyI6IkFmZm9yZG1lZCIsImp0aSI6IjY0N2Y3MTM0LWMyNDEtNGZjMC04NjZjLWJhNzAyN2Q5YjA2NCIsInN1YiI6InN1cmFqa2FkYW1yMDVAZ21haWwuY29tIn0sImNvbXBhbnlOYW1lIjoia2FkYW0gcHZ0IGx0ZCIsImNsaWVudElEIjoiNjQ3ZjcxMzQtYzI0MS00ZmMwLTg2NmMtYmE3MDI3ZDliMDY0IiwiY2xpZW50U2VjcmV0IjoiSHBxQ0Vtcmx4WUZZaWJwbyIsIm93bmVyTmFtZSI6IlN1cmFqIiwib3duZXJFbWFpbCI6InN1cmFqa2FkYW1yMDVAZ21haWwuY29tIiwicm9sbE5vIjoiNFZWMjFDUzE2NiJ9.rGweYjuD7tHaqY94CNd6NXD-SJzKEor8iAF7zplQGd4";
let window = [];
export default async function handler(req, res) {
  const { numberid } = req.query;

  if (!['p', 'f', 'e', 'r'].includes(numberid)) {
    return res.status(400).json({ error: numberid});
  }

  const endpoint = getEndpoint(numberid);
  const windowPrevState = [...window];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(endpoint, { 
      signal: controller.signal,
      headers: {
        'Authorization': `Bearer ${BEARER_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const newNumbers = data.numbers;
    for (const num of newNumbers) {
      if (!window.includes(num)) {
        if (window.length >= WINDOW_SIZE) {
          window.shift();
        }
        window.push(num);
      }
    }
    const avg = window.length > 0 ? window.reduce((a, b) => a + b) / window.length : 0;
    res.status(200).json({
      windowPrevState,
      windowCurrState: window,
      numbers: newNumbers,
      avg: parseFloat(avg.toFixed(2))
    });
  } catch (error) {
    console.error('Error fetching numbers:', error);
    res.status(500).json({ error: 'Error fetching numbers' });
  }
}
function getEndpoint(numberid) {
  switch (numberid) {
    case 'p': return `${TEST_SERVER_URL}/primes`;
    case 'f': return `${TEST_SERVER_URL}/fibo`;
    case 'e': return `${TEST_SERVER_URL}/even`;
    case 'r': return `${TEST_SERVER_URL}/rand`;
    default: throw new Error('Invalid number ID');
  }
}