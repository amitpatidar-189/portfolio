"""Portfolio content. Every fact here comes from Amit's resume (CV/Amit_Patidar_Product_Manager_Resume.pdf).

Edit this file to update the site. Do not add metrics that the resume does not support.
"""

PROFILE = {
    "name": "Amit Patidar",
    "headline": "Building intelligent products at the intersection of business, data and AI.",
    "role": "Project Manager, Product & Digital Transformation",
    "company": "Veracity Supply Chain Ltd.",
    "location": "Gandhinagar, Gujarat, India",
    "email": "amit.patidar189@gmail.com",
    "whatsapp": "919399277189",  # country code + number, digits only (wa.me format)
    "linkedin": "https://www.linkedin.com/in/amit-patidar-080359172/",
    "summary": (
        "MBA (IIM Bodh Gaya) and B.Tech in Mechanical Engineering. I turn operational problems "
        "into use cases, workflows and BRDs, then ship them as B2B products for shift-based "
        "industries: port, warehouse, logistics, manufacturing and FMCG."
    ),
}

GLANCE = [
    ("Now", "Project Manager, Product & Digital Transformation"),
    ("Product", "ShiftEaze, main product owner"),
    ("Domain", "Shift-based workforce and operations technology"),
    ("Education", "MBA, IIM Bodh Gaya"),
]

HERO_STATS = [
    {"value": "84→94%", "label": "Manpower fulfillment"},
    {"value": "100%", "label": "Leave compliance"},
    {"value": "80%+", "label": "Daily app usage"},
    {"value": "0.81", "label": "AUC, absence model"},
]

PILLARS = [
    ("Business understanding", "Discovery workshops with operations, technology and CXOs to find the real constraint."),
    ("Product thinking", "Use cases, user stories, ER diagrams, workflows and BRDs, tracked in Jira through UAT."),
    ("Data and AI", "300,000+ operational data points analysed; an XGBoost model that predicts absenteeism."),
    ("Operational execution", "Phased rollouts on live port operations with 0 crane downtime."),
]

SITES = [
    ("Mundra Port", "Port operations"),
    ("Mundra Wind Turbine Manufacturing", "Manufacturing"),
    ("Mundra Solar", "Solar"),
]

JOURNEY = [
    ("Operational data", "300,000+ operational data points analysed: crane, yard and gate operator moves, plus absenteeism."),
    ("Absence prediction", "An XGBoost classifier scores every operator's absence risk from attendance history, shift-pattern position, leave and festival calendars (0.81 AUC). An approved leave always overrides the model."),
    ("Intelligent rostering", "AI Roster Planner and Auto Rostering turn that signal into rosters. When a gap is flagged, planners get ranked backfill and overtime candidates and approve in one click."),
    ("Measured outcomes", "Manpower fulfillment up from 84% to 94%, 100% leave compliance, 80%+ active app usage, 0 crane downtime."),
]

FEATURES = [
    ("Smart rostering", "Cycle-based DDNNOO auto-rostering: build a rotation once, apply it by terminal, department or batch, in fixed windows or auto-repeat."),
    ("Geofenced attendance", "QR gate-pass and mobile punches are only accepted inside the terminal's geofence. Six capture routes feed one live record."),
    ("AI absence prediction", "Risk flags days before the shift, with ranked overtime backfill candidates a planner can approve in one click."),
    ("Leave management", "Digital requests, live balances, one-tap approvals, and automatic follow-up on whether rejected-leave operators still came to work."),
    ("Performance passbook", "Crane moves, moves-per-hour, attendance and punctuality tied to one portable worker ID that travels across terminals and contractors."),
    ("Live dashboards", "Manpower, shift attendance, leave and helpdesk views with one shared filter bar across terminal, department, batch and timeframe."),
    ("Autonomous AI calling", "Five automated call scenarios in English, Hindi and Gujarati: shift confirmation, punch-in and punch-out reminders, absence priority calls and overtime offers."),
]

TWO_FACES = [
    ("Operator app", ["See roster", "Confirm shift", "QR punch-in", "Punch-out", "Leave & helpdesk"]),
    ("Manager portal", ["Plan roster (AI)", "Live attendance", "Approve leave", "Track moves", "Resolve tickets"]),
]

# Module descriptions come from the ShiftEaze product deck. "Master Modules" is the loosest fit:
# the deck only shows the Shift Master, so confirm that wording.
MODULES = [
    ("AI Roster Planner", "Scores every operator's absence risk from attendance history, shift-pattern position, leave and festival calendars, and suggests ranked backfill or overtime candidates.", ["Enhanced Leave", "Shift Manager"]),
    ("Auto Rostering", "Cycle-based DDNNOO rostering: build a rotation once from the Shift Master and apply it by terminal, department or batch.", ["Master Modules", "Shift Manager"]),
    ("Performance Passbook", "Crane moves, moves-per-hour, attendance and punctuality tied to one portable worker ID. It reads from the live attendance record.", []),
    ("Scheduler & Manpower Dashboards", "Live manpower, shift attendance, leave and helpdesk views, with one shared filter bar across terminal, department, batch and timeframe.", ["Shift Confirmation", "Enhanced Leave", "Helpdesk"]),
    ("Shift Manager", "The planner's calendar: predicted risk, confirmation and final status for every operator, plus a Shift Extender for overtime.", ["Auto Rostering", "AI Roster Planner", "Shift Confirmation"]),
    ("Enhanced Leave", "Digital requests, live balances and one-tap approvals. Every rejected request is followed up, and that outcome feeds back into the AI Roster Planner.", ["AI Roster Planner"]),
    ("Helpdesk", "Operators raise tickets from the app; managers resolve them from the portal.", ["Scheduler & Manpower Dashboards"]),
    ("Shift Confirmation", "Operators confirm or decline their shift in the app before it starts, and planners see the confirmation status live.", ["Shift Manager", "Scheduler & Manpower Dashboards"]),
    ("Master Modules", "The configuration layer, such as the Shift Master that defines shift types for the rostering engine.", ["Auto Rostering"]),
]

COMPARE = [
    ("Rostering", "Spreadsheets, every cycle, every terminal.", "Build a DDNNOO cycle once; apply it by terminal, department or batch."),
    ("Attendance", "No view of who is actually on site.", "Geofenced QR and mobile punches update a live dashboard."),
    ("Absences", "Gaps surface only at shift start.", "Risk flagged days ahead, with ranked backfill candidates."),
    ("Leave", "Calls and paper, no record.", "Digital requests, live balances, one-tap approvals."),
    ("Worker record", "History resets with every employer.", "A portable record of moves, attendance and punctuality."),
]

SHIFTEAZE = {
    "title": "ShiftEaze",
    "tagline": "An industry-agnostic platform for shift-based manpower.",
    "context": (
        "Shift-based operations such as ports run on rosters. Absenteeism and manual planning "
        "directly affect whether every crane and yard machine is manned."
    ),
    "role": (
        "Own the end-to-end product lifecycle: use cases, user stories, BRDs, workflows, UI "
        "mockups and UAT plans, tracked in Jira."
    ),
    "modules": [
        "AI Roster Planner", "Auto Rostering", "Performance Passbook",
        "Scheduler & Manpower Dashboards", "Shift Manager", "Enhanced Leave",
        "Helpdesk", "Shift Confirmation", "Master Modules",
    ],
    "flow": [
        ("Operational data", "300,000+ data points analysed"),
        ("Absence model", "XGBoost classifier, 0.81 AUC"),
        ("Roster planning", "AI Roster Planner + Auto Rostering"),
        ("Shift operations", "Shift Manager, Confirmation, Leave"),
    ],
    "outcomes": [
        ("84% → 94%", "manpower fulfillment after implementation"),
        ("100%", "leave compliance through the portal"),
        ("80%+", "active app usage, with daily interaction"),
        ("0", "crane downtime during rollout on live port operations"),
        ("4.6×", "higher absence on rejected-leave days (24.8% vs a 5.3% baseline), the pattern the model is tuned to catch"),
    ],
    "problems": [
        "Manual rostering on spreadsheets, every cycle, every terminal.",
        "No live view of who is actually on site; absences surface only at shift start.",
        "Leave run on calls and paper, with no record.",
        "Workers' track records reset with every new employer.",
    ],
    "scale": "Deployed for 1,000+ operators across Mundra Port, Mundra Wind Turbine Manufacturing and Mundra Solar; expanding to 8+ terminals/sites and 7,000+ operators.",
    "approach": [
        "Prioritised features and phased rollouts by operational criticality and business impact.",
        "Ran stakeholder workshops, development sign-off, UAT validation and on-ground rollout.",
        "Drove adoption through demos and user training; wrote pitch decks and feature books for CXOs.",
    ],
}

# Case studies are written from Amit's own project descriptions. Both are product design and
# architecture work (requirements, data models, logic); do not describe them as shipped or live.
# A section is (heading, text) or (heading, [bullets]).
CASE_STUDIES = [
    {
        "title": "CAT Personalized Diagnostic & Practice Platform",
        "tagline": "Product strategy · Adaptive learning · Data analytics",
        "tags": ["Quant", "DILR", "200-question bank", "Topic-mastery model", "Recommendation logic"],
        "sections": [
            ("Problem", "Traditional mock tests provide scores but limited insight into topic-level weaknesses."),
            ("Solution", "A lightweight, adaptive diagnostic and targeted-practice platform for Quant and DILR, built on a curated bank of 200 questions. It finds strengths, weaknesses and learning gaps without lengthy mock tests."),
            ("My approach", [
                "Diagnosis from repeated attempts, not single questions.",
                "Analysis across accuracy, speed, confidence, consistency, difficulty handling and recurring error patterns.",
                "Error classification: conceptual gaps, calculation mistakes, misinterpretation, inefficient approaches, time management and close attempts.",
                "A practice engine that prioritises topics by weakness, strength of evidence and room to improve.",
                "A feedback loop of difficulty adjustment, mistake tracking, spaced retesting and progress monitoring.",
                "DILR-specific signals: set-selection efficiency, data interpretation, logical structuring and time allocation.",
            ]),
            ("Key differentiator", "Evidence-based mastery assessment combined with personalised, actionable recommendations that stay explainable."),
            ("What I defined", "Product requirements, question taxonomy, metadata schema, attempt tracking, the topic-mastery model, recommendation logic, the reporting framework and core data entities."),
            ("Outcome", "A blueprint for turning a conventional practice site into a learning-intelligence system that shows not only what a learner gets wrong, but why, what to practise next, and whether they are really improving."),
        ],
    },
    {
        "title": "KrishiSaarthi",
        "tagline": "AI-driven farm and livestock intelligence platform",
        "tags": ["PostgreSQL", "GIS", "Predictive analytics", "Machine learning", "IoT", "Decision support", "Financial modelling"],
        "sections": [
            ("Scope", "A comprehensive farm-management solution that I architected, covering crop lifecycle, plots, soil, water, weather, plant health and livestock in one platform."),
            ("Operations modules", [
                "Crop lifecycle tracking",
                "GIS-based plot mapping",
                "Soil analytics",
                "Irrigation optimisation",
                "Weather intelligence",
                "Pest and disease detection",
                "Livestock operations",
            ]),
            ("AI/ML use cases", [
                "Crop recommendation",
                "Mandi price forecasting",
                "Yield estimation",
                "Risk-adjusted profitability analysis",
            ]),
            ("Requirements I designed", [
                "IoT sensor integration",
                "Satellite NDVI monitoring",
                "Resource optimisation",
                "Predictive maintenance",
                "Financial performance dashboards",
            ]),
            ("Data architecture", "A PostgreSQL-based data architecture, written up through BRD engineering, to support data-driven decisions and scalable farm operations."),
        ],
    },
]

OTHER_PROJECTS = [
    {
        "title": "Driver Management System",
        "meta": "Aug'25 – Mar'26 · Veracity",
        "body": "Led the product for 1,500+ drivers: business requirements, documentation, stakeholder communication across Ops, Tech and Management, UAT and rollout planning, tracked in Jira.",
    },
    {
        "title": "Fuel Management System",
        "meta": "Aug'25 – Mar'26 · Veracity",
        "body": "Ran requirement discovery workshops for a fleet of 2,000 trucks, documented needs in structured BRDs and supported data-driven vendor selection.",
    },
    {
        "title": "Property Tokenization / LLP Listing Platform",
        "meta": "In development",
        "body": "Product design for a platform where investors take part in property assets held via an LLP, with invested amount mapped to proportional ownership in asset-holding tranches.",
    },
    {
        "title": "Custom SaaS Platform for a Business Unit",
        "meta": "In development",
        "body": "A SaaS-based custom solution to optimise an entire business unit's operations, with algorithmic workflows and ML-based recommendation capabilities, delivered in phases.",
    },
    {
        "title": "AI Facial Recognition System",
        "meta": "Project",
        "body": "An AI facial recognition system.",
    },
    {
        "title": "AI Calling Project",
        "meta": "In development",
        "body": "Building our own AI calling product.",
    },
    {
        "title": "Visual Analytics Project",
        "meta": "Upcoming",
        "body": "A visual analytics product, planned next.",
    },
]

EXPERIENCE = [
    {
        "role": "Project Manager (Product & Digital Transformation)",
        "company": "Veracity Supply Chain Ltd.",
        "period": "Apr'26 – Present",
        "points": [
            "Main product owner of ShiftEaze; designed 9 modules for 1,000+ operators across Mundra Port, Mundra Wind Turbine Manufacturing and Mundra Solar.",
            "Driving expansion to 8+ terminals/sites and 7,000+ operators.",
            "Raised manpower fulfillment from 84% to 94% with 100% leave compliance and 0 crane downtime.",
        ],
    },
    {
        "role": "Project Management (Live Project)",
        "company": "Veracity Supply Chain Ltd.",
        "period": "Aug'25 – Mar'26",
        "points": [
            "Fuel Management System discovery for a 2,000-truck fleet.",
            "Driver Management System for 1,500+ drivers, from requirements to UAT and rollout planning.",
        ],
    },
    {
        "role": "Operations Management Intern, Port Operations (Tech Implementation Project)",
        "company": "Veracity Supply Chain Ltd.",
        "period": "Apr'25 – Jul'25",
        "points": [
            "Led rostering software implementation at Mundra Port for 1,000+ manpower, with 0 crane downtime.",
            "Analysed 300,000+ QC, RTG, RMG, RST and Gate operator moves using Power BI and Advanced Excel.",
            "Presented roadmaps to CXOs (CEO, COO, ED) and onboarded 1,000+ operators.",
        ],
    },
]

CAPABILITIES = [
    {"name": "Product", "items": ["Product discovery", "Use cases & user stories", "BRD & functional requirements", "Workflow design & ER diagrams", "UI mockups", "Feature prioritisation", "Phased release planning", "UAT & rollout"]},
    {"name": "Data & AI", "items": ["Python & XGBoost (classification)", "SQL", "Power BI", "Tableau", "Advanced Excel", "ML-based recommendation features", "Algorithmic product logic"]},
    {"name": "Domains", "items": ["B2B SaaS", "Workforce management", "Supply chain & port operations", "Fintech / investment platforms", "Digital transformation"]},
    {"name": "Leadership", "items": ["Stakeholder management", "Change management", "CXO communication", "Jira-tracked delivery"]},
]

EDUCATION = [
    {"title": "MBA", "org": "Indian Institute of Management, Bodh Gaya", "year": "2026", "detail": "86.92%"},
    {"title": "B.Tech, Mechanical Engineering", "org": "UIT RGPV, Bhopal", "year": "2024", "detail": "76.70%"},
]

CREDENTIALS = [
    "Lean Six Sigma Green Belt, Grant Thornton accredited (2024)",
    "Circular Economy in Industry, UNIDO (2026)",
    "Hostel & Mess Committee, IIM Bodh Gaya (2024): resolved 500+ student and staff issues",
]
