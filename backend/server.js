import app from './src/app.js';

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
    console.log(`🚀 Backend running on http://localhost:${PORT}`);
});