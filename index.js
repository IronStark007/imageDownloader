document.getElementById('startButton').addEventListener('click', startDownload);

async function startDownload() {
  const url = document.getElementById('url').value;
  const start = parseInt(document.getElementById('start').value);
  const end = parseInt(document.getElementById('end').value);

  if (!url) {
    alert('Please provide a valid URL');
    return;
  }

  const domain = getDomain(url);
  const progressBar = document.getElementById('progressBar');
  progressBar.value = 0;

  try {
    const galleries = await scrapeGalleries(url, domain);
    const selectedGalleries = galleries.slice(start, end);
    progressBar.max = selectedGalleries.length;

    for (let i = 0; i < selectedGalleries.length; i++) {
      await scrapeImagesFromImageset(selectedGalleries[i], domain);
      progressBar.value = i + 1; // Update progress bar
    }
    
    alert('Download complete!');
  } catch (error) {
    console.error('Error during download:', error);
    alert('Failed to download images');
  }
}

// Function to extract the domain from the URL
function getDomain(url) {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
  } catch (error) {
    alert('Invalid URL');
    return null;
  }
}

// Function to download an image
async function downloadImage(imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = imageUrl.split('/').pop();
    link.click();
  } catch (error) {
    console.error('Failed to download image:', error);
  }
}

// Function to scrape images from a single image set
async function scrapeImagesFromImageset(imagesetUrl, domain) {
  try {
    const response = await fetch(imagesetUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const imageElement = doc.querySelector('a.photohref'); // Assuming class is 'photohref'
    if (imageElement) {
      const imageUrl = imageElement.getAttribute('href');
      await downloadImage(`https://${domain}${imageUrl}`);
    } else {
      console.warn('No image found in image set');
    }
  } catch (error) {
    console.error('Error scraping image set:', error);
  }
}

// Function to scrape all galleries from the main page
async function scrapeGalleries(galleryUrl, domain) {
  try {
    const response = await fetch(galleryUrl);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const galleryLinks = [...doc.querySelectorAll('a[href^="/gallery"]')].map(
      (a) => `https://${domain}${a.getAttribute('href')}`
    );
    return galleryLinks;
  } catch (error) {
    console.error('Error scraping galleries:', error);
    throw error;
  }
}
