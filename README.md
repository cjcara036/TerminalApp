# Terminal Web App

A customizable, browser-based terminal application built with HTML, CSS, and vanilla JavaScript. This project provides a familiar terminal interface within a web page, allowing users to execute predefined commands. It features a modular design for easily adding new commands.

## Features

* **Classic Terminal Interface:** Mimics the look and feel of a desktop terminal.
* **Command History:** Navigate through previously entered commands using Up/Down arrow keys.
* **Timestamped Output:** Each command and its output is timestamped.
* **Dynamic Prompt:** The input prompt displays the current time and updates every second.
* **Modular Command System:** Easily extendable by adding new JavaScript command classes.
* **Argument Parsing:** Supports commands with arguments, including arguments enclosed in double quotes.
* **Built-in `help` command:** Lists all available commands and their descriptions.
* **Built-in `clear` command:** Clears the terminal display.
* **Responsive Design:** Basic styling for usability across different screen sizes (though primarily desktop-focused).

## File Structure

.├── index.html              # Main HTML file for the application├── style.css               # CSS styles for the terminal interface├── script.js               # Core JavaScript logic, command dispatcher, helper functions├── functions/              # Directory for command modules│   └── clear.js            # Example command: clears the terminal│   └── (yourCommand.js)    # Placeholder for other custom commands└── README.md               # This file
## How to Run

1.  Clone this repository or download the files.
2.  Ensure all files (`index.html`, `style.css`, `script.js`, and the `functions` directory with its contents) are in the same root directory.
3.  Open `index.html` in your web browser.

The terminal interface will load, and you can start typing commands.

## Developing New Commands

The terminal app is designed to be easily extensible. New commands can be added by creating JavaScript classes. Follow these steps:

1.  **Create a New Command File:**
    * Inside the `./functions/` directory, create a new `.js` file (e.g., `myCommand.js`).

2.  **Define Your Command Class:**
    * Each command must be a JavaScript class.
    * The class **MUST** implement the following four static methods:
        * `static funcIni()`: (Optional) Called once when the application initializes. Use for any setup.
        * `static funcDetect(inp_cmdLine)`: (Required) Receives the command line string. Returns `true` if the input matches this command, `false` otherwise.
        * `static parseFunction(inp_cmdLine)`: (Required if `funcDetect` can return `true`) Executes the command's logic. Use `window.displayAtTerminal()` for output.
        * `static funcHelp()`: (Required) Returns a help string describing the command.
    * **Example Class Structure** (`./functions/myCommand.js`):
        ```javascript
        class MyCommand {
            static funcIni() {
                // console.log("MyCommand initialized");
            }

            static funcDetect(inp_cmdLine) {
                const args = initialParse(inp_cmdLine.trim().toLowerCase()); // initialParse is a global helper
                return args[0] === 'mycmd';
            }

            static parseFunction(inp_cmdLine) {
                const args = initialParse(inp_cmdLine.trim()).slice(1);
                window.displayAtTerminal(`MyCommand executed with: ${window.escapeHtml(args.join(' '))}`);
            }

            static funcHelp() {
                return "mycmd [options] <argument> - Does something cool.";
            }
        }
        ```

3.  **Include Your Command Script in `index.html`:**
    * Open `index.html`.
    * Add a `<script>` tag for your new command file **before** the line `<script src="script.js"></script>`.
        ```html
        <script src="./functions/myCommand.js"></script>
        <script src="script.js"></script>
        ```

4.  **Register Your Command Class in `script.js`:**
    * Open `script.js`.
    * Find the `commandClassesArray`.
    * Add your new command class to this array:
        ```javascript
        const commandClassesArray = [
            Clear,
            MyCommand // Add your new class here
            // ... other command classes
        ];
        ```

**Global Helper Functions Available to Command Classes (defined in `script.js`):**

* `window.displayAtTerminal(content)`: Displays a line of text in the terminal.
* `window.clearDisplay()`: Clears the entire terminal display.
* `window.escapeHtml(unsafeString)`: Escapes HTML special characters.
* `initialParse(contentString)`: Parses a string into an array of arguments, respecting quoted strings.

For more detailed instructions, refer to the documentation section within the `script.js` file.

## Future Enhancements / To-Do

* More sophisticated argument parsing (e.g., flags, named arguments).
* Tab completion for commands and arguments.
* Theming options.
* Support for asynchronous commands.
* Integration with backend services for more powerful commands.
* File system simulation.

## Contributing

Contributions are welcome! If you have ideas for improvements or new features, feel free to fork the repository and submit a pull request.
