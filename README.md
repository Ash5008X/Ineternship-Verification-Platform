# Internship Verification & Experience Platform

A platform designed to help students discover off-campus internship opportunities, assess their credibility through automated verification, and learn from previous students' internship experiences.

The system addresses common problems such as fake internship listings, fee-based scams, misleading opportunities, and the lack of reliable information about companies and internship experiences.

---

## Problem Statement

Students searching for off-campus internships often encounter:

* Fake or misleading internship listings
* Registration and training fee scams
* Suspicious companies or application links
* Unrealistic stipend and job claims
* Duplicate or spam listings
* Lack of reliable student experiences

Students often have no centralized way to evaluate whether an internship opportunity is trustworthy before applying.

---

## Proposed Solution

The platform combines internship discovery, automated verification, risk assessment, and student experiences into a single system.

### Core Flow

```text
Internship Listing
        ↓
Automated Verification
        ↓
Risk Assessment
        ↓
Student Experiences
        ↓
Decision Support
```

The system does not guarantee that an internship is genuine. Instead, it evaluates available information using predefined verification criteria and provides transparent risk indicators to help students make informed decisions.

---

# Core Modules

## 1. Internship Listing Service

The platform provides a centralized place for students to discover internship opportunities.

Students can:

* Browse internship listings
* Search for opportunities
* Filter by domain, skills, location, stipend, and work mode
* View complete internship details
* Access the original application source

Each internship can contain information such as:

* Internship title
* Company
* Description
* Location
* Work mode
* Duration
* Stipend
* Required skills
* Application deadline
* Application URL
* Source

---

## 2. Verification & Risk Service

The system automatically evaluates internship listings using predefined verification rules.

Possible verification checks include:

* Company website availability
* Company and email domain consistency
* Application URL validation
* Registration or training fee detection
* Security deposit requirements
* Suspicious contact information
* Unrealistic stipend claims
* Missing company information
* Duplicate listings
* Suspicious application patterns

The result is represented through a risk score and risk level.

### Example

```text
Risk Score: 72 / 100

Risk Level: HIGH

Reasons:
• Registration fee detected
• Application domain does not match company
• Company information is incomplete
```

### Risk Levels

|  Score | Risk Level  |
| -----: | ----------- |
|   0–30 | Low Risk    |
|  31–60 | Medium Risk |
| 61–100 | High Risk   |

The risk score is a decision-support indicator and does not establish that a company or internship is fraudulent.

---

## 3. Student Experience Repository

Students who have completed internships can share their experiences.

Experiences can include:

* Internship role
* Duration
* Stipend
* Work performed
* Whether the promised stipend was received
* Whether a certificate was provided
* Interview experience
* Mentorship
* Overall experience
* Feedback

This allows students searching for an opportunity to compare the advertised internship with the experiences of previous interns.

### Example

```text
Company: XYZ Technologies

Previous Experiences: 18

Stipend Received:
15 / 18

Certificate Received:
17 / 18

Common Feedback:
• Good technical exposure
• Regular mentorship
• Some communication issues
```

---

# Automated Handling of Flagged Listings

The platform does not require a moderator for the core verification process.

Flagged listings can be handled automatically based on their risk level.

```text
                    Internship
                        ↓
               Verification Engine
                        ↓
                  Risk Assessment
                        ↓
          ┌─────────────┼─────────────┐
          ↓             ↓             ↓
       LOW RISK     MEDIUM RISK    HIGH RISK
          ↓             ↓             ↓
       Publish       Warning       Restrict
       Normally      Displayed      Listing
```

### Low Risk

The internship can be displayed normally.

### Medium Risk

The platform can display a warning and highlight the detected concerns.

### High Risk

The platform can restrict or hide the listing and record the detected risk factors.

As additional student reports and experiences become available, the system can reassess the internship's risk profile.

---

# Company Risk Profile

The system can maintain a risk profile based on information associated with a company's internship listings and student experiences.

For example:

```text
Company: ABC Technologies

Listings Analyzed: 12
High-Risk Listings: 2
Student Experiences: 18
Reported Issues: 4

Status: CAUTION
```

A single flagged listing does not automatically mean the entire company is fraudulent.

The system evaluates evidence associated with individual listings and builds a broader company profile from accumulated information.

---

# Users

## Student

The primary user of the platform.

Students can:

* Create an account
* Search internships
* Filter opportunities
* View internship details
* View verification results
* Understand detected risk factors
* Read previous student experiences
* Submit their own internship experiences
* Report suspicious opportunities
* Bookmark internships

## Company / Recruiter

Companies can optionally:

* Create a company profile
* Submit internship opportunities
* Manage their listings
* Update internship information
* View the verification status of their listings

## Automated Verification System

The verification system is not a user.

It automatically:

* Evaluates internship listings
* Runs verification rules
* Calculates risk scores
* Detects suspicious patterns
* Flags high-risk listings
* Updates risk information

---

# Technology Stack

### Frontend

* **Next.js**
* **React**
* **Tailwind CSS**

### Application Logic

* **Next.js**
* Server-side application logic and API functionality

### Verification

* Rule-based verification
* Pattern detection
* Domain and URL validation
* Risk scoring

> **No AI/ML is used in the current version.**

---

# System Workflow

```text
                ┌──────────────────┐
                │ Internship Source│
                └────────┬─────────┘
                         ↓
                ┌──────────────────┐
                │ Internship       │
                │ Listing Service  │
                └────────┬─────────┘
                         ↓
                ┌──────────────────┐
                │ Verification     │
                │ & Risk Service   │
                └────────┬─────────┘
                         ↓
                ┌──────────────────┐
                │ Risk Assessment  │
                └────────┬─────────┘
                         ↓
                ┌──────────────────┐
                │ Student          │
                │ Experiences      │
                └────────┬─────────┘
                         ↓
                ┌──────────────────┐
                │ Decision Support │
                └──────────────────┘
```

---

# Example

Suppose an internship listing contains:

```text
Software Developer Intern
Company: ABC Technologies

Stipend: ₹40,000/month
Registration Fee: ₹2,000

Application:
random-domain.example
```

The verification system evaluates the listing:

```text
Registration Fee           +30
Unrelated Application URL +20
Unrealistic Stipend        +15
Incomplete Information     +10
                           ----
Risk Score                  75
```

The system produces:

```text
HIGH RISK

Potential concerns:
• Registration fee detected
• Application domain appears unrelated
• Compensation appears inconsistent with available information
• Company information is incomplete
```

The student can then review previous experiences and make their own decision.

---

# Project Objectives

The platform aims to:

1. Centralize internship opportunities.
2. Reduce students' exposure to suspicious listings.
3. Provide transparent verification signals.
4. Detect common scam patterns automatically.
5. Preserve and organize student internship experiences.
6. Provide company and internship risk information.
7. Help students make more informed decisions.

---

# Limitations

The system cannot guarantee that an internship is legitimate.

Its assessment depends on the information available to the verification system. A legitimate company may have a suspicious listing, while a fraudulent listing may initially appear legitimate.

Therefore, the platform provides:

```text
Verification Signals
        +
Risk Assessment
        +
Student Experiences
        ↓
Informed Student Decision
```

rather than claiming absolute authenticity.

---

# Future Enhancements

Possible future enhancements include:

* More internship data sources
* Automated listing collection
* Advanced company verification
* Improved duplicate detection
* Internship application tracking
* Notifications
* Browser extension
* Mobile application
* AI/ML-based suspicious listing detection

---

## Summary

The Internship Verification & Experience Platform is designed around three connected services:

```text
Internship Listing
        ↓
Verification & Risk Assessment
        ↓
Student Experiences
        ↓
Decision Support
```

Unlike a conventional internship listing platform, the focus is not only on **finding internships**, but also on helping students understand the **credibility, potential risks, and real-world experiences associated with those opportunities**.
