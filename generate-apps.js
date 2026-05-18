const fs = require('fs');
const path = require('path');

const appsDir = path.join(__dirname, 'apps');
const outputFile = path.join(__dirname, 'apps.json');

const apps = [];

if (fs.existsSync(appsDir)) {
  const entries = fs.readdirSync(appsDir, { withFileTypes: true });
  entries.forEach(entry => {
    if (!entry.isDirectory()) return;
    const metaPath = path.join(appsDir, entry.name, 'meta.json');
    const indexPath = path.join(appsDir, entry.name, 'index.html');
    if (fs.existsSync(metaPath)) {
      try {
        const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        apps.push({
          id: entry.name,
          title: meta.title || entry.name,
          description: meta.description || '',
          file: 'apps/' + entry.name + '/',
          icon: meta.icon || '📁',
          color: meta.color || '#A78BFA'
        });
      } catch (e) {
        console.error('Error reading ' + metaPath, e.message);
      }
    } else if (fs.existsSync(indexPath)) {
      apps.push({
        id: entry.name,
        title: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
        description: '',
        file: 'apps/' + entry.name + '/',
        icon: '📁',
        color: '#A78BFA'
      });
    }
  });
}

fs.writeFileSync(outputFile, JSON.stringify(apps, null, 2), 'utf-8');
console.log('Generated apps.json with ' + apps.length + ' app(s)');
