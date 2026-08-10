import React from 'react';

// Common CSS to inject into print styles
export const getTemplateCSS = (templateId) => {
  const baseStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Playfair+Display:wght@700&family=Lora:ital,wght@0,400;0,600;1,400&family=Fira+Code:wght@400;500&display=swap');
    
    @page {
      size: A4;
      margin: 1.5cm;
    }
    
    @media print {
      body {
        background: white !important;
        color: black !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .no-print {
        display: none !important;
      }
    }
    
    * {
      box-sizing: border-box;
    }
    
    body {
      margin: 0;
      padding: 20px;
      font-size: 11pt;
      line-height: 1.4;
      color: #1a1a1a;
      background: white;
    }
    
    .section-title {
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 15px;
      margin-bottom: 8px;
      padding-bottom: 3px;
    }
    
    .contact-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 12px;
      font-size: 9pt;
      margin-top: 6px;
      margin-bottom: 12px;
      color: #4b5563;
    }
    
    .contact-bar a {
      color: #4b5563;
      text-decoration: none;
    }
    
    .contact-bar a:hover {
      text-decoration: underline;
    }
    
    .bullet-point {
      margin: 0 4px;
      color: #9ca3af;
    }
    
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-weight: 600;
      margin-bottom: 2px;
    }
    
    .entry-subtitle {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-style: italic;
      color: #4b5563;
      font-size: 10pt;
      margin-bottom: 4px;
    }
    
    .bullet-list {
      margin: 0;
      padding-left: 18px;
      font-size: 9.5pt;
      color: #374151;
    }
    
    .bullet-list li {
      margin-bottom: 3px;
    }
    
    .skills-grid {
      font-size: 9.5pt;
      color: #374151;
    }
    
    .summary-text {
      font-size: 9.5pt;
      color: #374151;
      text-align: justify;
      margin-bottom: 10px;
    }
  `;

  if (templateId === 'classic') {
    // Overleaf LaTeX Classic (Serif Academic Style)
    return `
      ${baseStyle}
      body {
        font-family: 'Lora', 'Georgia', serif;
      }
      .name-header {
        font-family: 'Playfair Display', serif;
        text-align: center;
        font-size: 22pt;
        font-weight: 700;
        margin-bottom: 2px;
      }
      .section-title {
        border-bottom: 1px solid #1f2937;
        font-size: 11pt;
        color: #111827;
      }
    `;
  }

  if (templateId === 'modern') {
    // Modern Tech (Clean Sans-Serif Style)
    return `
      ${baseStyle}
      body {
        font-family: 'Inter', system-ui, sans-serif;
      }
      .name-header {
        font-size: 24pt;
        font-weight: 800;
        color: #1e3a8a;
        margin-bottom: 4px;
      }
      .section-title {
        color: #1e3a8a;
        font-size: 11pt;
        border-bottom: 2px solid #3b82f6;
      }
      .entry-header {
        color: #111827;
      }
    `;
  }

  if (templateId === 'two-column') {
    // Executive Two Column Style
    return `
      ${baseStyle}
      body {
        font-family: 'Inter', system-ui, sans-serif;
        padding: 0;
      }
      .resume-container {
        display: grid;
        grid-template-columns: 1fr 2.2fr;
        min-height: 100vh;
      }
      .left-sidebar {
        background-color: #f3f4f6;
        padding: 30px 20px;
        border-right: 1px solid #e5e7eb;
      }
      .right-main {
        padding: 30px 25px;
      }
      .name-header {
        font-size: 20pt;
        font-weight: 800;
        color: #111827;
        margin-bottom: 10px;
      }
      .section-title {
        font-size: 10pt;
        color: #1f2937;
        border-bottom: 1.5px solid #d1d5db;
        margin-top: 20px;
      }
      .left-sidebar .section-title {
        margin-top: 15px;
        border-bottom: 1.5px solid #9ca3af;
      }
      .contact-item {
        font-size: 8.5pt;
        color: #4b5563;
        margin-bottom: 8px;
        word-break: break-all;
      }
      .contact-item a {
        color: #4b5563;
        text-decoration: none;
      }
      .skill-tag {
        display: inline-block;
        background-color: #e5e7eb;
        color: #374151;
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 8pt;
        margin: 2px;
        font-weight: 500;
      }
    `;
  }

  return baseStyle;
};

export const renderTemplateHTML = (templateId, data) => {
  const {
    name = '',
    email = '',
    phone = '',
    location = '',
    github = '',
    linkedin = '',
    portfolio = '',
    summary = '',
    education = [],
    experience = [],
    projects = [],
    achievements = [],
    certifications = [],
    skills = []
  } = data;

  const getContactBarHTML = () => {
    const items = [];
    if (phone) items.push(phone);
    if (email) items.push(`<a href="mailto:${email}">${email}</a>`);
    if (location) items.push(location);
    if (linkedin) {
      const displayUrl = linkedin.replace('https://', '').replace('www.', '');
      items.push(`<a href="${linkedin}" target="_blank">${displayUrl}</a>`);
    }
    if (github) {
      const displayUrl = github.replace('https://', '').replace('www.', '');
      items.push(`<a href="${github}" target="_blank">${displayUrl}</a>`);
    }
    if (portfolio) {
      const displayUrl = portfolio.replace('https://', '').replace('www.', '');
      items.push(`<a href="${portfolio}" target="_blank">${displayUrl}</a>`);
    }
    return items.join(' <span class="bullet-point">•</span> ');
  };

  const getBulletPointsHTML = (bulletsString) => {
    if (!bulletsString) return '';
    return bulletsString
      .split('\n')
      .map(b => b.trim())
      .filter(Boolean)
      .map(b => `<li>${b.startsWith('-') ? b.substring(1).trim() : b}</li>`)
      .join('');
  };

  if (templateId === 'two-column') {
    return `
      <div class="resume-container">
        <!-- Left Sidebar Column -->
        <div class="left-sidebar">
          <div class="name-header" style="font-size: 16pt;">${name}</div>
          
          <div class="section-title">Contact</div>
          <div style="margin-top: 10px;">
            ${phone ? `<div class="contact-item">📞 ${phone}</div>` : ''}
            ${email ? `<div class="contact-item">✉️ <a href="mailto:${email}">${email}</a></div>` : ''}
            ${location ? `<div class="contact-item">📍 ${location}</div>` : ''}
            ${linkedin ? `<div class="contact-item">🔗 <a href="${linkedin}" target="_blank">LinkedIn</a></div>` : ''}
            ${github ? `<div class="contact-item">💻 <a href="${github}" target="_blank">GitHub</a></div>` : ''}
            ${portfolio ? `<div class="contact-item">🌐 <a href="${portfolio}" target="_blank">Portfolio</a></div>` : ''}
          </div>

          <div class="section-title">Skills</div>
          <div style="margin-top: 8px;">
            ${skills.map(s => `<span class="skill-tag">${s.trim()}</span>`).join('')}
          </div>

          ${certifications.length > 0 ? `
            <div class="section-title">Certificates</div>
            <div style="margin-top: 8px; font-size: 8.5pt; color: #4b5563;">
              <ul style="padding-left: 12px; margin: 0;">
                ${certifications.map(c => `<li style="margin-bottom: 4px;">${c.name || c}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>

        <!-- Right Main Column -->
        <div class="right-main">
          ${summary ? `
            <div class="section-title" style="margin-top: 0;">Professional Summary</div>
            <div class="summary-text" style="margin-top: 6px;">${summary}</div>
          ` : ''}

          <!-- Experience Section -->
          ${experience.length > 0 ? `
            <div class="section-title">Experience</div>
            <div style="margin-top: 8px;">
              ${experience.map(exp => `
                <div style="margin-bottom: 12px;">
                  <div class="entry-header">
                    <span>${exp.role}</span>
                    <span style="font-size: 9pt; font-weight: normal; color: #4b5563;">${exp.duration}</span>
                  </div>
                  <div class="entry-subtitle">
                    <span>${exp.company}</span>
                  </div>
                  ${exp.description ? `<ul class="bullet-list">${getBulletPointsHTML(exp.description)}</ul>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Projects Section -->
          ${projects.length > 0 ? `
            <div class="section-title">Projects</div>
            <div style="margin-top: 8px;">
              ${projects.map(proj => `
                <div style="margin-bottom: 12px;">
                  <div class="entry-header">
                    <span>${proj.title}</span>
                    <span style="font-size: 9pt; font-weight: normal; color: #4b5563;">${proj.technologies ? `(${proj.technologies})` : ''}</span>
                  </div>
                  ${proj.description ? `<ul class="bullet-list">${getBulletPointsHTML(proj.description)}</ul>` : ''}
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Education Section -->
          ${education.length > 0 ? `
            <div class="section-title">Education</div>
            <div style="margin-top: 8px;">
              ${education.map(edu => `
                <div style="margin-bottom: 8px;">
                  <div class="entry-header">
                    <span>${edu.degree}</span>
                    <span style="font-size: 9pt; font-weight: normal; color: #4b5563;">Grad: ${edu.year}</span>
                  </div>
                  <div class="entry-subtitle">
                    <span>${edu.institution}</span>
                    <span>${edu.gpa ? `GPA: ${edu.gpa}` : ''}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          ` : ''}

          <!-- Achievements -->
          ${achievements.length > 0 ? `
            <div class="section-title">Achievements</div>
            <ul class="bullet-list" style="margin-top: 6px;">
              ${achievements.map(a => `<li>${a.description || a}</li>`).join('')}
            </ul>
          ` : ''}
        </div>
      </div>
    `;
  }

  // Classic Serifs (Academic LaTeX) or Modern Blue (Single Column layouts)
  return `
    <div class="name-header">${name}</div>
    
    <div class="contact-bar">
      ${getContactBarHTML()}
    </div>
    
    ${summary ? `
      <div class="section-title">Professional Summary</div>
      <div class="summary-text">${summary}</div>
    ` : ''}
    
    ${education.length > 0 ? `
      <div class="section-title">Education</div>
      <div style="margin-top: 6px;">
        ${education.map(edu => `
          <div style="margin-bottom: 8px;">
            <div class="entry-header">
              <span>${edu.institution}</span>
              <span style="font-size: 9.5pt; font-weight: normal; color: #4b5563;">${edu.year}</span>
            </div>
            <div class="entry-subtitle">
              <span>${edu.degree}</span>
              <span>${edu.gpa ? `GPA: ${edu.gpa}` : ''}</span>
            </div>
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${experience.length > 0 ? `
      <div class="section-title">Professional Experience</div>
      <div style="margin-top: 6px;">
        ${experience.map(exp => `
          <div style="margin-bottom: 10px;">
            <div class="entry-header">
              <span>${exp.company}</span>
              <span style="font-size: 9.5pt; font-weight: normal; color: #4b5563;">${exp.duration}</span>
            </div>
            <div class="entry-subtitle">
              <span>${exp.role}</span>
            </div>
            ${exp.description ? `<ul class="bullet-list">${getBulletPointsHTML(exp.description)}</ul>` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${projects.length > 0 ? `
      <div class="section-title">Academic Projects</div>
      <div style="margin-top: 6px;">
        ${projects.map(proj => `
          <div style="margin-bottom: 10px;">
            <div class="entry-header">
              <span>${proj.title} ${proj.technologies ? `<span style="font-weight: normal; font-size: 9pt; color: #4b5563;">| Tech Stack: ${proj.technologies}</span>` : ''}</span>
              <span style="font-size: 9.5pt; font-weight: normal; color: #4b5563;">${proj.link ? `<a href="${proj.link}" target="_blank" style="color: #3b82f6; text-decoration: none;">Link</a>` : ''}</span>
            </div>
            ${proj.description ? `<ul class="bullet-list">${getBulletPointsHTML(proj.description)}</ul>` : ''}
          </div>
        `).join('')}
      </div>
    ` : ''}

    ${skills.length > 0 ? `
      <div class="section-title">Technical Skills</div>
      <div class="skills-grid" style="margin-top: 6px; line-height: 1.6;">
        <strong>Skills:</strong> ${skills.join(', ')}
      </div>
    ` : ''}

    ${certifications.length > 0 ? `
      <div class="section-title">Certifications</div>
      <ul class="bullet-list" style="margin-top: 6px;">
        ${certifications.map(c => `<li><strong>${c.name || c}</strong>${c.authority ? ` - ${c.authority}` : ''}</li>`).join('')}
      </ul>
    ` : ''}

    ${achievements.length > 0 ? `
      <div class="section-title">Key Achievements</div>
      <ul class="bullet-list" style="margin-top: 6px;">
        ${achievements.map(a => `<li>${a.description || a}</li>`).join('')}
      </ul>
    ` : ''}
  `;
};
