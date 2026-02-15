// Website Scraper Service - Fetch and extract content for Lead Hunter
const axios = require('axios');
const cheerio = require('cheerio');

async function fetchWebsite(url) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LeadHunterBot/1.0; +https://leadsite.ai)',
      },
      validateStatus: (status) => status >= 200 && status < 400,
    });

    const $ = cheerio.load(response.data);
    $('script, style, nav, footer, header, aside').remove();

    const title = $('title').text().trim();
    const description = $('meta[name="description"]').attr('content') || '';
    const h1 = $('h1').first().text().trim();
    const h2s = $('h2').map((i, el) => $(el).text().trim()).get().slice(0, 5);

    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 5000);
    const aboutText = $('[class*="about"], [id*="about"], .about-us, #about-us')
      .text().replace(/\s+/g, ' ').trim().slice(0, 1000);
    const servicesText = $('[class*="service"], [id*="service"], .services, #services')
      .text().replace(/\s+/g, ' ').trim().slice(0, 1000);

    return {
      url,
      title,
      description,
      h1,
      h2s,
      aboutText: aboutText || 'Not found',
      servicesText: servicesText || 'Not found',
      content: bodyText,
      fetchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Scraper error:', error.message);
    throw new Error(`Failed to fetch website: ${error.message}`);
  }
}

module.exports = { fetchWebsite };
