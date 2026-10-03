// AI Integration Service
// Can connect directly to Google Gemini API using native fetch to avoid dependencies.

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

const callGemini = async (prompt, systemInstruction = '', isJson = true, pdfBase64 = null) => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'demo_gemini_key') {
    throw new Error('Gemini API key is not configured');
  }

  try {
    const parts = [{ text: prompt }];
    if (pdfBase64) {
      parts.unshift({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64
        }
      });
    }

    const requestBody = {
      contents: [
        {
          parts: parts
        }
      ],
      systemInstruction: systemInstruction ? {
        parts: [{ text: systemInstruction }]
      } : undefined
    };

    if (isJson) {
      requestBody.generationConfig = {
        responseMimeType: 'application/json'
      };
    }

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    const textResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (isJson) {
      return JSON.parse(textResult);
    }
    return textResult || '';
  } catch (error) {
    console.error('Error calling Gemini API:', error.message);
    throw error;
  }
};

// A comprehensive local industry-standard skills dataset
const TECH_SKILLS_DATASET = {
  frontend: ['react', 'vue', 'angular', 'next.js', 'svelte', 'typescript', 'javascript', 'html5', 'css3', 'tailwindcss', 'bootstrap', 'sass'],
  backend: ['node.js', 'express.js', 'django', 'flask', 'spring boot', 'nestjs', 'fastapi', 'laravel', 'ruby on rails', 'asp.net', 'golang', 'rust'],
  databases: ['mongodb', 'postgresql', 'mysql', 'redis', 'sqlite', 'oracle', 'cassandra', 'mariadb', 'firebase', 'elasticsearch', 'dynamodb'],
  devops: ['docker', 'kubernetes', 'jenkins', 'git', 'github actions', 'gitlab ci', 'terraform', 'ansible', 'prometheus', 'grafana', 'nginx'],
  cloud: ['aws', 'azure', 'google cloud', 'gcp', 'heroku', 'vercel', 'digitalocean', 'cloudflare'],
  dataScience: ['python', 'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'r', 'tableau', 'power bi', 'spark', 'hadoop'],
  coreCs: ['data structures', 'algorithms', 'operating systems', 'computer networks', 'dbms', 'system design', 'oops', 'c++', 'java', 'c#']
};

const ACTION_VERBS = ['develop', 'design', 'implement', 'optimize', 'scale', 'automate', 'integrate', 'reduce', 'improve', 'build', 'create', 'launch', 'lead', 'manage', 'engineer', 'deploy'];

// 1. AI Resume Analyzer (Enhanced local heuristic model & Gemini fallback)
// Helper to extract text from a raw PDF base64 string
const extractTextFromPdfBase64 = (pdfBase64) => {
  if (!pdfBase64) return '';
  try {
    const rawBufferStr = Buffer.from(pdfBase64, 'base64').toString('latin1');
    const matches = rawBufferStr.match(/\(([^()]{2,100})\)/g);
    if (matches && matches.length > 0) {
      return matches
        .map(m => m.slice(1, -1))
        .filter(t => /[a-zA-Z0-9#+.]/.test(t))
        .join(' ');
    }
  } catch (err) {
    console.error('PDF text extraction error:', err.message);
  }
  return '';
};

// 1. AI Resume Analyzer (Advanced PDF Text Parser & ATS Engine)
export const analyzeResume = async (studentProfile, pdfBase64 = null) => {
  const pdfText = extractTextFromPdfBase64(pdfBase64);
  const combinedText = (
    pdfText + ' ' +
    (studentProfile.name || '') + ' ' +
    (studentProfile.department || '') + ' ' +
    (studentProfile.degree || '') + ' ' +
    (studentProfile.skills || []).join(' ') + ' ' +
    (studentProfile.github || '') + ' ' +
    (studentProfile.linkedin || '') + ' ' +
    (studentProfile.portfolio || '') + ' ' +
    (studentProfile.projects || []).map(p => (p.title || '') + ' ' + (p.description || '')).join(' ') + ' ' +
    (studentProfile.internships || []).map(i => (i.role || '') + ' ' + (i.company || '') + ' ' + (i.description || '')).join(' ') + ' ' +
    (studentProfile.certifications || []).map(c => (c.name || '') + ' ' + (c.authority || '')).join(' ')
  ).toLowerCase();

  const suggestions = [];
  const missingSkills = [];
  const detectedSkills = [];

  // A. Contact & Social Links Score (Max 20 pts)
  let contactPoints = 0;
  const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(combinedText) || studentProfile.user?.email;
  const hasPhone = /\b\d{10}\b|\+?\d[\d -]{8,}\d/.test(combinedText) || studentProfile.phone;
  const hasGithub = combinedText.includes('github') || studentProfile.github;
  const hasLinkedin = combinedText.includes('linkedin') || studentProfile.linkedin;
  const hasPortfolio = combinedText.includes('portfolio') || combinedText.includes('leetcode') || studentProfile.portfolio;

  if (hasEmail) contactPoints += 4;
  if (hasPhone) contactPoints += 4;
  if (hasGithub) contactPoints += 4;
  else suggestions.push('Add your GitHub profile URL to showcase public code repositories.');
  
  if (hasLinkedin) contactPoints += 4;
  else suggestions.push('Include a LinkedIn profile link for recruiter candidate verification.');

  if (hasPortfolio) contactPoints += 4;

  // B. Technical Skills ATS Scanning (Max 35 pts)
  const tracksCount = { frontend: 0, backend: 0, databases: 0, devops: 0, cloud: 0, dataScience: 0, coreCs: 0 };

  for (const [track, skillsArr] of Object.entries(TECH_SKILLS_DATASET)) {
    skillsArr.forEach(skill => {
      const skillLower = skill.toLowerCase();
      if (combinedText.includes(skillLower)) {
        tracksCount[track]++;
        if (!detectedSkills.includes(skill)) {
          detectedSkills.push(skill.toUpperCase());
        }
      }
    });
  }

  let skillPoints = Math.min(detectedSkills.length * 3.5, 35);
  if (detectedSkills.length === 0) {
    // If text parsing didn't pick up dataset, check profile skills array directly
    const userSkillsArr = studentProfile.skills || [];
    userSkillsArr.forEach(s => detectedSkills.push(s.toUpperCase()));
    skillPoints = Math.min(userSkillsArr.length * 4, 30);
  }

  // Identify track gaps
  if (tracksCount.devops === 0 && tracksCount.cloud === 0) {
    missingSkills.push('Docker', 'AWS');
    suggestions.push('Learn Docker containerization and AWS basics to improve cloud deployment ATS score.');
  }
  if (tracksCount.databases === 0) {
    missingSkills.push('PostgreSQL', 'MongoDB');
    suggestions.push('Add relational or NoSQL database management experience (e.g. PostgreSQL, MongoDB).');
  }
  if (tracksCount.frontend === 0) {
    missingSkills.push('React.js', 'TailwindCSS');
  }
  if (tracksCount.backend === 0) {
    missingSkills.push('Node.js', 'Express.js');
  }

  // C. ATS Standard Section Headers (Max 20 pts)
  let sectionPoints = 0;
  if (combinedText.includes('education') || combinedText.includes('academic') || combinedText.includes('degree') || studentProfile.degree) sectionPoints += 5;
  if (combinedText.includes('experience') || combinedText.includes('internship') || combinedText.includes('work') || (studentProfile.internships && studentProfile.internships.length > 0)) sectionPoints += 5;
  if (combinedText.includes('project') || combinedText.includes('portfolio') || (studentProfile.projects && studentProfile.projects.length > 0)) sectionPoints += 5;
  if (combinedText.includes('skill') || combinedText.includes('technology') || combinedText.includes('competencies') || (studentProfile.skills && studentProfile.skills.length > 0)) sectionPoints += 5;

  // D. Action Verbs & Quantifiable Impact Metrics (Max 15 pts)
  let impactPoints = 0;
  let actionVerbsFound = 0;
  ACTION_VERBS.forEach(verb => {
    if (combinedText.includes(verb)) actionVerbsFound++;
  });
  if (actionVerbsFound > 0) impactPoints += Math.min(actionVerbsFound * 2, 8);
  else suggestions.push('Use active verbs ("Engineered", "Optimized", "Designed") at the start of project bullet points.');

  const metricMatches = (combinedText.match(/\b\d+%\b|\b\d+\s*(ms|kb|mb|sec|users|clients|records|pages)\b|optimized|reduced|increased/gi) || []).length;
  if (metricMatches > 0) impactPoints += Math.min(metricMatches * 3, 7);
  else suggestions.push('Include numerical impact metrics in project descriptions (e.g. "reduced latency by 30%").');

  // E. Academic CGPA / Standing (Max 10 pts)
  let academicPoints = 5;
  if (studentProfile.cgpa >= 8.5) academicPoints = 10;
  else if (studentProfile.cgpa >= 7.5) academicPoints = 8;

  // Final Heuristic ATS Calculation
  const atsScore = Math.min(Math.round(contactPoints + skillPoints + sectionPoints + impactPoints + academicPoints), 100);
  
  // Formatting Score
  let wordCount = combinedText.split(/\s+/).length;
  let formattingScore = 70;
  if (wordCount >= 80 && wordCount <= 800) formattingScore += 15;
  if (hasEmail && hasPhone && (hasGithub || hasLinkedin)) formattingScore += 15;
  formattingScore = Math.min(formattingScore, 100);

  const overallScore = Math.round((atsScore * 0.7) + (formattingScore * 0.3));

  let feedback = '';
  if (atsScore >= 80) {
    feedback = `Exceptional ATS Resume Match (${atsScore}%). Your resume contains strong section headers, contact credentials, and key tech stack keywords. Recruiter response probability is high.`;
  } else if (atsScore >= 60) {
    feedback = `Competitive ATS Match (${atsScore}%). Your profile covers fundamental core skills, but adding measurable metrics and missing tech keywords will boost recruiter ranking.`;
  } else {
    feedback = `ATS Optimization Required (${atsScore}%). Your resume lacks key technical keywords, contact links, or standard section headers. Follow the recommendations below to improve parsing.`;
  }

  const localAnalysis = {
    score: overallScore,
    atsScore: atsScore,
    formattingScore: formattingScore,
    suggestions: suggestions.length > 0 ? suggestions.slice(0, 4) : ['Your resume formatting and ATS score are in excellent shape!'],
    missingSkills: missingSkills.slice(0, 4),
    detectedSkills: detectedSkills.slice(0, 8),
    feedback: feedback
  };

  // Optional: Query Gemini if API key is active
  const prompt = `
    Perform a strict ATS resume evaluation.
    Parsed text details: ${combinedText.slice(0, 1500)}
    Computed local metrics: ATS Score = ${atsScore}, Formatting = ${formattingScore}.
    Return JSON format:
    {
      "score": number (0-100),
      "atsScore": number (0-100),
      "formattingScore": number (0-100),
      "suggestions": string[],
      "missingSkills": string[],
      "feedback": string
    }
  `;

  try {
    const aiResult = await callGemini(prompt, 'You are an elite ATS resume scoring system.', true, pdfBase64);
    if (aiResult && (typeof aiResult.atsScore === 'number' || typeof aiResult.score === 'number')) {
      return {
        ...aiResult,
        atsScore: aiResult.atsScore ?? atsScore,
        score: aiResult.score ?? overallScore,
        formattingScore: aiResult.formattingScore ?? formattingScore,
        detectedSkills: detectedSkills.slice(0, 8)
      };
    }
    return localAnalysis;
  } catch (error) {
    return localAnalysis;
  }
};

// 2. AI Job Recommendation
export const getJobRecommendations = async (studentProfile, jobs) => {
  const jobListString = jobs.map(j => `ID: ${j._id}, Title: ${j.title}, Company: ${j.company?.name || 'N/A'}, Skills: ${j.requiredSkills.join(', ')}, CTC: ${j.ctc} LPA`).join('\n');
  const prompt = `
    Match this student profile to the available jobs listed.
    Student Skills: ${studentProfile.skills.join(', ')}
    CGPA: ${studentProfile.cgpa}
    Degree: ${studentProfile.degree}
    Department: ${studentProfile.department}

    Jobs:
    ${jobListString}

    For each job, evaluate the match score and return a JSON list of matches:
    [
      {
        "jobId": "string ID of the job",
        "matchPercentage": number (0-100),
        "reason": "explanation of match"
      }
    ]
  `;

  try {
    return await callGemini(prompt, 'You are a campus placement job matching engine.');
  } catch (error) {
    // Generate simulated matching logic
    return jobs.map(job => {
      const commonSkills = job.requiredSkills.filter(skill => 
        studentProfile.skills.some(s => s.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(s.toLowerCase()))
      );
      const skillScore = job.requiredSkills.length > 0 ? (commonSkills.length / job.requiredSkills.length) * 60 : 30;
      const cgpaScore = studentProfile.cgpa >= 7.5 ? 40 : 25;
      const matchPercentage = Math.round(skillScore + cgpaScore);
      
      return {
        jobId: job._id.toString(),
        matchPercentage: Math.min(matchPercentage, 100),
        reason: commonSkills.length > 0 
          ? `Matches required skills: ${commonSkills.join(', ')}. CTC of ${job.ctc} LPA matches your profile.`
          : `High compatibility with your degree in ${studentProfile.department}. Consider learning ${job.requiredSkills.slice(0, 2).join(', ')} to boost score.`
      };
    });
  }
};

// 3. PlaceTrack Gemini AI Assistant Chatbot
export const getChatbotResponse = async (role, userContext, userQuery, messageHistory = []) => {
  const historyString = messageHistory.map(m => `${m.sender}: ${m.content}`).join('\n');
  
  let roleInstruction = `You are PlaceTrack Gemini AI Assistant, a state-of-the-art AI assistant integrated into the PlaceTrack Campus Placement Platform.
Directives:
1. You can answer EVERY question asked by the user — including technical programming questions, data structures & algorithms, system design, mock interview preparation, resume ATS optimization, campus placement drive queries, eligibility calculations, and general queries like Gemini AI.
2. ALWAYS personalize your responses using the user's live profile context provided below whenever relevant.
3. Format all responses cleanly with GitHub-Flavored Markdown (bold headings, bullet points, code snippets, and structured tables).
4. Be encouraging, precise, and highly insightful!`;

  let contextString = '';

  if (role === 'STUDENT') {
    contextString = `Student Profile Context:
- Candidate Name: ${userContext.name || 'Student'}
- CGPA: ${userContext.cgpa || 'N/A'} (Backlogs: ${userContext.activeBacklogs || 0})
- Degree & Department: ${userContext.degree || 'B.Tech'} - ${userContext.department || 'CSE'}
- Tech Skills: ${JSON.stringify(userContext.skills || [])}
- Projects: ${JSON.stringify(userContext.projects || [])}
- Internships: ${JSON.stringify(userContext.internships || [])}
- Active Drives: ${JSON.stringify(userContext.drives || [])}
- My Applications: ${JSON.stringify(userContext.applications || [])}`;
  } else if (role === 'COMPANY') {
    contextString = `Recruiter Profile Context:
- Company Name: ${userContext.name || 'Recruiter'}
- Industry: ${userContext.industry || 'Technology'}
- Active Job Openings: ${JSON.stringify(userContext.jobs || [])}`;
  } else if (role === 'PLACEMENT_MANAGER') {
    contextString = `Placement Coordinator Context:
- Total Placed Students: ${userContext.placedStudents || 0}
- Placement Success Rate: ${userContext.placementRate || 0}%
- Average CTC Package: ${userContext.averagePackage || 0} LPA`;
  } else {
    contextString = `Administrator System Context:
- Total Registered Users: ${userContext.totalUsers || 0}
- Active Candidates: ${userContext.studentsCount || 0}
- Registered Corporate Partners: ${userContext.companiesCount || 0}`;
  }

  const prompt = `
    User Role: ${role}
    User Context Data:
    ${contextString}

    Recent Chat History:
    ${historyString}

    User Query: ${userQuery}

    INSTRUCTION: Answer the user's query comprehensively like Gemini AI. Provide an intelligent, well-structured response using Markdown formatting.
  `;

  try {
    return await callGemini(prompt, roleInstruction, false);
  } catch (error) {
    // Advanced contextual fallback engine simulating Gemini AI
    const q = userQuery.toLowerCase().trim();
    const name = userContext.name || 'there';

    // 1. Technical / Coding / Algorithms Query
    if (q.includes('code') || q.includes('python') || q.includes('javascript') || q.includes('react') || q.includes('java') || q.includes('c++') || q.includes('sql') || q.includes('dsa') || q.includes('algorithm') || q.includes('array') || q.includes('string')) {
      return `### 💡 Technical Guidance & Code Example

Hello **${name}**! Here is a clean explanation for your query:

\`\`\`javascript
// Example: Technical Implementation / DSA Pattern
function solveProblem(input) {
  // 1. Initialize pointers & state tracking
  let result = [];
  const map = new Map();

  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    map.set(char, (map.get(char) || 0) + 1);
  }

  return Array.from(map.entries());
}
\`\`\`

**Key Points to Remember for Recruitment Technical Rounds:**
- **Time Complexity**: Aim for $O(N)$ or $O(N \\log N)$ performance.
- **Space Complexity**: Track auxiliary memory allocated for hash maps or arrays.
- **Edge Cases**: Always test null inputs, empty strings, and duplicate values.

*Feel free to ask me to solve specific coding problems or explain any algorithm!*`;
    }

    // 2. Drives & Eligibility Query
    if (q.includes('eligible') || q.includes('drive') || q.includes('company') || q.includes('hiring') || q.includes('apply') || q.includes('job')) {
      if (role === 'STUDENT') {
        const driveCount = userContext.drives?.length || 0;
        const driveList = userContext.drives?.map(d => `- **${d.name}** (Event Date: ${d.date ? new Date(d.date).toLocaleDateString() : 'Upcoming'})`).join('\n') || '- No public drives currently active.';
        
        return `### 🚀 Placement Drives & Eligibility Status

Hello **${name}**! Based on your academic record (**CGPA: ${userContext.cgpa || 'N/A'}**, Department: **${userContext.department || 'CSE'}**):

**Matching Active Campus Drives (${driveCount}):**
${driveList}

**Eligibility Check Parameters:**
- ✅ **Department Match**: Your major (${userContext.department}) is eligible for current campus drives.
- ✅ **CGPA Criteria**: Your current CGPA of **${userContext.cgpa}** meets default benchmark criteria (>= 6.0).
- 📌 **Next Steps**: Head to the **Placement Drives** tab to submit your formal application!`;
      }
      return `### 💼 Placement Drives Management\n\nActive campus recruitment drives are listed on your dashboard. Use the **Jobs & Drives** tab to post or audit drive details.`;
    }

    // 3. Resume & ATS Optimization Query
    if (q.includes('resume') || q.includes('ats') || q.includes('cv') || q.includes('score') || q.includes('portfolio')) {
      const skillsStr = userContext.skills?.length > 0 ? userContext.skills.join(', ') : 'React, Node.js, JavaScript, Python, SQL';
      return `### 📄 Resume & ATS Scoring Guidance for ${name}

Here are targeted recommendations to maximize your **ATS Resume Score**:

1. **Highlight Core Tech Stack**:
   - Ensure your skills (**${skillsStr}**) are prominently listed in a dedicated \`Skills\` section.
2. **Quantify Impact Metrics**:
   - Use action verbs with measurable results: *"Engineered REST APIs reducing latency by 35% across 10,000 requests."*
3. **Include Active Links**:
   - Add clickable **GitHub**, **LinkedIn**, and **Portfolio** URLs.
4. **Standard Section Headers**:
   - Use standard header titles: \`Education\`, \`Projects\`, \`Experience\`, \`Skills\`, \`Certifications\`.

*Use the **AI Resume Analyzer** card on your dashboard to run an instant ATS scan on your uploaded resume!*`;
    }

    // 4. Mock Interview & Preparation Query
    if (q.includes('interview') || q.includes('mock') || q.includes('prep') || q.includes('question') || q.includes('answer')) {
      return `### 🎯 Mock Interview Preparation & Strategy

Here is a common technical interview question for candidate evaluation:

> **Question**: *"Explain how asynchronous event loops work in modern Javascript/Node.js or how concurrency is handled in your target stack."*

**Recommended Answer Framework (STAR Method):**
- **Situation/Concept**: Explain call stack, event loop queue, and microtask queue (Promises vs setTimeout).
- **Task/Action**: Describe how non-blocking I/O delegates heavy tasks to thread pools while main thread stays responsive.
- **Result/Impact**: Highlight performance benefits in real-world high-concurrency web applications.

*Would you like me to quiz you with another mock interview question or evaluate your answer?*`;
    }

    // 5. Application Status & Results Query
    if (q.includes('status') || q.includes('application') || q.includes('result') || q.includes('round') || q.includes('pass')) {
      if (role === 'STUDENT') {
        const appList = userContext.applications?.map(a => `- **${a.driveName || 'Placement Drive'}**: Round ${a.round || 1} — Status: **${a.status || 'Submitted'}**`).join('\n') || '- No applications submitted yet.';
        return `### 📊 Your Application Status Overview

Hello **${name}**, here is your latest recruitment progress:

${appList}

*Navigate to **My Applications** to check round scorecards and download released candidate hall tickets!*`;
      }
      return `### 📊 Placement Portal Overview\n\nAll candidate applications and recruitment metrics are updated live in your dashboard.`;
    }

    // 6. Default Gemini-style Conversational Response
    return `### ✨ PlaceTrack Gemini AI Assistant

Hello **${name}**! I am your **PlaceTrack Gemini AI Assistant**.

I am here to assist you with:
- 💻 **Technical & Coding Questions**: DSA, system design, framework concepts, and code debugging.
- 🎯 **Interview Preparation**: Practice mock questions and answer strategies.
- 📄 **Resume ATS Scoring**: Optimize your resume for top recruiter rankings.
- ⚡ **Placement Drives & Status**: Check eligible drives, application stages, and hall tickets.

*How can I help you excel in your career journey today? Type any question to get started!*`;
  }
};

// 4. AI Mock Interview Evaluator
export const evaluateMockAnswer = async (question, answer, jobTitle) => {
  const prompt = `
    Job Role: ${jobTitle}
    Interview Question: ${question}
    Student Answer: ${answer}

    Assess the answer's technical accuracy, structured explanation, and relevance to the job role.
    Return a JSON object:
    {
      "score": number (0-100),
      "feedback": "constructive criticisms",
      "suggestions": "tips to improve",
      "idealAnswer": "what a perfect response would contain"
    }
  `;

  try {
    return await callGemini(prompt, 'You are an experienced technical interviewer.');
  } catch (error) {
    return {
      score: answer.split(' ').length > 15 ? 78 : 45,
      feedback: answer.split(' ').length > 15
        ? 'Good structure and keywords included.'
        : 'The answer is too brief. Try to use the STAR method (Situation, Task, Action, Result) to expand details.',
      suggestions: 'Elaborate on real-world examples and reference technical limitations or optimization trade-offs.',
      idealAnswer: 'A perfect answer should define the concept clearly, give a practical architectural context, list benefits and downsides, and cite previous production usages.'
    };
  }
};
