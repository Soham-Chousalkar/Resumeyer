import axios from 'axios';
import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';

export interface ParsedJobUrl {
  title: string;
  company: string;
  description: string;
  url: string;
  source: string;
}

export class UrlParsingService {
  /**
   * Parse a job description from a URL
   */
  static async parseJobUrl(url: string): Promise<ParsedJobUrl> {
    try {
      // Determine the source of the URL
      const source = this.determineSource(url);
      
      // Use different parsing strategies based on the source
      switch (source) {
        case 'linkedin':
          return await this.parseLinkedInJob(url);
        case 'indeed':
          return await this.parseIndeedJob(url);
        case 'glassdoor':
          return await this.parseGlassdoorJob(url);
        default:
          // Generic parsing for unknown sources
          return await this.parseGenericJob(url);
      }
    } catch (error) {
      console.error('Error parsing job URL:', error);
      throw new Error(`Failed to parse job URL: ${(error as Error).message}`);
    }
  }

  /**
   * Determine the source of the job posting based on URL
   */
  private static determineSource(url: string): string {
    const lowerUrl = url.toLowerCase();
    
    if (lowerUrl.includes('linkedin.com')) {
      return 'linkedin';
    } else if (lowerUrl.includes('indeed.com')) {
      return 'indeed';
    } else if (lowerUrl.includes('glassdoor.com')) {
      return 'glassdoor';
    } else {
      return 'generic';
    }
  }

  /**
   * Parse LinkedIn job postings
   */
  private static async parseLinkedInJob(url: string): Promise<ParsedJobUrl> {
    // LinkedIn requires a headless browser due to JavaScript rendering
    return await this.parseDynamicPage(url, {
      titleSelector: '.job-details-jobs-unified-top-card__job-title',
      companySelector: '.job-details-jobs-unified-top-card__company-name',
      descriptionSelector: '.jobs-description__content',
      source: 'LinkedIn'
    });
  }

  /**
   * Parse Indeed job postings
   */
  private static async parseIndeedJob(url: string): Promise<ParsedJobUrl> {
    // Indeed also requires a headless browser for most reliable results
    return await this.parseDynamicPage(url, {
      titleSelector: '.jobsearch-JobInfoHeader-title',
      companySelector: '.jobsearch-InlineCompanyRating-companyHeader',
      descriptionSelector: '#jobDescriptionText',
      source: 'Indeed'
    });
  }

  /**
   * Parse Glassdoor job postings
   */
  private static async parseGlassdoorJob(url: string): Promise<ParsedJobUrl> {
    // Glassdoor requires a headless browser
    return await this.parseDynamicPage(url, {
      titleSelector: '.job-title',
      companySelector: '.employer-name',
      descriptionSelector: '.jobDescriptionContent',
      source: 'Glassdoor'
    });
  }

  /**
   * Parse generic job postings using basic scraping
   */
  private static async parseGenericJob(url: string): Promise<ParsedJobUrl> {
    try {
      // First try static parsing
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      // Try to find job information using common selectors
      const title = $('h1').first().text().trim() || 
                    $('title').text().trim() || 
                    'Unknown Job Title';
      
      // Look for company name in meta tags or common selectors
      let company = $('meta[property="og:site_name"]').attr('content') || 
                    $('meta[name="author"]').attr('content') || 
                    'Unknown Company';
      
      // Try to find the main content area
      const mainContent = $('main').html() || 
                          $('article').html() || 
                          $('div[role="main"]').html() || 
                          $('body').html() || '';
      
      // Parse the HTML to extract text
      const $content = cheerio.load(mainContent);
      // Remove script and style elements
      $content('script, style').remove();
      
      const description = $content('body').text().trim();
      
      return {
        title,
        company,
        description,
        url,
        source: 'Generic'
      };
    } catch (error) {
      console.error('Error with static parsing, trying dynamic parsing:', error);
      
      // Fall back to dynamic parsing if static parsing fails
      return await this.parseDynamicPage(url, {
        titleSelector: 'h1',
        companySelector: 'meta[property="og:site_name"]',
        descriptionSelector: 'main, article, div[role="main"]',
        source: 'Generic'
      });
    }
  }

  /**
   * Parse a dynamic page using Puppeteer
   */
  private static async parseDynamicPage(url: string, options: {
    titleSelector: string;
    companySelector: string;
    descriptionSelector: string;
    source: string;
  }): Promise<ParsedJobUrl> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    try {
      const page = await browser.newPage();
      
      // Set a reasonable timeout
      await page.setDefaultNavigationTimeout(30000);
      
      // Navigate to the page
      await page.goto(url, { waitUntil: 'networkidle2' });
      
      // Wait for the content to load
      await page.waitForSelector('body');
      
      // Extract job information
      const title = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent?.trim() : 'Unknown Job Title';
      }, options.titleSelector);
      
      const company = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent?.trim() : 'Unknown Company';
      }, options.companySelector);
      
      const description = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent?.trim() : '';
      }, options.descriptionSelector);
      
      return {
        title: title || 'Unknown Job Title',
        company: company || 'Unknown Company',
        description: description || 'No description found',
        url,
        source: options.source
      };
    } finally {
      await browser.close();
    }
  }
}
