// Google Docs Export Utility

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleDocsExporter {
  constructor() {
    this.docs = null;
    this.drive = null;
  }

  // Initialize Google APIs with user's OAuth tokens
  async initialize(accessToken) {
    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });

    this.docs = google.docs({ version: 'v1', auth });
    this.drive = google.drive({ version: 'v3', auth });
  }

  // Create a new Google Doc with the script content
  async createDocument(script) {
    try {
      // Create the document
      const createResponse = await this.docs.documents.create({
        requestBody: {
          title: script.title
        }
      });

      const documentId = createResponse.data.documentId;

      // Prepare the content requests
      const requests = this.buildContentRequests(script);

      // Update the document with content
      await this.docs.documents.batchUpdate({
        documentId,
        requestBody: {
          requests
        }
      });

      // Get the document URL
      const docUrl = `https://docs.google.com/document/d/${documentId}/edit`;

      return {
        documentId,
        url: docUrl,
        title: script.title
      };
    } catch (error) {
      console.error('Google Docs creation error:', error);
      throw new Error(`Failed to create Google Doc: ${error.message}`);
    }
  }

  // Build requests for document content
  buildContentRequests(script) {
    const requests = [];
    let index = 1; // Google Docs uses 1-based indexing

    // Add title
    requests.push({
      insertText: {
        location: { index },
        text: `${script.title}\n\n`
      }
    });
    index += script.title.length + 2;

    // Style the title
    requests.push({
      updateParagraphStyle: {
        range: {
          startIndex: 1,
          endIndex: script.title.length + 1
        },
        paragraphStyle: {
          namedStyleType: 'TITLE',
          alignment: 'CENTER'
        },
        fields: 'namedStyleType,alignment'
      }
    });

    // Add subtitle
    const subtitle = `${script.type} Script - ${script.length} words\n\n`;
    requests.push({
      insertText: {
        location: { index },
        text: subtitle
      }
    });
    const subtitleStart = index;
    index += subtitle.length;

    // Style the subtitle
    requests.push({
      updateTextStyle: {
        range: {
          startIndex: subtitleStart,
          endIndex: subtitleStart + subtitle.length - 2
        },
        textStyle: {
          fontSize: {
            magnitude: 12,
            unit: 'PT'
          },
          foregroundColor: {
            color: {
              rgbColor: {
                red: 0.4,
                green: 0.4,
                blue: 0.4
              }
            }
          }
        },
        fields: 'fontSize,foregroundColor'
      }
    });

    // Add metadata if available
    const metadata = this.buildMetadata(script);
    if (metadata) {
      requests.push({
        insertText: {
          location: { index },
          text: `${metadata}\n\n`
        }
      });
      const metadataStart = index;
      index += metadata.length + 2;

      // Style metadata
      requests.push({
        updateTextStyle: {
          range: {
            startIndex: metadataStart,
            endIndex: metadataStart + metadata.length
          },
          textStyle: {
            italic: true,
            fontSize: {
              magnitude: 10,
              unit: 'PT'
            },
            foregroundColor: {
              color: {
                rgbColor: {
                  red: 0.5,
                  green: 0.5,
                  blue: 0.5
                }
              }
            }
          },
          fields: 'italic,fontSize,foregroundColor'
        }
      });
    }

    // Parse and add content
    const sections = this.parseContent(script.content);
    
    sections.forEach(section => {
      if (section.type === 'heading') {
        // Add heading
        requests.push({
          insertText: {
            location: { index },
            text: `${section.text}\n\n`
          }
        });
        const headingStart = index;
        index += section.text.length + 2;

        // Style heading
        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: headingStart,
              endIndex: headingStart + section.text.length
            },
            paragraphStyle: {
              namedStyleType: 'HEADING_2'
            },
            fields: 'namedStyleType'
          }
        });
      } else {
        // Add body text
        requests.push({
          insertText: {
            location: { index },
            text: `${section.text}\n\n`
          }
        });
        const bodyStart = index;
        index += section.text.length + 2;

        // Style body text
        requests.push({
          updateParagraphStyle: {
            range: {
              startIndex: bodyStart,
              endIndex: bodyStart + section.text.length
            },
            paragraphStyle: {
              namedStyleType: 'NORMAL_TEXT',
              alignment: 'JUSTIFIED'
            },
            fields: 'namedStyleType,alignment'
          }
        });
      }
    });

    // Add footer
    const footer = '\n\nGenerated by GenScript • genscript.io';
    requests.push({
      insertText: {
        location: { index },
        text: footer
      }
    });
    const footerStart = index;

    // Style footer
    requests.push({
      updateTextStyle: {
        range: {
          startIndex: footerStart + 2,
          endIndex: footerStart + footer.length
        },
        textStyle: {
          fontSize: {
            magnitude: 9,
            unit: 'PT'
          },
          foregroundColor: {
            color: {
              rgbColor: {
                red: 0.6,
                green: 0.6,
                blue: 0.6
              }
            }
          }
        },
        fields: 'fontSize,foregroundColor'
      }
    });

    return requests;
  }

  buildMetadata(script) {
    const metadata = script.metadata || {};
    const items = [];
    
    if (metadata.tone) {
      items.push(`Tone: ${metadata.tone}`);
    }
    if (metadata.targetAudience) {
      items.push(`Audience: ${metadata.targetAudience}`);
    }
    if (script.createdAt) {
      const date = new Date(script.createdAt);
      items.push(`Created: ${date.toLocaleDateString()}`);
    }

    return items.length > 0 ? items.join(' • ') : null;
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
    return text.startsWith('#') || 
           (text === text.toUpperCase() && text.length < 50) ||
           (text.endsWith(':') && text.length < 50);
  }

  cleanHeading(text) {
    return text.replace(/^#+\s*/, '').replace(/:$/, '');
  }

  // Share document with user
  async shareDocument(documentId, email) {
    try {
      await this.drive.permissions.create({
        fileId: documentId,
        requestBody: {
          type: 'user',
          role: 'writer',
          emailAddress: email
        }
      });
    } catch (error) {
      console.error('Failed to share document:', error);
      // Non-critical error, document still created
    }
  }
}

// Export function
export async function exportToGoogleDocs(script, accessToken, userEmail) {
  const exporter = new GoogleDocsExporter();
  await exporter.initialize(accessToken);
  
  const result = await exporter.createDocument(script);
  
  // Optionally share with user
  if (userEmail) {
    await exporter.shareDocument(result.documentId, userEmail);
  }
  
  return result;
}