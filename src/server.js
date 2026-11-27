const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`PharmaCart a correr em http://localhost:${PORT}`);
  console.log(`Site:          http://localhost:${PORT}`);
  console.log(`Swagger (API): http://localhost:${PORT}/api-docs`);
});
