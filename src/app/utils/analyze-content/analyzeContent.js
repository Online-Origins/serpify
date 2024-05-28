export function analyzeContent(contentJson) {
    const title = contentJson.title;
    const keyword = contentJson.keyword;
    const subKeywords = contentJson.subKeywords;
    const htmlText = contentJson.htmlText;
    let seoScore = 0;
    let goodPoints = [];
    let minorWarnings = [];
    let warnings = [];

    function getWordCount() {
        const wordCount = getWordAmount();
        // Adjust the SEO score according to the text length
        if (wordCount > 0 && wordCount < 300) {
            warnings.push("Your text doesn't contain a good amount of words. Try to add more")
        } else if (wordCount >= 300 && wordCount < 500) {
            seoScore += 10;
            warnings.push("Your text doesn't contain a good amount of words. Try to add more")
        } else if (wordCount >= 500 && wordCount < 900) {
            seoScore += 15;
            minorWarnings.push("Your text contains a decent amount of words. Try to add more")
        } else if (wordCount >= 900 && wordCount < 1500) {
            seoScore += 20;
            minorWarnings.push("Your text contains a decent amount of words. Try to add more")
        } else if (wordCount >= 1500) {
            seoScore += 25;
            goodPoints.push("Your text contains a good amount of words")
        } else {
            warnings.push("Your text doesn't contain any words. Try to add some")
        }
        // Return the count of words
        return wordCount;
    }

    function getWordAmount() {
        // Remove all HTML tags using a regular expression
        const textWithoutTags = htmlText.replace(/<\/?[^>]+(>|$)/g, " ");
        // Split the text into words
        const words = textWithoutTags.trim().split(/\s+/);
        // Filter out any empty strings that might result from multiple spaces
        const filteredWords = words.filter(word => word.length > 0);
        return filteredWords.length
    }

    function getHeading(type, points) {
        const regex = new RegExp(`<${type}\\b`, 'g');
        var count = (htmlText.match(regex) || []).length;
        if (type == "h1") {
            if (count == 1) {
                goodPoints.push(`Your text contains an ${type.toUpperCase()} title`);
                return points
            } else if (count > 1) {
                warnings.push(`Your text can't contain multiple ${type.toUpperCase()} titles`)
                return 0
            } else {
                warnings.push(`Your text doesn't contain an ${type.toUpperCase()} title. You need to add one`)
            }
        } else if (type == "h4") {
            if (count >= 1) {
                goodPoints.push(`Your text contains an ${type.toUpperCase()} sub title`);
                return points
            }
        } else {
            if (count >= 1) {
                goodPoints.push(`Your text contains an ${type.toUpperCase()} sub title`);
                return points
            } else {
                warnings.push(`Your text doesn't contain an ${type.toUpperCase()} sub title. Try to add one`)
            }
        }
        return 0;
    }

    function getSubKeywordDensity() {
        let subKeywordsArray = [];
        const textWithoutTags = htmlText.replace(/<\/?[^>]+(>|$)/g, " ");
        if (subKeywords.length > 0) {
            subKeywords.map((keyword) => {
                const regex = new RegExp(`\\b${keyword}\\w*\\b`, 'gi');
                // Use match to find all occurrences and count them
                const matches = textWithoutTags.match(regex);
                const count = matches ? matches.length : 0;
                const percentage = (count / getWordAmount()) * 100;

                if (percentage >= 1 && percentage <= 2) {
                    seoScore += (10 / subKeywords.length);
                }

                subKeywordsArray.push({ keyword: keyword, density: percentage })
            })
        } else {
            seoScore += 10;
        }

        return subKeywordsArray;
    }

    function getKeywordDensity() {
        const textWithoutTags = htmlText.replace(/<\/?[^>]+(>|$)/g, " ");
        const matches = textWithoutTags.match(new RegExp(`\\b${keyword}\\w*\\b`, 'gi'));
        const count = matches ? matches.length : 0;
        console.log(count)
        const percentage = (count / getWordAmount()) * 100;

        if (percentage >= 1 && percentage <= 2) {
            seoScore += 10;
        }

        return { keyword: keyword, density: percentage };
    }

    function getKeywordInTitle() {
        if (title.replace(/[-_@#!'"]/g, " ").toLowerCase().includes(keyword)) {
            goodPoints.push("Good! Your title contains your focus keyword")
            return 10;
        } else {
            warnings.push("Your title doesn't contain your focus keyword")
            return 0;
        }
    }

    function getKeywordLength() {
        if (title.length >= 40 && title.length <= 60) {
            goodPoints.push("Your title has a good length. Nice work!")
            return 5
        } else {
            if (title.length < 40) {
                warnings.push(`The length of your title is ${title.length} and needs to be at least 40 characters`)
            } else if (title.length > 60) {
                warnings.push(`The length of your title is ${title.length} and needs to be maximal 60 characters`)
            }
            return 0;
        }
    }

    function getKeywordInParagraph() {
        // Regular expression to match the content inside the first <p> tag
        var match = htmlText.match(/<p>(.*?)<\/p>/);

        // Check if a match is found and if it contains the search string
        if (match && match[1].includes(keyword)) {
            goodPoints.push("Your first paragraph contains the focus keyword. Good job!")
            return 5;
        } else {
            warnings.push("Your first paragraph doesn't contain the focus keyword. Try to add it")
            return 0;
        }
    }

    function getLinkCount() {
        var count = (htmlText.match(/<a\b/g) || []).length;
        const optimalAmount = getWordAmount() < 300 ? 1 : (getWordAmount() / 300).toFixed(0)
        if (count >= optimalAmount) {
            seoScore += 5;
            goodPoints.push("Your text contains a good amount of links");
        } else if (count > 0 && count < optimalAmount) {
            const linkScore = 5 / optimalAmount
            for (let x = 0; x < count; x++) {
                seoScore += linkScore;
            }
            minorWarnings.push(`Your text contains a decent amount of links: ${count}. Try to add more`)
        } else {
            warnings.push("Your text doesn't contain any links. Try to add some")
        }
        return count;
    }

    function getKeywordsinSubTitles() {
        let score = 10;
        const parser = new DOMParser();
        const doc = parser.parseFromString(htmlText, 'text/html');
        const headings = Array.from(doc.querySelectorAll('h2, h3')).map(heading => `<${heading.tagName.toLowerCase()}>${heading.textContent}</${heading.tagName.toLowerCase()}>`);

        subKeywords.map((subKeyword) => {
            let subKeywordAmount = 0;
            headings.map((heading) => {
                if (subKeywordAmount < 1 && heading.includes(subKeyword)) {
                    subKeywordAmount++;
                }
            })
            if (subKeywordAmount == 0) {
                score -= (10 / subKeywords.length);
                warnings.push(`Your subkeyword "${subKeyword}" is in none of your subheadings. Try to add it somewhere`);
            } else {
                goodPoints.push(`Your subkeyword "${subKeyword}" is in one of your subheadings. Awesome!`);
            }
        })

        return score;
    }

    function getSeoScore() {
        // Check the title for the focus keyword and length
        seoScore += getKeywordInTitle();
        seoScore += getKeywordLength();

        // Check if heading types exist
        seoScore += getHeading("h1", 10);
        seoScore += getHeading("h2", 5);
        seoScore += getHeading("h3", 5);
        seoScore += getHeading("h4", 0);

        // Check if the first paragraph contains the keyword
        seoScore += getKeywordInParagraph();

        // Check if the subtitles contain subkeywords
        seoScore += getKeywordsinSubTitles();

        return seoScore;
    }

    const analyzedContent = {
        wordCount: getWordCount(),
        points: {
            goodPoints: goodPoints,
            minorWarnings: minorWarnings,
            warnings: warnings
        },
        keywordDensity: getKeywordDensity(),
        subKeywordDensity: getSubKeywordDensity(),
        totalLinks: getLinkCount(),
        seoScore: Math.ceil(getSeoScore())
    };
    return { analyzedContent }
}