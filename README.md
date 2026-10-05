# InternCheck

> Discover. Verify. Match. Apply. Track.

InternCheck is an internship discovery and verification platform designed to help students make better-informed decisions before applying to internship opportunities.

The platform combines internship discovery, automated verification, student experiences, CV-based recommendations, Easy Apply, and application tracking into a single workflow.

Instead of simply asking:

> "Can I apply to this internship?"

InternCheck helps answer:

> "Is this internship worth applying to, does it match my skills, and what should I know before I apply?"

---

## ◆ Problem

Finding an internship should not require detective work.

Students frequently encounter:

- Misleading internship descriptions
- Unrealistic stipend claims
- Registration or training fees
- Security deposit requirements
- Suspicious application links
- Inconsistent company information
- Duplicate or spam listings
- Poor communication
- Unclear work expectations
- Experiences that differ from what was originally promised

Most internship platforms primarily focus on listing opportunities.

InternCheck adds another layer of context:

    Discover
        ↓
    Verify
        ↓
    Match
        ↓
    Apply
        ↓
    Track
        ↓
    Learn

---

## ◆ Core Features

### ◇ Internship Discovery

Browse and discover internships using relevant information and filters.

Students can explore opportunities based on:

- Domain
- Skills
- Location
- Work mode
- Duration
- Stipend
- Application type
- Verification status

Each internship can provide:

- Internship description
- Company information
- Required skills
- Stipend
- Duration
- Work mode
- Application method
- Verification results
- Risk indicators
- Student experiences

---

### ◇ Internship Verification

InternCheck analyzes internship listings using rule-based verification checks.

Verification can evaluate:

- Company website availability
- Company information completeness
- Company and email domain consistency
- Application URL validity
- Registration fee requirements
- Training fee requirements
- Security deposit requirements
- Suspicious contact information
- Unrealistic stipend claims
- Duplicate internship listings
- Suspicious application patterns

The verification engine produces a risk score from `0` to `100`.

#### Risk Levels

| Score | Level | Meaning |
|------:|-------|---------|
| 0–30 | LOW | Few significant risk signals detected |
| 31–60 | MEDIUM | Some concerns require attention |
| 61–100 | HIGH | Multiple significant risk signals detected |

Example verification result:

    Risk Score: 75
    Risk Level: HIGH

    [FAIL] Registration Fee Required
    [FAIL] Application Domain Mismatch
    [PASS] Company Website Available
    [PASS] Company Information Found
    [PASS] Application URL Accessible

The platform exposes the individual checks contributing to the assessment instead of displaying an unexplained score.

> InternCheck does not guarantee that an internship is legitimate or fraudulent. Verification results are signals intended to help students make more informed decisions.

---

### ◇ CV-Based Recommendations

Students can upload their CV and receive internship recommendations based on their skills.

#### Recommendation Flow

    Upload CV
        ↓
    Extract CV Text
        ↓
    Identify Skills
        ↓
    Normalize Skills
        ↓
    Create Student Skill Profile
        ↓
    Compare With Internship Requirements
        ↓
    Calculate Match Percentage
        ↓
    Rank Recommendations

For example:

    Student Skills

    React
    Node.js
    MongoDB
    Docker
    Java
    Python

An internship may require:

    React
    Node.js
    MongoDB
    Docker
    AWS

The system can calculate:

    4 / 5 Required Skills Matched
    Match: 80%

The recommendation system is intentionally separate from the verification system.

    80% MATCH       LOW RISK

A strong skill match does not mean an internship is trustworthy.

Likewise, a low-risk internship does not necessarily mean it is suitable for a particular student.

---

### ◇ Skill Normalization

Different names for the same technology are normalized before matching.

Examples:

    JS
    JavaScript
    Javascript
    Java Script
        ↓
    JavaScript

    ReactJS
    React.js
    React JS
        ↓
    React

    Node
    NodeJS
    Node.js
        ↓
    Node.js

    Mongo
    MongoDB
    Mongo DB
        ↓
    MongoDB

Students can review and correct extracted skills to keep their recommendation profile accurate.

---

### ◇ Personalized Home

The student home page focuses on useful information instead of generic dashboard statistics.

The home page can provide:

- Personalized internship recommendations
- Recently viewed internships
- Saved internships
- Application updates
- Relevant internship opportunities
- Verification information

The interface can also display a rotating contextual greeting.

Example:

    Good evening, Ashmit.

    Find opportunities without the guesswork.

Other messages can include:

- Find something worth applying to.
- Your next opportunity might be here.
- Let’s find an internship that checks out.
- Good opportunities deserve a closer look.
- Search smarter. Apply with confidence.
- Find the role. Check the details.
- Start with opportunities you can trust.
- See what’s worth your application.
- A better internship search starts here.
- Check first. Apply second.
- Know more before you apply.
- Discover. Verify. Decide.
- Make your next application count.

---

### ◇ Easy Apply

InternCheck provides a LinkedIn-style Easy Apply workflow for internships hosted directly on the platform.

Students can apply using their current CV without repeatedly uploading the same document.

    Current CV
        ↓
    Easy Apply
        ↓
    Optional Cover Message
        ↓
    Consent
        ↓
    Application Submitted

An Easy Apply application can contain:

- Student profile
- CV
- CV skills
- Optional cover message
- Internship
- Submission timestamp
- Application status

---

### ◇ CV Snapshotting

Applications preserve the CV that was actually submitted.

Example:

    January

    CV v1
        ↓
    Apply to Internship A
        ↓
    Application stores CV snapshot

Later:

    February

    Student updates CV
        ↓
    CV v2

The January application still references the version submitted in January.

This ensures recruiters see the CV associated with the original application rather than whatever happens to be the student's current CV months later.

---

### ◇ Internal and External Applications

Internships can have two application types.

#### Internal Application

Applications are handled directly through InternCheck.

    [ Easy Apply ]

#### External Application

The student is redirected to the company's application page.

    [ Apply on Company Website ]

InternCheck does not attempt to submit applications to arbitrary third-party websites without the required integration or authorization.

---

### ◇ Application Tracking

Students can track the progress of applications submitted through InternCheck.

Typical application states include:

    Application Submitted
            ↓
       Under Review
            ↓
        Shortlisted
            ↓
         Interview
            ↓
         Selected

Applications may also move to:

    Rejected

Students can view their applications and current statuses from the application tracking area.

---

### ◇ Student Experiences

Students can share their experiences with internships they have completed or participated in.

Experience information can include:

- Internship role
- Duration
- Stipend
- Promised stipend
- Received stipend
- Work performed
- Interview process
- Mentorship
- Certificate
- Overall experience
- Feedback

This creates a student-generated information layer around internship listings and companies.

---

### ◇ Company Profiles

Company profiles aggregate relevant information about internships and student experiences.

A company profile can contain:

- Company information
- Active internships
- Previous internships
- Verification results
- Student experiences
- Reported issues
- Risk indicators

A single suspicious internship does not automatically mean an entire company is fraudulent.

The platform evaluates individual listings and available evidence separately.

---

### ◇ Student Reports

Students can report problematic internship listings.

Reports may involve:

- Registration fees
- Training fees
- Missing stipend
- Misleading descriptions
- Suspicious communication
- Fake or broken application links
- Unexpected requirements
- Other concerning behavior

Reports can provide additional evidence for internship verification and company-level analysis.

---

## ◆ Verification Architecture

InternCheck currently uses deterministic, rule-based verification rather than an AI/ML model.

    Internship
        │
        ├── Company Information
        ├── Application URL
        ├── Contact Information
        ├── Stipend
        ├── Description
        └── Requirements
                │
                ↓
        Verification Rules
                │
                ├── Fee Detection
                ├── Domain Check
                ├── URL Validation
                ├── Duplicate Detection
                ├── Company Information
                └── Suspicious Pattern Checks
                │
                ↓
          Risk Calculation
                │
                ↓
         Verification Result
                │
                ├── Risk Score
                ├── Risk Level
                └── Individual Checks

The rules are explicit and explainable so that risk assessments can be understood and maintained.

---

## ◆ Recommendation Architecture

The recommendation system follows a deterministic matching approach.

    Student CV
        ↓
    Text Extraction
        ↓
    Skill Extraction
        ↓
    Skill Normalization
        ↓
    Student Skill Profile
        ↓
    Internship Requirements
        ↓
    Skill Comparison
        ↓
    Match Calculation
        ↓
    Recommendation Ranking

A basic match percentage can be calculated using:

    Match Percentage =
    (Matched Required Skills / Total Required Skills) × 100

The system can later incorporate weighted skills, location, work mode, preferences, and other contextual factors.

---

## ◆ Application Architecture

The application separates the major product responsibilities.

    ┌──────────────────────────┐
    │        Next.js App       │
    └────────────┬─────────────┘
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
    Auth API  Internship  Application
                 API          API
       │         │         │
       └─────────┼─────────┘
                 ↓
              MongoDB
                 │
       ┌─────────┴─────────┐
       ↓                   ↓
    Verification      Recommendation
       Engine             Engine

---

## ◆ Technology Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| Next.js | Full-stack React framework |
| React | User interface |
| Tailwind CSS | Styling and responsive design |
| JavaScript / TypeScript | Application development |

### Backend

| Technology | Purpose |
|------------|---------|
| Next.js API Routes | Backend API layer |
| MongoDB | Primary database |
| MongoDB Driver / Mongoose | Database interaction |
| Rule-based verification | Internship risk assessment |
| CV parsing | Skill extraction |
| Deterministic matching | Internship recommendations |

---

## ◆ User Roles

### Student

Students can:

- Browse internships
- Search and filter opportunities
- View internship details
- Check verification results
- View company information
- Read student experiences
- Report problematic listings
- Upload and manage CVs
- Review extracted skills
- Receive internship recommendations
- Bookmark internships
- Apply through Easy Apply
- Track applications

### Recruiter

Recruiters can:

- Create and manage company information
- Post internships
- Manage internship listings
- Receive Easy Apply applications
- View submitted CVs
- Review candidate information
- Update application statuses
- View student feedback

### Verification System

The automated verification system is responsible for:

- Running verification rules
- Evaluating internship information
- Detecting risk signals
- Calculating risk scores
- Producing explainable verification results

The verification system is not treated as a user.

---

## ◆ Student Navigation

The student-facing platform focuses on discovering and managing internships.

    Home
    Browse Internships
    Companies
    Student Experiences
    My Bookmarks
    My Reports
    Applications
    Profile

Recruiter functionality is kept separate from the student browsing experience.

---

## ◆ Recruiter Portal

Recruiters have a dedicated workflow.

    Dashboard
    My Internships
    Post Internship
    Applications
    Student Feedback
    Company Profile
    Settings

---

## ◆ Complete Student Workflow

    ┌───────────────┐
    │   Upload CV   │
    └───────┬───────┘
            ↓
    ┌───────────────┐
    │ Extract Skills│
    └───────┬───────┘
            ↓
    ┌───────────────┐
    │Recommendations│
    └───────┬───────┘
            ↓
    ┌───────────────┐
    │View Internship│
    └───────┬───────┘
            ↓
    ┌───────────────┐
    │ Verify Risk   │
    └───────┬───────┘
            ↓
    ┌───────────────┐
    │Read Experiences│
    └───────┬───────┘
            ↓
    ┌───────────────┐
    │     Apply     │
    └───────┬───────┘
            ↓
    ┌───────────────┐
    │ Track Status  │
    └───────┬───────┘
            ↓
    ┌───────────────┐
    │Share Experience│
    └───────────────┘

---

## ◆ Data Relationships

    User
     │
     ├──────────────< Applications
     │
     ├──────────────< Experiences
     │
     ├──────────────< Reports
     │
     ├──────────────< Bookmarks
     │
     └─────────────── CV / Skill Profile
                              │
                              ↓
                       Recommendations


    Company
     │
     └──────────────< Internships
                            │
                            ├──────────< Applications
                            ├──────────< Experiences
                            ├──────────< Reports
                            └──────────< Verification Results

---

## ◆ Core MongoDB Collections

The major collections include:

    users
    companies
    internships
    applications
    cvs
    experiences
    reports
    bookmarks
    verificationResults

Verification results are kept separate from internship records so verification information can be updated independently.

---

## ◆ Design Philosophy

### 1. Evidence Over Claims

InternCheck avoids relying on unexplained trust percentages.

Instead of:

    TRUST SCORE: 87%

the platform aims to show:

    Risk Score: 42

    [PASS] Company Website
    [PASS] Application URL
    [FAIL] Registration Fee
    [PASS] Company Domain
    [WARN] Stipend Information

Students can therefore understand the reason behind the assessment.

---

### 2. Risk and Relevance Are Different

Internship matching and internship verification answer different questions.

    Match Score
    "How well does this internship fit my skills?"

    Risk Score
    "What concerns were detected about this internship?"

These scores should never be combined into a single unexplained number.

---

### 3. Explainable Verification

Every major risk assessment should be traceable to individual checks.

    Risk Score
        ↓
    Verification Checks
        ↓
    Evidence

---

### 4. Student-Centered Discovery

The platform prioritizes useful internship information instead of filling the interface with meaningless statistics.

The objective is to help students make better decisions, not to make a dashboard look busy.

---

### 5. Separation of Responsibilities

Internship discovery, verification, recommendation, applications, and student experiences are treated as separate product responsibilities.

This keeps the system maintainable and allows individual components to evolve independently.

---

## ◆ Current MVP

The current MVP includes:

    [x] Internship Discovery
    [x] Internship Verification
    [x] Risk Assessment
    [x] Student Experiences
    [x] Company Profiles
    [x] CV Upload
    [x] Skill Extraction
    [x] Skill Normalization
    [x] CV-Based Recommendations
    [x] Easy Apply
    [x] CV Snapshots
    [x] Application Tracking
    [x] Student Reports
    [x] Internal / External Applications
    [x] Student Bookmarks

---

## ◆ Future Improvements

Potential future improvements include:

- Recruiter-initiated candidate discovery
- Recruiter invitations to apply
- Advanced candidate filtering
- Weighted skill matching
- More sophisticated duplicate detection
- Additional verification sources
- Advanced recommendation personalization
- Application analytics
- Recruiter analytics
- Detailed company reputation history
- Notification system
- Email notifications
- Advanced search
- Resume improvement suggestions
- Interview preparation tools

Recruiter candidate discovery is intentionally outside the current MVP to keep the initial product focused.

---

## ◆ Security Considerations

InternCheck handles student profiles, CVs, applications, and potentially sensitive recruiter information.

Important security considerations include:

- Secure authentication
- Password hashing
- Authorization checks
- Protected recruiter routes
- Protected CV access
- Secure file handling
- Environment variable protection
- Input validation
- URL validation
- Rate limiting
- Malicious file upload protection
- Server-side authorization for applications
- Protection of private student information

CV files should never be publicly accessible simply because a URL exists.

---

## ◆ Getting Started

### Prerequisites

Install the following:

- Node.js
- npm
- MongoDB or MongoDB Atlas
- Git

### Clone the Repository

    git clone <repository-url>
    cd interncheck

### Install Dependencies

    npm install

### Environment Variables

Create a `.env.local` file:

    MONGODB_URI=your_mongodb_connection_string

    NEXTAUTH_SECRET=your_auth_secret
    NEXTAUTH_URL=http://localhost:3000

Add any additional environment variables required by the application.

### Run Development Server

    npm run dev

The application will be available at:

    http://localhost:3000

### Build for Production

    npm run build

### Start Production Server

    npm start

---

## ◆ Project Structure

    interncheck/
    │
    ├── app/
    │   ├── api/
    │   ├── auth/
    │   ├── companies/
    │   ├── experiences/
    │   ├── internships/
    │   ├── applications/
    │   ├── bookmarks/
    │   ├── reports/
    │   ├── profile/
    │   └── ...
    │
    ├── components/
    │   ├── ui/
    │   ├── internships/
    │   ├── companies/
    │   ├── verification/
    │   ├── cv/
    │   └── applications/
    │
    ├── lib/
    │   ├── mongodb/
    │   ├── verification/
    │   ├── matching/
    │   ├── cv/
    │   └── utils/
    │
    ├── models/
    │   ├── User
    │   ├── Company
    │   ├── Internship
    │   ├── Application
    │   ├── CV
    │   ├── Experience
    │   ├── Report
    │   ├── Bookmark
    │   └── VerificationResult
    │
    ├── public/
    │
    ├── package.json
    └── README.md

---

## ◆ Disclaimer

InternCheck provides verification signals, risk assessments, and student-generated information.

It does not guarantee:

- That a company is legitimate
- That an internship is fraudulent
- That a stipend will be paid
- That an internship will provide a particular experience
- That an application will receive a response
- That an internship is suitable for every student

Students should independently verify important information before sharing personal information, paying money, signing agreements, or ac