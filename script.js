// script.js
const terminalInput = document.getElementById('terminalInput');
const terminalBody = document.getElementById('terminalBody');
const promptTextElement = document.getElementById('promptText');

let commandHistory = [];
let historyIndex = -1;
let promptUpdateInterval = null;

// --- How to Develop and Integrate New Terminal Functions ---
//
// 1. Create a New JavaScript File for Your Command:
//    - Inside the `./functions/` directory, create a new `.js` file (e.g., `myCommand.js`).
//
// 2. Define Your Command Class:
//    - Each command must be a JavaScript class.
//    - The class MUST implement the following four static methods:
//
//      `static funcIni()`:
//          - (Optional but recommended for consistency)
//          - Called once when the terminal application initializes.
//          - Use this for any setup your command needs before it can be executed.
//          - Example: `static funcIni() { console.log("MyCommand initialized"); }`
//
//      `static funcDetect(inp_cmdLine)`:
//          - (Required)
//          - Receives the full command line string entered by the user.
//          - Purpose: To determine if `inp_cmdLine` is intended for this command class.
//          - Must return `true` if the command matches, `false` otherwise.
//          - Typically, you'll trim `inp_cmdLine` and check if it starts with your command name.
//          - The `initialParse` function can be helpful here for more complex detection.
//          - Example: `const args = initialParse(inp_cmdLine.trim().toLowerCase()); return args[0] === 'mycmd';`
//
//      `static parseFunction(inp_cmdLine)`:
//          - (Required if `funcDetect` can return `true`)
//          - Called only if `funcDetect` for this class returns `true`.
//          - Purpose: To execute the main logic of your command.
//          - Parse `inp_cmdLine` for arguments if your command needs them. The `initialParse` function is ideal for this.
//          - Use `window.displayAtTerminal(content)` to output results to the terminal.
//          - Use `window.escapeHtml(string)` to sanitize any user input before displaying it.
//          - Example: `const args = initialParse(inp_cmdLine.trim()).slice(1); window.displayAtTerminal(\`MyCommand executed with: ${window.escapeHtml(args.join(' '))}\`);`
//
//      `static funcHelp()`:
//          - (Required)
//          - Purpose: To provide help text for your command.
//          - This text is displayed when the user types the global 'help' command.
//          - Should return a string describing the command, its syntax, and usage.
//          - Example: `return "mycmd [options] <argument> - Does something cool.";`
//
//    - Class Structure Example (`./functions/myCommand.js`):
//      ```javascript
//      class MyCommand {
//          static funcIni() { /* ... */ }
//          static funcDetect(inp_cmdLine) { /* ... return true/false ... */ }
//          static parseFunction(inp_cmdLine) { /* ... use window.displayAtTerminal() ... */ }
//          static funcHelp() { /* ... return "help text for mycmd" ... */ }
//      }
//      ```
//
// 3. Include Your Command Script in `index.html`:
//    - Open `index.html`.
//    - Add a `<script>` tag for your new command file *before* the `<script src="script.js"></script>` tag.
//    - Example: `<script src="./functions/myCommand.js"></script>`
//
// 4. Register Your Command Class in `script.js`:
//    - In this file (`script.js`), find the `commandClassesArray`.
//    - Add your new command class to this array.
//    - Example: `const commandClassesArray = [Clear, MyCommand /*, Other Commands */];`
//
// Global Helper Functions Available to Your Command Classes:
//    - `window.displayAtTerminal(content)`: Displays a line of text in the terminal.
//    - `window.clearDisplay()`: Clears the entire terminal display.
//    - `window.escapeHtml(unsafeString)`: Escapes HTML special characters in a string.
//    - `initialParse(contentString)`: Parses a string into an array of arguments, handling quoted strings. (Defined below)
//
// --- End of Documentation ---


// --- Array to hold all command classes ---
const commandClassesArray = [
    Clear,
    Kvstore
];
// --- End of command classes array ---

/**
 * Parses a command line string into an array of arguments.
 * Handles arguments enclosed in double quotes as single tokens.
 * @param {string} content - The command line string to parse.
 * @returns {string[]} An array of parsed arguments.
 */
function initialParse(content) {
    if (typeof content !== 'string') {
        return [];
    }
    const args = [];
    let i = 0;
    while (i < content.length) {
        // Skip leading spaces for the next token
        while (i < content.length && content[i] === ' ') {
            i++;
        }
        if (i === content.length) break; // End of string after spaces

        let tokenStart = i;
        let currentToken = '';

        // Check if the current position starts a standalone quoted string
        if (content[i] === '"') {
            let closingQuoteIndex = -1;
            // Find the corresponding closing quote
            for (let k = i + 1; k < content.length; k++) {
                if (content[k] === '"') {
                    // TODO: Add handling for escaped quotes if needed in the future (e.g., \")
                    closingQuoteIndex = k;
                    break;
                }
            }

            if (closingQuoteIndex !== -1) {
                // A quoted segment is found from i to closingQuoteIndex
                const charAfterClosingQuote = (closingQuoteIndex + 1 < content.length) ? content[closingQuoteIndex + 1] : undefined;
                
                // A quoted string is "standalone" if:
                // 1. It's preceded by a space or is at the beginning of the input (which is true since we skipped spaces to get to tokenStart=i).
                // 2. It's followed by a space or is at the end of the input.
                if (charAfterClosingQuote === ' ' || charAfterClosingQuote === undefined) {
                    // This is a standalone quoted string. Strip quotes.
                    currentToken = content.substring(i + 1, closingQuoteIndex);
                    args.push(currentToken);
                    i = closingQuoteIndex + 1; // Move past this token
                    continue; // Proceed to the next token
                }
                // If not standalone (e.g., part of `word:"..."` or `"..."word`),
                // it will be handled by the general token parsing logic below,
                // which will include the quotes as part of the token.
            }
            // If no closing quote, or if it's not standalone, let general parsing handle it.
        }

        // General token parsing for non-standalone-quoted segments or unquoted segments
        let inInternalQuotes = false; // Tracks if we are inside quotes *within* the current token being built
        while (i < content.length) {
            const char = content[i];
            if (char === '"') {
                inInternalQuotes = !inInternalQuotes;
            }
            // A token ends at a space, ONLY if we are NOT inside internal quotes.
            if (char === ' ' && !inInternalQuotes) {
                break; 
            }
            currentToken += char;
            i++;
        }
        
        if (currentToken.length > 0) { // Push if token is not empty
            args.push(currentToken);
        }
    }
    return args;
}

/**
 * Gets the current timestamp in mm/dd/yyyy hh:mm:ss (24hr) format.
 * @returns {string} Formatted timestamp string.
 */
function getCurrentTimestamp() {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const yy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    return `${mm}/${dd}/${yy} ${hh}:${min}:${ss}`;
}

/**
 * Updates the prompt displayed next to the input field with the current timestamp.
 */
function updateInputPrompt() {
    if (promptTextElement) {
        promptTextElement.textContent = `${getCurrentTimestamp()}:>`;
    }
}

/**
 * Clears all content from the terminal display area.
 */
window.clearDisplay = function() {
    if (terminalBody) {
        terminalBody.innerHTML = '';
    }
}

/**
 * Displays content to the terminal body, prefixed with a timestamp.
 * @param {string} content - The string content to display. Can include simple HTML.
 */
window.displayAtTerminal = function(content) {
    if (!terminalBody) return;

    const outputLine = document.createElement('div');
    outputLine.classList.add('output-line');
    
    const timestamp = getCurrentTimestamp();
    outputLine.innerHTML = `<span class="prompt-display">[${timestamp}]:</span><span class="output-content">${content}</span>`;
    
    terminalBody.appendChild(outputLine);
    terminalBody.scrollTop = terminalBody.scrollHeight;
}

/**
 * Utility to escape HTML special characters.
 * @param {string} unsafe - The string to escape.
 * @returns {string} The escaped string.
 */
window.escapeHtml = function(unsafe) {
    if (typeof unsafe !== 'string') return String(unsafe);
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
}

/**
 * Processes the command entered by the user using the command class structure.
 * @param {string} inp_cmdLine - The command line string entered by the user.
 */
function commandAtTerminal(inp_cmdLine) {
    const originalTrimmedCommand = inp_cmdLine.trim(); // Keep original for parseFunction
    if (originalTrimmedCommand === '') {
        return;
    }

    // Use initialParse to get the command and its arguments for detection and help
    const parsedArgsForDetection = initialParse(originalTrimmedCommand.toLowerCase());
    const commandNameForDetection = parsedArgsForDetection.length > 0 ? parsedArgsForDetection[0] : "";

    let commandHandled = false;

    if (commandNameForDetection === 'help') {
        displayAtTerminal("<strong>Available commands:</strong>");
        if (commandClassesArray.length === 0) {
            displayAtTerminal("No commands registered.");
        }
        commandClassesArray.forEach(cmdClass => {
            if (typeof cmdClass.funcHelp === 'function') {
                displayAtTerminal(cmdClass.funcHelp());
            } else {
                const className = cmdClass.name || "UnknownClass";
                try {
                    if(cmdClass.funcDetect(className.toLowerCase())){
                         displayAtTerminal(`${escapeHtml(className.toLowerCase())} - (No detailed help available)`);
                    }
                } catch(e) { /* ignore */ }
            }
        });
        displayAtTerminal("help - Displays this help message.");
        commandHandled = true;
    } else {
        for (const cmdClass of commandClassesArray) {
            // Pass the original trimmed command line to funcDetect,
            // as funcDetect might have its own parsing or rely on specific casing.
            if (typeof cmdClass.funcDetect === 'function' && cmdClass.funcDetect(originalTrimmedCommand)) {
                if (typeof cmdClass.parseFunction === 'function') {
                    try {
                        // Pass the original trimmed command line to parseFunction
                        cmdClass.parseFunction(originalTrimmedCommand);
                    } catch (error) {
                        console.error(`Error executing command ${cmdClass.name || 'UnknownClass'}:`, error);
                        const firstArg = initialParse(originalTrimmedCommand)[0] || originalTrimmedCommand;
                        displayAtTerminal(`Error: An error occurred while executing '${escapeHtml(firstArg)}'.`);
                    }
                    commandHandled = true;
                    break; 
                } else {
                    console.error(`Command class ${cmdClass.name || 'UnknownClass'} detected command but has no parseFunction.`);
                    const firstArg = initialParse(originalTrimmedCommand)[0] || originalTrimmedCommand;
                    displayAtTerminal(`Error: Command '${escapeHtml(firstArg)}' is recognized but cannot be executed.`);
                    commandHandled = true;
                    break;
                }
            }
        }
    }

    if (!commandHandled) {
        const firstArg = initialParse(originalTrimmedCommand)[0] || originalTrimmedCommand;
        displayAtTerminal(`Unknown command: ${escapeHtml(firstArg)}. Type 'help' for available commands.`);
    }
}

if (terminalInput) {
    terminalInput.addEventListener('keydown', function(event) {
        const currentCommand = terminalInput.value;

        if (event.key === 'Enter') {
            event.preventDefault();

            const commandEntryLine = document.createElement('div');
            commandEntryLine.classList.add('output-line');
            const currentPromptText = promptTextElement ? promptTextElement.textContent : `${getCurrentTimestamp()}:>`;
            commandEntryLine.innerHTML = `<span class="prompt-display">${currentPromptText}</span><span class="command-text">${escapeHtml(currentCommand)}</span>`;
            if (terminalBody) terminalBody.appendChild(commandEntryLine);

            if (currentCommand.trim() !== '') {
                if (commandHistory.length === 0 || commandHistory[commandHistory.length - 1] !== currentCommand) {
                     commandHistory.push(currentCommand);
                }
            }
            historyIndex = commandHistory.length;

            commandAtTerminal(currentCommand);
            
            terminalInput.value = '';
            if (terminalBody) {
                terminalBody.scrollTop = terminalBody.scrollHeight;
            }
        } else if (event.key === 'ArrowUp') {
            event.preventDefault(); 
            if (commandHistory.length > 0) {
                if (historyIndex > 0) {
                    historyIndex--;
                } else { 
                     historyIndex = 0; 
                }
                terminalInput.value = commandHistory[historyIndex];
                terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
            }
        } else if (event.key === 'ArrowDown') {
            event.preventDefault(); 
            if (commandHistory.length > 0) {
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    terminalInput.value = commandHistory[historyIndex];
                } else if (historyIndex === commandHistory.length -1) {
                    historyIndex = commandHistory.length; 
                    terminalInput.value = ''; 
                }
                terminalInput.setSelectionRange(terminalInput.value.length, terminalInput.value.length);
            }
        }
    });
}

if (terminalBody) {
    terminalBody.addEventListener('click', function(event) {
        const targetIsBodyOrOutput = event.target === terminalBody || 
                                   event.target.classList.contains('output-line') ||
                                   event.target.classList.contains('initial-message') ||
                                   event.target.closest('.output-line');
        if (targetIsBodyOrOutput) {
            if (terminalInput) {
                terminalInput.focus();
            }
        }
    });
}
        
document.addEventListener('DOMContentLoaded', (event) => {
    commandClassesArray.forEach(commandClass => {
        if (typeof commandClass.funcIni === 'function') {
            try {
                commandClass.funcIni();
            } catch (error) {
                console.error(`Error during funcIni for ${commandClass.name || 'UnknownClass'}:`, error);
            }
        }
    });

    updateInputPrompt();
    if (promptUpdateInterval) {
        clearInterval(promptUpdateInterval);
    }
    promptUpdateInterval = setInterval(updateInputPrompt, 1000);

    if (terminalInput) {
        terminalInput.focus(); 
    }
});
