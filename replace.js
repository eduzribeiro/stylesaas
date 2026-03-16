const fs = require('fs');

const replaceInFile = (file) => {
    let content = fs.readFileSync(file, 'utf8');
    // Replace "const { data: userData } = await supabase.auth.getUser();"
    // with "const { data: { session: _session } } = await supabase.auth.getSession(); const userData = { user: _session?.user };"
    
    // Using regex to handle spacing variations
    const regex = /const\s+\{\s*data:\s*userData\s*\}\s*=\s*await\s+supabase\.auth\.getUser\(\);/g;
    const replacement = "const { data: { session: _session } } = await supabase.auth.getSession();\n            const userData = { user: _session?.user };";
    
    if (regex.test(content)) {
        content = content.replace(regex, replacement);
        fs.writeFileSync(file, content);
        console.log('Updated ' + file);
    }
};

['src/services/patientService.ts', 'src/services/aiService.ts', 'src/services/aiUsageService.ts'].forEach(replaceInFile);
