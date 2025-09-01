// PDF Export Utility

import PDFDocument from 'pdfkit';
import { Readable } from 'stream';

export class PDFExporter {
  constructor() {
    this.doc = new PDFDocument({
      size: 'A4',
      margin: 72, // 1 inch margins
      info: {
        Title: 'GenScript Script',
        Author: 'GenScript',
        Creator: 'GenScript Platform',
        CreationDate: new Date()
      }
    });
    
    this.buffers = [];
    this.setupStyles();
  }

  setupStyles() {
    // Define reusable styles
    this.styles = {
      title: {
        fontSize: 24,
        font: 'Helvetica-Bold'
      },
      subtitle: {
        fontSize: 14,
        font: 'Helvetica'
      },
      heading: {
        fontSize: 16,
        font: 'Helvetica-Bold'
      },
      body: {
        fontSize: 12,
        font: 'Helvetica',
        lineGap: 6
      },
      metadata: {
        fontSize: 10,
        font: 'Helvetica-Oblique'
      }
    };
  }

  async generatePDF(script) {
    return new Promise((resolve, reject) => {
      try {
        // Collect PDF data
        this.doc.on('data', (buffer) => this.buffers.push(buffer));
        this.doc.on('end', () => {
          const pdfBuffer = Buffer.concat(this.buffers);
          resolve(pdfBuffer);
        });
        this.doc.on('error', reject);

        // Add content
        this.addHeader(script);
        this.addMetadata(script);
        this.addContent(script);
        this.addFooter();

        // Finalize
        this.doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  addHeader(script) {
    // Title
    this.doc
      .font(this.styles.title.font)
      .fontSize(this.styles.title.fontSize)
      .text(script.title, {
        align: 'center'
      });

    // Subtitle with type
    this.doc
      .moveDown(0.5)
      .font(this.styles.subtitle.font)
      .fontSize(this.styles.subtitle.fontSize)
      .fillColor('#666666')
      .text(`${script.type} Script - ${script.length} words`, {
        align: 'center'
      });

    // Reset color and add spacing
    this.doc
      .fillColor('#000000')
      .moveDown(2);
  }

  addMetadata(script) {
    const metadata = script.metadata || {};
    
    // Metadata section
    this.doc
      .font(this.styles.metadata.font)
      .fontSize(this.styles.metadata.fontSize)
      .fillColor('#888888');

    const metadataItems = [];
    
    if (metadata.tone) {
      metadataItems.push(`Tone: ${metadata.tone}`);
    }
    if (metadata.targetAudience) {
      metadataItems.push(`Audience: ${metadata.targetAudience}`);
    }
    if (script.createdAt) {
      const date = new Date(script.createdAt);
      metadataItems.push(`Created: ${date.toLocaleDateString()}`);
    }

    if (metadataItems.length > 0) {
      this.doc.text(metadataItems.join(' • '), {
        align: 'center'
      });
      this.doc.moveDown(2);
    }

    // Reset color
    this.doc.fillColor('#000000');
  }

  addContent(script) {
    // Parse content for sections
    const sections = this.parseContent(script.content);

    sections.forEach((section, index) => {
      if (section.type === 'heading') {
        // Add spacing before headings (except first)
        if (index > 0) {
          this.doc.moveDown();
        }
        
        this.doc
          .font(this.styles.heading.font)
          .fontSize(this.styles.heading.fontSize)
          .text(section.text, {
            underline: false
          });
        
        this.doc.moveDown(0.5);
      } else {
        // Body text
        this.doc
          .font(this.styles.body.font)
          .fontSize(this.styles.body.fontSize)
          .text(section.text, {
            align: 'justify',
            lineGap: this.styles.body.lineGap
          });
        
        // Add paragraph spacing
        if (index < sections.length - 1) {
          this.doc.moveDown(0.5);
        }
      }
    });
  }

  parseContent(content) {
    const lines = content.split('\n');
    const sections = [];
    let currentParagraph = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      
      if (!trimmed) {
        // Empty line - end current paragraph
        if (currentParagraph.length > 0) {
          sections.push({
            type: 'body',
            text: currentParagraph.join(' ')
          });
          currentParagraph = [];
        }
      } else if (this.isHeading(trimmed)) {
        // Heading - end current paragraph and add heading
        if (currentParagraph.length > 0) {
          sections.push({
            type: 'body',
            text: currentParagraph.join(' ')
          });
          currentParagraph = [];
        }
        sections.push({
          type: 'heading',
          text: this.cleanHeading(trimmed)
        });
      } else {
        // Regular text - add to paragraph
        currentParagraph.push(trimmed);
      }
    });

    // Add final paragraph
    if (currentParagraph.length > 0) {
      sections.push({
        type: 'body',
        text: currentParagraph.join(' ')
      });
    }

    return sections;
  }

  isHeading(text) {
    // Check for markdown-style headings or ALL CAPS sections
    return text.startsWith('#') || 
           text === text.toUpperCase() && text.length < 50 ||
           text.endsWith(':') && text.length < 50;
  }

  cleanHeading(text) {
    // Remove markdown syntax
    return text.replace(/^#+\s*/, '').replace(/:$/, '');
  }

  addFooter() {
    const pageHeight = this.doc.page.height;
    const bottomMargin = 50;
    
    // Move to bottom of page
    this.doc
      .fontSize(9)
      .fillColor('#999999')
      .text(
        'Generated by GenScript • genscript.io',
        72,
        pageHeight - bottomMargin,
        {
          align: 'center',
          width: this.doc.page.width - 144 // Account for margins
        }
      );
  }
}

// Export function
export async function exportToPDF(script) {
  const exporter = new PDFExporter();
  const pdfBuffer = await exporter.generatePDF(script);
  
  return {
    buffer: pdfBuffer,
    filename: `${script.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_script.pdf`,
    contentType: 'application/pdf'
  };
}