// ./functions/clear.js

class Clear {
    /**
     * Optional: Called once when the application initializes.
     * Use this for any setup the command class needs.
     * For 'clear', there's no specific initialization needed.
     */
    static funcIni() {
        // console.log("Clear command initialized."); // Optional: for debugging
    }

    /**
     * Detects if the input command is intended for this class.
     * @param {string} inp_cmdLine - The command line string entered by the user.
     * @returns {boolean} True if the command is 'clear', false otherwise.
     */
    static funcDetect(inp_cmdLine) {
        const trimmedCommand = inp_cmdLine.trim().toLowerCase();
        return trimmedCommand === 'clear';
    }

    /**
     * Parses and executes the clear command.
     * It calls the global clearDisplay() function.
     * @param {string} inp_cmdLine - The command line string (not used in this specific command).
     */
    static parseFunction(inp_cmdLine) {
        // Assuming clearDisplay() is a globally available function from script.js
        if (typeof clearDisplay === 'function') {
            clearDisplay();
            // Optionally, display a confirmation or do nothing visually as the screen is cleared.
            // displayAtTerminal("Terminal cleared."); // This would appear *after* clearing.
        } else {
            console.error("Error: clearDisplay() function not found. Make sure script.js is loaded and clearDisplay is global.");
            // Fallback or error message to the terminal if displayAtTerminal is available
            if (typeof displayAtTerminal === 'function') {
                displayAtTerminal("Error: Could not execute clear command. 'clearDisplay' function is missing.");
            }
        }
    }

    /**
     * Provides help information for the clear command.
     * @returns {string} Help text for the clear command.
     */
    static funcHelp() {
        return "clear - Clears all text from the terminal display.";
    }
}
