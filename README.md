# Haraj Scraping

This project is designed to scrape data from the Haraj website, allowing users to extract listings efficiently.

## Features

- **Automated Scraping**: Extracts data from Haraj based on user input.
- **Customizable Requests**: Users can specify URLs and the number of items to scrape.
- **Detailed Data Extraction**: Retrieves key details like title, price, city, tags, phone numbers, images, and more.
- **JSON Output**: Presents structured data for further processing.

## Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/): JavaScript runtime environment.
- [Puppeteer](https://pptr.dev/): Headless browser automation.

## Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/abo389/haraj_scraping.git
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd haraj_scraping
   ```

3. **Install Dependencies**:

   ```bash
   npm install
   ```

4. **Access the Application**:

   Open `index.html` in your web browser to interact with the application.


## How It Works

1. The user sends a **URL** containing a list of posts along with the number of elements to scrape.
2. **Puppeteer** extracts post IDs and stores them in an array, adding a prefix to generate full post URLs.
3. The scraper loops through these URLs and extracts the following details:
   - **Title**
   - **Price**
   - **City**
   - **Time (native & ISO format)**
   - **Description (Arabic & English)**
   - **Tags**
   - **Phone Numbers**
   - **Images**
   - **Author Details (name & profile URL)**

### Example Output

A single scraped item would look like this:

```json
{
  "title": "ايفون 15 برو ماكس 256",
  "city": "Riyadh",
  "price": "4,000 SAR",
  "tags": [
    "حراج الأجهزة",
    "ابل Apple",
    "ايفون iPhone"
  ],
  "imgs": [
    "https://postcdn.haraj.com.sa/userfiles30/2025-4-2/567x1008-1_-pKZDazJOOAq65v.jpg/900/webp",
    "https://postcdn.haraj.com.sa/userfiles30/2025-4-2/785x1532-1_-YvCJzxcwNFVbvE.jpg/900/webp"
  ],
  "reviews": [],
  "phone": [],
  "author": {
    "name": "ديكورات عصرية bb",
    "url": "https://haraj.com.sa/users/%D8%AF%D9%8A%D9%83%D9%88%D8%B1%D8%A7%D8%AA%20%D8%B9%D8%B5%D8%B1%D9%8A%D8%A9%20bb/"
  },
  "time": {
    "native": "50 min. ago",
    "iso": "2025-04-01T21:31:25.943Z"
  },
  "description": {
    "ar": "ضمان حاسبات العرب \nالأغراض و الكرتون موجوده \nاستخدام اقل من سنه الجوال نظيف معاه بكج حمايه بي ماسك بطاريه 99\nمطلوب 4000",
    "en": "Arab Computers Warranty  \nThe items and box are available  \nUsed for less than a year, the phone is clean and comes with a protective package, battery at 99%  \nAsking for 4000\n\n"
  }
}
```

