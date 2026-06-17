const { Client } = require('pg'); 
const client = new Client({ connectionString: 'postgres://postgres.utjepjaqfwloaxbksmdf:leebindz2304@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?prepareThreshold=0' }); 
client.connect()
  .then(() => client.query('SELECT * FROM "StockTake" LIMIT 5'))
  .then(res => console.log(res.rows))
  .catch(console.error)
  .finally(() => client.end());
