//! server.js

import express from 'express';

const app = express();
const PORT = 3000;

// Basic route
app.get('/', (req, res) => {
	res.send('DWD.ejs server running');
});

// Start server
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
