import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';

// Models
import { User, Student, Company, PlacementManager, Admin } from '../models/User.js';
import { Department, Course, Batch } from '../models/Academic.js';
import { Job, Drive, DriveRound } from '../models/JobDrive.js';
import { Application, RoundResult, Interview, Placement, Offer } from '../models/Recruitment.js';
import { Notification, Message, AuditLog } from '../models/System.js';

dotenv.config();

const seedDatabase = async () => {
  try {
    await connectDB();

    console.log('Clearing old collections...');
    await User.deleteMany();
    await Student.deleteMany();
    await Company.deleteMany();
    await PlacementManager.deleteMany();
    await Admin.deleteMany();
    await Department.deleteMany();
    await Course.deleteMany();
    await Batch.deleteMany();
    await Job.deleteMany();
    await Drive.deleteMany();
    await DriveRound.deleteMany();
    await Application.deleteMany();
    await RoundResult.deleteMany();
    await Interview.deleteMany();
    await Placement.deleteMany();
    await Offer.deleteMany();
    await Notification.deleteMany();
    await Message.deleteMany();
    await AuditLog.deleteMany();

    console.log('Seeding academic parameters...');
    const depts = await Department.insertMany([
      { name: 'Computer Science and Engineering', code: 'CSE' },
      { name: 'Information Technology', code: 'IT' },
      { name: 'Electronics and Communication Engineering', code: 'ECE' },
      { name: 'Mechanical Engineering', code: 'ME' }
    ]);

    const courses = await Course.insertMany([
      { name: 'Bachelor of Technology', code: 'B.Tech', durationYears: 4 },
      { name: 'Master of Computer Applications', code: 'MCA', durationYears: 2 }
    ]);

    const batches = await Batch.insertMany([
      { name: '2022-2026', startYear: 2022, endYear: 2026, isActive: true },
      { name: '2023-2027', startYear: 2023, endYear: 2027, isActive: true }
    ]);

    console.log('Generating password hashes...');
    const hashedAdminPassword = bcrypt.hashSync('Vamsi@1912', 10);
    const hashedManagerPassword = bcrypt.hashSync('Manager@123', 10);
    const hashedRecruiterPassword = bcrypt.hashSync('Recruiter@123', 10);
    const hashedStudentPassword = bcrypt.hashSync('Student@123', 10);

    console.log('Creating Administrative users...');
    const adminUser = await User.create({
      email: 'vamsivalluri52@gmail.com',
      password: hashedAdminPassword,
      role: 'ADMIN',
      isVerified: true
    });
    await Admin.create({
      user: adminUser._id,
      name: 'Vamsi Valluri',
      phone: '6301231575',
      address: 'Kandipadu, Guntur (Dt), Andhra Pradesh'
    });

    const managerUser = await User.create({
      email: 'manager@placetrack.com',
      password: hashedManagerPassword,
      role: 'PLACEMENT_MANAGER',
      isVerified: true
    });
    await PlacementManager.create({
      user: managerUser._id,
      name: 'Dr. Rajesh Kumar',
      phone: '+919876543210',
      department: 'Corporate Relations'
    });

    console.log('Creating Company recruiters...');
    const companiesData = [
      { name: 'Microsoft', email: 'recruiter@microsoft.com', recruiter: 'Satya Nadela', size: '10000+', headquarters: 'Redmond, USA', logo: 'https://images.unsplash.com/photo-1625014020903-e329f586c990?w=120&fit=crop&q=80', website: 'https://microsoft.com', industry: 'Software' },
      { name: 'Amazon', email: 'recruiter@amazon.com', recruiter: 'Jeff Bezos', size: '10000+', headquarters: 'Seattle, USA', logo: 'https://images.unsplash.com/photo-1523474253046-8cd2748b5fd2?w=120&fit=crop&q=80', website: 'https://amazon.com', industry: 'E-Commerce' },
      { name: 'TCS', email: 'recruiter@tcs.com', recruiter: 'K. Krithivasan', size: '10000+', headquarters: 'Mumbai, India', logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aba9?w=120&fit=crop&q=80', website: 'https://tcs.com', industry: 'Consulting' },
      { name: 'Infosys', email: 'recruiter@infosys.com', recruiter: 'Salil Parekh', size: '10000+', headquarters: 'Bengaluru, India', logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=120&fit=crop&q=80', website: 'https://infosys.com', industry: 'IT Services' },
      { name: 'Accenture', email: 'recruiter@accenture.com', recruiter: 'Julie Sweet', size: '10000+', headquarters: 'Dublin, Ireland', logo: 'https://images.unsplash.com/photo-1606857521015-7f9fcf423740?w=120&fit=crop&q=80', website: 'https://accenture.com', industry: 'Professional Services' }
    ];

    const companies = [];
    for (const comp of companiesData) {
      const u = await User.create({
        email: comp.email,
        password: hashedRecruiterPassword,
        role: 'COMPANY',
        isVerified: true
      });
      const c = await Company.create({
        user: u._id,
        name: comp.name,
        logo: comp.logo,
        website: comp.website,
        industry: comp.industry,
        headquarters: comp.headquarters,
        size: comp.size,
        recruiterName: comp.recruiter,
        recruiterEmail: comp.email,
        verificationStatus: 'APPROVED'
      });
      companies.push(c);
    }

    console.log('Seeding 20 Students...');
    const deptCodes = ['CSE', 'IT', 'ECE', 'CSE', 'CSE', 'IT', 'IT', 'ECE', 'CSE', 'CSE', 'ECE', 'IT', 'CSE', 'IT', 'CSE', 'ECE', 'CSE', 'IT', 'CSE', 'CSE'];
    const degrees = ['B.Tech', 'B.Tech', 'B.Tech', 'MCA', 'B.Tech', 'B.Tech', 'MCA', 'B.Tech', 'B.Tech', 'B.Tech', 'B.Tech', 'B.Tech', 'B.Tech', 'B.Tech', 'MCA', 'B.Tech', 'B.Tech', 'B.Tech', 'B.Tech', 'B.Tech'];
    const skillsList = [
      ['JavaScript', 'React.js', 'Node.js', 'Express.js', 'MongoDB', 'Git'],
      ['Python', 'Django', 'PostgreSQL', 'Docker', 'AWS'],
      ['Java', 'Spring Boot', 'MySQL', 'Kubernetes'],
      ['C++', 'Data Structures', 'Algorithms', 'SQL'],
      ['JavaScript', 'TypeScript', 'Next.js', 'GraphQL', 'Tailwind CSS']
    ];

    const students = [];
    for (let i = 1; i <= 20; i++) {
      const email = `student${i}@placetrack.com`;
      const u = await User.create({
        email,
        password: hashedStudentPassword,
        role: 'STUDENT',
        isVerified: true
      });

      const cgpa = (7.0 + Math.random() * 2.8).toFixed(2); // CGPA between 7.0 and 9.8
      const backlogs = i === 12 || i === 18 ? 1 : 0; // Some students have backlogs

      const s = await Student.create({
        user: u._id,
        name: `Student Name ${i}`,
        studentId: `PT-${2022000 + i}`,
        phone: `+9199887766${String(i).padStart(2, '0')}`,
        dob: new Date(2003, 5, i),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        cgpa: parseFloat(cgpa),
        tenthPercentage: parseFloat((80 + Math.random() * 18).toFixed(1)),
        twelfthPercentage: parseFloat((78 + Math.random() * 20).toFixed(1)),
        degree: degrees[i - 1],
        department: deptCodes[i - 1],
        batch: '2022-2026',
        graduationYear: 2026,
        currentSemester: 7,
        activeBacklogs: backlogs,
        totalBacklogs: backlogs,
        skills: skillsList[i % 5],
        projects: [
          { title: 'PlaceTrack Application', description: 'Fully featured MERN dashboard for placements.', repoLink: 'github.com', liveLink: 'placetrack.com' }
        ],
        resume: {
          fileName: `resume_student_${i}.pdf`,
          fileUrl: '/uploads/resumes/demo_resume.pdf',
          uploadDate: new Date(),
          version: 1,
          status: 'ACTIVE'
        },
        documents: [
          { name: '10th Certificate', fileUrl: '/uploads/docs/10th.pdf', status: 'VERIFIED' },
          { name: '12th Certificate', fileUrl: '/uploads/docs/12th.pdf', status: 'VERIFIED' }
        ]
      });
      students.push(s);
    }

    console.log('Seeding Jobs...');
    const jobsData = [
      { company: companies[0]._id, title: 'Software Engineer', code: 'MS-SWE-01', ctc: 18.0, vacancies: 5, jobType: 'Full Time', workMode: 'Onsite', location: 'Hyderabad', description: 'Design and develop highly scalable distributed backend microservices.' },
      { company: companies[0]._id, title: 'SDE Intern', code: 'MS-INTERN-02', ctc: 6.0, vacancies: 10, jobType: 'Internship', workMode: 'Hybrid', location: 'Bengaluru', description: 'Collaborate with engineering teams to deploy client applications.' },
      { company: companies[1]._id, title: 'Cloud Associate', code: 'AMZ-CLOUD-01', ctc: 14.5, vacancies: 3, jobType: 'Full Time', workMode: 'Onsite', location: 'Chennai', description: 'Maintain AWS infrastructure, optimize cloud deployments, and track costings.' },
      { company: companies[2]._id, title: 'Systems Engineer', code: 'TCS-SE-01', ctc: 4.5, vacancies: 50, jobType: 'Full Time', workMode: 'Onsite', location: 'Pune', description: 'Implement custom scripts, run database validations, and manage application servers.' },
      { company: companies[3]._id, title: 'Systems Engineer Specialist', code: 'INF-SES-01', ctc: 5.5, vacancies: 30, jobType: 'Full Time', workMode: 'Hybrid', location: 'Mysuru', description: 'Provide client consulting support and deliver technical integration solutions.' },
      { company: companies[4]._id, title: 'Associate Software Engineer', code: 'ACN-ASE-01', ctc: 6.5, vacancies: 25, jobType: 'Full Time', workMode: 'Remote', location: 'Remote', description: 'Collaborate with product managers to deliver modular frontend components.' },
      { company: companies[1]._id, title: 'Data Scientist', code: 'AMZ-DS-02', ctc: 20.0, vacancies: 2, jobType: 'Full Time', workMode: 'Onsite', location: 'Hyderabad', description: 'Evaluate massive databases and implement machine learning model structures.' },
      { company: companies[2]._id, title: 'Quality Assurance Intern', code: 'TCS-QA-02', ctc: 3.5, vacancies: 15, jobType: 'Internship', workMode: 'Onsite', location: 'Noida', description: 'Conduct automated test suites, verify UI components, and log application bugs.' }
    ];
    const jobs = await Job.insertMany(jobsData);

    console.log('Seeding Placement Drives...');
    const drivesData = [
      { name: 'Microsoft Elite Recruit 2026', company: companies[0]._id, job: jobs[0]._id, description: 'Premium drive for software engineering roles.', driveDate: new Date(2026, 8, 15), registrationStart: new Date(2026, 7, 1), registrationEnd: new Date(2026, 8, 10), location: 'Campus Auditorium', mode: 'Onsite', vacancies: 5, status: 'Registration Open', eligibilityCriteria: { minCgpa: 8.0, maxBacklogs: 0, allowedDepartments: ['CSE', 'IT'] } },
      { name: 'Amazon Web Services Cloud Recruitment', company: companies[1]._id, job: jobs[2]._id, description: 'Recruitment for AWS systems engineering.', driveDate: new Date(2026, 9, 2), registrationStart: new Date(2026, 7, 15), registrationEnd: new Date(2026, 8, 30), location: 'AWS Bangalore office', mode: 'Onsite', vacancies: 3, status: 'Registration Open', eligibilityCriteria: { minCgpa: 7.5, maxBacklogs: 0, allowedDepartments: ['CSE', 'IT', 'ECE'] } },
      { name: 'TCS Ninja & Digital Integrated Drive', company: companies[2]._id, job: jobs[3]._id, description: 'Bulk engineering requirements across disciplines.', driveDate: new Date(2026, 8, 25), registrationStart: new Date(2026, 7, 5), registrationEnd: new Date(2026, 8, 20), location: 'Online Assessment Lab', mode: 'Remote', vacancies: 50, status: 'Registration Open', eligibilityCriteria: { minCgpa: 6.0, maxBacklogs: 2 } },
      { name: 'Accenture Cloud Integration Drive', company: companies[4]._id, job: jobs[5]._id, description: 'Virtual interview drives for cloud analysts.', driveDate: new Date(2026, 8, 20), registrationStart: new Date(2026, 7, 1), registrationEnd: new Date(2026, 8, 18), location: 'Zoom Link', mode: 'Remote', vacancies: 25, status: 'Registration Open', eligibilityCriteria: { minCgpa: 6.5, maxBacklogs: 1 } },
      { name: 'Microsoft SDE Summer Internship', company: companies[0]._id, job: jobs[1]._id, description: 'Internship opportunities with conversion offers.', driveDate: new Date(2026, 10, 1), registrationStart: new Date(2026, 8, 1), registrationEnd: new Date(2026, 9, 25), location: 'Campus Labs', mode: 'Hybrid', vacancies: 10, status: 'Upcoming', eligibilityCriteria: { minCgpa: 8.5, maxBacklogs: 0, allowedDepartments: ['CSE', 'IT'] } }
    ];
    const drives = await Drive.insertMany(drivesData);

    console.log('Seeding Selection Rounds...');
    // Seed rounds for Microsoft Drive (Drive 0)
    const msRound1 = await DriveRound.create({
      drive: drives[0]._id,
      roundNumber: 1,
      roundName: 'Online Coding Challenge',
      roundType: 'Coding Test',
      description: '90-minute online challenge containing three algorithmic questions on Graph and Trees.',
      date: new Date(2026, 8, 15),
      startTime: '10:00 AM',
      endTime: '11:30 AM',
      duration: 90,
      mode: 'Online',
      maxScore: 300,
      passingScore: 180,
      instructions: 'Ensure high speed internet connectivity. Webcam proctoring enabled.',
      meetingLink: 'https://codility.com/ms-drive-test-xyz'
    });

    const msRound2 = await DriveRound.create({
      drive: drives[0]._id,
      roundNumber: 2,
      roundName: 'Technical Interview',
      roundType: 'Technical Interview',
      description: 'System design and algorithmic face-to-face virtual interview.',
      date: new Date(2026, 8, 18),
      startTime: '02:00 PM',
      endTime: '03:00 PM',
      duration: 60,
      mode: 'Online',
      maxScore: 100,
      passingScore: 70,
      meetingLink: 'https://teams.microsoft.com/ms-interview-xyz'
    });

    // Add rounds to drives array representation if needed
    console.log('Creating student applications & results...');
    
    // Student 1 and 2 apply for Microsoft (They both have CGPA > 8.0)
    // Student 1 (high CGPA, passes test and gets placed)
    const app1 = await Application.create({
      student: students[0]._id,
      company: companies[0]._id,
      job: jobs[0]._id,
      drive: drives[0]._id,
      status: 'Selected',
      currentRound: 2
    });

    await RoundResult.create({
      student: students[0]._id,
      drive: drives[0]._id,
      round: msRound1._id,
      score: 260,
      maxScore: 300,
      percentage: 86.6,
      result: 'Pass',
      evaluator: 'ms.proctor@microsoft.com'
    });

    await RoundResult.create({
      student: students[0]._id,
      drive: drives[0]._id,
      round: msRound2._id,
      score: 90,
      maxScore: 100,
      percentage: 90.0,
      result: 'Pass',
      evaluator: 'satya.nadela@microsoft.com'
    });

    const int1 = await Interview.create({
      student: students[0]._id,
      company: companies[0]._id,
      drive: drives[0]._id,
      round: msRound2._id,
      interviewer: 'S. Somasegar',
      date: new Date(2026, 8, 18),
      time: '02:00 PM',
      mode: 'Online',
      meetingLink: 'https://teams.microsoft.com/ms-interview-xyz',
      status: 'Completed'
    });

    await Placement.create({
      student: students[0]._id,
      company: companies[0]._id,
      job: jobs[0]._id,
      drive: drives[0]._id,
      package: 18.0,
      baseSalary: 16.0,
      variableSalary: 2.0,
      location: 'Hyderabad',
      joiningDate: new Date(2027, 6, 1),
      offerDate: new Date(),
      offerStatus: 'Offer Accepted',
      placementStatus: 'Joined'
    });

    // Student 2 (CGPA > 8.0, passes first round, fails second technical round)
    const app2 = await Application.create({
      student: students[4]._id,
      company: companies[0]._id,
      job: jobs[0]._id,
      drive: drives[0]._id,
      status: 'Rejected',
      currentRound: 2
    });

    await RoundResult.create({
      student: students[4]._id,
      drive: drives[0]._id,
      round: msRound1._id,
      score: 200,
      maxScore: 300,
      percentage: 66.6,
      result: 'Pass',
      evaluator: 'ms.proctor@microsoft.com'
    });

    await RoundResult.create({
      student: students[4]._id,
      drive: drives[0]._id,
      round: msRound2._id,
      score: 55,
      maxScore: 100,
      percentage: 55.0,
      result: 'Fail',
      remarks: 'Weak foundations in multi-threading and lock mechanisms.',
      evaluator: 'interviewer2@microsoft.com'
    });

    // Student 3 (applies to TCS Ninja, passes online exam, shortlisted, pending interview)
    // TCS Ninja has lower CGPA requirements, student 5 applies (CGPA is 7.2)
    const tcsRound1 = await DriveRound.create({
      drive: drives[2]._id,
      roundNumber: 1,
      roundName: 'Ninja Aptitude & Coding Exam',
      roundType: 'Aptitude Test',
      date: new Date(2026, 8, 25),
      startTime: '09:00 AM',
      endTime: '11:00 AM',
      duration: 120,
      mode: 'Online',
      maxScore: 100,
      passingScore: 60,
      meetingLink: 'https://ion.tcs.com/ninjatest'
    });

    const app3 = await Application.create({
      student: students[1]._id,
      company: companies[2]._id,
      job: jobs[3]._id,
      drive: drives[2]._id,
      status: 'In Progress',
      currentRound: 2
    });

    await RoundResult.create({
      student: students[1]._id,
      drive: drives[2]._id,
      round: tcsRound1._id,
      score: 82,
      maxScore: 100,
      percentage: 82.0,
      result: 'Pass',
      evaluator: 'tcs.grader@tcs.com'
    });

    // Seed some other registrations for TCS Ninja
    for (let k = 5; k < 15; k++) {
      await Application.create({
        student: students[k]._id,
        company: companies[2]._id,
        job: jobs[3]._id,
        drive: drives[2]._id,
        status: 'Applied',
        currentRound: 1
      });
    }

    console.log('Seeding Audit Logs, Chat histories, and Notifications...');
    await AuditLog.create({
      userEmail: 'manager@placetrack.com',
      role: 'PLACEMENT_MANAGER',
      action: 'Create Placement Drive',
      entity: 'Drive',
      entityId: drives[0]._id.toString(),
      newValue: { name: drives[0].name }
    });

    await AuditLog.create({
      userEmail: 'recruiter@microsoft.com',
      role: 'COMPANY',
      action: 'Submit Round Result',
      entity: 'RoundResult',
      entityId: msRound2._id.toString(),
      newValue: { student: students[0].name, score: '90/100', result: 'Pass' }
    });

    await Notification.create({
      recipient: students[0].user,
      sender: managerUser._id,
      type: 'PLACEMENT_SELECTED',
      title: 'Congratulations!',
      message: 'You have been selected by Microsoft as Software Engineer (18 LPA).',
      link: '/student/placements'
    });

    await Notification.create({
      recipient: students[4].user,
      sender: managerUser._id,
      type: 'ROUND_RESULT',
      title: 'Round Results Published',
      message: 'Your results for Microsoft Tech Interview are published.',
      link: '/student/results'
    });

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error.message);
    process.exit(1);
  }
};

seedDatabase();
