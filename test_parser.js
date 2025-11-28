
function parseXYZFrames(text) {
    const lines = text.replace(/\r/g, '').split('\n');
    const frames = [];
    let i = 0;
    while (i < lines.length) {
        const line = lines[i].trim();
        if (!line) { i++; continue; }
        const n = parseInt(line, 10);
        if (Number.isFinite(n) && n > 0) {
            const atomCount = n;
            const comment = lines[i + 1] || '';
            const symbols = [];
            const positions = [];
            for (let j = 0; j < atomCount; j++) {
                const parts = (lines[i + 2 + j] || '').trim().split(/\s+/);
                if (parts.length >= 4) {
                    const sym = parts[0];
                    const x = parseFloat(parts[1]);
                    const y = parseFloat(parts[2]);
                    const z = parseFloat(parts[3]);
                    if ([x, y, z].every(v => Number.isFinite(v))) {
                        symbols.push(sym);
                        positions.push([x, y, z]);
                    }
                }
            }
            if (symbols.length === atomCount) {
                frames.push({ symbols, positions, comment });
            } else {
                console.log(`Frame at line ${i + 1} dropped. Expected ${atomCount} atoms, found ${symbols.length}`);
            }
            i += 2 + atomCount;
        } else {
            i++;
        }
    }
    return frames;
}

// Test Case 1: Standard Multi-frame
const text1 = `3
Frame 1
C 0 0 0
O 0 0 1.2
H 0 1 -0.5
3
Frame 2
C 1 1 1
O 1 1 2.2
H 1 2 0.5`;

console.log("Test 1 (Standard):", parseXYZFrames(text1).length);

// Test Case 2: Concatenated without newline (rare but possible if file just ends and starts)
// Actually XYZ usually has newlines.
// Test Case 3: Extra newlines
const text3 = `3
Frame 1
C 0 0 0
O 0 0 1.2
H 0 1 -0.5

3
Frame 2
C 1 1 1
O 1 1 2.2
H 1 2 0.5
`;
console.log("Test 3 (Extra newlines):", parseXYZFrames(text3).length);

// Test Case 4: Garbage at end
const text4 = `3
Frame 1
C 0 0 0
O 0 0 1.2
H 0 1 -0.5
Garbage
`;
console.log("Test 4 (Garbage at end):", parseXYZFrames(text4).length);
