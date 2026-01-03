const fs = require('fs');
const path = require('path');

const filePath = 'F:\\Game\\Run\\mobile\\android\\app\\src\\main\\res\\values\\colors.xml';
const content = `<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="iconBackground">#000000</color>
    <color name="splashscreen_background">#000000</color>
</resources>`;

fs.writeFile(filePath, content, { encoding: 'utf8' }, (err) => {
    if (err) {
        console.error('Error writing file:', err);
        process.exit(1);
    } else {
        console.log('Successfully wrote colors.xml with all required colors');
    }
});
