const fs = require('fs');
const path = require('path');

const MOLECULES_DIR = path.join(__dirname, 'molecules');
const VIEWER_TEMPLATE = path.join(__dirname, 'viewer.html');
const OUTPUT_DIR = __dirname; // Root directory for GitHub Pages

// Ensure molecules directory exists
if (!fs.existsSync(MOLECULES_DIR)) {
    console.error('Molecules directory not found!');
    process.exit(1);
}

// Read viewer template
let viewerHtml = fs.readFileSync(VIEWER_TEMPLATE, 'utf8');

// Get all .xyz files
const molecules = fs.readdirSync(MOLECULES_DIR)
    .filter(file => file.endsWith('.xyz'))
    .map(file => file.replace('.xyz', ''));

console.log(`Found ${molecules.length} molecules:`, molecules);



// 2. Generate Index Page with Hybrid List/Viewer Layout
const indexHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Molecule Viewer</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
            background-color: #f8f9fa;
        }
        .header {
            height: 60px;
            background: white;
            border-bottom: 1px solid #e9ecef;
            display: flex;
            align-items: center;
            padding: 0 1.5rem;
            justify-content: space-between;
            z-index: 100;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
            flex-shrink: 0;
        }
        .header-left {
            display: flex;
            align-items: center;
            gap: 1.5rem;
        }
        .brand {
            font-size: 1.25rem;
            font-weight: 600;
            color: #333;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        .nav-btn {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            color: #495057;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.2s;
            cursor: pointer;
            border: none;
            background: transparent;
            font-size: 0.95rem;
        }
        .nav-btn:hover {
            background-color: #f1f3f5;
            color: #212529;
        }
        .molecule-select-wrapper {
            position: relative;
        }
        .molecule-select {
            padding: 0.5rem 2rem 0.5rem 1rem;
            font-size: 0.95rem;
            border: 1px solid #dee2e6;
            border-radius: 6px;
            background-color: #f8f9fa;
            color: #495057;
            cursor: pointer;
            outline: none;
            appearance: none;
            -webkit-appearance: none;
            font-family: inherit;
            min-width: 200px;
            transition: border-color 0.2s, box-shadow 0.2s;
        }
        .molecule-select:hover {
            border-color: #adb5bd;
        }
        .molecule-select:focus {
            border-color: #339af0;
            box-shadow: 0 0 0 2px rgba(51, 154, 240, 0.25);
        }
        .select-arrow {
            position: absolute;
            right: 0.75rem;
            top: 50%;
            transform: translateY(-50%);
            pointer-events: none;
            color: #868e96;
        }
        .header-right {
            display: flex;
            align-items: center;
        }
        
        /* Main Content Area */
        .main-content {
            flex: 1;
            position: relative;
            overflow: hidden;
        }

        /* List View Styles */
        .view-list {
            height: 100%;
            overflow-y: auto;
            padding: 2rem;
            display: flex;
            flex-direction: column;
            align-items: center;
        }
        .molecule-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
            gap: 1.5rem;
            width: 100%;
            max-width: 1200px;
        }
        .molecule-card {
            background: white;
            border-radius: 12px;
            padding: 1.5rem;
            box-shadow: 0 4px 6px rgba(0,0,0,0.05);
            transition: transform 0.2s, box-shadow 0.2s;
            text-decoration: none;
            color: inherit;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 1px solid #eee;
            cursor: pointer;
        }
        .molecule-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 10px 15px rgba(0,0,0,0.1);
            border-color: #dee2e6;
        }
        .molecule-icon {
            width: 80px;
            height: 80px;
            background: #f1f3f5;
            border-radius: 50%;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #868e96;
            transition: color 0.2s, background-color 0.2s;
        }
        .molecule-card:hover .molecule-icon {
            background-color: #e7f5ff;
            color: #339af0;
        }
        .molecule-name {
            font-weight: 600;
            font-size: 1.1rem;
            color: #343a40;
        }

        /* Viewer View Styles */
        .view-viewer {
            height: 100%;
            display: none; /* Hidden by default */
            padding: 2rem;
            justify-content: center;
            align-items: center;
            background-color: #f8f9fa;
        }
        iframe {
            width: 95%;
            height: 95%;
            border: 1px solid #e9ecef;
            display: block;
            border-radius: 16px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            background: white;
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="header-left">
            <a href="#" onclick="showList(); return false;" class="brand">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="color: #339af0;">
                    <path d="M18 9C19.6569 9 21 7.65685 21 6C21 4.34315 19.6569 3 18 3C16.3431 3 15 4.34315 15 6C15 6.12549 15.0077 6.24919 15.0227 6.37063L8.08261 9.84066C7.54305 9.32015 6.80891 9 6 9C4.34315 9 3 10.3431 3 12C3 13.6569 4.34315 15 6 15C6.80891 15 7.54305 14.6798 8.08261 14.1593L15.0227 17.6294C15.0077 17.7508 15 17.8745 15 18C15 19.6569 16.3431 21 18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15C17.1911 15 16.457 15.3202 15.9174 15.8407L8.97733 12.3706C8.99229 12.2492 9 12.1255 9 12C9 11.8745 8.99229 11.7508 8.97733 11.6294L15.9174 8.15934C16.457 8.67985 17.1911 9 18 9Z" fill="currentColor"/>
                </svg>
                molecule2url
            </a>
            
            <button class="nav-btn" onclick="showList()">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="8" y1="6" x2="21" y2="6"></line>
                    <line x1="8" y1="12" x2="21" y2="12"></line>
                    <line x1="8" y1="18" x2="21" y2="18"></line>
                    <line x1="3" y1="6" x2="3.01" y2="6"></line>
                    <line x1="3" y1="12" x2="3.01" y2="12"></line>
                    <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                List Molecules
            </button>

            <div class="molecule-select-wrapper" id="moleculeSelectWrapper">
                <select id="moleculeSelect" class="molecule-select" onchange="if(this.value) loadMolecule(this.value)">
                    <option value="" disabled selected>Select Molecule</option>
                    ${molecules.map(mol => `
                    <option value="${mol}">${mol}</option>
                    `).join('')}
                </select>
                <div class="select-arrow">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </div>
            </div>
        </div>
        
        <div class="header-right">
            <a href="https://github.com/kangmg/molecule2url" target="_blank" class="nav-btn">
                <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
                GitHub
            </a>
        </div>
    </header>

    <div class="main-content">
        <!-- List View -->
        <div id="viewList" class="view-list">
            <div class="molecule-grid">
                ${molecules.map(mol => `
                <div class="molecule-card" onclick="selectMolecule('${mol}')">
                    <div class="molecule-icon">
                        <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="3"></circle>
                            <line x1="12" y1="2" x2="12" y2="9"></line>
                            <line x1="12" y1="15" x2="12" y2="22"></line>
                            <line x1="4.93" y1="4.93" x2="9.88" y2="9.88"></line>
                            <line x1="14.12" y1="14.12" x2="19.07" y2="19.07"></line>
                        </svg>
                    </div>
                    <div class="molecule-name">${mol}</div>
                </div>
                `).join('')}
            </div>
        </div>

        <!-- Viewer View -->
        <div id="viewViewer" class="view-viewer">
            <iframe id="viewerFrame" title="Molecule Viewer"></iframe>
        </div>
    </div>

    <script>
        const viewList = document.getElementById('viewList');
        const viewViewer = document.getElementById('viewViewer');
        const viewerFrame = document.getElementById('viewerFrame');
        const moleculeSelect = document.getElementById('moleculeSelect');
        const moleculeSelectWrapper = document.getElementById('moleculeSelectWrapper');
        const listButton = document.querySelector('.nav-btn'); 

        function showList() {
            viewList.style.display = 'flex';
            viewViewer.style.display = 'none';
            // moleculeSelectWrapper.style.display = 'none'; // Keep visible
            // listButton.style.display = 'none'; // Keep visible
            
            moleculeSelect.value = ""; // Reset selection
            
            // Only push state if we are not already at root to avoid redundant history entries
            if (window.location.hash) {
                history.pushState(null, '', window.location.pathname);
            }
        }

        function selectMolecule(molName) {
            viewList.style.display = 'none';
            viewViewer.style.display = 'block';
            // moleculeSelectWrapper.style.display = 'block'; // Always visible
            // listButton.style.display = 'flex'; // Always visible
            
            // Update dropdown
            moleculeSelect.value = molName;
            
            // Load iframe only if changed
            const targetSrc = 'viewer.html?molecule=' + molName;
            if (viewerFrame.getAttribute('src') !== targetSrc) {
                viewerFrame.src = targetSrc;
            }
            
            // Update URL hash if different
            if (window.location.hash !== '#' + molName) {
                window.location.hash = molName;
            }
        }

        function loadMolecule(molName) {
            selectMolecule(molName);
        }

        function handleRoute() {
            const hash = window.location.hash.substring(1);
            if (hash) {
                selectMolecule(hash);
            } else {
                showList();
            }
        }

        // Event Listeners
        window.addEventListener('load', handleRoute);
        window.addEventListener('hashchange', handleRoute);
    </script>
</body>
</html>
`;

fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), indexHtml);
console.log('Generated index.html');
