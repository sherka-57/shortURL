// Get DOM elements
const urlInput = document.getElementById('urlInput');
const shortenBtn = document.getElementById('shortenBtn');
const resultBox = document.getElementById('resultBox');
const shortenedUrl = document.getElementById('shortenedUrl');
const copyBtn = document.getElementById('copyBtn');
const copyFeedback = document.getElementById('copyFeedback');

// Event listeners
shortenBtn.addEventListener('click', shortenUrl);
urlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        shortenUrl();
    }
});

copyBtn.addEventListener('click', copyToClipboard);

// Shorten URL function
async function shortenUrl() {
    const url = urlInput.value.trim();

    // Validation
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    if (!isValidUrl(url)) {
        alert('Please enter a valid URL');
        return;
    }

    try {
        shortenBtn.disabled = true;
        shortenBtn.textContent = 'Shortening...';

        // Call your API endpoint
        const response = await fetch('/.netlify/functions/shorten', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ longUrl: url }),
        });

        if (!response.ok) {
            throw new Error('Failed to shorten URL');
        }

        const data = await response.json();
        shortenedUrl.value = data.shortUrl;

        // Show result box with animation
        resultBox.classList.remove('hidden');
        copyFeedback.textContent = '';
        copyFeedback.classList.remove('show');

        // Scroll result box into view
        setTimeout(() => {
            resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } catch (error) {
        console.error('Error:', error);
        alert('Error shortening URL. Please try again.');
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.textContent = 'Shorten';
    }
}

// Validate URL function
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// Copy to clipboard function
async function copyToClipboard() {
    try {
        await navigator.clipboard.writeText(shortenedUrl.value);
        
        // Show feedback
        copyFeedback.textContent = '✓ Copied to clipboard!';
        copyFeedback.classList.add('show');

        // Hide feedback after 2 seconds
        setTimeout(() => {
            copyFeedback.classList.remove('show');
        }, 2000);
    } catch (error) {
        console.error('Failed to copy:', error);
        alert('Failed to copy to clipboard');
    }
}
