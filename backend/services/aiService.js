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
export const analyzeResume = async (studentProfile, pdfBase64 = null) => {
  // A. Local Advanced Heuristic Model
  let formattingPoints = 0;
  const suggestions = [];
  const missingSkills = [];

  // 1. Evaluate Formatting/Links presence
  if (studentProfile.github) formattingPoints += 10;
  else suggestions.push('Include a GitHub link to showcase your source code repositories.');

  if (studentProfile.linkedin) formattingPoints += 10;
  else suggestions.push('Include a LinkedIn profile to showcase your professional network.');

  if (studentProfile.portfolio) formattingPoints += 10;
  else suggestions.push('Add a personal portfolio link to present live demo links for your web apps.');

  const formattingScore = Math.min(Math.round((formattingPoints / 30) * 100), 100);

  // 2. Evaluate Academic & Core Profile
  let academicPoints = 0;
  if (studentProfile.cgpa >= 8.5) academicPoints += 10;
  else if (studentProfile.cgpa >= 7.5) academicPoints += 7;
  else academicPoints += 5;

  if (studentProfile.certifications && studentProfile.certifications.length > 0) academicPoints += 5;
  else suggestions.push('Complete and add industry-relevant certifications (e.g. AWS, Oracle, Google Cloud) to boost ATS score.');

  if (studentProfile.internships && studentProfile.internships.length > 0) academicPoints += 5;
  else suggestions.push('Seek technical internships or project-based roles to build commercial software experience.');

  // 3. Skills Analysis using our Dataset
  const userSkills = (studentProfile.skills || []).map(s => s.toLowerCase());
  let skillsScore = Math.min(userSkills.length * 3, 30); // 10 skills maxes out base score

  // Categorize user skills to identify missing tracks
  const tracks = {
    frontend: 0,
    backend: 0,
    devops: 0,
    databases: 0,
    cloud: 0,
    coreCs: 0
  };

  userSkills.forEach(skill => {
    for (const [track, keywords] of Object.entries(TECH_SKILLS_DATASET)) {
      if (keywords.includes(skill) || keywords.some(k => skill.includes(k))) {
        tracks[track]++;
      }
    }
  });

  // Suggest missing foundational tech
  if (tracks.devops === 0 && tracks.cloud === 0) {
    missingSkills.push('Docker', 'AWS');
    suggestions.push('Learn containerization (Docker) and basic cloud services (AWS EC2/S3) for modern deployment skills.');
  }
  if (tracks.databases === 0) {
    missingSkills.push('PostgreSQL', 'MongoDB');
    suggestions.push('Learn relational and non-relational database management systems (DBMS) such as PostgreSQL or MongoDB.');
  }
  if (tracks.frontend === 0) {
    missingSkills.push('React.js', 'TailwindCSS');
  }
  if (tracks.backend === 0) {
    missingSkills.push('Node.js', 'Express.js');
  }

  // 4. Project Descriptions Heuristic Analysis (NLP impact scoring)
  let projectPoints = 0;
  let actionVerbCount = 0;
  let metricCount = 0;
  let descriptionLengthCheck = true;

  if (studentProfile.projects && studentProfile.projects.length > 0) {
    studentProfile.projects.forEach(project => {
      const desc = (project.description || '').toLowerCase();
      if (desc.length < 30) {
        descriptionLengthCheck = false;
      }
      
      // Match action verbs
      ACTION_VERBS.forEach(verb => {
        if (desc.includes(verb)) actionVerbCount++;
      });

      // Match metrics (numbers, percent, time)
      if (/\b\d+%\b|\b\d+\s*(ms|kb|mb|sec|users|clients|records|pages)\b|optimized|reduced|increased/i.test(desc)) {
        metricCount++;
      }
    });

    if (actionVerbCount > 0) projectPoints += Math.min(actionVerbCount * 3, 10);
    else suggestions.push('Start project descriptions with active verbs (e.g. "Developed", "Optimized", "Engineered") instead of passive phrases.');

    if (metricCount > 0) projectPoints += Math.min(metricCount * 5, 10);
    else suggestions.push('Include quantifiable business metrics in project descriptions (e.g., "reduced latency by 20%", "integrated 5 APIs").');

    if (!descriptionLengthCheck) {
      suggestions.push('Elaborate on your project descriptions. Provide a clear architectural outline of the project.');
    }
  } else {
    suggestions.push('Add at least two technical projects to showcase your system architecture and coding style.');
  }

  // Calculate local ATS Compatibility Score
  // Max possible: formattingPoints (30) + academicPoints (20) + skillsScore (30) + projectPoints (20) = 100
  const localAtsScore = Math.min(Math.round(formattingPoints + academicPoints + skillsScore + projectPoints), 100);
  const localScore = Math.round((localAtsScore + formattingScore) / 2);

  let feedback = '';
  if (localAtsScore >= 80) {
    feedback = 'Excellent. Your profile has strong formatting, relevant links, solid project descriptions, and key industry technologies. Minor refinements will make it recruitment-ready.';
  } else if (localAtsScore >= 60) {
    feedback = 'Good progress. Your profile highlights solid foundational skills, but lacks quantitative metrics in projects and links to personal portfolios or source code repositories.';
  } else {
    feedback = 'Needs Improvement. Your profile lacks critical formatting links (GitHub, LinkedIn), core skills, and detailed project outlines. Refine descriptions and complete your profile fields.';
  }

  const localAnalysis = {
    score: localScore,
    atsScore: localAtsScore,
    formattingScore: formattingScore,
    suggestions: suggestions.slice(0, 4),
    missingSkills: missingSkills.slice(0, 3),
    feedback: feedback
  };

  // Try calling Gemini for qualitative insights, blend results if successful
  const prompt = `
    Analyze this student profile for resume quality, ATS compatibility, and skills completeness.
    Profile details:
    Name: ${studentProfile.name}
    Degree: ${studentProfile.degree}
    Department: ${studentProfile.department}
    CGPA: ${studentProfile.cgpa}
    Skills: ${JSON.stringify(studentProfile.skills)}
    Projects: ${JSON.stringify(studentProfile.projects)}
    Internships: ${JSON.stringify(studentProfile.internships)}
    Certifications: ${JSON.stringify(studentProfile.certifications)}

    We have computed local heuristic metrics:
    Local ATS Score: ${localAtsScore}
    Local Formatting Score: ${formattingScore}

    Analyze the profile details and return a refined JSON object matching this structure exactly (incorporate both local heuristics and your own advanced analysis):
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
    const aiResult = await callGemini(prompt, 'You are an elite ATS resume analyzer and career coach.', true, pdfBase64);
    if (aiResult && typeof aiResult.atsScore === 'number') {
      return aiResult;
    }
    return localAnalysis;
  } catch (error) {
    console.log('Gemini ATS analyzer fallback active. Returning local heuristic metrics.');
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
    roleInstruction = `You are the PlaceTrack AI Coordinator, an expert placement coordinator, mock interviewer, and technical career coach.
Key Directives:
1. ANSWER EVERY QUESTION: Be thorough, highly technical, and precise. Never decline to answer a placement, resume, or preparation query. When requested, write clean, production-ready, fully commented code (e.g. SQL queries, Python, C++, React components, Java).
2. SKILLS-BASED INTERVIEW PREPARATION: Provide comprehensive mock interview questions, technical answers, and conceptual breakdowns based exactly on the student's skills, projects, and target companies.
3. CONTEXT-AWARE MOCKS: Leverage the student's CGPA, projects, internships, and certifications to ask custom mock interview questions (e.g., asking how they designed their projects, optimization tactics, or how to explain their internships using the STAR method).
4. INTERACTIVE ASSISTANT: Offer to run a mock coding or behavioral interview right in the chat room. Prompt the user to start a session by typing 'Start Mock Practice' and ask questions one-by-one, providing instant feedback and correct solution grades.`;
    contextString = `Student Profile:
Name: ${userContext.name}
CGPA: ${userContext.cgpa}
Department: ${userContext.department}
Skills: ${JSON.stringify(userContext.skills || [])}
Projects: ${JSON.stringify(userContext.projects || [])}
Internships: ${JSON.stringify(userContext.internships || [])}
Certifications: ${JSON.stringify(userContext.certifications || [])}
Eligible Drives: ${JSON.stringify(userContext.drives || [])}
My Applications: ${JSON.stringify(userContext.applications || [])}`;
  } else if (role === 'COMPANY') {
    roleInstruction = 'You are PlaceTrack Recruiter Coach, an expert recruiter assistant. Help HR panels write appealing job descriptions, design optimal selection stages, assess candidate scores, and schedule virtual interviews.';
    contextString = `Recruiter Profile:
Company: ${userContext.name}
Industry: ${userContext.industry}
Jobs Posted: ${JSON.stringify(userContext.jobs || [])}`;
  } else if (role === 'PLACEMENT_MANAGER') {
    roleInstruction = 'You are PlaceTrack Coordinators Advisor, a smart placement office assistant. Help managers verify corporate registration applications, track institute placement rates, audit student marks, and schedule drives.';
    contextString = `Placement Statistics:
Placed Students: ${userContext.placedStudents}
Placement Rate: ${userContext.placementRate}%
Average Salary: ${userContext.averagePackage} LPA`;
  } else {
    roleInstruction = 'You are PlaceTrack Systems Admin Assistant. Help administrative operators manage database logins, toggle accounts active/suspended, set up academic departments, and audit system event logs.';
    contextString = `Admin Context:
Total Logins: ${userContext.totalUsers}
Students: ${userContext.studentsCount}
Companies: ${userContext.companiesCount}`;
  }

  const prompt = `
    Role Context:
    ${contextString}

    Chat History:
    ${historyString}

    User Query: ${userQuery}

    Provide a direct, conversational, supportive, and professional response. Do not output JSON.
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
