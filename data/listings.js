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
 * - about: the description on the activity's page. is = what it is (one short paragraph),
 *   do = what you'll do, why = why it's worth it (2–3 short lines each). Plain words, no hype.
 *   q lists the organizer's exact words behind each line; every q must be in receipts.json.
 * - next: when the next round opens. est:true marks our estimate. tba:true means the organizer hasn't
 *   posted dates at all (the page says "Dates not posted"; d is only used for sorting). note explains the date.
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
    CHECKED: "2026-11-24",
    SEASON: "2026–27",
    TYPES: [
      ["pitch", "Pitch & startup"], ["deca", "DECA"], ["case", "Case competitions"],
      ["invest", "Investing"], ["math", "Math contest"], ["summer", "Programs"], ["venture", "Company program"],
      ["plan", "Business plans"], ["money", "Financial literacy"], ["econ", "Economics"], ["essay", "Essays"],
      ["fund", "Start-up funding"], ["showcase", "Showcases"], ["conf", "Conferences"]
    ],
    TYPE_LABEL: {
      pitch: "Pitch & startup competition", deca: "Business competition circuit", "case": "Case competition",
      invest: "Investing competition", math: "Math contest", summer: "Summer program", venture: "Company program",
      plan: "Business plan competition", money: "Financial literacy contest", econ: "Economics contest", essay: "Essay contest",
      fund: "Start-up funding program", showcase: "Entrepreneurship showcase", conf: "One-day conference"
    },
    LISTINGS: [
      {
        id: "shad", tk: "SHAD", short: "Shad", name: "Shad 2027", org: "Shad Canada", type: "summer", what: "A month-long summer program at a Canadian university, or online",
        grades: [10, 11], lastGrade: 11, gradeNote: "Open to students currently in Grade 10 or 11",
        free: false,
        cost: "Free to apply. 2027 program fee: $7,875 live-in or $3,975 virtual. If you get an offer, a $750 deposit secures your spot.",
        costShort: "Free to apply · $7,875 live-in or $3,975 virtual if accepted",
        aid: "Need-based fee assistance, up to the full cost",
        where: "Campuses across Canada, or online",
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
        about: {
          is: { t: "You spend 27 days in July living at one of 28 campuses across Canada, or join the 20-day virtual campus from home. The focus is STEAM (science, technology, engineering, arts and math) and entrepreneurship.", q: ["The program fee covers a comprehensive 27-day live-in experience", "Delivered in partnership with 28 post-secondary campuses across Canada", "The virtual campus covers a comprehensive 20-day digital experience", "pre-university STEAM and entrepreneurship programs"] },
          do: [
            { t: "Go to lectures by university professors and hands-on workshops led by industry experts", q: ["Lectures by post-secondary professors", "Hands-on workshops led by industry experts"] },
            { t: "Build a design and entrepreneurship project with a team", q: ["Design & Entrepreneurship Team Project"] },
            { t: "Get mentoring and coaching, with at least one mentor for every 8 students", q: ["Mentoring and coaching from Program Director and near-peer tutors", "A minimum of 1 to 8 mentor to student ratio"] }
          ],
          why: [
            { t: "You join a network of more than 27,000 Shad alumni", q: ["Shad has more than 27,000 alumni"] },
            { t: "Alumni can get post-secondary scholarships and application fee waivers", q: ["Post-secondary scholarships and application fee waivers for Shad alumni."] },
            { t: "In Ontario, it can count as an SHSM sector-partnered experience and toward IB CAS requirements", q: ["The Shad experience can also qualify as a Sector-Partnered Experience for SHSM students in Ontario and towards CAS requirements for IB diploma students."] }
          ]
        },
        parent: [
          { t: "Plan for the deposit", s: "If your teen gets an offer, a $750 deposit secures the spot. Need-based aid can cover up to the full cost." },
          { t: "Help with the reference", s: "The application needs a teacher reference and the latest report card." }
        ],
        src: { url: "https://www.shad.ca/faqs/", name: "shad.ca", kind: "organizer" }
      },
      {
        id: "diamond", tk: "DMND", short: "Diamond", name: "Diamond Challenge 2027", org: "Horn Entrepreneurship, University of Delaware", type: "pitch", what: "Build a business or social venture idea with your team, and pitch it",
        grades: [9, 10, 11, 12], gradeNote: "Ages 14–18 on the submission deadline",
        free: false,
        cost: "No entry fee is listed in the official rules. Confirm with the organizer.", costShort: "No entry fee listed",
        where: "Open worldwide",
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
        about: {
          is: { t: "Your team builds a business or social venture idea that solves a problem you care about. High school teams from around the world compete over three rounds.", q: ["The Diamond Challenge invites high school students worldwide to build solutions to solve problems they are passionate about", "each team is required to choose a competition track (business innovation or social innovation)", "teams develop their concepts and leverage resources throughout three rounds culminating at the Limitless World Summit"] },
          do: [
            { t: "Start with a 3 to 5 page written concept and a 60-second video", q: ["The narrative is limited to 3-5 pages", "The video is strictly limited to 60 seconds."] },
            { t: "If you advance, give a 5-minute pitch at a live event or as a recorded video", q: ["must meet the minimum score to advance to the pitching round", "Pitches are strictly limited to 5:00 minutes", "participants have the option to compete virtually by uploading a pitch deck and a recorded video pitch"] },
            { t: "Finalists pitch in person at the Limitless World Summit, April 29 and 30", q: ["Student teams qualifying for the final round of competition at the Limitless World Summit will be required to attend in-person to compete", "April 29-30 | Limitless World Summit"] }
          ],
          why: [
            { t: "Teams pitch for more than $100,000 in awards, with prizes for the top three in each track", q: ["pitch for more than $100,000 in awards", "Awards are given to the top three teams in both business innovation, presented by CSC, and social innovation tracks"] },
            { t: "Every participant gets the chance to grow their network and get feedback on their idea", q: ["Every participant has the opportunity to grow their network, gain valuable feedback"] }
          ]
        },
        parent: [
          { t: "Be the team's adult advisor", s: "Each team needs one adult aged 21 or older, listed with contact details on the submission." }
        ],
        src: { url: "https://diamondchallenge.org/competition/", name: "diamondchallenge.org", kind: "organizer" }
      },
      {
        id: "deca", tk: "DECA", short: "DECA", name: "DECA Ontario", org: "Ontario DECA", type: "deca", what: "Business case and test competitions through your school’s DECA chapter",
        grades: [9, 10, 11], gradeNote: "For next season (2027–28). Current members: your chapter advisor handles this season.",
        free: false,
        cost: "$35 USD membership and regionals fee, paid to your chapter advisor. Provincials qualifiers also pay for a required hotel stay.",
        costShort: "$35 USD membership, plus a hotel stay for Provincials",
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
        about: {
          is: { t: "You compete in business events through your school’s DECA chapter, which a teacher advisor leads. Events cover areas like marketing, finance, law and entrepreneurship.", q: ["Find a teacher advisor to lead your chapter", "You’ll create business presentations about marketing, finance, law and entrepreneurship."] },
          do: [
            { t: "Your chapter places you in one event and helps you train for it", q: ["ALL students will be assigned to an event right from the start.", "Each school will determine HOW you get slotted", "They will be your contacts for staying informed and training for competitions."] },
            { t: "At a November regional, most events combine an online exam with a case you present, in person or virtually", q: ["AREA 2 REGIONAL @ Goodman Sunday, November 8, 2026", "all students competing in Oral events will write the Regional online test", "Students will also be expected to compete in a case oral competition (in-person or virtually)."] },
            { t: "Place high enough and you go to Provincials: 3 days in downtown Toronto in February", q: ["only the Top X number of kids move on per event for EACH regional", "5 500 of Ontario’s finest taking over downtown Toronto for 3 days of fierce competition and professional development", "February 4-6, 2027"] }
          ],
          why: [
            { t: "Ontario DECA is the largest DECA association in the world, with about 5,500 students at Provincials", q: ["Ontario has grown to be the largest international DECA association in the world", "5 500 of Ontario’s finest"] },
            { t: "Results at Provincials decide who goes on to DECA’s international conference", q: ["Achievement at the Provincials will determine who will compete at the 81st Annual International Career Development Conference!"] },
            { t: "You learn to work through real business cases and present like a professional", q: ["DECA instills professionalism and prepares youth to respond to authentic business cases and market demands"] }
          ]
        },
        parent: [
          { t: "Budget for membership and Provincials", s: "Membership is $35 USD. Students who qualify for Provincials in Toronto also pay for a required hotel stay." },
          { t: "Ask about your school's chapter rules", s: "Each school sets its own commitment rules and chapter size limits." }
        ],
        src: { url: "https://deca.ca/v2/join/", name: "deca.ca", kind: "organizer" }
      },
      {
        id: "blueocean", tk: "BLUE", short: "Blue Ocean", name: "Blue Ocean Student Entrepreneur Competition 2027", org: "Blue Ocean Student Entrepreneurs", type: "pitch", what: "Record a 5-minute pitch video for a business idea, fully online",
        grades: [9, 10, 11, 12], gradeNote: "Any high school student",
        free: true, cost: "Free, including the mini-course", costShort: "Free",
        where: "Open worldwide",
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
        about: {
          is: { t: "It’s free, fully online and open to any high school student in the world. You come up with a business idea for a problem no one has solved yet, and pitch it in a 5-minute video.", q: ["No. The competition is completely free.", "Any high school student from around the world can compete in this virtual competition.", "Think of a real-world problem that no one has solved before and create a blue ocean business idea to solve it.", "Record your 5-minute video"] },
          do: [
            { t: "Take the free mini-course on blue ocean thinking, the approach the judges look for", q: ["Complete the Blue Ocean Mini-Course to learn about blue ocean thinking.", "The Mini-Course teaches you that way of thinking, and it's what judges are looking for in a winning pitch."] },
            { t: "Shape your idea and your pitch with their tools and pitch template", q: ["Blue Ocean tools and templates are provided to build your business idea and to structure your pitch."] },
            { t: "Put your video on YouTube, then submit the link and the video file", q: ["Record your 5-minute video, upload on YouTube, submit a link and the video file."] }
          ],
          why: [
            { t: "You pitch to experienced entrepreneurs and business people", q: ["pitch their innovative business concepts to experienced entrepreneurs and business people"] },
            { t: "First place wins $1,000, and everyone who submits a pitch gets a certificate of participation", q: ["2027 Awards 1st Place $1000", "Once you submit your pitch, you'll receive a Certificate of Participation"] }
          ]
        },
        parent: [
          { t: "No cost", s: "Registering, the mini-course and submitting are all free." }
        ],
        src: { url: "https://blueoceancompetition.org/compete/", name: "blueoceancompetition.org", kind: "organizer" }
      },
      {
        id: "euclid", tk: "EUCL", short: "Euclid", name: "Euclid Mathematics Contest", org: "CEMC, University of Waterloo", type: "math", what: "A math contest written at your school",
        grades: [9, 10, 11, 12], gradeNote: "Written for students in their final year, but younger students are welcome",
        free: false, cost: "$18 per student", costShort: "$18 per student",
        where: "Your school, or another local school that lets you join",
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
        about: {
          is: { t: "Over 25,000 students around the world write it each year. It’s meant for students in their final year of high school, but motivated students in lower grades are welcome too.", q: ["Written annually by over 25 000 participants worldwide", "Students in their final year of secondary school or CÉGEP students.", "Motivated students in lower grades are welcome to write the contest."] },
          do: [
            { t: "Write it at school in 2.5 hours, on paper and on your own", q: ["Written in school, participants write individually and on paper.", "Time allowed for completion is 2.5 hours."] },
            { t: "Answer 10 questions: some need only the answer, others a full written solution", q: ["10 questions; a mix of final answer only and full-solution."] },
            { t: "Expect the last questions to be hard. They’re among the toughest in any CEMC contest.", q: ["the final questions in the Euclid are some of the most complex and challenging among all our contests"] }
          ],
          why: [
            { t: "Writing it is required for some Waterloo scholarship decisions, though not for admission", q: ["are not required for admission, but writing one of these contests is required for some scholarship decisions."] },
            { t: "Everyone in the top 25% of all writers gets a Certificate of Distinction", q: ["Every participant scoring in the top 25% of all competitors receives a Certificate of Distinction."] }
          ]
        },
        parent: [
          { t: "A small fee", s: "$18 per student, ordered through the school." }
        ],
        src: { url: "https://cemc.uwaterloo.ca/contests/how-contests-work", name: "cemc.uwaterloo.ca", kind: "organizer" }
      },
      {
        id: "ihscc", tk: "IVEY", short: "Ivey Case", name: "Ivey High School Case Competition", org: "Ivey Business School, Western University", type: "case", what: "A one-day business case competition in London, Ontario, and other cities",
        grades: [10, 11, 12], gradeNote: "High school students in Grades 10 to 12. No experience required.",
        free: false, cost: "2027 fee not posted yet", costShort: "2027 fee not posted yet",
        where: "London, ON (May 1). Also Montreal, Calgary and Vancouver.",
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
        about: {
          is: { t: "A one-day event every spring. Teams solve a business case and present their ideas to a panel of judges.", q: ["In these dynamic, one-day events hosted every spring by Ivey Business School at Western University", "IHSCC challenges students to collaborate in teams, solve business cases, and present their ideas to a panel of judges."] },
          do: [
            { t: "Sign up on your own and get placed on a team with students from other schools", q: ["You'll register individually and be placed on a team with peers from different schools"] },
            { t: "Work through a case inspired by a real business situation, the way a consultant would", q: ["Each case is inspired by real-world scenarios, giving participants a glimpse into the life of a business consultant."] },
            { t: "Get feedback from the judges: Ivey faculty and business professionals", q: ["Present your ideas to a panel of Ivey faculty and business professionals who will provide insightful feedback."] }
          ],
          why: [
            { t: "No experience needed. It’s built for learning, whether you’re new to business or not.", q: ["No prior experience is required!", "Whether you're new to business or have some background, this event focuses on fun, learning, and growth"] },
            { t: "You meet students from other schools, and teams compete for prizes", q: ["Build connections with students from other schools and exchange innovative ideas.", "Compete for exciting prizes while celebrating your creativity and hard work."] }
          ]
        },
        parent: [
          { t: "Plan the trip", s: "Competitions run on Saturdays in London (May 1), Montreal, Calgary and Vancouver." }
        ],
        src: { url: "https://www.ivey.uwo.ca/high-school-case-competitions/", name: "ivey.uwo.ca", kind: "organizer" }
      },
      {
        id: "boardroom", tk: "BRDM", short: "Boardroom", name: "The Boardroom", org: "Rotman Commerce, University of Toronto", type: "case", what: "An online case round in spring, then in-person rounds at U of T",
        grades: [9, 10, 11], lastGrade: 11, gradeNote: "Current Grade 9–11 students who are Canadian citizens or permanent residents",
        free: false, cost: "Not listed", costShort: "Not listed",
        where: "Online, then University of Toronto (virtual for teams outside the GTA)",
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
        about: {
          is: { t: "Your team solves a business case about the issues of tomorrow, then competes through several rounds. The first round is online.", q: ["The Boardroom is a team-based, multi-round case competition for current high school students organized by Rotman Commerce", "while solving a business case focused on the issues of tomorrow", "The first round of The Boardroom is to be completed online."] },
          do: [
            { t: "In Round 1, your team gets about 30 days to write a case proposal", q: ["Teams will have approximately 30 days to complete and submit their case proposal for Round 1."] },
            { t: "The top 12 teams compete in Round 2 in the fall, at U of T, or virtually from outside the GTA", q: ["The top 12 teams from Round 1 will be notified in June that they have been selected to compete in Round 2 of The Boardroom, which will take place in the fall at the University of Toronto St. George Campus and virtually, if participants outside of the Greater Toronto Area qualify."] },
            { t: "The top 3 teams from Round 2 present their proposals for the Grand Prize", q: ["The top 3 teams from Round 2 will be selected to present their proposals and compete for the Grand Prize."] }
          ],
          why: [
            { t: "Each member of the winning team gets a $2,500 Rotman Commerce scholarship, if they’re admitted and enrol", q: ["Each member of the winning team will receive a $2,500 scholarship to Rotman Commerce", "conditional on the participant’s successful admission, acceptance and registration to the program."] },
            { t: "Every finalist gets a $100 gift card", q: ["All finalists will receive a $100 gift card for their achievement."] }
          ]
        },
        parent: [
          { t: "A scholarship, with a condition", s: "Each winning team member gets a $2,500 Rotman Commerce scholarship, paid only if they're admitted and enrol." }
        ],
        src: { url: "https://rotmancommerce.utoronto.ca/future-students/?p=2006", name: "rotmancommerce.utoronto.ca", kind: "organizer" }
      },
      {
        id: "wharton", tk: "WHRT", short: "Wharton", name: "Wharton Global High School Investment Competition", org: "Wharton Global Youth Program, University of Pennsylvania", type: "invest", what: "An online investing simulation with a team from your school",
        grades: [9, 10, 11], gradeNote: "This year's Grade 9–11 students can enter next season (2027–28)",
        free: true, cost: "Free. Finalists pay their own travel, or join the finale by video.", costShort: "Free",
        where: "Open worldwide",
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
        about: {
          is: { t: "A free competition where your team, guided by a teacher from your school, plans a long-term investment strategy for a client.", q: ["The Wharton Global High School Investment Competition is a free, experiential investment challenge for high school students (9th to 12th grade) and teachers.", "guided by a teacher from their school as their advisor", "teams develop a long-term investment strategy designed to help the client achieve their objectives"] },
          do: [
            { t: "Work on a client case about a real Wharton alum, with a financial scenario written for the competition", q: ["Each year, teams are introduced to a new case study featuring a Wharton School alum.", "While the client is real, the financial scenario is developed specifically for the competition."] },
            { t: "Build and manage a portfolio with virtual cash in the Wharton Investment Simulator", q: ["Teams also use the Wharton Investment Simulator (WInS) to implement their investment strategy by building and managing a portfolio using virtual cash to buy and sell approved securities."] },
            { t: "Hand in four pieces of work, including an investment policy statement and a final report", q: ["Teams have four REQUIRED deliverables", "Investment Policy Statement (IPS) and a Comprehensive Final Report"] }
          ],
          why: [
            { t: "You’re judged on your strategy and research, not on how much money your portfolio makes", q: ["Unlike other investment competitions, success is not determined by portfolio performance.", "Teams are evaluated on the quality of their investment strategy"] },
            { t: "The top 50 teams present in virtual semifinals, and the top 10 go to the Global Finale in Philadelphia", q: ["a panel of judges selects 50 semifinalist teams", "Those teams are invited to present their investment strategies during the virtual Semifinals.", "The top 10 teams advance to the Global Finale at the Wharton School in Philadelphia"] },
            { t: "You learn about risk, diversification and company analysis, as a team", q: ["Together, they learn about strategy-building, teamwork, communication, risk, diversification, company and industry analysis, and many other aspects of investing."] }
          ]
        },
        parent: [
          { t: "Free, unless they reach the finale", s: "The finale is in Philadelphia. Finalists pay their own travel or join by video." }
        ],
        src: { url: "https://globalyouth.wharton.upenn.edu/competitions/investment-competition/faq/", name: "globalyouth.wharton.upenn.edu", kind: "organizer" }
      },
      {
        id: "slp", tk: "SLP", short: "Ivey SLP", name: "Ivey Summer Leadership Program", org: "Ivey Business School, Western University", type: "summer", what: "A summer leadership program at Ivey Business School in London, Ontario",
        grades: [9, 10, 11], lastGrade: 11, gradeNote: "Open to students currently in Grade 9, 10 or 11",
        free: false, cost: "2027 fee not posted yet", costShort: "2027 fee not posted yet",
        where: "Ivey Business School, Western University, London, ON",
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
        about: {
          is: { t: "It’s for students who are curious about leadership and business. In 2026 it ran for five days. Ivey is reworking it for 2027, so details may change.", q: ["High school students currently in Grades 9, 10, and 11 who are curious, motivated, and excited to learn about leadership, business, and innovation.", "is a five-day residential program", "We're working on the next version of SLP"] },
          do: [
            { t: "Learn through case classes, hands-on workshops and team problem solving, led by Ivey faculty, staff and students", q: ["Students dive into case based learning, hands-on workshops, and team problem solving led by Ivey faculty, staff, and student leaders."] },
            { t: "Work on a team project with Western’s Morrissette Institute for Entrepreneurship, from a problem to a practical solution", q: ["students work on a project developed in partnership with the Morrissette Institute for Entrepreneurship at Western", "the process of taking an idea from problem identification to a practical solution"] },
            { t: "Live in residence with counsellors. Meals, materials and evening activities are included.", q: ["Participants stay in Western University residence.", "Counsellors live in residence alongside students", "All meals, materials, and evening activities are included."] }
          ],
          why: [
            { t: "You get a taste of university life and of how Ivey teaches", q: ["a taste of university life and an introduction to Ivey’s approach to learning"] },
            { t: "You meet students from across Canada and abroad. In 2026, 51% came from outside Ontario.", q: ["A little more than half the cohort – 51 per cent – travelled from outside Ontario"] },
            { t: "It’s selective: in 2026, about 1,100 students applied for 150 spots", q: ["Roughly 1,100 students applied for the 150 spots."] }
          ]
        },
        parent: [
          { t: "A week away", s: "Students live in Western University residence, with meals and evening activities included." }
        ],
        src: { url: "https://www.ivey.uwo.ca/summerleadership/", name: "ivey.uwo.ca", kind: "organizer" }
      },
      {
        id: "ja", tk: "JA", short: "JA Company", name: "JA Company Program", org: "Junior Achievement (JA Central Ontario, JA South Western Ontario and other regions)", type: "venture", what: "Run a real company with a team, after school from November to April",
        grades: [9, 10, 11], gradeNote: "Open to Grades 9–12, so this year's Grade 9–11 students can join next year",
        free: true, cost: "Free. Each student buys a $5–$30 share in their team's company, and JA helps anyone who can't.", costShort: "Free, plus a $5–$30 share",
        where: "In person across Ontario, with some virtual groups",
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
        about: {
          is: { t: "You and other students create and run one real business, guided by volunteer mentors from the business community. It runs after school for 18 weeks, from November to April.", q: ["to create and run one business over 18 weeks", "with mentorship from over 160 volunteer advisors from the business community", "The program runs for 18 weeks from November to April", "this after-school experience will set you up for life"] },
          do: [
            { t: "Make a product or service with your team, then market it, sell it and handle the money", q: ["you’ll produce a prototype, product or service, organize the production and marketing, interact with customers, handle money, and meet deadlines"] },
            { t: "Show and sell what you made at the Company Program Trade Show", q: ["Company Program Trade Show is an opportunity for teams to showcase and sell their products or services."] },
            { t: "Plan on 3 to 5 hours a week, and attend at least 80% of the 18 weekly meetings", q: ["Students are expected to dedicate 3 to 5 hours each week from November to April", "Students must commit to attending a minimum of 80% of the 18 weekly meetings."] }
          ],
          why: [
            { t: "At JA Central Ontario last year, over 600 students started 29 companies", q: ["Over 600 high school students created 29 unique start-ups"] },
            { t: "You build skills like public speaking, time management and financial literacy", q: ["Gain key employability and transferable skills including critical thinking, time management and public speaking skills", "Develop essential entrepreneurial, financial literacy and work readiness skills"] },
            { t: "You can apply for awards and scholarships from JA Central Ontario and JA Canada", q: ["Apply for the awards and scholarships made available through JA Central Ontario and JA Canada"] }
          ]
        },
        parent: [
          { t: "Register on day one", s: "Spots are first come, first served, and students register themselves online." },
          { t: "A weekly commitment", s: "18 weekly meetings, and 3 to 5 hours a week in all. Students must attend at least 80% of the meetings." }
        ],
        src: { url: "https://www.jacentralontario.org/company-program/", name: "jacentralontario.org", kind: "organizer" }
      },
      {
        id: "summerco", tk: "SUMR", short: "Summer Company", name: "Summer Company 2027", org: "Government of Ontario", type: "fund",
        what: "Start-up money and mentoring to run your own business over the summer",
        grades: [9, 10, 11, 12],
        gradeNote: "Ages 15–29, living in Ontario and going back to school in the fall",
        free: false,
        cost: "No fee is listed. You can get up to $3,000: up to $1,500 up front and up to $1,500 when you finish.",
        costShort: "Up to $3,000 for your business",
        where: "Anywhere in Ontario, through your local Small Business Advisory Centre",
        entry: "Apply through your local Small Business Advisory Centre, with a business plan and cash flow",
        next: { d: "2027-03", tba: true, label: "2027 dates aren't posted yet. In 2026, applications closed May 15", note: "In 2026, applications closed May 15. Spots fill quickly." },
        can: [
          { k: "ok", t: "Up to $3,000 for your business", s: "Up to $1,500 up front, and up to $1,500 when you finish the program" },
          { k: "warn", t: "Under 18? A parent co-signs", s: "A parent or guardian signs the agreement with you" },
          { k: "warn", t: "A new business of your own", s: "Not part of a family business, and you can't already be running one" },
          { k: "warn", t: "A full summer", s: "At least 280 hours, and no more than 12 hours a week of other work or school" }
        ],
        steps: [
          { id: "idea", by: "2027-02-26", t: "Pick a business you could run full-time this summer", who: "you" },
          { id: "centre", by: "2027-03-12", t: "Contact your local Small Business Advisory Centre and ask when applications open", who: "you", href: "https://www.ontario.ca/page/start-summer-company-students" },
          { id: "cosign", by: "2027-03-12", t: "If you're under 18, ask a parent or guardian to co-sign", who: "parent", ask: "cosign" },
          { id: "plan", by: "2027-04-16", t: "Write your business plan and cash flow, with help from the centre", who: "you" },
          { id: "apply", by: "2027-04-30", t: "Apply early. Spots fill quickly.", who: "you", est: true }
        ],
        asks: {
          cosign: { to: "parent", title: "Ask a parent to co-sign", subject: "Can you co-sign my Summer Company agreement?", hint: "Applicants under 18 need a parent or guardian to sign the agreement.", msg: "Hi [Mom/Dad/______],\n\nI want to start my own summer business through Summer Company. It's an Ontario government program that gives students up to $3,000 and advice from local business leaders. Because I'm under 18, a parent or guardian has to sign the agreement with me. Would you?\n\nDetails: {link}" }
        },
        dates: [
          { d: "2027-04-01", k: "event", t: "Earliest start for your business, based on 2026 rules", est: true },
          { d: "2027-05", k: "deadline", t: "Applications close, based on 2026 (May 15)", est: true },
          { d: "2027-09-06", k: "event", t: "Program ends on Labour Day", est: true }
        ],
        about: {
          is: { t: "You start a brand-new business and run it full-time over the summer, with start-up money and advice from local business leaders. You can keep it going once school starts.", q: ["start-up money to kick-off a new summer business", "advice and mentorship from local business leaders to help get the business up and running", "operates in Ontario on a full-time basis", "End date: Labour Day (but you can choose to keep running your summer business while in school)."] },
          do: [
            { t: "Write a business plan and cash flow. Your local program provider helps if you need it.", q: ["Your selected program provider will contact you and will ask you to submit an application, which includes a business plan and cash flow.", "Your program provider will help you with your application, if required."] },
            { t: "Run almost any kind of business, as long as it’s yours and not part of a family business", q: ["You can choose to start almost any type of business, as long as it:", "is an independent business venture (not a part of an existing or family business)"] },
            { t: "Put in at least 280 hours over the summer, until Labour Day", q: ["a minimum of 280 hours for high school students", "End date: Labour Day"] }
          ],
          why: [
            { t: "You can get up to $1,500 up front for start-up costs, and up to $1,500 more when you finish", q: ["up to $1,500 up front to help with start-up costs", "up to $1,500 when you successfully complete the program requirements"] },
            { t: "You learn sales, marketing, bookkeeping and networking by doing them for real", q: ["Sales, marketing, bookkeeping, customer relationship management and networking are just a few of the highly useful skills you’ll develop."] }
          ]
        },
        parent: [
          { t: "A parent signs if they're under 18", s: "Applicants under 18 need a parent or guardian to sign the agreement." },
          { t: "The second payment depends on finishing", s: "If the program isn't completed, there's no second payment, and the first may have to be paid back." }
        ],
        src: { url: "https://www.ontario.ca/page/start-summer-company-students", name: "ontario.ca", kind: "organizer" }
      },
      {
        id: "flc", tk: "FLC", short: "Financial Literacy", name: "Financial Literacy Competition", org: "School of Accounting and Finance, University of Waterloo", type: "money",
        what: "A 65-minute online test on money basics, written at your school",
        grades: [9, 10, 11, 12],
        gradeNote: "Grades 9–12 at a Canadian high school outside Quebec. Grades 9–10 write the Junior test, 11–12 the Senior.",
        free: false,
        cost: "No entry fee is listed",
        costShort: "No entry fee listed",
        where: "Online, at your school, with a teacher supervising",
        entry: "A teacher registers your class and shares a class code. Students can't register on their own.",
        window: { from: "2026-10-14", to: "2026-11-27" },
        boardWhat: "Teacher registration closes",
        next: { d: "2027-03", label: "The May round's dates come out in March", est: true, closed: false, note: "Waterloo releases each round's dates in October and March." },
        can: [
          { k: "warn", t: "A teacher has to register you", s: "Students can't register directly. Your teacher gets a class code to share." },
          { k: "warn", t: "You write it at school", s: "Online, supervised by your teacher, on the day and time they pick" },
          { k: "ok", t: "It runs twice a year", s: "December and May, so you can also aim for the spring round" }
        ],
        steps: [
          { id: "ask", by: "2026-11-26", t: "Ask a teacher to register your class or club", who: "teacher", ask: "register" },
          { id: "register", by: "2026-11-27", t: "Your teacher registers by 12:00 pm ET", who: "teacher", official: true },
          { id: "join", by: "2026-12-01", t: "Sign up with the class code by 5:00 pm ET", who: "you", official: true },
          { id: "practise", by: "2026-12-01", t: "Try the sample questions and the practice competition", who: "you" },
          { id: "write", by: "2026-12-02", t: "Write it at school on your class's day (December 2 or 3)", who: "you" }
        ],
        asks: {
          register: { to: "teacher", title: "Ask a teacher to register you", subject: "Waterloo's Financial Literacy Competition", hint: "Any teacher can register a class or club. Teacher registration closes at noon ET, so ask right away.", msg: "Hi [Mr./Ms. ______],\n\nCould you register our class (or a group of us) for the University of Waterloo's Financial Literacy Competition? It's a 65-minute online test we'd write at school, and teachers register by {deadline}. You'd get a class code to share with us.\n\nThank you,\n[Your name]\n\nDetails: {link}" }
        },
        dates: [
          { d: "2026-10-14", k: "opens", t: "Teacher registration opened" },
          { d: "2026-11-27", k: "deadline", t: "Teacher registration closes, 12:00 pm ET" },
          { d: "2026-12-01", k: "deadline", t: "Students sign up with the class code, 5:00 pm ET" },
          { d: "2026-12-02", k: "event", t: "Competition days, December 2 and 3" },
          { d: "2027-03", k: "opens", t: "May round dates released", est: true },
          { d: "2027-05", k: "event", t: "May round", est: true }
        ],
        about: {
          is: { t: "You answer questions on money topics like budgeting, banking, credit, investing and accounting. No prior knowledge is assumed, and questions go from easy to hard.", q: ["covering topics in banking, investing, economics, income management and budgeting, accounting, credit, post-secondary financing, home ownership, and fraud and financial safety", "No prior level of knowledge is assumed", "questions range from easy to more advanced"] },
          do: [
            { t: "Write it online at school in 65 minutes: 50 questions for Junior, 60 for Senior", q: ["Students have 65 minutes to complete the competition. The Senior competition includes 60 questions, and the Junior competition includes 50 questions.", "Students are required to compete from their school under the supervision of a teacher"] },
            { t: "Prepare with Waterloo’s resources and a practice competition", q: ["Use our resources to prepare for the competition.", "Use the practice competition to check your understanding before your competition day"] },
            { t: "Your teacher picks the day and time that suits your class", q: ["Teachers can choose the day and time that works best for their students"] }
          ],
          why: [
            { t: "The top Junior and Senior scorers get $750 toward an RESP. The top 10 in each grade get $75 gift cards.", q: ["receives $750 towards an RESP for post-secondary education", "The top 10 students (based on individual score) at each grade level receive a $75 e-gift card."] },
            { t: "Every eligible participant gets a certificate at one of four levels", q: ["All eligible participants will receive a levelled Certificate of Achievement", "The certificate will recognize four levels of achievement"] }
          ]
        },
        parent: [
          { t: "During the school day", s: "Students write it online at school, supervised by their teacher." },
          { t: "Prizes for top scorers", s: "The top Junior and Senior students each get $750 toward an RESP." }
        ],
        src: { url: "https://uwaterloo.ca/school-of-accounting-and-finance/teachers-and-guidance-counsellors/financial-literacy-competition-flc", name: "uwaterloo.ca", kind: "organizer" }
      },
      {
        id: "wsi", tk: "NFTE", short: "World Series", name: "World Series of Innovation 2026–27", org: "NFTE (Network for Teaching Entrepreneurship)", type: "pitch",
        what: "Propose your own solution to a challenge set by a company, online",
        grades: [9, 10, 11, 12],
        gradeNote: "Ages 13–24, anywhere in the world",
        free: true,
        cost: "Free",
        costShort: "Free",
        where: "Online, open worldwide",
        team: { min: 1, max: 4 },
        window: { from: "2026-09-09", to: "2026-12-13" },
        boardWhat: "Entries due",
        can: [
          { k: "ok", t: "Free and online", s: "Open to young people around the world" },
          { k: "ok", t: "Enter alone or with friends", s: "Teams can be {team}" },
          { k: "warn", t: "Under 18? A parent accepts the rules", s: "A parent or guardian has to agree to the participation rules on your behalf" }
        ],
        steps: [
          { id: "pick", by: "2026-11-30", t: "Pick one of the five challenges and read its brief", who: "you", href: "https://innovation.nfte.com/impact-challenges/" },
          { id: "team", by: "2026-12-02", t: "Decide: go solo or team up with friends", who: "friends", ask: "team" },
          { id: "rules", by: "2026-12-04", t: "If you're under 18, a parent or guardian accepts the rules with you", who: "parent", ask: "rules" },
          { id: "submit", by: "2026-12-13", t: "Submit your entry by 11:59 pm ET", who: "you", official: true }
        ],
        asks: {
          team: { to: "friends", title: "Invite friends to your team", hint: "This is optional. You can enter alone.", msg: "Want to enter NFTE's World Series of Innovation with me? It's free and online: we pick a challenge from a company like EY or Intuit and propose our own solution. Teams can be {team}, and entries are due {deadline}.\n\nDetails: {link}" },
          rules: { to: "parent", title: "Ask a parent to accept the rules", subject: "Can you help me enter NFTE's World Series of Innovation?", hint: "Entrants under 18 need a parent or guardian to agree to the participation rules on their behalf.", msg: "Hi [Mom/Dad/______],\n\nI'd like to enter NFTE's World Series of Innovation, a free online competition where students propose solutions to challenges from companies. Because I'm under 18, a parent or guardian has to read and accept the participation rules for me. Could we look at them together? Entries are due {deadline}.\n\nDetails: {link}" }
        },
        dates: [
          { d: "2026-12-13", k: "deadline", t: "Entries due, 11:59 pm ET" },
          { d: "2027-01", k: "event", t: "First-round judging" },
          { d: "2027-02-08", k: "result", t: "Top 10 finalists in each challenge announced" },
          { d: "2027-03-02", k: "deadline", t: "Finalists' one-minute videos due, 11:59 pm ET" },
          { d: "2027-04-21", k: "result", t: "Top 3 in each challenge announced live" }
        ],
        about: {
          is: { t: "Pick a problem set by a company or foundation, like EY or MetLife, and propose your own solution. Judges look at creativity, impact and the link to a UN global goal.", q: ["designed in partnership with leading companies and foundations", "Each submission will be assessed on creativity, connection to advancing the relevant SDG, and potential impact.", "EY Responsible AI Challenge", "MetLife Foundation Good Health and Well-Being Challenge"] },
          do: [
            { t: "Choose a challenge, such as EY’s Responsible AI or Intuit’s Food Truck challenge", q: ["EY Responsible AI Challenge", "Intuit Food Truck Challenge"] },
            { t: "Fill in the online entry form with your idea, alone or as a team", q: ["Entries must be submitted via the online entry form", "Whether you’re going solo or teaming up with friends"] },
            { t: "If you make the top 10 in your challenge, send in a one-minute video", q: ["The top ten (10) finalists in each category will be selected by a panel of judges", "finalists will be asked to submit a one-minute video."] }
          ],
          why: [
            { t: "Cash prizes go to the top 3 in each challenge, from $300 up to $1,500", q: ["Cash prizes are awarded to the 1st place, 2nd place, and 3rd place winners in each challenge category.", "cash prizes ranging from $300 to $1,500"] },
            { t: "Judges from the sponsoring companies score the finalists", q: ["Judges from the sponsoring organizations will then score entries"] }
          ]
        },
        parent: [
          { t: "Free", s: "There's no cost to enter." },
          { t: "A parent accepts the rules", s: "Entrants under 18 need a parent or guardian to agree to the participation rules on their behalf." }
        ],
        src: { url: "https://innovation.nfte.com/impact-challenges/", name: "innovation.nfte.com", kind: "organizer" }
      },
      {
        id: "techno", tk: "TECH", short: "Technovation", name: "Technovation Girls 2027", org: "Technovation", type: "pitch",
        what: "Build a tech solution to a problem in your community, and pitch it",
        grades: [9, 10, 11, 12],
        gradeNote: "Girls and nonbinary students aged 8–18 on August 1, 2027",
        free: true,
        cost: "Free, including the curriculum",
        costShort: "Free",
        where: "Online, open worldwide. TMU runs a Toronto chapter.",
        team: { min: 1, max: 5 },
        window: { from: "2026-10-11", to: "2027-03-11" },
        boardWhat: "Registration closes",
        can: [
          { k: "ok", t: "Free", s: "The competition and the curriculum cost nothing" },
          { k: "warn", t: "For girls and nonbinary students", s: "A co-ed track is new in 2027. The Toronto chapter isn't part of that pilot." },
          { k: "ok", t: "Enter alone or as a team", s: "Teams can be {team}" },
          { k: "warn", t: "Register first, build later", s: "Registration closes in March. Projects are due in May." }
        ],
        steps: [
          { id: "team", by: "2027-01-15", t: "Decide: go solo or form a team", who: "friends", ask: "team" },
          { id: "mentor", by: "2027-02-05", t: "Optional: ask an adult you trust to mentor your team", who: "teacher", ask: "mentor" },
          { id: "start", by: "2027-02-10", t: "Start building. Technovation says this is the latest to begin.", who: "you", href: "https://technovationchallenge.org/get-involved/students/" },
          { id: "register", by: "2027-03-11", t: "Everyone on the team registers by 23:59 UTC", who: "you", official: true },
          { id: "canvas", by: "2027-04-23", t: "Senior teams: finish your business canvas", who: "you" },
          { id: "submit", by: "2027-05-05", t: "Submit your video and project by 5:00 pm PDT", who: "you", official: true }
        ],
        asks: {
          team: { to: "friends", title: "Invite friends to your team", hint: "Technovation Girls is for girls and nonbinary students.", msg: "Want to do Technovation Girls with me? It's free: we find a problem in our community, build a tech solution for it, and pitch it in a video. Teams can be {team}. Registration closes {deadline}.\n\nDetails: {link}" },
          mentor: { to: "teacher", title: "Ask a teacher to mentor your team", subject: "Would you mentor our Technovation team?", hint: "Mentors are optional. A mentor has to register on Technovation's platform too.", msg: "Hi [Mr./Ms. ______],\n\nWe're entering Technovation Girls, a free competition where teams build a tech solution to a problem in our community and pitch it. Would you be our team's mentor? Mentors register on Technovation's platform too, and registration closes {deadline}.\n\nThank you,\n[Your name]\n\nDetails: {link}" }
        },
        dates: [
          { d: "2026-10-11", k: "opens", t: "Registration opened" },
          { d: "2027-02-10", k: "event", t: "Latest recommended start, 12 weeks before projects are due" },
          { d: "2027-03-11", k: "deadline", t: "Registration closes for students and mentors, 23:59 UTC" },
          { d: "2027-05-05", k: "deadline", t: "Projects due, 5:00 pm PDT" },
          { d: "2027-05-11", k: "event", t: "First judging round, May 11 to June 7, at regional pitch events and online" },
          { d: "2027-07", k: "result", t: "Finalists and Regional Honorees announced at a virtual celebration" }
        ],
        about: {
          is: { t: "Teams find a problem in their community, build a digital solution and pitch it. High school students compete in the Junior (13–15) or Senior (16–18) division.", q: ["identify problems in their community.", "create digital solutions to address the problem.", "pitch their ideas.", "Junior Division: 13-15 years old as of August 1, 2027", "Senior Division: 16-18 as of August 1, 2027"] },
          do: [
            { t: "Build an app or another digital tool. In 2027, it no longer has to be a mobile app.", q: ["create digital solutions to address the problem.", "You're no longer limited to a mobile app"] },
            { t: "Make one video of up to 4 minutes about your project", q: ["One video, maximum of 4 minutes"] },
            { t: "Senior teams also upload a business canvas for their idea", q: ["compose business canvas.", "Business Canvas - upload your business canvas (doc or PDF)"] }
          ],
          why: [
            { t: "Girls-track finalists each get a $500 stipend and a free trip to the global event", q: ["Finalist teams will receive a $500/person educational stipend", "All finalist teams in the Girls Track will receive free travel and accommodations for all team members to the global event."] },
            { t: "30 teams earn Regional Honors, with a $250 stipend for each member", q: ["In 2027, we will select 30 teams for Regional Honors.", "a $250 educational stipend"] }
          ]
        },
        parent: [
          { t: "Free", s: "The competition and its curriculum are free and online." },
          { t: "A mentor is optional", s: "Students can ask an adult they trust to mentor the team. The mentor registers too." }
        ],
        src: { url: "https://technovationchallenge.org/get-involved/students/", name: "technovationchallenge.org", kind: "organizer" }
      },
      {
        id: "sbea", tk: "SBEA", short: "Schulich Academy", name: "Schulich Business Excellence Academy 2027", org: "Schulich School of Business, York University", type: "summer",
        what: "A free summer business program online, ending with a case competition at Schulich",
        grades: [10, 11, 12],
        gradeNote: "Students in Grade 10, 11 or 12 across Ontario. It's aimed at students from equity-deserving groups.",
        free: true,
        cost: "Free",
        costShort: "Free",
        where: "Online on weekday evenings, then two days at York University in Toronto (based on 2026)",
        entry: "Apply online when the 2027 application opens",
        next: { d: "2027-02", label: "2027 applications open in early 2027", est: true, note: "Schulich says to check back in early 2027." },
        can: [
          { k: "ok", t: "Free", s: "The program is free for every participant" },
          { k: "warn", t: "Aimed at equity-deserving groups", s: "Including Black, Indigenous, BIPOC and 2SLGBTQIA+ students, and students with disabilities" },
          { k: "warn", t: "2027 dates aren't posted yet", s: "In 2026 it ran in July, with the last two days in person" }
        ],
        steps: [
          { id: "check", by: "2027-02-05", t: "Check Schulich's page for the 2027 application", who: "you", href: "https://schulich.yorku.ca/future-students/business-excellence-academy/" },
          { id: "apply", by: "2027-03", t: "Apply as soon as the application opens", who: "you", est: true }
        ],
        asks: {},
        dates: [
          { d: "2027-02", k: "opens", t: "2027 application expected (Schulich says early 2027)", est: true },
          { d: "2027-07", k: "event", t: "Program in July, based on 2026 (July 6 to 23)", est: true }
        ],
        about: {
          is: { t: "Three weeks of online evening sessions with guest speakers and Schulich faculty, then two days at Schulich. You’re placed in a small group with a Schulich student as your mentor.", q: ["The sessions are held virtually, consisting of a series of lectures and group-based activities that are delivered by prominent guest speakers from the community and Schulich Faculty.", "the virtual sessions ran Monday, Tuesday, Wednesday, and Thursday evenings from 6:30-8:30pm for three weeks", "The final sessions on July 22 and July 23 were in-person days", "Small groups of high school participants and one Schulich undergraduate student mentor will be introduced at the start of the program."] },
          do: [
            { t: "Attend lectures and group activities online, Monday to Thursday evenings", q: ["the virtual sessions ran Monday, Tuesday, Wednesday, and Thursday evenings from 6:30-8:30pm for three weeks"] },
            { t: "Finish with a case competition, school tours and a graduation dinner on York’s Keele campus", q: ["At the end of the program, an in-person case competition and graduation dinner will be organized at the Schulich School of Business, York University, Keele Campus for the participants who complete the program.", "including the case competition, school tours"] }
          ],
          why: [
            { t: "Complete all the modules and you get a Certificate of Completion", q: ["Participants who complete all of the required modules will receive a Certificate of Completion at the closing graduation ceremony dinner."] },
            { t: "It’s built to help you become a stronger applicant for university and college", q: ["become competitive applicants for post-secondary education opportunities"] }
          ]
        },
        parent: [
          { t: "Free", s: "The program is free for all participants." },
          { t: "Two days on campus", s: "In 2026, the last two days were in person at York University's Keele campus in Toronto." }
        ],
        src: { url: "https://schulich.yorku.ca/future-students/business-excellence-academy/", name: "schulich.yorku.ca", kind: "organizer" }
      },
      {
        id: "vtpitch", tk: "VPC", short: "Vermont Pitch", name: "Vermont Pitch Challenge 2027", org: "University of Vermont", type: "pitch",
        what: "Pitch a business idea that does some good, online first, with a final in Vermont",
        grades: [10, 11, 12],
        gradeNote: "Grades 10–12 on the submission deadline, anywhere in the world",
        free: true,
        cost: "Free. UVM gives finalists $600 each toward travel and lodging.",
        costShort: "Free",
        where: "Online, then a final in person at UVM in Burlington, Vermont",
        team: { min: 1, max: 3, extra: "plus an adult sponsor aged 21 or older" },
        window: { from: "2026-10-15", to: "2027-02-15" },
        boardWhat: "Submissions due",
        can: [
          { k: "ok", t: "Free to enter", s: "Finalists get $600 each toward travel and lodging" },
          { k: "warn", t: "You need an adult sponsor", s: "The rules say a teacher or counsellor aged 21 or older. UVM's FAQ is looser, so a school adult is the safe choice." },
          { k: "warn", t: "Finalists must go to Vermont", s: "You have to pitch in person to win a prize" }
        ],
        steps: [
          { id: "team", by: "2026-12-11", t: "Decide: go solo or form a team", who: "friends", ask: "team" },
          { id: "sponsor", by: "2026-12-18", t: "Ask a teacher or counsellor to be your adult sponsor", who: "teacher", ask: "sponsor" },
          { id: "write", by: "2027-02-05", t: "Write your proposal, or record your pitch", who: "you" },
          { id: "submit", by: "2027-02-15", t: "Every team member fills in the submission form", who: "you", official: true, href: "https://www.uvm.edu/admissions/vermont-pitch-challenge/how-compete" }
        ],
        asks: {
          team: { to: "friends", title: "Invite friends to your team", hint: "This is optional. You can enter alone. Teammates can go to other schools.", msg: "Want to enter the Vermont Pitch Challenge with me? It's a free business pitch competition from the University of Vermont. Teams can be {team}. First place wins a full-tuition scholarship to UVM, and the other finalists win cash. Submissions are due {deadline}.\n\nDetails: {link}" },
          sponsor: { to: "teacher", title: "Ask a teacher to be your sponsor", subject: "Adult sponsor for the Vermont Pitch Challenge", hint: "The rules say the sponsor must be 21 or older with a direct academic connection to you, like a teacher or counsellor. They'd go with you to Vermont if you're a finalist.", msg: "Hi [Mr./Ms. ______],\n\nI'm entering the Vermont Pitch Challenge, a free business pitch competition from the University of Vermont. Every team needs an adult sponsor with an academic connection to us, like a teacher or counsellor. The sponsor mentors the team and would travel with us to the in-person final if we're selected. Would you be our sponsor? Submissions are due {deadline}.\n\nThank you,\n[Your name]\n\nDetails: {link}" }
        },
        dates: [
          { d: "2027-02-15", k: "deadline", t: "Submissions close, and judging begins" },
          { d: "2027-03", k: "result", t: "Five finalist teams announced" },
          { d: "2027-04-13", k: "event", t: "Finalists pitch in person at UVM" }
        ],
        about: {
          is: { t: "High school students around the world pitch business ideas that make a positive difference. Five finalist teams then pitch in person at UVM.", q: ["High school students in grades 10 – 12 worldwide are invited to submit their business proposals online at no cost, focusing on ideas that make a positive impact on the world.", "March 2027: Five Finalists Announced", "April 13, 2027: Finalists Pitch In-Person on UVM’s Campus"] },
          do: [
            { t: "Send a 3–5 page written proposal, or a video or audio pitch of up to 4 minutes", q: ["Written: 3-5 pages", "Video: Maximum 4 minutes", "Audio: Maximum 4 minutes"] },
            { t: "Learn from experts in online webinars about business models and pitching", q: ["you’ll learn from top experts (through online webinars and networking opportunities) about how to develop a successful business model, create a compelling pitch, and achieve your goals"] },
            { t: "Finalists give a 7-minute pitch, then answer judges’ questions for up to 3 minutes", q: ["Pitches are limited to 7 minutes.", "The judges will ask questions for up to three minutes after the pitch."] }
          ],
          why: [
            { t: "First place: a full four-year tuition scholarship at UVM, if you’re admitted", q: ["The Grand Prize will be a full 4-year scholarship [tuition and comprehensive fees] for each team member.", "The Scholarship award is contingent upon undergraduate first-time, first-year admission to the University of Vermont"] },
            { t: "Second and third place win $5,000, and fourth and fifth win $1,000, split across the team", q: ["Prizes for 2nd and 3rd place will be a $5,000 cash prize, to be split evenly between team members.", "Prizes for 4th and 5th place will be a $1,000 cash prize, to be split evenly between team members."] }
          ]
        },
        parent: [
          { t: "A trip if they're a finalist", s: "Finalists must pitch in person in Vermont. UVM gives $600 per student toward travel and lodging, and families cover the rest." },
          { t: "A school adult travels with the team", s: "Each finalist team goes with its adult sponsor, who the rules say should be a teacher or counsellor." }
        ],
        src: { url: "https://uvm.edu/admissions/vermont-pitch-challenge/rules-regulations-terms-and-conditions", name: "uvm.edu", kind: "organizer" }
      },
      {
        id: "rotsim", tk: "RSIM", short: "Rotman Trading", name: "High School Market Simulation Challenge", org: "Rotman Commerce and the BMO Finance Research and Trading Lab, University of Toronto", type: "invest",
        what: "Learn to trade on a market simulator, then compete in a timed trading round",
        grades: [9, 10, 11, 12],
        gradeNote: "High school students. No grade limits are listed.",
        free: false,
        cost: "Not listed",
        costShort: "Not listed",
        where: "University of Toronto, with an online option for the December round",
        entry: "Register for a qualifying round on Rotman's page",
        window: { to: "2027-02-04" },
        boardWhat: "Last qualifying round",
        can: [
          { k: "ok", t: "No experience needed", s: "A workshop teaches you the trading platform first" },
          { k: "warn", t: "It's on a school day", s: "Qualifying rounds run on Thursdays during school hours" },
          { k: "warn", t: "Only the top 60 go further", s: "They come back on April 30 to compete for cash prizes" }
        ],
        steps: [
          { id: "pick", by: "2026-11-27", t: "Pick a qualifying round: December 3 or February 4", who: "you" },
          { id: "register", by: "2026-12-01", t: "Register on Rotman's page (the December round has an online option)", who: "you", href: "https://rotmancommerce.utoronto.ca/future-students/on-campus-events/market-simulation-challenge" },
          { id: "platform", by: "2026-12-02", t: "Download the RIT trading platform and watch the video tutorial", who: "you" },
          { id: "qualify", by: "2027-02-04", t: "Trade in a qualifying round", who: "you", official: true },
          { id: "capstone", by: "2027-04-30", t: "Top 60 traders: come back for the capstone competition", who: "you" }
        ],
        asks: {},
        dates: [
          { d: "2026-11-12", k: "event", t: "First qualifying round" },
          { d: "2026-12-03", k: "event", t: "Qualifying round, 9:30 am to 2:00 pm ET, in person or online" },
          { d: "2027-02-04", k: "deadline", t: "Last qualifying round, 9:00 am to 12:00 pm ET" },
          { d: "2027-04-30", k: "event", t: "Capstone workshop and competition for the top 60 traders" }
        ],
        about: {
          is: { t: "A workshop introduces financial markets and Rotman’s trading simulator. Then you put what you learned to work in a timed trading competition.", q: ["Students will participate in a workshop designed to introduce them to financial markets and the RIT Market Simulator platform", "then demonstrate their newly learned skills through a Market Simulation Challenge using the RIT Market Simulator"] },
          do: [
            { t: "Join a qualifying round on December 3, in person or online, or on February 4", q: ["Qualifying Rounds: Thursday November 12, Thursday December 3, 2026 & Thursday, Feburary 4, 2027", "1 hour break for virtual participants"] },
            { t: "Trade on the RIT simulator, the software behind a 50-university trading competition", q: ["The Rotman Finance Lab hosts the annual Rotman International Trading Competition (RITC), a 3-day simulated market challenge featuring 50 competing universities from around the world.", "RITC is executed though the RIT Market Simulator"] },
            { t: "The top 60 traders come back on April 30 for a capstone workshop and competition", q: ["Registration is reserved for top 60 traders from the three qualifying rounds.", "Capstone Workshop & Competition: Friday April 30, 2027"] }
          ],
          why: [
            { t: "No preparation needed. Rotman provides everything before and during the competition.", q: ["No prior preparation is necessary for this challenge, and all required resources will be provided before and during the competition."] },
            { t: "The capstone’s top performers compete for cash prizes", q: ["where they will compete for cash prizes."] }
          ]
        },
        parent: [
          { t: "A school day at U of T", s: "Qualifying rounds run on Thursdays during school hours. The December round can also be done online." }
        ],
        src: { url: "https://rotmancommerce.utoronto.ca/future-students/on-campus-events/market-simulation-challenge", name: "rotmancommerce.utoronto.ca", kind: "organizer" }
      },
      {
        id: "skillsent", tk: "SKON", short: "Skills Ontario", name: "Provincial Entrepreneurship Showcase 2027", org: "Skills Ontario", type: "showcase",
        what: "Show your business idea or product to entrepreneur mentors, in person or online",
        grades: [9, 10, 11, 12],
        gradeNote: "Student entrepreneurs. 2027 eligibility details aren't posted yet.",
        free: false,
        cost: "Not posted yet",
        costShort: "Fee not posted yet",
        where: "Toronto Congress Centre during the Skills Ontario Competition, plus a virtual event",
        entry: "How to take part in 2027 isn't posted yet",
        next: { d: "2027-03", label: "2027 details aren't posted yet", est: true, note: "Skills Ontario says both events return in 2027, with details to come." },
        can: [
          { k: "warn", t: "2027 details aren't posted yet", s: "Skills Ontario has confirmed the in-person and virtual events are back" },
          { k: "ok", t: "In English or French", s: "The showcase is bilingual" },
          { k: "ok", t: "Can't get to Toronto?", s: "There's a virtual event too, and a livestream" }
        ],
        steps: [
          { id: "ready", by: "2027-02-26", t: "Get your business idea or product ready to show", who: "you" },
          { id: "teacher", by: "2027-02-26", t: "Ask a teacher how your school can take part", who: "teacher", ask: "school" },
          { id: "check", by: "2027-03-31", t: "Check Skills Ontario's page for 2027 details", who: "you", href: "https://skillsontario.com/resources/https-www-skillsontario-com-skills-ontario-provincial-entrepreneurship-showcase2025na367/", est: true }
        ],
        asks: {
          school: { to: "teacher", title: "Ask a teacher about the showcase", subject: "Skills Ontario's Provincial Entrepreneurship Showcase", hint: "A teacher can find out how your school takes part.", msg: "Hi [Mr./Ms. ______],\n\nSkills Ontario's Provincial Entrepreneurship Showcase is coming back. Student entrepreneurs show their business ideas or products and get feedback from entrepreneurs and mentors. I have an idea I'd like to show. Could you help me find out how our school can take part?\n\nThank you,\n[Your name]\n\nDetails: {link}" }
        },
        dates: [
          { d: "2027-05-03", k: "event", t: "Skills Ontario Competition, May 3 and 4, Toronto Congress Centre. The showcase runs alongside it." }
        ],
        about: {
          is: { t: "Student entrepreneurs present their business ideas or products and get feedback from experienced entrepreneurs and mentors. It runs alongside the Skills Ontario Competition.", q: ["the bilingual Provincial Entrepreneurship Showcase provides a catalyst for aspiring student entrepreneurs to display/present their business ideas and/or products", "students at both the in-person and virtual event alike will receive valuable feedback from successful, knowledgeable industry entrepreneurs and mentors", "Held in conjunction with the Skills Ontario Competition"] },
          do: [
            { t: "Show your business at the in-person event in Toronto, or join the virtual one", q: ["both the virtual and in-person showcase events are returning in 2027", "Those who cannot attend in-person are encouraged to join the Livestream."] },
            { t: "Some students are picked ahead of time to pitch their idea on stage", q: ["Some pre-selected students will even “pitch” their idea from the stage to our live audience!"] }
          ],
          why: [
            { t: "You get feedback from entrepreneurs who have built businesses themselves", q: ["receive valuable feedback from successful, knowledgeable industry entrepreneurs and mentors"] },
            { t: "You build a professional network while you’re there", q: ["while building their professional network"] }
          ]
        },
        parent: [
          { t: "Details coming", s: "Skills Ontario says the in-person and virtual events return in 2027." }
        ],
        src: { url: "https://skillsontario.com/resources/https-www-skillsontario-com-skills-ontario-provincial-entrepreneurship-showcase2025na367/", name: "skillsontario.com", kind: "organizer" }
      },
      {
        id: "bslc", tk: "BSLC", short: "Black Student Leadership", name: "Black Student Leadership Conference", org: "Rotman Commerce, University of Toronto", type: "conf",
        what: "A day of trading and case-competition training at U of T, with prizes",
        grades: [9, 10, 11, 12],
        gradeNote: "For prospective Black students. No grade limits are listed.",
        free: false,
        cost: "Not listed",
        costShort: "Not listed",
        where: "Rotman Commerce, University of Toronto",
        entry: "Join Rotman's mailing list to get an invitation when registration opens",
        next: { d: "2026-12", label: "Registration opens this fall, and the conference is in February", est: true, note: "Rotman says registration opens in the fall. The conference is in February." },
        can: [
          { k: "warn", t: "For Black students", s: "Rotman invites prospective Black students" },
          { k: "ok", t: "No experience needed", s: "The trading workshop starts from the basics" },
          { k: "ok", t: "Prizes", s: "Gift cards for the top 3 traders" }
        ],
        steps: [
          { id: "list", by: "2026-11-30", t: "Join Rotman's mailing list to get your invitation", who: "you", href: "https://rotmancommerce.utoronto.ca/future-students/on-campus-events/black-student-leadership-conference/" },
          { id: "register", by: "2027-01", t: "Register when your invitation arrives", who: "you", est: true }
        ],
        asks: {},
        dates: [
          { d: "2027-02", k: "event", t: "Conference day in February (exact date not posted)" }
        ],
        about: {
          is: { t: "A day on campus with hands-on training in two core business skills, trading and case study. Current Rotman Commerce students and staff lead the sessions.", q: ["Rotman Commerce is excited to host an engaging day of hands-on training in the core business competencies of trading and case study.", "through seminars hosted by current Rotman Commerce students and staff"] },
          do: [
            { t: "Learn the RIT trading platform in Rotman’s trading lab, then compete in a three-heat trading challenge", q: ["an interactive workshop designed to introduce them to financial markets and the RIT Market Simulator platform in the state-of-the-art BMO Financial Group Finance Research and Trading Lab", "compete for prizes through a 3-heat Market Simulation Challenge"] },
            { t: "Learn how to tackle business cases, present, and handle tough questions from judges", q: ["guide participants through best practices and approaches in tackling business cases, conducting presentations and responding to tough questions from judges"] }
          ],
          why: [
            { t: "The case training is the same one Rotman’s competition team gives its new first-year members", q: ["This training is the same offered to all incoming first year students when they join the RCCT"] },
            { t: "The top 3 traders win gift cards", q: ["Prizes include gift cards for the top 3 performers."] }
          ]
        },
        parent: [
          { t: "One day in Toronto", s: "The conference is held at the University of Toronto in February." }
        ],
        src: { url: "https://rotmancommerce.utoronto.ca/future-students/on-campus-events/black-student-leadership-conference/", name: "rotmancommerce.utoronto.ca", kind: "organizer" }
      },
      {
        id: "catalyst", tk: "CTLY", short: "Catalyst", name: "Catalyst – Early Entrepreneurs 2027", org: "University of Waterloo, with the Conrad School of Entrepreneurship and Business", type: "summer",
        what: "A two-week summer day program on entrepreneurship and business at Waterloo",
        grades: [9, 10, 11],
        lastGrade: 11,
        gradeNote: "Current high school students entering Grade 10 or higher in September 2027",
        free: false,
        cost: "$747 + HST. Overnight stays are optional and cost extra.",
        costShort: "$747 + HST · bursaries up to 95%",
        aid: "Bursaries can cover up to 95% of the program fee",
        where: "University of Waterloo campus, in person (a day program)",
        entry: "Apply online, then do a short online assessment with video or written answers",
        window: { from: "2026-12-18", to: "2027-02-12" },
        boardWhat: "Applications close",
        can: [
          { k: "warn", t: "$747 + HST", s: "Bursaries can cover up to 95%, and there's no application fee" },
          { k: "warn", t: "25 students per session", s: "And you can only attend Catalyst once" },
          { k: "ok", t: "Three sessions", s: "July 5–16, July 19–30 or August 9–20. You say which ones you can attend." }
        ],
        steps: [
          { id: "apply", by: "2027-01-08", t: "Fill in the application form once it opens", who: "you", href: "https://uwaterloo.ca/engineering-outreach/programs/catalyst/catalyst-summer-program" },
          { id: "bursary", by: "2027-01-08", t: "Need help with the fee? Apply for a bursary before mid-January", who: "parent", ask: "bursary" },
          { id: "assess", by: "2027-02-05", t: "Practise, then do the 20–30 minute online assessment", who: "you" },
          { id: "close", by: "2027-02-12", t: "Finish everything by 9:00 am ET", who: "you", official: true }
        ],
        asks: {
          bursary: { to: "parent", title: "Ask for help with a bursary", subject: "Catalyst bursary application", hint: "Bursaries can cover up to 95% of the fee. The bursary deadline comes before the program deadline.", msg: "Hi [Mom/Dad/______],\n\nI'm applying to Catalyst – Early Entrepreneurs, a two-week summer business program at the University of Waterloo. It costs $747 plus HST, but a bursary can cover up to 95% of the fee. The bursary application closes in mid-January, before the program application does. Could you help me apply?\n\nDetails: {link}" }
        },
        dates: [
          { d: "2026-12-18", k: "opens", t: "Applications open, 9:00 am ET" },
          { d: "2027-01", k: "deadline", t: "Bursary applications close, mid-January (exact date to come)", est: true },
          { d: "2027-02-12", k: "deadline", t: "Applications and assessments close, 9:00 am ET" },
          { d: "2027-04", k: "result", t: "Acceptances sent, second full week of April" },
          { d: "2027-07-05", k: "event", t: "Session I, July 5–16" },
          { d: "2027-07-19", k: "event", t: "Session II, July 19–30" },
          { d: "2027-08-09", k: "event", t: "Session III, August 9–20" }
        ],
        about: {
          is: { t: "Two weeks of lectures and activities on innovation, entrepreneurship and business, mixed with some STEM activities. Waterloo faculty and current students run workshops.", q: ["a lecture-style program which focuses on innovation, entrepreneurship, and business", "The Catalyst Summer Program is a 2-week program", "The Early Entrepreneurs stream will have a mix of STEM activities and business activities.", "participants will sit in on workshops run by faculty and current students"] },
          do: [
            { t: "Get to know Waterloo’s startup scene, which the program calls Canada’s top-ranked", q: ["Located in Canada's top-ranked startup ecosystem", "students will engage directly with Waterloo's renowned entrepreneurial ecosystem"] },
            { t: "Learn in a small group: each session has only 25 students", q: ["Each session will be restricted to twenty-five students"] }
          ],
          why: [
            { t: "You build leadership skills by working on real problems with others", q: ["high school students develop leadership skills within a community and problem-based context"] },
            { t: "Bursaries can cover up to 95% of the fee, and applying is free", q: ["A bursary can cover up to 95% of the program fee", "There is no application fee for this program."] }
          ]
        },
        parent: [
          { t: "$747 + HST, due on acceptance", s: "Bursaries can cover up to 95% of the fee. The bursary deadline, in mid-January, comes before the program deadline." },
          { t: "A day program", s: "It isn't overnight. Residence packages are optional (in 2026, $1,645 to $1,870)." }
        ],
        src: { url: "https://uwaterloo.ca/engineering-outreach/programs/catalyst/catalyst-summer-program", name: "uwaterloo.ca", kind: "organizer" }
      },
      {
        id: "hieec", tk: "HIEC", short: "Harvard Econ Essay", name: "Harvard International Economics Essay Contest 2026–27", org: "Harvard Undergraduate Economics Association", type: "essay",
        what: "Take a side on a current economic question in an essay of up to 1,500 words",
        grades: [9, 10, 11, 12],
        gradeNote: "High school students anywhere. Grades 9–10 and 11–12 are judged separately.",
        free: false,
        cost: "$35 USD for schools outside the United States. You can ask for a fee waiver.",
        costShort: "$35 USD · fee waivers available",
        aid: "Email the organizers to request a fee waiver",
        where: "Online, open worldwide",
        entry: "Write it on your own (no co-authors) and submit it with the online form",
        window: { to: "2027-01-05" },
        boardWhat: "Essay due",
        can: [
          { k: "warn", t: "$35 USD to enter", s: "You can email the organizers to ask for a fee waiver" },
          { k: "ok", t: "Any high school student, anywhere", s: "Grades 9–10 and 11–12 are judged separately" },
          { k: "warn", t: "On your own", s: "No co-authors, and one essay per student" }
        ],
        steps: [
          { id: "prompt", by: "2026-12-04", t: "Pick a prompt, or your own economics question", who: "you", href: "https://www.thehuea.org/general-8" },
          { id: "draft", by: "2026-12-18", t: "Write a full draft of up to 1,500 words", who: "you" },
          { id: "read", by: "2026-12-18", t: "Ask a teacher to read your draft", who: "teacher", ask: "read" },
          { id: "submit", by: "2027-01-05", t: "Submit and pay by 11:59 pm ET, with no name on the PDF", who: "you", official: true }
        ],
        asks: {
          read: { to: "teacher", title: "Ask a teacher for feedback", subject: "Feedback on my economics essay", hint: "Ask early, so your teacher has time to read it before the deadline.", msg: "Hi [Mr./Ms. ______],\n\nI'm entering the Harvard International Economics Essay Contest. Would you be willing to read my draft and give me feedback? It's due {deadline}, so I'd send it to you soon.\n\nThank you,\n[Your name]\n\nDetails: {link}" }
        },
        dates: [
          { d: "2027-01-05", k: "deadline", t: "Essays due, 11:59 pm ET" },
          { d: "2027-03", k: "result", t: "Finalists and winners announced, early to mid-March" }
        ],
        about: {
          is: { t: "You take a position on a current economic question and defend it in a focused essay. The contest draws hundreds of essays from dozens of countries each year.", q: ["take a position on a current economic question and defend it in a focused essay", "drawing hundreds of essays from dozens of countries each year"] },
          do: [
            { t: "Pick one of the prompts, like whether everyday payment systems should be free, or ask your own", q: ["Choose one of the prompts below or write on an economics question of your own.", "Should a country's everyday payment system be free to use?"] },
            { t: "Write up to 1,500 words. Judges never see your name or school.", q: ["up to 1,500 words, counting footnotes, not counting references", "Judges will not see who wrote an essay.", "we ask that you do not put your name or school anywhere in the PDF"] },
            { t: "Essays are scored on analysis, creativity, research and structure", q: ["scored against a rubric covering analysis, creativity, research, and structure"] }
          ],
          why: [
            { t: "The three winning essays are published on the contest’s website", q: ["3 Winners (essay published on this website)"] },
            { t: "Past judges include Oliver Hart, who won the Nobel prize in economics in 2016", q: ["Past judges include 2016 Nobel laureate Oliver Hart."] }
          ]
        },
        parent: [
          { t: "A small fee", s: "$35 USD for students outside the US. Fee waivers can be requested by email." }
        ],
        src: { url: "https://www.thehuea.org/general-8", name: "thehuea.org", kind: "organizer" }
      },
      {
        id: "econoly", tk: "ECON", short: "Econ Olympiad", name: "Economics Olympiad 2027", org: "Foundation for Economic Education (FEE)", type: "econ",
        what: "A 25-question online economics test at school, with rounds up to an international final",
        grades: [9, 10, 11, 12],
        gradeNote: "Ages 14–20 at any secondary school",
        free: false,
        cost: "Not posted yet for Canada",
        costShort: "Fee not posted for Canada",
        where: "Online at your school, then national and international rounds",
        entry: "A teacher registers as your School Coordinator. Students can't register on their own.",
        next: { d: "2026-12", label: "Canada's registration opens soon", est: true, note: "FEE's page says registration for Canada opens soon." },
        can: [
          { k: "warn", t: "A teacher registers your school", s: "Students take part through a registered School Coordinator" },
          { k: "warn", t: "Canada's dates aren't posted yet", s: "FEE lists Canada's details as coming soon" },
          { k: "ok", t: "No economics course needed", s: "It's designed to be accessible to newcomers" }
        ],
        steps: [
          { id: "teacher", by: "2026-12-11", t: "Ask a teacher to register as your school's coordinator", who: "teacher", ask: "coordinator" },
          { id: "practise", by: "2027-01-29", t: "Take FEE's practice test", who: "you", href: "https://fee.org/economics-olympiad/" }
        ],
        asks: {
          coordinator: { to: "teacher", title: "Ask a teacher to register your school", subject: "Economics Olympiad at our school", hint: "Only teachers, school officials and homeschool parents can register. It needs someone to supervise a 40-minute test.", msg: "Hi [Mr./Ms. ______],\n\nI'd like to write the Economics Olympiad this year. Students can't register themselves: a teacher registers as the school coordinator and supervises an online test at school, which takes about 40 minutes. Registration for Canada opens soon. Would you be willing to register our school?\n\nThank you,\n[Your name]\n\nDetails: {link}" }
        },
        dates: [
          { d: "2026-12", k: "opens", t: "Canada's registration expected (FEE says soon)", est: true },
          { d: "2027-08-02", k: "event", t: "International Round in Olympia, Greece, August 2–6" }
        ],
        about: {
          is: { t: "It tests microeconomics, macroeconomics and personal finance. You start with a 25-question online test at school, and top scorers move on to the national round.", q: ["Every round tests students across the same three pillars: microeconomics, macroeconomics, and personal finance.", "It’s a 25 multiple-choice online test administered at school and proctored by a teacher", "Top performers advance to the National Round."] },
          do: [
            { t: "Write the first round online at school, with a teacher supervising", q: ["administered at school and proctored by a teacher"] },
            { t: "If you advance, the national round has written and oral exams, in person where possible", q: ["The National Round combines written and oral exams and is held in person where possible."] },
            { t: "Five students per country go to the international round in Greece, August 2–6, 2027", q: ["Five students from the National Round are selected to represent their country as the national delegation in the International Round.", "to be held in Ancient Olympia, Greece, on August 2–6, 2027."] }
          ],
          why: [
            { t: "Over 1,400 students from 10 countries took part in the Americas Challenge last year", q: ["Last year, over 1,400 students from 10 countries in North and South America participated in the Americas Challenge."] },
            { t: "You don’t need an economics course. It’s designed to be accessible to newcomers.", q: ["Whether you have previously engaged in formal economic studies or are newly curious about the subject, the competition is designed to be accessible and enriching for all participants."] }
          ]
        },
        parent: [
          { t: "Run through the school", s: "A teacher or school official registers and supervises the online test." }
        ],
        src: { url: "https://fee.org/economics-olympiad/", name: "fee.org", kind: "organizer" }
      },
      {
        id: "yesstart", tk: "YES", short: "Summer Startup", name: "Summer Startup 2027", org: "Youth Employment Services (YES), Toronto", type: "fund",
        what: "$3,000, training and mentoring to run your own summer business in the GTA",
        grades: [10, 11, 12],
        gradeNote: "Ages 16–29, living in the Greater Toronto Area and going back to school in September",
        free: true,
        cost: "Free. Participants receive $3,000 to start their business.",
        costShort: "Free · $3,000 for your business",
        where: "Greater Toronto Area",
        entry: "Apply to YES when the 2027 intake opens",
        next: { d: "2027-04", tba: true, label: "2027 dates aren't posted yet. In 2026, applications closed May 22", note: "In 2026, applications closed May 22 and the program started around June 15." },
        can: [
          { k: "ok", t: "$3,000 to start your business", s: "Plus 8 training and mentorship sessions" },
          { k: "warn", t: "Ages 16–29, living in the GTA", s: "And going back to school in September" },
          { k: "warn", t: "A big summer commitment", s: "At least 30 hours a week on your business" }
        ],
        steps: [
          { id: "check", by: "2027-03-31", t: "Check YES's page for the 2027 intake", who: "you", href: "https://yesnet.yes.on.ca/entrepreneurship/summer-startup" },
          { id: "apply", by: "2027-05", t: "Apply before the deadline (May 22 in 2026)", who: "you", est: true }
        ],
        asks: {},
        dates: [
          { d: "2027-05", k: "deadline", t: "Applications close, based on 2026 (May 22, 5:00 pm)", est: true },
          { d: "2027-06", k: "event", t: "Program starts, based on 2026 (around June 15)", est: true }
        ],
        about: {
          is: { t: "Students on summer break start their own business, with training in business planning and marketing, and $3,000 in funding.", q: ["Summer Startup is an entrepreneurship program where students who are returning to school can start up a business to make some extra money over the summer.", "Training is provided on business planning, marketing and other business related topics.", "Participants receive a total of $3000 in funding to start their business."] },
          do: [
            { t: "Attend 8 business training and mentorship sessions", q: ["Participants will attend a total of 8 business training, and business mentorship sessions."] },
            { t: "Work at least 30 hours a week on your business over the summer", q: ["Participants must commit to working a minimum of 30 hours a week on their business."] }
          ],
          why: [
            { t: "You get $3,000 in funding to start your business", q: ["Participants receive a total of $3000 in funding to start their business."] },
            { t: "You can make extra money over the summer from a business you run", q: ["start up a business to make some extra money over the summer"] }
          ]
        },
        parent: [
          { t: "Free, with $3,000 in funding", s: "YES provides its services free of charge." },
          { t: "A full summer", s: "Participants commit at least 30 hours a week to their business." }
        ],
        src: { url: "https://yesnet.yes.on.ca/entrepreneurship/summer-startup", name: "yesnet.yes.on.ca", kind: "organizer" }
      },
      {
        id: "monaco", tk: "ERM", short: "E.R. Monaco", name: "E.R. Monaco Young Entrepreneurs Awards", org: "Hamilton Business Centre, City of Hamilton", type: "plan",
        what: "Write a business plan for a new startup, for Hamilton high school students",
        grades: [9, 10, 11, 12],
        gradeNote: "Ages 15–20 at a high school in the Hamilton area",
        free: false,
        cost: "No entry fee is listed",
        costShort: "No entry fee listed",
        where: "Hamilton, Ontario",
        team: { min: 1, max: 3 },
        next: { d: "2027-06", tba: true, label: "2027 dates aren't posted yet. In 2026, plans were due September 16", note: "In 2026, plans were due September 16." },
        can: [
          { k: "warn", t: "Only for Hamilton-area high schools", s: "Ages 15–20" },
          { k: "ok", t: "Alone or in a team", s: "Teams can be {team}" },
          { k: "warn", t: "A new business only", s: "Not an existing business or a franchise" }
        ],
        steps: [
          { id: "idea", by: "2027-03-31", t: "Pick an idea for a new startup", who: "you" },
          { id: "team", by: "2027-04-16", t: "Decide: enter alone or with a team", who: "friends", ask: "team" },
          { id: "template", by: "2027-04-30", t: "Email the Hamilton Business Centre for the business plan template", who: "you", href: "https://investinhamilton.ca/hamilton-business-centre/e-r-monaco-business-plan-competition/" },
          { id: "submit", by: "2027-09", t: "Email your plan and submission form", who: "you", est: true }
        ],
        asks: {
          team: { to: "friends", title: "Invite friends to your team", hint: "This is optional. You can enter alone.", msg: "Want to enter the E.R. Monaco Young Entrepreneurs Awards with me? We'd write a business plan for a new startup, and the top 5 plans win cash prizes. It's for Hamilton-area high school students, and teams can be {team}.\n\nDetails: {link}" }
        },
        dates: [
          { d: "2027-09", k: "deadline", t: "Plans due, based on 2026 (September 16)", est: true }
        ],
        about: {
          is: { t: "You write a business plan for a new startup. Local business professionals judge the plans, and top entrants are invited to the awards finals.", q: ["Students must create a start-up business (not existing or franchise).", "Business plans will be evaluated by local volunteer professionals", "the top participants will be invited to the Hamilton E.R. Monaco Young Entrepreneurs Awards finals."] },
          do: [
            { t: "Use the Hamilton Business Centre’s business plan template", q: ["Download and complete the Business Plan Template"] },
            { t: "Email your plan and a submission form to the Hamilton Business Centre", q: ["Email completed Submission Form and Business plan to hbc@hamilton.ca."] }
          ],
          why: [
            { t: "The top 5 business plans win cash prizes", q: ["The top 5 business plans will receive a cash prize for their efforts."] },
            { t: "Local business professionals read and judge your plan", q: ["Business plans will be evaluated by local volunteer professionals"] }
          ]
        },
        parent: [
          { t: "Local to Hamilton", s: "Open to youth aged 15–20 at Hamilton-area high schools." }
        ],
        src: { url: "https://investinhamilton.ca/hamilton-business-centre/e-r-monaco-business-plan-competition/", name: "investinhamilton.ca", kind: "organizer" }
      },
      {
        id: "cambrian", tk: "CAMB", short: "Cambrian Stocks", name: "High School Stock Market Challenge", org: "Cambrian College, Sudbury", type: "invest",
        what: "A free stock market simulation for business classes in northeastern Ontario",
        grades: [9, 10, 11, 12],
        gradeNote: "Students in a business course at a high school in northeastern Ontario",
        free: true,
        cost: "Free",
        costShort: "Free",
        where: "Online, for high schools across northeastern Ontario",
        entry: "Your teacher registers the class by emailing Cambrian. No student names are needed.",
        next: { d: "2027-03", tba: true, label: "Round two is under way until December 11, and the next round isn't announced yet", note: "Round two runs November 2 to December 11, 2026." },
        can: [
          { k: "warn", t: "Northeastern Ontario only", s: "For students enrolled in a business course" },
          { k: "warn", t: "Your teacher registers the class", s: "Students don't sign up on their own" },
          { k: "ok", t: "Free", s: "Registration costs nothing" }
        ],
        steps: [
          { id: "teacher", by: "2027-01-29", t: "Ask your business teacher to register your class for the next round", who: "teacher", ask: "join" }
        ],
        asks: {
          join: { to: "teacher", title: "Ask your teacher to register the class", subject: "Cambrian's High School Stock Market Challenge", hint: "Teachers register by emailing the organizer with the number of students. No student names are needed.", msg: "Hi [Mr./Ms. ______],\n\nCambrian College runs a free High School Stock Market Challenge for business classes in northeastern Ontario. Teachers register by emailing the organizer with the number of students, and no student names are needed. Could our class join the next round?\n\nThank you,\n[Your name]\n\nDetails: {link}" }
        },
        dates: [
          { d: "2026-11-02", k: "event", t: "Round two started" },
          { d: "2026-12-11", k: "event", t: "Round two ends" }
        ],
        about: {
          is: { t: "Your class builds and manages stock portfolios on an investing simulator that follows the real market. The money is imaginary, but the markets are real.", q: ["The competition uses Personal Finance Lab, an online investment simulation platform that allows students to build and manage portfolios using actual market activity.", "While the money is imaginary, the markets are real"] },
          do: [
            { t: "Trade over several weeks. This year’s second round runs November 2 to December 11.", q: ["round two, which runs from November 2 to December 11"] },
            { t: "Use the introductory investing lessons and resources that come with it", q: ["Participants will also have access to introductory investing lessons and educational resources."] }
          ],
          why: [
            { t: "You learn about investing, managing risk and thinking long-term", q: ["this challenge introduces young people to important concepts like investing, managing risk, and thinking long-term"] },
            { t: "More than 350 students from across Greater Sudbury took part in the first round", q: ["Cambrian's first competition this past spring attracted more than 350 students from across Greater Sudbury."] }
          ]
        },
        parent: [
          { t: "Free, run through the class", s: "The teacher registers the class. No student names or personal information are needed." }
        ],
        src: { url: "https://www.educationnewscanada.com/article/organization/24240/1225265/Cambrian-College-brings-back-High-School-Stock-Market-Challenge.htm", name: "educationnewscanada.com", kind: "third" }
      }
    ]
  };
});
