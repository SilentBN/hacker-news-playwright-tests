# Hacker News Playwright Automation

This project demonstrates automated testing of the Hacker News website using Playwright with JavaScript. It showcases various test automation techniques and best practices in a single, comprehensive script.

## Project Overview

The automation script (`index.js`) includes two main tests:

1. **Article Sorting Test**: Verifies that the newest 100 articles on Hacker News are correctly sorted by time.
2. **Login Functionality Test**: Demonstrates logging into Hacker News, including handling potential rate-limiting scenarios.

## Key Features

- **Article Sorting Validation**: Collects the newest 100 articles and verifies they are sorted from newest to oldest.
- **Dynamic Time Conversion**: Converts relative time strings (e.g., "5 minutes ago") to absolute timestamps for accurate comparison.
- **Login Process Automation**: Simulates user login, including entering credentials and navigating through the login flow.
- **Rate-Limiting Handling**: Implements a retry mechanism to handle potential rate-limiting during frequent login attempts.
- **Environment Variable Usage**: Demonstrates secure credential management using environment variables.

## Technical Implementation

- **Framework**: Playwright
- **Language**: JavaScript
- **Other Tools**: dotenv for environment variable management

## Running the Tests

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - Create a `.env` file in the root directory
   - Add your Hacker News credentials to the `.env` file:
     ```
     HACKER_NEWS_USERNAME=your_username
     HACKER_NEWS_PASSWORD=your_password
     ```
4. Run the script: `node index.js`

## Project Structure

- `index.js`: Contains all the test logic, including helper functions and test cases
- `package.json`: Defines project dependencies
- `.env`: (You need to create this) Stores your Hacker News credentials

## Best Practices Demonstrated

- Modular function structure within a single file
- Error handling and retry mechanisms
- Use of Playwright's powerful selectors and assertions
- Secure credential management
- Clear and descriptive console logging for test progress and results

## Key Functions

- `convertRelativeTime()`: Converts relative time strings to absolute timestamps
- `validateSorting()`: Checks if the collected articles are correctly sorted
- `sortHackerNewsArticles()`: Main function for the article sorting test
- `loginTest()`: Handles the login process and potential rate-limiting

## Potential Enhancements

- Separate tests into individual files for better organization
- Implement a proper test runner for easier execution and reporting
- Add more comprehensive error handling and logging
- Extend test coverage to other Hacker News features

## Disclaimer

This project is for demonstration purposes only. Please be mindful of Hacker News' terms of service and avoid putting unnecessary load on their servers.

## License

This project is open source and available under the [MIT License](LICENSE).
