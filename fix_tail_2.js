const fs = require('fs');
let lines = fs.readFileSync('src/components/MasterProductModal.tsx', 'utf8').split('\n');

const openIdx = lines.findIndex(l => l.includes("{(viewMode === 'customize' || viewMode === 'comboRoom') && ("));

if (openIdx !== -1) {
    // Find the end of the file. 
    // We expect the file to end with:
    //         </div>
    //
    //       </div>
    //     </div>
    //   );
    // }
    // We will inject `)}` right before `        </div>`
    
    // Reverse search for `</div>` at the correct indentation or just the 4th last line
    let i = lines.length - 1;
    while(i >= 0) {
        if (lines[i].includes('</div>') && !lines[i].includes('<div>')) {
            // Check if this is the outer wrapper closing
            // let's just do a string replacement on the last chunk
            break;
        }
        i--;
    }
}
