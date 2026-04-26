const fs = require('fs');
const path = require('path');

const envFile = path.join(__dirname, 'src/environments/environment.ts');
let content = fs.readFileSync(envFile, 'utf8');

// Define the environment variables we want to inject
const vars = {
  API_URL: process.env.API_URL,
  WS_SERVER: process.env.WS_SERVER
};

console.log('Injecting environment variables...');

Object.entries(vars).forEach(([key, value]) => {
  if (value) {
    console.log(`Replacing values for ${key} with ${value}`);
    
    // We target common patterns like apiUrl: '...', api_url: "...", etc.
    // This looks for the key (case insensitive) followed by a colon and a quoted string
    const keyPattern = key.replace(/_/g, '').toLowerCase(); // API_URL -> apiurl
    
    // Improved regex to find the property regardless of case or underscores
    const regex = new RegExp(`(\\b${keyPattern}|${key.toLowerCase()}|${key}\\b)\\s*:\\s*['"].*?['"]`, 'gi');
    
    content = content.replace(regex, (match) => {
      const propertyName = match.split(':')[0];
      return `${propertyName}: '${value}'`;
    });
  }
});


fs.writeFileSync(envFile, content);
console.log('Environment file updated successfully.');
