/* Afterbell listings for the 2026–27 season.
 *
 * Rules for this file (enforced by scripts/check-data.js):
 * - Every fact needs a receipt in data/receipts.json: the organizer's exact sentence and link.
 * - Team sizes live only in team:{min,max}. Write {team} in any sentence that needs the size.
 * - Ask messages use tokens instead of typed dates: {deadline}, {opens}, {team}, {link}, {name}.
 *   Asks to a teacher or parent need an email subject.
 *   [Square brackets] mark blanks the student fills in.
 * - "by" dates on steps are our advice; steps marked official:true must match a listed deadline.
 * - who: you | teacher | advisor | parent | friends | school | org
 *
 * Loads in the browser (window.OB_DATA) and in Node (require), so the page, the checks and the
 * calendar feed all read the same data.
 */
(function (root, factory) {
  var data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.OB_DATA = data;
})(typeof self !== "undefined" ? self : this, function () {
  return {
    CHECKED: "2026-11-20",
    SEASON: "2026–27",
    TYPES: [
      ["pitch", "Pitch & startup"], ["deca", "DECA"], ["case", "Case competitions"],
      ["invest", "Investing"], ["math", "Math contest"], ["summer", "Programs"], ["venture", "Company program"]
    ],
    TYPE_LABEL: {
      pitch: "Pitch & startup competition", deca: "Business competition circuit", "case": "Case competition",
      invest: "Investing competition", math: "Math contest", summer: "Summer program", venture: "Company program"
    },
    LISTINGS: [
      {
        id: "shad", tk: "SHAD", short: "Shad", name: "Shad 2027", org: "Shad Canada", type: "summer",
        grades: [10, 11], lastGrade: 11, gradeNote: "Open to students currently in Grade 10 or 11",
        free: false,
        cost: "Free to apply. 2027 program fee: $7,875 live-in or $3,975 virtual. If you get an offer, a $750 deposit secures your spot.",
        costShort: "Free to apply · $7,875 live-in or $3,975 virtual if accepted",
        aid: "Need-based fee assistance, up to the full cost",
        format: "Month-long program on a university campus, or virtual", where: "Campuses across Canada, or online",
        entry: "Apply yourself online: a profile, written answers, your latest report card and a reference",
        window: { from: "2026-09-15", to: "2027-01-06" }, boardWhat: "Final deadline",
        can: [
          { k: "ok", t: "Free to apply", s: "If accepted: $7,875 live-in or $3,975 virtual, with need-based aid up to the full cost" },
          { k: "warn", t: "You need a teacher reference", s: "and your latest report card. Shad's advice is to ask your teacher early." }
        ],
        steps: [
          { id: "reference", by: "2026-11-27", t: "Ask a teacher to be your reference", who: "teacher", ask: "reference" },
          { id: "open", by: "2026-12-04", t: "Open the free application and read every question", who: "you", href: "https://www.shad.ca/apply" },
          { id: "draft", by: "2026-12-18", t: "Finish a full draft of your application", who: "you", note: "Write about something you actually built, organized or fixed. Specific beats impressive." },
          { id: "submit", by: "2027-01-06", t: "Submit by 11:59 pm ET", who: "you", official: true }
        ],
        asks: {
          reference: {
            to: "teacher", title: "Ask for a reference", subject: "Reference for my Shad 2027 application",
            hint: "Ask in person first if you can, then send this so they have the details in writing. Shad's own advice is to ask early.",
            msg: "Hi [Mr./Ms. ______],\n\nI'm applying to Shad 2027, and the application asks for a reference. Would you be willing to be my reference?\n\nApplications close {deadline}, so I wanted to ask you early.\n\nThank you,\n[Your name]\n\nAbout Shad: {link}"
          }
        },
        dates: [
          { d: "2026-11-08", k: "deadline", t: "Early application deadline" },
          { d: "2027-01-06", k: "deadline", t: "Final application deadline, 11:59 pm ET" },
          { d: "2027-02", k: "result", t: "Admission results, first week of February" },
          { d: "2027-07-04", k: "event", t: "Program runs July 4–30 (live-in) or July 5–30 (virtual)" }
        ],
        why: "One of Canada's best-known pre-university programs, and a real story for your applications.",
        parent: [
          { t: "Plan for the deposit", s: "If your teen gets an offer, a $750 deposit secures the spot. Need-based aid can cover up to the full cost." },
          { t: "Help with the reference", s: "The application needs a teacher reference and the latest report card." }
        ],
        src: { url: "https://www.shad.ca/faqs/", name: "shad.ca", kind: "organizer" }
      },
      {
        id: "diamond", tk: "DMND", short: "Diamond", name: "Diamond Challenge 2027", org: "Horn Entrepreneurship, University of Delaware", type: "pitch",
        grades: [9, 10, 11, 12], gradeNote: "Ages 14–18 on the submission deadline",
        free: false,
        cost: "No entry fee is listed in the official rules. Confirm with the organizer.", costShort: "No entry fee listed",
        format: "A written concept and short video first, then live or virtual pitch rounds. Finals in Delaware.", where: "Open worldwide",
        team: { min: 2, max: 4, extra: "plus one adult advisor aged 21 or older" },
        window: { from: "2026-09-16", to: "2027-01-14" }, boardWhat: "Submission due",
        can: [
          { k: "warn", t: "You need a team", s: "{team}. You can't enter alone." },
          { k: "warn", t: "You need an adult advisor", s: "Any adult aged 21 or older, listed with contact details on your submission" },
          { k: "ok", t: "No entry fee listed", s: "in the official rules" }
        ],
        steps: [
          { id: "team", by: "2026-11-30", t: "Form your team", who: "friends", ask: "team" },
          { id: "advisor", by: "2026-11-30", t: "Ask an adult aged 21 or older to be your advisor", who: "parent", ask: "advisor" },
          { id: "problem", by: "2026-12-11", t: "Pick your problem and talk to at least five people who have it", who: "you", note: "Judges reward evidence that people want it more than a polished deck." },
          { id: "write", by: "2027-01-08", t: "Write the 3–5 page concept and record the intro video", who: "you" },
          { id: "submit", by: "2027-01-14", t: "Submit by 5:00 pm ET", who: "you", official: true, href: "https://diamondchallenge.org/competition/" }
        ],
        asks: {
          team: {
            to: "friends", title: "Invite your team",
            hint: "Send it to your group chat. Each student can only be on one team.",
            msg: "Want to do the Diamond Challenge with me? It's a pitch competition for high school students aged 14–18. Teams are {team}, plus an adult advisor. Submissions are due {deadline}.\n\nDetails: {link}"
          },
          advisor: {
            to: "parent", title: "Ask an adult to be your advisor", subject: "Can you be our Diamond Challenge advisor?",
            hint: "The advisor must be 21 or older. Their contact details go on your submission.",
            msg: "Hi [Mom/Dad/______],\n\nI'm entering the Diamond Challenge with a team, and every team needs an adult advisor aged 21 or older, listed with contact details on our submission. Would you be our advisor?\n\nOur submission is due {deadline}.\n\nDetails: {link}"
          }
        },
        dates: [
          { d: "2027-01-14", k: "deadline", t: "Submission deadline, 5:00 pm ET" },
          { d: "2027-02-10", k: "result", t: "Advancing teams notified" },
          { d: "2027-03-09", k: "result", t: "Finalists announced" },
          { d: "2027-04-29", k: "event", t: "Limitless World Summit in Delaware, Apr 29–30" }
        ],
        why: "A global pitch competition with more than $100,000 in awards. Building a real venture idea with a team shows genuine business interest.",
        parent: [
          { t: "Be the team's adult advisor", s: "Each team needs one adult aged 21 or older, listed with contact details on the submission." }
        ],
        src: { url: "https://diamondchallenge.org/competition/", name: "diamondchallenge.org", kind: "organizer" }
      },
      {
        id: "deca", tk: "DECA", short: "DECA", name: "DECA Ontario", org: "Ontario DECA", type: "deca",
        grades: [9, 10, 11], gradeNote: "For next season (2027–28). Current members: your chapter advisor handles this season.",
        free: false,
        cost: "$35 USD membership and regionals fee, paid to your chapter advisor. Provincials qualifiers also pay for a required hotel stay.",
        costShort: "$35 USD membership, plus a hotel stay for Provincials",
        format: "An online test plus a case presentation at a November regional. Top scorers in each event qualify for Provincials.",
        where: "Regionals across Ontario (one is virtual), then Provincials in Toronto",
        entry: "Join your school's DECA chapter. Your chapter advisor approves you and assigns your event.",
        next: { d: "2027-09", label: "Join your school's chapter in September 2027", closed: true, est: true }, statusLabel: "Closed to new members",
        can: [
          { k: "no", t: "Not this season", s: "Membership and events locked on October 15, and regionals run in November." },
          { k: "warn", t: "Only through your school's chapter", s: "Your chapter advisor approves you and decides which of your top 3 events you get." },
          { k: "warn", t: "Provincials isn't open entry", s: "You qualify by placing in your event at a November regional." }
        ],
        steps: [
          { id: "chapter", by: "2027-01-29", t: "Ask a business teacher if your school has a DECA chapter", who: "teacher", ask: "chapter" },
          { id: "register-chapter", by: "2027-09", t: "A teacher registers the chapter with Ontario DECA (every year)", who: "teacher", est: true },
          { id: "join", by: "2027-09-24", t: "Register and list your top 3 events", who: "you", est: true },
          { id: "assigned", by: "2027-10-15", t: "Your advisor approves you and assigns one event", who: "advisor", est: true },
          { id: "regionals", by: "2027-11", t: "Regionals: an online test and a case presentation", who: "org", est: true }
        ],
        asks: {
          chapter: {
            to: "teacher", title: "Ask about a DECA chapter", subject: "DECA at our school",
            hint: "If your school has no chapter, a teacher has to register one with Ontario DECA before students can join.",
            msg: "Hi [Mr./Ms. ______],\n\nDoes our school have a DECA chapter? I'd like to join next year. If we don't have one, would you consider starting one? A teacher registers the chapter with Ontario DECA each year.\n\nThank you,\n[Your name]\n\nAbout DECA: {link}"
          }
        },
        dates: [
          { d: "2026-10-15", k: "deadline", t: "2026–27 membership and event assignments locked" },
          { d: "2026-11-02", k: "event", t: "Regional online tests, November 2, 3 or 5" },
          { d: "2026-11-08", k: "event", t: "Six regional competitions, November 8 to 22" },
          { d: "2026-12-07", k: "event", t: "Provincials registration opens for qualifiers' chapters" },
          { d: "2026-12-18", k: "deadline", t: "Provincials payment due (handled by advisors)" },
          { d: "2027-01-07", k: "deadline", t: "Written papers due (written-event qualifiers only)" },
          { d: "2027-02-04", k: "event", t: "Provincials in Toronto, Feb 4–6" },
          { d: "2027-10", k: "deadline", t: "2027–28 membership locks, based on 2026 (October 15)", est: true }
        ],
        why: "Ontario DECA is the largest DECA association in the world, with about 5,500 students at Provincials. Placing there, or qualifying for internationals, is easy for admissions readers to recognize.",
        parent: [
          { t: "Budget for membership and Provincials", s: "Membership is $35 USD. Students who qualify for Provincials in Toronto also pay for a required hotel stay." },
          { t: "Ask about your school's chapter rules", s: "Each school sets its own commitment rules and chapter size limits." }
        ],
        src: { url: "https://deca.ca/v2/join/", name: "deca.ca", kind: "organizer" }
      },
      {
        id: "blueocean", tk: "BLUE", short: "Blue Ocean", name: "Blue Ocean Student Entrepreneur Competition 2027", org: "Blue Ocean Student Entrepreneurs", type: "pitch",
        grades: [9, 10, 11, 12], gradeNote: "Any high school student",
        free: true, cost: "Free, including the mini-course", costShort: "Free",
        format: "Online. A 5-minute video pitch.", where: "Open worldwide",
        team: { min: 1, max: 5 },
        window: { to: "2027-02-21" }, boardWhat: "Pitch video due",
        can: [
          { k: "ok", t: "Free and fully online", s: "Registering, the mini-course and submitting all cost nothing" },
          { k: "ok", t: "Enter alone or with friends", s: "Teams can be {team}" },
          { k: "warn", t: "Register first to get the mini-course", s: "The competition is built around it, and there are no late entries." }
        ],
        steps: [
          { id: "register", by: "2026-12-04", t: "Register to unlock the free mini-course", who: "you", href: "https://blueoceancompetition.org/compete/" },
          { id: "team", by: "2026-12-11", t: "Decide: enter alone, or invite friends", who: "friends", ask: "team" },
          { id: "course", by: "2027-01-08", t: "Finish the free mini-course", who: "you" },
          { id: "record", by: "2027-02-12", t: "Script and record your 5-minute pitch", who: "you", note: "Use their pitch template. Judges score your idea against the blue ocean method." },
          { id: "submit", by: "2027-02-21", t: "Upload to YouTube and submit by midnight your time", who: "you", official: true }
        ],
        asks: {
          team: {
            to: "friends", title: "Invite friends to your team",
            hint: "This is optional. You can enter alone.",
            msg: "Want to enter the Blue Ocean Student Entrepreneur Competition with me? It's free and online: a 5-minute video pitch for a new business idea. Teams can be {team}. The deadline is {deadline}.\n\nDetails: {link}"
          }
        },
        dates: [
          { d: "2027-02-21", k: "deadline", t: "Pitch submission deadline, midnight your time" },
          { d: "2027-04-05", k: "result", t: "Top 500 and Top 100 announced" },
          { d: "2027-04-22", k: "result", t: "Top 30 announced" },
          { d: "2027-05-04", k: "result", t: "Top 10 announced" },
          { d: "2027-05-13", k: "result", t: "Winners announced. First place wins $1,000." }
        ],
        why: "Free, online and open to any high school student. A good first pitch competition, because all you need is an idea and a video.",
        parent: [
          { t: "No cost", s: "Registering, the mini-course and submitting are all free." }
        ],
        src: { url: "https://blueoceancompetition.org/compete/", name: "blueoceancompetition.org", kind: "organizer" }
      },
      {
        id: "euclid", tk: "EUCL", short: "Euclid", name: "Euclid Mathematics Contest", org: "CEMC, University of Waterloo", type: "math",
        grades: [9, 10, 11, 12], gradeNote: "Written for students in their final year, but younger students are welcome",
        free: false, cost: "$18 per student", costShort: "$18 per student",
        format: "Written contest at your school", where: "Your school, or another local school that lets you join",
        entry: "Your school orders the contest for you. Students can't register on their own.",
        window: { to: "2027-03-11" }, boardWhat: "School sign-up",
        can: [
          { k: "warn", t: "Your school has to register you", s: "Students can't sign up on their own. If your school doesn't take part, another local school can host you." },
          { k: "warn", t: "New schools need time", s: "A school's first CEMC account can take up to three weeks to approve." },
          { k: "ok", t: "$18 per student", s: "Ask whether your school covers it" }
        ],
        steps: [
          { id: "ask", by: "2027-02-12", t: "Ask your math teacher to register you", who: "teacher", ask: "register" },
          { id: "order", by: "2027-03-11", t: "Your school orders the contest", who: "school", official: true },
          { id: "practise", by: "2027-03-26", t: "Practise with past Euclid papers on the CEMC site", who: "you", href: "https://cemc.uwaterloo.ca/contests/euclid" },
          { id: "write", by: "2027-04-06", t: "Write the contest at school", who: "you" }
        ],
        asks: {
          register: {
            to: "teacher", title: "Ask to write the Euclid", subject: "Writing the Euclid Mathematics Contest",
            hint: "Ask your math teacher or head of math. If your school has never ordered CEMC contests, setting up an account can take up to three weeks.",
            msg: "Hi [Mr./Ms. ______],\n\nI'd like to write the Euclid Mathematics Contest this year. Could you register me? Schools have to order it by {deadline}.\n\nThank you,\n[Your name]\n\nDetails: {link}"
          }
        },
        dates: [
          { d: "2027-03-11", k: "deadline", t: "Ordering deadline for schools" },
          { d: "2027-04-06", k: "event", t: "Contest day in North America" }
        ],
        why: "Over 25,000 students write it each year. It isn't required for admission to Waterloo's Faculty of Math, but writing it (or the CSMC) is required for some scholarship decisions.",
        parent: [
          { t: "A small fee", s: "$18 per student, ordered through the school." }
        ],
        src: { url: "https://cemc.uwaterloo.ca/contests/how-contests-work", name: "cemc.uwaterloo.ca", kind: "organizer" }
      },
      {
        id: "ihscc", tk: "IVEY", short: "Ivey Case", name: "Ivey High School Case Competition", org: "Ivey Business School, Western University", type: "case",
        grades: [10, 11, 12], gradeNote: "High school students in Grades 10 to 12. No experience required.",
        free: false, cost: "2027 fee not posted yet", costShort: "2027 fee not posted yet",
        format: "One-day, in-person case competition", where: "London, ON (May 1). Also Montreal, Calgary and Vancouver.",
        entry: "Apply on your own. Ivey places you on a team with students from other schools.",
        next: { d: "2026-12", label: "Applications open soon", est: true },
        can: [
          { k: "ok", t: "No team needed", s: "You apply on your own and work with students from other schools" },
          { k: "warn", t: "Applications aren't open yet", s: "Ivey's page has a sign-up to hear first" }
        ],
        steps: [
          { id: "alert", by: "2026-11-30", t: "Sign up on Ivey's page to hear when applications open", who: "you", href: "https://www.ivey.uwo.ca/high-school-case-competitions/" },
          { id: "apply", by: "2026-12", t: "Apply as soon as applications open", who: "you", est: true },
          { id: "practise", by: "2027-03-31", t: "Practise one full case in three hours", who: "you", est: true, note: "A good answer has one recommendation, three reasons, a plan and the main risks." }
        ],
        asks: {},
        dates: [
          { d: "2026-12", k: "opens", t: "Applications expected to open", est: true },
          { d: "2027-04-10", k: "event", t: "Montreal, Selwyn House School" },
          { d: "2027-04-24", k: "event", t: "Calgary and Vancouver" },
          { d: "2027-05-01", k: "event", t: "London, Ontario, at Ivey Business School" }
        ],
        why: "Run by Ivey, so it's a direct preview of the case method Ivey teaches, and real material for an Ivey AEO application.",
        parent: [
          { t: "Plan the trip", s: "Competitions run on Saturdays in London (May 1), Montreal, Calgary and Vancouver." }
        ],
        src: { url: "https://www.ivey.uwo.ca/high-school-case-competitions/", name: "ivey.uwo.ca", kind: "organizer" }
      },
      {
        id: "boardroom", tk: "BRDM", short: "Boardroom", name: "The Boardroom", org: "Rotman Commerce, University of Toronto", type: "case",
        grades: [9, 10, 11], lastGrade: 11, gradeNote: "Current Grade 9–11 students who are Canadian citizens or permanent residents",
        free: false, cost: "Not listed", costShort: "Not listed",
        format: "Online first round in spring, then in-person rounds in the fall", where: "Online, then University of Toronto (virtual for teams outside the GTA)",
        team: { min: 3, max: 4, extra: "from the same or different schools, or register alone as a free agent" },
        next: { d: "2027-04", label: "Registration opens in April 2027" },
        can: [
          { k: "warn", t: "Canadian citizens and permanent residents", s: "That's in the 2026 rules. Rotman's web page only mentions citizens, so confirm if you're a permanent resident." },
          { k: "ok", t: "No team? Go as a free agent", s: "Rotman places free agents on a team from their region" },
          { k: "warn", t: "Everyone registers themselves", s: "Each team member registers with exactly the same team name" }
        ],
        steps: [
          { id: "outreach", by: "2026-12-04", t: "Fill in Rotman's Junior Outreach form to hear when registration opens", who: "you", href: "https://rotmancommerce.utoronto.ca/future-students/?p=2006" },
          { id: "team", by: "2027-03-31", t: "Form your team, or plan to go as a free agent", who: "friends", ask: "team", est: true },
          { id: "register", by: "2027-04-27", t: "Every member registers with the same team name", who: "you", est: true },
          { id: "case", by: "2027-06-01", t: "Write your Round 1 case proposal (about 30 days)", who: "you", est: true }
        ],
        asks: {
          team: {
            to: "friends", title: "Invite your team",
            hint: "Teammates can be from other schools.",
            msg: "Want to do The Boardroom case competition from Rotman Commerce with me? Teams are {team}, and registration opens in {opens}. Each person on the winning team gets a $2,500 Rotman Commerce scholarship if they go to Rotman.\n\nDetails: {link}"
          }
        },
        dates: [
          { d: "2027-04", k: "opens", t: "Registration opens" },
          { d: "2027-04-27", k: "deadline", t: "Registration closes, based on 2026", est: true },
          { d: "2027-05-01", k: "event", t: "Case released, based on 2026", est: true },
          { d: "2027-06-01", k: "deadline", t: "Round 1 proposal due, based on 2026", est: true },
          { d: "2027-06-19", k: "result", t: "Top 12 teams announced, based on 2026", est: true },
          { d: "2027-09", show: "Sep 2027", k: "event", t: "Round 2 and finals at U of T, based on 2026 (Sep 19)", est: true }
        ],
        why: "Each member of the winning team gets a $2,500 Rotman Commerce scholarship, if they're admitted to and enrol in Rotman Commerce. Every finalist gets a $100 gift card.",
        parent: [
          { t: "A scholarship, with a condition", s: "Each winning team member gets a $2,500 Rotman Commerce scholarship, paid only if they're admitted and enrol." }
        ],
        src: { url: "https://rotmancommerce.utoronto.ca/future-students/?p=2006", name: "rotmancommerce.utoronto.ca", kind: "organizer" }
      },
      {
        id: "wharton", tk: "WHRT", short: "Wharton", name: "Wharton Global High School Investment Competition", org: "Wharton Global Youth Program, University of Pennsylvania", type: "invest",
        grades: [9, 10, 11], gradeNote: "This year's Grade 9–11 students can enter next season (2027–28)",
        free: true, cost: "Free. Finalists pay their own travel, or join the finale by video.", costShort: "Free",
        format: "Online portfolio simulation, with a finale in Philadelphia", where: "Open worldwide",
        team: { min: 4, max: 6, extra: "all from the same school, registered by a teacher advisor" },
        next: { d: "2027-08", label: "Next round expected ~Aug 2027", closed: true, est: true },
        can: [
          { k: "warn", t: "A teacher has to be your advisor", s: "The advisor registers the team. Students can't register themselves." },
          { k: "warn", t: "Everyone from the same school", s: "Teams are {team}. Wharton says there are no exceptions." },
          { k: "ok", t: "Free", s: "Finalists pay their own travel, or join the finale by video" }
        ],
        steps: [
          { id: "advisor", by: "2027-05-28", t: "Ask a teacher to be your advisor before school ends", who: "teacher", ask: "advisor", est: true },
          { id: "team", by: "2027-06-18", t: "Form your team", who: "friends", ask: "team", est: true },
          { id: "register", by: "2027-08-10", t: "Your advisor registers the team when registration opens", who: "advisor", est: true }
        ],
        asks: {
          advisor: {
            to: "teacher", title: "Ask a teacher to be your advisor", subject: "Advisor for the Wharton investment competition",
            hint: "Advisors must teach at your school, and they can't be paid.",
            msg: "Hi [Mr./Ms. ______],\n\nWould you be the teacher advisor for a team from our school in the Wharton Global High School Investment Competition next year? It's free. Teams are {team}, and the advisor registers the team. Based on this year, registration runs from mid-August to mid-September.\n\nThank you,\n[Your name]\n\nDetails: {link}"
          },
          team: {
            to: "friends", title: "Invite your team",
            hint: "Everyone has to be from your school.",
            msg: "Want to form a team for the Wharton Global High School Investment Competition next year? It's free. Teams are {team}, all from our school, with a teacher advisor.\n\nDetails: {link}"
          }
        },
        dates: [
          { d: "2026-09-11", k: "deadline", t: "2026–27 registration closed" },
          { d: "2027-04-29", k: "event", t: "This season's Global Finale, Apr 29–30" },
          { d: "2027-08", k: "opens", t: "2027–28 registration, based on 2026 (Aug 10 to Sep 11)", est: true }
        ],
        why: "A free global competition from Wharton. Your team manages a virtual portfolio for a real client case and defends its strategy.",
        parent: [
          { t: "Free, unless they reach the finale", s: "The finale is in Philadelphia. Finalists pay their own travel or join by video." }
        ],
        src: { url: "https://globalyouth.wharton.upenn.edu/competitions/investment-competition/faq/", name: "globalyouth.wharton.upenn.edu", kind: "organizer" }
      },
      {
        id: "slp", tk: "SLP", short: "Ivey SLP", name: "Ivey Summer Leadership Program", org: "Ivey Business School, Western University", type: "summer",
        grades: [9, 10, 11], lastGrade: 11, gradeNote: "Open to students currently in Grade 9, 10 or 11",
        free: false, cost: "2027 fee not posted yet", costShort: "2027 fee not posted yet",
        format: "Five-day residential program: case classes, workshops and a capstone project", where: "Ivey Business School, Western University, London, ON",
        entry: "Individual application",
        next: { d: "2027-03", label: "2027 applications open soon", est: true },
        can: [
          { k: "warn", t: "Competitive", s: "About 1,100 students applied for 150 spots in 2026" },
          { k: "warn", t: "2027 details aren't posted yet", s: "Ivey says it's working on the next version of the program" },
          { k: "ok", t: "You stay on campus", s: "Students live in Western residence, with meals and evening activities included" }
        ],
        steps: [
          { id: "alert", by: "2026-12-04", t: "Join Ivey's email list to hear when applications open", who: "you", href: "https://www.ivey.uwo.ca/summerleadership/" },
          { id: "apply", by: "2027-04", t: "Apply as soon as applications open", who: "you", est: true }
        ],
        asks: {},
        dates: [
          { d: "2027-03", k: "opens", t: "2027 applications expected to open", est: true },
          { d: "2027-08", k: "event", t: "Program week, based on 2026 (August)", est: true }
        ],
        why: "Five days inside Ivey with case classes, workshops and a capstone pitch. You get a feel for the HBA program before you apply.",
        parent: [
          { t: "A week away", s: "Students live in Western University residence, with meals and evening activities included." }
        ],
        src: { url: "https://www.ivey.uwo.ca/summerleadership/", name: "ivey.uwo.ca", kind: "organizer" }
      },
      {
        id: "ja", tk: "JA", short: "JA Company", name: "JA Company Program", org: "Junior Achievement (JA Central Ontario, JA South Western Ontario and other regions)", type: "venture",
        grades: [9, 10, 11], gradeNote: "Open to Grades 9–12, so this year's Grade 9–11 students can join next year",
        free: true, cost: "Free. Each student buys a $5–$30 share in their team's company, and JA helps anyone who can't.", costShort: "Free, plus a $5–$30 share",
        format: "After school, 18 weekly meetings from November to April (about 3 hours a week)", where: "In person across Ontario, with some virtual groups",
        team: { min: 10, max: 25, assigned: true },
        next: { d: "2027-09", label: "2027–28 registration expected ~fall 2027", closed: true, est: true },
        can: [
          { k: "warn", t: "You sign up yourself, online", s: "Not through school. Spots are first come, first served." },
          { k: "warn", t: "Central Ontario's 2026–27 registration is closed", s: "JA South Western Ontario's page says its registration is open" },
          { k: "ok", t: "Free", s: "Each student buys a $5–$30 share in their team's company" }
        ],
        steps: [
          { id: "alert", by: "2026-12-04", t: "Fill in JA Central Ontario's form to hear when 2027–28 registration opens", who: "you", href: "https://www.jacentralontario.org/company-program/notifications/" },
          { id: "register", by: "2027-09-15", t: "Register online as soon as registration opens", who: "you", est: true }
        ],
        asks: {},
        dates: [
          { d: "2026-11", k: "event", t: "2026–27 program started (runs November to April)" },
          { d: "2027-09", k: "opens", t: "2027–28 registration expected to open", est: true }
        ],
        why: "You and other students run a real company for a school year: raise money, make a product, sell it and report results. Real numbers make strong application material.",
        parent: [
          { t: "Register on day one", s: "Spots are first come, first served, and students register themselves online." },
          { t: "A weekly commitment", s: "18 weekly meetings of about 3 hours. Students must attend at least 80%." }
        ],
        src: { url: "https://www.jacentralontario.org/company-program/", name: "jacentralontario.org", kind: "organizer" }
      }
    ]
  };
});
