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

// 3. AI Chatbot
export const getChatbotResponse = async (role, userContext, userQuery, messageHistory) => {
  const historyString = messageHistory.map(m => `${m.sender}: ${m.content}`).join('\n');
  
  let roleInstruction = '';
  let contextString = '';

  if (role === 'STUDENT') {
    roleInstruction = `You are PlaceTrack AI Coordinator, a smart campus placement assistant.
Directives:
1. KEEP RESPONSES VERY SHORT, CONCISE, AND FLEXIBLE. Maximum 2 to 4 bullet points or 2-3 short sentences (under 75 words).
2. Format cleanly using Markdown with bold keywords. Avoid long essays, walls of text, or verbose introductions.
3. Be actionable, precise, and direct.`;
    contextString = `Student Profile:
Name: ${userContext.name}
CGPA: ${userContext.cgpa}
Department: ${userContext.department}
Skills: ${JSON.stringify(userContext.skills || [])}
Projects: ${JSON.stringify(userContext.projects || [])}
Eligible Drives: ${JSON.stringify(userContext.drives || [])}
My Applications: ${JSON.stringify(userContext.applications || [])}`;
  } else if (role === 'COMPANY') {
    roleInstruction = 'You are PlaceTrack Recruiter Coach. Provide concise, 2-3 bullet point answers helping HR panels schedule interviews and post jobs.';
    contextString = `Recruiter Profile: Name: ${userContext.name}, Jobs: ${JSON.stringify(userContext.jobs || [])}`;
  } else if (role === 'PLACEMENT_MANAGER') {
    roleInstruction = 'You are PlaceTrack Coordinator Advisor. Provide short 2-3 bullet point summaries on placement statistics and drives.';
    contextString = `Placement Rate: ${userContext.placementRate}%, Avg CTC: ${userContext.averagePackage} LPA`;
  } else {
    roleInstruction = 'You are PlaceTrack Admin Assistant. Provide brief 2-3 sentence guidance on user accounts and system configuration.';
    contextString = `Total Users: ${userContext.totalUsers}`;
  }

  const prompt = `
    Context:
    ${contextString}

    Chat History:
    ${historyString}

    User Query: ${userQuery}

    CRITICAL INSTRUCTION: Provide a SHORT, CONCISE, bulleted response (max 75 words). Do not write long paragraphs or lengthy essays.
  `;

  try {
    return await callGemini(prompt, roleInstruction, false);
  } catch (error) {
    const q = userQuery.toLowerCase();
    if (role === 'STUDENT') {
      if (q.includes('eligible') || q.includes('eligibility')) {
        return `As a student in ${userContext.department} with a CGPA of ${userContext.cgpa}, you are eligible for all matching recruiter drives. Check the active drives tab to apply!`;
      }
      if (q.includes('job') || q.includes('drive') || q.includes('hiring') || q.includes('company')) {
        const driveNames = userContext.drives?.map(d => d.name).join(', ') || 'active campus placements';
        return `Matching placement drives for your department include: ${driveNames}. Go to 'Placement Drives' to read CTC details and apply!`;
      }
      if (q.includes('resume') || q.includes('cv') || q.includes('portfolio') || q.includes('profile')) {
        return `Upload your resume PDF in the 'Resume' section. I will calculate your ATS compatibility score and list formatting improvements.`;
      }
      if (q.includes('interview') || q.includes('prep') || q.includes('prepare')) {
        const skillList = userContext.skills?.slice(0, 3).join(', ') || 'coding questions';
        return `Prepare for assessment rounds by focusing on: ${skillList}. Check your schedule in the 'Interviews' section.`;
      }
      if (q.includes('result') || q.includes('score') || q.includes('grade')) {
        return `Check the 'Results' tab on the sidebar to view round-wise selection scores and pass outcomes.`;
      }
      return `Hello ${userContext.name}! I am your student placement advisor. Ask me about active jobs, resume analysis, upcoming drives, or interview prep.`;
    }
    if (role === 'COMPANY') {
      if (q.includes('job') || q.includes('post') || q.includes('hiring')) {
        return `You have posted ${userContext.jobs?.length || 0} job openings. Go to 'Jobs' page to create new listings.`;
      }
      if (q.includes('applicant') || q.includes('student') || q.includes('screen')) {
        return `View all candidate applications and test scores inside the 'Applicants' console.`;
      }
      return `Welcome, Recruiter! I can help you draft description profiles for job openings, organize recruitment stages, or search candidate scorecards.`;
    }
    if (role === 'PLACEMENT_MANAGER') {
      if (q.includes('verify') || q.includes('approve') || q.includes('audit')) {
        return `Audit student credentials and documents under 'Students' page. Verify company logins under 'Companies' page.`;
      }
      if (q.includes('stat') || q.includes('rate') || q.includes('package')) {
        return `Current metrics: Placement Rate is ${userContext.placementRate}%, Average CTC Package is ${userContext.averagePackage} LPA. ${userContext.placedStudents} students placed.`;
      }
      return `Hello Coordinator! I can assist you with verifying company profiles, scheduling recruiter drives, and checking placement metrics.`;
    }
    if (role === 'ADMIN') {
      if (q.includes('user') || q.includes('login') || q.includes('suspend')) {
        return `We have ${userContext.totalUsers} registered accounts (${userContext.studentsCount} students). Manage suspension states on the 'User Logins' panel.`;
      }
      if (q.includes('dept') || q.includes('academic')) {
        return `Create and remove Departments, Degrees, and Batches in the 'Academic Settings' panel.`;
      }
      return `Welcome Administrator! I am ready to help you audit system event logs or register new academic departments.`;
    }
    return `Hello! How can I assist you with the placement portal today?`;
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
